# ⚡ TaskFlow — Team Task Manager

> A modern, production-ready team task management application with role-based access control, project tracking, and analytics dashboard.

---

## ✨ Features

- [x] 🔐 **JWT Authentication** — Secure signup/login with token-based auth
- [x] 👥 **Role-Based Access Control** — Admin & Member roles with granular permissions
- [x] 📁 **Project Management** — Create, edit, delete projects with team members
- [x] ✅ **Task Management** — Full CRUD with status, priority, assignee, due dates
- [x] 📊 **Analytics Dashboard** — Charts, stats, overdue tracking, activity feed
- [x] 🎨 **Modern Dark UI** — Premium SaaS-grade design with glass morphism
- [x] 📱 **Fully Responsive** — Mobile-first with collapsible sidebar
- [x] 🔍 **Search & Filters** — Filter tasks by status, priority, assignee
- [x] 🛡️ **Security** — Helmet, CORS, rate limiting, bcrypt, Zod validation
- [x] 🚀 **Vercel & Render Ready** — Optimized for split deployment

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS v3, React Router v6 |
| **State** | TanStack Query v5, Context + useReducer |
| **Forms** | React Hook Form + Zod validation |
| **Charts** | Recharts (Bar + Donut) |
| **Icons** | Lucide React |
| **HTTP** | Axios with interceptors |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT (jsonwebtoken) + bcrypt |
| **Security** | Helmet, CORS, express-rate-limit |
| **Logging** | Morgan + custom logger |
| **Deploy** | Vercel (Client) + Render (Server) |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd taskflow

# 2. Install all dependencies
npm run install:all

# 3. Set up environment variables
cp .env.example server/.env
# Edit server/.env with your DATABASE_URL and JWT_SECRET

# 4. Run database migrations
cd server
npx prisma migrate dev --name init
cd ..

# 5. Seed the database
npm run prisma:seed

# 6. Start development servers
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🌐 Deployment Setup (Vercel & Render)

### Backend (Render)
1. Push your code to GitHub.
2. Create a new Web Service on Render and connect your repo.
3. Root directory: `server`
4. Build command: `npm install && npx prisma generate`
5. Start command: `node src/index.js`
6. Add Environment Variables:
   - `DATABASE_URL` (your Neon PostgreSQL URL)
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-frontend.vercel.app` (Your Vercel URL without a trailing slash)

### Frontend (Vercel)
1. Create a new Project on Vercel and connect your repo.
2. Framework Preset: `Vite`
3. Root directory: `client`
4. Build command: `npm run build`
5. Add Environment Variables:
   - `VITE_API_URL=https://your-backend.onrender.com/api` (Your Render URL ending in /api)

---

## 📡 API Documentation

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login user |
| GET | `/api/auth/me` | ✅ | Get current user |

### Projects
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/projects` | ✅ | Any | List projects |
| GET | `/api/projects/:id` | ✅ | Any | Get project detail |
| POST | `/api/projects` | ✅ | Admin | Create project |
| PUT | `/api/projects/:id` | ✅ | Admin | Update project |
| DELETE | `/api/projects/:id` | ✅ | Admin | Delete project |
| POST | `/api/projects/:id/members` | ✅ | Admin | Add member |
| DELETE | `/api/projects/:id/members/:userId` | ✅ | Admin | Remove member |

### Tasks
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/projects/:id/tasks` | ✅ | Any | List tasks (with filters) |
| POST | `/api/projects/:id/tasks` | ✅ | Admin | Create task |
| PUT | `/api/tasks/:id` | ✅ | Admin | Update task |
| PATCH | `/api/tasks/:id/status` | ✅ | Any | Update task status |
| DELETE | `/api/tasks/:id` | ✅ | Admin | Delete task |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/stats` | ✅ | Get stats (total, progress, done, overdue) |
| GET | `/api/dashboard/charts` | ✅ | Get chart data |
| GET | `/api/dashboard/overdue` | ✅ | Get overdue tasks |
| GET | `/api/dashboard/activity` | ✅ | Get recent activity |

### Users
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/users` | ✅ | Admin | List all users |

---

## 🔑 Default Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@taskflow.com` | `Admin@1234` |
| Member | `sarah@taskflow.com` | `Member@1234` |
| Member | `mike@taskflow.com` | `Member@1234` |

---

## 📐 Design Documents

- [High Level Design (HLD)](./docs/HLD.md)
- [Low Level Design (LLD)](./docs/LLD.md)
- [Project Structure](./docs/PROJECT_STRUCTURE.md)

---

## 📸 Screenshots

> Screenshots will be added after deployment.

---

## 📄 License

MIT License — feel free to use this project for learning and portfolio purposes.
