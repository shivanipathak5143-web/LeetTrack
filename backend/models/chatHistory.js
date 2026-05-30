import mongoose from 'mongoose';

const messageSchema=new mongoose.Schema({
    role:{
        type:String,
        enum: ["user", "assistant"],
        required: true,
    },
    content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const chatHistorySchema=new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
    messages: [messageSchema],
    // context tags for smart retrieval
    tags: [{ type: String }], // e.g. ["roadmap", "dp", "two-sum"]
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ChatHistory=mongoose.model('ChatHistory',chatHistorySchema);
export default ChatHistory;