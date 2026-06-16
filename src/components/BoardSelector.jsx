import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function BoardSelector({ boards, boardId, onSelect, onCreated }) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName]   = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.from('boards').insert([{ name: newName.trim() }]).select().single();
    setLoading(false);
    if (!error && data) {
      setNewName('');
      setCreating(false);
      onCreated(data);
    }
  }

  return (
    <div className="board-selector">
      <span className="board-selector-label">Tableau</span>
      {boards.map(b => (
        <button
          key={b.id}
          className={`board-chip${b.id === boardId ? ' active' : ''}`}
          onClick={() => onSelect(b.id)}
        >
          {b.name || 'Sans nom'}
        </button>
      ))}
      {creating ? (
        <form className="board-new-form" onSubmit={handleCreate}>
          <input
            className="input"
            placeholder="Nom du tableau"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !newName.trim()}>
            {loading ? '…' : 'Créer'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setCreating(false); setNewName(''); }}>
            Annuler
          </button>
        </form>
      ) : (
        <button className="btn btn-ghost btn-sm" onClick={() => setCreating(true)}>
          + Nouveau tableau
        </button>
      )}
    </div>
  );
}
