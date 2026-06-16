import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { supabase } from '../lib/supabase';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskDetailModal from './TaskDetailModal';
import FilterBar from './FilterBar';
import CalendarView from './CalendarView';

const COLUMNS = [
  { id: 'todo',        label: 'À faire',    color: '#64748B' },
  { id: 'in_progress', label: 'En cours',   color: '#3B82F6' },
  { id: 'review',      label: 'Validation', color: '#F59E0B' },
  { id: 'done',        label: 'Terminée',   color: '#10B981' },
];

function DroppableColumn({ col, tasks, onDelete, onStatusChange, onOpenDetail, profiles }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <div className={`kanban-col${isOver ? ' drop-over' : ''}`} ref={setNodeRef}>
      <div className="kanban-col-header">
        <div className="kanban-col-title">
          <span className="col-dot" style={{ background: col.color }} />
          {col.label}
        </div>
        <span className="col-count">{tasks.length}</span>
      </div>
      <div className="kanban-col-body">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onOpenDetail={onOpenDetail}
            profiles={profiles}
          />
        ))}
        {tasks.length === 0 && <div className="col-empty">Aucune tâche</div>}
      </div>
    </div>
  );
}

export default function TaskList({ boardId, session }) {
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [view, setView]           = useState('kanban');
  const [categories, setCategories] = useState([]);
  const [profiles, setProfiles]   = useState([]);
  const [filters, setFilters]     = useState({ search: '', priority: '', category: '', assignee: '', overdue: false });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function fetchTasks() {
    setLoading(true);
    const { data } = await supabase
      .from('tasks').select('*, categories(*)')
      .eq('board_id', boardId).order('created_at', { ascending: false });
    setTasks(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchTasks(); }, [boardId]);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []));
    supabase.from('profiles').select('*').then(({ data }) => setProfiles(data || []));
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`board-tasks-${boardId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'tasks',
        filter: `board_id=eq.${boardId}`,
      }, payload => {
        if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        } else if (payload.eventType === 'INSERT') {
          fetchTasks();
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [boardId]);

  async function handleDelete(taskId) {
    if (!confirm('Supprimer cette tâche ?')) return;
    await supabase.from('tasks').delete().eq('id', taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }

  async function handleStatusChange(taskId, newStatus) {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  }

  function handleDragStart(event) {
    setActiveTask(tasks.find(t => t.id === event.active.id) || null);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const task = tasks.find(t => t.id === active.id);
    if (task && COLUMNS.some(c => c.id === over.id) && task.status !== over.id) {
      handleStatusChange(active.id, over.id);
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.category && t.category_id !== filters.category) return false;
    if (filters.assignee && t.assigned_to !== filters.assignee) return false;
    if (filters.overdue && !(t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done')) return false;
    return true;
  });

  if (loading) return <div className="loading-state"><div className="spinner" /> Chargement des tâches…</div>;

  const total   = tasks.length;
  const done    = tasks.filter(t => t.status === 'done').length;
  const inProg  = tasks.filter(t => t.status === 'in_progress').length;
  const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;

  return (
    <div className="board-wrapper">
      {/* top bar: stats + view toggle + new task */}
      <div className="board-top-bar">
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
        </div>
        <div className="view-toggle">
          <button className={`view-btn${view === 'kanban' ? ' active' : ''}`} onClick={() => setView('kanban')}>
            ▦ Kanban
          </button>
          <button className={`view-btn${view === 'calendar' ? ' active' : ''}`} onClick={() => setView('calendar')}>
            📅 Calendrier
          </button>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Nouvelle tâche</button>
      </div>

      <FilterBar value={filters} onChange={setFilters} categories={categories} profiles={profiles} />

      {view === 'kanban' && (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="kanban-scroll">
            <div className="kanban-board">
              {COLUMNS.map(col => (
                <DroppableColumn
                  key={col.id}
                  col={col}
                  tasks={filteredTasks.filter(t => t.status === col.id)}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onOpenDetail={setDetailTask}
                  profiles={profiles}
                />
              ))}
            </div>
          </div>
          <DragOverlay dropAnimation={null}>
            {activeTask && (
              <TaskCard
                task={activeTask}
                onDelete={() => {}}
                onStatusChange={() => {}}
                onOpenDetail={() => {}}
                profiles={profiles}
                isDragOverlay
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      {view === 'calendar' && (
        <CalendarView tasks={filteredTasks} onOpenDetail={setDetailTask} />
      )}

      {showForm && (
        <TaskForm
          boardId={boardId}
          session={session}
          profiles={profiles}
          onCreated={() => { fetchTasks(); setShowForm(false); }}
          onClose={() => setShowForm(false)}
        />
      )}

      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          session={session}
          profiles={profiles}
          onClose={() => setDetailTask(null)}
          onUpdated={fetchTasks}
        />
      )}
    </div>
  );
}
