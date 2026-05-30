import User from "../models/User.js";
import {
  fetchUserStats,
  fetchRecentSubmissions,
} from "../utils/leetcodeAPI.js";
import { parseSubmissionCalendar } from "../utils/helpers.js";

// ── SYNC LEETCODE STATS ───────────────────────────────────
export const syncStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.leetcodeUsername) {
      return res.status(400).json({
        success: false,
        error: "No LeetCode username linked to your account",
        statusCode: 400,
      });
    }

    // Allow force refresh or auto-refresh if stale
    const force = req.query.force === "true";
    if (!force && !user.needsStatsRefresh()) {
      return res.status(200).json({
        success: true,
        data: user.stats,
        message: "Stats are up to date",
        cached: true,
      });
    }

    const stats = await fetchUserStats(user.leetcodeUsername);

    user.stats = { ...user.stats, ...stats };
    await user.save();

    res.status(200).json({
      success: true,
      data: user.stats,
      message: "Stats synced successfully",
      cached: false,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        error: error.message,
        statusCode: 404,
      });
    }
    next(error);
  }
};

// ── GET CURRENT STATS (from cache, refresh if stale) ─────
export const getStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.leetcodeUsername) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No LeetCode username linked",
      });
    }

    let stats = user.stats;

    // Auto-refresh if stale
    if (user.needsStatsRefresh()) {
      try {
        const fresh = await fetchUserStats(user.leetcodeUsername);
        user.stats = { ...user.stats, ...fresh };
        await user.save();
        stats = user.stats;
      } catch {
        // Return cached data on API failure
      }
    }

    res.status(200).json({
      success: true,
      data: stats,
      stale: user.needsStatsRefresh(),
    });
  } catch (error) {
    next(error);
  }
};

// ── GET RECENT SUBMISSIONS ────────────────────────────────
export const getRecentSubmissions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.leetcodeUsername) {
      return res.status(400).json({
        success: false,
        error: "No LeetCode username linked",
        statusCode: 400,
      });
    }

    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const submissions = await fetchRecentSubmissions(
      user.leetcodeUsername,
      limit
    );

    // Enrich with readable timestamp
    const enriched = submissions.map((s) => ({
      ...s,
      submittedAt: new Date(parseInt(s.timestamp) * 1000),
    }));

    res.status(200).json({
      success: true,
      data: enriched,
      count: enriched.length,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET SUBMISSION HEATMAP ────────────────────────────────
export const getHeatmap = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.leetcodeUsername) {
      return res.status(200).json({
        success: true,
        data: {},
        message: "No LeetCode username linked",
      });
    }

    const calendarStr = user.stats?.submissionCalendar;
    if (!calendarStr) {
      // Try to fetch
      try {
        const stats = await fetchUserStats(user.leetcodeUsername);
        user.stats = { ...user.stats, ...stats };
        await user.save();
        const heatmap = parseSubmissionCalendar(stats.submissionCalendar);
        return res.status(200).json({ success: true, data: heatmap });
      } catch {
        return res.status(200).json({ success: true, data: {} });
      }
    }

    const heatmap = parseSubmissionCalendar(calendarStr);

    res.status(200).json({
      success: true,
      data: heatmap,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET PUBLIC USER STATS (for leaderboard/profiles) ─────
export const getPublicStats = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        username: user.username,
        profileImage: user.profileImage,
        stats: {
          totalSolved: user.stats.totalSolved,
          easySolved: user.stats.easySolved,
          mediumSolved: user.stats.mediumSolved,
          hardSolved: user.stats.hardSolved,
          ranking: user.stats.ranking,
          streak: user.currentStreak,
          longestStreak: user.longestStreak,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};