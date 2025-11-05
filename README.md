# Employee Attendance Backend (Node.js + Express + Prisma + PostgreSQL)

## Quick setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to your Postgres database.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client and run migration:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
   (Answer prompts to create the migration.)
4. Start the server:
   ```bash
   npm run dev
   ```
5. Server runs on port defined in `.env` (default 5000).

## Endpoints

- `POST /api/attendance`  
  Body (JSON):
  ```json
  {
    "employee_id": 1,
    "image_base64": "data:image/jpeg;base64,...",
    "check_in_latitude": 12.34,
    "check_in_longitude": 56.78
  }
  ```
  Accepts a base64 image, stores file to `UPLOAD_DIR`, checks assigned locations for employee and marks attendance with `is_on_site` true if coordinates fall within a matching location's bounds.

- `GET /api/attendance`  
  Returns list of attendance records (joined with employee and location info).

## Notes
- The location check is a simple bounding-box check using `min_latitude <= lat <= max_latitude` and same for longitude.
- If you prefer precise geo-distance checks use PostGIS with PostgreSQL and convert the check logic accordingly.
