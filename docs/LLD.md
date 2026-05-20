# TaskFlow — Low Level Design (LLD)

## 1. API Endpoints

### Auth Routes (`/api/auth`)

| Method | Path | Auth | Role | Request Body | Response | Errors |
|--------|------|------|------|-------------|----------|--------|
| POST | `/api/auth/signup` | ❌ | — | `{ name, email, password, role }` | `{ token, user: { id, name, email, role } }` | 400 Validation, 409 Duplicate email |
| POST | `/api/auth/login` | ❌ | — | `{ email, password }` | `{ token, user: { id, name, email, role } }` | 400 Validation, 401 Invalid credentials |
| GET | `/api/auth/me` | ✅ | Any | — | `{ user: { id, name, email, role, createdAt } }` | 401 Unauthorized |

### Project Routes (`/api/projects`)

| Method | Path | Auth | Role | Request Body | Response | Errors |
|--------|------|------|------|-------------|----------|--------|
| GET | `/api/projects` | ✅ | Any | — | `{ projects: [...] }` | — |
| GET | `/api/projects/:id` | ✅ | Any | — | `{ project: { ...details, members, tasks } }` | 404 Not found |
| POST | `/api/projects` | ✅ | Admin | `{ name, description? }` | `{ project: {...} }` | 400, 403 |
| PUT | `/api/projects/:id` | ✅ | Admin | `{ name?, description? }` | `{ project: {...} }` | 400, 403, 404 |
| DELETE | `/api/projects/:id` | ✅ | Admin | — | `{ message }` | 403, 404 |

### Project Member Routes (`/api/projects/:id/members`)

| Method | Path | Auth | Role | Request Body | Response | Errors |
|--------|------|------|------|-------------|----------|--------|
| POST | `/api/projects/:id/members` | ✅ | Admin | `{ userId }` | `{ member: {...} }` | 400, 403, 404, 409 Already member |
| DELETE | `/api/projects/:id/members/:userId` | ✅ | Admin | — | `{ message }` | 403, 404 |

### Task Routes (`/api/projects/:projectId/tasks`)

| Method | Path | Auth | Role | Request Body | Response | Errors |
|--------|------|------|------|-------------|----------|--------|
| GET | `/api/projects/:projectId/tasks` | ✅ | Any | Query: `status, priority, assigneeId, search` | `{ tasks: [...] }` | 404 Project |
| POST | `/api/projects/:projectId/tasks` | ✅ | Admin | `{ title, description?, assignedToId?, priority?, status?, dueDate? }` | `{ task: {...} }` | 400, 403, 404 |
| PUT | `/api/tasks/:id` | ✅ | Admin | `{ title?, description?, assignedToId?, priority?, status?, dueDate? }` | `{ task: {...} }` | 400, 403, 404 |
| PATCH | `/api/tasks/:id/status` | ✅ | Any | `{ status }` | `{ task: {...} }` | 400, 403, 404 |
| DELETE | `/api/tasks/:id` | ✅ | Admin | — | `{ message }` | 403, 404 |

### User Routes (`/api/users`)

| Method | Path | Auth | Role | Request Body | Response | Errors |
|--------|------|------|------|-------------|----------|--------|
| GET | `/api/users` | ✅ | Admin | — | `{ users: [...] }` | 403 |

### Dashboard Routes (`/api/dashboard`)

| Method | Path | Auth | Role | Request Body | Response | Errors |
|--------|------|------|------|-------------|----------|--------|
| GET | `/api/dashboard/stats` | ✅ | Any | — | `{ totalTasks, inProgress, completed, overdue }` | — |
| GET | `/api/dashboard/charts` | ✅ | Any | — | `{ tasksByProject, tasksByStatus }` | — |
| GET | `/api/dashboard/overdue` | ✅ | Any | — | `{ tasks: [...] }` | — |
| GET | `/api/dashboard/activity` | ✅ | Any | — | `{ activities: [...] }` | — |

---

## 2. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  MEMBER
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

model User {
  id              String          @id @default(cuid())
  name            String
  email           String          @unique
  passwordHash    String
  role            Role            @default(MEMBER)
  createdAt       DateTime        @default(now())
  projectsCreated Project[]       @relation("CreatedBy")
  projectMembers  ProjectMember[]
  tasksCreated    Task[]          @relation("TaskCreatedBy")
  tasksAssigned   Task[]          @relation("TaskAssignedTo")
}

