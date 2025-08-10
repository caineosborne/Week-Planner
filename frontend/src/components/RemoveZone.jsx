import { useDroppable } from "@dnd-kit/core";

export function RemoveZone() {
    const { setNodeRef, isOver } = useDroppable({ id: "remove-zone" });

    return (
        <div
            ref={setNodeRef}
            className={`fixed bottom-4 right-4 z-50 rounded-xl p-3 transition-all ${isOver
                    ? "bg-red-500 text-white shadow-xl scale-110"
                    : "bg-red-100 text-red-700 shadow-lg hover:bg-red-200"
                }`}
            title="Drop assignments here to remove them"
        >
            <div className="flex items-center gap-2">
                <span className="text-xl">🗑️</span>
                <span className="font-bold text-sm">
                    {isOver ? "Drop!" : "Remove"}
                </span>
            </div>
        </div>
    );
}
