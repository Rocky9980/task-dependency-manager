\# Design Decisions – Task Dependency Manager



\## Circular Dependency Detection

To prevent circular dependencies, a Depth First Search (DFS) algorithm is used.



When adding a dependency:

\- Assume task A depends on task B

\- We start DFS from B and check if we can reach A

\- If A is reachable, adding the dependency would form a cycle



This ensures the task graph remains a Directed Acyclic Graph (DAG).



\### Why DFS?

\- Simple to implement

\- Efficient for this use case

\- Time Complexity: O(V + E), where V = tasks and E = dependencies



---



\## Automatic Status Updates

A task’s status is automatically updated based on its dependencies:

\- If any dependency is `blocked` → task becomes `blocked`

\- If all dependencies are `completed` → task becomes `in\_progress`

\- Otherwise → task remains `pending`



This logic runs whenever:

\- A dependency is added

\- A dependency’s status is updated



---



\## API Design

The backend follows RESTful principles:

\- `/tasks/` → create \& list tasks

\- `/tasks/{id}/dependencies/` → add dependencies

\- `/tasks/{id}/status/` → update task status

\- `/graph/` → visualize task dependency graph



---



\## UI Decisions

\- Dropdowns prevent invalid dependency selection

\- Disabled buttons during API calls

\- User-friendly success/error messages

\- SVG-based graph for simplicity and performance



---



\## Future Improvements

\- Drag-and-drop graph nodes

\- User authentication

\- Persistent layouts for large graphs



