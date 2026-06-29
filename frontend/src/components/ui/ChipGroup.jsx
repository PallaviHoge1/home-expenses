export default function ChipGroup({ label, options, value, onChange, multi = false, colorMap }) {
  const handleClick = (opt) => {
    if (multi) {
      const arr = value || [];
      onChange(arr.includes(opt) ? arr.filter((v) => v !== opt) : [...arr, opt]);
    } else {
      onChange(value === opt ? "" : opt);
    }
  };
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const selected = multi ? (value || []).includes(opt) : value === opt;
          const col = colorMap?.[opt];
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleClick(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selected ? "text-white shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
              style={selected ? { backgroundColor: col || "#4f46e5", borderColor: col || "#4f46e5" } : {}}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
