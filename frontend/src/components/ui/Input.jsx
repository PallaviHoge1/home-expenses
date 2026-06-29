export default function Input({
  label, type = "text", value, onChange, placeholder, required,
  min, max, step, prefix, error, inputMode, pattern, autoFocus,
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {prefix}
          </span>
        )}
        <input
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} required={required}
          min={min} max={max} step={step}
          inputMode={inputMode} pattern={pattern}
          autoFocus={autoFocus}
          className={`w-full px-3 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
          } ${prefix ? "pl-7" : ""}`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
