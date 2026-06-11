import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Clock, CheckCircle2, XCircle,
  Loader2, MessageSquare, Users, Trash2, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RequestCard({ item, type, onAccept, onReject, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isInvitation = type === 'invitation';
  const relevantUser = isInvitation ? item.invitedBy : item.user;

  const statusStyles = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    ACCEPTED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
    CANCELED: "bg-slate-50 text-slate-500 border-slate-100"
  };

  const handleAction = async (action) => {
    if (!action) return;
    setIsProcessing(true);
    try {
      await action(item.id || item.invitationId);
    }
    catch (e) {
      console.error(e);
    }
    finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className={`group border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden bg-white h-full flex flex-col ${item.status !== 'PENDING' ? 'opacity-70' : ''}`}>
      <CardContent className="p-5 flex flex-col flex-1 relative">
        {isProcessing && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-100">
              <AvatarImage src={relevantUser?.profilePictureUrl} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                {relevantUser?.firstName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isInvitation ? 'Invited by' : 'Requested by'}
              </p>
              <p className="text-sm font-bold text-slate-900">
                {relevantUser?.firstName} {relevantUser?.lastName}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`text-[9px] font-bold border-none px-2 py-0 ${statusStyles[item.status]}`}>
            {item.status}
          </Badge>
        </div>

        <div className="mb-4">
          <Link
            to={`/projects/${item.project?.id}`}
            className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors leading-tight block mb-1"
          >
            {item.project?.title}
          </Link>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
            <Clock size={12} />
            {new Date(item.createdAt || item.invitedAt).toLocaleDateString()}
          </div>
        </div>

        {item.message && (
          <div className="mb-5 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
              "{item.message}"
            </p>
          </div>
        )}

        {item.status === 'PENDING' && (
          <div className="mt-auto pt-4 border-t border-slate-50 flex gap-2">
            {onAccept && (
              <Button
                onClick={() => handleAction(onAccept)}
                size="sm"
                className="flex-1 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                <CheckCircle2 className="mr-1.5 w-3.5 h-3.5" /> Accept
              </Button>
            )}
            {onReject && (
              <Button
                variant="ghost"
                onClick={() => handleAction(onReject)}
                size="sm"
                className="flex-1 h-9 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold text-xs"
              >
                <XCircle className="mr-1.5 w-3.5 h-3.5" /> Decline
              </Button>
            )}
            {onCancel && (
              <Button
                variant="outline"
                onClick={() => handleAction(onCancel)}
                size="sm"
                className="flex-1 h-9 rounded-lg border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50"
              >
                <Trash2 className="mr-1.5 w-3.5 h-3.5" /> Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
