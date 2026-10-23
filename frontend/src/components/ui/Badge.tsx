import { type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type { Priority } from "../../types/task";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "high"
    | "medium"
    | "low"
    | "today"
    | "upcoming"
    | "overdue"
    | "completed"
    | "active"
    | "on_hold";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-[#161922] text-[#8b949e] border-[#222736]",
    high: "bg-[#3c1e22] text-[#f85149] border-[#67252b]",
    medium: "bg-[#342c16] text-[#e3b341] border-[#59491a]",
    low: "bg-[#162a1c] text-[#3fb950] border-[#224b2b]",
    today: "bg-[#152744] text-[#58a6ff] border-[#1f4277]",
    upcoming: "bg-[#241e3d] text-[#bc8cff] border-[#3f326a]",
    overdue: "bg-[#3c1e22] text-[#f85149] border-[#67252b]",
    completed: "bg-[#161922] text-[#8b949e] border-[#222736] line-through",
    active: "bg-[#152744] text-[#58a6ff] border-[#1f4277]",
    on_hold: "bg-[#342c16] text-[#e3b341] border-[#59491a]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border",
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
