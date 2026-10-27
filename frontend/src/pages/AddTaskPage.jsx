// Create a new task using the shared TaskForm.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createTask } from '../services/taskService.js';
import TaskForm from '../components/TaskForm.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

function AddTaskPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  async function handleSubmit(taskData) {
    setSubmitting(true);
    setError('');
    setFieldErrors({});
    try {
      const created = await createTask(taskData);
      navigate(`/tasks/${created.id}`, { state: { message: 'Task created successfully.' } });
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
      setSubmitting(false);
    }
  }

  return (
    <section className="narrow">
      <Link to="/tasks" className="back-link">
        &larr; Back to tasks
      </Link>
      <h1>Add Task</h1>
      <ErrorMessage message={error} />
      <TaskForm
        onSubmit={handleSubmit}
        submitLabel="Create task"
        serverErrors={fieldErrors}
        submitting={submitting}
        onCancel={() => navigate('/tasks')}
      />
    </section>
  );
}

export default AddTaskPage;
