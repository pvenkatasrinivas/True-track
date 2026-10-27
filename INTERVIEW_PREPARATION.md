# True Track — Interview Preparation

Simple notes to help you explain this project. Read them along with the code.

---

## 1. Explain the project in 30 seconds

- True Track is a task tracker for a team's daily operations work.
- You log in, create tasks, give them to a person, set a priority, and move them from Pending to In Progress to Completed.
- The dashboard shows how many tasks are in each status.
- I built the backend with Spring Boot and PostgreSQL, and the frontend with React.
- The frontend talks to the backend using REST APIs, and login is done with JWT tokens.

## 2. Architecture

```
 Browser (React app)  ──HTTP + JSON──►  Spring Boot backend  ──JPA/Hibernate──►  PostgreSQL
   pages, components                    Controller → Service → Repository          users, tasks tables
   services/api.js (fetch)              + Security (JWT filter)
```

The backend has layers. Each layer has one job:

| Layer | Folder | Job | Example |
|-------|--------|-----|---------|
| Controller | `controller/` | Receives the HTTP request, returns the HTTP response | `TaskController.createTask()` → 201 |
| Service | `service/` | Business rules | new task gets status `PENDING` |
| Repository | `repository/` | Talks to the database | `taskRepository.save(task)` |
| Entity | `entity/` | Java class = database table | `Task` → `tasks` table |
| DTO | `dto/` | Shape of the JSON in and out | `TaskRequest`, `TaskResponse` |
| Exception | `exception/` | Turns errors into clean JSON | 404 "Task not found with id 9" |
| Security / Config | `security/`, `config/` | JWT check, CORS, password hashing | `JwtAuthFilter` |

**What happens when you click "Save" on the Add Task form?**
1. React checks the form (title length, priority chosen).
2. `taskService.createTask()` sends `POST /api/tasks` with the JSON and the token.
3. `JwtAuthFilter` checks the token. If it's bad → 401.
4. `TaskController` gets the request; `@Valid` checks the fields. If wrong → 400 with field errors.
5. `TaskService` sets the default status and calls `taskRepository.save()`.
6. Hibernate runs `INSERT INTO tasks ...` in PostgreSQL.
7. The saved task goes back as JSON with status 201, and React shows a success message.

## 3. The main technologies

**Java** — The backend language. I kept the code Java 8 compatible (no `var`, no `List.of`).

**Spring Boot** — Makes a Spring app easy to start. It sets up Tomcat, JSON, database connection and more from
the dependencies in `pom.xml`. I just run `TrueTrackApplication.main()`.

**Spring MVC / REST** — `@RestController`, `@GetMapping`, `@PostMapping` map URLs to Java methods. The return value
is turned into JSON by Jackson.

**Spring Data JPA** — I write an interface like `TaskRepository extends JpaRepository<Task, Long>` and Spring writes
the code. `countByStatus(...)` becomes a SQL query just from the method name.

**Hibernate ORM** — Maps Java objects to tables. `@Entity`, `@Id`, `@Column`, `@Enumerated` tell it how. With
`ddl-auto=update` it also creates the tables for me.

**PostgreSQL** — The relational database that stores users and tasks.

**Spring Security + JWT** — Protects the API. After login the server gives a signed token. The frontend sends it
in the `Authorization` header, and the filter checks it on every request. No session is stored on the server.

**BCrypt** — Hashes passwords. The real password is never saved. Login uses `passwordEncoder.matches()`.

**React** — Builds the UI from components. `useState` keeps data, `useEffect` loads data from the API,
React Router switches pages without reloading.

**Maven** — Downloads libraries and builds the jar (`mvn spring-boot:run`, `mvn test`, `mvn package`).

**Postman** — To call the APIs by hand and check status codes before the UI was ready.

## 4. CRUD operations

| Operation | HTTP | URL | Service method | SQL Hibernate runs |
|-----------|------|-----|----------------|--------------------|
| Create | POST | `/api/tasks` | `createTask` | `INSERT` |
| Read all | GET | `/api/tasks` | `getTasks` | `SELECT ... ORDER BY created_at DESC` |
| Read one | GET | `/api/tasks/{id}` | `getTask` | `SELECT ... WHERE id = ?` |
| Update | PUT | `/api/tasks/{id}` | `updateTask` | `UPDATE` |
| Update status | PATCH | `/api/tasks/{id}/status` | `updateStatus` | `UPDATE` |
| Delete | DELETE | `/api/tasks/{id}` | `deleteTask` | `DELETE` |

Search and filters: `TaskSpecifications` builds the WHERE part only for the filters the user picked, e.g.
`WHERE lower(title) LIKE '%bug%' AND status = 'PENDING'`.

## 5. Example request and response

