import { useToastStore } from "@/store/toastStore";

const toneClasses = {
  success: "bg-ink-900 text-white border-success-500",
  error: "bg-ink-900 text-white border-danger-500",
  info: "bg-ink-900 text-white border-ink-700",
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`flex items-start justify-between gap-3 rounded-lg border-l-4 px-4 py-3 text-sm shadow-lg ${toneClasses[t.tone]}`}
        >
          <span>{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="text-white/60 hover:text-white text-xs">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
