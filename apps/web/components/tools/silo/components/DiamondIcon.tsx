import { cn } from "@/lib/utils";
import React from "react";

interface DiamondIconProps {
  className?: string;
}

export const DiamondIcon: React.FC<DiamondIconProps> = ({ className }) => (
  <svg
    className={cn("h-4 w-4", className)}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.00004 14L1.33337 6L3.33337 2H12.6667L14.6667 6L8.00004 14ZM6.41671 5.33333H9.58337L8.58337 3.33333H7.41671L6.41671 5.33333ZM7.33337 11.1167V6.66667H3.63337L7.33337 11.1167ZM8.66671 11.1167L12.3667 6.66667H8.66671V11.1167ZM11.0667 5.33333H12.8334L11.8334 3.33333H10.0667L11.0667 5.33333ZM3.16671 5.33333H4.93337L5.93337 3.33333H4.16671L3.16671 5.33333Z"
      fill="currentColor"
    />
  </svg>
);
