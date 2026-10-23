import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Inbox,
} from "lucide-react";
import {
  fetchTasksApi,
  createTaskApi,
  toggleTaskCompleteApi,
  deleteTaskApi,
} from "../api/tasks";
import type { Task, FilterType, Priority } from "../types/task";
import { TaskItem } from "../components/tasks/TaskItem";
import { TaskFilterTabs } from "../components/tasks/TaskFilterTabs";
import { TaskFormModal } from "../components/tasks/TaskFormModal";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = (searchParams.get("filter") as FilterType) || "all";

  const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasksForCounts, setAllTasksForCounts] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Quick inline creation state
  const [inlineTitle, setInlineTitle] = useState("");
  const [inlinePriority, setInlinePriority] = useState<Priority>("MEDIUM");
  const [inlineDueDate, setInlineDueDate] = useState("");
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Keep query params in sync with filter tab
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    if (filter === "all") {
      searchParams.delete("filter");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams.entries()), filter });
    }
  };

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch all user tasks once to calculate tab counts
      const allData = await fetchTasksApi({ filter: "all" });
      setAllTasksForCounts(allData);

      // Fetch filtered list
      const filteredData = await fetchTasksApi({
        filter: activeFilter,
        priority: priorityFilter !== "ALL" ? (priorityFilter as Priority) : undefined,
        search: searchQuery,
      });

      setTasks(filteredData);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, priorityFilter, searchQuery]);

  useEffect(() => {
    loadTasks();

    const handleUpdate = () => loadTasks();
    window.addEventListener("lifeos:task-updated", handleUpdate);
    return () => window.removeEventListener("lifeos:task-updated", handleUpdate);
  }, [loadTasks]);

  // Calculate tab counts
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const tabCounts = {
    all: allTasksForCounts.length,
    today: allTasksForCounts.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= startOfToday && d <= endOfToday;
    }).length,
    upcoming: allTasksForCounts.filter((t) => {
      if (!t.dueDate || t.completed) return false;
      const d = new Date(t.dueDate);
      return d > endOfToday;
    }).length,
    overdue: allTasksForCounts.filter((t) => {
      if (!t.dueDate || t.completed) return false;
      const d = new Date(t.dueDate);
      return d < startOfToday;
    }).length,
    completed: allTasksForCounts.filter((t) => t.completed).length,
  };

  const handleToggle = async (id: number, completed: boolean) => {
    try {
      await toggleTaskCompleteApi(id, completed);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed, status: completed ? "COMPLETED" : "PENDING" } : t))
      );
      setAllTasksForCounts((prev) =>
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
      setAllTasksForCounts((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleInlineSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim()) {
      setInlineError("Task title is required");
      return;
    }

    try {
      setIsCreatingInline(true);
      setInlineError(null);

      const formattedDueDate = inlineDueDate ? new Date(`${inlineDueDate}T12:00:00Z`).toISOString() : null;

      await createTaskApi({
        title: inlineTitle.trim(),
        priority: inlinePriority,
        dueDate: formattedDueDate,
        completed: false,
      });

      setInlineTitle("");
      setInlineDueDate("");
      setInlinePriority("MEDIUM");
      loadTasks();
    } catch (err: any) {
      setInlineError(err.message || "Failed to create task");
    } finally {
      setIsCreatingInline(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Tasks Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Organize, prioritize, and track your developer assignments
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="shadow-sm shadow-blue-500/20 text-xs sm:text-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Add Detailed Task</span>
        </Button>
      </div>

      {/* Quick Add Inline Form */}
      <Card className="border-slate-800 bg-slate-900/60 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <form onSubmit={handleInlineSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="⚡ Quick add new task... (e.g. Implement refresh token route)"
                  value={inlineTitle}
                  onChange={(e) => setInlineTitle(e.target.value)}
                  className="w-full rounded-lg bg-slate-950/80 border border-slate-700/80 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Priority Selector */}
                <select
                  value={inlinePriority}
                  onChange={(e) => setInlinePriority(e.target.value as Priority)}
                  className="rounded-lg bg-slate-950/80 border border-slate-700/80 px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 cursor-pointer"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>

                {/* Due Date Input */}
                <input
                  type="date"
                  value={inlineDueDate}
                  onChange={(e) => setInlineDueDate(e.target.value)}
                  className="rounded-lg bg-slate-950/80 border border-slate-700/80 px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 cursor-pointer"
                />

                <Button
                  type="submit"
                  size="sm"
                  isLoading={isCreatingInline}
                  disabled={!inlineTitle.trim()}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Add</span>
                </Button>
              </div>
            </div>

            {inlineError && (
              <p className="text-xs text-red-400 font-medium pl-1">{inlineError}</p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Filter Tabs (Today / Upcoming / Overdue / Completed / All) */}
      <TaskFilterTabs
        activeFilter={activeFilter}
        onChange={handleFilterChange}
        counts={tabCounts}
      />

      {/* Search and Secondary Priority Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-slate-900/60 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-colors"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto self-end">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-xs text-slate-400">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto mb-3" />
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-12 text-center">
            <Inbox className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No tasks found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {activeFilter !== "all"
                ? `There are currently no tasks matching the "${activeFilter}" filter.`
                : searchQuery
                ? "No tasks match your search query."
                : "Your backlog is empty. Add your first task using the form above!"}
            </p>
            {activeFilter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => handleFilterChange("all")}
              >
                Show All Tasks
              </Button>
            )}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={(t) => {
                setEditingTask(t);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Modal for Creating or Editing Task */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingTask(null);
          loadTasks();
        }}
        taskToEdit={editingTask}
      />
    </div>
  );
}
