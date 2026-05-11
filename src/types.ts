export interface CRSAnswers {
  fullName: string;
  age: number;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  residence: string;
  children: number;
  education: string;
  eca: boolean;
  specialty: string;
  currentJobTitle: string;
  lastJobTitle?: string;
  skills?: string[];
  hasReadyCV?: boolean;
  primaryGoal?: 'immigration' | 'work' | 'both';
  dailyDuties: string;
  experience: number;
  canadianExperience: boolean;
  canadianExperienceYears: number;
  englishTest: string;
  englishScores: { L: number; R: number; W: number; S: number };
  frenchTest: string;
  frenchScores: { L: number; R: number; W: number; S: number };
  jobOffer: boolean;
  jobOfferFullTime: boolean;
  jobOfferLMIA: boolean;
  province: string;
  salary: string;
  canadianStudy: boolean;
  canadianStudyYears: number;
  relativeInCanada: boolean;
  relativeType: string;
  funds: string;
  intent: string;
  jobType: string;
  spouseAge?: number;
  spouseEdu?: string;
  spouseLang?: number;
  spouseExp?: boolean;
}

export interface CRSAnalysisResult {
  score: number;
  probability: string;
  bestProgram: string;
  tips: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferredLanguage: 'ar' | 'fr' | 'en';
  cv_completed?: boolean;
  hasCV?: boolean;
  isAdmin?: boolean;
  profession?: string;
  lastJob?: string;
  skills?: string[];
  goal?: 'immigration' | 'work' | 'both';
  profileCompletion?: number;
}

export interface CVData {
  fullName: string;
  age: number;
  country: string;
  phone: string;
  email: string;
  educationLevel: string;
  certifications: string[];
  workExperience: string[];
  skills: string[];
  languages: string[];
  trainings: string[];
  linkedIn?: string;
  targetJob: string;
  targetCountry: string;
  cvLanguage: 'fr' | 'en' | 'ar';
  summary?: string;
  atsScore?: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  compatibility: number;
  helpsImmigration: boolean;
  needsLMIA: boolean;
  description: string;
  source: 'LinkedIn' | 'Indeed' | 'JobBank';
  postedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  status: 'sent' | 'viewed' | 'interview' | 'offer' | 'rejected';
  cvUrl?: string;
  coverLetterUrl?: string;
}

export interface Consultation {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  country: string;
  type: 'general' | 'study' | 'work' | 'express_entry' | 'pnp';
  message: string;
  status: 'pending' | 'accepted' | 'completed';
  createdAt: string;
  reply?: string;
  repliedAt?: string;
}

export interface VerificationStatus {
  score: number; // 0-100
  isVerified: boolean;
  badge: 'verified' | 'warning' | 'scam';
  risks: string[];
  checks: {
    domainAge?: string;
    websiteExists: boolean;
    professionalEmail: boolean;
    addressReal: boolean;
    socialPresence: boolean;
  };
  analysis: string;
}

export interface CompanyContact {
  id: string;
  name: string;
  industry: string;
  email: string;
  website: string;
  location: string;
  verification?: VerificationStatus;
}
