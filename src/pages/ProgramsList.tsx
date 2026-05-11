import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Info, ExternalLink, Globe, GraduationCap, Briefcase, Heart } from 'lucide-react';

import { View } from '../App';

interface ProgramsListProps {
  onBack: () => void;
  onNavigate: (view: View) => void;
}

const ProgramsList = ({ onBack, onNavigate }: ProgramsListProps) => {
  const { t } = useTranslation();

  const programs = [
    {
      title: t('programs.ee'),
      id: 'ee',
      tag: t('programs.eeTag'),
      desc: t('programs.eeDesc'),
      bg: 'bg-blue-600',
      icon: Briefcase,
      color: 'text-blue-600'
    },
    {
      title: t('programs.pnp'),
      id: 'pnp',
      tag: t('programs.pnpTag'),
      desc: t('programs.pnpDesc'),
      bg: 'bg-emerald-600',
      icon: Globe,
      color: 'text-emerald-600'
    },
    {
      title: t('programs.study'),
      id: 'study',
      tag: t('programs.studyTag'),
      desc: t('programs.studyDesc'),
      bg: 'bg-amber-600',
      icon: GraduationCap,
      color: 'text-amber-600'
    },
    {
      title: t('programs.family'),
      id: 'family',
      tag: t('programs.familyTag'),
      desc: t('programs.familyDesc'),
      bg: 'bg-rose-600',
      icon: Heart,
      color: 'text-rose-600'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">{t('programs.title')}</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-12 mt-4">
        {/* Featured Section */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
           <div className="relative z-10 max-w-lg">
              <h2 className="text-3xl font-black mb-4">{t('programs.heroTitle')}</h2>
              <p className="text-blue-100/80 mb-8 leading-relaxed">{t('programs.heroDesc')}</p>
              <button className="px-8 py-4 bg-white text-blue-900 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-xl">
                 {t('programs.guideBtn')}
                 <ExternalLink size={18} />
              </button>
           </div>
           <div className="absolute right-[-50px] bottom-[-50px] opacity-10 rotate-[-15deg]">
              <Globe size={300} />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {programs.map((p, idx) => (
             <motion.div
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
             >
                <div className="flex items-center justify-between mb-6">
                   <div className={`w-14 h-14 ${p.bg} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <p.icon size={28} />
                   </div>
                   <span className="px-4 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                      {p.tag}
                   </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{p.title}</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed line-clamp-3">{p.desc}</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   <button 
                     onClick={() => onNavigate(View.AI_ASSISTANT)}
                     className={`flex items-center gap-2 font-bold text-sm ${p.color} hover:underline`}
                   >
                      {t('programs.learnMore')}
                      <ExternalLink size={16} />
                   </button>
                   <Info size={18} className="text-slate-300" />
                </div>
             </motion.div>
           ))}
        </div>
      </main>
    </div>
  );
};

export default ProgramsList;
