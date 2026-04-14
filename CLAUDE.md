# FitAI — Project Memory

## Stack
- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Pagos: Stripe (suscripciones)
- IA: Anthropic Claude API (claude-sonnet-4-20250514)
- Hosting: Vercel
- Legal: Iubenda (privacidad/cookies)

## Comandos clave
- Dev: pnpm dev
- Build: pnpm build
- Test: pnpm test
- Lint: pnpm lint

## Reglas de código — SIEMPRE
- Usar componentes React funcionales, NUNCA clases
- Nombres de archivos en kebab-case
- Variables y funciones en camelCase
- Tipos TypeScript estrictos — NUNCA usar `any`
- Imports nombrados — NUNCA default exports salvo en páginas Next.js
- Comentarios en español
- NUNCA hardcodear claves API — siempre desde variables de entorno
- NUNCA hacer commit sin confirmación del usuario

## Estructura de carpetas objetivo
src/
├── app/              # rutas Next.js App Router
├── components/       # componentes reutilizables
├── lib/              # utilidades, clientes (supabase, stripe, anthropic)
├── types/            # tipos TypeScript globales
└── hooks/            # custom hooks

## Modelo de negocio
- Plan FREE: 1 plan generado, sin historial
- Plan PRO (9€/mes): planes ilimitados + seguimiento semanal + ajuste IA

## Reglas de negocio — NUNCA violar
- El cuestionario de onboarding tiene entre 8 y 12 preguntas
- El plan generado por IA siempre devuelve JSON estructurado, nunca texto libre
- El acceso PRO se verifica en el servidor (middleware), nunca solo en cliente
- RGPD: no almacenar datos sensibles de salud sin consentimiento explícito
