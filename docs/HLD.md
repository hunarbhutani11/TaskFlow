# TaskFlow — High Level Design (HLD)

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        TASKFLOW SYSTEM                          │
│                                                                 │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │              │    │                  │    │              │  │
│  │   React SPA  │───▶│  Express.js API  │───▶│  PostgreSQL  │  │
│  │   (Vite)     │◀───│  (REST + JWT)    │◀───│  (Prisma)    │  │
│  │              │    │                  │    │              │  │
│  └──────────────┘    └──────────────────┘    └──────────────┘  │
│     Port 5173           Port 5000             Port 5432        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Architecture Pattern

- **Monorepo**: Single repository with `/client` and `/server` at root
- **REST API**: Standard HTTP methods for CRUD operations
- **MVC + Service Layer**: Strict separation of concerns

```
┌──────────┐   ┌────────────┐   ┌────────────┐   ┌──────────┐   ┌────────┐
│  Client   │──▶│  Routes    │──▶│ Controller │──▶│ Service  │──▶│ Prisma │
│  (React)  │◀──│  (Express) │◀──│            │◀──│  Layer   │◀──│  ORM   │
└──────────┘   └────────────┘   └────────────┘   └──────────┘   └────────┘
                    │                                                │
                    ▼                                                ▼
              ┌────────────┐                                  ┌────────────┐
              │ Middleware │                                  │ PostgreSQL │
              │ (Auth,     │                                  │  Database  │
              │  Validate, │                                  └────────────┘
              │  Error)    │
              └────────────┘
```

## 3. Component Breakdown

### Frontend (Client)
```
React SPA
├── Pages (Login, Signup, Dashboard, Projects, ProjectDetail)
├── Components
│   ├── UI (Button, Input, Modal, Badge, Card, etc.)
│   ├── Layout (Sidebar, Header, PageWrapper)
│   └── Shared (TaskCard, ProjectCard, StatusBadge, etc.)
├── Context (AuthContext — useReducer pattern)
├── Hooks (useAuth, useProjects, useTasks, useDashboard)
├── API Layer (Axios instance + interceptors)
└── Schemas (Zod validation for forms)
```

### Backend (Server)
```
Express.js Server
├── Routes → Define endpoints, attach middleware
├── Controllers → Parse request, call service, send response
├── Services → Business logic, DB queries via Prisma
├── Middleware
│   ├── authMiddleware → Verify JWT, attach user
│   ├── roleMiddleware → Check user role
│   ├── validate → Zod schema validation
│   └── errorHandler → Global error catching
├── Validators → Zod schemas per resource
└── Utils → Logger, token helper, async handler, response formatter
```

