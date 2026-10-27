// Edit an existing task. Loads it first, then shows the shared TaskForm.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getTask, updateTask } from '../services/taskService.js';
import TaskForm from '../components/TaskForm.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

function EditTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    async function loadTask() {
      setLoading(true);
      setLoadError('');
      try {
        setTask(await getTask(id));
      } catch (err) {
        setLoadError(err.message); // e.g. "Task not found with id 99"
      } finally {
        setLoading(false);
      }
    }
    loadTask();
  }, [id]);

  async function handleSubmit(taskData) {
    setSubmitting(true);
    setError('');
    setFieldErrors({});
    try {
      await updateTask(id, taskData);
      navigate(`/tasks/${id}`, { state: { message: 'Task updated successfully.' } });
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
      setSubmitting(false);
    }
  }

  return (
    <section className="narrow">
      <Link to={`/tasks/${id}`} className="back-link">
        &larr; Back to task
      </Link>
      <h1>Edit Task</h1>

      {loading && <Loading text="Loading task..." />}
      <ErrorMessage message={loadError} />

      {!loading && task && (
        <>
          <ErrorMessage message={error} />
          <TaskForm
            initialTask={task}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
            serverErrors={fieldErrors}
            submitting={submitting}
            onCancel={() => navigate(`/tasks/${id}`)}
          />
        </>
      )}
    </section>
  );
}

export default EditTaskPage;
