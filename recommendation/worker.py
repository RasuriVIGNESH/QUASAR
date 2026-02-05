import time
import psycopg2
import requests
import threading
import sys
from fastapi import FastAPI
from psycopg2.extras import Json

# --- CONFIGURATION ---
DB_HOST = "10.106.15.139"
DB_PORT = "5432"
DB_NAME = "recom"
DB_USER = "anton"
DB_PASS = "3112"

OLLAMA_URL = "http://localhost:11434/api/embeddings"
EMBEDDING_MODEL = "nomic-embed-text"

app = FastAPI()

# --- DATABASE CONNECTION ---
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        return conn
    except Exception as e:
        print(f"Database Connection Failed: {e}")
        return None

# --- OLLAMA API CALL ---
def generate_embedding_ollama(text):
    try:
        # If text is empty/null, return None or a default empty string handling
        if not text or not text.strip():
            print("Warning: Empty text provided for embedding.")
            return None
            
        payload = {
            "model": EMBEDDING_MODEL,
            "prompt": text
        }
        response = requests.post(OLLAMA_URL, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()["embedding"]
    except Exception as e:
        print(f"Ollama Error: {e}")
        return None

# --- WORKER LOGIC ---
def process_job():
    print(f"Worker started. Connecting to {DB_HOST}...")
    
    while True:
        conn = get_db_connection()
        if not conn:
            time.sleep(5)
            continue

        try:
            cur = conn.cursor()
            
            # 1. Fetch 1 pending job
            cur.execute("""
                SELECT id, payload, job_type FROM jobs_queue 
                WHERE status = 'pending' 
                LIMIT 1 FOR UPDATE SKIP LOCKED
            """)
            job = cur.fetchone()

            if not job:
                cur.close()
                conn.close()
                time.sleep(1)
                continue

            job_id, payload, job_type = job
            print(f"Processing Job {job_id} [{job_type}]...")
            
            # 2. Mark as processing
            cur.execute("UPDATE jobs_queue SET status = 'processing' WHERE id = %s", (job_id,))
            conn.commit()

            success = False

            # =================================================================
            # HANDLE: UPDATE USER VECTOR
            # =================================================================
            if job_type == 'UPDATE_USER_VECTOR':
                user_id = payload.get('user_id')
                if user_id:
                    # A. Fetch Data (Join users -> user_skills -> skills)
                    # Note: Using LEFT JOIN to ensure we get the user even if they have no skills yet
                    cur.execute("""
                        SELECT 
                            u.bio, 
                            COALESCE(STRING_AGG(s.name, ', '), '') as skills_text
                        FROM users u
                        LEFT JOIN user_skills us ON u.id = us.user_id
                        LEFT JOIN skills s ON us.skill_id = s.id
                        WHERE u.id = %s
                        GROUP BY u.id, u.bio
                    """, (user_id,))
                    
                    result = cur.fetchone()
                    
                    if result:
                        bio, skills_text = result
                        # Combine Bio and Skills for semantic context
                        full_text = f"Bio: {bio or ''}. Skills: {skills_text}"
                        
                        # B. Generate Vector
                        vector = generate_embedding_ollama(full_text)
                        
                        if vector:
                            # C. Update User Vector
                            cur.execute("UPDATE users SET skills_vector = %s WHERE id = %s", (vector, user_id))

                            # D. RE-RANK: Update Recommendations FOR this User
                            cur.execute("DELETE FROM user_recommended_projects WHERE user_id = %s", (user_id,))
                            
                            cur.execute("""
                                INSERT INTO user_recommended_projects (user_id, project_id, match_score, priority)
                                SELECT 
                                    sub.user_id,
                                    sub.project_id,
                                    sub.score,
                                    ROW_NUMBER() OVER (ORDER BY sub.score DESC) as priority
                                FROM (
                                    SELECT 
                                        %s as user_id,
                                        p.id as project_id,
                                        (1 - (p.requirements_vector <=> %s::vector)) as score
                                    FROM projects p
                                    WHERE p.requirements_vector IS NOT NULL
                                ) sub
                                ORDER BY sub.score DESC
                                LIMIT 10;
                            """, (user_id, vector))
                            
                            print(f"Success: User {user_id} updated & recommendations refreshed.")
                            success = True
                        else:
                            print(f"Failed to generate vector for User {user_id}")
                    else:
                        print(f"User {user_id} not found in DB.")

            # =================================================================
            # HANDLE: UPDATE PROJECT VECTOR
            # =================================================================
            elif job_type == 'UPDATE_PROJECT_VECTOR':
                project_id = payload.get('project_id')
                if project_id:
                    # A. Fetch Project Data
                    # Assuming tables: projects -> project_skills -> skills
                    cur.execute("""
                        SELECT 
                            p.description, 
                            COALESCE(STRING_AGG(s.name, ', '), '') as req_skills
                        FROM projects p
                        LEFT JOIN project_skills ps ON p.id = ps.project_id
                        LEFT JOIN skills s ON ps.skill_id = s.id
                        WHERE p.id = %s
                        GROUP BY p.id, p.description
                    """, (project_id,))

                    result = cur.fetchone()

                    if result:
                        desc, req_skills = result
                        full_text = f"Description: {desc or ''}. Required Skills: {req_skills}"

                        # B. Generate Vector
                        vector = generate_embedding_ollama(full_text)

                        if vector:
                            # C. Update Project Vector
                            cur.execute("UPDATE projects SET requirements_vector = %s WHERE id = %s", (vector, project_id))

                            # D. RE-RANK: Find Candidates FOR this Project
                            # Clear old candidates
                            cur.execute("DELETE FROM project_recommended_candidates WHERE project_id = %s", (project_id,))

                            # Insert new candidates (Users matching this Project)
                            # Note: missing_skills is passed as empty array [] for now as vector search doesn't extract them.
                            cur.execute("""
                                INSERT INTO project_recommended_candidates (project_id, user_id, match_score, priority, missing_skills)
                                SELECT 
                                    sub.project_id,
                                    sub.user_id,
                                    sub.score,
                                    ROW_NUMBER() OVER (ORDER BY sub.score DESC) as priority,
                                    CAST(ARRAY[] AS TEXT[]) as missing_skills
                                FROM (
                                    SELECT 
                                        %s as project_id,
                                        u.id as user_id,
                                        (1 - (u.skills_vector <=> %s::vector)) as score
                                    FROM users u
                                    WHERE u.skills_vector IS NOT NULL
                                ) sub
                                ORDER BY sub.score DESC
                                LIMIT 10;
                            """, (project_id, vector))

                            print(f"Success: Project {project_id} updated & candidates refreshed.")
                            success = True
                        else:
                             print(f"Failed to generate vector for Project {project_id}")
                    else:
                        print(f"Project {project_id} not found.")

            # 3. Finalize Job Status
            status = 'completed' if success else 'failed'
            cur.execute("UPDATE jobs_queue SET status = %s WHERE id = %s", (status, job_id))
            
            conn.commit()
            cur.close()
            conn.close()

        except Exception as e:
            print(f"Error in loop: {e}")
            if conn:
                try:
                    conn.rollback()
                    conn.close()
                except:
                    pass
            time.sleep(2)

# --- STARTUP ---
@app.on_event("startup")
async def startup_event():
    t = threading.Thread(target=process_job)
    t.daemon = True
    t.start()

@app.get("/")
def health_check():
    return {"status": "running", "db": DB_HOST}