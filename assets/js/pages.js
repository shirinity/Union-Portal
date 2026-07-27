/* ===================================================================
   Page renderers. One per nav entry, plus the two row-click detail
   pages. Each returns an HTML string.

   Page contents follow "Union Admin Portal: Navigation Hierarchy &
   Terminology" (Confluence CH/1316585496), with field-level detail from
   Union Admin Features, Roles for Club/Union Administration, Game
   History, Members Tab, and Create Table Settings Reference.
   =================================================================== */

const PAGES = {};

/* ═══════════════════════════════════════════════════════════════════
   1 · ACTIVITY HISTORY
   ═══════════════════════════════════════════════════════════════════ */

/* ── Club List — doubles as the portal home page ──────────────────── */
PAGES['activity/clubs'] = () => {
  const t = CLUBS.reduce((a, c) => ({
    credits: a.credits + c.credits, managers: a.managers + c.managers,
    superAgents: a.superAgents + c.superAgents, agents: a.agents + c.agents,
    players: a.players + c.players, hands: a.hands + c.hands, rake: a.rake + c.rake,
    fees: a.fees + c.fees, insurance: a.insurance + c.insurance,
    evCashout: a.evCashout + c.evCashout, bbj: a.bbj + c.bbj, pnl: a.pnl + c.pnl
  }), { credits: 0, managers: 0, superAgents: 0, agents: 0, players: 0, hands: 0, rake: 0, fees: 0, insurance: 0, evCashout: 0, bbj: 0, pnl: 0 });

  const cols = [
    { label: 'Club' }, { label: 'Club ID' }, { label: 'Credits', cls: 'num' },
    { label: 'Mgr', cls: 'num' }, { label: 'S.Agent', cls: 'num' }, { label: 'Agent', cls: 'num' }, { label: 'Player', cls: 'num' },
    { label: 'Hands', cls: 'num' }, { label: 'Rake', cls: 'num' }, { label: 'Fees', cls: 'num' },
    { label: 'Insurance', cls: 'num' }, { label: 'EV Cashout', cls: 'num' }, { label: 'BBJ', cls: 'num' },
    { label: 'P&L', cls: 'num' }, { label: 'Status', cls: 'mid' }
  ];

  const rows = CLUBS.map(c => ({
    href: `#/activity/clubs/${c.id}`,
    title: `Open ${c.name}`,
    cells: [
      primaryCell(esc(c.name) + (c.isMasterClub ? ' ' + badge('Master club', 'gold') : ''), 'Owner · ' + esc(c.owner)),
      idCell(c.id), `<span class="gold">${n(c.credits)}</span>`,
      n(c.managers), n(c.superAgents), n(c.agents), n(c.players),
      n(c.hands), num(c.rake), num(c.fees), num(c.insurance), money(c.evCashout), num(c.bbj),
      money(c.pnl), statusBadge(c.status)
    ]
  }));

  const foot = [
    `<strong>Total · ${CLUBS.length} clubs</strong>`, '',
    n(t.credits), n(t.managers), n(t.superAgents), n(t.agents), n(t.players),
    n(t.hands), n(t.rake), n(t.fees), n(t.insurance), money(t.evCashout), n(t.bbj),
    money(t.pnl), ''
  ];

  const masterClub = clubById(UNION.masterClubId);

  return pageHead({
    title: UNION.name,
    badges: [badge(`Master club · ${masterClub.name}`, 'gold')],
    sub: `Union overview — where the portal opens. Signed in as the Union Owner, so everything in the union is in scope.
          Figures cover the selected period as of ${esc(UNION.asOf)}.`,
    actions: [btn('Union settings')]
  })
  + stats([
    { label: 'Clubs', value: n(CLUBS.length), meta: `${CLUBS.filter(c => c.status === 'Active').length} active · 1 suspended` },
    { label: 'Members', value: n(t.players + t.agents + t.superAgents + t.managers + CLUBS.length), meta: 'across all clubs' },
    { label: 'Hands', value: n(t.hands), meta: 'selected period' },
    { label: 'Rake', value: n(t.rake), meta: `+ ${n(t.fees)} tournament fees` },
    { label: 'Union P&L', value: money(t.pnl, { sign: false }), meta: 'ring + tournament' }
  ])
  + sectionHead('Clubs', 'Click a row to open a club', [exportBtn()])
  + filters([
    { label: 'Search', type: 'search', placeholder: 'Club name or 6-digit ID…', grow: true },
    { label: 'Date range', type: 'select', options: DATE_PRESETS },
    { label: 'Status', type: 'select', options: ['All statuses', 'Active', 'Suspended'] },
    { label: 'Union game authority', type: 'select', options: ['Any', 'Granted', 'Not granted'] }
  ])
  + card({
    hint: `Financial columns, member counts by role and a totals row — this list absorbs what ClubGG split out as <strong>Club Revenue</strong> under Report. Visible to <em>any</em> club's Owner or Manager, not only the master club's.`,
    body: dataTable({ cols, rows, foot, chevron: true })
  })
  + note(`<strong>Club ID</strong> is shown as 6 digits, numbers only — the format decided in Union Admin Features. Today's IDs are 8 characters mixing letters and numbers.`, 'info');
};

/* ── Club Detail ──────────────────────────────────────────────────── */
PAGES['activity/clubs/:id'] = id => {
  const c = clubById(id);
  if (!c) return pageHead({ title: 'Club not found' }) + `<div class="empty">No club with ID ${esc(id)}.</div>`;

  const initials = c.name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const hasRake = c.rakePct !== 'No rake';

  /* Chip activity relevant to this club: credits sent to the club itself,
     plus chip movement among its own roster. */
  const roster = MEMBERS.filter(m => m.club === c.id).map(m => m.nick);
  const chipRows = CHIP_LOG.filter(r => r.recipient === c.name || roster.includes(r.recipient));

  /* — Game History tab — no date control; the page-level range governs. */
  const gameHistory =
    filters([
      { label: 'Member', type: 'select', options: ['All members', ...roster] },
      { label: 'Game', type: 'select', options: ['All games', ...RING_TYPES] }
    ])
    + card({
      title: 'Game list', hint: 'One row per table lifecycle',
      body: dataTable({
        cols: [
          { label: 'Date' }, { label: 'Stakes' }, { label: 'Game' },
          { label: 'Players', cls: 'num' }, { label: 'Hands', cls: 'num' },
          { label: hasRake ? 'Rake' : 'P&L', cls: 'num' }, { label: '', cls: 'mid' }
        ],
        rows: CLUB_GAME_HISTORY.map(g => ({
          cells: [g.date, `<span class="id">${esc(g.stakes)}</span>`, badge(g.game, 'neutral'),
            n(g.players), n(g.hands), hasRake ? num(g.rake) : money(g.rake),
            g.live ? liveBadge() : '']
        })),
        foot: ['<strong>Total</strong>', '', '', '', n(CLUB_GAME_HISTORY.reduce((a, g) => a + g.hands, 0)),
          n(CLUB_GAME_HISTORY.reduce((a, g) => a + g.rake, 0)), '']
      })
    })
    + card({
      title: 'Buy-in log', hint: 'Every buy-in and cash-out in the period',
      body: dataTable({
        cols: [{ label: 'Date' }, { label: 'Member' }, { label: 'Stakes' }, { label: 'Game' },
          { label: 'Hands', cls: 'num' }, { label: 'Total buy-in', cls: 'num' }, { label: 'Total cash-out', cls: 'num' }, { label: 'P&L', cls: 'num' }],
        rows: MEMBER_RING_HISTORY.map((r, i) => ({
          cells: [r.date, `<a class="rowlink" href="#/activity/members/${esc(roster[i % roster.length])}">${esc(roster[i % roster.length])}</a>`,
            `<span class="id">${esc(r.stakes)}</span>`, badge(r.game, 'neutral'),
            n(r.hands), n(r.buyin), r.cashout == null ? '<span class="muted">…</span>' : n(r.cashout), money(r.pnl)]
        }))
      })
    });

  /* — Chip Activity tab — */
  const chipActivity =
    filters([
      { label: 'Recipient', type: 'select', options: ['Everyone', ...roster] },
      { label: 'Direction', type: 'select', options: ['Sent & reclaimed', 'Sent only', 'Reclaimed only'] }
    ])
    + card({
            hint: 'Sent shows red — it is a debt to the club; reclaimed shows green',
      body: dataTable({
        cols: [{ label: 'Date / time' }, { label: 'Sender' }, { label: 'Recipient' }, { label: 'Type' },
          { label: 'Amount', cls: 'num' }, { label: 'Starting', cls: 'num' }, { label: 'Ending', cls: 'num' }],
        rows: chipRows.map(r => ({
          cells: [r.when, primaryCell(esc(r.sender), esc(r.senderRole)), esc(r.recipient),
            badge(r.type, r.type === 'Credits' ? 'gold' : r.type === 'Tournament Ticket' ? 'info' : 'neutral'),
            `<span class="${r.dir === 'sent' ? 'neg' : 'pos'}">${r.dir === 'sent' ? '−' : '+'}${n(r.amount)}</span>`,
            num(r.start), num(r.end)]
        })),
        empty: 'No chip activity for this club in the selected period.'
      })
    });

  /* — Security tab — */
  const security =
    note(`Security &amp; moderation data only. Restriction controls — stop limits and game/access restrictions — live under <a href="#/restrictions/club-stop-limits">Restrictions</a>.`, 'info')
    + `<div class="cols">
        ${card({
          title: 'Device &amp; platform history',
          body: dataTable({
            cols: [{ label: 'Device' }, { label: 'Platform' }, { label: 'Members', cls: 'num' }, { label: 'Last seen' }],
            rows: CLUB_SECURITY.devices.map(d => ({ cells: [primaryCell(esc(d.device)), esc(d.platform), n(d.members), d.lastSeen] }))
          }), flush: true
        })}
        ${card({
          title: 'Collusion &amp; multi-accounting flags',
          body: dataTable({
            cols: [{ label: 'Check' }, { label: 'Finding' }, { label: 'State', cls: 'mid' }],
            rows: CLUB_SECURITY.flags.map(f => ({ cells: [primaryCell(esc(f.kind), esc(f.when)), `<span class="muted">${esc(f.detail)}</span>`, statusBadge(f.severity)] }))
          }), flush: true
        })}
      </div>`;

  /* Persistent profile header — same pattern as Member Detail. Profile
     fields and permissions are always visible rather than behind a tab. */
  const memberCount = c.managers + c.superAgents + c.agents + c.players + 1;

  const profile = `
    <div class="profile">
      <div class="profile-top">
        <div class="entity-avatar">${esc(initials)}</div>
        <div>
          <div class="entity-name">${esc(c.name)}${c.isMasterClub ? badge('Master club', 'gold') : ''}${statusBadge(c.status)}</div>
          <div class="entity-meta">
            Club ID ${esc(c.id)} ·
            owner <a class="rowlink" href="#/activity/members/${esc(c.owner)}">${esc(c.owner)}</a> ·
            joined ${esc(c.joined)} · rake ${esc(c.rakePct)}
          </div>
        </div>
        <div class="profile-actions">
          ${c.status === 'Suspended'
            ? btn('Re-approve club', { sm: true, kind: 'primary' })
            : btn('Suspend club', { sm: true, kind: 'danger' })}
        </div>
      </div>

      <div class="profile-figures">
        ${figure('Credits', `<span class="gold">${n(c.credits)}</span>`, 'issued by the union')}
        ${figure('Members', n(memberCount), `${n(c.players)} Player · ${n(c.agents)} Agent · ${n(c.superAgents)} S.Agent · ${n(c.managers)} Mgr`)}
        ${figure('Chips outstanding', n(MEMBERS.filter(m => m.club === c.id).reduce((a, m) => a + m.chips, 0)), 'held by members')}
        ${figure('Union games', c.unionGameAuthority ? badge('Granted', 'pos') : badge('Not granted', 'neutral'))}
      </div>

      <div class="profile-fields">
        <div class="pf">
          <label class="pf-label">Authority to Create Union Game</label>
          <div class="pf-static">${toggle(c.unionGameAuthority, c.unionGameAuthority ? 'Granted' : 'Off by default')}</div>
        </div>
        <div class="pf pf-wide">
          <label class="pf-label">Internal note — visible to union admins</label>
          <input value="${esc(c.notes)}" placeholder="Add an internal note about this club…">
        </div>
      </div>
    </div>`;

  const summary = stats([
    { label: 'Games', value: n(CLUB_GAME_HISTORY.length), meta: `${CLUB_GAME_HISTORY.filter(g => g.live).length} live now` },
    { label: 'Active members', value: n(c.players), meta: 'unique, played in period' },
    { label: 'Hands', value: n(CLUB_GAME_HISTORY.reduce((a, g) => a + g.hands, 0)) },
    hasRake
      ? { label: 'Rake', value: n(CLUB_GAME_HISTORY.reduce((a, g) => a + g.rake, 0)) }
      : { label: 'Rake', value: '<span class="muted">No rake</span>', meta: 'club rake is 0' },
    { label: 'P&L', value: money(c.pnl, { sign: false }) }
  ]);

  const dateBar = `
    <div class="daterange">
      <div class="field">
        <label class="field-label">Date range</label>
        <select>${DATE_PRESETS.map(d => `<option>${esc(d)}</option>`).join('')}</select>
      </div>
      <div class="pf-static">${exportBtn()}</div>
      <span class="daterange-note">Date range applies to the summary and every tab below</span>
    </div>`;

  return profile
    + note(`<strong>Scoped to activity, history and security.</strong> Stop Limits and Stakes are set on
      <a href="#/restrictions/club-stop-limits">Club Stop Limits</a> and <a href="#/restrictions/club-stakes">Club Stakes</a>, not here.`, 'accent', '↗')
    + dateBar
    + summary
    + tabs([
      { label: 'Game History', html: gameHistory },
      { label: 'Chip Activity', html: chipActivity },
      { label: 'Security', html: security }
    ]);
};

