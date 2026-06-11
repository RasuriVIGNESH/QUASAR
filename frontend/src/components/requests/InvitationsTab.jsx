import React from 'react';
import { useRequests } from '../../contexts/RequestContext';
import RequestCard from './RequestCard';
import { teamService } from '../../services/TeamService';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Inbox } from 'lucide-react';

export default function InvitationsTab() {
  const { receivedInvitations, loading, error, refresh } = useRequests();

  const handleInvitationResponse = async (invitationId, response) => {
    try {
      await teamService.respondToInvitation(invitationId, response);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-xl">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const pendingInvitations = receivedInvitations.filter(i => i.status === 'PENDING');
  const respondedInvitations = receivedInvitations.filter(i => i.status !== 'PENDING');

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Pending Invitations
              {!loading && <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-bold px-2 py-0">{pendingInvitations.length}</Badge>}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Projects you've been invited to join.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                <CardContent className="p-5 space-y-4">
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
                </CardContent>
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
                onReject={() => handleInvitationResponse(inv.invitationId, 'REJECTED')}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
            <Inbox className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold text-sm">No pending invitations</p>
            <p className="text-xs text-slate-400 mt-1">You're all caught up.</p>
          </div>
        )}
      </div>

      {respondedInvitations.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
            Past Invitations
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {respondedInvitations.map(inv => (
              <RequestCard key={inv.invitationId} item={inv} type="invitation" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
