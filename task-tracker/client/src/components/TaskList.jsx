import TaskCard from './TaskCard';
import { FiInbox } from 'react-icons/fi';

const TaskList = ({ tasks, loading, onEdit, onDelete, onStatusChange }) => {
  if (loading) {
    return (
      <div className="task-list-skeleton">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <FiInbox size={52} className="empty-icon" />
        <h3>No tasks found</h3>
        <p>Create a new task or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default TaskList;
