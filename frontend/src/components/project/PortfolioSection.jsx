import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import portfolioService from '@/services/portfolioService';
import { isHttpUrl, unwrapList } from '@/lib/validation';

export default function PortfolioSection({ projectId, canEdit, currentUserId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', description: '' });

  const load = useCallback(async () => { try { setEntries(unwrapList(await portfolioService.list(projectId))); } catch (error) { toast.error(error.message || 'Unable to load portfolio'); } finally { setLoading(false); } }, [projectId]);
  useEffect(() => { load(); }, [load]);

  const addEntry = async (event) => { event.preventDefault(); if (!form.title.trim() || !isHttpUrl(form.url)) { toast.error('Add a title and an absolute HTTP(S) URL'); return; } setSaving(true); try { const created = await portfolioService.create(projectId, form); setEntries(prev => [...prev, created?.data || created]); setForm({ title: '', url: '', description: '' }); toast.success('Portfolio evidence added'); } catch (error) { toast.error(error.message || 'Could not add portfolio evidence'); } finally { setSaving(false); } };
  const remove = async (entry) => { try { await portfolioService.remove(projectId, entry.id); setEntries(prev => prev.filter(item => item.id !== entry.id)); toast.success('Portfolio entry removed'); } catch (error) { toast.error(error.message || 'Could not remove portfolio entry'); } };

  return <section className="space-y-4"><div><h2 className="text-lg font-black text-slate-900">Contribution portfolio</h2><p className="text-xs text-slate-500 mt-1">Evidence shared by project members.</p></div>{loading ? <Loader2 className="animate-spin text-indigo-600" /> : entries.length === 0 ? <Card className="border-dashed"><CardContent className="py-8 text-center text-sm text-slate-500">No contribution evidence yet.</CardContent></Card> : <div className="grid gap-3">{entries.map(entry => <Card key={entry.id} className="border-slate-200"><CardContent className="p-4 flex items-start justify-between gap-3"><div><a href={entry.url} target="_blank" rel="noreferrer" className="font-bold text-indigo-700 hover:underline flex items-center gap-1">{entry.title}<ExternalLink size={13} /></a><p className="text-sm text-slate-500 mt-1">{entry.description}</p><p className="text-[11px] text-slate-400 mt-2">{entry.owner?.name || entry.ownerName || 'Project contributor'}</p></div>{canEdit && String(entry.ownerId || entry.owner?.id) === String(currentUserId) && <Button variant="ghost" size="sm" onClick={() => remove(entry)} aria-label="Delete portfolio entry"><Trash2 size={15} className="text-rose-500" /></Button>}</CardContent></Card>)}</div>}{canEdit && <Card className="border-slate-200"><CardContent className="p-5"><form onSubmit={addEntry} className="space-y-3"><div className="flex items-center gap-2 text-sm font-bold"><Plus size={15} className="text-indigo-600" /> Add evidence</div><Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} maxLength={160} /><Input placeholder="https://github.com/..." value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} /><Textarea placeholder="What did you contribute?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={2000} /><Button disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">{saving && <Loader2 size={14} className="mr-2 animate-spin" />}Add evidence</Button></form></CardContent></Card>}</section>;
}