/* ── Member List ──────────────────────────────────────────────────── */
PAGES['activity/members'] = () => {
  const t = MEMBERS.reduce((a, m) => ({
    chips: a.chips + m.chips, games: a.games + m.games, hands: a.hands + m.hands,
    rake: a.rake + m.rake, fees: a.fees + m.fees, bbj: a.bbj + m.bbj, pnl: a.pnl + m.pnl
  }), { chips: 0, games: 0, hands: 0, rake: 0, fees: 0, bbj: 0, pnl: 0 });

  const cols = [
    { label: 'Member' }, { label: 'Member ID' }, { label: 'Club' }, { label: 'Role' },
    { label: 'Credits', cls: 'num' }, { label: 'Club chips', cls: 'num' },
    { label: 'Games', cls: 'num' }, { label: 'Hands', cls: 'num' }, { label: 'Rake', cls: 'num' },
    { label: 'Fees', cls: 'num' }, { label: 'BBJ', cls: 'num' }, { label: 'P&L', cls: 'num' },
    { label: 'Portal access', cls: 'mid' }
  ];

  const rows = MEMBERS.map(m => ({
    href: `#/activity/members/${m.nick}`,
    title: `Open ${m.nick}`,
    cells: [
      primaryCell(esc(m.nick), m.alias ? esc(m.alias) : '<span class="muted">no alias set</span>'),
      idCell(m.id),
      `<a class="rowlink" href="#/activity/clubs/${m.club}">${esc(clubName(m.club))}</a>`,
      roleTag(m.role),
      m.credits ? `<span class="gold">${n(m.credits)}</span>` : '<span class="muted">—</span>',
      n(m.chips), n(m.games), n(m.hands), num(m.rake), num(m.fees), num(m.bbj), money(m.pnl),
      toggle(m.bo)
    ]
  }));

  const foot = [`<strong>Total · ${MEMBERS.length} shown</strong>`, '', '', '', '',
    n(t.chips), n(t.games), n(t.hands), n(t.rake), n(t.fees), n(t.bbj), money(t.pnl), ''];

  return pageHead({
    title: 'Member List',
    sub: `Every member across every club in the union. Filter by club and role; ClubGG's separate <strong>Agent Counter</strong> page is unnecessary once this role filter exists.
          <em>Portal access</em> is ClubGG's "BO" column — whether the member can sign in to this admin portal.`,
    actions: [exportBtn()]
  })
  + stats([
    { label: 'Members shown', value: n(MEMBERS.length), meta: `of ${n(CLUBS.reduce((a, c) => a + c.players + c.agents + c.superAgents + c.managers + 1, 0))} in the union` },
    { label: 'Chips outstanding', value: n(t.chips), meta: 'held by these members' },
    { label: 'Hands', value: n(t.hands), meta: 'selected period' },
    { label: 'Rake + fees', value: n(t.rake + t.fees) },
    { label: 'Net P&L', value: money(t.pnl, { sign: false }) }
  ])
  + filters([
    { label: 'Search', type: 'search', placeholder: 'Nickname, alias or member ID…', grow: true },
    { label: 'Club', type: 'select', options: clubOptions() },
    { label: 'Role', type: 'select', options: ROLE_OPTIONS },
    { label: 'Date range', type: 'select', options: DATE_PRESETS },
    { label: 'Portal access', type: 'select', options: ['Any', 'Granted', 'Not granted'] }
  ])
  + card({
    title: 'All members',
    hint: 'Click a row to open Member Detail',
    body: dataTable({ cols, rows, foot, chevron: true })
  });
};

