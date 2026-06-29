import { FiSearch, FiX } from 'react-icons/fi';

const FilterBar = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="filter-bar">
      {/* Search */}
      <div className="search-wrapper">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="search-input"
          aria-label="Search tasks"
        />
        {filters.search && (
          <button
            className="clear-search"
            onClick={() => onFilterChange({ search: '' })}
            aria-label="Clear search"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) => onFilterChange({ status: e.target.value })}
        className="filter-select"
        aria-label="Filter by status"
      >
        <option value="all">All Status</option>
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      {/* Priority Filter */}
      <select
        value={filters.priority}
        onChange={(e) => onFilterChange({ priority: e.target.value })}
        className="filter-select"
        aria-label="Filter by priority"
      >
        <option value="all">All Priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      {/* Sort */}
      <select
        value={filters.sortBy}
        onChange={(e) => onFilterChange({ sortBy: e.target.value })}
        className="filter-select"
        aria-label="Sort by"
      >
        <option value="createdAt">Sort: Newest</option>
        <option value="updatedAt">Sort: Updated</option>
        <option value="title">Sort: Title</option>
        <option value="priority">Sort: Priority</option>
        <option value="dueDate">Sort: Due Date</option>
      </select>

      {/* Order */}
      <select
        value={filters.order}
        onChange={(e) => onFilterChange({ order: e.target.value })}
        className="filter-select"
        aria-label="Sort order"
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>

      {/* Reset */}
      <button className="btn btn-ghost" onClick={onReset} aria-label="Reset filters">
        <FiX /> Reset
      </button>
    </div>
  );
};

export default FilterBar;
