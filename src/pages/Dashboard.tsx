import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { auth } from '../firebase';
import { LogOut, FileSearch, Sparkles, MessageSquare, Briefcase, Users, LayoutDashboard, ChevronRight, AlertCircle } from 'lucide-react';
import { View } from '../App';
import LanguageSelector from '../components/LanguageSelector';
import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const user = auth.currentUser;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans">
      <header className="bg-white/5 backdrop-blur-xl sticky top-0 z-10 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="text-white" size={22} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white hidden sm:block">{t('appName')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => auth.signOut()}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 text-slate-400 hover:text-red-400 group"
            >
              <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12 flex flex-col gap-12">
        {/* Welcome Banner */}
        <section className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
           <div className="relative bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 md:p-16 text-white overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 text-center md:text-left z-10">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6"
                >
                  AI Immigration Assistant
                </motion.span>
                <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none">
                  {i18n.language === 'ar' ? 'مرحباً' : 'Welcome back'},<br/>
                  <span className="text-blue-100">{user?.displayName?.split(' ')[0] || user?.email?.split('@')[0]}</span>
                </h2>
                <p className="text-blue-100/80 mb-10 text-lg font-medium max-w-md leading-relaxed">
                  {i18n.language === 'ar' 
                    ? 'ابدأ رحلة الهجرة الخاصة بك مع تحليلنا المتقدم بالذكاء الاصطناعي.' 
                    : 'Unlock your path to Canada with our advanced AI-powered CRS analysis.'}
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate(View.CRS_FORM)}
                  className="px-10 py-5 bg-white text-blue-700 rounded-[2rem] font-black text-xl shadow-2xl flex items-center gap-4 transition-all hover:bg-blue-50 group/btn"
                >
                  <FileSearch size={28} />
                  {t('dashboard.analyzeBtn')}
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
              
              <div className="relative w-full md:w-1/3 flex justify-center">
                 <div className="relative animate-float">
                    <div className="absolute inset-0 bg-white/20 blur-[80px] rounded-full scale-150"></div>
                    <div className="w-56 h-56 md:w-72 md:h-72 bg-white/10 backdrop-blur-3xl rounded-[4rem] border border-white/20 flex items-center justify-center p-8 relative overflow-hidden ring-1 ring-white/30">
                       <Sparkles size={120} className="text-white opacity-80" />
                       <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <footer className="py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">© 2026 {t('appName')} • Professional AI Suite</p>
          {(user?.email === 'rm0628500741@gmail.com' || profile?.isAdmin) && (
            <button 
              onClick={() => onNavigate(View.ADMIN_DASHBOARD)}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Users size={14} />
              Admin Dashboard
            </button>
          )}
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
