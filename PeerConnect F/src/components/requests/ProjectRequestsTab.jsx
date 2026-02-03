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
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Join Requests
              {loading ? (
                <Skeleton className="h-5 w-8 rounded-full bg-slate-200" />
              ) : (
                <Badge variant="secondary" className="text-sm">{pendingJoinRequests.length}</Badge>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              People requesting to join your projects
            </p>
          </div>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-64 rounded-[32px] p-6 border-none shadow-sm bg-white">
                <div className="flex gap-4">
                  <Skeleton className="h-14 w-14 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-16 rounded-full bg-slate-100" />
                    <Skeleton className="h-6 w-3/4 mb-1 bg-slate-100" />
                    <Skeleton className="h-3 w-1/2 bg-slate-100" />
                  </div>
                </div>
                <Skeleton className="h-16 mt-6 rounded-[24px] w-full bg-slate-100" />
                <div className="mt-8 flex gap-3">
                  <Skeleton className="h-12 w-24 rounded-2xl bg-slate-100" />
                  <Skeleton className="h-12 w-24 rounded-2xl bg-slate-100" />
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
          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No pending join requests</p>
            <p className="text-sm text-muted-foreground mt-1">
              When people request to join your projects, they'll appear here
            </p>
          </div>
        )}
      </div>

      {respondedJoinRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            History
            <Badge variant="outline" className="text-xs">{respondedJoinRequests.length}</Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-70">
            {respondedJoinRequests.map(req => (
              <RequestCard key={req.id} item={req} type="join-request" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}