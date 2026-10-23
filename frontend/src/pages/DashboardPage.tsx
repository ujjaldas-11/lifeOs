import { useState, useEffect, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Plus,
  CheckCircle,
  Flame,
  Calendar,
  FolderGit2,
  Timer,
  Terminal,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchTasksApi, toggleTaskCompleteApi, deleteTaskApi } from "../api/tasks";
import { fetchHabitsApi, checkInHabitApi } from "../api/habits";
import { fetchEventsApi } from "../api/events";
import { fetchProjectsApi } from "../api/projects";
import type { Task } from "../types/task";
import type { Habit } from "../types/habit";
import type { Event } from "../types/event";
import type { Project } from "../types/project";
import { TaskStats } from "../components/tasks/TaskStats";
import { TaskItem } from "../components/tasks/TaskItem";
import { TaskFormModal } from "../components/tasks/TaskFormModal";
import { ActivityHeatmap } from "../components/analytics/ActivityHeatmap";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { cn } from "../lib/utils";

export function DashboardPage() {
  const { user } = useAuth();
  const outletContext = useOutletContext<{
    openNewTaskModal: () => void;
    openFocusModal: () => void;
    openCommandPalette: () => void;
  } | null>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [tasksData, habitsData, eventsData, projectsData] = await Promise.all([
        fetchTasksApi({ filter: "all" }),
        fetchHabitsApi(),
        fetchEventsApi("upcoming"),
        fetchProjectsApi(),
      ]);
      setTasks(tasksData);
      setHabits(habitsData);
      setUpcomingEvents(eventsData.slice(0, 3));
      setProjects(projectsData.slice(0, 3));
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => loadDashboardData();
    window.addEventListener("lifeos:task-updated", handleUpdate);
    window.addEventListener("lifeos:habit-updated", handleUpdate);
    window.addEventListener("lifeos:focus-updated", handleUpdate);

    return () => {
      window.removeEventListener("lifeos:task-updated", handleUpdate);
      window.removeEventListener("lifeos:habit-updated", handleUpdate);
      window.removeEventListener("lifeos:focus-updated", handleUpdate);
    };
  }, [loadDashboardData]);

  const handleToggleTask = async (id: number, completed: boolean) => {
    try {
      await toggleTaskCompleteApi(id, completed);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed, status: completed ? "COMPLETED" : "PENDING" } : t))
      );
      window.dispatchEvent(new CustomEvent("lifeos:task-updated"));
    } catch (err) {
      console.error("Failed to toggle task:", err);
      loadDashboardData();
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTaskApi(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      window.dispatchEvent(new CustomEvent("lifeos:task-updated"));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleHabitCheckIn = async (id: number) => {
    try {
      const updated = await checkInHabitApi(id);
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
      window.dispatchEvent(new CustomEvent("lifeos:habit-updated"));
    } catch (err) {
      console.error("Failed to check in habit:", err);
      loadDashboardData();
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

  const habitsDoneToday = habits.filter((h) => h.completedToday).length;

  return (
    <div className="space-y-6">
      {/* Flat Welcome Banner (No gradients) */}
      <div className="rounded-lg border border-[#222736] bg-[#13161f] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-400">
              <Terminal className="h-3.5 w-3.5" />
              <span>Personal Developer Life OS • v3.0 Active</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#e6edf3] mt-1">
              Welcome back, {user?.name?.split(" ")[0] || "Developer"}
            </h2>
            <p className="text-xs text-[#8b949e] mt-1 max-w-xl font-mono">
              Universal workspace: Projects Kanban, Pomodoro focus, task backlog, habits & analytics
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => outletContext?.openFocusModal()}
              className="text-xs"
            >
              <Timer className="h-3.5 w-3.5 text-blue-400 mr-1.5" />
              <span>Pomodoro</span>
            </Button>

            <Button
              size="sm"
              onClick={() => outletContext?.openNewTaskModal()}
              className="text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              <span>New Task</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Task Overview Metrics */}
      <TaskStats tasks={tasks} />

      {/* 90-Day Activity Heatmap Matrix & Weekly Retrospective */}
      <ActivityHeatmap />

      {/* Habits & Events Quick Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Habits Quick Check-In Widget */}
        <Card className="border-[#222736] bg-[#13161f]">
          <CardHeader className="flex flex-row items-center justify-between pb-2.5">
            <div>
              <CardTitle className="text-xs font-semibold flex items-center gap-2 text-[#e6edf3]">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>Daily Habits ({habitsDoneToday}/{habits.length})</span>
              </CardTitle>
              <p className="text-[11px] text-[#8b949e] mt-0.5">Quick daily consistency check-in</p>
            </div>
            <Link to="/habits" className="text-xs text-blue-400 hover:text-blue-300 font-mono">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {habits.length === 0 ? (
              <p className="text-xs text-[#57606a] py-3 text-center">No habits added yet.</p>
            ) : (
              habits.slice(0, 3).map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-md bg-[#0d0f14] p-2 border border-[#222736]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-[#e6edf3] truncate">{h.name}</span>
                    <span className="text-[10px] text-amber-400 font-mono flex items-center gap-0.5 shrink-0">
                      <Flame className="h-3 w-3" />
                      {h.currentStreak}d
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleHabitCheckIn(h.id)}
                    className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-mono font-medium transition-colors cursor-pointer shrink-0 ml-2 border",
                      h.completedToday
                        ? "bg-[#162a1c] text-[#3fb950] border-[#224b2b]"
                        : "bg-blue-600 hover:bg-blue-500 text-white border-blue-500"
                    )}
                  >
                    {h.completedToday ? "Done ✓" : "Check In"}
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events Widget */}
        <Card className="border-[#222736] bg-[#13161f]">
          <CardHeader className="flex flex-row items-center justify-between pb-2.5">
            <div>
              <CardTitle className="text-xs font-semibold flex items-center gap-2 text-[#e6edf3]">
                <Calendar className="h-3.5 w-3.5 text-blue-400" />
                <span>Upcoming Events</span>
              </CardTitle>
              <p className="text-[11px] text-[#8b949e] mt-0.5">Scheduled meetings & milestone releases</p>
            </div>
            <Link to="/events" className="text-xs text-blue-400 hover:text-blue-300 font-mono">
              Calendar
            </Link>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-[#57606a] py-3 text-center">No upcoming events scheduled.</p>
            ) : (
              upcomingEvents.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-md bg-[#0d0f14] p-2 border border-[#222736]"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#e6edf3] truncate">{e.title}</p>
                    <p className="text-[10px] text-[#8b949e] font-mono flex items-center gap-1.5 mt-0.5">
                      <span>{new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      {e.time && <span>• {e.time}</span>}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main 2-Column Section: Today's Tasks & Projects Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Tasks & Overdue Attention */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue alert if any */}
          {overdueTasks.length > 0 && (
            <Card className="border-[#67252b] bg-[#3c1e22]/30">
              <CardHeader className="pb-2.5 border-b border-[#67252b]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-[#f85149] flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-[#f85149]" />
                    Overdue Attention Required ({overdueTasks.length})
                  </CardTitle>
                  <Link
                    to="/tasks?filter=overdue"
                    className="text-xs text-[#f85149] hover:underline font-mono"
                  >
                    View in Tasks
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-2.5">
                {overdueTasks.slice(0, 3).map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onEdit={setEditingTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Today's Tasks */}
          <Card className="border-[#222736] bg-[#13161f]">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm text-[#e6edf3]">Today's Tasks Agenda</CardTitle>
                <p className="text-xs text-[#8b949e] mt-0.5">Tasks scheduled for completion today</p>
              </div>
              <Link
                to="/tasks?filter=today"
                className="text-xs text-blue-400 hover:text-blue-300 font-mono"
              >
                See all ({todayTasks.length})
              </Link>
            </CardHeader>
            <CardContent className="pt-3">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-[#8b949e]">Loading today's tasks...</div>
              ) : todayTasks.length === 0 ? (
                <div className="py-8 text-center text-[#8b949e]">
                  <CheckCircle className="mx-auto h-7 w-7 text-emerald-400/80 mb-2" />
                  <p className="text-xs font-medium text-[#e6edf3]">Nothing scheduled for today!</p>
                  <p className="text-[11px] text-[#8b949e] mt-1 font-mono">
                    Pick high-priority tasks from your backlog or launch a Pomodoro focus sprint.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onEdit={setEditingTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Active Projects & System Shortcuts */}
        <div className="space-y-6">
          {/* Active Projects Widget */}
          <Card className="border-[#222736] bg-[#13161f]">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-xs font-semibold flex items-center gap-2 text-[#e6edf3]">
                  <FolderGit2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Active Projects ({projects.length})</span>
                </CardTitle>
                <p className="text-[11px] text-[#8b949e] mt-0.5">Kanban repos & workflows</p>
              </div>
              <Link to="/projects" className="text-xs text-blue-400 hover:text-blue-300 font-mono">
                All Projects
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-1">
              {projects.length === 0 ? (
                <p className="text-xs text-[#57606a] py-3 text-center">No projects added yet.</p>
              ) : (
                projects.map((p) => (
                  <Link
                    key={p.id}
                    to="/projects"
                    className="block rounded-md bg-[#0d0f14] p-2.5 border border-[#222736] hover:border-[#384259] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#e6edf3]">{p.name}</span>
                      <span className="text-[10px] font-mono text-[#8b949e] rounded bg-[#161922] px-1 py-0.2 border border-[#222736]">
                        {p.status}
                      </span>
                    </div>
                    {p.techStack && p.techStack.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {p.techStack.slice(0, 3).map((t) => (
                          <span key={t} className="text-[9px] font-mono text-[#8b949e]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="border-[#222736] bg-[#13161f]">
            <CardHeader className="pb-2.5">
              <CardTitle className="text-xs font-semibold text-[#e6edf3]">
                Universal Command Palette
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs font-mono text-[#8b949e]">
              <p className="text-[11px]">
                Press <kbd className="rounded bg-[#0d0f14] border border-[#222736] px-1.5 py-0.5 text-[#e6edf3]">⌘K</kbd> or <kbd className="rounded bg-[#0d0f14] border border-[#222736] px-1.5 py-0.5 text-[#e6edf3]">Ctrl+K</kbd> anywhere to trigger quick actions, search, and jump to any module.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => outletContext?.openCommandPalette()}
                >
                  <span>Open Command Palette</span>
                </Button>
              </div>
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
            loadDashboardData();
          }}
          taskToEdit={editingTask}
        />
      )}
    </div>
  );
}
