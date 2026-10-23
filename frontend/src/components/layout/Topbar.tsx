import { Menu, Plus, Calendar as CalendarIcon, Timer, Search } from "lucide-react";
import { Button } from "../ui/Button";

interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenNewTaskModal?: () => void;
  onOpenFocusModal?: () => void;
  onOpenCommandPalette?: () => void;
  title?: string;
}

export function Topbar({
  onToggleSidebar,
  onOpenNewTaskModal,
  onOpenFocusModal,
  onOpenCommandPalette,
  title = "Dashboard",
}: TopbarProps) {
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#222736] bg-[#0d0f14] px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded p-1.5 text-[#8b949e] hover:bg-[#161922] hover:text-[#e6edf3] lg:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold text-[#e6edf3] tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Global Command Palette search trigger */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden sm:inline-flex items-center gap-2 rounded-md bg-[#161922] border border-[#222736] px-2.5 py-1.5 text-xs text-[#8b949e] hover:text-[#e6edf3] hover:border-[#384259] transition-colors cursor-pointer font-mono"
            title="Open Command Palette (Cmd + K / Ctrl + K)"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Jump to...</span>
            <kbd className="rounded bg-[#0d0f14] border border-[#222736] px-1 py-0.2 text-[10px] text-[#8b949e]">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Date badge */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-md bg-[#161922] border border-[#222736] px-2.5 py-1.5 text-xs font-mono text-[#8b949e]">
          <CalendarIcon className="h-3.5 w-3.5 text-blue-400" />
          <span>{todayFormatted}</span>
        </div>

        {/* Focus Timer Launch Button */}
        {onOpenFocusModal && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFocusModal}
            className="text-xs"
            title="Launch Focus & Pomodoro Timer"
          >
            <Timer className="h-3.5 w-3.5 text-blue-400 mr-1.5" />
            <span className="hidden sm:inline font-mono">Focus</span>
          </Button>
        )}

        {/* New Task Button */}
        {onOpenNewTaskModal && (
          <Button
            size="sm"
            onClick={onOpenNewTaskModal}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>New Task</span>
          </Button>
        )}
      </div>
    </header>
  );
}
