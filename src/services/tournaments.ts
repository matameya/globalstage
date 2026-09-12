import { sampleTournaments, getTournamentById } from '@/data/sampleTournaments';
import type { Tournament, TournamentFilters } from '@/types';

/**
 * P0 reads from bundled sample data. Replace the body of these functions with
 * Supabase queries (see supabase/schema.sql `tournaments` table) once a
 * backend is live — callers never need to change.
 */
export async function listTournaments(filters?: Partial<TournamentFilters>): Promise<Tournament[]> {
  let results = [...sampleTournaments];

  if (filters?.dateFrom) {
    results = results.filter((t) => t.startDate >= filters.dateFrom!);
  }
  if (filters?.dateTo) {
    results = results.filter((t) => t.startDate <= filters.dateTo!);
  }
  if (filters?.stateOrProvince) {
    results = results.filter((t) => t.stateOrProvince === filters.stateOrProvince);
  }
  if (filters?.categories && filters.categories.length > 0) {
    results = results.filter((t) => t.categories.some((c) => filters.categories!.includes(c)));
  }
  if (filters?.level) {
    results = results.filter((t) => t.level === filters.level);
  }
  if (filters?.format) {
    results = results.filter((t) => t.format === filters.format);
  }
  if (filters?.gender) {
    results = results.filter((t) => t.gender === filters.gender || t.gender === 'coed');
  }

  return results.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function getTournament(id: string): Promise<Tournament | undefined> {
  return getTournamentById(id);
}

export function listAvailableStates(): string[] {
  return Array.from(new Set(sampleTournaments.map((t) => t.stateOrProvince))).sort();
}
