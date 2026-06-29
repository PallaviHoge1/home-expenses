import { Pencil, Trash2, MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Badge from "./ui/Badge";
import { CATEGORY_CONFIG, PERSON_COLORS } from "../config/categories";
import { fmtCurrency, fmtDate } from "../utils/helpers";

export default function ExpenseRow({ expense, onEdit, onDelete }) {
  const config = CATEGORY_CONFIG[expense.category] || {};
  const isRefund = expense.amount < 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [menuOpen]);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ backgroundColor: config.color || "#888" }}
      >
        {expense.category?.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-medium text-gray-800 truncate">{expense.category}</span>
          {expense.subCategory && <span className="text-xs text-gray-400 truncate">› {expense.subCategory}</span>}
          {expense.subSubCategory && <span className="text-xs text-gray-400 truncate">› {expense.subSubCategory}</span>}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-400">{fmtDate(expense.date)}</span>
          <Badge color={PERSON_COLORS[expense.spentBy] || "#888"}>{expense.spentBy}</Badge>
          {expense.mealTag && <Badge color="#f59e0b">{expense.mealTag}</Badge>}
          {isRefund && <Badge color="#10b981">Refund</Badge>}
        </div>
        {expense.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{expense.notes}</p>}
      </div>

      <div className="text-right shrink-0">
        <span className={`text-sm font-semibold ${isRefund ? "text-green-600" : "text-gray-800"}`}>
          {isRefund ? "+" : ""}{fmtCurrency(Math.abs(expense.amount))}
        </span>
      </div>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200 text-gray-400 transition-colors"
          aria-label="Actions"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg py-1 min-w-[120px] z-20 animate-fade-in">
            <button
              onClick={() => { onEdit(expense); setMenuOpen(false); }}
              className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Pencil size={14} className="text-gray-400" /> Edit
            </button>
            <button
              onClick={() => { onDelete(expense.id); setMenuOpen(false); }}
              className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 size={14} className="text-red-400" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
