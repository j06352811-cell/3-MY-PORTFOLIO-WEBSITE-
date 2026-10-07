import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'daymark.tasks.v1';
const filters = [
  { id: 'all', label: 'All tasks', icon: 'grid' },
  { id: 'today', label: 'Today', icon: 'sun' },
  { id: 'upcoming', label: 'Upcoming', icon: 'calendar' },
  { id: 'completed', label: 'Completed', icon: 'check' },
];
const categories = ['Work', 'Personal', 'Learning', 'Health'];
const priorities = ['Low', 'Medium', 'High'];

function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function starterTasks() {
  return [
    { id: 'welcome-1', title: 'Plan the week ahead', description: 'Make space for the things that matter most.', category: 'Personal', dueDate: localDate(), priority: 'High', completed: false },
    { id: 'welcome-2', title: 'Review project progress', description: 'Check in on milestones and share a quick update.', category: 'Work', dueDate: localDate(), priority: 'Medium', completed: false },
    { id: 'welcome-3', title: 'Read for twenty minutes', description: 'A little progress still counts.', category: 'Learning', dueDate: localDate(1), priority: 'Low', completed: false },
    { id: 'welcome-4', title: 'Go for an afternoon walk', description: '', category: 'Health', dueDate: localDate(-1), priority: 'Low', completed: true },
  ];
}

function readTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return starterTasks();
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every((task) => task && typeof task.id === 'string' && typeof task.title === 'string' && typeof task.completed === 'boolean')) {
      throw new Error('Saved task data has an invalid format.');
    }
    return parsed;
  } catch (error) {
    console.error('Could not load saved tasks:', error);
    return starterTasks();
  }
}

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="m9 15 2 2 4-4" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    plus: <path d="M12 5v14m-7-7h14" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    trash: <><path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3" /></>,
    edit: <><path d="m14 5 5 5M4 20l4.5-1 10-10a2.12 2.12 0 0 0-3-3l-10 10L4 20Z" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    leaf: <><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z" /><path d="M4 21c2-5 6-8 11-11" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function formatDate(value) {
  if (!value) return 'No date';
  const date = new Date(`${value}T00:00:00`);
  if (value === localDate()) return 'Today';
  if (value === localDate(1)) return 'Tomorrow';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function TaskDialog({ task, onClose, onSave }) {
  const [form, setForm] = useState(() => task ?? {
    title: '', description: '', category: 'Work', dueDate: localDate(), priority: 'Medium', completed: false,
  });
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setError('Give your task a name before saving.');
      return;
    }
    onSave({ ...form, title, description: form.description.trim() });
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="task-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-heading">
          <div><span className="eyebrow">A LITTLE MORE INTENTION</span><h2 id="dialog-title">{task ? 'Edit your task' : 'Make it happen'}</h2></div>
          <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="task-title">What needs doing?</label>
          <input id="task-title" className="text-input" autoFocus maxLength={100} placeholder="e.g. Send the project update" value={form.title} onChange={(event) => { setForm({ ...form, title: event.target.value }); setError(''); }} />
          <label className="field-label" htmlFor="task-description">A few details <span className="optional">OPTIONAL</span></label>
          <textarea id="task-description" className="text-input description-input" maxLength={240} placeholder="Add a note to future you..." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="form-row">
            <div className="form-field"><label className="field-label" htmlFor="task-category">Area</label><select id="task-category" className="text-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
            <div className="form-field"><label className="field-label" htmlFor="task-date">Due date</label><input id="task-date" className="text-input" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></div>
          </div>
          <fieldset className="priority-field"><legend className="field-label">Priority</legend><div className="priority-options">{priorities.map((priority) => <button key={priority} type="button" className={`priority-choice ${form.priority === priority ? `selected ${priority.toLowerCase()}` : ''}`} onClick={() => setForm({ ...form, priority })}><span className={`priority-dot ${priority.toLowerCase()}`} />{priority}</button>)}</div></fieldset>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="dialog-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary">{task ? 'Save changes' : 'Add to my list'}<Icon name="chevron" size={16} /></button></div>
        </form>
      </section>
    </div>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  return (
    <article className={`task-card ${task.completed ? 'is-complete' : ''}`}>
      <button className={`task-check ${task.completed ? 'checked' : ''}`} type="button" aria-label={task.completed ? `Mark ${task.title} as incomplete` : `Complete ${task.title}`} onClick={() => onToggle(task.id)}>{task.completed && <Icon name="check" size={15} />}</button>
      <div className="task-copy"><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}<div className="task-meta"><span className={`category-tag category-${task.category.toLowerCase()}`}><span className="category-dot" />{task.category}</span><span className={`due-date ${task.dueDate && task.dueDate < localDate() && !task.completed ? 'overdue' : ''}`}><span className="meta-calendar">◷</span>{formatDate(task.dueDate)}</span><span className={`priority-label ${task.priority?.toLowerCase() ?? 'medium'}`}><span className="priority-dot" />{task.priority ?? 'Medium'}</span></div></div>
      <div className="task-actions"><button className="icon-button task-action" type="button" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}><Icon name="edit" size={16} /></button><button className="icon-button task-action delete-action" type="button" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task.id)}><Icon name="trash" size={16} /></button></div>
    </article>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(readTasks);
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [dialogTask, setDialogTask] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      setStorageError(false);
    } catch (error) {
      console.error('Could not save tasks to local storage:', error);
      setStorageError(true);
    }
  }, [tasks]);

  const today = localDate();
  const completedCount = tasks.filter((task) => task.completed).length;
  const openCount = tasks.filter((task) => !task.completed).length;
  const todayCount = tasks.filter((task) => task.dueDate === today && !task.completed).length;
  const filteredTasks = useMemo(() => tasks
    .filter((task) => {
      if (activeFilter === 'today') return task.dueDate === today && !task.completed;
      if (activeFilter === 'upcoming') return task.dueDate > today && !task.completed;
      if (activeFilter === 'completed') return task.completed;
      return true;
    })
    .filter((task) => `${task.title} ${task.description} ${task.category}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => Number(a.completed) - Number(b.completed) || (a.dueDate || '9999').localeCompare(b.dueDate || '9999')),
  [tasks, activeFilter, today, query]);

  const activeLabel = filters.find((filter) => filter.id === activeFilter)?.label ?? 'All tasks';
  const dateLabel = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  function saveTask(values) {
    if (dialogTask) setTasks((current) => current.map((task) => task.id === dialogTask.id ? { ...task, ...values } : task));
    else setTasks((current) => [{ ...values, id: globalThis.crypto?.randomUUID?.() ?? `task-${Date.now()}` }, ...current]);
    closeDialog();
  }
  function closeDialog() { setDialogOpen(false); setDialogTask(null); }
  function editTask(task) { setDialogTask(task); setDialogOpen(true); }
  function addTask() { setDialogTask(null); setDialogOpen(true); }
  function deleteTask(id) { setTasks((current) => current.filter((task) => task.id !== id)); }
  function toggleTask(id) { setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task)); }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="Daymark home"><span className="brand-mark"><Icon name="leaf" size={21} /></span><span>daymark<span className="brand-period">.</span></span></a>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav className="main-nav" aria-label="Task views">{filters.map((filter) => {
          const count = filter.id === 'all' ? openCount : filter.id === 'today' ? todayCount : filter.id === 'completed' ? completedCount : tasks.filter((task) => task.dueDate > today && !task.completed).length;
          return <button key={filter.id} type="button" className={`nav-item ${activeFilter === filter.id ? 'active' : ''}`} onClick={() => setActiveFilter(filter.id)}><Icon name={filter.icon} size={18} /><span>{filter.label}</span><span className="nav-count">{count}</span></button>;
        })}</nav>
        <div className="sidebar-bottom"><div className="sidebar-note"><span className="note-sparkle">✳</span><p>Small steps add up.<br /><strong>You're doing great.</strong></p><div className="note-progress"><span style={{ width: `${tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0}%` }} /></div><span className="note-caption">{completedCount} of {tasks.length} tasks completed</span></div><div className="profile"><div className="avatar">Y</div><div className="profile-copy"><strong>Your space</strong><span>Personal planner</span></div><Icon name="more" size={18} /></div></div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar"><div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{activeLabel}</strong></div><div className="topbar-right"><span className="date-pill"><span className="date-sun">✳</span>{dateLabel}</span><button className="button button-primary top-add" type="button" onClick={addTask}><Icon name="plus" size={17} />New task</button></div></header>
        <div className="content-wrap">
          <section className="welcome-section"><div><span className="eyebrow">A FRESH START, EVERY DAY</span><h1>{activeFilter === 'today' ? 'Your day, in focus.' : activeFilter === 'completed' ? 'Look how far you’ve come.' : activeFilter === 'upcoming' ? 'A little ahead of yourself.' : 'Make room for what matters.'}</h1><p>{activeFilter === 'completed' ? 'Every checked-off task is a little promise you kept.' : `${dateLabel}. One thing at a time — you’ve got this.`}</p></div><div className="welcome-art" aria-hidden="true"><div className="art-sun" /><div className="art-hill art-hill-back" /><div className="art-hill art-hill-front" /><span className="art-star star-one">✳</span><span className="art-star star-two">✦</span><span className="art-leaf">⌁</span></div></section>
          <section className="summary-grid" aria-label="Task summary"><div className="summary-card"><div className="summary-top"><span className="summary-icon violet"><Icon name="grid" size={17} /></span><span className="summary-caption">IN YOUR LIST</span></div><strong className="summary-number">{openCount}<span> tasks</span></strong><span className="summary-foot">Ready when you are</span></div><div className="summary-card"><div className="summary-top"><span className="summary-icon peach"><Icon name="sun" size={17} /></span><span className="summary-caption">DUE TODAY</span></div><strong className="summary-number">{todayCount}<span> tasks</span></strong><span className="summary-foot">A good day to make progress</span></div><div className="summary-card"><div className="summary-top"><span className="summary-icon mint"><Icon name="check" size={17} /></span><span className="summary-caption">ALREADY DONE</span></div><strong className="summary-number">{completedCount}<span> tasks</span></strong><span className="summary-foot">Look at you go <span className="tiny-sparkle">✳</span></span></div></section>
          <section className="tasks-section"><div className="section-heading"><div><span className="eyebrow">YOUR NEXT STEPS</span><h2>{activeLabel}<span className="heading-count">{filteredTasks.length}</span></h2></div><label className="search-box"><Icon name="search" size={17} /><input type="search" placeholder="Find a task..." aria-label="Search tasks" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button type="button" className="clear-search" aria-label="Clear search" onClick={() => setQuery('')}><Icon name="close" size={14} /></button>}</label></div>
            <div className="task-list">{filteredTasks.length ? filteredTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={toggleTask} onEdit={editTask} onDelete={deleteTask} />) : <div className="empty-state"><span className="empty-icon"><Icon name={query ? 'search' : 'leaf'} size={22} /></span><h3>{query ? 'Nothing found just yet' : activeFilter === 'completed' ? 'Your wins are waiting' : 'A little breathing room'}</h3><p>{query ? 'Try a different search, or make a new task.' : activeFilter === 'completed' ? 'Complete a task and it’ll find its way here.' : 'No tasks here right now. Enjoy the space, or add something new.'}</p>{!query && activeFilter !== 'completed' && <button type="button" className="button button-quiet" onClick={addTask}><Icon name="plus" size={16} />Create a task</button>}</div>}</div>
          </section>
          <footer className="page-footer"><span>Made for thoughtful days.</span><span><Icon name="leaf" size={14} /> Small steps, steady progress.</span></footer>
        </div>
      </main>
      {storageError && <div className="storage-notice" role="alert">Your changes could not be saved in this browser. Check your storage settings.</div>}
      {dialogOpen && <TaskDialog task={dialogTask} onClose={closeDialog} onSave={saveTask} />}
    </div>
  );
}
