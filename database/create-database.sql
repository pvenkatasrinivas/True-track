-- ============================================================
-- Step 1 (one time): create the database.
-- Run as the postgres superuser, for example:
--   psql -U postgres -f database/create-database.sql
--
-- Optional: create a separate login for the app instead of using "postgres".
-- Replace CHANGE_ME with your own password, then set DB_USERNAME=truetrack_app
-- and DB_PASSWORD=<that password> before starting the backend.
-- ============================================================

CREATE DATABASE truetrack;

-- CREATE USER truetrack_app WITH PASSWORD 'CHANGE_ME';
-- GRANT ALL PRIVILEGES ON DATABASE truetrack TO truetrack_app;
-- (PostgreSQL 15+) also run inside the truetrack database:
--   \c truetrack
--   GRANT ALL ON SCHEMA public TO truetrack_app;
