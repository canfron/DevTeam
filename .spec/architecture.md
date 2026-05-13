# DevTeam Architecture

## Tech Stack
- Backend: Python + FastAPI + SQLAlchemy + SQLite
- Frontend: HTML/JS/CSS (Tailwind via CDN)
- Testing: pytest + fastapi.testclient
- Deployment: Docker + docker-compose
- Agent Orchestrator: OpenRouter (Gemini-2.5-Pro)
- Agents: Hermes cron jobs

## Project Structure
```
DevTeam/
├── .spec/
│   ├── requirements.md
│   ├── api-contract.md
│   └── ui-contract.md
├── .task_queue/
│   ├── tasks.md
│   ├── assigned.md
│   └── blocked.md
├── .context/
│   ├── pipeline.md
│   └── errors.md
├── project/
│   ├── src/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── main.py
│   ├── static/
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
├── agents/
│   ├── orchestrator/
│   ├── backend/
│   ├── frontend/
│   ├── qa/
│   └── devops/
├── scripts/
├── SKILL.md
└── DEVSPEC.md
```
