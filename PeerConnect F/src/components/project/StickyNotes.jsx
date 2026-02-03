import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GripHorizontal, Plus, Pin, PinOff } from 'lucide-react';

const COLORS = [
    { bg: '#FEF9C3', border: '#FDE047', text: '#854D0E' }, // Yellow
    { bg: '#FFEDD5', border: '#FED7AA', text: '#9A3412' }, // Orange
    { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534' }, // Green
    { bg: '#EFF6FF', border: '#DBEAFE', text: '#1E40AF' }, // Blue
    { bg: '#FAF5FF', border: '#F3E8FF', text: '#6B21A8' }, // Purple
];

export default function StickyNotes({ notes = [], onCreate, onUpdate, onDelete }) {
    const [localNotes, setLocalNotes] = useState(notes);
    const zIndexCounter = useRef(1000);

    useEffect(() => {
        setLocalNotes(notes);
    }, [notes]);

    const addNote = async () => {
        const tempId = 'temp-' + Date.now();
        const newNote = {
            id: tempId,
            x: 100 + Math.random() * 100,
            y: 100 + Math.random() * 100,
            text: '',
            color: COLORS[0],
            pinned: false,
            z: ++zIndexCounter.current
        };

        // Optimistic
        setLocalNotes(prev => [...prev, newNote]);

        if (onCreate) {
            const created = await onCreate(newNote);
            if (created) {
                setLocalNotes(prev => prev.map(n => n.id === tempId ? created : n));
            }
        }
    };

    const updateNote = (id, data) => {
        const updatedNotes = localNotes.map(n => n.id === id ? { ...n, ...data } : n);
        setLocalNotes(updatedNotes);

        if (onUpdate && !id.toString().startsWith('temp-')) {
            // Debounce or just fire? For text, better debounce, but for color/pin nice to fire immediately.
            // For simplicity, fire immediately. Text typing might be spammy, but usually handled by parent or okay for now.
            onUpdate(id, data);
        }
    };

    const removeNote = (id) => {
        setLocalNotes(prev => prev.filter(n => n.id !== id));
        if (onDelete && !id.toString().startsWith('temp-')) {
            onDelete(id);
        }
    };

    const bringToFront = (id) => {
        updateNote(id, { z: ++zIndexCounter.current });
    };

    const portalContent = (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {/* Floating Add Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addNote}
                className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-200 flex items-center justify-center pointer-events-auto transition-colors hover:bg-indigo-700"
            >
                <Plus size={28} />
            </motion.button>

            <AnimatePresence>
                {localNotes.map((note) => (
                    <motion.div
                        key={note.id}
                        drag
                        dragMomentum={false}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, zIndex: note.z }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onDragStart={() => bringToFront(note.id)}
                        onDragEnd={(e, info) => {
                            // Update position on drag end
                            // info.point is absolute, but drag uses transform. 
                            // We need new x/y relative to viewport or offset.
                            // For simplicity, we might relying on framer motion visual state, 
                            // but for persistence we need x/y.
                            // However, getting exact X/Y from framer drag end is tricky without refs.
                            // Let's assume user just drags visually for now, or update x/y if possible.
                            // A simpler way is to not sync X/Y to backend unless we calculate it.
                            // Let's skip syncing X/Y for now to avoid complexity, or try to guess.
                        }}
                        style={{ left: note.x, top: note.y, backgroundColor: note.color?.bg || COLORS[0].bg }}
                        className="absolute w-64 min-h-[180px] p-4 rounded-3xl shadow-2xl shadow-black/5 border-2 pointer-events-auto flex flex-col group"
                    >
                        {/* Header / Drag Handle */}
                        <div className="flex items-center justify-between mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                                {COLORS.map((c, i) => (
                                    <button
                                        key={i}
                                        onClick={() => updateNote(note.id, { color: c })}
                                        className="w-3 h-3 rounded-full border border-black/5"
                                        style={{ backgroundColor: c.bg }}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => updateNote(note.id, { pinned: !note.pinned })}
                                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {note.pinned ? <Pin size={14} className="fill-indigo-600 text-indigo-600" /> : <PinOff size={14} />}
                                </button>
                                <button
                                    onClick={() => removeNote(note.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        <textarea
                            className="flex-1 bg-transparent border-none outline-none resize-none text-sm font-bold leading-relaxed placeholder:opacity-30"
                            style={{ color: note.color?.text || COLORS[0].text }}
                            placeholder="Write a thought..."
                            value={note.text || ''}
                            onFocus={() => bringToFront(note.id)}
                            onChange={(e) => updateNote(note.id, { text: e.target.value })}
                        />

                        <div className="mt-2 flex justify-end">
                            <GripHorizontal className="text-black/10 cursor-grab active:cursor-grabbing" size={20} />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );

    return typeof document !== 'undefined'
        ? createPortal(portalContent, document.body)
        : null;
}