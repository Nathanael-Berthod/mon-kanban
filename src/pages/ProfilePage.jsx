import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

export default function ProfilePage({ session, dark, onToggleDark }) {
  const user = session.user;
  const initials = (user.user_metadata?.full_name || user.email || '?')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '');
  const [infoMsg, setInfoMsg]   = useState('');
  const [infoErr, setInfoErr]   = useState('');

  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || '');
  const [uploading, setUploading] = useState(false);

  async function handleSaveInfo(e) {
    e.preventDefault();
    setInfoErr(''); setInfoMsg('');
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    if (error) setInfoErr(error.message);
    else setInfoMsg('Profil mis à jour.');
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPassErr(''); setPassMsg('');
    if (newPass.length < 6) { setPassErr('6 caractères minimum.'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) setPassErr(error.message);
    else { setPassMsg('Mot de passe mis à jour.'); setNewPass(''); }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) { setUploading(false); alert(error.message); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
    setAvatarUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="page">
    <Navbar session={session} dark={dark} onToggleDark={onToggleDark} />
    <main className="page-main">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mon profil</h1>
          <p className="page-subtitle">Gérez vos informations personnelles.</p>
        </div>
      </div>

      <div className="profile-layout">
        <div className="section-card">
          <p className="section-title">Photo de profil</p>
          <div className="avatar-block">
            <div className="avatar-lg">
              {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : initials}
            </div>
            <div>
              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                {uploading ? 'Envoi…' : 'Changer la photo'}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
              <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>JPG, PNG, GIF · max 5 Mo</p>
            </div>
          </div>
        </div>

        <div className="section-card">
          <p className="section-title">Informations générales</p>
          <form onSubmit={handleSaveInfo}>
            <div className="field">
              <label className="field-label">Adresse e-mail</label>
              <input className="input" value={user.email} disabled />
            </div>
            <div className="field">
              <label className="field-label">Nom complet</label>
              <input className="input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Votre nom complet" />
            </div>
            {infoErr && <p className="error-msg">{infoErr}</p>}
            {infoMsg && <p className="success-msg">{infoMsg}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">Sauvegarder</button>
            </div>
          </form>
        </div>

        <div className="section-card">
          <p className="section-title">Changer le mot de passe</p>
          <form onSubmit={handleChangePassword}>
            <div className="field">
              <label className="field-label">Nouveau mot de passe</label>
              <input className="input" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="6 caractères minimum" />
            </div>
            {passErr && <p className="error-msg">{passErr}</p>}
            {passMsg && <p className="success-msg">{passMsg}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-secondary">Mettre à jour</button>
            </div>
          </form>
        </div>
      </div>
    </main>
    </div>
  );
}
