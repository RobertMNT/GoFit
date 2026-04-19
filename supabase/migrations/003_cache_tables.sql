-- ============================================================
-- Migración 003 — Caché de ejercicios y planes
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Caché global de explicaciones de ejercicios
-- Clave: nombre del ejercicio normalizado (sin tildes, minúsculas)
CREATE TABLE IF NOT EXISTS public.exercise_cache (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      text NOT NULL UNIQUE,         -- clave de búsqueda normalizada
  data        jsonb NOT NULL,               -- respuesta JSON de Claude
  hit_count   integer NOT NULL DEFAULT 0,  -- nº de veces reutilizado
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Caché de planes por hash de parámetros del cuestionario
-- Clave: SHA-256 de los campos categóricos + buckets de edad/peso/altura + rol
-- Solo se cachea si el usuario no tiene restricciones de texto (estas son únicas)
CREATE TABLE IF NOT EXISTS public.plan_cache (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  answers_hash text NOT NULL UNIQUE,       -- clave SHA-256
  plan_data   jsonb NOT NULL,              -- JSON del plan (semanas, nombre, etc.)
  hit_count   integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Sin RLS — solo accesible desde service role (API routes server-side)
-- No contiene datos personales de usuarios
