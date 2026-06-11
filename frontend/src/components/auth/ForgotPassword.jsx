import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Terminal, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await resetPassword(email);
      setSent(true);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1115] flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#0052e0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded text-red-600 text-[10px] font-bold uppercase tracking-widest mb-6">
            <Terminal size={14} /> Security Protocol
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none mb-4">
            Reset <br /> <span className="text-blue-600">Access Key.</span>
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
          {sent ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-slate-500 font-medium">Recovery instructions sent to your node. Check your inbox.</p>
              <Link to="/login" className="block w-full h-12 bg-slate-900 dark:bg-white dark:text-slate-900 text-white flex items-center justify-center font-bold uppercase tracking-widest hover:bg-blue-600 transition-all">
                Return to Entry
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Registered Email</Label>
                <Input
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-14 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-none focus:ring-blue-600 font-bold"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-14 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white rounded-none transition-all">
                {loading ? <Loader2 className="animate-spin" /> : "Generate Reset Link"}
              </Button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}