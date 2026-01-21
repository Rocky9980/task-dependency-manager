# Task Dependency Manager

A full-stack application to manage tasks with dependencies, prevent circular dependencies, automatically update task status, and visualize task relationships.

---

## Tech Stack

### Backend
- Python
- Django
- Django REST Framework
- SQLite

### Frontend
- React (Vite)
- Tailwind CSS
- SVG (for dependency graph)

---

## Project Structure

task dependency manager/
├── backend/
├── frontend/
└── README.md


---

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install django djangorestframework django-cors-headers
python manage.py migrate
python manage.py runserver

Backend runs at: http://127.0.0.1:8000

Frontend Setup:
cd frontend
npm install
npm run dev

Frontend runs at: http://localhost:5173

Features:

Task creation and status management

Dependency management

Circular dependency detection (DFS)

Automatic status propagation

Visual dependency graph

Clean UI


Author

Rakesh R Angadi