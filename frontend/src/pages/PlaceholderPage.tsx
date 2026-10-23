import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft, Construction } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

interface PlaceholderPageProps {
  moduleName: string;
  phase: string;
  description: string;
  plannedFeatures: string[];
}

export function PlaceholderPage({
  moduleName,
  phase,
  description,
  plannedFeatures,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
              <Construction className="h-4 w-4" />
              <span>Upcoming Module • {phase}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              {moduleName}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">{description}</p>
          </div>

          <Link to="/tasks">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span>Back to Active Tasks</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Planned Functionality for {moduleName}</span>
            </h3>
            <ul className="mt-4 space-y-2.5">
              {plannedFeatures.map((feat, index) => (
                <li key={index} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-dashed border-slate-800 bg-slate-950/40">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-400">
                Phase 1 Active Focus
              </span>
              <h4 className="text-sm font-semibold text-slate-200 mt-3">
                Core Foundation & Tasks Module Complete
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                You can manage all your daily developer tasks, prioritize high/medium/low items,
                and filter by Today, Upcoming, and Overdue right now.
              </p>
            </div>

            <Link to="/tasks" className="mt-6">
              <Button size="sm" className="w-full">
                Go to Tasks Backlog
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
