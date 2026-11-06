# WG Management API

The Django API is available under `/api/`. Mutations are resource-level: a
change to one stock item, task, note, or calendar entry only writes that
resource.

## Setup

```bash
source .venv/bin/activate
python manage.py migrate
python manage.py runserver
```

The development API runs at `http://127.0.0.1:8000`.

## Common conventions

- JSON request and response bodies are used throughout.
- The API currently represents one shared household.
- Authentication is not configured yet.
- `204 No Content` is returned after successful deletes.

## Endpoints

### Status

`GET /api/status/`

Returns API connectivity information.

### Current user

`GET /api/me/`

Returns the current authenticated user when Django authentication is active.
This project does not currently configure login or require authentication, so
an anonymous request returns a successful response with a null user:

```json
{
  "authenticated": false,
  "user": null
}
```

For an authenticated request, `user` contains `id`, `username`, and `email`.

### Tasks

`GET /api/tasks/`

Returns task definitions and their state:

```json
{
  "tasks": [{"id": "bins", "title": "Take out the bins"}],
  "taskState": {
    "bins": {
      "personIndex": 2,
      "status": "normal",
      "schedule": {"todo": []}
    }
  }
}
```

`POST /api/tasks/`

Creates a task. Required fields are `id` and `title`; `personIndex` is
optional.

```json
{"id": "shopping", "title": "Restock supplies", "personIndex": 0}
```

`DELETE /api/tasks/{task_id}/`

Deletes a task and its state.

`PUT /api/tasks/{task_id}/state/`

Replaces the state for one task:

```json
{
  "personIndex": 1,
  "status": "urgent",
  "schedule": {"todo": [{"date": "06/11/2026", "urgentDate": ""}]}
}
```

`status` is `normal`, `todo`, or `urgent`.

### Stock

`GET /api/stock/`

Returns stock categories and a map of requested item IDs.

`POST /api/stock/`

Creates an item. Required fields are `id`, `name`, and `categoryId`.

```json
{
  "id": "sponges-1730000000000",
  "name": "Sponges",
  "categoryId": "kitchen",
  "unit": "packs"
}
```

`PATCH /api/stock/{item_id}/`

Updates only the requested fields for one item:

```json
{"quantity": 4}
```

or:

```json
{"requested": true}
```

Quantities are clamped to zero.

`DELETE /api/stock/{item_id}/`

Deletes one stock item.

### Laundry

`GET /api/laundry/`

Returns the current finish time:

```json
{"finishTime": "18:30"}
```

`PUT /api/laundry/`

Updates the finish time. Send an empty string to mark the machine available.

```json
{"finishTime": "18:30"}
```

### Calendar

`GET /api/calendar/`

Returns all calendar entries.

`POST /api/calendar/`

Creates an entry. `date` and `note` are required.

```json
{"date": "2026-11-10", "time": "19:00", "note": "House meeting"}
```

`DELETE /api/calendar/{date}/`

Deletes the entry for the given `YYYY-MM-DD` date.

### Notes

`GET /api/notes/`

Returns all shared notes.

`POST /api/notes/`

Creates a note. Both `id` and `text` are required.

```json
{"id": "note-unique-id", "text": "Buy dishwasher tablets"}
```

`DELETE /api/notes/{note_id}/`

Deletes one note.

## Deprecated endpoint

`GET /api/state/` remains temporarily available for older clients. The old
whole-state replacement operation is no longer supported; `PUT /api/state/`
returns `410 Gone`. New clients must use the resource endpoints above.

## Persistence

Resource data is stored in normalized Django models backed by SQLite:

- `Task` and `TaskState`
- `StockCategory` and `StockItem`
- `LaundryState`
- `CalendarEntry`
- `Note`

The migration `core.0002_resource_models` splits existing data from the legacy
`AppState` document into these tables.
