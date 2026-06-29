import { useState, useEffect, useRef, useCallback } from "react";
import { List, BarChart3, TrendingUp, Plus, Download, Upload } from "lucide-react";
import { ConfirmDialog, ToastProvider, useToast } from "./components/ui";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./pages/ExpenseList";
import MonthlySummary from "./pages/MonthlySummary";
import Trends from "./pages/Trends";
import {
  fetchExpenses, addExpense, updateExpense, deleteExpense,
  exportToJSON, importFromJSON, syncAll, isRemoteConfigured,
} from "./utils/api";
import { getCurrentMonthKey } from "./utils/helpers";

const TABS = [
  { key: "list", label: "Expenses", icon: List },
  { key: "summary", label: "Summary", icon: BarChart3 },
  { key: "trends", label: "Trends", icon: TrendingUp },
];

const TAB_STORAGE_KEY = "home-expenses-active-tab";

function AppShell() {
  const toast = useToast();
  const [expenses, setExpenses] = useState([]);
  const [tab, setTab] = useState(() => {
    try {
      const stored = localStorage.getItem(TAB_STORAGE_KEY);
      return TABS.some((t) => t.key === stored) ? stored : "list";
    } catch { return "list"; }
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
        toast.error("Couldn't reach the cloud — showing local data", { duration: 5000 });
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
      type: "info",
      message: "Expense deleted",
      duration: 5000,
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
    } catch (err) {
      toast.error(err.message || "Invalid file");
    }
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
    <div className="min-h-screen bg-gray-50 pb-20 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-base font-bold text-gray-800">Home Expenses</h1>
          <p className="text-xs text-gray-400">Vignesh &amp; Pallavi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Export JSON" title="Export"
          >
            <Download size={16} className="text-gray-400" />
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Import JSON" title="Import"
          >
            <Upload size={16} className="text-gray-400" />
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json"
            onChange={handleImport} className="hidden" />
        </div>
      </header>

      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        {tab === "list" && (
          <ExpenseList expenses={expenses} month={month} setMonth={setMonth}
            onEdit={handleEdit} onDelete={(id) => setDeleteId(id)} />
        )}
        {tab === "summary" && (
          <MonthlySummary expenses={expenses} month={month} setMonth={setMonth} />
        )}
        {tab === "trends" && <Trends expenses={expenses} />}
      </main>

      <button
        onClick={() => { setEditData(null); setFormOpen(true); }}
        className="fixed bottom-24 right-5 sm:right-[max(1.25rem,calc(50vw-256px+16px))] w-14 h-14 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center hover:bg-indigo-600 active:scale-95 transition-all z-30"
        aria-label="Add expense"
      >
        <Plus size={24} />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 z-30 safe-bottom">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
                active ? "text-indigo-500" : "text-gray-400"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <t.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{t.label}</span>
            </button>
          );
        })}
      </nav>

      <ExpenseForm open={formOpen}
        onClose={() => { setFormOpen(false); setEditData(null); }}
        onSave={handleSave} editData={editData}
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
