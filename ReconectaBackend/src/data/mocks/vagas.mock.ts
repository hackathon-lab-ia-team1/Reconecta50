export interface Vaga {
  id: number;
  titulo: string;
  empresa: string;
  modelo: string;
  localizacao: string;
  descricao: string;
  requisitos: string[];
  beneficios: string[];
}

export type ApplicationTrackingMock =
  | { channel: 'email'; instructions: string; email?: string }
  | { channel: 'phone'; instructions: string; phone?: string; acceptsWhatsApp: boolean }
  | { channel: 'external'; instructions: string; platform: 'Gupy' | 'Indeed' | 'LinkedIn' };

export type JobApplicationChannelMock =
  | { channel: 'external'; url: string }
  | { channel: 'email'; email: string }
  | { channel: 'phone'; phone: string; instructions: string; acceptsWhatsApp?: boolean }
  | { channel: 'manual'; instructions: string };

export interface JobOpportunityMock {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: 'Presencial' | 'Híbrido' | 'Remoto';
  schedule: string;
  compensation: string;
  benefits: string[];
  description: string;
  requirements: string[];
  recruiter: { name: string; contact: string };
  tracking: ApplicationTrackingMock;
  application?: JobApplicationChannelMock;
  applicationUrl?: string;
  isDemo: boolean;
}

interface VagaSeed {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: 'Presencial' | 'Híbrido' | 'Remoto';
  schedule: string;
  compensation: string;
  benefits: string[];
  description: string;
  requirements: string[];
  recruiterName: string;
  phone: string;
  email: string;
}

