/* ===================================================================
   Small HTML-string helpers. No framework, no build step.
   Every renderer in pages.js returns a string; app.js drops it into #page
   and handles delegated clicks for rows, tabs, switches and segments.
   =================================================================== */

/* ── Primitives ───────────────────────────────────────────────────── */
const esc = v => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Thousands separators; em-dash for null. */
const n = v => v == null ? '—' : Number(v).toLocaleString('en-US');

/** Signed money-ish value with pos/neg colouring. */
const money = (v, { sign = true } = {}) => {
  if (v == null) return '<span class="muted">—</span>';
  const cls = v > 0 ? 'pos' : v < 0 ? 'neg' : 'muted';
  const s = sign && v > 0 ? '+' : '';
  return `<span class="${cls}">${s}${Number(v).toLocaleString('en-US')}</span>`;
};

/** Plain number, no colour, em-dash for null. */
const num = v => v == null ? '<span class="muted">—</span>' : Number(v).toLocaleString('en-US');

const pct = (a, b) => b ? Math.min(100, Math.round((Math.abs(a) / b) * 100)) : 0;

/* ── Badges ───────────────────────────────────────────────────────── */
const badge = (text, kind = 'neutral') => `<span class="badge badge-${kind}">${esc(text)}</span>`;

/* "New" means new to this proposal. Each page says whether that is a new
   capability or only a new place to find an existing one — the two differ. */
const NEW_BADGE = '<span class="badge badge-new" title="New in this proposal — see the note on the page for what exactly is new">New</span>';

const liveBadge = () => '<span class="badge badge-live"><span class="dot"></span>Live</span>';

/** Maps a status string to a sensible badge colour. */
const STATUS_KIND = {
  Active: 'pos', Live: 'pos', Running: 'pos', Used: 'neutral', Success: 'pos', Clear: 'pos',
  Suspended: 'neg', Expired: 'neutral', Closed: 'neutral', 'No limit': 'neutral', '—': 'neutral',
  Waiting: 'info', Registering: 'info', Scheduled: 'info', Filling: 'info', Unused: 'info',
  'Near limit': 'warn', 'Pending approval': 'warn', Review: 'warn',
  Completed: 'neutral'
};
const statusBadge = s => {
  if (s === 'Live') return liveBadge();
  return badge(s, STATUS_KIND[s] || 'neutral');
};

const roleTag = r => `<span class="role role-${r.toLowerCase().replace(/\s+/g, '-')}">${esc(r)}</span>`;

/* ── Layout blocks ────────────────────────────────────────────────── */
const pageHead = ({ title, isNew, sub, actions = [], badges = [] }) => `
  <div class="page-head">
    <div class="page-head-row">
      <div>
        <h1 class="page-title">${esc(title)}${isNew ? NEW_BADGE : ''}${badges.join('')}</h1>
        ${sub ? `<p class="page-sub">${sub}</p>` : ''}
      </div>
      ${actions.length ? `<div class="page-head-actions">${actions.join('')}</div>` : ''}
    </div>
  </div>`;

/** Heading for a section within a page — groups its filters and table together. */
const sectionHead = (title, hint, actions = []) => `
  <div class="section-head">
    <h2 class="section-title">${esc(title)}</h2>
    ${hint ? `<span class="card-hint">${hint}</span>` : ''}
    ${actions.length ? `<div class="card-head-actions">${actions.join('')}</div>` : ''}
  </div>`;

const card = ({ title, hint, actions = [], body, flush = false }) => `
  <section class="card">
    ${title || hint || actions.length ? `
      <div class="card-head">
        ${title ? `<h2 class="card-title">${title}</h2>` : ''}
        ${hint ? `<span class="card-hint">${hint}</span>` : ''}
        ${actions.length ? `<div class="card-head-actions">${actions.join('')}</div>` : ''}
      </div>` : ''}
    <div class="card-body${flush ? ' card-body-flush' : ''}">${body}</div>
  </section>`;

const stats = items => `
  <div class="stats">
    ${items.map(s => `
      <div class="stat">
        <div class="stat-label">${esc(s.label)}</div>
        <div class="stat-value">${s.value}</div>
        ${s.meta ? `<div class="stat-meta">${s.meta}</div>` : ''}
      </div>`).join('')}
  </div>`;

const note = (body, kind = 'info', icon = 'ℹ') => `
  <div class="note note-${kind}"><span class="note-icon">${icon}</span><div>${body}</div></div>`;

