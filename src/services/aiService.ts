import { GoogleGenAI, Type } from "@google/genai";
import { CRSAnswers, CRSAnalysisResult, CVData, Job, CompanyContact } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeCRS = async (answers: CRSAnswers, lang: string): Promise<CRSAnalysisResult> => {
  const prompt = `Analyze the following comprehensive Canadian immigration profile (CRS) and provide expert evaluation in JSON format. 
  Language of response: ${lang}.
  
  Profile:
  ${JSON.stringify(answers, null, 2)}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Total CRS score estimate" },
          probability: { type: Type.STRING, description: "Admission probability percentage or qualitative estimate" },
          bestProgram: { type: Type.STRING, description: "Recommended immigration program" },
          tips: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Actionable tips to improve score"
          }
        },
        required: ["score", "probability", "bestProgram", "tips"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateCVContent = async (cvData: Partial<CVData>, lang: string): Promise<Partial<CVData>> => {
  const prompt = `You are a professional immigration CV expert. Based on the following data, generate a professional summary and optimize the skills and work experience for the target country: ${cvData.targetCountry || 'Canada'}.
  Response language: ${lang}.
  
  User Data:
  ${JSON.stringify(cvData)}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          workExperience: { type: Type.ARRAY, items: { type: Type.STRING } },
          atsScore: { type: Type.NUMBER }
        },
        required: ["summary", "skills", "workExperience", "atsScore"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const translateText = async (text: string, targetLang: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following to ${targetLang}: ${text}`,
  });
  return response.text || text;
};

export const findJobs = async (userProfile: CRSAnswers, lang: string): Promise<Job[]> => {
  const prompt = `As a Canadian Job Market Expert, find 5 highly realistic job opportunities for this profile:
  - Job Title: ${userProfile.currentJobTitle}
  - Experience: ${userProfile.experience} years
  - Specialty: ${userProfile.specialty}
  - Duties: ${userProfile.dailyDuties}
  - Language: English CLB ${userProfile.englishScores.L}, French CLB ${userProfile.frenchScores.L}
  - Target Province: ${userProfile.province}

  Return a JSON array of jobs. Each job must have:
  id (string), title (string), company (string), location (string), salary (string), 
  compatibility (number 0-100), helpsImmigration (boolean), needsLMIA (boolean),
  description (string), source (Choice of 'LinkedIn', 'Indeed', 'JobBank'), 
  postedAt (string, e.g. "2 days ago").
  
  Language: ${lang}.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
            salary: { type: Type.STRING },
            compatibility: { type: Type.NUMBER },
            helpsImmigration: { type: Type.BOOLEAN },
            needsLMIA: { type: Type.BOOLEAN },
            description: { type: Type.STRING },
            source: { type: Type.STRING },
            postedAt: { type: Type.STRING }
          },
          required: ["id", "title", "company", "location", "salary", "compatibility", "helpsImmigration", "needsLMIA", "description", "source", "postedAt"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const findCompanyEmails = async (query: string, lang: string): Promise<CompanyContact[]> => {
  const prompt = `Find 8 realistic Canadian companies related to "${query}". 
  Provide their name, industry, a plausible HR or general contact email, website, and location.
  
  CRITICAL: You must also perform a simulated "AI Verification" for each company.
  Return a "verification" object for each with:
  - score: 0 to 100
  - isVerified: boolean (true if score > 75)
  - badge: "verified" | "warning" | "scam"
  - risks: list of potential risks
  - checks: { domainAge, websiteExists, professionalEmail, addressReal, socialPresence }
  - analysis: a short reason for the trust score.
  
  Note: Make some companies look "verified" and 1 or 2 look "warning" or "scam" (e.g. gmail emails, missing website, suspicious name) for demonstration.
  
  Language: ${lang}.
  Return a JSON array.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            industry: { type: Type.STRING },
            email: { type: Type.STRING },
            website: { type: Type.STRING },
            location: { type: Type.STRING },
            verification: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                isVerified: { type: Type.BOOLEAN },
                badge: { type: Type.STRING, enum: ["verified", "warning", "scam"] },
                risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                checks: {
                  type: Type.OBJECT,
                  properties: {
                    domainAge: { type: Type.STRING },
                    websiteExists: { type: Type.BOOLEAN },
                    professionalEmail: { type: Type.BOOLEAN },
                    addressReal: { type: Type.BOOLEAN },
                    socialPresence: { type: Type.BOOLEAN }
                  }
                },
                analysis: { type: Type.STRING }
              }
            }
          },
          required: ["id", "name", "industry", "email", "website", "location", "verification"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};
