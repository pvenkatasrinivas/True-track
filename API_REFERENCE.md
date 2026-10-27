# True Track — API reference

Backend base URL: `http://localhost:8080` (frontend reads it from `VITE_API_BASE_URL`).
JSON everywhere. Dates are ISO-8601 strings, e.g. `"2026-10-27T05:30:00Z"`.

## Error format (every error)
```json
{
  "timestamp": "2026-10-27T05:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/tasks",
  "fieldErrors": { "title": "Title must be between 3 and 100 characters" }
}
```
`fieldErrors` only appears for validation errors (400). Other codes: 401 (not logged in / bad token / expired token —
message `"Your session has expired. Please log in again."` when expired), 404 (`"Task not found with id 99"`),
409 (`"Email is already registered"`), 500.

## Auth (public)
| Method | Path | Body | Success |
|---|---|---|---|
| POST | `/api/auth/register` | `{ "name": "Ravi Kumar", "email": "ravi@example.com", "password": "secret123" }` | `201` AuthResponse |
| POST | `/api/auth/login` | `{ "email": "ravi@example.com", "password": "secret123" }` | `200` AuthResponse, or `401 {"message":"Invalid email or password"}` |
| GET | `/api/auth/me` (needs token) | — | `200` User |

Validation: name 2–100 chars; email valid; password 8–64 chars.

AuthResponse:
```json
{ "token": "eyJhbGciOi...", "user": { "id": 1, "name": "Ravi Kumar", "email": "ravi@example.com" } }
```
Send the token on all task calls: `Authorization: Bearer <token>`. Tokens are valid for 24 hours by default.
Logout = the frontend deletes the token.

## Tasks (need token) — all logged-in users share the same task board

Task:
```json
{
  "id": 7,
  "title": "Fix login page bug",
  "description": "Error message is not shown",
  "assignedTo": "Priya",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "createdAt": "2026-10-20T08:15:00Z",
  "updatedAt": "2026-10-26T11:02:00Z"
}
```
`priority`: `LOW` | `MEDIUM` | `HIGH`. `status`: `PENDING` | `IN_PROGRESS` | `COMPLETED`.

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/api/tasks?search=bug&status=PENDING&priority=HIGH` | — (all params optional; `search` matches title, case-insensitive) | `200` `[Task]` newest first |
| GET | `/api/tasks/{id}` | — | `200` Task / `404` |
| POST | `/api/tasks` | TaskRequest | `201` Task |
| PUT | `/api/tasks/{id}` | TaskRequest | `200` Task / `404` |
| PATCH | `/api/tasks/{id}/status` | `{ "status": "COMPLETED" }` | `200` Task |
| DELETE | `/api/tasks/{id}` | — | `204` |
| GET | `/api/tasks/summary` | — | `200` Summary |

TaskRequest:
```json
{ "title": "Fix login page bug", "description": "Error message is not shown",
  "assignedTo": "Priya", "priority": "HIGH", "status": "PENDING" }
```
Validation: `title` required, 3–100 chars; `description` ≤ 1000; `assignedTo` ≤ 100; `priority` required;
`status` optional (defaults to `PENDING` on create, unchanged on update if omitted).

Summary (dashboard):
```json
{ "total": 12, "pending": 5, "inProgress": 4, "completed": 3, "highPriority": 2,
  "recentTasks": [ Task, ... up to 5, most recently updated first ] }
```
`highPriority` = HIGH priority tasks that are not completed.
