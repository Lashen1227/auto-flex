import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "strong" | "subtle";
}

export function GlassCard({
  className,
  tone = "default",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/15 shadow-[0_8px_40px_-12px_rgba(11,31,59,0.45)]",
        "backdrop-blur-xl",
        tone === "default" && "bg-white/10",
        tone === "strong" && "bg-white/20",
        tone === "subtle" && "bg-white/5",
        className,
      )}
      {...props}
    />
  );
}
