# FitAI — Diario de progreso

## 2026-03-29
- Proyecto iniciado
- Archivos de memoria creados: CLAUDE.md, docs/TASKS.md, docs/PROGRESS.md, docs/DECISIONS.md

### Fase 1 completada ✓
- Creado package.json manualmente (pnpm create next-app rechazó "Proyecto1" por mayúscula)
- Next.js 15.3.1 + TypeScript + Tailwind CSS configurados
- Estructura src/{app,components,lib,types,hooks}
- Variables de entorno: .env.local (vacío) + .env.example
- Clientes Supabase (browser+SSR), Stripe, Anthropic en src/lib/
- ESLint flat config + Prettier + prettier-plugin-tailwindcss
- Layout raíz con Geist font + metadata SEO completa (OG, Twitter, robots)
- Tipos TypeScript globales en src/types/database.ts
- pnpm lint: ✔

### Fase 2 completada ✓
- src/middleware.ts: protección rutas + verificación PRO en servidor
- src/hooks/use-user.ts: hook con onAuthStateChange
- src/components/auth/auth-form.tsx: login/registro + Google OAuth
- src/app/login/ + src/app/registro/
- src/app/auth/callback/route.ts: intercambio código OAuth por sesión SSR
- pnpm lint: ✔

### Fase 3 completada ✓
- supabase/migrations/001_initial_schema.sql: tablas users, questionnaires, plans, weekly_logs, subscriptions con RLS
- src/lib/questionnaire-schema.ts: schema Zod con 12 campos
- src/components/questionnaire/: QuestionnaireStep (8 pasos) + QuestionnaireForm (multi-step con navegación)
- src/app/onboarding/page.tsx
- pnpm lint: ✔

### Fase 4 completada ✓
- src/lib/plan-prompt.ts: prompt de sistema para generación de planes
- src/app/api/generar-plan/route.ts: endpoint con auth, check FREE (máx 1 plan), llamada Anthropic, validación Zod, guardado Supabase
- src/types/plan.ts: schema Zod para validar respuesta IA
- src/app/generar-plan/page.tsx: página de carga animada
- src/components/plan/plan-view.tsx: tabla semanal por semana con expandibles por día
- src/app/plan/[id]/page.tsx: Server Component con RLS
- pnpm lint: ✔

### Fase 5 completada ✓
- src/app/api/crear-checkout/route.ts: crea/reutiliza Stripe customer + sesión checkout
- src/app/api/stripe-webhook/route.ts: maneja subscription.created/updated/deleted, actualiza rol usuario
- src/app/precios/ + src/components/pricing/pricing-cards.tsx: FREE / PRO mensual (9€) / PRO anual (79€)
- Nota: crear productos en Stripe Dashboard manualmente y añadir price IDs a .env.local
- pnpm lint: ✔

### Fase 6 completada (parcial) ✓
- src/app/dashboard/page.tsx: historial de planes, CTA según rol FREE/PRO
- src/components/dashboard/plan-card.tsx
- src/app/plan/[id]/page.tsx ya implementado en Fase 4
- src/app/perfil/ + src/components/profile/profile-client.tsx: datos usuario + estado suscripción + logout
- Pendiente: seguimiento semanal + ajuste IA (Fase 6 extras)
- pnpm lint: ✔

## 2026-03-31

### Fase 6 completada ✓ (seguimiento semanal + ajuste IA)
- src/app/api/weekly-log/route.ts: upsert de días completados, verificación PRO en servidor
- src/components/plan/weekly-tracker.tsx: checkboxes por día con progreso circular, actualización optimista
- src/app/api/ajustar-plan/route.ts: lee weekly_logs, llama a Anthropic con prompt de progreso, devuelve JSON con ajustes por día
- src/components/plan/ajuste-ia.tsx: UI cliente para solicitar análisis IA y mostrar sugerencias
- src/app/plan/[id]/page.tsx: ahora pasa esPro + weeklyLogs al PlanView; carga logs del servidor
- src/components/plan/plan-view.tsx: integra WeeklyTracker y AjusteIA para PRO, banner upgrade para FREE
- src/hooks/use-user.ts: añadidos profile (UserProfile) e isPro al resultado del hook
- Correcciones de tipos pre-existentes: Zod .issues (no .errors), Stripe apiVersion "2026-03-25.dahlia", Stripe current_period_* desde item
- autoprefixer instalado (dependencia faltante)
- pnpm tsc --noEmit: ✔

### Fase 7 completada (parcial) ✓
- src/components/cookie-banner.tsx: banner RGPD con localStorage
- src/app/legal/ + src/app/privacidad/ + src/app/cookies/: páginas con placeholder Iubenda
- vercel.json: configuración de despliegue (región mad1 — Madrid)
- Pendiente manual: Iubenda, vars de entorno en Vercel, dominio, Search Console
- pnpm lint: ✔
