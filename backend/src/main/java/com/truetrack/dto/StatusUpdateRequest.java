package com.truetrack.dto;

import com.truetrack.entity.TaskStatus;

import javax.validation.constraints.NotNull;

/** Body of PATCH /api/tasks/{id}/status, e.g. { "status": "COMPLETED" }. */
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TaskStatus status;

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }
}
