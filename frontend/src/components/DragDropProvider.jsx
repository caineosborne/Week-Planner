import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from "@dnd-kit/core";
import { GhostCard } from "./UIComponents";
import { useState } from "react";

export function DragDropProvider({ children, onDragStart, onDragEnd, meals, precookedMeals, assignments, active }) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            {children}

            {/* Overlay for smooth cross-column travel */}
            <DragOverlay>
                {active ? (
                    active.type === "meal-to-cook" ? (
                        <GhostCard label={meals.find(m => m.id === active.id)?.name || "Meal"} />
                    ) : active.type === "precooked-meal" ? (
                        <GhostCard label={precookedMeals.find(m => m.id === active.id)?.name || "Precooked Meal"} />
                    ) : active.type === "leftover" ? (
                        <GhostCard label={`${active.mealName} (leftover)`} />
                    ) : active.type === "eating-out" ? (
                        <GhostCard label="Eating Out" />
                    ) : (
                        <GhostCard
                            label={assignments[active.id]?.mealName || "Meal"}
                        />
                    )
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}