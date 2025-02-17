"use client";

import { useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface NotificationProps {
  type: NotificationType;
  message: string;
  details?: unknown;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const icons = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <AlertCircle className="h-5 w-5" />,
};

const variantStyles = {
  success:
    "bg-green-500/10 dark:bg-green-500/10 border-green-500/20 backdrop-blur-sm",
  error:
    "bg-destructive/10 dark:bg-destructive/10 border-destructive/20 backdrop-blur-sm",
  warning:
    "bg-yellow-500/10 dark:bg-yellow-500/10 border-yellow-500/20 backdrop-blur-sm",
  info: "bg-blue-500/10 dark:bg-blue-500/10 border-blue-500/20 backdrop-blur-sm",
};

const iconStyles = {
  success: "text-green-600 dark:text-green-400",
  error: "text-destructive dark:text-destructive",
  warning: "text-yellow-600 dark:text-yellow-400",
  info: "text-blue-600 dark:text-blue-400",
};

const textStyles = {
  success: "text-green-800 dark:text-green-200",
  error: "text-red-800 dark:text-destructive-foreground",
  warning: "text-yellow-800 dark:text-yellow-200",
  info: "text-blue-800 dark:text-blue-200",
};

const formatDetails = (details: unknown): string => {
  if (!details) return "";

  // Handle validation errors
  const detailsObj = details as {
    errors?: Array<{ path: string; message: string }>;
  };
  if (detailsObj.errors?.length) {
    return detailsObj.errors
      .map((err) => `${err.path}: ${err.message}`)
      .join("\n");
  }

  // Handle string details
  if (typeof details === "string") return details;

  // Handle other object details
  return JSON.stringify(details, null, 2)
    .replace(/[{}"]/g, "")
    .replace(/,/g, "")
    .trim();
};

export const Notification = ({
  type,
  message,
  details,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000,
}: NotificationProps) => {
  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, isVisible, onClose]);

  if (!isVisible) return null;

  const formattedDetails = details ? formatDetails(details) : null;

  return (
    <div
      className={cn(
        "transform transition-all duration-300 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      )}
    >
      <Card
        className={cn(
          "flex items-start gap-3 p-4 shadow-lg border relative overflow-hidden",
          "animate-in fade-in-0 zoom-in-95",
          variantStyles[type]
        )}
      >
        {/* Progress bar for auto-close */}
        {autoClose && (
          <div
            className={cn(
              "absolute bottom-0 left-0 h-0.5 bg-current opacity-25",
              iconStyles[type]
            )}
            style={{
              width: "100%",
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        )}

        <div className={cn("flex-shrink-0", iconStyles[type])}>
          {icons[type]}
        </div>
        <div className="flex-1 mr-2 min-w-0">
          <p className={cn("text-sm font-medium leading-5", textStyles[type])}>
            {message}
          </p>
          {formattedDetails && (
            <pre
              className={cn(
                "mt-2 text-xs text-muted-foreground break-words whitespace-pre-wrap font-mono",
                "bg-background/40 dark:bg-background/20 backdrop-blur-sm",
                "p-3 rounded-md max-h-[200px] overflow-y-auto",
                "border border-border/30 dark:border-border/20",
                "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
              )}
            >
              {formattedDetails}
            </pre>
          )}
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className={cn(
            "flex-shrink-0 h-8 w-8 rounded-full",
            "hover:bg-background/20 dark:hover:bg-background/20",
            "hover:text-foreground dark:hover:text-foreground",
            "transition-colors group",
            iconStyles[type]
          )}
        >
          <X className="h-4 w-4 transition-transform group-hover:scale-110" />
        </Button>
      </Card>
    </div>
  );
};

// Add keyframes for progress bar animation
const styles = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;

// Add the styles to the document
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
