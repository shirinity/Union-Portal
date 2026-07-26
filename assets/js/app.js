/* ===================================================================
   Nav structure, hash router, and the delegated interaction layer.

   The site map is the one in "Union Admin Portal: Navigation Hierarchy
   & Terminology" — 5 categories, with Chips & Credits as a standalone
   top-level item and no left-nav entry for Club or Member Detail
   (both are row-click only, which is the fix for ClubGG's two broken
   nav items).
   =================================================================== */

const NAV = [
  {
    num: 1, title: 'Activity History', items: [
      { label: 'Clubs', route: 'activity/clubs' },
      { label: 'Members', route: 'activity/members' }
    ]
  },
  {
    num: 2, title: 'Policing & Restrictions', items: [
      { label: 'Club Stop Limits', route: 'policing/club-stop-limits' },
      { label: 'Club Restrict Game & Access', route: 'policing/club-restrict', isNew: true },
      { label: 'Member Stop Limits', route: 'policing/member-stop-limits', isNew: true },
      { label: 'Member Restrict Game & Access', route: 'policing/member-restrict' }
    ]
  },
  { num: 3, title: 'Chips & Credits', route: 'chips', solo: true },
  {
    num: 4, title: 'Games', items: [
      { label: 'Ring Games', route: 'games/ring' },
      { label: 'Tournaments (MTT)', route: 'games/mtt' },
      { label: 'SNGs', route: 'games/sng' },
      { label: 'Templates', route: 'games/templates' },
      { label: 'Recurring Games', route: 'games/recurring' }
    ]
  },
  {
    num: 5, title: 'Promotions', items: [
      { label: 'Leaderboards', route: 'promos/leaderboards' },
      { label: 'Bad Beat Jackpot', route: 'promos/bbj' },
      { label: 'Announcements', route: 'promos/announcements' }
    ]
  }
];

/* The club list is also the home page — the portal opens on the union
   overview rather than on a bare list. */
const HOME_ROUTE = 'activity/clubs';
const DEFAULT_ROUTE = HOME_ROUTE;

/* Flat lookup: route → { label, category } */
const ROUTE_INDEX = {};
NAV.forEach(g => {
  if (g.solo) { ROUTE_INDEX[g.route] = { label: g.title, category: null }; return; }
  g.items.forEach(i => { ROUTE_INDEX[i.route] = { label: i.label, category: g.title, isNew: i.isNew }; });
});

/* ── DOM handles ──────────────────────────────────────────────────── */
const $nav    = document.getElementById('nav');
const $page   = document.getElementById('page');
const $crumbs = document.getElementById('crumbs');
const $sidebar= document.getElementById('sidebar');
const $scrim  = document.getElementById('scrim');

/* ── Storage ──────────────────────────────────────────────────────── */
/* localStorage throws in some file:// and private-browsing contexts, and
   this has to keep working when someone just double-clicks index.html. */
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* no-op */ } }
};

/* ── Sidebar ──────────────────────────────────────────────────────── */
const COLLAPSE_KEY = 'uap.collapsed';

let collapsed;
try { collapsed = new Set(JSON.parse(store.get(COLLAPSE_KEY) || '[]')); }
catch { collapsed = new Set(); }

const CHEV = '<svg class="chev" viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function renderNav(active) {
  const parent = activeParent(active);

  $nav.innerHTML = NAV.map(g => {
    if (g.solo) {
      return `<a class="nav-solo${active === g.route ? ' active' : ''}" href="#/${g.route}">
                <span class="nav-group-num">${g.num}</span><span>${esc(g.title)}</span>
              </a>`;
    }
    const isCollapsed = collapsed.has(g.title) && g.title !== parent;
    return `
      <div class="nav-group${isCollapsed ? ' collapsed' : ''}" data-group="${esc(g.title)}">
        <button class="nav-group-head" aria-expanded="${!isCollapsed}">
          <span class="nav-group-num">${g.num}</span>
          <span>${esc(g.title)}</span>
          ${CHEV}
        </button>
        <ul class="nav-items">
          ${g.items.map(i => `
            <li><a class="nav-link${active === i.route ? ' active' : ''}" href="#/${i.route}">
              <span>${esc(i.label)}</span>${i.isNew ? '<span class="badge badge-new">New</span>' : ''}
            </a></li>`).join('')}
        </ul>
      </div>`;
  }).join('');
}

/** For a detail route, the list route it belongs under. */
function listRouteFor(route) {
  if (/^activity\/clubs\/.+/.test(route)) return 'activity/clubs';
  if (/^activity\/members\/.+/.test(route)) return 'activity/members';
  return route;
}

function activeParent(route) {
  const list = listRouteFor(route);
  const entry = ROUTE_INDEX[list];
  return entry ? entry.category : null;
}

$nav.addEventListener('click', e => {
  const head = e.target.closest('.nav-group-head');
  if (!head) return;
  const group = head.closest('.nav-group');
  const name = group.dataset.group;
  group.classList.toggle('collapsed');
  const isCollapsed = group.classList.contains('collapsed');
  head.setAttribute('aria-expanded', String(!isCollapsed));
  isCollapsed ? collapsed.add(name) : collapsed.delete(name);
  store.set(COLLAPSE_KEY, JSON.stringify([...collapsed]));
});

/* ── Breadcrumbs ──────────────────────────────────────────────────── */
/* Categories are organisational for the left nav only — they never appear
   here. Every trail is rooted in the union, so you always know where home is. */
