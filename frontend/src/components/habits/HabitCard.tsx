import { useState } from "react";
import { Flame, Check, Trophy, Edit2, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import type { Habit } from "../../types/habit";
import { cn } from "../../lib/utils";

interface HabitCardProps {
  habit: Habit;
  onCheckIn: (id: number) => Promise<void>;
  onEdit: (habit: Habit) => void;
  onDelete: (id: number) => Promise<void>;
}

export function HabitCard({ habit, onCheckIn, onEdit, onDelete }: HabitCardProps) {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCheckIn = async () => {
    try {
      setIsCheckingIn(true);
      await onCheckIn(habit.id);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete habit "${habit.name}"?`)) {
      try {
        setIsDeleting(true);
        await onDelete(habit.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Generate past 7 days for the mini activity strip
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "narrow" });
    const isCompleted = habit.logs?.some((l) => l.date === dateStr);
    const isToday = i === 6;

    return {
      dateStr,
      dayLabel,
      isCompleted,
      isToday,
    };
  });

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-lg border p-4.5 transition-colors",
        habit.completedToday
          ? "border-[#224b2b] bg-[#162a1c]/30"
          : "border-[#222736] bg-[#13161f] hover:border-[#384259]"
      )}
    >
      <div>
        {/* Top bar: Frequency and Action buttons */}
        <div className="flex items-start justify-between gap-2">
          <Badge variant="default">
            {habit.frequency === "DAILY" ? "Daily" : habit.frequency}
          </Badge>

          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(habit)}
              title="Edit Habit"
              className="rounded p-1 text-[#8b949e] hover:bg-[#161922] hover:text-[#e6edf3] transition-colors cursor-pointer"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete Habit"
              className="rounded p-1 text-[#8b949e] hover:bg-[#161922] hover:text-[#f85149] transition-colors cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Habit Name */}
        <h3 className="mt-2 text-sm font-semibold text-[#e6edf3] tracking-tight leading-snug">
          {habit.name}
        </h3>

        {/* Streaks Display */}
        <div className="mt-2.5 flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded bg-[#342c16] border border-[#59491a] px-2 py-0.5 text-xs font-mono font-medium text-[#e3b341]">
            <Flame className="h-3.5 w-3.5 fill-[#e3b341] stroke-[#e3b341]" />
            <span>
              {habit.currentStreak} {habit.currentStreak === 1 ? "day" : "days"} streak
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono text-[#8b949e]">
            <Trophy className="h-3 w-3 text-amber-400" />
            <span>Best: {habit.longestStreak}d</span>
          </div>
        </div>

        {/* 7-Day Mini Consistency Activity Strip */}
        <div className="mt-3.5 pt-3 border-t border-[#222736]">
          <div className="flex items-center justify-between text-[10px] text-[#57606a] mb-1.5 font-mono">
            <span>Last 7 Days</span>
            <span>Today</span>
          </div>
          <div className="flex items-center justify-between gap-1">
            {past7Days.map((day) => (
              <div key={day.dateStr} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-[#57606a] font-mono">{day.dayLabel}</span>
                <div
                  title={`${day.dateStr}: ${day.isCompleted ? "Completed" : "Not completed"}`}
                  className={cn(
                    "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                    day.isCompleted
                      ? "border-[#224b2b] bg-[#162a1c] text-[#3fb950]"
                      : "border-[#222736] bg-[#0d0f14] text-[#57606a]",
                    day.isToday && !day.isCompleted && "border-blue-500/80"
                  )}
                >
                  {day.isCompleted ? (
                    <Check className="h-3 w-3 stroke-[3]" />
                  ) : (
                    <div className="h-1 w-1 rounded-full bg-[#222736]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Check In Action Button */}
      <div className="mt-4 pt-3 border-t border-[#222736]">
        <Button
          type="button"
          onClick={handleCheckIn}
          isLoading={isCheckingIn}
          className={cn(
            "w-full text-xs font-mono py-1.5 transition-colors cursor-pointer",
            habit.completedToday
              ? "bg-[#162a1c] border border-[#224b2b] text-[#3fb950] hover:bg-[#1f3b27]"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          )}
        >
          {habit.completedToday ? (
            <span className="flex items-center justify-center gap-1.5">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              <span>Completed Today ✓ (Undo)</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <Flame className="h-3.5 w-3.5" />
              <span>Check In for Today</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
