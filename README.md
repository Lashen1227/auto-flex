# AutoFlex

AutoFlex is a full-stack vehicle inventory platform for electric cars and cargo bikes.

<img width="1613" height="908" alt="Screenshot 2026-06-06 203821" src="https://github.com/user-attachments/assets/3607dcab-e473-45ef-b157-8a812fab8d33" />


The project is split into two apps:

- `client`: a Vite + React + TanStack Router frontend
- `server`: an Express + MongoDB API with Asgardeo-based authentication for protected actions

## Asgardeo Authentication

AutoFlex uses Asgardeo for sign-in and protected API access.

- Users sign in through the frontend with the Asgardeo React SDK
- The frontend sends the Asgardeo ID token to the backend
- The backend verifies the token before allowing vehicle create, update, and delete requests
- Authenticated users are synced into MongoDB through the `/api/users/sync` endpoint

To make auth work locally, the client and server Asgardeo settings must match:

- `VITE_ASGARDEO_CLIENT_ID`
- `VITE_ASGARDEO_BASE_URL`
- `ASGARDEO_CLIENT_ID`
- `ASGARDEO_BASE_URL`

## Features

- Browse live inventory from MongoDB
- Filter and sort vehicles by category, status, price, and search text
- View detailed vehicle pages
- Add, update, and delete vehicles after signing in
- Sync authenticated users into MongoDB through Asgardeo ID tokens
- View inventory summary stats from the API

## Project Structure

```text
auto-flex/
  client/   # Frontend app
  server/   # Backend API
```

## Tech Stack

- Frontend: React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS, Radix UI
- Backend: Node.js, Express 5, MongoDB, Mongoose
- Authentication: Asgardeo

## Prerequisites

- Node.js 20+ recommended
- MongoDB connection string, either local or Atlas
- Asgardeo application credentials for the frontend and backend

## Setup

### 1. Install dependencies

Install dependencies separately in each app:

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Configure environment variables

Create or update `client/.env` and  `server/.env`:

Notes:

- The backend will use `MONGODB_URI` first, then fall back to `MONGODB_FALLBACK_URI` if needed.
- The frontend defaults to `http://localhost:8080` for API calls if `VITE_BACKEND_BASE_URL` is omitted.
- Asgardeo values must match between client and server.

## Running the App

### Frontend

```bash
cd client
npm run dev
```

By default the frontend runs on `http://localhost:3000`.

### Backend

```bash
cd server
npm run dev
```

By default the API runs on `http://localhost:8080`.

