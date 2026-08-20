import ChatHistory from '../models/chatHistory.js';
import User from '../models/User.js';
import {
  buildSystemPrompt,
  generateTitlePrompt,
} from "../utils/chatPrompts.js";
import dotenv from 'dotenv';

dotenv.config();

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

// You can change model here
const MODEL = "openai/gpt-oss-120b";

// ── CALL GROQ API ─────────────────────────────────────────
const callGroq = async (systemPrompt, messages, maxTokens = 1500) => {
  const response = await fetch(GROQ_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    console.log(err);

    throw new Error(err.error?.message || "Groq API error");
  }

  const data = await response.json();

  return data.choices[0].message.content;
};

// ── GENERATE CHAT TITLE ───────────────────────────────────
const generateTitle = async (firstMessage) => {
  try {
    const prompt = generateTitlePrompt(firstMessage);

    const title = await callGroq(
      "You generate short chat titles.",
      [
        {
          role: "user",
          content: prompt,
        },
      ],
      50
    );

    return title.trim().slice(0, 60);
  } catch (error) {
    console.log(error);
    return "New Chat";
  }
};

// ── SEND MESSAGE ──────────────────────────────────────────
export const sendMessage = async (req, res, next) => {
  try {
    const { message, chatId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
        statusCode: 400,
      });
    }

    const user = await User.findById(req.user._id);

    // Find existing chat or create new one
    let chat;

    if (chatId) {
      chat = await ChatHistory.findOne({
        _id: chatId,
        user: req.user._id,
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          error: "Chat not found",
          statusCode: 404,
        });
      }
    } else {
      // Create new chat
      chat = new ChatHistory({
        user: req.user._id,
        messages: [],
      });
    }

    // Save user message
    chat.messages.push({
      role: "user",
      content: message.trim(),
    });

    // Last 20 messages for context
    const recentMessages = chat.messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // System prompt
    const systemPrompt = buildSystemPrompt(user);

    // AI response
    const assistantReply = await callGroq(
      systemPrompt,
      recentMessages
    );

    // Save assistant reply
    chat.messages.push({
      role: "assistant",
      content: assistantReply,
    });

    // Auto title generation
    if (
      chat.messages.length === 2 &&
      (!chat.title || chat.title === "New Chat")
    ) {
      chat.title = await generateTitle(message.trim());
    }

    await chat.save();

    res.status(200).json({
      success: true,
      data: {
        chatId: chat._id,
        title: chat.title,
        reply: assistantReply,
        messageCount: chat.messages.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET ALL CHATS ─────────────────────────────────────────
export const getAllChats = async (req, res, next) => {
  try {
    const chats = await ChatHistory.find({
      user: req.user._id,
      isArchived: false,
    })
      .select("title createdAt updatedAt messages")
      .sort({ updatedAt: -1 });

    const chatList = chats.map((c) => ({
      id: c._id,
      title: c.title,
      messageCount: c.messages.length,
      lastMessage:
        c.messages[c.messages.length - 1]?.content?.slice(0, 80) || "",
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: chatList,
      count: chatList.length,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET SINGLE CHAT ───────────────────────────────────────
export const getChatById = async (req, res, next) => {
  try {
    const chat = await ChatHistory.findOne({
      _id: req.params.chatId,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: chat._id,
        title: chat.title,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── DELETE CHAT ───────────────────────────────────────────
export const deleteChat = async (req, res, next) => {
  try {
    const chat = await ChatHistory.findOneAndDelete({
      _id: req.params.chatId,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ── CLEAR CHAT ────────────────────────────────────────────
export const clearChat = async (req, res, next) => {
  try {
    const chat = await ChatHistory.findOne({
      _id: req.params.chatId,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
        statusCode: 404,
      });
    }

    chat.messages = [];
    chat.title = "New Chat";

    await chat.save();

    res.status(200).json({
      success: true,
      message: "Chat cleared successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ── GET ROADMAP ───────────────────────────────────────────
export const getRoadmap = async (req, res, next) => {
  try {
    const { topic, level } = req.query;

    const user = await User.findById(req.user._id);

    const roadmapMessage = topic
      ? `Give me a detailed roadmap for mastering ${topic} in DSA. My level is ${level || "beginner"}.`
      : `Give me a complete DSA roadmap to go from my current level to interview-ready. Be specific about what to study and in what order.`;

    const systemPrompt = buildSystemPrompt(user);

    const reply = await callGroq(
      systemPrompt,
      [
        {
          role: "user",
          content: roadmapMessage,
        },
      ],
      2000
    );

    res.status(200).json({
      success: true,
      data: {
        roadmap: reply,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const getChatMessages = async (req, res, next) => {
  try {
    const chat = await ChatHistory.findOne({
      _id: req.params.chatId,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
      });
    }

    res.status(200).json({
      success: true,
      data: chat.messages,
    });
  } catch (error) {
    next(error);
  }
};