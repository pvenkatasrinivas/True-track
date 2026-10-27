// Coloured label for a task priority, e.g. "High".
import { PRIORITY_OPTIONS, getLabel } from '../constants.js';

function PriorityBadge({ priority }) {
  const cssClass = 'badge badge-priority-' + String(priority).toLowerCase();
  return <span className={cssClass}>{getLabel(PRIORITY_OPTIONS, priority)}</span>;
}

export default PriorityBadge;
