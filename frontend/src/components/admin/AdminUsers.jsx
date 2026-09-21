import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import userService from '../../services/userService';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await userService.getAllUsers(page, 50);
                const data = response?.data || response;
                const userList = Array.isArray(data?.content) ? data.content
                    : Array.isArray(data) ? data : [];
                setUsers(userList);
                setTotalPages(Math.max(1, data?.totalPages || 1));
            } catch (error) {
                console.error('Failed to fetch users:', error);
                setUsers([]);
                setTotalPages(1);
                setError(error.message || 'Failed to load users.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [page]);

    const filteredUsers = users.filter(user => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = !search ||
            user.firstName?.toLowerCase().includes(search) ||
            user.lastName?.toLowerCase().includes(search) ||
            user.branch?.toLowerCase().includes(search);

        // UserCardResponse does not include role, so role filtering cannot be
        // performed safely without an admin-specific full-user endpoint.
        const matchesRole = roleFilter === 'ALL';
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Users</h1>
                <p className="text-slate-600 dark:text-slate-400">View and manage registered users.</p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>Registered Users</CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search users..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Users</SelectItem>
                                    <SelectItem value="STUDENT">Students</SelectItem>
                                    <SelectItem value="MENTOR">Mentors</SelectItem>
                                    <SelectItem value="ADMIN">Admins</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                        The backend user-card response provides name, avatar, and branch. Email, graduation year, and role are not available from this endpoint.
                    </p>
                </CardHeader>
                <CardContent>
                    {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
                    <div className="rounded-md border border-slate-200 dark:border-slate-800">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Avatar</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead>Grad. Year</TableHead>
                                    <TableHead>Role</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={user.profilePictureUrl} />
                                                    <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {user.firstName} {user.lastName}
                                            </TableCell>
                                            <TableCell>-</TableCell>
                                            <TableCell>{user.branch || '-'}</TableCell>
                                            <TableCell>-</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-mono text-xs">-</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            Previous
                        </Button>
                        <span className="text-sm">Page {page + 1}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= totalPages - 1}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
