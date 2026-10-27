// Values that match the backend enums exactly, plus friendly labels for the UI.

export const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

// Find the label for a value, e.g. getLabel(STATUS_OPTIONS, 'IN_PROGRESS') -> 'In Progress'
export function getLabel(options, value) {
  const option = options.find((item) => item.value === value);
  return option ? option.label : value;
}
