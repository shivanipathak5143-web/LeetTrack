import DailyLog from "../models/DailyLog.js";
import User from "../models/User.js";
import { getTodayString, getLastNDays, calculateStreak, aggregateLogs, getPagination } from "../utils/helpers.js";

export const logProblem = async (req, res, next) => {
    try {
        const {
            titleSlug,
            title,
            difficulty,
            topics = [],
            timeSpent = 0,
            notes = "",
            isFavorite = false,
            date,
        } = req.body;
        if (!titleSlug || !title || !difficulty) {
            return res.status(400).json({
                success: false,
                error: "titleSlug, title, and difficulty are required",
                statusCode: 400,
            });
        }
        if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
            return res.status(400).json({
                success: false,
                error: "Difficulty must be Easy, Medium, or Hard",
                statusCode: 400,
            });
        }
        const logDate = date || getTodayString();

        // Find or create today's log
        let log = await DailyLog.findOne({
            user: req.user._id,
            date: logDate,
        });

        if (!log) {
            log = new DailyLog({ user: req.user._id, date: logDate });
        }
        const alreadyLogged = log.problemsSolved.some(
      (p) => p.titleSlug === titleSlug
    );
    if (alreadyLogged) {
      return res.status(400).json({
        success: false,
        error: "This problem has already been logged for today",
        statusCode: 400,
      });
    }
 
    log.problemsSolved.push({
      titleSlug,
      title,
      difficulty,
      topics,
      timeSpent,
      notes,
      isFavorite,
      solvedAt: new Date(),
    });
 
    // Check if daily goal is met
    const user = await User.findById(req.user._id);
    log.goalMet = log.problemsSolved.length >= user.dailyGoal;
 
    await log.save();
 
    // Update streak on user
    await updateUserStreak(req.user._id);
 
    res.status(201).json({
      success: true,
      data: log,
      message: "Problem logged successfully",
    });
    } catch (error) {
        next(error);
    }
};

export const removeLoggedProblem = async (req, res, next) => {
  try {
    const { date, titleSlug } = req.params;
 
    const log = await DailyLog.findOne({ user: req.user._id, date });
    if (!log) {
      return res.status(404).json({
        success: false,
        error: "No log found for this date",
        statusCode: 404,
      });
    }
 
    const before = log.problemsSolved.length;
    log.problemsSolved = log.problemsSolved.filter(
      (p) => p.titleSlug !== titleSlug
    );
 
    if (log.problemsSolved.length === before) {
      return res.status(404).json({
        success: false,
        error: "Problem not found in this log",
        statusCode: 404,
      });
    }
 
    const user = await User.findById(req.user._id);
    log.goalMet = log.problemsSolved.length >= user.dailyGoal;
 
    await log.save();
    await updateUserStreak(req.user._id);
 
    res.status(200).json({
      success: true,
      data: log,
      message: "Problem removed from log",
    });
  } catch (error) {
    next(error);
  }
};
 
// ── GET TODAY'S LOG ───────────────────────────────────────
export const getTodayLog = async (req, res, next) => {
  try {
    const today = getTodayString();
    const user = await User.findById(req.user._id);
 
    let log = await DailyLog.findOne({ user: req.user._id, date: today });
 
    res.status(200).json({
      success: true,
      data: {
        log: log || { date: today, problemsSolved: [], totalSolvedOnDate: 0 },
        dailyGoal: user.dailyGoal,
        goalMet: log?.goalMet || false,
        progressPercent: log
          ? Math.min(
              100,
              Math.round((log.totalSolvedOnDate / user.dailyGoal) * 100)
            )
          : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
 
// ── GET LOG BY DATE ───────────────────────────────────────
export const getLogByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
 
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: "Date must be in YYYY-MM-DD format",
        statusCode: 400,
      });
    }
 
    const log = await DailyLog.findOne({ user: req.user._id, date });
 
    res.status(200).json({
      success: true,
      data: log || { date, problemsSolved: [], totalSolvedOnDate: 0 },
    });
  } catch (error) {
    next(error);
  }
};
 
