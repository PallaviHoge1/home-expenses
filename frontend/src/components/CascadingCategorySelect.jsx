import { Select, ChipGroup } from "./ui";
import { CATEGORY_CONFIG, CATEGORIES, MEAL_TAGS, MEAL_COLORS } from "../config/categories";

export default function CascadingCategorySelect({
  category, subCategory, subSubCategory, mealTag, isRefund, onChange, errors = {},
}) {
  const config = CATEGORY_CONFIG[category];

  const handleCategoryChange = (val) => {
    onChange({
      category: val, subCategory: "", subSubCategory: "",
      mealTag: "", isRefund: false,
    });
  };

  const subOptions = (() => {
    if (!config?.subs) return [];
    if (config.subs._flat) return config.subs._flat;
    return Object.keys(config.subs);
  })();

  const subSubOptions = (() => {
    if (!config?.subs || config.subs._flat) return [];
    return config.subs[subCategory] || [];
  })();

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Select
          label="Category" value={category} onChange={handleCategoryChange}
          options={CATEGORIES} placeholder="Choose category..."
        />
        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
      </div>

      {subOptions.length > 0 && (
        <div>
          <Select
            label="Sub Category" value={subCategory}
            onChange={(val) => onChange({ subCategory: val, subSubCategory: "" })}
            options={subOptions} placeholder="Choose sub-category..."
          />
          {errors.subCategory && <p className="text-xs text-red-500 mt-1">{errors.subCategory}</p>}
        </div>
      )}

      {subSubOptions.length > 0 && (
        <div>
          <Select
            label="Sub Sub Category" value={subSubCategory}
            onChange={(val) => onChange({ subSubCategory: val })}
            options={subSubOptions} placeholder="Choose..."
          />
          {errors.subSubCategory && <p className="text-xs text-red-500 mt-1">{errors.subSubCategory}</p>}
        </div>
      )}

      {config?.hasMealTag && (
        <ChipGroup
          label="Meal" options={MEAL_TAGS} value={mealTag}
          onChange={(val) => onChange({ mealTag: val })} colorMap={MEAL_COLORS}
        />
      )}

      {config?.hasRefund && (
        <label className="flex items-center gap-2 mt-1 cursor-pointer select-none">
          <input
            type="checkbox" checked={isRefund}
            onChange={(e) => onChange({ isRefund: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-400"
          />
          <span className="text-sm text-gray-600">This is a refund</span>
        </label>
      )}
    </div>
  );
}
