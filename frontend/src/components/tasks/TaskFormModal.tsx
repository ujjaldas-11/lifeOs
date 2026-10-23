import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { createTaskApi, updateTaskApi } from "../../api/tasks";
import type { Task, Priority } from "../../types/task";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskToEdit?: Task | null;
}

export function TaskFormModal({ isOpen, onClose, onSuccess, taskToEdit }: TaskFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [completed, setCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      setPriority(taskToEdit.priority || "MEDIUM");
      setCompleted(taskToEdit.completed || false);
      if (taskToEdit.dueDate) {
        // Format to YYYY-MM-DD for date input
        const d = new Date(taskToEdit.dueDate);
        setDueDate(d.toISOString().split("T")[0] || "");
      } else {
        setDueDate("");
      }
    } else {
      // Defaults for new task
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setCompleted(false);
      setDueDate("");
    }
    setError(null);
  }, [taskToEdit, isOpen]);

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

      if (taskToEdit) {
        await updateTaskApi(taskToEdit.id, {
          title: title.trim(),
          description: description.trim() || null,
          priority,
          dueDate: formattedDueDate,
          completed,
        });
      } else {
        await createTaskApi({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: formattedDueDate,
          completed: false,
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
          <div className="rounded-lg bg-red-950/60 border border-red-800/80 p-3 text-xs text-red-300">
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
          <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context, acceptance criteria or links..."
            className="w-full rounded-lg bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Priority Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(["LOW", "MEDIUM", "HIGH"] as Priority[]).map((p) => {
                const isSelected = priority === p;
                const colors = {
                  LOW: isSelected ? "bg-emerald-600 text-white" : "text-emerald-400 hover:bg-slate-850",
                  MEDIUM: isSelected ? "bg-amber-600 text-white" : "text-amber-400 hover:bg-slate-850",
                  HIGH: isSelected ? "bg-rose-600 text-white" : "text-rose-400 hover:bg-slate-850",
                }[p];

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${colors}`}
                  >
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                Due Date
              </label>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate("")}
                  className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            />
            {/* Quick date presets */}
            <div className="flex items-center gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => setQuickDate(0)}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(1)}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(7)}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
              >
                Next Week
              </button>
            </div>
          </div>
        </div>

        {/* Completed status checkbox (when editing) */}
        {taskToEdit && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <input
              type="checkbox"
              id="modal-task-completed"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="modal-task-completed"
              className="text-sm font-medium text-slate-300 cursor-pointer"
            >
              Mark task as completed
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
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
