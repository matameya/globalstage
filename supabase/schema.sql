-- Global Stage — P0 database schema
--
-- Design notes:
-- * `guardians.id` is the same UUID as the Supabase Auth user (auth.uid()).
--   This lets every RLS policy below chain back to auth.uid() without an
--   extra join, and keeps "one guardian = one auth user" enforced by the FK.
-- * Players, registrations, and payments are only ever reachable through
--   their owning guardian, so a family can only ever see its own data.
-- * Tournaments and content_items are public catalog data — readable by any
--   signed-in guardian, writable only by the service role (import scripts,
--   admin tooling), never by the app's anon/authenticated client.
-- * `add_ons` (jsonb) on tournaments and the `add_ons` table are modeled now
--   so P1 travel/lodging add-ons don't require a migration, but nothing in
--   P0 writes to them.

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type player_category as enum (
  'U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18','U19+'
);
create type playing_foot as enum ('left', 'right', 'both');
create type player_level as enum ('recreational', 'competitive', 'elite', 'academy');
create type player_position as enum ('goalkeeper', 'defender', 'midfielder', 'forward', 'flexible');
create type tournament_format as enum ('7v7', '9v9', '11v11');
create type tournament_gender as enum ('boys', 'girls', 'coed');
create type registration_status as enum ('pending_payment', 'confirmed', 'cancelled', 'waitlisted');
create type payment_plan_type as enum ('deposit_plus_installments', 'full');
create type payment_item_type as enum ('deposit', 'installment', 'full');
create type payment_status as enum ('paid', 'upcoming', 'overdue');
create type content_type as enum ('tip', 'pdf', 'video');

-- ---------------------------------------------------------------------------
-- Guardians (the account holder / legal signer — COPPA/PIPEDA consent lives here)
-- ---------------------------------------------------------------------------

