/**
 * User configuration for the meal planner
 */

export const USER_CONFIG = {
    // People who might be present for meals
    people: [
        { id: "caine", name: "Caine" },
        { id: "bonnie", name: "Bonnie" }
    ],

    // Default presence for each day (which people are present)
    defaultPresence: {
        mon: ["caine"],
        tue: ["caine"],
        wed: ["caine"],
        thu: ["caine", "bonnie"],
        fri: ["caine", "bonnie"],
        sat: ["caine"],
        sun: ["caine"]
    },

    // Default work status for each day
    defaultWorkStatus: {
        mon: true,
        tue: true,
        wed: false, // Off day
        thu: true,
        fri: true,
        sat: false, // Weekend
        sun: false    // Weekend
    },

    // Commute options
    commuteOptions: [
        { id: "wfh", name: "WFH", emoji: "🏠" },
        { id: "bus", name: "Bus", emoji: "🚌" },
        { id: "walk", name: "Walk", emoji: "🚶" },
        { id: "drive", name: "Drive", emoji: "🚗" }
    ],

    // Default commute for each day
    defaultCommute: {
        mon: "wfh",
        tue: "bus",
        wed: "wfh", // Off day
        thu: "drive",
        fri: "walk",
        sat: "wfh", // Weekend
        sun: "wfh"  // Weekend
    }
};
