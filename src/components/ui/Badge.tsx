import type { ReactNode } from "react";

type Tone = "navy" | "success" | "warn" | "danger" | "neutral" | "brand";

const toneClasses: Record<Tone, string> = {
  navy: "bg-ink-900 text-white",
  success: "bg-success-50 text-success-700",
  warn: "bg-warn-50 text-warn-700",
  danger: "bg-danger-50 text-danger-700",
  neutral: "bg-ink-100 text-ink-500",
  brand: "bg-brand-50 text-brand-600",
};

export function Badge({ tone = "neutral", children, icon }: { tone?: Tone; children: ReactNode; icon?: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}

/** Maps a test status string to a Badge tone + label. */
export function statusToBadge(status: string | null | undefined): { tone: Tone; label: string } {
  switch (status) {
    case "live":
      return { tone: "success", label: "Live" };
    case "scheduled":
      return { tone: "brand", label: "Scheduled" };
    case "expired":
      return { tone: "danger", label: "Expired" };
    case "unpublished":
      return { tone: "neutral", label: "Unpublished" };
    case "draft":
    default:
      return { tone: "warn", label: "Draft" };
  }
} 
