import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, User, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProjectChatBot({ project }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: `Hi! I'm the AI assistant for **${project.title}**. Ask me anything about the goals, tech stack, or team!` }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, isTyping]);

    const generateResponse = async (query) => {
        setIsTyping(true);
        // Simulate AI delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        const lowerQuery = query.toLowerCase();
        let response = "";

        // Simple rule-based "AI" using project context
        if (lowerQuery.includes('tech') || lowerQuery.includes('stack') || lowerQuery.includes('skill') || lowerQuery.includes('language')) {
            const skills = project.requiredSkills?.map(s => typeof s === 'string' ? s : s.skill?.name).join(', ');
            response = skills
                ? `This project is built using: **${skills}**. It's a great opportunity if you're interested in these technologies!`
                : "The specific technology stack hasn't been detailed yet, but it's checking for relevant skills.";
        } else if (lowerQuery.includes('lead') || lowerQuery.includes('owner') || lowerQuery.includes('created') || lowerQuery.includes('who')) {
            response = `The project is led by **${project.lead?.firstName || 'a student'}** (${project.lead?.email || 'contact available upon joining'}).`;
        } else if (lowerQuery.includes('goal') || lowerQuery.includes('desc') || lowerQuery.includes('about') || lowerQuery.includes('what')) {
            response = project.description || project.goals
                ? `**About the project:** ${project.description || project.goals}`
                : "The project goals are being refined. It's an innovative initiative!";
        } else if (lowerQuery.includes('team') || lowerQuery.includes('member') || lowerQuery.includes('size')) {
            response = `The team currently has **${project.currentTeamSize}** members active, with a maximum capacity of **${project.maxTeamSize}**.`;
        } else if (lowerQuery.includes('join') || lowerQuery.includes('apply')) {
            response = "You can apply by clicking the **Submit Application** button at the bottom of the detailed view. Make sure to write a compelling message!";
        } else {
            response = "That's an interesting question! While I focus on the project details like skills, goals, and team structure, I suggest applying to discuss more specific details with the lead directly.";
        }

        setMessages(prev => [...prev, { type: 'bot', text: response }]);
        setIsTyping(false);
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setInputValue('');

        generateResponse(userMsg);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="absolute right-6 z-50 flex flex-col items-end pointer-events-none" style={{ bottom: '10rem' }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-80 md:w-96 rounded-2xl shadow-xl overflow-hidden mb-4 pointer-events-auto flex flex-col"
                        style={{ maxHeight: '500px', height: '60vh' }}
                    >
                        {/* Header */}
                        <div className="bg-blue-600 p-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2 text-white">
                                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-tight">Project AI</h3>
                                    <p className="text-[10px] text-blue-100 font-medium opacity-80">Online & Ready to help</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 rounded-full"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950 space-y-4 scroll-smooth"
                        >
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-start gap-2.5 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.type === 'bot' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'}`}>
                                        {msg.type === 'bot' ? <Sparkles className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                                    </div>
                                    <div
                                        className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.type === 'bot'
                                            ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-sm'
                                            : 'bg-blue-600 text-white rounded-tr-sm'
                                            }`}
                                    >
                                        <div dangerouslySetInnerHTML={{
                                            __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        }} />
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex items-start gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <Sparkles className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="relative flex items-center gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about goals, skills..."
                                    className="pr-10 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
                                />
                                <Button
                                    size="icon"
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="absolute right-1 top-1 h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 z-50 ${isOpen ? 'bg-slate-200 text-slate-600 rotate-90' : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30'}`}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-7 w-7" />}
            </motion.button>
        </div>
    );
}
