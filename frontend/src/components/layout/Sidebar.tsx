import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  FolderGit2,
  Flame,
  Settings,
  LogOut,
  Terminal,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const primaryNavItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
  ];

  const placeholderNavItems = [
    { name: "Notes", href: "/notes", icon: FileText, tag: "Phase 2" },
    { name: "Projects", href: "/projects", icon: FolderGit2, tag: "Phase 2" },
    { name: "Habits", href: "/habits", icon: Flame, tag: "Phase 3" },
    { name: "Settings", href: "/settings", icon: Settings, tag: "Soon" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur-md transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 text-white font-bold">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-base">LifeOS</span>
              <span className="ml-1.5 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                Phase 1
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Core
            </div>
            <nav className="space-y-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Coming in Next Phases
            </div>
            <nav className="space-y-1">
              {placeholderNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-slate-800 text-slate-200"
                          : "text-slate-500 hover:bg-slate-900/60 hover:text-slate-300"
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.tag && (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/60">
                        {item.tag}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Info & Logout footer */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3 border border-slate-800/80">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-semibold text-white uppercase shadow-sm">
                {user?.name ? user.name.charAt(0) : "U"}
              </div>
              <div className="overflow-hidden text-left">
                <p className="truncate text-xs font-semibold text-slate-200">{user?.name || "Developer"}</p>
                <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
