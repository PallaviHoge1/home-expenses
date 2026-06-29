import { useState, useEffect, useRef, useCallback } from "react";
import { LayoutDashboard, List, TrendingUp, Plus, Download, Upload } from "lucide-react";
import { ConfirmDialog, ToastProvider, useToast } from "./components/ui";
import ExpenseForm from "./components/ExpenseForm";
import Dashboard from "./pages/Dashboard";
import ExpenseList from "./pages/ExpenseList";
import Trends from "./pages/Trends";
import {
  fetchExpenses, addExpense, updateExpense, deleteExpense,
  exportToJSON, importFromJSON, syncAll, isRemoteConfigured,
} from "./utils/api";
import { getCurrentMonthKey } from "./utils/helpers";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "expenses", label: "Expenses", icon: List },
  { key: "trends", label: "Trends", icon: TrendingUp },
];

const TAB_STORAGE_KEY = "home-expenses-active-tab";

function AppShell() {
  const toast = useToast();
  const [expenses, setExpenses] = useState([]);
  const [tab, setTab] = useState(() => {
    try {
      const stored = localStorage.getItem(TAB_STORAGE_KEY);
      return TABS.some((t) => t.key === stored) ? stored : "dashboard";
    } catch { return "dashboard"; }
  });
  const [month, setMonth] = useState(getCurrentMonthKey());
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    try { localStorage.setItem(TAB_STORAGE_KEY, tab); } catch {}
  }, [tab]);

  useEffect(() => {
    fetchExpenses().then((result) => {
      setExpenses(result.data || []);
      setLoaded(true);
      if (!result.ok && isRemoteConfigured()) {
        toast.error("Couldn't reach Supabase — showing local data", { duration: 5000 });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = useCallback(async (entry) => {
    const isEdit = expenses.some((e) => e.id === entry.id);
    setExpenses((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next; }
      return [...prev, entry];
    });
    const result = isEdit ? await updateExpense(entry) : await addExpense(entry);
    if (result.ok) toast.success(isEdit ? "Expense updated" : "Expense added");
    else if (isRemoteConfigured()) toast.error("Saved locally — sync failed", { duration: 4500 });
    else toast.success(isEdit ? "Expense updated" : "Expense added");
    setEditData(null);
  }, [expenses, toast]);

  const handleEdit = useCallback((expense) => {
    setEditData(expense);
    setFormOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteId == null) return;
    const toDelete = expenses.find((e) => e.id === deleteId);
    if (!toDelete) { setDeleteId(null); return; }
    setExpenses((prev) => prev.filter((e) => e.id !== deleteId));
    setDeleteId(null);
    let undone = false;
    toast.show({
      type: "info", message: "Expense deleted", duration: 5000,
      action: {
        label: "Undo",
        onClick: async () => {
          undone = true;
          setExpenses((prev) => [...prev, toDelete]);
          const result = await addExpense(toDelete);
          if (!result.ok && isRemoteConfigured()) toast.error("Restored locally — sync failed");
        },
      },
    });
    setTimeout(async () => {
      if (undone) return;
      const result = await deleteExpense(toDelete.id);
      if (!result.ok && isRemoteConfigured()) toast.error("Delete didn't sync to cloud");
    }, 5200);
  }, [deleteId, expenses, toast]);

  const handleExport = useCallback(() => {
    exportToJSON(expenses);
    toast.success(`Exported ${expenses.length} entries`);
  }, [expenses, toast]);

  const handleImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = await importFromJSON(file);
      setExpenses(data);
      const result = await syncAll(data);
      if (result.ok) toast.success(`Imported ${data.length} entries`);
      else toast.error("Imported locally — sync to cloud failed");
    } catch (err) { toast.error(err.message || "Invalid file"); }
  }, [toast]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14 gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">₹</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-gray-800 leading-tight">Home Expenses</h1>
              <p className="text-[10px] text-gray-400 leading-tight">Vignesh &amp; Pallavi</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <t.icon size={16} />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExport}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Export JSON" aria-label="Export"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Import JSON" aria-label="Import"
            >
              <Upload size={16} />
            </button>
            <input ref={fileRef} type="file" accept=".json,application/json"
              onChange={handleImport} className="hidden" />
            <button
              onClick={() => { setEditData(null); setFormOpen(true); }}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Expense</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {tab === "dashboard" && (
          <Dashboard expenses={expenses} month={month} setMonth={setMonth} />
        )}
        {tab === "expenses" && (
          <ExpenseList
            expenses={expenses} month={month} setMonth={setMonth}
            onEdit={handleEdit} onDelete={(id) => setDeleteId(id)}
          />
        )}
        {tab === "trends" && <Trends expenses={expenses} />}
      </main>

      <ExpenseForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditData(null); }}
        onSave={handleSave} editData={editData}
        expenses={expenses}
      />
      <ConfirmDialog
        open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete expense?" message="You'll have a few seconds to undo."
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
