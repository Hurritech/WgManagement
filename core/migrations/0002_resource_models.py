from datetime import date

from django.db import migrations, models


def split_state(apps, schema_editor):
    state = apps.get_model("core", "AppState").objects.filter(id=1).first()
    if not state:
        return
    data = state.data
    Task = apps.get_model("core", "Task")
    TaskState = apps.get_model("core", "TaskState")
    Category = apps.get_model("core", "StockCategory")
    Item = apps.get_model("core", "StockItem")
    Laundry = apps.get_model("core", "LaundryState")
    Calendar = apps.get_model("core", "CalendarEntry")
    Note = apps.get_model("core", "Note")

    for task in data.get("taskDefinitions", []):
        created = Task.objects.create(id=task["id"], title=task["title"])
        task_state = data.get("taskState", {}).get(task["id"], {})
        TaskState.objects.create(
            task=created,
            person_index=task_state.get("personIndex", 0),
            status=task_state.get("status", "normal"),
            schedule=task_state.get("schedule", {"todo": []}),
        )

    for category in data.get("stock", []):
        category_model = Category.objects.create(id=category["id"], name=category["name"])
        for item in category.get("items", []):
            Item.objects.create(
                id=item["id"], category=category_model, name=item["name"],
                quantity=item.get("quantity", 0), unit=item.get("unit", "items"),
                requested=data.get("stockRequests", {}).get(item["id"], False),
            )

    Laundry.objects.create(id=1, finish_time=data.get("laundryFinishTime", ""))
    for entry in data.get("calendarEntries", []):
        Calendar.objects.create(date=entry["date"], time=entry.get("time", ""), note=entry["note"])
    for note in data.get("notes", []):
        Note.objects.create(id=note["id"], text=note["text"])


class Migration(migrations.Migration):
    dependencies = [("core", "0001_appstate")]
    operations = [
        migrations.CreateModel(
            name="Task",
            fields=[
                ("id", models.CharField(max_length=120, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=120)),
            ],
        ),
        migrations.CreateModel(
            name="StockCategory",
            fields=[
                ("id", models.CharField(max_length=50, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name="LaundryState",
            fields=[
                ("id", models.PositiveSmallIntegerField(default=1, primary_key=True, serialize=False)),
                ("finish_time", models.CharField(blank=True, default="", max_length=5)),
            ],
        ),
        migrations.CreateModel(
            name="CalendarEntry",
            fields=[
                ("date", models.DateField(primary_key=True, serialize=False)),
                ("time", models.CharField(blank=True, default="", max_length=5)),
                ("note", models.CharField(max_length=120)),
            ],
        ),
        migrations.CreateModel(
            name="Note",
            fields=[
                ("id", models.CharField(max_length=120, primary_key=True, serialize=False)),
                ("text", models.CharField(max_length=120)),
            ],
        ),
        migrations.CreateModel(
            name="TaskState",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("person_index", models.PositiveIntegerField(default=0)),
                ("status", models.CharField(default="normal", max_length=20)),
                ("schedule", models.JSONField(default=dict)),
                ("task", models.OneToOneField(on_delete=models.deletion.CASCADE, related_name="state", to="core.task")),
            ],
        ),
        migrations.CreateModel(
            name="StockItem",
            fields=[
                ("id", models.CharField(max_length=120, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=100)),
                ("quantity", models.PositiveIntegerField(default=0)),
                ("unit", models.CharField(default="items", max_length=30)),
                ("requested", models.BooleanField(default=False)),
                ("category", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="items", to="core.stockcategory")),
            ],
        ),
        migrations.RunPython(split_state, migrations.RunPython.noop),
    ]
