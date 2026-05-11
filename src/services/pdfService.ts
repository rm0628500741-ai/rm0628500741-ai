import { jsPDF } from 'jspdf';
import { CVData } from '../types';

export const generatePDF = (data: CVData) => {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(30, 64, 175); // Blue-700
  doc.text(data.fullName.toUpperCase(), margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`${data.phone} | ${data.email}`, margin, y);
  y += 5;
  doc.text(`${data.country} | LinkedIn: ${data.linkedIn || 'N/A'}`, margin, y);
  y += 15;

  // Summary
  if (data.summary) {
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text('PROFESSIONAL SUMMARY', margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // Slate-600
    const summaryLines = doc.splitTextToSize(data.summary, 170);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 10;
  }

  // Experience
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('WORK EXPERIENCE', margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  data.workExperience.forEach((exp) => {
    const lines = doc.splitTextToSize(`• ${exp}`, 170);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 2;
  });
  y += 5;

  // Skills
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('SKILLS', margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const skillsText = data.skills.join(', ');
  const skillLines = doc.splitTextToSize(skillsText, 170);
  doc.text(skillLines, margin, y);
  y += skillLines.length * 5 + 10;

  // Education
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('EDUCATION & CERTIFICATIONS', margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`• ${data.educationLevel}`, margin, y);
  y += 7;
  data.certifications.forEach((cert) => {
    doc.text(`• ${cert}`, margin, y);
    y += 7;
  });

  doc.save(`CV_${data.fullName.replace(/\s+/g, '_')}.pdf`);
};