const VAGAS_SEEDS: VagaSeed[] = [
  // --- 5 Vagas Originais Preservadas ---
  {
    id: 'vaga-farmamais-50',
    title: 'Assistente de Atendimento e Relacionamento',
    company: 'Rede FarmaMais (Programa 50+ Ativo)',
    location: 'São Paulo, SP · Centro / Paulista',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h às 17h',
    compensation: 'R$ 2.350 por mês',
    benefits: ['Vale-refeição', 'Plano de saúde', 'Desconto em medicamentos', 'Vale-transporte'],
    description:
      'Buscamos profissionais 50+ com maturidade e facilidade de lidar com pessoas para atendimento acolhedor ao cliente, recepção na loja e apoio no relacionamento diário.',
    requirements: ['Boa comunicação e escuta ativa', 'Empatia no atendimento', 'Pontualidade e organização'],
    recruiterName: 'Patrícia Almeida (RH Inclusão 50+)',
    phone: '11987654321',
    email: 'rh50mais@farmamais.com.br',
  },
  {
    id: 'vaga-clinica-bem-viver',
    title: 'Recepcionista de Clínica',
    company: 'Clínica Bem Viver',
    location: 'São Paulo, SP · Vila Mariana',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h às 17h',
    compensation: 'R$ 2.200 por mês',
    benefits: ['Vale-transporte', 'Vale-alimentação', 'Convênio médico e odontológico'],
    description:
      'Acolhimento humanizado de pacientes, confirmação e agendamento de consultas, atendimento telefônico e organização da recepção da clínica.',
    requirements: ['Simpatia e paciência com o público', 'Organização de rotina e agendas', 'Noções básicas de informática ou WhatsApp'],
    recruiterName: 'Dra. Helena Ribeiro · Gestão de Pessoas',
    phone: '11976543210',
    email: 'selecao@clinicabemviver.com.br',
  },
  {
    id: 'vaga-pao-de-acucar-gpa',
    title: 'Operador(a) de Caixa e Atendimento Sênior',
    company: 'Pão de Açúcar (Programa Maturidade GPA)',
    location: 'São Paulo, SP · Diversas unidades',
    workMode: 'Presencial',
    schedule: 'Meio período ou integral · escala 5x2',
    compensation: 'R$ 2.150 por mês',
    benefits: ['Vale-transporte', 'Refeitório no local', 'Plano de saúde', 'Desconto em compras'],
    description:
      'Atendimento consultivo e cordial aos clientes no caixa e nas seções da loja, orientação sobre produtos e apoio na organização do ambiente.',
    requirements: ['Gosto por lidar com pessoas', 'Trabalho em equipe', 'Comprometimento e pontualidade'],
    recruiterName: 'Carlos Eduardo · Recrutamento Sênior GPA',
    phone: '11965432109',
    email: 'maturidade@gpa.com.br',
  },
  {
    id: 'vaga-logicenter-estoque',
    title: 'Auxiliar de Expedição e Controle de Estoque',
    company: 'LogiCenter Distribuidora (Vaga Afirmativa 50+)',
    location: 'Guarulhos, SP · Centro Empresarial',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 07h30 às 16h30',
    compensation: 'R$ 2.400 por mês',
    benefits: ['Vale-transporte', 'Refeitório no local', 'Plano odontológico', 'Seguro de vida'],
    description:
      'Conferência de entrada e saída de mercadorias, verificação de notas fiscais simples, controle de inventário e organização do setor de expedição.',
    requirements: ['Atenção aos detalhes', 'Responsabilidade e organização', 'Vivência em comércio, almoxarifado ou operações'],
    recruiterName: 'Roberto Nascimento · Supervisão de RH',
    phone: '11954321098',
    email: 'rh@logicenter.com.br',
  },
  {
    id: 'vaga-conecta-saude-hibrido',
    title: 'Consultor(a) de Relacionamento e Ouvidoria de Saúde',
    company: 'Conecta Saúde Sênior',
    location: 'São Paulo, SP · Híbrido (3x em casa)',
    workMode: 'Híbrido',
    schedule: 'Segunda a sexta · 6h diárias',
    compensation: 'R$ 2.500 por mês',
    benefits: ['Auxílio home office', 'Vale-refeição', 'Plano de saúde', 'Horário reduzido'],
    description:
      'Relacionamento telefônico e por WhatsApp com beneficiários 50+, acolhimento de dúvidas, agendamento de exames e acompanhamento de solicitações de ouvidoria.',
    requirements: ['Clareza na comunicação', 'Maturidade emocional e escuta ativa', 'Familiaridade com WhatsApp e computador'],
    recruiterName: 'Fernanda Prado · Talentos 50+',
    phone: '11943210987',
    email: 'talentos@conectasaude.com.br',
  },

  // --- COMÉRCIO E VAREJO ---
  {
    id: 'vaga-varejo-operador-caixa-06',
    title: 'Operador(a) de Caixa',
    company: 'Supermercados Boa Praça (Selo Inclusão 50+)',
    location: 'Fortaleza, CE · Aldeota',
    workMode: 'Presencial',
    schedule: 'Segunda a sábado · turno manhã (07h às 15h20)',
    compensation: 'R$ 1.980 por mês',
    benefits: ['Vale-transporte', 'Cesta básica mensal', 'Plano de saúde', 'Refeição no local'],
    description:
      'Registro de mercadorias no caixa, recebimento em dinheiro, cartão e Pix, fechamento de caixa e atendimento gentil aos clientes do bairro.',
    requirements: ['Atenção com valores e troco', 'Cordialidade e paciência', 'Ensino fundamental ou médio'],
    recruiterName: 'Luciana Menezes · RH Boa Praça',
    phone: '85988112233',
    email: 'rh@boapraca.com.br',
  },
  {
    id: 'vaga-varejo-repositor-07',
    title: 'Repositor(a) de Mercadorias (Seções Leves)',
    company: 'Empório Sabor & Tradição',
    location: 'São Paulo, SP · Mooca',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h às 17h',
    compensation: 'R$ 2.050 por mês',
    benefits: ['Vale-transporte', 'Vale-alimentação R$ 450', 'Convênio médico', 'Desconto em produtos'],
    description:
      'Organização e reposição de produtos leves em prateleiras (mercearia fina, chás, biscoitos e matinais), verificação de datas de validade e precificação.',
    requirements: ['Organização e capricho visual', 'Atenção a prazos de validade', 'Trabalho em equipe'],
    recruiterName: 'Marcos Vinícius · Gestão de Loja',
    phone: '11988013344',
    email: 'selecao@emporiotradicao.com.br',
  },
  {
    id: 'vaga-varejo-atendente-balcao-08',
    title: 'Atendente de Balcão e Padaria',
    company: 'Padaria e Confeitaria Santa Clara',
    location: 'Belo Horizonte, MG · Savassi',
    workMode: 'Presencial',
    schedule: 'Escala 5x2 · das 08h às 16h20',
    compensation: 'R$ 2.000 por mês',
    benefits: ['Vale-transporte', 'Café da manhã e almoço no local', 'Plano odontológico', 'Bônus de assiduidade'],
    description:
      'Atendimento no balcão de pães, bolos e cafés, pesagem e embalagem de encomendas, mantendo a vitrine sempre organizada e acolhedora.',
    requirements: ['Simpatia e boa conversa com clientes', 'Cuidado com higiene de alimentos', 'Pontualidade'],
    recruiterName: 'Dona Marta · Administração Santa Clara',
    phone: '31987124455',
    email: 'contato@padariasantaclara.com.br',
  },
  {
    id: 'vaga-varejo-promotor-vendas-09',
    title: 'Promotor(a) de Vendas e Degustação',
    company: 'Alimentos Serra Dourada',
    location: 'Curitiba, PR · Centro e Batel',
    workMode: 'Presencial',
    schedule: 'Terça a sábado · das 09h às 17h',
    compensation: 'R$ 2.250 por mês',
    benefits: ['Auxílio deslocamento', 'Vale-refeição', 'Seguro de vida', 'Premiação por metas'],
    description:
      'Apresentação de queijos, cafés e produtos regionais para clientes em lojas parceiras, esclarecendo dúvidas sobre preparo e qualidade.',
    requirements: ['Facilidade de comunicação', 'Postura acolhedora e proativa', 'Gosto por atendimento ao público'],
    recruiterName: 'Renato Silveira · Comercial Sul',
    phone: '41986235566',
    email: 'rh@serradourada.com.br',
  },
  {
    id: 'vaga-varejo-fiscal-loja-10',
    title: 'Fiscal de Loja e Prevenção de Perdas',
    company: 'Lojas Casa & Conforto (Programa Experiência 50+)',
    location: 'Rio de Janeiro, RJ · Tijuca',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 09h às 18h',
    compensation: 'R$ 2.300 por mês',
    benefits: ['Vale-transporte', 'Vale-refeição', 'Plano de saúde', 'Convênio farmácia'],
    description:
      'Orientação cordial aos clientes na entrada e saída da loja, acompanhamento visual do salão de vendas, apoio na verificação de notas e organização do fluxo.',
    requirements: ['Postura serena e respeitosa', 'Atenção ao ambiente', 'Maturidade para lidar com imprevistos'],
    recruiterName: 'Cláudia Tavares · RH Casa & Conforto',
    phone: '21985346677',
    email: 'vagas50@casaeconforto.com.br',
  },
  {
    id: 'vaga-varejo-consultor-calcados-11',
    title: 'Consultor(a) de Vendas de Calçados Conforto',
    company: 'Passo Leve Calçados Anatômicos',
    location: 'Porto Alegre, RS · Moinhos de Vento',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 09h às 18h',
    compensation: 'R$ 2.450 por mês (fixo + comissão garantida)',
    benefits: ['Vale-transporte', 'Vale-refeição', 'Desconto de 40% na marca', 'Plano de saúde'],
    description:
      'Atendimento consultivo e sem pressa a clientes que buscam calçados ortopédicos e de conforto, auxiliando na escolha ideal do modelo e numeração.',
    requirements: ['Escuta atenta e paciência', 'Experiência prévia com vendas ou atendimento', 'Organização de estoque leve'],
    recruiterName: 'Simone Becker · Gerência de Pessoas',
    phone: '51984457788',
    email: 'rh@passoleve.com.br',
  },
  {
    id: 'vaga-varejo-atendente-livraria-12',
    title: 'Atendente de Livraria e Papelaria',
    company: 'Livraria Cultura Viva',
    location: 'Recife, PE · Boa Viagem',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 09h às 18h',
    compensation: 'R$ 2.100 por mês',
    benefits: ['Vale-transporte', 'Vale-refeição', 'Plano odontológico', 'Desconto em livros e papelaria'],
    description:
      'Apoio aos clientes na localização de livros e materiais escolares, consulta de catálogo no computador do balcão e embalagem para presente.',
    requirements: ['Gosto por leitura e atendimento', 'Organização e simpatia', 'Noções básicas de informática'],
    recruiterName: 'Gustavo Lira · RH Cultura Viva',
    phone: '81983568899',
    email: 'selecao@livrariaculturaviva.com.br',
  },

  // --- LOGÍSTICA E TRANSPORTES ---
  {
    id: 'vaga-logistica-motorista-leve-13',
    title: 'Motorista de Entregas Leves (Utilitário / Fiorino)',
    company: 'Expresso Cidade Limpa Logística',
    location: 'São Paulo, SP · Zona Sul',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h às 17h',
    compensation: 'R$ 2.750 por mês',
    benefits: ['Vale-refeição', 'Plano de saúde', 'Seguro de vida', 'Veículo da empresa'],
    description:
      'Realização de entregas urbanas de pequenos pacotes e documentos comerciais em rotas fixas diurnas, zelando pela direção defensiva e cordialidade na entrega.',
    requirements: ['CNH categoria B ativa e regular', 'Prática em direção defensiva', 'Pontualidade e responsabilidade'],
    recruiterName: 'Ademir Santos · Coordenação de Frota',
    phone: '11982679900',
    email: 'frota@expressocidadelimpa.com.br',
  },
  {
    id: 'vaga-logistica-conferente-14',
    title: 'Conferente de Carga e Notas Fiscais',
    company: 'TransBrasil Suprimentos',
    location: 'Campinas, SP · Distrito Industrial',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h às 17h',
    compensation: 'R$ 2.550 por mês',
    benefits: ['Fretado ou Vale-transporte', 'Refeitório no local', 'Plano médico e odontológico', 'PLR anual'],
    description:
      'Conferência quantitativa e qualitativa de pedidos recebidos e expedidos, checagem de códigos em romaneios e notas fiscais, sem movimentação de peso excessivo.',
    requirements: ['Atenção minuciosa a números e listas', 'Experiência com notas fiscais ou estoque', 'Organização'],
    recruiterName: 'Juliana Campos · RH Logística',
    phone: '19981780011',
    email: 'rh@transbrasilsuprimentos.com.br',
  },
  {
    id: 'vaga-logistica-almoxarifado-15',
    title: 'Auxiliar de Almoxarifado e Peças',
    company: 'Oficina Central & Autopeças Progresso',
    location: 'Fortaleza, CE · Maraponga',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h às 17h30',
    compensation: 'R$ 2.200 por mês',
    benefits: ['Vale-transporte', 'Vale-alimentação', 'Plano de saúde', 'Seguro de vida'],
    description:
      'Controle de retirada e devolução de ferramentas e autopeças leves no balcão interno, etiquetagem de prateleiras e registro simples no sistema.',
    requirements: ['Organização e método', 'Vivência em almoxarifado, oficina ou comércio', 'Confiabilidade'],
    recruiterName: 'Henrique Bastos · Gestão Operacional',
    phone: '85989012345',
    email: 'vagas@autopecasprogresso.com.br',
  },
  {
    id: 'vaga-logistica-motorista-executivo-16',
    title: 'Motorista de Transporte Corporativo / Clínico',
    company: 'Rede Saúde Integrada (Transporte de Equipes)',
    location: 'Salvador, BA · Caminho das Árvores',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 07h30 às 16h30',
    compensation: 'R$ 2.800 por mês',
    benefits: ['Vale-refeição', 'Plano de saúde completo', 'Plano odontológico', 'Auxílio combustível'],
    description:
      'Transporte diurno de médicos, enfermeiros e amostras laboratoriais entre unidades da rede em veículo sedã automático da empresa.',
    requirements: ['CNH B definitiva com EAR', 'Condução tranquila e prudente', 'Discrição e cordialidade'],
    recruiterName: 'Camila Rocha · RH Rede Saúde',
    phone: '71987651122',
    email: 'selecao@redesaudeintegrada.com.br',
  },
  {
    id: 'vaga-logistica-separador-pedidos-17',
    title: 'Auxiliar de Separação de Pedidos (E-commerce Leve)',
    company: 'Catálogo Bem-Estar & Casa',
    location: 'Barueri, SP · Alphaville',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h às 17h',
    compensation: 'R$ 2.180 por mês',
    benefits: ['Vale-transporte', 'Refeitório no local', 'Cesta básica', 'Convênio médico'],
    description:
      'Separação e embalagem cuidadosa de pedidos de perfumaria, papelaria e itens domésticos leves, colagem de etiquetas de envio e conferência de lista.',
    requirements: ['Cuidado no manuseio de produtos', 'Atenção a etiquetas e pedidos', 'Trabalho em equipe'],
    recruiterName: 'Sérgio Moraes · Operações Alphaville',
    phone: '11983452211',
    email: 'rh@catalogobemestar.com.br',
  },

  // --- SERVIÇOS GERAIS E PORTARIA ---
  {
    id: 'vaga-portaria-diurno-18',
    title: 'Porteiro(a) Diurno Residencial',
    company: 'Condomínio Jardim das Acácias',
    location: 'São Paulo, SP · Santana',
    workMode: 'Presencial',
    schedule: 'Escala 12x36 diurno · das 07h às 19h',
    compensation: 'R$ 2.380 por mês',
    benefits: ['Vale-transporte', 'Vale-refeição R$ 32/dia', 'Cesta básica', 'Assistência médica'],
    description:
      'Controle de acesso de moradores, visitantes e prestadores de serviço, recebimento e protocolo de encomendas e atendimento ao interfone com educação.',
    requirements: ['Postura cordial e atenta', 'Boa comunicação ao telefone e interfone', 'Pontualidade e responsabilidade'],
    recruiterName: 'Wagner Oliveira · Administradora Predial',
    phone: '11971234455',
    email: 'portaria@admjardimacacias.com.br',
  },
  {
    id: 'vaga-portaria-noturno-19',
    title: 'Porteiro(a) / Vigia Noturno Comercial',
    company: 'Centro Empresarial Paulista Sul',
    location: 'São Paulo, SP · Brooklin',
    workMode: 'Presencial',
    schedule: 'Escala 12x36 noturno · das 19h às 07h',
    compensation: 'R$ 2.680 por mês (já com adicional noturno)',
    benefits: ['Vale-transporte', 'Vale-alimentação', 'Plano de saúde', 'Seguro de vida'],
    description:
      'Acompanhamento da portaria e monitores de câmeras internas em edifício comercial fechado à noite, registro de ocorrências em livro de plantão.',
    requirements: ['Seriedade e atenção', 'Experiência prévia em portaria ou vigilância', 'Disponibilidade para plantão 12x36'],
    recruiterName: 'Ricardo Fontes · Segurança Patrimonial',
    phone: '11972345566',
    email: 'rh@paulistasul.com.br',
  },
  {
    id: 'vaga-servicos-controlador-acesso-20',
    title: 'Controlador(a) de Acesso e Recepção',
    company: 'Colégio e Faculdade Horizonte',
    location: 'Belo Horizonte, MG · Lourdes',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 07h30 às 16h30',
    compensation: 'R$ 2.150 por mês',
    benefits: ['Vale-transporte', 'Vale-refeição', 'Plano de saúde', 'Bolsa de estudos para familiares'],
    description:
      'Orientação de alunos, pais e visitantes na portaria principal da instituição, entrega de crachás de identificação e apoio informativo.',
    requirements: ['Trato acolhedor e respeitoso', 'Paciência e comunicação clara', 'Organização'],
    recruiterName: 'Profª. Beatriz Lemos · Gestão Escolar',
    phone: '31982346677',
    email: 'rh@colegiohorizonte.edu.br',
  },
  {
    id: 'vaga-servicos-zelador-predial-21',
    title: 'Zelador(a) Predial',
    company: 'Edifício Residencial Parque Imperial',
    location: 'Curitiba, PR · Água Verde',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta (08h às 17h) e sábado até 12h',
    compensation: 'R$ 2.780 por mês',
    benefits: ['Vale-transporte', 'Vale-alimentação R$ 550', 'Plano de saúde', 'Cesta básica'],
    description:
      'Supervisão da rotina de manutenção e limpeza do condomínio, acompanhamento de prestadores técnicos (elevadores, bombas, jardinagem) e atendimento ao síndico.',
    requirements: ['Noções básicas de manutenção predial', 'Liderança serena e organização', 'Experiência em condomínios ou facilities'],
    recruiterName: 'Paulo Roberto · Síndico Profissional',
    phone: '41984567788',
    email: 'zeladoria@parqueimperial.com.br',
  },
  {
    id: 'vaga-servicos-limpeza-conservacao-22',
    title: 'Auxiliar de Limpeza e Conservação (Escritório)',
    company: 'Instituto Cultural & Biblioteca Central',
    location: 'Rio de Janeiro, RJ · Centro',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h às 17h',
    compensation: 'R$ 1.950 por mês',
    benefits: ['Vale-transporte', 'Vale-refeição', 'Cesta básica', 'Assistência médica e odontológica'],
    description:
      'Conservação e higienização de salas administrativas, biblioteca e recepção em ambiente tranquilo e climatizado, sem limpeza pesada.',
    requirements: ['Capricho e zelo pelo ambiente', 'Pontualidade e discrição', 'Trabalho em equipe'],
    recruiterName: 'Vânia Cardoso · Administração Cultural',
    phone: '21986788899',
    email: 'rh@institutoculturalrj.org.br',
  },
  {
    id: 'vaga-servicos-copa-cozinha-23',
    title: 'Auxiliar de Copa e Atendimento de Reuniões',
    company: 'Advocacia & Associados Martins',
    location: 'São Paulo, SP · Itaim Bibi',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h30 às 17h30',
    compensation: 'R$ 2.120 por mês',
    benefits: ['Vale-transporte', 'Vale-refeição R$ 38/dia', 'Plano de saúde Bradesco', 'Seguro de vida'],
    description:
      'Preparo e organização de cafés, chás e águas para salas de reunião, controle de suprimentos da copa e recepção cordial de clientes do escritório.',
    requirements: ['Apresentação cuidadosa e simpatia', 'Organização e higiene', 'Vivência em copa, hotelaria ou atendimento'],
    recruiterName: 'Mariana Esteves · RH Escritório',
    phone: '11984123344',
    email: 'rh@martinsadvocacia.com.br',
  },

  // --- ADMINISTRATIVO E APOIO ---
  {
    id: 'vaga-adm-auxiliar-escritorio-24',
    title: 'Auxiliar de Escritório e Rotinas Administrativas',
    company: 'Contabilidade Confiança Sênior',
    location: 'Fortaleza, CE · Centro',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h às 17h',
    compensation: 'R$ 2.250 por mês',
    benefits: ['Vale-transporte', 'Vale-refeição', 'Plano de saúde', 'Dia de folga no aniversário'],
    description:
      'Organização de pastas e documentos fiscais, atendimento telefônico a clientes, envio de malotes e preenchimento de planilhas simples.',
    requirements: ['Organização e atenção a documentos', 'Boa escrita e comunicação', 'Noções básicas de computador'],
    recruiterName: 'Contadora Eliane Mota · Sócia de RH',
    phone: '85987654311',
    email: 'rh@contabilidadeconfianca.com.br',
  },
  {
    id: 'vaga-adm-conciliador-arquivos-25',
    title: 'Conciliador(a) de Arquivos e Documentação',
    company: 'Cartório e Registro Civil 3º Ofício',
    location: 'São Paulo, SP · Liberdade',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 09h às 17h30',
    compensation: 'R$ 2.480 por mês',
    benefits: ['Vale-transporte', 'Vale-refeição R$ 40/dia', 'Plano de saúde', 'Auxílio óculos'],
    description:
      'Conferência de certidões, catalogação de livros e arquivos físicos e digitais, verificação de assinaturas e apoio à equipe de atendimento.',
    requirements: ['Concentração e leitura atenta', 'Caligrafia legível e organização', 'Ensino médio completo'],
    recruiterName: 'Dr. Otávio Vasconcelos · Gestão Cartorial',
    phone: '11985231122',
    email: 'selecao@terceirooficiolib.com.br',
  },
  {
    id: 'vaga-adm-apoio-senior-26',
    title: 'Assistente de Apoio Administrativo Sênior',
    company: 'Associação Comercial & Empresarial',
    location: 'Campinas, SP · Centro',
    workMode: 'Híbrido',
    schedule: 'Segunda a sexta · das 08h30 às 17h30',
    compensation: 'R$ 2.650 por mês',
    benefits: ['Vale-transporte', 'Vale-refeição', 'Plano médico e odontológico', 'Auxílio home office'],
    description:
      'Apoio à diretoria no controle de agendas, reserva de auditórios, elaboração de comunicados aos associados e acompanhamento de contratos de fornecedores.',
    requirements: ['Experiência em rotinas de escritório ou secretariado', 'Comunicação formal e cordial', 'Domínio básico de Word e Excel'],
    recruiterName: 'Cristina Pacheco · Recursos Humanos',
    phone: '19983112233',
    email: 'rh@associacaocomercialcps.org.br',
  },
  {
    id: 'vaga-adm-faturamento-contas-27',
    title: 'Auxiliar de Contas a Pagar e Faturamento',
    company: 'Distribuidora Médica VidaNova',
    location: 'Porto Alegre, RS · São Geraldo',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h às 17h',
    compensation: 'R$ 2.520 por mês',
    benefits: ['Vale-transporte', 'Vale-refeição', 'Plano de saúde Unimed', 'Seguro de vida'],
    description:
      'Conferência de boletos e notas fiscais de fornecedores, baixa de pagamentos no sistema, emissão de segundas vias e arquivo financeiro.',
    requirements: ['Vivência na área financeira, bancária ou administrativa', 'Responsabilidade e sigilo', 'Facilidade com números'],
    recruiterName: 'Leandro Kroeff · Financeiro & RH',
    phone: '51982223344',
    email: 'rh@vidanovamed.com.br',
  },
  {
    id: 'vaga-adm-recepcao-consultorio-28',
    title: 'Secretária(o) de Consultório Odontológico',
    company: 'OdontoSorriso Sênior',
    location: 'Brasília, DF · Asa Sul',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h às 17h',
    compensation: 'R$ 2.180 por mês',
    benefits: ['Vale-transporte', 'Vale-alimentação', 'Tratamento odontológico gratuito', 'Plano de saúde'],
    description:
      'Recepção acolhedora de pacientes, confirmação de horários por WhatsApp, organização de fichas clínicas e recebimento de mensalidades.',
    requirements: ['Atendimento empático e tranquilo', 'Uso diário de WhatsApp', 'Organização de agenda'],
    recruiterName: 'Dra. Clarice Nogueira · Diretora Clínica',
    phone: '61984334455',
    email: 'contato@odontosorrisodf.com.br',
  },
  {
    id: 'vaga-adm-compras-suprimentos-29',
    title: 'Auxiliar de Compras e Cotação de Suprimentos',
    company: 'Rede Hotelaria Sol Nascente',
    location: 'Natal, RN · Ponta Negra',
    workMode: 'Híbrido',
    schedule: 'Segunda a sexta · das 08h às 17h',
    compensation: 'R$ 2.420 por mês',
    benefits: ['Vale-transporte', 'Refeição no hotel', 'Plano de saúde', 'Bônus semestral'],
    description:
      'Cotação de preços por telefone e WhatsApp com fornecedores de alimentos, limpeza e escritório, registro de pedidos de compra e acompanhamento de prazos.',
    requirements: ['Boa capacidade de negociação', 'Organização com planilhas e prazos', 'Vivência comercial ou administrativa'],
    recruiterName: 'Fábio Dantas · Suprimentos & RH',
    phone: '84987665544',
    email: 'rh@hotelsolnascente.com.br',
  },

  // --- SAÚDE E CUIDADOS ---
  {
    id: 'vaga-saude-atendente-farmacia-30',
    title: 'Atendente de Farmácia e Perfumaria 50+',
    company: 'Drogaria Saúde & Vida (Programa Gerações)',
    location: 'São Paulo, SP · Tatuapé',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h às 17h',
    compensation: 'R$ 2.280 por mês',
    benefits: ['Vale-transporte', 'Vale-refeição', 'Convênio médico', 'Desconto em farmácia'],
    description:
      'Recepção de clientes na loja, apoio na localização de itens de higiene, dermocosméticos e vitaminas, e encaminhamento de receitas ao farmacêutico.',
    requirements: ['Escuta acolhedora com clientes idosos e famílias', 'Organização de gôndolas leves', 'Ensino médio completo'],
    recruiterName: 'Tatiane Borges · RH Drogaria Saúde & Vida',
    phone: '11986554433',
    email: 'geracoes@drogariasaudevida.com.br',
  },
  {
    id: 'vaga-saude-cuidador-idosos-31',
    title: 'Cuidador(a) e Acompanhante de Idosos (Diurno)',
    company: 'Residencial Sênior Jardim Florido',
    location: 'São Paulo, SP · Perdizes',
    workMode: 'Presencial',
    schedule: 'Escala 12x36 diurno · das 07h às 19h',
    compensation: 'R$ 2.600 por mês',
    benefits: ['Vale-transporte', 'Três refeições no local', 'Plano de saúde', 'Adicional de incentivo'],
    description:
      'Acompanhamento afetuoso de residentes autônomos e semidependentes em atividades recreativas, caminhadas no jardim, horários de alimentação e medicação oral.',
    requirements: ['Vocação para o cuidado e paciência', 'Curso de cuidador ou experiência comprovada', 'Empatia e responsabilidade'],
    recruiterName: 'Enfª. Solange Paiva · Coordenação de Cuidado',
    phone: '11987443322',
    email: 'rh@residencialjardimflorido.com.br',
  },
  {
    id: 'vaga-saude-recepcao-hospitalar-32',
    title: 'Apoio de Recepção e Orientação Hospitalar (Posso Ajudar)',
    company: 'Hospital Santa Helena (Programa Acolher 50+)',
    location: 'Goiânia, GO · Setor Bueno',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · 6h diárias (manhã ou tarde)',
    compensation: 'R$ 2.150 por mês',
    benefits: ['Vale-transporte', 'Refeitório no hospital', 'Plano de saúde e odontológico', 'Seguro de vida'],
    description:
      'Acolhimento humanizado no saguão principal do hospital, orientando pacientes e acompanhantes sobre localização de consultórios, exames e setores.',
    requirements: ['Calma, empatia e comunicação acolhedora', 'Facilidade para lidar com o público', 'Postura ética e prestativa'],
    recruiterName: 'Adriana Guimarães · Humanização Hospitalar',
    phone: '62985112233',
    email: 'acolher@hospitalsantahelena.com.br',
  },
  {
    id: 'vaga-saude-acompanhante-domiciliar-33',
    title: 'Acompanhante Terapêutico e Domiciliar',
    company: 'Cuidar Bem Home Care',
    location: 'Rio de Janeiro, RJ · Copacabana / Botafogo',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 09h às 17h',
    compensation: 'R$ 2.450 por mês',
    benefits: ['Vale-transporte', 'Vale-refeição', 'Assistência médica', 'Apoio multiprofissional'],
    description:
      'Companhia ativa para pessoas idosas lúcidas em domicílio: leitura, conversação, acompanhamento a consultas médicas e estímulo à rotina saudável.',
    requirements: ['Maturidade, escuta ativa e paciência', 'Referências de experiências anteriores com cuidado ou família', 'Pontualidade'],
    recruiterName: 'Dra. Lúcia Werneck · Coordenação Cuidar Bem',
    phone: '21983221100',
    email: 'selecao@cuidarbemrj.com.br',
  },
  {
    id: 'vaga-saude-agendamento-exames-34',
    title: 'Assistente de Agendamento de Exames e Consultas',
    company: 'Laboratório Diagnóstico Preciso',
    location: 'Fortaleza, CE · Meireles',
    workMode: 'Híbrido',
    schedule: 'Segunda a sexta · das 08h às 16h',
    compensation: 'R$ 2.100 por mês',
    benefits: ['Vale-transporte', 'Vale-alimentação', 'Exames laboratoriais gratuitos', 'Plano de saúde'],
    description:
      'Atendimento telefônico e via WhatsApp para marcação de exames laboratoriais, orientação sobre preparo (jejum) e envio de resultados aos pacientes.',
    requirements: ['Voz clara e paciência ao explicar orientações', 'Boa digitação e uso de WhatsApp', 'Ensino médio completo'],
    recruiterName: 'Roberta Pinheiro · Atendimento ao Paciente',
    phone: '85986554433',
    email: 'rh@diagnosticopreciso.com.br',
  },

  // --- ATENDIMENTO E OUVIDORIA ---
  {
    id: 'vaga-sac-humanizado-35',
    title: 'Consultor(a) de SAC Humanizado 50+',
    company: 'Natura & Co (Parceira Inclusão Sênior)',
    location: 'São Paulo, SP · Remoto (Todo o Brasil)',
    workMode: 'Remoto',
    schedule: 'Segunda a sexta · 6h20 diárias',
    compensation: 'R$ 2.250 por mês',
    benefits: ['Auxílio internet e energia', 'Equipamento fornecido pela empresa', 'Vale-alimentação', 'Plano de saúde'],
    description:
      'Atendimento receptivo humanizado a consultoras e clientes para tirar dúvidas sobre pedidos, trocas e produtos, priorizando a escuta calma e resolutiva.',
    requirements: ['Boa comunicação verbal e escrita', 'Paciência e empatia', 'Ambiente silencioso para trabalho em casa'],
    recruiterName: 'Vanessa Coutinho · Diversidade & Inclusão',
    phone: '11981112233',
    email: 'diversidade50@parceiranatura.com.br',
  },
  {
    id: 'vaga-sac-whatsapp-relacionamento-36',
    title: 'Especialista de Relacionamento por WhatsApp',
    company: 'Clube de Benefícios Viver Mais 50+',
    location: 'Remoto · Trabalho em Casa',
    workMode: 'Remoto',
    schedule: 'Segunda a sexta · das 09h às 17h',
    compensation: 'R$ 2.320 por mês',
    benefits: ['Auxílio home office R$ 200', 'Vale-refeição', 'Plano médico e odontológico', 'Seguro de vida'],
    description:
      'Atendimento exclusivamente por mensagens e áudios de WhatsApp para associados 50+, auxiliando no uso de descontos em farmácias, cinemas e telemedicina.',
    requirements: ['Ótima escrita em português', 'Familiaridade com WhatsApp Web', 'Cordialidade e atenção ao cliente'],
    recruiterName: 'Andréia Vasconcelos · Sucesso do Associado',
    phone: '11982223344',
    email: 'talentos@clubevivermais.com.br',
  },
  {
    id: 'vaga-sac-ouvidoria-educacional-37',
    title: 'Analista de Ouvidoria e Atendimento ao Aluno',
    company: 'Grupo Educacional Saber (Vaga Afirmativa 50+)',
    location: 'Belo Horizonte, MG · Híbrido (2x presencial)',
    workMode: 'Híbrido',
    schedule: 'Segunda a sexta · das 09h às 18h',
    compensation: 'R$ 2.580 por mês',
    benefits: ['Vale-transporte', 'Vale-refeição', 'Plano de saúde', 'Bolsas de cursos livres'],
    description:
      'Acolhimento de sugestões, elogios e solicitações de alunos e familiares, mediação com as secretarias acadêmicas e retorno personalizado por telefone ou e-mail.',
    requirements: ['Maturidade para mediação de conflitos', 'Escrita clara e empática', 'Organização de protocolos'],
    recruiterName: 'Gabriel Magalhães · Ouvidoria & Pessoas',
    phone: '31984445566',
    email: 'ouvidoria.rh@gruposaber.edu.br',
  },
  {
    id: 'vaga-sac-pos-venda-oficina-38',
    title: 'Consultor(a) de Pós-Venda e Satisfação do Cliente',
    company: 'Concessionária AutoSul Veículos',
    location: 'Curitiba, PR · Seminário',
    workMode: 'Híbrido',
    schedule: 'Segunda a sexta · das 08h30 às 17h30',
    compensation: 'R$ 2.490 por mês',
    benefits: ['Vale-transporte', 'Vale-refeição', 'Plano de saúde', 'Bônus por satisfação'],
    description:
      'Contato telefônico e por WhatsApp com clientes após revisões automotivas para avaliar a satisfação com o serviço, agendar retornos e fidelizar clientes.',
    requirements: ['Simpatia e dicção clara ao telefone', 'Experiência com atendimento ou vendas', 'Organização de agenda'],
    recruiterName: 'Alexandre Kloss · Qualidade AutoSul',
    phone: '41987776655',
    email: 'rh@autosulveiculos.com.br',
  },
  {
    id: 'vaga-sac-monitor-qualidade-39',
    title: 'Monitor(a) de Qualidade e Acolhimento no Atendimento',
    company: 'Central Conecta Brasil (Programa Sênior)',
    location: 'Remoto · Todo o Brasil',
    workMode: 'Remoto',
    schedule: 'Segunda a sexta · 6h diárias',
    compensation: 'R$ 2.620 por mês',
    benefits: ['Auxílio home office', 'Vale-alimentação', 'Plano de saúde nacional', 'Horário flexível'],
    description:
      'Escuta e avaliação de atendimentos telefônicos e mensagens para garantir que os clientes sejam tratados com respeito, clareza e paciência, orientando novos atendentes.',
    requirements: ['Olhar humano e construtivo', 'Vivência com atendimento ao público ou liderança', 'Facilidade para dar feedbacks gentis'],
    recruiterName: 'Débora Amaral · Qualidade & Treinamento',
    phone: '11989990011',
    email: 'qualidade@conectabrasilsac.com.br',
  },
  {
    id: 'vaga-sac-concierge-hotelaria-40',
    title: 'Recepcionista e Concierge de Hospedagem Sênior',
    company: 'Pousada & Hotel Vila Real',
    location: 'Salvador, BA · Rio Vermelho',
    workMode: 'Presencial',
    schedule: 'Escala 5x2 · das 08h às 16h20',
    compensation: 'R$ 2.390 por mês',
    benefits: ['Vale-transporte', 'Refeição no local', 'Plano de saúde', 'Gorjeta compartilhada'],
    description:
      'Recepção de hóspedes no check-in e check-out, dicas culturais e gastronômicas da cidade, reservas de passeios e confirmação de reservas pelo WhatsApp.',
    requirements: ['Hospitalidade e gosto por receber bem', 'Boa comunicação interpessoal', 'Conhecimento de WhatsApp e computador'],
    recruiterName: 'Jorge Santana · Gerência de Hospitalidade',
    phone: '71988776655',
    email: 'rh@hotelvilareal.com.br',
  },
];

