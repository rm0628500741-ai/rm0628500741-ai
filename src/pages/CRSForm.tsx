import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Send, RotateCcw, AlertTriangle, CheckCircle2, Trophy, Loader2, User, GraduationCap, Globe, Briefcase, Target, Users, DollarSign, ChevronRight, Sparkles } from 'lucide-react';
import { analyzeCRS } from '../services/aiService';
import { CRSAnswers, CRSAnalysisResult } from '../types';
import { View } from '../App';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useProfileUpdate } from '../hooks/useProfile';

interface CRSFormProps {
  onBack: () => void;
  onNavigate: (view: View) => void;
}

const CRSForm = ({ onBack, onNavigate }: CRSFormProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { updateProfile } = useProfileUpdate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<CRSAnswers>({
    fullName: '',
    age: 25,
    birthDate: '',
    gender: 'Male',
    maritalStatus: 'Single',
    nationality: '',
    residence: '',
    children: 0,
    education: 'Bachelor',
    eca: false,
    specialty: '',
    currentJobTitle: '',
    lastJobTitle: '',
    skills: [],
    hasReadyCV: false,
    primaryGoal: 'both',
    dailyDuties: '',
    experience: 2,
    canadianExperience: false,
    canadianExperienceYears: 0,
    englishTest: 'IELTS',
    englishScores: { L: 6, R: 6, W: 6, S: 6 },
    frenchTest: 'None',
    frenchScores: { L: 0, R: 0, W: 0, S: 0 },
    jobOffer: false,
    jobOfferFullTime: false,
    jobOfferLMIA: false,
    province: 'Any',
    salary: '',
    canadianStudy: false,
    canadianStudyYears: 0,
    relativeInCanada: false,
    relativeType: '',
    funds: '',
    intent: 'PR',
    jobType: '',
    spouseAge: 25,
    spouseEdu: 'Bachelor',
    spouseLang: 5,
    spouseExp: false
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CRSAnalysisResult | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await analyzeCRS(answers, i18n.language);
      setResult(res);

      // Save analysis for later use (e.g. Job Search)
      if (user) {
        await Promise.all([
          addDoc(collection(db, 'crs_analyses'), {
            uid: user.uid,
            answers: answers,
            result: res,
            createdAt: serverTimestamp()
          }),
          updateProfile({
            profession: answers.specialty,
            lastJob: answers.lastJobTitle,
            skills: answers.skills,
            goal: answers.primaryGoal,
            hasCV: answers.hasReadyCV,
            cv_completed: answers.hasReadyCV,
          })
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 1, title: t('crs.sections.personal'), icon: User },
    { id: 2, title: t('crs.sections.education'), icon: GraduationCap },
    { id: 3, title: t('crs.sections.language'), icon: Globe },
    { id: 4, title: t('crs.sections.work'), icon: Briefcase },
    { id: 5, title: t('crs.sections.offer'), icon: Target },
    ...(answers.maritalStatus === 'Married' ? [{ id: 6, title: t('crs.sections.spouse'), icon: Users }] : []),
    { id: 7, title: "Profile & Goals", icon: User },
    { id: 8, title: t('crs.sections.financial'), icon: DollarSign }
  ];

  const currentSectionId = sections[step - 1]?.id;

  const handleNext = () => {
    if (step < sections.length) setStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">{t('crs.title')}</h1>
          <div className="flex gap-2">
            {sections.map((_, i) => (
              <div key={i} className={`w-8 h-1 rounded-full transition-all ${step > i ? 'bg-blue-600' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 py-10">
        {!result ? (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                {(() => {
                  const Icon = sections[step - 1].icon;
                  return <Icon size={24} />;
                })()}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">{sections[step - 1].title}</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('dashboard.step')} {step} / {sections.length}</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSectionId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {currentSectionId === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.fields.fullName')}</label>
                      <input type="text" value={answers.fullName} onChange={e => setAnswers({...answers, fullName: e.target.value})} className="form-input-soft" placeholder="e.g. Ahmed..." />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.age')}</label>
                      <input type="number" value={answers.age} onChange={e => setAnswers({...answers, age: parseInt(e.target.value)})} className="form-input-soft" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.fields.birthDate')}</label>
                      <input type="date" value={answers.birthDate} onChange={e => setAnswers({...answers, birthDate: e.target.value})} className="form-input-soft" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.fields.gender')}</label>
                      <select value={answers.gender} onChange={e => setAnswers({...answers, gender: e.target.value})} className="form-input-soft">
                        <option value="Male">Male / ذكر</option>
                        <option value="Female">Female / أنثى</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.maritalStatus')}</label>
                      <select value={answers.maritalStatus} onChange={e => setAnswers({...answers, maritalStatus: e.target.value})} className="form-input-soft">
                        <option value="Single">Single / أعزب</option>
                        <option value="Married">Married / متزوج</option>
                        <option value="Divorced">Divorced / مطلق</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.fields.children')}</label>
                      <input type="number" value={answers.children} onChange={e => setAnswers({...answers, children: parseInt(e.target.value)})} className="form-input-soft" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.fields.nationality')}</label>
                      <input type="text" value={answers.nationality} onChange={e => setAnswers({...answers, nationality: e.target.value})} className="form-input-soft" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.fields.residence')}</label>
                      <input type="text" value={answers.residence} onChange={e => setAnswers({...answers, residence: e.target.value})} className="form-input-soft" />
                    </div>
                  </div>
                )}

                {currentSectionId === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.education')}</label>
                      <select value={answers.education} onChange={e => setAnswers({...answers, education: e.target.value})} className="form-input-soft">
                        <option value="High School">{t('crs.eduOptions.highSchool')}</option>
                        <option value="Bachelor">{t('crs.eduOptions.bachelor')}</option>
                        <option value="Master">{t('crs.eduOptions.master')}</option>
                        <option value="PhD">{t('crs.eduOptions.phd')}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.fields.specialty')}</label>
                      <input type="text" value={answers.specialty} onChange={e => setAnswers({...answers, specialty: e.target.value})} className="form-input-soft" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100" onClick={() => setAnswers({...answers, eca: !answers.eca})}>
                      <span className="text-sm font-semibold">{t('crs.fields.eca')}</span>
                      <div className={`w-12 h-6 rounded-full relative transition-all ${answers.eca ? 'bg-blue-600' : 'bg-slate-300'}`}>
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${answers.eca ? 'right-1' : 'left-1'}`} />
                      </div>
                    </div>
                  </div>
                )}

                {currentSectionId === 3 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                       <h3 className="font-bold text-slate-800">{t('crs.fields.englishTest')}</h3>
                       <div className="grid grid-cols-4 gap-2">
                          {['L', 'R', 'W', 'S'].map(s => (
                            <div key={s} className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-slate-400">{s}</label>
                              <input 
                                type="number" 
                                step="0.5"
                                value={answers.englishScores[s as keyof typeof answers.englishScores]} 
                                onChange={e => setAnswers({
                                  ...answers, 
                                  englishScores: { ...answers.englishScores, [s]: parseFloat(e.target.value) }
                                })}
                                className="form-input-soft text-center px-1"
                              />
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                       <h3 className="font-bold text-slate-800">{t('crs.fields.frenchTest')}</h3>
                       <select value={answers.frenchTest} onChange={e => setAnswers({...answers, frenchTest: e.target.value})} className="form-input-soft">
                          <option value="None">None</option>
                          <option value="TEF">TEF</option>
                          <option value="TCF">TCF</option>
                       </select>
                       {answers.frenchTest !== 'None' && (
                          <div className="grid grid-cols-4 gap-2">
                            {['L', 'R', 'W', 'S'].map(s => (
                              <div key={s} className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">{s}</label>
                                <input 
                                  type="number" 
                                  value={answers.frenchScores[s as keyof typeof answers.frenchScores]} 
                                  onChange={e => setAnswers({
                                    ...answers, 
                                    frenchScores: { ...answers.frenchScores, [s]: parseInt(e.target.value) }
                                  })}
                                  className="form-input-soft text-center px-1"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {currentSectionId === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.fields.jobTitle')}</label>
                      <input type="text" value={answers.currentJobTitle} onChange={e => setAnswers({...answers, currentJobTitle: e.target.value})} className="form-input-soft" placeholder="e.g. Software Engineer" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.fields.dailyDuties')}</label>
                      <textarea value={answers.dailyDuties} onChange={e => setAnswers({...answers, dailyDuties: e.target.value})} className="form-input-soft min-h-[100px]" placeholder="Briefly describe your tasks..." />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Last Job Title</label>
                      <input type="text" value={answers.lastJobTitle} onChange={e => setAnswers({...answers, lastJobTitle: e.target.value})} className="form-input-soft" placeholder="e.g. Sales Manager" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Skills (comma separated)</label>
                      <input 
                        type="text" 
                        value={answers.skills?.join(', ')} 
                        onChange={e => setAnswers({...answers, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                        className="form-input-soft" 
                        placeholder="e.g. React, Manager, French..." 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.experience')} (Foreign)</label>
                      <input type="number" value={answers.experience} onChange={e => setAnswers({...answers, experience: parseInt(e.target.value)})} className="form-input-soft" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100" onClick={() => setAnswers({...answers, canadianExperience: !answers.canadianExperience})}>
                      <span className="text-sm font-semibold">{t('crs.studyExperience')} (Work)</span>
                      <div className={`w-12 h-6 rounded-full relative transition-all ${answers.canadianExperience ? 'bg-blue-600' : 'bg-slate-300'}`}>
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${answers.canadianExperience ? 'right-1' : 'left-1'}`} />
                      </div>
                    </div>
                    {answers.canadianExperience && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.fields.canadianExp')}</label>
                        <input type="number" value={answers.canadianExperienceYears} onChange={e => setAnswers({...answers, canadianExperienceYears: parseInt(e.target.value)})} className="form-input-soft" />
                      </div>
                    )}
                  </div>
                )}

                {currentSectionId === 5 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100" onClick={() => setAnswers({...answers, jobOffer: !answers.jobOffer})}>
                      <span className="text-sm font-semibold">{t('crs.jobOffer')}</span>
                      <div className={`w-12 h-6 rounded-full relative transition-all ${answers.jobOffer ? 'bg-blue-600' : 'bg-slate-300'}`}>
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${answers.jobOffer ? 'right-1' : 'left-1'}`} />
                      </div>
                    </div>
                    {answers.jobOffer && (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100" onClick={() => setAnswers({...answers, jobOfferLMIA: !answers.jobOfferLMIA})}>
                          <span className="text-sm font-semibold">{t('crs.fields.lmia')}</span>
                          <div className={`w-12 h-6 rounded-full relative transition-all ${answers.jobOfferLMIA ? 'bg-blue-600' : 'bg-slate-300'}`}>
                             <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${answers.jobOfferLMIA ? 'right-1' : 'left-1'}`} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.fields.province')}</label>
                          <input type="text" value={answers.province} onChange={e => setAnswers({...answers, province: e.target.value})} className="form-input-soft" placeholder="e.g. Ontario" />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100" onClick={() => setAnswers({...answers, relativeInCanada: !answers.relativeInCanada})}>
                      <span className="text-sm font-semibold">{t('crs.relative')}</span>
                      <div className={`w-12 h-6 rounded-full relative transition-all ${answers.relativeInCanada ? 'bg-blue-600' : 'bg-slate-300'}`}>
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${answers.relativeInCanada ? 'right-1' : 'left-1'}`} />
                      </div>
                    </div>
                  </div>
                )}

                {currentSectionId === 6 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.age')} ({t('crs.sections.spouse')})</label>
                       <input type="number" value={answers.spouseAge} onChange={e => setAnswers({...answers, spouseAge: parseInt(e.target.value)})} className="form-input-soft" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.education')} ({t('crs.sections.spouse')})</label>
                       <select value={answers.spouseEdu} onChange={e => setAnswers({...answers, spouseEdu: e.target.value})} className="form-input-soft">
                          <option value="High School">{t('crs.eduOptions.highSchool')}</option>
                          <option value="Bachelor">{t('crs.eduOptions.bachelor')}</option>
                          <option value="Master">{t('crs.eduOptions.master')}</option>
                          <option value="PhD">{t('crs.eduOptions.phd')}</option>
                       </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100" onClick={() => setAnswers({...answers, spouseExp: !answers.spouseExp})}>
                      <span className="text-sm font-semibold">{t('crs.sections.work')} ({t('crs.sections.spouse')})</span>
                      <div className={`w-12 h-6 rounded-full relative transition-all ${answers.spouseExp ? 'bg-blue-600' : 'bg-slate-300'}`}>
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${answers.spouseExp ? 'right-1' : 'left-1'}`} />
                      </div>
                    </div>
                  </div>
                )}

                {currentSectionId === 7 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Primary Goal</label>
                      <select 
                        value={answers.primaryGoal} 
                        onChange={e => setAnswers({...answers, primaryGoal: e.target.value as any})} 
                        className="form-input-soft"
                      >
                        <option value="immigration">Immigration / الهجرة</option>
                        <option value="work">Work / العمل</option>
                        <option value="both">Both / الإثنان معاً</option>
                      </select>
                    </div>
                    
                    <div 
                      className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 border border-slate-200"
                      onClick={() => setAnswers({...answers, hasReadyCV: !answers.hasReadyCV})}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${answers.hasReadyCV ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                          <Sparkles size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">Do you have a ready CV?</p>
                          <p className="text-xs text-slate-500">Helping us match jobs better</p>
                        </div>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative transition-all ${answers.hasReadyCV ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${answers.hasReadyCV ? 'right-1' : 'left-1'}`} />
                      </div>
                    </div>
                  </div>
                )}

                {currentSectionId === 8 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.fields.funds')}</label>
                      <input type="text" value={answers.funds} onChange={e => setAnswers({...answers, funds: e.target.value})} className="form-input-soft" placeholder="e.g. 150,000 MAD" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.fields.intent')}</label>
                      <select value={answers.intent} onChange={e => setAnswers({...answers, intent: e.target.value})} className="form-input-soft">
                        <option value="Work">Study / الدراسة</option>
                        <option value="Work">Work / العمل</option>
                        <option value="PR">Immigration / الهجرة</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('crs.fields.jobType')}</label>
                      <input type="text" value={answers.jobType} onChange={e => setAnswers({...answers, jobType: e.target.value})} className="form-input-soft" placeholder="e.g. Engineering..." />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex gap-4">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200"
                >
                  <ChevronLeft size={20} />
                  {t('cv.back')}
                </button>
              )}
              {step < sections.length ? (
                <button
                  onClick={handleNext}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all group"
                >
                  {t('cv.continue')}
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  {loading ? t('crs.analyzing') : t('crs.analyze')}
                </button>
              )}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
             <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[3rem] p-12 text-white text-center shadow-2xl relative overflow-hidden">
               <div className="absolute top-[-50px] right-[-50px] opacity-10 rotate-12"><Sparkles size={200} /></div>
               <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-4 py-1 rounded-full mb-4 inline-block">{t('crs.score')}</span>
                  <div className="text-8xl font-black mb-4 tracking-tighter drop-shadow-xl">{result.score}</div>
                  <div className="flex justify-center gap-8 mt-8">
                     <div className="text-center">
                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">{t('crs.probability')}</div>
                        <div className="text-xl font-bold">{result.probability}</div>
                     </div>
                     <div className="w-px h-12 bg-white/20" />
                     <div className="text-center">
                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">{t('crs.bestProgram')}</div>
                        <div className="text-xl font-bold">{result.bestProgram}</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {result.tips.map((tip, i) => (
                 <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex gap-4 items-center group hover:border-blue-200 transition-colors">
                    <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                       <AlertTriangle size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-tight">{tip}</p>
                 </div>
               ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setResult(null)}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                {t('crs.retry')}
              </button>
              <button 
                onClick={() => onNavigate(View.ADVANCED_SERVICES)}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                {t('crs.advanced')}
              </button>
            </div>
          </motion.div>
        )}
      </main>

      <style>{`
        .form-input-soft {
          width: 100%;
          padding: 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 1.25rem;
          outline: none;
          transition: all 0.25s;
          font-weight: 600;
          font-size: 0.95rem;
        }
        .form-input-soft:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.08);
          background: white;
        }
      `}</style>
    </div>
  );
};

export default CRSForm;
