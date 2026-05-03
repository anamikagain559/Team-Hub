# 🚀 TeamHub - Collaborative Team Hub

A premium, full-stack collaborative platform designed for high-performance teams to manage goals, announcements, and action items in real-time. Built with a modern aesthetic and robust architecture.

---

## 🔗 Live Deployment Links

| Service | URL |
| :--- | :--- |
| **Frontend (Live Web)** | [https://web-production-12fe.up.railway.app](https://web-production-12fe.up.railway.app) |
| **Backend (API Server)** | [https://api-production-4940.up.railway.app](https://api-production-4940.up.railway.app) |
| **API Documentation (Swagger)** | [https://api-production-4940.up.railway.app/api/docs](https://api-production-4940.up.railway.app/api/docs) |

---

## 🚀 Chosen Advanced Features (Assignment Requirements)

As per the assignment requirements, the following two advanced features have been implemented:

1. **Optimistic UI (Feature #2)**: Actions reflect instantly in the UI before server confirmation. This is prominently implemented in **Goal Status updates** and **Announcement Reactions**, ensuring a lag-free experience. If a server error occurs, the UI gracefully rolls back to the previous state.
2. **Advanced RBAC (Feature #4)**: A granular permission matrix is implemented to control sensitive actions. **System Admins** and **Workspace Admins** have exclusive rights to invite members, manage hub settings, and moderate announcements, while **Members** have restricted access.

---

## ✨ Bonus Features (Extra Credit)

- **🎨 Dark/Light Theme**: Sophisticated dark-mode aesthetic with system preference detection. Built using a custom `ThemeProvider` for a premium look and feel.
- **✉️ Email Notifications**: Automated invitations and system updates via **Nodemailer**. Users receive professional email invites when added to a workspace.
- **⌨️ Keyboard Shortcuts (Cmd+K)**: Interactive **Command Palette** for lightning-fast navigation. Use `Ctrl + K` (Windows) or `Cmd + K` (Mac) to search and jump across the platform.
- **🧪 Testing Infrastructure**: Unit and integration tests set up using **Jest** and **Supertest** to ensure system stability and performance.
- **📖 OpenAPI / Swagger**: Comprehensive API documentation served at `/api/docs` for easy integration and developer reference.
- **💬 Real-time @Mentions**: Advanced rich-text mentions in announcements and comments to keep team members aligned.

---

## 🛠️ Tech Stack

- **Monorepo**: Turborepo (Efficient build system)
- **Frontend**: Next.js 14 (App Router, Zustand, Tailwind CSS, Lucide Icons)
- **Backend**: Node.js, Express (TypeScript), Prisma ORM
- **Database**: PostgreSQL (Hosted on Railway)
- **Real-time**: Socket.io for live updates and presence
- **Auth**: JWT with Secure HTTP-Only Cookies
- **Documentation**: Swagger UI Express

---

## 🚀 Quick Setup & Seeding

### 1. Installation
```bash
npm install
```

### 2. Database Setup & Seeding
To populate the database with a full demo environment (Users, Workspaces, Goals, etc.), run:
```bash
cd apps/api
npx prisma db push
npx prisma db seed
```

### 3. Default Demo Credentials
- **Admin Email**: `admin@teamhub.com`
- **Member Email**: `member@teamhub.com`
- **Password**: `admin123` (for Admin) | `member123` (for Member)

---

## 📂 Project Structure
- `apps/web`: Next.js frontend application
- `apps/api`: Express TypeScript backend
- `packages/ui`: Shared UI components
- `packages/typescript-config`: Shared TS configurations

---

## 👨‍💻 Key Features Implemented
- **Workspaces**: Dynamic creation, editing, and members management.
- **Goals & Milestones**: Detailed progress tracking with a modern UI.
- **Announcements**: Pinned posts, reactions, and real-time comments.
- **Action Items**: A sleek board view for managing personal and team tasks.
- **Optimistic UI**: Instant updates for a seamless user experience.
- **RBAC**: Robust Role-Based Access Control (Admin/Member).

---

Developed with ❤️ for high-performance teams.
