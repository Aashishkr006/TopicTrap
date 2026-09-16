# TopicTrap

TopicTrap is a simple speech-topic practice app.

## What it does

- Gets speech topics from MongoDB
- Filters by language, difficulty, and category
- Provides a speaking timer
- Provides speaking frameworks and sample answers
- Provides vocabulary from MongoDB
- Uses Clerk only for login
- Saves completed practices against the logged-in user to maintain a streak

## Authentication

Clerk handles login. The backend gets the Clerk `userId` and stores it with each completed practice. No profile system, history page, or stats dashboard is included.

## Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB + Mongoose
- Authentication: Clerk

## Run locally

### Backend

```bash
cd backend
npm install
```

Create `backend/.env` from `.env.example` and add your MongoDB and Clerk values.

```bash
npm run seed
npm run dev
```

Backend: `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`
