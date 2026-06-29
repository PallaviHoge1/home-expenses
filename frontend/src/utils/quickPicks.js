// Compute top-N quick-pick categories.
// Strategy: PINNED essentials are always present; remaining slots fill from
// the user's most-used categories (excluding the pinned ones) in the last 60 days.
// New users get a sensible default fill.

// Always shown — these are the most common daily expense categories.
const PINNED = ["Groceries", "Outside Food", "Travel", "Misc"];

// Used to fill remaining slots when no usage data is available yet.
const FILL_DEFAULTS = ["Petrol", "Utilities", "OTT & Subscriptions", "Medicine / Doc"];

const LOOKBACK_DAYS = 60;
const TOTAL_SLOTS = 6;

export function getQuickCategories(expenses) {
  const pinned = [...PINNED];
  const remainingSlots = TOTAL_SLOTS - pinned.length;

  // Count usage of non-pinned categories in the last LOOKBACK_DAYS days
  const counts = {};
  if (Array.isArray(expenses) && expenses.length > 0) {
    const cutoff = Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
    for (const e of expenses) {
      if (!e.category || pinned.includes(e.category)) continue;
      const t = new Date(e.date).getTime();
      if (!isNaN(t) && t >= cutoff) {
        counts[e.category] = (counts[e.category] || 0) + 1;
      }
    }
  }

  const byUsage = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  // Fill: usage first, then defaults
  const dynamic = [];
  for (const cat of byUsage) {
    if (dynamic.length >= remainingSlots) break;
    if (!pinned.includes(cat) && !dynamic.includes(cat)) dynamic.push(cat);
  }
  for (const cat of FILL_DEFAULTS) {
    if (dynamic.length >= remainingSlots) break;
    if (!pinned.includes(cat) && !dynamic.includes(cat)) dynamic.push(cat);
  }

  return [...pinned, ...dynamic].slice(0, TOTAL_SLOTS);
}