/* ── Member Detail ────────────────────────────────────────────────── */
PAGES['activity/members/:nick'] = nick => {
  const m = memberByNick(nick);
  if (!m) return pageHead({ title: 'Member not found' }) + `<div class="empty">No member called ${esc(nick)}.</div>`;

  /* Tabs carry no date control of their own — the page-level range above
     governs all of them. Only genuinely tab-specific filters stay. */
  const ringHistory =
    filters([
      { label: 'Game', type: 'select', options: ['All games', ...RING_TYPES] },
      { label: 'Stakes', type: 'select', options: ['All stakes', '0.5 / 1', '1 / 2', '2 / 4', '5 / 10'] }
    ])
    + card({
      hint: 'One row per session — a buy-in-to-cash-out cycle',
      body: dataTable({
        cols: [{ label: 'Date' }, { label: 'Table' }, { label: 'Stakes' }, { label: 'Game' },
          { label: 'Hands', cls: 'num' }, { label: 'Buy-in', cls: 'num' }, { label: 'Cash-out', cls: 'num' },
          { label: 'Rake', cls: 'num' }, { label: 'P&L', cls: 'num' }, { label: '', cls: 'mid' }],
        rows: MEMBER_RING_HISTORY.map(r => ({
          cells: [r.date, primaryCell(esc(r.table)), `<span class="id">${esc(r.stakes)}</span>`, badge(r.game, 'neutral'),
            n(r.hands), n(r.buyin), r.cashout == null ? '<span class="muted">…</span>' : n(r.cashout),
            num(r.rake), money(r.pnl), r.live ? liveBadge() : '']
        })),
        foot: ['<strong>Total</strong>', '', '', '',
          n(MEMBER_RING_HISTORY.reduce((a, r) => a + r.hands, 0)),
          n(MEMBER_RING_HISTORY.reduce((a, r) => a + r.buyin, 0)),
          n(MEMBER_RING_HISTORY.reduce((a, r) => a + (r.cashout || 0), 0)),
          n(MEMBER_RING_HISTORY.reduce((a, r) => a + r.rake, 0)),
          money(MEMBER_RING_HISTORY.reduce((a, r) => a + r.pnl, 0)), '']
      })
    });

  const tourneyHistory = card({
        body: dataTable({
      cols: [{ label: 'Date' }, { label: 'Tournament' }, { label: 'Game' }, { label: 'Buy-in' },
        { label: 'Entries', cls: 'num' }, { label: 'Finish' }, { label: 'Prize', cls: 'num' }, { label: 'P&L', cls: 'num' }],
      rows: MEMBER_TOURNEY_HISTORY.map(r => ({
        cells: [r.date, primaryCell(esc(r.name)), badge(r.game, 'neutral'), `<span class="id">${esc(r.buyin)}</span>`,
          n(r.entries), esc(r.finish), num(r.prize), money(r.pnl)]
      })),
      foot: ['<strong>Total</strong>', '', '', '', '', '',
        n(MEMBER_TOURNEY_HISTORY.reduce((a, r) => a + r.prize, 0)),
        money(MEMBER_TOURNEY_HISTORY.reduce((a, r) => a + r.pnl, 0))]
    })
  });

  const balanceHistory = card({
        hint: 'Every change to this member\'s chip balance',
    body: dataTable({
      cols: [{ label: 'Date / time' }, { label: 'Actioned by' }, { label: 'Direction', cls: 'mid' },
        { label: 'Amount', cls: 'num' }, { label: 'Starting', cls: 'num' }, { label: 'Ending', cls: 'num' }, { label: 'Note' }],
      rows: MEMBER_BALANCE_HISTORY.map(r => ({
        cells: [r.when, primaryCell(esc(r.by), esc(r.byRole)),
          badge(r.dir === 'sent' ? 'Sent' : 'Reclaimed', r.dir === 'sent' ? 'pos' : 'neg'),
          `<span class="${r.dir === 'sent' ? 'pos' : 'neg'}">${r.dir === 'sent' ? '+' : '−'}${n(r.amount)}</span>`,
          n(r.start), n(r.end), r.note ? `<span class="muted">${esc(r.note)}</span>` : '<span class="muted">—</span>']
      }))
    })
  }) + note(`From the member's point of view chips <em>sent</em> to them are green (credited) and <em>reclaimed</em> is red — the inverse of the club-side log, where a send is a debt to the club.`, 'info');

  const ticketHistory = card({
        hint: 'Tournament Tickets can arrive from any club in the union',
    body: dataTable({
      cols: [{ label: 'Date / time' }, { label: 'Ticket' }, { label: 'Specified by' },
        { label: 'Value', cls: 'num' }, { label: 'Sent by' }, { label: 'Expires' }, { label: 'Status', cls: 'mid' }],
      rows: MEMBER_TICKET_HISTORY.map(r => ({
        cells: [r.when, primaryCell(esc(r.ticket)), badge(r.spec, r.spec === 'Value' ? 'info' : 'neutral'),
          n(r.value), esc(r.from), esc(r.expires), statusBadge(r.status)]
      }))
    })
  });

  const loginHistory =
    card({
            body: dataTable({
        cols: [{ label: 'Date / time' }, { label: 'Device' }, { label: 'Platform' },
          { label: 'IP address' }, { label: 'Location' }, { label: 'Result', cls: 'mid' }],
        rows: MEMBER_LOGIN_HISTORY.map(r => ({
          cells: [r.when, primaryCell(esc(r.device)), esc(r.platform), `<span class="id">${esc(r.ip)}</span>`,
            esc(r.loc), badge(r.result, r.result === 'Success' ? 'pos' : 'neg')]
        }))
      })
    });

  const downline = note(
      `<strong>Downline</strong> is everyone beneath this member in the hierarchy — the people whose chips they control, whose game data they see, and whose stakes they can set. Always scoped to their own club.`, 'info')
    + card({
      title: `Downline · ${n(m.downline)} members`,
      hint: m.role === 'Owner' || m.role === 'Manager' ? 'Owners and Managers have the whole club downstream' : 'Only members personally recruited or assigned',
      body: dataTable({
        cols: [{ label: 'Member' }, { label: 'Role' }, { label: 'Chips', cls: 'num' },
          { label: 'Hands', cls: 'num' }, { label: 'P&L', cls: 'num' }, { label: 'Own downline', cls: 'num' }, { label: 'Last active' }],
        rows: MEMBER_DOWNLINE.map(d => ({
          href: memberByNick(d.nick) ? `#/activity/members/${d.nick}` : null,
          cells: [primaryCell(esc(d.nick)), roleTag(d.role), n(d.chips), n(d.hands), money(d.pnl),
            d.members ? n(d.members) : '<span class="muted">—</span>', esc(d.lastActive)]
        })),
        empty: 'This member has no downline.'
      })
    });

  const initials = m.nick.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase();

  /* ── Persistent profile header ──────────────────────────────────
     Identity, current-state figures, and the handful of editable
     fields — all of it always on screen. Devices and Linked accounts
     are linked figures that open the ClubGG-style popups. There is no
     Profile tab: nothing here belongs behind one. */
  const profile = `
    <div class="profile">
      <div class="profile-top">
        <div class="entity-avatar">${esc(initials)}</div>
        <div class="profile-ident">
          <div class="entity-name">${esc(m.nick)}${roleTag(m.role)}${m.linked ? badge(`${m.linked} linked`, 'warn') : ''}</div>
          <div class="entity-meta">
            Member ID ${esc(m.id)} ·
            <a class="rowlink" href="#/activity/clubs/${m.club}">${esc(clubName(m.club))}</a> ·
            joined ${esc(m.joined)} ·
            upline ${m.upline === '—' ? '<span class="muted">none</span>' : `<a class="rowlink" href="#/activity/members/${esc(m.upline)}">${esc(m.upline)}</a>`}
          </div>
          <!-- Alias and note sit with the name: together they are the answer
               to "who is this person", which is what the header is for. -->
          <div class="ident-fields">
            <div class="pf">
              <label class="pf-label">Alias — member-written</label>
              <input value="${esc(m.alias)}" placeholder="Not set">
            </div>
            <div class="pf">
              <label class="pf-label">Private note — only you see this</label>
              <textarea rows="2" placeholder="Add a note…">${esc(m.notes)}</textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-figures">
        ${figure('Club chips', n(m.chips))}
        ${figure('Credits', m.credits ? `<span class="gold">${n(m.credits)}</span>` : '<span class="muted">—</span>')}
        ${figure('Last login', esc(m.lastLogin.split(',')[0]), m.lastLogin.split(', ')[1])}
        ${linkedFigure('Devices used', n(MEMBER_DEVICES.length), 'devices', 'view device IDs')}
        ${linkedFigure('Linked accounts', m.linked ? `<span class="neg">${n(m.linked)}</span>` : '0', 'linked', m.linked ? 'shared device' : 'none detected')}
      </div>

      <div class="profile-fields">
        <div class="pf">
          <label class="pf-label">Role</label>
          <select><option>${esc(m.role)}</option>${ROLE_OPTIONS.slice(1).filter(r => r !== m.role).map(r => `<option>${esc(r)}</option>`).join('')}</select>
        </div>
        <div class="pf">
          <label class="pf-label">Portal access</label>
          <div class="pf-static">${toggle(m.bo, m.bo ? 'Granted' : 'Not granted')}</div>
        </div>
        <div class="pf">
          <label class="pf-label">Chat</label>
          <div class="pf-static">${toggle(true, 'Enabled')}</div>
        </div>
        <div class="pf">
          <label class="pf-label">Membership</label>
          <div class="pf-static">${btn('Remove from club', { sm: true, kind: 'danger' })}</div>
        </div>
      </div>
    </div>`;

  /* Period activity — distinct from the current-state figures above. */
  const summary = stats([
    { label: 'Games', value: n(m.games) },
    { label: 'Hands', value: n(m.hands) },
    { label: 'Rake', value: n(m.rake) },
    { label: 'Fees', value: n(m.fees) },
    { label: 'P&L', value: money(m.pnl, { sign: false }) }
  ]);

  const dateBar = `
    <div class="daterange">
      <div class="field">
        <label class="field-label">Date range</label>
        <select>${DATE_PRESETS.map(d => `<option>${esc(d)}</option>`).join('')}</select>
      </div>
      <div class="pf-static">${exportBtn()}</div>
      <span class="daterange-note">Date range applies to the summary and every tab below</span>
    </div>`;

  return profile
    + note(`<strong>Scoped to activity, history and security.</strong> Stop Limits and Stakes are set on
      <a href="#/restrictions/member-stop-limits">Member Stop Limits</a> and <a href="#/restrictions/member-stakes">Member Stakes</a>, not here.`, 'accent', '↗')
    + dateBar
    + summary
    + tabs([
      { label: 'Ring Games', html: ringHistory },
      { label: 'Tournaments', html: tourneyHistory },
      { label: 'Balance', html: balanceHistory },
      { label: 'Tickets', html: ticketHistory },
      { label: 'Logins', html: loginHistory },
      { label: 'Downline', html: downline }
    ]);
};

/* ═══════════════════════════════════════════════════════════════════
   MODALS — linked from the profile header, mirroring ClubGG's popups
   ═══════════════════════════════════════════════════════════════════ */

