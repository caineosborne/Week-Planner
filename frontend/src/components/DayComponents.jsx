import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DAY_LABELS, ROW_LABELS } from "../constants/mealPlanner";

export function DayCard({ day, columns, assignments, meals, onSetLeftovers, onSetServings, onRemoveAssignment, cookedMeals, mealOverages, workStatus, onToggleWorkStatus, commuteStatus, commuteOptions, onSetCommute, peoplePresence, requiredMeals, onAdjustRequiredMeals, mealRequirements, onAdjustMealRequirements, userConfig }) {
    // Calculate total planned meals for this day
    const lunchItems = columns[`${day}:lunch`] || [];
    const dinnerItems = columns[`${day}:dinner`] || [];
    const totalPlannedMeals = lunchItems.length + dinnerItems.length;
    const required = requiredMeals[day] || 0;
    const isShortMeals = totalPlannedMeals < required;

    // Get people present for this day
    const presentPeople = peoplePresence[day] || [];
    const peopleNames = presentPeople.map(personId =>
        userConfig.people.find(p => p.id === personId)?.name || personId
    ).join(", ");

    // Get commute info for this day
    const currentCommuteId = commuteStatus[day];
    const currentCommute = commuteOptions.find(opt => opt.id === currentCommuteId);

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 shadow-md border border-blue-200 h-full">
            <div className="mb-2 text-center">
                <h2 className="text-lg font-bold text-blue-800 mb-1">{DAY_LABELS[day]}</h2>
                <button
                    onClick={() => onToggleWorkStatus(day)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${workStatus[day]
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    title="Click to toggle work/non-work day"
                >
                    {workStatus[day] ? "💼 Working" : "🏠 Off"}
                </button>

                {/* Commute Dropdown */}
                <select
                    value={currentCommuteId}
                    onChange={(e) => onSetCommute(day, e.target.value)}
                    className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors border-none focus:outline-none focus:ring-1 focus:ring-green-300"
                    title="Select commute method"
                >
                    {commuteOptions.map(option => (
                        <option key={option.id} value={option.id}>
                            {option.emoji} {option.name}
                        </option>
                    ))}
                </select>

                {/* People Info */}
                <div className="mt-2 text-xs">
                    <div className="bg-white rounded-lg p-2 border">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">People:</span>
                            <span className="text-blue-700 font-medium">{peopleNames || 'None'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {["lunch", "dinner"].map((row) => {
                    const sectionId = `${day}:${row}`;
                    const items = columns[sectionId];
                    return (
                        <DaySection
                            key={sectionId}
                            id={sectionId}
                            label={ROW_LABELS[row]}
                            items={items}
                            assignments={assignments}
                            meals={meals}
                            onSetLeftovers={onSetLeftovers}
                            onSetServings={onSetServings}
                            onRemoveAssignment={onRemoveAssignment}
                            cookedMeals={cookedMeals}
                            mealOverages={mealOverages}
                            mealRequirements={mealRequirements}
                            onAdjustMealRequirements={onAdjustMealRequirements}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function DaySection({ id, label, items, assignments, meals, onSetLeftovers, onSetServings, onRemoveAssignment, cookedMeals, mealOverages, mealRequirements, onAdjustMealRequirements }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const mealEmoji = label === "Lunch" ? "🥪" : "🍽️";

    // Get the meal requirement for this section
    const required = mealRequirements[id] || 0;

    // Calculate actual meals satisfied
    let actual = 0;
    let hasEatingOut = false;

    items.forEach(assignmentId => {
        const assignment = assignments[assignmentId];
        if (!assignment) return;

        if (assignment.isEatingOut) {
            hasEatingOut = true;
        } else if (assignment.isEatingLeftover || assignment.isEatingPrecooked) {
            // For eating meals (leftovers/precooked), count the actual servings
            actual += assignment.servings || 1;
        } else {
            // For cooking meals, assume it feeds everyone who needs to eat (the requirement)
            // Since you're cooking, it should satisfy the full meal requirement
            actual += required;
        }
    });

    // Eating out satisfies the full requirement
    if (hasEatingOut) {
        actual = required;
    }

    const isShort = actual < required;

    return (
        <div className="bg-white rounded-lg p-2 border border-dashed border-blue-300 transition-all">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Meal requirement controls - moved to left */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onAdjustMealRequirements(id, -1)}
                            className="w-4 h-4 bg-gray-200 hover:bg-gray-300 rounded text-xs flex items-center justify-center font-bold"
                        >
                            -
                        </button>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${isShort ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                            {actual}/{required}
                        </span>
                        <button
                            onClick={() => onAdjustMealRequirements(id, 1)}
                            className="w-4 h-4 bg-gray-200 hover:bg-gray-300 rounded text-xs flex items-center justify-center font-bold"
                        >
                            +
                        </button>
                    </div>
                    <span className="text-sm">{mealEmoji}</span>
                    <h3 className="text-base font-bold text-blue-700">{label}</h3>
                </div>
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs font-medium">
                    {items.length}
                </span>
            </div>

            <SortableContext items={items} strategy={rectSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className={`min-h-16 rounded-lg p-2 transition-all ${isOver
                        ? "bg-blue-100 border border-blue-400 border-dashed"
                        : "bg-gray-50 border border-gray-200 border-dashed"
                        }`}
                >
                    {items.length === 0 ? (
                        <div className="text-center py-2 text-gray-500">
                            <span className="text-lg block mb-1">🍽️</span>
                            <p className="text-xs">Drop here!</p>
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {items.map((assignmentId) => {
                                const a = assignments[assignmentId];
                                if (!a) return null;

                                const mealName = a.mealName || "Unknown Meal";
                                return (
                                    <AssignmentCard
                                        key={assignmentId}
                                        id={assignmentId}
                                        mealName={mealName}
                                        leftovers={a.leftovers}
                                        servings={a.servings}
                                        onSetLeftovers={(v) => onSetLeftovers(assignmentId, v)}
                                        onSetServings={(v) => onSetServings(assignmentId, v)}
                                        onRemove={() => onRemoveAssignment(assignmentId)}
                                        cookedMeals={cookedMeals}
                                        mealOverages={mealOverages}
                                        assignments={assignments}
                                    />
                                );
                            })}
                        </ul>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

export function AssignmentCard({ id, mealName, leftovers, servings, onSetLeftovers, onSetServings, onRemove, cookedMeals, mealOverages, assignments }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: "none",
        cursor: "grab"
    };

    const stopPointer = (e) => e.stopPropagation();

    // Check if this is eating a leftover vs cooking vs eating out vs eating precooked
    const isEatingLeftover = assignments[id]?.isEatingLeftover || false;
    const isEatingOut = assignments[id]?.isEatingOut || false;
    const isEatingPrecooked = assignments[id]?.isEatingPrecooked || false;
    const hasOverage = isEatingLeftover && mealOverages[mealName] > 0;

    return (
        <li
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`rounded-lg border-2 p-2 shadow-sm transition-all ${hasOverage
                ? "bg-red-50 border-red-400 shadow-lg"
                : isDragging
                    ? "bg-blue-100 border-blue-400 shadow-lg"
                    : "bg-white border-blue-200 hover:border-blue-300 hover:shadow-md"
                }`}
            title="Drag to reorder/move. Drop on remove zone to delete."
        >
            <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-gray-800 text-sm">{mealName}</span>
                <button
                    onClick={onRemove}
                    onPointerDown={stopPointer}
                    className="text-gray-400 hover:text-red-500 text-xs ml-1"
                    title="Remove this meal"
                >
                    ✕
                </button>
            </div>

            {isEatingOut ? (
                // Eating out - show status and serving controls
                <div className="space-y-1">
                    <div className="text-xs">
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                            🍕 Eating out
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="font-medium text-gray-600 text-xs">Servings:</label>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={servings || 1}
                            onChange={(e) => onSetServings(e.target.value)}
                            onPointerDown={stopPointer}
                            className="w-12 rounded border-2 border-gray-300 px-1 py-0.5 text-xs font-medium text-center focus:border-red-500 focus:outline-none"
                        />
                    </div>
                </div>
            ) : isEatingPrecooked ? (
                // Eating precooked - show status and serving controls
                <div className="space-y-1">
                    <div className="text-xs">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                            🥘 Precooked meal
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="font-medium text-gray-600 text-xs">Servings:</label>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={servings || 1}
                            onChange={(e) => onSetServings(e.target.value)}
                            onPointerDown={stopPointer}
                            className="w-12 rounded border-2 border-gray-300 px-1 py-0.5 text-xs font-medium text-center focus:border-purple-500 focus:outline-none"
                        />
                    </div>
                </div>
            ) : isEatingLeftover ? (
                // Eating leftover - show status and serving controls
                <div className="space-y-1">
                    <div className="text-xs">
                        <span className={`px-2 py-1 rounded-full font-medium ${hasOverage
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                            }`}>
                            {hasOverage ? "⚠️ No leftovers!" : "🍽️ Eaten leftover"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="font-medium text-gray-600 text-xs">Servings:</label>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={servings || 1}
                            onChange={(e) => onSetServings(e.target.value)}
                            onPointerDown={stopPointer}
                            className="w-12 rounded border-2 border-gray-300 px-1 py-0.5 text-xs font-medium text-center focus:border-green-500 focus:outline-none"
                        />
                    </div>
                </div>
            ) : (
                // Cooking meal - show leftover input
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <label className="font-medium text-gray-600 text-xs">Leftovers:</label>
                        <input
                            type="number"
                            min={0}
                            max={20}
                            value={leftovers || 0}
                            onChange={(e) => onSetLeftovers(e.target.value)}
                            onPointerDown={stopPointer}
                            className="w-12 rounded border-2 border-gray-300 px-1 py-0.5 text-xs font-medium text-center focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="text-xs">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            ✅ Cooked & eaten
                        </span>
                    </div>
                </div>
            )}
        </li>
    );
}
