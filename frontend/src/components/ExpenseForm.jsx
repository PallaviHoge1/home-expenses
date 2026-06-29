import { useState, useEffect } from "react";
import { Sheet, Input, ChipGroup } from "./ui";
import CascadingCategorySelect from "./CascadingCategorySelect";
import { SPENT_BY, PERSON_COLORS, CATEGORY_CONFIG } from "../config/categories";
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
    const changedKeys = Object.keys(patch);
    setErrors((prev) => {
      const next = { ...prev };
      changedKeys.forEach((k) => delete next[k]);
      return next;
    });
  };

  const validate = () => {
    const errs = {};
    const amt = parseFloat(form.amount);

    if (!form.amount || String(form.amount).trim() === "") errs.amount = "Amount is required";
    else if (isNaN(amt)) errs.amount = "Enter a valid number";
    else if (amt <= 0) errs.amount = "Amount must be greater than 0";
    else if (amt > 10000000) errs.amount = "Amount looks too large";

    if (!form.date) errs.date = "Date is required";
    else if (isNaN(new Date(form.date).getTime())) errs.date = "Invalid date";

    if (!form.spentBy) errs.spentBy = "Choose who spent";
    if (!form.category) errs.category = "Choose a category";

    const config = CATEGORY_CONFIG[form.category];
    if (config?.subs) {
      if (!form.subCategory) errs.subCategory = "Choose a sub-category";
      else if (!config.subs._flat && !form.subSubCategory) errs.subSubCategory = "Choose an option";
    }
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
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={editData ? "Edit Expense" : "Add Expense"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date" type="date" value={form.date}
            onChange={(v) => update({ date: v })}
            error={errors.date} max={today()}
          />
          <Input
            label="Amount" type="number" value={form.amount}
            onChange={(v) => {
              const cleaned = v.replace(/^-/, "").replace(/^0+(?=\d)/, "");
              update({ amount: cleaned });
            }}
            placeholder="0" prefix="₹" min="0" step="1"
            inputMode="numeric" error={errors.amount}
          />
        </div>

        <div>
          <ChipGroup
            label="Spent By" options={SPENT_BY} value={form.spentBy}
            onChange={(v) => update({ spentBy: v })} colorMap={PERSON_COLORS}
          />
          {errors.spentBy && <p className="text-xs text-red-500 mt-1">{errors.spentBy}</p>}
        </div>

        <CascadingCategorySelect
          category={form.category} subCategory={form.subCategory}
          subSubCategory={form.subSubCategory} mealTag={form.mealTag}
          isRefund={form.isRefund}
          onChange={(patch) => update(patch)} errors={errors}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="Optional notes..." rows={2} maxLength={500}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
          />
        </div>

        <button
          type="submit" disabled={submitting}
          className="w-full py-3 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {submitting ? "Saving..." : editData ? "Update Expense" : "Add Expense"}
        </button>
      </form>
    </Sheet>
  );
}
