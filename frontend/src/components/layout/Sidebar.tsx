import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  Calendar,
  FileText,
  FolderGit2,
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

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderGit2 },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Habits", href: "/habits", icon: Flame },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Notes", href: "/notes", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-[#222736] bg-[#0d0f14] transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between px-5 border-b border-[#222736]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#161922] border border-[#222736] text-blue-400 font-bold">
              <Terminal className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-[#e6edf3] text-sm">LifeOS</span>
              <span className="rounded bg-[#161922] px-1.5 py-0.5 text-[10px] font-mono text-[#8b949e] border border-[#222736]">
                v3.0
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-4">
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#57606a]">
              Workspace
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-[#161922] text-[#58a6ff] border border-[#222736]"
                          : "text-[#8b949e] hover:bg-[#13161f] hover:text-[#e6edf3]"
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
        </div>

        {/* User Info & Logout footer */}
        <div className="border-t border-[#222736] p-3">
          <div className="flex items-center justify-between rounded-md bg-[#13161f] p-2.5 border border-[#222736]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#161922] border border-[#222736] text-xs font-mono font-medium text-[#e6edf3] uppercase">
                {user?.name ? user.name.charAt(0) : "U"}
              </div>
              <div className="overflow-hidden text-left">
                <p className="truncate text-xs font-medium text-[#e6edf3]">{user?.name || "Developer"}</p>
                <p className="truncate text-[10px] text-[#8b949e] font-mono">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="rounded p-1 text-[#8b949e] hover:bg-[#161922] hover:text-[#f85149] transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
