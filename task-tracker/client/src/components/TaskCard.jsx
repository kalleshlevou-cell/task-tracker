import { useState } from 'react';
import { FiEdit2, FiTrash2, FiCalendar, FiTag, FiCheckCircle, FiClock } from 'react-icons/fi';
import { format, isPast, isToday } from 'date-fns';
import Badge from './Badge';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDateObj && isPast(dueDateObj) && task.status !== 'completed';
  const isDueToday = dueDateObj && isToday(dueDateObj);

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(task._id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const cycleStatus = () => {
    const cycle = { todo: 'in-progress', 'in-progress': 'completed', completed: 'todo' };
    onStatusChange(task._id, { ...task, status: cycle[task.status] });
  };

  return (
    <article className={`task-card priority-${task.priority} ${task.status === 'completed' ? 'task-completed' : ''}`}>
      {/* Priority stripe */}
      <div className={`priority-stripe priority-stripe-${task.priority}`} />

      <div className="task-card-body">
        {/* Header */}
        <div className="task-card-header">
          <div className="task-badges">
            <Badge type="status" value={task.status} />
            <Badge type="priority" value={task.priority} />
          </div>
          <div className="task-actions">
            <button
              className="btn-icon"
              onClick={cycleStatus}
              title={`Mark as ${task.status === 'completed' ? 'todo' : task.status === 'todo' ? 'in-progress' : 'completed'}`}
              aria-label="Cycle task status"
            >
              {task.status === 'completed' ? <FiCheckCircle size={18} className="icon-done" /> : <FiClock size={18} />}
            </button>
            <button
              className="btn-icon"
              onClick={() => onEdit(task)}
              title="Edit task"
              aria-label="Edit task"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              className={`btn-icon ${confirmDelete ? 'btn-icon-danger' : ''}`}
              onClick={handleDelete}
              title={confirmDelete ? 'Click again to confirm' : 'Delete task'}
              aria-label="Delete task"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-desc">{task.description}</p>}

        {/* Footer */}
        <div className="task-card-footer">
          {dueDateObj && (
            <span className={`task-due ${isOverdue ? 'overdue' : isDueToday ? 'due-today' : ''}`}>
              <FiCalendar size={13} />
              {isOverdue ? 'Overdue: ' : isDueToday ? 'Due today: ' : ''}
              {format(dueDateObj, 'MMM d, yyyy')}
            </span>
          )}
          {task.tags?.length > 0 && (
            <div className="task-tags">
              <FiTag size={12} />
              {task.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && <span className="tag">+{task.tags.length - 3}</span>}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default TaskCard;