const dl = items => `
  <div class="dl">
    ${items.map(i => `
      <div class="dl-item">
        <div class="dl-label">${esc(i.label)}</div>
        <div class="dl-value${i.mono ? ' mono' : ''}">${i.value}</div>
      </div>`).join('')}
  </div>`;

/* ── Filter bar ───────────────────────────────────────────────────── */
/** field: {label, type:'select'|'search'|'date', options:[], value, grow} */
const field = f => {
  if (f.type === 'search') {
    return `<div class="field${f.grow ? ' field-grow' : ''}">
      <label class="field-label">${esc(f.label)}</label>
      <input type="search" placeholder="${esc(f.placeholder || '')}">
    </div>`;
  }
  if (f.type === 'date') {
    return `<div class="field">
      <label class="field-label">${esc(f.label)}</label>
      <input type="text" value="${esc(f.value || '')}" readonly>
    </div>`;
  }
  return `<div class="field">
    <label class="field-label">${esc(f.label)}</label>
    <select>${(f.options || []).map(o => `<option>${esc(o)}</option>`).join('')}</select>
  </div>`;
};

const filters = (fields, end = []) => `
  <div class="filters">
    ${fields.map(field).join('')}
    ${end.length ? `<div class="filters-end">${end.join('')}</div>` : ''}
  </div>`;

const clubOptions = (all = 'All clubs') => [all, ...CLUBS.map(c => `${c.name} · ${c.id}`)];
const ROLE_OPTIONS = ['All roles', 'Owner', 'Manager', 'Super Agent', 'Agent', 'Player'];
const DATE_PRESETS = ['Last 7 days', 'Last 14 days', 'Last 30 days', 'This week', 'Last week', 'Custom…'];

/* ── Buttons ──────────────────────────────────────────────────────── */
const btn = (label, { kind = '', sm = false, icon = '' } = {}) =>
  `<button class="btn${kind ? ' btn-' + kind : ''}${sm ? ' btn-sm' : ''}">${icon}${esc(label)}</button>`;

const exportBtn = () => btn('Export CSV', { icon: '<span aria-hidden="true">⤓</span>&nbsp;' });

/* ── Toggles ──────────────────────────────────────────────────────── */
let switchSeq = 0;
const toggle = (on, label) => {
  const id = `sw${++switchSeq}`;
  const sw = `<button class="switch" role="switch" aria-checked="${on ? 'true' : 'false'}" aria-labelledby="${id}"></button>`;
  return label
    ? `<span class="switch-row">${sw}<span class="lbl" id="${id}">${esc(label)}</span></span>`
    : `<span class="switch-row">${sw}<span class="lbl" id="${id}" hidden>toggle</span></span>`;
};

const checkbox = (checked = false) => `<input type="checkbox" class="chk"${checked ? ' checked' : ''}>`;

/* ── Segmented control ────────────────────────────────────────────── */
const seg = (options, active = 0) => `
  <div class="seg" role="tablist">
    ${options.map((o, i) => `<button role="tab" aria-selected="${i === active}">${esc(o)}</button>`).join('')}
  </div>`;

/* ── Tabs ─────────────────────────────────────────────────────────── */
/** panels: [{label, html, badge}] — first is active. */
const tabs = panels => `
  <div class="tabset">
    <div class="tabs" role="tablist">
      ${panels.map((p, i) => `<button role="tab" data-tab="${i}" aria-selected="${i === 0}">${esc(p.label)}${p.badge || ''}</button>`).join('')}
    </div>
    ${panels.map((p, i) => `<div data-panel="${i}"${i ? ' hidden' : ''}>${p.html}</div>`).join('')}
  </div>`;

/* ── Modals ───────────────────────────────────────────────────────── */
/* Opened from linked fields, the way ClubGG surfaces Device ID List and
   Linked Accounts off Member Information. app.js owns open/close. */
const modal = ({ title, meta, body }) => `
  <div class="modal-backdrop" data-modal-close>
    <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="modal-head">
        <h2 class="modal-title">${esc(title)}</h2>
        <button class="modal-x" data-modal-close aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        ${meta ? `<div class="modal-meta">${esc(meta)}</div>` : ''}
        ${body}
      </div>
      <div class="modal-foot">${btn('Close', {})}</div>
    </div>
  </div>`;

/** A field in the profile header that opens a modal. */
const linkedFigure = (label, value, modalKey, sub) => `
  <div class="figure">
    <div class="figure-label">${esc(label)}</div>
    <a class="figure-value is-link" href="#" data-modal="${esc(modalKey)}">${value}<span aria-hidden="true"> ›</span></a>
    ${sub ? `<div class="figure-sub">${esc(sub)}</div>` : ''}
  </div>`;

