package com.truetrack.repository;

import com.truetrack.entity.Task;
import com.truetrack.entity.TaskPriority;
import com.truetrack.entity.TaskStatus;
import org.springframework.data.jpa.domain.Specification;

/**
 * Small reusable pieces of a WHERE clause for searching tasks.
 * The service combines only the filters the user actually selected, for example:
 *   titleContains("bug").and(hasStatus(PENDING))  ->  WHERE lower(title) LIKE '%bug%' AND status = 'PENDING'
 */
public final class TaskSpecifications {

    private TaskSpecifications() {
    }

    /** Case-insensitive "title contains text". */
    public static Specification<Task> titleContains(final String text) {
        final String pattern = "%" + text.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.<String>get("title")), pattern);
    }

    public static Specification<Task> hasStatus(final TaskStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Task> hasPriority(final TaskPriority priority) {
        return (root, query, cb) -> cb.equal(root.get("priority"), priority);
    }
}
