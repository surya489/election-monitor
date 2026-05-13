# VoteFlow Frontend

Next.js frontend for the real-time election polling assignment.

## Screens

- `/` lets audience members vote for one nominee per browser session.
- `/admin` lets the default admin log in and view live totals, nominee counts, and a horizontal vote chart.

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

## Default Admin

- Email: `admin@voteflow.local`
- Password: `admin123`

## Docker

The backend repository includes a `docker-compose.yml` that starts MongoDB, the backend, and this frontend together:

```bash
cd ../election-monitor-backend
docker compose up --build
```
