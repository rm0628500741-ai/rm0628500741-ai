import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, Sparkles, Building2, MapPin, Target, DollarSign, 
  Send, ExternalLink, LayoutDashboard, History, CheckCircle2, 
  Clock, Eye, MessageCircle, TrendingUp, ShieldCheck, Briefcase
} from 'lucide-react';
import { View } from '../App';

interface SmartApplyProps {
  onBack: () => void;
  onNavigate: (view: View) => void;
}

interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  probability: number;
  salary: string;
  visaType: string;
  sponsorship: boolean;
  tags: string[];
}

const SmartApply = ({ onBack, onNavigate }: SmartApplyProps) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'opps' | 'tracker'>('opps');
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [sentJobs, setSentJobs] = useState<string[]>([]);

  // Mock Jobs Data
  const jobs: Job[] = [
    { 
      id: '1', company: 'Google Cloud', role: 'Solutions Architect', 
      location: 'Toronto, Canada', probability: 85, salary: '140k - 180k',
      visaType: 'GTS (Global Talent Stream)', sponsorship: true,
      tags: ['Sponsorship', 'Relocation']
    },
    { 
      id: '2', company: 'Shopify', role: 'Senior Developer', 
      location: 'Ottawa / Remote', probability: 92, salary: '120k - 160k',
      visaType: 'Work Permit', sponsorship: true,
      tags: ['Work from Home', 'Equity']
    },
    { 
      id: '3', company: 'Morgan Stanley', role: 'Technical Lead', 
      location: 'Montreal, Canada', probability: 78, salary: '130k - 170k',
      visaType: 'LMIA Exempt', sponsorship: true,
      tags: ['Financial Services', 'Permanent Residency']
    },
    { 
      id: '4', company: 'Amazon', role: 'DevOps Manager', 
      location: 'Vancouver, Canada', probability: 70, salary: '150k - 190k',
      visaType: 'Express Entry PR', sponsorship: true,
      tags: ['Fast Track', 'Relocation']
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsAnalyzing(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleSmartApply = async (id: string) => {
    setApplyingId(id);
    // Simulate AI crafting and sending application
    await new Promise(resolve => setTimeout(resolve, 3000));
    setApplyingId(null);
    setSentJobs(prev => [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col font-sans">
      {/* Header - Glassmorphism */}
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/60 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-2xl transition-all">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                Smart Apply AI
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                {t('smartApply.tagline')}
              </p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab('opps')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'opps' ? 'bg-white text-blue-600 shadow-sm shadow-slate-200' : 'text-slate-500'}`}
            >
              <Target size={18} />
              {t('smartApply.tabOpportunities')}
            </button>
            <button 
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'tracker' ? 'bg-white text-blue-600 shadow-sm shadow-slate-200' : 'text-slate-500'}`}
            >
              <LayoutDashboard size={18} />
              {t('smartApply.tabTracker')}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section: AI Analysis Stats */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <Sparkles size={20} />
              </div>
              <h3 className="font-black text-slate-800">{t('smartApply.aiAnalysis')}</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-400">{t('smartApply.matchScore')}</span>
                  <span className="text-blue-600">94%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '94%' }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="text-xs font-black text-emerald-700 uppercase">Profile Verified</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">Your CV and CRS score meet 92% of Canadian GTS requirements.</p>
              </div>

              <div className="pt-4 border-t border-slate-50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Target Country</span>
                  <span className="font-bold">Canada 🇨🇦</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Recommended Visa</span>
                  <span className="font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg">GTS / ICT</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <h4 className="text-xl font-bold mb-2 z-10 relative">Upgrade to Premium</h4>
            <p className="text-indigo-100 text-xs mb-6 z-10 relative">Get direct access to priority hiring channels and premium recruitment partners.</p>
            <button 
              onClick={() => onNavigate(View.CONSULTATION)}
              className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-sm z-10 relative hover:scale-105 transition-transform"
            >
              EXPLORE PRO
            </button>
            <TrendingUp size={120} className="absolute bottom-[-20px] right-[-20px] opacity-10 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Center Section: Main Content */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {activeTab === 'opps' ? (
              <motion.div 
                key="opps"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-black text-slate-800">{t('smartApply.recJobs')}</h2>
                  <div className="flex gap-2">
                    {['Full Time', 'Sponsorship', 'Remote'].map(f => (
                      <span key={f} className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 shadow-sm cursor-pointer hover:border-blue-200 transition-colors">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <motion.div 
                      key={job.id}
                      layoutId={job.id}
                      className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
                    >
                      {/* Match Badge */}
                      <div className="absolute top-0 right-0 p-6">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black uppercase text-slate-400 mb-1">{t('smartApply.matchScore')}</span>
                          <span className="text-2xl font-black text-blue-600 leading-none">{job.probability}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform duration-500">
                          <Building2 size={32} />
                        </div>
                        <div>
                          <h3 className="font-black text-xl text-slate-800 leading-tight">{job.role}</h3>
                          <p className="text-blue-600 font-bold flex items-center gap-1">
                            {job.company}
                            {job.sponsorship && <Sparkles size={14} />}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-4 mb-8">
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin size={16} />
                          <span className="text-xs font-bold">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <DollarSign size={16} />
                          <span className="text-xs font-bold">{job.salary}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Briefcase size={16} />
                          <span className="text-xs font-bold">{job.visaType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <CheckCircle2 size={16} />
                          <span className="text-xs font-bold">12 Openings</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleSmartApply(job.id)}
                          disabled={applyingId !== null || sentJobs.includes(job.id)}
                          className={`flex-1 py-4 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
                            sentJobs.includes(job.id)
                              ? 'bg-emerald-50 text-emerald-600 shadow-emerald-50 pointer-events-none'
                              : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1'
                          }`}
                        >
                          {applyingId === job.id ? (
                            <Clock className="animate-spin" size={20} />
                          ) : sentJobs.includes(job.id) ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <Sparkles size={18} />
                          )}
                          {sentJobs.includes(job.id) ? t('smartApply.success') : t('smartApply.applySmart')}
                        </button>
                        <button className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-colors">
                          <ExternalLink size={20} />
                        </button>
                      </div>

                      {applyingId === job.id && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
                        >
                          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
                          <h4 className="font-black text-slate-800 text-lg mb-2">{t('smartApply.sending')}</h4>
                          <p className="text-xs text-slate-500 max-w-xs">{t('smartApply.analysisDesc')}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="tracker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Tracker Stats Header */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: t('smartApply.stats.sent'), val: '24', color: 'text-blue-600', icon: Send },
                    { label: t('smartApply.stats.viewed'), val: '18', color: 'text-amber-600', icon: Eye },
                    { label: t('smartApply.stats.interviews'), val: '3', color: 'text-purple-600', icon: MessageCircle },
                    { label: t('smartApply.stats.offers'), val: '1', color: 'text-emerald-600', icon: CheckCircle2 },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                      <div className={`p-3 rounded-2xl bg-slate-50 ${stat.color} mb-3`}>
                        <stat.icon size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-1">{stat.label}</span>
                      <span className={`text-2xl font-black ${stat.color}`}>{stat.val}</span>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
                  <h3 className="font-black text-slate-800 mb-8">{t('smartApply.tabTracker')}</h3>
                  <div className="space-y-8">
                    {[
                      { company: 'Google', status: 'Interview', date: '2 hours ago', icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
                      { company: 'Shopify', status: 'Viewed', date: 'Today, 10:30 AM', icon: Eye, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { company: 'Meta', status: 'Applied', date: 'Yesterday', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { company: 'Tesla', status: 'Rejected', date: '3 days ago', icon: Clock, color: 'text-slate-400', bg: 'bg-slate-50' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-6 relative">
                        {i !== 3 && <div className="absolute left-6 top-12 bottom-[-20px] w-0.5 bg-slate-100" />}
                        <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 z-10 shadow-sm`}>
                          <item.icon size={20} />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-slate-800">{item.company}</h4>
                            <span className="text-[10px] font-bold text-slate-400">{item.date}</span>
                          </div>
                          <p className={`text-xs font-black uppercase tracking-widest ${item.color}`}>{item.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Background Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none -z-10" />
    </div>
  );
};

export default SmartApply;
