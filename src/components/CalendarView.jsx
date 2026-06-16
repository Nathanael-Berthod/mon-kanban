import { useState } from 'react';

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

export default function CalendarView({ tasks, onOpenDetail }) {
  const [current, setCurrent] = useState(new Date());

  const year  = current.getFullYear();
  const month = current.getMonth();

  const firstDay   = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));
  const goToday   = () => setCurrent(new Date());

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // Index tasks by day-of-month for the current month
  const tasksByDay = {};
  tasks.forEach(t => {
    if (!t.due_date) return;
    const d = new Date(t.due_date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(t);
    }
  });

  // Build flat grid cells
  const cells = [];
  // Leading empty cells from previous month
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  // Trailing cells to fill last row
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false });
  }

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <div className="calendar-title">{MONTHS[month]} {year}</div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="calendar-nav">
            <button className="calendar-nav-btn" onClick={prevMonth}>‹</button>
            <button className="calendar-nav-btn" onClick={goToday} style={{ fontSize: '0.7rem' }}>Aujourd'hui</button>
            <button className="calendar-nav-btn" onClick={nextMonth}>›</button>
          </div>
        </div>
      </div>

      <div className="calendar-grid">
        {DAY_NAMES.map(d => (
          <div key={d} className="calendar-day-name">{d}</div>
        ))}
        {cells.map((cell, idx) => {
          const isToday = cell.current && `${year}-${month}-${cell.day}` === todayKey;
          const dayTasks = cell.current ? (tasksByDay[cell.day] || []) : [];
          const shown = dayTasks.slice(0, 3);
          const more  = dayTasks.length - shown.length;

          return (
            <div
              key={idx}
              className={`calendar-cell${!cell.current ? ' other-month' : ''}${isToday ? ' today' : ''}`}
            >
              <div className="calendar-cell-num">{cell.day}</div>
              {shown.map(t => (
                <div
                  key={t.id}
                  className={`calendar-task-chip priority-${t.priority || 'low'}${t.status === 'done' ? ' done' : ''}`}
                  onClick={() => onOpenDetail(t)}
                  title={t.title}
                >
                  {t.title}
                </div>
              ))}
              {more > 0 && (
                <div className="calendar-more">+{more} de plus</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
