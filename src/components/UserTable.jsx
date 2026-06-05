import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function UserTable({ users, onRefresh }) {
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.from('profiles').insert([{ email: newEmail, full_name: newName, role: 'member' }]);
    if (error) setError(error.message);
    else { setNewEmail(''); setNewName(''); onRefresh(); }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    await supabase.from('profiles').delete().eq('id', id);
    onRefresh();
  }

  return (
    <div>
      {error && <p className="error-msg" style={{ marginBottom: '0.75rem' }}>{error}</p>}
      <div className="table-wrapper">
        <form className="table-add-row" onSubmit={handleCreate}>
          <input className="input" placeholder="Email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ flex: 1, minWidth: 180 }} required />
          <input className="input" placeholder="Nom complet" value={newName} onChange={e => setNewName(e.target.value)} style={{ flex: 1, minWidth: 150 }} />
          <button className="btn btn-primary" type="submit" disabled={loading || !newEmail}>{loading ? '…' : '+ Ajouter'}</button>
        </form>
        {users.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr><th>Email</th><th>Nom</th><th>Rôle</th><th>Créé le</th><th></th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.full_name || <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 999, background: u.role === 'admin' ? 'var(--accent-bg)' : 'var(--bg-4)', color: u.role === 'admin' ? 'var(--accent)' : 'var(--text-3)' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-2)' }}>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Supprimer</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '3rem 1rem', fontSize: '0.875rem' }}>
            Aucun utilisateur pour l'instant.
          </p>
        )}
      </div>
    </div>
  );
}
