import { useState, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { X, Tag as TagIcon, Eye, Edit3 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { createNoteApi, updateNoteApi } from "../../api/notes";
import type { Note } from "../../types/note";

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  noteToEdit?: Note | null;
  existingTags?: string[];
}

export function NoteFormModal({
  isOpen,
  onClose,
  onSuccess,
  noteToEdit,
  existingTags = [],
}: NoteFormModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title || "");
      setContent(noteToEdit.content || "");
      setTags(noteToEdit.tags || []);
    } else {
      setTitle("");
      setContent("");
      setTags([]);
    }
    setTagInput("");
    setIsPreview(false);
    setError(null);
  }, [noteToEdit, isOpen]);

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().toLowerCase().replace(/^[#,]+/, "");
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput("");
  };

  const handleKeyDownTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Note title is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const finalTags = tagInput.trim()
        ? Array.from(new Set([...tags, tagInput.trim().toLowerCase()]))
        : tags;

      if (noteToEdit) {
        await updateNoteApi(noteToEdit.id, {
          title: title.trim(),
          content,
          tags: finalTags,
        });
      } else {
        await createNoteApi({
          title: title.trim(),
          content,
          tags: finalTags,
        });
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save note");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={noteToEdit ? "Edit Note" : "Create New Note"}
      description={
        noteToEdit
          ? "Update documentation, code snippets, or thoughts"
          : "Markdown-friendly developer notes, ideas, and architecture records"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-[#3c1e22] border border-[#67252b] p-3 text-xs text-[#f85149]">
            {error}
          </div>
        )}

        <Input
          label="Title *"
          placeholder="e.g. Distributed Lock Patterns with Redis"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        {/* Content Area with Preview Toggle */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">
              Content (Markdown supported)
            </label>
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 cursor-pointer font-mono"
            >
              {isPreview ? (
                <>
                  <Edit3 className="h-3 w-3" />
                  <span>Editor</span>
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  <span>Preview</span>
                </>
              )}
            </button>
          </div>

          {isPreview ? (
            <div className="min-h-[160px] max-h-[300px] overflow-y-auto rounded-md bg-[#0d0f14] border border-[#222736] p-3.5 text-xs text-[#e6edf3] whitespace-pre-wrap font-mono leading-relaxed">
              {content || <span className="text-[#57606a] italic">Empty note content...</span>}
            </div>
          ) : (
            <textarea
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Heading&#10;&#10;Key points, code snippets, and ideas..."
              className="w-full rounded-md bg-[#161922] border border-[#222736] px-3.5 py-2.5 text-xs text-[#e6edf3] placeholder:text-[#57606a] font-mono focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
            />
          )}
        </div>

        {/* Tags input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
            <TagIcon className="h-3.5 w-3.5 text-[#8b949e]" />
            <span>Tags</span>
          </label>

          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-md bg-[#161922] border border-[#222736] min-h-[38px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded bg-[#152744] border border-[#1f4277] px-2 py-0.5 text-xs font-mono text-[#58a6ff]"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-white cursor-pointer ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={tags.length === 0 ? "Type tag & press Enter (e.g. backend, auth)" : "Add tag..."}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDownTag}
              className="flex-1 min-w-[120px] bg-transparent text-xs text-[#e6edf3] placeholder:text-[#57606a] focus:outline-none font-mono"
            />
          </div>

          {/* Existing tags suggestions */}
          {existingTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-1 font-mono">
              <span className="text-[10px] text-[#57606a]">Suggested:</span>
              {existingTags
                .filter((t) => !tags.includes(t))
                .slice(0, 6)
                .map((suggested) => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => handleAddTag(suggested)}
                    className="text-[10px] text-[#8b949e] hover:text-[#e6edf3] bg-[#161922] px-1.5 py-0.5 rounded border border-[#222736] cursor-pointer transition-colors"
                  >
                    +{suggested}
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#222736]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {noteToEdit ? "Update Note" : "Save Note"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
