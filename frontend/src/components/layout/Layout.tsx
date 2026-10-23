import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { TaskFormModal } from "../tasks/TaskFormModal";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path: string) => {
    if (path === "/") return "Overview & Metrics";
    if (path.startsWith("/tasks")) return "Task Management";
    if (path.startsWith("/notes")) return "Notes (Phase 2)";
    if (path.startsWith("/projects")) return "Projects (Phase 2)";
    if (path.startsWith("/habits")) return "Habit Tracker (Phase 3)";
    if (path.startsWith("/settings")) return "Settings";
    return "Developer Life OS";
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <Topbar
          title={getPageTitle(location.pathname)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenNewTaskModal={() => setIsTaskModalOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openNewTaskModal: () => setIsTaskModalOpen(true) }} />
        </main>
      </div>

      {/* Global Quick Create Task Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={() => {
          setIsTaskModalOpen(false);
          // Dispatch custom event so active pages refresh seamlessly
          window.dispatchEvent(new CustomEvent("lifeos:task-updated"));
        }}
      />
    </div>
  );
}
