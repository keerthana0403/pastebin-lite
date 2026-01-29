# Pastebin Lite

A lightweight Pastebin-like web application that allows users to create text pastes and share them via a unique URL. Pastes can optionally expire based on time (TTL) or number of views.

This project is designed to be serverless-friendly and safe for concurrent access.

---

## Features

- Create a paste with arbitrary text
- Share a unique URL to view the paste
- Optional time-based expiry (TTL)
- Optional view-count limit
- Paste becomes unavailable once any constraint is triggered
- Safe rendering (no script execution)

---

## Tech Stack

- Next.js (Pages Router)
- Node.js
- Upstash Redis (persistence layer)
- Vercel (deployment)

---

## Persistence Layer

The application uses **Upstash Redis** as the persistence layer.

Redis was chosen because:
- It works well in serverless environments
- It supports fast key-value access
- It is suitable for TTL and view-count based expiry logic

Each paste is stored with a key of the form:

paste:<id>


---

## API Endpoints

- `GET /api/healthz` – Health check
- `POST /api/pastes` – Create a new paste
- `GET /api/pastes/:id` – Fetch a paste (counts as a view)
- `GET /p/:id` – View paste in HTML

---

## Running the App Locally

### 1. Clone the repository

```bash
git clone https://github.com/keerthana0403/pastebin-lite
cd pastebin-lite

2. Install dependencies
npm install

3. Set environment variables

Create a file named .env.local in the project root:

UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

4. Start the development server
npm run dev


The application will be available at:

http://localhost:3000

Design Decisions

Server-side rendering (SSR) is used for viewing pastes to ensure correct behavior on reload.

Redis is used instead of in-memory storage to support serverless deployments.

View count logic ensures pastes are never served beyond their configured limits.

Deterministic time handling is supported for automated testing.

No global mutable state is used in server-side code.

Deployment

The application is deployed using Vercel with environment variables configured via the Vercel dashboard.

Notes

No secrets or credentials are committed to the repository.

No hardcoded localhost URLs are present in the code.

The project installs and runs using standard npm commands.
