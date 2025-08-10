import { DAYS } from "../constants/mealPlanner";
import { DayCard } from "./DayComponents";

export function WeeklySchedule({ columns, assignments, meals, onSetLeftovers, onSetServings, onRemoveAssignment, cookedMeals, mealOverages, workStatus, onToggleWorkStatus, commuteStatus, commuteOptions, onSetCommute, peoplePresence, requiredMeals, onAdjustRequiredMeals, mealRequirements, onAdjustMealRequirements, userConfig }) {
    return (
        <div className="space-y-2">
            <div className="grid gap-3 grid-cols-7">
                {DAYS.map((day) => (
                    <DayCard
                        key={day}
                        day={day}
                        columns={columns}
                        assignments={assignments}
                        meals={meals}
                        onSetLeftovers={onSetLeftovers}
                        onSetServings={onSetServings}
                        onRemoveAssignment={onRemoveAssignment}
                        cookedMeals={cookedMeals}
                        mealOverages={mealOverages}
                        workStatus={workStatus}
                        onToggleWorkStatus={onToggleWorkStatus}
                        commuteStatus={commuteStatus}
                        commuteOptions={commuteOptions}
                        onSetCommute={onSetCommute}
                        peoplePresence={peoplePresence}
                        requiredMeals={requiredMeals}
                        onAdjustRequiredMeals={onAdjustRequiredMeals}
                        mealRequirements={mealRequirements}
                        onAdjustMealRequirements={onAdjustMealRequirements}
                        userConfig={userConfig}
                    />
                ))}
            </div>
        </div>
    );
}