import type { FilterType } from "../../types/task";
import { cn } from "../../lib/utils";

interface FilterTabProps {
  activeFilter: FilterType;
  onChange: (filter: FilterType) => void;
  counts?: {
    all?: number;
    today?: number;
    upcoming?: number;
    overdue?: number;
    completed?: number;
  };
}

export function TaskFilterTabs({ activeFilter, onChange, counts = {} }: FilterTabProps) {
  const tabs: { id: FilterType; label: string; count?: number; alertColor?: string }[] = [
    { id: "all", label: "All Tasks", count: counts.all },
    { id: "today", label: "Today", count: counts.today },
    { id: "upcoming", label: "Upcoming", count: counts.upcoming },
    { id: "overdue", label: "Overdue", count: counts.overdue, alertColor: "text-rose-400" },
    { id: "completed", label: "Completed", count: counts.completed },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer",
              isActive
                ? "border-blue-500 text-blue-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                  isActive
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-slate-800 text-slate-400",
                  tab.alertColor && tab.count > 0 && !isActive ? tab.alertColor : ""
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
