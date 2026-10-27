# True Track — Full-Stack Operations Management System

True Track is a simple team task tracker. Users log in, create operational tasks, assign them to a person,
set a priority, move them through **Pending → In Progress → Completed**, and see the totals on a dashboard.

It is a learning project: the code is kept small, layered and commented so you can read every file and
explain it in an interview. See **[INTERVIEW_PREPARATION.md](INTERVIEW_PREPARATION.md)**.

---

## Features

| Area | What it does |
|------|--------------|
| Login | Register, log in, log out. Passwords are hashed with BCrypt. Login returns a JWT token that the frontend sends with every request. |
| Dashboard | Cards for total, pending, in-progress, completed and open high-priority tasks + a table of recently updated tasks. Reloads every time you open it. |
| Task management | Create, view all, view one, edit, delete, and change status with one click. |
| Search & filter | Search by title, filter by status and priority (done in the database, not in the browser). |
| Validation | Checked in the browser **and** on the server; server errors are shown next to the right field. |
| UI | Responsive (mobile, tablet, desktop), loading/empty/error states, success messages. |

Task fields: ID, title, description, assigned person, priority (`LOW`/`MEDIUM`/`HIGH`), status
(`PENDING`/`IN_PROGRESS`/`COMPLETED`), created date, last updated date.

## Technology stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 8 compatible code, Spring Boot 2.7.18, Spring MVC (REST), Spring Data JPA, Hibernate ORM 5.6, Spring Security 5.7, JJWT 0.11.5, Bean Validation |
| Database | PostgreSQL (tested scripts on 16; 12+ works) |
| Frontend | React 18, React Router 6, JavaScript, plain CSS, Vite 5 |
| Build | Maven (backend), npm (frontend) |
| Testing | JUnit 5, Mockito, MockMvc, H2 in-memory DB (backend); Vitest + React Testing Library (frontend); Postman |

**Why Spring Boot 2.7 and not 3.x?** Spring Boot 3 needs Java 17. Version 2.7 is the newest line that still
supports Java 8, and it also runs on Java 11, 17 and 21 — so it works with whatever JDK you have.

## Project structure

```
True-Track/
├── backend/                          Spring Boot REST API
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/truetrack/
│       │   ├── TrueTrackApplication.java   main class
│       │   ├── entity/        User, Task, TaskStatus, TaskPriority   (JPA → tables)
│       │   ├── repository/    UserRepository, TaskRepository, TaskSpecifications
│       │   ├── service/       AuthService, TaskService               (business logic)
│       │   ├── controller/    AuthController, TaskController         (REST endpoints)
│       │   ├── dto/           request / response objects
│       │   ├── security/      JwtUtil, JwtAuthFilter
│       │   ├── config/        SecurityConfig (rules, CORS, BCrypt)
│       │   └── exception/     custom exceptions + GlobalExceptionHandler
│       ├── main/resources/application.properties
│       └── test/              JUnit tests (+ application-test.properties for H2)
├── frontend/                         React app (Vite)
│   └── src/
│       ├── pages/        Login, Register, Dashboard, TaskList, AddTask, EditTask, TaskDetails, NotFound
│       ├── components/   Navbar, Layout, ProtectedRoute, TaskForm, badges, messages
│       ├── services/     api.js (fetch helper), authService.js, taskService.js
│       ├── context/      AuthContext (logged-in user + token)
│       ├── styles/       global.css
│       └── __tests__/    Vitest tests
├── database/             create-database.sql, schema.sql, sample-data.sql
├── postman/              True-Track.postman_collection.json
├── API_REFERENCE.md      every endpoint with request/response examples
├── INTERVIEW_PREPARATION.md
└── .env.example          list of environment variables
```

## Prerequisites

| Tool | Version | Check with |
|------|---------|-----------|
| JDK | 8, 11, 17 or 21 | `java -version` |
| Maven | 3.6+ | `mvn -v` |
| PostgreSQL | 12+ | `psql --version` |
| Node.js | 18+ (20 or 22 recommended) | `node -v` |
| Postman | any (optional) | — |

An IDE such as IntelliJ IDEA or VS Code is helpful but not required.

