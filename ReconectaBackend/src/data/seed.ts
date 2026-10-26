import { db, initDatabase } from './db.js';
import type { CurriculoSalvoDraft } from '../controllers/curriculoController.js';

const DEFAULT_PASSWORD_HASH = '$2b$10$6oafC.ge4W7xS2Z9YFrfCOr5YIVIoEfpOvuo0Ahf1.hC9uJZA4oKW'; // senha1234

const SEED_USERS = [
  {
    id: 'demo-user-001',
    fullName: 'Maria da Silva',
    phone: '11999999999',
    cpf: '52998224725',
    birthDate: '1970-05-15',
    address: 'São Paulo - SP',
    passwordHash: DEFAULT_PASSWORD_HASH,
    passwordHint: 'Dica de teste da demonstração',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-heitor',
    fullName: 'Heitor Erick Pereira',
    phone: '8537531081',
    cpf: '95285007305',
    birthDate: '1973-10-16',
    address: 'Alameda Juscelino Kubstchek 738',
    passwordHash: DEFAULT_PASSWORD_HASH,
    passwordHint: 'Dica de teste da demonstração',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const SEED_CURRICULOS: Array<{ userId: string; draft: CurriculoSalvoDraft }> = [
  {
    userId: 'demo-user-001',
    draft: {
      summary:
        'Profissional com mais de 20 anos de experiência em atendimento ao cliente, recepção e rotinas administrativas. Reconhecida pela comunicação acolhedora, organização impecável e resolução ágil de demandas.',
      role: 'Assistente de Atendimento e Recepção Sênior',
      company: 'Clínica Vida Plena',
      period: '2014 - 2025',
      activities:
        'Atendimento presencial e telefônico humanizado, agendamento de consultas, organização de prontuários, controle de fluxo de caixa diário e orientação a pacientes e familiares.',
      skills:
        'Atendimento Humanizado, Recepção Executiva, Organização Administrativa, Comunicação Interpessoal, Resolução de Conflitos, Pacote Office',
      targetRole: 'Recepcionista / Assistente Administrativo',
      education: 'Ensino Médio Completo e Curso Técnico em Secretariado',
      languages: 'Português (Nativo)',
      additionalContacts: '(11) 99999-9999',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  },
  {
    userId: 'demo-heitor',
    draft: {
      summary:
        'Profissional experiente nas áreas de gestão operacional, logística, almoxarifado e atendimento comercial. Forte capacidade de liderança de equipes, controle de estoque e negociação com fornecedores.',
      role: 'Supervisor de Operações e Logística',
      company: 'Distribuidora Nordeste Ltda',
      period: '2012 - 2025',
      activities:
        'Coordenação de equipe de expedição e almoxarifado, conferência de notas fiscais, inventário periódico, atendimento a fornecedores e melhoria contínua nos prazos de entrega.',
      skills:
        'Gestão de Estoque, Logística e Almoxarifado, Liderança de Equipes, Negociação com Fornecedores, Atendimento Comercial, Controle de Qualidade',
      targetRole: 'Encarregado de Logística / Consultor Comercial',
      education: 'Ensino Médio Completo e Qualificação em Logística Empresarial',
      languages: 'Português (Nativo), Espanhol Básico',
      additionalContacts: '(85) 3753-1081',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  },
];

export function seedDatabase(): void {
  initDatabase();

  const insertUserStmt = db.prepare(`
    INSERT OR IGNORE INTO users (
      id, fullName, phone, cpf, birthDate, address, passwordHash, passwordHint, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const user of SEED_USERS) {
    insertUserStmt.run(
      user.id,
      user.fullName,
      user.phone,
      user.cpf,
      user.birthDate,
      user.address,
      user.passwordHash,
      user.passwordHint,
      user.createdAt
    );
  }

  const insertCurriculoStmt = db.prepare(`
    INSERT OR IGNORE INTO curriculos (userId, data, updatedAt)
    VALUES (?, ?, ?)
  `);

  for (const item of SEED_CURRICULOS) {
    const updatedAt = item.draft.updatedAt || '2026-01-01T00:00:00.000Z';
    insertCurriculoStmt.run(item.userId, JSON.stringify(item.draft), updatedAt);
  }
}
