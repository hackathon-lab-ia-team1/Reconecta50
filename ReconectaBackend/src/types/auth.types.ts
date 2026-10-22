// ─── Tipos de autenticação alinhados ao contrato do frontend ───

export interface LoginRequest {
  identifier: string;   // CPF ou telefone (apenas dígitos)
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  phone: string;        // apenas dígitos
  cpf: string;          // apenas dígitos (11)
  birthDate: string;    // YYYY-MM-DD
  address: string;
  password: string;
}

export interface UserRecord {
  id: string;
  fullName: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
  passwordHash: string;
  createdAt: string;
}

/**
 * Dados públicos do usuário retornados pela API.
 * Limitado a id e nome — NÃO inclui CPF, telefone, endereço ou data de nascimento.
 */
export interface PublicUser {
  id: string;
  fullName: string;
}

/**
 * Dados do usuário disponíveis na sessão (server-side).
 * Usado internamente pelo middleware; nunca enviado diretamente ao cliente.
 */
export interface SessionUser {
  id: string;
  fullName: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
}