## 4. Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SIGNUP FLOW                               │
│                                                             │
│  User ──▶ POST /api/auth/signup                             │
│           { name, email, password, role }                   │
│                    │                                        │
│                    ▼                                        │
│           ┌─────────────────┐                               │
│           │ Validate (Zod)  │                               │
│           └────────┬────────┘                               │
│                    ▼                                        │
│           ┌─────────────────┐                               │
│           │ Check duplicate │──▶ 409 Conflict               │
│           │ email           │                               │
│           └────────┬────────┘                               │
│                    ▼                                        │
│           ┌─────────────────┐                               │
│           │ bcrypt hash     │                               │
│           │ password (12)   │                               │
│           └────────┬────────┘                               │
│                    ▼                                        │
│           ┌─────────────────┐                               │
│           │ Create User     │                               │
│           │ in PostgreSQL   │                               │
│           └────────┬────────┘                               │
│                    ▼                                        │
│           ┌─────────────────┐                               │
│           │ Generate JWT    │                               │
│           │ (7 day expiry)  │                               │
│           └────────┬────────┘                               │
│                    ▼                                        │
│           Return { token, user }                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                                │
│                                                             │
│  User ──▶ POST /api/auth/login                              │
│           { email, password }                               │
│                    │                                        │
│                    ▼                                        │
│           ┌─────────────────┐                               │
│           │ Find user by    │──▶ 401 Invalid credentials    │
│           │ email           │                               │
│           └────────┬────────┘                               │
│                    ▼                                        │
│           ┌─────────────────┐                               │
│           │ bcrypt.compare  │──▶ 401 Invalid credentials    │
│           │ password        │                               │
│           └────────┬────────┘                               │
│                    ▼                                        │
│           ┌─────────────────┐                               │
│           │ Generate JWT    │                               │
│           └────────┬────────┘                               │
│                    ▼                                        │
│           Return { token, user }                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                PROTECTED ROUTE FLOW                          │
│                                                             │
│  Client ──▶ Request with Authorization: Bearer <token>      │
│                    │                                        │
│                    ▼                                        │
│           ┌─────────────────┐                               │
│           │ authMiddleware  │                               │
│           │ Verify JWT      │──▶ 401 Unauthorized           │
│           │ Decode payload  │                               │
│           │ Attach req.user │                               │
│           └────────┬────────┘                               │
│                    ▼                                        │
│           ┌─────────────────┐                               │
│           │ roleMiddleware  │ (if admin-only route)         │
│           │ Check role      │──▶ 403 Forbidden              │
│           └────────┬────────┘                               │
│                    ▼                                        │
│           Controller ──▶ Service ──▶ Database                │
└─────────────────────────────────────────────────────────────┘
```

## 5. Role-Based Access Control (RBAC)

```
                    ┌──────────┐
                    │ Request  │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ Is user  │
                    │ logged   │──── No ──▶ 401 Unauthorized
                    │ in?      │
                    └────┬─────┘
                         │ Yes
                    ┌────▼─────┐
                    │ What is  │
                    │ the      │
                    │ action?  │
                    └────┬─────┘
                         │
           ┌─────────────┼──────────────┐
           │             │              │
      ┌────▼────┐   ┌───▼────┐   ┌─────▼─────┐
      │  Read   │   │ Write  │   │  Update   │
      │  Data   │   │ Create │   │  Status   │
      └────┬────┘   │ Delete │   │  Only     │
           │        └───┬────┘   └─────┬─────┘
           │            │              │
      ┌────▼────┐  ┌───▼────┐   ┌─────▼─────┐
      │ ADMIN:  │  │ ADMIN  │   │ ADMIN: ✅  │
      │ All     │  │ ONLY   │   │ MEMBER: ✅ │
      │ MEMBER: │  │ ✅     │   │ (own tasks │
      │ Own     │  │        │   │  only)     │
      └─────────┘  └────────┘   └───────────┘
```

## 6. Database ER Diagram

```
┌──────────────────┐       ┌───────────────────┐       ┌──────────────────┐
│      USER        │       │     PROJECT        │       │      TASK        │
├──────────────────┤       ├───────────────────┤       ├──────────────────┤
│ id          PK   │       │ id           PK   │       │ id          PK   │
│ name             │       │ name              │       │ title            │
│ email       UQ   │       │ description       │       │ description      │
│ passwordHash     │◀──┐   │ createdById  FK   │──┐    │ status           │
│ role             │   │   │ createdAt         │  │    │ priority         │
│ createdAt        │   │   └───────┬───────────┘  │    │ dueDate          │
└──────────┬───────┘   │           │              │    │ projectId   FK   │──┐
           │           │           │              │    │ assignedToId FK  │  │
           │           │    ┌──────▼──────────┐   │    │ createdById FK   │  │
           │           │    │ PROJECT_MEMBER   │   │    │ createdAt        │  │
           │           │    ├─────────────────┤   │    │ updatedAt        │  │
           │           │    │ id         PK   │   │    └──────────────────┘  │
           │           ├───▶│ projectId  FK   │   │              │           │
           │           │    │ userId     FK   │◀──┘              │           │
           └───────────┼───▶│ joinedAt        │                  │           │
                       │    │ @@unique        │                  │           │
                       │    │ [projectId,     │                  │           │
                       │    │  userId]        │                  │           │
                       │    └─────────────────┘                  │           │
                       │                                         │           │
                       └─────────────────────────────────────────┘           │
                              (assignedTo, createdBy)                       │
                                                                            │
                       ┌────────────────────────────────────────────────────┘
                       │  (project has many tasks)
                       ▼
