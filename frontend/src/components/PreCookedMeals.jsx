import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { EditableLabel } from "./UIComponents";

export function PreCookedMeals({ meals, onRenameMeal, onAddMeal, onRemoveMeal, onSetServings }) {
    return (
        <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-xl p-3 shadow-md border border-green-200 h-full">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🥘</span>
                    <h2 className="text-lg font-bold text-green-800">Pre-cooked Meals & Takeaways</h2>
                </div>
                <button
                    onClick={onAddMeal}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    title="Add precooked meal"
                >
                    + Add
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 min-h-[120px]">
                {meals.map((meal) => (
                    <PreCookedMealCard
                        key={meal.id}
                        meal={meal}
                        onRename={(name) => onRenameMeal(meal.id, name)}
                        onRemove={() => onRemoveMeal(meal.id)}
                        onSetServings={(servings) => onSetServings(meal.id, servings)}
                    />
                ))}

                {/* Special "Eating Out" card */}
                <EatingOutCard />

                {/* Show empty message as a card if no meals */}
                {meals.length === 0 && (
                    <div className="bg-white rounded-lg p-2 shadow-sm border border-green-200 flex flex-col items-center justify-center text-green-600">
                        <span className="text-lg mb-1">🍽️</span>
                        <p className="text-xs text-center">No precooked meals yet!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function EatingOutCard() {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: "eating-out"
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        touchAction: "none",
        cursor: "grab"
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white rounded-lg p-2 shadow-sm border transition-all ${isDragging
                ? "border-red-400 shadow-md scale-105"
                : "border-red-200 hover:border-red-300 hover:shadow-sm"
                }`}
            title="Drag to mark eating out"
        >
            <div className="flex items-center justify-center mb-1">
                <span className="text-sm">🍕</span>
            </div>

            <div className="mb-1 text-center">
                <span className="text-sm font-medium text-red-600">Eating Out</span>
            </div>

            <div className="text-xs text-red-600 font-medium text-center">
                Unlimited!
            </div>
        </div>
    );
}

function PreCookedMealCard({ meal, onRename, onRemove, onSetServings }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: meal.id
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        touchAction: "none",
        cursor: "grab"
    };

    const stopPointer = (e) => e.stopPropagation();

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white rounded-lg p-2 shadow-sm border transition-all ${isDragging
                ? "border-green-400 shadow-md scale-105"
                : "border-green-200 hover:border-green-300 hover:shadow-sm"
                }`}
            title="Drag this precooked meal to a day"
        >
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm">🥘</span>
                <button
                    onClick={onRemove}
                    onPointerDown={stopPointer}
                    className="text-gray-400 hover:text-red-500 text-xs"
                    title="Remove this meal"
                >
                    ✕
                </button>
            </div>

            <div className="mb-1">
                <EditableLabel
                    value={meal.name}
                    onChange={onRename}
                />
            </div>

            <div className="flex items-center gap-1 mb-1">
                <label className="text-xs text-gray-600">Servings:</label>
                <input
                    type="number"
                    min={0}
                    max={20}
                    value={meal.servings || 0}
                    onChange={(e) => onSetServings(e.target.value)}
                    onPointerDown={stopPointer}
                    className="w-10 rounded border border-gray-300 px-1 text-xs text-center focus:border-green-500 focus:outline-none"
                />
            </div>

            <div className="text-xs text-green-600 font-medium">
                Ready!
            </div>
        </div>
    );
}
