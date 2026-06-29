import { useState, useMemo } from "react";
import { Search, Filter, List, Pencil, Trash2, X } from "lucide-react";
import { Card, Select, MonthPicker, EmptyState, Badge } from "../components/ui";
import { CATEGORIES, SPENT_BY, CATEGORY_CONFIG, PERSON_COLORS } from "../config/categories";
import { getMonthKey, fmtCurrency, fmtDate } from "../utils/helpers";

export default function ExpenseList({ expenses, month, setMonth, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterPerson, setFilterPerson] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const monthExpenses = useMemo(() => {
    let filtered = expenses.filter((e) => getMonthKey(e.date) === month);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((e) =>
        e.category.toLowerCase().includes(q) ||
        (e.subCategory || "").toLowerCase().includes(q) ||
        (e.subSubCategory || "").toLowerCase().includes(q) ||
        (e.notes || "").toLowerCase().includes(q)
      );
    }
    if (filterCat) filtered = filtered.filter((e) => e.category === filterCat);
    if (filterPerson) filtered = filtered.filter((e) => e.spentBy === filterPerson);
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, month, search, filterCat, filterPerson]);

  const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const hasActiveFilters = search || filterCat || filterPerson;

  const clearFilters = () => {
    setSearch("");
    setFilterCat("");
    setFilterPerson("");
  };

  const toggleFilters = () => {
    if (showFilters && hasActiveFilters) clearFilters();
    setShowFilters((f) => !f);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <MonthPicker value={month} onChange={setMonth} />
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{fmtCurrency(total)}</span> · {monthExpenses.length} entries
          </p>
          <button
            onClick={toggleFilters}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-indigo-50 border-indigo-200 text-indigo-500"
                : "border-gray-200 hover:bg-gray-50 text-gray-400"
            }`}
            aria-label="Toggle filters"
            title={hasActiveFilters ? "Clear filters" : "Filter"}
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-3">
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search expenses..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="w-[180px]">
              <Select value={filterCat} onChange={setFilterCat} options={CATEGORIES} placeholder="All categories" />
            </div>
            <div className="w-[140px]">
              <Select value={filterPerson} onChange={setFilterPerson} options={SPENT_BY} placeholder="All persons" />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Expense Table */}
      <Card className="overflow-hidden">
        {monthExpenses.length === 0 ? (
          <EmptyState
            icon={List}
            title={hasActiveFilters ? "No matching expenses" : "No expenses this month"}
            sub={hasActiveFilters ? "Try clearing filters" : "Click Add Expense to start"}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide hidden lg:table-cell">Details</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">By</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide hidden md:table-cell">Notes</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {monthExpenses.map((e) => {
                  const isRefund = e.amount < 0;
                  return (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(e.date)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: CATEGORY_CONFIG[e.category]?.color || "#888" }}
                          />
                          <span className="font-medium text-gray-800">{e.category}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {e.subCategory && <span>{e.subCategory}</span>}
                          {e.subSubCategory && <span className="text-gray-400">› {e.subSubCategory}</span>}
                          {e.mealTag && <Badge color="#f59e0b">{e.mealTag}</Badge>}
                          {isRefund && <Badge color="#10b981">Refund</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: (PERSON_COLORS[e.spentBy] || "#888") + "15",
                            color: PERSON_COLORS[e.spentBy] || "#888",
                          }}>
                          {e.spentBy}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell max-w-[200px] truncate">
                        {e.notes || "—"}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap ${
                        isRefund ? "text-green-600" : "text-gray-800"
                      }`}>
                        {isRefund ? "+" : ""}{fmtCurrency(Math.abs(e.amount))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => onEdit(e)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                            title="Edit"
                            aria-label="Edit expense"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => onDelete(e.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                            aria-label="Delete expense"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
