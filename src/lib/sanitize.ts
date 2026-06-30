export function stripHtml(val: string): string {
  if (!val) return '';
  // Remove HTML tags using regex
  return val.replace(/<\/?[^>]+(>|$)/g, '');
}

export function escapeHtml(val: string): string {
  if (!val) return '';
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeText(val: string): string {
  return stripHtml(val).trim();
}
