# Home Expenses

Personal expense tracker for Vignesh & Pallavi.
Desktop-first React app, Supabase backend, deployed on Vercel.

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Recharts, lucide-react
- **Backend:** Supabase (PostgreSQL + REST API)
- **Hosting:** Vercel
- **Cost:** ₹0/month

---

## Quick Start (Local Dev)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. Works immediately with localStorage (no backend needed).

---

## Connecting to Supabase

### 1. Create a Supabase project
- Sign up at [supabase.com](https://supabase.com)
- Create a new project (pick Mumbai region)

### 2. Create the table
In **SQL Editor**, run:
```sql
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  spent_by TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT DEFAULT '',
  sub_sub_category TEXT DEFAULT '',
  meal_tag TEXT DEFAULT '',
  is_refund BOOLEAN DEFAULT FALSE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access"
  ON expenses FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 3. Get credentials
In **Settings → API**, copy:
- Project URL → looks like `https://xxxxx.supabase.co`
- Anon public key

### 4. Configure frontend
Create `frontend/.env`:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Restart `npm run dev`.

---

## Deploying to Vercel

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import the repo
3. Set Root Directory to `frontend`
4. Framework Preset: **Vite**
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy

---

## Project Structure

```
home-expenses/
├── frontend/
│   ├── src/
│   │   ├── config/categories.js    ← all 20 categories
│   │   ├── components/
│   │   │   ├── ui/                 ← 10 reusable primitives
│   │   │   └── ExpenseForm.jsx     ← desktop grid form
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       ← stats + charts + top 5
│   │   │   ├── ExpenseList.jsx     ← table view
│   │   │   └── Trends.jsx          ← 6-month trends
│   │   ├── utils/
│   │   │   ├── api.js              ← Supabase REST + localStorage fallback
│   │   │   └── helpers.js          ← date, currency formatters
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## Features

**Dashboard**
- Month picker
- Stat cards: Total, Per-person split, Refunds
- Category pie chart with breakdown list
- Daily spending bar chart
- Top 5 expenses table
- Month-over-month change indicator

**Expenses**
- Sortable table with all entries
- Filter by category, person, search
- Inline edit/delete actions

**Trends**
- 6-month total bar chart
- Per-person comparison
- Per-category line chart

**Form**
- Wide modal, fields laid out in rows
- Date, Amount, Person on top row
- Category cascade auto-expands columns
- Notes + tags side by side
- Field-level validation errors
- Auto-focus on Amount when adding new

**Other**
- Toast notifications (success / error / undo)
- 5-second undo window for deletes
- Optimistic UI with local fallback
- Export/Import JSON
- Tab persistence across reloads
- 20 categories with cascading sub/sub-sub
- Meal tags for Outside Food
- Refund toggle for Travel

---

## Adding Categories

Edit `frontend/src/config/categories.js`:

```js
// Flat (no sub-categories):
"Flat Category": { color: "#hex", subs: null }

// One level:
"Simple": {
  color: "#hex",
  subs: { _flat: ["Option 1", "Option 2"] },
}

// Two levels:
"Deep": {
  color: "#hex",
  subs: {
    "Group A": ["Item 1", "Item 2"],
    "Group B": ["Item 3"],
  },
}

// Optional:
hasMealTag: true   // shows Breakfast/Lunch/Dinner/Snacks
hasRefund: true    // shows refund checkbox
```

Form auto-adapts. No other file needs changes.
