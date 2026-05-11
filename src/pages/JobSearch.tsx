import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Sparkles, 
  Briefcase, 
  ChevronRight, 
  Globe, 
  Zap, 
  FileText, 
  Send,
  Loader2,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { View } from '../App';
import { Job, CRSAnswers } from '../types';
import { findJobs } from '../services/aiService';
import LanguageSelector from '../components/LanguageSelector';
import { handleFirestoreError, OperationType } from '../utils/firebaseError';

interface JobSearchProps {
  onBack: () => void;
  onNavigate: (view: View) => void;
}

const JobSearch = ({ onBack, onNavigate }: JobSearchProps) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<CRSAnswers | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, 'crs_analyses'), where('uid', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        // Last analysis
        const data = snapshot.docs[snapshot.docs.length - 1].data().answers;
        setProfile(data);
        handleSearch(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSearch = async (userProfile: CRSAnswers) => {
    setLoading(true);
    try {
      const data = await findJobs(userProfile, i18n.language);
      setJobs(data);
    } catch (error) {
      console.error("Search error:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job: Job) => {
    setApplying(job.id);
    const path = 'applications';
    try {
      // Simulate AI crafting CV/Letter
      await new Promise(resolve => setTimeout(resolve, 3000));

      if (auth.currentUser) {
        await addDoc(collection(db, 'applications'), {
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          uid: auth.currentUser.uid,
          status: 'sent',
          appliedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft size={24} className="text-slate-600" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">{t('jobSearch.title')}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate(View.MY_APPLICATIONS)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2 px-4 py-2 rounded-full hover:bg-blue-50 transition-colors"
            >
              <ArrowRight size={18} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
              {t('dashboard.myApplications')}
            </button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
        {!profile && !loading && (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('jobSearch.noJobs')}</h3>
            <button 
              onClick={() => onNavigate(View.CRS_FORM)}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all"
            >
              {t('dashboard.analyzeBtn')}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" size={32} />
            </div>
            <p className="text-slate-600 font-medium animate-pulse">{t('jobSearch.searching')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {jobs.map((job) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={job.id}
                  className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  {/* Source Badge */}
                  <div className="absolute top-0 right-0 px-6 py-2 bg-slate-50 border-bl border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 rounded-bl-3xl">
                    {job.source}
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Briefcase size={32} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                          {job.helpsImmigration && (
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                              <Zap size={12} /> {t('jobSearch.helpsImmigration')}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 font-medium flex items-center gap-2">
                          {job.company} • <MapPin size={14} /> {job.location}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-3 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('jobSearch.compatibility')}</p>
                          <p className="text-lg font-black text-blue-600">{job.compatibility}%</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('jobSearch.salary')}</p>
                          <p className="font-bold text-slate-700">{job.salary}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('jobSearch.needsLMIA')}</p>
                          <p className="font-bold text-slate-700">{job.needsLMIA ? 'Yes' : 'No'}</p>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="pt-4 flex flex-wrap gap-4 items-center">
                        <button 
                          onClick={() => handleApply(job)}
                          disabled={!!applying || success}
                          className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                        >
                          {applying === job.id ? (
                            <>
                              <Loader2 size={20} className="animate-spin" />
                              {t('jobSearch.generating')}
                            </>
                          ) : (
                            <>
                              <Zap size={20} className="text-orange-400 fill-orange-400" />
                              {t('jobSearch.applyAuto')}
                            </>
                          )}
                        </button>
                        <span className="text-xs font-medium text-slate-400">{job.postedAt}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sidebar Stats/Info */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200">
                <div className="p-3 bg-white/20 rounded-2xl w-fit mb-6">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4">AI Career Optimization</h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">
                  Our algorithm continuously scans LinkedIn, Indeed, and Job Bank to match your profile with Canadian employers offering visa sponsorship.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-blue-300" />
                    <span className="text-sm">Verified LMIA Assistance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-blue-300" />
                    <span className="text-sm">NOC/TEER 2021 Compliant</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-4">{t('jobSearch.applyAuto')}</h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Dynamic CV</p>
                      <p className="text-xs text-slate-500">Tailored to job description</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                      <Send size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Auto Submission</p>
                      <p className="text-xs text-slate-500">Directly to company portal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-full shadow-2xl shadow-emerald-500/40 font-bold flex items-center gap-3 z-50"
          >
            <CheckCircle2 size={24} />
            {t('jobSearch.success')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobSearch;
