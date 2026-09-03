/**
 * Time Slot Utilities
 * Pure functions for time arithmetic used throughout the booking engine.
 * All times in HH:MM (24-hour) format strings.
 */

/**
 * Convert "HH:MM" string to total minutes since midnight.
 */
const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Convert total minutes since midnight back to "HH:MM" string.
 */
const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Add minutes to a "HH:MM" time string.
 */
const addMinutes = (time, mins) => minutesToTime(timeToMinutes(time) + mins);

/**
 * Generate an array of slot start times for a booking window.
 *
 * Example:
 *   startTime = "19:00", durationMinutes = 90, intervalMinutes = 30
 *   → ["19:00", "19:30", "20:00"]
 *
 * The last slot covers the final interval BEFORE endTime.
 * Buffer slots (table cleanup) are appended after the booking end if configured.
 *
 * @param {string} startTime - "HH:MM"
 * @param {number} durationMinutes - total booking duration
 * @param {number} intervalMinutes - slot interval (from Settings)
 * @param {number} bufferMinutes - additional buffer after booking end
 * @returns {string[]} array of "HH:MM" slot start strings
 */
const generateSlots = (startTime, durationMinutes, intervalMinutes = 30, bufferMinutes = 0) => {
  const totalMinutes = durationMinutes + bufferMinutes;
  const startMins = timeToMinutes(startTime);
  const slots = [];

  for (let offset = 0; offset < totalMinutes; offset += intervalMinutes) {
    slots.push(minutesToTime(startMins + offset));
  }

  return slots;
};

/**
 * Check if two time windows overlap.
 * Returns true if [startA, endA) and [startB, endB) overlap.
 */
const timesOverlap = (startA, endA, startB, endB) => {
  const a1 = timeToMinutes(startA);
  const a2 = timeToMinutes(endA);
  const b1 = timeToMinutes(startB);
  const b2 = timeToMinutes(endB);
  return a1 < b2 && b1 < a2;
};

/**
 * Check if a time is within a window [windowStart, windowEnd).
 */
const isWithinWindow = (time, windowStart, windowEnd) => {
  const t = timeToMinutes(time);
  return t >= timeToMinutes(windowStart) && t < timeToMinutes(windowEnd);
};

/**
 * Compute the endTime string given a startTime and duration.
 */
const computeEndTime = (startTime, durationMinutes) =>
  minutesToTime(timeToMinutes(startTime) + durationMinutes);

module.exports = {
  timeToMinutes,
  minutesToTime,
  addMinutes,
  generateSlots,
  timesOverlap,
  isWithinWindow,
  computeEndTime,
};
