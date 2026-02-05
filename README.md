# Quasar

Quasar is a comprehensive collaboration platform designed to connect students and professionals. It facilitates team formation, project management, and real-time collaboration. The platform is composed of a modern React frontend, a robust Spring Boot backend, and an intelligent recommendation engine powered by AI.

## 🌟 Key Features

### 🚀 Core Platform
*   **User Profiles & Portfolios**: Showcase skills, bio, branch, graduation year, and connect social profiles (GitHub).
*   **Project Discovery**: Browse projects by category or skills, and seamlessly apply to join teams.
*   **Task Management**: Create, assign, and track tasks within your projects to ensure efficient progress.
*   **Team Collaboration**: Manage member roles, permissions, and communicate via real-time chat.
*   **Events & Colleges**: Explore and register for college events to expand your network.

### 🧠 Intelligent Recommendation Engine
*   **Smart Matching**: Automatically matches users to projects and projects to potential candidates based on skills and bio.
*   **Vector Embeddings**: Uses Ollama (`nomic-embed-text`) to generate semantic vector embeddings for user profiles and project requirements.
*   **Real-time Updates**: A background worker continuously processes updates to ensure recommendations are always current.

---

## 🏗️ Architecture & Tech Stack

### Backend (`QUASAR-backend`)
*   **Framework**: Spring Boot 2.7.18 (Java 11+)
*   **Database**: PostgreSQL, JPA/Hibernate
*   **Security**: Spring Security, JWT, OAuth2 (GitHub/LinkedIn)
*   **Communication**: WebSocket (Real-time chat & notifications), REST API
*   **Documentation**: Swagger UI / OpenAPI

### Frontend (`QUASAR-frontend`)
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS, Framer Motion
*   **UI Library**: shadcn/ui, Radix UI
*   **State**: Context API, React Hooks, React Hook Form
*   **Icons**: Lucide React

### Recommendation Service (`recommendation`)
*   **Runtime**: Python 3 (FastAPI)
*   **Database**: PostgreSQL with `pgvector` extension (Shared with Backend)
*   **AI Model**: Ollama (locally running `nomic-embed-text`)

---

## � Getting Started

Follow these steps to run the entire application ecosystem locally.

### Prerequisites
*   **Java 11+**
*   **Node.js 16+** & **pnpm**
*   **Python 3.8+**
*   **PostgreSQL** (Shared Database for Main App & Recommendations)
*   **Ollama** (installed and running with `nomic-embed-text` model pulled)

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd QUASAR-backend
    ```
2.  **Environment Configuration**: Create a `.env` file or set environment variables.

    | Variable | Description | Example |
    |----------|-------------|---------|
    | `DB_URL` | Database connection URL | `jdbc:postgresql://localhost:5432/QUASAR` |
    | `DB_USERNAME` | Database username | `postgres` |
    | `DB_PASSWORD` | Database password | `your_secure_password` |
    | `APP_JWT_SECRET` | JWT signing secret (min 32 chars) | `your_very_secret_key_that_is_long_enough` |
    | `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | `your_github_client_id` |
    | `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | `your_github_client_secret` |
    | `CORS_ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173` |

3.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```
    *The server will start on port `8080`.*

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd QUASAR-frontend
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  **Environment Configuration**: Create a `.env` file.
    ```env
    VITE_API_URL=http://localhost:8080/api
    ```
4.  Start the development server:
    ```bash
    pnpm dev
    ```
    *The client will be available at `http://localhost:5173`.*

### 3. Recommendation Engine Setup

1.  Navigate to the recommendation directory:
    ```bash
    cd recommendation
    ```
2.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Ensure Ollama is running and the model is pulled:
    ```bash
    ollama serve
    ollama pull nomic-embed-text
    ```
4.  Configure database credentials in `worker.py` (or export as env vars accordingly).
5.  Start the worker:
    ```bash
    python worker.py
    ```

---

## 💻 Frontend Details

The frontend is built with **React** and **Vite**, featuring a responsive design powered by **Tailwind CSS**.

### Key Technologies
*   **Radix UI / shadcn/ui**: For accessible, unstyled component primitives.
*   **Framer Motion**: For smooth animations.
*   **Recharts**: For data visualization and analytics.
*   **React Hook Form + Zod**: For robust form handling and validation.

---

## 🤝 Contributing

We welcome contributions!

1.  **Fork the repository**
2.  **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3.  **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4.  **Push to the branch** (`git push origin feature/AmazingFeature`)
5.  **Open a Pull Request**
