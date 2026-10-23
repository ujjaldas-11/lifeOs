import { useState, useEffect, useCallback } from "react";
import { Plus, Flame, CheckCircle2, Trophy, Sparkles } from "lucide-react";
import { fetchHabitsApi, checkInHabitApi, deleteHabitApi } from "../api/habits";
import type { Habit } from "../types/habit";
import { HabitCard } from "../components/habits/HabitCard";
import { HabitFormModal } from "../components/habits/HabitFormModal";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const loadHabits = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchHabitsApi();
      setHabits(data);
    } catch (err) {
      console.error("Failed to load habits:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const handleCheckIn = async (id: number) => {
    try {
      const updated = await checkInHabitApi(id);
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
      window.dispatchEvent(new CustomEvent("lifeos:habit-updated"));
    } catch (err) {
      console.error("Failed to check in:", err);
      loadHabits();
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteHabitApi(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      window.dispatchEvent(new CustomEvent("lifeos:habit-updated"));
    } catch (err) {
      console.error("Failed to delete habit:", err);
    }
  };

  // Metrics
  const totalHabits = habits.length;
  const completedTodayCount = habits.filter((h) => h.completedToday).length;
  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak)) : 0;
  const completionPercentage = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#e6edf3]">Habits & Streaks</h2>
          <p className="text-xs text-[#8b949e] mt-1 font-mono">
            Build compounding developer discipline through consistent daily check-ins
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingHabit(null);
            setIsModalOpen(true);
          }}
          className="text-xs self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          <span>New Habit</span>
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-[#222736] bg-[#13161f]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8b949e]">Total Habits</span>
              <div className="p-1.5 rounded border bg-[#152744] border-[#1f4277] text-[#58a6ff]">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold font-mono tracking-tight text-[#e6edf3]">{totalHabits}</div>
              <p className="text-[11px] font-mono text-[#8b949e] mt-0.5">Tracked routines</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#222736] bg-[#13161f]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8b949e]">Completed Today</span>
              <div className="p-1.5 rounded border bg-[#162a1c] border-[#224b2b] text-[#3fb950]">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold font-mono tracking-tight text-[#e6edf3]">
                {completedTodayCount} / {totalHabits}
              </div>
              <p className="text-[11px] font-mono text-[#8b949e] mt-0.5">{completionPercentage}% done today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#222736] bg-[#13161f]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8b949e]">Top Current Streak</span>
              <div className="p-1.5 rounded border bg-[#342c16] border-[#59491a] text-[#e3b341]">
                <Flame className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold font-mono tracking-tight text-[#e3b341]">
                {maxStreak} {maxStreak === 1 ? "day" : "days"} 🔥
              </div>
              <p className="text-[11px] font-mono text-[#8b949e] mt-0.5">Consecutive days</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#222736] bg-[#13161f]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8b949e]">Best All-Time</span>
              <div className="p-1.5 rounded border bg-[#241e3d] border-[#3f326a] text-[#bc8cff]">
                <Trophy className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold font-mono tracking-tight text-[#e6edf3]">
                {habits.length > 0 ? Math.max(...habits.map((h) => h.longestStreak)) : 0} days
              </div>
              <p className="text-[11px] font-mono text-[#8b949e] mt-0.5">Personal milestone record</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habits Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-[#8b949e]">
          Loading habits...
        </div>
      ) : habits.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#222736] bg-[#13161f]/50 p-12 text-center">
          <Flame className="mx-auto h-8 w-8 text-[#57606a] mb-2.5" />
          <h3 className="text-sm font-semibold text-[#e6edf3]">No habits tracked yet</h3>
          <p className="text-xs text-[#8b949e] max-w-sm mx-auto mt-1 font-mono">
            Start building your daily developer routine: commit code, practice algorithms, or read documentation.
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() => {
              setEditingHabit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            <span>Create Your First Habit</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onCheckIn={handleCheckIn}
              onEdit={(h) => {
                setEditingHabit(h);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Habit Form Modal */}
      <HabitFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
          loadHabits();
        }}
        habitToEdit={editingHabit}
      />
    </div>
  );
}
