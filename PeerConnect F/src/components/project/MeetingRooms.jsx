import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Plus, ArrowLeft, Save, Video,
    MessageSquare, FileText, Trash2, Loader2, Calendar, LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { meetingRoomService } from '../../services/MeetingRoomService';
import StickyNotes from './StickyNotes';

export default function MeetingRooms({ projectId, projectName, isProjectLead }) {
    const [view, setView] = useState('grid'); // 'grid' | 'editor'
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [editorContent, setEditorContent] = useState('');
    const [notes, setNotes] = useState([]);

    // Create Room State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newRoom, setNewRoom] = useState({ name: '', description: '', department: 'General' });

    useEffect(() => {
        loadRooms();
    }, [projectId]);

    const loadRooms = async () => {
        try {
            const res = await meetingRoomService.getMeetingRooms(projectId);
            setRooms(res.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCreateRoom = async () => {
        if (!newRoom.name) return;
        try {
            await meetingRoomService.createMeetingRoom(projectId, newRoom);
            setIsCreateOpen(false);
            setNewRoom({ name: '', description: '', department: 'General' });
            loadRooms();
        } catch (err) { console.error(err); }
    };

    const handleDeleteRoom = async (e, roomId) => {
        e.stopPropagation();
        if (window.confirm("Delete this war room?")) {
            try {
                await meetingRoomService.deleteMeetingRoom(roomId);
                loadRooms();
            } catch (err) { console.error(err); }
        }
    };

    const enterRoom = async (room) => {
        setCurrentRoom(room);
        setView('editor');
        try {
            const res = await meetingRoomService.getNotes(room.id);
            // Backend might return array directly or { data: [...] }
            const fetchedNotes = Array.isArray(res) ? res : (res.data || []);
            setNotes(fetchedNotes);
        } catch (err) {
            console.error(err);
            setNotes([]);
        }
    };

    // Note Handlers
    const handleCreateNote = async (noteData) => {
        try {
            const res = await meetingRoomService.createNote(currentRoom.id, noteData);
            const created = res.data || res;
            setNotes(prev => [...prev, created]);
            return created;
        } catch (err) { console.error(err); return null; }
    };

    const handleUpdateNote = async (noteId, noteData) => {
        try {
            // Optimistic update
            setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...noteData } : n));
            await meetingRoomService.updateNote(noteId, noteData);
        } catch (err) { console.error(err); }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            setNotes(prev => prev.filter(n => n.id !== noteId));
            await meetingRoomService.deleteNote(noteId);
        } catch (err) { console.error(err); }
    };

    if (loading) return (
        <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="h-full">
            <AnimatePresence mode="wait">
                {view === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <header className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">War Rooms</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{projectName} Collaborative Hubs</p>
                            </div>

                            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl h-12 px-6 font-bold shadow-xl shadow-indigo-100">
                                        <Plus className="w-4 h-4 mr-2" /> New Room
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white rounded-2xl border-none shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold">Initialize War Room</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-500 uppercase font-bold">Room Designation</Label>
                                            <Input value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} className="border-slate-200 rounded-lg" placeholder="e.g. Frontend Squad" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-500 uppercase font-bold">Mission Brief</Label>
                                            <Textarea value={newRoom.description} onChange={e => setNewRoom({ ...newRoom, description: e.target.value })} className="border-slate-200 rounded-lg" placeholder="Purpose of this room..." />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-500 uppercase font-bold">Department</Label>
                                            <Select value={newRoom.department} onValueChange={v => setNewRoom({ ...newRoom, department: v })}>
                                                <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
                                                <SelectContent className="bg-white">
                                                    <SelectItem value="General">General</SelectItem>
                                                    <SelectItem value="Engineering">Engineering</SelectItem>
                                                    <SelectItem value="Design">Design</SelectItem>
                                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateRoom} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl">Create Room</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rooms.map(room => (
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    key={room.id}
                                    onClick={() => enterRoom(room)}
                                    className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                        <Video size={100} />
                                    </div>
                                    <Badge className="bg-indigo-50 text-indigo-600 border-none px-3 py-1 mb-6 text-[9px] font-black uppercase tracking-widest">
                                        {room.department || 'General'}
                                    </Badge>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{room.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium line-clamp-2 mb-6">{room.description}</p>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Users size={14} className="text-slate-300" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase">{room.memberCount || 0} Operatives</span>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Trash2 size={18} onClick={(e) => handleDeleteRoom(e, room.id)} className="hover:text-red-200" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div >
                ) : (
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="h-full flex flex-col gap-6"
                    >
                        <header className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setView('grid')}
                                    className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">{currentRoom?.name}</h3>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Live Sync Editor</p>
                                </div>
                            </div>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 h-11 px-8 rounded-2xl font-bold shadow-lg shadow-indigo-100">
                                <Save size={18} className="mr-2" /> Save Notes
                            </Button>
                        </header>

                        <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 relative overflow-hidden">
                            <textarea
                                className="w-full h-full resize-none border-none outline-none font-mono text-slate-600 text-sm leading-loose placeholder:text-slate-200"
                                placeholder="Start initializing meeting documentation..."
                                value={editorContent}
                                onChange={(e) => setEditorContent(e.target.value)}
                            />
                            {/* The StickyNotes component is rendered via portal, so it just needs to be present */}
                            <StickyNotes
                                notes={notes}
                                onCreate={handleCreateNote}
                                onUpdate={handleUpdateNote}
                                onDelete={handleDeleteNote}
                            />
                        </div>
                    </motion.div>
                )
                }
            </AnimatePresence >
        </div >
    );
}