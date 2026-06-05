import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import UserTable from '../components/UserTable';
import TaskList  from '../components/TaskList';
import Navbar    from '../components/Navbar';

export default function DashboardPage({ session }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('tasks');
  const [boardId, setBoardId] = useState(null);

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    supabase.from('boards').select('id').limit(1)
      .then(({ data }) => { if (data?.[0]) setBoardId(data[0].id); });
  }, []);

  const userName = session?.user?.user_metadata?.full_name
    || session?.user?.email?.split('@')[0]
    || 'vous';

  return (
    <div className="page">
      <Navbar session={session} />
      <main className="page-main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Bonjour, {userName}</h1>
            <p className="page-subtitle">Gérez vos tâches et votre équipe depuis ici.</p>
          </div>
        </div>

        <div className="tab-bar">
          {[['tasks', 'Tâches'], ['users', 'Utilisateurs']].map(([key, label]) => (
            <button key={key} className={`tab-btn${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'tasks' && boardId && <TaskList boardId={boardId} session={session} />}
        {tab === 'tasks' && !boardId && (
          <div className="loading-state">Aucun tableau trouvé — créez-en un depuis le SQL Editor Supabase.</div>
        )}
        {tab === 'users' && (
          loading
            ? <div className="loading-state"><div className="spinner" /> Chargement…</div>
            : <UserTable users={users} onRefresh={fetchUsers} />
        )}
      </main>
    </div>
  );
}
