import { SECTIONS } from "../constants/mealPlanner";

/**
 * Helper functions for the meal planner application
 */

/**
 * Check if an ID is a section ID
 * @param {string} id - The ID to check
 * @returns {boolean} - True if the ID is a section ID
 */
export const isSectionId = (id) => SECTIONS.includes(id);

/**
 * Find the section that contains a given assignment ID
 * @param {string} assignmentId - The assignment ID to find
 * @param {object} columns - The columns object mapping sections to assignments
 * @returns {string|undefined} - The section ID or undefined
 */
export const findSectionOfAssignment = (assignmentId, columns) =>
    SECTIONS.find((s) => columns[s].includes(assignmentId));

/**
 * Calculate available leftover meals and check for overages
 * @param {object} assignments - The assignments object
 * @param {array} precookedMeals - Array of precooked meals with servings
 * @returns {object} - Map of meal names to available leftover servings and overage info
 */
export const calculateCookedMeals = (assignments, precookedMeals = []) => {
    const cookedFromLeftovers = {}; // leftovers from cooking assignments
    const precookedFromMeals = {}; // precooked meals available
    const eaten = {}; // leftovers that have been eaten
    const precookedEaten = {}; // precooked meals that have been eaten

    // Add precooked meals to their own category
    precookedMeals.forEach(meal => {
        if (meal.servings > 0) {
            precookedFromMeals[meal.name] = (precookedFromMeals[meal.name] || 0) + meal.servings;
        }
    });

    // Sum up all leftover servings by meal name and track eaten leftovers/precooked
    Object.values(assignments).forEach(assignment => {
        const { mealName, leftovers: leftoverCount = 0, isEatingLeftover = false, isEatingPrecooked = false, servings = 1 } = assignment;
        if (!mealName) return;

        if (isEatingLeftover) {
            // This is eating a leftover - count servings as consumed
            eaten[mealName] = (eaten[mealName] || 0) + servings;
        } else if (isEatingPrecooked) {
            // This is eating a precooked meal - count servings as consumed
            precookedEaten[mealName] = (precookedEaten[mealName] || 0) + servings;
        } else if (leftoverCount > 0) {
            // This is cooking with leftovers - add to leftover category
            cookedFromLeftovers[mealName] = (cookedFromLeftovers[mealName] || 0) + leftoverCount;
        }
    });

    // Calculate remaining leftovers (cooked - eaten) and detect overages
    const availableLeftovers = {};
    const availablePrecooked = {};
    const overages = {};

    // Check leftover meals that have been eaten
    Object.keys(eaten).forEach(mealName => {
        const cookedAmount = cookedFromLeftovers[mealName] || 0;
        const eatenAmount = eaten[mealName] || 0;
        const remaining = cookedAmount - eatenAmount;

        if (remaining > 0) {
            availableLeftovers[mealName] = remaining;
        } else if (remaining < 0) {
            overages[mealName] = Math.abs(remaining); // How many over
        }
    });

    // Add leftover meals that have only been cooked (not eaten)
    Object.keys(cookedFromLeftovers).forEach(mealName => {
        if (!eaten[mealName]) {
            availableLeftovers[mealName] = cookedFromLeftovers[mealName];
        }
    });

    // Calculate available precooked meals (total - consumed)
    Object.keys(precookedFromMeals).forEach(mealName => {
        const totalAvailable = precookedFromMeals[mealName];
        const consumed = precookedEaten[mealName] || 0;
        const remaining = totalAvailable - consumed;

        if (remaining > 0) {
            availablePrecooked[mealName] = remaining;
        }
        // Note: We could track overages for precooked meals too if needed
    });

    // Combine for backward compatibility
    const available = {};
    Object.assign(available, availableLeftovers, availablePrecooked);

    return {
        available,
        overages,
        availableLeftovers,
        availablePrecooked
    };
};

/**
 * Generate a unique ID for new meals or assignments
 * @param {string} prefix - The prefix for the ID
 * @param {object} idSeed - Reference object containing the current seed
 * @returns {string} - New unique ID
 */
export const generateId = (prefix, idSeed) => {
    return `${prefix}-${idSeed.current++}`;
};