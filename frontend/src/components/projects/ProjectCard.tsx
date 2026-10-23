import { FolderGit2, CheckCircle2, FileText, Kanban } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import type { Project } from "../../types/project";

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

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
}

export function ProjectCard({ project, onSelect, onEdit, onDelete }: ProjectCardProps) {
  const tasksCount = project._count?.tasks ?? project.tasks?.length ?? 0;
  const completedTasks = project.tasks?.filter((t) => t.completed).length ?? 0;
  const notesCount = project._count?.notes ?? project.notes?.length ?? 0;
  const progressPercent = tasksCount > 0 ? Math.round((completedTasks / tasksCount) * 100) : 0;

  const statusVariant = {
    ACTIVE: "active" as const,
    ON_HOLD: "on_hold" as const,
    COMPLETED: "low" as const,
  }[project.status] || "default" as const;

  return (
    <Card className="border-[#222736] bg-[#13161f] hover:border-[#3b4259] transition-all flex flex-col justify-between">
      <CardContent className="p-4.5">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#161922] border border-[#222736] text-blue-400">
              <FolderGit2 className="h-4 w-4" />
            </div>
            <div>
              <h3
                onClick={() => onSelect(project)}
                className="font-semibold text-sm text-[#e6edf3] hover:text-blue-400 cursor-pointer transition-colors"
              >
                {project.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant={statusVariant}>{project.status.replace("_", " ")}</Badge>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161922] transition-colors"
                title="View GitHub Repository"
              >
                <GithubIcon className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mt-2.5 text-xs text-[#8b949e] line-clamp-2">
          {project.description || "No description provided."}
        </p>

        {/* Tech Stack Badges */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded bg-[#161922] border border-[#222736] px-1.5 py-0.5 text-[10px] font-mono text-[#8b949e]"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Progress Bar & Stats */}
        <div className="mt-4 pt-3 border-t border-[#222736]">
          <div className="flex items-center justify-between text-xs font-mono text-[#8b949e] mb-1.5">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              {completedTasks}/{tasksCount} Tasks
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-purple-400" />
              {notesCount} Notes
            </span>
            <span>{progressPercent}%</span>
          </div>

          <div className="h-1.5 w-full bg-[#161922] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                project.status === "COMPLETED" ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardContent>

      {/* Card Footer Actions */}
      <div className="px-4.5 py-2.5 bg-[#0d0f14] border-t border-[#222736] flex items-center justify-between">
        <button
          type="button"
          onClick={() => onSelect(project)}
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
        >
          <Kanban className="h-3.5 w-3.5" />
          <span>Open Kanban</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(project)}
            className="text-xs text-[#8b949e] hover:text-[#e6edf3] cursor-pointer"
          >
            Edit
          </button>
          <span className="text-[#222736]">|</span>
          <button
            type="button"
            onClick={() => onDelete(project.id)}
            className="text-xs text-[#8b949e] hover:text-[#f85149] cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </Card>
  );
}
