import { useDroppable } from "@dnd-kit/core";
import { PaletteMeal } from "./UIComponents";

export function MealPalette({ meals, remainingInHand, dropMode, setDropMode, renameMeal, setHandInitial }) {
    return (
        <div className="lg:col-span-2 space-y-3">
            <PaletteHeader />
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow">
                <div className="mb-3 flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold">Meals for the week (in hand)</h2>
                    <select
                        value={dropMode}
                        onChange={(e) => setDropMode(e.target.value)}
                        className="rounded border border-blue-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                        title="Pick what dragging into a day will create"
                    >
                        <option value="cook">Drop action: Cook</option>
                        <option value="eat">Drop action: Eat</option>
                    </select>
                </div>

                <div className="grid gap-3">
                    {Object.keys(meals).map((mealId) => (
                        <PaletteMeal
                            key={mealId}
                            id={mealId}
                            name={meals[mealId].name}
                            handInitial={meals[mealId].handInitial}
                            remaining={remainingInHand[mealId] || 0}
                            onRename={(v) => renameMeal(mealId, v)}
                            onSetInitial={(v) => setHandInitial(mealId, v)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function PaletteHeader() {
    const { setNodeRef, isOver } = useDroppable({ id: "palette-drop" });

    return (
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Drag from here into a day</h2>
            <div
                ref={setNodeRef}
                className={`rounded-md px-3 py-1 text-xs transition ${isOver
                        ? "bg-red-100 text-red-800 ring-2 ring-red-300"
                        : "border border-blue-200 bg-blue-100 text-blue-900"
                    }`}
                title="Drop a day item here to remove it from the week"
            >
                Drop here to remove from week
            </div>
        </div>
    );
}
