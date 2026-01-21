print("🔥 tasks.urls loaded")

from django.urls import path
from .views import (
    TaskListCreate,
    TaskDependencyCreate,
    TaskStatusUpdate,
    GraphView,   # ✅ FIXED
)

urlpatterns = [
    path("tasks/", TaskListCreate.as_view()),
    path("tasks/<int:task_id>/dependencies/", TaskDependencyCreate.as_view()),
    path("tasks/<int:task_id>/status/", TaskStatusUpdate.as_view()),
    path("graph/", GraphView.as_view()),  # ✅ FIXED
]