function renderCrumbs(route) {
  const list = listRouteFor(route);
  const entry = ROUTE_INDEX[list];
  const isHome = route === HOME_ROUTE;
  const parts = [];

  if (isHome) {
    parts.push(`<span class="here">${esc(UNION.name)}</span>`);
  } else {
    parts.push(`<a href="#/${HOME_ROUTE}">${esc(UNION.name)}</a>`);

    if (list !== route) {
      /* detail page — link back to its list, unless that list *is* home */
      if (list !== HOME_ROUTE) parts.push(`<a href="#/${list}">${esc(entry.label)}</a>`);
      parts.push(`<span class="here">${esc(detailTitle(route))}</span>`);
    } else if (entry) {
      parts.push(`<span class="here">${esc(entry.label)}</span>${entry.isNew ? ' ' + NEW_BADGE : ''}`);
    } else {
      parts.push('<span class="here">Not found</span>');
    }
  }

  $crumbs.innerHTML = parts.join('<span class="sep">/</span>');
}

function detailTitle(route) {
  const m = route.match(/^activity\/clubs\/(.+)$/);
  if (m) { const c = clubById(m[1]); return c ? c.name : m[1]; }
  const m2 = route.match(/^activity\/members\/(.+)$/);
  if (m2) { const p = memberByNick(m2[1]); return p ? p.nick : m2[1]; }
  return route;
}

/* ── Router ───────────────────────────────────────────────────────── */
function currentRoute() {
  const raw = (location.hash || '').replace(/^#\/?/, '').replace(/\/+$/, '');
  return raw || DEFAULT_ROUTE;
}

function resolve(route) {
  if (PAGES[route]) return () => PAGES[route]();

  let m = route.match(/^activity\/clubs\/(.+)$/);
  if (m) return () => PAGES['activity/clubs/:id'](decodeURIComponent(m[1]));

  m = route.match(/^activity\/members\/(.+)$/);
  if (m) return () => PAGES['activity/members/:nick'](decodeURIComponent(m[1]));

  return null;
}

function render() {
  const route = currentRoute();
  const view = resolve(route);

  renderNav(listRouteFor(route));
  renderCrumbs(route);

  $page.innerHTML = view
    ? view()
    : pageHead({ title: 'Page not found', sub: `No screen is mapped to <code>${esc(route)}</code>.` })
      + `<div class="empty">Pick something from the sidebar.</div>`;

  const list = listRouteFor(route);
  const entry = ROUTE_INDEX[list];
  document.title = (route === HOME_ROUTE ? UNION.name
    : list !== route ? detailTitle(route)
    : entry ? entry.label : 'Not found') + ' · Union Admin Portal';

  $page.scrollTop = 0;
  closeSidebar();
}

window.addEventListener('hashchange', render);

/* ── Delegated interactions ───────────────────────────────────────── */

/* Tabs — scoped to the nearest .tabset so nested tab groups work. */
$page.addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]');
  if (!tab) return;
  const set = tab.closest('.tabset');
  const i = tab.dataset.tab;
  set.querySelectorAll(':scope > .tabs > [data-tab]').forEach(b =>
    b.setAttribute('aria-selected', String(b.dataset.tab === i)));
  set.querySelectorAll(':scope > [data-panel]').forEach(p =>
    p.hidden = p.dataset.panel !== i);
});

/* Segmented controls */
$page.addEventListener('click', e => {
  const b = e.target.closest('.seg button');
  if (!b) return;
  b.parentElement.querySelectorAll('button').forEach(x =>
    x.setAttribute('aria-selected', String(x === b)));
});

/* Toggle switches */
$page.addEventListener('click', e => {
  const sw = e.target.closest('.switch');
  if (!sw) return;
  e.stopPropagation();
  sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
});

/* Row drill-down — ignore clicks that landed on a real control */
const INERT_TARGET = 'a, button, input, select, textarea, label, .switch';

$page.addEventListener('click', e => {
  const row = e.target.closest('tr[data-href]');
  if (!row || e.target.closest(INERT_TARGET)) return;
  location.hash = row.dataset.href;
});

$page.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const row = e.target.closest('tr[data-href]');
  if (!row || e.target.closest(INERT_TARGET)) return;
  location.hash = row.dataset.href;
});

/* Mock buttons: say plainly that nothing is wired up rather than
   looking broken. Real navigation and filters are unaffected. */
$page.addEventListener('click', e => {
  const b = e.target.closest('.btn');
  if (!b) return;
  toast(`“${b.textContent.trim()}” isn't wired up — this is a click-through prototype.`);
});

let toastTimer;
function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ── Theme ────────────────────────────────────────────────────────── */
const THEME_KEY = 'uap.theme';
const savedTheme = store.get(THEME_KEY);
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
else if (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches)
  document.documentElement.dataset.theme = 'light';

document.getElementById('themeBtn').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  store.set(THEME_KEY, next);
});

/* ── Mobile sidebar ───────────────────────────────────────────────── */
function closeSidebar() { $sidebar.classList.remove('open'); $scrim.hidden = true; }
document.getElementById('menuBtn').addEventListener('click', () => {
  const open = $sidebar.classList.toggle('open');
  $scrim.hidden = !open;
});
$scrim.addEventListener('click', closeSidebar);

/* ── Go ───────────────────────────────────────────────────────────── */
if (!location.hash) location.replace('#/' + DEFAULT_ROUTE);
render();
