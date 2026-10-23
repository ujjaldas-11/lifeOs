import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { createHabitApi, updateHabitApi } from "../../api/habits";
import type { Habit } from "../../types/habit";

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  habitToEdit?: Habit | null;
}

export function HabitFormModal({
  isOpen,
  onClose,
  onSuccess,
  habitToEdit,
}: HabitFormModalProps) {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("DAILY");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const frequencyPresets = [
    { label: "Daily (Every day)", value: "DAILY" },
    { label: "Weekdays (Mon - Fri)", value: "Mon,Tue,Wed,Thu,Fri" },
    { label: "3 Days a Week", value: "Mon,Wed,Fri" },
    { label: "Weekends Only", value: "Sat,Sun" },
  ];

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name || "");
      setFrequency(habitToEdit.frequency || "DAILY");
    } else {
      setName("");
      setFrequency("DAILY");
    }
    setError(null);
  }, [habitToEdit, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Habit name is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (habitToEdit) {
        await updateHabitApi(habitToEdit.id, {
          name: name.trim(),
          frequency,
        });
      } else {
        await createHabitApi({
          name: name.trim(),
          frequency,
        });
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save habit");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habitToEdit ? "Edit Habit" : "Create New Habit"}
      description={
        habitToEdit
          ? "Update routine name or frequency targets"
          : "Define a daily developer routine to maintain consistency"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-[#3c1e22] border border-[#67252b] p-3 text-xs text-[#f85149]">
            {error}
          </div>
        )}

        <Input
          label="Habit Name *"
          placeholder="e.g. Daily LeetCode problem, 30m code review"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">
            Frequency Target
          </label>
          <div className="grid grid-cols-2 gap-2">
            {frequencyPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setFrequency(preset.value)}
                className={`py-2 px-3 text-left rounded-md border text-xs font-mono transition-colors cursor-pointer ${
                  frequency === preset.value
                    ? "bg-[#161922] border-blue-500 text-[#58a6ff]"
                    : "bg-[#0d0f14] border-[#222736] text-[#8b949e] hover:bg-[#161922]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#222736]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {habitToEdit ? "Update Habit" : "Create Habit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
