import { cn } from "@/lib/utils";
import { ACTION_NAMES } from "@repo/de-agent";
import {
  AlertCircle,
  Wallet,
  ArrowUpRight,
  FileSearch,
  Coins,
  BarChart,
  Users,
} from "lucide-react";
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
  [ACTION_NAMES.SONIC_GET_ACCOUNT_INFO]: {
    icon: <Wallet className="w-3 h-3" />,
    label: "Account Info",
  },
  [ACTION_NAMES.SONIC_GET_BLOCK_REWARD]: {
    icon: <BarChart className="w-3 h-3" />,
    label: "Block Reward",
  },
  [ACTION_NAMES.SONIC_GET_TOKEN_SUPPLY]: {
    icon: <Coins className="w-3 h-3" />,
    label: "Token Supply",
  },
  [ACTION_NAMES.SONIC_GET_TRANSACTION_STATUS]: {
    icon: <FileSearch className="w-3 h-3" />,
    label: "Transaction Status",
  },
  [ACTION_NAMES.SONIC_TRANSFER]: {
    icon: <ArrowUpRight className="w-3 h-3" />,
    label: "Transfer",
  },
  [ACTION_NAMES.SONIC_DELEGATE]: {
    icon: <Users className="w-3 h-3" />,
    label: "Delegate",
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
