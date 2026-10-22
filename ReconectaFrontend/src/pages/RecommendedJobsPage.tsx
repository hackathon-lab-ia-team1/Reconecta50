import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { LinkButton } from '../components/LinkButton';
import { JobCard } from '../features/jobs/components/JobCard';
import { JobApplicationActions } from '../features/jobs/components/JobApplicationActions';
import { JobFilters } from '../features/jobs/components/JobFilters';
import type { JobTrackingFilter } from '../features/jobs/types/job';
import { filterJobs } from '../features/jobs/utils/filterJobs';
import { useJobRecommendations } from '../features/jobs/hooks/useJobRecommendations';
import { useCareer } from '../features/career/useCareer';
import pageStyles from './CareerPage.module.css';
import styles from './RecommendedJobsPage.module.css';

export function RecommendedJobsPage() {
  const { resume, profile } = useCareer();
  const { ready, recommendations, loading, completed, error, refresh, cancel } =
    useJobRecommendations(resume);
  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState<JobTrackingFilter>('all');
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState('');
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const applicationKey = JSON.stringify({
    resume,
    fullName: profile.fullName,
    phone: profile.phone,
  });
  useEffect(() => {
    if (notice) noticeRef.current?.focus();
  }, [notice]);
  const recommendationsById = useMemo(
    () => new Map(recommendations.map((item) => [item.job.id, item])),
    [recommendations],
  );
  const jobs = useMemo(
    () =>
      filterJobs(
        recommendations.map((item) => item.job).filter((job) => !hiddenIds.has(job.id)),
        query,
        channel,
      ),
    [recommendations, query, channel, hiddenIds],
  );

  return (
    <>
      <header className={pageStyles.heading}>
        <span>OPORTUNIDADES QUE COMBINAM COM SUA TRAJETÓRIA</span>
        <h1 tabIndex={-1}>Vagas recomendadas</h1>
        <p>
          A IA analisará suas experiências e habilidades para indicar apenas vagas compatíveis com
          seu currículo.
        </p>
      </header>
      {!ready ? (
        <section className={styles.empty} aria-labelledby="resume-needed-title">
          <h2 id="resume-needed-title">Primeiro, deixe seu currículo pronto</h2>
          <p>
            Conte suas experiências em Meu currículo. Essas informações serão a base das
            recomendações.
          </p>
          <LinkButton to="/curriculo">Preparar meu currículo</LinkButton>
        </section>
      ) : (
        <>
          <div className={styles.analysis}>
            <h2>Encontre vagas para o seu currículo</h2>
            <p>
              A análise usa as informações profissionais do seu currículo. Se fizer alterações nele,
              solicite uma nova análise.
            </p>
            <div className={styles.actions}>
              <Button onClick={() => void refresh()} disabled={loading}>
                {loading
                  ? 'Analisando seu currículo…'
                  : completed
                    ? 'Atualizar vagas para este currículo'
                    : 'Encontrar vagas para meu currículo'}
              </Button>
              {loading && (
                <Button variant="secondary" onClick={cancel}>
                  Cancelar busca
                </Button>
              )}
            </div>
          </div>
          {loading && (
            <p className={styles.count} role="status">
              Aguarde enquanto suas experiências e habilidades são comparadas com as vagas
              disponíveis.
            </p>
          )}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {completed && recommendations.length === 0 && (
            <section className={styles.empty} aria-labelledby="no-compatible-jobs-title">
              <h2 id="no-compatible-jobs-title">Ainda não encontramos vagas compatíveis</h2>
              <p>
                Nenhuma vaga será indicada sem compatibilidade com seu currículo. Você pode
                atualizar suas experiências ou tentar novamente mais tarde.
              </p>
              <LinkButton to="/curriculo" variant="secondary">
                Revisar meu currículo
              </LinkButton>
            </section>
          )}
          {completed && recommendations.length > 0 && (
            <>
              <JobFilters
                query={query}
                channel={channel}
                onQueryChange={setQuery}
                onChannelChange={setChannel}
              />
              {notice && (
                <p ref={noticeRef} tabIndex={-1} role="status" className={styles.count}>
                  {notice}
                </p>
              )}
              {hiddenIds.size > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setHiddenIds(new Set());
                    setNotice('As vagas ocultadas voltaram a aparecer.');
                  }}
                >
                  Mostrar vagas ocultadas ({hiddenIds.size})
                </Button>
              )}
              <p className={styles.count} role="status">
                {jobs.length === 1
                  ? '1 vaga compatível encontrada'
                  : `${jobs.length} vagas compatíveis encontradas`}
              </p>
              {jobs.length > 0 ? (
                <ul className={styles.list} aria-label="Vagas recomendadas">
                  {jobs.map((job) => {
                    const recommendation = recommendationsById.get(job.id);
                    return (
                      <li key={`${job.id}:${applicationKey}`}>
                        <JobCard
                          job={job}
                          recommendation={recommendation}
                          actions={
                            <JobApplicationActions
                              job={job}
                              resume={resume}
                              profile={profile}
                              onDismiss={() => {
                                setHiddenIds((current) => new Set(current).add(job.id));
                                setNotice(
                                  `A vaga de ${job.title} na ${job.company} foi ocultada. Você pode mostrá-la novamente.`,
                                );
                              }}
                            />
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <section className={styles.empty} aria-labelledby="no-filtered-jobs-title">
                  <h2 id="no-filtered-jobs-title">
                    {hiddenIds.size
                      ? 'Nenhuma vaga para mostrar com essa seleção'
                      : 'Nenhuma vaga com esses filtros'}
                  </h2>
                  <p>Tente outro local ou canal ou mostre novamente as vagas ocultadas.</p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery('');
                      setChannel('all');
                    }}
                  >
                    Limpar filtros
                  </Button>
                </section>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
