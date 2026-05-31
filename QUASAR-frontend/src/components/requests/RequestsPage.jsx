import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRequests } from '../../contexts/RequestContext';
import SentRequestsTab from './SentRequestsTab';
import InvitationsTab from './InvitationsTab';
import ProjectRequestsTab from './ProjectRequestsTab';
import { Inbox, Users, Send, Sparkles } from 'lucide-react';

export default function RequestsPage() {
  const { pendingCount } = useRequests();

  const tabs = [
    { id: 'invitations', label: 'Invitations', icon: <Sparkles size={14} /> },
    { id: 'project-requests', label: 'Team Requests', icon: <Users size={14} /> },
    { id: 'sent', label: 'Sent', icon: <Send size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* HEADER - Professional Minimalist */}
      <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Inbox size={16} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Collaboration Center</h1>
          </div>
          <p className="text-slate-500 font-medium text-xs">
            Manage your project invitations and team requests.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <Tabs defaultValue="invitations" className="space-y-6">
          {/* TAB LIST - Clean & Minimal */}
          <div className="flex justify-center sm:justify-start">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-xs font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    {tab.icon}
                    {tab.label}
                    {tab.id === 'invitations' && pendingCount > 0 && (
                      <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                        {pendingCount}
                      </span>
                    )}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-4">
            <TabsContent value="invitations" className="mt-0 focus-visible:outline-none">
              <InvitationsTab />
            </TabsContent>
            <TabsContent value="project-requests" className="mt-0 focus-visible:outline-none">
              <ProjectRequestsTab />
            </TabsContent>
            <TabsContent value="sent" className="mt-0 focus-visible:outline-none">
              <SentRequestsTab />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
