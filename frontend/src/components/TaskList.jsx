import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Sparkles, 
  Inbox, 
  X,
  SlidersHorizontal,
  CheckCircle2,
  ListFilter
} from 'lucide-react';
import TaskCard from './TaskCard';

export default function TaskList({ 
  tasks = [], 
  isLoading, 
  onToggleStatus, 
  onEdit, 
  onDeleteRequest, 
  onOpenCreateModal 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Filter and sort tasks on client side for instantaneous responsiveness
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search matches title or description
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (task.title || '').toLowerCase().includes(q);
          const matchDesc = (task.description || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && task.status !== statusFilter) {
          return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at) - new Date(b.created_at);
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'priority') {
          const rank = { high: 1, medium: 2, low: 3 };
          return (rank[a.priority] || 4) - (rank[b.priority] || 4);
        }
        return 0;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || priorityFilter !== 'all';

  return (
    <div className="space-y-6">
      
      {/* Controls Bar: Search & Filter Tools */}
      <div className="p-4 rounded-2xl bg-slate-800/60 dark:bg-slate-800/60 light:bg-white border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 shadow-sm space-y-4">
        
        {/* Top row: Search input & Action */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or details..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 text-white dark:text-white light:text-slate-900 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Priority Selector */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="Sort tasks"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority Order</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Bottom row: Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-700/40 dark:border-slate-700/40 light:border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Tasks', count: tasks.length },
              { id: 'pending', label: 'Pending', count: tasks.filter(t => t.status === 'pending').length },
              { id: 'in-progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
              { id: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed').length },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-100 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    active ? 'bg-blue-700/60 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 flex items-center gap-2">
            <span>Showing {filteredTasks.length} of {tasks.length} items</span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-blue-400 hover:underline font-medium text-xs ml-2"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Grid Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div 
              key={n} 
              className="p-5 rounded-xl bg-slate-800/40 dark:bg-slate-800/40 light:bg-white border border-slate-700/40 rounded-xl space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-700 rounded w-20"></div>
                <div className="h-4 bg-slate-700 rounded w-16"></div>
              </div>
              <div className="h-5 bg-slate-700 rounded w-3/4"></div>
              <div className="h-12 bg-slate-700/50 rounded w-full"></div>
              <div className="h-4 bg-slate-700/30 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-slate-800/30 dark:bg-slate-800/30 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white dark:text-white light:text-slate-800 mb-1">
            {hasActiveFilters ? 'No matching tasks found' : 'No tasks created yet'}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 max-w-sm mx-auto mb-5">
            {hasActiveFilters 
              ? 'Try modifying your search keywords or resetting your priority and status filters.' 
              : 'Get started by creating your first task to track progress with PostgreSQL.'
            }
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Clear All Filters
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Task</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
}
