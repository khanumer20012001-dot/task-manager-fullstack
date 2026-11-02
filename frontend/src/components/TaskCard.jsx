import React from 'react';
import { 
  Check, 
  Clock, 
  Trash2, 
  Pencil, 
  AlertTriangle, 
  Flame, 
  Calendar,
  CheckCircle2,
  Circle,
  MoreVertical
} from 'lucide-react';

export default function TaskCard({ 
  task, 
  onToggleStatus, 
  onEdit, 
  onDeleteRequest 
}) {
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in-progress';

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Priority color config
  const priorityBadge = {
    high: {
      label: 'High Priority',
      classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: <Flame className="w-3 h-3 text-rose-500" />
    },
    medium: {
      label: 'Medium Priority',
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: <AlertTriangle className="w-3 h-3 text-amber-500" />
    },
    low: {
      label: 'Low Priority',
      classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: <Clock className="w-3 h-3 text-blue-500" />
    }
  }[task.priority] || {
    label: task.priority,
    classes: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    icon: null
  };

  // Status badge config
  const statusBadge = {
    completed: {
      label: 'Completed',
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-400'
    },
    'in-progress': {
      label: 'In Progress',
      classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      dot: 'bg-blue-400'
    },
    pending: {
      label: 'Pending',
      classes: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      dot: 'bg-slate-400'
    }
  }[task.status] || {
    label: task.status,
    classes: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    dot: 'bg-slate-400'
  };

  return (
    <article
      id={`task-card-${task.id}`}
      className={`group relative rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden
        ${isCompleted 
          ? 'bg-slate-800/40 border-slate-800/80 dark:bg-slate-800/40 dark:border-slate-800/80 light:bg-slate-50/70 light:border-slate-200 opacity-90' 
          : 'bg-slate-800/90 border-slate-700/60 dark:bg-slate-800/90 dark:border-slate-700/60 light:bg-white light:border-slate-200 hover:border-slate-600 dark:hover:border-slate-600 light:hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/10'
        }
      `}
    >
      {/* Top accent line based on status */}
      <div 
        className={`h-1 w-full transition-colors duration-200 ${
          isCompleted 
            ? 'bg-emerald-500' 
            : isInProgress 
              ? 'bg-blue-500' 
              : 'bg-slate-600'
        }`}
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row: Status & Priority badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.classes}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              {statusBadge.label}
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${priorityBadge.classes}`}>
              {priorityBadge.icon}
              <span className="capitalize">{task.priority}</span>
            </span>
          </div>

          {/* Title with checkbox */}
          <div className="flex items-start gap-3 mt-1">
            <button
              type="button"
              onClick={() => onToggleStatus(task)}
              id={`toggle-task-${task.id}`}
              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-150 flex-shrink-0 ${
                isCompleted 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'border-slate-600 dark:border-slate-600 light:border-slate-300 hover:border-blue-500 bg-transparent text-transparent hover:text-slate-400'
              }`}
              title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
              aria-label={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            <div className="flex-1 min-w-0">
              <h3 
                className={`text-base font-semibold leading-snug break-words transition-colors ${
                  isCompleted 
                    ? 'line-through text-slate-500 dark:text-slate-500 light:text-slate-400' 
                    : 'text-white dark:text-white light:text-slate-800'
                }`}
              >
                {task.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className={`mt-2.5 text-sm line-clamp-3 leading-relaxed break-words pl-8 ${
              isCompleted 
                ? 'text-slate-500 dark:text-slate-500 light:text-slate-400' 
                : 'text-slate-300 dark:text-slate-300 light:text-slate-600'
            }`}>
              {task.description}
            </p>
          )}
        </div>

        {/* Card Footer: Timestamp and Action Buttons */}
        <div className="mt-5 pt-3.5 border-t border-slate-700/50 dark:border-slate-700/50 light:border-slate-100 flex items-center justify-between text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatDate(task.created_at)}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Edit button */}
            <button
              type="button"
              onClick={() => onEdit(task)}
              id={`edit-task-${task.id}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
              title="Edit Task"
              aria-label="Edit Task"
            >
              <Pencil className="w-4 h-4" />
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => onDeleteRequest(task)}
              id={`delete-task-${task.id}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete Task"
              aria-label="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
