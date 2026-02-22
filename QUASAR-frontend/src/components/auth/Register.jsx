import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Eye, EyeOff, Mail, Lock, User, GraduationCap, BookOpen,
  Building, ArrowRight, ArrowLeft, Github, Sparkles, CheckCircle2
} from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { dataService } from '../../services/dataService.js';
import ValidationAlert from '@/components/common/ValidationAlert';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    graduationYear: '',
    branch: '',
    collegeId: null
  });

  const [step, setStep] = useState(1);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [staticData, setStaticData] = useState({ branches: [], graduationYears: [], colleges: [] });
  const [isLoadingStaticData, setIsLoadingStaticData] = useState(false);

  const { signup, loginWithGitHub, isCollegeEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaticData = async () => {
      setIsLoadingStaticData(true);
      try {
        const branchesRes = await dataService.getBranches().catch(() => ({ data: [] }));
        const yearsRes = await dataService.getGraduationYears().catch(() => ({ data: [] }));
        const collegesRes = await dataService.getColleges().catch(() => ({ data: [] }));
        setStaticData({
          branches: branchesRes.data || [],
          graduationYears: yearsRes.data || [],
          colleges: collegesRes.data || []
        });
      } finally {
        setIsLoadingStaticData(false);
      }
    };
    fetchStaticData();
  }, []);

  const isCollegeEmailValid = isCollegeEmail(formData.email);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setError('');
  }

  function handleSelectChange(name, value) {
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validateStep(currentStep) {
    const errs = {};
    if (currentStep === 1) {
      if (!formData.firstName.trim()) errs.firstName = 'First name is required';
      if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
      if (!formData.email.trim()) errs.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errs.email = 'Invalid email';
    } else if (currentStep === 2) {
      if (!formData.graduationYear) errs.graduationYear = 'Select your graduation year';
      if (!formData.branch) errs.branch = 'Select your branch/major';
      if (!formData.collegeId) errs.collegeId = 'Select your college';
    } else if (currentStep === 3) {
      if (!formData.password) errs.password = 'Password is required';
      else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
      if (!formData.confirmPassword) errs.confirmPassword = 'Confirm your password';
      else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    setError('');
    if (validateStep(step)) setStep(prev => Math.min(prev + 1, 3));
  }

  function handleBack() {
    setError('');
    setStep(prev => Math.max(prev - 1, 1));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!validateStep(step)) return;
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    try {
      setLoading(true);
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        graduationYear: parseInt(formData.graduationYear, 10),
        branch: formData.branch,
        collegeId: formData.collegeId
      };
      await signup(formData.email, formData.password, userData);
      setShowWelcome(true);
      setTimeout(() => {
        navigate('/onboarding');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGitHubLogin() {
    setError('');
    try {
      setLoading(true);
      localStorage.setItem('oauth_intent', 'register');
      await loginWithGitHub();
    } catch (err) {
      setError('GitHub login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const StepProgress = React.useCallback(({ currentStep }) => {
    const steps = [
      { id: 1, label: 'Account', icon: <User className="h-4 w-4" /> },
      { id: 2, label: 'Academic', icon: <GraduationCap className="h-4 w-4" /> },
      { id: 3, label: 'Security', icon: <Lock className="h-4 w-4" /> }
    ];

    return (
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-[2px] bg-slate-200 dark:bg-slate-700">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${s.id === currentStep
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none scale-110'
                  : s.id < currentStep
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
              >
                {s.id < currentStep ? <CheckCircle2 className="h-5 w-5" /> : s.icon}
              </div>
              <span className={`text-xs mt-3 font-bold uppercase tracking-wider ${s.id === currentStep ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto space-y-8"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <img src="/data/Logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">Quasar</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create your account</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Join the networking platform for innovators</p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden">
          <CardContent className="p-8">
            <StepProgress currentStep={step} />

            <ValidationAlert error={error} />

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-slate-700 dark:text-white font-semibold text-sm">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="h-11 focus:ring-2 focus:ring-blue-500 transition-all border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        {fieldErrors.firstName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{fieldErrors.firstName}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-slate-700 dark:text-white font-semibold text-sm">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="h-11 focus:ring-2 focus:ring-blue-500 transition-all border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        {fieldErrors.lastName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{fieldErrors.lastName}</p>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-slate-700 dark:text-white font-semibold text-sm">College Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john.doe@university.edu"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 h-11 focus:ring-2 focus:ring-blue-500 transition-all border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      {fieldErrors.email && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{fieldErrors.email}</p>}
                      {formData.email && !isCollegeEmailValid && (
                        <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1.5 mt-1 bg-amber-50 p-2 rounded-md">
                          <Sparkles className="h-3 w-3" /> Use a .edu or college domain for full access
                        </p>
                      )}
                      {formData.email && isCollegeEmailValid && (
                        <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5 mt-1 bg-emerald-50 p-2 rounded-md">
                          <CheckCircle2 className="h-3 w-3" /> Verified college domain detected
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 dark:text-white font-semibold text-sm">Graduation</Label>
                        <Select onValueChange={(v) => handleSelectChange('graduationYear', v)} value={formData.graduationYear}>
                          <SelectTrigger className="h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {staticData.graduationYears.map(year => (
                              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldErrors.graduationYear && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{fieldErrors.graduationYear}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-slate-700 dark:text-white font-semibold text-sm">Branch</Label>
                        <Select onValueChange={(v) => handleSelectChange('branch', v)} value={formData.branch}>
                          <SelectTrigger className="h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {staticData.branches.map(branch => (
                              <SelectItem key={branch} value={branch}>
                                {branch.replace(/_/g, ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldErrors.branch && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{fieldErrors.branch}</p>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-700 dark:text-white font-semibold text-sm">Institute</Label>
                      <Select onValueChange={(v) => handleSelectChange('collegeId', v)} value={formData.collegeId || undefined}>
                        <SelectTrigger className="h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {staticData.colleges.map(college => (
                            <SelectItem key={college.id} value={String(college.id)}>{college.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldErrors.collegeId && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{fieldErrors.collegeId}</p>}

                      {formData.collegeId && staticData.colleges.find(c => String(c.id) === String(formData.collegeId)) && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2.5"
                        >
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Selected Institute</span>
                            <span className="font-semibold text-slate-900 dark:text-white leading-tight">
                              {staticData.colleges.find(c => String(c.id) === String(formData.collegeId)).name}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-slate-700 dark:text-white font-semibold text-sm">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10 h-11 focus:ring-2 focus:ring-blue-500 transition-all border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {fieldErrors.password && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{fieldErrors.password}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-white font-semibold text-sm">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="h-11 focus:ring-2 focus:ring-blue-500 transition-all border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      {fieldErrors.confirmPassword && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{fieldErrors.confirmPassword}</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 pt-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-11 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  onClick={step < 3 ? (e) => { e.preventDefault(); handleNext(); } : undefined}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    step === 3 ? (
                      <div className="flex items-center justify-center gap-2">
                        <span>Complete Registration</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )
                  )}
                </Button>
              </div>
            </form>

            {step === 1 && (
              <div className="mt-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100 dark:border-slate-700" /></div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-bold">Or</span></div>
                </div>
                <div className="group relative">
                  <motion.button
                    type="button"
                    onClick={handleGitHubLogin}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-11 flex items-center justify-center gap-2 bg-[#24292e] dark:bg-[#333] hover:bg-[#2b3137] text-white rounded-md font-medium transition-all shadow-lg shadow-slate-900/20"
                  >
                    <Github className="h-5 w-5" />
                    <span>Continue with GitHub</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                  </motion.button>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          By joining, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>

      {/* Welcome Animation Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl mx-auto mb-6 shadow-2xl flex items-center justify-center p-2 border border-slate-100 dark:border-slate-800">
                <img src="/data/Logo.png" alt="Quasar Logo" className="w-full h-full object-cover rounded-2xl" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                Welcome to Quasar
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">Your journey starts now.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}