# Travel Companion Monorepo

This project contains a React Native app (Expo) and a Node.js/Express backend. Together they provide an end-to-end travel companion experience—authentication, visited place maps, trip planning, wishlist tracking, and an advisor that stubs flight/hotel integrations.

## Repository Structure

```
.
├── ARCHITECTURE.md        # High-level overview + Prisma schema
├── mobile/                # Legacy Expo React Native app (TypeScript)
├── web/                   # Vite + React web client (TypeScript)
└── server/                # Express + Prisma backend (TypeScript)
```

## Requirements

- Node.js 18+ (Node 22.19.0 used during development)
- npm 9/10
- Expo CLI (`npx expo start` handles it automatically)

## Backend (`/server`)

### Environment

Copy `.env` and update secrets:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-long-secret"
FLIGHT_API_KEY=""
HOTEL_API_KEY=""
EVENTS_API_KEY=""
```

### Commands

```bash
cd server
npm install           # already run but safe to repeat
npx prisma migrate dev
npm run dev           # start API on http://localhost:4000
```

Key routes:

- `POST /api/auth/signup`, `POST /api/auth/login`
- `GET/POST /api/trips`, `GET /api/trips/:id`, `POST /api/trips/:id/highlights`
- `GET /api/places/visited`
- `GET/POST/PATCH/DELETE /api/wishlist`
- `POST /api/trip-planner/recommendations`
- `POST /api/advisor/search`

External service wrappers live in `src/services/external/*` and currently return mocked data but are structured so real API calls can drop in (fill env vars and replace stubbed arrays).

## Web (`/web`)

The Vite-powered web experience mirrors the mobile flows so you can open everything in a browser (or load it on a phone via the Vite dev server QR code).

1. Copy the environment file and point it at the API (defaults to `http://localhost:4000/api`):

   ```bash
   cd web
   cp .env.example .env    # optional override of VITE_API_URL
   npm install
   npm run dev
   ```

2. Run `npm run dev -- --host` when you want to load it on another device—Vite will print the LAN URL that you can open directly or drop into any QR-code generator for quick scans.

The web client reuses the backend contracts—login/signup, trips, wishlist, planner, advisor, and profile stats—implemented with React Router, Zustand, and Axios.

## Mobile (`/mobile`)

Configure the backend URL via Expo's public env var:

```
export EXPO_PUBLIC_API_URL="http://localhost:4000/api"
```

Then install and run:

```bash
cd mobile
npm install
npm start   # choose iOS/Android/web
```

The app uses React Navigation (stack + tabs), Zustand for state, React Native Paper for UI, and `react-native-maps` for the visited map display.

Main screens:

- **Auth flow**: Welcome → Login/Signup
- **Map**: Interactive map of visited places with trip filters
- **Trips**: Upcoming/past lists, detail pages, plan screen
- **Wishlist**: Checklist with tags, visited toggles
- **Advisor**: Combined flight + stay recommendations
- **Profile**: User summary + logout

## Notes & Next Steps

- Replace mocked external responses with live APIs by editing `server/src/services/external/*.ts`.
- Add image uploading (S3) for highlight photos—the backend currently expects URLs.
- Consider adding pagination/optimistic updates for wishlist & trips as the dataset grows.
- Extend mobile validation (date pickers, better error messaging) for production readiness.
