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
  success: "bg-primary text-primary-foreground",
  error: "bg-muted text-muted-foreground",
  warning: "bg-primary text-primary-foreground",
  info: "bg-muted text-muted-foreground",
};

const iconStyles = {
  success: "text-primary-foreground",
  error: "text-muted-foreground",
  warning: "text-primary-foreground",
  info: "text-muted-foreground",
};

const textStyles = {
  success: "text-primary-foreground",
  error: "text-muted-foreground",
  warning: "text-primary-foreground",
  info: "text-muted-foreground",
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
          "flex items-start gap-3 p-3 shadow-lg relative overflow-hidden rounded-lg",
          "animate-in fade-in-0 zoom-in-95",
          variantStyles[type]
        )}
      >
        {/* Progress bar for auto-close */}
        {autoClose && (
          <div
            className="absolute bottom-0 left-0 h-0.5 bg-foreground/25 rounded-full"
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
                "mt-2 text-xs break-words whitespace-pre-wrap font-mono",
                "bg-foreground/5",
                "p-2 rounded-md max-h-[200px] overflow-y-auto",
                "text-foreground/90",
                "scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent"
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
            "hover:bg-foreground/10",
            "text-foreground/90 hover:text-foreground",
            "transition-colors group"
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
