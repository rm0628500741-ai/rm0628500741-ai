/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import './i18n';

// Components
import Splash from './components/Splash';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CRSForm from './pages/CRSForm';
import CVBuilder from './pages/CVBuilder';
import AdvancedServices from './pages/AdvancedServices';
import AIAssistant from './pages/AIAssistant';
import Consultation from './pages/Consultation';
import ProgramsList from './pages/ProgramsList';
import SmartApply from './pages/SmartApply';
import JobSearch from './pages/JobSearch';
import MyApplications from './pages/MyApplications';
import AdminDashboard from './pages/AdminDashboard';
import MyConsultations from './pages/MyConsultations';
import CompanyEmails from './pages/CompanyEmails';

export enum View {
  SPLASH = 'splash',
  AUTH = 'auth',
  DASHBOARD = 'dashboard',
  CRS_FORM = 'crs_form',
  CV_BUILDER = 'cv_builder',
  ADVANCED_SERVICES = 'advanced_services',
  AI_ASSISTANT = 'ai_assistant',
  CONSULTATION = 'consultation',
  PROGRAMS = 'programs',
  SMART_APPLY = 'smart_apply',
  JOB_SEARCH = 'job_search',
  MY_APPLICATIONS = 'my_applications',
  ADMIN_DASHBOARD = 'admin_dashboard',
  MY_CONSULTATIONS = 'my_consultations',
  COMPANY_EMAILS = 'company_emails'
}

function NavigationWrapper() {
  const { i18n } = useTranslation();
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>(View.SPLASH);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady && !loading) {
      setCurrentView(user ? View.DASHBOARD : View.AUTH);
    }
  }, [user, loading, isReady]);

  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  if (!isReady || loading) return <Splash />;

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans overflow-x-hidden selection:bg-blue-500/30" dir={dir}>
      <AnimatePresence mode="wait">
        {currentView === View.AUTH && !user && (
          <Login />
        )}
        {currentView === View.DASHBOARD && user && (
          <Dashboard onNavigate={setCurrentView} />
        )}
        {currentView === View.CRS_FORM && user && (
          <CRSForm onBack={() => setCurrentView(View.DASHBOARD)} onNavigate={setCurrentView} />
        )}
        {currentView === View.CV_BUILDER && user && (
          <CVBuilder onBack={() => setCurrentView(View.ADVANCED_SERVICES)} />
        )}
        {currentView === View.ADVANCED_SERVICES && user && (
          <AdvancedServices onNavigate={setCurrentView} onBack={() => setCurrentView(View.DASHBOARD)} />
        )}
        {currentView === View.AI_ASSISTANT && user && (
          <AIAssistant onBack={() => setCurrentView(View.ADVANCED_SERVICES)} />
        )}
        {currentView === View.CONSULTATION && user && (
          <Consultation onBack={() => setCurrentView(View.ADVANCED_SERVICES)} onNavigate={setCurrentView} />
        )}
        {currentView === View.PROGRAMS && user && (
          <ProgramsList onBack={() => setCurrentView(View.ADVANCED_SERVICES)} onNavigate={setCurrentView} />
        )}
        {currentView === View.SMART_APPLY && user && (
          <SmartApply onBack={() => setCurrentView(View.ADVANCED_SERVICES)} onNavigate={setCurrentView} />
        )}
        {currentView === View.JOB_SEARCH && user && (
          <JobSearch onBack={() => setCurrentView(View.ADVANCED_SERVICES)} onNavigate={setCurrentView} />
        )}
        {currentView === View.MY_APPLICATIONS && user && (
          <MyApplications onBack={() => setCurrentView(View.ADVANCED_SERVICES)} />
        )}
        {currentView === View.ADMIN_DASHBOARD && user && (
          <AdminDashboard onBack={() => setCurrentView(View.DASHBOARD)} />
        )}
        {currentView === View.MY_CONSULTATIONS && user && (
          <MyConsultations onBack={() => setCurrentView(View.CONSULTATION)} />
        )}
        {currentView === View.COMPANY_EMAILS && user && (
          <CompanyEmails onBack={() => setCurrentView(View.ADVANCED_SERVICES)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationWrapper />
    </AuthProvider>
  );
}


