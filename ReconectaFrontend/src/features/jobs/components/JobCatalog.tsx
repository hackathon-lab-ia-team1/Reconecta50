import { useEffect, useState } from 'react';
import { Button } from '../../../components/Button';
import { getJobCatalog } from '../services/jobCatalogService';
import type { CatalogJob } from '../services/jobCatalogService';
import styles from './JobCard.module.css';

export function JobCatalog() {
  const [jobs, setJobs] = useState<CatalogJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    void getJobCatalog(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setJobs(items);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setError(cause instanceof Error ? cause.message : 'Não foi possível carregar as vagas.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);
  return (
    <section aria-labelledby="catalog-title">
      <h2 id="catalog-title">Vagas de demonstração</h2>
      <p>
        Esta lista contém exemplos fornecidos pelo serviço atual. Não são recomendações da IA e não
        recebem candidaturas. Remuneração e contatos de inscrição ainda não foram informados.
      </p>
      {loading && <p role="status">Carregando exemplos de vagas…</p>}
      {error && (
        <div>
          <p role="alert">{error}</p>
          <Button onClick={() => setAttempt((value) => value + 1)}>
            Tentar carregar vagas novamente
          </Button>
        </div>
      )}
      {!loading && !error && jobs.length === 0 && <p>Nenhum exemplo de vaga disponível.</p>}
      {!loading &&
        !error &&
        jobs.map((job) => (
          <article key={job.id} className={styles.card}>
            <h3>{job.titulo}</h3>
            <p>
              {job.empresa} · {job.localizacao} · {job.modelo}
            </p>
            <p>{job.descricao}</p>
            <h4>Requisitos</h4>
            <ul>
              {job.requisitos.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <h4>Benefícios</h4>
            <ul>
              {job.beneficios.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
    </section>
  );
}
