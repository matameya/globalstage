import { create } from 'zustand';
import type { PaymentPlanType, Waivers } from '@/types';

const emptyWaivers: Waivers = {
  medicalConsent: false,
  imageRelease: false,
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  medicalNotes: '',
};

interface RegistrationDraftState {
  playerId: string | null;
  waivers: Waivers;
  paymentPlan: PaymentPlanType;
  setPlayerId: (id: string) => void;
  setWaivers: (w: Waivers) => void;
  setPaymentPlan: (p: PaymentPlanType) => void;
  reset: () => void;
}

export const useRegistrationDraftStore = create<RegistrationDraftState>((set) => ({
  playerId: null,
  waivers: emptyWaivers,
  paymentPlan: 'deposit_plus_installments',
  setPlayerId: (id) => set({ playerId: id }),
  setWaivers: (w) => set({ waivers: w }),
  setPaymentPlan: (p) => set({ paymentPlan: p }),
  reset: () => set({ playerId: null, waivers: emptyWaivers, paymentPlan: 'deposit_plus_installments' }),
}));
