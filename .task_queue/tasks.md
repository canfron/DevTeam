# TASK LIST — DevTeam Project

## Estado actual del proyecto

|| # | Tarea | Agente | Prioridad | Status |
|---|---|---|---|-|
| 1 | Inicializar estructura de directorios | Orchestrator | P0 | ✅ done |
| 2 | Crear SKILL.md del equipo | Orchestrator | P0 | ✅ done |
| 3 | Crear DEVSPEC.md del proyecto | Orchestrator | P0 | ✅ done |
| 4 | Crear skill y cron del Orchestrator | Orchestrator | P0 | ✅ done |
| 5 | Crear skill y cron del Backend agent | Backend | P1 | ✅ done |
| 6 | Crear brief y specs del proyecto | Orchestrator | P0 | ✅ done |
| 7 | Backend implementar código del project/ | Backend | P1 | ✅ done (main.py + database.py + models.py) |
| 8 | Frontend crear SPA | Frontend | P2 | ✅ done (index.html + static/) |
| 9 | QA escribir tests | QA | P2 | 🔴 PENDING |
| 10 | DevOps crear Dockerfile/docker-compose/README | DevOps | P3 | 🔴 PENDING |

## Estado del repo

- **Repo local:** /home/canfron/hermes/DevTeam
- **Repo remoto:** https://github.com/canfron/DevTeam
- **Branch:** master
- **Push OK:** sí

## Cron Jobs del equipo

|| Agente | ID | Schedule | Modelo | Ejecución |
|---|---|---|---|---|
| Orchestrator | d47bfd31e948 | cada 30min | Gemini-2.5-Pro (OpenRouter) | forever |
| Backend | 75a5370fb9c9 | cada 120min | Gemini-2.5-Pro (OpenRouter) | 999999 |
| Frontend | 726238451789 | cada 120min | Gemini-2.5-Pro (OpenRouter) | 999999 |
| QA | 4cad932fe13d | cada 120min | Gemini-2.5-Pro (OpenRouter) | 999999 |
| DevOps | 2f60d876dcb1 | cada 120min | Gemini-2.5-Pro (OpenRouter) | 999999 |

## Brief actual

"quiero un CRUD de productos con inventario: productos con nombre, descripción, precio, categoría, stock, SKU; movimientos de inventario de entrada/salida; dashboard con estadísticas"

## Qué sigue

1. ✅ Pipeline estructurado
2. ✅ Backend implementado y commitado
3. ✅ Frontend SPA implementado y commitado
4. 🔄 **QA: escribir y correr tests en project/tests/test_api.py**
5. 🔜 DevOps: Dockerfile, docker-compose.yml, README.md
