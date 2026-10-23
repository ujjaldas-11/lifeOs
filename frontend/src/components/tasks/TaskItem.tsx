import { useState } from "react";
import { Check, Calendar, Trash2, Edit2, AlertCircle } from "lucide-react";
import { PriorityBadge, Badge } from "../ui/Badge";
import type { Task } from "../../types/task";
import { cn } from "../../lib/utils";

interface TaskItemProps {
  task: Task;
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => Promise<void>;
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    try {
      setIsToggling(true);
      await onToggle(task.id, !task.completed);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        setIsDeleting(true);
        await onDelete(task.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Due date status calculation
  const getDueDateStatus = () => {
    if (!task.dueDate) return null;

    const due = new Date(task.dueDate);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const isToday = due >= startOfToday && due <= endOfToday;
    const isOverdue = due < startOfToday && !task.completed;

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(due);

    if (task.completed) {
      return {
        label: formattedDate,
        variant: "completed" as const,
        icon: Calendar,
      };
    }

    if (isOverdue) {
      return {
        label: `Overdue: ${formattedDate}`,
        variant: "overdue" as const,
        icon: AlertCircle,
      };
    }

    if (isToday) {
      return {
        label: "Due Today",
        variant: "today" as const,
        icon: Calendar,
      };
    }

    return {
      label: formattedDate,
      variant: "upcoming" as const,
      icon: Calendar,
    };
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3.5 rounded-xl border p-4 transition-all duration-150",
        task.completed
          ? "border-slate-800/60 bg-slate-950/40 opacity-75"
          : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80 shadow-sm"
      )}
    >
      {/* Complete toggle checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isToggling}
        title={task.completed ? "Mark as pending" : "Mark as completed"}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-150 cursor-pointer",
          task.completed
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-600 bg-slate-900/80 hover:border-blue-500 text-transparent hover:text-blue-400"
        )}
      >
        <Check className={cn("h-3.5 w-3.5 stroke-[3]", task.completed ? "opacity-100" : "opacity-0 hover:opacity-100")} />
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <h4
            className={cn(
              "text-sm font-medium leading-snug transition-all",
              task.completed ? "text-slate-500 line-through" : "text-slate-100"
            )}
          >
            {task.title}
          </h4>

          {/* Badges container */}
          <div className="flex items-center gap-1.5 shrink-0">
            <PriorityBadge priority={task.priority} />
            {dueDateStatus && (
              <Badge variant={dueDateStatus.variant} className="gap-1">
                <dueDateStatus.icon className="h-3 w-3" />
                <span>{dueDateStatus.label}</span>
              </Badge>
            )}
          </div>
        </div>

        {task.description && (
          <p
            className={cn(
              "mt-1.5 text-xs text-slate-400 leading-relaxed whitespace-pre-wrap line-clamp-2",
              task.completed && "text-slate-500 line-through"
            )}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* Action buttons (hover visible on desktop) */}
      <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          onClick={() => onEdit(task)}
          title="Edit Task"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete Task"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