```

### Relations:
- **User → Project**: One-to-Many (createdBy)
- **User ↔ Project**: Many-to-Many (through ProjectMember)
- **User → Task**: One-to-Many (createdBy, assignedTo)
- **Project → Task**: One-to-Many
- **Project → ProjectMember**: One-to-Many (cascade delete)

### Enums:
- `Role`: ADMIN, MEMBER
- `TaskStatus`: TODO, IN_PROGRESS, DONE
- `Priority`: LOW, MEDIUM, HIGH

## 7. Deployment Architecture (Railway)

```
┌─────────────────────────────────────────────────────────┐
│                    RAILWAY PLATFORM                      │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Single Service                       │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │          Express.js Server                  │  │  │
│  │  │                                             │  │  │
│  │  │  /api/*  ──▶  REST API Routes               │  │  │
│  │  │                                             │  │  │
│  │  │  /*      ──▶  Static Files (client/dist/)   │  │  │
│  │  │               ├── index.html                │  │  │
│  │  │               ├── assets/                   │  │  │
│  │  │               └── (SPA catch-all)           │  │  │
│  │  └─────────────────────┬───────────────────────┘  │  │
│  │                        │                          │  │
│  └────────────────────────┼──────────────────────────┘  │
│                           │                             │
│  ┌────────────────────────▼──────────────────────────┐  │
│  │          PostgreSQL (Railway Plugin)               │  │
│  │          Auto-provisioned database                 │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Build: cd client && npm install && npm run build        │
│  Start: node server/src/index.js                        │
└─────────────────────────────────────────────────────────┘
```

## 8. Data Flow

```
REQUEST LIFECYCLE:

Browser ──▶ HTTP Request
               │
               ▼
         ┌──────────┐
         │  CORS     │ ── Block if origin not allowed
         │  Helmet   │ ── Set security headers
         │  Morgan   │ ── Log request
         │  JSON     │ ── Parse body
         └────┬─────┘
              ▼
         ┌──────────┐
         │  Router   │ ── Match route pattern
         └────┬─────┘
              ▼
         ┌──────────┐
         │  Auth MW  │ ── Verify JWT (if protected)
         └────┬─────┘
              ▼
         ┌──────────┐
         │  Role MW  │ ── Check permission (if admin-only)
         └────┬─────┘
              ▼
         ┌──────────┐
         │ Validate  │ ── Zod schema validation
         └────┬─────┘
              ▼
         ┌──────────┐
         │Controller │ ── Extract params, call service
         └────┬─────┘
              ▼
         ┌──────────┐
         │ Service   │ ── Business logic
         └────┬─────┘
              ▼
         ┌──────────┐
         │  Prisma   │ ── Query builder → SQL
         └────┬─────┘
              ▼
         ┌──────────┐
         │PostgreSQL │ ── Execute query
         └────┬─────┘
              ▼
         Response ──▶ Browser
         { success: true, data: {...} }
```

## 9. Scalability Considerations

| Concern | Solution |
|---------|----------|
| Database connections | Prisma connection pooling (default) |
| API rate limiting | `express-rate-limit` on auth routes (20/15min) |
| Query performance | Prisma `select` to avoid over-fetching; indexes on FKs |
| Static asset serving | Vite production build with hashed filenames for caching |
| Horizontal scaling | Stateless JWT auth — no server-side sessions |
| Database scaling | Railway PostgreSQL with auto-scaling |
| Monorepo builds | Single build command builds client → served by Express |

## 10. Security Considerations

| Threat | Mitigation |
|--------|------------|
| SQL Injection | Prisma ORM — parameterized queries by default |
| XSS | React auto-escapes JSX; Helmet sets X-XSS-Protection |
| CSRF | JWT in Authorization header (not cookies) |
| Brute Force | Rate limiting on auth routes |
| Password Exposure | bcrypt hashing (12 rounds); never return passwordHash |
| Token Theft | JWT expiry (7 days); HTTPS in production |
| CORS Abuse | Configured CORS — only allow CLIENT_URL |
| Header Attacks | Helmet sets security headers (HSTS, CSP, etc.) |
| Mass Assignment | Zod validation on all inputs — only allow expected fields |
| Information Leakage | Consistent error format; no stack traces in production |
