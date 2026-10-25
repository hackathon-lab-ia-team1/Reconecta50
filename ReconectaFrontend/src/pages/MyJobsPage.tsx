import { BriefcaseBusiness, FileCheck2, MessageCircle, SearchCheck } from 'lucide-react';
import { LinkButton } from '../components/LinkButton';
import styles from './CareerPage.module.css';

export function MyJobsPage() {
  return (
    <>
      <header className={styles.heading}>
        <span>CADA OPORTUNIDADE, UM NOVO CAMINHO</span>
        <h1 tabIndex={-1}>Minhas vagas</h1>
        <p>Um lugar para acompanhar suas candidaturas e saber quais são os próximos passos.</p>
      </header>
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
