import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { TaskFormModal } from "../tasks/TaskFormModal";
import { FocusTimerModal } from "../focus/FocusTimerModal";
import { CommandPalette } from "../common/CommandPalette";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const location = useLocation();

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getPageTitle = (path: string) => {
    if (path === "/") return "Overview & Metrics";
    if (path.startsWith("/projects")) return "Projects & Kanban";
    if (path.startsWith("/tasks")) return "Task Management";
    if (path.startsWith("/habits")) return "Habit & Consistency Tracker";
    if (path.startsWith("/events")) return "Events & Calendar";
    if (path.startsWith("/notes")) return "Notes & Snippets";
    if (path.startsWith("/settings")) return "Settings & Backup";
    return "Developer Life OS";
  };

  return (
    <div className="flex min-h-screen bg-[#0d0f14] text-[#e6edf3]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <Topbar
          title={getPageTitle(location.pathname)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenNewTaskModal={() => setIsTaskModalOpen(true)}
          onOpenFocusModal={() => setIsFocusModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-7 max-w-7xl w-full mx-auto">
          <Outlet
            context={{
              openNewTaskModal: () => setIsTaskModalOpen(true),
              openFocusModal: () => setIsFocusModalOpen(true),
              openCommandPalette: () => setIsCommandPaletteOpen(true),
            }}
          />
        </main>
      </div>

      {/* Global Quick Create Task Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={() => {
          setIsTaskModalOpen(false);
          window.dispatchEvent(new CustomEvent("lifeos:task-updated"));
        }}
      />

      {/* Global Focus Timer Modal */}
      <FocusTimerModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenFocusModal={() => setIsFocusModalOpen(true)}
        onOpenNewTaskModal={() => setIsTaskModalOpen(true)}
      />
    </div>
  );
}
