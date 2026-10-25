import { useEffect, useId, useRef } from 'react';
import { Button } from '../../../components/Button';
import { FormField } from '../../../components/FormField';
import { TextAreaField } from '../../../components/TextAreaField';
import type { CareerProfile, ResumeDraft } from '../../career/types/career';
import type { JobOpportunity } from '../types/job';
import { useJobApplication } from '../hooks/useJobApplication';
import styles from './JobApplicationActions.module.css';

interface JobApplicationActionsProps {
  job: JobOpportunity;
  resume: ResumeDraft;
  profile: CareerProfile;
  onDismiss: () => void;
}

export function JobApplicationActions({
  job,
  resume,
  profile,
  onDismiss,
}: JobApplicationActionsProps) {
  const id = useId();
  const {
    plan,
    pending,
    error,
    message,
    applicationId,
    attempted,
    resume: submittedResume,
    profile: submittedProfile,
    availability = 'Imediata',
    salaryExpectation = '',
    prepare,
    confirm,
    confirmQuickApplication,
    showManualChannel,
    updateMessage,
    updateQuestionnaire,
    copyMessage,
  } = useJobApplication(job, resume, profile);
  const panelRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const planType = plan?.type;
  const reviewResume = submittedResume ?? resume;
  const reviewProfile = submittedProfile ?? profile;
  useEffect(() => {
    if (planType) panelRef.current?.focus();
  }, [planType]);
  useEffect(() => {
    if (applicationId) successRef.current?.focus();
  }, [applicationId]);
  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        {!plan && (
          <Button onClick={() => void prepare()} disabled={pending || job.isDemo}>
            {pending ? 'Preparando candidatura…' : 'Quero me candidatar'}
          </Button>
        )}
        <Button variant="secondary" onClick={onDismiss} disabled={pending}>
          Não tenho interesse
        </Button>
      </div>
      {!plan && !job.isDemo && (
        <p className={styles.hint}>
          Seu currículo será usado para preparar a candidatura. Você poderá conferir antes de
          enviar.
        </p>
      )}
      {plan && !applicationId && (
        <section className={styles.panel} aria-labelledby={`${id}-title`} aria-busy={pending}>
          <h3 id={`${id}-title`} ref={panelRef} tabIndex={-1}>
            {plan.type === 'email'
              ? 'Prepare seu e-mail de candidatura'
              : plan.type === 'whatsapp'
                ? 'Prepare sua mensagem para o WhatsApp'
                : plan.type === 'automatic'
                  ? 'Confira antes de enviar sua candidatura'
                  : 'Continue sua inscrição'}
          </h3>
          <div className={styles.quickQuestions}>
            <FormField
              label="Disponibilidade para início"
              value={availability}
              placeholder="Ex.: Imediata ou em 15 dias"
              onChange={(event) => {
                updateQuestionnaire('availability', event.target.value);
              }}
            />
            <FormField
              label="Pretensão salarial (opcional)"
              value={salaryExpectation}
              placeholder={`Ex.: Compatível com a vaga (${job.compensation})`}
              onChange={(event) => {
                updateQuestionnaire('salaryExpectation', event.target.value);
              }}
            />
          </div>
          {plan.type === 'automatic' && (
            <>
              <p>{plan.summary}</p>
              <p>
                Vaga: {job.title} · {job.company}
              </p>
              <p>
                Nome: {reviewProfile.fullName || 'Nome informado na sua conta'}
                {reviewProfile.phone ? ` · Telefone: ${reviewProfile.phone}` : ''}
              </p>
              <details>
                <summary>Conferir informações do currículo</summary>
                <p>{reviewResume.summary}</p>
                <p>
                  {[reviewResume.role, reviewResume.company, reviewResume.period]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <p>{reviewResume.activities}</p>
                <p>{reviewResume.skills}</p>
              </details>
              <div className={styles.actions}>
                <Button onClick={() => void confirm()} disabled={pending}>
                  {pending ? 'Enviando candidatura…' : 'Confirmar candidatura automática'}
                </Button>
                <Button
                  variant="secondary"
                  disabled={pending || attempted}
                  onClick={showManualChannel}
                >
                  Usar outro canal de inscrição
                </Button>
              </div>
            </>
          )}
          {plan.type === 'external' && (
            <>
              <p>
                Esta inscrição precisa ser concluída no site de origem. Preencha as etapas
                solicitadas por lá.
              </p>
              <div className={styles.actions}>
                <a
                  className={styles.link}
                  href={plan.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Continuar inscrição no site de origem (abre em nova aba)
                </a>
                <Button variant="secondary" onClick={confirmQuickApplication}>
                  Confirmar inscrição na vaga
                </Button>
              </div>
            </>
          )}
          {(plan.type === 'email' || plan.type === 'whatsapp') && (
            <>
              <p>
                {plan.source === 'ai'
                  ? 'A IA sugeriu esta mensagem com base no seu currículo.'
                  : 'Preparamos um modelo inicial com as informações do seu currículo.'}{' '}
                Confira e edite antes de enviar.
              </p>
              {plan.type === 'whatsapp' && (
                <>
                  <FormField label="WhatsApp do recrutador" value={plan.phone} readOnly />
                  <p>{plan.instructions}</p>
                </>
              )}
              {plan.type === 'email' && (
                <>
                  <FormField label="E-mail do recrutador" value={plan.to} readOnly />
                  <FormField
                    label="Assunto do e-mail"
                    value={plan.subject}
                    maxLength={250}
                    onChange={(event) => {
                      updateMessage('subject', event.target.value);
                    }}
                  />
                </>
              )}
              <div className={styles.messageEditor}>
                <TextAreaField
                  label="Mensagem para o recrutador"
                  rows={10}
                  maxLength={12000}
                  value={plan.body}
                  onChange={(event) => {
                    updateMessage('body', event.target.value);
                  }}
                />
                <Button
                  variant="secondary"
                  onClick={() => void copyMessage()}
                  disabled={!plan.body.trim()}
                >
                  Copiar mensagem
                </Button>
              </div>
              <div className={styles.actions}>
                <Button onClick={confirmQuickApplication} disabled={pending}>
                  Confirmar inscrição na vaga
                </Button>
              </div>
              {plan.type === 'email' ? (
                <p>
                  Copie a mensagem e envie pelo Gmail ou pela plataforma de e-mail que você usa.
                  Confira o destinatário, o assunto e anexe o PDF do currículo antes de enviar.
                </p>
              ) : (
                <p>
                  Copie a mensagem, abra o WhatsApp e confira o número do recrutador antes de
                  enviar. Você pode anexar o PDF do currículo, se solicitado.
                </p>
              )}
            </>
          )}
          {plan.type === 'manual' && (
            <>
              <p>{plan.instructions}</p>
              <div className={styles.actions}>
                <Button onClick={confirmQuickApplication} disabled={pending}>
                  Confirmar inscrição na vaga
                </Button>
              </div>
            </>
          )}
        </section>
      )}
      {applicationId && (
        <p ref={successRef} tabIndex={-1} role="status" className={styles.success}>
          Candidatura enviada e confirmada. Protocolo: {applicationId}
        </p>
      )}
      {error && (
        <div>
          <p role="alert" className={styles.error}>
            {error}
          </p>
          {attempted && (
            <p className={styles.hint}>
              O envio ainda não foi confirmado. Tente novamente pelo mesmo botão para verificar a
              candidatura.
            </p>
          )}
          <Button variant="secondary" disabled={pending || attempted} onClick={showManualChannel}>
            Continuar por outro canal
          </Button>
        </div>
      )}
      {message && (
        <p role="status" className={styles.hint}>
          {message}
        </p>
      )}
    </div>
  );
}
