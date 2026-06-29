import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { IndianRupee, FileText } from "lucide-react";
import { Card, MonthPicker, StatCard } from "../components/ui";
import { CATEGORY_CONFIG, SPENT_BY, PERSON_COLORS } from "../config/categories";
import { getMonthKey, fmtCurrency } from "../utils/helpers";

export default function MonthlySummary({ expenses, month, setMonth }) {
  const { categoryData, total, refundTotal, entryCount } = useMemo(() => {
    const monthExp = expenses.filter((e) => getMonthKey(e.date) === month);
    const byCategory = {};
    monthExp.forEach((e) => {
      if (!byCategory[e.category]) byCategory[e.category] = 0;
      byCategory[e.category] += e.amount;
    });
    const data = Object.entries(byCategory)
      .map(([name, value]) => ({
        name, value, absValue: Math.abs(value),
        color: CATEGORY_CONFIG[name]?.color || "#888",
      }))
      .filter((d) => d.absValue > 0)
      .sort((a, b) => b.absValue - a.absValue);

    const totalNet = data.reduce((s, d) => s + d.value, 0);
    const refunds = monthExp
      .filter((e) => e.amount < 0)
      .reduce((s, e) => s + Math.abs(e.amount), 0);

    return { categoryData: data, total: totalNet, refundTotal: refunds, entryCount: monthExp.length };
  }, [expenses, month]);

  const pieData = useMemo(() => categoryData.filter((d) => d.value > 0), [categoryData]);
  const pieTotal = useMemo(() => pieData.reduce((s, d) => s + d.value, 0), [pieData]);

  const personData = useMemo(() => {
    const monthExp = expenses.filter((e) => getMonthKey(e.date) === month);
    const byPerson = {};
    SPENT_BY.forEach((p) => (byPerson[p] = 0));
    monthExp.forEach((e) => { byPerson[e.spentBy] = (byPerson[e.spentBy] || 0) + e.amount; });
    return Object.entries(byPerson).map(([name, value]) => ({ name, value }));
  }, [expenses, month]);

  const personTotal = personData.reduce((s, p) => s + p.value, 0);

  return (
    <div className="flex flex-col gap-4">
      <MonthPicker value={month} onChange={setMonth} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Net Spend" value={fmtCurrency(total)}
          sub={`${categoryData.length} categories`}
          icon={IndianRupee} color="#1D9E75"
        />
        <StatCard
          label="Entries" value={entryCount}
          sub={refundTotal > 0 ? `${fmtCurrency(refundTotal)} refunded` : "this month"}
          icon={FileText} color="#6366f1"
        />
      </div>

      {pieData.length > 0 && (
        <Card className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Category Breakdown</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%"
                innerRadius={50} outerRadius={85} paddingAngle={2}
              >
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(v) => fmtCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card className="p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Person Split</p>
        <div className="flex gap-3">
          {personData.map((p) => (
            <div key={p.name} className="flex-1 p-3 rounded-xl"
              style={{ backgroundColor: (PERSON_COLORS[p.name] || "#888") + "10" }}>
              <p className="text-xs font-medium" style={{ color: PERSON_COLORS[p.name] || "#888" }}>{p.name}</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{fmtCurrency(p.value)}</p>
              <p className="text-xs text-gray-400">
                {personTotal > 0 ? Math.round((p.value / personTotal) * 100) : 0}%
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">By Category</p>
        {categoryData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No data</p>
        ) : (
          <div className="flex flex-col gap-2">
            {categoryData.map((d) => {
              const pct = pieTotal > 0 && d.value > 0 ? Math.round((d.value / pieTotal) * 100) : 0;
              const isRefundNet = d.value < 0;
              return (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-sm text-gray-700 flex-1 truncate">{d.name}</span>
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: d.color }} />
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 w-8 text-right">
                    {isRefundNet ? "—" : `${pct}%`}
                  </span>
                  <span className={`text-sm font-semibold shrink-0 min-w-[80px] text-right ${
                    isRefundNet ? "text-green-600" : "text-gray-800"
                  }`}>
                    {isRefundNet ? "+" : ""}{fmtCurrency(Math.abs(d.value))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
