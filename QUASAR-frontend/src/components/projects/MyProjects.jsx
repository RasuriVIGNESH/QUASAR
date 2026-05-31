import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus, Search, Users, Settings, Eye,
  ArrowRight, Briefcase, Filter, ChevronRight
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectService.getMyProjects(0, 20);
        const projectList = response?.data?.content || response?.content || (Array.isArray(response) ? response : []);
        setProjects(projectList);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
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

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* HEADER - Minimalist & Professional */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Workspace</h2>
            <p className="text-xs text-slate-500 font-medium">Manage and track your active projects.</p>
          </div>
          <Button
            onClick={() => navigate('/projects/create')}
            className="bg-indigo-600 hover:bg-indigo-700 h-10 px-5 rounded-lg font-semibold text-sm transition-all"
          >
            <Plus size={18} className="mr-2" /> New Project
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="space-y-6">
          {/* SEARCH & FILTER - Clean UI */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-200 rounded-lg h-10 focus:ring-2 focus:ring-indigo-500/10 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold text-xs uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-500/10"
              >
                <option value="all">All Status</option>
                <option value="RECRUITING">Recruiting</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* PROJECTS GRID */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 border-dashed">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Briefcase size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">No projects found</h3>
              <p className="text-slate-400 text-sm mt-1">Start by creating your first project.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="h-full border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden group flex flex-col"
                >
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className={`border-none font-bold text-[9px] uppercase tracking-widest px-2 py-0 ${getStatusColor(project.status)}`}>
                        {project.status || 'RECRUITING'}
                      </Badge>
                      <button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {project.title}
                    </h3>

                    <p className="text-sm text-slate-500 mb-5 line-clamp-2 leading-relaxed h-10">
                      {project.description || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-6 min-h-[24px]">
                      {project.techStack?.slice(0, 3).map((tech) => (
                        <span key={tech} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-indigo-500" />
                        <span className="text-[11px] font-bold text-slate-700">{project.currentTeamSize}/{project.maxTeamSize}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/projects/edit/${project.id}`)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                          title="Settings"
                        >
                          <Settings size={16} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
