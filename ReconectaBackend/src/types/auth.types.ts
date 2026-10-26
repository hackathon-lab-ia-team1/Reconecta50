export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
  password: string;
  passwordHint?: string;
}

export interface UserRecord {
  id: string;
  fullName: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
  passwordHash: string;
  passwordHint?: string;
  createdAt: string;
}

/**
 * Dados públicos do usuário retornados pela API.
 * Limitado a id e fullName para não expor PII desnecessariamente.
 */
export interface PublicUser {
  id: string;
  fullName: string;
}

/**
 * Dados do usuário disponíveis na sessão (server-side).
 */
export interface SessionUser {
  id: string;
  fullName: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
}
