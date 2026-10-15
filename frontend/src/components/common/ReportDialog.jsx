import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import moderationService from '@/services/moderationService';

const reasons = ['SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'IMPERSONATION', 'COPYRIGHT', 'OTHER'];
export default function ReportDialog({ open, onOpenChange, projectId, userId }) {
  const [reason, setReason] = useState('SPAM');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => { setSaving(true); try { await moderationService.createReport({ projectId, userId, reason, description }); toast.success('Report submitted for review'); onOpenChange(false); setDescription(''); } catch (error) { toast.error(error.message || 'Could not submit report'); } finally { setSaving(false); } };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="bg-white rounded-2xl"><DialogHeader><DialogTitle>Report {projectId ? 'project' : 'user'}</DialogTitle></DialogHeader><div className="space-y-4 py-2"><div><Label>Reason</Label><select value={reason} onChange={e => setReason(e.target.value)} className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">{reasons.map(item => <option key={item}>{item}</option>)}</select></div><div><Label>Details (optional)</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={2000} placeholder="Tell moderators what happened..." className="mt-2" /><p className="text-[11px] text-slate-400 mt-1 text-right">{description.length}/2000</p></div></div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} disabled={saving} className="bg-rose-600 hover:bg-rose-700 text-white">{saving && <Loader2 size={14} className="mr-2 animate-spin" />}Submit report</Button></DialogFooter></DialogContent></Dialog>;
}
