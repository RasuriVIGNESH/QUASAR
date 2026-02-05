// src/components/requests/InvitationsTab.jsx

import React from 'react';
import { useRequests } from '../../contexts/RequestContext';
import RequestCard from './RequestCard';
import { teamService } from '../../services/TeamService';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Inbox } from 'lucide-react';

export default function InvitationsTab() {
  const { receivedInvitations, loading, error, refresh } = useRequests();

  const handleInvitationResponse = async (invitationId, response) => {
    try {
      await teamService.respondToInvitation(invitationId, response);
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

  const pendingInvitations = receivedInvitations.filter(i => i.status === 'PENDING');
  const respondedInvitations = receivedInvitations.filter(i => i.status !== 'PENDING');

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Pending Invitations
              {loading ? (
                <Skeleton className="h-5 w-8 rounded-full bg-slate-200" />
              ) : (
                <Badge variant="secondary" className="text-sm">{pendingInvitations.length}</Badge>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Invitations from project owners for you to join their teams
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
        ) : pendingInvitations.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingInvitations.map(inv => (
              <RequestCard
                key={inv.invitationId}
                item={inv}
                type="invitation"
                onAccept={() => handleInvitationResponse(inv.invitationId, 'ACCEPTED')}
                onReject={() => handleInvitationResponse(inv.invitationId, 'DECLINED')}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No pending invitations</p>
            <p className="text-sm text-muted-foreground mt-1">
              You'll see invitations from project owners here
            </p>
          </div>
        )}
      </div>

      {respondedInvitations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            History
            <Badge variant="outline" className="text-xs">{respondedInvitations.length}</Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-70">
            {respondedInvitations.map(inv => (
              <RequestCard key={inv.invitationId} item={inv} type="invitation" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}