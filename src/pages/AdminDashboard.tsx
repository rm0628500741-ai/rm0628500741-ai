import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, 
  MessageSquare, 
  User, 
  Mail, 
  Globe, 
  Clock, 
  CheckCircle2, 
  Send,
  Loader2,
  Trash2,
  ChevronRight,
  Filter,
  CheckCircle,
  MoreVertical,
  RotateCcw,
  XCircle,
  Lock
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Consultation } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firebaseError';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth(); // Assuming useAuth provides the user object
  const [requests, setRequests] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Password Protection State
  const [emailInput, setEmailInput] = useState('');
  const [pwInput, setPwInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pwError, setPwError] = useState(false);
  const [loginStep, setLoginStep] = useState<'email' | 'password'>('email');

  // Email Gate Check
  const isAuthorizedEmail = user?.email === 'rm0628500741@gmail.com';

  useEffect(() => {
    if (!isUnlocked || !isAuthorizedEmail) return;
    const q = query(collection(db, 'consultations'), orderBy('createdAt', 'desc'));
    const path = 'consultations';
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consultation));
      setRequests(data);
      setLoading(false);
      setError(null);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setError(error.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'pending' | 'accepted' | 'completed') => {
    const path = `consultations/${id}`;
    try {
      await updateDoc(doc(db, 'consultations', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await updateDoc(doc(db, 'consultations', id), {
        reply: replyText,
        repliedAt: new Date().toISOString(),
        status: 'accepted'
      });
      setReplyText('');
      setSelectedId(null);
    } catch (error) {
      console.error("Send reply error:", error);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteDoc(doc(db, 'consultations', id));
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const selectedRequest = requests.find(r => r.id === selectedId);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginStep === 'email') {
      if (emailInput.toLowerCase() === 'rm0628500741@gmail.com') {
        if (user?.email === emailInput.toLowerCase()) {
          setLoginStep('password');
          setPwError(false);
        } else {
          // Current logged in user is not the one they typed
          setPwError(true);
        }
      } else {
        setPwError(true);
      }
      return;
    }

    if (pwInput === 'riahi@1972') {
      setIsUnlocked(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[4xl] p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-100 animate-float">
            <Lock size={40} />
          </div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Admin Panel</h2>
            <p className="text-slate-500 font-medium italic">
              {loginStep === 'email' ? 'Step 1: Identity Verification' : 'Step 2: Security Clearance'}
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-6">
            <AnimatePresence mode="wait">
              {loginStep === 'email' ? (
                <motion.div 
                  key="email-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                    Authorized Administrator Email
                  </label>
                  <input 
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (pwError) setPwError(false);
                    }}
                    placeholder="name@example.com"
                    className={`w-full p-5 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-slate-900 ${
                      pwError ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-500'
                    }`}
                    autoFocus
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="password-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                    Security Passcode
                  </label>
                  <input 
                    type="password"
                    value={pwInput}
                    onChange={(e) => {
                      setPwInput(e.target.value);
                      if (pwError) setPwError(false);
                    }}
                    placeholder="••••••••"
                    className={`w-full p-5 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-mono text-center text-2xl text-slate-900 ${
                      pwError ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-500'
                    }`}
                    autoComplete="off"
                    autoFocus
                  />
                  <button 
                    type="button" 
                    onClick={() => { setLoginStep('email'); setPwError(false); }}
                    className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline"
                  >
                    Change Email
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {pwError && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest leading-relaxed">
                  {loginStep === 'email' 
                    ? 'Unauthorized: This email does not have admin rights' 
                    : 'Access Denied: Incorrect Security Key'}
                </p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loginStep === 'email' ? !emailInput : !pwInput}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
            >
              {loginStep === 'email' ? 'Continue' : 'Verify & Enter'}
            </button>
            
            <button 
              type="button"
              onClick={onBack}
              className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={18} />
              Return to Public Space
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-3 hover:bg-slate-50 rounded-2xl transition-all border border-slate-100">
              <ChevronLeft size={24} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight">
                {t('consultation.admin.dashboard')}
              </h1>
              <p className="text-slate-400 text-sm font-medium">Manage user inquiries and consultation requests</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100">
               {requests.length} Requests
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* List Section */}
          <div className="lg:col-span-12">
            {error ? (
              <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-12 text-center">
                 <XCircle className="mx-auto text-red-500 mb-4" size={48} />
                 <h2 className="text-xl font-black text-red-900 mb-2">Access Denied</h2>
                 <p className="text-red-600 font-medium mb-6">{error}</p>
                 <button onClick={onBack} className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all">
                   Go Back
                 </button>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Filter size={18} className="text-slate-400" />
                    {t('consultation.admin.allRequests')}
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/30">
                        <th className="px-8 py-5">User</th>
                        <th className="px-8 py-5">Type</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5">Date</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <AnimatePresence>
                        {requests.map((r) => (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key={r.id}
                            className={`hover:bg-blue-50/30 transition-colors cursor-pointer group ${selectedId === r.id ? 'bg-blue-50/50' : ''}`}
                            onClick={() => setSelectedId(r.id)}
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                  {r.fullName?.[0]?.toUpperCase() || <User size={20} />}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{r.fullName}</p>
                                  <p className="text-xs text-slate-400 font-medium">{r.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-500">
                                {t(`consultation.types.${r.type}`)}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  r.status === 'pending' ? 'bg-amber-400 animate-pulse' : 
                                  r.status === 'accepted' ? 'bg-blue-500' : 'bg-emerald-500'
                                }`} />
                                <span className={`text-xs font-bold ${
                                  r.status === 'pending' ? 'text-amber-600' : 
                                  r.status === 'accepted' ? 'text-blue-600' : 'text-emerald-600'
                                }`}>
                                  {r.status.toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                              {r.createdAt ? new Date((r.createdAt as any).seconds * 1000).toLocaleDateString() : 'Just now'}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleUpdateStatus(r.id, 'completed'); }}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
                {requests.length === 0 && !loading && (
                  <div className="p-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <RotateCcw size={32} />
                    </div>
                    <p className="text-slate-400 font-bold">{t('consultation.admin.noRequests')}</p>
                    <p className="text-slate-300 text-xs mt-2 italic px-10">If you are expecting data, check if you have Admin permissions in Firestore.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Drawer / Detail View */}
      <AnimatePresence>
        {selectedId && selectedRequest && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full max-w-xl bg-white shadow-2xl z-50 p-8 md:p-12 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-12">
                <button onClick={() => setSelectedId(null)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all border border-slate-100">
                  <ChevronRight size={24} className="text-slate-600" />
                </button>
                <div className="flex items-center gap-3">
                   <select 
                     value={selectedRequest.status}
                     onChange={(e) => handleUpdateStatus(selectedRequest.id, e.target.value as any)}
                     className="bg-slate-50 border-0 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                   >
                     <option value="pending">PENDING</option>
                     <option value="accepted">ACCEPTED</option>
                     <option value="completed">COMPLETED</option>
                   </select>
                </div>
              </div>

              <div className="space-y-10">
                <div className="flex gap-6 items-start">
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-xl shadow-blue-200">
                    {selectedRequest.fullName[0]}
                  </div>
                  <div className="py-2">
                    <h2 className="text-3xl font-black text-slate-900">{selectedRequest.fullName}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-slate-500 font-bold flex items-center gap-2 text-sm">
                        <Mail size={16} /> {selectedRequest.email}
                      </p>
                      <p className="text-slate-500 font-bold flex items-center gap-2 text-sm">
                        <Globe size={16} /> {selectedRequest.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[2rem] p-8">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{t('consultation.message')}</h4>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {selectedRequest.message}
                  </p>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('consultation.admin.reply')}</h4>
                  {selectedRequest.reply && (
                    <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8 text-blue-900 font-medium relative">
                       <p>{selectedRequest.reply}</p>
                       <span className="absolute top-4 right-6 text-[10px] font-bold text-blue-400">
                         Replied on {new Date(selectedRequest.repliedAt!).toLocaleDateString()}
                       </span>
                    </div>
                  )}
                  
                  <div className="relative">
                    <textarea 
                      rows={6}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your response here..."
                      className="w-full bg-white border-2 border-slate-100 rounded-[2rem] p-8 focus:border-blue-500 outline-none transition-colors font-medium text-slate-800 shadow-sm"
                    />
                    <button
                      disabled={sending || !replyText.trim()}
                      onClick={() => handleSendReply(selectedId)}
                      className="absolute bottom-6 right-6 p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
