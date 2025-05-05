export function getSingleProgressBar(translated: number, approved: number, total: number, length = 10): string {
  if (total === 0) return '⬜️'.repeat(length);
  const approvedBlocks = Math.round((approved / total) * length);
  const translatedBlocks = Math.round((translated / total) * length) - approvedBlocks;
  const emptyBlocks = length - approvedBlocks - translatedBlocks;
  const approvedBar = '🟩'.repeat(approvedBlocks);
  const translatedBar = '🟦'.repeat(translatedBlocks);
  const emptyBar = '⬜️'.repeat(emptyBlocks);
  return approvedBar + translatedBar + emptyBar;
} 