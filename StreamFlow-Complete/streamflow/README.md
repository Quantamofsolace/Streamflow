# StreamFlow — Anime Streaming Platform

Full-stack Node.js anime streaming app deployed on AWS with high availability.

---

## Quick Start (Local Development)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_ORG/streamflow.git
cd streamflow

# 2. Install frontend dependencies
cd frontend && npm install && cd ..

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Create a local .env for backend (optional — defaults work for local dev)
# backend/.env
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=yourpassword
# DB_NAME=streamflow
# S3_BUCKET_NAME=your-bucket
# AWS_REGION=us-east-1

# 5. Run the database schema
mysql -u root -p < infrastructure/rds/schema.sql

# 6. Start backend (terminal 1)
cd backend && npm start

# 7. Start frontend (terminal 2)
cd frontend && npm start

# 8. Open browser
open http://localhost:3000
```

---

## Files to Change Before AWS Deployment

| File | What to Change |
|------|---------------|
| `infrastructure/scripts/streamflow-backend.service` | `DB_HOST`, `S3_BUCKET_NAME`, `DB_SECRET_NAME`, `JWT_SECRET` |
| `infrastructure/scripts/streamflow-frontend.service` | `BACKEND_URL` → Internal ALB DNS |
| `infrastructure/rds/schema.sql` | Run against your RDS endpoint |

---

## Project Structure

```
streamflow/
├── frontend/                 # Express static server (port 3000)
│   ├── server.js
│   ├── package.json
│   └── public/
│       ├── index.html        # Home page — anime grid
│       ├── player.html       # Video player + anime drop animation
│       ├── css/style.css
│       └── js/
│           ├── app.js        # Home page logic
│           └── player.js     # Player + drop animation
├── backend/                  # Express API server (port 4000)
│   ├── server.js
│   ├── package.json
│   ├── routes/
│   │   ├── videos.js         # GET/POST/PUT/DELETE
│   │   ├── download.js       # Signed S3 download URL
│   │   └── users.js          # Register / Login
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   └── config/
│       ├── db.js             # RDS MySQL connection pool
│       ├── secrets.js        # AWS Secrets Manager
│       └── s3.js             # S3 client
└── infrastructure/
    ├── rds/schema.sql        # Database tables + seed data
    ├── lambda/thumbnail-gen.js
    └── scripts/
        ├── setup-server.sh               # Run once on base EC2 before AMI
        ├── streamflow-backend.service    # systemd auto-start
        └── streamflow-frontend.service   # systemd auto-start
```

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/videos` | List all videos |
| GET | `/api/videos/:id` | Get single video + stream URL |
| POST | `/api/videos` | Create video record |
| PUT | `/api/videos/:id` | Update video |
| DELETE | `/api/videos/:id` | Soft delete video |
| GET | `/api/download/:id` | Get download URL |
| POST | `/api/users/register` | Create account |
| POST | `/api/users/login` | Login, returns JWT |
| GET | `/health` | Health check (used by ALB) |
