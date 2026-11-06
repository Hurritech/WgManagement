from django.urls import path

from . import views

urlpatterns = [
    path("status/", views.api_status, name="api-status"),
    path("me/", views.api_me, name="api-me"),
    path("me", views.api_me, name="api-me-no-slash"),
    path("state/", views.api_state, name="api-state"),
    path("tasks/", views.tasks_api, name="tasks-api"),
    path("tasks/<str:task_id>/", views.task_api, name="task-api"),
    path("tasks/<str:task_id>/state/", views.task_state_api, name="task-state-api"),
    path("stock/", views.stock_api, name="stock-api"),
    path("stock/<str:item_id>/", views.stock_item_api, name="stock-item-api"),
    path("laundry/", views.laundry_api, name="laundry-api"),
    path("calendar/", views.calendar_api, name="calendar-api"),
    path("calendar/<str:entry_date>/", views.calendar_entry_api, name="calendar-entry-api"),
    path("notes/", views.notes_api, name="notes-api"),
    path("notes/<str:note_id>/", views.note_api, name="note-api"),
]
