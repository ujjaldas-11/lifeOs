import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Tag as TagIcon, FileText, X } from "lucide-react";
import { fetchNotesApi, deleteNoteApi, fetchTagsApi } from "../api/notes";
import type { Note } from "../types/note";
import { NoteCard } from "../components/notes/NoteCard";
import { NoteFormModal } from "../components/notes/NoteFormModal";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [notesData, tagsData] = await Promise.all([
        fetchNotesApi(searchQuery, selectedTag || undefined),
        fetchTagsApi(),
      ]);
      setNotes(notesData);
      setAvailableTags(tagsData);
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedTag]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: number) => {
    try {
      await deleteNoteApi(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      const tagsData = await fetchTagsApi();
      setAvailableTags(tagsData);
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#e6edf3]">Notes & Snippets</h2>
          <p className="text-xs text-[#8b949e] mt-1 font-mono">
            Capture architecture decisions, snippets, bug postmortems, and technical ideas
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingNote(null);
            setIsModalOpen(true);
          }}
          className="text-xs self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          <span>New Note</span>
        </Button>
      </div>

      {/* Search and Tag Controls */}
      <div className="space-y-2.5">
        {/* Search input */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8b949e]" />
          <input
            type="text"
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md bg-[#161922] border border-[#222736] pl-9 pr-8 py-1.5 text-xs text-[#e6edf3] placeholder:text-[#57606a] focus:outline-none focus:border-blue-500 font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#e6edf3] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Tag Filters */}
        {availableTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono">
            <span className="text-[10px] text-[#57606a] flex items-center gap-1 shrink-0 mr-1 uppercase">
              <TagIcon className="h-3 w-3" />
              <span>Tags:</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={cn(
                "rounded px-2 py-0.5 text-xs transition-colors shrink-0 cursor-pointer border",
                selectedTag === null
                  ? "bg-[#152744] text-[#58a6ff] border-[#1f4277]"
                  : "bg-[#161922] text-[#8b949e] hover:text-[#e6edf3] border-[#222736]"
              )}
            >
              All Notes ({notes.length})
            </button>

            {availableTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={cn(
                    "rounded px-2 py-0.5 text-xs transition-colors shrink-0 cursor-pointer border",
                    isSelected
                      ? "bg-[#152744] text-[#58a6ff] border-[#1f4277]"
                      : "bg-[#161922] text-[#8b949e] hover:text-[#e6edf3] border-[#222736]"
                  )}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-[#8b949e]">
          Loading notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#222736] bg-[#13161f]/50 p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-[#57606a] mb-2.5" />
          <h3 className="text-sm font-semibold text-[#e6edf3]">No notes found</h3>
          <p className="text-xs text-[#8b949e] max-w-sm mx-auto mt-1 font-mono">
            {searchQuery || selectedTag
              ? "No notes matched your search query or tag filter."
              : "Your knowledge base is empty. Create your first note to keep snippets and docs handy."}
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() => {
              setEditingNote(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            <span>Create Note</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={(n) => {
                setEditingNote(n);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
              onTagClick={(tag) => setSelectedTag(tag)}
            />
          ))}
        </div>
      )}

      {/* Note Form Modal */}
      <NoteFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingNote(null);
          loadData();
        }}
        noteToEdit={editingNote}
        existingTags={availableTags}
      />
    </div>
  );
}
