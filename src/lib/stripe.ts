export const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export const isStripeConfigured = Boolean(stripePublishableKey);

/**
 * P0 stub: simulates a Stripe PaymentIntent confirmation so the registration
 * flow can be built and tested end-to-end before a payments backend exists.
 * Swap for a real call to your server (which creates the PaymentIntent with
 * Stripe secret key) + @stripe/stripe-react-native's confirmPayment.
 */
export async function simulateChargeCard(params: {
  amount: number;
  currency: 'usd' | 'cad';
  description: string;
}): Promise<{ success: true; paymentIntentId: string }> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return {
    success: true,
    paymentIntentId: `pi_sim_${Date.now()}_${Math.round(params.amount * 100)}`,
  };
}
