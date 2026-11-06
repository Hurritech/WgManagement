import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .models import AppState, CalendarEntry, LaundryState, Note, StockCategory, StockItem, Task, TaskState


def home(request):
    return render(request, "index.html")


def api_status(request):
    return JsonResponse({"status": "online", "message": "Django API is connected", "stats": {"projects": 12, "tasks": 48, "team_members": 6}})


def api_me(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({"authenticated": False, "user": None})
    return JsonResponse({
        "authenticated": True,
        "user": {"id": user.id, "username": user.get_username(), "email": user.email},
    })


def body(request):
    try:
        value = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None
    return value if isinstance(value, dict) else None


def error(message, status=400):
    return JsonResponse({"error": message}, status=status)


def task_state_json(state):
    return {"personIndex": state.person_index, "status": state.status, "schedule": state.schedule}


@csrf_exempt
def tasks_api(request):
    if request.method == "GET":
        tasks = list(Task.objects.select_related("state"))
        return JsonResponse({"tasks": [{"id": t.id, "title": t.title} for t in tasks], "taskState": {t.id: task_state_json(t.state) for t in tasks}})
    if request.method == "POST":
        data = body(request)
        if not data or not data.get("id") or not data.get("title"):
            return error("id and title are required.")
        task = Task.objects.create(id=data["id"], title=data["title"])
        TaskState.objects.create(task=task, person_index=data.get("personIndex", 0))
        return JsonResponse({"id": task.id, "title": task.title, "state": task_state_json(task.state)}, status=201)
    return error("Method not allowed.", 405)


@csrf_exempt
def task_api(request, task_id):
    if request.method != "DELETE":
        return error("Method not allowed.", 405)
    deleted, _ = Task.objects.filter(id=task_id).delete()
    return JsonResponse({}, status=204) if deleted else error("Task not found.", 404)


@csrf_exempt
def task_state_api(request, task_id):
    if request.method != "PUT":
        return error("Method not allowed.", 405)
    try:
        state = TaskState.objects.get(task_id=task_id)
    except TaskState.DoesNotExist:
        return error("Task state not found.", 404)
    data = body(request)
    if not data:
        return error("A JSON object is required.")
    state.person_index = data.get("personIndex", state.person_index)
    state.status = data.get("status", state.status)
    state.schedule = data.get("schedule", state.schedule)
    state.save()
    return JsonResponse(task_state_json(state))


def stock_json():
    return [{"id": c.id, "name": c.name, "items": [{"id": i.id, "name": i.name, "quantity": i.quantity, "unit": i.unit} for i in c.items.all()]} for c in StockCategory.objects.prefetch_related("items")]


@csrf_exempt
def stock_api(request):
    if request.method == "GET":
        return JsonResponse({"stock": stock_json(), "stockRequests": {i.id: i.requested for i in StockItem.objects.filter(requested=True)}})
    if request.method == "POST":
        data = body(request)
        if not data or not all(data.get(key) for key in ("id", "name", "categoryId")):
            return error("id, name, and categoryId are required.")
        try:
            category = StockCategory.objects.get(id=data["categoryId"])
        except StockCategory.DoesNotExist:
            return error("Stock category not found.", 404)
        item = StockItem.objects.create(id=data["id"], name=data["name"], unit=data.get("unit", "items"), category=category)
        return JsonResponse({"id": item.id, "name": item.name, "quantity": item.quantity, "unit": item.unit}, status=201)
    return error("Method not allowed.", 405)


@csrf_exempt
def stock_item_api(request, item_id):
    try:
        item = StockItem.objects.get(id=item_id)
    except StockItem.DoesNotExist:
        return error("Stock item not found.", 404)
    if request.method == "DELETE":
        item.delete()
        return JsonResponse({}, status=204)
    if request.method == "PATCH":
        data = body(request)
        if not data:
            return error("A JSON object is required.")
        if "quantity" in data:
            item.quantity = max(0, int(data["quantity"]))
        if "requested" in data:
            item.requested = bool(data["requested"])
        item.save()
        return JsonResponse({"id": item.id, "quantity": item.quantity, "requested": item.requested})
    return error("Method not allowed.", 405)


@csrf_exempt
def laundry_api(request):
    laundry, _ = LaundryState.objects.get_or_create(id=1)
    if request.method == "GET":
        return JsonResponse({"finishTime": laundry.finish_time})
    if request.method == "PUT":
        data = body(request)
        if data is None or "finishTime" not in data:
            return error("finishTime is required.")
        laundry.finish_time = data["finishTime"]
        laundry.save()
        return JsonResponse({"finishTime": laundry.finish_time})
    return error("Method not allowed.", 405)


@csrf_exempt
def calendar_api(request):
    if request.method == "GET":
        return JsonResponse({"entries": list(CalendarEntry.objects.values("date", "time", "note"))})
    if request.method == "POST":
        data = body(request)
        if not data or not all(data.get(key) for key in ("date", "note")):
            return error("date and note are required.")
        entry = CalendarEntry.objects.create(date=data["date"], time=data.get("time", ""), note=data["note"])
        return JsonResponse({"date": str(entry.date), "time": entry.time, "note": entry.note}, status=201)
    return error("Method not allowed.", 405)


@csrf_exempt
def calendar_entry_api(request, entry_date):
    if request.method != "DELETE":
        return error("Method not allowed.", 405)
    deleted, _ = CalendarEntry.objects.filter(date=entry_date).delete()
    return JsonResponse({}, status=204) if deleted else error("Calendar entry not found.", 404)


@csrf_exempt
def notes_api(request):
    if request.method == "GET":
        return JsonResponse({"notes": list(Note.objects.values("id", "text"))})
    if request.method == "POST":
        data = body(request)
        if not data or not data.get("id") or not data.get("text"):
            return error("id and text are required.")
        note = Note.objects.create(id=data["id"], text=data["text"])
        return JsonResponse({"id": note.id, "text": note.text}, status=201)
    return error("Method not allowed.", 405)


@csrf_exempt
def note_api(request, note_id):
    if request.method != "DELETE":
        return error("Method not allowed.", 405)
    deleted, _ = Note.objects.filter(id=note_id).delete()
    return JsonResponse({}, status=204) if deleted else error("Note not found.", 404)


@csrf_exempt
def api_state(request):
    state, _ = AppState.objects.get_or_create(id=1, defaults={"data": {}})
    if request.method == "GET":
        return JsonResponse(state.data)
    return error("Use resource endpoints instead of replacing the complete app state.", 410)
