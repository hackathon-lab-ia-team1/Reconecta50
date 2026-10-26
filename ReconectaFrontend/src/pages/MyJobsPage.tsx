import { useContext, useEffect, useSyncExternalStore } from 'react';
import {
  BriefcaseBusiness,
  Building2,
  FileCheck2,
  MapPin,
  MessageCircle,
  SearchCheck,
  Wallet,
} from 'lucide-react';
import { LinkButton } from '../components/LinkButton';
import { AuthContext } from '../features/auth/AuthContext';
import { CareerContext } from '../features/career/CareerContext';
import type { CareerProfile, ResumeDraft } from '../features/career/types/career';
import { JobApplicationContext } from '../features/jobs/JobApplicationContext';
import type { ApplicationState } from '../features/jobs/state/applicationStore';
import styles from './CareerPage.module.css';

const EMPTY_APPLIED: Array<ApplicationState & { jobId: string }> = [];

function buildWhatsAppRecruiterUrl(
  item: ApplicationState & { jobId: string },
  fallbackProfile?: CareerProfile,
  fallbackResume?: ResumeDraft,
): string {
  const job = item.job!;
  const rawPhone =
    job.application?.channel === 'phone'
      ? job.application.phone
      : job.tracking.channel === 'phone' && job.tracking.phone
        ? job.tracking.phone
        : '11987654321';
  const digits = rawPhone.replace(/\D/g, '');
  const phoneWithCountry = digits.startsWith('55') ? digits : `55${digits}`;

  const candidateName =
    item.profile?.fullName || fallbackProfile?.fullName || 'Candidato(a) Reconecta 50+';
  const summary =
    item.resume?.summary ||
    fallbackResume?.summary ||
    'Tenho experiência profissional compatível com a vaga.';
  const availability = item.availability || 'Imediata';

  const text = `Olá, equipe de seleção da ${job.company}! Meu nome é ${candidateName}. Acabei de enviar minha candidatura pelo Reconecta 50+ para a vaga de ${job.title} (Protocolo: ${item.applicationId}).\n\nResumo profissional: ${summary}\nDisponibilidade para início: ${availability}.\n\nFico à disposição para conversarmos!`;

  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
}

export function MyJobsPage() {
  const store = useContext(JobApplicationContext);
  const auth = useContext(AuthContext);
  const career = useContext(CareerContext);

  useEffect(() => {
    if (!store) return;
    const controller = new AbortController();
    void store.syncFromBackend(controller.signal, auth?.user?.id);
    return () => {
      controller.abort();
    };
  }, [store, auth?.user?.id]);

  const appliedJobs = useSyncExternalStore(
    store ? store.subscribe : () => () => {},
    () => (store ? store.getAppliedJobs() : EMPTY_APPLIED),
  );

  return (
    <>
      <header className={styles.heading}>
        <span>CADA OPORTUNIDADE, UM NOVO CAMINHO</span>
        <h1 tabIndex={-1}>Minhas vagas</h1>
        <p>Um lugar para acompanhar suas candidaturas e saber quais são os próximos passos.</p>
      </header>

      {appliedJobs.length > 0 ? (
        <section aria-label="Candidaturas enviadas" className={styles.appliedList}>
          {appliedJobs.map((item) => {
            const job = item.job!;
            const whatsappUrl = buildWhatsAppRecruiterUrl(item, career?.profile, career?.resume);
            return (
              <article key={item.jobId} className={styles.appliedCard}>
                <div className={styles.appliedHeader}>
                  <div>
                    <span className={styles.statusBadge} role="status">
                      🟢 Candidatura Enviada com Sucesso
                    </span>
                    <h2>{job.title}</h2>
                    <p className={styles.appliedCompany}>
                      <Building2 size={18} aria-hidden="true" />
                      {job.company}
                    </p>
                  </div>
                  <div className={styles.protocolBox}>
                    <span>Protocolo: {item.applicationId}</span>
                    {item.appliedAt && <small>Enviada em {item.appliedAt}</small>}
                  </div>
                </div>

                <div className={styles.appliedMeta}>
                  <span>
                    <MapPin size={16} aria-hidden="true" />
                    {job.location} ({job.workMode})
                  </span>
                  <span>
                    <Wallet size={16} aria-hidden="true" />
                    {job.compensation}
                  </span>
                </div>

                <div className={styles.timeline} aria-label="Progresso da candidatura">
                  <span className={styles.timelineStepDone}>[Currículo Enviado ✓]</span>
                  <span className={styles.timelineArrow} aria-hidden="true">
                    ──&gt;
                  </span>
                  <span className={styles.timelineStepActive}>[Em Análise pelo RH]</span>
                  <span className={styles.timelineArrow} aria-hidden="true">
                    ──&gt;
                  </span>
                  <span className={styles.timelineStepNext}>[Contato via WhatsApp]</span>
                </div>

                <div className={styles.appliedDetails}>
                  <p>
                    <strong>Disponibilidade informada:</strong> {item.availability || 'Imediata'}
                  </p>
                  {item.salaryExpectation && (
                    <p>
                      <strong>Pretensão / Observação:</strong> {item.salaryExpectation}
                    </p>
                  )}
                  <p>
                    <strong>Recrutador responsável:</strong> {job.recruiter.name} (
                    {job.recruiter.contact}){' '}
                    <span className={styles.simulationBadge}>
                      (Canal oficial de RH · Simulação de contato)
                    </span>
                  </p>
                </div>

                <div className={styles.appliedActions}>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappButton}
                  >
                    <MessageCircle size={20} aria-hidden="true" />
                    Falar com o recrutador no WhatsApp
                  </a>
                  <LinkButton to="/vagas-recomendadas" variant="secondary">
                    Ver mais vagas recomendadas
                  </LinkButton>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className={styles.emptyState} aria-labelledby="jobs-empty-title">
          <span className={styles.emptyIcon}>
            <BriefcaseBusiness size={36} aria-hidden="true" />
          </span>
          <h2 id="jobs-empty-title">Suas próximas oportunidades vão aparecer aqui</h2>
          <p>
            Quando você se candidatar a uma vaga, poderá consultar o andamento e as orientações de
            contato nesta área.
          </p>
          <p className={styles.availability}>
            O acompanhamento de candidaturas ainda não está disponível nesta prévia.
          </p>
          <LinkButton to="/vagas-recomendadas">Ver vagas recomendadas</LinkButton>
        </section>
      )}

      <section className={styles.panel} aria-labelledby="jobs-how-title">
        <h2 id="jobs-how-title">O que você poderá acompanhar</h2>
        <ul className={styles.explainer}>
          <li>
            <FileCheck2 size={24} aria-hidden="true" />
            <div>
              <strong>Vagas às quais se candidatou</strong>
              <p>Consulte a função e a empresa em um só lugar.</p>
            </div>
          </li>
          <li>
            <SearchCheck size={24} aria-hidden="true" />
            <div>
              <strong>Andamento da candidatura</strong>
              <p>Veja as atualizações compartilhadas pela empresa.</p>
            </div>
          </li>
          <li>
            <MessageCircle size={24} aria-hidden="true" />
            <div>
              <strong>Orientações de contato</strong>
              <p>Saiba como a empresa pretende falar com você.</p>
            </div>
          </li>
        </ul>
      </section>
    </>
  );
}
