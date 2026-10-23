import { CheckCircle2, Clock, CalendarDays, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import type { Task } from "../../types/task";

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;

  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due >= startOfToday && due <= endOfToday;
  }).length;

  const upcomingTasks = tasks.filter((t) => {
    if (!t.dueDate || t.completed) return false;
    const due = new Date(t.dueDate);
    return due > endOfToday;
  }).length;

  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate || t.completed) return false;
    const due = new Date(t.dueDate);
    return due < startOfToday;
  }).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    {
      title: "Today's Focus",
      value: todayTasks,
      desc: "Scheduled for today",
      icon: Clock,
      color: "text-blue-400",
      bg: "bg-[#152744] border-[#1f4277]",
    },
    {
      title: "Overdue",
      value: overdueTasks,
      desc: "Needs attention",
      icon: AlertTriangle,
      color: "text-[#f85149]",
      bg: "bg-[#3c1e22] border-[#67252b]",
    },
    {
      title: "Upcoming",
      value: upcomingTasks,
      desc: "Later this week",
      icon: CalendarDays,
      color: "text-[#bc8cff]",
      bg: "bg-[#241e3d] border-[#3f326a]",
    },
    {
      title: "Completed Rate",
      value: `${completionRate}%`,
      desc: `${completed} of ${total} finished`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-[#162a1c] border-[#224b2b]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-[#222736] bg-[#13161f]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#8b949e]">{stat.title}</span>
                <div className={`p-1.5 rounded border ${stat.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-bold font-mono tracking-tight text-[#e6edf3]">
                  {stat.value}
                </div>
                <p className="text-[11px] font-mono text-[#8b949e] mt-0.5">{stat.desc}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