const MODALS = {
  devices: () => modal({
    title: 'Device ID List',
    meta: `Showing 1 to ${MEMBER_DEVICES.length} of ${MEMBER_DEVICES.length} entries`,
    body: dataTable({
      cols: [{ label: 'No.', cls: 'num' }, { label: 'Last login date' }, { label: 'Platform' }, { label: 'Device ID' }],
      rows: MEMBER_DEVICES.map(d => ({
        cells: [n(d.no), esc(d.when), badge(d.platform, 'neutral'), `<span class="id">${esc(d.id)}</span>`]
      }))
    })
  }),

  linked: () => {
    const total = LINKED_ACCOUNTS.reduce((a, g) => a + g.accounts.length, 0);
    /* Hand-built so the device cell can span its account group, the way
       ClubGG shows it — one device, many accounts seen on it. */
    const rows = LINKED_ACCOUNTS.map(g => g.accounts.map((a, i) => `
      <tr>
        ${i === 0 ? `<td class="rowgroup" rowspan="${g.accounts.length}"><span class="id">${esc(g.device)}</span></td>
                     <td class="rowgroup" rowspan="${g.accounts.length}">${badge(g.platform, 'neutral')}</td>` : ''}
        <td><span class="id">${esc(a.uid)}</span></td>
        <td>${memberByNick(a.nick)
              ? `<a class="rowlink" href="#/activity/members/${esc(a.nick)}">${esc(a.nick)}</a>`
              : esc(a.nick)}</td>
        <td>${esc(a.date)}</td>
        <td><span class="id">${esc(a.ip)}</span></td>
        <td>${esc(a.loc)}</td>
        <td class="num">${n(a.logins)}</td>
      </tr>`).join('')).join('');

    return modal({
      title: 'Linked Accounts',
      meta: `Showing 1 to ${total} of ${total} entries · other accounts seen on the same device`,
      body: `<div class="table-scroll"><table class="data">
        <thead>
          <tr>
            <th rowspan="2">Device ID</th><th rowspan="2">Platform</th>
            <th rowspan="2">UID</th><th rowspan="2">Nickname</th>
            <th class="group" colspan="3">Recent login</th>
            <th rowspan="2" class="num">Login count</th>
          </tr>
          <tr><th>Date</th><th>IP</th><th>Location</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table></div>`
    });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   2 · POLICING & RESTRICTIONS
   ═══════════════════════════════════════════════════════════════════ */

/* ── Club Stop Limits ─────────────────────────────────────────────── */
PAGES['restrictions/club-stop-limits'] = () => {
  const rows = CLUB_STOP_LIMITS.map(s => {
    const c = clubById(s.club);
    const week = s.weekRing + (s.tourneyCounts ? s.weekTourney : 0);
    const cap = week >= 0 ? s.winLimit : s.lossLimit;
    return {
      cells: [
        primaryCell(`<a class="rowlink" href="#/activity/clubs/${s.club}">${esc(c.name)}</a>${c.isMasterClub ? ' ' + badge('Master club', 'gold') : ''}`, 'Club ID ' + esc(s.club)),
        s.winLimit == null ? '<span class="muted">Not set</span>' : rangeCell([s.winLimit, s.lossLimit], { group: true }),
        money(s.weekRing),
        num(s.weekTourney),
        `<div class="mid">${toggle(s.tourneyCounts)}</div>`,
        cap ? meter(week, cap, `${n(Math.abs(week))} of ${n(cap)} ${week >= 0 ? 'win' : 'loss'}`) : '<span class="muted">—</span>',
        statusBadge(s.status),
        esc(s.setBy),
        esc(s.updated),
        s.status === 'Suspended'
          ? `<span class="inline-actions">${btn('Re-approve', { sm: true, kind: 'primary' })}${btn('Reset', { sm: true })}</span>`
          : editCell(btn('Reset', { sm: true, kind: 'danger' }))
      ]
    };
  });

  return pageHead({
    title: 'Club Stop Limits',
    sub: `Every club's weekly win and loss limit in one editable list — ClubGG's <strong>Weekly Club Stop Limit</strong>, minus the "Weekly" now that the same control exists at member tier.
          When a limit trips, the club is suspended: no new buy-ins or rebuys until the union re-approves it. Players already in a session may finish.`,
    actions: [exportBtn(), btn('Set limits for a club', { kind: 'primary' })]
  })
  + note(`<strong>Visibility fix.</strong> A club's own Owner and Manager can see their limits here — <em>including non-master clubs</em>. ClubGG restricts this view to the Union Owner and Manager, which forces every other club to ask for their own numbers off-product.`, 'accent', '✓')
  + stats([
    { label: 'Clubs with limits', value: `${n(CLUB_STOP_LIMITS.filter(s => s.winLimit != null).length)} / ${n(CLUB_STOP_LIMITS.length)}` },
    { label: 'Suspended now', value: `<span class="neg">${n(CLUB_STOP_LIMITS.filter(s => s.status === 'Suspended').length)}</span>`, meta: 'awaiting re-approval' },
    { label: 'Tournament fees counted', value: `${n(CLUB_STOP_LIMITS.filter(s => s.tourneyCounts).length)} clubs` },
    { label: 'Week resets', value: 'Mon 00:00 PT', meta: 'in 2d 9h' }
  ])
  + filters([
    { label: 'Search', type: 'search', placeholder: 'Club name or ID…', grow: true },
    { label: 'Status', type: 'select', options: ['All statuses', 'Active', 'Suspended', 'No limit'] },
    { label: 'Week', type: 'select', options: ['This week', 'Last week', '2 weeks ago'] }
  ])
  + card({
    title: 'Weekly win / loss limits',
    hint: 'Win limit – loss limit',
    body: dataTable({
      cols: [
        { label: 'Club' }, { label: 'Win – loss limit' }, { label: 'Ring P&L, week', cls: 'num' },
        { label: 'Tourney, week', cls: 'num' }, { label: 'Fees count', cls: 'mid' },
        { label: 'Progress' }, { label: 'Status', cls: 'mid' }, { label: 'Set by' }, { label: 'Updated' }, { label: '', cls: 'sticky-end' }
      ],
      rows
    })
  })
  + note(`Triggering a limit notifies nobody — it silently blocks new buy-ins. That is ClubGG's behaviour today and it is worth deciding whether we keep it.`, 'warn', '⚠');
};

/* ── Club Stakes (New) ────────────────────────────── */
PAGES['restrictions/club-stakes'] = () => {
  const rows = CLUB_RESTRICTIONS.map(r => {
    const c = clubById(r.club);
    return {
      cells: [
        primaryCell(`<a class="rowlink" href="#/activity/clubs/${r.club}">${esc(c.name)}</a>${c.isMasterClub ? ' ' + badge('Master club', 'gold') : ''}`, 'Club ID ' + esc(r.club)),
        ...RING_TYPES.map(g => rangeCell(r.blinds[g], { unit: 'BB' })),
        rangeCell(r.mtt, { group: true }),
        editCell()
      ]
    };
  });

  /* No summary cards: this is a settings table, not a report. Nothing here
     is a number worth aggregating. */
  return pageHead({
    title: 'Club Stakes',
    isNew: true,
    sub: `Min and max blinds per ring-game type, and min/max tournament buy-in, set per club. The Union Owner sets a <strong>ceiling</strong>; the club's own Owner or Manager then narrows within it — they can never widen it.`
  })
  + note(`<strong>New page, not a new capability.</strong> ClubGG already does all of this — the union can restrict clubs and members, and a club can restrict its own members. What is new is <em>where it lives</em>: these controls are pulled out of buried detail pages and given one standalone, cross-club page. Contrast <a href="#/restrictions/member-stop-limits">Member Stop Limits</a>, which is a capability ClubGG genuinely lacks.`, 'new', '✦')
  + filters([
    { label: 'Search', type: 'search', placeholder: 'Club name or ID…', grow: true },
    { label: 'Ceiling', type: 'select', options: ['Any', 'Set', 'Not set'] }
  ])
  + card({
    title: 'Stakes ceilings',
    hint: 'Ring games in big blinds · tournaments in buy-in. Blank means no union ceiling — the club sets its own',
    body: dataTable({
      cols: [{ label: 'Club' }, ...RING_TYPES.map(g => ({ label: g })), { label: 'MTT buy-in' }, { label: '', cls: 'sticky-end' }],
      rows
    })
  });
};

/* ── Member Stop Limits (New) ─────────────────────────────────────── */
PAGES['restrictions/member-stop-limits'] = () => {
  const rows = MEMBER_STOP_LIMITS.map(s => {
    const cap = s.weekPnl >= 0 ? s.winLimit : s.lossLimit;
    return {
      cells: [
        primaryCell(`<a class="rowlink" href="#/activity/members/${esc(s.nick)}">${esc(s.nick)}</a>`, esc(clubName(s.club))),
        roleTag(s.role),
        rangeCell([s.winLimit, s.lossLimit], { group: true }),
        money(s.weekPnl),
        meter(s.weekPnl, cap, `${n(Math.abs(s.weekPnl))} of ${n(cap)} ${s.weekPnl >= 0 ? 'win' : 'loss'}`),
        s.cascades ? `${n(s.cascades)} downstream` : '<span class="muted">none</span>',
        `<span class="muted">${n(s.clubCeiling)}</span>`,
        statusBadge(s.status),
        esc(s.setBy),
        s.status === 'Suspended'
          ? `<span class="inline-actions">${btn('Re-approve', { sm: true, kind: 'primary' })}${btn('Reset', { sm: true })}</span>`
          : editCell(btn('Reset', { sm: true, kind: 'danger' }))
      ]
    };
  });

  return pageHead({
    title: 'Member Stop Limits',
    isNew: true,
    sub: `Weekly win and loss limits for individual members, agents and super agents. A limit set here <strong>cascades to that person's whole downstream funnel</strong>, and is always narrowed within their club's limit if one exists.`,
    actions: [exportBtn(), btn('Set a limit', { kind: 'primary' })]
  })
  + note(`<strong>A genuinely new capability.</strong> ClubGG has stop limits at club tier only, so this cannot be done today at all. Adding the member tier is what makes this symmetrical — every control now exists at both tiers, in one place.`, 'new', '✦')
  + stats([
    { label: 'Members with limits', value: n(MEMBER_STOP_LIMITS.length), meta: 'across 4 clubs' },
    { label: 'Suspended now', value: `<span class="neg">${n(MEMBER_STOP_LIMITS.filter(s => s.status === 'Suspended').length)}</span>` },
    { label: 'Near limit', value: `<span class="warn">${n(MEMBER_STOP_LIMITS.filter(s => s.status === 'Near limit').length)}</span>`, meta: 'over 80% of cap' },
    { label: 'Members affected', value: n(MEMBER_STOP_LIMITS.reduce((a, s) => a + s.cascades, 0) + MEMBER_STOP_LIMITS.length), meta: 'including cascaded downlines' }
  ])
  + filters([
    { label: 'Search', type: 'search', placeholder: 'Nickname or member ID…', grow: true },
    { label: 'Club', type: 'select', options: clubOptions() },
    { label: 'Role', type: 'select', options: ROLE_OPTIONS },
    { label: 'Status', type: 'select', options: ['All statuses', 'Active', 'Near limit', 'Suspended'] },
    { label: 'Week', type: 'select', options: ['This week', 'Last week', '2 weeks ago'] }
  ])
  + card({
    title: 'Weekly win / loss limits',
    hint: 'Only members with a limit set appear here',
    body: dataTable({
      cols: [
        { label: 'Member' }, { label: 'Role' }, { label: 'Win – loss limit' }, { label: 'P&L, week', cls: 'num' },
        { label: 'Progress' }, { label: 'Cascades to' }, { label: 'Club ceiling', cls: 'num' },
        { label: 'Status', cls: 'mid' }, { label: 'Set by' }, { label: '', cls: 'sticky-end' }
      ],
      rows
    })
  });
};

/* ── Member Stakes ────────────────────────────────── */
PAGES['restrictions/member-stakes'] = () => {
  /* Cascade reach sits under the role, not in its own column — it is a
     property of being agent-tier, and is blank for a Player. */
  const roleCell = r => roleTag(r.role)
    + (r.cascades ? `<span class="cell-sub">cascades to ${n(r.cascades)}</span>` : '');

  const rows = MEMBER_RESTRICTIONS.map(r => ({
    cells: [
      primaryCell(`<a class="rowlink" href="#/activity/members/${esc(r.nick)}">${esc(r.nick)}</a>`, esc(clubName(r.club))),
      roleCell(r),
      ...RING_TYPES.map((g, i) => rangeCell(r.blinds[g], { unit: 'BB', ceiling: i === 0 ? r.ceiling : '' })),
      rangeCell(r.mtt, { group: true }),
      editCell()
    ]
  }));

  return pageHead({
    title: 'Member Stakes',
    sub: `Min and max blinds per ring-game type, and min/max tournament buy-in, per member. ClubGG calls this <strong>Restrict Access to Game</strong>. Every range is narrowed within whatever ceiling the club — or the member's own upline — has already set.`
  })
  + note(`A Super Agent or Agent can set these for their own downline only, and <strong>never looser than their own upline's ceiling</strong>. The ceiling in force is shown under each member's NLH range, and how far a setting cascades is shown under their role.`, 'info')
  + filters([
    { label: 'Search', type: 'search', placeholder: 'Nickname or member ID…', grow: true },
    { label: 'Club', type: 'select', options: clubOptions() },
    { label: 'Role', type: 'select', options: ROLE_OPTIONS }
  ])
  + card({
    title: 'Stakes per member',
    hint: 'Ring games in big blinds · tournaments in buy-in. Set independently per variant',
    body: dataTable({
      cols: [{ label: 'Member' }, { label: 'Role' }, ...RING_TYPES.map(g => ({ label: g })),
        { label: 'MTT buy-in' }, { label: '', cls: 'sticky-end' }],
      rows
    })
  });
};

/* ═══════════════════════════════════════════════════════════════════
   3 · CHIPS & CREDITS  (standalone, no category)
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Amount + confirmation rail. Before committing a transfer you need three
 * numbers per recipient: what they hold now, what is changing, and what
 * they will hold after. A bare running total does not tell you that.
 * `recipients` is [{ name, current }].
 */
const transferPanel = ({ unit, amount, recipients, action = 'Send' }) => card({
  title: 'Amount',
  body: `
    <div class="field" style="margin-bottom:10px">
      <label class="field-label">${esc(unit)} per recipient</label>
      <input value="${n(amount)}">
    </div>
    ${seg(['Add', 'Subtract', 'Set to'], 0)}
    <div class="card-hint" style="margin-top:7px">Add or subtract a specific amount, rather than only overwriting an absolute balance.</div>

    <hr class="hr">
    <div class="dl-label" style="margin-bottom:6px">Confirm — ${n(recipients.length)} selected</div>
    <div class="table-scroll"><table class="data confirm">
      <thead><tr><th>Recipient</th><th class="num">Now</th><th class="num">Change</th><th class="num">After</th></tr></thead>
      <tbody>
        ${recipients.map(r => `<tr>
          <td>${esc(r.name)}</td>
          <td class="num muted">${n(r.current)}</td>
          <td class="num pos">+${n(amount)}</td>
          <td class="num"><strong>${n(r.current + amount)}</strong></td>
        </tr>`).join('')}
      </tbody>
      <tfoot><tr>
        <td><strong>Total change</strong></td><td></td>
        <td class="num pos">+${n(amount * recipients.length)}</td><td></td>
      </tr></tfoot>
    </table></div>

    <div style="display:flex;gap:7px;margin-top:12px">
      ${btn(action, { kind: 'primary' })}${btn('Reclaim', {})}
    </div>
    <div class="card-hint" style="margin-top:8px">Reclaim flips the change negative and recalculates. Nothing here persists in the prototype.</div>`
});

/** Dispersed-of-allocated in one cell — the two numbers are one idea. */
const dispersedCell = (out, total) =>
  meter(out, total, `${n(out)} of ${n(total)} dispersed`);

const AGENT_TIER = ['Super Agent', 'Agent'];
const isAgentTier = nick => AGENT_TIER.includes(((memberByNick(nick) || {}).role));

/**
 * Transfer history for one page. Split by what moved, not by tier:
 * 'credits' covers union→club credits and credits down to agents,
 * 'chips' covers chips and tickets landing on ordinary members.
 */
const chipHistory = mode => {
  const rows = CHIP_LOG.filter(r => mode === 'credits'
    ? r.scope === 'Club' || isAgentTier(r.recipient)
    : r.scope === 'Member' && !isAgentTier(r.recipient));

  return filters([
    { label: 'Date range', type: 'select', options: DATE_PRESETS },
    { label: 'Value type', type: 'select', options: mode === 'credits' ? ['All types', 'Credits', 'Chips'] : ['All types', 'Chips', 'Tournament Ticket'] },
    { label: 'Recipient', type: 'select', options: mode === 'credits' ? ['Everyone', ...CLUBS.map(c => c.name), ...MEMBERS.filter(m => AGENT_TIER.includes(m.role)).map(m => m.nick)] : ['Everyone', ...MEMBERS.filter(m => !AGENT_TIER.includes(m.role)).map(m => m.nick)] },
    { label: 'Direction', type: 'select', options: ['Sent & reclaimed', 'Sent only', 'Reclaimed only'] }
  ], [exportBtn()])
  + card({
    title: 'Transfer history',
    hint: mode === 'credits' ? 'Credits issued to clubs and down to agents' : 'Chips and tickets sent to or reclaimed from members',
    body: dataTable({
      cols: [{ label: 'Date / time' }, { label: 'Sender' }, { label: 'Recipient' }, { label: 'Type' },
        { label: 'Direction', cls: 'mid' }, { label: 'Amount', cls: 'num' },
        { label: 'Starting', cls: 'num' }, { label: 'Ending', cls: 'num' }],
      rows: rows.map(r => ({
        cells: [r.when, primaryCell(esc(r.sender), esc(r.senderRole)),
          r.scope === 'Club'
            ? `<a class="rowlink" href="#/activity/clubs/${(CLUBS.find(c => c.name === r.recipient) || {}).id || ''}">${esc(r.recipient)}</a>`
            : `<a class="rowlink" href="#/activity/members/${esc(r.recipient)}">${esc(r.recipient)}</a>`,
          badge(r.type, r.type === 'Credits' ? 'gold' : r.type === 'Tournament Ticket' ? 'info' : 'neutral')
            + (r.ticket ? `<span class="cell-sub">${esc(r.ticket)}</span>` : ''),
          badge(r.dir === 'sent' ? 'Sent' : 'Reclaimed', r.dir === 'sent' ? 'neg' : 'pos'),
          n(r.amount), num(r.start), num(r.end)]
      })),
      empty: 'No transfers in the selected period.'
    })
  });
};

/* ── Club & Agent Credits ─────────────────────────────────────────── */
/* ClubGG's Union Counter (union → club) and Agent Counter (credits to the
   agents inside your own club) are the same act at two tiers, so they sit
   on one page as two recipient scopes. */
PAGES['chips/credits'] = () => {
  const clubsPanel = `
    <div class="scope-strip">
      ${badge('Union → Club', 'gold')}
      <span>Union Credits are the one value that moves <strong>across</strong> the union. Everything below club tier stays inside a single club.</span>
    </div>
    ${filters([
      { label: 'Search', type: 'search', placeholder: 'Club name or ID…', grow: true },
      { label: 'Status', type: 'select', options: ['All statuses', 'Active', 'Suspended'] }
    ])}
    <div class="picker">
      ${card({
        hint: `${n(CLUBS.length)} clubs · credits dispersed is what the club has pushed out to its own members`,
        body: dataTable({
          cols: [{ label: '', cls: 'mid' }, { label: 'Club' }, { label: 'Status', cls: 'mid' },
            { label: 'Members', cls: 'num' }, { label: 'Credits dispersed' }],
          rows: CLUBS.map((c, i) => ({
            cells: [checkbox(i < 2),
              primaryCell(esc(c.name) + (c.isMasterClub ? ' ' + badge('Master club', 'gold') : ''), 'Club ID ' + esc(c.id) + ' · owner ' + esc(c.owner)),
              statusBadge(c.status),
              n(c.managers + c.superAgents + c.agents + c.players + 1),
              dispersedCell(c.chipsOut, c.credits)]
          }))
        }),
        flush: true
      })}
      <div>
        ${transferPanel({
          unit: 'Credits', amount: 250_000, action: 'Send credits',
          recipients: CLUBS.slice(0, 2).map(c => ({ name: c.name, current: c.credits }))
        })}
      </div>
    </div>`;

  /* — Agents (credits to the agent tier inside your own club) — */
  const ownClub = clubById(UNION.masterClubId);
  const agents = MEMBERS.filter(m => m.club === UNION.masterClubId && AGENT_TIER.includes(m.role));
  const alloc = nick => CHIP_BUDGET.agentAllocations.find(a => a.nick === nick) || {};

  const agentsPanel = `
    <div class="scope-strip">
      ${badge('Club-scoped', 'neutral')}
      <span>Credits to the Super Agents and Agents inside <strong>${esc(ownClub.name)}</strong> — ClubGG's <strong>Agent Counter</strong>. An agent can only pass these down their own downline.</span>
    </div>
    ${filters([
      { label: 'Search', type: 'search', placeholder: 'Nickname or member ID…', grow: true },
      { label: 'Club context', type: 'select', options: [`${ownClub.name} · ${ownClub.id}`, '— locked to one club —'] },
      { label: 'Role', type: 'select', options: ['Super Agent & Agent', 'Super Agent', 'Agent'] }
    ])}
    <div class="picker">
      ${card({
        hint: `${n(agents.length)} agents in ${esc(ownClub.name)} · same columns as Clubs, with role in place of status and downline in place of members`,
        body: dataTable({
          cols: [{ label: '', cls: 'mid' }, { label: 'Agent' }, { label: 'Role', cls: 'mid' },
            { label: 'Downline', cls: 'num' }, { label: 'Credits dispersed' }],
          rows: agents.map((m, i) => {
            const a = alloc(m.nick);
            return {
              cells: [checkbox(i === 0),
                primaryCell(esc(m.nick), (m.alias ? esc(m.alias) : 'no alias') + ' · upline ' + esc(m.upline)),
                roleTag(m.role),
                n(m.downline),
                a.budget ? dispersedCell(a.spent, a.budget) : '<span class="muted">no allocation</span>']
            };
          }),
          empty: 'No agent-tier members in this club.'
        }),
        flush: true
      })}
      <div>
        ${transferPanel({
          unit: 'Credits', amount: 50_000, action: 'Send credits',
          recipients: agents.slice(0, 1).map(m => ({ name: m.nick, current: (alloc(m.nick).budget || 0) }))
        })}
        ${card({
          hint: 'Allowance model',
          body: `
            <div class="dl-label">${esc(ownClub.name)} — budget from the union</div>
            ${dispersedCell(CHIP_BUDGET.clubSpent, CHIP_BUDGET.clubBudget)}
            <div class="card-hint" style="margin-top:9px">A union grants each club a budget; Owners and Managers allocate a slice of it to Agents and Super Agents, capping how much each can send to their own downline.</div>`
        })}
      </div>
    </div>`;

  return pageHead({
    title: 'Club & Agent Credits',
    sub: `Issue or reclaim credits — to a club from the union, or to an agent from their club. Replaces ClubGG's <strong>Union Counter</strong> and <strong>Agent Counter</strong>, which are the same flow at two tiers.`,
    actions: [btn('Union settings')]
  })
  + note(`<strong>Union Credits are the only value that crosses club lines.</strong> Credits to agents stay inside their own club, and chips to ordinary members are handled on <a href="#/chips/members">Member Chips</a>. A union can issue as many credits as it likes — what matters is what is outstanding, below.`, 'accent', '⇄')
  + stats([
    { label: 'Outstanding club credits', value: `<span class="gold">${n(CLUBS.reduce((a, c) => a + c.credits, 0))}</span>`, meta: `held by ${n(CLUBS.length)} clubs` },
    { label: 'Outstanding member chips', value: n(CLUBS.reduce((a, c) => a + c.chipsOut, 0)), meta: 'dispersed by clubs to members' },
    { label: 'Allocated to agents', value: n(CHIP_BUDGET.agentAllocations.reduce((a, x) => a + x.budget, 0)), meta: `${n(CHIP_BUDGET.agentAllocations.length)} agents union-wide` },
    { label: 'Suspended clubs', value: `<span class="neg">${n(CLUBS.filter(c => c.status === 'Suspended').length)}</span>`, meta: 'cannot be issued credits' }
  ])
  + tabs([
    { label: 'Clubs', html: clubsPanel },
    { label: 'Agents', html: agentsPanel },
    { label: 'History', html: chipHistory('credits') }
  ]);
};

/* ── Member Chips ─────────────────────────────────────────────────── */
PAGES['chips/members'] = () => {
  const ownClub = clubById(UNION.masterClubId);
  const ownRoster = MEMBERS.filter(m => m.club === UNION.masterClubId);

  const membersPanel = `
    <div class="scope-strip">
      ${badge('Club-scoped', 'neutral')}
      <span><strong>Chips &amp; Credits never cross club lines.</strong> This list is ${esc(ownClub.name)}'s roster only — switch club context to send elsewhere.</span>
    </div>
    ${filters([
      { label: 'Search', type: 'search', placeholder: 'Nickname or member ID…', grow: true },
      { label: 'Club context', type: 'select', options: [`${ownClub.name} · ${ownClub.id}`, '— locked to one club —'] },
      { label: 'Role', type: 'select', options: ROLE_OPTIONS }
    ])}
    <div class="picker">
      ${card({
        hint: `${n(ownRoster.length)} of ${n(ownClub.players + ownClub.agents + ownClub.superAgents + ownClub.managers + 1)} in ${esc(ownClub.name)}`,
        body: dataTable({
          cols: [{ label: '', cls: 'mid' }, { label: 'Member' }, { label: 'Role', cls: 'mid' },
            { label: 'Downline', cls: 'num' }, { label: 'Current chips', cls: 'num' }, { label: 'Last active' }],
          rows: ownRoster.map((m, i) => ({
            cells: [checkbox(i === 1 || i === 4),
              primaryCell(esc(m.nick), (m.alias ? esc(m.alias) : 'no alias') + (m.upline === '—' ? '' : ' · upline ' + esc(m.upline))),
              roleTag(m.role),
              m.downline ? n(m.downline) : '<span class="muted">—</span>',
              n(m.chips), esc(m.lastLogin.split(',')[0])]
          }))
        }),
        flush: true
      })}
      <div>
        ${transferPanel({
          unit: 'Chips', amount: 5_000, action: 'Send chips',
          recipients: [ownRoster[1], ownRoster[4]].filter(Boolean).map(m => ({ name: m.nick, current: m.chips }))
        })}
        ${card({
          hint: 'Allowance model',
          body: `
            <div class="dl-label">${esc(ownClub.name)} — budget from the union</div>
            ${dispersedCell(CHIP_BUDGET.clubSpent, CHIP_BUDGET.clubBudget)}
            <div class="card-hint" style="margin-top:9px">Sends here draw down the club's budget. How that budget is carved up between agents is set on <a class="rowlink" href="#/chips/credits">Club &amp; Agent Credits</a>.</div>`
        })}
      </div>
    </div>`;

  /* — Tournament Ticket (union-wide) — */
  const ticketPanel = `
    <div class="scope-strip">
      ${badge('Union-wide', 'info')}
      <span><strong>Tournament Tickets are the exception</strong> — recipients can be any member in any club in the union. Note the Club filter below is not locked.</span>
    </div>
    ${filters([
      { label: 'Search', type: 'search', placeholder: 'Nickname or member ID…', grow: true },
      { label: 'Club', type: 'select', options: clubOptions('All clubs in the union') },
      { label: 'Role', type: 'select', options: ROLE_OPTIONS }
    ])}
    <div class="picker">
      ${card({
        title: 'Recipients across the union',
        hint: `${n(MEMBERS.length)} members from ${n(CLUBS.length)} clubs`,
        body: dataTable({
          cols: [{ label: '', cls: 'mid' }, { label: 'Member' }, { label: 'Club' }, { label: 'Role' },
            { label: 'Tickets held', cls: 'num' }, { label: 'Last active' }],
          rows: MEMBERS.map((m, i) => ({
            cells: [checkbox(i === 8 || i === 11), primaryCell(esc(m.nick), m.alias ? esc(m.alias) : '<span class="muted">no alias</span>'),
              `<span class="muted">${esc(clubName(m.club))}</span>`, roleTag(m.role),
              n(i % 3), esc(m.lastLogin.split(',')[0])]
          }))
        }),
        flush: true
      })}
      <div>
        ${card({
          title: 'Ticket',
          body: `
            <div class="dl-label" style="margin-bottom:5px">Specify by</div>
            ${seg(['A specific tournament', 'A value'], 0)}
            <div style="margin-top:12px">
              <div class="field" style="margin-bottom:11px">
                <label class="field-label">Tournament</label>
                <select>${TOURNAMENTS.filter(t => t.status !== 'Completed').map(t => `<option>${esc(t.name)} · ${esc(t.buyin)}</option>`).join('')}</select>
              </div>
              <div class="field">
                <label class="field-label">— or — value good at any tournament at or under it</label>
                <input value="110">
              </div>
            </div>
            <div class="card-hint" style="margin-top:8px">Ticket and Voucher are the same object in ClubGG, specified two different ways. One object, one send flow.</div>

            <hr class="hr">
            <div class="dl-label" style="margin-bottom:6px">Confirm — 2 selected</div>
            <div class="table-scroll"><table class="data confirm">
              <thead><tr><th>Recipient</th><th>Club</th><th class="num">Tickets held</th><th class="num">After</th></tr></thead>
              <tbody>
                <tr><td>riverking22</td><td class="muted">Vegas Rail Room</td><td class="num muted">2</td><td class="num"><strong>3</strong></td></tr>
                <tr><td>shortdeck_sy</td><td class="muted">Neon Sunset Club</td><td class="num muted">0</td><td class="num"><strong>1</strong></td></tr>
              </tbody>
              <tfoot><tr><td><strong>Total value</strong></td><td></td><td></td><td class="num">1,100</td></tr></tfoot>
            </table></div>
            <div class="card-hint" style="margin-top:8px">Two clubs — tickets are the one value that reaches members outside your own club.</div>
            <div style="display:flex;gap:7px;margin-top:12px">
              ${btn('Send tickets', { kind: 'primary' })}${btn('Revoke', {})}
            </div>`
        })}
      </div>
    </div>`;

  return pageHead({
    title: 'Member Chips',
    sub: `Send or reclaim club chips, and issue tournament tickets. Replaces ClubGG's <strong>Member Counter</strong> and <strong>Send Ticket</strong> — two pages sharing one pattern: a filterable recipient list, multi-select, a send action, a running total and a history tab, each pointed at a different value type.`,
    actions: [btn('Chip budget')]
  })
  + note(`<strong>Two recipient scopes, on purpose.</strong> Chips are club-scoped — you can only send to or reclaim from your own club's roster. Tournament Tickets are the exception and reach any member in any club in the union. ClubGG's Send Ticket already supports "ALL Clubs" while its Member Counter is silently locked to one club at a time.`, 'accent', '⇄')
  + stats([
    { label: 'Chips outstanding', value: n(MEMBERS.reduce((a, m) => a + m.chips, 0)), meta: 'held by members union-wide' },
    { label: 'Club budget left', value: n(CHIP_BUDGET.clubBudget - CHIP_BUDGET.clubSpent), meta: `of ${n(CHIP_BUDGET.clubBudget)} granted` },
    { label: 'Tickets live', value: n(MEMBER_TICKET_HISTORY.filter(t => t.status === 'Unused').length), meta: 'unused, not expired' },
    { label: 'Roster in context', value: n(ownRoster.length), meta: esc(ownClub.name) }
  ])
  + tabs([
    { label: 'Chips', html: membersPanel },
    { label: 'Tournament Ticket', html: ticketPanel },
    { label: 'History', html: chipHistory('chips') }
  ]);
};

