package com.truetrack.service;

import com.truetrack.dto.TaskRequest;
import com.truetrack.dto.TaskResponse;
import com.truetrack.dto.TaskSummaryResponse;
import com.truetrack.entity.Task;
import com.truetrack.entity.TaskPriority;
import com.truetrack.entity.TaskStatus;
import com.truetrack.exception.ResourceNotFoundException;
import com.truetrack.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for TaskService. The repository is a Mockito mock, so no database is used:
 * we only test the business logic.
 */
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    private TaskService taskService;

    @BeforeEach
    void setUp() {
        taskService = new TaskService(taskRepository);
    }

    @Test
    void createTaskDefaultsToPendingAndTrimsText() {
        TaskRequest request = new TaskRequest();
        request.setTitle("  Fix printer  ");
        request.setDescription("   ");
        request.setAssignedTo(" Priya ");
        request.setPriority(TaskPriority.MEDIUM);
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskResponse response = taskService.createTask(request);

        ArgumentCaptor<Task> saved = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(saved.capture());
        assertThat(saved.getValue().getTitle()).isEqualTo("Fix printer");
        assertThat(saved.getValue().getDescription()).isNull();
        assertThat(saved.getValue().getAssignedTo()).isEqualTo("Priya");
        assertThat(response.getStatus()).isEqualTo(TaskStatus.PENDING);
    }

    @Test
    void getTaskThrowsNotFoundForUnknownId() {
        when(taskRepository.findById(99L)).thenReturn(Optional.<Task>empty());

        assertThatThrownBy(() -> taskService.getTask(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Task not found with id 99");
    }

    @Test
    void updateStatusChangesOnlyTheStatus() {
        Task task = existingTask(5L, "Check stock", TaskStatus.PENDING);
        when(taskRepository.findById(5L)).thenReturn(Optional.of(task));
        when(taskRepository.saveAndFlush(task)).thenReturn(task);

        TaskResponse response = taskService.updateStatus(5L, TaskStatus.COMPLETED);

        assertThat(response.getStatus()).isEqualTo(TaskStatus.COMPLETED);
        assertThat(response.getTitle()).isEqualTo("Check stock");
    }

    @Test
    void updateTaskKeepsStatusWhenNotProvided() {
        Task task = existingTask(6L, "Old title", TaskStatus.IN_PROGRESS);
        when(taskRepository.findById(6L)).thenReturn(Optional.of(task));
        when(taskRepository.saveAndFlush(task)).thenReturn(task);
        TaskRequest request = new TaskRequest();
        request.setTitle("New title");
        request.setPriority(TaskPriority.HIGH);

        TaskResponse response = taskService.updateTask(6L, request);

        assertThat(response.getTitle()).isEqualTo("New title");
        assertThat(response.getPriority()).isEqualTo(TaskPriority.HIGH);
        assertThat(response.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
    }

    @Test
    void deleteUnknownTaskThrowsAndDeletesNothing() {
        when(taskRepository.findById(7L)).thenReturn(Optional.<Task>empty());

        assertThatThrownBy(() -> taskService.deleteTask(7L)).isInstanceOf(ResourceNotFoundException.class);
        verify(taskRepository, never()).delete(any(Task.class));
    }

    @Test
    void summaryUsesRepositoryCounts() {
        when(taskRepository.count()).thenReturn(10L);
        when(taskRepository.countByStatus(TaskStatus.PENDING)).thenReturn(4L);
        when(taskRepository.countByStatus(TaskStatus.IN_PROGRESS)).thenReturn(3L);
        when(taskRepository.countByStatus(TaskStatus.COMPLETED)).thenReturn(3L);
        when(taskRepository.countByPriorityAndStatusNot(TaskPriority.HIGH, TaskStatus.COMPLETED)).thenReturn(2L);
        when(taskRepository.findTop5ByOrderByUpdatedAtDesc()).thenReturn(Collections.<Task>emptyList());

        TaskSummaryResponse summary = taskService.getSummary();

        assertThat(summary.getTotal()).isEqualTo(10);
        assertThat(summary.getPending()).isEqualTo(4);
        assertThat(summary.getInProgress()).isEqualTo(3);
        assertThat(summary.getCompleted()).isEqualTo(3);
        assertThat(summary.getHighPriority()).isEqualTo(2);
        assertThat(summary.getRecentTasks()).isEmpty();
    }

    private Task existingTask(Long id, String title, TaskStatus status) {
        Task task = new Task();
        task.setId(id);
        task.setTitle(title);
        task.setPriority(TaskPriority.LOW);
        task.setStatus(status);
        return task;
    }
}
