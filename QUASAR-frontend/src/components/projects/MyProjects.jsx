import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus, Search, Users, Calendar, Settings, Trash2, Eye,
  ArrowRight, Filter, CheckCircle, Clock, AlertTriangle, Loader2, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

// Import the project service
import { projectService } from '@/services/projectService';

export default function MyProjects() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        // Use service method instead of manual fetch
        // Passing 0 for page and 10 for size as per original logic
        const response = await projectService.getMyProjects(0, 10);

        // Extract content from the paginated response
        // Backend usually returns { data: { content: [] } } or { content: [] }
        const projectList = response?.data?.content || response?.content || (Array.isArray(response) ? response : []);
        setProjects(projectList);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects from logic core');
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) {
      fetchProjects();
    }
  }, [userProfile]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'RECRUITING': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'ACTIVE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'COMPLETED': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Workspace</h2>
            <p className="text-sm text-slate-500 font-medium">Manage your active projects and team recruitment</p>
          </div>
          <Button onClick={() => navigate('/projects/create')} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 h-11 px-6 rounded-xl font-bold">
            <Plus size={18} className="mr-2" /> Create New Project
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="space-y-6">
          {/* SEARCH & FILTER */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <Input
                placeholder="Search registry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-200 rounded-xl h-11 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-xs uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/10"
            >
              <option value="all">All States</option>
              <option value="RECRUITING">Recruiting</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* PROJECTS GRID */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[32px] border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Briefcase size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No projects found</h3>
              <p className="text-slate-400 text-sm mt-1">Initialize your first project to begin tracking.</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <motion.div key={project.id} variants={itemVariants}>
                  <Card className="h-full border-slate-200 bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 rounded-[24px] overflow-hidden group">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className={`border-none font-bold text-[10px] uppercase tracking-widest ${getStatusColor(project.status)}`}>
                          {project.status || 'RECRUITING'}
                        </Badge>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors">
                          <ArrowRight size={16} />
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {project.title}
                      </h3>

                      <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                        {project.description || 'No data recorded in description.'}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {project.techStack?.slice(0, 3).map((tech) => (
                          <span key={tech} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Users size={14} className="text-indigo-500" />
                          <span className="text-[11px] font-bold text-slate-700">{project.currentTeamSize}/{project.maxTeamSize}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/projects/${project.id}`)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Eye size={18} /></button>
                          <button onClick={() => navigate(`/projects/edit/${project.id}`)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Settings size={18} /></button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}