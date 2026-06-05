import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar({ session }) {
  const location = useLocation();
  const user     = session?.user;
  const initials = (user?.user_metadata?.full_name || user?.email || '?')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/dashboard" className="navbar-brand">
          <div className="navbar-logo">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="5" rx="1.5" fill="white" fillOpacity="0.9"/>
              <rect x="11" y="2" width="7" height="5" rx="1.5" fill="white" fillOpacity="0.6"/>
              <rect x="2" y="9" width="7" height="9" rx="1.5" fill="white" fillOpacity="0.6"/>
              <rect x="11" y="9" width="7" height="5" rx="1.5" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          KanbanRT
        </Link>
        <div className="navbar-nav">
          <Link to="/dashboard" className={`nav-link${location.pathname === '/dashboard' ? ' active' : ''}`}>Tableau de bord</Link>
          <Link to="/profile"   className={`nav-link${location.pathname === '/profile'   ? ' active' : ''}`}>Mon profil</Link>
        </div>
      </div>
      <div className="navbar-right">
        <span className="navbar-email">{user?.email}</span>
        <Link to="/profile">
          <div className="navbar-avatar">
            {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : initials}
          </div>
        </Link>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}
          onClick={() => supabase.auth.signOut()}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
