import { FiCheckSquare, FiMoon, FiSun, FiPlus } from 'react-icons/fi';

const Header = ({ darkMode, onToggleDark, onNewTask }) => (
  <header className="app-header">
    <div className="header-brand">
      <FiCheckSquare size={26} className="brand-icon" />
      <span className="brand-name">TaskTracker</span>
    </div>
    <div className="header-actions">
      <button
        className="btn btn-primary"
        onClick={onNewTask}
        aria-label="Create new task"
      >
        <FiPlus size={18} /> New Task
      </button>
      <button
        className="btn-icon btn-icon-lg"
        onClick={onToggleDark}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={darkMode ? 'Light mode' : 'Dark mode'}
      >
        {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>
    </div>
  </header>
);

export default Header;
