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
}
