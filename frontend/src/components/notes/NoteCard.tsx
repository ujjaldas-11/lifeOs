import { useState } from "react";
import { FileText, Trash2, Edit2, Calendar } from "lucide-react";
import type { Note } from "../../types/note";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => Promise<void>;
  onTagClick?: (tag: string) => void;
}

export function NoteCard({ note, onEdit, onDelete, onTagClick }: NoteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(note.updatedAt));

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete note "${note.title}"?`)) {
      try {
        setIsDeleting(true);
        await onDelete(note.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div
      onClick={() => onEdit(note)}
      className="group relative flex flex-col justify-between rounded-lg border border-[#222736] bg-[#13161f] p-4.5 hover:border-[#384259] transition-colors cursor-pointer"
    >
      <div>
        {/* Top Header: Icon, Date & Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-[#8b949e] font-mono">
            <FileText className="h-3.5 w-3.5 text-blue-400" />
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              title="Edit Note"
              className="rounded p-1 text-[#8b949e] hover:bg-[#161922] hover:text-[#e6edf3] transition-colors"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete Note"
              className="rounded p-1 text-[#8b949e] hover:bg-[#161922] hover:text-[#f85149] transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-2 text-sm font-semibold text-[#e6edf3] tracking-tight leading-snug group-hover:text-blue-400 transition-colors">
          {note.title}
        </h3>

        {/* Content Snippet */}
        <p className="mt-2 text-xs text-[#8b949e] leading-relaxed font-mono line-clamp-4 whitespace-pre-wrap">
          {note.content.replace(/^#+\s+/gm, "") || "No additional text content."}
        </p>
      </div>

      {/* Tags Footer */}
      {note.tags && note.tags.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-[#222736] flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag);
              }}
              className="rounded bg-[#161922] hover:bg-[#1f2432] border border-[#222736] px-1.5 py-0.5 text-[10px] font-mono text-[#8b949e] hover:text-[#e6edf3] transition-colors cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
