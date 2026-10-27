import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

describe('StatusBadge', () => {
  it('shows a friendly label and the matching CSS class', () => {
    render(<StatusBadge status="IN_PROGRESS" />);

    const badge = screen.getByText('In Progress');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge', 'badge-in-progress');
  });

  it('renders every status from the API contract', () => {
    render(
      <>
        <StatusBadge status="PENDING" />
        <StatusBadge status="COMPLETED" />
      </>
    );

    expect(screen.getByText('Pending')).toHaveClass('badge-pending');
    expect(screen.getByText('Completed')).toHaveClass('badge-completed');
  });
});

describe('PriorityBadge', () => {
  it('shows the priority label', () => {
    render(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText('High')).toHaveClass('badge-priority-high');
  });
});
