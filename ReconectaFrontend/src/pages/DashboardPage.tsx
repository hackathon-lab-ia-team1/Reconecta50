import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  FileUser,
  GraduationCap,
  HeartHandshake,
  MessageCircle,
  PlayCircle,
  Search,
  Smartphone,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LinkButton } from '../components/LinkButton';
import { useCareer } from '../features/career/useCareer';
import styles from './DashboardPage.module.css';

interface DashboardCourseItem {
  id: string;
  lessonId: string;
  badge: string;
  title: string;
  subtitle: string;
  channel: string;
  duration: string;
  icon: typeof Smartphone;
  tone: 'blue' | 'green' | 'olive';
}

const DASHBOARD_COURSES: DashboardCourseItem[] = [
  {
    id: 'celular',
    lessonId: 'celular-sem-segredo',
    badge: 'AULA EM VÍDEO · INICIANTES',
    title: '📱 Celular Sem Segredo: Guia para Iniciantes',
    subtitle:
      'Aprenda a mexer na tela de toque, aumentar as letras e navegar sem medo de errar ou apagar algo.',
    channel: 'Bruno Siqueira – Simplificando Celular',
    duration: 'Aula prática · Gratuita',
    icon: Smartphone,
    tone: 'blue',
  },
  {
    id: 'whatsapp',
    lessonId: 'whatsapp-seguro',
    badge: 'AULA EM VÍDEO · SEGURANÇA',
    title: '💬 WhatsApp Básico e Seguro para a Maturidade',
    subtitle:
      'Passo a passo calmo para mandar e ouvir áudios, chamadas de vídeo e se proteger de golpes no aplicativo.',
    channel: 'Mestre Gino – Inclusão Digital',
    duration: 'Aula prática · Gratuita',
    icon: MessageCircle,
    tone: 'green',
  },
  {
    id: 'mercado-50mais',
    lessonId: 'mercado-trabalho-50mais',
    badge: 'AULA EM VÍDEO · CARREIRA 50+',
    title: '💼 O Mercado de Trabalho para Profissionais 50+',
    subtitle:
      'Dicas práticas da Maturi para valorizar suas experiências de vida e se destacar com confiança em entrevistas.',
    channel: 'Maturi – Diversidade Geracional',
    duration: 'Orientação de carreira',
    icon: BriefcaseBusiness,
    tone: 'olive',
  },
];

export function DashboardPage() {
  const { profile, resume } = useCareer();
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
      locked: false,
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
      locked: false,
      lockedHint: '',
    },
    {
      stepNumber: 3,
      badge: resumeReady ? '✓ Liberado para busca' : '🔒 Passo 3 · Bloqueado',
      title: 'Passo 3: Vagas recomendadas pela IA',
      description:
        'Encontre oportunidades afirmativas 50+ compatíveis com suas experiências e habilidades.',
      action: resumeReady ? 'Ver vagas recomendadas' : 'Crie seu currículo para desbloquear',
      to: resumeReady ? '/vagas-recomendadas' : '/curriculo',
      icon: Search,
      done: false,
      featured: resumeReady,
      locked: !resumeReady,
      lockedHint: !resumeReady ? 'Preencha o Passo 2 para liberar as vagas recomendadas' : '',
    },
    {
      stepNumber: 4,
      badge: resumeReady ? 'Passo 4 · Acompanhamento' : '🔒 Passo 4 · Bloqueado',
      title: 'Passo 4: Minhas candidaturas',
      description:
        'Acompanhe o andamento das seleções após enviar candidaturas e fale direto com o RH pelo WhatsApp.',
      action: resumeReady ? 'Acompanhar minhas candidaturas' : 'Requer currículo criado',
      to: resumeReady ? '/minhas-vagas' : '/curriculo',
      icon: BriefcaseBusiness,
      done: false,
      featured: false,
      locked: !resumeReady,
      lockedHint: !resumeReady ? 'Complete o Passo 2 para liberar o envio e acompanhamento de vagas' : '',
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
                key={step.to + step.stepNumber}
                to={step.to}
                className={`${styles.journeyCard} ${
                  step.locked
                    ? styles.journeyCardLocked
                    : step.featured
                      ? styles.journeyCardFeatured
                      : step.done
                        ? styles.journeyCardDone
                        : ''
                }`}
              >
                <div className={styles.journeyCardTop}>
                  <span
                    className={`${styles.stepCircle} ${
                      step.locked
                        ? styles.stepCircleLocked
                        : step.done
                          ? styles.done
                          : step.featured
                            ? styles.stepCircleFeatured
                            : ''
                    }`}
                  >
                    {step.locked ? '🔒' : step.done ? <Check size={18} aria-label="Concluído" /> : step.stepNumber}
                  </span>
                  <span
                    className={`${styles.journeyBadge} ${
                      step.locked
                        ? styles.journeyBadgeLocked
                        : step.done
                          ? styles.journeyBadgeDone
                          : step.featured
                            ? styles.journeyBadgeFeatured
                            : ''
                    }`}
                  >
                    {step.badge}
                  </span>
                  <span
                    className={`${styles.journeyIconWrap} ${step.locked ? styles.journeyIconLocked : ''}`}
                    aria-hidden="true"
                  >
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
                <span className={`${styles.journeyAction} ${step.locked ? styles.journeyActionLocked : ''}`}>
                  {step.action}
                  <ArrowUpRight size={19} aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.coursesSection} aria-labelledby="digital-courses-title">
        <div className={styles.coursesSectionHeading}>
          <div>
            <span className={styles.eyebrow}>
              <GraduationCap size={16} aria-hidden="true" /> CAPACITAÇÃO E INCLUSÃO DIGITAL 50+
            </span>
            <h2 id="digital-courses-title">Cursos e Aulas em Vídeo Gratuitas</h2>
            <p>
              Aprenda no seu ritmo com aulas passo a passo gravadas por especialistas em inclusão digital 50+.
            </p>
          </div>
          <Link to="/capacitacao" className={styles.allCoursesButton}>
            <GraduationCap size={18} aria-hidden="true" />
            Ver todas as aulas e certificados
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.coursesGrid}>
          {DASHBOARD_COURSES.map((course) => {
            const Icon = course.icon;
            return (
              <article key={course.id} className={styles.courseCard}>
                <div className={styles.courseCardHeader}>
                  <span className={`${styles.courseIcon} ${styles[course.tone]}`}>
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <span className={styles.courseDuration}>{course.duration}</span>
                </div>
                <span className={styles.courseChannelTag}>{course.channel}</span>
                <h3>{course.title}</h3>
                <p>{course.subtitle}</p>
                <div className={styles.courseCardActions}>
                  <Link
                    to={`/capacitacao?aula=${course.lessonId}`}
                    className={styles.courseWatchButton}
                  >
                    <PlayCircle size={19} aria-hidden="true" />
                    Assistir aula na plataforma
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
