import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import DeleteModal from './components/DeleteModal';
import Toast from './components/Toast';
import { Database, ShieldCheck, Cpu, Code2, RefreshCw } from 'lucide-react';

const API_BASE = '/api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    in_progress: 0,
    pending: 0,
    high_priority: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  // Modals & Editing State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);

  // Dark mode state initialized from localStorage or system preference
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true; // Default dark aesthetic as specified in req.md
  });

  // Apply dark mode class to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  /**
   * Fetch all tasks and stats from backend
   */
  const fetchTasks = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/tasks`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks || []);
        if (data.stats) {
          setStats(data.stats);
        }
        setBackendOnline(true);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setBackendOnline(false);
      showToast('Unable to connect to backend API on port 5000', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on component mount
  useEffect(() => {
    fetchTasks(true);
  }, [fetchTasks]);

  /**
   * Handle Create or Update task submission
   */
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        // UPDATE existing task
        const response = await fetch(`${API_BASE}/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to update task');
        }

        showToast('Task updated successfully!', 'success');
      } else {
        // CREATE new task
        const response = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to create task');
        }

        showToast('Task created successfully!', 'success');
      }

      setIsFormModalOpen(false);
      setEditingTask(null);
      await fetchTasks();
    } catch (err) {
      console.error('Submit error:', err);
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Fast toggle task completion status directly from the card
   */
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      const response = await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update task status');
      }

      showToast(
        newStatus === 'completed' ? 'Task marked as completed' : 'Task marked as pending',
        'info'
      );
      fetchTasks();
    } catch (err) {
      console.error('Toggle error:', err);
      showToast('Failed to update status', 'error');
      // Rollback optimistic update
      fetchTasks();
    }
  };

  /**
   * Delete task by ID
   */
  const handleConfirmDelete = async (taskId) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete task');
      }

      showToast('Task removed permanently', 'info');
      setDeletingTask(null);
      await fetchTasks();
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.message || 'Failed to delete task', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open modal for editing
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  };

  // Open modal for creating
  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsFormModalOpen(true);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Navigation */}
      <Navbar
        stats={stats}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenCreateModal={handleOpenCreate}
        backendOnline={backendOnline}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner with stats and quick refresh */}
        <section className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-900/30 via-slate-800/60 to-indigo-900/30 dark:from-blue-900/30 dark:via-slate-800/60 dark:to-indigo-900/30 light:from-blue-50 light:via-white light:to-indigo-50 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Parameterized SQL &bull; CORS Secured</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white dark:text-white light:text-slate-900">
                Developer Task Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-300 light:text-slate-600 max-w-xl leading-relaxed">
                Seamless full-stack task orchestration with real-time PostgreSQL persistence, input sanitization, and expressive UI cards.
              </p>
            </div>

            <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
              <button
                type="button"
                onClick={() => fetchTasks(false)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 light:bg-white light:text-slate-700 light:hover:bg-slate-100 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 transition-all shadow-sm"
                title="Refresh tasks from PostgreSQL"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
                <span>Sync DB</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all"
              >
                <span>+ Add Task</span>
              </button>
            </div>
          </div>
        </section>

        {/* Task List Section */}
        <section>
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onToggleStatus={handleToggleStatus}
            onEdit={handleOpenEdit}
            onDeleteRequest={(task) => setDeletingTask(task)}
            onOpenCreateModal={handleOpenCreate}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 dark:border-slate-800 light:border-slate-200 py-6 text-center text-xs text-slate-500 dark:text-slate-500 light:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400 dark:text-slate-400 light:text-slate-600">Secure Task Dashboard</span>
            <span>&bull;</span>
            <span>Task 3 Implementation</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1">
              <Database className="w-3 h-3 text-blue-400" /> PostgreSQL 18
            </span>
            <span className="inline-flex items-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-400" /> Express.js :5000
            </span>
            <span className="inline-flex items-center gap-1">
              <Code2 className="w-3 h-3 text-amber-400" /> React 19 + Tailwind
            </span>
          </div>
        </div>
      </footer>

      {/* Task Create / Edit Modal */}
      <TaskForm
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
        isLoading={isSubmitting}
      />

      {/* Task Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deletingTask)}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
