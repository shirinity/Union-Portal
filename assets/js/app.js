/* ===================================================================
   Nav structure, hash router, and the delegated interaction layer.

   Based on "Union Admin Portal: Navigation Hierarchy & Terminology", with
   category names shortened since (Activity History → Activity, Policing &
   Restrictions → Restrictions) and Chips & Credits split into a club link
   and a member link instead of one page with tabs.

   Club Detail and Member Detail have no left-nav entry — both are row-click
   only, which is the fix for ClubGG's two unopenable nav items.
   =================================================================== */

/* Category headings are plain labels — not numbered, not collapsible, no
   bullets on the links. Chips & Credits is a standalone link, not a
   clickable category. */
const NAV = [
  {
    title: 'Activity', items: [
      { label: 'Clubs', route: 'activity/clubs' },
      { label: 'Members', route: 'activity/members' }
    ]
  },
  {
    title: 'Restrictions', items: [
      { label: 'Club Stop Limits', route: 'restrictions/club-stop-limits' },
      { label: 'Club Restrict Game & Access', route: 'restrictions/club-restrict', isNew: true },
      { label: 'Member Stop Limits', route: 'restrictions/member-stop-limits', isNew: true },
      { label: 'Member Restrict Game & Access', route: 'restrictions/member-restrict' }
    ]
  },
  /* Two links rather than one page with Clubs/Members tabs, so the club and
     member tiers are expressed the same way they are under Restrictions. */
  {
    solo: true, items: [
      { label: 'Club Chips & Credits', route: 'chips/clubs' },
      { label: 'Member Chips & Credits', route: 'chips/members' }
    ]
  },
  {
    title: 'Games', items: [
      { label: 'Ring Games', route: 'games/ring' },
      { label: 'Tournaments', route: 'games/mtt' },
      { label: 'SNGs', route: 'games/sng' },
      { label: 'Templates', route: 'games/templates' },
      { label: 'Recurring Games', route: 'games/recurring' }
    ]
  },
  {
    title: 'Promotions', items: [
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
  g.items.forEach(i => {
    ROUTE_INDEX[i.route] = { label: i.label, category: g.solo ? null : g.title, isNew: i.isNew };
  });
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
const navLink = (i, active) => `
  <li><a class="nav-link${active === i.route ? ' active' : ''}" href="#/${i.route}">
    <span>${esc(i.label)}</span>${i.isNew ? '<span class="badge badge-new">New</span>' : ''}
  </a></li>`;

function renderNav(active) {
  $nav.innerHTML = NAV.map(g => g.solo
    ? `<ul class="nav-items nav-items-solo">${g.items.map(i => navLink(i, active)).join('')}</ul>`
    : `<div class="nav-group">
         <div class="nav-group-head">${esc(g.title)}</div>
         <ul class="nav-items">${g.items.map(i => navLink(i, active)).join('')}</ul>
       </div>`
  ).join('');
}

/** For a detail route, the list route it belongs under. */
function listRouteFor(route) {
  if (/^activity\/clubs\/.+/.test(route)) return 'activity/clubs';
  if (/^activity\/members\/.+/.test(route)) return 'activity/members';
  return route;
}

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