// ── GET LOG HISTORY (paginated) ───────────────────────────
export const getLogHistory = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
 
    const total = await DailyLog.countDocuments({ user: req.user._id });
    const logs = await DailyLog.find({ user: req.user._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
 
    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
 
// ── GET STREAK INFO ───────────────────────────────────────
export const getStreakInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
 
    // Get all dates where goal was met or at least 1 problem solved
    const activeLogs = await DailyLog.find({
      user: req.user._id,
      totalSolvedOnDate: { $gt: 0 },
    })
      .sort({ date: 1 })
      .select("date goalMet totalSolvedOnDate");
 
    const activeDates = activeLogs.map((l) => l.date);
    const { currentStreak, longestStreak } = calculateStreak(activeDates);
 
    // Update user if changed
    if (
      user.currentStreak !== currentStreak ||
      user.longestStreak !== Math.max(longestStreak, user.longestStreak)
    ) {
      user.currentStreak = currentStreak;
      user.longestStreak = Math.max(longestStreak, user.longestStreak);
      await user.save();
    }
 
    res.status(200).json({
      success: true,
      data: {
        currentStreak,
        longestStreak: Math.max(longestStreak, user.longestStreak),
        totalActiveDays: activeDates.length,
        lastActiveDate: activeDates[activeDates.length - 1] || null,
      },
    });
  } catch (error) {
    next(error);
  }
};
 
// ── GET LAST 30 DAYS ACTIVITY ─────────────────────────────
export const getActivityGrid = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const dateRange = getLastNDays(Math.min(365, days));
 
    const logs = await DailyLog.find({
      user: req.user._id,
      date: { $in: dateRange },
    }).select("date totalSolvedOnDate goalMet easySolved mediumSolved hardSolved");
 
    const logMap = {};
    logs.forEach((l) => {
      logMap[l.date] = {
        total: l.totalSolvedOnDate,
        easy: l.easySolved,
        medium: l.mediumSolved,
        hard: l.hardSolved,
        goalMet: l.goalMet,
      };
    });
 
    const grid = dateRange.map((date) => ({
      date,
      ...(logMap[date] || {
        total: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        goalMet: false,
      }),
    }));
 
    res.status(200).json({
      success: true,
      data: grid,
    });
  } catch (error) {
    next(error);
  }
};
 
// ── GET WEEKLY / MONTHLY SUMMARY ──────────────────────────
export const getSummary = async (req, res, next) => {
  try {
    const { period = "week" } = req.query;
 
    let days;
    if (period === "week") days = 7;
    else if (period === "month") days = 30;
    else if (period === "year") days = 365;
    else {
      return res.status(400).json({
        success: false,
        error: "Period must be week, month, or year",
        statusCode: 400,
      });
    }
 
    const dateRange = getLastNDays(days);
    const logs = await DailyLog.find({
      user: req.user._id,
      date: { $in: dateRange },
    });
 
    const summary = aggregateLogs(logs);
 
    res.status(200).json({
      success: true,
      data: {
        period,
        days,
        ...summary,
        averagePerDay: logs.length
          ? Math.round((summary.totalSolved / days) * 10) / 10
          : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
 
// ── UPDATE MOOD FOR A DATE ────────────────────────────────
export const updateMood = async (req, res, next) => {
  try {
    const { date, mood } = req.body;
 
    if (!["great", "good", "okay", "bad"].includes(mood)) {
      return res.status(400).json({
        success: false,
        error: "Mood must be great, good, okay, or bad",
        statusCode: 400,
      });
    }
 
    const logDate = date || getTodayString();
    let log = await DailyLog.findOneAndUpdate(
      { user: req.user._id, date: logDate },
      { mood },
      { new: true, upsert: true }
    );
 
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};
 
// ── INTERNAL: update streak on user doc ──────────────────
const updateUserStreak = async (userId) => {
  const activeLogs = await DailyLog.find({
    user: userId,
    totalSolvedOnDate: { $gt: 0 },
  })
    .sort({ date: 1 })
    .select("date");
 
  const activeDates = activeLogs.map((l) => l.date);
  const { currentStreak, longestStreak } = calculateStreak(activeDates);
 
  await User.findByIdAndUpdate(userId, {
    currentStreak,
    $max: { longestStreak },
    lastActiveDate: activeDates[activeDates.length - 1] || null,
  });
};