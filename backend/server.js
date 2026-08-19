import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import leetcodeRoutes from "./routes/leetcodeRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import statsRoutes from './routes/statsRoutes.js';
import chatRoutes from './routes/chatRoutes.js'
import errorHandler from './middleware/errorHandling.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174'],
  credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Rate Limiter
app.use(apiLimiter);

// Routes
app.use('/api/auth', authRoutes);

app.use('/api/leetcode', leetcodeRoutes);

app.use('/api/logs', logRoutes);

app.use('/api/stats', statsRoutes);

app.use('/api/chat',chatRoutes);
// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is running successfully',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '404 Page not found',
  });
});

// Error Handler
app.use(errorHandler);

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});