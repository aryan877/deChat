"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
}

interface HoverCardContextValue {
  isOpen: boolean;
}

const HoverCardContext = React.createContext<HoverCardContextValue>({
  isOpen: false,
});

const HoverCard = ({ children, className }: HoverCardProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <HoverCardContext.Provider value={{ isOpen }}>
      <div
        className={cn("relative", className)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  );
};

const HoverCardTrigger = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("w-full", className)}>{children}</div>;
};

const HoverCardContent = ({
  children,
  className,
  align = "center",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}) => {
  const { isOpen } = React.useContext(HoverCardContext);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute z-50 rounded-md border bg-popover shadow-md outline-none",
        "animate-in fade-in-0 zoom-in-95 duration-100",
        {
          "left-0 right-0": align === "start",
          "left-1/2 -translate-x-1/2": align === "center",
          "right-0": align === "end",
        },
        "bottom-[calc(100%+4px)]",
        className
      )}
      style={{ maxWidth: "calc(100vw - 32px)" }}
    >
      {children}
    </div>
  );
};

export { HoverCard, HoverCardContent, HoverCardTrigger };
