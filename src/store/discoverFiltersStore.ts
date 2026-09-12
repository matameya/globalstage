import { create } from 'zustand';
import type { TournamentFilters } from '@/types';

const emptyFilters: TournamentFilters = {
  dateFrom: null,
  dateTo: null,
  stateOrProvince: null,
  categories: [],
  level: null,
  format: null,
  gender: null,
};

interface DiscoverFiltersState {
  filters: TournamentFilters;
  setFilters: (filters: TournamentFilters) => void;
  reset: () => void;
}

export const useDiscoverFiltersStore = create<DiscoverFiltersState>((set) => ({
  filters: emptyFilters,
  setFilters: (filters) => set({ filters }),
  reset: () => set({ filters: emptyFilters }),
}));

export function countActiveFilters(filters: TournamentFilters): number {
  let count = 0;
  if (filters.dateFrom || filters.dateTo) count++;
  if (filters.stateOrProvince) count++;
  if (filters.categories.length > 0) count++;
  if (filters.level) count++;
  if (filters.format) count++;
  if (filters.gender) count++;
  return count;
}
