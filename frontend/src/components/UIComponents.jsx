import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

export function EditableLabel({ value, onChange }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    if (draft !== value && !editing) setDraft(value);

    const stopPointer = (e) => e.stopPropagation();

    if (!editing) {
        return (
            <button
                type="button"
                className="text-left font-medium hover:underline"
                onClick={(e) => {
                    e.stopPropagation();
                    setEditing(true);
                }}
            >
                {value}
            </button>
        );
    }

    return (
        <input
            autoFocus
            className="w-full max-w-[220px] rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onPointerDown={stopPointer}
            onBlur={() => {
                onChange?.(draft.trim());
                setEditing(false);
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    onChange?.(draft.trim());
                    setEditing(false);
                } else if (e.key === "Escape") {
                    setEditing(false);
                    setDraft(value);
                }
            }}
        />
    );
}

export function GhostCard({ label }) {
    return (
        <div className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm shadow">
            <span className="font-medium">{label}</span>
        </div>
    );
}

export function PaletteMeal({ id, name, handInitial, remaining, onRename, onSetInitial }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = {
        transform: CSS.Translate.toString(transform),
        touchAction: "none",
        cursor: "grab"
    };

    // stop inputs/label from grabbing pointer
    const stopPointer = (e) => e.stopPropagation();

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`rounded-xl border px-3 py-3 shadow-sm bg-white transition ${isDragging ? "ring-2 ring-blue-300" : "hover:shadow"
                }`}
            title="Drag into a day to add (mode set by Drop action)"
        >
            <div className="mb-2 flex items-center justify-between gap-2">
                <EditableLabel value={name} onChange={onRename} />
                <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 select-none">
                    Drag
                </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-gray-600">In hand (planned)</label>
                    <input
                        type="number"
                        min={0}
                        value={handInitial}
                        onChange={(e) => onSetInitial(e.target.value)}
                        onPointerDown={stopPointer}
                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-600">Remaining</label>
                    <div className="mt-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm">
                        {remaining}
                    </div>
                </div>
            </div>
        </div>
    );
}
