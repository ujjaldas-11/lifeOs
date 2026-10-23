import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { createEventApi, updateEventApi } from "../../api/events";
import type { Event } from "../../types/event";

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventToEdit?: Event | null;
}

export function EventFormModal({
  isOpen,
  onClose,
  onSuccess,
  eventToEdit,
}: EventFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || "");
      setDescription(eventToEdit.description || "");
      if (eventToEdit.date) {
        const d = new Date(eventToEdit.date);
        setDate(d.toISOString().split("T")[0] || "");
      } else {
        setDate("");
      }
      setTime(eventToEdit.time || "");
    } else {
      setTitle("");
      setDescription("");
      const todayStr = new Date().toISOString().split("T")[0] || "";
      setDate(todayStr);
      setTime("10:00 AM");
    }
    setError(null);
  }, [eventToEdit, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Event title is required");
      return;
    }

    if (!date) {
      setError("Event date is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const formattedDate = new Date(`${date}T12:00:00Z`).toISOString();

      if (eventToEdit) {
        await updateEventApi(eventToEdit.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          date: formattedDate,
          time: time.trim() || undefined,
        });
      } else {
        await createEventApi({
          title: title.trim(),
          description: description.trim() || undefined,
          date: formattedDate,
          time: time.trim() || undefined,
        });
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save event");
    } finally {
      setIsLoading(false);
    }
  };

  const setQuickDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setDate(d.toISOString().split("T")[0] || "");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventToEdit ? "Edit Event" : "Schedule New Event"}
      description={
        eventToEdit
          ? "Update meeting agenda, time or milestone date"
          : "Add meetings, sprint reviews, or release deadlines to your developer calendar"
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
          placeholder="e.g. Sprint 14 Planning & Demo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agenda, video call links, or preparation notes..."
            className="w-full rounded-md bg-[#161922] border border-[#222736] px-3.5 py-2 text-xs text-[#e6edf3] placeholder:text-[#57606a] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-md bg-[#161922] border border-[#222736] px-3 py-1.5 text-xs font-mono text-[#e6edf3] focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center gap-1.5 mt-1 font-mono">
              <button
                type="button"
                onClick={() => setQuickDate(0)}
                className="text-[10px] bg-[#161922] hover:bg-[#1f2432] text-[#8b949e] hover:text-[#e6edf3] px-2 py-0.5 rounded border border-[#222736] cursor-pointer transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(1)}
                className="text-[10px] bg-[#161922] hover:bg-[#1f2432] text-[#8b949e] hover:text-[#e6edf3] px-2 py-0.5 rounded border border-[#222736] cursor-pointer transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(7)}
                className="text-[10px] bg-[#161922] hover:bg-[#1f2432] text-[#8b949e] hover:text-[#e6edf3] px-2 py-0.5 rounded border border-[#222736] cursor-pointer transition-colors"
              >
                +1 Week
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Input
              label="Time (Optional)"
              placeholder="e.g. 10:30 AM or 14:00"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#222736]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {eventToEdit ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
