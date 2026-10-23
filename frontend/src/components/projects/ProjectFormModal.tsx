import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { createProjectApi, updateProjectApi } from "../../api/projects";
import type { Project, ProjectStatus } from "../../types/project";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
  onSuccess: () => void;
}

export function ProjectFormModal({
  isOpen,
  onClose,
  projectToEdit,
  onSuccess,
}: ProjectFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [techStackInput, setTechStackInput] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("ACTIVE");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description || "");
      setTechStackInput(projectToEdit.techStack?.join(", ") || "");
      setGithubUrl(projectToEdit.githubUrl || "");
      setStatus(projectToEdit.status || "ACTIVE");
    } else {
      setName("");
      setDescription("");
      setTechStackInput("");
      setGithubUrl("");
      setStatus("ACTIVE");
    }
    setError(null);
  }, [projectToEdit, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    const techStack = techStackInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      setIsLoading(true);
      setError(null);

      if (projectToEdit) {
        await updateProjectApi(projectToEdit.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          techStack,
          githubUrl: githubUrl.trim() || undefined,
          status,
        });
      } else {
        await createProjectApi({
          name: name.trim(),
          description: description.trim() || undefined,
          techStack,
          githubUrl: githubUrl.trim() || undefined,
          status,
        });
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? "Edit Project" : "Create New Project"}
      description="Track repositories, features, tech stacks, and team Kanban boards"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-[#3c1e22] border border-[#67252b] p-3 text-xs text-[#f85149] font-medium">
            {error}
          </div>
        )}

        <Input
          label="Project Name *"
          placeholder="e.g. LifeOS Platform or AI Code Assistant"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full rounded-md bg-[#161922] border border-[#222736] px-3.5 py-2 text-sm text-[#e6edf3] placeholder:text-[#57606a] focus:outline-none focus:border-blue-500"
            placeholder="Brief purpose, requirements or scope of the project..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Input
          label="Tech Stack (comma-separated)"
          placeholder="e.g. React 19, TypeScript, PostgreSQL, Prisma, Docker"
          value={techStackInput}
          onChange={(e) => setTechStackInput(e.target.value)}
          helperText="Enter technologies separated by commas"
        />

        <Input
          label="GitHub / Repository URL"
          placeholder="https://github.com/username/project"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
        />

        <div>
          <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1.5">
            Project Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full rounded-md bg-[#161922] border border-[#222736] px-3.5 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-blue-500"
          >
            <option value="ACTIVE">ACTIVE (In Development)</option>
            <option value="ON_HOLD">ON_HOLD (Paused)</option>
            <option value="COMPLETED">COMPLETED (Shipped / Finished)</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#222736]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {projectToEdit ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
