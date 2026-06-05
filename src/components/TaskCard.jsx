const STATUSES = ['todo', 'in_progress', 'review', 'done'];
const PRIORITY_BORDER = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
const PRIORITY_LABELS = { high: 'Haute', medium: 'Moyenne', low: 'Basse' };
const STATUS_LABELS   = { todo: 'À faire', in_progress: 'En cours', review: 'Validation', done: 'Terminée' };

export default function TaskCard({ task, onDelete, onStatusChange }) {
  const borderColor = PRIORITY_BORDER[task.priority] || PRIORITY_BORDER.low;

  const dueLabel = task.due_date
    ? new Date(task.due_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    : null;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  const currentIdx = STATUSES.indexOf(task.status);
  const prevStatus = currentIdx > 0 ? STATUSES[currentIdx - 1] : null;
  const nextStatus = currentIdx < STATUSES.length - 1 ? STATUSES[currentIdx + 1] : null;

  return (
    <div className="task-card" style={{ borderLeftColor: borderColor }}>
      <div className="task-card-header">
        <span className="task-title">{task.title}</span>
        <button className="task-delete-btn" onClick={() => onDelete(task.id)} title="Supprimer">✕</button>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-meta">
        <span className={`badge badge-priority-${task.priority}`}>
          {PRIORITY_LABELS[task.priority] || 'Basse'}
        </span>
        {task.categories && (
          <span className="badge" style={{ background: task.categories.color + '33', color: task.categories.color }}>
            {task.categories.name}
          </span>
        )}
        {dueLabel && (
          <span className={`badge badge-date${isOverdue ? ' overdue' : ''}`}>
            {isOverdue ? '⚠ ' : ''}{dueLabel}
          </span>
        )}
      </div>

      {(prevStatus || nextStatus) && (
        <div className="task-card-footer">
          {prevStatus && (
            <button className="status-arrow" onClick={() => onStatusChange(task.id, prevStatus)}>
              ← {STATUS_LABELS[prevStatus]}
            </button>
          )}
          {nextStatus && (
            <button className="status-arrow" onClick={() => onStatusChange(task.id, nextStatus)}>
              {STATUS_LABELS[nextStatus]} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
