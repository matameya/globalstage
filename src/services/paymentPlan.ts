import type { PaymentPlanType, PaymentScheduleItem, Tournament } from '@/types';

const DEPOSIT_RATIO = 0.25;
const MAX_INSTALLMENTS = 4;

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

/**
 * Builds a payment schedule for a registration.
 * - 'full': a single charge today.
 * - 'deposit_plus_installments': a deposit due today, then evenly split
 *   remaining installments monthly, with the last one landing at least
 *   7 days before the registration deadline.
 */
export function buildPaymentSchedule(tournament: Tournament, plan: PaymentPlanType): PaymentScheduleItem[] {
  const today = new Date().toISOString().slice(0, 10);

  if (plan === 'full') {
    return [
      {
        id: 'full',
        label: 'Full payment',
        type: 'full',
        amount: tournament.price,
        dueDate: today,
        status: 'upcoming',
      },
    ];
  }

  const deposit = Math.round(tournament.price * DEPOSIT_RATIO);
  const remaining = tournament.price - deposit;

  const deadline = new Date(tournament.registrationDeadline);
  const now = new Date();
  const monthsUntilDeadline = Math.max(
    1,
    Math.min(
      MAX_INSTALLMENTS,
      Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30))
    )
  );

  const installmentCount = Math.max(1, monthsUntilDeadline);
  const baseInstallment = Math.floor(remaining / installmentCount);
  const roundingRemainder = remaining - baseInstallment * installmentCount;

  const schedule: PaymentScheduleItem[] = [
    {
      id: 'deposit',
      label: 'Deposit to reserve spot',
      type: 'deposit',
      amount: deposit,
      dueDate: today,
      status: 'upcoming',
    },
  ];

  for (let i = 0; i < installmentCount; i++) {
    schedule.push({
      id: `installment-${i + 1}`,
      label: `Installment ${i + 1} of ${installmentCount}`,
      type: 'installment',
      amount: baseInstallment + (i === installmentCount - 1 ? roundingRemainder : 0),
      dueDate: addMonths(today, i + 1),
      status: 'upcoming',
    });
  }

  return schedule;
}
