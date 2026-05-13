# DevTeam — Project Specification

## Visión

Construir un equipo de agentes de desarrollo autónomos que reciba un brief escueto y lo convierta en una aplicación completa, probada y desplegable.

## Arquitectura

6 agentes autónomos conectados por sistema de archivos:
- **Orchestrator** (Cron job `d47bfd31e948`) → Brief → Specs → Task Queue → Quality Gate
- **Backend** (Cron job `75a5370fb9c9`) → Models + DB + Endpoints
- **Frontend** (future) → UI SPA
- **QA** (future) → Tests
- **DevOps** (future) → Deploy

Flujo: Brief → Orchestrator descompone → Backend → Frontend → QA → DevOps

## Estado actual (2026-05-13 19:30)

| Elemento | Estado |
|---|---|
| Estructura / home/canfron/hermes/DevTeam | ✅ Creada |
| SKILL.md del equipo | ✅ Creada |
| DEVSPEC.md | ✅ Creada |
| SKILL.md Orchestrator | ✅ Creada |
| SKILL.md Backend | ✅ Creada |
| Orchestrator cron job | ✅ `d47bfd31e948` (cada 30m, forever) |
| Backend cron job | ✅ `75a5370fb9c9` (cada 2h, one-shot) |
| Task queue (.task_queue/) | ✅ Inicializado |
| Specs (.spec/) | ✅ requirements.md, api-contract.md, architecture.md |
| GitHub repo | ✅ https://github.com/canfron/DevTeam |

## Qué falta por hacer

| Prioridad | Elemento | Estado |
|---|---|-|
| P1 | Backend implementa código del project/ (cuando specs estén listas) | ⏳ pendiente |
| P1 | Agente Frontend (skill + cron job) | ⏳ future |
| P2 | Agente QA (skill + cron job) | ⏳ future |
| P2 | Agente DevOps (skill + cron job) | ⏳ future |

## Decisiones clave

- Comunicación vía sistema de archivos (NO memoria compartida)
- Cron jobs para cada agente (NO subagentes)
- Modelo Gemini-2.5-Pro para el Orchestrator (mejor reasoning)
- Stack por defecto: Python + FastAPI + SQLite + HTML/JS + Tailwind
- Todo el código del proyecto va en `/home/canfron/hermes/DevTeam/project/`

## Criterios de éxito del proof-of-concept

1. [ ] Orchestrator recibe brief y genera specs
2. [ ] Backend agent implementa código según specs
3. [ ] Tests pasan
