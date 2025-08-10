import { useRef, useState, useEffect } from "react";

// Import constants
import {
  INITIAL_MEALS_TO_COOK,
  INITIAL_COOKED_MEALS,
  INITIAL_COLUMNS,
  SECTIONS,
  DAYS
} from "./constants/mealPlanner";
import { USER_CONFIG } from "./constants/userConfig";

// Import components
import { DragDropProvider } from "./components/DragDropProvider";
import { MealsToCook } from "./components/MealsToCook";
import { PreCookedMeals } from "./components/PreCookedMeals";
import { WeeklySchedule } from "./components/WeeklySchedule";
import { CookedMealsSummary } from "./components/CookedMealsSummary";
import { RemoveZone } from "./components/RemoveZone";
// import { RemoveZone } from "./components/RemoveZone";

// Import helpers
import {
  isSectionId,
  findSectionOfAssignment,
  calculateCookedMeals,
  generateId
} from "./utils/MealPlannerHelpers";

/**
 * Main Application Component
 * 
 * The meal planner app allows users to:
 * 1. Define meals for the week 
 * 2. Drag meals into days with cook/eat actions
 * 3. Track leftovers and meal consumption
 * 
 * @returns {JSX.Element} The main application component
 */
export default function App() {
  // Core state for the application
  const [mealsToCook, setMealsToCook] = useState(INITIAL_MEALS_TO_COOK);
  const [precookedMeals, setPrecookedMeals] = useState([]);
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [assignments, setAssignments] = useState({});
  const [active, setActive] = useState(null); // {type:'meal-to-cook'|'assignment', id:string}
  const [workStatus, setWorkStatus] = useState(USER_CONFIG.defaultWorkStatus);
  const [peoplePresence, setPeoplePresence] = useState(USER_CONFIG.defaultPresence);
  const [commuteStatus, setCommuteStatus] = useState(USER_CONFIG.defaultCommute);
  const [commuteOptions, setCommuteOptions] = useState(USER_CONFIG.commuteOptions);
  const [showPeopleEditor, setShowPeopleEditor] = useState(false);
  const [editablePeople, setEditablePeople] = useState(USER_CONFIG.people);
  const [requiredMeals, setRequiredMeals] = useState({
    mon: 1, tue: 1, wed: 1, thu: 2, fri: 2, sat: 1, sun: 1
  });
  const [mealRequirements, setMealRequirements] = useState(() => {
    // Initialize meal requirements based on people presence
    const requirements = {};
    DAYS.forEach(day => {
      const peopleCount = USER_CONFIG.defaultPresence[day].length;
      requirements[`${day}:lunch`] = peopleCount;
      requirements[`${day}:dinner`] = peopleCount;
    });
    return requirements;
  });
  const idSeed = useRef(1);

  // Auto-update meal requirements when people presence changes
  useEffect(() => {
    setMealRequirements(prev => {
      const updated = { ...prev };
      DAYS.forEach(day => {
        const peopleCount = peoplePresence[day]?.length || 0;
        updated[`${day}:lunch`] = peopleCount;
        updated[`${day}:dinner`] = peopleCount;
      });
      return updated;
    });
  }, [peoplePresence]);

  // Calculate cooked meals available for eating
  const mealData = calculateCookedMeals(assignments, precookedMeals);
  const cookedMeals = mealData.available;
  const mealOverages = mealData.overages;

  /**
   * Drag and Drop Handlers
   */

  /**
   * Handle drag start events
   * @param {Object} params - Drag start event parameters
   * @param {Object} params.active - Active drag element
   */
  function handleDragStart({ active }) {
    const id = active.id;
    const isMealToCook = mealsToCook.some(meal => meal.id === id);
    const isPrecookedMeal = precookedMeals.some(meal => meal.id === id);
    const isLeftover = id.startsWith('leftover-');
    const isEatingOut = id === 'eating-out';

    if (isMealToCook) {
      setActive({ type: "meal-to-cook", id });
    } else if (isPrecookedMeal) {
      setActive({ type: "precooked-meal", id });
    } else if (isLeftover) {
      setActive({ type: "leftover", id, mealName: id.replace('leftover-', '') });
    } else if (isEatingOut) {
      setActive({ type: "eating-out", id });
    } else {
      setActive({ type: "assignment", id });
    }
  }

  /**
   * Handle drag end events
   * @param {Object} params - Drag end event parameters
   * @param {Object} params.active - Active drag element
   * @param {Object} params.over - Element being dragged over
   */
  function handleDragEnd({ active: a, over }) {
    setActive(null);
    if (!over) return;
    const overId = over.id;

    // Create new assignment when dragging from meals to cook to a day section
    const mealToCook = mealsToCook.find(meal => meal.id === a.id);
    if (mealToCook) {
      if (isSectionId(overId)) {
        const newId = generateId("asgn", idSeed);

        // Create assignment - meal is cooked and eaten, leftovers default to 0
        setAssignments((prev) => ({
          ...prev,
          [newId]: {
            mealName: mealToCook.name,
            leftovers: 0
          },
        }));
        setColumns((prev) => ({ ...prev, [overId]: [newId, ...prev[overId]] }));

        // Remove meal from "to cook" list since it's now planned
        setMealsToCook(prev => prev.filter(meal => meal.id !== a.id));
      }
      return;
    }

    // Create new assignment when dragging from precooked meals to a day section
    const precookedMeal = precookedMeals.find(meal => meal.id === a.id);
    if (precookedMeal) {
      if (isSectionId(overId)) {
        const newId = generateId("asgn", idSeed);

        // Create assignment - eating precooked meal
        setAssignments((prev) => ({
          ...prev,
          [newId]: {
            mealName: precookedMeal.name,
            leftovers: 0,
            isEatingPrecooked: true,
            servings: 1 // Default to 1 serving
          },
        }));
        setColumns((prev) => ({ ...prev, [overId]: [newId, ...prev[overId]] }));

        // Note: Consumption is now tracked via calculateCookedMeals based on servings
      }
      return;
    }
    if (a.id.startsWith('leftover-')) {
      if (isSectionId(overId)) {
        const mealName = a.id.replace('leftover-', '');
        const newId = generateId("asgn", idSeed);

        // Create assignment - eating leftover meal (from cooking)
        setAssignments((prev) => ({
          ...prev,
          [newId]: {
            mealName: mealName,
            leftovers: 0,
            isEatingLeftover: true, // Mark this as eating leftover from cooking
            servings: 1 // Default to 1 serving
          },
        }));
        setColumns((prev) => ({ ...prev, [overId]: [newId, ...prev[overId]] }));

        // Note: We don't modify the original assignment's leftover count
        // The calculateCookedMeals function tracks consumption via isEatingLeftover assignments
      }
      return;
    }

    // Handle dragging precooked meals from "Cooked Meals Available" section
    if (a.id.startsWith('precooked-available-')) {
      if (isSectionId(overId)) {
        const mealName = a.id.replace('precooked-available-', '');
        const newId = generateId("asgn", idSeed);

        // Create assignment - eating precooked meal from available
        setAssignments((prev) => ({
          ...prev,
          [newId]: {
            mealName: mealName,
            leftovers: 0,
            isEatingPrecooked: true,
            servings: 1 // Default to 1 serving
          },
        }));
        setColumns((prev) => ({ ...prev, [overId]: [newId, ...prev[overId]] }));

        // Note: Consumption is now tracked via calculateCookedMeals based on servings
      }
      return;
    }

    // Create new assignment when dragging eating out to a day section
    if (a.id === 'eating-out') {
      if (isSectionId(overId)) {
        const newId = generateId("asgn", idSeed);

        // Create assignment - eating out
        setAssignments((prev) => ({
          ...prev,
          [newId]: {
            mealName: "Eating Out",
            leftovers: 0,
            isEatingOut: true,
            servings: 1 // Default to 1 serving
          },
        }));
        setColumns((prev) => ({ ...prev, [overId]: [newId, ...prev[overId]] }));
      }
      return;
    }
    const from = findSectionOfAssignment(a.id, columns);
    if (!from) return;

    // Handle dragging back to meals to cook section (remove assignment)
    if (overId === "meals-to-cook-section") {
      const assignment = assignments[a.id];

      if (assignment && !assignment.isEatingOut && !assignment.isEatingLeftover && !assignment.isEatingPrecooked) {
        // Only add back to meals to cook if it was originally a cooked meal
        const newMealId = generateId("meal", idSeed);
        setMealsToCook(prev => [...prev, { id: newMealId, name: assignment.mealName }]);
      }

      setColumns((prev) => ({ ...prev, [from]: prev[from].filter((x) => x !== a.id) }));
      setAssignments((prev) => {
        const cp = { ...prev };
        delete cp[a.id];
        return cp;
      });
      return;
    }

    // Delete assignment when dropped on the remove zone
    if (overId === "remove-zone") {
      const assignment = assignments[a.id];

      // Add the meal back to "to cook" list
      if (assignment) {
        const newMealId = generateId("meal", idSeed);
        setMealsToCook(prev => [...prev, { id: newMealId, name: assignment.mealName }]);
      }

      setColumns((prev) => ({ ...prev, [from]: prev[from].filter((x) => x !== a.id) }));
      setAssignments((prev) => {
        const cp = { ...prev };
        delete cp[a.id];
        return cp;
      });
      return;
    }

    // Move assignment between sections or reorder within a section
    const to = isSectionId(overId) ? overId : findSectionOfAssignment(overId, columns) || from;
    if (!to) return;

    setColumns((prev) => {
      const src = [...prev[from]];
      const i = src.indexOf(a.id);
      if (i >= 0) src.splice(i, 1);

      const dst = [...prev[to]];
      const overIndex = dst.indexOf(overId);
      if (overIndex >= 0 && !isSectionId(overId)) {
        dst.splice(overIndex, 0, a.id);
      } else {
        dst.unshift(a.id);
      }
      return { ...prev, [from]: src, [to]: dst };
    });
  }

  /**
   * State mutation functions
   */

  /**
   * Add a new meal to cook
   */
  const addMeal = () => {
    const newMeal = {
      id: generateId("meal", idSeed),
      name: `Meal ${mealsToCook.length + 1}`
    };
    setMealsToCook(prev => [...prev, newMeal]);
  };

  /**
   * Rename a meal to cook
   * @param {string} mealId - ID of the meal to rename
   * @param {string} name - New name for the meal
   */
  const renameMeal = (mealId, name) => {
    setMealsToCook(prev =>
      prev.map(meal =>
        meal.id === mealId ? { ...meal, name: name || meal.name } : meal
      )
    );
  };

  /**
   * Add a new precooked meal
   */
  const addPrecookedMeal = () => {
    const newMeal = {
      id: generateId("precooked", idSeed),
      name: `Precooked Meal ${precookedMeals.length + 1}`,
      servings: 1 // Default to 3 servings
    };
    setPrecookedMeals(prev => [...prev, newMeal]);
  };

  /**
   * Rename a precooked meal
   * @param {string} mealId - ID of the meal to rename
   * @param {string} name - New name for the meal
   */
  const renamePrecookedMeal = (mealId, name) => {
    setPrecookedMeals(prev =>
      prev.map(meal =>
        meal.id === mealId ? { ...meal, name: name || meal.name } : meal
      )
    );
  };

  /**
   * Set servings for a precooked meal
   * @param {string} mealId - ID of the meal
   * @param {number} servings - Number of servings
   */
  const setPrecookedServings = (mealId, servings) => {
    setPrecookedMeals(prev =>
      prev.map(meal =>
        meal.id === mealId ? { ...meal, servings: Math.max(0, Number(servings) || 0) } : meal
      )
    );
  };

  /**
   * Remove a precooked meal
   * @param {string} mealId - ID of the meal to remove
   */
  const removePrecookedMeal = (mealId) => {
    setPrecookedMeals(prev => prev.filter(meal => meal.id !== mealId));
  };

  /**
   * Remove a meal from the to cook list
   * @param {string} mealId - ID of the meal to remove
   */
  const removeMeal = (mealId) => {
    setMealsToCook(prev => prev.filter(meal => meal.id !== mealId));
  };

  /**
   * Remove an assignment from the schedule
   * @param {string} assignmentId - ID of the assignment to remove
   */
  const removeAssignment = (assignmentId) => {
    const assignment = assignments[assignmentId];
    if (!assignment) return;

    // Find which section contains this assignment
    const sectionId = findSectionOfAssignment(assignmentId, columns);
    if (!sectionId) return;

    // Remove from the column
    setColumns((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId].filter((id) => id !== assignmentId)
    }));

    // Remove from assignments
    setAssignments((prev) => {
      const cp = { ...prev };
      delete cp[assignmentId];
      return cp;
    });
  };

  /**
   * Set the number of leftovers for an assignment
   * @param {string} assignmentId - ID of the assignment
   * @param {number|string} leftovers - Number of leftover servings
   */
  const setLeftovers = (assignmentId, leftovers) =>
    setAssignments((a) => ({
      ...a,
      [assignmentId]: { ...a[assignmentId], leftovers: Math.max(0, Number(leftovers) || 0) },
    }));

  const setServings = (assignmentId, servings) =>
    setAssignments((a) => ({
      ...a,
      [assignmentId]: { ...a[assignmentId], servings: Math.max(1, Number(servings) || 1) },
    }));

  /**
   * Toggle work status for a day
   * @param {string} day - Day to toggle
   */
  const toggleWorkStatus = (day) => {
    setWorkStatus(prev => ({ ...prev, [day]: !prev[day] }));
  };

  /**
   * Set commute for a day
   * @param {string} day - Day to set commute for
   * @param {string} commuteId - ID of the commute option
   */
  const setCommute = (day, commuteId) => {
    setCommuteStatus(prev => ({ ...prev, [day]: commuteId }));
  };

  /**
   * Add a new commute option
   */
  const addCommuteOption = () => {
    const newId = `commute-${Date.now()}`;
    const newOption = {
      id: newId,
      name: `Option ${commuteOptions.length + 1}`,
      emoji: "🚀"
    };
    setCommuteOptions(prev => [...prev, newOption]);
  };

  /**
   * Update commute option
   * @param {string} optionId - ID of the option to update
   * @param {Object} updates - Updates to apply
   */
  const updateCommuteOption = (optionId, updates) => {
    setCommuteOptions(prev =>
      prev.map(option =>
        option.id === optionId ? { ...option, ...updates } : option
      )
    );
  };

  /**
   * Remove commute option
   * @param {string} optionId - ID of the option to remove
   */
  const removeCommuteOption = (optionId) => {
    setCommuteOptions(prev => prev.filter(option => option.id !== optionId));

    // Reset any days using this commute to the first available option
    const firstOption = commuteOptions.find(opt => opt.id !== optionId);
    if (firstOption) {
      setCommuteStatus(prev => {
        const updated = { ...prev };
        DAYS.forEach(day => {
          if (updated[day] === optionId) {
            updated[day] = firstOption.id;
          }
        });
        return updated;
      });
    }
  };

  /**
   * Toggle people editor visibility
   */
  const togglePeopleEditor = () => {
    setShowPeopleEditor(prev => !prev);
  };

  /**
   * Add a new person
   */
  const addPerson = () => {
    const newId = `person-${Date.now()}`;
    const newPerson = {
      id: newId,
      name: `Person ${editablePeople.length + 1}`
    };
    setEditablePeople(prev => [...prev, newPerson]);

    // Initialize presence for new person (default to no days)
    setPeoplePresence(prev => {
      const updated = { ...prev };
      DAYS.forEach(day => {
        updated[day] = [...(updated[day] || [])];
      });
      return updated;
    });
  };

  /**
   * Remove a person
   * @param {string} personId - ID of the person to remove
   */
  const removePerson = (personId) => {
    setEditablePeople(prev => prev.filter(person => person.id !== personId));

    // Remove from all day schedules
    setPeoplePresence(prev => {
      const updated = { ...prev };
      DAYS.forEach(day => {
        updated[day] = updated[day].filter(id => id !== personId);
      });
      return updated;
    });
  };

  /**
   * Update person name
   * @param {string} personId - ID of the person to update
   * @param {string} newName - New name for the person
   */
  const updatePersonName = (personId, newName) => {
    setEditablePeople(prev =>
      prev.map(person =>
        person.id === personId ? { ...person, name: newName } : person
      )
    );
  };

  /**
   * Toggle person presence for a specific day
   * @param {string} personId - ID of the person
   * @param {string} day - Day to toggle
   */
  const togglePersonPresence = (personId, day) => {
    setPeoplePresence(prev => ({
      ...prev,
      [day]: prev[day].includes(personId)
        ? prev[day].filter(id => id !== personId)
        : [...prev[day], personId]
    }));
  };

  /**
   * Adjust required meals for a day
   * @param {string} day - Day to adjust
   * @param {number} change - Change amount (+1 or -1)
   */
  const adjustRequiredMeals = (day, change) => {
    setRequiredMeals(prev => ({
      ...prev,
      [day]: Math.max(0, prev[day] + change)
    }));
  };

  /**
   * Adjust required meals for a specific meal section
   * @param {string} sectionId - Section ID (e.g., "mon:lunch")
   * @param {number} change - Change amount (+1 or -1)
   */
  const adjustMealRequirements = (sectionId, change) => {
    setMealRequirements(prev => ({
      ...prev,
      [sectionId]: Math.max(0, (prev[sectionId] || 0) + change)
    }));
  };

  /**
   * Reset the application to its initial state
   */
  const resetAll = () => {
    setMealsToCook(INITIAL_MEALS_TO_COOK);
    setPrecookedMeals([]);
    setColumns(INITIAL_COLUMNS);
    setAssignments({});
    setWorkStatus(USER_CONFIG.defaultWorkStatus);
    setPeoplePresence(USER_CONFIG.defaultPresence);
    setCommuteStatus(USER_CONFIG.defaultCommute);
    setCommuteOptions(USER_CONFIG.commuteOptions);
    setEditablePeople(USER_CONFIG.people);
    setShowPeopleEditor(false);
    setRequiredMeals({
      mon: 1, tue: 1, wed: 1, thu: 2, fri: 2, sat: 1, sun: 1
    });
    // Reset meal requirements based on people presence
    const requirements = {};
    DAYS.forEach(day => {
      const peopleCount = USER_CONFIG.defaultPresence[day].length;
      requirements[`${day}:lunch`] = peopleCount;
      requirements[`${day}:dinner`] = peopleCount;
    });
    setMealRequirements(requirements);
    idSeed.current = 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2">
      <div className="w-full space-y-3">
        {/* Header with title and reset button */}
        <header className="flex items-center justify-between bg-white rounded-xl p-4 shadow-md border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-3xl">📅</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Family Meal Planner
            </h1>
            <span className="text-sm text-gray-600">- Drag meals from below to plan your week!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePeopleEditor}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              aria-label="Edit people and schedules"
            >
              👥 People
            </button>
            <button
              onClick={resetAll}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              aria-label="Reset planner"
            >
              🔄 Reset
            </button>
          </div>
        </header>

        {/* People & Commute Editor Modal */}
        {showPeopleEditor && (
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">👥 Edit People & Schedules</h2>
              <button
                onClick={togglePeopleEditor}
                className="text-gray-500 hover:text-gray-700 text-xl"
                aria-label="Close people editor"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* People Section */}
              <div>
                <h3 className="text-md font-bold text-gray-700 mb-2">👥 People</h3>
                <div className="space-y-4">
                  {editablePeople.map(person => (
                    <div key={person.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => updatePersonName(person.id, e.target.value)}
                          className="font-medium text-gray-800 border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
                          placeholder="Person name"
                        />
                        {editablePeople.length > 1 && (
                          <button
                            onClick={() => removePerson(person.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            title="Remove person"
                          >
                            🗑️
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600 mr-2">Days present:</span>
                        {DAYS.map(day => (
                          <button
                            key={day}
                            onClick={() => togglePersonPresence(person.id, day)}
                            className={`w-8 h-8 rounded text-xs font-bold transition-colors ${peoplePresence[day]?.includes(person.id)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            title={day}
                          >
                            {day.charAt(0).toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addPerson}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg p-3 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    + Add Person
                  </button>
                </div>
              </div>

              {/* Commute Options Section */}
              <div>
                <h3 className="text-md font-bold text-gray-700 mb-2">🚗 Commute Options</h3>
                <div className="space-y-4">
                  {commuteOptions.map(option => (
                    <div key={option.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={option.emoji}
                          onChange={(e) => updateCommuteOption(option.id, { emoji: e.target.value })}
                          className="w-8 text-center border-b border-gray-300 focus:border-green-500 focus:outline-none bg-transparent"
                          placeholder="🚗"
                        />
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => updateCommuteOption(option.id, { name: e.target.value })}
                          className="flex-1 font-medium text-gray-800 border-b border-gray-300 focus:border-green-500 focus:outline-none bg-transparent"
                          placeholder="Commute name"
                        />
                        {commuteOptions.length > 1 && (
                          <button
                            onClick={() => removeCommuteOption(option.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            title="Remove commute option"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addCommuteOption}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-green-400 rounded-lg p-3 text-gray-600 hover:text-green-600 transition-colors"
                  >
                    + Add Commute Option
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main drag and drop context */}
        <DragDropProvider
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          meals={mealsToCook}
          precookedMeals={precookedMeals}
          assignments={assignments}
          active={active}
        >
          {/* Meals sections side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Meals to Cook Section */}
            <div id="meals-to-cook-section" className="h-full">
              <MealsToCook
                meals={mealsToCook}
                onRenameMeal={renameMeal}
                onAddMeal={addMeal}
                onRemoveMeal={removeMeal}
              />
            </div>

            {/* Precooked Meals Section */}
            <div className="h-full">
              <PreCookedMeals
                meals={precookedMeals}
                onRenameMeal={renamePrecookedMeal}
                onAddMeal={addPrecookedMeal}
                onRemoveMeal={removePrecookedMeal}
                onSetServings={setPrecookedServings}
              />
            </div>
          </div>

          {/* Weekly schedule */}
          <WeeklySchedule
            columns={columns}
            assignments={assignments}
            meals={mealsToCook}
            onSetLeftovers={setLeftovers}
            onSetServings={setServings}
            onRemoveAssignment={removeAssignment}
            cookedMeals={cookedMeals}
            mealOverages={mealOverages}
            workStatus={workStatus}
            onToggleWorkStatus={toggleWorkStatus}
            commuteStatus={commuteStatus}
            commuteOptions={commuteOptions}
            onSetCommute={setCommute}
            peoplePresence={peoplePresence}
            requiredMeals={requiredMeals}
            onAdjustRequiredMeals={adjustRequiredMeals}
            mealRequirements={mealRequirements}
            onAdjustMealRequirements={adjustMealRequirements}
            userConfig={{ ...USER_CONFIG, people: editablePeople }}
          />

          {/* Remove zone for assignments */}
          <RemoveZone />

          {/* Cooked Meals Summary */}
          <CookedMealsSummary mealData={mealData} />
        </DragDropProvider>
      </div>
    </div>
  );
}
