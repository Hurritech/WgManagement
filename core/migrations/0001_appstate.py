from django.db import migrations, models


INITIAL_STATE = {
    "taskDefinitions": [
        {"id": "hausdienst", "title": "Clean the staircase"},
        {"id": "bathroom", "title": "Clean the bathroom"},
        {"id": "bins", "title": "Take out the bins"},
        {"id": "shopping", "title": "Restock shared supplies"},
        {"id": "floor", "title": "Clean the floor"},
    ],
    "taskState": {
        task_id: {"personIndex": index % 3, "status": "normal", "schedule": {"todo": []}}
        for index, task_id in enumerate(["hausdienst", "bathroom", "bins", "shopping", "floor"])
    },
    "stock": [
        {"id": "cleaning", "name": "Cleaning", "items": [
            {"id": "cleaning-spray", "name": "Cleaning spray", "quantity": 3, "unit": "bottles"},
            {"id": "dish-soap", "name": "Dish soap", "quantity": 2, "unit": "bottles"},
            {"id": "laundry-detergent", "name": "Laundry detergent", "quantity": 1, "unit": "bottle"},
        ]},
        {"id": "kitchen", "name": "Kitchen", "items": [
            {"id": "kitchen-towels", "name": "Kitchen towels", "quantity": 4, "unit": "rolls"},
            {"id": "bin-bags", "name": "Bin bags", "quantity": 18, "unit": "bags"},
        ]},
        {"id": "bathroom", "name": "Bathroom", "items": [
            {"id": "toilet-paper", "name": "Toilet paper", "quantity": 12, "unit": "rolls"},
        ]},
    ],
    "stockRequests": {},
    "laundryFinishTime": "",
    "calendarEntries": [],
    "notes": [],
}


def seed_state(apps, schema_editor):
    apps.get_model("core", "AppState").objects.create(data=INITIAL_STATE)


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="AppState",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("data", models.JSONField(default=dict)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.RunPython(seed_state, migrations.RunPython.noop),
    ]
