# FitAI — Decisiones técnicas

## Stack elegido
- Next.js 15 App Router: mejor SEO y rendimiento que Pages Router
- Supabase sobre Firebase: PostgreSQL real, RLS nativo, mejor para datos relacionales
- Claude claude-sonnet-4-20250514: mejor relación calidad/coste para generación de planes
- Stripe Billing: estándar para SaaS europeo, soporte IVA nativo

## Modelo de datos
- users: extensión de auth.users de Supabase
- questionnaires: respuestas del cuestionario por usuario
- plans: planes generados, vinculados a questionnaire_id
- weekly_logs: registros de seguimiento semanal
- subscriptions: estado de suscripción Stripe por usuario
