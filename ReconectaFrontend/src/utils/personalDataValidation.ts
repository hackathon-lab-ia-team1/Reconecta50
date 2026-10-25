export function getFullNameError(value: string): string | undefined {
  if (value.trim().split(/\s+/).filter(Boolean).length < 2) return 'Informe seu nome e sobrenome.';
}

export function getPhoneError(value: string): string | undefined {
  if (!/^\d{10,11}$/.test(value.replace(/\D/g, '')) || /[^\d\s().-]/.test(value))
    return 'Informe um telefone com DDD, com 10 ou 11 dígitos.';
}

export function getBirthDateError(value: string, today = new Date()): string | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const birth = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
  if (
    !birth ||
    !match ||
    birth.getFullYear() !== Number(match[1]) ||
    birth.getMonth() !== Number(match[2]) - 1 ||
    birth.getDate() !== Number(match[3]) ||
    birth > today
  )
    return 'Informe uma data de nascimento válida.';

  const age =
    today.getFullYear() -
    birth.getFullYear() -
    (today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
      ? 1
      : 0);
  if (age > 100 || birth.getFullYear() < 1925)
    return 'Confira o ano de nascimento. O ano informado indica mais de 100 anos.';
}

export function formatPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCpfMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}
