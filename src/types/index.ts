export type PlayerCategory =
  | 'U8' | 'U9' | 'U10' | 'U11' | 'U12' | 'U13' | 'U14' | 'U15' | 'U16' | 'U17' | 'U18' | 'U19+';

export type PlayingFoot = 'left' | 'right' | 'both';

export type PlayerLevel = 'recreational' | 'competitive' | 'elite' | 'academy';

export type PlayerPosition =
  | 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'flexible';

export interface Guardian {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  verified: boolean;
  consents: {
    parentalConsentAcceptedAt: string | null;
    privacyPolicyAcceptedAt: string | null;
    termsAcceptedAt: string | null;
  };
  stripeCustomerId: string | null;
  createdAt: string;
}

export interface Player {
  id: string;
  guardianId: string;
  fullName: string;
  dateOfBirth: string; // ISO date
  category: PlayerCategory;
  position: PlayerPosition;
  foot: PlayingFoot;
  club: string | null;
  level: PlayerLevel;
  photoUrl: string | null;
  createdAt: string;
}

export type TournamentFormat = '7v7' | '9v9' | '11v11';
export type TournamentGender = 'boys' | 'girls' | 'coed';

export interface TournamentAddOn {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Tournament {
  id: string;
  name: string;
  city: string;
  stateOrProvince: string;
  country: 'USA' | 'Canada';
  venue: string;
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
  categories: PlayerCategory[];
  format: TournamentFormat;
  gender: TournamentGender;
  price: number;
  currency: 'USD' | 'CAD';
  spots: number;
  spotsAvailable: number;
  registrationDeadline: string;
  includes: string[];
  heroImageUrl: string;
  galleryUrls: string[];
  addOns: TournamentAddOn[];
  level: PlayerLevel;
  description: string;
}

export type PaymentPlanType = 'deposit_plus_installments' | 'full';

export interface PaymentScheduleItem {
  id: string;
  label: string;
  type: 'deposit' | 'installment' | 'full';
  amount: number;
  dueDate: string;
  status: 'paid' | 'upcoming' | 'overdue';
}

export interface Waivers {
  medicalConsent: boolean;
  imageRelease: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  medicalNotes: string;
}

export type RegistrationStatus = 'pending_payment' | 'confirmed' | 'cancelled' | 'waitlisted';

export interface Registration {
  id: string;
  playerId: string;
  tournamentId: string;
  type: 'individual';
  status: RegistrationStatus;
  waivers: Waivers;
  paymentPlan: PaymentPlanType;
  paymentSchedule: PaymentScheduleItem[];
  createdAt: string;
}

export type ContentType = 'tip' | 'pdf' | 'video';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  topic: string;
  ageCategory: PlayerCategory[];
  position: PlayerPosition[];
  summary: string;
  mediaUrl: string;
  thumbnailUrl: string;
  durationMinutes: number | null;
  access: 'free';
  publishedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  kind: 'payment_reminder' | 'logistics' | 'content' | 'general';
  createdAt: string;
  read: boolean;
}

export interface TournamentFilters {
  dateFrom: string | null;
  dateTo: string | null;
  stateOrProvince: string | null;
  categories: PlayerCategory[];
  level: PlayerLevel | null;
  format: TournamentFormat | null;
  gender: TournamentGender | null;
}
