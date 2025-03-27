"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Expand, X } from "lucide-react";
import React, { ReactNode, useEffect, useState } from "react";

interface ExpandableToolProps {
  children: ReactNode;
  className?: string;
}

// Create a generic type for child props that may include isExpanded
type ChildProps = {
  className?: string;
  isExpanded?: boolean;
};

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
      const elementChild = child as React.ReactElement<ChildProps>;
      return React.cloneElement(elementChild, {
        isExpanded,
        className: cn(
          elementChild.props.className,
          !isExpanded && "pr-[5.5rem]" // Add right padding to prevent content overlap with button
        ),
      });
    }
    return child;
  });

  // Regular view with expand button
  if (!isExpanded) {
    return (
      <div className={cn("relative group", className)}>
        {childrenWithProps}
        <div className="absolute top-3 right-3 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 opacity-70 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
            onClick={() => setIsExpanded(true)}
            title="Expand tool"
          >
            <Expand className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  // Fullscreen view using absolute positioning
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background shadow-lg animate-in fade-in-0 zoom-in-95 duration-150">
      <div className="flex justify-end items-center p-2 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          title="Close expanded view"
        >
          <X className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs">Close</span>
        </Button>
      </div>
      <div className="flex-1 overflow-hidden p-2 sm:p-3 h-[calc(100vh-40px)]">
        {childrenWithProps}
      </div>
    </div>
  );
};
