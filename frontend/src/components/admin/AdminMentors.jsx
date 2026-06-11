import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, UserPlus } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

export default function AdminMentors() {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        designation: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchMentors = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllMentors();
            // response might be structured like { data: [] } or just []
            const mentorList = Array.isArray(response) ? response
                : Array.isArray(response?.data) ? response.data
                    : [];
            setMentors(mentorList);
        } catch (error) {
            console.error('Failed to fetch mentors:', error);
            toast.error('Failed to load mentors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMentors();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await adminService.createMentor(formData);
            toast.success('Mentor registered successfully');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                department: '',
                designation: ''
            });
            fetchMentors();
        } catch (error) {
            console.error('Failed to register mentor:', error);
            toast.error(error.message || 'Failed to register mentor');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredMentors = mentors.filter(mentor => {
        const firstName = mentor.user?.firstName || mentor.firstName || '';
        const lastName = mentor.user?.lastName || mentor.lastName || '';
        const email = mentor.user?.email || mentor.email || '';
        const department = mentor.department || '';

        return firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            department.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mentors</h1>
                <p className="text-slate-600 dark:text-slate-400">Manage and register mentors.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <UserPlus className="w-5 h-5" />
                        Register New Mentor
                    </CardTitle>
                    <CardDescription>Add a new mentor to the system manually.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                            <Input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                placeholder="Enter first name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                            <Input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                placeholder="Enter last name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="name@domain.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                            <Input
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="e.g. Computer Science"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Designation</label>
                            <Input
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                placeholder="e.g. Senior Professor"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={submitting}
                            >
                                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                {submitting ? 'Registering...' : 'Register Mentor'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>Registered Mentors</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search mentors..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-slate-200 dark:border-slate-800">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredMentors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                            No mentors found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMentors.map((mentor) => {
                                        const firstName = mentor.user?.firstName || mentor.firstName || '';
                                        const lastName = mentor.user?.lastName || mentor.lastName || '';
                                        const email = mentor.user?.email || mentor.email || '';

                                        return (
                                            <TableRow key={mentor.id}>
                                                <TableCell className="font-medium">
                                                    {firstName} {lastName}
                                                </TableCell>
                                                <TableCell>{email}</TableCell>
                                                <TableCell>{mentor.department || '-'}</TableCell>
                                                <TableCell>{mentor.designation || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-mono text-xs">
                                                        Mentor
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
