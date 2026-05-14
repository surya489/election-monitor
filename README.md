# VoteFlow Frontend

Next.js frontend for the VoteFlow real-time election polling system.

## Screens

- `/` lets audience members sign up or log in, then vote once per account.
- `/admin` lets the default admin log in, view live totals, per-nominee counts, and a live pie chart.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local env file:

   ```bash
   cp .env.local.example .env.local
   ```

3. Start the frontend:

   ```bash
   npm run dev
   ```

The app runs on `http://localhost:3000` and expects the backend at `http://localhost:5000`.

## Full App Setup

This repository is the frontend. The API, database seed, vote-once enforcement, and Socket.IO server live in the sibling backend repository:

```bash
cd ../election-monitor-backend
npm install
cp .env.example .env
npm run db:seed
npm run dev
```

Then start this frontend in a second terminal:

```bash
cd ../election-monitor
npm install
cp .env.local.example .env.local
npm run dev
```

## Default Admin

- Email: `admin@voteflow.local`
- Password: `admin123`

## Docker

The backend repository includes a `docker-compose.yml` that starts MongoDB, the backend, and this frontend together:

```bash
cd ../election-monitor-backend
docker compose up --build
```
