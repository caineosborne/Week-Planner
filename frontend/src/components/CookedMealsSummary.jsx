import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export function CookedMealsSummary({ mealData }) {
    const { availableLeftovers, availablePrecooked } = mealData;
    const totalLeftovers = Object.values(availableLeftovers).reduce((sum, servings) => sum + servings, 0);
    const totalPrecooked = Object.values(availablePrecooked).reduce((sum, servings) => sum + servings, 0);
    const totalServings = totalLeftovers + totalPrecooked;

    return (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-3 shadow-md border border-green-200">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🥘</span>
                <h2 className="text-lg font-bold text-green-800">Cooked Meals Available</h2>
                <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-sm font-medium">
                    {totalServings} servings
                </span>
            </div>

            {totalServings === 0 ? (
                <div className="text-center py-3 text-green-600">
                    <span className="text-2xl block mb-1">🍽️</span>
                    <p className="text-sm">No cooked meals yet! Start cooking to see them here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {/* Leftover meals */}
                    {Object.entries(availableLeftovers).map(([mealName, servings]) => (
                        <CookedMealCard
                            key={`leftover-${mealName}`}
                            mealName={mealName}
                            servings={servings}
                            isLeftover={true}
                        />
                    ))}
                    {/* Precooked meals */}
                    {Object.entries(availablePrecooked).map(([mealName, servings]) => (
                        <CookedMealCard
                            key={`precooked-${mealName}`}
                            mealName={mealName}
                            servings={servings}
                            isLeftover={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function CookedMealCard({ mealName, servings, isLeftover }) {
    const dragId = isLeftover ? `leftover-${mealName}` : `precooked-available-${mealName}`;

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: dragId
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        touchAction: "none",
        cursor: "grab"
    };

    const cardColor = isLeftover ? "border-green-200 bg-white" : "border-blue-200 bg-blue-50";
    const textColor = isLeftover ? "text-green-800" : "text-blue-800";
    const badgeColor = isLeftover ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700";
    const hoverColor = isLeftover ? "hover:border-green-300" : "hover:border-blue-300";

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`${cardColor} rounded-lg p-3 border shadow-sm transition-all ${isDragging
                ? `${isLeftover ? 'border-green-400' : 'border-blue-400'} shadow-md scale-105`
                : `${cardColor} ${hoverColor} hover:shadow-sm`
                }`}
            title={`Drag this ${isLeftover ? 'leftover' : 'precooked'} meal to a day to eat it`}
        >
            <div className="text-center">
                <div className={`font-medium ${textColor} text-sm mb-1`}>
                    {isLeftover && '🍲 '}{mealName}
                </div>
                <span className={`${badgeColor} px-2 py-1 rounded-full text-xs font-medium`}>
                    {servings} left
                </span>
            </div>
        </div>
    );
}
