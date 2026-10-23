import { type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type { Priority } from "../../types/task";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "high" | "medium" | "low" | "today" | "upcoming" | "overdue" | "completed";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    high: "bg-rose-950/60 text-rose-300 border-rose-800/60",
    medium: "bg-amber-950/60 text-amber-300 border-amber-800/60",
    low: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
    today: "bg-blue-950/60 text-blue-300 border-blue-800/60",
    upcoming: "bg-indigo-950/60 text-indigo-300 border-indigo-800/60",
    overdue: "bg-red-950/70 text-red-300 border-red-700/70",
    completed: "bg-slate-800/80 text-slate-400 border-slate-700/60 line-through",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const norm = priority.toUpperCase() as Priority;
  const config = {
    HIGH: { label: "High", variant: "high" as const },
    MEDIUM: { label: "Medium", variant: "medium" as const },
    LOW: { label: "Low", variant: "low" as const },
  }[norm] || { label: priority, variant: "default" as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
