export function getInitials(name: string): string {
  if (!name) return 'AK';
  const trimmed = name.trim();
  // Check for specific mockup names
  if (trimmed.includes('ProjectACK') || trimmed.includes('kingenious0')) return 'PA';
  if (trimmed.toLowerCase().includes('vercel')) return 'CI';
  if (trimmed.toLowerCase() === 'hardik') return 'HK';
  if (trimmed.toLowerCase().includes('copilot')) return 'AI';
  if (trimmed.toLowerCase().includes('kernel') || trimmed.toLowerCase().includes('linux')) return 'LK';

  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    const repo = parts[parts.length - 1].trim();
    const cleanRepo = repo.replace(/[^a-zA-Z]/g, '');
    if (cleanRepo.length >= 2) return cleanRepo.slice(0, 2).toUpperCase();
    return repo.slice(0, 2).toUpperCase();
  }

  const clean = trimmed.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase() || 'AK';
}
