import { useState, useMemo } from "react";
import { Search, Filter, List } from "lucide-react";
import { Card, Select, MonthPicker, EmptyState } from "../components/ui";
import ExpenseRow from "../components/ExpenseRow";
import { CATEGORIES, SPENT_BY } from "../config/categories";
import { getMonthKey, fmtCurrency } from "../utils/helpers";

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <MonthPicker value={month} onChange={setMonth} />
        <button
          onClick={() => setShowFilters((f) => !f)}
          className={`p-2 rounded-lg border transition-colors ${
            showFilters ? "bg-indigo-50 border-indigo-200" : "border-gray-200 hover:bg-gray-50"
          }`}
          aria-label="Toggle filters"
        >
          <Filter size={16} className={showFilters ? "text-indigo-500" : "text-gray-400"} />
        </button>
      </div>

      {showFilters && (
        <Card className="p-3 flex flex-col gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={filterCat} onChange={setFilterCat} options={CATEGORIES} placeholder="All categories" />
            <Select value={filterPerson} onChange={setFilterPerson} options={SPENT_BY} placeholder="All persons" />
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Net spend this month</p>
            <p className="text-2xl font-bold text-gray-800">{fmtCurrency(total)}</p>
          </div>
          <p className="text-xs text-gray-400">{monthExpenses.length} entries</p>
        </div>
      </Card>

      <Card className="px-4 py-2">
        {monthExpenses.length === 0 ? (
          <EmptyState icon={List} title="No expenses this month" sub="Tap + to add your first entry" />
        ) : (
          monthExpenses.map((e) => (
            <ExpenseRow key={e.id} expense={e} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </Card>
    </div>
  );
}
