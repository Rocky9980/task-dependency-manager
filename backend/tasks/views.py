from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Task, TaskDependency
from .serializers import TaskSerializer


# 🔁 CIRCULAR DEPENDENCY CHECK (DFS)
def detect_cycle(start_task_id, target_task_id, visited):
    if start_task_id == target_task_id:
        return True

    visited.add(start_task_id)

    dependencies = TaskDependency.objects.filter(task_id=start_task_id)
    for dep in dependencies:
        next_task_id = dep.depends_on_id
        if next_task_id not in visited:
            if detect_cycle(next_task_id, target_task_id, visited):
                return True

    return False


# 🔄 AUTO STATUS UPDATE BASED ON DEPENDENCIES
def update_task_status(task):
    dependencies = TaskDependency.objects.filter(task=task)

    if not dependencies.exists():
        return

    statuses = [dep.depends_on.status for dep in dependencies]

    if "blocked" in statuses:
        task.status = "blocked"
    elif all(status == "completed" for status in statuses):
        task.status = "in_progress"
    else:
        task.status = "pending"

    task.save()


# 📌 TASK LIST + CREATE
class TaskListCreate(APIView):
    def get(self, request):
        tasks = Task.objects.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# 🔗 ADD DEPENDENCY
class TaskDependencyCreate(APIView):
    def post(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=404)

        depends_on_id = request.data.get("depends_on_id")

        if not depends_on_id:
            return Response({"error": "depends_on_id is required"}, status=400)

        if task.id == depends_on_id:
            return Response(
                {"error": "Task cannot depend on itself"},
                status=400
            )

        visited = set()
        if detect_cycle(depends_on_id, task.id, visited):
            return Response(
                {"error": "Circular dependency detected"},
                status=400
            )

        TaskDependency.objects.create(
            task_id=task.id,
            depends_on_id=depends_on_id
        )

        # 🔥 AUTO UPDATE STATUS AFTER ADDING DEPENDENCY
        update_task_status(task)

        return Response(
            {"message": "Dependency added successfully"},
            status=201
        )


# 🔄 UPDATE TASK STATUS
class TaskStatusUpdate(APIView):
    def patch(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=404)

        new_status = request.data.get("status")

        if new_status not in ["pending", "in_progress", "completed", "blocked"]:
            return Response({"error": "Invalid status"}, status=400)

        task.status = new_status
        task.save()

        # 🔥 UPDATE ALL DEPENDENT TASKS
        for dep in TaskDependency.objects.filter(depends_on=task):
            update_task_status(dep.task)

        return Response({"message": "Status updated successfully"})


# 📊 GRAPH DATA API
class GraphView(APIView):
    def get(self, request):
        tasks = Task.objects.all()
        dependencies = TaskDependency.objects.all()

        return Response({
            "tasks": [
                {
                    "id": t.id,
                    "title": t.title,
                    "status": t.status
                } for t in tasks
            ],
            "dependencies": [
                {
                    "from": d.task_id,
                    "to": d.depends_on_id
                } for d in dependencies
            ]
        })
