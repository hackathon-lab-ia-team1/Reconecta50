import type { CareerProfile, ResumeDraft } from '../types/career';
import { useId } from 'react';
import styles from './ResumePreview.module.css';

export function ResumePreview({
  profile,
  resume,
}: {
  profile: CareerProfile;
  resume: ResumeDraft;
}) {
  const titleId = useId();
  const skills = resume.skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
  return (
    <article className={styles.paper} aria-labelledby={titleId}>
      <header>
        <span className={styles.label}>PRÉVIA DO CURRÍCULO</span>
        <h2 id={titleId}>{profile.fullName || 'Seu nome'}</h2>
        {profile.phone && <p>{profile.phone}</p>}
      </header>
      <section>
        <h3>Apresentação profissional</h3>
        <p>{resume.summary || 'Seu resumo profissional aparecerá aqui.'}</p>
      </section>
      <section>
        <h3>Experiência em destaque</h3>
        {resume.role ? (
          <>
            <h4>{resume.role}</h4>
            <p className={styles.meta}>
              {[resume.company, resume.period].filter(Boolean).join(' · ')}
            </p>
            <p>{resume.activities}</p>
          </>
        ) : (
          <p>Conte uma experiência para começar seu currículo.</p>
        )}
      </section>
      {skills.length > 0 && (
        <section>
          <h3>Habilidades</h3>
          <ul>
            {skills.map((skill, index) => (
              <li key={`${skill}-${index}`}>{skill}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
