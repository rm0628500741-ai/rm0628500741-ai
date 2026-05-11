import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, 
  Search, 
  Mail, 
  Globe, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Loader2,
  Copy,
  Check,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { findCompanyEmails } from '../services/aiService';
import { CompanyContact } from '../types';

interface CompanyEmailsProps {
  onBack: () => void;
}

const CompanyEmails = ({ onBack }: CompanyEmailsProps) => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompanyContact[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await findCompanyEmails(query, i18n.language);
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">{t('companyEmails.title')}</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">{t('companyEmails.title')}</h2>
          <p className="text-slate-500 mt-2 font-medium">{t('companyEmails.subtitle')}</p>
        </div>

        <form onSubmit={handleSearch} className="mb-12">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={24} />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('companyEmails.searchPlaceholder')}
              className="w-full pl-14 pr-40 py-5 bg-white border-0 rounded-3xl shadow-xl shadow-slate-100 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg"
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : t('companyEmails.findBtn')}
            </button>
          </div>
          
          <div className="mt-4 flex items-center gap-3 px-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">AI Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Suspected Scam</span>
            </div>
          </div>
        </form>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {results.map((company, index) => (
              <motion.div
                key={company.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-[2rem] p-6 shadow-sm border transition-all group overflow-hidden ${
                  company.verification?.badge === 'scam' 
                    ? 'border-rose-100 shadow-rose-50/30' 
                    : company.verification?.badge === 'warning'
                    ? 'border-amber-100'
                    : 'border-slate-100 hover:shadow-xl hover:shadow-blue-50/50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      company.verification?.badge === 'scam'
                        ? 'bg-rose-50 text-rose-500'
                        : company.verification?.badge === 'warning'
                        ? 'bg-amber-50 text-amber-500'
                        : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                    }`}>
                      <Building2 size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-900 leading-tight">{company.name}</h3>
                        {company.verification?.badge === 'verified' && (
                          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            <ShieldCheck size={12} />
                            {t('companyEmails.verification.verified')}
                          </div>
                        )}
                        {company.verification?.badge === 'warning' && (
                          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            <AlertTriangle size={12} />
                            {t('companyEmails.verification.unverified')}
                          </div>
                        )}
                        {company.verification?.badge === 'scam' && (
                          <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            <ShieldAlert size={12} />
                            {t('companyEmails.verification.scamAlert')}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-blue-600 text-sm font-bold mt-1 uppercase tracking-wider">{company.industry}</p>
                      <div className="flex items-center gap-3 mt-2 text-slate-400">
                        <span className="flex items-center gap-1.5 text-xs font-bold">
                          <MapPin size={14} /> {company.location}
                        </span>
                        <a 
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold hover:text-blue-600 transition-colors"
                        >
                          <Globe size={14} /> {company.website}
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[240px]">
                    <div className={`p-4 rounded-2xl flex items-center justify-between transition-colors ${
                      company.verification?.badge === 'scam'
                        ? 'bg-rose-50/50'
                        : 'bg-slate-50 group-hover:bg-blue-50'
                    }`}>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Mail size={18} className={company.verification?.badge === 'scam' ? 'text-rose-400' : 'text-slate-400'} />
                        <span className={`text-sm font-bold truncate ${
                          company.verification?.badge === 'scam' 
                            ? 'text-rose-900 blur-[2px] select-none' 
                            : 'text-slate-800'
                        }`}>
                          {company.email}
                        </span>
                      </div>
                      <button 
                        disabled={company.verification?.badge === 'scam'}
                        onClick={() => copyToClipboard(company.email, company.id)}
                        className={`p-2 rounded-xl transition-all ${
                          copiedId === company.id 
                            ? 'bg-emerald-500 text-white' 
                            : company.verification?.badge === 'scam'
                            ? 'cursor-not-allowed opacity-30 text-slate-400'
                            : 'hover:bg-white text-slate-400 hover:text-blue-600'
                        }`}
                      >
                        {copiedId === company.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>

                    <button 
                      onClick={() => setExpandedId(expandedId === company.id ? null : company.id)}
                      className={`flex items-center justify-between px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        expandedId === company.id 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Info size={14} />
                        TRUST SCORE: {company.verification?.score}%
                      </span>
                      {expandedId === company.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === company.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-6 pt-6 border-t border-slate-100"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t('companyEmails.verification.riskAnalysis')}</h4>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                            "{company.verification?.analysis}"
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {company.verification?.risks.map((risk, i) => (
                              <span key={i} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold border border-rose-100">
                                {risk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">SECURITY CHECKS</h4>
                          <div className="grid grid-cols-2 gap-3">
                             {[
                               { label: t('companyEmails.verification.professionalEmail'), checked: company.verification?.checks.professionalEmail },
                               { label: t('companyEmails.verification.realAddress'), checked: company.verification?.checks.addressReal },
                               { label: "Website Active", checked: company.verification?.checks.websiteExists },
                               { label: "Social Proof", checked: company.verification?.checks.socialPresence },
                             ].map((check, i) => (
                               <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                                 {check.checked ? (
                                   <CheckCircle size={14} className="text-emerald-500" />
                                 ) : (
                                   <AlertTriangle size={14} className="text-rose-400" />
                                 )}
                                 <span className="text-[10px] font-bold text-slate-500 truncate">{check.label}</span>
                               </div>
                             ))}
                             <div className="col-span-2 p-2 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{t('companyEmails.verification.domainAge')}</span>
                                <span className="text-[10px] font-black text-blue-600">{company.verification?.checks.domainAge}</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {!loading && results.length === 0 && query && (
             <div className="text-center py-20 px-8 bg-white rounded-[3rem] border border-dashed border-slate-200">
               <Building2 size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-400 font-bold">{t('companyEmails.noResults')}</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyEmails;
