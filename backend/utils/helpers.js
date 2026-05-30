// ── DATE HELPERS ──────────────────────────────────────────

/** Returns today's date as "YYYY-MM-DD" in UTC */
export const getTodayString = () => {
  return new Date().toISOString().split("T")[0];
};

/** Parse "YYYY-MM-DD" to a Date object (midnight UTC) */
export const parseDate = (dateStr) => {
  return new Date(dateStr + "T00:00:00.000Z");
};

/** Returns array of date strings for the last N days */
export const getLastNDays = (n) => {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

/** Checks if two "YYYY-MM-DD" strings are consecutive days */
export const isConsecutiveDay = (prevDate, nextDate) => {
  const prev = parseDate(prevDate);
  const next = parseDate(nextDate);
  const diff = (next - prev) / (1000 * 60 * 60 * 24);
  return diff === 1;
};

// ── STREAK CALCULATOR ─────────────────────────────────────

/**
 * Recalculates current streak from sorted daily log dates (ascending).
 * A streak breaks if there's a gap > 1 day.
 */
export const calculateStreak = (sortedDates) => {
  if (!sortedDates.length) return { currentStreak: 0, longestStreak: 0 };

  const today = getTodayString();
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Build streak from history
  for (let i = 1; i < sortedDates.length; i++) {
    if (isConsecutiveDay(sortedDates[i - 1], sortedDates[i])) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Current streak: only active if last date is today or yesterday
  const lastDate = sortedDates[sortedDates.length - 1];
  if (lastDate === today || lastDate === yesterdayStr) {
    // Walk backwards to count current streak
    currentStreak = 1;
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      if (isConsecutiveDay(sortedDates[i], sortedDates[i + 1])) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
};

// ── STATS AGGREGATOR ──────────────────────────────────────

/**
 * Aggregates daily logs into weekly/monthly summary
 */
export const aggregateLogs = (logs) => {
  return logs.reduce(
    (acc, log) => {
      acc.totalSolved += log.totalSolvedOnDate;
      acc.easySolved += log.easySolved;
      acc.mediumSolved += log.mediumSolved;
      acc.hardSolved += log.hardSolved;
      acc.daysActive += log.totalSolvedOnDate > 0 ? 1 : 0;
      acc.goalsmet += log.goalMet ? 1 : 0;
      return acc;
    },
    {
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      daysActive: 0,
      goalsmet: 0,
    }
  );
};

// ── PAGINATION HELPER ─────────────────────────────────────
export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// ── PARSE SUBMISSION CALENDAR ─────────────────────────────
/**
 * LeetCode returns submissionCalendar as a JSON string of
 * { "unixTimestamp": count, ... }
 * Convert to "YYYY-MM-DD" -> count map
 */
export const parseSubmissionCalendar = (calendarStr) => {
  try {
    const raw = JSON.parse(calendarStr || "{}");
    const result = {};
    for (const [ts, count] of Object.entries(raw)) {
      const date = new Date(parseInt(ts) * 1000).toISOString().split("T")[0];
      result[date] = (result[date] || 0) + count;
    }
    return result;
  } catch {
    return {};
  }
};