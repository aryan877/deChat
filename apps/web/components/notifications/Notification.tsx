"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect } from "react";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface NotificationProps {
  type: NotificationType;
  message: string;
  details?: unknown;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
  txHash?: string;
  txExplorerUrl?: string;
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

// Process message text for Markdown-style links
const processMessage = (message: string): React.ReactNode => {
  if (!message.includes("[") || !message.includes("]")) {
    return message;
  }

  const parts: Array<string | React.ReactElement> = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(message)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(message.slice(lastIndex, match.index));
    }

    // Add the link
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground underline hover:opacity-80"
      >
        {match[1]}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text
  if (lastIndex < message.length) {
    parts.push(message.slice(lastIndex));
  }

  return parts;
};

export const Notification = ({
  type,
  message,
  details,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000,
  txHash,
  txExplorerUrl,
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
  const processedMessage = processMessage(message);

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
            {processedMessage}
          </p>

          {/* Transaction link section */}
          {txHash && txExplorerUrl && (
            <div className="mt-2 flex items-center space-x-2">
              <a
                href={txExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "text-xs px-2 py-1 rounded-md",
                  "bg-foreground/10 hover:bg-foreground/20",
                  "flex items-center gap-1 transition-colors",
                  "text-foreground/90"
                )}
              >
                <span>View on Explorer</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          )}

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
