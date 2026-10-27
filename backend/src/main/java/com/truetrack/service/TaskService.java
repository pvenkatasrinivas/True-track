package com.truetrack.service;

import com.truetrack.dto.TaskRequest;
import com.truetrack.dto.TaskResponse;
import com.truetrack.dto.TaskSummaryResponse;
import com.truetrack.entity.Task;
import com.truetrack.entity.TaskPriority;
import com.truetrack.entity.TaskStatus;
import com.truetrack.exception.ResourceNotFoundException;
import com.truetrack.repository.TaskRepository;
import com.truetrack.repository.TaskSpecifications;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Business logic for tasks. Controllers call this class; this class calls the repository.
 * @Transactional makes each method run in one database transaction.
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /** List tasks, newest first. Each filter is optional (null or empty = not applied). */
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks(String search, TaskStatus status, TaskPriority priority) {
        Specification<Task> spec = Specification.where(null);
        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and(TaskSpecifications.titleContains(search));
        }
        if (status != null) {
            spec = spec.and(TaskSpecifications.hasStatus(status));
        }
        if (priority != null) {
            spec = spec.and(TaskSpecifications.hasPriority(priority));
        }

        List<Task> tasks = taskRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return toResponses(tasks);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(Long id) {
        return TaskResponse.from(findTask(id));
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        Task task = new Task();
        copyFields(request, task);
        task.setStatus(request.getStatus() != null ? request.getStatus() : TaskStatus.PENDING);
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = findTask(id);
        copyFields(request, task);
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        // saveAndFlush runs the UPDATE now, so @PreUpdate sets updatedAt before we build the response
        return TaskResponse.from(taskRepository.saveAndFlush(task));
    }

    @Transactional
    public TaskResponse updateStatus(Long id, TaskStatus status) {
        Task task = findTask(id);
        task.setStatus(status);
        return TaskResponse.from(taskRepository.saveAndFlush(task));
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = findTask(id);
        taskRepository.delete(task);
    }

    /** Counts for the dashboard cards plus the 5 most recently updated tasks. */
    @Transactional(readOnly = true)
    public TaskSummaryResponse getSummary() {
        long total = taskRepository.count();
        long pending = taskRepository.countByStatus(TaskStatus.PENDING);
        long inProgress = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
        long completed = taskRepository.countByStatus(TaskStatus.COMPLETED);
        long highPriority = taskRepository.countByPriorityAndStatusNot(TaskPriority.HIGH, TaskStatus.COMPLETED);
        List<TaskResponse> recent = toResponses(taskRepository.findTop5ByOrderByUpdatedAtDesc());
        return new TaskSummaryResponse(total, pending, inProgress, completed, highPriority, recent);
    }

    // ---------- helpers ----------

    private Task findTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
    }

    /** Copies the editable fields from the request into the entity (trimming text, empty text -> null). */
    private void copyFields(TaskRequest request, Task task) {
        task.setTitle(request.getTitle().trim());
        task.setDescription(emptyToNull(request.getDescription()));
        task.setAssignedTo(emptyToNull(request.getAssignedTo()));
        task.setPriority(request.getPriority());
    }

    private String emptyToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private List<TaskResponse> toResponses(List<Task> tasks) {
        List<TaskResponse> responses = new ArrayList<TaskResponse>();
        for (Task task : tasks) {
            responses.add(TaskResponse.from(task));
        }
        return responses;
    }
}
