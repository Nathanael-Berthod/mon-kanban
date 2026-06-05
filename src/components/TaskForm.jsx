import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function TaskForm({ boardId, onCreated, onClose, session }) {
  const [title, setTitle]       = useState('');
  const [description, setDesc]  = useState('');
  const [status, setStatus]     = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [categoryId, setCatId]  = useState('');
  const [dueDate, setDueDate]   = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Le titre est obligatoire.'); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('tasks').insert([{
      title: title.trim(), description: description.trim() || null,
      status, priority, board_id: boardId,
      category_id: categoryId || null, due_date: dueDate || null, created_by: user.id,
    }]);
    setLoading(false);
    if (error) { setError(error.message); return; }

    if (dueDate && session?.user?.email) {
      fetch('/api/send-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: [session.user.email],
          subject: `Tâche créée : ${title}`,
          html: `<h2>Tâche créée</h2><p><strong>Titre :</strong> ${title}</p><p><strong>Priorité :</strong> ${priority}</p><p><strong>Échéance :</strong> ${new Date(dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>`,
        }),
      }).catch(() => {});
    }
    onCreated();
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">Nouvelle tâche</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Titre *</label>
            <input className="input" placeholder="Nom de la tâche" value={title} onChange={e => setTitle(e.target.value)} autoFocus required />
          </div>
          <div className="field">
            <label className="field-label">Description</label>
            <textarea className="input" placeholder="Détails optionnels…" value={description} onChange={e => setDesc(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div className="field field-grid field-grid-2">
            <div>
              <label className="field-label">Statut</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="review">Validation</option>
                <option value="done">Terminée</option>
              </select>
            </div>
            <div>
              <label className="field-label">Priorité</label>
              <select className="input" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>
            <div>
              <label className="field-label">Catégorie</label>
              <select className="input" value={categoryId} onChange={e => setCatId(e.target.value)}>
                <option value="">Aucune</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Échéance</label>
              <input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Enregistrement…</> : 'Créer la tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
