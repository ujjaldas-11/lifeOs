import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { createTaskApi, updateTaskApi } from "../../api/tasks";
import { fetchProjectsApi } from "../../api/projects";
import type { Task, Priority, KanbanColumn } from "../../types/task";
import type { Project } from "../../types/project";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskToEdit?: Task | null;
  defaultProjectId?: number | null;
  defaultKanbanColumn?: KanbanColumn | string;
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSuccess,
  taskToEdit,
  defaultProjectId,
  defaultKanbanColumn,
}: TaskFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [completed, setCompleted] = useState(false);
  const [projectId, setProjectId] = useState<number | "">(defaultProjectId ?? "");
  const [kanbanColumn, setKanbanColumn] = useState<string>(defaultKanbanColumn ?? "TODO");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProjectsApi()
        .then((res) => setProjects(res))
        .catch((err) => console.error("Failed to load projects in task modal:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      setPriority(taskToEdit.priority || "MEDIUM");
      setCompleted(taskToEdit.completed || false);
      setProjectId(taskToEdit.projectId ?? "");
      setKanbanColumn(taskToEdit.kanbanColumn ?? "TODO");
      if (taskToEdit.dueDate) {
        const d = new Date(taskToEdit.dueDate);
        setDueDate(d.toISOString().split("T")[0] || "");
      } else {
        setDueDate("");
      }
    } else {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setCompleted(false);
      setDueDate("");
      setProjectId(defaultProjectId ?? "");
      setKanbanColumn(defaultKanbanColumn ?? "TODO");
    }
    setError(null);
  }, [taskToEdit, isOpen, defaultProjectId, defaultKanbanColumn]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const formattedDueDate = dueDate ? new Date(`${dueDate}T12:00:00Z`).toISOString() : null;
      const parsedProjectId = projectId ? Number(projectId) : null;

      if (taskToEdit) {
        await updateTaskApi(taskToEdit.id, {
          title: title.trim(),
          description: description.trim() || null,
          priority,
          dueDate: formattedDueDate,
          completed,
          projectId: parsedProjectId,
          kanbanColumn,
        });
      } else {
        await createTaskApi({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: formattedDueDate,
          completed: false,
          projectId: parsedProjectId,
          kanbanColumn,
        });
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save task");
    } finally {
      setIsLoading(false);
    }
  };

  const setQuickDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setDueDate(d.toISOString().split("T")[0] || "");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? "Edit Task" : "Create New Task"}
      description={
        taskToEdit
          ? "Update details or reschedule this task"
          : "Add an actionable item to your developer backlog"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-[#3c1e22] border border-[#67252b] p-3 text-xs text-[#f85149]">
            {error}
          </div>
        )}

        <Input
          label="Title *"
          placeholder="e.g. Implement refresh token rotation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context, acceptance criteria or links..."
            className="w-full rounded-md bg-[#161922] border border-[#222736] px-3.5 py-2 text-sm text-[#e6edf3] placeholder:text-[#57606a] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Project & Kanban Column Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1.5">
              Project (Optional)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-md bg-[#161922] border border-[#222736] px-3 py-2 text-xs text-[#e6edf3] focus:outline-none focus:border-blue-500"
            >
              <option value="">No Project (Personal Task)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1.5">
              Kanban Column
            </label>
            <select
              value={kanbanColumn}
              onChange={(e) => setKanbanColumn(e.target.value)}
              className="w-full rounded-md bg-[#161922] border border-[#222736] px-3 py-2 text-xs text-[#e6edf3] focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="REVIEW">REVIEW</option>
              <option value="DONE">DONE</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Priority Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[#161922] p-1 rounded-md border border-[#222736]">
              {(["LOW", "MEDIUM", "HIGH"] as Priority[]).map((p) => {
                const isSelected = priority === p;
                const colors = {
                  LOW: isSelected ? "bg-[#162a1c] text-[#3fb950] border-[#224b2b]" : "text-[#8b949e] hover:bg-[#1f2432]",
                  MEDIUM: isSelected ? "bg-[#342c16] text-[#e3b341] border-[#59491a]" : "text-[#8b949e] hover:bg-[#1f2432]",
                  HIGH: isSelected ? "bg-[#3c1e22] text-[#f85149] border-[#67252b]" : "text-[#8b949e] hover:bg-[#1f2432]",
                }[p];

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1 text-xs font-mono font-medium rounded border transition-colors cursor-pointer ${colors}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">
                Due Date
              </label>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate("")}
                  className="text-[11px] font-mono text-[#8b949e] hover:text-[#e6edf3] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-md bg-[#161922] border border-[#222736] px-3 py-1.5 text-xs text-[#e6edf3] focus:outline-none focus:border-blue-500 font-mono"
            />
            {/* Quick date presets */}
            <div className="flex items-center gap-1.5 mt-1 font-mono">
              <button
                type="button"
                onClick={() => setQuickDate(0)}
                className="text-[10px] bg-[#161922] hover:bg-[#1f2432] text-[#8b949e] hover:text-[#e6edf3] px-2 py-0.5 rounded border border-[#222736] cursor-pointer transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(1)}
                className="text-[10px] bg-[#161922] hover:bg-[#1f2432] text-[#8b949e] hover:text-[#e6edf3] px-2 py-0.5 rounded border border-[#222736] cursor-pointer transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(7)}
                className="text-[10px] bg-[#161922] hover:bg-[#1f2432] text-[#8b949e] hover:text-[#e6edf3] px-2 py-0.5 rounded border border-[#222736] cursor-pointer transition-colors"
              >
                +1 Week
              </button>
            </div>
          </div>
        </div>

        {/* Completed status checkbox (when editing) */}
        {taskToEdit && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#222736]">
            <input
              type="checkbox"
              id="modal-task-completed"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="h-4 w-4 rounded border-[#222736] bg-[#161922] text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="modal-task-completed"
              className="text-xs font-medium text-[#8b949e] cursor-pointer"
            >
              Mark task as completed
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-[#222736]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {taskToEdit ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
