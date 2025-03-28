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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for sidebar state on mount and on resize
  useEffect(() => {
    const checkSidebarState = () => {
      // Check if sidebar element exists and has collapsed class
      const sidebarElement = document.querySelector('[data-state="sidebar"]');
      const mobileCheck = window.innerWidth < 768;

      setIsMobile(mobileCheck);

      if (sidebarElement) {
        const isCollapsed =
          sidebarElement.getAttribute("data-collapsed") === "true";
        setIsSidebarCollapsed(isCollapsed);
      } else {
        setIsSidebarCollapsed(true);
      }
    };

    // Initial check
    checkSidebarState();

    // Listen for resize events
    window.addEventListener("resize", checkSidebarState);

    return () => {
      window.removeEventListener("resize", checkSidebarState);
    };
  }, []);

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
      </div>
    );
  }

  // On mobile, take full screen. On desktop, position beside sidebar
  return (
    <div
      className={cn(
        "fixed z-40 flex flex-col bg-background shadow-lg animate-in fade-in-0 duration-150",
        // Mobile: full screen
        isMobile
          ? "inset-0 fade-in-0 zoom-in-95"
          : // Desktop: position beside sidebar
            cn(
              "top-0 bottom-0 right-0 slide-in-from-right-10",
              isSidebarCollapsed ? "left-[60px]" : "left-[240px]"
            )
      )}
    >
      <div className="flex justify-between items-center p-2 border-b">
        <span className="text-sm font-medium">Expanded Tool</span>
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
      <div className="flex-1 overflow-auto p-3 pb-20">{childrenWithProps}</div>
    </div>
  );
};