create table guardians (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  verified boolean not null default false,
  parental_consent_accepted_at timestamptz,
  privacy_policy_accepted_at timestamptz,
  terms_accepted_at timestamptz,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

alter table guardians enable row level security;

create policy "guardians select own row"
  on guardians for select
  using (id = auth.uid());

create policy "guardians update own row"
  on guardians for update
  using (id = auth.uid());

create policy "guardians insert own row"
  on guardians for insert
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Players (minors — minimum data needed to register + develop)
-- ---------------------------------------------------------------------------

create table players (
  id uuid primary key default uuid_generate_v4(),
  guardian_id uuid not null references guardians(id) on delete cascade,
  full_name text not null,
  date_of_birth date not null,
  category player_category not null,
  position player_position not null default 'flexible',
  foot playing_foot not null default 'right',
  club text,
  level player_level not null default 'recreational',
  photo_url text,
  created_at timestamptz not null default now()
);

create index players_guardian_id_idx on players(guardian_id);

-- Keep `category` correct even if a client sends a stale value, using the
-- same Aug 1 cutoff convention as src/utils/category.ts.
create or replace function calculate_player_category(dob date, reference date default current_date)
returns player_category
language plpgsql
immutable
as $$
declare
  season_year int;
  age int;
begin
  season_year := case
    when extract(month from reference) >= 8 then extract(year from reference)::int + 1
    else extract(year from reference)::int
  end;
  age := season_year - extract(year from dob)::int;

  return case
    when age <= 8 then 'U8'
    when age = 9 then 'U9'
    when age = 10 then 'U10'
    when age = 11 then 'U11'
    when age = 12 then 'U12'
    when age = 13 then 'U13'
    when age = 14 then 'U14'
    when age = 15 then 'U15'
    when age = 16 then 'U16'
    when age = 17 then 'U17'
    when age = 18 then 'U18'
    else 'U19+'
  end::player_category;
end;
$$;

create or replace function set_player_category()
returns trigger
language plpgsql
as $$
begin
  new.category := calculate_player_category(new.date_of_birth);
  return new;
end;
$$;

create trigger players_set_category
  before insert or update of date_of_birth on players
  for each row execute function set_player_category();

alter table players enable row level security;

create policy "guardians manage own players"
  on players for all
  using (guardian_id = auth.uid())
  with check (guardian_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Tournaments (public catalog — read-only for app clients)
-- ---------------------------------------------------------------------------

create table tournaments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text not null,
  state_or_province text not null,
  country text not null check (country in ('USA', 'Canada')),
  venue text not null,
  lat double precision not null,
  lng double precision not null,
  start_date date not null,
  end_date date not null,
  categories player_category[] not null,
  format tournament_format not null,
  gender tournament_gender not null,
  price numeric(10, 2) not null,
  currency text not null check (currency in ('USD', 'CAD')),
  spots integer not null,
  spots_available integer not null,
  registration_deadline date not null,
  includes text[] not null default '{}',
  hero_image_url text,
  gallery_urls text[] not null default '{}',
  add_ons jsonb not null default '[]', -- prepared for P1 travel/lodging add-ons; unused in P0
  level player_level not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create index tournaments_start_date_idx on tournaments(start_date);
create index tournaments_state_idx on tournaments(state_or_province);

alter table tournaments enable row level security;

create policy "anyone can read tournaments"
  on tournaments for select
  using (true);

-- No insert/update/delete policy is defined for anon/authenticated roles:
-- tournaments are managed via the service role (admin import tooling).

-- ---------------------------------------------------------------------------
-- Registrations (individual only in P0 — team/club registration is P1)
-- ---------------------------------------------------------------------------

create table registrations (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  tournament_id uuid not null references tournaments(id) on delete restrict,
  type text not null default 'individual' check (type = 'individual'),
  status registration_status not null default 'pending_payment',
  medical_consent boolean not null default false,
  image_release boolean not null default false,
  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  emergency_contact_relationship text not null,
  medical_notes text,
  payment_plan payment_plan_type not null,
  created_at timestamptz not null default now()
);

create index registrations_player_id_idx on registrations(player_id);
create index registrations_tournament_id_idx on registrations(tournament_id);

alter table registrations enable row level security;

create policy "guardians manage own registrations"
  on registrations for all
  using (player_id in (select id from players where guardian_id = auth.uid()))
  with check (player_id in (select id from players where guardian_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Payments (deposit / installments / full — the schedule for one registration)
-- ---------------------------------------------------------------------------

create table payments (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid not null references registrations(id) on delete cascade,
  label text not null,
  type payment_item_type not null,
  amount numeric(10, 2) not null,
  due_date date not null,
  status payment_status not null default 'upcoming',
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

create index payments_registration_id_idx on payments(registration_id);

alter table payments enable row level security;

create policy "guardians manage own payments"
  on payments for all
  using (
    registration_id in (
      select r.id from registrations r
      join players p on p.id = r.player_id
      where p.guardian_id = auth.uid()
    )
  )
  with check (
    registration_id in (
      select r.id from registrations r
      join players p on p.id = r.player_id
      where p.guardian_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Content (free in P0 — consejos / PDFs / videos)
-- ---------------------------------------------------------------------------

create table content_items (
  id uuid primary key default uuid_generate_v4(),
  type content_type not null,
  title text not null,
  topic text not null,
  age_category player_category[] not null default '{}',
  position player_position[] not null default '{}',
  summary text not null default '',
  media_url text,
  thumbnail_url text,
  duration_minutes integer,
  access text not null default 'free' check (access = 'free'), -- premium access ships in P1
  published_at timestamptz not null default now()
);

create index content_items_topic_idx on content_items(topic);

alter table content_items enable row level security;

create policy "anyone can read content"
  on content_items for select
  using (true);

-- ---------------------------------------------------------------------------
-- Documents (waivers, policies, packing lists — attached to a registration)
-- ---------------------------------------------------------------------------

create table documents (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid references registrations(id) on delete cascade,
  type text not null, -- 'waiver' | 'policy' | 'packing_list'
  url text not null,
  created_at timestamptz not null default now()
);

alter table documents enable row level security;

create policy "guardians manage own documents"
  on documents for all
  using (
    registration_id is null
    or registration_id in (
      select r.id from registrations r
      join players p on p.id = r.player_id
      where p.guardian_id = auth.uid()
    )
  )
  with check (
    registration_id is null
    or registration_id in (
      select r.id from registrations r
      join players p on p.id = r.player_id
      where p.guardian_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- P1/P2 tables are intentionally NOT created here (providers, bookings,
-- sessions, team rosters). Add them as their own migration when that phase
-- starts so this file stays a true record of what's live in P0.
-- ---------------------------------------------------------------------------
