import { useState, useEffect, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Database,
  ShieldCheck,
  ListTodo,
  Layers,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchTasksApi, toggleTaskCompleteApi, deleteTaskApi } from "../api/tasks";
import type { Task } from "../types/task";
import { TaskStats } from "../components/tasks/TaskStats";
import { TaskItem } from "../components/tasks/TaskItem";
import { TaskFormModal } from "../components/tasks/TaskFormModal";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

export function DashboardPage() {
  const { user } = useAuth();
  const outletContext = useOutletContext<{ openNewTaskModal: () => void } | null>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchTasksApi({ filter: "all" });
      setTasks(data);
    } catch (err) {
      console.error("Failed to load dashboard tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();

    const handleUpdate = () => loadTasks();
    window.addEventListener("lifeos:task-updated", handleUpdate);
    return () => window.removeEventListener("lifeos:task-updated", handleUpdate);
  }, [loadTasks]);

  const handleToggle = async (id: number, completed: boolean) => {
    try {
      await toggleTaskCompleteApi(id, completed);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed, status: completed ? "COMPLETED" : "PENDING" } : t))
      );
    } catch (err) {
      console.error("Failed to toggle task:", err);
      loadTasks();
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTaskApi(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  // Filter tasks for Today's view
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d >= startOfToday && d <= endOfToday;
  });

  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate || t.completed) return false;
    const d = new Date(t.dueDate);
    return d < startOfToday;
  });

  const highPriorityPending = tasks.filter((t) => !t.completed && t.priority === "HIGH");

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-indigo-950/40 p-6 md:p-8 backdrop-blur-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Phase 1 Operating Environment Active</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              Welcome back, {user?.name?.split(" ")[0] || "Developer"} ⚡
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Track your sprint priorities, manage daily dev tasks, and review system milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => outletContext?.openNewTaskModal()}
              className="shadow-lg shadow-blue-500/20 text-xs sm:text-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Create Task</span>
            </Button>
            <Link to="/tasks">
              <Button variant="outline" className="text-xs sm:text-sm">
                <span>View Full Backlog</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Task Overview Metrics */}
      <TaskStats tasks={tasks} />

      {/* Main Grid: Today's Focus & System Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Focus & Overdue Attention */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue alert if any */}
          {overdueTasks.length > 0 && (
            <Card className="border-red-900/40 bg-red-950/20">
              <CardHeader className="pb-3 border-red-900/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-red-300 flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    Overdue Attention Required ({overdueTasks.length})
                  </CardTitle>
                  <Link
                    to="/tasks?filter=overdue"
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    View in Tasks
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-3">
                {overdueTasks.slice(0, 3).map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onEdit={setEditingTask}
                    onDelete={handleDelete}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Today's Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base text-slate-100">Today's Agenda</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Tasks scheduled for completion today</p>
              </div>
              <Link
                to="/tasks?filter=today"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                See all ({todayTasks.length})
              </Link>
            </CardHeader>
            <CardContent className="pt-3">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-slate-500">Loading today's tasks...</div>
              ) : todayTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <CheckCircle className="mx-auto h-8 w-8 text-emerald-500/60 mb-2" />
                  <p className="text-sm font-medium text-slate-300">Nothing scheduled for today!</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Pick high-priority tasks from your backlog or enjoy deep focus time.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {todayTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onEdit={setEditingTask}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* High Priority Backlog */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base text-slate-100">High Priority Backlog</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Critical items awaiting completion</p>
              </div>
              <Link
                to="/tasks"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Manage all
              </Link>
            </CardHeader>
            <CardContent className="pt-3">
              {highPriorityPending.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No high-priority pending items.</p>
              ) : (
                <div className="space-y-2.5">
                  {highPriorityPending.slice(0, 3).map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onEdit={setEditingTask}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Phase 1 Checklist & System Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-400" />
                <span>Phase 1 Milestone Progress</span>
              </CardTitle>
              <p className="text-xs text-slate-400">Core architecture requirements</p>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {[
                {
                  label: "PostgreSQL & Prisma Schema",
                  detail: "User and Task models with relations & migrations",
                  done: true,
                  icon: Database,
                },
                {
                  label: "JWT Authentication",
                  detail: "Register, login, passwords hashed with bcrypt, protected routes",
                  done: true,
                  icon: ShieldCheck,
                },
                {
                  label: "Tasks CRUD & Data Sync",
                  detail: "Create, read, update, delete, with completed toggle",
                  done: true,
                  icon: ListTodo,
                },
                {
                  label: "Task Filter Pipeline",
                  detail: "Today / Upcoming / Overdue / Completed filters",
                  done: true,
                  icon: CheckCircle,
                },
                {
                  label: "Sidebar Navigation & Layout",
                  detail: "Responsive shell with Phase 2/3 placeholders",
                  done: true,
                  icon: Layers,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3 rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
                    <div className="mt-0.5 rounded bg-emerald-500/10 p-1 text-emerald-400 border border-emerald-500/20">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                        <span className="text-[10px] text-emerald-400 font-medium">✓ Done</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Task Creation Trigger Card */}
          <Card className="border-dashed border-slate-800 bg-slate-950/40">
            <CardContent className="p-5 text-center">
              <h4 className="text-sm font-semibold text-slate-200">Got a new developer task?</h4>
              <p className="text-xs text-slate-400 mt-1">
                Keep your backlog clean and structured with dates and priorities.
              </p>
              <Button
                size="sm"
                className="mt-3.5 w-full"
                onClick={() => outletContext?.openNewTaskModal()}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Add Task Now</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskFormModal
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={() => {
            setEditingTask(null);
            loadTasks();
          }}
          taskToEdit={editingTask}
        />
      )}
    </div>
  );
}
