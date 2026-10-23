import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { logFocusSessionApi } from "../../api/focus";
import { fetchTasksApi } from "../../api/tasks";
import type { Task } from "../../types/task";

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTaskId?: number | null;
}

export function FocusTimerModal({ isOpen, onClose, defaultTaskId }: FocusTimerModalProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | "">(defaultTaskId || "");
  const [sessionNotes, setSessionNotes] = useState<string>("");
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load pending tasks when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTasksApi({ filter: "today" })
        .then((res) => {
          const pending = res.filter((t) => !t.completed);
          setTasks(pending);
          if (defaultTaskId) {
            setSelectedTaskId(defaultTaskId);
          }
        })
        .catch((err) => console.error("Failed to load tasks for focus timer:", err));
    }
  }, [isOpen, defaultTaskId]);

  // Handle timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleFinishSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleSetDuration = (mins: number) => {
    if (isRunning) return;
    setSelectedMinutes(mins);
    setTimeLeftSeconds(mins * 60);
    setCompletedMessage(null);
  };

  const handleToggleTimer = () => {
    setIsRunning((prev) => !prev);
    setCompletedMessage(null);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeftSeconds(selectedMinutes * 60);
    setCompletedMessage(null);
  };

  const handleFinishSession = async () => {
    const elapsedSeconds = selectedMinutes * 60 - timeLeftSeconds;
    const durationMin = Math.max(1, Math.round(elapsedSeconds / 60));

    try {
      setIsLogging(true);
      await logFocusSessionApi({
        durationMin,
        taskId: selectedTaskId ? Number(selectedTaskId) : null,
        notes: sessionNotes.trim() || undefined,
      });

      setCompletedMessage(`Logged ${durationMin} min focus session! Keep up the momentum 🚀`);
      window.dispatchEvent(new CustomEvent("lifeos:focus-updated"));
      window.dispatchEvent(new CustomEvent("lifeos:task-updated"));
    } catch (err: any) {
      console.error("Failed to log focus session:", err);
    } finally {
      setIsLogging(false);
    }
  };

  const minutesDisplay = String(Math.floor(timeLeftSeconds / 60)).padStart(2, "0");
  const secondsDisplay = String(timeLeftSeconds % 60).padStart(2, "0");
  const progressPercent = ((selectedMinutes * 60 - timeLeftSeconds) / (selectedMinutes * 60)) * 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Developer Focus & Pomodoro Timer"
      description="Deep work sessions linked to your tasks and daily activity metrics"
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Presets */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Pomodoro", mins: 25 },
            { label: "Deep 50m", mins: 50 },
            { label: "Short 5m", mins: 5 },
            { label: "Long 15m", mins: 15 },
          ].map((preset) => (
            <button
              key={preset.mins}
              type="button"
              disabled={isRunning}
              onClick={() => handleSetDuration(preset.mins)}
              className={`py-2 px-1 text-center rounded border text-xs font-mono transition-colors cursor-pointer ${
                selectedMinutes === preset.mins
                  ? "bg-[#161922] text-[#58a6ff] border-[#1f4277]"
                  : "bg-[#0d0f14] text-[#8b949e] border-[#222736] hover:bg-[#161922]"
              } disabled:opacity-50`}
            >
              <div className="font-semibold">{preset.mins}m</div>
              <div className="text-[10px] text-[#57606a]">{preset.label}</div>
            </button>
          ))}
        </div>

        {/* Big Clock Display */}
        <div className="relative rounded-lg border border-[#222736] bg-[#0d0f14] py-8 px-4 text-center">
          <div className="text-5xl font-mono font-bold tracking-tight text-[#e6edf3]">
            {minutesDisplay}:{secondsDisplay}
          </div>
          <div className="mt-2 text-xs font-mono text-[#8b949e]">
            {isRunning ? "Focusing deeply..." : timeLeftSeconds === 0 ? "Session complete!" : "Ready to focus"}
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-full bg-[#161922] rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Task linking */}
        <div>
          <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1.5">
            Link to Task (Optional)
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value ? Number(e.target.value) : "")}
            className="w-full rounded-md bg-[#161922] border border-[#222736] px-3 py-2 text-xs text-[#e6edf3] focus:outline-none focus:border-blue-500"
          >
            <option value="">No task linked (General focus)</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title} ({task.priority})
              </option>
            ))}
          </select>
        </div>

        {/* Optional note */}
        <Input
          label="Session Notes / Output"
          placeholder="e.g. Refactored task service, fixed auth header"
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
        />

        {/* Notification / Completion */}
        {completedMessage && (
          <div className="flex items-center gap-2 rounded-md bg-[#152744] border border-[#1f4277] p-2.5 text-xs text-[#58a6ff]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{completedMessage}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            type="button"
            className="flex-1"
            onClick={handleToggleTimer}
            variant={isRunning ? "secondary" : "primary"}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-1.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1.5" />
                <span>{timeLeftSeconds < selectedMinutes * 60 ? "Resume" : "Start Focus"}</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleResetTimer}
            title="Reset Timer"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleFinishSession}
            isLoading={isLogging}
            title="Record current time as completed session"
          >
            <span>Log</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
