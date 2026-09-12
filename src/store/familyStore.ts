import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Guardian, Player } from '@/types';
import { calculateCategory } from '@/utils/category';

interface FamilyState {
  guardian: Guardian | null;
  players: Player[];
  hasCompletedOnboarding: boolean;
  createGuardian: (input: { fullName: string; email: string; phone: string }) => void;
  recordConsent: (kind: 'parentalConsent' | 'privacyPolicy' | 'terms') => void;
  addPlayer: (input: {
    fullName: string;
    dateOfBirth: string;
    position: Player['position'];
    foot: Player['foot'];
    club: string | null;
    level: Player['level'];
    photoUrl: string | null;
  }) => Player;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  completeOnboarding: () => void;
  signOut: () => void;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      guardian: null,
      players: [],
      hasCompletedOnboarding: false,

      createGuardian: ({ fullName, email, phone }) => {
        const guardian: Guardian = {
          id: `guardian-${Date.now()}`,
          fullName,
          email,
          phone,
          verified: true,
          consents: {
            parentalConsentAcceptedAt: null,
            privacyPolicyAcceptedAt: null,
            termsAcceptedAt: null,
          },
          stripeCustomerId: null,
          createdAt: new Date().toISOString(),
        };
        set({ guardian });
      },

      recordConsent: (kind) => {
        const guardian = get().guardian;
        if (!guardian) return;
        const key =
          kind === 'parentalConsent'
            ? 'parentalConsentAcceptedAt'
            : kind === 'privacyPolicy'
              ? 'privacyPolicyAcceptedAt'
              : 'termsAcceptedAt';
        set({
          guardian: {
            ...guardian,
            consents: { ...guardian.consents, [key]: new Date().toISOString() },
          },
        });
      },

      addPlayer: (input) => {
        const guardian = get().guardian;
        const player: Player = {
          id: `player-${Date.now()}`,
          guardianId: guardian?.id ?? 'unknown',
          fullName: input.fullName,
          dateOfBirth: input.dateOfBirth,
          category: calculateCategory(input.dateOfBirth),
          position: input.position,
          foot: input.foot,
          club: input.club,
          level: input.level,
          photoUrl: input.photoUrl,
          createdAt: new Date().toISOString(),
        };
        set({ players: [...get().players, player] });
        return player;
      },

      updatePlayer: (id, updates) => {
        set({
          players: get().players.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...updates,
                  category: updates.dateOfBirth ? calculateCategory(updates.dateOfBirth) : p.category,
                }
              : p
          ),
        });
      },

      removePlayer: (id) => {
        set({ players: get().players.filter((p) => p.id !== id) });
      },

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      signOut: () => set({ guardian: null, players: [], hasCompletedOnboarding: false }),
    }),
    {
      name: 'globalstage-family',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function hasParentalConsent(guardian: Guardian | null): boolean {
  return Boolean(guardian?.consents.parentalConsentAcceptedAt && guardian?.consents.privacyPolicyAcceptedAt);
}
