import { useState } from "react";
import { Check, Calendar, Trash2, Edit2, AlertCircle, FolderGit2 } from "lucide-react";
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
        "group relative flex items-start gap-3 rounded-md border p-3.5 transition-colors",
        task.completed
          ? "border-[#222736] bg-[#0d0f14] opacity-65"
          : "border-[#222736] bg-[#13161f] hover:border-[#384259]"
      )}
    >
      {/* Complete toggle checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isToggling}
        title={task.completed ? "Mark as pending" : "Mark as completed"}
        className={cn(
          "mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer",
          task.completed
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-[#384259] bg-[#161922] hover:border-blue-500 text-transparent hover:text-blue-400"
        )}
      >
        <Check className={cn("h-3 w-3 stroke-[3]", task.completed ? "opacity-100" : "opacity-0 hover:opacity-100")} />
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={cn(
                "text-xs font-medium leading-snug",
                task.completed ? "text-[#8b949e] line-through" : "text-[#e6edf3]"
              )}
            >
              {task.title}
            </h4>

            {task.project && (
              <span className="inline-flex items-center gap-1 rounded bg-[#161922] border border-[#222736] px-1.5 py-0.2 text-[10px] font-mono text-[#8b949e]">
                <FolderGit2 className="h-2.5 w-2.5 text-blue-400" />
                <span>{task.project.name}</span>
              </span>
            )}
          </div>

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
              "mt-1 text-xs text-[#8b949e] leading-relaxed whitespace-pre-wrap line-clamp-2",
              task.completed && "line-through text-[#57606a]"
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
          className="rounded p-1 text-[#8b949e] hover:bg-[#161922] hover:text-[#e6edf3] transition-colors cursor-pointer"
        >
          <Edit2 className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete Task"
          className="rounded p-1 text-[#8b949e] hover:bg-[#161922] hover:text-[#f85149] transition-colors cursor-pointer"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
