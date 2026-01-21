import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Dependency UI
  const [selectedTask, setSelectedTask] = useState("");
  const [dependsOn, setDependsOn] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  // Graph
  const [graph, setGraph] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  /* ---------------- LOADERS ---------------- */

  const loadTasks = async () => {
    const res = await fetch(`${API_BASE}/tasks/`);
    const data = await res.json();
    setTasks(data);
  };

  const loadGraph = async () => {
    try {
      const res = await fetch(`${API_BASE}/graph/`);
      const data = await res.json();
      setGraph(data);
    } catch {
      setGraph(null);
    }
  };

  useEffect(() => {
    loadTasks();
    loadGraph();
  }, []);

  /* ---------------- TASK ACTIONS ---------------- */

  const addTask = async () => {
    if (!title) {
      alert("Title required");
      return;
    }

    await fetch(`${API_BASE}/tasks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, status: "pending" }),
    });

    setTitle("");
    setDescription("");
    loadTasks();
    loadGraph();
  };

  const updateStatus = async (taskId, status) => {
    await fetch(`${API_BASE}/tasks/${taskId}/status/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    loadTasks();
    loadGraph();
  };

  /* ---------------- DEPENDENCY ---------------- */

  const addDependency = async () => {
    setMessage("");
    setChecking(true);

    if (!selectedTask || !dependsOn) {
      setMessage("❌ Select both tasks");
      setChecking(false);
      return;
    }

    if (selectedTask === dependsOn) {
      setMessage("❌ Task cannot depend on itself");
      setChecking(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/tasks/${selectedTask}/dependencies/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ depends_on_id: dependsOn }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${data.error}`);
      } else {
        setMessage("✅ Dependency added successfully");
        loadGraph();
      }
    } catch {
      setMessage("❌ Server error");
    } finally {
      setChecking(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Task Dependency Manager
        </h1>

        {/* ADD TASK */}
        <div className="bg-gray-900 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

          <input
            className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-700"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-700"
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            onClick={addTask}
            className="bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200"
          >
            Add Task
          </button>
        </div>

        {/* DEPENDENCY MANAGER */}
        <div className="bg-gray-900 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Dependency</h2>

          <div className="flex gap-4 flex-wrap">
            <select
              className="bg-gray-800 border border-gray-600 p-2 rounded"
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
            >
              <option value="">Select Task</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>

            <span className="self-center text-gray-400">depends on</span>

            <select
              className="bg-gray-800 border border-gray-600 p-2 rounded"
              value={dependsOn}
              onChange={(e) => setDependsOn(e.target.value)}
            >
              <option value="">Select Dependency</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>

            <button
              onClick={addDependency}
              disabled={checking}
              className={`px-4 py-2 rounded font-semibold ${
                checking
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {checking ? "Checking..." : "Add Dependency"}
            </button>
          </div>

          {message && <p className="mt-3 text-sm">{message}</p>}
        </div>

        {/* DEPENDENCY GRAPH */}
        <div className="bg-gray-900 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Dependency Graph</h2>

          {!graph || graph.tasks.length === 0 ? (
            <p className="text-gray-400">
              No dependencies yet. Add some to visualize.
            </p>
          ) : (
            <svg
              width={Math.max(600, graph.tasks.length * 180)}
              height="300"
            >
              <defs>
  <marker
    id="arrow"
    markerWidth="10"
    markerHeight="10"
    refX="8"
    refY="5"
    orient="auto"
  >
    <path d="M0,0 L10,5 L0,10 Z" fill="white" />
  </marker>
</defs>

              {/* 🔗 Dependency Lines */}
{graph.dependencies.map((dep) => {
  const fromIndex = graph.tasks.findIndex(
    (t) => t.id === dep.from
  );
  const toIndex = graph.tasks.findIndex(
    (t) => t.id === dep.to
  );

  if (fromIndex === -1 || toIndex === -1) return null;

  return (
    <line
      key={`${dep.from}-${dep.to}`}
      x1={120 + fromIndex * 180}
      y1={175}
      x2={120 + toIndex * 180}
      y2={175}
      stroke="white"
      strokeWidth="2"
      markerEnd="url(#arrow)"
    />
  );
})}

              {graph.tasks.map((task, index) => (
                <g key={task.id}>
                  <rect
                    x={50 + index * 180}
                    y={150}
                    width="140"
                    height="50"
                    rx="8"
                    onClick={() => setActiveTask(task.id)}
                    stroke={activeTask === task.id ? "yellow" : "none"}
                    strokeWidth="3"
                    fill={
                      task.status === "completed" ? "#4ade80" :
                      task.status === "blocked" ? "#f87171" :
                      task.status === "in_progress" ? "#60a5fa" :
                      "#9ca3af"
                    }
                  />
                  <text
                    x={120 + index * 180}
                    y={180}
                    textAnchor="middle"
                    fill="black"
                    fontSize="12"
                  >
                    {task.title}
                  </text>
                </g>
              ))}
            </svg>
          )}
        </div>

        {/* TASK LIST */}
        <div className="space-y-4">
          {tasks.length === 0 && (
            <p className="text-gray-400">No tasks created yet.</p>
          )}

          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-900 p-5 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {task.description}
                </p>
              </div>

              <select
                value={task.status}
                onChange={(e) =>
                  updateStatus(task.id, e.target.value)
                }
                className="bg-gray-800 border border-gray-600 text-white px-3 py-1 rounded"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
