export interface RegistrationValues {
  fullName: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
  password: string;
  passwordHint?: string;
}

export type RegistrationErrors = Partial<Record<keyof RegistrationValues, string>>;
export type RegistrationData = RegistrationValues;