---

## 1. PostgreSQL setup

1. Install PostgreSQL and remember the password you gave the `postgres` user.
2. Create the database (pick one):
   ```bash
   psql -U postgres -f database/create-database.sql
   # or simply:
   psql -U postgres -c "CREATE DATABASE truetrack;"
   ```
   (pgAdmin works too: right-click *Databases → Create → Database…* and name it `truetrack`.)
3. **You don't need to create tables.** Hibernate creates `users` and `tasks` automatically on the first start
   (`spring.jpa.hibernate.ddl-auto=update`). `database/schema.sql` shows the same tables in SQL if you want to read
   or create them yourself.
4. Optional: after the backend has started once, add demo tasks:
   ```bash
   psql -U postgres -d truetrack -f database/sample-data.sql
   ```

## 2. Configuration

The backend reads its settings from **environment variables** (see `backend/src/main/resources/application.properties`).
Secrets are not written in the code.

| Variable | Required | Default | Meaning |
|----------|----------|---------|---------|
| `DB_PASSWORD` | **yes** | — | Password of your PostgreSQL user |
| `JWT_SECRET` | **yes** | — | Random text, at least 32 characters, used to sign tokens |
| `DB_URL` | no | `jdbc:postgresql://localhost:5432/truetrack` | Database address |
| `DB_USERNAME` | no | `postgres` | Database user |
| `JWT_EXPIRATION_HOURS` | no | `24` | How long a login lasts |
| `CORS_ALLOWED_ORIGINS` | no | `http://localhost:5173` | Frontend URL(s) allowed to call the API, comma-separated |
| `PORT` | no | `8080` | Backend port |

Generate a JWT secret: `openssl rand -base64 48` (or type any long random sentence of 32+ characters).

**macOS / Linux (bash/zsh):**
```bash
export DB_PASSWORD='your_postgres_password'
export JWT_SECRET='paste-a-long-random-secret-of-at-least-32-chars'
```

**Windows PowerShell:**
```powershell
$env:DB_PASSWORD="your_postgres_password"
$env:JWT_SECRET="paste-a-long-random-secret-of-at-least-32-chars"
```

**IntelliJ IDEA:** *Run → Edit Configurations → TrueTrackApplication → Environment variables* →
`DB_PASSWORD=...;JWT_SECRET=...`

(These variables only last for the current terminal window. Set them again in a new window.)

Frontend: copy `frontend/.env.example` to `frontend/.env` only if the backend is **not** on `http://localhost:8080`.

## 3. Run the backend

```bash
cd backend
mvn spring-boot:run
```
The API starts on **http://localhost:8080**. You should see `Started TrueTrackApplication` in the console.

Build a runnable jar instead:
```bash
mvn clean package
java -jar target/true-track-backend.jar
```

## 4. Run the frontend

In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173**, click **Register** to create your first account, and you're in.

Production build: `npm run build` → static files in `frontend/dist/` (`npm run preview` serves them locally).

---

## API endpoints

All `/api/tasks` endpoints need the header `Authorization: Bearer <token>`.
Full request/response examples are in **[API_REFERENCE.md](API_REFERENCE.md)**.

| Method | URL | Description | Success |
|--------|-----|-------------|---------|
| POST | `/api/auth/register` | Create account → token | 201 |
| POST | `/api/auth/login` | Log in → token | 200 (401 if wrong) |
| GET | `/api/auth/me` | Current user | 200 |
| GET | `/api/tasks?search=&status=&priority=` | List / search / filter tasks | 200 |
| GET | `/api/tasks/{id}` | One task | 200 / 404 |
| POST | `/api/tasks` | Create task | 201 / 400 |
| PUT | `/api/tasks/{id}` | Update task | 200 / 400 / 404 |
| PATCH | `/api/tasks/{id}/status` | Change only the status | 200 / 404 |
| DELETE | `/api/tasks/{id}` | Delete task | 204 / 404 |
| GET | `/api/tasks/summary` | Dashboard counts + 5 recent tasks | 200 |