Login:
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "ravi@example.com", "password": "secret123" }
```
```json
200 OK
{ "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyYXZp...", "user": { "id": 1, "name": "Ravi Kumar", "email": "ravi@example.com" } }
```

Change status:
```http
PATCH /api/tasks/7/status
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{ "status": "COMPLETED" }
```
```json
200 OK
{ "id": 7, "title": "Fix login page bug", "status": "COMPLETED", "priority": "HIGH", "...": "..." }
```

Task that does not exist:
```json
404 Not Found
{ "status": 404, "error": "Not Found", "message": "Task not found with id 99", "path": "/api/tasks/99" }
```

---

## 6. Common interview questions (short answers)

**Q1. What is Spring Boot and why did you use it?**
- It is Spring with auto setup and an embedded server.
- I add starters in `pom.xml` and it configures things for me.
- So I spent time on features, not on config.

**Q2. Difference between `@Controller` and `@RestController`?**
- `@RestController` = `@Controller` + `@ResponseBody`.
- It returns data (JSON), not an HTML page.

**Q3. What does `@Service` do? Why not put logic in the controller?**
- It marks the business-logic class.
- Controller only handles HTTP. Service holds the rules. This keeps code clean and easy to test.

**Q4. What is JPA and what is Hibernate?**
- JPA is the standard (rules and annotations like `@Entity`).
- Hibernate is the library that actually does it.
- Spring Data JPA sits on top and gives ready repository methods.

**Q5. What does `JpaRepository` give you?**
- `save`, `findById`, `findAll`, `deleteById`, `count` and more.
- I don't write SQL for normal CRUD.

**Q6. How do derived query methods work?**
- Spring reads the method name, like `countByStatus(status)`.
- It builds `SELECT COUNT(*) FROM tasks WHERE status = ?`.

**Q7. What is `@Entity`, `@Id`, `@GeneratedValue`?**
- `@Entity`: this class is a table.
- `@Id`: primary key.
- `@GeneratedValue(IDENTITY)`: the database creates the id.

**Q8. Why `@Enumerated(EnumType.STRING)`?**
- It saves "HIGH" instead of a number.
- Easy to read in the database, and adding a new enum value later won't break old data.

**Q9. What is a DTO? Why not return the entity?**
- DTO = object only for request/response data.
- I control the JSON, I hide things like the password hash, and DB changes don't break the API.

**Q10. How does validation work?**
- I put `@NotBlank`, `@Size`, `@NotNull` on the request class.
- `@Valid` in the controller runs the checks.
- If something fails, my `GlobalExceptionHandler` returns 400 with the field errors.

**Q11. How do you handle exceptions?**
- Services throw custom exceptions like `ResourceNotFoundException`.
- `@RestControllerAdvice` catches them and returns JSON with the right status (404, 409, 400).

**Q12. Which HTTP status codes do you use?**
- 200 OK, 201 Created, 204 No Content (delete).
- 400 bad input, 401 not logged in, 404 not found, 409 duplicate email, 500 server error.

**Q13. PUT vs PATCH?**
- PUT sends the full task to replace it.
- PATCH changes only part of it. I use PATCH just for the status.

**Q14. How does JWT login work in your project?**
- User logs in, server checks the password with BCrypt and creates a signed token with the email inside.
- React saves the token and sends `Authorization: Bearer <token>` on every call.
- `JwtAuthFilter` checks the signature and expiry before the controller runs.

**Q15. What is inside a JWT?**
- Header, payload, signature.
- Payload has the email (subject) and expiry time.
- The signature uses my secret key, so nobody can change the token without it being rejected.

**Q16. Why not store passwords as plain text? Why BCrypt?**
- If the DB leaks, plain passwords leak.
- BCrypt is a one-way, slow hash with a salt, so it's hard to crack.

**Q17. Why STATELESS sessions and why is CSRF disabled?**
- The token is checked on every request, the server keeps no session.
- CSRF attacks use cookies. We send the token in a header, not a cookie, so CSRF protection is not needed here.

**Q18. What is CORS and why did you configure it?**
- The browser blocks calls from one origin (localhost:5173) to another (localhost:8080) by default.
- I allow the React app's URL in `SecurityConfig`.

**Q19. Where are the secrets kept?**
- In environment variables (`DB_PASSWORD`, `JWT_SECRET`), not in the code or Git.

**Q20. What does `@Transactional` do?**
- Runs the method in one DB transaction.
- If something fails, all changes in that method are rolled back.

**Q21. How did you implement search and filters?**
- Optional query params: `search`, `status`, `priority`.
- `TaskSpecifications` adds a WHERE condition only for the ones that are given.
- Filtering happens in the database, not in the browser.

**Q22. How did you test the backend?**
- Unit tests with JUnit and Mockito for `TaskService` (fake repository).
- Integration tests with MockMvc and an H2 in-memory DB that call the real endpoints.
- And Postman for manual API checks.

**Q23. What is the difference between unit and integration tests?**
- Unit test checks one class alone with mocks. Fast.
- Integration test runs many layers together, like controller + service + DB.

**Q24. How does React get data from the backend?**
- In `useEffect`, the page calls a function in `services/` that uses `fetch`.
- While waiting it shows "Loading", then shows data or an error.

**Q25. How do you protect pages in React?**
- `ProtectedRoute` checks if a token exists. If not, it sends you to `/login`.
- The real protection is on the backend; the frontend check is for user experience.

**Q26. What are `useState` and `useEffect`?**
- `useState` stores data in a component and re-renders when it changes.
- `useEffect` runs code after render, like loading data.

**Q27. What happens when the token expires?**
- The backend returns 401 with "Your session has expired".
- The frontend clears the token and sends the user to the login page.

**Q28. Why PostgreSQL and not MySQL?**
- Both would work. PostgreSQL is free, reliable and very common in companies.
- With JPA I could switch with mostly config changes.

**Q29. What would you add next?**
- Pagination for big lists, roles (admin/user), due dates, and comments on tasks.
- Flyway for database migrations instead of `ddl-auto=update`.

**Q30. What was a challenge you faced?**
- Example answer: showing server validation errors next to the right field.
- I return a `fieldErrors` map from the backend, and the form reads it and shows each message under its input.

---

## 7. Files to open first when explaining

1. `backend/.../entity/Task.java` — the data.
2. `backend/.../controller/TaskController.java` — the endpoints.
3. `backend/.../service/TaskService.java` — the logic.
4. `backend/.../security/JwtAuthFilter.java` + `config/SecurityConfig.java` — login protection.
5. `frontend/src/services/api.js` — how React calls the backend.
6. `frontend/src/components/TaskForm.jsx` — form + validation.
7. `frontend/src/pages/DashboardPage.jsx` — summary cards.
