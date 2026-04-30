# Collaborative Team Hub

A full-stack collaborative platform for teams to manage goals, announcements, and action items in real-time.

## Tech Stack
- **Monorepo**: Turborepo
- **Frontend**: Next.js 14 (App Router, JavaScript), Tailwind CSS, Zustand
- **Backend**: Node.js, Express (TypeScript), Prisma ORM, PostgreSQL
- **Real-time**: Socket.io
- **Auth**: JWT with httpOnly cookies
- **File Storage**: Cloudinary

## Features
- **Workspaces**: Create and switch between multiple workspaces.
- **Goals & Milestones**: Track objectives with progress tracking.
- **Announcements**: Rich-text updates with reactions and comments.
- **Action Items**: Kanban board for task management.
- **Analytics**: Dashboard with charts (Recharts) and data visualization.
- **Real-time**: Live updates for reactions and status changes.

## Advanced Features Built
1. **Optimistic UI**: Implemented in the Goal management section. When a user updates a goal's status, the UI reflects the change instantly using Zustand, while the server syncs in the background. Rollbacks are handled gracefully on failure.
2. **Advanced RBAC**: Granular permission system using database-level roles (Admin/Member) and backend middleware to restrict sensitive actions (like pinning announcements or inviting members).

## Bonus Features
- **Premium Design**: Modern dark-mode aesthetic with glassmorphism and subtle animations.
- **Command Palette**: `Cmd/Ctrl + K` for quick navigation across the hub.
- **Real-time Activity**: Presence system and live notifications via Socket.io.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL database

### Installation
1. Clone the repository and navigate to the project root.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (see below).
4. Run Prisma migrations:
   ```bash
   cd apps/api
   npx prisma migrate dev
   ```
5. Start the development environment:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (`apps/api/.env`)
```env
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (`apps/web/.env`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Known Limitations
- File uploads are currently mocked (Cloudinary credentials needed in .env).
- Mobile responsive view for Kanban board needs further optimization.
