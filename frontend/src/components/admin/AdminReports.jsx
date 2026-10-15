import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import moderationService from '@/services/moderationService';

const list = response => { const body = response?.data ?? response; return Array.isArray(body) ? body : body?.content || []; };
export default function AdminReports() {
  const [reports, setReports] = useState([]); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { try { setReports(list(await moderationService.listReports(0, 50))); } catch (error) { toast.error(error.message || 'Unable to load reports'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const update = async (id, status) => { try { await moderationService.updateReport(id, { status, note: '' }); setReports(prev => prev.map(report => report.id === id ? { ...report, status } : report)); toast.success('Report updated'); } catch (error) { toast.error(error.message || 'Could not update report'); } };
  return <div className="p-6 lg:p-10"><div className="mb-8"><h1 className="text-2xl font-black text-slate-900">Reports & moderation</h1><p className="text-sm text-slate-500 mt-1">Review reports submitted by the community.</p></div>{loading ? <Loader2 className="animate-spin text-indigo-600" /> : <div className="space-y-4">{reports.length === 0 ? <Card className="border-dashed"><CardContent className="py-16 text-center text-slate-500">No reports found.</CardContent></Card> : reports.map(report => <Card key={report.id} className="border-slate-200"><CardContent className="p-5"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Badge variant="outline">{report.reason}</Badge><Badge className="bg-slate-100 text-slate-700 border-none">{report.status}</Badge></div><p className="text-sm text-slate-700 mt-3">{report.description || 'No additional details provided.'}</p><p className="text-xs text-slate-400 mt-2">Reported {report.projectId ? `project ${report.projectId}` : `user ${report.userId}`}</p></div>{report.status !== 'RESOLVED' && report.status !== 'DISMISSED' && <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => update(report.id, 'DISMISSED')}>Dismiss</Button><Button size="sm" onClick={() => update(report.id, 'RESOLVED')} className="bg-indigo-600 text-white hover:bg-indigo-700">Resolve</Button></div>}</div></CardContent></Card>)}</div>}</div>;
}
