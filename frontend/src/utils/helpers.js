// ─────────────────────────────────────────────
// HELPER UTILITIES
// ─────────────────────────────────────────────

export const genId = () =>
  "exp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

// FIX #1: Use local date components, not UTC.
// Previous bug: toISOString() returns UTC → wrong date for IST users at night.
export const today = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const parseLocalDate = (s) => {
  if (typeof s !== "string") return new Date(s);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return new Date(s);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

export const getMonthKey = (d) => {
  const dt = parseLocalDate(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
};

export const getMonthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1).toLocaleDateString("en-IN", {
    month: "long", year: "numeric",
  });
};

export const getMonthShortLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1).toLocaleDateString("en-IN", { month: "short" });
};

export const getCurrentMonthKey = () => getMonthKey(today());

export const getLast6Months = () => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
};

export const shiftMonth = (monthKey, dir) => {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(y, m - 1 + dir, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const isCurrentMonth = (monthKey) => monthKey === getCurrentMonthKey();
