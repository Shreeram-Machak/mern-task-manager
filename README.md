# MERN Task Manager

A full-stack task management application built with MongoDB, Express.js, React, and Node.js. Users can register, log in, and manage their personal tasks with search, filters, pagination, and status updates.

## Features

- User registration and login with JWT authentication
- Protected task dashboard for authenticated users
- Create, read, update, and delete tasks
- Toggle tasks between pending and completed
- Search tasks by title or description
- Filter tasks by status
- Paginated task list
- Success and error alerts
- Mobile responsive dashboard and task views
- Clear empty states such as "No tasks found"

## Tech Stack

- Frontend: React, Vite, React Router, Axios, React Icons
- Backend: Node.js, Express.js, Mongoose
- Database: MongoDB / MongoDB Atlas
- Authentication: JWT, bcryptjs
- Styling: CSS

## Project Structure

```text
task-management-mern/
|
|-- backend/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- server.js
|   `-- .env
|
|-- frontend/
|   |-- public/
|   |-- src/
|   `-- .env
|
`-- README.md
```

## Backend Setup

1. Go to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=replace_with_a_secure_secret
```

For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string and make sure your IP address is allowed in the Atlas Network Access settings.

4. Start the backend server:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

## Frontend Setup

1. Go to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:

```bash
npm run dev
```

Vite will print the local frontend URL in the terminal, usually:

```text
http://localhost:5173
```

## .env Example

Backend `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=replace_with_a_secure_secret
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |

### Tasks

All task endpoints are protected and require a JWT token in the `Authorization` header.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/toggle` | Toggle task status |


## Useful Scripts

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```