model Project {
  id          String          @id @default(cuid())
  name        String
  description String?
  createdBy   User            @relation("CreatedBy", fields: [createdById], references: [id])
  createdById String
  createdAt   DateTime        @default(now())
  members     ProjectMember[]
  tasks       Task[]
}

model ProjectMember {
  id        String   @id @default(cuid())
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  joinedAt  DateTime @default(now())

  @@unique([projectId, userId])
}

model Task {
  id           String     @id @default(cuid())
  title        String
  description  String?
  status       TaskStatus @default(TODO)
  priority     Priority   @default(MEDIUM)
  dueDate      DateTime?
  project      Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId    String
  assignedTo   User?      @relation("TaskAssignedTo", fields: [assignedToId], references: [id])
  assignedToId String?
  createdBy    User       @relation("TaskCreatedBy", fields: [createdById], references: [id])
  createdById  String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}
```

---

## 3. Middleware Chain

### Public Routes (No Auth)
```
Request → CORS → Helmet → Morgan → JSON Parser → Rate Limiter → Validate(schema) → Controller
```

### Auth-Only Routes
```
Request → CORS → Helmet → Morgan → JSON Parser → authMiddleware → Validate(schema) → Controller
```

### Admin-Only Routes
```
Request → CORS → Helmet → Morgan → JSON Parser → authMiddleware → roleMiddleware('ADMIN') → Validate(schema) → Controller
```

### Error Pipeline (All Routes)
```
Any Error → errorHandler → { success: false, error: message, statusCode }
```

---

## 4. Controller Function Signatures

### AuthController
```js
signup(req, res)    // POST /api/auth/signup
login(req, res)     // POST /api/auth/login
getMe(req, res)     // GET /api/auth/me
```

### ProjectController
```js
getAll(req, res)       // GET /api/projects
getById(req, res)      // GET /api/projects/:id
create(req, res)       // POST /api/projects
update(req, res)       // PUT /api/projects/:id
remove(req, res)       // DELETE /api/projects/:id
addMember(req, res)    // POST /api/projects/:id/members
removeMember(req, res) // DELETE /api/projects/:id/members/:userId
```

### TaskController
```js
getByProject(req, res)   // GET /api/projects/:projectId/tasks
create(req, res)         // POST /api/projects/:projectId/tasks
update(req, res)         // PUT /api/tasks/:id
updateStatus(req, res)   // PATCH /api/tasks/:id/status
remove(req, res)         // DELETE /api/tasks/:id
```

### UserController
```js
getAll(req, res)  // GET /api/users
```

### DashboardController
```js
getStats(req, res)     // GET /api/dashboard/stats
getCharts(req, res)    // GET /api/dashboard/charts
getOverdue(req, res)   // GET /api/dashboard/overdue
getActivity(req, res)  // GET /api/dashboard/activity
```

---

## 5. Service Layer Functions

### AuthService
```js
signup({ name, email, password, role })    → { token, user }
login({ email, password })                 → { token, user }
getMe(userId)                              → { user }
```

### ProjectService
```js
getAll(userId, role)                        → [projects]
getById(projectId, userId, role)            → project (with members + tasks)
create({ name, description, createdById })  → project
update(projectId, { name, description })    → project
remove(projectId)                           → void
addMember(projectId, userId)                → member
removeMember(projectId, userId)             → void
```

### TaskService
```js
getByProject(projectId, filters, userId, role) → [tasks]
create(projectId, { title, description, assignedToId, priority, status, dueDate, createdById }) → task
update(taskId, data, userId, role)              → task
updateStatus(taskId, status, userId, role)      → task
remove(taskId)                                  → void
```

### UserService
```js
getAll() → [users] (without passwordHash)
```

### DashboardService
```js
getStats(userId, role)    → { totalTasks, inProgress, completed, overdue }
getCharts(userId, role)   → { tasksByProject, tasksByStatus }
getOverdue(userId, role)  → [tasks]
getActivity(userId, role) → [activities]
```

---

## 6. Frontend Component Tree

```
<App>
├── <AuthProvider>
│   ├── <BrowserRouter>
│   │   ├── <QueryClientProvider>
│   │   │   ├── Routes
│   │   │   │   ├── /login → <LoginPage>
│   │   │   │   │   ├── <BrandPanel>
│   │   │   │   │   └── <LoginForm>
│   │   │   │   │       ├── <Input> (email)
│   │   │   │   │       ├── <Input> (password)
│   │   │   │   │       └── <Button> (submit)
│   │   │   │   │
│   │   │   │   ├── /signup → <SignupPage>
│   │   │   │   │   ├── <BrandPanel>
│   │   │   │   │   └── <SignupForm>
│   │   │   │   │       ├── <Input> (name)
│   │   │   │   │       ├── <Input> (email)
│   │   │   │   │       ├── <Input> (password)
│   │   │   │   │       ├── <RoleToggle>
│   │   │   │   │       └── <Button> (submit)
│   │   │   │   │
│   │   │   │   ├── <ProtectedRoute>
│   │   │   │   │   └── <AppLayout>
│   │   │   │   │       ├── <Sidebar>
│   │   │   │   │       │   ├── Logo
│   │   │   │   │       │   ├── <NavLinks>
│   │   │   │   │       │   └── <UserInfo>
│   │   │   │   │       ├── <Header>
│   │   │   │   │       │   ├── Page Title
│   │   │   │   │       │   ├── <MobileMenuButton>
│   │   │   │   │       │   └── <UserMenu>
│   │   │   │   │       │       ├── <Avatar>
│   │   │   │   │       │       └── <DropdownMenu>
│   │   │   │   │       └── <PageWrapper>
│   │   │   │   │           └── <Outlet> (nested routes)
│   │   │   │   │
│   │   │   │   ├── /dashboard → <DashboardPage>
│   │   │   │   │   ├── <StatCard> × 4
│   │   │   │   │   ├── <TasksByProjectChart> (BarChart)
│   │   │   │   │   ├── <TasksByStatusChart> (PieChart)
│   │   │   │   │   ├── <OverdueTasksTable>
│   │   │   │   │   │   └── <TaskRow> (repeating)
│   │   │   │   │   └── <RecentActivityFeed>
│   │   │   │   │       └── <ActivityItem> (repeating)
│   │   │   │   │
│   │   │   │   ├── /projects → <ProjectsPage>
│   │   │   │   │   ├── <SearchBar>
│   │   │   │   │   ├── <Button> (+ New Project, admin only)
│   │   │   │   │   ├── <ProjectCard> (repeating grid)
│   │   │   │   │   │   ├── <Badge> (task count)
│   │   │   │   │   │   ├── <Avatar> × 3 (members)
│   │   │   │   │   │   ├── <ProgressBar>
│   │   │   │   │   │   └── <DropdownMenu> (admin only)
│   │   │   │   │   ├── <EmptyState>
│   │   │   │   │   └── <ProjectModal>
│   │   │   │   │       ├── <Input> (name)
│   │   │   │   │       ├── <Input> (description)
│   │   │   │   │       └── <Button> (save)
│   │   │   │   │
│   │   │   │   └── /projects/:id → <ProjectDetailPage>
│   │   │   │       ├── <ProjectHeader>
│   │   │   │       ├── <MembersPanel>
│   │   │   │       │   ├── <MemberAvatar> (repeating)
│   │   │   │       │   └── <Select> (add member, admin)
│   │   │   │       ├── <TaskFilters>
│   │   │   │       │   ├── <Select> (status)
│   │   │   │       │   ├── <Select> (priority)
│   │   │   │       │   ├── <Select> (assignee)
│   │   │   │       │   └── <Input> (search)
│   │   │   │       ├── <TaskCard> (repeating)
│   │   │   │       │   ├── <StatusBadge>
│   │   │   │       │   ├── <PriorityBadge>
│   │   │   │       │   ├── <Avatar> (assignee)
│   │   │   │       │   └── <DropdownMenu> (admin)
│   │   │   │       ├── <EmptyState>
│   │   │   │       └── <TaskModal>
│   │   │   │           ├── <Input> (title)
│   │   │   │           ├── <Input> (description)
│   │   │   │           ├── <Select> (assignee)
│   │   │   │           ├── <Select> (priority)
│   │   │   │           ├── <Select> (status)
│   │   │   │           ├── <Input> (due date)
│   │   │   │           └── <Button> (save)
│   │   │   │
│   │   │   └── <Toaster> (react-hot-toast)
```

---

## 7. React Router Route Map

```js
<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />

  {/* Protected Routes (requires auth) */}
  <Route element={<ProtectedRoute />}>
    <Route element={<AppLayout />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
    </Route>
  </Route>

  {/* Catch-all */}
  <Route path="/" element={<Navigate to="/dashboard" />} />
  <Route path="*" element={<Navigate to="/dashboard" />} />
</Routes>
```

### Auth Guards:
- `<ProtectedRoute>`: Checks for valid token in AuthContext → redirect to `/login` if missing
- Public routes: Redirect to `/dashboard` if already authenticated

---

## 8. State Management Design

### AuthContext (Context + useReducer)

```js
// State shape
{
  user: null | { id, name, email, role },
  token: null | string,
  isAuthenticated: boolean,
  isLoading: boolean
}

// Actions
{ type: 'AUTH_START' }
{ type: 'AUTH_SUCCESS', payload: { user, token } }
{ type: 'AUTH_FAILURE' }
{ type: 'LOGOUT' }
{ type: 'LOAD_USER', payload: { user } }

// Persistence: token stored in localStorage
// On mount: check localStorage → validate token → load user
```

### TanStack Query Keys
```js
['projects']                          // All projects list
['projects', projectId]               // Single project detail
['projects', projectId, 'tasks']      // Tasks for a project
['users']                             // All users (admin)
['dashboard', 'stats']                // Dashboard stats
['dashboard', 'charts']               // Dashboard charts
['dashboard', 'overdue']              // Overdue tasks
['dashboard', 'activity']             // Recent activity
```

---

## 9. Zod Validation Schemas

### Backend Schemas (`server/src/validators/`)

```js
// auth.validator.js
signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['ADMIN', 'MEMBER']).optional()
})

loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

// project.validator.js
createProjectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional()
})

updateProjectSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional()
})

addMemberSchema = z.object({
  userId: z.string().cuid()
})

// task.validator.js
createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  assignedToId: z.string().cuid().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  dueDate: z.string().datetime().optional().nullable()
})

updateTaskSchema = createTaskSchema.partial()

updateStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'])
})
```

### Frontend Schemas (`client/src/schemas/`)

```js
// auth.schema.js
loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'MEMBER'])
})

// project.schema.js
projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().max(500).optional()
})

// task.schema.js
taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(1000).optional(),
  assignedToId: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  dueDate: z.string().optional().nullable()
})
```

---

## 10. Error Handling Strategy

### Backend
```
Global Error Handler catches all:
  ├── Zod Validation Error → 400 { error: "Validation failed", details: [...] }
  ├── Prisma Known Error   → 400/404/409 (mapped from error codes)
  ├── JWT Error            → 401 { error: "Invalid or expired token" }
  ├── Custom AppError      → statusCode { error: message }
  └── Unknown Error        → 500 { error: "Internal server error" }

Consistent response format:
  Success: { success: true, data: {...} }
  Error:   { success: false, error: "message", statusCode: 400, details?: [...] }
```

### Frontend
```
TanStack Query handles:
  ├── isLoading → Show <Skeleton> components
  ├── isError   → Show error toast + error message
  ├── isSuccess → Render data
  └── onError callback → react-hot-toast notification

Axios interceptor:
  ├── 401 → Auto logout + redirect to /login
  └── Other errors → Pass to TanStack Query error handler
```

---

## 11. Environment Variables

### Server (`.env`)
| Variable | Type | Description |
|----------|------|-------------|
| `DATABASE_URL` | string | PostgreSQL connection string |
| `JWT_SECRET` | string | Secret key for JWT signing (min 32 chars) |
| `PORT` | number | Server port (default 5000) |
| `NODE_ENV` | string | `development` or `production` |
| `CLIENT_URL` | string | Frontend URL for CORS |

### Client (`.env`)
| Variable | Type | Description |
|----------|------|-------------|
| `VITE_API_URL` | string | Backend API base URL |
