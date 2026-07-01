// Indian phone number validation. We only accept +91 followed by a
// 10-digit number that starts with 6, 7, 8 or 9 (valid Indian mobile range).
const INDIA_E164 = /^\+91[6-9]\d{9}$/;

export function isIndianPhone(phone: string): boolean {
  return INDIA_E164.test(phone);
}

// Normalise common inputs to E.164 (+91XXXXXXXXXX). Returns null if invalid.
export function normalizeIndianPhone(raw: string): string | null {
  if (!raw) return null;
  let p = raw.replace(/[\s\-()]/g, '');
  if (p.startsWith('0')) p = p.slice(1);
  if (/^[6-9]\d{9}$/.test(p)) p = '+91' + p;
  if (p.startsWith('91') && p.length === 12) p = '+' + p;
  return isIndianPhone(p) ? p : null;
}