/* ═══════════════════════════════════════════════════════════════════
   4 · GAMES
   ═══════════════════════════════════════════════════════════════════ */

PAGES['games/ring'] = () => {
  const live = RING_GAMES.filter(g => g.status === 'Live');
  return pageHead({
    title: 'Ring Games',
    sub: `Cash tables across the union. Create, monitor and disband tables directly from the portal — not only from inside a club on mobile.`,
    actions: [exportBtn(), btn('Create table', { kind: 'primary' })]
  })
  + stats([
    { label: 'Live tables', value: n(live.length), meta: `${n(live.reduce((a, g) => a + g.players, 0))} players seated` },
    { label: 'Hands', value: n(RING_GAMES.reduce((a, g) => a + g.hands, 0)), meta: 'selected period' },
    { label: 'Rake', value: n(RING_GAMES.reduce((a, g) => a + (g.rake || 0), 0)) },
    { label: 'Insurance', value: n(RING_GAMES.reduce((a, g) => a + g.insurance, 0)), meta: `EV cashout ${money(RING_GAMES.reduce((a, g) => a + g.ev, 0), { sign: false })}` },
    { label: 'BBJ contribution', value: n(RING_GAMES.reduce((a, g) => a + g.bbj, 0)) }
  ])
  + filters([
    { label: 'Search', type: 'search', placeholder: 'Table name…', grow: true },
    { label: 'Date range', type: 'select', options: DATE_PRESETS },
    { label: 'Club', type: 'select', options: clubOptions() },
    { label: 'Game', type: 'select', options: ['All games', ...RING_TYPES] },
    { label: 'Blinds', type: 'select', options: ['All blinds', '0.25 / 0.5', '0.5 / 1', '1 / 2', '2 / 4', '5 / 10'] },
    { label: 'Status', type: 'select', options: ['All statuses', 'Live', 'Waiting', 'Closed'] },
    { label: 'Created by', type: 'select', options: ['Any', 'Manual', 'Template', 'Recurring', 'Auto-waiting'] }
  ])
  + card({
    title: 'Tables',
    hint: 'Live rows refresh automatically in the real product',
    body: dataTable({
      cols: [{ label: 'Table' }, { label: 'Club' }, { label: 'Game' }, { label: 'Blinds' }, { label: 'Buy-in' },
        { label: 'Seats' }, { label: 'Players', cls: 'num' }, { label: 'Hands', cls: 'num' }, { label: 'Rake', cls: 'num' },
        { label: 'Insurance', cls: 'num' }, { label: 'EV cashout', cls: 'num' }, { label: 'BBJ', cls: 'num' },
        { label: 'Status', cls: 'mid' }, { label: '' }],
      rows: RING_GAMES.map(g => ({
        cells: [primaryCell(esc(g.table), 'opened ' + esc(g.opened) + ' · ' + esc(g.created)),
          `<a class="rowlink" href="#/activity/clubs/${g.club}">${esc(clubName(g.club))}</a>`,
          badge(g.game, 'neutral'), `<span class="id">${esc(g.blinds)}</span>`, `<span class="id">${esc(g.buyin)}</span>`,
          esc(g.seats), n(g.players), n(g.hands),
          g.rake == null ? '<span class="muted">N/A</span>' : num(g.rake),
          num(g.insurance), money(g.ev), num(g.bbj), statusBadge(g.status),
          g.status === 'Live' || g.status === 'Waiting' ? actionCell('View', 'Disband') : actionCell('View')]
      }))
    })
  })
  + note(`Tables show <strong>N/A</strong> for rake where the club has rake set to 0 — Aces Over Kings runs rake-free while it builds a roster.`, 'info');
};

