import { useState } from "react";
import { Plus, CheckCircle, ChevronRight, ChevronLeft, Timer, Calendar } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { PriorityBadge } from "../ui/Badge";
import { updateTaskApi } from "../../api/tasks";
import type { Task, KanbanColumn } from "../../types/task";
import type { Project } from "../../types/project";

interface KanbanBoardProps {
  project: Project;
  tasks: Task[];
  onTasksUpdated: () => void;
  onOpenNewTaskModal: (column: KanbanColumn) => void;
  onOpenFocusModal: (taskId: number) => void;
}

const COLUMNS: { id: KanbanColumn; title: string; color: string; badgeVariant: "default" | "today" | "upcoming" | "low" }[] = [
  { id: "TODO", title: "To Do", color: "#58a6ff", badgeVariant: "today" },
  { id: "IN_PROGRESS", title: "In Progress", color: "#e3b341", badgeVariant: "default" },
  { id: "REVIEW", title: "Review", color: "#bc8cff", badgeVariant: "upcoming" },
  { id: "DONE", title: "Done", color: "#3fb950", badgeVariant: "low" },
];

export function KanbanBoard({
  project: _project,
  tasks,
  onTasksUpdated,
  onOpenNewTaskModal,
  onOpenFocusModal,
}: KanbanBoardProps) {
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  const getTaskColumn = (task: Task): KanbanColumn => {
    if (task.kanbanColumn) {
      const col = task.kanbanColumn.toUpperCase() as KanbanColumn;
      if (COLUMNS.some((c) => c.id === col)) return col;
    }
    return task.completed ? "DONE" : "TODO";
  };

  const handleMoveColumn = async (task: Task, targetColumn: KanbanColumn) => {
    try {
      setUpdatingTaskId(task.id);
      const isCompleted = targetColumn === "DONE";
      await updateTaskApi(task.id, {
        kanbanColumn: targetColumn,
        completed: isCompleted,
      });
      onTasksUpdated();
      window.dispatchEvent(new CustomEvent("lifeos:task-updated"));
    } catch (err) {
      console.error("Failed to move task:", err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getNextColumn = (curr: KanbanColumn): KanbanColumn | null => {
    const idx = COLUMNS.findIndex((c) => c.id === curr);
    return idx < COLUMNS.length - 1 ? COLUMNS[idx + 1].id : null;
  };

  const getPrevColumn = (curr: KanbanColumn): KanbanColumn | null => {
    const idx = COLUMNS.findIndex((c) => c.id === curr);
    return idx > 0 ? COLUMNS[idx - 1].id : null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => getTaskColumn(t) === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-lg border border-[#222736] bg-[#0d0f14] overflow-hidden min-h-[450px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#222736] bg-[#13161f]">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
                <span className="font-semibold text-xs text-[#e6edf3]">{col.title}</span>
                <span className="rounded bg-[#161922] border border-[#222736] px-1.5 py-0.2 text-[10px] font-mono text-[#8b949e]">
                  {columnTasks.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onOpenNewTaskModal(col.id)}
                className="p-1 rounded text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161922] transition-colors"
                title={`Add task to ${col.title}`}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Tasks list */}
            <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[650px]">
              {columnTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#57606a] border border-dashed border-[#222736] rounded-md">
                  No tasks in {col.title}
                </div>
              ) : (
                columnTasks.map((task) => {
                  const currentCol = getTaskColumn(task);
                  const prevCol = getPrevColumn(currentCol);
                  const nextCol = getNextColumn(currentCol);
                  const isBusy = updatingTaskId === task.id;

                  return (
                    <Card
                      key={task.id}
                      className={`border-[#222736] bg-[#13161f] hover:border-[#384259] transition-all shadow-sm ${
                        isBusy ? "opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-1.5">
                          <h4
                            className={`font-medium text-xs text-[#e6edf3] ${
                              task.completed ? "line-through text-[#8b949e]" : ""
                            }`}
                          >
                            {task.title}
                          </h4>
                          <PriorityBadge priority={task.priority} />
                        </div>

                        {task.description && (
                          <p className="mt-1.5 text-[11px] text-[#8b949e] line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Meta info: Due date & timer */}
                        <div className="mt-2.5 pt-2 border-t border-[#222736] flex items-center justify-between text-[10px] font-mono text-[#8b949e]">
                          {task.dueDate ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-blue-400" />
                              {new Date(task.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          ) : (
                            <span className="text-[#57606a]">No due date</span>
                          )}

                          <button
                            type="button"
                            onClick={() => onOpenFocusModal(task.id)}
                            className="flex items-center gap-1 text-[#8b949e] hover:text-blue-400 cursor-pointer"
                            title="Focus on this task"
                          >
                            <Timer className="h-3 w-3 text-blue-400" />
                            <span>Focus</span>
                          </button>
                        </div>

                        {/* Column shift controls */}
                        <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-[#1a1e2b]">
                          {prevCol ? (
                            <button
                              type="button"
                              onClick={() => handleMoveColumn(task, prevCol)}
                              className="inline-flex items-center gap-0.5 text-[10px] font-mono text-[#8b949e] hover:text-[#e6edf3] cursor-pointer"
                            >
                              <ChevronLeft className="h-3 w-3" />
                              <span>{COLUMNS.find((c) => c.id === prevCol)?.title}</span>
                            </button>
                          ) : (
                            <div />
                          )}

                          {nextCol ? (
                            <button
                              type="button"
                              onClick={() => handleMoveColumn(task, nextCol)}
                              className="inline-flex items-center gap-0.5 text-[10px] font-mono text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                            >
                              <span>{COLUMNS.find((c) => c.id === nextCol)?.title}</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                              <CheckCircle className="h-3 w-3" />
                              <span>Completed</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
