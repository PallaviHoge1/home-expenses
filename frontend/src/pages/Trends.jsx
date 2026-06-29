import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LineChart, Line,
} from "recharts";
import { Card, Select } from "../components/ui";
import {
  CATEGORIES, CATEGORY_CONFIG, SPENT_BY, PERSON_COLORS, CHART_COLORS,
} from "../config/categories";
import { getMonthKey, getMonthShortLabel, getLast6Months, fmtCurrency } from "../utils/helpers";

export default function Trends({ expenses }) {
  const [view, setView] = useState("category");
  const [selectedCat, setSelectedCat] = useState("");
  const last6 = useMemo(() => getLast6Months(), []);

  const categoryTrend = useMemo(() => {
    return last6.map((m) => {
      const monthExp = expenses.filter((e) => getMonthKey(e.date) === m);
      const row = { month: getMonthShortLabel(m) };
      CATEGORIES.forEach((cat) => {
        row[cat] = monthExp.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
      });
      row.Total = monthExp.reduce((s, e) => s + e.amount, 0);
      return row;
    });
  }, [expenses, last6]);

  const personTrend = useMemo(() => {
    return last6.map((m) => {
      const monthExp = expenses.filter((e) => getMonthKey(e.date) === m);
      const row = { month: getMonthShortLabel(m) };
      SPENT_BY.forEach((p) => {
        row[p] = monthExp.filter((e) => e.spentBy === p).reduce((s, e) => s + e.amount, 0);
      });
      return row;
    });
  }, [expenses, last6]);

  const topCats = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 6).map((c) => c[0]);
  }, [expenses]);

  const views = [
    { key: "category", label: "Category Trend" },
    { key: "person", label: "Person Split" },
    { key: "total", label: "Monthly Total" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {views.map((t) => (
          <button key={t.key} onClick={() => setView(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              view === t.key ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >{t.label}</button>
        ))}
      </div>

      {view === "total" && (
        <Card className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Monthly Total — Last 6 Months</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmtCurrency(v)} />
              <Bar dataKey="Total" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {view === "person" && (
        <Card className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Person Split — Last 6 Months</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={personTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmtCurrency(v)} />
              <Legend />
              {SPENT_BY.map((p) => (
                <Bar key={p} dataKey={p} fill={PERSON_COLORS[p]} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {view === "category" && (
        <>
          <Select label="Select Category" value={selectedCat} onChange={setSelectedCat}
            options={CATEGORIES} placeholder="Pick a category to see trend..."
          />
          {selectedCat ? (
            <Card className="p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">{selectedCat} — Last 6 Months</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={categoryTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => fmtCurrency(v)} />
                  <Line type="monotone" dataKey={selectedCat}
                    stroke={CATEGORY_CONFIG[selectedCat]?.color || "#6366f1"}
                    strokeWidth={2.5} dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          ) : (
            <Card className="p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Top Categories — Last 6 Months</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => fmtCurrency(v)} />
                  <Legend />
                  {topCats.map((cat, i) => (
                    <Bar key={cat} dataKey={cat}
                      fill={CATEGORY_CONFIG[cat]?.color || CHART_COLORS[i]}
                      stackId="a"
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
