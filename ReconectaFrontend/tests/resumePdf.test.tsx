import { expect, it } from 'vitest';
import { createResumePdf } from '../src/features/career/services/resumePdfService';

const profile = {
  fullName: 'João da Conceição',
  phone: '85999999999',
  address: 'Endereço privado',
  birthDate: '1960-01-01',
};
const resume = {
  summary: 'Experiência em atendimento e organização.',
  role: 'Recepcionista',
  company: 'Clínica Acolher',
  period: '2018 a 2024',
  activities: 'Atendimento ao público.\nOrganização de agendamentos.',
  skills: 'Comunicação, Organização',
};

it('gera PDF A4 com texto e somente os dados previstos para o currículo', () => {
  const pdf = createResumePdf(
    { ...profile, email: 'joao@example.com' },
    {
      ...resume,
      education: 'Curso de Excel',
      languages: 'Inglês básico',
      targetRole: 'Atendimento',
      additionalContacts: 'linkedin.com/in/joao',
    },
  );
  expect(pdf.internal.pageSize.getWidth()).toBeCloseTo(210);
  expect(pdf.internal.pageSize.getHeight()).toBeCloseTo(297);
  const content = pdf.internal.pages.flat().join('\n');
  expect(content).toContain('Recepcionista');
  expect(content).toContain('85999999999');
  expect(content).toContain('joao@example.com');
  expect(content).toContain('Curso de Excel');
  expect(content).toContain('linkedin.com/in/joao');
  expect(content).not.toContain(profile.address);
  expect(content).not.toContain(profile.birthDate);
  expect(pdf.output('arraybuffer').byteLength).toBeGreaterThan(500);
});

it('pagina currículos longos sem posicionar linhas fora das margens', () => {
  const pdf = createResumePdf(profile, {
    ...resume,
    activities: 'Atendimento e organização de documentos. '.repeat(500),
  });
  expect(pdf.getNumberOfPages()).toBeGreaterThan(1);
  for (const page of (pdf.internal.pages as unknown as string[][]).slice(1)) {
    const content = page.join('\n');
    const positions = [...content.matchAll(/([\d.]+) ([\d.]+) Td/g)];
    for (const position of positions) {
      expect(Number(position[1])).toBeGreaterThanOrEqual(56);
      expect(Number(position[2])).toBeGreaterThanOrEqual(30);
      expect(Number(position[2])).toBeLessThanOrEqual(780);
    }
  }
});

it('recusa currículo incompleto antes de gerar o documento', () => {
  expect(() => createResumePdf({ ...profile, fullName: '' }, resume)).toThrow(/Preencha/);
  expect(() => createResumePdf(profile, { ...resume, role: '' })).toThrow(/Preencha/);
});
