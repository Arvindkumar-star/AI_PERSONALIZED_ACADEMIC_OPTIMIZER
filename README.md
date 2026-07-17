# 🎓 AI Academic OS

> An AI-Powered Academic Operating System that helps students manage their academic life through intelligent planning, personalized study recommendations, and AI-generated insights.

![React](https://img.shields.io/badge/Frontend-React-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-black)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange)
![JWT](https://img.shields.io/badge/Auth-JWT-red)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🚀 Live Demo

🌐 **Website:** https://ai-personalized-academic-optimizer-1.onrender.com/

🎥 **Demo Video:** https://drive.google.com/file/d/13-9CpFnYyTk7CtHEkYH0CLo4Ad2_uP7u/view

---

# 📖 Overview

AI Academic OS is a full-stack MERN application that acts as a personalized academic assistant for college students.

Instead of simply storing academic information, the application analyzes attendance, subjects, timetable, exams, credits, and study history to generate AI-powered study plans and intelligent academic recommendations.

The project combines traditional academic management with Large Language Models (LLMs) to help students improve productivity, maintain attendance, and prepare efficiently for examinations.

---

# ❗ Problem Statement

College students often struggle to:

- Manage multiple subjects
- Maintain attendance
- Prepare for exams
- Create study schedules
- Prioritize important subjects
- Track academic progress

Existing planners only store information and require students to manually decide what to study.

AI Academic OS solves this by providing personalized AI recommendations based on each student's academic data.

---

# 💡 Features

- 🔐 Secure JWT Authentication
- 👤 Student Profile Management
- 📚 Semester Management
- 📖 Subject Management
- 🗓 Weekly Timetable
- ⏰ Automatic Free Slot Detection
- ✅ Attendance Tracking
- 📝 Exam Planner
- 📊 SGPA Calculation
- ⏱ Study Session Tracker
- 📈 Dashboard Analytics
- 🤖 AI Daily Study Planner
- 🎯 AI Subject Priority Engine
- 🌱 AI Life Optimizer
- 📱 Responsive User Interface

---

# 🤖 AI Features

The AI module analyzes:

- Attendance Percentage
- Subject Difficulty
- Credits
- Exam Dates
- Preparation Status
- Study History
- Weekly Timetable

Based on these inputs, it generates:

- Personalized Daily Study Plans
- Subject Priorities
- Productivity Suggestions
- Academic Improvement Recommendations

---

# 🏗 System Architecture

```
React Frontend
        │
        ▼
 Express Backend
        │
        ▼
 MongoDB Database
        │
        ▼
 Academic Analytics
        │
        ▼
 Google Gemini AI
        │
        ▼
 Personalized Study Plans
```

---

# 🛠 Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- Redux Toolkit
- Axios
- Recharts

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JWT
- bcrypt

### AI

- Google Gemini API
- Prompt Engineering

### Tools

- Git
- GitHub
- VS Code
- Postman

---

# 📂 Project Structure

```
AI-Academic-OS
│
├── client
│   ├── src
│   ├── components
│   ├── pages
│   ├── services
│   └── store
│
├── server
│   ├── controllers
│   ├── services
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── config
│   └── utils
│
└── README.md
```

---

# ⚙ Installation

```bash
git clone <your-github-repository>

cd AI-Academic-OS

npm install

npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the `server` folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret

CLIENT_URL=http://localhost:5173

AI_PROVIDER=gemini

GEMINI_API_KEY=your_api_key
```

---

# 📡 API Modules

- Authentication
- User Profile
- Semester
- Subjects
- Timetable
- Attendance
- Exams
- Study Tracker
- Dashboard
- AI Planner

---

# 🔒 Security

- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Input Validation
- Secure API Access

---

# 🎯 Future Scope

- Assignment Management
- Calendar Integration
- AI Mentor Chatbot
- Placement Preparation
- Mobile Application
- Notifications & Reminders
- Performance Prediction
- Smart Goal Tracking

---

# 🌟 Why AI Academic OS?

Unlike traditional academic planners, AI Academic OS doesn't just store data.

It understands the student's academic profile and generates personalized recommendations using Artificial Intelligence, making study planning smarter, more efficient, and adaptive.

---

# 👨‍💻 Author

**Arvind Kumar**

B.Tech, IIIT Pune

GitHub: https://github.com/Arvindkumar-star

LinkedIn: https://www.linkedin.com/in/arvind-kumar-4364a0338

---

⭐ If you found this project useful, consider giving it a Star on GitHub!
