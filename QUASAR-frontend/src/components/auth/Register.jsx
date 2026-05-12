import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { dataService } from '../../services/dataService.js';
import { toast } from "sonner";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    graduationYear: '', branch: '', collegeId: null
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [staticData, setStaticData] = useState({ branches: [], graduationYears: [], colleges: [] });
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [b, y, c] = await Promise.all([
          dataService.getBranches(),
          dataService.getGraduationYears(),
          dataService.getColleges()
        ]);
        setStaticData({ branches: b.data || [], graduationYears: y.data || [], colleges: c.data || [] });
      } catch (err) {
        console.error("Data fetch failed");
      }
    };
    fetch();
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSelectChange = (name, value) => setFormData({ ...formData, [name]: value });

  const nextStep = (e) => { e.preventDefault(); setStep(step + 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      setLoading(true);
      await signup(formData.email, formData.password, {
        ...formData,
        graduationYear: parseInt(formData.graduationYear, 10),
        collegeId: parseInt(formData.collegeId, 10)
      });
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased flex flex-col">
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="relative z-10 flex items-center gap-3">
            <img
              src="/Logo.png"
              alt="Quasar Logo"
              className="w-10 h-10 object-contain shadow-sm rounded-lg"
            />
            <span className="text-xl font-bold tracking-tight text-white">Quasar</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest hidden md:block">Step {step} of 3</span>
            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-6">
        <div className="w-full max-w-4xl grid lg:grid-cols-12 gap-12 items-start">

          {/* Left Side: Context */}
          <div className="lg:col-span-5 space-y-8 mt-10 hidden lg:block">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Join the <span className="text-slate-500">Protocol.</span>
              </h1>
              <p className="text-slate-500 leading-relaxed">
                Quasar is where student engineers build their professional identity through real-world collaboration.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { t: 'Verified Portfolio', d: 'Your contributions are proof of skill.' },
                { t: 'Team Discovery', d: 'Find partners for any tech stack.' },
                { t: 'Global Network', d: 'Connect with engineers across campuses.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center mt-1">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.t}</h4>
                    <p className="text-xs text-slate-500">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 md:p-10">
              <form onSubmit={step === 3 ? handleSubmit : nextStep} className="space-y-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-slate-900">Personal Details</h2>
                        <p className="text-sm text-slate-500">Let's start with the basics.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-900 block mb-1.5">First Name</Label>
                          <Input
                            name="firstName"
                            placeholder="Alex"
                            onChange={handleInputChange}
                            value={formData.firstName}
                            className="h-11 bg-white border-slate-300 rounded-lg text-slate-900 focus:border-slate-900"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-900 block mb-1.5">Last Name</Label>
                          <Input
                            name="lastName"
                            placeholder="Smith"
                            onChange={handleInputChange}
                            value={formData.lastName}
                            className="h-11 bg-white border-slate-300 rounded-lg text-slate-900 focus:border-slate-900"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-900 block mb-1">University Email</Label>
                        <Input name="email" type="email" placeholder="alex@university.edu" onChange={handleInputChange} value={formData.email} className="h-11 border-slate-300 rounded-lg text-slate-900 bg-white" required />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-slate-900">Academic Info</h2>
                        <p className="text-sm text-slate-500">Where are you building your career?</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-700">Institute</Label>
                        <Select onValueChange={(v) => handleSelectChange('collegeId', v)}>
                          {/* Added text-slate-900 to Trigger */}
                          <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-lg focus:ring-slate-900 text-slate-900">
                            <SelectValue placeholder="Select University" />
                          </SelectTrigger>
                          {/* Added bg-white and text-slate-900 to Content and Items */}
                          <SelectContent className="bg-white border-slate-200">
                            {staticData.colleges.map(c => (
                              <SelectItem key={c.id} value={String(c.id)} className="text-slate-900 focus:bg-slate-100">
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-slate-700">Graduation Year</Label>
                          <Select onValueChange={(v) => handleSelectChange('graduationYear', v)}>
                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-lg focus:ring-slate-900 text-slate-900">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200">
                              {staticData.graduationYears.map(y => (
                                <SelectItem key={y} value={String(y)} className="text-slate-900 focus:bg-slate-100">
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-slate-700">Major / Branch</Label>
                          <Select onValueChange={(v) => handleSelectChange('branch', v)}>
                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-lg focus:ring-slate-900 text-slate-900">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200">
                              {staticData.branches.map(b => (
                                <SelectItem key={b} value={b} className="text-slate-900 focus:bg-slate-100">
                                  {b.replace(/_/g, ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-slate-900">Secure Your Account</h2>
                        <p className="text-sm text-slate-500">Choose a strong password for your identity.</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-700">Password</Label>
                        <Input name="password" type="password" placeholder="••••••••" onChange={handleInputChange} value={formData.password} className="h-12 bg-slate-50 border-slate-200 rounded-lg focus:ring-slate-900 text-slate-900" required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-700">Confirm Password</Label>
                        <Input name="confirmPassword" type="password" placeholder="••••••••" onChange={handleInputChange} value={formData.confirmPassword} className="h-12 bg-slate-50 border-slate-200 rounded-lg focus:ring-slate-900 text-slate-900" required />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4 pt-4">
                  {step > 1 && (
                    <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} className="flex-1 h-11 text-slate-600 font-semibold rounded-lg border border-slate-200">
                      <ArrowLeft size={16} className="mr-2" /> Back
                    </Button>
                  )}
                  <Button type="submit" disabled={loading} className="flex-1 h-11 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all">
                    {loading ? <Loader2 className="animate-spin" /> : step === 3 ? "Complete Registration" : "Next Step"}
                    {step !== 3 && <ArrowRight size={16} className="ml-2" />}
                  </Button>
                </div>
              </form>
            </div>
            <p className="text-center mt-8 text-sm text-slate-500">
              Already have an account? <Link to="/login" className="text-slate-900 font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}