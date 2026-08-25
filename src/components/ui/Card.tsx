import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white rounded-card border border-ink-100 shadow-[0_1px_2px_rgba(16,19,35,0.04)] ${className}`}
      {...props}
    />
  );
}
