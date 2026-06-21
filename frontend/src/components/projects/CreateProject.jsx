import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  X, ArrowLeft, ArrowRight, Check, Briefcase,
  Target, Wrench, PlusCircle, Sparkles, Rocket, Lightbulb, Compass, Cpu, Search, Calendar
} from 'lucide-react';

// Services
import { projectService } from '../../services/projectService.js';
import { skillsService } from '../../services/skillsService.js';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ValidationAlert from '@/components/common/ValidationAlert';
import { toast } from 'sonner';

const stepContent = {
  1: {
    title: "The Vision",
    subtitle: "Bring your idea to life",
    description: "Every great collaboration starts with a clear vision. Define the problem you're passionate about solving.",
    icon: <Lightbulb className="w-12 h-12 text-amber-500" />,
    color: "bg-amber-50"
  },
  2: {
    title: "The Scope",
    subtitle: "Define the boundaries",
    description: "Setting clear goals and objectives helps potential teammates understand how they can contribute effectively.",
    icon: <Compass className="w-12 h-12 text-blue-500" />,
    color: "bg-blue-50"
  },
  3: {
    title: "The Engine",
    subtitle: "Technical & Team Details",
    description: "Finalize the logistics. Define your tech stack and the size of the dream team you want to build.",
    icon: <Cpu className="w-12 h-12 text-indigo-500" />,
    color: "bg-indigo-50"
  }
};

