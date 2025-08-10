import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { EditableLabel } from "./UIComponents";

export function MealsToCook({ meals, onRenameMeal, onAddMeal, onRemoveMeal }) {
    return (
        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-3 shadow-md border border-orange-200 h-full">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">👨‍🍳</span>
                        <h2 className="text-lg font-bold text-orange-800">Meals to Cook This Week</h2>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onAddMeal}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        title="Add another meal to cook"
                    >
                        + Add Meal
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 min-h-[120px]">
                {meals.map((meal) => (
                    <MealToCookCard
                        key={meal.id}
                        meal={meal}
                        onRename={(name) => onRenameMeal(meal.id, name)}
                        onRemove={() => onRemoveMeal(meal.id)}
                    />
                ))}
            </div>

            {meals.length === 0 && (
                <div className="text-center py-4 text-orange-600">
                    <span className="text-2xl block mb-1">🍽️</span>
                    <p className="text-sm">No meals planned yet!</p>
                </div>
            )}
        </div>
    );
}

function MealToCookCard({ meal, onRename, onRemove }) {
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
                ? "border-orange-400 shadow-md scale-105"
                : "border-orange-200 hover:border-orange-300 hover:shadow-sm"
                }`}
            title="Drag this meal to a day to cook it"
        >
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm">🍳</span>
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

            <div className="text-xs text-orange-600 font-medium">
                Ready!
            </div>
        </div>
    );
}
