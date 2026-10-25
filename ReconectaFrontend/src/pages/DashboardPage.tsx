import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Check,
  ExternalLink,
  FileUser,
  GraduationCap,
  HeartHandshake,
  MessageCircle,
  PlayCircle,
  Search,
  Smartphone,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LinkButton } from '../components/LinkButton';
import { Button } from '../components/Button';
import { useCareer } from '../features/career/useCareer';
import styles from './DashboardPage.module.css';

interface DigitalCourseItem {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  provider: string;
  externalUrl: string;
  youtubeEmbedUrl: string;
  tips: string[];
  icon: typeof Smartphone;
  tone: 'green' | 'blue' | 'olive';
}

const DIGITAL_COURSES: DigitalCourseItem[] = [
  {
    id: 'informatica-celular',
    title: 'Informática Básica e Celular',
    subtitle: 'Dicas para usar o smartphone e computador com segurança.',
    duration: '15 min · Gratuito',
    provider: 'Escola Virtual Fundação Bradesco',
    externalUrl: 'https://www.ev.org.br/areas-de-interesse/tecnologia',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/2Vv-BfVoq4g',
    tips: [
      'Aumente o tamanho da fonte no celular ou no topo desta página usando o botão A+.',
      'Nunca compartilhe senhas bancárias ou códigos recebidos por SMS com desconhecidos.',
      'Salve seu currículo em PDF no celular para enviar facilmente quando pedirem.',
    ],
    icon: Smartphone,
    tone: 'blue',
  },
  {
    id: 'whatsapp-profissional',
    title: 'WhatsApp Profissional',
    subtitle: 'Como conversar com recrutadores e enviar mensagens claras.',
    duration: '10 min · Prático',
    provider: 'Guia Prático Reconecta 50+',
    externalUrl: 'https://www.youtube.com/results?search_query=como+usar+whatsapp+para+emprego',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/y881t8ilMyc',
    tips: [
      'Comece sempre cumprimentando pelo nome da empresa e dizendo a vaga de interesse.',
      'Evite áudios muito longos no primeiro contato; prefira mensagens curtas e objetivas.',
      'Use o botão "Conversar com o RH no WhatsApp" em Minhas Vagas para enviar a mensagem já pronta!',
    ],
    icon: MessageCircle,
    tone: 'green',
  },
  {
    id: 'entendendo-ia',
    title: 'Entendendo a Inteligência Artificial',
    subtitle: 'Vídeo curto e simples explicando como a IA ajuda no dia a dia.',
    duration: '8 min · Descomplicado',
    provider: 'Inclusão Digital 50+',
    externalUrl:
      'https://www.youtube.com/results?search_query=inteligencia+artificial+explicada+de+forma+simples',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/aircAruvnKk',
    tips: [
      'A Inteligência Artificial funciona como um assistente que organiza o que você conta com suas palavras.',
      'Você não precisa saber escrever difícil: basta falar o que fazia no trabalho e a IA formata o currículo.',
      'Você sempre tem o controle final para revisar e corrigir qualquer texto antes de enviar.',
    ],
    icon: Bot,
    tone: 'olive',
  },
];

