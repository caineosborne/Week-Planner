/** ---- Constants ---- */
export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_LABELS = {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
};
export const ROWS = ["lunch", "dinner"];
export const ROW_LABELS = { lunch: "Lunch", dinner: "Dinner" };
export const SECTIONS = DAYS.flatMap((d) => ROWS.map((r) => `${d}:${r}`)); // e.g. "mon:lunch"

/** ---- Initial State ---- */
export const INITIAL_MEALS_TO_COOK = [
    { id: "meal-1", name: "Pasta Bolognese" },
    { id: "meal-2", name: "Chicken Stir Fry" },
    { id: "meal-3", name: "Vegetable Curry" },
    { id: "meal-4", name: "Chinese Intestine & Chips & Chips" },
];

export const INITIAL_COOKED_MEALS = {};

// section -> [assignmentIds]
export const INITIAL_COLUMNS = Object.fromEntries(SECTIONS.map((s) => [s, []]));
