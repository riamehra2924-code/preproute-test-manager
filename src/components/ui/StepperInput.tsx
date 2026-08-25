interface StepperInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  prefix?: string;
}

export function StepperInput({ label, value, onChange, step = 1 }: StepperInputProps) {
  const display = value > 0 ? `+${value}` : `${value}`;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-ink-700 mb-1.5">{label}</label>
      <div className="flex items-center justify-between rounded-lg border border-ink-200 bg-white px-3.5 py-2.5">
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value.replace(/[^-\d.]/g, ""));
            onChange(Number.isNaN(parsed) ? 0 : parsed);
          }}
          className="w-full text-sm text-ink-900 bg-transparent outline-none"
        />
        <div className="flex flex-col -my-1">
          <button
            type="button"
            aria-label={`Increase ${label}`}
            onClick={() => onChange(Math.round((value + step) * 100) / 100)}
            className="text-ink-400 hover:text-brand-500 leading-none"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            onClick={() => onChange(Math.round((value - step) * 100) / 100)}
            className="text-ink-400 hover:text-brand-500 leading-none"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