PAGES['games/mtt'] = () => {
  const pending = TOURNAMENTS.filter(t => t.status === 'Pending approval');
  return pageHead({
    title: 'Tournaments',
    sub: `Multi-table tournaments across the union. Create them here, or approve the ones a club with <strong>Authority to Create Union Game</strong> has requested.`,
    badges: pending.length ? [badge(`${pending.length} pending approval`, 'warn')] : [],
    actions: [exportBtn(), btn('Create tournament', { kind: 'primary' })]
  })
  + stats([
    { label: 'Running', value: n(TOURNAMENTS.filter(t => t.status === 'Running').length) },
    { label: 'Registering', value: n(TOURNAMENTS.filter(t => t.status === 'Registering').length) },
    { label: 'Entries', value: n(682), meta: 'selected period' },
    { label: 'Guaranteed', value: n(TOURNAMENTS.reduce((a, t) => a + t.guarantee, 0)) },
    { label: 'Prizes paid', value: n(TOURNAMENTS.reduce((a, t) => a + t.prize, 0)) }
  ])
  + filters([
    { label: 'Search', type: 'search', placeholder: 'Tournament name…', grow: true },
    { label: 'Date range', type: 'select', options: DATE_PRESETS },
    { label: 'Club', type: 'select', options: clubOptions() },
    { label: 'Game', type: 'select', options: ['All games', ...RING_TYPES] },
    { label: 'Type', type: 'select', options: ['All types', 'Freezeout', 'Re-entry', 'Turbo', 'Bounty', 'Satellite', 'Early Bird', 'Freeroll', 'Multi-day'] },
    { label: 'Status', type: 'select', options: ['All statuses', 'Scheduled', 'Registering', 'Running', 'Completed', 'Pending approval'] }
  ])
  + card({
    title: 'Tournaments',
    body: dataTable({
      cols: [{ label: 'Tournament' }, { label: 'Club' }, { label: 'Game' }, { label: 'Type' }, { label: 'Start' },
        { label: 'Registration' }, { label: 'Buy-in' }, { label: 'Re-entry' }, { label: 'Entries', cls: 'num' },
        { label: 'Guarantee', cls: 'num' }, { label: 'Prize paid', cls: 'num' }, { label: 'Status', cls: 'mid' }, { label: '' }],
      rows: TOURNAMENTS.map(t => ({
        cells: [primaryCell(esc(t.name)),
          `<a class="rowlink" href="#/activity/clubs/${t.club}">${esc(clubName(t.club))}</a>`,
          badge(t.game, 'neutral'), esc(t.type), esc(t.start), `<span class="muted">${esc(t.reg)}</span>`,
          `<span class="id">${esc(t.buyin)}</span>`, esc(t.reentry), `<span class="id">${esc(t.entries)}</span>`,
          t.guarantee ? n(t.guarantee) : '<span class="muted">—</span>', t.prize ? n(t.prize) : '<span class="muted">—</span>',
          statusBadge(t.status),
          t.status === 'Pending approval' ? `<span class="inline-actions">${btn('Approve', { sm: true, kind: 'primary' })}${btn('Deny', { sm: true, kind: 'danger' })}</span>`
            : t.status === 'Running' ? actionCell('View', 'Pause')
            : t.status === 'Completed' ? actionCell('View')
            : actionCell('View', 'Cancel')]
      }))
    })
  })
  + note(`Pause, cancel and delete are stage-dependent — what is available changes once registration closes and again once the tournament is in the money.`, 'info');
};

