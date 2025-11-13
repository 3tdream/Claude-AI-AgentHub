import { ReactNode } from "react";

interface SlideContentProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  alignment?: "left" | "center" | "right";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

export function SlideContent({
  title,
  subtitle,
  children,
  alignment = "center",
  maxWidth = "xl",
}: SlideContentProps) {
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  const maxWidthClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-5xl",
    xl: "max-w-6xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`flex flex-col ${alignmentClasses[alignment]} ${maxWidthClasses[maxWidth]} w-full gap-6`}
    >
      {title && <h1 className="text-white">{title}</h1>}
      {subtitle && <h2 className="text-white/90">{subtitle}</h2>}
      {children && <div className="text-white/80">{children}</div>}
    </div>
  );
}
