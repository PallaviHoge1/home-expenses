import { useRef, useEffect, useMemo } from "react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// month = "YYYY-MM" from dashboard
// value = "YYYY-MM-DD" selected date
export default function DayStrip({ month, value, onChange }) {
  const scrollRef = useRef(null);
  const selectedRef = useRef(null);

  const [stripYear, stripMonth] = useMemo(
    () => month.split("-").map(Number),
    [month]
  );

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const days = useMemo(() => {
    const daysInMonth = new Date(stripYear, stripMonth, 0).getDate();
    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${stripYear}-${String(stripMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayOfWeek = new Date(stripYear, stripMonth - 1, d).getDay();
      const isToday = dateStr === todayStr;
      const isFuture = new Date(stripYear, stripMonth - 1, d) > now;
      result.push({ day: d, dateStr, dayName: DAY_NAMES[dayOfWeek], isToday, isFuture });
    }
    return result;
  }, [stripYear, stripMonth, todayStr]);

  // Auto-scroll selected day into view
  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = selectedRef.current;
      container.scrollTo({
        left: Math.max(0, el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2),
        behavior: "smooth",
      });
    }
  }, [value, month]);

  const monthLabel = `${MONTH_NAMES[stripMonth - 1]} ${stripYear}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Date
        </label>
        <span className="text-xs font-semibold text-gray-400">
          {monthLabel}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {days.map((d) => {
          const isSelected = d.dateStr === value;
          return (
            <button
              key={d.day}
              ref={isSelected ? selectedRef : null}
              type="button"
              disabled={d.isFuture}
              onClick={() => onChange(d.dateStr)}
              className={`flex flex-col items-center px-2 py-1.5 rounded-lg shrink-0 min-w-[42px] transition-all ${
                isSelected
                  ? "bg-indigo-500 text-white shadow-sm"
                  : d.isToday
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                  : d.isFuture
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="text-[10px] font-medium leading-tight">
                {d.dayName}
              </span>
              <span className={`text-sm font-bold leading-tight ${
                isSelected ? "" : d.isToday ? "text-indigo-600" : ""
              }`}>
                {d.day}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
