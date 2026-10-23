import { Menu, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "../ui/Button";

interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenNewTaskModal?: () => void;
  title?: string;
}

export function Topbar({ onToggleSidebar, onOpenNewTaskModal, title = "Dashboard" }: TopbarProps) {
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-850 hover:text-slate-100 lg:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-100 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800/80 px-3 py-1.5 text-xs text-slate-400">
          <CalendarIcon className="h-3.5 w-3.5 text-blue-400" />
          <span>{todayFormatted}</span>
        </div>

        {onOpenNewTaskModal && (
          <Button
            size="sm"
            onClick={onOpenNewTaskModal}
            className="shadow-sm shadow-blue-500/20 text-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>New Task</span>
          </Button>
        )}
      </div>
    </header>
  );
}
