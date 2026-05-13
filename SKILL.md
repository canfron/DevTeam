# DevTeam — Equipo de Agentes de Desarrollo

Equipo de agentes autónomos interconectados por sistema de archivos.
Cada agente es un cron job con su propia skill e identidad.

## Arquitectura

```
DevTeam/
├── SKILL.md                  ← este archivo
├── README.md                 ← doc del proyecto DevTeam
├── DEVSPEC.md               ← qué queremos construir
├── .spec/
│   ├── requirements.md      ← requisitos completos
│   ├── api-contract.md      ← contrato backend → frontend
│   ├── ui-contract.md       ← contrato frontend
│   └── architecture.md      ← decisiones de arquitectura
├── .task_queue/
│   ├── tasks.md             ← backlog: status | id | agente | descripción | prioridad
│   ├── assigned.md          ← tareas asignadas a cada agente (en progreso) en progreso | done
│   └── blocked.md           ← dependencias pendientes
├── .context/
│   ├── pipeline.md          ← historial de ejecuciones y decisiones
│   └── errors.md            ← errores conocidos
├── agents/
│   ├── orchestrator/
│   │   └── SKILL.md         ← skill del orchestrator
│   ├── backend/
│   │   └── SKILL.md         ← skill del backend agent
│   ├── frontend/
│   │   └── SKILL.md         ← skill del frontend agent
│   ├── qa/
│   │   └── SKILL.md         ← skill del qa agent
│   └── devops/
│       └── SKILL.md         ← skill del devops agent
├── project/                  ← output final de cada agente
└── scripts/
    └── devteam.sh            ← helper para verificar pipeline
```

## Agente Orchestrator (P0)
- **Cron:** `every 30m`, modelo `openrouter/google/gemini-2.5-pro`
- **Memoria:** `project-knowledge`
- **Responsabilidad:** Recibe briefs, descompone tareas, lanza el pipeline, verifica integridad
- **Comunicación:** Lee `.spec/` + `.task_queue/`, escribe project/, context/, done.md

## Agente Backend (P1)
- **Cron:** `every 2h`
- **Memoria:** `backend-dev`
- **Responsabilidad:** Implementa models, DB, endpoints, validaciones
- **Input:** `.spec/api-contract.md`
- **Output:** `project/models.py`, `project/main.py`, `project/database.py`
- **Output:** `project/api-contract.md`

## Agente Backend (P1)
- **Cron:** `every 2h`
- **Skills:** `project-knowledge`
- **Responsabilidad:** Implementa logicas, DB, API endpoints, models, validaciones
- **Input:** `.spec/api-contract.md`
- **Output:** `project/` con código backend funcionando

## Agente Frontend (P1)
- **Cron:** `every 2h`
- **Skills:** `project-knowledge`
- **Responsabilidad:** Implementa UI, consumo de API, componentes
- **Input:** `.spec/ui-contract.md`
- **Output:** `project/` con UI SPA funcionando

## Agente QA (P2)
- **Cron:** `every 2h`
- **Skills:** `project-knowledge`, `qa-dev`
- **Responsabilidad:** Escribe y corre tests, verifica funcionalidad
- **Input:** `project/` + `.spec/`
- **Output:** `project/tests/` con coverage > 80%

## Agente DevOps (P2)
- **Cron:** `every 4h`
- **Skills:** `project-knowledge`, `devops-dev`
- **Responsabilidad:** Deployment, Docker, docs, CI/CD
- **Input:** `project/`
- **Output:** `project/` con Dockerfile, deploy scripts, README, docs

## Comunicación entre agentes
Todos los agentes se comunican via archivos en el sistema:
- `.spec/` — specs firmadas (solo el Planner puede escribir aquí)
- `.task_queue/` — queue de tareas (orchestrador escribe, todos leen/escriben)
- `.context/` — historial (orquestrador escribe, todos leen)
- `project/` — código funcional (todos escriben su parte)

## Criterio de calidad
- Tests > 80% coverage
- No errores al ejecutar `python -m pytest`
- `uvicorn src.main:app` inicia sin errores (fastapi)
- UI navega todas las secciones del CRUD
- README.md explica instalación + ejecución

## Reglas
- NO delegar más cron jobs desde un agente
- SIEMPRE leer `.task_queue/` antes de empezar
- SIEMPRE actualizar `.context/pipeline.md` al terminar
- SIEMPRE marcar tareas como done en `.task_queue/done.md`
- SIEMPRE verificar que el output del agente anterior cumple las especificaciones antes de continuar
