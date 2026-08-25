import { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  error?: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = "Choose from Drop-down",
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function toggle(v: string) {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  }

  function remove(v: string) {
    onChange(value.filter((x) => x !== v));
  }

  const selectedLabels = options.filter((o) => value.includes(o.value));

  return (
    <div className="w-full" ref={ref}>
      {label && <label className="block text-sm font-medium text-ink-700 mb-1.5">{label}</label>}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center justify-between rounded-lg border bg-white px-3.5 py-2.5 text-sm text-left transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-ink-50 disabled:text-ink-300 ${
            error ? "border-danger-500" : "border-ink-200"
          }`}
        >
          <span className={value.length ? "text-ink-900" : "text-ink-300"}>
            {value.length ? `${value.length} selected` : placeholder}
          </span>
          <svg className="h-4 w-4 text-ink-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && !disabled && (
          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-ink-200 bg-white shadow-lg py-1">
            {options.length === 0 && (
              <p className="px-3.5 py-2 text-sm text-ink-300">No options available</p>
            )}
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-ink-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="h-4 w-4 rounded border-ink-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-ink-900">{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      {selectedLabels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedLabels.map((o) => (
            <span
              key={o.value}
              className="inline-flex items-center gap-1 rounded-full border border-warn-500 text-warn-700 bg-warn-50 px-2.5 py-0.5 text-xs font-medium"
            >
              {o.label}
              <button
                type="button"
                onClick={() => remove(o.value)}
                aria-label={`Remove ${o.label}`}
                className="hover:text-danger-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  );
}
