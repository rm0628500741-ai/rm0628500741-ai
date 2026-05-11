import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Consultation } from '../types';

interface MyConsultationsProps {
  onBack: () => void;
}

const MyConsultations = ({ onBack }: MyConsultationsProps) => {
  const { t } = useTranslation();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'consultations'), 
      where('uid', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consultation));
      setConsultations(data);
      setLoading(false);
    }, (error) => {
      console.error("My consultations snapshot error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">{t('consultation.admin.allRequests')}</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6 md:p-8">
        <div className="space-y-6">
          {consultations.map((c) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={c.id}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    c.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                    c.status === 'accepted' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {c.status}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{t(`consultation.types.${c.type}`)}</h3>
                  <p className="text-slate-400 text-xs font-bold mt-1">
                    {c.createdAt ? new Date((c.createdAt as any).seconds * 1000).toLocaleString() : '...'}
                  </p>
                </div>
              </div>

              <p className="text-slate-600 text-sm italic border-l-2 border-slate-100 pl-4 mb-4">
                "{c.message}"
              </p>

              {c.reply ? (
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-50">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <MessageSquare size={16} />
                    <span className="text-xs font-black uppercase">{t('consultation.admin.reply')}</span>
                  </div>
                  <p className="text-slate-800 text-sm font-medium leading-relaxed">
                    {c.reply}
                  </p>
                  <p className="text-slate-400 text-[10px] font-bold mt-4">
                    Replied on {new Date(c.repliedAt!).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={16} />
                  <span className="text-xs font-bold">Waiting for expert response...</span>
                </div>
              )}
            </motion.div>
          ))}

          {consultations.length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">No consultation history yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyConsultations;
