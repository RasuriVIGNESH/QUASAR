import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Briefcase, Users, ExternalLink } from 'lucide-react';
import { projectService } from '../../services/projectService';

export default function MentorProjects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                // Using /api/searchProjects — available to any authenticated user
                const res = await projectService.searchProjects({
                    query: searchTerm || undefined,
                    status: statusFilter !== 'ALL' ? statusFilter : undefined,
                    page,
                    size: 20,
                });
                const data = res?.data || res;
                const list = Array.isArray(data?.content) ? data.content
                    : Array.isArray(data) ? data : [];
                setProjects(list);
                setTotalPages(data?.totalPages || 1);
                setTotalElements(data?.totalElements || list.length);
            } catch (err) {
                console.error('MentorProjects fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [page, searchTerm, statusFilter]);

    const statusConfig = {
        RECRUITING: { label: 'Recruiting', cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
        IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
        COMPLETED: { label: 'Completed', cls: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
        CANCELLED: { label: 'Cancelled', cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
        ON_HOLD: { label: 'On Hold', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Projects</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Browse all student projects on the platform. {!loading && <span className="font-medium text-indigo-600 dark:text-indigo-400">{totalElements} total</span>}
                </p>
            </motion.div>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-slate-900 dark:text-white">All Projects</CardTitle>
                            <CardDescription>Page {page + 1} of {totalPages}</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative w-full sm:w-60">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search projects..."
                                    className="pl-9 dark:bg-slate-900 dark:border-slate-700"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                                <SelectTrigger className="w-40 dark:bg-slate-900 dark:border-slate-700">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="RECRUITING">Recruiting</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                    <TableHead>Project</TableHead>
                                    <TableHead className="hidden md:table-cell">Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden sm:table-cell">Team Lead</TableHead>
                                    <TableHead className="hidden lg:table-cell">Members</TableHead>
                                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                                        </TableCell>
                                    </TableRow>
                                ) : projects.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-slate-400">No projects found.</TableCell>
                                    </TableRow>
                                ) : projects.map((p) => {
                                    const sc = statusConfig[p.status] || statusConfig.COMPLETED;
                                    return (
                                        <TableRow
                                            key={p.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                                            onClick={() => navigate(`/projects/${p.id}`)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                                                        <Briefcase className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p.title}</p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[180px]">{p.description || '—'}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge variant="outline" className="text-xs dark:border-slate-700 dark:text-slate-300">
                                                    {p.categoryName || 'Uncategorized'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`text-xs ${sc.cls}`}>{sc.label}</Badge>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-sm text-slate-600 dark:text-slate-300">
                                                {p.lead?.firstName ? `${p.lead.firstName} ${p.lead.lastName}` : '—'}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span>{p.currentTeamSize || 1} / {p.maxTeamSize}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-sm text-slate-500 dark:text-slate-400">
                                                {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <ExternalLink className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-center gap-3">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-4 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Page {page + 1} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-4 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
