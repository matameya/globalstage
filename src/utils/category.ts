import type { PlayerCategory } from '@/types';

/**
 * US Soccer uses an August 1 cutoff birth-year convention for age groups.
 * A player's "soccer age year" starts Aug 1 of the prior calendar year.
 */
export function calculateSeasonYear(referenceDate: Date = new Date()): number {
  const cutoffMonth = 7; // August (0-indexed)
  const year = referenceDate.getFullYear();
  return referenceDate.getMonth() >= cutoffMonth ? year + 1 : year;
}

export function calculateCategory(dateOfBirthIso: string, referenceDate: Date = new Date()): PlayerCategory {
  const dob = new Date(dateOfBirthIso);
  const seasonYear = calculateSeasonYear(referenceDate);
  const age = seasonYear - dob.getFullYear();

  if (age <= 8) return 'U8';
  if (age === 9) return 'U9';
  if (age === 10) return 'U10';
  if (age === 11) return 'U11';
  if (age === 12) return 'U12';
  if (age === 13) return 'U13';
  if (age === 14) return 'U14';
  if (age === 15) return 'U15';
  if (age === 16) return 'U16';
  if (age === 17) return 'U17';
  if (age === 18) return 'U18';
  return 'U19+';
}

export function formatAge(dateOfBirthIso: string): number {
  const dob = new Date(dateOfBirthIso);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}
