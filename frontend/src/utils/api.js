// ─────────────────────────────────────────────
// API LAYER — Supabase Backend
// ─────────────────────────────────────────────
// Returns {ok, data, error} so the UI can react to failures.
// Falls back to localStorage when Supabase isn't configured.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const useLocal = !SUPABASE_URL || !SUPABASE_KEY;

const TABLE = "expenses";

// ─── Local Storage (always-on backup) ───
const LOCAL_KEY = "home-expenses-data";

const localGet = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); }
  catch { return []; }
};

const localSet = (data) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); return true; }
  catch (e) { console.error("LocalStorage write failed:", e); return false; }
};

// ─── Supabase REST helper ───
const supaFetch = async (path, options = {}) => {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": options.prefer || "return=representation",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// ─── Map frontend fields ↔ Supabase columns ───
const toDbRow = (expense) => ({
  id: expense.id,
  date: expense.date,
  amount: expense.amount,
  spent_by: expense.spentBy,
  category: expense.category,
  sub_category: expense.subCategory || "",
  sub_sub_category: expense.subSubCategory || "",
  meal_tag: expense.mealTag || "",
  is_refund: expense.isRefund || false,
  notes: (expense.notes || "").trim(),
});

const fromDbRow = (row) => ({
  id: row.id,
  date: row.date,
  amount: Number(row.amount),
  spentBy: row.spent_by,
  category: row.category,
  subCategory: row.sub_category || "",
  subSubCategory: row.sub_sub_category || "",
  mealTag: row.meal_tag || "",
  isRefund: row.is_refund || false,
  notes: row.notes || "",
});

// ─── API Methods ───

export async function fetchExpenses() {
  if (useLocal) return { ok: true, data: localGet(), source: "local" };
  try {
    const rows = await supaFetch(`${TABLE}?select=*&order=date.desc`);
    const data = rows.map(fromDbRow);
    localSet(data);
    return { ok: true, data, source: "remote" };
  } catch (err) {
    console.error("Supabase fetch error:", err);
    return { ok: false, data: localGet(), source: "local", error: err.message };
  }
}

export async function addExpense(expense) {
  const local = localGet();
  if (!local.find((e) => e.id === expense.id)) local.push(expense);
  localSet(local);
  if (useLocal) return { ok: true, data: expense };
  try {
    await supaFetch(TABLE, {
      method: "POST",
      body: JSON.stringify(toDbRow(expense)),
      headers: { "Prefer": "resolution=ignore-duplicates,return=representation" },
      prefer: "resolution=ignore-duplicates,return=representation",
    });
    return { ok: true, data: expense };
  } catch (err) { return { ok: false, data: expense, error: err.message }; }
}

export async function updateExpense(expense) {
  const local = localGet();
  const idx = local.findIndex((e) => e.id === expense.id);
  if (idx >= 0) local[idx] = expense;
  else local.push(expense);
  localSet(local);
  if (useLocal) return { ok: true, data: expense };
  try {
    await supaFetch(`${TABLE}?id=eq.${encodeURIComponent(expense.id)}`, {
      method: "PATCH",
      body: JSON.stringify(toDbRow(expense)),
    });
    return { ok: true, data: expense };
  } catch (err) { return { ok: false, data: expense, error: err.message }; }
}

export async function deleteExpense(id) {
  localSet(localGet().filter((e) => e.id !== id));
  if (useLocal) return { ok: true };
  try {
    await supaFetch(`${TABLE}?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return { ok: true };
  } catch (err) { return { ok: false, error: err.message }; }
}

export async function syncAll(expenses) {
  localSet(expenses);
  if (useLocal) return { ok: true };
  try {
    // Delete all then insert
    await supaFetch(`${TABLE}?id=neq.___impossible___`, { method: "DELETE" });
    if (expenses.length > 0) {
      await supaFetch(TABLE, {
        method: "POST",
        body: JSON.stringify(expenses.map(toDbRow)),
      });
    }
    return { ok: true };
  } catch (err) { return { ok: false, error: err.message }; }
}

// ─── Export/Import ───

export function exportToJSON(expenses) {
  const blob = new Blob([JSON.stringify(expenses, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  a.href = url;
  a.download = `home-expenses-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) { reject(new Error("Expected an array of expenses")); return; }
        const valid = data.every(
          (x) => x && typeof x === "object"
            && typeof x.id === "string"
            && typeof x.date === "string"
            && typeof x.category === "string"
            && typeof x.amount === "number"
        );
        if (!valid) { reject(new Error("File contains invalid entries")); return; }
        resolve(data);
      } catch { reject(new Error("Invalid JSON")); }
    };
    reader.onerror = () => reject(new Error("Read failed"));
    reader.readAsText(file);
  });
}

export const isRemoteConfigured = () => !useLocal;