export function DashboardPage() {
  const { profile, resume } = useCareer();
  const [selectedCourse, setSelectedCourse] = useState<DigitalCourseItem | null>(null);
  const profileReady = !!profile.fullName;
  const resumeReady = !!resume.summary;

  const journeySteps = [
    {
      stepNumber: 1,
      badge: profileReady ? '✓ Passo 1 concluído' : 'Passo 1 · Comece por aqui',
      title: 'Passo 1: Seus dados de contato',
      description:
        'Confira seu nome, telefone com WhatsApp e cidade para que as empresas possam falar com você.',
      action: profileReady ? 'Revisar meus dados de contato' : 'Preencher meus dados',
      to: '/perfil',
      icon: UserRound,
      done: profileReady,
      featured: !profileReady,
      lockedHint: '',
    },
    {
      stepNumber: 2,
      badge: resumeReady ? '✓ Passo 2 concluído' : '★ Passo 2 · Destaque principal',
      title: 'Passo 2: Crie seu currículo com IA',
      description:
        'Conte sua experiência falando no microfone ou escrevendo em 4 passos simples. A IA valoriza sua história.',
      action: resumeReady ? 'Ver ou atualizar meu currículo' : 'Criar meu currículo com IA',
      to: '/curriculo',
      icon: FileUser,
      done: resumeReady,
      featured: !resumeReady,
      lockedHint: '',
    },
    {
      stepNumber: 3,
      badge: resumeReady ? '✓ Liberado para busca' : 'Passo 3 · Requer currículo',
      title: 'Passo 3: Vagas recomendadas pela IA',
      description:
        'Encontre oportunidades afirmativas 50+ compatíveis com suas experiências e habilidades.',
      action: 'Ver vagas recomendadas',
      to: '/vagas-recomendadas',
      icon: Search,
      done: false,
      featured: resumeReady,
      lockedHint: !resumeReady ? 'Preencha o Passo 2 para liberar as vagas recomendadas' : '',
    },
    {
      stepNumber: 4,
      badge: 'Passo 4 · Acompanhamento',
      title: 'Passo 4: Minhas candidaturas',
      description:
        'Acompanhe o andamento das seleções após enviar candidaturas e fale direto com o RH pelo WhatsApp.',
      action: 'Acompanhar minhas candidaturas',
      to: '/minhas-vagas',
      icon: BriefcaseBusiness,
      done: false,
      featured: false,
      lockedHint: '',
    },
  ];

  return (
    <>
      <div className={styles.pageHeading}>
        <div>
          <span className={styles.eyebrow}>SEU ESPAÇO DE POSSIBILIDADES</span>
          <h1 tabIndex={-1}>
            {profileReady
              ? `Olá, ${profile.fullName.split(/\s+/)[0]}!`
              : 'Que bom ter você por aqui!'}
          </h1>
          <p>Siga a jornada passo a passo abaixo para conquistar sua próxima oportunidade.</p>
        </div>
        <span className={styles.welcomeTag}>
          <HeartHandshake size={19} aria-hidden="true" />
          Estamos com você
        </span>
      </div>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div>
          <span className={styles.heroLabel}>
            <Sparkles size={17} aria-hidden="true" />
            SUA EXPERIÊNCIA ABRE CAMINHOS
          </span>
          <h2 id="hero-title">
            Uma vida de histórias.
            <br />
            Muitas possibilidades pela frente.
          </h2>
          <p>
            O que você aprendeu tem valor. Vamos transformar sua trajetória em um currículo que
            mostre tudo o que você tem a oferecer?
          </p>
          <LinkButton to={resumeReady ? '/vagas-recomendadas' : '/curriculo'} variant="light">
            {resumeReady ? 'Ver vagas para meu currículo' : 'Montar meu currículo'}
            <ArrowRight size={21} aria-hidden="true" />
          </LinkButton>
        </div>
        <div className={styles.illustration} aria-hidden="true">
          <div className={styles.resumePaper}>
            <span className={styles.paperIcon}>
              <UserRound size={28} />
            </span>
            <span className={styles.paperTitle}>Sua trajetória</span>
            <span className={styles.paperLine} />
            <span className={styles.paperLine} />
            <span className={styles.paperSection}>Experiências que fazem a diferença</span>
            <span className={styles.paperLine} />
            <span className={styles.paperLine} />
            <span className={styles.paperBadge}>
              <Check size={16} />
              Cada experiência conta
            </span>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="journey-title">
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>PASSO A PASSO GUIADO</span>
          <h2 id="journey-title">Sua jornada no Reconecta 50+</h2>
          <p>
            Siga os 4 passos na ordem abaixo para preparar seu currículo e liberar as melhores vagas
            para o seu perfil.
          </p>
        </div>
        <div className={styles.journeyGrid}>
          {journeySteps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.to}
                to={step.to}
                className={`${styles.journeyCard} ${step.featured ? styles.journeyCardFeatured : ''} ${
                  step.done ? styles.journeyCardDone : ''
                }`}
              >
                <div className={styles.journeyCardTop}>
                  <span
                    className={`${styles.stepCircle} ${step.done ? styles.done : ''} ${
                      step.featured ? styles.stepCircleFeatured : ''
                    }`}
                  >
                    {step.done ? <Check size={18} aria-label="Concluído" /> : step.stepNumber}
                  </span>
                  <span
                    className={`${styles.journeyBadge} ${
                      step.done
                        ? styles.journeyBadgeDone
                        : step.featured
                          ? styles.journeyBadgeFeatured
                          : ''
                    }`}
                  >
                    {step.badge}
                  </span>
                  <span className={styles.journeyIconWrap} aria-hidden="true">
                    <Icon size={22} />
                  </span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {step.lockedHint && (
                  <div className={styles.lockedRequirementBadge}>
                    <span>🔒 {step.lockedHint}</span>
                  </div>
                )}
                <span className={styles.journeyAction}>
                  {step.action}
                  <ArrowUpRight size={19} aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.coursesSection} aria-labelledby="digital-courses-title">
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>
            <GraduationCap size={16} aria-hidden="true" /> CAPACITAÇÃO E INCLUSÃO DIGITAL 50+
          </span>
          <h2 id="digital-courses-title">Cursos e Dicas Digitais Gratuitas</h2>
          <p>
            Aprenda no seu ritmo com conteúdos curtos, gratuitos e pensados para facilitar o seu dia
            a dia na busca por trabalho.
          </p>
        </div>
        <div className={styles.coursesGrid}>
          {DIGITAL_COURSES.map((course) => {
            const Icon = course.icon;
            return (
              <article key={course.id} className={styles.courseCard}>
                <div className={styles.courseCardHeader}>
                  <span className={`${styles.courseIcon} ${styles[course.tone]}`}>
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <span className={styles.courseDuration}>{course.duration}</span>
                </div>
                <h3>{course.title}</h3>
                <p>{course.subtitle}</p>
                <div className={styles.courseCardActions}>
                  <Button variant="secondary" onClick={() => setSelectedCourse(course)}>
                    <PlayCircle size={18} aria-hidden="true" />
                    Ver dicas e vídeo
                  </Button>
                  <a
                    href={course.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externalCourseLink}
                  >
                    Acessar curso gratuito
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {selectedCourse && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-modal-title"
        >
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.eyebrow}>{selectedCourse.provider}</span>
                <h2 id="course-modal-title">{selectedCourse.title}</h2>
              </div>
              <Button
                variant="secondary"
                aria-label="Fechar janela de curso"
                onClick={() => setSelectedCourse(null)}
              >
                <X size={18} aria-hidden="true" />
                Fechar
              </Button>
            </div>
            <p className={styles.modalSubtitle}>{selectedCourse.subtitle}</p>
            <div className={styles.tipsBox}>
              <strong>Dicas rápidas para aplicar hoje:</strong>
              <ul>
                {selectedCourse.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
            <div className={styles.modalFooter}>
              <a
                href={selectedCourse.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.modalExternalButton}
              >
                Abrir conteúdo completo ({selectedCourse.provider})
                <ExternalLink size={18} aria-hidden="true" />
              </a>
              <Button variant="secondary" onClick={() => setSelectedCourse(null)}>
                Voltar ao painel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
