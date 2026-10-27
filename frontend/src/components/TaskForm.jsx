// Form used by both "Add Task" and "Edit Task".
// It checks the same rules as the backend before sending anything.
import { useState } from 'react';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../constants.js';

const EMPTY_TASK = {
  title: '',
  description: '',
  assignedTo: '',
  priority: 'MEDIUM',
  status: 'PENDING',
};

// Returns an object like { title: 'Title is required' }. Empty object = valid.
export function validateTask(task) {
  const errors = {};
  const title = task.title.trim();

  if (!title) {
    errors.title = 'Title is required';
  } else if (title.length < 3 || title.length > 100) {
    errors.title = 'Title must be between 3 and 100 characters';
  }
  if (task.description.trim().length > 1000) {
    errors.description = 'Description must be at most 1000 characters';
  }
  if (task.assignedTo.trim().length > 100) {
    errors.assignedTo = 'Assigned to must be at most 100 characters';
  }
  if (!task.priority) {
    errors.priority = 'Priority is required';
  }
  return errors;
}

/**
 * Props:
 *  - initialTask:  task to edit (leave out for a new task)
 *  - onSubmit:     async function(taskData) called with clean data
 *  - submitLabel:  text on the submit button
 *  - serverErrors: fieldErrors object from the backend (e.g. { title: '...' })
 *  - submitting:   true while the request is running
 *  - onCancel:     called when "Cancel" is clicked
 */
function TaskForm({ initialTask, onSubmit, submitLabel = 'Save', serverErrors = {}, submitting = false, onCancel }) {
  const [task, setTask] = useState({
    title: initialTask?.title || EMPTY_TASK.title,
    description: initialTask?.description || EMPTY_TASK.description,
    assignedTo: initialTask?.assignedTo || EMPTY_TASK.assignedTo,
    priority: initialTask?.priority || EMPTY_TASK.priority,
    status: initialTask?.status || EMPTY_TASK.status,
  });
  const [errors, setErrors] = useState({});

  // One change handler for every field: uses the input's "name".
  function handleChange(event) {
    const { name, value } = event.target;
    setTask({ ...task, [name]: value });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateTask(task);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return; // stop here, the errors are shown under the fields
    }

    onSubmit({
      title: task.title.trim(),
      description: task.description.trim(),
      assignedTo: task.assignedTo.trim(),
      priority: task.priority,
      status: task.status,
    });
  }

  // Client errors win; otherwise show what the backend said.
  function errorFor(field) {
    return errors[field] || serverErrors[field] || '';
  }

  return (
    <form className="form card" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          value={task.title}
          onChange={handleChange}
          maxLength={100}
          placeholder="e.g. Fix login page bug"
          aria-invalid={Boolean(errorFor('title'))}
        />
        {errorFor('title') && <p className="field-error">{errorFor('title')}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={5}
          value={task.description}
          onChange={handleChange}
          maxLength={1000}
          placeholder="What needs to be done?"
          aria-invalid={Boolean(errorFor('description'))}
        />
        <p className="field-hint">{task.description.length}/1000</p>
        {errorFor('description') && <p className="field-error">{errorFor('description')}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="assignedTo">Assigned to</label>
        <input
          id="assignedTo"
          name="assignedTo"
          type="text"
          value={task.assignedTo}
          onChange={handleChange}
          maxLength={100}
          placeholder="e.g. Priya"
          aria-invalid={Boolean(errorFor('assignedTo'))}
        />
        {errorFor('assignedTo') && <p className="field-error">{errorFor('assignedTo')}</p>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">Priority *</label>
          <select
            id="priority"
            name="priority"
            value={task.priority}
            onChange={handleChange}
            aria-invalid={Boolean(errorFor('priority'))}
          >
            <option value="">Select priority</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errorFor('priority') && <p className="field-error">{errorFor('priority')}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={task.status} onChange={handleChange}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errorFor('status') && <p className="field-error">{errorFor('status')}</p>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
