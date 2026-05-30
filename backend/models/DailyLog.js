import mongoose from "mongoose";

const dailyLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
    },
    problemsSolved: [
      {
        titleSlug: { type: String, required: true },
        title: { type: String, required: true },
        difficulty: {
          type: String,
          enum: ["Easy", "Medium", "Hard"],
          required: true,
        },
        topics: [{ type: String }],
        solvedAt: { type: Date, default: Date.now },
        timeSpent: { type: Number, default: 0 },
        notes: { type: String, default: "" },
        isFavorite: { type: Boolean, default: false },
      },
    ],
    goalMet: { type: Boolean, default: false },
    totalSolvedOnDate: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    mood: {
      type: String,
      enum: ["great", "good", "okay", "bad", null],
      default: null,
    },
  },
  { timestamps: true }
);

dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

// ── Auto-compute counts before saving ────────────────────
dailyLogSchema.pre("save", function () {
  this.totalSolvedOnDate = this.problemsSolved.length;
  this.easySolved = this.problemsSolved.filter((p) => p.difficulty === "Easy").length;
  this.mediumSolved = this.problemsSolved.filter((p) => p.difficulty === "Medium").length;
  this.hardSolved = this.problemsSolved.filter((p) => p.difficulty === "Hard").length;
});

const DailyLog = mongoose.model("DailyLog", dailyLogSchema);
export default DailyLog;