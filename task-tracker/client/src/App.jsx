import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { useTasks } from './hooks/useTasks';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const {
    tasks,
    stats,
    loading,
    submitting,
    filters,
    pagination,
    createTask,
    updateTask,
    deleteTask,
    updateFilters,
    resetFilters,
  } = useTasks();

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleNewTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormSubmit = async (data) => {
    let result;
    if (editingTask) {
      result = await updateTask(editingTask._id, data);
    } else {
      result = await createTask(data);
    }
    if (result?.success) {
      setShowForm(false);
      setEditingTask(null);
    }
    return result;
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleStatusChange = async (id, updatedTask) => {
    await updateTask(id, updatedTask);
  };

  return (
    <div className="app">
      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
        onNewTask={handleNewTask}
      />

      <main className="main-content">
        <StatsBar stats={stats} />

        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">
              Tasks
              {pagination.total > 0 && (
                <span className="task-count">{pagination.total}</span>
              )}
            </h2>
          </div>

          <FilterBar
            filters={filters}
            onFilterChange={updateFilters}
            onReset={resetFilters}
          />

          <TaskList
            tasks={tasks}
            loading={loading}
            onEdit={handleEdit}
            onDelete={deleteTask}
            onStatusChange={handleStatusChange}
          />
        </div>
      </main>

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          submitting={submitting}
        />
      )}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
        }}
      />
    </div>
  );
}

export default App;
