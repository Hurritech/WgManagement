from django.db import models


class AppState(models.Model):
    """The shared household state for this single-household application."""

    data = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)


class Task(models.Model):
    id = models.CharField(max_length=120, primary_key=True)
    title = models.CharField(max_length=120)


class TaskState(models.Model):
    task = models.OneToOneField(Task, on_delete=models.CASCADE, related_name="state")
    person_index = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, default="normal")
    schedule = models.JSONField(default=dict)


class StockCategory(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)


class StockItem(models.Model):
    id = models.CharField(max_length=120, primary_key=True)
    category = models.ForeignKey(StockCategory, on_delete=models.CASCADE, related_name="items")
    name = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=30, default="items")
    requested = models.BooleanField(default=False)


class LaundryState(models.Model):
    id = models.PositiveSmallIntegerField(primary_key=True, default=1)
    finish_time = models.CharField(max_length=5, blank=True, default="")


class CalendarEntry(models.Model):
    date = models.DateField(primary_key=True)
    time = models.CharField(max_length=5, blank=True, default="")
    note = models.CharField(max_length=120)


class Note(models.Model):
    id = models.CharField(max_length=120, primary_key=True)
    text = models.CharField(max_length=120)
