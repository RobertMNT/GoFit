-- ============================================================
-- FitAI — Esquema inicial de base de datos
-- Ejecutar en Supabase SQL Editor o con supabase db push
-- ============================================================

-- Extensión para UUIDs
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLA: users (extiende auth.users de Supabase)
-- ============================================================
create table if not exists public.users (
  id           uuid references auth.users(id) on delete cascade primary key,
  email        text not null,
  full_name    text,
  avatar_url   text,
  role         text not null default 'free' check (role in ('free', 'pro')),
  stripe_customer_id text unique,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Trigger para rellenar users automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger para actualizar updated_at automáticamente
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- TABLA: questionnaires (respuestas del cuestionario de onboarding)
-- ============================================================
create table if not exists public.questionnaires (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  answers    jsonb not null,
  created_at timestamptz not null default now()
);

create index questionnaires_user_id_idx on public.questionnaires(user_id);

-- ============================================================
-- TABLA: plans (planes de entrenamiento generados por IA)
-- ============================================================
create table if not exists public.plans (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references public.users(id) on delete cascade,
  questionnaire_id   uuid not null references public.questionnaires(id) on delete cascade,
  nombre             text not null,
  descripcion        text not null,
  duracion_semanas   integer not null check (duracion_semanas > 0),
  semanas            jsonb not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index plans_user_id_idx on public.plans(user_id);

create trigger plans_updated_at
  before update on public.plans
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- TABLA: weekly_logs (seguimiento semanal de ejercicios)
-- ============================================================
create table if not exists public.weekly_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  plan_id    uuid not null references public.plans(id) on delete cascade,
  semana     integer not null check (semana > 0),
  dia        text not null,
  completado boolean not null default false,
  notas      text,
  created_at timestamptz not null default now()
);

create index weekly_logs_user_plan_idx on public.weekly_logs(user_id, plan_id);
create unique index weekly_logs_unique_entry on public.weekly_logs(user_id, plan_id, semana, dia);

-- ============================================================
-- TABLA: subscriptions (suscripciones Stripe)
-- ============================================================
create table if not exists public.subscriptions (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null references public.users(id) on delete cascade,
  stripe_subscription_id  text not null unique,
  stripe_customer_id      text not null,
  status                  text not null,
  price_id                text not null,
  current_period_start    timestamptz not null,
  current_period_end      timestamptz not null,
  cancel_at_period_end    boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — cada usuario solo accede a sus datos
-- ============================================================

alter table public.users enable row level security;
alter table public.questionnaires enable row level security;
alter table public.plans enable row level security;
alter table public.weekly_logs enable row level security;
alter table public.subscriptions enable row level security;

-- users: CRUD solo sobre el propio perfil
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- questionnaires: CRUD completo solo sobre los propios registros
create policy "questionnaires_select_own" on public.questionnaires
  for select using (auth.uid() = user_id);

create policy "questionnaires_insert_own" on public.questionnaires
  for insert with check (auth.uid() = user_id);

-- plans: CRUD completo solo sobre los propios planes
create policy "plans_select_own" on public.plans
  for select using (auth.uid() = user_id);

create policy "plans_insert_own" on public.plans
  for insert with check (auth.uid() = user_id);

create policy "plans_update_own" on public.plans
  for update using (auth.uid() = user_id);

create policy "plans_delete_own" on public.plans
  for delete using (auth.uid() = user_id);

-- weekly_logs: CRUD completo solo sobre los propios registros
create policy "weekly_logs_select_own" on public.weekly_logs
  for select using (auth.uid() = user_id);

create policy "weekly_logs_insert_own" on public.weekly_logs
  for insert with check (auth.uid() = user_id);

create policy "weekly_logs_update_own" on public.weekly_logs
  for update using (auth.uid() = user_id);

-- subscriptions: solo lectura para el usuario; escritura solo desde service role
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);
