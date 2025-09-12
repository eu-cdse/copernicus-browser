// Utility functions for interacting with localStorage

/**
 * Get a value from localStorage by key.
 * @param {string} key - The key to retrieve the value for.
 * @returns {string|null} The value associated with the key, or null if not found.
 */
export const getFromLocalStorage = (key) => {
  return localStorage.getItem(key);
};

/**
 * Save a value to localStorage under a specific key.
 * @param {string} key - The key to save the value under.
 * @param {string} value - The value to save.
 */
export const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};

/**
 * Remove a value from localStorage by key.
 * @param {string} key - The key to remove the value for.
 */
export const removeFromLocalStorage = (key) => {
  localStorage.removeItem(key);
};
