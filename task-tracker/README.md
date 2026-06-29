# TaskTracker — MERN Stack Task Management App

A full-stack task tracker built with MongoDB, Express.js, React, and Node.js.

## Features

### Mandatory
- ✅ Full CRUD — Create, Read, Update, Delete tasks
- ✅ Form validation (client-side + server-side via `express-validator`)
- ✅ REST API with proper HTTP methods and status codes
- ✅ MongoDB integration via Mongoose
- ✅ Responsive UI (mobile-first, works on all screen sizes)
- ✅ Dynamic updates without page refresh (React state + axios)

### Bonus
- 🔍 Search tasks by title, description, or tags
- 🔽 Filter by status and priority
- ↕️ Sort by date, title, priority, or due date
- 📊 Live stats dashboard (total, todo, in-progress, completed)
- 🔔 Toast notifications for all actions (react-hot-toast)
- 🌙 Dark / Light mode with persistence
- ⚡ One-click status cycling directly from the card
- ⚠️ Overdue & due-today date highlighting
- 🏷️ Tag support
- ♻️ Reusable components (Badge, TaskCard, FilterBar, StatsBar, etc.)
- 🔒 Environment variables for all sensitive config
- 🗑️ Two-click delete confirmation (prevents accidental deletes)

---

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | React 18 + Vite         |
| Styling   | Custom CSS (no UI lib)  |
| HTTP      | Axios                   |
| Backend   | Node.js + Express.js    |
| Database  | MongoDB + Mongoose      |
| Validation| express-validator       |
| Notifications | react-hot-toast    |
| Icons     | react-icons             |

---

## Project Structure

```
task-tracker/
├── server/
│   ├── controllers/
│   │   └── taskController.js   # CRUD logic + stats
│   ├── middleware/
│   │   ├── validate.js         # Request validation rules
│   │   └── errorHandler.js     # Global error handler
│   ├── models/
│   │   └── Task.js             # Mongoose schema
│   ├── routes/
│   │   └── tasks.js            # Express router
│   ├── .env                    # Environment variables (not committed)
│   ├── .env.example
│   └── server.js               # App entry point
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Badge.jsx        # Reusable status/priority badge
    │   │   ├── FilterBar.jsx    # Search + filter + sort controls
    │   │   ├── Header.jsx       # App header with dark mode toggle
    │   │   ├── StatsBar.jsx     # Statistics dashboard
    │   │   ├── TaskCard.jsx     # Individual task card
    │   │   ├── TaskForm.jsx     # Create/edit modal form
    │   │   └── TaskList.jsx     # Grid of task cards
    │   ├── hooks/
    │   │   └── useTasks.js      # Custom hook for all task logic
    │   ├── services/
    │   │   └── api.js           # Axios API client
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    └── .env.example
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd task-tracker
npm run install:all
```

### 2. Configure Environment

**server/.env**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/tasktracker
NODE_ENV=development
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Locally

```bash
# From root — starts both server and client concurrently
npm run dev

# Or separately:
npm run server   # http://localhost:5000
npm run client   # http://localhost:3000
```

---

## API Reference

| Method | Endpoint          | Description                        |
|--------|-------------------|------------------------------------|
| GET    | /api/tasks        | List tasks (filter/sort/search)    |
| POST   | /api/tasks        | Create a task                      |
| GET    | /api/tasks/stats  | Get task statistics                |
| GET    | /api/tasks/:id    | Get a single task                  |
| PUT    | /api/tasks/:id    | Update a task                      |
| DELETE | /api/tasks/:id    | Delete a task                      |
| GET    | /api/health       | Health check                       |

### Query Parameters (GET /api/tasks)
| Param    | Values                              |
|----------|-------------------------------------|
| status   | todo \| in-progress \| completed    |
| priority | low \| medium \| high               |
| search   | any string                          |
| sortBy   | createdAt \| updatedAt \| title \| priority \| dueDate |
| order    | asc \| desc                         |

---

## Deployment

### Backend — Render.com

1. Push code to GitHub
2. New Web Service → connect your repo
3. Root Directory: `server`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add environment variables: `MONGODB_URI`, `PORT`, `NODE_ENV=production`, `CLIENT_URL=<your-frontend-url>`

### Frontend — Vercel

1. New Project → import your repo
2. Root Directory: `client`
3. Framework: Vite
4. Add environment variable: `VITE_API_URL=<your-render-backend-url>/api`
5. Deploy

---

## License
MIT
