import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  CheckSquare,
  Flame,
  Calendar,
  FileText,
  FolderGit2,
  Settings,
  Timer,
  LayoutDashboard,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFocusModal: () => void;
  onOpenNewTaskModal: () => void;
}

interface CommandItem {
  id: string;
  category: "Navigation" | "Quick Action";
  title: string;
  description?: string;
  icon: any;
  action: () => void;
  shortcut?: string;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenFocusModal,
  onOpenNewTaskModal,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    {
      id: "focus-timer",
      category: "Quick Action",
      title: "Start Focus Pomodoro Timer",
      description: "Launch 25-minute developer focus session",
      icon: Timer,
      action: () => {
        onClose();
        onOpenFocusModal();
      },
      shortcut: "P",
    },
    {
      id: "new-task",
      category: "Quick Action",
      title: "Create New Task",
      description: "Add a task with priority, due date, or project",
      icon: Plus,
      action: () => {
        onClose();
        onOpenNewTaskModal();
      },
      shortcut: "N",
    },
    {
      id: "nav-dashboard",
      category: "Navigation",
      title: "Go to Dashboard",
      description: "Metrics, activity heatmap, and today's summary",
      icon: LayoutDashboard,
      action: () => {
        navigate("/");
        onClose();
      },
    },
    {
      id: "nav-projects",
      category: "Navigation",
      title: "Go to Projects",
      description: "Kanban board, tech stacks, and project workflows",
      icon: FolderGit2,
      action: () => {
        navigate("/projects");
        onClose();
      },
    },
    {
      id: "nav-tasks",
      category: "Navigation",
      title: "Go to Tasks",
      description: "Today, upcoming, overdue, and completed filters",
      icon: CheckSquare,
      action: () => {
        navigate("/tasks");
        onClose();
      },
    },
    {
      id: "nav-habits",
      category: "Navigation",
      title: "Go to Habits",
      description: "Track streaks, consistency, and daily check-ins",
      icon: Flame,
      action: () => {
        navigate("/habits");
        onClose();
      },
    },
    {
      id: "nav-events",
      category: "Navigation",
      title: "Go to Events",
      description: "Developer calendar, meetings, deadlines, sprints",
      icon: Calendar,
      action: () => {
        navigate("/events");
        onClose();
      },
    },
    {
      id: "nav-notes",
      category: "Navigation",
      title: "Go to Notes",
      description: "Search notes, snippets, and markdown docs",
      icon: FileText,
      action: () => {
        navigate("/notes");
        onClose();
      },
    },
    {
      id: "nav-settings",
      category: "Navigation",
      title: "Go to Settings",
      description: "User profile, credentials, and full JSON workspace export",
      icon: Settings,
      action: () => {
        navigate("/settings");
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.description && cmd.description.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Flat backdrop */}
      <div
        className="fixed inset-0 bg-black/75 transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-50 w-full max-w-xl rounded-lg border border-[#222736] bg-[#13161f] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 border-b border-[#222736] bg-[#0d0f14]">
          <Search className="h-4 w-4 text-[#8b949e] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent py-3.5 text-sm text-[#e6edf3] placeholder:text-[#57606a] focus:outline-none font-mono"
            placeholder="Type a command or search (e.g. 'focus', 'tasks', 'export')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-[#161922] border border-[#222736] px-1.5 py-0.5 text-[10px] font-mono text-[#8b949e]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8b949e]">
              No matching commands found for "{search}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between rounded-md px-3 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#161922] text-[#e6edf3] border border-[#222736]"
                        : "text-[#8b949e] hover:bg-[#161922] hover:text-[#e6edf3] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`p-1.5 rounded ${
                          isSelected
                            ? "bg-[#1f2433] text-[#58a6ff]"
                            : "bg-[#161922] text-[#8b949e]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-[#e6edf3]">
                          {cmd.title}
                        </div>
                        {cmd.description && (
                          <div className="text-[11px] text-[#8b949e] truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-[#57606a] uppercase">
                        {cmd.category}
                      </span>
                      {cmd.shortcut && (
                        <kbd className="rounded bg-[#161922] border border-[#222736] px-1.5 py-0.5 text-[10px] font-mono text-[#8b949e]">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <ArrowRight className="h-3.5 w-3.5 text-[#58a6ff]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[#222736] bg-[#0d0f14] text-[11px] text-[#57606a] font-mono">
          <div className="flex items-center gap-2">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-400">
            <Sparkles className="h-3 w-3" />
            <span>Developer Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}
