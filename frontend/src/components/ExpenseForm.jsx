import { useState, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Sheet, Input, ChipGroup } from "./ui";
import {
  SPENT_BY, PERSON_COLORS, CATEGORY_CONFIG, CATEGORIES, MEAL_TAGS, MEAL_COLORS,
} from "../config/categories";
import { genId, today } from "../utils/helpers";
import { getQuickCategories } from "../utils/quickPicks";

const buildEmptyForm = () => ({
  date: today(), amount: "", spentBy: "", category: "",
  subCategory: "", subSubCategory: "", mealTag: "",
  isRefund: false, notes: "",
});

export default function ExpenseForm({ open, onClose, onSave, editData, expenses = [] }) {
  const [form, setForm] = useState(buildEmptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Quick-pick categories (pinned essentials + dynamic top usage)
  const quickCategories = useMemo(() => getQuickCategories(expenses), [expenses]);

  // List for the "More..." dropdown — categories NOT in quick picks
  const otherCategories = useMemo(
    () => CATEGORIES.filter((c) => !quickCategories.includes(c)),
    [quickCategories]
  );

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitting(false);
    if (editData) {
      setForm({
        ...buildEmptyForm(), ...editData,
        amount: String(Math.abs(editData.amount || 0)),
      });
    } else {
      setForm(buildEmptyForm());
    }
  }, [editData, open]);

  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((k) => delete next[k]);
      return next;
    });
  };

  const config = CATEGORY_CONFIG[form.category];
  const categoryColor = config?.color || "#4f46e5";

  const subOptions = (() => {
    if (!config?.subs) return [];
    if (config.subs._flat) return config.subs._flat;
    return Object.keys(config.subs);
  })();

  const subSubOptions = (() => {
    if (!config?.subs || config.subs._flat) return [];
    return config.subs[form.subCategory] || [];
  })();

  const onCategoryChange = (val) => {
    update({
      category: val, subCategory: "", subSubCategory: "",
      mealTag: "", isRefund: false,
    });
  };

  const validate = () => {
    const errs = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || String(form.amount).trim() === "") errs.amount = "Required";
    else if (isNaN(amt)) errs.amount = "Invalid";
    else if (amt <= 0) errs.amount = "Must be > 0";
    else if (amt > 10000000) errs.amount = "Too large";
    if (!form.date) errs.date = "Required";
    if (!form.spentBy) errs.spentBy = "Required";
    if (!form.category) errs.category = "Required";
    if (config?.subs && !form.subCategory) errs.subCategory = "Required";
    if (config?.subs && !config.subs._flat && form.subCategory && !form.subSubCategory)
      errs.subSubCategory = "Required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const amount = Math.abs(parseFloat(form.amount));
    setSubmitting(true);
    try {
      await onSave({
        ...form,
        notes: (form.notes || "").trim(),
        id: editData?.id || genId(),
        amount: form.isRefund ? -amount : amount,
      });
      setForm(buildEmptyForm());
      onClose();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  // Dropdown shows current category only if it's NOT a quick pick
  const dropdownValue = quickCategories.includes(form.category) ? "" : form.category;
  const dropdownColor = dropdownValue ? CATEGORY_CONFIG[dropdownValue]?.color : null;

  return (
    <Sheet open={open} onClose={onClose} title={editData ? "Edit Expense" : "Add Expense"} wide>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Row 1: Date | Amount | Spent By */}
        <div className="grid grid-cols-1 sm:grid-cols-[160px_160px_1fr] gap-4 items-start">
          <Input
            label="Date" type="date" value={form.date}
            onChange={(v) => update({ date: v })}
            error={errors.date} max={today()}
          />
          <Input
            label="Amount (₹)" type="number" value={form.amount}
            onChange={(v) => {
              const cleaned = v.replace(/^-/, "").replace(/^0+(?=\d)/, "");
              update({ amount: cleaned });
            }}
            placeholder="0" prefix="₹" min="0" step="1"
            inputMode="numeric" error={errors.amount}
            autoFocus={!editData}
          />
          <div>
            <ChipGroup
              label="Spent By" options={SPENT_BY} value={form.spentBy}
              onChange={(v) => update({ spentBy: v })} colorMap={PERSON_COLORS}
            />
            {errors.spentBy && <p className="text-xs text-red-500 mt-1">{errors.spentBy}</p>}
          </div>
        </div>

        {/* Category — Quick chips + dropdown for the rest */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">
            Category
          </label>
          <div className="flex flex-wrap gap-1.5 items-center">
            {quickCategories.map((cat) => {
              const selected = form.category === cat;
              const col = CATEGORY_CONFIG[cat]?.color || "#4f46e5";
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(selected ? "" : cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selected
                      ? "text-white shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                  style={selected ? { backgroundColor: col, borderColor: col } : {}}
                >
                  {cat}
                </button>
              );
            })}

            {/* Dropdown for the remaining categories — fix #2 (no duplicate option), fix #3 (visible chevron) */}
            <div className="relative w-[200px]">
              <select
                value={dropdownValue}
                onChange={(e) => e.target.value && onCategoryChange(e.target.value)}
                className={`w-full pl-3 pr-8 py-1.5 rounded-full border text-xs font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all ${
                  dropdownValue
                    ? "text-white border-transparent shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
                style={dropdownColor ? { backgroundColor: dropdownColor } : {}}
              >
                <option value="" disabled hidden>More categories...</option>
                {otherCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  dropdownValue ? "text-white" : "text-gray-400"
                }`}
              />
            </div>
          </div>
          {errors.category && <p className="text-xs text-red-500 mt-1.5">{errors.category}</p>}
        </div>

        {/* Sub Category — chips (fix #4: removed dead ternary label) */}
        {subOptions.length > 0 && (
          <div>
            <ChipGroup
              label="Sub Category"
              options={subOptions}
              value={form.subCategory}
              onChange={(val) => update({ subCategory: val, subSubCategory: "" })}
              accentColor={categoryColor}
            />
            {errors.subCategory && <p className="text-xs text-red-500 mt-1">{errors.subCategory}</p>}
          </div>
        )}

        {/* Source / Type — chips */}
        {subSubOptions.length > 0 && (
          <div>
            <ChipGroup
              label="Source / Type"
              options={subSubOptions}
              value={form.subSubCategory}
              onChange={(val) => update({ subSubCategory: val })}
              accentColor={categoryColor}
            />
            {errors.subSubCategory && <p className="text-xs text-red-500 mt-1">{errors.subSubCategory}</p>}
          </div>
        )}

        {/* Row: Meal/Refund | Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col gap-3">
            {config?.hasMealTag && (
              <ChipGroup
                label="Meal" options={MEAL_TAGS} value={form.mealTag}
                onChange={(val) => update({ mealTag: val })} colorMap={MEAL_COLORS}
              />
            )}
            {config?.hasRefund && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox" checked={form.isRefund}
                  onChange={(e) => update({ isRefund: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-400"
                />
                <span className="text-sm text-gray-600">This is a refund</span>
              </label>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Optional notes..."
              rows={2} maxLength={500}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {submitting ? "Saving..." : editData ? "Update" : "Add Expense"}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
