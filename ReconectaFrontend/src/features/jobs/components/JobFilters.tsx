import { useId } from 'react';
import { Search } from 'lucide-react';
import { FormField } from '../../../components/FormField';
import { trackingOptions } from '../constants/trackingOptions';
import type { JobTrackingFilter } from '../types/job';
import styles from './JobFilters.module.css';

interface JobFiltersProps {
  query: string;
  channel: JobTrackingFilter;
  onQueryChange: (value: string) => void;
  onChannelChange: (value: JobTrackingFilter) => void;
}

export function JobFilters({ query, channel, onQueryChange, onChannelChange }: JobFiltersProps) {
  const id = useId();
  return (
    <section className={styles.filters} aria-label="Filtrar vagas">
      <FormField
        label="Buscar por função, empresa ou local"
        name="jobSearch"
        type="search"
        placeholder="Ex.: recepcionista, Fortaleza ou remoto"
        icon={<Search size={20} aria-hidden="true" />}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <div className={styles.selectField}>
        <label htmlFor={id}>Onde acompanhar</label>
        <select
          id={id}
          value={channel}
          onChange={(event) => {
            const selected = trackingOptions.find((option) => option.value === event.target.value);
            if (selected) onChannelChange(selected.value);
          }}
        >
          {trackingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
