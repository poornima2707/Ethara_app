# 🚀 Team Task Manager - Full-Stack MERN Project

A high-performance, professional team collaboration tool built for the **Full-Stack Developer Assignment**. This application features a stunning Glassmorphism UI, secure Role-Based Access Control (RBAC), and real-time dashboard analytics.

## ✨ Core Features

### 🔐 1. Secure Authentication & RBAC
- **Multi-Role System:** Distinct workflows for **Admins** and **Team Members**.
- **JWT Security:** Protected routes and secure password hashing with Bcrypt.
- **Session Persistence:** Users stay logged in across refreshes.

### 📊 2. Workplace Insights (Dashboard)
- **Live Statistics:** Track total projects, pending tasks, completed work, and overdue items.
- **Productivity Analytics:** Visual representation of team performance.
- **Recent Activity:** Quick view of the latest tasks across the organization.

### 📁 3. Project Library
- **Admin Management:** Create, update, and delete projects.
- **Team Integration:** Multi-select members for project assignment.
- **Progress Tracking:** Dynamic progress bars based on task completion percentages.

### ✅ 4. Task Central
- **Smart Workspaces:** View tasks filtered by specific projects.
- **Workflow Management:** Drag-and-drop style status updates (Todo, In-Progress, Completed).
- **Prioritization:** Assign Low, Medium, or High priority to every task.

### 👥 5. Team Management (Admin Only)
- **Member Directory:** Full list of registered users.
- **Role Assignment:** Elevate members to Admin or vice-versa.
- **User Removal:** Securely remove users from the organization.

### 🔔 6. Notification System
- **Assignment Alerts:** Members get notified when a task is assigned to them.
- **Status Updates:** Admins receive alerts when members update task statuses.
- **In-App Bell:** Elegant notification dropdown in the top navbar.

## 🛠️ Technology Stack
- **Frontend:** React.js, Framer Motion (Animations), Lucide Icons.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (with Mongoose ODM).
- **Styling:** Custom CSS (Modern Glassmorphism UI).

## 🚀 How to Run Locally

### 1. Backend Setup
```bash
cd server
npm install
npm start
```
*Ensure `.env` contains `MONGO_URI` and `JWT_SECRET`.*

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 📈 Project Workflow (Demo Flow)
1. **Admin Register:** Sign up as an Admin to get full management rights.
2. **Create Team:** Register a few 'Member' users.
3. **Initialize Project:** Create a new project and add members to it.
4. **Assign Work:** Go to Tasks, create items, and assign them to members.
5. **Member Action:** Log in as a Member to see assigned tasks and update status to 'Completed'.
6. **Analytics View:** Check the Admin Dashboard to see the real-time progress update.

---

