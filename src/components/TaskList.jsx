import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';

const COLUMNS = [
  { id: 'todo',        label: 'À faire',    color: '#64748B' },
  { id: 'in_progress', label: 'En cours',   color: '#3B82F6' },
  { id: 'review',      label: 'Validation', color: '#F59E0B' },
  { id: 'done',        label: 'Terminée',   color: '#10B981' },
];

export default function TaskList({ boardId, session }) {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function fetchTasks() {
    setLoading(true);
    const { data } = await supabase
      .from('tasks').select('*, categories(*)')
      .eq('board_id', boardId).order('created_at', { ascending: false });
    setTasks(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchTasks(); }, [boardId]);

  async function handleDelete(taskId) {
    if (!confirm('Supprimer cette tâche ?')) return;
    await supabase.from('tasks').delete().eq('id', taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }

  async function handleStatusChange(taskId, newStatus) {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  }

  if (loading) return <div className="loading-state"><div className="spinner" /> Chargement des tâches…</div>;

  const total   = tasks.length;
  const done    = tasks.filter(t => t.status === 'done').length;
  const inProg  = tasks.filter(t => t.status === 'in_progress').length;
  const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;

  return (
    <div className="board-wrapper">
      <div className="board-stats">
        <div className="stat-chip">
          <span className="stat-number">{total}</span><span className="stat-label">Total</span>
        </div>
        <div className="stat-chip info">
          <span className="stat-number" style={{ color: 'var(--info)' }}>{inProg}</span><span className="stat-label">En cours</span>
        </div>
        <div className="stat-chip success">
          <span className="stat-number">{done}</span><span className="stat-label">Terminées</span>
        </div>
        {overdue > 0 && (
          <div className="stat-chip danger">
            <span className="stat-number">{overdue}</span><span className="stat-label">En retard</span>
          </div>
        )}
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Nouvelle tâche</button>
      </div>

      <div className="kanban-scroll">
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="kanban-col">
                <div className="kanban-col-header">
                  <div className="kanban-col-title">
                    <span className="col-dot" style={{ background: col.color }} />
                    {col.label}
                  </div>
                  <span className="col-count">{colTasks.length}</span>
                </div>
                <div className="kanban-col-body">
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                  ))}
                  {colTasks.length === 0 && <div className="col-empty">Aucune tâche</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <TaskForm boardId={boardId} session={session} onCreated={() => { fetchTasks(); setShowForm(false); }} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