PAGES['games/sng'] = () => pageHead({
  title: 'SNGs',
  sub: `Sit-and-go tournaments: they start as soon as the seats fill. Entries, results and creation.`,
  actions: [exportBtn(), btn('Create SNG', { kind: 'primary' })]
})
+ stats([
  { label: 'Filling', value: n(SNGS.filter(s => s.status === 'Filling').length) },
  { label: 'Running', value: n(SNGS.filter(s => s.status === 'Running').length) },
  { label: 'Completed', value: n(SNGS.filter(s => s.status === 'Completed').length), meta: 'selected period' },
  { label: 'Prize pools', value: n(SNGS.reduce((a, s) => a + s.prize, 0)) }
])
+ filters([
  { label: 'Search', type: 'search', placeholder: 'SNG name…', grow: true },
  { label: 'Date range', type: 'select', options: DATE_PRESETS },
  { label: 'Club', type: 'select', options: clubOptions() },
  { label: 'Game', type: 'select', options: ['All games', ...RING_TYPES] },
  { label: 'Structure', type: 'select', options: ['All structures', 'Slow', 'Standard', 'Turbo', 'Hyper-turbo'] },
  { label: 'Status', type: 'select', options: ['All statuses', 'Filling', 'Running', 'Completed'] }
])
+ card({
  title: 'Sit & go events',
  body: dataTable({
    cols: [{ label: 'SNG' }, { label: 'Club' }, { label: 'Game' }, { label: 'Buy-in' }, { label: 'Seats', cls: 'num' },
      { label: 'Entries' }, { label: 'Structure' }, { label: 'Prize pool', cls: 'num' }, { label: 'Winner' },
      { label: 'Status', cls: 'mid' }, { label: '' }],
    rows: SNGS.map(s => ({
      cells: [primaryCell(esc(s.name)),
        `<a class="rowlink" href="#/activity/clubs/${s.club}">${esc(clubName(s.club))}</a>`,
        badge(s.game, 'neutral'), `<span class="id">${esc(s.buyin)}</span>`, esc(s.seats),
        `<span class="id">${esc(s.entries)}</span>`, esc(s.structure), n(s.prize),
        s.winner === '—' ? '<span class="muted">—</span>' : `<a class="rowlink" href="#/activity/members/${esc(s.winner)}">${esc(s.winner)}</a>`,
        statusBadge(s.status),
        s.status === 'Completed' ? actionCell('View') : actionCell('View', 'Cancel')]
    }))
  })
});

PAGES['games/templates'] = () => pageHead({
  title: 'Templates',
  sub: `Reusable table and tournament presets. This is configuration, not live games — it sits here alongside the game types it templates.`,
  actions: [btn('New template', { kind: 'primary' })]
})
+ note(`Identity settings — game type, blinds and ante, buy-in range, table size, rake — always show on the card. Everything else appears as a badge <strong>only when it differs from the default</strong>, so a glance tells you what is unusual about a template.`, 'info')
+ stats([
  { label: 'Templates', value: n(TEMPLATES.length), meta: `${n(TEMPLATES.filter(t => t.kind === 'Ring').length)} ring · ${n(TEMPLATES.filter(t => t.kind !== 'Ring').length)} tournament` },
  { label: 'Tables created', value: n(TEMPLATES.reduce((a, t) => a + t.usedBy, 0)), meta: 'from templates, all time' },
  { label: 'Most used', value: 'SNG 6-Max Hyper', meta: '47 games' },
  { label: 'Game types', value: 'NLH · PLO4 · PLO5', meta: 'plus MTT and SNG presets' }
])
+ filters([
  { label: 'Search', type: 'search', placeholder: 'Template name…', grow: true },
  { label: 'Kind', type: 'select', options: ['All kinds', 'Ring', 'MTT', 'SNG'] },
  { label: 'Game', type: 'select', options: ['All games', ...RING_TYPES] },
  { label: 'Owner', type: 'select', options: ['Anyone', 'kurtis_c', 'mgr_wallace', 'a_tanaka', 'l_chen'] }
])
+ card({
  title: 'All templates',
  body: `<div class="tpl-grid">
    ${TEMPLATES.map(t => `
      <div class="tpl">
        <div class="tpl-top">
          ${badge(t.game, 'accent')}
          ${badge(t.kind, 'neutral')}
        </div>
        <div class="tpl-name" style="margin-top:8px">${esc(t.name)}</div>
        <div class="tpl-stats">
          <span><b>${esc(t.blinds)}</b>${t.ante ? ` <span class="muted">(${esc(t.ante)} ante)</span>` : ''}</span>
          <span>${esc(t.buyin)} · ${esc(t.seats)}</span>
          <span class="muted">Rake ${esc(t.rake)}</span>
        </div>
        <div class="tpl-badges">${t.badges.map(b => badge(b, 'info')).join('')}</div>
        <div class="tpl-foot">
          <span>${n(t.usedBy)} games · ${esc(t.owner)}</span>
          ${btn('Use', { sm: true, kind: 'primary' })}
        </div>
      </div>`).join('')}
  </div>`
});

