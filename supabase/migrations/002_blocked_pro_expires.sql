-- ============================================================
-- Migración 002 — blocked + pro_expires_at en profiles
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Campo para bloquear usuarios (acceso denegado en middleware)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS blocked boolean NOT NULL DEFAULT false;

-- Campo para PRO manual con expiración (null = indefinido)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pro_expires_at timestamptz;

-- Índice para lookup rápido de bloqueados en middleware
CREATE INDEX IF NOT EXISTS profiles_blocked_idx
  ON public.profiles(blocked)
  WHERE blocked = true;
