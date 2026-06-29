import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getMonthLabel, shiftMonth, getCurrentMonthKey, isCurrentMonth,
} from "../../utils/helpers";

export default function MonthPicker({ value, onChange }) {
  const atCurrent = isCurrentMonth(value);
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(shiftMonth(value, -1))}
        className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 text-gray-500 transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => onChange(getCurrentMonthKey())}
        disabled={atCurrent}
        className="text-sm font-semibold text-gray-700 min-w-[130px] text-center px-2 py-1.5 rounded-lg hover:bg-gray-100 disabled:hover:bg-transparent disabled:cursor-default transition-colors"
        title={atCurrent ? "Current month" : "Jump to current month"}
      >
        {getMonthLabel(value)}
      </button>
      <button
        onClick={() => onChange(shiftMonth(value, 1))}
        className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 text-gray-500 transition-colors"
        aria-label="Next month"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
