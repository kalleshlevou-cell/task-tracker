/**
 * Reusable Badge component for status and priority labels.
 */
const STATUS_STYLES = {
  todo: 'badge-todo',
  'in-progress': 'badge-in-progress',
  completed: 'badge-completed',
};

const PRIORITY_STYLES = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
};

const Badge = ({ type, value }) => {
  const className =
    type === 'status'
      ? `badge ${STATUS_STYLES[value] || 'badge-todo'}`
      : `badge ${PRIORITY_STYLES[value] || 'badge-medium'}`;

  const label =
    type === 'status'
      ? value === 'in-progress'
        ? 'In Progress'
        : value.charAt(0).toUpperCase() + value.slice(1)
      : value.charAt(0).toUpperCase() + value.slice(1);

  return <span className={className}>{label}</span>;
};

export default Badge;
