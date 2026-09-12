import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PaymentPlanType, Registration, Waivers } from '@/types';
import { buildPaymentSchedule } from '@/services/paymentPlan';
import { getTournamentById } from '@/data/sampleTournaments';

interface RegistrationState {
  registrations: Registration[];
  createRegistration: (input: {
    playerId: string;
    tournamentId: string;
    waivers: Waivers;
    paymentPlan: PaymentPlanType;
  }) => Registration;
  markDepositPaid: (registrationId: string) => void;
  markInstallmentPaid: (registrationId: string, scheduleItemId: string) => void;
  registrationsForPlayer: (playerId: string) => Registration[];
}

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set, get) => ({
      registrations: [],

      createRegistration: ({ playerId, tournamentId, waivers, paymentPlan }) => {
        const tournament = getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        const schedule = buildPaymentSchedule(tournament, paymentPlan);
        const registration: Registration = {
          id: `reg-${Date.now()}`,
          playerId,
          tournamentId,
          type: 'individual',
          status: 'pending_payment',
          waivers,
          paymentPlan,
          paymentSchedule: schedule,
          createdAt: new Date().toISOString(),
        };

        set({ registrations: [...get().registrations, registration] });
        return registration;
      },

      markDepositPaid: (registrationId) => {
        set({
          registrations: get().registrations.map((r) => {
            if (r.id !== registrationId) return r;
            const schedule = r.paymentSchedule.map((item) =>
              item.type === 'deposit' || item.type === 'full' ? { ...item, status: 'paid' as const } : item
            );
            return { ...r, paymentSchedule: schedule, status: 'confirmed' as const };
          }),
        });
      },

      markInstallmentPaid: (registrationId, scheduleItemId) => {
        set({
          registrations: get().registrations.map((r) => {
            if (r.id !== registrationId) return r;
            return {
              ...r,
              paymentSchedule: r.paymentSchedule.map((item) =>
                item.id === scheduleItemId ? { ...item, status: 'paid' as const } : item
              ),
            };
          }),
        });
      },

      registrationsForPlayer: (playerId) => get().registrations.filter((r) => r.playerId === playerId),
    }),
    {
      name: 'globalstage-registrations',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
