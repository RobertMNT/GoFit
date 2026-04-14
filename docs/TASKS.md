# FitAI — Task tracker

Actualizado automáticamente por Claude Code tras cada tarea completada.

## Fase 1 — Setup y estructura base
- [x] Inicializar proyecto Next.js 15 con TypeScript y Tailwind
- [x] Configurar estructura de carpetas según CLAUDE.md
- [x] Configurar variables de entorno (.env.local + .env.example)
- [x] Instalar y configurar cliente Supabase
- [x] Instalar y configurar cliente Stripe
- [x] Instalar SDK Anthropic
- [x] Configurar ESLint + Prettier
- [x] Crear layout raíz con fuentes y metadata SEO base

## Fase 2 — Autenticación
- [x] Configurar Supabase Auth (email + Google OAuth)
- [x] Crear página /login y /registro
- [x] Crear middleware de protección de rutas autenticadas
- [x] Crear hook useUser() para acceder al usuario en cliente
- [x] Gestionar sesión con cookies SSR (servidor y cliente sincronizados)

## Fase 3 — Onboarding y cuestionario
- [x] Diseñar esquema de base de datos (usuarios, cuestionarios, planes)
- [x] Crear tablas en Supabase con RLS (Row Level Security)
- [x] Construir componente Cuestionario (8-12 preguntas, multi-step)
- [x] Guardar respuestas del cuestionario en Supabase
- [x] Validar formulario con Zod antes de enviar

## Fase 4 — Generación de planes con IA
- [x] Crear prompt de sistema para generación de planes
- [x] Crear endpoint API /api/generar-plan
- [x] Parsear respuesta IA como JSON estructurado
- [x] Renderizar el plan generado en UI (tabla semanal)
- [x] Guardar plan en Supabase vinculado al usuario

## Fase 5 — Pagos y suscripciones
- [ ] Crear productos y precios en Stripe (mensual 9€ + anual 79€) — manual en Stripe Dashboard
- [x] Crear endpoint /api/crear-checkout
- [x] Crear webhook /api/stripe-webhook (activar/desactivar PRO)
- [x] Guardar estado de suscripción en perfil de usuario Supabase
- [x] Middleware que bloquea funciones PRO a usuarios FREE
- [x] Página /precios con planes FREE vs PRO

## Fase 6 — Dashboard de usuario
- [x] Página /dashboard con historial de planes
- [x] Página /plan/[id] con detalle del plan activo
- [x] Componente de seguimiento semanal (registrar ejercicios hechos)
- [x] Lógica de ajuste IA basada en progreso registrado
- [x] Página /perfil con datos del usuario y gestión de suscripción

## Fase 7 — Legal y producción
- [ ] Integrar Iubenda (aviso legal + política privacidad + cookies) — requiere cuenta Iubenda
- [x] Banner de cookies RGPD
- [x] Página /legal, /privacidad, /cookies
- [ ] Variables de entorno configuradas en Vercel — manual
- [ ] Despliegue en Vercel con dominio personalizado — manual
- [ ] Google Search Console configurado — manual
