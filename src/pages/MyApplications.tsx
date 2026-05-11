import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Briefcase, 
  Calendar,
  MessageSquare,
  Gift,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Application } from '../types';
import LanguageSelector from '../components/LanguageSelector';

interface MyApplicationsProps {
  onBack: () => void;
}

const MyApplications = ({ onBack }: MyApplicationsProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, 'applications'), 
        where('uid', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
      setApps(data);
    } catch (error) {
      console.error("Error fetching apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Clock className="text-blue-500" size={20} />;
      case 'viewed': return <Search className="text-amber-500" size={20} />;
      case 'interview': return <MessageSquare className="text-purple-500" size={20} />;
      case 'offer': return <Gift className="text-emerald-500" size={20} />;
      case 'rejected': return <XCircle className="text-rose-500" size={20} />;
      default: return <Clock size={20} />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'viewed': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'interview': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'offer': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft size={24} className="text-slate-600" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">{t('myApplications.title')}</h1>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t('myApplications.empty')}</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={app.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 shrink-0">
                    <Briefcase size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{app.jobTitle}</h3>
                    <p className="text-slate-500 font-medium text-sm">{app.company}</p>
                    <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                      <Clock size={12} /> {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                  <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 ${getStatusStyles(app.status)}`}>
                    {getStatusIcon(app.status)}
                    {t(`myApplications.status.${app.status}`)}
                  </div>
                  
                  <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-400">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyApplications;
