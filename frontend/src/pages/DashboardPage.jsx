// Dashboard: summary cards + the most recently updated tasks.
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSummary } from '../services/taskService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useFlashMessage } from '../hooks/useFlashMessage.js';
import { formatDate } from '../utils/formatDate.js';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SuccessMessage from '../components/SuccessMessage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useFlashMessage();

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSummary(await getSummary());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Runs every time the dashboard is opened (the page is mounted again on each visit),
  // so the numbers always include the latest changes.
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const clearSuccess = useCallback(() => setSuccessMessage(''), [setSuccessMessage]);

  const cards = summary
    ? [
        { label: 'Total tasks', value: summary.total, className: 'stat-total' },
        { label: 'Pending', value: summary.pending, className: 'stat-pending' },
        { label: 'In progress', value: summary.inProgress, className: 'stat-progress' },
        { label: 'Completed', value: summary.completed, className: 'stat-completed' },
        { label: 'High priority open', value: summary.highPriority, className: 'stat-high' },
      ]
    : [];

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}</p>
        </div>
        <Link to="/tasks/new" className="btn btn-primary">
          + Add Task
        </Link>
      </div>

      <SuccessMessage message={successMessage} onClose={clearSuccess} />
      <ErrorMessage message={error} onRetry={loadSummary} />

      {loading && <Loading text="Loading dashboard..." />}

      {!loading && summary && (
        <>
          <div className="stats-grid">
            {cards.map((card) => (
              <div key={card.label} className={`stat-card ${card.className}`}>
                <p className="stat-label">{card.label}</p>
                <p className="stat-value">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Recent tasks</h2>
              <Link to="/tasks">View all</Link>
            </div>

            {summary.recentTasks.length === 0 ? (
              <EmptyState title="No tasks yet" text="Create your first task to get started.">
                <Link to="/tasks/new" className="btn btn-primary">
                  Add Task
                </Link>
              </EmptyState>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Assigned to</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Last updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentTasks.map((task) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default DashboardPage;
