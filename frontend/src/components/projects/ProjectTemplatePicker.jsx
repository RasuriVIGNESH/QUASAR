import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2 } from 'lucide-react';
import discoveryService from '@/services/discoveryService';

const list = (response) => { const envelope = response?.data ?? response; const body = envelope?.data ?? envelope; return Array.isArray(body) ? body : body?.content || []; };
export default function ProjectTemplatePicker({ onApply }) {
  const [templates, setTemplates] = useState([]); const [loading, setLoading] = useState(true); const [open, setOpen] = useState(false);
  useEffect(() => { discoveryService.getTemplates().then(response => setTemplates(list(response))).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="text-xs text-slate-400 flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Loading templates...</div>;
  if (!templates.length) return null;
  return <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><FileText size={16} className="text-indigo-600" /><div><p className="text-sm font-bold text-slate-900">Use a project template (optional)</p><p className="text-xs text-slate-500">A template fills only empty fields with suggested skills and planning sections. You can edit everything afterward.</p></div></div><Button type="button" size="sm" variant="outline" onClick={() => setOpen(!open)}>{open ? 'Hide templates' : 'Browse templates'}</Button></div>{open && <div className="grid gap-2 mt-4">{templates.map(template => <div key={template.key} className="flex items-center justify-between gap-3 bg-white rounded-xl border border-slate-200 p-3"><div><p className="text-sm font-bold text-slate-800">{template.name}</p><p className="text-xs text-slate-500 line-clamp-2">{template.summary}</p></div><Button type="button" size="sm" onClick={async () => { const response = await discoveryService.getTemplate(template.key); onApply(response?.data?.data || response?.data || response); setOpen(false); }} className="bg-indigo-600 hover:bg-indigo-700 text-white">Use this</Button></div>)}</div>}</div>;
}