PAGES['games/recurring'] = () => pageHead({
  title: 'Recurring Games',
  sub: `Schedule tables and tournaments to open on a repeating cadence, so the same game does not have to be set up by hand every week.`,
  actions: [btn('New schedule', { kind: 'primary' })]
})
+ stats([
  { label: 'Schedules', value: n(RECURRING.length), meta: `${n(RECURRING.filter(r => r.enabled).length)} enabled` },
  { label: 'Next to open', value: 'Sunday Major', meta: 'today 18:00 PT' },
  { label: 'Games opened', value: n(RECURRING.reduce((a, r) => a + r.runs, 0)), meta: 'all time' },
  { label: 'Paused', value: n(RECURRING.filter(r => !r.enabled).length), meta: 'Neon Sunset — club suspended' }
])
+ filters([
  { label: 'Search', type: 'search', placeholder: 'Schedule name…', grow: true },
  { label: 'Club', type: 'select', options: clubOptions() },
  { label: 'Kind', type: 'select', options: ['All kinds', 'Ring Game', 'Tournament', 'SNG'] },
  { label: 'State', type: 'select', options: ['All', 'Enabled', 'Paused'] }
])
+ card({
  title: 'Schedules',
  body: dataTable({
    cols: [{ label: 'Schedule' }, { label: 'Kind' }, { label: 'Template' }, { label: 'Club' },
      { label: 'Cadence' }, { label: 'Next run' }, { label: 'Last run' }, { label: 'Runs', cls: 'num' },
      { label: 'Enabled', cls: 'mid' }, { label: '' }],
    rows: RECURRING.map(r => ({
      cells: [primaryCell(esc(r.name)), badge(r.kind, 'neutral'),
        `<span class="muted">${esc(r.template)}</span>`,
        `<a class="rowlink" href="#/activity/clubs/${r.club}">${esc(clubName(r.club))}</a>`,
        esc(r.cadence),
        r.next === '—' ? '<span class="muted">paused</span>' : esc(r.next),
        esc(r.lastRun), n(r.runs), toggle(r.enabled), actionCell('Edit', 'Delete')]
    }))
  })
});

/* ═══════════════════════════════════════════════════════════════════
   5 · PROMOTIONS
   ═══════════════════════════════════════════════════════════════════ */

PAGES['promos/leaderboards'] = () => pageHead({
  title: 'Leaderboards',
  sub: `Point-based competitions with configurable rewards — chips, membership or merchandise. Scope a leaderboard to the whole union or to a single club.`,
  actions: [exportBtn(), btn('New leaderboard', { kind: 'primary' })]
})
+ stats([
  { label: 'Running', value: n(LEADERBOARDS.filter(l => l.status === 'Running').length) },
  { label: 'Participants', value: n(LEADERBOARDS.reduce((a, l) => a + l.participants, 0)), meta: 'across all campaigns' },
  { label: 'Scheduled', value: n(LEADERBOARDS.filter(l => l.status === 'Scheduled').length), meta: 'August rake race' },
  { label: 'Chips committed', value: n(155_000), meta: 'across running campaigns' }
])
+ filters([
  { label: 'Search', type: 'search', placeholder: 'Leaderboard name…', grow: true },
  { label: 'Date range', type: 'select', options: DATE_PRESETS },
  { label: 'Type', type: 'select', options: ['All types', 'Ring Games', 'Tournaments'] },
  { label: 'Scope', type: 'select', options: clubOptions('All clubs') },
  { label: 'Status', type: 'select', options: ['All statuses', 'Running', 'Scheduled', 'Completed'] }
])
+ card({
  title: 'Campaigns',
  body: dataTable({
    cols: [{ label: 'Leaderboard' }, { label: 'Type' }, { label: 'Period' }, { label: 'Scope' },
      { label: 'Participants', cls: 'num' }, { label: 'Reward' }, { label: 'Leader' }, { label: 'Status', cls: 'mid' }, { label: '' }],
    rows: LEADERBOARDS.map(l => ({
      cells: [primaryCell(esc(l.name)), badge(l.kind, 'neutral'), esc(l.period),
        `<span class="muted">${esc(l.scope)}</span>`, n(l.participants), esc(l.reward),
        l.top === '—' ? '<span class="muted">—</span>' : `<a class="rowlink" href="#/activity/members/${esc(l.top)}">${esc(l.top)}</a>`,
        statusBadge(l.status),
        l.status === 'Completed' ? actionCell('View') : actionCell('Edit', 'View')]
    }))
  })
});

PAGES['promos/bbj'] = () => pageHead({
  title: 'Bad Beat Jackpot',
  sub: `On or off, the qualifying rules, the size of the pool, and the payout history. A slice of every raked pot feeds the pool; losing with a very strong hand wins it.`,
  actions: [exportBtn(), btn('Top up pool')]
})
+ `<div class="jackpot">
    <div>
      <div class="stat-label">Current pool</div>
      <div class="jackpot-amount">${n(BBJ.pool)}</div>
      <div class="stat-meta">Last hit ${esc(BBJ.lastHit)} · reseeded at ${n(BBJ.seed)}</div>
    </div>
    <div style="margin-left:auto">${toggle(BBJ.enabled, 'Jackpot enabled union-wide')}</div>
  </div>
  <div style="height:14px"></div>`
+ `<div class="cols">
    ${card({
      title: 'Rules',
      body: dl([
        { label: 'Qualifying hand', value: esc(BBJ.qualifier) },
        { label: 'Contribution', value: esc(BBJ.contribution) },
        { label: 'Minimum players dealt in', value: n(BBJ.minPlayers) },
        { label: 'Hole card requirement', value: esc(BBJ.minHands) },
        { label: 'Payout split', value: esc(BBJ.split) },
        { label: 'Reseed after a hit', value: n(BBJ.seed) }
      ]) + `<hr class="hr">
        <div style="display:flex;flex-direction:column;gap:9px">
          ${toggle(true, 'Include tournament tables')}
          ${toggle(false, 'Require both hole cards to play')}
          ${toggle(true, 'Show pool size in the club lobby')}
        </div>
        <div style="margin-top:12px">${btn('Save rules', { kind: 'primary', sm: true })}</div>`
    })}
    ${card({
      title: 'Contribution by club',
      hint: 'Selected period',
      body: dataTable({
        cols: [{ label: 'Club' }, { label: 'Contributed', cls: 'num' }, { label: 'Share' }],
        rows: CLUBS.filter(c => c.bbj > 0).map(c => ({
          cells: [`<a class="rowlink" href="#/activity/clubs/${c.id}">${esc(c.name)}</a>`, n(c.bbj),
            meter(c.bbj, CLUBS.reduce((a, x) => a + x.bbj, 0), `${Math.round(c.bbj / CLUBS.reduce((a, x) => a + x.bbj, 0) * 100)}%`)]
        }))
      }),
      flush: true
    })}
  </div>
  <div style="height:14px"></div>`
+ card({
  title: 'Payout history',
  body: dataTable({
    cols: [{ label: 'Date / time' }, { label: 'Club' }, { label: 'Table' }, { label: 'Bad beat' },
      { label: 'Losing hand' }, { label: 'Winner' }, { label: 'Payout', cls: 'num' }],
    rows: BBJ.payouts.map(p => ({
      cells: [esc(p.when), `<a class="rowlink" href="#/activity/clubs/${p.club}">${esc(clubName(p.club))}</a>`,
        esc(p.table), `<a class="rowlink" href="#/activity/members/${esc(p.loser)}">${esc(p.loser)}</a>`,
        badge(p.hand, 'gold'),
        `<a class="rowlink" href="#/activity/members/${esc(p.winner)}">${esc(p.winner)}</a>`,
        `<span class="gold">${n(p.amount)}</span>`]
    })),
    foot: ['<strong>Total paid</strong>', '', '', '', '', '', `<span class="gold">${n(BBJ.payouts.reduce((a, p) => a + p.amount, 0))}</span>`]
  })
});

PAGES['promos/announcements'] = () => pageHead({
  title: 'Announcements',
  sub: `Post a message to clubs — content, display period, and which clubs see it. Was <strong>Notice Setting</strong> in ClubGG.`,
  actions: [btn('New announcement', { kind: 'primary' })]
})
+ note(`This is for union and club heads to post promos and announcements <strong>to their members</strong>. It is not the same thing as the app messaging mechanisms we have as the product for reaching app users — worth keeping the two clearly apart.`, 'warn', '⚠')
+ stats([
  { label: 'Live now', value: n(ANNOUNCEMENTS.filter(a => a.status === 'Live').length) },
  { label: 'Scheduled', value: n(ANNOUNCEMENTS.filter(a => a.status === 'Scheduled').length) },
  { label: 'Views', value: n(ANNOUNCEMENTS.reduce((a, x) => a + x.views, 0)), meta: 'all announcements' },
  { label: 'Delivery', value: 'TBD', meta: 'ClubGG uses a full-screen interstitial' }
])
+ filters([
  { label: 'Search', type: 'search', placeholder: 'Title or content…', grow: true },
  { label: 'Target clubs', type: 'select', options: clubOptions('All clubs') },
  { label: 'Status', type: 'select', options: ['All statuses', 'Live', 'Scheduled', 'Expired'] }
])
+ card({
  title: 'Announcements',
  flush: true,
  body: `<div class="list-rows">
    ${ANNOUNCEMENTS.map(a => `
      <div class="list-row">
        <div class="list-main">
          <div class="list-title">${esc(a.title)}${statusBadge(a.status)}${badge(a.kind, 'neutral')}</div>
          <div class="list-body">${esc(a.body)}</div>
          <div class="list-meta">
            <span>📅 ${esc(a.period)}</span>
            <span>🎯 ${esc(a.targets)}</span>
            <span>👁 ${n(a.views)} views</span>
          </div>
        </div>
        <div class="list-side">
          ${a.status === 'Expired' ? btn('Duplicate', { sm: true }) : btn('Edit', { sm: true })}
          ${btn('Preview', { sm: true })}
        </div>
      </div>`).join('')}
  </div>`
});
