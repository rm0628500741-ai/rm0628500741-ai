import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, 
  MessageSquare, 
  User, 
  Mail, 
  Globe, 
  FileText, 
  Send, 
  CheckCircle, 
  Loader2,
  Clock
} from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { View } from '../App';
import { handleFirestoreError, OperationType } from '../utils/firebaseError';

interface ConsultationProps {
  onBack: () => void;
  onNavigate: (view: View) => void;
}

const Consultation = ({ onBack, onNavigate }: ConsultationProps) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: auth.currentUser?.email || '',
    country: '',
    type: 'general',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    const path = 'consultations';
    try {
      await addDoc(collection(db, 'consultations'), {
        ...formData,
        uid: auth.currentUser.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">{t('consultation.title')}</h1>
          <button 
            onClick={() => onNavigate(View.MY_CONSULTATIONS)}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
          >
            <Clock size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-100 border border-slate-100"
            >
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">{t('consultation.title')}</h2>
                <p className="text-slate-500 mt-2 font-medium">{t('consultation.subtitle')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      {t('consultation.fullName')}
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Mail size={16} className="text-slate-400" />
                      {t('consultation.email')}
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Globe size={16} className="text-slate-400" />
                      {t('consultation.country')}
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      placeholder="Morocco, Canada, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <FileText size={16} className="text-slate-400" />
                      {t('consultation.type')}
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold appearance-none"
                    >
                      <option value="general">{t('consultation.types.general')}</option>
                      <option value="study">{t('consultation.types.study')}</option>
                      <option value="work">{t('consultation.types.work')}</option>
                      <option value="express_entry">{t('consultation.types.express_entry')}</option>
                      <option value="pnp">{t('consultation.types.pnp')}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MessageSquare size={16} className="text-slate-400" />
                    {t('consultation.message')}
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none"
                    placeholder="..."
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={24} />
                      {t('consultation.submit')}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-slate-100 border border-slate-100 max-w-md mx-auto"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">{t('consultation.success')}</h2>
              <p className="text-slate-500 font-medium mb-8">
                {i18n.language === 'ar' 
                  ? 'سنتواصل معك عبر البريد الإلكتروني في غضون 24 ساعة.' 
                  : 'We will contact you via email within 24 hours.'}
              </p>
              <button
                onClick={onBack}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
              >
                {t('cv.back')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Consultation;
