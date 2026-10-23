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
      <div className="rounded-lg border border-[#222736] bg-[#13161f] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-400">
              <Construction className="h-4 w-4" />
              <span>Upcoming Module • {phase}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#e6edf3] mt-1">
              {moduleName}
            </h2>
            <p className="text-xs text-[#8b949e] mt-1 max-w-xl font-mono">{description}</p>
          </div>

          <Link to="/tasks">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span>Back to Active Tasks</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-[#222736] bg-[#13161f]">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span>Planned Functionality for {moduleName}</span>
            </h3>
            <ul className="mt-3 space-y-2">
              {plannedFeatures.map((feat, index) => (
                <li key={index} className="flex items-center gap-2 text-xs text-[#8b949e] font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
