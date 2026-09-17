# Queueboard

Queueboard is a small job-queue dashboard. The frontend is a React/Vite application and the API is a NestJS service backed by PostgreSQL through Drizzle ORM.

## Features

- View jobs ordered by creation time
- Filter jobs by status
- Create jobs with a title and description
- Move pending jobs to another status
- Delete jobs
- Display counts for all supported statuses

## Stack

- React 19 and Vite
- NestJS 12
- Drizzle ORM and `pg`
- PostgreSQL, including Neon-hosted PostgreSQL
- Tailwind CSS v4

## Requirements

- Node.js 22 or newer
- npm
- A PostgreSQL database

The repository declares pnpm as its package manager, but the current setup is validated with npm. Use one package manager consistently for an installation.

## Configuration

Create `src/.env` for local development:

```dotenv
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
VITE_API_URL=http://localhost:4000/api
```

`DATABASE_URL` is used by the Nest API. `VITE_API_URL` is used by the browser. If `VITE_API_URL` is omitted, the frontend uses `/api`, which is proxied to `http://localhost:4000` by Vite during development.

Do not commit `src/.env` or any file containing database credentials. The root `.gitignore` excludes local environment files.

## Install

From the repository root:

```powershell
npm install
```

## Run Locally

Start the API in one terminal:

```powershell
npm run dev:nest
```

Start the frontend in a second terminal:

```powershell
npm run dev
```

Open the dashboard at:

```text
http://localhost:3000
```

The API is available at:

```text
http://localhost:4000/api
```

Health check:

```text
http://localhost:4000/api/health
```

The API creates the `jobs` table automatically when it starts if that table does not already exist. This keeps a new development database usable without a separate migration command. For a production system, replace this bootstrap convenience with a versioned migration workflow.

Only start one API process on port `4000`. If you see `EADDRINUSE`, another API process is already running. Stop it or reuse it instead of starting a second one.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server on port 3000 |
| `npm run dev:nest` | Compile and start the local Nest API on port 4000 |
| `npm run build` | Build the frontend into `dist/` |
| `npm run build:nest` | Compile the API into `dist/server/` |
| `npm run start:nest` | Start the compiled API using host-provided environment variables |
| `npm run preview` | Preview the frontend production build locally |

## API

All API routes use the `/api` prefix.

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Return API health status |
| `GET` | `/api/jobs` | List jobs, optionally filtered with `?status=pending` |
| `POST` | `/api/jobs` | Create a job with `{ "title": "...", "description": "..." }` |
| `PATCH` | `/api/jobs/:id/status` | Update a pending job with `{ "status": "running" }` |
| `DELETE` | `/api/jobs/:id` | Delete a job |

Supported statuses are `pending`, `running`, `completed`, and `failed`.

## Production Deployment

The recommended split deployment is Render for the API and Vercel for the frontend.

### Backend on Render

Create a Render Web Service connected to this repository:

```text
Build Command: npm ci && npm run build:nest
Start Command: npm run start:nest
```

Set these Render environment variables:

```text
DATABASE_URL=your-production-postgres-connection-string
WEB_ORIGIN=https://your-frontend.vercel.app
```

The API reads Render's `PORT` automatically and binds to `0.0.0.0`. After deployment, verify:

```text
https://your-api.onrender.com/api/health
https://your-api.onrender.com/api/jobs
```

### Frontend on Vercel

Import the repository into Vercel with:

```text
Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
```

Set this Vercel environment variable before building:

```text
VITE_API_URL=https://your-api.onrender.com/api
```

Redeploy after changing the variable. Vite embeds `VITE_*` variables at build time.

### CORS

Set Render's `WEB_ORIGIN` to the exact deployed Vercel origin, without a trailing path:

```text
WEB_ORIGIN=https://your-frontend.vercel.app
```

If the frontend domain changes, update `WEB_ORIGIN` and redeploy the API.

## Important Decisions

- The frontend uses `VITE_API_URL` so local and deployed API origins can differ without changing source code.
- Local Vite development proxies `/api` to port `4000`; production uses the absolute API URL embedded at build time.
- The API uses `PORT` first, then `NEST_PORT`, then `4000`, so it works on Render and locally.
- The production API start command does not load `src/.env`; deployment platforms must provide environment variables through their secret settings.
- The API ensures the `jobs` table exists at startup. This is intentionally simple for this project, but production schema changes should use migrations.
- CORS is restricted to the local frontend origins plus the configured `WEB_ORIGIN`.
- Tailwind v4 is processed through `postcss.config.cjs`; without that plugin, the UI would be served without generated utility styles.

## Troubleshooting

### `ECONNREFUSED` from Vite

The API is not running or is not listening on port `4000`. Start `npm run dev:nest` and keep it running.

### `EADDRINUSE: port 4000`

An API process already owns port `4000`. Reuse it, or stop the process before restarting the API.

### The UI appears unstyled

Restart Vite after changing PostCSS configuration and hard-refresh the browser with `Ctrl+Shift+R`.

### `/api/jobs` returns a server error

Check `DATABASE_URL`, confirm the database is reachable, and inspect the API terminal. The API creates the table automatically, but invalid credentials or an unavailable database will still prevent queries.

## Security Notes

- Rotate any database credentials that have been exposed or shared.
- Store secrets only in local ignored files or deployment-provider secret variables.
- Do not put `DATABASE_URL` in a `VITE_*` variable; Vite variables are exposed to browser code.