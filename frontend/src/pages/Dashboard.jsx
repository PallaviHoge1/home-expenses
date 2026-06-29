import { useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, MonthPicker } from "../components/ui";
import { CATEGORY_CONFIG, SPENT_BY, PERSON_COLORS } from "../config/categories";
import { getMonthKey, fmtCurrency, shiftMonth } from "../utils/helpers";

export default function Dashboard({ expenses, month, setMonth }) {
  const monthData = useMemo(() => {
    const monthExpenses = expenses.filter((e) => getMonthKey(e.date) === month);
    const prevMonth = shiftMonth(month, -1);
    const prevExpenses = expenses.filter((e) => getMonthKey(e.date) === prevMonth);

    const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const prevTotal = prevExpenses.reduce((s, e) => s + e.amount, 0);
    const changePercent = prevTotal !== 0 ? Math.round(((total - prevTotal) / Math.abs(prevTotal)) * 100) : null;

    const refundTotal = monthExpenses
      .filter((e) => e.amount < 0)
      .reduce((s, e) => s + Math.abs(e.amount), 0);
    const refundCount = monthExpenses.filter((e) => e.amount < 0).length;

    // Person split
    const personData = SPENT_BY.map((name) => ({
      name,
      value: monthExpenses
        .filter((e) => e.spentBy === name)
        .reduce((s, e) => s + e.amount, 0),
      color: PERSON_COLORS[name],
    }));

    // Category breakdown
    const byCategory = {};
    monthExpenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    const categoryData = Object.entries(byCategory)
      .map(([name, value]) => ({
        name,
        value,
        absValue: Math.abs(value),
        color: CATEGORY_CONFIG[name]?.color || "#888",
      }))
      .filter((d) => d.absValue > 0)
      .sort((a, b) => b.absValue - a.absValue);

    const pieData = categoryData.filter((d) => d.value > 0);
    const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

    // Daily spending
    const [year, m] = month.split("-").map(Number);
    const daysInMonth = new Date(year, m, 0).getDate();
    const byDay = {};
    monthExpenses.forEach((e) => {
      if (e.amount <= 0) return;
      const day = parseInt(e.date.split("-")[2], 10);
      byDay[day] = (byDay[day] || 0) + e.amount;
    });
    const dailyData = [];
    for (let i = 1; i <= daysInMonth; i++) {
      dailyData.push({ day: String(i), amount: byDay[i] || 0 });
    }

    // Top 5
    const topExpenses = [...monthExpenses]
      .filter((e) => e.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      monthExpenses, total, prevTotal, changePercent,
      refundTotal, refundCount, personData, categoryData,
      pieData, pieTotal, dailyData, topExpenses,
    };
  }, [expenses, month]);

  const {
    monthExpenses, total, changePercent, refundTotal, refundCount,
    personData, categoryData, pieData, pieTotal, dailyData, topExpenses,
  } = monthData;

  const hasDailyData = dailyData.some((d) => d.amount > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <MonthPicker value={month} onChange={setMonth} />
        <p className="text-xs text-gray-400">{monthExpenses.length} entries</p>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Spend</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{fmtCurrency(total)}</p>
          {changePercent !== null && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              changePercent > 0 ? "text-red-500" : changePercent < 0 ? "text-green-600" : "text-gray-400"
            }`}>
              {changePercent > 0
                ? <ArrowUpRight size={14} />
                : changePercent < 0
                ? <ArrowDownRight size={14} />
                : null
              }
              {changePercent === 0
                ? "Same as last month"
                : `${Math.abs(changePercent)}% vs last month`
              }
            </div>
          )}
        </Card>

        {personData.map((p) => (
          <Card key={p.name} className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: p.color }}>
              {p.name}
            </p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{fmtCurrency(p.value)}</p>
            <p className="text-xs text-gray-400 mt-2">
              {total > 0 ? Math.round((p.value / total) * 100) : 0}% of total
            </p>
          </Card>
        ))}

        <Card className="p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Refunds</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {refundTotal > 0 ? `+${fmtCurrency(refundTotal)}` : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {refundCount} refund {refundCount === 1 ? "entry" : "entries"}
          </p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Pie */}
        <Card className="p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
            Category Breakdown
          </p>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-[200px] h-[200px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData} dataKey="value" cx="50%" cy="50%"
                      innerRadius={55} outerRadius={85} paddingAngle={2}
                    >
                      {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmtCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
                {categoryData.slice(0, 8).map((d) => {
                  const pct = pieTotal > 0 && d.value > 0
                    ? Math.round((d.value / pieTotal) * 100) : 0;
                  const isNeg = d.value < 0;
                  return (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-gray-600 flex-1 truncate">{d.name}</span>
                      <span className="text-xs text-gray-400 shrink-0">{isNeg ? "—" : `${pct}%`}</span>
                      <span className={`text-sm font-semibold shrink-0 tabular-nums ${
                        isNeg ? "text-green-600" : "text-gray-800"
                      }`}>
                        {isNeg ? "+" : ""}{fmtCurrency(Math.abs(d.value))}
                      </span>
                    </div>
                  );
                })}
                {categoryData.length > 8 && (
                  <p className="text-xs text-gray-400 pl-5">+{categoryData.length - 8} more</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">No data this month</p>
          )}
        </Card>

        {/* Daily Bar Chart */}
        <Card className="p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
            Daily Spending
          </p>
          {hasDailyData ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }}
                  interval={Math.max(0, Math.floor(dailyData.length / 8) - 1)}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                  width={50}
                />
                <Tooltip formatter={(v) => fmtCurrency(v)} labelFormatter={(l) => `Day ${l}`} />
                <Bar dataKey="amount" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">No data this month</p>
          )}
        </Card>
      </div>

      {/* Top Expenses */}
      {topExpenses.length > 0 && (
        <Card className="p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
            Top {topExpenses.length} {topExpenses.length === 1 ? "Expense" : "Expenses"}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs text-gray-400 font-medium">Date</th>
                  <th className="text-left py-2 text-xs text-gray-400 font-medium">Category</th>
                  <th className="text-left py-2 text-xs text-gray-400 font-medium">Details</th>
                  <th className="text-left py-2 text-xs text-gray-400 font-medium">By</th>
                  <th className="text-right py-2 text-xs text-gray-400 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {topExpenses.map((e) => (
                  <tr key={e.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-500">{e.date}</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: CATEGORY_CONFIG[e.category]?.color || "#888" }}
                        />
                        {e.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-500">
                      {[e.subCategory, e.subSubCategory].filter(Boolean).join(" › ") || "—"}
                    </td>
                    <td className="py-2.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: (PERSON_COLORS[e.spentBy] || "#888") + "15",
                          color: PERSON_COLORS[e.spentBy] || "#888",
                        }}>
                        {e.spentBy}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-gray-800 tabular-nums">
                      {fmtCurrency(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
