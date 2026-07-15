// src/components/requests/SentRequestsTab.jsx

import React from 'react';
import { useRequests } from '../../contexts/RequestContext';
import RequestCard from './RequestCard';
import { joinRequestService } from '../../services/JoinRequestService';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Send } from 'lucide-react';

import { motion } from 'framer-motion';

export default function SentRequestsTab() {
  const { sentJoinRequests, loading, error, refresh } = useRequests();

  const handleCancel = async (requestId) => {
    try {
      await joinRequestService.cancelJoinRequest(requestId);
      refresh();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (error) {
    return (
        <Alert variant="destructive" className="rounded-xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }

  const requests = Array.isArray(sentJoinRequests) ? sentJoinRequests : [];
  const pendingSentRequests = requests.filter(req => req.status === 'PENDING');
  const respondedSentRequests = requests.filter(req => req.status !== 'PENDING');

  return (
      <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
      >
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Sent Requests
                {loading ? (
                    <Skeleton className="h-5 w-8 rounded-full" />
                ) : (
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-bold px-2 py-0">{pendingSentRequests.length}</Badge>
                )}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Your requests to join other projects.
              </p>
            </div>
          </div>

          {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                      <div className="p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <div className="flex gap-2 pt-2">
                          <Skeleton className="h-9 flex-1 rounded-lg" />
                          <Skeleton className="h-9 flex-1 rounded-lg" />
                        </div>
                      </div>
                    </Card>
                ))}
              </div>
          ) : pendingSentRequests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingSentRequests.map(req => (
                    <RequestCard
                        key={req.id}
                        item={req}
                        type="join-request"
                        onCancel={handleCancel}
                    />
                ))}
              </div>
          ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                <Send className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-bold text-sm">No pending sent requests</p>
                <p className="text-xs text-slate-400 mt-1">
                  When you request to join a project, it will appear here.
                </p>
              </div>
          )}
        </div>

        {respondedSentRequests.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Request History
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {respondedSentRequests.map(req => (
                    <RequestCard
                        key={req.id}
                        item={req}
                        type="join-request"
                    />
                ))}
              </div>
            </div>
        )}
      </motion.div>
  );
}