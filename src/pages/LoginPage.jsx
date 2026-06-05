import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) { setError(`Erreur : ${error.message}`); return; }
      if (data.session) return;
      setSuccess('Compte créé ! Vérifiez votre boîte mail et cliquez sur le lien de confirmation, puis connectez-vous.');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Email non confirmé — vérifiez votre boîte mail (et les spams) et cliquez sur le lien d\'activation.');
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect.');
        } else {
          setError(`Erreur : ${error.message}`);
        }
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="5" rx="1.5" fill="white" fillOpacity="0.9"/>
              <rect x="11" y="2" width="7" height="5" rx="1.5" fill="white" fillOpacity="0.6"/>
              <rect x="2" y="9" width="7" height="9" rx="1.5" fill="white" fillOpacity="0.6"/>
              <rect x="11" y="9" width="7" height="5" rx="1.5" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span className="login-logo-name">KanbanRT</span>
        </div>

        <h1 className="login-title">
          {isRegister ? 'Créer un compte' : 'Bon retour'}
        </h1>
        <p className="login-subtitle">
          {isRegister
            ? 'Rejoignez votre équipe et commencez à collaborer'
            : 'Connectez-vous pour accéder à votre tableau'}
        </p>

        {error   && <p className="error-msg">{error}</p>}
        {success && (
          <p style={{
            background: 'var(--success-bg)',
            color: 'var(--success)',
            border: '1px solid #BBF7D0',
            borderRadius: 'var(--r-sm)',
            padding: '0.75rem 1rem',
            fontSize: '0.8125rem',
            marginBottom: '0.75rem',
            lineHeight: 1.5,
          }}>{success}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Adresse e-mail</label>
            <input
              className="input"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="field-label">Mot de passe</label>
            <input
              className="input"
              type="password"
              placeholder="6 caractères minimum"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.25rem' }} disabled={loading}>
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16 }} /> En cours…</>
            ) : isRegister ? 'Créer le compte' : 'Se connecter'}
          </button>
        </form>

        <p className="login-switch">
          {isRegister ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
          <a onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}>
            {isRegister ? 'Se connecter' : "S'inscrire"}
          </a>
        </p>
      </div>
    </div>
  );
}
