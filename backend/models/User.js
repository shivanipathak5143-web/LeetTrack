import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must be at most 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileImage: {
      type: String,
      default: "",
    },
    leetcodeUsername: {
      type: String,
      default: null,
      sparse: true,
    },
    dailyGoal: {
      type: Number,
      default: 1,
      min: [1, "Daily goal must be at least 1"],
      max: [50, "Daily goal must be at most 50"],
    },
    stats: {
      totalSolved: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      totalSubmissions: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
      ranking: { type: Number, default: 0 },
      contributionPoints: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      maxStreak: { type: Number, default: 0 },
      lastFetched: { type: Date, default: null },
      topicBreakdown: [
        {
          topic: String,
          solved: Number,
        },
      ],
    },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── HASH PASSWORD BEFORE SAVE ─────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── COMPARE PASSWORD ──────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── NEEDS REFRESH (stale after 1 hour) ───────────────────
userSchema.methods.needsStatsRefresh = function () {
  if (!this.stats.lastFetched) return true;
  const oneHour = 60 * 60 * 1000;
  return Date.now() - new Date(this.stats.lastFetched).getTime() > oneHour;
};

const User = mongoose.model("User", userSchema);
export default User;