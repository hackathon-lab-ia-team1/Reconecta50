import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Award,
  BriefcaseBusiness,
  ExternalLink,
  GraduationCap,
  MessageCircle,
  Play,
  Smartphone,
  X,
} from 'lucide-react';
import { Button } from '../components/Button';
import careerStyles from './CareerPage.module.css';
import styles from './TrainingPage.module.css';

interface TrainingLesson {
  id: string;
  badge: string;
  title: string;
  channelName: string;
  channelHandle: string;
  description: string;
  embedUrl?: string;
  externalUrl?: string;
  externalButtonLabel?: string;
  highlights: string[];
  icon: typeof Smartphone;
  tone: 'green' | 'blue' | 'olive' | 'gold';
}

const TRAINING_LESSONS: TrainingLesson[] = [
  {
    id: 'celular-sem-segredo',
    badge: 'AULA EM VÍDEO · INICIANTES',
    title: '📱 Celular Sem Segredo: Guia para Iniciantes',
    channelName: 'Bruno Siqueira – Simplificando Celular',
    channelHandle: '@SimplificandoCelular',
    description:
      'Como mexer na tela de toque, aumentar as letras e navegar com tranquilidade e sem medo de errar.',
    embedUrl: 'https://www.youtube.com/embed/XomPHpwedH8',
    externalUrl: 'https://www.youtube.com/watch?v=XomPHpwedH8',
    externalButtonLabel: 'Assistir no YouTube',
    highlights: [
      'Como tocar, rolar a tela e voltar com tranquilidade sem apagar nada por acidente.',
      'Como aumentar o tamanho das letras do celular para ler com conforto.',
      'Como organizar os aplicativos mais usados na tela inicial.',
    ],
    icon: Smartphone,
    tone: 'blue',
  },
  {
    id: 'whatsapp-seguro',
    badge: 'AULA EM VÍDEO · SEGURANÇA E COMUNICAÇÃO',
    title: '💬 WhatsApp Básico e Seguro para a Maturidade',
    channelName: 'Mestre Gino – Inclusão Digital',
    channelHandle: 'Ensino Digital para Idosos',
    description:
      'Passo a passo calmo para mandar mensagens, ouvir áudios, fazer chamadas de vídeo e se proteger de mensagens falsas.',
    embedUrl: 'https://www.youtube.com/embed/dR5PNZhaLzU',
    externalUrl: 'https://www.youtube.com/watch?v=dR5PNZhaLzU',
    externalButtonLabel: 'Assistir no YouTube',
    highlights: [
      'Como gravar, ouvir e apagar um áudio antes de enviar para o recrutador.',
      'Como identificar mensagens falsas e nunca repassar códigos recebidos por SMS.',
      'Como fazer chamadas de vídeo com familiares e recrutadores com segurança.',
    ],
    icon: MessageCircle,
    tone: 'green',
  },
  {
    id: 'mercado-trabalho-50mais',
    badge: 'AULA EM VÍDEO · EMPREGABILIDADE 50+',
    title: '💼 O Mercado de Trabalho para Profissionais 50+',
    channelName: 'Maturi',
    channelHandle: '@Maturi',
    description:
      'Dicas práticas de recolocação, valorização da maturidade e como se destacar em entrevistas de emprego.',
    embedUrl: 'https://www.youtube.com/embed/gsQy1J-78qk',
    externalUrl: 'https://www.youtube.com/watch?v=gsQy1J-78qk',
    externalButtonLabel: 'Assistir no YouTube',
    highlights: [
      'Como apresentar sua experiência de vida e maturidade emocional como diferencial competitivo.',
      'Como responder às perguntas mais comuns dos recrutadores com confiança.',
      'Onde e como buscar empresas comprometidas com a diversidade geracional 50+.',
    ],
    icon: BriefcaseBusiness,
    tone: 'olive',
  },
  {
    id: 'informatica-certificado-bradesco',
    badge: 'CURSO COM CERTIFICADO GRATUITO',
    title: '🏛️ Informática Básica com Certificado Gratuito',
    channelName: 'Fundação Bradesco (Escola Virtual)',
    channelHandle: 'Instituição Oficial',
    description:
      'Curso gratuito com certificado para comprovar conhecimentos básicos de computador no currículo.',
    externalUrl: 'https://www.ev.org.br',
    externalButtonLabel: 'Acessar inscrição gratuita na Fundação Bradesco',
    highlights: [
      '100% gratuito e no seu ritmo, com explicações passo a passo.',
      'Emite certificado oficial ao concluir para valorizar ainda mais seu currículo.',
      'Ideal para quem quer ganhar segurança no uso do computador, internet e e-mail.',
    ],
    icon: Award,
    tone: 'gold',
  },
];

