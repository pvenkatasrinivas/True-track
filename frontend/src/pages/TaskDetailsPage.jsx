// Everything about one task, with quick status buttons, Edit and Delete.
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteTask, getTask, updateTaskStatus } from '../services/taskService.js';
import { STATUS_OPTIONS, getLabel } from '../constants.js';
import { useFlashMessage } from '../hooks/useFlashMessage.js';
import { formatDate } from '../utils/formatDate.js';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import SuccessMessage from '../components/SuccessMessage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false); // true while a status change or delete is running
  const [successMessage, setSuccessMessage] = useFlashMessage();

  useEffect(() => {
    async function loadTask() {
      setLoading(true);
      setLoadError('');
      try {
        setTask(await getTask(id));
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTask();
  }, [id]);

  async function handleStatusChange(newStatus) {
    setBusy(true);
    setActionError('');
    try {
      const updated = await updateTaskStatus(id, newStatus);
      setTask(updated);
      setSuccessMessage(`Status changed to ${getLabel(STATUS_OPTIONS, newStatus)}.`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete the task "${task.title}"? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    setActionError('');
    try {
      await deleteTask(id);
      navigate('/tasks', { state: { message: 'Task deleted successfully.' } });
    } catch (err) {
      setActionError(err.message);
      setBusy(false);
    }
  }

  const clearSuccess = useCallback(() => setSuccessMessage(''), [setSuccessMessage]);

  return (
    <section className="narrow">
      <Link to="/tasks" className="back-link">
        &larr; Back to tasks
      </Link>

      {loading && <Loading text="Loading task..." />}
      <ErrorMessage message={loadError} />

      {!loading && task && (
        <>
          <SuccessMessage message={successMessage} onClose={clearSuccess} />
          <ErrorMessage message={actionError} />

          <div className="card details-card">
            <div className="details-header">
              <h1>{task.title}</h1>
              <div className="details-badges">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </div>
            </div>

            <dl className="details-list">
              <div>
                <dt>Description</dt>
                <dd className="description">{task.description || 'No description'}</dd>
              </div>
              <div>
                <dt>Assigned to</dt>
                <dd>{task.assignedTo || 'Not assigned'}</dd>
              </div>
              <div>
                <dt>Task ID</dt>
                <dd>#{task.id}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(task.createdAt)}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{formatDate(task.updatedAt)}</dd>
              </div>
            </dl>

            <div className="status-actions">
              <p className="status-actions-label">Change status:</p>
              <div className="button-group">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={task.status === option.value ? 'btn btn-primary btn-small' : 'btn btn-outline btn-small'}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={busy || task.status === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <Link to={`/tasks/${task.id}/edit`} className="btn btn-primary">
                Edit
              </Link>
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={busy}>
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default TaskDetailsPage;
