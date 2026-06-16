export default function FilterBar({ value, onChange, categories, profiles }) {
  const active = value.search || value.priority || value.category || value.assignee || value.overdue;

  return (
    <div className="filter-bar">
      <input
        className="input filter-search"
        placeholder="🔍 Rechercher…"
        value={value.search}
        onChange={e => onChange({ ...value, search: e.target.value })}
      />
      <select className="input filter-select" value={value.priority} onChange={e => onChange({ ...value, priority: e.target.value })}>
        <option value="">Toutes priorités</option>
        <option value="high">🔴 Haute</option>
        <option value="medium">🟡 Moyenne</option>
        <option value="low">🟢 Basse</option>
      </select>
      <select className="input filter-select" value={value.category} onChange={e => onChange({ ...value, category: e.target.value })}>
        <option value="">Toutes catégories</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {profiles.length > 0 && (
        <select className="input filter-select" value={value.assignee} onChange={e => onChange({ ...value, assignee: e.target.value })}>
          <option value="">Tous les membres</option>
          {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
        </select>
      )}
      <label className="filter-overdue">
        <input
          type="checkbox"
          checked={value.overdue}
          onChange={e => onChange({ ...value, overdue: e.target.checked })}
        />
        En retard
      </label>
      {active && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onChange({ search: '', priority: '', category: '', assignee: '', overdue: false })}
        >
          ✕ Effacer
        </button>
      )}
    </div>
  );
}
