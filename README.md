# Union Admin Portal — click-through prototype

A static, click-through prototype of the proposed **Union Admin Portal** navigation: new IA, new
terminology, one mocked-up screen per nav page. No backend, no build step, no auth, no framework.

Open `index.html` in a browser, or serve the folder over HTTP — either works.

```bash
python3 -m http.server 8000
```

## Deploying

Drag the whole folder into GitHub Pages (or any static host). There is nothing to build. Routing is
hash-based (`#/activity/clubs`), so it works from a subpath and needs no server rewrite rules.

### On visibility

The repo is public so the Pages URL is shareable without anyone needing access. To keep it out of
search results, `index.html` carries a `noindex, nofollow` meta tag — that is the part that actually
works on a project Pages site. `robots.txt` is included too but is inert at a `/<repo>/` path, because
crawlers only read robots.txt from the domain root; see the comments in that file.

**Neither makes the site private.** Anyone with the link can open it, and the source is readable on
github.com. Treat the URL as semi-public and don't put anything in here you wouldn't want seen.

## Files

```
index.html            app shell — sidebar, topbar, page container
assets/css/app.css    all styles; dark and light themes via CSS variables
assets/js/data.js     sample data (fictional)
assets/js/ui.js       HTML-string helpers — tables, cards, badges, filters
assets/js/pages.js    one renderer per nav page + the two detail pages
assets/js/app.js      nav structure, hash router, delegated interactions
```

## Site map

Based on
[Union Admin Portal: Navigation Hierarchy & Terminology](https://clubwpt.atlassian.net/wiki/spaces/CH/pages/1316585496/Union+Admin+Portal+Navigation+Hierarchy+Terminology),
with the nav changes noted underneath.

- **Activity** — Clubs → *Club Detail*, Members → *Member Detail*
- **Restrictions** — Club Stop Limits, Club Stakes **(New)**, Member Stop Limits **(New)**, Member Stakes
- **Chips & Credits** — Club & Agent Credits, Member Chips
- **Games** — Ring Games, Tournaments, SNGs, Templates, Recurring Games
- **Promotions** — Leaderboards, Bad Beat Jackpot, Announcements

Differences from the nav doc, all deliberate:

- **Activity History → Activity** and **Policing & Restrictions → Restrictions.** Shorter, and
  "policing" carried more enforcement connotation than the pages warrant. Route paths follow
  (`#/restrictions/…`).
- **Restrict Game & Access → Stakes.** Both pages set min/max blinds and buy-ins, so "Club Stakes" and
  "Member Stakes" say it in a third of the characters.
- **Chips & Credits splits by what moves, not by tier.** *Club & Agent Credits* covers ClubGG's Union
  Counter (union → club) and Agent Counter (credits to the agents inside your own club) as two tabs of
  one flow. *Member Chips* covers Member Counter and Send Ticket. Tournament Ticket sits with Member
  Chips because its recipients are members.
- **Tournaments, not "Tournaments (MTT)".** One name or the other, not both.
- The left nav has no numbering, no bullets, and no collapsible sections — bold category headers with
  indented links beneath.

Club Detail and Member Detail have **no left-nav entry** — they are reachable only by clicking a row
in their list page. That is the fix for ClubGG's two broken nav items (Club Information loads a blank
shell; Member Information throws "Oh snap! Please click the specific member on the member list").

## What the prototype deliberately gets right

These are the points flagged as load-bearing in the brief and the nav doc:

- **The two "New" badges do not mean the same thing, and each page says which it is.**
  *Member Stop Limits* is a new **capability** — ClubGG has stop limits at club tier only, so this cannot
  be done today at all. *Club Stakes* is a new **page**, not a new capability: ClubGG
  already lets a union restrict clubs and members, and lets a club restrict its own members. What changes
  is where those controls live — pulled out of buried detail pages onto one standalone, cross-club page.
  Worth deciding whether one badge should cover both cases. Everything else in the nav is a rename, a
  merge, or a straight port.
- **Detail pages carry no restriction controls.** Club Detail and Member Detail are scoped to activity,
  history and security. Both show a callout linking out to Restrictions, so a reviewer can
  see the move was intentional rather than an omission.
- **Neither detail page has a Profile tab.** Identity, role, alias, private note, permissions and the
  destructive actions all live in the persistent header. A tab is for switching between histories, not
  for hiding who someone is.
- **Chips & Credits is club-scoped; Tournament Tickets are not.** On Member Chips' Chips tab the
  Members recipient list is locked to one club's roster, and only Union Credits move across the union
  (Union ↔ Club). On the Tournament Ticket tab the Club filter is unlocked and the recipient list spans
  every club. Each tab states its scope in a strip above the list.
