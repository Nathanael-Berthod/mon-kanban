import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const PRIORITY_LABELS = { high: 'Haute', medium: 'Moyenne', low: 'Basse' };
const STATUS_LABELS   = { todo: 'À faire', in_progress: 'En cours', review: 'Validation', done: 'Terminée' };
const PRIORITY_BORDER = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

export default function TaskDetailModal({ task, session, onClose, onUpdated, profiles = [] }) {
  const [subtasks, setSubtasks]   = useState([]);
  const [comments, setComments]   = useState([]);
  const [newSub, setNewSub]       = useState('');
  const [newComment, setNewComment] = useState('');
  const [loadingSub, setLoadingSub] = useState(false);
  const [loadingCom, setLoadingCom] = useState(false);

  useEffect(() => {
    fetchSubtasks();
    fetchComments();
  }, [task.id]);

  async function fetchSubtasks() {
    const { data } = await supabase.from('subtasks').select('*').eq('task_id', task.id).order('created_at');
    setSubtasks(data || []);
  }

  async function fetchComments() {
    const { data } = await supabase.from('comments').select('*, profiles(full_name, email, avatar_url)').eq('task_id', task.id).order('created_at');
    setComments(data || []);
  }

  async function handleAddSubtask(e) {
    e.preventDefault();
    if (!newSub.trim()) return;
    setLoadingSub(true);
    await supabase.from('subtasks').insert([{ task_id: task.id, title: newSub.trim() }]);
    setNewSub('');
    setLoadingSub(false);
    fetchSubtasks();
  }

  async function handleToggleSubtask(sub) {
    await supabase.from('subtasks').update({ completed: !sub.completed }).eq('id', sub.id);
    setSubtasks(prev => prev.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s));
  }

  async function handleDeleteSubtask(id) {
    await supabase.from('subtasks').delete().eq('id', id);
    setSubtasks(prev => prev.filter(s => s.id !== id));
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoadingCom(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('comments').insert([{ task_id: task.id, user_id: user.id, content: newComment.trim() }]);
    setNewComment('');
    setLoadingCom(false);
    fetchComments();
  }

  const doneCount  = subtasks.filter(s => s.completed).length;
  const totalSubs  = subtasks.length;
  const dueLabel   = task.due_date
    ? new Date(task.due_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;
  const isOverdue  = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  const assignee   = profiles.find(p => p.id === task.assigned_to);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-card-wide">
        <div className="modal-header">
          <h2 className="modal-title" style={{ borderLeft: `3px solid ${PRIORITY_BORDER[task.priority] || PRIORITY_BORDER.low}`, paddingLeft: '0.75rem' }}>
            {task.title}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* badges */}
        <div className="detail-badges">
          <span className={`badge badge-priority-${task.priority}`}>{PRIORITY_LABELS[task.priority] || 'Basse'}</span>
          <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
            {STATUS_LABELS[task.status]}
          </span>
          {task.categories && (
            <span className="badge" style={{ background: task.categories.color + '33', color: task.categories.color }}>
              {task.categories.name}
            </span>
          )}
          {dueLabel && (
            <span className={`badge badge-date${isOverdue ? ' overdue' : ''}`}>
              {isOverdue ? '⚠ ' : '📅 '}{dueLabel}
            </span>
          )}
          {assignee && (
            <span className="badge" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
              👤 {assignee.full_name || assignee.email}
            </span>
          )}
        </div>

        {/* description */}
        {task.description && (
          <div className="detail-section">
            <div className="detail-section-title">Description</div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{task.description}</p>
          </div>
        )}

        {/* subtasks */}
        <div className="detail-section">
          <div className="detail-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Sous-tâches</span>
            {totalSubs > 0 && <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>{doneCount}/{totalSubs}</span>}
          </div>
          {totalSubs > 0 && (
            <div className="subtask-progress-bar" style={{ marginBottom: '0.625rem' }}>
              <div className="subtask-progress-fill" style={{ width: `${(doneCount / totalSubs) * 100}%` }} />
            </div>
          )}
          <div className="subtask-list">
            {subtasks.map(sub => (
              <div key={sub.id} className={`subtask-item${sub.completed ? ' done' : ''}`}>
                <input
                  type="checkbox"
                  checked={sub.completed}
                  onChange={() => handleToggleSubtask(sub)}
                />
                <span className="subtask-item-text">{sub.title}</span>
                <button className="subtask-item-delete" onClick={() => handleDeleteSubtask(sub.id)}>✕</button>
              </div>
            ))}
          </div>
          <form className="subtask-add" onSubmit={handleAddSubtask}>
            <input
              className="input"
              placeholder="Ajouter une sous-tâche…"
              value={newSub}
              onChange={e => setNewSub(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm" disabled={loadingSub || !newSub.trim()}>
              {loadingSub ? '…' : 'Ajouter'}
            </button>
          </form>
        </div>

        {/* comments */}
        <div className="detail-section">
          <div className="detail-section-title">Commentaires ({comments.length})</div>
          {comments.length > 0 && (
            <div className="comment-list">
              {comments.map(c => {
                const name   = c.profiles?.full_name || c.profiles?.email || '?';
                const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                const date = new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={c.id} className="comment-item">
                    <div className="comment-avatar">
                      {c.profiles?.avatar_url
                        ? <img src={c.profiles.avatar_url} alt="" />
                        : initials}
                    </div>
                    <div className="comment-body">
                      <div className="comment-meta">
                        <span className="comment-author">{name}</span>
                        <span className="comment-date">{date}</span>
                      </div>
                      <p className="comment-text">{c.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <form className="comment-add" onSubmit={handleAddComment}>
            <input
              className="input"
              placeholder="Écrire un commentaire…"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={loadingCom || !newComment.trim()}>
              {loadingCom ? '…' : 'Envoyer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
