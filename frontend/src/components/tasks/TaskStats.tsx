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
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Overdue",
      value: overdueTasks,
      desc: "Needs attention",
      icon: AlertTriangle,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Upcoming",
      value: upcomingTasks,
      desc: "Later this week",
      icon: CalendarDays,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Completed Rate",
      value: `${completionRate}%`,
      desc: `${completed} of ${total} finished`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-0 border-slate-800 bg-slate-900/60">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{stat.title}</span>
                <div className={`p-2 rounded-lg border ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-slate-100">{stat.value}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">{stat.desc}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