export function TrainingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const aulaParam = searchParams.get('aula');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    aulaParam && TRAINING_LESSONS.some((l) => l.id === aulaParam) ? aulaParam : null,
  );

  useEffect(() => {
    if (aulaParam && TRAINING_LESSONS.some((l) => l.id === aulaParam)) {
      setActiveLessonId(aulaParam);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [aulaParam]);

  const selectLesson = (id: string | null) => {
    setActiveLessonId(id);
    if (id) {
      setSearchParams({ aula: id }, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const activeLesson = TRAINING_LESSONS.find((lesson) => lesson.id === activeLessonId) ?? null;

  return (
    <>
      <header className={careerStyles.heading}>
        <span>
          <GraduationCap size={16} aria-hidden="true" /> CAPACITAÇÃO E INCLUSÃO DIGITAL 50+
        </span>
        <h1 tabIndex={-1}>Capacitação</h1>
        <p>
          Assista às aulas diretamente aqui na plataforma, no seu tempo e sem precisar sair do
          aplicativo.
        </p>
      </header>

      {activeLesson && activeLesson.embedUrl && (
        <section
          className={styles.playerSection}
          aria-labelledby="active-lesson-title"
          role="region"
        >
          <div className={styles.playerHeader}>
            <div>
              <span className={styles.playerChannelBadge}>
                {activeLesson.channelName} ({activeLesson.channelHandle})
              </span>
              <h2 id="active-lesson-title">{activeLesson.title}</h2>
            </div>
            <Button
              variant="secondary"
              className={styles.closePlayerButton}
              onClick={() => selectLesson(null)}
            >
              <X size={20} aria-hidden="true" />
              Fechar aula
            </Button>
          </div>
          <div className={styles.videoFrameWrapper}>
            <iframe
              className={styles.videoFrame}
              src={activeLesson.embedUrl}
              title={`Player de vídeo: ${activeLesson.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className={styles.playerFooter}>
            <p className={styles.playerHint}>
              Dica: você pode pausar, voltar o vídeo quantas vezes quiser ou clicar em{' '}
              <strong>Fechar aula</strong> quando terminar.
            </p>
            {activeLesson.externalUrl && (
              <a
                href={activeLesson.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalPlayerLink}
              >
                <ExternalLink size={16} aria-hidden="true" />
                Assistir diretamente no YouTube
              </a>
            )}
          </div>
        </section>
      )}

      <div className={styles.cardsGrid}>
        {TRAINING_LESSONS.map((lesson) => {
          const Icon = lesson.icon;
          const isPlaying = activeLessonId === lesson.id;
          return (
            <article
              key={lesson.id}
              className={`${styles.lessonCard} ${isPlaying ? styles.lessonCardActive : ''}`}
            >
              <div className={styles.cardTop}>
                <span className={`${styles.iconBox} ${styles[lesson.tone]}`}>
                  <Icon size={26} aria-hidden="true" />
                </span>
                <span className={styles.lessonBadge}>{lesson.badge}</span>
              </div>

              <h2>{lesson.title}</h2>

              <p className={styles.channelLine}>
                <strong>{lesson.embedUrl ? 'Canal:' : 'Instituição:'}</strong> {lesson.channelName}{' '}
                <span className={styles.handleTag}>{lesson.channelHandle}</span>
              </p>

              <p className={styles.description}>{lesson.description}</p>

              <ul className={styles.highlightsList}>
                {lesson.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className={styles.cardActions}>
                {lesson.embedUrl ? (
                  isPlaying ? (
                    <Button
                      variant="secondary"
                      className={styles.closeInlineButton}
                      onClick={() => selectLesson(null)}
                    >
                      <X size={19} aria-hidden="true" />
                      Fechar player desta aula
                    </Button>
                  ) : (
                    <>
                      <Button
                        className={styles.watchButton}
                        onClick={() => selectLesson(lesson.id)}
                      >
                        <Play size={19} aria-hidden="true" />
                        ▶ Assistir aula aqui
                      </Button>
                      {lesson.externalUrl && (
                        <a
                          href={lesson.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.cardSecondaryLink}
                        >
                          <ExternalLink size={14} aria-hidden="true" />
                          Ou abrir no YouTube
                        </a>
                      )}
                    </>
                  )
                ) : (
                  lesson.externalUrl && (
                    <a
                      href={lesson.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.externalCertLink}
                    >
                      {lesson.externalButtonLabel ?? 'Acessar curso gratuito'}
                      <ExternalLink size={18} aria-hidden="true" />
                    </a>
                  )
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
