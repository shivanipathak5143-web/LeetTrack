import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    // ── LEETCODE DATA (cached) ─────────────────────────────
    titleSlug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    questionId: { type: String },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    topics: [{ type: String }],
    isPremium: { type: Boolean, default: false },
    acRate: { type: Number }, // acceptance rate %
    url: { type: String },
    lastCachedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Problem = mongoose.model("Problem", problemSchema);
export default Problem;