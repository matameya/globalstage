# Global Stage

A native mobile app (iOS/Android, plus web via Expo) for families and players
in development stages (U8–U18) across the USA and Canada. Families discover
and register for Global Stage tournaments with a deposit + installment plan,
and access free player-development content between events.

This repo ships the **P0 MVP** end-to-end, running entirely on bundled sample
data so it works with zero backend configuration. The architecture is shaped
so P1 (professional services) and P2 (marketplace, passport) slot in without
reworking what's here.

## Stack

- **App**: React Native + Expo (SDK 57) + TypeScript, file-based routing via `expo-router`.
- **Backend (ready, not required for P0)**: Supabase (Postgres + Auth + Storage + Row Level Security). See `supabase/schema.sql`.
- **Payments (ready, not required for P0)**: Stripe (`@stripe/stripe-react-native`). Deposit + installment scheduling is backend-agnostic business logic in `src/services/paymentPlan.ts`.
- **State**: Zustand, persisted to `AsyncStorage` (family/guardian, players, registrations, notifications).
- **i18n**: i18next / react-i18next, English default + French (Quebec), device-locale detection via `expo-localization`.
- **Maps**: `react-native-maps` on iOS/Android; a list-based fallback on web (see "Platform notes" below).
- **Push**: `expo-notifications`.
- **Offline PDFs**: `expo-file-system`'s `File`/`Directory` API (native only — see below).

## Why it runs without a backend

Every screen reads and writes through `src/services/*` (tournaments, content,
payment plans) and `src/store/*` (family, registrations, notifications) —
never directly against Supabase or Stripe. Today those services read from
`src/data/sampleTournaments.ts` / `sampleContent.ts` and the stores persist to
`AsyncStorage` on-device. To go live:

1. Fill in `.env.local` (copy from `.env.example`) with your Supabase project URL/anon key and Stripe publishable key.
2. Run `supabase/schema.sql` against your Supabase project (creates tables + RLS policies).
3. Swap the bodies of `src/services/tournaments.ts` and `src/services/content.ts` for Supabase queries, and swap `src/lib/stripe.ts`'s `simulateChargeCard` for a real PaymentIntent confirmation.

No screen code needs to change — they only ever call the service functions.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional for P0 — the app works with this left blank
npm run start                # then press i / a / w, or scan the QR code with Expo Go
```

- `npm run ios` / `npm run android` / `npm run web` start directly on that platform.
- `npx tsc --noEmit` type-checks the whole project.

## Project structure

```
app/                          expo-router routes (file-based)
  onboarding/                  welcome carousel → signup → parental consent → add first player
  (tabs)/                      the four main tabs
    discover/                  list+map search, filters, tournament detail
    content/                   free tips/PDFs/videos feed + detail
    my-tournaments.tsx         registrations, payment schedule, countdown
    account/                   guardian + players, notifications, help
  registration/[tournamentId]/ select player → waivers → payment → confirmation
src/
  components/                  shared UI (Button, Card, Chip, forms, cards, TournamentMap.native/.web)
  data/                        bundled sample tournaments + content
  services/                    data-access layer (swap for Supabase here)
  store/                       Zustand stores (family, registrations, notifications, drafts)
  lib/                         supabase client, Stripe stub, push notifications, offline downloads
  i18n/                        en/fr translation resources
  theme/                       colors, spacing, typography tokens
  types/                       shared TypeScript types mirroring the DB schema
  utils/                       age-category calculation, currency/date formatting
supabase/schema.sql            Postgres schema + RLS policies for every P0 table
```

## Data model (P0)

`Guardian` (adult, legal signer) → `Player` (minor, one or more per family) →
`Registration` (individual only in P0) → `Payment` (deposit / installment /
full schedule). `Tournament` and `ContentItem` are public catalog data.
`Document` holds waiver/policy/packing-list URLs. See `src/types/index.ts` for
the full shape and `supabase/schema.sql` for the backing tables — the two are
kept in sync by hand since P0 has no backend codegen step.

Age category (`U8`…`U19+`) is calculated from date of birth using the US
Soccer August 1 cutoff convention, both client-side (`src/utils/category.ts`)
and again in Postgres via a trigger (`calculate_player_category` in
`supabase/schema.sql`), so the two never drift.

## Compliance (COPPA / PIPEDA)

- The **guardian**, never the player, creates the account, consents, and pays. Player profiles cannot be created before parental consent + privacy policy acceptance (`app/onboarding/consent.tsx`).
- Player profiles collect only what's needed to register and develop (name, DOB, position, foot, club, level, optional photo) — no player-facing advertising anywhere in the app.
- `guardians`/`players`/`registrations`/`payments` are all RLS-scoped to `guardian_id = auth.uid()` in `supabase/schema.sql`, so one family's data is never reachable by another.

## Payment plan logic

`src/services/paymentPlan.ts` builds either:
- **Full payment**: one charge today.
- **Deposit + installments**: a 25% deposit today, then the remainder split evenly across up to 4 monthly installments, timed to land before the tournament's registration deadline.

The registration flow (`app/registration/[tournamentId]/payment.tsx`) previews
the schedule before charging, and confirmed registrations show the same
schedule with due dates in **My Tournaments**.

## Platform notes

- **Maps**: `src/components/TournamentMap.native.tsx` (real `react-native-maps`) and `.web.tsx` (list fallback) are resolved automatically per-platform by Metro/TypeScript via `moduleSuffixes` in `tsconfig.json` — `react-native-maps` never ships in the web bundle.
- **Offline PDF downloads**: use `expo-file-system`'s native `File`/`Directory` API, which has no web equivalent; `src/lib/downloads.ts` no-ops on web (the browser's own download handling applies there instead).
- **Payments**: `src/lib/stripe.ts` currently simulates a successful charge after a short delay so the registration flow can be built/tested without a payments backend. Swap for a real `PaymentIntent` + `confirmPayment` call when a server is ready.

## Roadmap (architecture is ready; not built in P0)

- **P1**: internal, curated professional services (sports psychology, video analysis) — booking, Stripe Connect payouts, recorded video calls with guardian consent, delivery of results; travel/lodging add-ons (the `add_ons` column on `tournaments` and the `documents`/`payments` tables are already shaped for this); team/club registration; premium content tier.
- **P2**: external provider marketplace, in-person sessions, player passport / scout visibility, community features.

None of these require reworking P0 — they're new tables/services layered on top of the same guardian → player → registration chain.
