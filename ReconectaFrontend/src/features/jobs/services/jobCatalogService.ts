export interface CatalogJob {
  id: number;
  titulo: string;
  empresa: string;
  modelo: string;
  localizacao: string;
  descricao: string;
  requisitos: string[];
  beneficios: string[];
}

export async function getJobCatalog(signal: AbortSignal): Promise<CatalogJob[]> {
  const endpoint = import.meta.env.VITE_JOBS_URL;
  if (!endpoint) return [];
  try {
    const response = await fetch(endpoint, {
      credentials: 'include',
      signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
    });
    if (!response.ok)
      throw new Error('Não foi possível consultar a lista de vagas. Tente novamente.');
    const body: unknown = await response.json();
    if (
      !body ||
      typeof body !== 'object' ||
      !('sucesso' in body) ||
      body.sucesso !== true ||
      !('vagas' in body) ||
      !Array.isArray(body.vagas) ||
      body.vagas.length > 200
    )
      throw new Error('O serviço devolveu uma lista de vagas inválida.');
    const ids = new Set<number>();
    return body.vagas.map((item: unknown) => {
      if (!item || typeof item !== 'object')
        throw new Error('O serviço devolveu uma vaga inválida.');
      const source = item as Record<string, unknown>;
      if (!Number.isSafeInteger(source.id) || ids.has(source.id as number))
        throw new Error('O serviço devolveu um identificador de vaga inválido.');
      ids.add(source.id as number);
      const job = { id: source.id } as CatalogJob;
      for (const field of ['titulo', 'empresa', 'modelo', 'localizacao', 'descricao'] as const) {
        const value = source[field];
        if (typeof value !== 'string' || !value.trim() || value.length > 30000)
          throw new Error('Faltaram informações para apresentar uma vaga.');
        job[field] = value.trim();
      }
      for (const field of ['requisitos', 'beneficios'] as const) {
        const value = source[field];
        if (
          !Array.isArray(value) ||
          value.length > 100 ||
          value.some((entry) => typeof entry !== 'string' || entry.length > 30000)
        )
          throw new Error('O serviço devolveu detalhes de vaga inválidos.');
        job[field] = value as string[];
      }
      return job;
    });
  } catch (error) {
    if (signal.aborted) throw error;
    if (error instanceof TypeError || error instanceof DOMException)
      throw new Error('Não foi possível carregar as vagas. Confira sua conexão e tente novamente.');
    if (error instanceof SyntaxError)
      throw new Error('O serviço devolveu uma lista de vagas inválida.');
    throw error;
  }
}
