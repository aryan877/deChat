"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Expand, X } from "lucide-react";
import React, { ReactNode, useEffect, useState } from "react";

interface ExpandableToolProps {
  children: ReactNode;
  className?: string;
}

export const ExpandableTool = ({
  children,
  className,
}: ExpandableToolProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Lock body scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  // Pass isExpanded prop to children if they are React elements
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { isExpanded } as any);
    }
    return child;
  });

  // Regular view with expand button
  if (!isExpanded) {
    return (
      <div className={cn("relative group", className)}>
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-3 shadow-sm opacity-100 transition-colors bg-primary/10 hover:bg-primary/20 border border-primary/20"
            onClick={() => setIsExpanded(true)}
            title="Expand tool"
          >
            <Expand className="h-4 w-4 mr-1.5" />
            <span className="text-xs font-medium">Expand</span>
          </Button>
        </div>
        {childrenWithProps}
      </div>
    );
  }

  // Fullscreen view using absolute positioning
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background shadow-lg animate-in fade-in-0 zoom-in-95 duration-150">
      <div className="flex justify-end items-center p-2 border-b">
        <Button
          variant="secondary"
          size="sm"
          className="h-8 px-3 shadow-sm opacity-100 transition-colors bg-primary/10 hover:bg-primary/20 border border-primary/20"
          onClick={() => setIsExpanded(false)}
          title="Close expanded view"
        >
          <X className="h-4 w-4 mr-1.5" />
          <span className="text-xs font-medium">Close</span>
        </Button>
      </div>
      <div className="flex-1 overflow-hidden p-2 sm:p-3 h-[calc(100vh-40px)]">
        {childrenWithProps}
      </div>
    </div>
  );
};