const figure = (label, value, sub) => `
  <div class="figure">
    <div class="figure-label">${esc(label)}</div>
    <div class="figure-value">${value}</div>
    ${sub ? `<div class="figure-sub">${esc(sub)}</div>` : ''}
  </div>`;

/* ── Tables ───────────────────────────────────────────────────────── */
/**
 * cols: [{ key, label, cls }]  — cls: 'num' | 'mid' | ''
 * rows: [{ cells: [...], href, title }]
 * foot: [ ...cells ] (optional totals row)
 */
const dataTable = ({ cols, rows, foot, chevron = false, empty = 'Nothing to show.' }) => {
  if (!rows.length) return `<div class="empty">${esc(empty)}</div>`;
  return `
  <div class="table-scroll">
    <table class="data">
      <thead><tr>
        ${cols.map(c => `<th class="${c.cls || ''}">${c.label}</th>`).join('')}
        ${chevron ? '<th></th>' : ''}
      </tr></thead>
      <tbody>
        ${rows.map(r => `
          <tr${r.href ? ` class="clickable" data-href="${esc(r.href)}" tabindex="0"` : ''}${r.title ? ` title="${esc(r.title)}"` : ''}>
            ${r.cells.map((c, i) => `<td class="${cols[i] ? cols[i].cls || '' : ''}">${c}</td>`).join('')}
            ${chevron ? '<td class="chev-cell" aria-hidden="true">›</td>' : ''}
          </tr>`).join('')}
      </tbody>
      ${foot ? `<tfoot><tr>
        ${foot.map((c, i) => `<td class="${cols[i] ? cols[i].cls || '' : ''}">${c}</td>`).join('')}
        ${chevron ? '<td></td>' : ''}
      </tr></tfoot>` : ''}
    </table>
  </div>`;
};

/* ── Misc cells ───────────────────────────────────────────────────── */
const primaryCell = (main, sub) =>
  `<span class="cell-primary">${main}</span>${sub ? `<span class="cell-sub">${sub}</span>` : ''}`;

const idCell = v => `<span class="id">${esc(v)}</span>`;

/**
 * Editable min/max pair, e.g. stop limits and blind ranges.
 * `group: true` adds thousands separators — right for chip amounts,
 * wrong for blind levels like 0.5–10.
 */
const rangeCell = (range, { unit = '', ceiling = '', group = false } = {}) => {
  if (!range) return '<span class="muted">Not set</span>';
  const fmt = v => group ? Number(v).toLocaleString('en-US') : v;
  /* Inputs are sized to their content so the pair hugs the left edge of the
     cell and lines up under the column header. Fixed-width boxes with
     right-aligned text pushed short values far off their heading. */
  const box = (v, label) => {
    const t = String(fmt(v));
    return `<input value="${esc(t)}" size="${Math.max(t.length, 2)}" aria-label="${label}" readonly>`;
  };
  return `<span class="range-cell${group ? ' is-wide' : ''}">
      ${box(range[0], 'Minimum')}
      <span class="to">–</span>
      ${box(range[1], 'Maximum')}
      ${unit ? `<span class="to">${esc(unit)}</span>` : ''}
    </span>${ceiling ? `<span class="ceiling">${esc(ceiling)}</span>` : ''}`;
};

/**
 * Row-level edit affordance. Fields in the row stay read-only until Edit is
 * pressed; Edit then becomes Confirm and a Cancel appears beside it.
 * `extra` takes any additional per-row action, e.g. Reset.
 */
const editCell = (extra = '') => `<span class="inline-actions">
    <button class="btn btn-sm" data-edit-row>Edit</button>
    <button class="btn btn-sm" data-cancel-row hidden>Cancel</button>
    ${extra}
  </span>`;

const meter = (used, cap, label) => {
  const p = pct(used, cap);
  const cls = p >= 90 ? ' is-hot' : p >= 70 ? ' is-warn' : '';
  return `<div class="meter-wrap">
      <div class="meter${cls}"><span style="width:${p}%"></span></div>
      <div class="meter-text">${label != null ? label : `${n(used)} / ${n(cap)}`}</div>
    </div>`;
};

const actionCell = (...labels) =>
  `<span class="inline-actions">${labels.map(l =>
    btn(l, { sm: true, kind: l === 'Reset' || l === 'Disband' || l === 'Remove' ? 'danger' : '' })).join('')}</span>`;
