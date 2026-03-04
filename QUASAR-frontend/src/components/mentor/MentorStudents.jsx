import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Users, GraduationCap, Mail, BookOpen } from 'lucide-react';
import userService from '../../services/userService';

export default function MentorStudents() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [branches, setBranches] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                // Uses /api/all — paginated, available to any authenticated user
                const response = await userService.getAllUsers(page, 20, 'firstName', 'asc');
                const data = response?.data || response;
                const userList = Array.isArray(data?.content) ? data.content
                    : Array.isArray(data) ? data : [];
                setUsers(userList);
                setTotalPages(data?.totalPages || 1);

                // Collect unique branches for filter dropdown
                const uniqueBranches = [...new Set(userList.map(u => u.branch).filter(Boolean))];
                setBranches(uniqueBranches);
            } catch (error) {
                console.error('Failed to fetch students:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [page]);

    const filtered = users.filter(u => {
        const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        const matchSearch = !searchTerm || name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
        const matchBranch = branchFilter === 'ALL' || u.branch === branchFilter;
        const matchStatus = statusFilter === 'ALL' || u.availabilityStatus === statusFilter;
        return matchSearch && matchBranch && matchStatus;
    });

    const availabilityConfig = {
        AVAILABLE: { label: 'Available', cls: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' },
        BUSY: { label: 'Busy', cls: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' },
        NOT_AVAILABLE: { label: 'Not Available', cls: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' },
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Students</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Browse and explore all registered students on the platform.</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Students', value: users.length, icon: <Users className="w-4 h-4" />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Available', value: users.filter(u => u.availabilityStatus === 'AVAILABLE').length, icon: <GraduationCap className="w-4 h-4" />, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Branches', value: branches.length, icon: <BookOpen className="w-4 h-4" />, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                ].map((s) => (
                    <Card key={s.label} className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${s.bg}`}><span className={s.color}>{s.icon}</span></div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '—' : s.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-slate-900 dark:text-white">All Students</CardTitle>
                            <CardDescription>Showing page {page + 1} of {totalPages}</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            {/* Search */}
                            <div className="relative w-full sm:w-56">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search name or email..."
                                    className="pl-9 dark:bg-slate-900 dark:border-slate-700"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {/* Branch filter */}
                            <Select value={branchFilter} onValueChange={setBranchFilter}>
                                <SelectTrigger className="w-36 dark:bg-slate-900 dark:border-slate-700">
                                    <SelectValue placeholder="Branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Branches</SelectItem>
                                    {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {/* Status filter */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40 dark:bg-slate-900 dark:border-slate-700">
                                    <SelectValue placeholder="Availability" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="AVAILABLE">Available</SelectItem>
                                    <SelectItem value="BUSY">Busy</SelectItem>
                                    <SelectItem value="NOT_AVAILABLE">Not Available</SelectItem>
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
                                    <TableHead className="w-12"></TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Email</TableHead>
                                    <TableHead className="hidden sm:table-cell">Branch</TableHead>
                                    <TableHead className="hidden lg:table-cell">Grad. Year</TableHead>
                                    <TableHead>Availability</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                                        </TableCell>
                                    </TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-400">No students found.</TableCell>
                                    </TableRow>
                                ) : filtered.map((u) => {
                                    const avail = availabilityConfig[u.availabilityStatus];
                                    return (
                                        <TableRow key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <TableCell>
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={u.profilePictureUrl || u.profilePhoto?.[0]} />
                                                    <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-xs font-bold">
                                                        {u.firstName?.[0]}{u.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-900 dark:text-white">
                                                {u.firstName} {u.lastName}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-sm text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[200px]">{u.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-sm text-slate-600 dark:text-slate-300">
                                                {u.branch || '—'}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-sm text-slate-600 dark:text-slate-300">
                                                {u.graduationYear || '—'}
                                            </TableCell>
                                            <TableCell>
                                                {avail ? (
                                                    <Badge className={`text-xs border ${avail.cls}`}>{avail.label}</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs dark:border-slate-700 dark:text-slate-400">Unknown</Badge>
                                                )}
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
                        <span className="text-sm text-slate-500 dark:text-slate-400">Page {page + 1}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= totalPages - 1 || filtered.length < 20}
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
