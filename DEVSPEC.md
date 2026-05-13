# DevTeam — Project Specification

## Vision

Construir un equipo de agentes de desarrollo autonomos que reciba un brief escueto y lo convierta en una aplicacion completa, probada y desplegable.

## Arquitectura

6 agentes autonomos conectados por sistema de archivos:
- Orchestrator (Cron: d47bfd31e948) → Brief → Specs → Task Queue → Quality Gate
- Backend (Cron: 75a5370fb9c9) → Models + DB + Endpoints
- Frontend (future) → UI SPA
- QA (future) → Tests
- DevOps (future) → Deploy

Flujo: Brief → Orchestrator descompone → Backend → Frontend → QA → DevOps

## Estado actual (2026-05-13)

| Elemento | Estado |
|---|-
| Infraestructura DevTeam | ✅ Estructura creada en /home/canfron/hermes/DevTeam/
| DEVSPEC.md | ✅ Documentacion del proyecto
| Orchestrator cron | ✅ Cron job d47bfd31e948 (cada 30m)
| Backend cron | ✅ Cron job 75a5370fb9c9 (cada 2h, una vez para test)
| Task queue | ✅ Inicializado con tareas
| Github repo | ⏳ Pendiente

## Que falta por hacer (prioridad)

| Prioridad | Elemento | Estado |
|---|-|---|
| P0 | Verificar que los cron jobs funcionan (test run) | ⏳ proximo |
| P0 | Crear repo de DevTeam en GitHub | ⏳ pendiente |
| P1 | Agregar skill del Backend al cron job | ⏳ pendiente |
| P1 | Agente Frontend (skill + cron) | ⏳ future |
| P2 | Agente QA (skill + cron) | ⏳ future |
| P2 | Agente DevOps (skill + cron) | ⏳ future |
| P3 | Integrar devteam.sh como helper | ⏳ future |

## Decisiones clave

- Comunicación via sistema de archivos (NO memoria compartida)
- Cron jobs para cada agente (NO sub-agentes)
- Modelo Gemini-2.5-Pro para el Orchestrator (mejor reasoning)
- Stack por defecto: Python + FastAPI + SQLite + HTML/JS + Tailwind
- Todo el codigo del proyecto va en /home/canfron/hermes/DevTeam/project/

## Criterios de exito del proof-of-concept

1. [ ] Orchestrator recibe brief y genera specs
2. [ ] Backend agent implementa codigo segun specs
3. [ ] Tests pasan
4. [ ] README auto-generado
5. [ ] Todo push a GitHub
