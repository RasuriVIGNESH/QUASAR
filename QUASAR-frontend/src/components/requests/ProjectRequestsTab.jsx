// src/components/requests/ProjectRequestsTab.jsx

import React from 'react';
import { useRequests } from '../../contexts/RequestContext';
import RequestCard from './RequestCard';
import { joinRequestService } from '../../services/JoinRequestService';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users } from 'lucide-react';

import { motion } from 'framer-motion';

export default function ProjectRequestsTab() {
  const { receivedJoinRequests, loading, error, refresh } = useRequests();

  const handleJoinRequestAccept = async (requestId) => {
    try {
      await joinRequestService.acceptJoinRequest(requestId);
      refresh();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleJoinRequestReject = async (requestId) => {
    try {
      await joinRequestService.rejectJoinRequest(requestId);
      refresh();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };



  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const pendingJoinRequests = receivedJoinRequests.filter(req => req.status === 'PENDING');
  const respondedJoinRequests = receivedJoinRequests.filter(req => req.status !== 'PENDING');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Join Requests
              {loading ? (
                <Skeleton className="h-5 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
              ) : (
                <Badge variant="secondary" className="text-sm dark:bg-slate-800 dark:text-slate-200">{pendingJoinRequests.length}</Badge>
              )}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              People requesting to join your projects
            </p>
          </div>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-64 rounded-[32px] p-6 border-none shadow-sm bg-white dark:bg-slate-900">
                <div className="flex gap-4">
                  <Skeleton className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
                    <Skeleton className="h-6 w-3/4 mb-1 bg-slate-100 dark:bg-slate-800" />
                    <Skeleton className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
                <Skeleton className="h-16 mt-6 rounded-[24px] w-full bg-slate-100 dark:bg-slate-800" />
                <div className="mt-8 flex gap-3">
                  <Skeleton className="h-12 w-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                  <Skeleton className="h-12 w-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                </div>
              </Card>
            ))}
          </div>
        ) : pendingJoinRequests.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingJoinRequests.map(req => (
              <RequestCard
                key={req.id}
                item={req}
                type="join-request"
                onAccept={handleJoinRequestAccept}
                onReject={handleJoinRequestReject}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Users className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">No pending join requests</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              When people request to join your projects, they'll appear here
            </p>
          </div>
        )}
      </div>

      {respondedJoinRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
            History
            <Badge variant="outline" className="text-xs dark:border-slate-700 dark:text-slate-400">{respondedJoinRequests.length}</Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-70">
            {respondedJoinRequests.map(req => (
              <RequestCard key={req.id} item={req} type="join-request" />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}