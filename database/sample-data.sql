-- ============================================================
-- Optional sample tasks so the dashboard is not empty on first run.
-- Run AFTER the backend has started once (so the tables exist):
--   psql -U postgres -d truetrack -f database/sample-data.sql
-- No users are inserted here: create your account from the Register page.
-- ============================================================

INSERT INTO tasks (title, description, assigned_to, priority, status, created_at, updated_at) VALUES
('Inspect fire extinguishers - Block A', 'Quarterly safety inspection of all floors', 'Ravi', 'HIGH', 'PENDING', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('Replace conveyor belt on Line 3', 'Belt is worn near the drive roller', 'Priya', 'HIGH', 'IN_PROGRESS', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'),
('Order printer paper', '20 boxes of A4 for the admin office', 'Anil', 'LOW', 'COMPLETED', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),
('Update shift roster for November', NULL, 'Sneha', 'MEDIUM', 'PENDING', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('Service the backup generator', 'Annual maintenance by vendor', 'Ravi', 'MEDIUM', 'IN_PROGRESS', NOW() - INTERVAL '2 days', NOW() - INTERVAL '12 hours'),
('Dispatch order #4521 to central warehouse', 'Confirm vehicle and driver', 'Kiran', 'HIGH', 'COMPLETED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours');
