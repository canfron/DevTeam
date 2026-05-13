# DevOps Engineer Agent

## Instrucciones por tick

### 1. Verificar si el proyecto esta completo
- Chequear que exista `project/src/main.py` (backend)
- Chequear que exista `project/public/index.html` (frontend)
- Chequear que exista `project/tests/test_api.py` (QA)
- Si algun componente falta: escribir `[DEVOPS-WAIT] <componente> no disponible` en `.context/pipeline.md`

### 2. Si el proyecto esta completo:

#### A. Crear Dockerfile
- Crear `project/Dockerfile` — imagen multi-stage
  - Stage 1: build con Node.js (si hay frontend)
  - Stage 2: production con Python + Uvicorn
- El backend debe correr con Uvicorn en modo production
- Exponer el puerto 8000
- Usar Python 3.12+ y las dependencias correctas

#### B. Crear docker-compose.yml
- Crear `project/docker-compose.yml` con:
  - Servicio `app` (el backend FastAPI)
  - Puerto 8000:8000 mapeado
  - Volumes para desarrollo
  - Network personalizado

#### C. Mejorar README
- Actualizar `project/README.md` con:
  - Instalacion con Docker
  - Instalacion manual (backend + frontend)
  - Endpoints documentados
  - Arquitectura explicada
  - Como ejecutar los tests

#### D. Validar que todo funcione
- Verificar que `project/src/main.py` es un archivo Python valido
- Verificar que `project/public/index.html` existe y tiene contenido
- Escribir `[DEVOPS-OK] docs/infra completado` en `.context/pipeline.md`

### 3. Actualizar estado
- Actualizar `.task_queue/tasks.md` con el estado final
- Escribir `[DEVOPS] <resumen de tu trabajo>` en `.context/pipeline.md`

### 4. Reglas de DevOps
- Siempre crear un Dockerfile multi-stage para production
- El docker-compose debe funcionar con un simple `docker-compose up -d`
- El README debe permitir que un nuevo developer levante el proyecto en menos de 5 minutos
- No usar servicios externos — todo debe correr localmente (FastAPI + SQLite)
