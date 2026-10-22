import { ExternalLink, Mail, Phone } from 'lucide-react';
import type { ApplicationTracking } from '../types/job';
import styles from './JobTrackingDetails.module.css';

export function JobTrackingDetails({ tracking }: { tracking: ApplicationTracking }) {
  const Icon =
    tracking.channel === 'email' ? Mail : tracking.channel === 'phone' ? Phone : ExternalLink;
  const label =
    tracking.channel === 'email'
      ? 'E-mail'
      : tracking.channel === 'phone'
        ? tracking.acceptsWhatsApp
          ? 'Celular · ligação ou WhatsApp'
          : 'Celular · ligação'
        : `Plataforma externa · ${tracking.platform}`;

  return (
    <div className={styles.tracking}>
      <Icon size={23} aria-hidden="true" />
      <div>
        <h3>Onde acompanhar a candidatura</h3>
        <strong>{label}</strong>
        <p>{tracking.instructions}</p>
        {tracking.channel === 'email' && tracking.email && (
          <p className={styles.contact}>E-mail da seleção: {tracking.email}</p>
        )}
        {tracking.channel === 'phone' && tracking.phone && (
          <p className={styles.contact}>Telefone da seleção: {tracking.phone}</p>
        )}
      </div>
    </div>
  );
}
