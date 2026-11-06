# WG Management — Django + React starter

Full-stack starter with a Django backend and Vite/React frontend.

## Run locally

```bash
# terminal 1 — backend
source .venv/bin/activate
python manage.py runserver

# terminal 2 — frontend development server
cd frontend
npm install
npm run dev
```

The Vite server proxies `/api/*` to Django. For a production-style Django-served build, run `npm run build` inside `frontend/`, then start Django and open `/`.

- `GET /api/status/` — example JSON API response
- `/` — React dashboard mounted by Django
- See [API.md](API.md) for the complete API documentation.
