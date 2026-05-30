import DailyLog from "../models/DailyLog.js";
import User from "../models/User.js";
import { getLastNDays } from "../utils/helpers.js";

export const getTopicBreakDown=async(req,res,next)=>{
    try{
        const user=await User.findById(req.user._id);
        const lcTopics=user.stats?.topicBreakdown || [];
        const logs=await DailyLog.find({user:req.user._id}).sort({date:1});
        const localTopicMap={};
        logs.forEach((log)=>{
            log.problemsSolved.forEach((p)=>{
                p.topics.forEach((topic)=>{
                    if(!localTopicMap[topic]){
                        localTopicMap[topic]={easy:0};
                    }
                    localTopicMap[topic][p.difficulty.toLocaleLowerCase()]++;
                    localTopicMap[topic].total++;

                });
            });
        });
        const localTopics=Object.entries(localTopicMap)
        .map(([topic, counts])=>({topic, ...counts}))
        .sort((a,b)=>b.total-a.total);
        res.status(200).json({
            success:true,
            data:{fromLeetCode:lcTopics,fromLocalLogs:localTopics},
        });
    }catch(err){
        next(err);
    }
};

export const getWeakSpots = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const lcTopics = user.stats?.topicBreakdown || [];
 
    if (lcTopics.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Sync your LeetCode stats first to see weak spots",
      });
    }
 
    const total = user.stats.totalSolved || 1;
    const weakSpots = lcTopics
      .filter((t) => t.solved < 5 || t.solved / total < 0.05)
      .map((t) => ({
        topic: t.topic,
        solved: t.solved,
        percentOfTotal: Math.round((t.solved / total) * 100 * 10) / 10,
        suggestionLevel: t.solved === 0 ? "Never practiced" : "Needs work",
      }))
      .sort((a, b) => a.solved - b.solved)
      .slice(0, 10);
 
    res.status(200).json({ success: true, data: weakSpots });
  } catch (error) {
    next(error);
  }
};
 
// ── DIFFICULTY DISTRIBUTION ───────────────────────────────
export const getDifficultyDistribution = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { easySolved, mediumSolved, hardSolved, totalSolved } = user.stats;
    const total = totalSolved || 1;
 
    res.status(200).json({
      success: true,
      data: {
        easy: { count: easySolved, percent: Math.round((easySolved / total) * 100) },
        medium: { count: mediumSolved, percent: Math.round((mediumSolved / total) * 100) },
        hard: { count: hardSolved, percent: Math.round((hardSolved / total) * 100) },
        total: totalSolved,
      },
    });
  } catch (error) {
    next(error);
  }
};
 
// ── PROGRESS CHART ────────────────────────────────────────
export const getProgressChart = async (req, res, next) => {
  try {
    const { period = "month" } = req.query;
    const daysMap = { week: 7, month: 30, "3months": 90, year: 365 };
    const days = daysMap[period] || 30;
 
    const dateRange = getLastNDays(days);
    const logs = await DailyLog.find({
      user: req.user._id,
      date: { $in: dateRange },
    })
      .sort({ date: 1 })
      .select("date totalSolvedOnDate easySolved mediumSolved hardSolved goalMet");
 
    const logMap = {};
    logs.forEach((l) => (logMap[l.date] = l));
 
    let cumulative = 0;
    const chartData = dateRange.map((date) => {
      const log = logMap[date];
      const dayTotal = log?.totalSolvedOnDate || 0;
      cumulative += dayTotal;
      return {
        date,
        daily: dayTotal,
        cumulative,
        easy: log?.easySolved || 0,
        medium: log?.mediumSolved || 0,
        hard: log?.hardSolved || 0,
        goalMet: log?.goalMet || false,
      };
    });
 
    res.status(200).json({ success: true, data: chartData });
  } catch (error) {
    next(error);
  }
};
 
// ── LEADERBOARD ───────────────────────────────────────────
export const getLeaderboard = async (req, res, next) => {
  try {
    const { type = "total", limit = 10 } = req.query;
    const sortMap = {
      total: "stats.totalSolved",
      streak: "currentStreak",
      hard: "stats.hardSolved",
      ranking: "stats.ranking",
    };
    const sortField = sortMap[type] || "stats.totalSolved";
 
    const users = await User.find({
      isActive: true,
      leetcodeUsername: { $ne: null },
    })
      .select(
        "username profileImage stats.totalSolved stats.easySolved stats.mediumSolved stats.hardSolved stats.ranking currentStreak longestStreak"
      )
      .sort({ [sortField]: type === "ranking" ? 1 : -1 })
      .limit(Math.min(50, parseInt(limit)));
 
    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      username: u.username,
      profileImage: u.profileImage,
      totalSolved: u.stats.totalSolved,
      easySolved: u.stats.easySolved,
      mediumSolved: u.stats.mediumSolved,
      hardSolved: u.stats.hardSolved,
      ranking: u.stats.ranking,
      currentStreak: u.currentStreak,
      longestStreak: u.longestStreak,
    }));
 
    res.status(200).json({ success: true, data: leaderboard, type });
  } catch (error) {
    next(error);
  }
};
 
// ── DASHBOARD ─────────────────────────────────────────────
export const getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date().toISOString().split("T")[0];
 
    const todayLog = await DailyLog.findOne({ user: req.user._id, date: today });
 
    const last7Dates = getLastNDays(7);
    const recentLogs = await DailyLog.find({
      user: req.user._id,
      date: { $in: last7Dates },
    }).select("date totalSolvedOnDate goalMet");
 
    const weeklyTotal = recentLogs.reduce((sum, l) => sum + l.totalSolvedOnDate, 0);
    const goalsMetThisWeek = recentLogs.filter((l) => l.goalMet).length;
 
    res.status(200).json({
      success: true,
      data: {
        user: {
          username: user.username,
          profileImage: user.profileImage,
          leetcodeUsername: user.leetcodeUsername,
          dailyGoal: user.dailyGoal,
        },
        today: {
          solved: todayLog?.totalSolvedOnDate || 0,
          goalMet: todayLog?.goalMet || false,
          problems: todayLog?.problemsSolved || [],
        },
        stats: user.stats,
        streak: {
          current: user.currentStreak,
          longest: user.longestStreak,
        },
        weekly: {
          total: weeklyTotal,
          goalsMetCount: goalsMetThisWeek,
          averagePerDay: Math.round((weeklyTotal / 7) * 10) / 10,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};