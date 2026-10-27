// All tasks, with search and filters. Table on desktop, cards on mobile.
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteTask, getTasks } from '../services/taskService.js';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../constants.js';
import { useFlashMessage } from '../hooks/useFlashMessage.js';
import { formatDate } from '../utils/formatDate.js';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SuccessMessage from '../components/SuccessMessage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

const NO_FILTERS = { search: '', status: '', priority: '' };

function TaskListPage() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useFlashMessage();
  const [deletingId, setDeletingId] = useState(null);

  // The backend does the filtering (search by title, status, priority).
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTasks(await getTasks(filters));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Reload when filters change. Wait 300 ms so we don't call the API on every key press.
  useEffect(() => {
    const timer = setTimeout(loadTasks, 300);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete the task "${task.title}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(task.id);
    setError('');
    try {
      await deleteTask(task.id);
      setTasks(tasks.filter((item) => item.id !== task.id)); // remove it from the screen
      setSuccessMessage('Task deleted successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const clearSuccess = useCallback(() => setSuccessMessage(''), [setSuccessMessage]);
  const hasFilters = filters.search || filters.status || filters.priority;

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p className="page-subtitle">Everything your team is working on</p>
        </div>
        <Link to="/tasks/new" className="btn btn-primary">
          + Add Task
        </Link>
      </div>

      <SuccessMessage message={successMessage} onClose={clearSuccess} />

      <div className="filters card">
        <div className="form-group filter-search">
          <label htmlFor="search">Search by title</label>
          <input
            id="search"
            name="search"
            type="search"
            placeholder="e.g. login bug"
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="status-filter">Status</label>
          <select id="status-filter" name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="priority-filter">Priority</label>
          <select id="priority-filter" name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All priorities</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-outline filter-clear"
          onClick={() => setFilters(NO_FILTERS)}
          disabled={!hasFilters}
        >
          Clear filters
        </button>
      </div>

      <ErrorMessage message={error} onRetry={loadTasks} />

      {loading && <Loading text="Loading tasks..." />}

      {!loading && !error && tasks.length === 0 && (
        hasFilters ? (
          <EmptyState title="No matching tasks" text="Try a different search or clear the filters." />
        ) : (
          <EmptyState title="No tasks yet" text="Create your first task to get started.">
            <Link to="/tasks/new" className="btn btn-primary">
              Add Task
            </Link>
          </EmptyState>
        )
      )}

      {!loading && tasks.length > 0 && (
        <>
          <p className="result-count">
            Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </p>

          {/* Desktop and tablet: table */}
          <div className="card table-wrapper desktop-only">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Assigned to</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Last updated</th>
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <Link to={`/tasks/${task.id}`}>{task.title}</Link>
                    </td>
                    <td>{task.assignedTo || '-'}</td>
                    <td>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td>{formatDate(task.updatedAt)}</td>
                    <td className="actions-column">
                      <div className="row-actions">
                        <Link to={`/tasks/${task.id}/edit`} className="btn btn-outline btn-small">
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-danger btn-small"
                          onClick={() => handleDelete(task)}
                          disabled={deletingId === task.id}
                        >
                          {deletingId === task.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards */}
          <ul className="task-cards mobile-only">
            {tasks.map((task) => (
              <li key={task.id} className="task-card card">
                <Link to={`/tasks/${task.id}`} className="task-card-title">
                  {task.title}
                </Link>
                <div className="task-card-badges">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
                <p className="task-card-meta">Assigned to: {task.assignedTo || '-'}</p>
                <p className="task-card-meta">Updated: {formatDate(task.updatedAt)}</p>
                <div className="row-actions">
                  <Link to={`/tasks/${task.id}/edit`} className="btn btn-outline btn-small">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(task)}
                    disabled={deletingId === task.id}
                  >
                    {deletingId === task.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default TaskListPage;
