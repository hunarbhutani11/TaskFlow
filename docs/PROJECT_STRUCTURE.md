# TaskFlow — Project Structure

```
taskflow/
├── docs/
│   ├── HLD.md                              # High Level Design document
│   ├── LLD.md                              # Low Level Design document
│   └── PROJECT_STRUCTURE.md                # This file — full project tree
│
├── client/
│   ├── index.html                          # Vite entry HTML with Inter font
│   ├── package.json                        # Client dependencies and scripts
│   ├── vite.config.js                      # Vite configuration with proxy
│   ├── tailwind.config.js                  # Tailwind CSS v3 configuration
│   ├── postcss.config.js                   # PostCSS config for Tailwind
│   ├── .env.example                        # Client environment template
│   └── src/
│       ├── main.jsx                        # React entry — mounts App with providers
│       ├── App.jsx                         # Router setup with auth guards
│       ├── index.css                       # Global CSS + Tailwind directives
│       │
│       ├── api/
│       │   ├── axios.js                    # Axios instance with interceptors
│       │   ├── auth.js                     # Auth API calls (login, signup, getMe)
│       │   ├── projects.js                 # Project CRUD API calls
│       │   ├── tasks.js                    # Task CRUD API calls
│       │   ├── users.js                    # User listing API call
│       │   └── dashboard.js                # Dashboard data API calls
│       │
│       ├── context/
│       │   └── AuthContext.jsx             # Auth state with useReducer + provider
│       │
│       ├── hooks/
│       │   ├── useAuth.js                  # Auth context consumer hook
│       │   ├── useProjects.js              # TanStack Query hooks for projects
│       │   ├── useTasks.js                 # TanStack Query hooks for tasks
│       │   └── useDashboard.js             # TanStack Query hooks for dashboard
│       │
│       ├── schemas/
│       │   ├── auth.schema.js              # Zod schemas for login/signup forms
│       │   ├── project.schema.js           # Zod schema for project form
│       │   └── task.schema.js              # Zod schema for task form
│       │
│       ├── utils/
│       │   ├── cn.js                       # clsx + tailwind-merge utility
│       │   ├── date.js                     # Date formatting helpers (date-fns)
│       │   └── avatar.js                   # Color hash for avatar backgrounds
│       │
│       ├── types/
│       │   └── index.js                    # JSDoc typedefs for User, Project, Task
│       │
│       ├── components/
│       │   ├── ui/
│       │   │   ├── Button.jsx              # Button with variants, sizes, loading
│       │   │   ├── Input.jsx               # Input with label, error, icon
│       │   │   ├── Select.jsx              # Styled dropdown select
│       │   │   ├── Badge.jsx               # Status/priority badge component
│       │   │   ├── Card.jsx                # Card with header, body, footer
│       │   │   ├── Modal.jsx               # Accessible modal with animations
│       │   │   ├── Avatar.jsx              # Initials avatar with color hash
│       │   │   ├── Spinner.jsx             # Loading spinner animation
│       │   │   ├── EmptyState.jsx          # Empty list illustration + message
│       │   │   ├── Skeleton.jsx            # Loading skeleton with shimmer
│       │   │   ├── Tooltip.jsx             # Hover tooltip for icon buttons
│       │   │   ├── DropdownMenu.jsx        # Action dropdown (Edit/Delete)
│       │   │   └── ConfirmDialog.jsx       # Confirmation dialog for deletes
│       │   │
│       │   ├── layout/
│       │   │   ├── AppLayout.jsx           # Main layout with sidebar + header
│       │   │   ├── Sidebar.jsx             # Fixed sidebar with nav links
│       │   │   ├── Header.jsx              # Top header with user menu
│       │   │   ├── PageWrapper.jsx         # Content wrapper with max-width
│       │   │   └── ProtectedRoute.jsx      # Auth guard for protected routes
│       │   │
│       │   └── shared/
│       │       ├── TaskCard.jsx            # Task display card component
│       │       ├── ProjectCard.jsx         # Project card for grid view
│       │       ├── MemberAvatar.jsx        # Member avatar with tooltip
│       │       ├── StatusBadge.jsx         # Task status badge (TODO/IN_PROGRESS/DONE)
│       │       ├── PriorityBadge.jsx       # Task priority badge (LOW/MEDIUM/HIGH)
│       │       ├── TaskModal.jsx           # Create/edit task modal form
│       │       ├── ProjectModal.jsx        # Create/edit project modal form
│       │       └── StatCard.jsx            # Dashboard stat card with icon
│       │
│       └── pages/
│           ├── LoginPage.jsx               # Login page with split layout
│           ├── SignupPage.jsx              # Signup page with role selector
│           ├── DashboardPage.jsx           # Dashboard with charts and stats
│           ├── ProjectsPage.jsx            # Projects grid listing page
│           └── ProjectDetailPage.jsx       # Single project with tasks
│
├── server/
│   ├── package.json                        # Server dependencies and scripts
│   ├── .env.example                        # Server environment template
│   ├── prisma/
│   │   ├── schema.prisma                   # Database schema definition
│   │   └── seed.js                         # Seed script (admin + members + data)
│   └── src/
│       ├── index.js                        # Express app entry + middleware setup
│       │
│       ├── utils/
│       │   ├── logger.js                   # Logger utility (replaces console.log)
│       │   ├── asyncHandler.js             # Async error wrapper for controllers
│       │   ├── response.js                 # Consistent response formatter
│       │   ├── token.js                    # JWT sign/verify helpers
│       │   └── AppError.js                 # Custom error class with statusCode
│       │
│       ├── middleware/
│       │   ├── auth.js                     # JWT verification middleware
│       │   ├── role.js                     # Role-based access middleware
│       │   ├── validate.js                 # Zod schema validation middleware
│       │   └── errorHandler.js             # Global error handler middleware
│       │
│       ├── validators/
│       │   ├── auth.validator.js           # Zod schemas for auth routes
│       │   ├── project.validator.js        # Zod schemas for project routes
│       │   └── task.validator.js           # Zod schemas for task routes
│       │
│       ├── services/
│       │   ├── auth.service.js             # Auth business logic
│       │   ├── project.service.js          # Project business logic
│       │   ├── task.service.js             # Task business logic
│       │   ├── user.service.js             # User business logic
│       │   └── dashboard.service.js        # Dashboard aggregation logic
│       │
│       ├── controllers/
│       │   ├── auth.controller.js          # Auth request handlers
│       │   ├── project.controller.js       # Project request handlers
│       │   ├── task.controller.js          # Task request handlers
│       │   ├── user.controller.js          # User request handlers
│       │   └── dashboard.controller.js     # Dashboard request handlers
│       │
│       └── routes/
│           ├── auth.routes.js              # Auth route definitions
│           ├── project.routes.js           # Project route definitions
│           ├── task.routes.js              # Task route definitions
│           ├── user.routes.js              # User route definitions
│           └── dashboard.routes.js         # Dashboard route definitions
│
├── package.json                            # Root package.json with monorepo scripts
├── railway.json                            # Railway deployment configuration
├── .env.example                            # Root environment template
├── .gitignore                              # Git ignore rules
└── README.md                               # Complete project documentation
```

## File Count Summary

| Directory | Files | Purpose |
|-----------|-------|---------|
| `docs/` | 3 | Design documentation |
| `client/src/api/` | 5 | HTTP client layer |
| `client/src/context/` | 1 | State management |
| `client/src/hooks/` | 4 | Custom React hooks |
| `client/src/schemas/` | 3 | Form validation |
| `client/src/utils/` | 3 | Utility functions |
| `client/src/types/` | 1 | Type definitions |
| `client/src/components/ui/` | 13 | Reusable UI components |
| `client/src/components/layout/` | 5 | App shell components |
| `client/src/components/shared/` | 8 | Domain-specific components |
| `client/src/pages/` | 5 | Page components |
| `server/prisma/` | 2 | Database schema + seed |
| `server/src/utils/` | 5 | Server utilities |
| `server/src/middleware/` | 4 | Express middleware |
| `server/src/validators/` | 3 | Request validation |
| `server/src/services/` | 5 | Business logic |
| `server/src/controllers/` | 5 | Request handlers |
| `server/src/routes/` | 5 | Route definitions |
| **Root** | 4 | Config files |
| **Total** | **~84** | |
