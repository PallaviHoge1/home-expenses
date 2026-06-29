export const CATEGORY_CONFIG = {
  Rent: { color: "#6366f1", subs: null },
  Groceries: {
    color: "#1D9E75",
    subs: {
      "Online Order": ["Swiggy Instamart","Zepto","Blinkit","Amazon","Others"],
      Offline: ["Kirana","Supermarket","Roadside","Others"],
    },
  },
  "Outside Food": {
    color: "#D85A30",
    hasMealTag: true,
    subs: {
      Delivery: ["Zomato","Swiggy","Others"],
      "Dine-in": ["Restaurant","Café","Roadside","Others"],
      "Quick Bites": ["Chai shop","Street food","Others"],
    },
  },
  Travel: {
    color: "#378ADD",
    hasRefund: true,
    subs: { _flat: ["Cab / Auto","Train","Bus","Others"] },
  },
  Petrol: {
    color: "#BA7517",
    subs: { _flat: ["Royal Enfield","Fascino","Others"] },
  },
  Vehicle: {
    color: "#744BC8",
    subs: { _flat: ["Insurance","Service / Maintenance","Accessories","Others"] },
  },
  "OTT & Subscriptions": {
    color: "#534AB7",
    subs: { _flat: ["Netflix","Prime","Hotstar","Spotify","YouTube","Google One","Zee5","SonyLIV","Others"] },
  },
  Utilities: {
    color: "#0F6E56",
    subs: { _flat: ["EB","WiFi","Recharge","Gas / LPG","Water Can","Others"] },
  },
  Entertainment: {
    color: "#993556",
    subs: { _flat: ["Movies","Events / Shows","Others"] },
  },
  "For Home": {
    color: "#185FA5",
    subs: { _flat: ["Furniture","Appliance / Electronics","Plumber / Electrician","Repair / Service","Cleaning","Kitchen Items","Bathroom Fittings","Gardening","Others"] },
  },
  Dress: { color: "#639922", subs: { _flat: ["Vignesh","Pallavi"] } },
  Grooming: {
    color: "#D4537E",
    subs: { _flat: ["Makeup Kit","Parlour","Skin / Hair Care","Perfume","Others"] },
  },
  Fitness: {
    color: "#3B6D11",
    subs: { _flat: ["Gym / Class fees","Swimming","Sports","Personal Trainer Fee","Equipment","Supplements / Protein","Medicine Supplements","Sportswear / Shoes","Others"] },
  },
  "Medicine / Doc": {
    color: "#A32D2D",
    subs: { _flat: ["Medicine","Doctor Visit / Consultation","Lab Test / Scan","Others"] },
  },
  Trip: {
    color: "#533489",
    subs: { _flat: ["Hotel / Stay","Food","Transport","Fuel","Activities / Entry","Shopping","Documentation","Others"] },
  },
  Finance: {
    color: "#444441",
    subs: { _flat: ["Insurance","ITR","Bank Charges","Others"] },
  },
  "For Parents": {
    color: "#5F5E5A",
    subs: { _flat: ["Travel","Gift","Insurance","Others"] },
  },
  "For Social": {
    color: "#993C1D",
    subs: { _flat: ["Eating out with friends","Outing / Activity","Gift","Others"] },
  },
  Maid: { color: "#0C447C", subs: null },
  Cook: { color: "#0C447C", subs: null },
  Misc: { color: "#888780", subs: null },
};

export const CATEGORIES = Object.keys(CATEGORY_CONFIG);
export const MEAL_TAGS = ["Breakfast","Lunch","Dinner","Snacks"];
export const SPENT_BY = ["Vignesh","Pallavi"];
export const PERSON_COLORS = { Vignesh: "#378ADD", Pallavi: "#D4537E" };
export const MEAL_COLORS = {
  Breakfast: "#f59e0b", Lunch: "#10b981", Dinner: "#6366f1", Snacks: "#ec4899",
};
export const CHART_COLORS = [
  "#1D9E75","#D85A30","#378ADD","#BA7517","#744BC8","#534AB7",
  "#0F6E56","#993556","#185FA5","#639922","#D4537E","#3B6D11",
  "#A32D2D","#533489","#444441","#5F5E5A","#993C1D","#0C447C",
  "#6366f1","#888780",
];
