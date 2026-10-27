package com.truetrack.dto;

import com.truetrack.entity.Task;
import com.truetrack.entity.TaskPriority;
import com.truetrack.entity.TaskStatus;

import java.time.Instant;

/**
 * What the API returns for a task. We return a DTO instead of the entity itself
 * so the JSON shape is controlled here and database details are not exposed.
 */
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private String assignedTo;
    private TaskPriority priority;
    private TaskStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    /** Converts an entity into a response object. */
    public static TaskResponse from(Task task) {
        TaskResponse response = new TaskResponse();
        response.id = task.getId();
        response.title = task.getTitle();
        response.description = task.getDescription();
        response.assignedTo = task.getAssignedTo();
        response.priority = task.getPriority();
        response.status = task.getStatus();
        response.createdAt = task.getCreatedAt();
        response.updatedAt = task.getUpdatedAt();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
