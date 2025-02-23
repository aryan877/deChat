import { cn } from "@/lib/utils";
import { ACTION_NAMES } from "@repo/de-agent";
import { AlertCircle } from "lucide-react";
import React from "react";

interface ToolNamesProps {
  toolNames: string[];
  className?: string;
}

const TOOL_DISPLAY_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string }
> = {
  [ACTION_NAMES.GET_SUPPORTED_CHAINS]: {
    icon: <AlertCircle className="w-3 h-3" />,
    label: "Supported Chains",
  },
  [ACTION_NAMES.ASK_FOR_CONFIRMATION]: {
    icon: <AlertCircle className="w-3 h-3" />,
    label: "Confirmation",
  },
};

export function ToolNames({ toolNames, className }: ToolNamesProps) {
  if (!toolNames.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {toolNames.map((name, index) => {
        const config = TOOL_DISPLAY_CONFIG[name];
        if (!config) return null;

        return (
          <div
            key={index}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-primary/5 text-primary/90 border border-primary/10 hover:bg-primary/10 transition-colors"
            title={name}
          >
            {config.icon}
            <span>{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}
