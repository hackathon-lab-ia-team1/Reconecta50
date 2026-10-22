import type { RegistrationErrors, RegistrationValues } from '../types/registration';

function isValidCpf(value: string): boolean {
  if (/[^\d.\s-]/.test(value)) return false;
  const digits = value.replace(/\D/g, '');
  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) return false;
  for (let length = 9; length <= 10; length++) {
    const sum = Array.from(digits.slice(0, length)).reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    if ((remainder === 10 ? 0 : remainder) !== Number(digits[length])) return false;
  }
  return true;
}

export function validateRegistration(values: RegistrationValues, today = new Date()): RegistrationErrors {
  const errors: RegistrationErrors = {};
  if (values.fullName.trim().split(/\s+/).filter(Boolean).length < 2) errors.fullName = 'Informe seu nome e sobrenome.';
  if (!/^\d{10,11}$/.test(values.phone.replace(/\D/g, '')) || /[^\d\s().-]/.test(values.phone)) errors.phone = 'Informe um telefone com DDD, com 10 ou 11 dígitos.';
  if (!isValidCpf(values.cpf)) errors.cpf = 'Informe um CPF válido com 11 dígitos.';

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(values.birthDate);
  const birth = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
  if (!birth || !match || birth.getFullYear() !== Number(match[1]) || birth.getMonth() !== Number(match[2]) - 1 || birth.getDate() !== Number(match[3]) || birth > today) {
    errors.birthDate = 'Informe uma data de nascimento válida.';
  } else {
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    if (age < 50) errors.birthDate = 'O Reconecta 50+ é destinado a pessoas com 50 anos ou mais.';
  }
  if (!values.address.trim()) errors.address = 'Informe seu endereço.';
  if (values.password.length < 8 || !values.password.trim()) errors.password = 'Crie uma senha com pelo menos 8 caracteres.';
  return errors;
}
