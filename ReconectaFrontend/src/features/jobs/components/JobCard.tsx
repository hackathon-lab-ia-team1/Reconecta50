import { useId } from 'react';
import type { ReactNode } from 'react';
import { Building2, ExternalLink, MapPin, Wallet } from 'lucide-react';
import type { JobOpportunity } from '../types/job';
import type { JobRecommendation } from '../types/recommendation';
import { JobTrackingDetails } from './JobTrackingDetails';
import styles from './JobCard.module.css';
import { safeApplicationUrl } from '../utils/applicationLinks';
import { getApplicationChannel } from '../utils/applicationChannel';

interface JobCardProps {
  job: JobOpportunity;
  recommendation?: Pick<JobRecommendation, 'reason' | 'matchedSkills'>;
  actions?: ReactNode;
}

export function JobCard({ job, recommendation, actions }: JobCardProps) {
  const id = useId();
  const application = getApplicationChannel(job);
  const applicationUrl =
    !job.isDemo && application.channel === 'external'
      ? safeApplicationUrl(application.url)
      : undefined;
  return (
    <article className={styles.card} aria-labelledby={`${id}-title`}>
      <header className={styles.header}>
        <div>
          <div className={styles.tags}>
            <span>{job.workMode}</span>
            {job.isDemo && <span className={styles.demo}>Vaga de demonstração</span>}
          </div>
          <h2 id={`${id}-title`}>{job.title}</h2>
          <p className={styles.company}>
            <Building2 size={18} aria-hidden="true" />
            {job.company}
          </p>
        </div>
      </header>
      {recommendation && (
        <section className={styles.recommendation} aria-labelledby={`${id}-match`}>
          <h3 id={`${id}-match`}>Por que esta vaga combina com seu currículo?</h3>
          <p>{recommendation.reason}</p>
          {recommendation.matchedSkills.length > 0 && (
            <p>
              <strong>Habilidades em comum:</strong> {recommendation.matchedSkills.join(' · ')}
            </p>
          )}
        </section>
      )}
      <dl className={styles.details}>
        <div>
          <dt>
            <MapPin size={18} aria-hidden="true" />
            Local
          </dt>
          <dd>{job.location}</dd>
        </div>
        <div>
          <dt>
            <Wallet size={18} aria-hidden="true" />
            Remuneração
          </dt>
          <dd>{job.compensation}</dd>
        </div>
        <div>
          <dt>Jornada</dt>
          <dd>{job.schedule}</dd>
        </div>
        <div>
          <dt>Benefícios</dt>
          <dd>{job.benefits.length ? job.benefits.join(' · ') : 'Não informados pela empresa'}</dd>
        </div>
      </dl>
      <p className={styles.description}>{job.description}</p>
      <section className={styles.requirements} aria-labelledby={`${id}-requirements`}>
        <h3 id={`${id}-requirements`}>O que a empresa procura</h3>
        <ul>
          {job.requirements.map((requirement) => (
            <li key={requirement}>{requirement}</li>
          ))}
        </ul>
      </section>
      <div className={styles.recruiter}>
        <h3>Contato do recrutador</h3>
        <p>
          <strong>{job.recruiter.name}</strong>
        </p>
        <p>{job.recruiter.contact}</p>
        {job.isDemo && (
          <small>Contatos ilustrativos. Não envie dados ou mensagens para estes exemplos.</small>
        )}
      </div>
      <JobTrackingDetails tracking={job.tracking} />
      {actions ??
        (applicationUrl && (
          <a
            href={applicationUrl}
            className={styles.applicationLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver anúncio e candidatura no site de origem
            <ExternalLink size={18} aria-hidden="true" />
            <span className={styles.visuallyHidden}> (abre em nova aba)</span>
          </a>
        ))}
      {job.isDemo && <p className={styles.unavailable}>Este exemplo não recebe candidaturas.</p>}
      {!actions && !job.isDemo && !applicationUrl && (
        <p className={styles.unavailable}>Link de candidatura não informado pela empresa.</p>
      )}
    </article>
  );
}
