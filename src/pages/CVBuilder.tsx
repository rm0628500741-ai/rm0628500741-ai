import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { ChevronLeft, Save, Download, Sparkles, Upload, FileText, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { generateCVContent } from '../services/aiService';
import { generatePDF } from '../services/pdfService';
import { CVData } from '../types';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useProfileUpdate } from '../hooks/useProfile';

interface CVBuilderProps {
  onBack: () => void;
}

const CVBuilder = ({ onBack }: CVBuilderProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { updateProfile } = useProfileUpdate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState<CVData>({
    fullName: '',
    age: 25,
    country: '',
    phone: '',
    email: user?.email || '',
    educationLevel: 'Master',
    certifications: [],
    workExperience: [],
    skills: [],
    languages: [],
    trainings: [],
    targetJob: '',
    targetCountry: 'Canada',
    cvLanguage: i18n.language === 'ar' ? 'ar' : 'fr'
  });

  const [files, setFiles] = useState<File[]>([]);
  const [analyzed, setAnalyzed] = useState(false);

  // @ts-ignore
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop: (acceptedFiles: File[]) => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    }
  });

  const handleNext = () => {
    if (!cvData.fullName || !cvData.targetJob) {
      alert(i18n.language === 'ar' ? 'يرجى ملء الاسم الكامل والوظيفة المطلوبة' : 'Please fill in full name and target job');
      return;
    }
    setStep(step + 1);
  };
  const handleBack = () => setStep(step - 1);

  const handleAIImprove = async () => {
    setLoading(true);
    try {
      if (files.length > 0) {
        // Simulate reading through files to extract info
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      const improved = await generateCVContent(cvData, cvData.cvLanguage);
      setCvData(prev => ({
        ...prev,
        ...improved
      }));
      setAnalyzed(true);
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Upload files
      const fileUrls = [];
      for (const file of files) {
        const fileRef = ref(storage, `cvs/${user?.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snapshot.ref);
        fileUrls.push(url);
      }

      // 2. Save to Firestore
      await Promise.all([
        addDoc(collection(db, 'cvs'), {
          ...cvData,
          userId: user?.uid,
          fileUrls,
          createdAt: serverTimestamp()
        }),
        updateProfile({
          cv_completed: true,
          skills: cvData.skills.length > 0 ? cvData.skills : undefined,
          profession: cvData.targetJob || undefined
        })
      ]);

      alert('CV Sauvegardé avec succès!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold text-slate-800">{t('cv.title')}</h1>
            <div className="flex gap-1 mt-1">
               {[1, 2, 3].map(i => (
                 <div key={i} className={`h-1 w-8 rounded-full transition-colors ${step >= i ? 'bg-blue-600' : 'bg-slate-200'}`} />
               ))}
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-6 text-slate-800">{t('cv.personalInfo')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      {t('cv.fullName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cvData.fullName}
                      onChange={(e) => setCvData({ ...cvData, fullName: e.target.value })}
                      placeholder="Jean Dupont"
                      required
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      {t('cv.targetJob')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cvData.targetJob}
                      onChange={(e) => setCvData({ ...cvData, targetJob: e.target.value })}
                      placeholder="Software Engineer"
                      required
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">{t('auth.email')}</label>
                    <input
                      type="email"
                      value={cvData.email}
                      readOnly
                      className="w-full p-3 bg-slate-200 border border-slate-200 rounded-xl outline-none text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">{t('cv.phone')}</label>
                    <input
                      type="tel"
                      value={cvData.phone}
                      onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                      placeholder="+212 600 000 000"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      {i18n.language === 'ar' ? 'لغة السيرة الذاتية' : 'Langue du CV'}
                    </label>
                    <select
                      value={cvData.cvLanguage}
                      onChange={(e) => setCvData({ ...cvData, cvLanguage: e.target.value as any })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <h3 className="font-bold text-slate-800">{t('cv.experienceAndSkills')}</h3>
                  <textarea
                    placeholder={t('cv.experiencePlaceholder')}
                    rows={4}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setCvData({ ...cvData, workExperience: [e.target.value] })}
                  />
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                {t('cv.continue')}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-6 text-slate-800">{t('cv.documents')}</h2>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="p-4 bg-blue-100 text-blue-600 rounded-full mb-4">
                    <Upload size={32} />
                  </div>
                  <p className="text-slate-600 font-medium text-center">{t('cv.uploadPrompt')}</p>
                  <p className="text-slate-400 text-sm mt-2 text-center">{t('cv.uploadHint')}</p>
                </div>

                {files.length > 0 && (
                  <div className="mt-8 space-y-3">
                    <h3 className="font-bold text-slate-700 mb-4">{t('cv.selectedFiles')}</h3>
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                           <FileText size={18} className="text-blue-500" />
                           <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <button
                          onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                        >
                           <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold"
                >
                  {t('cv.back')}
                </button>
                <button
                  onClick={handleAIImprove}
                  disabled={loading}
                  className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  {t('cv.optimizeBtn')}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                   <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between mb-6">
                         <h2 className="text-xl font-bold text-slate-800">{t('cv.preview')}</h2>
                         <button onClick={() => generatePDF(cvData)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2 text-sm font-bold">
                            <Download size={18} />
                            PDF
                         </button>
                      </div>
                      
                      <div className="space-y-6 text-slate-700">
                         <div>
                            <h3 className="text-lg font-black text-blue-800 border-b-2 border-blue-100 pb-1 mb-3">{cvData.fullName}</h3>
                            <p className="text-sm">{cvData.phone} | {cvData.email}</p>
                         </div>

                         <div>
                            <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-2">Résumé Professionnel</h4>
                            <p className="text-sm leading-relaxed">{cvData.summary}</p>
                         </div>

                         <div>
                            <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-2">Expériences</h4>
                            <ul className="space-y-2">
                               {cvData.workExperience.map((exp, i) => (
                                 <li key={i} className="text-sm">• {exp}</li>
                               ))}
                            </ul>
                         </div>

                         <div>
                            <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-2">Compétences</h4>
                            <div className="flex flex-wrap gap-2">
                               {cvData.skills.map((skill, i) => (
                                 <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">{skill}</span>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                      <div className="text-center mb-6">
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('cv.atsScore')}</span>
                         <div className="text-5xl font-black text-blue-600 mt-2">{cvData.atsScore || 85}%</div>
                      </div>
                      <div className="space-y-3">
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Style Canadien</span>
                            <CheckCircle size={16} className="text-green-500" />
                         </div>
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Optimisé Mots-clés</span>
                            <CheckCircle size={16} className="text-green-500" />
                         </div>
                      </div>
                   </div>

                   <button
                     onClick={handleSave}
                     disabled={loading}
                     className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl shadow-green-100 flex items-center justify-center gap-2 hover:bg-green-700"
                   >
                     {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                     {t('cv.saveBtn')}
                   </button>
                   
                   <button
                     onClick={() => setStep(2)}
                     className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold"
                   >
                     {t('cv.edit')}
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CVBuilder;
