interface RadioGroupProps<T extends string> {
  name: string;
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
  columns?: number;
}

export function RadioGroup<T extends string>({ name, options, value, onChange, columns }: RadioGroupProps<T>) {
  return (
    <div
      className={columns ? `grid gap-3` : "flex flex-wrap gap-6"}
      style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
    >
      {options.map((opt) => (
        <label key={opt.value} className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="radio"
            name={name}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="h-4 w-4 border-ink-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-ink-800">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