export const VAGAS_OPORTUNIDADES: JobOpportunityMock[] = VAGAS_SEEDS.map((seed) => ({
  id: seed.id,
  title: seed.title,
  company: seed.company,
  location: seed.location,
  workMode: seed.workMode,
  schedule: seed.schedule,
  compensation: seed.compensation,
  benefits: seed.benefits,
  description: seed.description,
  requirements: seed.requirements,
  recruiter: {
    name: seed.recruiterName,
    contact: `WhatsApp: (${seed.phone.slice(0, 2)}) ${seed.phone.slice(2, 7)}-${seed.phone.slice(7)} · ${seed.email}`,
  },
  tracking: {
    channel: 'phone',
    phone: seed.phone,
    acceptsWhatsApp: true,
    instructions: `A equipe de RH da ${seed.company} entra em contato pelo WhatsApp em até 3 dias úteis para agendar uma conversa acolhedora.`,
  },
  application: {
    channel: 'phone',
    phone: seed.phone,
    acceptsWhatsApp: true,
    instructions:
      'Envie sua apresentação pelo WhatsApp ou confirme sua inscrição direta pelo painel.',
  },
  isDemo: false,
}));

// [MOCK] Dados de vagas afirmativas para o público 50+ (Catálogo GET /api/vagas)
export const VAGAS_AFIRMATIVAS: Vaga[] = VAGAS_OPORTUNIDADES.map((vaga, idx) => ({
  id: idx + 1,
  titulo: vaga.title,
  empresa: vaga.company,
  modelo: vaga.workMode,
  localizacao: vaga.location,
  descricao: vaga.description,
  requisitos: vaga.requirements,
  beneficios: vaga.benefits,
}));
