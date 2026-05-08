# Ethara - Modern Team Task Manager 🚀

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://www.mongodb.com/mern-stack)
[![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)](https://github.com/poornima2707/Ethara)

**Ethara** is a premium, high-performance project management solution designed for modern teams. Built with the MERN stack, it features a stunning **Glassmorphism UI**, robust **Role-Based Access Control (RBAC)**, and real-time task synchronization to keep your team productive and aligned.

---

## ✨ Key Features

- 🔐 **Secure Authentication**: JWT-based login and signup with encrypted password storage.
- 👥 **Role-Based Access Control**:
  - **Admins**: Full control over projects, team members, and task assignments.
  - **Members**: Focused view on assigned tasks and personal progress.
- 📊 **Dynamic Dashboard**: Real-time visualization of task statistics, project health, and overdue items.
- 🛠️ **Project & Task Management**: Effortless creation, updating, and tracking of tasks through their lifecycle (To Do → In Progress → Completed).
- 🔔 **Real-time Notifications**: Stay updated with instant alerts for task assignments and status changes.
- 🖼️ **Premium Aesthetics**: Sophisticated dark-mode design with smooth gradients, micro-animations, and a responsive layout.

---

## 🛠️ Tech Stack

### Frontend
- **React.js (Vite)**: For a fast, component-based user interface.
- **Vanilla CSS**: Custom-built design system with modern glassmorphism.
- **Lucide React**: For sleek, consistent iconography.
- **Framer Motion**: For smooth transitions and animations.

### Backend
- **Node.js & Express.js**: Scalable server architecture.
- **MongoDB & Mongoose**: Flexible NoSQL database for complex data relationships.
- **JSON Web Token (JWT)**: Secure stateless authentication.

---

## 🏃 How to Run the Project

To get the project up and running on your local machine, follow these steps exactly. You will need **two terminal windows** open (one for the backend and one for the frontend).

### 1. Prerequisites
- **Node.js**: Ensure you have Node.js installed.
- **MongoDB**: You need a MongoDB Atlas connection string (or a local MongoDB instance).

### 2. Backend Setup (Terminal 1)
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a file named `.env` in the `server` folder and add:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   *You should see a message: "Server running on port 5000" and "MongoDB Connected".*

### 3. Frontend Setup (Terminal 2)
1. Open a new terminal window and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
4. Access the application:
   Once the frontend starts, it will usually be available at `http://localhost:5173`. Open this URL in your browser.

---

## 🌐 Deployment (Railway)

You can easily deploy Ethara on [Railway.app](https://railway.app/). Follow these steps for both Backend and Frontend:

### 1. Backend Deployment
- **Create a new project** on Railway and connect your GitHub repo.
- **Root Directory**: Set this to `server`.
- **Environment Variables**: Add all variables from your `.env` file (`MONGO_URI`, `JWT_SECRET`, etc.).
- **Start Command**: Railway will automatically detect `npm start` or you can set it to `node server.js`.

### 2. Frontend Deployment
- **Create another service** in the same Railway project.
- **Root Directory**: Set this to `client`.
- **Build Command**: `npm run build`.
- **Publish Directory**: `dist`.
- **Environment Variables**:
  - `VITE_API_URL`: Set this to your **Backend's Railway URL** (e.g., `https://ethara-backend.up.railway.app`).

---

## 📁 Project Structure

```text
Ethara/
├── client/           # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── context/
├── server/           # Node.js Backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── middleware/
└── README.md
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---


## 👨‍💻 Author

**Poornima**  
GitHub: [@poornima2707](https://github.com/poornima2707)

---
