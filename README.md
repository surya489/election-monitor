# VoteFlow Frontend

Next.js frontend for the VoteFlow real-time election polling system.

## What This App Does

- Audience users can sign up, sign in, and vote for one party.
- A user can vote only once. If they return later, the UI shows the party they already selected.
- Admin users can sign in and view live vote totals.
- The admin dashboard shows total votes, vote count for each nominee, and a live pie chart.
- Toast notifications are used for login, logout, vote, and error states.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Socket.IO client

## Frontend Structure

```text
src/app
  page.tsx              Audience voting page controller
  admin/page.tsx        Admin dashboard controller
  layout.tsx            App metadata, fonts, and root layout
  globals.css           Tailwind import and global styles

src/components/shared
  AppShell.tsx          Shared page frame with nav and toast slot
  PasswordInput.tsx     Reusable password input with visibility toggle
  ToastMessage.tsx      Reusable toast notification
  types.ts              Shared UI types

src/components/voter
  VoterAuthPanel.tsx    Signup/login panel
  AuthModeTabs.tsx      Signup/login segmented control
  BallotPanel.tsx       Authenticated voting experience
  NomineeOption.tsx     Single selectable party option
  VoteStatusCard.tsx    Current voting status summary
  types.ts              Voter page types

src/components/admin
  AdminLogin.tsx        Admin login screen
  AdminShell.tsx        Admin page frame
  AdminDashboardHeader.tsx
  ResultsSummary.tsx    Top result metric cards
  StatCard.tsx          Reusable dashboard stat card
  VoteShareChart.tsx    Pie chart and ranked result table
  PasswordField.tsx     Admin labeled password field
  types.ts              Admin page types
```

The page files keep state, API calls, and routing-level behavior. Components hold reusable UI so the screens stay easier to maintain.

## Important Packages

- `next`, `react`, `react-dom`: application framework and UI rendering.
- `socket.io-client`: receives live result updates on the admin dashboard.
- `tailwindcss`: utility-first styling.
- `eslint`, `typescript`: code quality and type checking.

## Required Before Running

- Node.js `20.9.0` or newer
- npm
- The backend API running on `http://localhost:5000`
- MongoDB running for the backend

## Clone And Install

```bash
git clone <frontend-repo-url>
cd election-monitor
npm install
```

Create the frontend environment file:

```bash
cp .env.local.example .env.local
```

Default `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Run The Frontend

```bash
npm run dev
```

Open:

- Audience voting page: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin`

## Full Local Setup With Backend

Run the backend first in one terminal:

```bash
git clone <backend-repo-url>
cd election-monitor-backend
npm install
cp .env.example .env
npm run db:seed
npm run dev
```

Then run this frontend in a second terminal:

```bash
cd election-monitor
npm install
cp .env.local.example .env.local
npm run dev
```

## Admin Credentials

The admin account is created by the backend seed script.

- Email: `admin@voteflow.local`
- Password: `admin123`

The backend stores the admin password as a bcrypt hash. The plain password is only used during seeding and login verification.

## Main User Flows

Audience:

1. Open `/`.
2. Sign up or sign in.
3. Select one nominee from DMK, ADMK, TVK, NTK, and PMK.
4. Submit the vote.
5. On future login, the app disables voting and highlights the selected party.

Admin:

1. Open `/admin`.
2. Sign in with the seeded admin credentials.
3. View total votes, party vote counts, and the pie chart.
4. Keep the page open to receive real-time updates after audience votes.

## Frontend Validation And Safety

- Signup requires name, email, and a password of at least 6 characters.
- Login requires email and password.
- Voting requires a selected nominee.
- The UI filters nominees to the approved five-party ballot.
- Repeat voting is blocked in the UI when the backend reports an existing vote.
- Backend validation still remains the source of truth for auth, nominee validity, and one-vote enforcement.

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Builds the production app.

```bash
npm start
```

Starts the production server after a build.

```bash
npm run lint
```

Runs ESLint.

## Docker

The backend repository includes a `docker-compose.yml` that starts MongoDB, the backend API, and this frontend together:

```bash
cd ../election-monitor-backend
docker compose up --build
```
