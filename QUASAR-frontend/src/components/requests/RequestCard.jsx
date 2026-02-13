import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowRight, Clock, Mail, CheckCircle2, XCircle,
  AlertCircle, Loader2, MessageSquare, Users, Trash2, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const itemVar = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function RequestCard({ item, type, onAccept, onReject, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isInvitation = type === 'invitation';
  const relevantUser = isInvitation ? item.invitedBy : item.user;

  const statusStyles = {
    PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/30 shadow-amber-100/50 dark:shadow-none",
    ACCEPTED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30",
    REJECTED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/30",
    CANCELED: "bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
  };

  const handleAction = async (action) => {
    setIsProcessing(true);
    try { await action(item.id); }
    catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  return (
    <motion.div variants={itemVar} layout>
      <Card className={`group relative border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[32px] overflow-hidden bg-white dark:bg-slate-900/50 backdrop-blur-sm dark:border dark:border-slate-800/60 ${item.status !== 'PENDING' ? 'opacity-75 grayscale-[0.5]' : ''}`}>

        {/* Progress Loading Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* Project & User Context */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 ring-4 ring-slate-50 dark:ring-slate-800 group-hover:ring-blue-50 dark:group-hover:ring-blue-900/20 transition-all">
                  <AvatarImage src={relevantUser?.profileImage || relevantUser?.profilePictureUrl} />
                  <AvatarFallback className="bg-blue-600 text-white font-black">
                    {relevantUser?.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-slate-800 shadow-sm border dark:border-slate-700 ${item.status === 'PENDING' ? 'text-amber-500' : 'text-slate-400'}`}>
                  {isInvitation ? <Zap size={10} fill="currentColor" /> : <Users size={10} />}
                </div>
              </div>

              <div className="space-y-1">
                <Badge className={`${statusStyles[item.status]} border-none text-[9px] font-black uppercase tracking-widest px-3 mb-1`}>
                  {item.status}
                </Badge>
                <Link to={`/projects/${item.project?.id}`} className="block text-xl font-black text-slate-900 dark:text-white leading-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {item.project?.title}
                </Link>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                  {isInvitation ? 'Invited by' : 'Request from'} <span className="text-slate-600 dark:text-slate-300 underline decoration-blue-200 dark:decoration-blue-800 underline-offset-4 font-black">{relevantUser?.firstName} {relevantUser?.lastName}</span>
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-full h-fit">
              <Clock size={12} className="text-blue-400" />
              {new Date(item.createdAt || item.invitedAt).toLocaleDateString()}
            </div>
          </div>

          {/* Message Bubble */}
          {item.message && (
            <div className="mt-6 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-[24px] rounded-tl-none border border-blue-100 dark:border-blue-900/20 relative group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
              <MessageSquare size={14} className="absolute -top-2 -left-2 text-blue-400 bg-white dark:bg-slate-800 rounded-full p-0.5" />
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed">
                "{item.message}"
              </p>
            </div>
          )}

          {/* Action Footer */}
          {item.status === 'PENDING' && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-3 flex-1 md:flex-none">
                {onAccept && (
                  <Button
                    onClick={() => handleAction(onAccept)}
                    className="flex-1 md:flex-none h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-100 dark:shadow-blue-900/20"
                  >
                    <CheckCircle2 className="mr-2 w-4 h-4" /> Accept
                  </Button>
                )}
                {onReject && (
                  <Button
                    variant="ghost"
                    onClick={() => handleAction(onReject)}
                    className="flex-1 md:flex-none h-12 px-8 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 font-bold"
                  >
                    <XCircle className="mr-2 w-4 h-4" /> Decline
                  </Button>
                )}
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={() => handleAction(onCancel)}
                    className="flex-1 md:flex-none h-12 px-8 rounded-2xl border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="mr-2 w-4 h-4" /> Cancel Request
                  </Button>
                )}
              </div>

              <Button variant="ghost" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 group/btn" asChild>
                <Link to={`/projects/${item.project?.id}`}>
                  Explore Base <ArrowRight size={14} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}