export default function CreateProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const eventId = searchParams.get('eventId');
  const eventName = searchParams.get('eventName');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdId, setCreatedId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemStatement: '',
    category: '', // This will hold categoryName for display/selection
    categoryId: null, // This will hold the actual category ID for submission
    goals: '',
    objectives: '',
    skillsRequired: [],
    maxTeamSize: '',
    techStack: [],
    githubRepo: '',
    demoUrl: '',
    expectedStartDate: '',
    expectedEndDate: '',
  });

  // UI States
  const [projectCategories, setProjectCategories] = useState([]);
  const [staticSkills, setStaticSkills] = useState([]);
  const [techStackInput, setTechStackInput] = useState('');
  const [skillsSearch, setSkillsSearch] = useState('');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const [cats, sks] = await Promise.all([
          projectService.getProjectCategories(),
          skillsService.getPredefinedSkills()
        ]);
        setProjectCategories(Array.isArray(cats) ? cats : (cats?.data || []));
        setStaticSkills(sks?.data || []);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    init();
  }, []);

  const handleInputChange = (field, value) => {
    if (field === 'category') {
      const selectedCategory = projectCategories.find(cat => cat.name === value);
      setFormData(prev => ({ ...prev, category: value, categoryId: selectedCategory ? selectedCategory.id : null }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.title) return setError('Project title is required'), false;
      if (formData.title.length < 5 || formData.title.length > 100) return setError('Project title must be between 5 and 100 characters'), false;

      if (!formData.description) return setError('Project description is required'), false;
      if (formData.description.length < 10 || formData.description.length > 1000) return setError('Project description must be between 10 and 1000 characters'), false;

      if (!formData.category) return setError('Project category is required'), false;
    }
    if (step === 2) {
      if (!formData.goals) return setError('Please provide project goals'), false;
      if (formData.goals.length > 1000) return setError('Goals are too long (max 1000 characters)'), false;

      if (!formData.objectives) return setError('Please provide project objectives'), false;
      if (formData.objectives.length > 1000) return setError('Objectives are too long (max 1000 characters)'), false;

      if (formData.skillsRequired.length === 0) return setError('Add at least one technology requirement'), false;
    }
    if (step === 3) {
      const size = parseInt(formData.maxTeamSize);
      if (isNaN(size) || size < 1) return setError('Maximum team size is required and must be at least 1'), false; // Changed min to 1 based on backend @Min(1)
      if (size > 20) return setError('Team size must not exceed 20'), false;

      // Optional: Add validation for techStack if it's considered mandatory
      // if (formData.techStack.length === 0) return setError('Add at least one tech stack item'), false;
    }
    setError('');
    return true;
  };

  const toggleSkill = (skillName) => {
    setFormData(prev => {
      const exists = prev.skillsRequired.includes(skillName);
      if (exists) {
        return { ...prev, skillsRequired: prev.skillsRequired.filter(s => s !== skillName) };
      } else {
        return { ...prev, skillsRequired: [...prev.skillsRequired, skillName] };
      }
    });
  };

  const addTechStack = () => {
    if (techStackInput.trim() && !formData.techStack.includes(techStackInput.trim())) {
      setFormData(prev => ({ ...prev, techStack: [...prev.techStack, techStackInput.trim()] }));
      setTechStackInput('');
    }
  };

  const removeTechStack = (itemToRemove) => {
    setFormData(prev => ({ ...prev, techStack: prev.techStack.filter(item => item !== itemToRemove) }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        problemStatement: formData.problemStatement,
        categoryId: formData.categoryId, // Use categoryId for submission
        categoryName: formData.category, // Keep categoryName for display/backend if needed
        goals: formData.goals,
        objectives: formData.objectives,
        skills: formData.skillsRequired, // Backend expects 'skills'
        maxTeamSize: parseInt(formData.maxTeamSize),
        techStack: formData.techStack,
        githubRepo: formData.githubRepo,
        demoUrl: formData.demoUrl,
        expectedStartDate: formData.expectedStartDate || null,
        expectedEndDate: formData.expectedEndDate || null,
      };

      if (eventId) payload.eventId = parseInt(eventId);
      const res = await projectService.createProject(payload);
      const newProject = res?.data || res;
      setCreatedId(newProject.id);
      setShowSuccess(true);
      toast.success("Project core initialized successfully");
    } catch (err) {
      setError(err.message || "Failed to launch project");
    } finally {
      setLoading(false);
    }
  };

  const SuccessOverlay = ({ projectName, onComplete }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-slate-200 rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
          <Check className="text-white w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Project Launched!</h2>
        <p className="text-slate-500 mb-8 font-medium">"{projectName}" is now live.</p>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2 }} onAnimationComplete={onComplete} className="h-full bg-indigo-600" />
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row overflow-hidden relative">
      <AnimatePresence>{showSuccess && <SuccessOverlay projectName={formData.title} onComplete={() => navigate(`/projects/${createdId}/invite`)} />}</AnimatePresence>

      {/* --- SIDEBAR --- */}
      <div className="lg:w-2/5 bg-white border-r border-slate-200 p-8 lg:p-16 flex flex-col justify-between">
        <div>
          <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-400 hover:text-indigo-600 font-bold transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </button>
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className={`w-20 h-20 ${stepContent[currentStep].color} rounded-3xl flex items-center justify-center mb-8`}>{stepContent[currentStep].icon}</div>
              <h2 className="text-indigo-600 font-black tracking-widest uppercase text-xs mb-2">Step 0{currentStep}</h2>
              <h1 className="text-4xl font-black text-slate-900 mb-6 leading-tight">{stepContent[currentStep].subtitle}</h1>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">{stepContent[currentStep].description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex space-x-4 mt-12">
          {[1, 2, 3].map((s) => (<div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s <= currentStep ? 'w-12 bg-indigo-600' : 'w-6 bg-slate-200'}`} />))}
        </div>
      </div>

      {/* --- FORM SECTION --- */}
      <div className="lg:w-3/5 overflow-y-auto bg-white/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-8 py-16 lg:py-24">
          <ValidationAlert error={error} />

          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <form onSubmit={handleSubmit} className="space-y-8">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid gap-2">
                      <Label className="text-slate-900 font-bold">Project Title *</Label>
                      <Input placeholder="Enter title" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} className="h-14 rounded-2xl border-slate-200 bg-white text-slate-900" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-900 font-bold">Description *</Label>
                      <Textarea placeholder="Provide a detailed description of your project" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} className="min-h-[120px] rounded-2xl border-slate-200 bg-white text-slate-900" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-900 font-bold">Problem Statement *</Label>
                      <Textarea placeholder="What are you solving?" value={formData.problemStatement} onChange={e => handleInputChange('problemStatement', e.target.value)} className="min-h-[120px] rounded-2xl border-slate-200 bg-white text-slate-900" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-900 font-bold">Category *</Label>
                      <Select value={formData.category} onValueChange={(v) => v === 'create_new' ? setShowCategoryDialog(true) : handleInputChange('category', v)}>
                        <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-200 text-slate-900">
                          <SelectValue placeholder="Select Domain" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-xl">
                          {projectCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name} className="text-slate-900 hover:bg-slate-50">{cat.name}</SelectItem>
                          ))}
                          <SelectItem value="create_new" className="text-indigo-600 font-bold border-t border-slate-50">+ Add New Category</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid gap-2">
                      <Label className="text-slate-900 font-bold">Goals *</Label>
                      <Textarea placeholder="e.g. Build MVP, Design System..." value={formData.goals} onChange={e => handleInputChange('goals', e.target.value)} className="min-h-[120px] rounded-2xl border-slate-200 bg-white text-slate-900" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-900 font-bold">Objectives *</Label>
                      <Textarea placeholder="What specific outcomes do you aim to achieve?" value={formData.objectives} onChange={e => handleInputChange('objectives', e.target.value)} className="min-h-[120px] rounded-2xl border-slate-200 bg-white text-slate-900" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-900 font-bold">Required Technologies *</Label>
                      <div className="relative group mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
                        <Input placeholder="Search skills (e.g. React, Python...)" value={skillsSearch} onChange={e => setSkillsSearch(e.target.value)} className="h-14 rounded-2xl pl-12 bg-white border-slate-200 text-slate-900" />
                      </div>

                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        {staticSkills
                          .filter(s => s.name.toLowerCase().includes(skillsSearch.toLowerCase()))
                          .map(skill => (
                            <button
                              key={skill.name}
                              type="button"
                              onClick={() => toggleSkill(skill.name)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${formData.skillsRequired.includes(skill.name)
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                }`}
                            >
                              {skill.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-900 font-bold">Team Size *</Label>
                        <Input type="number" value={formData.maxTeamSize} onChange={e => handleInputChange('maxTeamSize', e.target.value)} className="h-14 rounded-2xl bg-white text-slate-900" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-900 font-bold">Expected Start Date</Label>
                        <div className="relative">
                          <Input
                            type="date"
                            value={formData.expectedStartDate}
                            onChange={e => handleInputChange('expectedStartDate', e.target.value)}
                            className="h-14 rounded-2xl bg-white border-slate-200 text-slate-900 block appearance-none pr-10"
                          />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-900 font-bold">Expected End Date</Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={formData.expectedEndDate}
                          onChange={e => handleInputChange('expectedEndDate', e.target.value)}
                          className="h-14 rounded-2xl bg-white border-slate-200 text-slate-900 block appearance-none pr-10"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-900 font-bold">Tech Stack</Label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a technology (e.g., React, Node.js)"
                          value={techStackInput}
                          onChange={e => setTechStackInput(e.target.value)}
                          onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); addTechStack(); } }}
                          className="h-14 rounded-2xl bg-white border-slate-200 text-slate-900 flex-grow"
                        />
                        <Button type="button" onClick={addTechStack} className="h-14 px-6 rounded-2xl font-bold bg-indigo-600 text-white hover:bg-indigo-700">
                          <PlusCircle className="mr-2" size={20} /> Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.techStack.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 font-medium text-sm px-3 py-1 rounded-full flex items-center">
                            {tech}
                            <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => removeTechStack(tech)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-900 font-bold">GitHub Repo</Label>
                      <Input placeholder="https://github.com/..." value={formData.githubRepo} onChange={e => handleInputChange('githubRepo', e.target.value)} className="h-14 rounded-2xl bg-white border-slate-200 text-slate-900" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-900 font-bold">Demo URL</Label>
                      <Input placeholder="https://your-demo.com" value={formData.demoUrl} onChange={e => handleInputChange('demoUrl', e.target.value)} className="h-14 rounded-2xl bg-white border-slate-200 text-slate-900" />
                    </div>
                  </div>
                )}

                <div className="pt-10 flex items-center justify-between">
                  {currentStep > 1 ? (
                    <Button type="button" variant="ghost" onClick={handleBack} className="text-slate-500 font-bold px-6 h-14 rounded-2xl">Back</Button>
                  ) : <div />}

                  <Button
                    type={currentStep === 3 ? "submit" : "button"}
                    disabled={loading}
                    onClick={currentStep < 3 ? handleNext : undefined}
                    className="h-14 px-10 rounded-2xl font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                  >
                    {loading ? "Syncing..." : currentStep === 3 ? "Publish" : "Continue"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* --- ADD CATEGORY DIALOG --- */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="rounded-3xl p-8 bg-white text-slate-900">
          <DialogHeader><DialogTitle className="text-2xl font-black">New Category</DialogTitle></DialogHeader>
          <div className="py-4"><Input placeholder="e.g. AI/ML" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="h-14 rounded-2xl border-slate-200 text-slate-900" /></div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!newCategoryName.trim()) return;
              try {
                const newCat = await projectService.createProjectCategory({ name: newCategoryName });
                setProjectCategories(prev => [...prev, newCat]);
                handleInputChange('category', newCat.name);
                setShowCategoryDialog(false);
                setNewCategoryName('');
              } catch (err) { toast.error("Creation failed"); }
            }} className="bg-indigo-600 text-white rounded-xl h-12 px-8">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
