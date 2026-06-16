import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const STATUSES = ['todo', 'in_progress', 'review', 'done'];
const PRIORITY_BORDER = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
const PRIORITY_LABELS = { high: 'Haute', medium: 'Moyenne', low: 'Basse' };
const STATUS_LABELS   = { todo: 'À faire', in_progress: 'En cours', review: 'Validation', done: 'Terminée' };

export default function TaskCard({ task, onDelete, onStatusChange, onOpenDetail, profiles = [], isDragOverlay = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });

  const style = {
    borderLeftColor: PRIORITY_BORDER[task.priority] || PRIORITY_BORDER.low,
    transform: CSS.Translate.toString(transform),
  };

  const dueLabel = task.due_date
    ? new Date(task.due_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    : null;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  const currentIdx = STATUSES.indexOf(task.status);
  const prevStatus = currentIdx > 0 ? STATUSES[currentIdx - 1] : null;
  const nextStatus = currentIdx < STATUSES.length - 1 ? STATUSES[currentIdx + 1] : null;

  const assignee = profiles.find(p => p.id === task.assigned_to);
  const assigneeInitials = assignee
    ? (assignee.full_name || assignee.email || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : null;

  return (
    <div
      ref={setNodeRef}
      className={`task-card${isDragging ? ' is-dragging' : ''}${isDragOverlay ? ' drag-overlay' : ''}`}
      style={style}
      onClick={() => !isDragging && onOpenDetail && onOpenDetail(task)}
    >
      <div className="task-card-header">
        <span className="task-title">{task.title}</span>
        <div className="task-card-actions">
          {/* drag handle — stops click propagation so card click still opens detail */}
          <div
            className="drag-handle"
            {...listeners}
            {...attributes}
            onClick={e => e.stopPropagation()}
            title="Déplacer"
          >
            <div className="drag-handle-dots">
              <div className="drag-dot" /><div className="drag-dot" />
              <div className="drag-dot" /><div className="drag-dot" />
              <div className="drag-dot" /><div className="drag-dot" />
            </div>
          </div>
          <button
            className="task-delete-btn"
            onClick={e => { e.stopPropagation(); onDelete(task.id); }}
            title="Supprimer"
          >✕</button>
        </div>
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

      {(prevStatus || nextStatus || assignee) && (
        <div className="task-card-footer">
          <div className="task-footer-left">
            {assignee && (
              <div className="assignee-avatar-sm" title={assignee.full_name || assignee.email}>
                {assignee.avatar_url
                  ? <img src={assignee.avatar_url} alt="" />
                  : assigneeInitials}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {prevStatus && (
              <button
                className="status-arrow"
                onClick={e => { e.stopPropagation(); onStatusChange(task.id, prevStatus); }}
              >
                ← {STATUS_LABELS[prevStatus]}
              </button>
            )}
            {nextStatus && (
              <button
                className="status-arrow"
                onClick={e => { e.stopPropagation(); onStatusChange(task.id, nextStatus); }}
              >
                {STATUS_LABELS[nextStatus]} →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
