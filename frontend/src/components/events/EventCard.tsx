import { useState } from "react";
import { Clock, Edit2, Trash2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { Event } from "../../types/event";
import { cn } from "../../lib/utils";

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: number) => Promise<void>;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const eventDate = new Date(event.date);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const isToday = eventDate >= startOfToday && eventDate <= endOfToday;
  const isPast = eventDate < startOfToday;

  const monthStr = eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const dayStr = eventDate.getDate();
  const weekdayStr = eventDate.toLocaleDateString("en-US", { weekday: "short" });

  const getRelativeBadge = () => {
    if (isToday) {
      return <Badge variant="today">Today</Badge>;
    }
    if (isPast) {
      return <Badge variant="default">Past</Badge>;
    }

    const diffDays = Math.ceil((eventDate.getTime() - endOfToday.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      return <Badge variant="upcoming">Tomorrow</Badge>;
    }
    return <Badge variant="upcoming">In {diffDays}d</Badge>;
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete event "${event.title}"?`)) {
      try {
        setIsDeleting(true);
        await onDelete(event.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3.5 rounded-lg border p-3.5 transition-colors",
        isToday
          ? "border-[#1f4277] bg-[#152744]/25"
          : isPast
          ? "border-[#222736] bg-[#0d0f14] opacity-65"
          : "border-[#222736] bg-[#13161f] hover:border-[#384259]"
      )}
    >
      {/* Date Block */}
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md border text-center transition-colors font-mono",
          isToday
            ? "border-[#1f4277] bg-[#152744] text-[#58a6ff]"
            : isPast
            ? "border-[#222736] bg-[#0d0f14] text-[#57606a]"
            : "border-[#222736] bg-[#161922] text-[#e6edf3]"
        )}
      >
        <span className="text-[9px] font-bold tracking-wider leading-none text-[#8b949e]">
          {monthStr}
        </span>
        <span className="text-base font-bold leading-none mt-1">{dayStr}</span>
        <span className="text-[8px] text-[#57606a] leading-none mt-0.5">{weekdayStr}</span>
      </div>

      {/* Event Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <h4
            className={cn(
              "text-xs font-semibold tracking-tight",
              isPast ? "text-[#8b949e]" : "text-[#e6edf3]"
            )}
          >
            {event.title}
          </h4>

          <div className="flex items-center gap-2 shrink-0">
            {event.time && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#8b949e] font-mono">
                <Clock className="h-3 w-3 text-blue-400" />
                <span>{event.time}</span>
              </span>
            )}
            {getRelativeBadge()}
          </div>
        </div>

        {event.description && (
          <p className="mt-1 text-xs text-[#8b949e] leading-relaxed line-clamp-2">
            {event.description}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          onClick={() => onEdit(event)}
          title="Edit Event"
          className="rounded p-1 text-[#8b949e] hover:bg-[#161922] hover:text-[#e6edf3] transition-colors cursor-pointer"
        >
          <Edit2 className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete Event"
          className="rounded p-1 text-[#8b949e] hover:bg-[#161922] hover:text-[#f85149] transition-colors cursor-pointer"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
