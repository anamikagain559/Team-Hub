# 🚀 TeamHub - Collaborative Team Hub

A premium, full-stack collaborative platform designed for high-performance teams to manage goals, announcements, and action items in real-time. Built with a modern aesthetic, robust monorepo architecture, and optimized for performance.

---

## 🔗 Live Deployment Links

| Service | URL |
| :--- | :--- |
| **Frontend (Live Web)** | [https://web-production-12fe.up.railway.app](https://web-production-12fe.up.railway.app) |
| **Backend (API Server)** | [https://api-production-4940.up.railway.app](https://api-production-4940.up.railway.app) |
| **API Documentation (Swagger)** | [https://api-production-4940.up.railway.app/api/docs](https://api-production-4940.up.railway.app/api/docs) |

---

## 🏗️ Architecture Overview

TeamHub is architected as a **Turborepo Monorepo** for seamless development between the frontend and backend.

- **Frontend (Next.js 14)**: Uses the **App Router** for layout-based navigation and **Zustand** for lightweight, high-performance state management. Styling is powered by **Tailwind CSS** with a custom design system.
- **Backend (Express & TypeScript)**: Follows a modular controller-service-route pattern. **Prisma ORM** manages the PostgreSQL database with type safety.
- **Real-time Layer**: **Socket.io** enables instant updates across clients for mentions, notifications, and goal progress.
- **Infrastructure**: Hosted on **Railway** with CI/CD integration. Images are managed via **Cloudinary**.

---

## 🚀 Advanced Features (Technical Depth)

### 1. Optimistic UI & State Synchronization
We use **Zustand** to implement optimistic updates. When a user changes a goal status or adds a reaction, the UI updates instantly. A background sync process communicates with the API, and if a failure occurs, the state is rolled back gracefully using saved snapshots.

### 2. Granular RBAC (Role-Based Access Control)
The system differentiates between **Global Roles** (Admin/Member) and **Workspace Roles**. Permissions are enforced at both the middleware level (API) and component level (Frontend).
- **Admins**: Can manage all workspaces, users, and system settings.
- **Workspace Admins**: Can invite/remove members and modify workspace details.
- **Members**: Can create goals and announcements within their assigned workspaces.

### 3. Command Palette (Omnibar)
Built with specialized keyboard listeners, the Command Palette (`Cmd+K` or `Ctrl+K`) allows users to navigate the entire application without leaving the keyboard, searching through workspaces, goals, and team members.

---

## 🛠️ Tech Stack

- **Monorepo**: Turborepo
- **Frontend**: Next.js 14, Zustand, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Auth**: JWT with HTTP-Only Cookies
- **File Storage**: Cloudinary
- **Documentation**: Swagger / OpenAPI

---


## 🚀 Quick Setup & Seeding

### 1. Installation
```bash
npm install
```

### 2. Database Setup & Seeding
```bash
cd apps/api
npx prisma db push
npx prisma db seed
```

### 3. Running Development Server
```bash
# From root
npm run dev
```

### 4. Default Demo Credentials
- **Admin Email**: `admin@teamhub.com` (Password: `admin123`)
- **Member Email**: `member@teamhub.com` (Password: `member123`)

---

## 👨‍💻 Key Features List
- ✅ **Dynamic Workspaces**: Create and manage multiple team environments.
- ✅ **Goal Tracking**: Interactive milestones and progress visualization.
- ✅ **Real-time Mentions**: @mention team members in announcements.
- ✅ **Smart Notifications**: Instant alerts for mentions and assignments.
- ✅ **Action Items Board**: Modern task management interface.
- ✅ **Dark Mode**: Premium aesthetic with persistence.

Developed with ❤️ for high-performance teams.
