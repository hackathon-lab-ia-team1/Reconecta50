import { jsPDF } from 'jspdf';
import type { CareerProfile, ResumeDraft } from '../types/career';

export function createResumePdf(profile: CareerProfile, resume: ResumeDraft) {
  if (!profile.fullName.trim() || !resume.summary.trim() || !resume.role.trim())
    throw new Error('Preencha seu nome e atualize o currículo antes de baixar o PDF.');
  const document = new jsPDF({ unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true });
  document.setProperties({
    title: `Currículo - ${profile.fullName}`,
    author: profile.fullName,
    creator: 'Reconecta 50+',
  });
  document.setLanguage('pt-BR');
  const margin = 20;
  const width = 170;
  const bottom = 275;
  let y = 25;
  function space(height: number) {
    if (y + height > bottom) {
      document.addPage();
      y = 25;
    }
  }
  function write(text: string, size = 12, bold = false) {
    document.setFont('helvetica', bold ? 'bold' : 'normal');
    document.setFontSize(size);
    document.setTextColor(30, 45, 42);
    const lines = document.splitTextToSize(
      text.replace(/\r\n?/g, '\n').replace(/[\u2010-\u2015]/g, '-'),
      width,
    ) as string[];
    const lineHeight = size * 0.3528 * 1.5;
    for (const line of lines) {
      space(lineHeight);
      document.text(line, margin, y);
      y += lineHeight;
    }
    y += 3;
  }
  function heading(text: string) {
    space(24);
    y += 4;
    write(text, 14, true);
  }
  write(profile.fullName.trim(), 22, true);
  if (profile.phone.trim()) write(profile.phone.trim());
  if (profile.email?.trim()) write(profile.email.trim());
  if (resume.additionalContacts?.trim()) write(resume.additionalContacts.trim());
  if (resume.targetRole?.trim()) {
    heading('Objetivo profissional');
    write(resume.targetRole.trim());
  }
  if (resume.education?.trim()) {
    heading('Formação e cursos');
    write(resume.education.trim());
  }
  if (resume.languages?.trim()) {
    heading('Idiomas');
    write(resume.languages.trim());
  }
  heading('Apresentação profissional');
  write(resume.summary.trim());
  heading('Experiência em destaque');
  write(resume.role.trim(), 13, true);
  const details = [resume.company.trim(), resume.period.trim()].filter(Boolean).join(' · ');
  if (details) write(details);
  if (resume.activities.trim()) write(resume.activities.trim());
  const skills = resume.skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
  if (skills.length) {
    heading('Habilidades');
    for (const skill of skills) write(`- ${skill}`);
  }
  const total = document.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    document.setPage(page);
    document.setFont('helvetica', 'normal');
    document.setFontSize(10);
    document.setTextColor(90);
    document.text(`${page} / ${total}`, 190, 286, { align: 'right' });
  }
  return document;
}

export async function downloadResumePdf(profile: CareerProfile, resume: ResumeDraft) {
  const name = profile.fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
    .toLowerCase();
  await createResumePdf(profile, resume).save(`curriculo-${name || 'reconecta50'}.pdf`, {
    returnPromise: true,
  });
}
