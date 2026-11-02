import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  Plus, 
  Sun, 
  Moon, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  Server
} from 'lucide-react';

export default function Navbar({ 
  stats, 
  darkMode, 
  setDarkMode, 
  onOpenCreateModal, 
  backendOnline 
}) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md border-b transition-colors duration-200 bg-slate-900/90 border-slate-800 dark:bg-slate-900/90 dark:border-slate-800 light:bg-white/90 light:border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Brand & Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
                <ListTodo className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white dark:text-white light:text-slate-900">
                    TaskFlow <span className="text-blue-500">Pro</span>
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Task 3
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                  Full-Stack CRUD Dashboard &bull; PostgreSQL & Express
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white dark:bg-slate-800 dark:text-slate-300 light:bg-slate-100 light:text-slate-700 transition-colors"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>New</span>
              </button>
            </div>
          </div>

          {/* Center Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">Total:</span>
              <span className="text-xs font-bold text-white dark:text-white light:text-slate-900 ml-auto">
                {stats.total || 0}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">Done:</span>
              <span className="text-xs font-bold text-emerald-400 ml-auto">
                {stats.completed || 0}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">Active:</span>
              <span className="text-xs font-bold text-amber-400 ml-auto">
                {stats.in_progress || 0}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <span className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">Pending:</span>
              <span className="text-xs font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 ml-auto">
                {stats.pending || 0}
              </span>
            </div>
          </div>

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Database indicator */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                backendOnline 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
              title={backendOnline ? 'PostgreSQL & Express Online' : 'Connecting to API...'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span>{backendOnline ? 'DB Connected' : 'Offline'}</span>
            </div>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-700 transition-all border border-slate-700/50 dark:border-slate-700/50 light:border-slate-200"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Add Task Primary Action */}
            <button
              type="button"
              onClick={onOpenCreateModal}
              id="create-task-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-600/25 border border-blue-500/40"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