Example:
```http
POST /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{ "title": "Inspect fire extinguishers", "assignedTo": "Ravi", "priority": "HIGH" }
```
```json
201 Created
{ "id": 1, "title": "Inspect fire extinguishers", "description": null, "assignedTo": "Ravi",
  "priority": "HIGH", "status": "PENDING", "createdAt": "2026-10-27T05:30:00Z", "updatedAt": "2026-10-27T05:30:00Z" }
```
Error example (400):
```json
{ "status": 400, "error": "Bad Request", "message": "Validation failed", "path": "/api/tasks",
  "fieldErrors": { "title": "Title must be between 3 and 100 characters", "priority": "Priority is required" } }
```

---

## Testing

**Backend (JUnit)** — uses an in-memory H2 database, so PostgreSQL does not need to be running:
```bash
cd backend
mvn test
```
| Test class | Type | What it checks |
|-----------|------|----------------|
| `TaskServiceTest` | Unit (Mockito) | default status, trimming, not-found errors, status update, summary counts |
| `JwtUtilTest` | Unit | token round trip, forged token rejected, expired token rejected, short secret refused |
| `AuthControllerTest` | Integration (MockMvc + H2) | register, duplicate email 409, validation 400, login ok / 401, no token 401 |
| `TaskControllerTest` | Integration (MockMvc + H2) | full CRUD, status change, validation errors, bad enum, search + filters, summary, 404 |

**Frontend (Vitest)**:
```bash
cd frontend
npm test        # 20 tests: api helper, TaskForm validation, LoginPage, StatusBadge
npm run build   # production build
```

**Postman**: import `postman/True-Track.postman_collection.json`, start the backend, then run the collection
(Collection → *Run*). *Register* (or *Login* if the account already exists) stores the token automatically;
*Create task* stores the task id used by the next requests. Each request has a small test script.

**Manual check list**: register → dashboard shows zeros → add a task → it appears in the list and the dashboard →
search / filter → open details → change status → edit → delete → log out → protected pages redirect to login.

### Verification status of this delivery
- Frontend: `npm test` (20 tests) and `npm run build` were run and passed.
- Database: `database/*.sql` were run on PostgreSQL 16 without errors.
- Postman collection: JSON structure and all test scripts were validated with the Postman collection SDK.
- Backend: the code was written and reviewed, but it was **not compiled or run** in the build environment
  (Maven Central was not reachable there). Run `mvn test` first on your machine; fix anything it reports
  before relying on it.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Could not resolve placeholder 'DB_PASSWORD'` or `'JWT_SECRET'` | The environment variable is not set in the window/IDE that starts the backend. See *Configuration*. |
| `JWT_SECRET must be set and be at least 32 characters long` | Use a longer secret. |
| `password authentication failed for user "postgres"` | Wrong `DB_PASSWORD` (or `DB_USERNAME`). |
| `database "truetrack" does not exist` | Run step 1 of *PostgreSQL setup*. |
| `Connection to localhost:5432 refused` | PostgreSQL is not running. Start the service (Windows: *Services → postgresql*; macOS: `brew services start postgresql`; Linux: `sudo systemctl start postgresql`). |
| `Port 8080 was already in use` | Stop the other program or start with `PORT=8090` and set `VITE_API_BASE_URL=http://localhost:8090` in `frontend/.env`. |
| Browser shows **CORS** error | The frontend URL is not in `CORS_ALLOWED_ORIGINS` (default `http://localhost:5173`). |
| Frontend says "Cannot connect to the server" | Backend is not running, or `VITE_API_BASE_URL` is wrong. Restart `npm run dev` after editing `.env`. |
| Logged out unexpectedly | The token expired (24 h by default) or `JWT_SECRET` changed (all old tokens become invalid). Log in again. |
| `mvn` not found | Install Maven or use your IDE's built-in Maven. |
| `invalid target release: 1.8` style errors | Check `java -version`; any JDK 8–21 works. In IntelliJ, set the Project SDK to an installed JDK. |
| `npm audit` warnings | They are in the dev tools (Vite/Vitest/React Router 6). They don't affect how the app works for local learning; upgrading to Vite 6+/React Router 7 fixes them. |
