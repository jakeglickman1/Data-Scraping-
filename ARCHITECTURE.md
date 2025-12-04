# Travel Companion Platform – Architecture & Data Models

## Monorepo Layout

```
.
├── mobile/                     # React Native (Expo) client
│   ├── app/ (or src/)          # Feature-based modules
│   │   ├── navigation/         # Stack + bottom tabs
│   │   ├── screens/            # Auth, Map, Trips, Wishlist, Advisor, etc.
│   │   ├── components/         # Shared UI pieces (cards, forms)
│   │   ├── store/              # Zustand slices (auth, trips, planner)
│   │   ├── services/           # API client, adapters for backend responses
│   │   └── theme/              # Colors, typography, spacing
│   ├── assets/                 # Images, fonts, mock photos
│   ├── app.config.ts           # Expo configuration w/ env passthrough
│   └── package.json
│
└── server/                     # Node.js + Express + Prisma
    ├── src/
    │   ├── app.ts              # Express bootstrap
    │   ├── server.ts           # HTTP server setup
    │   ├── config/             # env loader, Prisma client
    │   ├── middleware/         # auth, error handler
    │   ├── modules/            # Feature folders
    │   │   ├── auth/           # controllers, routes, service
    │   │   ├── trips/          # CRUD + highlights + planner
    │   │   ├── places/         # visited places endpoints
    │   │   ├── wishlist/       # checklist endpoints
    │   │   └── advisor/        # flight/hotel integrations
    │   ├── services/           # External API adapters (flights, hotels, events)
    │   └── utils/              # shared helpers (date math, error classes)
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts (optional)
    ├── package.json
    └── README.md
```

## Data Models (Prisma)

```prisma
model User {
  id             String          @id @default(cuid())
  email          String          @unique
  passwordHash   String
  name           String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  trips          Trip[]
  wishlistItems  WishlistItem[]
  visitedPlaces  VisitedPlace[]
}

model Trip {
  id             String          @id @default(cuid())
  user           User            @relation(fields: [userId], references: [id])
  userId         String
  destination    String
  country        String
  startDate      DateTime
  endDate        DateTime
  notes          String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  highlights     Highlight[]
  visitedPlaces  VisitedPlace[]
}

model Highlight {
  id          String     @id @default(cuid())
  trip        Trip       @relation(fields: [tripId], references: [id])
  tripId      String
  title       String
  caption     String?
  photos      String[]   @default([])
  occurredAt  DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model VisitedPlace {
  id          String    @id @default(cuid())
  user        User      @relation(fields: [userId], references: [id])
  userId      String
  trip        Trip?     @relation(fields: [tripId], references: [id])
  tripId      String?
  name        String
  latitude    Float
  longitude   Float
  city        String
  country     String
  visitDate   DateTime?
  photos      String[]  @default([])
  caption     String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model WishlistItem {
  id          String    @id @default(cuid())
  user        User      @relation(fields: [userId], references: [id])
  userId      String
  destination String
  country     String?
  tags        String[]  @default([])
  visited     Boolean   @default(false)
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### API Surface Overview

- `POST /api/auth/signup`, `POST /api/auth/login`
- `GET /api/trips`, `GET /api/trips/:id`, `POST /api/trips`, `POST /api/trips/:id/highlights`
- `GET /api/places/visited`
- `GET /api/wishlist`, `POST /api/wishlist`, `PATCH /api/wishlist/:id`, `DELETE /api/wishlist/:id`
- `POST /api/trip-planner/recommendations`
- `POST /api/advisor/search`

> External API wrappers (Flights, Hotels, Events/Activities) live under `server/src/services/` with stubbed responses today. Replace the stub implementations with real API calls by injecting API keys via environment variables.