- **Club List absorbs Club Revenue** — the same financial columns plus a date-range filter and a totals
  row, so there is no separate Report category.
- **Chips & Credits is two pages, not four.** They replace Union Counter, Agent Counter, Member Counter
  and Send Ticket, which all shared the same pattern: filterable recipient list, multi-select, send
  action, running total, History tab.

## What works when you click

- The portal opens on the **union overview** — the club list, titled with the union name. Clicking
  *Union Admin Portal* top-left returns there from anywhere, and every breadcrumb is rooted in it.
  Categories (Activity, Games, …) organise the left nav only; they never appear in breadcrumbs.
- Row-click drill-down: Clubs → Club Detail, Members → Member Detail
- **Detail pages** put identity, current-state figures and the editable fields in a **persistent header**
  — nothing about who a member is sits behind a tab. Below it, one date range governs the summary *and*
  every tab, so tabs sit under the range they obey rather than above it. Tabs are history only.
- **Devices used** and **Linked accounts** are linked figures in that header. Clicking either opens a
  popup, the way ClubGG surfaces them off Member Information — Device ID List, and Linked Accounts
  grouped by device to show multi-accounting. Nicknames in the popup navigate to that member.
- Tabs on the detail pages and on both Chips & Credits pages
- Cross-links — club names, member nicknames and the restriction callouts all navigate
- Toggle switches, segmented controls and checkboxes flip visually
- Light / dark theme toggle (persists; defaults to your OS preference)
- Breadcrumbs, deep-linkable URLs, browser back/forward
- Narrow-viewport layout with an off-canvas sidebar

Filters, selects and search inputs are **presentational** — they show what controls each screen needs
without filtering the sample data. Buttons show a toast saying they are not wired up, so nothing looks
broken during a walkthrough.

## Out of scope, as agreed

Real auth, real data, persisting write actions, pixel-perfect fidelity to any existing app.

## Sample data

Entirely fictional. One union ("Bellota Labs Union"), 8 clubs, 12 members across five roles
(Owner / Manager / Super Agent / Agent / Player). Club IDs are shown as **6 digits, numbers only** —
the format decided in Union Admin Features, not today's 8-character alphanumeric IDs.

A few rows are set up to exercise edge cases worth looking at:

| Where | What it shows |
| --- | --- |
| Neon Sunset Club | Suspended by a stop-limit trigger — buy-ins blocked pending re-approval |
| Aces Over Kings | Rake set to 0, so rake columns read `N/A` and the club has no union ceiling |
| High Tide Poker | No Authority to Create Union Game — tables run by the master club |
| `sa_ferreira` | Two linked accounts detected; member-level stop limit suspended |
| `riverking22`, `quadqueen` | Near limit — over 80% of their weekly cap |
| Neon Happy Hour | A paused recurring schedule, because its club is suspended |

## Sources

Built from the brief plus these, read directly rather than summarised:

- Union Admin Portal: Navigation Hierarchy & Terminology — Confluence `CH/1316585496` *(primary source)*
- Roles for Club/Union Administration — `CH/962297857`
- Union Admin Features — `CH/1281392641`
- ClubGG Union Web Portal Research — Google Doc `1_aW8zvXjDFp7rSMu-dnQPv48td_SJZB5MPMQcxqOns8`
- Game History — `CH/1145339909` · Members Tab — `CH/1145634818`
- Create Table Settings Reference — `CH/1116733445`

The live ClubGG portal was **not** used — the research doc's page-by-page breakdown covered what
ClubGG does today, so no login was needed. Nothing in this repo reads credentials, and `.env` is
gitignored regardless.

## Terminology

Per the terminology PRD:

- **Owner** replaces ClubGG's **Master** for the role and for a club's owner account. Roles are
  **Owner / Manager / Super Agent / Agent / Player**.
- **Master club** stays as-is — the one club per union whose Owner is the Union Owner. The rename covers
  the role, not the union's primary club, so "master club" and "club Owner" remain distinct terms.
- **Member** is the generic term for anyone in a club. **Player** is only the lowest-tier default role
  someone gets on joining. On the home page the union-wide **Members** stat counts everyone, while the
  per-club role columns are deliberately singular — **Mgr · S.Agent · Agent · Player** — so they read as
  role labels rather than as a second, contradictory headcount.

## One thing in the nav doc worth fixing

**ClubGG's Restrict Game & Access is not member-tier only.** The nav doc says it is, in both the "Why
we're changing this" section and the terminology table ("Restrict Access to Game (member-level, ClubGG)").
In fact ClubGG lets the union restrict both clubs and members, and lets a club restrict its own members.
That matters because it was the stated basis for marking Club Stakes as New — which is why
this prototype now describes that page as a new *place* for existing controls rather than a new
capability.
