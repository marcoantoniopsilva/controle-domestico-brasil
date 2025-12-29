
import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Container: React.FC<ContainerProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn("container mx-auto px-2 md:px-4", className)} {...props}>
      {children}
    </div>
  );
};
