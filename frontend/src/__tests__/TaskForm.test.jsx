import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import TaskForm from '../components/TaskForm.jsx';

describe('TaskForm', () => {
  it('shows an error and does not submit when the title is empty', () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} submitLabel="Create task" />);

    fireEvent.click(screen.getByRole('button', { name: 'Create task' }));

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows an error when the title is too short', () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} submitLabel="Create task" />);

    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'ab' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create task' }));

    expect(screen.getByText('Title must be between 3 and 100 characters')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with clean data when the form is valid', () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} submitLabel="Create task" />);

    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: '  Fix login page bug  ' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Error message is not shown' } });
    fireEvent.change(screen.getByLabelText('Assigned to'), { target: { value: 'Priya' } });
    fireEvent.change(screen.getByLabelText('Priority *'), { target: { value: 'HIGH' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'IN_PROGRESS' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create task' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Fix login page bug',
      description: 'Error message is not shown',
      assignedTo: 'Priya',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
    });
  });

  it('requires a priority', () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} submitLabel="Create task" />);

    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'Valid title' } });
    fireEvent.change(screen.getByLabelText('Priority *'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create task' }));

    expect(screen.getByText('Priority is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows field errors that came from the server', () => {
    render(
      <TaskForm
        onSubmit={vi.fn()}
        serverErrors={{ assignedTo: 'Assigned to must be at most 100 characters' }}
      />
    );

    expect(screen.getByText('Assigned to must be at most 100 characters')).toBeInTheDocument();
  });

  it('fills the fields when editing an existing task', () => {
    const task = {
      id: 7,
      title: 'Fix login page bug',
      description: 'Error message is not shown',
      assignedTo: 'Priya',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
    };
    render(<TaskForm initialTask={task} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Title *')).toHaveValue('Fix login page bug');
    expect(screen.getByLabelText('Priority *')).toHaveValue('HIGH');
    expect(screen.getByLabelText('Status')).toHaveValue('IN_PROGRESS');
  });
});
