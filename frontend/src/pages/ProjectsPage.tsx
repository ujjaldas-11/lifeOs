import { useState, useEffect } from "react";
import {
  FolderGit2,
  Plus,
  Search,
  ArrowLeft,
  Kanban,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ProjectCard } from "../components/projects/ProjectCard";
import { ProjectFormModal } from "../components/projects/ProjectFormModal";
import { KanbanBoard } from "../components/projects/KanbanBoard";
import { TaskFormModal } from "../components/tasks/TaskFormModal";
import { FocusTimerModal } from "../components/focus/FocusTimerModal";
import { fetchProjectsApi, fetchProjectByIdApi, deleteProjectApi } from "../api/projects";
import { fetchTasksApi } from "../api/tasks";
import type { Project, ProjectStatus } from "../types/project";
import type { Task, KanbanColumn } from "../types/task";

function GithubIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  // Task creation inside project
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [targetKanbanColumn, setTargetKanbanColumn] = useState<KanbanColumn>("TODO");

  // Focus timer modal
  const [focusTaskId, setFocusTaskId] = useState<number | null>(null);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState<boolean>(false);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await fetchProjectsApi({
        status: statusFilter === "ALL" ? undefined : (statusFilter as ProjectStatus),
        search,
      });
      setProjects(data);

      if (selectedProject) {
        const updated = await fetchProjectByIdApi(selectedProject.id);
        setSelectedProject(updated);
        setProjectTasks(updated.tasks || []);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [statusFilter, search]);

  const handleSelectProject = async (project: Project) => {
    try {
      const detailed = await fetchProjectByIdApi(project.id);
      setSelectedProject(detailed);
      setProjectTasks(detailed.tasks || []);
    } catch (err) {
      console.error("Failed to load project details:", err);
    }
  };

  const handleRefreshProjectTasks = async () => {
    if (!selectedProject) return;
    try {
      const tasks = await fetchTasksApi({ projectId: selectedProject.id });
      setProjectTasks(tasks);
    } catch (err) {
      console.error("Failed to refresh project tasks:", err);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProjectApi(id);
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
      loadProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const handleOpenAddTaskToProject = (column: KanbanColumn = "TODO") => {
    setTargetKanbanColumn(column);
    setIsTaskModalOpen(true);
  };

  const handleOpenFocus = (taskId: number) => {
    setFocusTaskId(taskId);
    setIsFocusModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* If a project is selected: Project Detail / Kanban View */}
      {selectedProject ? (
        <div className="space-y-6">
          {/* Top Back & Action Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8b949e] hover:text-[#e6edf3] cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to all projects</span>
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setProjectToEdit(selectedProject);
                  setIsProjectModalOpen(true);
                }}
              >
                Edit Project
              </Button>

              <Button
                size="sm"
                onClick={() => handleOpenAddTaskToProject("TODO")}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Add Task</span>
              </Button>
            </div>
          </div>

          {/* Project Details Banner */}
          <div className="rounded-lg border border-[#222736] bg-[#13161f] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-[#e6edf3]">
                    {selectedProject.name}
                  </h2>
                  <Badge
                    variant={
                      selectedProject.status === "ACTIVE"
                        ? "active"
                        : selectedProject.status === "ON_HOLD"
                        ? "on_hold"
                        : "low"
                    }
                  >
                    {selectedProject.status.replace("_", " ")}
                  </Badge>
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline font-mono"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                      <span>Repo</span>
                    </a>
                  )}
                </div>

                {selectedProject.description && (
                  <p className="mt-2 text-xs text-[#8b949e] max-w-3xl">
                    {selectedProject.description}
                  </p>
                )}

                {/* Tech Stack */}
                {selectedProject.techStack && selectedProject.techStack.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedProject.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded bg-[#161922] border border-[#222736] px-2 py-0.5 text-xs font-mono text-[#8b949e]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Summary */}
              <div className="flex items-center gap-4 text-xs font-mono text-[#8b949e] bg-[#0d0f14] p-3 rounded border border-[#222736]">
                <div>
                  <div className="text-[10px] text-[#57606a] uppercase">Tasks</div>
                  <div className="text-sm font-bold text-[#e6edf3]">
                    {projectTasks.filter((t) => t.completed).length} / {projectTasks.length}
                  </div>
                </div>
                <div className="border-l border-[#222736] pl-3">
                  <div className="text-[10px] text-[#57606a] uppercase">Notes</div>
                  <div className="text-sm font-bold text-[#e6edf3]">
                    {selectedProject.notes?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kanban Section Header */}
          <div className="flex items-center justify-between border-b border-[#222736] pb-3">
            <div className="flex items-center gap-2">
              <Kanban className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-[#e6edf3]">
                Kanban Workflow
              </h3>
            </div>
            <span className="text-xs text-[#8b949e] font-mono">
              Click arrows or move cards to transition task columns
            </span>
          </div>

          {/* Kanban Board */}
          <KanbanBoard
            project={selectedProject}
            tasks={projectTasks}
            onTasksUpdated={handleRefreshProjectTasks}
            onOpenNewTaskModal={(col) => handleOpenAddTaskToProject(col)}
            onOpenFocusModal={handleOpenFocus}
          />
        </div>
      ) : (
        /* Projects Overview / Grid View */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#e6edf3]">
                Projects & Repositories
              </h2>
              <p className="text-xs text-[#8b949e] mt-1 font-mono">
                Manage your developer repositories, features, tech stacks, and Kanban boards
              </p>
            </div>

            <Button onClick={() => {
              setProjectToEdit(null);
              setIsProjectModalOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-1.5" />
              <span>New Project</span>
            </Button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8b949e]" />
              <input
                type="text"
                placeholder="Search projects or tech stacks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md bg-[#161922] border border-[#222736] pl-9 pr-3.5 py-1.5 text-xs text-[#e6edf3] placeholder:text-[#57606a] focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center rounded-md bg-[#161922] p-1 border border-[#222736] overflow-x-auto">
              {["ALL", "ACTIVE", "ON_HOLD", "COMPLETED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-mono font-medium rounded transition-colors cursor-pointer ${
                    statusFilter === st
                      ? "bg-[#222736] text-[#e6edf3]"
                      : "text-[#8b949e] hover:text-[#e6edf3]"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="py-20 text-center text-xs text-[#8b949e]">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="py-16 text-center rounded-lg border border-dashed border-[#222736] bg-[#13161f]/50 p-8">
              <FolderGit2 className="h-10 w-10 text-[#57606a] mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[#e6edf3]">No projects found</h3>
              <p className="text-xs text-[#8b949e] mt-1 max-w-md mx-auto">
                {search || statusFilter !== "ALL"
                  ? "No projects match your current filter criteria."
                  : "Create your first project to organize your repositories and Kanban workflows."}
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => {
                  setProjectToEdit(null);
                  setIsProjectModalOpen(true);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Create Project</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={handleSelectProject}
                  onEdit={(p) => {
                    setProjectToEdit(p);
                    setIsProjectModalOpen(true);
                  }}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setProjectToEdit(null);
        }}
        projectToEdit={projectToEdit}
        onSuccess={() => {
          setIsProjectModalOpen(false);
          setProjectToEdit(null);
          loadProjects();
        }}
      />

      {/* Quick Task Modal inside Project */}
      {selectedProject && (
        <TaskFormModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          defaultProjectId={selectedProject.id}
          defaultKanbanColumn={targetKanbanColumn}
          onSuccess={() => {
            setIsTaskModalOpen(false);
            handleRefreshProjectTasks();
            loadProjects();
          }}
        />
      )}

      {/* Focus Timer Modal */}
      <FocusTimerModal
        isOpen={isFocusModalOpen}
        onClose={() => {
          setIsFocusModalOpen(false);
          setFocusTaskId(null);
        }}
        defaultTaskId={focusTaskId}
      />
    </div>
  );
}
