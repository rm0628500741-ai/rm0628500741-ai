import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, 
  Sparkles, 
  MessageSquare, 
  Briefcase, 
  Search, 
  Building2, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  X,
  Target,
  FileText
} from 'lucide-react';
import { View } from '../App';
import LanguageSelector from '../components/LanguageSelector';

interface AdvancedServicesProps {
  onNavigate: (view: View) => void;
  onBack: () => void;
}

const AdvancedServices = ({ onNavigate, onBack }: AdvancedServicesProps) => {
  const { t } = useTranslation();
  const { profile, loading: authLoading } = useAuth();
  const [showLockModal, setShowLockModal] = useState(false);

  const cvCompleted = profile?.cv_completed || false;
  
  // Calculate profile completion
  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.profession) score += 20;
    if (profile.skills?.length) score += 20;
    if (profile.cv_completed) score += 40;
    if (profile.goal) score += 20;
    return score;
  };

  const completion = calculateCompletion();

  const services = [
    { 
      id: 'cv', 
      icon: FileText, 
      label: t('dashboard.cvBuilder'), 
      color: 'bg-emerald-500', 
      view: View.CV_BUILDER,
      locked: false 
    },
    { 
      id: 'jobs', 
      icon: Search, 
      label: t('dashboard.jobSearch'), 
      color: 'bg-blue-600', 
      view: View.JOB_SEARCH,
      locked: !cvCompleted 
    },
    { 
      id: 'emails', 
      icon: Building2, 
      label: t('dashboard.companyEmails'), 
      color: 'bg-indigo-600', 
      view: View.COMPANY_EMAILS,
      locked: !cvCompleted 
    },
    { 
      id: 'expert', 
      icon: MessageSquare, 
      label: t('dashboard.consultation'), 
      color: 'bg-amber-500', 
      view: View.CONSULTATION,
      locked: false 
    },
  ];

  const handleServiceClick = (service: typeof services[0]) => {
    if (service.locked) {
      setShowLockModal(true);
    } else {
      onNavigate(service.view);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans">
      <header className="bg-white/5 backdrop-blur-xl sticky top-0 z-20 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <button onClick={onBack} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 group">
            <ChevronLeft size={24} className="text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-2xl font-black tracking-tight text-white">{t('dashboard.advancedServices')}</h1>
          <LanguageSelector />
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12">
        {/* Profile Completion Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 rounded-[3rem] bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-white/10 backdrop-blur-3xl relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-32 h-32 shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="60" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle 
                    cx="64" cy="64" r="60" fill="transparent" 
                    stroke="url(#grad)" strokeWidth="8" 
                    strokeDasharray={377}
                    initial={{ strokeDashoffset: 377 }}
                    animate={{ strokeDashoffset: 377 - (377 * completion) / 100 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    strokeLinecap="round"
                    className="transition-all"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">{completion}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.completion')}</span>
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center md:justify-start gap-2">
                  <Sparkles className="text-blue-400" />
                  {t('dashboard.profileStatus')}
                </h2>
                <p className="text-slate-400 font-medium mb-6">Complete your profile to unlock all premium AI job matching services.</p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                   {[
                     { label: 'Profession', done: !!profile?.profession },
                     { label: 'Skills', done: !!profile?.skills?.length },
                     { label: 'Goal', done: !!profile?.goal },
                     { label: 'CV', done: !!profile?.cv_completed }
                   ].map((item) => (
                       <div key={item.label} className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-colors ${
                         item.done ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500'
                       }`}>
                         {item.done ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                         {item.label}
                       </div>
                   ))}
                </div>
              </div>
           </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, idx) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={service.locked ? { scale: 1.02 } : { y: -12, scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleServiceClick(service)}
              className={`relative overflow-hidden p-8 rounded-[3rem] border transition-all flex flex-col items-center gap-6 text-center group ${
                service.locked 
                  ? 'bg-white/[0.02] border-white/5 opacity-50 grayscale cursor-not-allowed' 
                  : 'bg-white/10 border-white/10 backdrop-blur-xl hover:bg-white/15 hover:border-white/20 shadow-2xl shadow-blue-900/20'
              }`}
            >
              <div className={`${service.color} w-24 h-24 rounded-[2rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform relative`}>
                <service.icon size={44} />
                {service.locked && (
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white border-2 border-white/10 shadow-lg">
                    <Lock size={18} className="text-amber-500" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <span className="font-black text-white text-xl block leading-tight">{service.label}</span>
                {service.locked ? (
                  <span className="text-[10px] font-black uppercase text-amber-500/80 tracking-[0.2em]">{t('dashboard.cvRequired')}</span>
                ) : (
                  <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">Ready to start</span>
                )}
              </div>
              
              {!service.locked && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {showLockModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[#1E293B] border border-white/10 rounded-[3rem] p-10 max-w-md w-full text-center relative shadow-3xl shadow-black/50"
              >
                <button 
                  onClick={() => setShowLockModal(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-amber-500/20 shadow-inner">
                  <Lock size={48} />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">{t('dashboard.cvRequired')}</h3>
                <p className="text-slate-400 font-medium mb-10 leading-relaxed text-lg">
                  {t('dashboard.cvRequiredDesc')}
                </p>
                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      setShowLockModal(false);
                      onNavigate(View.CV_BUILDER);
                    }}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-blue-900/40 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {t('dashboard.cvBuilder')}
                  </button>
                  <button 
                    onClick={() => setShowLockModal(false)}
                    className="w-full py-4 text-slate-400 font-bold hover:text-white transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdvancedServices;
