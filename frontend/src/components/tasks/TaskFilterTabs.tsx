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
    { id: "overdue", label: "Overdue", count: counts.overdue, alertColor: "text-[#f85149]" },
    { id: "completed", label: "Completed", count: counts.completed },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-[#222736]">
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-xs font-mono font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer",
              isActive
                ? "border-blue-500 text-[#58a6ff] font-semibold"
                : "border-transparent text-[#8b949e] hover:text-[#e6edf3] hover:border-[#384259]"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded px-1.5 py-0.2 text-[10px] font-mono border",
                  isActive
                    ? "bg-[#152744] text-[#58a6ff] border-[#1f4277]"
                    : "bg-[#161922] text-[#8b949e] border-[#222736]",
                  tab.alertColor && tab.count > 0 && !isActive ? `${tab.alertColor} border-[#67252b] bg-[#3c1e22]` : ""
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
