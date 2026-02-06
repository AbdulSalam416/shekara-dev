# ai-service — Quick Setup

Minimal instructions to get the `ai-service` API running locally.

Prerequisites
- Python 3.10+
- Git (optional)

Quick start (Windows PowerShell)
```powershell
cd apps/ai-service
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd apps/ai_service
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Quick start (bash / WSL / macOS)
```bash
cd apps/ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd apps/ai_service
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Run from workspace root (module path)
```bash
uvicorn apps.ai_service.main:app --reload --host 0.0.0.0 --port 8000
```

Using editable install (hatch)
```bash
pip install hatch
hatch env create
hatch run pip install -e .
```

VS Code / Pylance tips
- Open the workspace in VS Code and select the Python interpreter pointing to `apps/ai-service/.venv`:
  - Ctrl+Shift+P → `Python: Select Interpreter` → choose the `.venv` you created.
- Reload the window after switching interpreters.
- If Pylance still shows "Import could not be resolved", confirm packages are installed in the selected interpreter (`pip list`) and restart VS Code.

Testing
```bash
cd apps/ai-service
pytest
```

Troubleshooting
- If `uvicorn` or `fastapi` commands are not found, ensure the virtualenv is activated and packages are installed in that environment.
- In monorepo setups you may need to run using the module path shown above.

If you want, I can also add a small `.vscode/settings.json` that sets the default interpreter to `.venv`.
# apps/ai-service

Project description here.
