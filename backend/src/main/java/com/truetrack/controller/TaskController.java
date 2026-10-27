package com.truetrack.controller;

import com.truetrack.dto.StatusUpdateRequest;
import com.truetrack.dto.TaskRequest;
import com.truetrack.dto.TaskResponse;
import com.truetrack.dto.TaskSummaryResponse;
import com.truetrack.entity.TaskPriority;
import com.truetrack.entity.TaskStatus;
import com.truetrack.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.List;

/**
 * REST endpoints for tasks. The controller only handles HTTP (URLs, status codes, JSON);
 * the real work happens in TaskService.
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /** GET /api/tasks?search=bug&status=PENDING&priority=HIGH (all optional) */
    @GetMapping
    public List<TaskResponse> getTasks(@RequestParam(required = false) String search,
                                       @RequestParam(required = false) TaskStatus status,
                                       @RequestParam(required = false) TaskPriority priority) {
        return taskService.getTasks(search, status, priority);
    }

    /** GET /api/tasks/summary - dashboard numbers. (Declared before /{id} for readability; Spring matches literal paths first anyway.) */
    @GetMapping("/summary")
    public TaskSummaryResponse getSummary() {
        return taskService.getSummary();
    }

    @GetMapping("/{id}")
    public TaskResponse getTask(@PathVariable Long id) {
        return taskService.getTask(id);
    }

    /** POST /api/tasks -> 201 Created */
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request));
    }

    @PutMapping("/{id}")
    public TaskResponse updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return taskService.updateTask(id, request);
    }

    /** PATCH because only one field (status) changes. */
    @PatchMapping("/{id}/status")
    public TaskResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return taskService.updateStatus(id, request.getStatus());
    }

    /** DELETE /api/tasks/{id} -> 204 No Content */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
