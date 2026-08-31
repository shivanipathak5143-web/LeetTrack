<div align="center">

# 🧠 LeetTrack

### AI-Powered LeetCode Tracking & DSA Mentorship Platform

Track your DSA journey, visualize your growth, and get personalized coaching from an AI mentor — built to keep you consistent and interview-ready.

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=JSON%20web%20tokens)
![Groq](https://img.shields.io/badge/Groq-F55036?style=flat&logo=groq&logoColor=white)

</div>

---

## Overview

LeetTrack is a full-stack MERN application built for anyone serious about mastering Data Structures & Algorithms. Instead of just tracking what you've solved, it acts as a full mentorship layer — combining progress analytics with an AI coach that understands your stats and guides you accordingly.

## Core Features

| Feature | Description |
|---|---|
| 🎯 **Problem Logging** | Log every problem you solve with difficulty, topic, and personal notes |
| 📊 **Dashboards** | Visual breakdown of your solved problems by difficulty and topic |
| 🔥 **Streaks & Heatmap** | GitHub-style activity heatmap and daily streak tracking to build consistency |
| 🤖 **AI Mentor Chat** | Groq-powered DSA coach — hints, concept breakdowns, code review, custom roadmaps |
| 🔐 **Auth** | Secure JWT-based authentication |
| 📈 **History** | Full searchable log of past problems and chat sessions |

## Tech Stack

**Frontend:** React, React Router  
**Backend:** Node.js, Express, MongoDB, Mongoose  
**Auth:** JSON Web Tokens (JWT)  
**AI:** Groq API

## Quick Start

```bash
# Clone
git clone https://github.com/your-username/leettrack.git
cd leettrack

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

**Backend `.env`**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

**Frontend `.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

**Run it**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## License

MIT
