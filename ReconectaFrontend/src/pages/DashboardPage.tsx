import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  FileUser,
  HeartHandshake,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LinkButton } from '../components/LinkButton';
import { DashboardActionCard } from '../features/dashboard/components/DashboardActionCard';
import { useCareer } from '../features/career/useCareer';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { profile, resume } = useCareer();
  const profileReady = !!profile.fullName;
  const resumeReady = !!resume.summary;
  const steps = [
    {
      title: 'Conte quem você é',
      description: 'Atualize seus dados de contato.',
      to: '/perfil',
      done: profileReady,
    },
    {
      title: 'Valorize sua trajetória',
      description: 'Organize suas experiências no currículo.',
      to: '/curriculo',
      done: resumeReady,
    },
    {
      title: 'Acompanhe seus próximos passos',
      description: 'Consulte suas candidaturas em Minhas vagas.',
      to: '/minhas-vagas',
      done: false,
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
          <p>Seu próximo capítulo começa com um passo de cada vez.</p>
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
          <LinkButton to="/curriculo" variant="light">
            Montar meu currículo
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
      <section className={styles.section} aria-labelledby="actions-title">
        <div className={styles.sectionHeading}>
          <h2 id="actions-title">O que você quer fazer hoje?</h2>
          <p>Escolha por onde começar. Você pode voltar quando quiser.</p>
        </div>
        <div className={styles.cards}>
          <DashboardActionCard
            to="/curriculo"
            title="Meu currículo"
            description="Dê destaque às suas experiências e habilidades, de um jeito simples."
            action="Montar meu currículo"
            icon={FileUser}
            tone="blue"
          />
          <DashboardActionCard
            to="/vagas-recomendadas"
            title="Vagas recomendadas"
            description="Encontre vagas indicadas pela IA a partir das experiências e habilidades do seu currículo."
            action="Ver vagas recomendadas"
            icon={Search}
            tone="olive"
          />
          <DashboardActionCard
            to="/minhas-vagas"
            title="Minhas vagas"
            description="Acompanhe as vagas às quais você se candidatou e confira os próximos passos da seleção."
            action="Acompanhar minhas candidaturas"
            icon={BriefcaseBusiness}
            tone="green"
          />
        </div>
      </section>
      <section className={styles.nextSteps} aria-labelledby="steps-title">
        <div>
          <span className={styles.eyebrow}>NO SEU TEMPO, DO SEU JEITO</span>
          <h2 id="steps-title">Um passo de cada vez</h2>
          <p>Não precisa fazer tudo agora. Comece pelo que for mais fácil para você.</p>
        </div>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={step.to}>
              <span className={`${styles.stepNumber} ${step.done ? styles.done : ''}`}>
                {step.done ? <Check size={18} aria-label="Concluído" /> : index + 1}
              </span>
              <Link to={step.to}>
                <strong>{step.title}</strong>
                <span>{step.description}</span>
              </Link>
              <ArrowRight size={18} aria-hidden="true" />
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
