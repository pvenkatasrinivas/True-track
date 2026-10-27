package com.truetrack.dto;

import java.util.List;

/** Numbers shown on the dashboard. */
public class TaskSummaryResponse {

    private final long total;
    private final long pending;
    private final long inProgress;
    private final long completed;
    /** HIGH priority tasks that are not completed yet. */
    private final long highPriority;
    private final List<TaskResponse> recentTasks;

    public TaskSummaryResponse(long total, long pending, long inProgress, long completed,
                               long highPriority, List<TaskResponse> recentTasks) {
        this.total = total;
        this.pending = pending;
        this.inProgress = inProgress;
        this.completed = completed;
        this.highPriority = highPriority;
        this.recentTasks = recentTasks;
    }

    public long getTotal() {
        return total;
    }

    public long getPending() {
        return pending;
    }

    public long getInProgress() {
        return inProgress;
    }

    public long getCompleted() {
        return completed;
    }

    public long getHighPriority() {
        return highPriority;
    }

    public List<TaskResponse> getRecentTasks() {
        return recentTasks;
    }
}
