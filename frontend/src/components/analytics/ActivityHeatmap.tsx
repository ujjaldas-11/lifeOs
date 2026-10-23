import { useState, useEffect } from "react";
import { Flame, CheckCircle, Timer, FileText, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { fetchHeatmapApi, fetchRetrospectiveApi } from "../../api/analytics";
import type { HeatmapDay, WeeklyRetrospective } from "../../types/analytics";

export function ActivityHeatmap() {
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [retro, setRetro] = useState<WeeklyRetrospective | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [hmData, retroData] = await Promise.all([
        fetchHeatmapApi(91), // ~13 weeks = 91 days
        fetchRetrospectiveApi(),
      ]);
      setHeatmap(hmData);
      setRetro(retroData);
    } catch (err) {
      console.error("Failed to load activity heatmap & retrospective:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("lifeos:task-updated", handleUpdate);
    window.addEventListener("lifeos:habit-updated", handleUpdate);
    window.addEventListener("lifeos:focus-updated", handleUpdate);

    return () => {
      window.removeEventListener("lifeos:task-updated", handleUpdate);
      window.removeEventListener("lifeos:habit-updated", handleUpdate);
      window.removeEventListener("lifeos:focus-updated", handleUpdate);
    };
  }, []);

  // Intensity color mapper (Antigravity clean IDE green shades)
  const getCellColor = (count: number) => {
    if (count === 0) return "bg-[#161922] border-[#222736]";
    if (count <= 2) return "bg-[#0e4429] border-[#0e4429]";
    if (count <= 4) return "bg-[#006d32] border-[#006d32]";
    if (count <= 6) return "bg-[#26a641] border-[#26a641]";
    return "bg-[#39d353] border-[#39d353]";
  };

  // Group heatmap into columns of 7 days
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  heatmap.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === heatmap.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const totalActivitiesIn90Days = heatmap.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="space-y-4">
      {/* 90-Day Contribution Heatmap Card */}
      <Card className="border-[#222736] bg-[#13161f]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Developer Activity Matrix (90 Days)</span>
            </CardTitle>
            <p className="text-xs text-[#8b949e] mt-1 font-mono">
              {totalActivitiesIn90Days} total contributions across tasks, habits, notes & focus sprints
            </p>
          </div>

          {hoveredDay && (
            <div className="text-right text-xs font-mono text-[#8b949e]">
              <span className="text-[#e6edf3] font-semibold">{hoveredDay.date}</span>:{" "}
              <span className="text-emerald-400 font-bold">{hoveredDay.count} events</span> (
              {hoveredDay.tasks} tasks, {hoveredDay.habits} habits, {hoveredDay.focusMinutes}m focus)
            </div>
          )}
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="h-28 flex items-center justify-center text-xs text-[#8b949e]">
              Loading activity matrix...
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-1.5 min-w-max">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1.5">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`h-3 w-3 rounded-xs border transition-all cursor-pointer hover:ring-1 hover:ring-white ${getCellColor(
                          day.count
                        )}`}
                        title={`${day.date}: ${day.count} contributions`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
                <span>Less</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-xs bg-[#161922] border border-[#222736]" />
                  <div className="h-2.5 w-2.5 rounded-xs bg-[#0e4429]" />
                  <div className="h-2.5 w-2.5 rounded-xs bg-[#006d32]" />
                  <div className="h-2.5 w-2.5 rounded-xs bg-[#26a641]" />
                  <div className="h-2.5 w-2.5 rounded-xs bg-[#39d353]" />
                </div>
                <span>More</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Retrospective Metrics */}
      {retro && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-[#222736] bg-[#13161f]">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8b949e]">7-Day Tasks Done</span>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-xl font-mono font-bold text-[#e6edf3]">
                {retro.tasksCompletedCount}
              </div>
              <div className="mt-1 text-[11px] font-mono text-[#8b949e]">
                completed this week
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#222736] bg-[#13161f]">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8b949e]">Habit Consistency</span>
                <Flame className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-2 text-xl font-mono font-bold text-[#e6edf3]">
                {retro.consistencyRate}%
              </div>
              <div className="mt-1 text-[11px] font-mono text-[#8b949e]">
                {retro.habitsCheckinsCount} total check-ins
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#222736] bg-[#13161f]">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8b949e]">Deep Focus</span>
                <Timer className="h-4 w-4 text-blue-400" />
              </div>
              <div className="mt-2 text-xl font-mono font-bold text-[#e6edf3]">
                {retro.totalFocusHours}h
              </div>
              <div className="mt-1 text-[11px] font-mono text-[#8b949e]">
                across {retro.focusSessionsCount} sessions
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#222736] bg-[#13161f]">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8b949e]">Documentation</span>
                <FileText className="h-4 w-4 text-purple-400" />
              </div>
              <div className="mt-2 text-xl font-mono font-bold text-[#e6edf3]">
                {retro.notesCreatedCount}
              </div>
              <div className="mt-1 text-[11px] font-mono text-[#8b949e]">
                notes / snippets added
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
