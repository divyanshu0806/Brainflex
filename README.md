# BrainFlex — AI-Powered Exam Prep Platform

> Test. Learn. Conquer.

BrainFlex is a full-stack exam preparation platform for Indian competitive exams (UPSC, SSC, IBPS). The core differentiator is **AI-generated explanations** — when a student answers an MCQ, the app instantly provides a concept overview for their chosen option, whether correct or incorrect, turning every attempt into a learning moment.

🌐 **Live Demo**: [brainflex-omega.vercel.app](https://brainflex-omega.vercel.app)

---

## Features

- **MCQ Practice** — Curated question bank across UPSC, SSC, and IBPS exams
- **AI Explanation Engine** — Powered by Groq (llama-3.3-70b): explains why your answer is right or wrong, with facts and definitions for every option
- **Smart Quiz Flow** — Answer questions sequentially with a progress tracker; AI overview appears immediately after each answer
- **Analytics Dashboard** — Accuracy trends, performance by difficulty, topic-wise strength charts (Recharts)
- **Study Plan Generator** — Pick your target exam and date; get a personalised weekly study schedule
- **Real-time Stats** — Problems solved, completion rate, streaks, accuracy breakdown — all computed from actual attempt data
- **Dark / Light Mode** — Persistent theme preference across sessions
- **Secure Auth** — JWT-based email/password authentication with bcrypt hashing
- **Settings** — Edit profile, change password, appearance preferences

---

## Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React 19 + Vite | UI framework and build tool |
| Tailwind CSS v4 | Utility-first styling with custom design tokens |
| React Router v7 | Client-side routing and protected routes |
| Recharts | Analytics charts (line, bar) |
| Lucide React | Icon library |

### Backend
| Tech | Purpose |
|---|---|
| Node.js + Express | REST API server |
| PostgreSQL (Supabase) | Primary database via Transaction Pooler |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth tokens |
| Groq API | AI explanations (llama-3.3-70b-versatile) |

### Infrastructure
| Service | Purpose |
|---|---|
| Vercel | Frontend deployment (auto-deploy on push) |
| Render | Backend deployment (free tier) |
| Supabase | Hosted PostgreSQL database |
| GitHub | Monorepo version control |

---

## Project Structure

```
brainflex/
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── api/                # Fetch helpers (auth.js, api.js)
│   │   ├── components/         # Reusable UI (GlassCard, FormFields, ProtectedRoute)
│   │   ├── context/            # React contexts (AuthContext, ThemeContext)
│   │   ├── hooks/              # Custom hooks (useStreak, useTheme)
│   │   ├── layouts/            # Page shells (AuthLayout, DashboardLayout)
│   │   └── pages/              # Route components
│   │       ├── SignUp.jsx
│   │       ├── SignIn.jsx
│   │       ├── DashboardHome.jsx
│   │       ├── Problems.jsx
│   │       ├── QuizPage.jsx     # Core quiz + AI explanation flow
│   │       ├── Solved.jsx
│   │       ├── Attempted.jsx
│   │       ├── Analytics.jsx
│   │       ├── StudyPlan.jsx
│   │       └── Settings.jsx
│   └── index.html
│
└── backend/                    # Node.js + Express API
    └── src/
        ├── controllers/
        │   ├── authController.js       # Signup, signin, JWT
        │   ├── questionsController.js  # Questions, answer submission, streaks
        │   ├── explainController.js    # Groq AI explanation pipeline
        │   ├── statsController.js      # Dashboard stats, solved, attempted
        │   ├── analyticsController.js  # Charts data
        │   └── userController.js       # Profile, password, delete account
        ├── routes/
        │   ├── auth.js
        │   ├── questions.js
        │   ├── dashboard.js
        │   └── user.js
        ├── middleware/
        │   └── auth.js                 # JWT verification middleware
        ├── db/
        │   ├── pool.js                 # Supabase connection pool
        │   └── schema.sql              # Full database schema
        └── index.js                    # Express server entry point
```

---

## Database Schema

```
users           — id, name, email, password_hash, phone
exams           — id, name, slug (UPSC, SSC, IBPS, General)
questions       — id, exam_id, topic, difficulty, question_text
options         — id, question_id, option_text, is_correct
user_attempts   — id, user_id, question_id, selected_option_id, is_correct
ai_explanations — id, question_id, option_id, explanation (cached)
streaks         — id, user_id, current_streak, longest_streak, last_active_date
test_sessions   — id, user_id, exam_id, title, score, total_qs
```

---

## AI Explanation Flow

The core product feature works as follows:

**If the student selects the correct answer:**
```
✅ Correct!
─────────────────
AI Overview: [Correct Concept]
• Definition
• Key facts for competitive exams
• Memory tip / mnemonic
```

**If the student selects a wrong answer:**
```
❌ Incorrect — correct answer was [X]
─────────────────
🔴 [Your Answer] — What it actually is, why it's wrong here
🟢 [Correct Answer] — Why this is right, key facts, memory tip
```

Explanations are cached in the `ai_explanations` table after first generation — subsequent users who select the same option get an instant response from cache instead of a new API call.

---

## Running Locally

### Prerequisites
- Node.js 18+
- A Supabase project (free tier)
- A Groq API key (free tier at console.groq.com)

### Backend
```bash
cd backend
npm install
```

Create `.env` (see `.env.example`):
```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-x-region.pooler.supabase.com:6543/postgres
JWT_SECRET=your_random_secret
JWT_EXPIRES_IN=7d
GROQ_API_KEY=gsk_...
CLIENT_URL=http://localhost:5173
PORT=5000
```

Run the schema in Supabase SQL Editor (`backend/src/db/schema.sql`), then:
```bash
npm run dev
```

### Frontend
```bash
cd frontend
npm install
```

Create `.env.local`:
```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | ❌ | Create account |
| POST | `/api/auth/signin` | ❌ | Sign in, get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/questions` | ✅ | List questions with filters |
| GET | `/api/questions/:id` | ✅ | Single question with options |
| POST | `/api/questions/:id/answer` | ✅ | Submit answer, update streak |
| POST | `/api/explain` | ✅ | Get AI explanation (cached) |
| GET | `/api/stats` | ✅ | Dashboard home data |
| GET | `/api/solved` | ✅ | User's solved questions |
| GET | `/api/attempted` | ✅ | User's attempted questions |
| GET | `/api/analytics` | ✅ | Charts and performance data |
| PATCH | `/api/user/profile` | ✅ | Update name/phone |
| PATCH | `/api/user/password` | ✅ | Change password |
| DELETE | `/api/user` | ✅ | Delete account |

---

## Deployment

| Service | Config |
|---|---|
| **Vercel** | Root: `frontend`, Framework: Vite, Env: `VITE_API_URL` |
| **Render** | Root: `backend`, Build: `npm install`, Start: `npm start` |

Both services auto-deploy on every push to the `main` branch.

---

## Author

**Divyanshu Thakur**
B.Tech CSE — I.K. Gujral Punjab Technical University (IKGPTU)

- GitHub: [@divyanshu0806](https://github.com/divyanshu0806)
- Live: [brainflex-omega.vercel.app](https://brainflex-omega.vercel.app)