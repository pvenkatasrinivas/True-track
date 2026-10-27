// Coloured label for a task status, e.g. "In Progress".
import { STATUS_OPTIONS, getLabel } from '../constants.js';

function StatusBadge({ status }) {
  // CSS class like "badge badge-in-progress"
  const cssClass = 'badge badge-' + String(status).toLowerCase().replace('_', '-');
  return <span className={cssClass}>{getLabel(STATUS_OPTIONS, status)}</span>;
}

export default StatusBadge;
