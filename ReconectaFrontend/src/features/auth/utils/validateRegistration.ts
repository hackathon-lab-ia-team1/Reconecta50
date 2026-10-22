import type { RegistrationErrors, RegistrationValues } from '../types/registration';
import {
  getBirthDateError,
  getFullNameError,
  getPhoneError,
} from '../../../utils/personalDataValidation.ts';

function isValidCpf(value: string): boolean {
  if (/[^\d.\s-]/.test(value)) return false;
  const digits = value.replace(/\D/g, '');
  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) return false;
  for (let length = 9; length <= 10; length++) {
    const sum = Array.from(digits.slice(0, length)).reduce(
      (total, digit, index) => total + Number(digit) * (length + 1 - index),
      0,
    );
    const remainder = (sum * 10) % 11;
    if ((remainder === 10 ? 0 : remainder) !== Number(digits[length])) return false;
  }
  return true;
}

export function validateRegistration(
  values: RegistrationValues,
  today = new Date(),
): RegistrationErrors {
  const errors: RegistrationErrors = {};
  const fullNameError = getFullNameError(values.fullName);
  const phoneError = getPhoneError(values.phone);
  if (fullNameError) errors.fullName = fullNameError;
  if (phoneError) errors.phone = phoneError;
  if (!isValidCpf(values.cpf)) errors.cpf = 'Informe um CPF válido com 11 dígitos.';

  const birthDateError = getBirthDateError(values.birthDate, today);
  if (birthDateError) errors.birthDate = birthDateError;
  if (!values.address.trim()) errors.address = 'Informe seu endereço.';
  if (values.password.length < 8 || !values.password.trim())
    errors.password = 'Crie uma senha com pelo menos 8 caracteres.';
  return errors;
}
