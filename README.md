# Poker Planning Backend

This is the backend for the Poker Planning application, built with Node.js, TypeScript, Express, TypeORM, and PostgreSQL.

## Prerequisites

- Node.js (v16+)
- PostgreSQL
- Docker & Docker Compose (optional, for local DB/Redis)
- Redis (optional, for caching/sessions)

## Environment Variables

Copy `.env` and adjust as needed:

```sh
cp .env.example .env
```

Or edit `backend/.env` directly. Key variables:
- `DATABASE_URL` (Postgres connection string)
- `JWT_SECRET`
- `ACCESS_TOKEN_EXPIRY`
- `REFRESH_TOKEN_EXPIRY`
- `PORT`

## Setup & Running

### 1. Install dependencies

```sh
cd backend
npm install
```

### 2. Start PostgreSQL & Redis (optional, using Docker Compose)

```sh
docker compose up -d
```

### 3. Run database migrations

```sh
npm run migration:run
```

### 4. Start the backend server (development)

```sh
npm run dev
```

Or build and run in production:

```sh
npm run build
npm start
```

## Useful Commands

- **Generate migration:**  
  `npm run migration:generate`
- **Run migrations:**  
  `npm run migration:run`
- **Start dev server:**  
  `npm run dev`
- **Build:**  
  `npm run build`
- **Start production server:**  
  `npm start`

## Health Check

Visit [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health) to verify the backend is running.

---

See [`backend/start-dev.txt`](backend/start-dev.txt) for a sample startup workflow.