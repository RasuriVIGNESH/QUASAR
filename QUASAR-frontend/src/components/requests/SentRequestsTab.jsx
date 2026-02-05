// src/components/requests/SentRequestsTab.jsx

import React from 'react';
import { useRequests } from '../../contexts/RequestContext';
import RequestCard from './RequestCard';
import { joinRequestService } from '../../services/JoinRequestService';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send } from 'lucide-react';

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
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const pendingSentRequests = sentJoinRequests.filter(req => req.status === 'PENDING');
  const respondedSentRequests = sentJoinRequests.filter(req => req.status !== 'PENDING');

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Sent Requests
              {loading ? (
                <Skeleton className="h-5 w-8 rounded-full bg-slate-200" />
              ) : (
                <Badge variant="secondary" className="text-sm">{pendingSentRequests.length}</Badge>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your requests to join other projects
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
          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
            <Send className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No pending sent requests</p>
            <p className="text-sm text-muted-foreground mt-1">
              When you request to join a project, it will appear here
            </p>
          </div>
        )}
      </div>

      {respondedSentRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Request History
            <Badge variant="outline" className="text-xs">{respondedSentRequests.length}</Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-70">
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
    </div>
  );
}