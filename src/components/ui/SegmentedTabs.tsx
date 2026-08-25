interface SegmentedTabsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedTabs<T extends string>({ options, value, onChange }: SegmentedTabsProps<T>) {
  return (
    <div className="inline-flex items-center rounded-lg bg-ink-50 p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === opt.value
              ? "bg-brand-50 text-brand-600 shadow-sm"
              : "text-ink-400 hover:text-ink-600"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
