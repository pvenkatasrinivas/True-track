package com.truetrack.entity;

/** Where a task is in its life. Stored in the database as text (e.g. "IN_PROGRESS"). */
public enum TaskStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED
}
