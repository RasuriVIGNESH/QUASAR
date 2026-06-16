import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search, Calendar, GraduationCap, Loader2, Filter, Plus, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import projectService from '../../services/projectService';

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function MyProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getMyProjects();
      const projectList = res?.content || res?.data?.content || res?.data || (Array.isArray(res) ? res : []);
      setProjects(projectList);
      setFilteredProjects(projectList);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load your projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredProjects(
      projects.filter(p =>
        (p.title || '').toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term)
      )
    );
  }, [searchTerm, projects]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 px-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">My Projects</h1>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Manage & Track</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {/* SEARCH & FILTER */}
        <div className="mb-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-10 rounded-lg bg-white border-slate-200 text-sm shadow-sm"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 rounded-lg bg-red-50 text-red-800 border-red-100">
            <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* PROJECTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-6 w-24 rounded-lg" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex gap-1.5 pt-2">
                    <Skeleton className="h-6 w-12 rounded-lg" />
                    <Skeleton className="h-6 w-12 rounded-lg" />
                    <Skeleton className="h-6 w-12 rounded-lg" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-7 w-full rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-lg border border-dashed border-slate-200">
              <Zap size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold text-sm">No projects yet</p>
              <p className="text-slate-400 text-xs mt-1">Create your first project to get started.</p>
              <Button
                onClick={() => navigate('/projects/create')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 h-9 rounded-lg font-bold text-xs"
              >
                <Plus size={14} className="mr-2" /> Create Project
              </Button>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Card
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="border-slate-200 rounded-lg bg-white hover:border-indigo-200 hover:shadow-md transition-all group shadow-sm overflow-hidden cursor-pointer"
              >
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[9px] px-2 py-0 rounded-lg">
                      {project.categoryName || 'General'}
                    </Badge>
                    <Badge variant="outline" className="text-slate-500 border-slate-200 font-semibold text-[9px] px-2 py-0">
                      {project.status || 'Active'}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-slate-500 text-xs line-clamp-2 mb-3 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>

                  {formatDate(project.createdAt) && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mb-4">
                      <Calendar size={11} />
                      Created {formatDate(project.createdAt)}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mb-4">
                    {(project.techStack || project.skillsRequired)?.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-slate-50 text-slate-500 border-none font-bold text-[8px] px-1.5 py-0 rounded-md">
                        {skill}
                      </Badge>
                    ))}
                    {(project.techStack || project.skillsRequired)?.length > 3 && (
                      <span className="text-[8px] font-bold text-slate-300">
                        +{(project.techStack || project.skillsRequired).length - 3}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 border border-slate-100">
                        <AvatarImage src={project.lead?.profilePictureUrl} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[9px] font-bold">
                          {project.lead?.firstName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-slate-800 leading-none">
                          {project.lead?.firstName} {project.lead?.lastName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[8px] text-slate-400">
                            {project.currentTeamSize || 0} / {project.maxTeamSize || 4}
                          </p>
                          {project.lead?.graduationYear && (
                            <p className="text-[8px] text-slate-400 flex items-center gap-0.5">
                              <GraduationCap size={9} /> {project.lead.graduationYear}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}