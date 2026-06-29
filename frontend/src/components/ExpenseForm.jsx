import { useState, useEffect } from "react";
import { Sheet, Input, Select, ChipGroup } from "./ui";
import { SPENT_BY, PERSON_COLORS, CATEGORY_CONFIG, CATEGORIES, MEAL_TAGS, MEAL_COLORS } from "../config/categories";
import { genId, today } from "../utils/helpers";

const buildEmptyForm = () => ({
  date: today(), amount: "", spentBy: "", category: "",
  subCategory: "", subSubCategory: "", mealTag: "",
  isRefund: false, notes: "",
});

export default function ExpenseForm({ open, onClose, onSave, editData }) {
  const [form, setForm] = useState(buildEmptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitting(false);
    if (editData) {
      setForm({ ...buildEmptyForm(), ...editData, amount: String(Math.abs(editData.amount || 0)) });
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

  const subOptions = (() => {
    if (!config?.subs) return [];
    if (config.subs._flat) return config.subs._flat;
    return Object.keys(config.subs);
  })();

  const subSubOptions = (() => {
    if (!config?.subs || config.subs._flat) return [];
    return config.subs[form.subCategory] || [];
  })();

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

  return (
    <Sheet open={open} onClose={onClose} title={editData ? "Edit Expense" : "Add Expense"} wide>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Row 1: Date, Amount, Spent By */}
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

        {/* Row 2: Category cascade */}
        <div className={`grid gap-4 items-start ${
          subSubOptions.length > 0
            ? "grid-cols-1 sm:grid-cols-3"
            : subOptions.length > 0
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1"
        }`}>
          <div>
            <Select
              label="Category" value={form.category}
              onChange={(val) => update({
                category: val, subCategory: "", subSubCategory: "",
                mealTag: "", isRefund: false,
              })}
              options={CATEGORIES} placeholder="Choose category..."
            />
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          {subOptions.length > 0 && (
            <div>
              <Select
                label="Sub Category" value={form.subCategory}
                onChange={(val) => update({ subCategory: val, subSubCategory: "" })}
                options={subOptions} placeholder="Choose..."
              />
              {errors.subCategory && <p className="text-xs text-red-500 mt-1">{errors.subCategory}</p>}
            </div>
          )}

          {subSubOptions.length > 0 && (
            <div>
              <Select
                label="Source / Type" value={form.subSubCategory}
                onChange={(val) => update({ subSubCategory: val })}
                options={subSubOptions} placeholder="Choose..."
              />
              {errors.subSubCategory && <p className="text-xs text-red-500 mt-1">{errors.subSubCategory}</p>}
            </div>
          )}
        </div>

        {/* Row 3: Tags + Notes */}
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
