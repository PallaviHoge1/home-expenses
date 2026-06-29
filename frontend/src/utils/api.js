// API layer — returns {ok, data, error, source}. Always writes to localStorage.

const API_URL = import.meta.env.VITE_API_URL || "";
const useLocal = !API_URL;

const LOCAL_KEY = "home-expenses-data";

const localGet = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); }
  catch { return []; }
};

const localSet = (data) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); return true; }
  catch (e) { console.error("LocalStorage write failed:", e); return false; }
};

const postToApi = async (payload) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.success === false) throw new Error(json.error || "API error");
  return json;
};

export async function fetchExpenses() {
  if (useLocal) return { ok: true, data: localGet(), source: "local" };
  try {
    const res = await fetch(`${API_URL}?action=getAll`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success === false) throw new Error(json.error);
    const data = json.expenses || [];
    localSet(data);
    return { ok: true, data, source: "remote" };
  } catch (err) {
    console.error("API fetch error:", err);
    return { ok: false, data: localGet(), source: "local", error: err.message };
  }
}

export async function addExpense(expense) {
  const local = localGet();
  if (!local.find((e) => e.id === expense.id)) local.push(expense);
  localSet(local);
  if (useLocal) return { ok: true, data: expense };
  try {
    await postToApi({ action: "add", expense });
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
    await postToApi({ action: "update", expense });
    return { ok: true, data: expense };
  } catch (err) { return { ok: false, data: expense, error: err.message }; }
}

export async function deleteExpense(id) {
  localSet(localGet().filter((e) => e.id !== id));
  if (useLocal) return { ok: true };
  try {
    await postToApi({ action: "delete", id });
    return { ok: true };
  } catch (err) { return { ok: false, error: err.message }; }
}

export async function syncAll(expenses) {
  localSet(expenses);
  if (useLocal) return { ok: true };
  try {
    await postToApi({ action: "syncAll", expenses });
    return { ok: true };
  } catch (err) { return { ok: false, error: err.message }; }
}

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
        if (!Array.isArray(data)) {
          reject(new Error("Expected an array of expenses"));
          return;
        }
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
