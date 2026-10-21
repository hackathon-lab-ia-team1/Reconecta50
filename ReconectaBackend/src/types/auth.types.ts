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
  passwordHash: string; // para hackathon usamos hash simples
  createdAt: string;
}

export interface SessionUser {
  id: string;
  fullName: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
}
