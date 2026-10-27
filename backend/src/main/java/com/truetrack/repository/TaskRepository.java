package com.truetrack.repository;

import com.truetrack.entity.Task;
import com.truetrack.entity.TaskPriority;
import com.truetrack.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

/**
 * Database access for tasks.
 * - JpaRepository gives save, findById, findAll, deleteById, count, ...
 * - JpaSpecificationExecutor lets us build the search/filter WHERE clause step by step
 *   (see TaskSpecifications).
 */
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    long countByStatus(TaskStatus status);

    long countByPriorityAndStatusNot(TaskPriority priority, TaskStatus status);

    List<Task> findTop5ByOrderByUpdatedAtDesc();
}
