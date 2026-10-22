export function safeApplicationUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function isValidApplicationEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@,;<>:]+@[^\s@,;<>:]+\.[^\s@,;<>:]+$/.test(value);
}
