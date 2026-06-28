import { FiCheckSquare, FiClock, FiLoader, FiList } from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className={`stat-card ${colorClass}`}>
    <div className="stat-icon">
      <Icon size={22} />
    </div>
    <div className="stat-info">
      <span className="stat-value">{value ?? 0}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
);

const StatsBar = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="stats-bar">
      <StatCard icon={FiList} label="Total" value={stats.total} colorClass="stat-total" />
      <StatCard
        icon={FiClock}
        label="To Do"
        value={stats.byStatus?.todo}
        colorClass="stat-todo"
      />
      <StatCard
        icon={FiLoader}
        label="In Progress"
        value={stats.byStatus?.['in-progress']}
        colorClass="stat-progress"
      />
      <StatCard
        icon={FiCheckSquare}
        label="Completed"
        value={stats.byStatus?.completed}
        colorClass="stat-done"
      />
    </div>
  );
};

export default StatsBar;
