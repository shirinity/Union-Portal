/* ===================================================================
   Sample data for the Union Admin Portal prototype.
   Entirely fictional. Nothing here is wired to a real backend.

   Conventions taken from the source docs:
   · Club IDs are 6-digit, numbers only  (Union Admin Features — "Club ID")
   · Roles are Owner / Manager / Super Agent / Agent / Player.
     "Owner" replaces ClubGG's "Master" per the terminology PRD.
   · "Member" is the generic term for anyone in a club; "Player" is only the
     lowest-tier default role someone gets on joining. So a club's member
     count includes its Owner, Managers and Agents; its Player count does not.
   · Every union has exactly one master club; that club's Owner is the Union
     Owner. "Master club" is deliberately kept — the rename to Owner covers
     the role and the club's owner account, not the union's primary club.
   =================================================================== */

const UNION = {
  name: 'Bellota Labs Union',
  masterClubId: '104829',
  unionOwner: 'kurtis_c',
  unionCredits: 4_820_000,
  creditsIssued: 3_147_500,
  asOf: '26 Jul 2026, 14:20 PT'
};

/* ── Clubs ────────────────────────────────────────────────────────── */
const CLUBS = [
  {
    id: '104829', name: 'Bellota Labs Home Game', owner: 'kurtis_c', isMasterClub: true,
    joined: '2025-11-04', credits: 1_240_000, managers: 3, superAgents: 4, agents: 11, players: 214,
    hands: 148_920, rake: 62_480, fees: 9_240, insurance: 4_110, evCashout: -1_860, bbj: 3_720,
    pnl: 58_210, status: 'Active', unionGameAuthority: true, rakePct: '4% · 3 BB cap',
    notes: 'Master club. Highest-volume NLH traffic in the union — flagged as the reference club for the new stop-limit rollout.'
  },
  {
    id: '218847', name: 'Vegas Rail Room', owner: 'd_moreno', isMasterClub: false,
    joined: '2025-12-18', credits: 486_500, managers: 2, superAgents: 3, agents: 8, players: 137,
    hands: 92_340, rake: 38_760, fees: 6_180, insurance: 2_940, evCashout: -1_120, bbj: 2_310,
    pnl: 34_890, status: 'Active', unionGameAuthority: true, rakePct: '4% · 3 BB cap',
    notes: 'Requested union-game authority in Feb; granted. Runs the Tuesday PLO series.'
  },
  {
    id: '337102', name: 'High Tide Poker', owner: 'a_tanaka', isMasterClub: false,
    joined: '2026-01-09', credits: 312_000, managers: 1, superAgents: 2, agents: 6, players: 98,
    hands: 61_070, rake: 24_120, fees: 4_460, insurance: 1_780, evCashout: -640, bbj: 1_530,
    pnl: 22_180, status: 'Active', unionGameAuthority: false, rakePct: '3.5% · 3 BB cap',
    notes: 'Short-deck heavy roster. No union-game authority — all tables run by the master club.'
  },
  {
    id: '415663', name: 'Riverboat Social', owner: 'j_beaumont', isMasterClub: false,
    joined: '2026-02-02', credits: 268_400, managers: 2, superAgents: 1, agents: 5, players: 86,
    hands: 47_650, rake: 18_940, fees: 3_120, insurance: 1_240, evCashout: -410, bbj: 1_180,
    pnl: 17_360, status: 'Active', unionGameAuthority: false, rakePct: '4% · 3 BB cap',
    notes: ''
  },
  {
    id: '552918', name: 'Neon Sunset Club', owner: 'm_kovacs', isMasterClub: false,
    joined: '2026-02-21', credits: 194_800, managers: 1, superAgents: 2, agents: 4, players: 71,
    hands: 38_210, rake: 15_380, fees: 2_640, insurance: 980, evCashout: -300, bbj: 940,
    pnl: 13_970, status: 'Suspended', unionGameAuthority: false, rakePct: '4% · 3 BB cap',
    notes: 'Weekly loss limit tripped 24 Jul — buy-ins blocked pending union re-approval.'
  },
  {
    id: '671245', name: 'Backdoor Straight', owner: 'r_singh', isMasterClub: false,
    joined: '2026-03-14', credits: 148_200, managers: 1, superAgents: 1, agents: 3, players: 58,
    hands: 29_480, rake: 11_640, fees: 1_980, insurance: 720, evCashout: -180, bbj: 690,
    pnl: 10_540, status: 'Active', unionGameAuthority: false, rakePct: '3% · 2 BB cap',
    notes: ''
  },
  {
    id: '780331', name: 'Chip & Chair', owner: 'l_chen', isMasterClub: false,
    joined: '2026-04-28', credits: 96_400, managers: 1, superAgents: 0, agents: 2, players: 41,
    hands: 18_760, rake: 7_240, fees: 1_180, insurance: 430, evCashout: -90, bbj: 410,
    pnl: 6_580, status: 'Active', unionGameAuthority: false, rakePct: '3% · 2 BB cap',
    notes: ''
  },
  {
    id: '896074', name: 'Aces Over Kings', owner: 't_okafor', isMasterClub: false,
    joined: '2026-06-11', credits: 42_800, managers: 1, superAgents: 0, agents: 1, players: 23,
    hands: 8_140, rake: 3_180, fees: 520, insurance: 190, evCashout: -40, bbj: 170,
    pnl: 2_840, status: 'Active', unionGameAuthority: false, rakePct: 'No rake',
    notes: 'Newest club in the union. Rake set to 0 while they build a roster.'
  }
];

const clubById = id => CLUBS.find(c => c.id === id);
const clubName = id => (clubById(id) || {}).name || '—';

/* ── Members ──────────────────────────────────────────────────────── */
const MEMBERS = [
  {
    id: '48120973', nick: 'kurtis_c', alias: 'Kurtis (union head)', club: '104829', role: 'Owner',
    credits: 1_240_000, chips: 86_400, games: 412, hands: 9_840, rake: 4_120, fees: 680, bbj: 240,
    pnl: 18_460, bo: true, lastLogin: '26 Jul 2026, 13:52', devices: 3, linked: 0, upline: '—',
    downline: 214, joined: '2025-11-04',
    notes: 'Union owner. Do not modify role — union ownership derives from master-club ownership.'
  },
  {
    id: '48211044', nick: 'd_moreno', alias: 'Diego — Rail Room', club: '218847', role: 'Owner',
    credits: 486_500, chips: 41_200, games: 288, hands: 7_120, rake: 2_980, fees: 470, bbj: 180,
    pnl: 11_240, bo: true, lastLogin: '26 Jul 2026, 12:08', devices: 2, linked: 0, upline: '—',
    downline: 137, joined: '2025-12-18', notes: ''
  },
  {
    id: '48304517', nick: 'a_tanaka', alias: 'Aiko T.', club: '337102', role: 'Owner',
    credits: 312_000, chips: 28_900, games: 196, hands: 5_240, rake: 1_940, fees: 320, bbj: 120,
    pnl: 7_880, bo: true, lastLogin: '25 Jul 2026, 21:41', devices: 1, linked: 0, upline: '—',
    downline: 98, joined: '2026-01-09', notes: ''
  },
  {
    id: '48119288', nick: 'mgr_wallace', alias: 'Sam W. — day shift', club: '104829', role: 'Manager',
    credits: 0, chips: 32_600, games: 341, hands: 8_120, rake: 3_410, fees: 540, bbj: 210,
    pnl: -4_280, bo: true, lastLogin: '26 Jul 2026, 14:02', devices: 2, linked: 0, upline: 'kurtis_c',
    downline: 214, joined: '2025-11-19',
    notes: 'Master-club Manager — has Back Office access by default. Union-level parity except Manager creation.'
  },
  {
    id: '48412660', nick: 'sa_delacruz', alias: 'Nina D.', club: '104829', role: 'Super Agent',
    credits: 0, chips: 118_400, games: 264, hands: 6_480, rake: 2_720, fees: 410, bbj: 160,
    pnl: 9_140, bo: false, lastLogin: '26 Jul 2026, 11:37', devices: 2, linked: 1, upline: 'mgr_wallace',
    downline: 34, joined: '2025-12-02', notes: 'Largest downline in the master club.'
  },
  {
    id: '48520381', nick: 'sa_ferreira', alias: 'Bruno F.', club: '218847', role: 'Super Agent',
    credits: 0, chips: 74_900, games: 188, hands: 4_610, rake: 1_880, fees: 290, bbj: 110,
    pnl: -6_320, bo: false, lastLogin: '26 Jul 2026, 09:14', devices: 4, linked: 2, upline: 'd_moreno',
    downline: 22, joined: '2026-01-22',
    notes: 'Two linked accounts surfaced 18 Jul — under review, not actioned.'
  },
  {
    id: '48633905', nick: 'ag_novak', alias: 'Petr N.', club: '104829', role: 'Agent',
    credits: 0, chips: 46_200, games: 142, hands: 3_280, rake: 1_240, fees: 190, bbj: 70,
    pnl: 3_410, bo: false, lastLogin: '25 Jul 2026, 23:58', devices: 1, linked: 0, upline: 'sa_delacruz',
    downline: 9, joined: '2026-02-11', notes: ''
  },
  {
    id: '48701244', nick: 'ag_haddad', alias: 'Yusuf H.', club: '337102', role: 'Agent',
    credits: 0, chips: 21_800, games: 96, hands: 2_140, rake: 780, fees: 120, bbj: 40,
    pnl: -2_180, bo: false, lastLogin: '26 Jul 2026, 08:20', devices: 2, linked: 0, upline: 'a_tanaka',
    downline: 6, joined: '2026-03-08', notes: ''
  },
  {
    id: '48818702', nick: 'riverking22', alias: 'Marcus — Diego\'s friend', club: '218847', role: 'Player',
    credits: 0, chips: 12_400, games: 214, hands: 5_920, rake: 2_180, fees: 340, bbj: 130,
    pnl: 14_680, bo: false, lastLogin: '26 Jul 2026, 13:44', devices: 1, linked: 0, upline: 'sa_ferreira',
    downline: 0, joined: '2026-01-30', notes: 'Consistent winner — flagged for stop-limit review.'
  },
  {
    id: '48904113', nick: 'quadqueen', alias: '', club: '104829', role: 'Player',
    credits: 0, chips: 8_960, games: 178, hands: 4_820, rake: 1_940, fees: 280, bbj: 110,
    pnl: -9_240, bo: false, lastLogin: '26 Jul 2026, 12:51', devices: 3, linked: 1, upline: 'ag_novak',
    downline: 0, joined: '2026-02-14', notes: ''
  },
  {
    id: '49011876', nick: 'donkbet_dan', alias: 'Dan', club: '415663', role: 'Player',
    credits: 0, chips: 3_240, games: 88, hands: 2_010, rake: 720, fees: 110, bbj: 40,
    pnl: -3_860, bo: false, lastLogin: '24 Jul 2026, 19:03', devices: 1, linked: 0, upline: 'j_beaumont',
    downline: 0, joined: '2026-03-19', notes: ''
  },
  {
    id: '49188420', nick: 'shortdeck_sy', alias: 'Sylvie', club: '552918', role: 'Player',
    credits: 0, chips: 0, games: 62, hands: 1_480, rake: 520, fees: 80, bbj: 30,
    pnl: 6_920, bo: false, lastLogin: '24 Jul 2026, 22:17', devices: 2, linked: 0, upline: 'm_kovacs',
    downline: 0, joined: '2026-04-02',
    notes: 'Buy-ins blocked — club-level loss limit tripped, not a member-level restriction.'
  }
];

const memberByNick = n => MEMBERS.find(m => m.nick === n);

/* ── Chip / credit transaction log ────────────────────────────────── */
const CHIP_LOG = [
  { when: '26 Jul 14:02', sender: 'kurtis_c',    senderRole: 'Owner',      recipient: 'Vegas Rail Room',  scope: 'Club',   type: 'Credits',           dir: 'sent',      amount: 250_000, start: 236_500, end: 486_500 },
  { when: '26 Jul 13:40', sender: 'mgr_wallace', senderRole: 'Manager',     recipient: 'quadqueen',        scope: 'Member', type: 'Chips',             dir: 'sent',      amount: 5_000,   start: 3_960,   end: 8_960 },
  { when: '26 Jul 11:18', sender: 'sa_delacruz', senderRole: 'Super Agent', recipient: 'ag_novak',         scope: 'Member', type: 'Chips',             dir: 'sent',      amount: 12_000,  start: 34_200,  end: 46_200 },
  { when: '26 Jul 10:52', sender: 'kurtis_c',    senderRole: 'Owner',      recipient: 'riverking22',      scope: 'Member', type: 'Tournament Ticket', dir: 'sent',      amount: 550,     start: null,    end: null, ticket: 'Sunday Major $500+50' },
  { when: '25 Jul 22:31', sender: 'd_moreno',    senderRole: 'Owner',      recipient: 'sa_ferreira',      scope: 'Member', type: 'Chips',             dir: 'reclaimed', amount: 18_000,  start: 92_900,  end: 74_900 },
  { when: '25 Jul 19:14', sender: 'kurtis_c',    senderRole: 'Owner',      recipient: 'High Tide Poker',  scope: 'Club',   type: 'Credits',           dir: 'sent',      amount: 100_000, start: 212_000, end: 312_000 },
  { when: '25 Jul 16:47', sender: 'a_tanaka',    senderRole: 'Owner',      recipient: 'ag_haddad',        scope: 'Member', type: 'Chips',             dir: 'sent',      amount: 8_000,   start: 13_800,  end: 21_800 },
  { when: '24 Jul 20:09', sender: 'kurtis_c',    senderRole: 'Owner',      recipient: 'Neon Sunset Club', scope: 'Club',   type: 'Credits',           dir: 'reclaimed', amount: 60_000,  start: 254_800, end: 194_800 },
  { when: '24 Jul 15:22', sender: 'mgr_wallace', senderRole: 'Manager',     recipient: 'sa_delacruz',      scope: 'Member', type: 'Chips',             dir: 'sent',      amount: 40_000,  start: 78_400,  end: 118_400 },
  { when: '24 Jul 12:05', sender: 'kurtis_c',    senderRole: 'Owner',      recipient: 'shortdeck_sy',     scope: 'Member', type: 'Tournament Ticket', dir: 'sent',      amount: 110,     start: null,    end: null, ticket: 'Any MTT ≤ $110' }
];

/* ── Restrictions: club stop limits ───────────────────────────────────── */
const CLUB_STOP_LIMITS = [
  { club: '104829', winLimit: 150_000, lossLimit: 150_000, weekRing: 42_180, weekTourney: 6_240, tourneyCounts: true,  status: 'Active',    setBy: 'kurtis_c', updated: '20 Jul 2026' },
  { club: '218847', winLimit: 100_000, lossLimit: 80_000,  weekRing: 28_640, weekTourney: 3_180, tourneyCounts: true,  status: 'Active',    setBy: 'kurtis_c', updated: '20 Jul 2026' },
  { club: '337102', winLimit: 60_000,  lossLimit: 60_000,  weekRing: -14_820, weekTourney: 1_140, tourneyCounts: false, status: 'Active',    setBy: 'kurtis_c', updated: '18 Jul 2026' },
  { club: '415663', winLimit: 50_000,  lossLimit: 50_000,  weekRing: 12_360, weekTourney: 890,   tourneyCounts: true,  status: 'Active',    setBy: 'kurtis_c', updated: '18 Jul 2026' },
  { club: '552918', winLimit: 40_000,  lossLimit: 30_000,  weekRing: -31_480, weekTourney: 620,   tourneyCounts: true,  status: 'Suspended', setBy: 'kurtis_c', updated: '24 Jul 2026' },
  { club: '671245', winLimit: 30_000,  lossLimit: 30_000,  weekRing: 8_940,  weekTourney: 410,   tourneyCounts: false, status: 'Active',    setBy: 'kurtis_c', updated: '11 Jul 2026' },
  { club: '780331', winLimit: 25_000,  lossLimit: 25_000,  weekRing: 4_120,  weekTourney: 180,   tourneyCounts: false, status: 'Active',    setBy: 'kurtis_c', updated: '11 Jul 2026' },
  { club: '896074', winLimit: null,    lossLimit: null,    weekRing: 1_240,  weekTourney: 0,     tourneyCounts: false, status: 'No limit',  setBy: '—',        updated: '—' }
];

/* ── Restrictions: member stop limits (New) ───────────────────────────── */
const MEMBER_STOP_LIMITS = [
  { nick: 'sa_delacruz', club: '104829', role: 'Super Agent', winLimit: 40_000, lossLimit: 40_000, weekPnl: 22_140, cascades: 34, clubCeiling: 150_000, status: 'Active',    setBy: 'kurtis_c',    updated: '22 Jul 2026' },
  { nick: 'ag_novak',    club: '104829', role: 'Agent',       winLimit: 15_000, lossLimit: 15_000, weekPnl: 6_410,  cascades: 9,  clubCeiling: 150_000, status: 'Active',    setBy: 'sa_delacruz', updated: '22 Jul 2026' },
  { nick: 'riverking22', club: '218847', role: 'Player',      winLimit: 20_000, lossLimit: 20_000, weekPnl: 19_680, cascades: 0,  clubCeiling: 100_000, status: 'Near limit', setBy: 'kurtis_c',    updated: '25 Jul 2026' },
  { nick: 'sa_ferreira', club: '218847', role: 'Super Agent', winLimit: 35_000, lossLimit: 25_000, weekPnl: -26_320, cascades: 22, clubCeiling: 100_000, status: 'Suspended', setBy: 'd_moreno',    updated: '25 Jul 2026' },
  { nick: 'ag_haddad',   club: '337102', role: 'Agent',       winLimit: 12_000, lossLimit: 12_000, weekPnl: -2_180, cascades: 6,  clubCeiling: 60_000,  status: 'Active',    setBy: 'a_tanaka',    updated: '19 Jul 2026' },
  { nick: 'quadqueen',   club: '104829', role: 'Player',      winLimit: 10_000, lossLimit: 10_000, weekPnl: -9_240, cascades: 0,  clubCeiling: 150_000, status: 'Near limit', setBy: 'ag_novak',    updated: '24 Jul 2026' },
  { nick: 'shortdeck_sy',club: '552918', role: 'Player',      winLimit: 8_000,  lossLimit: 8_000,  weekPnl: 6_920,  cascades: 0,  clubCeiling: 40_000,  status: 'Active',    setBy: 'm_kovacs',    updated: '17 Jul 2026' }
];

/* ── Restrictions: stakes ─────────────────────────────────────────── */
/* Blinds are min/max big blind per ring game type; mtt is min/max buy-in.
   `sng`, `setBy` and `updated` are kept but not rendered — SNG stakes are
   out of scope until we have SNGs, and the two audit columns were dropped
   to make room for MTT buy-in on the same table. */
const RING_TYPES = ['NLH', 'PLO4', 'PLO5', 'PLO6'];

const CLUB_RESTRICTIONS = [
  { club: '104829', blinds: { NLH: [1, 50],  PLO4: [1, 25],  PLO5: [1, 10],  PLO6: [1, 5] },  mtt: [10, 1_000], sng: [5, 500], setBy: 'kurtis_c', updated: '20 Jul 2026' },
  { club: '218847', blinds: { NLH: [1, 25],  PLO4: [1, 10],  PLO5: [1, 5],   PLO6: [1, 5] },  mtt: [10, 500],   sng: [5, 250], setBy: 'kurtis_c', updated: '20 Jul 2026' },
  { club: '337102', blinds: { NLH: [0.5, 10],PLO4: [0.5, 5], PLO5: [0.5, 5], PLO6: [0.5, 2] },mtt: [5, 250],    sng: [5, 100], setBy: 'kurtis_c', updated: '18 Jul 2026' },
  { club: '415663', blinds: { NLH: [0.5, 10],PLO4: [0.5, 5], PLO5: null,     PLO6: null },    mtt: [5, 250],    sng: [5, 100], setBy: 'kurtis_c', updated: '18 Jul 2026' },
  { club: '552918', blinds: { NLH: [0.5, 5], PLO4: [0.5, 2], PLO5: null,     PLO6: null },    mtt: [5, 100],    sng: [5, 50],  setBy: 'kurtis_c', updated: '24 Jul 2026' },
  { club: '671245', blinds: { NLH: [0.25, 5],PLO4: null,     PLO5: null,     PLO6: null },    mtt: [5, 100],    sng: [5, 50],  setBy: 'kurtis_c', updated: '11 Jul 2026' },
  { club: '780331', blinds: { NLH: [0.25, 2],PLO4: null,     PLO5: null,     PLO6: null },    mtt: [5, 50],     sng: [5, 25],  setBy: 'kurtis_c', updated: '11 Jul 2026' },
  { club: '896074', blinds: { NLH: null,     PLO4: null,     PLO5: null,     PLO6: null },    mtt: null,        sng: null,     setBy: '—',        updated: '—' }
];

const MEMBER_RESTRICTIONS = [
  { nick: 'sa_delacruz',  club: '104829', role: 'Super Agent', blinds: { NLH: [1, 25],   PLO4: [1, 10],  PLO5: [1, 5],  PLO6: null }, mtt: [10, 500], sng: [5, 250], ceiling: 'Club NLH ≤ 50',  cascades: 34, setBy: 'mgr_wallace', updated: '22 Jul 2026' },
  { nick: 'ag_novak',     club: '104829', role: 'Agent',       blinds: { NLH: [1, 10],   PLO4: [1, 5],   PLO5: null,    PLO6: null }, mtt: [10, 250], sng: [5, 100], ceiling: 'Upline ≤ 25',    cascades: 9,  setBy: 'sa_delacruz', updated: '22 Jul 2026' },
  { nick: 'quadqueen',    club: '104829', role: 'Player',      blinds: { NLH: [0.5, 5],  PLO4: null,     PLO5: null,    PLO6: null }, mtt: [5, 100],  sng: [5, 50],  ceiling: 'Upline ≤ 10',    cascades: 0,  setBy: 'ag_novak',    updated: '24 Jul 2026' },
  { nick: 'sa_ferreira',  club: '218847', role: 'Super Agent', blinds: { NLH: [1, 10],   PLO4: [1, 5],   PLO5: null,    PLO6: null }, mtt: [10, 250], sng: [5, 100], ceiling: 'Club NLH ≤ 25',  cascades: 22, setBy: 'd_moreno',    updated: '25 Jul 2026' },
  { nick: 'riverking22',  club: '218847', role: 'Player',      blinds: { NLH: [0.5, 5],  PLO4: null,     PLO5: null,    PLO6: null }, mtt: [5, 100],  sng: [5, 50],  ceiling: 'Upline ≤ 10',    cascades: 0,  setBy: 'sa_ferreira', updated: '25 Jul 2026' },
  { nick: 'ag_haddad',    club: '337102', role: 'Agent',       blinds: { NLH: [0.5, 5],  PLO4: [0.5, 2], PLO5: null,    PLO6: null }, mtt: [5, 100],  sng: [5, 50],  ceiling: 'Club NLH ≤ 10',  cascades: 6,  setBy: 'a_tanaka',    updated: '19 Jul 2026' },
  { nick: 'donkbet_dan',  club: '415663', role: 'Player',      blinds: { NLH: [0.5, 2],  PLO4: null,     PLO5: null,    PLO6: null }, mtt: [5, 50],   sng: [5, 25],  ceiling: 'Club NLH ≤ 10',  cascades: 0,  setBy: 'j_beaumont',  updated: '14 Jul 2026' }
];

/* ── Games: ring ──────────────────────────────────────────────────── */
const RING_GAMES = [
  { table: "Kurtis's Table 4", club: '104829', game: 'NLH',  blinds: '5 / 10',   buyin: '300–1,000', seats: '6-max', players: 6, hands: 412, rake: 1_840, insurance: 210, ev: -60, bbj: 92,  status: 'Live',      opened: '26 Jul 12:04', created: 'Manual' },
  { table: 'Rail Room PLO',    club: '218847', game: 'PLO4', blinds: '2 / 4',    buyin: '120–400',   seats: '6-max', players: 5, hands: 268, rake: 980,   insurance: 140, ev: -40, bbj: 49,  status: 'Live',      opened: '26 Jul 13:18', created: 'Template' },
  { table: 'Friday Night NLH', club: '104829', game: 'NLH',  blinds: '1 / 2',    buyin: '60–200',    seats: '9-max', players: 9, hands: 604, rake: 1_240, insurance: 90,  ev: -20, bbj: 62,  status: 'Live',      opened: '26 Jul 09:40', created: 'Recurring' },
  { table: 'High Tide Short',  club: '337102', game: 'NLH',  blinds: '5 / 5',    buyin: '250–800',   seats: '6-max', players: 4, hands: 188, rake: 720,   insurance: 60,  ev: -10, bbj: 36,  status: 'Live',      opened: '26 Jul 13:52', created: 'Manual' },
  { table: 'Deep Stack 5-10',  club: '104829', game: 'NLH',  blinds: '5 / 10',   buyin: '1,000–3,000', seats: '6-max', players: 0, hands: 892, rake: 3_640, insurance: 410, ev: -120, bbj: 182, status: 'Closed',   opened: '25 Jul 20:10', created: 'Manual' },
  { table: 'PLO5 Splash',      club: '218847', game: 'PLO5', blinds: '1 / 2',    buyin: '80–400',    seats: '8-max', players: 0, hands: 476, rake: 1_420, insurance: 180, ev: -50, bbj: 71,  status: 'Closed',    opened: '25 Jul 18:22', created: 'Template' },
  { table: 'Riverboat Micros', club: '415663', game: 'NLH',  blinds: '0.5 / 1',  buyin: '30–100',    seats: '9-max', players: 0, hands: 318, rake: 410,   insurance: 30,  ev: -10, bbj: 21,  status: 'Closed',    opened: '25 Jul 16:05', created: 'Recurring' },
  { table: 'Chair Game 1',     club: '780331', game: 'NLH',  blinds: '0.25 / 0.5', buyin: '20–60',   seats: '6-max', players: 0, hands: 142, rake: 120,   insurance: 0,   ev: 0,   bbj: 6,   status: 'Closed',    opened: '24 Jul 21:30', created: 'Manual' },
  { table: 'Aces NLH (no rake)', club: '896074', game: 'NLH', blinds: '1 / 2',   buyin: '50–200',    seats: '6-max', players: 3, hands: 96,  rake: null,  insurance: 0,   ev: 0,   bbj: 0,   status: 'Live',      opened: '26 Jul 14:10', created: 'Manual' },
  { table: 'Waiting — PLO6',   club: '104829', game: 'PLO6', blinds: '2 / 4',    buyin: '120–400',   seats: '7-max', players: 1, hands: 0,   rake: 0,     insurance: 0,   ev: 0,   bbj: 0,   status: 'Waiting',   opened: '26 Jul 14:16', created: 'Auto-waiting' }
];

/* ── Games: tournaments (MTT) ─────────────────────────────────────── */
const TOURNAMENTS = [
  { name: 'Sunday Major',          club: '104829', game: 'NLH',  type: 'Freezeout', start: '26 Jul 18:00', reg: '17:30–18:45', buyin: '500 + 50', reentry: '—',      entries: '184 / 500', guarantee: 100_000, prize: 0,       status: 'Registering' },
  { name: 'Tuesday PLO Series #4', club: '218847', game: 'PLO4', type: 'Re-entry',  start: '26 Jul 19:30', reg: '19:00–20:30', buyin: '200 + 20', reentry: '2 max',  entries: '96 / 300',  guarantee: 40_000,  prize: 0,       status: 'Registering' },
  { name: 'Daily Turbo 50',        club: '104829', game: 'NLH',  type: 'Turbo',     start: '26 Jul 14:00', reg: '13:30–14:20', buyin: '50 + 5',   reentry: 'Unlimited', entries: '212',    guarantee: 10_000,  prize: 0,       status: 'Running' },
  { name: 'Bounty Hunter',         club: '104829', game: 'NLH',  type: 'Bounty',    start: '26 Jul 12:00', reg: '11:30–12:45', buyin: '100 + 10', reentry: '1 max',  entries: '148',       guarantee: 15_000,  prize: 0,       status: 'Running' },
  { name: 'Main Event Satellite',  club: '218847', game: 'NLH',  type: 'Satellite', start: '25 Jul 20:00', reg: 'closed',      buyin: '55 + 5',   reentry: '—',      entries: '92',        guarantee: 0,       prize: 4_600,   status: 'Completed' },
  { name: 'High Tide Deepstack',   club: '337102', game: 'NLH',  type: 'Freezeout', start: '25 Jul 19:00', reg: 'closed',      buyin: '250 + 25', reentry: '—',      entries: '64',        guarantee: 15_000,  prize: 16_000,  status: 'Completed' },
  { name: 'Weekend Warm-Up',       class: 'multi', club: '104829', game: 'PLO4', type: 'Multi-day', start: '24 Jul 17:00', reg: 'closed', buyin: '1,000 + 100', reentry: '—', entries: '78', guarantee: 75_000, prize: 78_000, status: 'Completed' },
  { name: 'Riverboat Freeroll',    club: '415663', game: 'NLH',  type: 'Freeroll',  start: '27 Jul 20:00', reg: 'opens 19:30', buyin: 'Free',     reentry: '—',      entries: '0 / 200',   guarantee: 2_000,   prize: 0,       status: 'Scheduled' },
  { name: 'Neon Early Bird',       club: '552918', game: 'NLH',  type: 'Early Bird',start: '27 Jul 18:00', reg: 'opens 17:30', buyin: '100 + 10', reentry: '—',      entries: '0 / 150',   guarantee: 8_000,   prize: 0,       status: 'Pending approval' }
];

/* ── Games: SNGs ──────────────────────────────────────────────────── */
const SNGS = [
  { name: 'NLH 6-Max Hyper',   club: '104829', game: 'NLH',  buyin: '50 + 5',  seats: '6', entries: '4 / 6', structure: 'Hyper-turbo', prize: 300,   status: 'Filling',   winner: '—' },
  { name: 'NLH Heads-Up',      club: '104829', game: 'NLH',  buyin: '100 + 10',seats: '2', entries: '2 / 2', structure: 'Turbo',       prize: 200,   status: 'Running',   winner: '—' },
  { name: 'PLO 9-Max Standard',club: '218847', game: 'PLO4', buyin: '25 + 2',  seats: '9', entries: '9 / 9', structure: 'Standard',    prize: 225,   status: 'Completed', winner: 'riverking22' },
  { name: 'NLH 6-Max Turbo',   club: '337102', game: 'NLH',  buyin: '20 + 2',  seats: '6', entries: '6 / 6', structure: 'Turbo',       prize: 120,   status: 'Completed', winner: 'ag_haddad' },
  { name: 'PLO5 4-Max',        club: '218847', game: 'PLO5', buyin: '50 + 5',  seats: '4', entries: '4 / 4', structure: 'Standard',    prize: 200,   status: 'Completed', winner: 'sa_ferreira' },
  { name: 'Micro 6-Max',       club: '780331', game: 'NLH',  buyin: '5 + 0.5', seats: '6', entries: '1 / 6', structure: 'Turbo',       prize: 30,    status: 'Filling',   winner: '—' },
  { name: 'NLH 9-Max Slow',    club: '415663', game: 'NLH',  buyin: '10 + 1',  seats: '9', entries: '9 / 9', structure: 'Slow',        prize: 90,    status: 'Completed', winner: 'donkbet_dan' }
];

/* ── Games: templates ─────────────────────────────────────────────── */
/* Identity stats always render; the badge row is only non-default settings,
   per the Template Summary Card reference in Create Table Settings. */
const TEMPLATES = [
  { name: 'Friday Night',       kind: 'Ring', game: 'NLH',  blinds: '1 / 2',   ante: null,   buyin: '60–200',    seats: '9-handed', rake: '4% – 3 BB', badges: ['Bomb pots', 'BBJ', 'Auto-extension'], usedBy: 14, owner: 'kurtis_c' },
  { name: 'Deep Stack 5-10',    kind: 'Ring', game: 'NLH',  blinds: '5 / 10',  ante: null,   buyin: '1,000–3,000', seats: '6-handed', rake: '4% – 3 BB', badges: ['RunItX', 'EV Cashout', 'Call time'], usedBy: 9, owner: 'kurtis_c' },
  { name: 'PLO5 Splash',        kind: 'Ring', game: 'PLO5', blinds: '1 / 4',   ante: '0.50', buyin: '120–400',   seats: '8-handed', rake: '4% – 3 BB', badges: ['Straddle', 'Double board', 'BBJ'], usedBy: 6, owner: 'mgr_wallace' },
  { name: 'Short Deck 6-Max',   kind: 'Ring', game: 'NLH',  blinds: '5 / 5',   ante: '1',    buyin: '250–800',   seats: '6-handed', rake: '3.5% – 3 BB', badges: ['Ante all', 'No-rathole'], usedBy: 4, owner: 'a_tanaka' },
  { name: 'Micro Grind',        kind: 'Ring', game: 'NLH',  blinds: '0.25 / 0.5', ante: null,buyin: '20–60',     seats: '6-handed', rake: '3% – 2 BB', badges: ['Chat off'], usedBy: 11, owner: 'l_chen' },
  { name: 'Sunday Major',       kind: 'MTT',  game: 'NLH',  blinds: 'Standard',ante: null,   buyin: '500 + 50',  seats: '9-handed', rake: '10% fee',  badges: ['Late reg 45m', 'Final table deal', 'Multi-day'], usedBy: 22, owner: 'kurtis_c' },
  { name: 'Daily Turbo',        kind: 'MTT',  game: 'NLH',  blinds: 'Turbo',   ante: null,   buyin: '50 + 5',    seats: '9-handed', rake: '10% fee',  badges: ['Unlimited re-entry', 'Recurring'], usedBy: 38, owner: 'mgr_wallace' },
  { name: 'SNG 6-Max Hyper',    kind: 'SNG',  game: 'NLH',  blinds: 'Hyper',   ante: null,   buyin: '50 + 5',    seats: '6-handed', rake: '10% fee',  badges: ['Auto-restart'], usedBy: 47, owner: 'kurtis_c' }
];

/* ── Games: recurring ─────────────────────────────────────────────── */
const RECURRING = [
  { name: 'Friday Night NLH',   kind: 'Ring Game',  template: 'Friday Night',    club: '104829', cadence: 'Weekly · Fri 20:00 PT',        next: '31 Jul 2026, 20:00', lastRun: '24 Jul 2026', runs: 38, enabled: true },
  { name: 'Daily Turbo 50',     kind: 'Tournament', template: 'Daily Turbo',     club: '104829', cadence: 'Daily · 14:00 PT',             next: '27 Jul 2026, 14:00', lastRun: '26 Jul 2026', runs: 214, enabled: true },
  { name: 'Tuesday PLO Series', kind: 'Tournament', template: 'Sunday Major',    club: '218847', cadence: 'Weekly · Tue 19:30 PT',        next: '28 Jul 2026, 19:30', lastRun: '21 Jul 2026', runs: 16, enabled: true },
  { name: 'Riverboat Micros',   kind: 'Ring Game',  template: 'Micro Grind',     club: '415663', cadence: 'Daily · 16:00 PT',             next: '27 Jul 2026, 16:00', lastRun: '25 Jul 2026', runs: 92, enabled: true },
  { name: 'Sunday Major',       kind: 'Tournament', template: 'Sunday Major',    club: '104829', cadence: 'Weekly · Sun 18:00 PT',        next: '26 Jul 2026, 18:00', lastRun: '19 Jul 2026', runs: 34, enabled: true },
  { name: 'Weekend SNG Batch',  kind: 'SNG',        template: 'SNG 6-Max Hyper', club: '104829', cadence: 'Sat & Sun · every 2h',         next: '27 Jul 2026, 10:00', lastRun: '26 Jul 2026', runs: 168, enabled: true },
  { name: 'Neon Happy Hour',    kind: 'Ring Game',  template: 'Micro Grind',     club: '552918', cadence: 'Weekdays · 17:00 PT',          next: '—',                  lastRun: '23 Jul 2026', runs: 44, enabled: false }
];

/* ── Promotions ───────────────────────────────────────────────────── */
const LEADERBOARDS = [
  { name: 'July Rake Race',        kind: 'Ring Games',  period: '1 Jul – 31 Jul 2026',  scope: 'All clubs',            participants: 428, reward: 'Chips — 50,000 pool',        top: 'sa_delacruz', status: 'Running' },
  { name: 'PLO Points Challenge',  kind: 'Ring Games',  period: '14 Jul – 28 Jul 2026', scope: 'Vegas Rail Room',      participants: 96,  reward: 'Chips — 15,000 pool',        top: 'riverking22', status: 'Running' },
  { name: 'MTT Series Points',     kind: 'Tournaments', period: '1 Jul – 31 Aug 2026',  scope: 'All clubs',            participants: 212, reward: 'Merchandise + $1,000 ticket', top: 'kurtis_c',    status: 'Running' },
  { name: 'Summer Volume Sprint',  kind: 'Ring Games',  period: '1 Jun – 30 Jun 2026',  scope: 'All clubs',            participants: 391, reward: 'Chips — 40,000 pool',        top: 'quadqueen',   status: 'Completed' },
  { name: 'New Club Kickoff',      kind: 'Ring Games',  period: '11 Jun – 11 Jul 2026', scope: 'Aces Over Kings',      participants: 23,  reward: 'Membership — 3 months',      top: 't_okafor',    status: 'Completed' },
  { name: 'August Rake Race',      kind: 'Ring Games',  period: '1 Aug – 31 Aug 2026',  scope: 'All clubs',            participants: 0,   reward: 'Chips — 50,000 pool',        top: '—',           status: 'Scheduled' }
];

const BBJ = {
  enabled: true,
  pool: 284_610,
  contribution: '0.5% of every raked pot',
  qualifier: 'Quad 2s or better, beaten',
  minPlayers: 5,
  minHands: '2 hole cards must play',
  split: '50% loser · 30% winner · 20% table',
  lastHit: '18 Jul 2026',
  seed: 25_000,
  payouts: [
    { when: '18 Jul 2026, 22:41', club: '104829', table: 'Deep Stack 5-10', loser: 'quadqueen',    hand: 'Quad 8s',   winner: 'sa_delacruz', amount: 148_200 },
    { when: '02 Jul 2026, 19:12', club: '218847', table: 'Rail Room PLO',   loser: 'sa_ferreira',  hand: 'Quad Js',   winner: 'riverking22', amount: 96_400 },
    { when: '14 Jun 2026, 20:58', club: '104829', table: 'Friday Night NLH',loser: 'ag_novak',     hand: 'Quad 2s',   winner: 'quadqueen',   amount: 72_800 },
    { when: '29 May 2026, 23:04', club: '337102', table: 'High Tide Short', loser: 'ag_haddad',    hand: 'Straight fl.', winner: 'a_tanaka', amount: 118_600 }
  ]
};

const ANNOUNCEMENTS = [
  { title: 'Sunday Major — $100K guaranteed', body: 'Biggest tournament of the month. Registration opens 17:30 PT with 45 minutes of late reg. Satellites running all week.', period: '20 Jul – 26 Jul 2026', targets: 'All clubs', kind: 'Image + text', status: 'Live', views: 1_842 },
  { title: 'July Rake Race — halfway update', body: 'The 50,000-chip pool is still up for grabs. Leaderboard resets 1 Aug.', period: '15 Jul – 31 Jul 2026', targets: 'All clubs', kind: 'Text', status: 'Live', views: 1_104 },
  { title: 'Vegas Rail Room: Tuesday PLO Series', body: 'Week 4 of 8. 200 + 20 with two re-entries, 40K guaranteed.', period: '22 Jul – 28 Jul 2026', targets: 'Vegas Rail Room', kind: 'Text', status: 'Live', views: 312 },
  { title: 'Scheduled maintenance — 29 Jul', body: 'Tables will close at 03:00 PT for approximately 40 minutes. Tournaments in progress will be paused.', period: '27 Jul – 29 Jul 2026', targets: 'All clubs', kind: 'Text', status: 'Scheduled', views: 0 },
  { title: 'Welcome, Aces Over Kings', body: 'Our newest club joins the union. Say hello at the tables.', period: '11 Jun – 18 Jun 2026', targets: 'All clubs', kind: 'Image + text', status: 'Expired', views: 1_486 },
  { title: 'Bad Beat Jackpot hit — 148,200', body: 'Congratulations to quadqueen on the 18 Jul bad beat. Pool has reseeded at 25,000.', period: '18 Jul – 25 Jul 2026', targets: 'All clubs', kind: 'Text', status: 'Expired', views: 1_620 }
];

/* ── Detail-page histories ────────────────────────────────────────── */
const CLUB_GAME_HISTORY = [
  { date: '26 Jul 12:04', stakes: '5 / 10',   game: 'NLH',  players: 6, hands: 412, rake: 1_840, live: true },
  { date: '26 Jul 09:40', stakes: '1 / 2',    game: 'NLH',  players: 9, hands: 604, rake: 1_240, live: true },
  { date: '25 Jul 20:10', stakes: '5 / 10',   game: 'NLH',  players: 8, hands: 892, rake: 3_640, live: false },
  { date: '25 Jul 14:22', stakes: '2 / 4',    game: 'PLO4', players: 6, hands: 478, rake: 1_520, live: false },
  { date: '24 Jul 19:55', stakes: '1 / 2',    game: 'NLH',  players: 9, hands: 716, rake: 1_480, live: false },
  { date: '24 Jul 11:30', stakes: '2 / 4',    game: 'PLO6', players: 7, hands: 342, rake: 1_180, live: false },
  { date: '23 Jul 21:08', stakes: '5 / 10',   game: 'NLH',  players: 6, hands: 528, rake: 2_240, live: false },
  { date: '23 Jul 16:44', stakes: '0.5 / 1',  game: 'NLH',  players: 9, hands: 394, rake: 520,   live: false }
];

const MEMBER_RING_HISTORY = [
  { date: '26 Jul 13:44', table: "Kurtis's Table 4", stakes: '5 / 10',  game: 'NLH',  hands: 186, buyin: 1_000, cashout: null,  pnl: 640,    rake: 420, live: true },
  { date: '25 Jul 22:10', table: 'Deep Stack 5-10',  stakes: '5 / 10',  game: 'NLH',  hands: 312, buyin: 3_000, cashout: 4_820, pnl: 1_820,  rake: 680, live: false },
  { date: '25 Jul 18:22', table: 'PLO5 Splash',      stakes: '1 / 2',   game: 'PLO5', hands: 204, buyin: 400,   cashout: 148,   pnl: -252,   rake: 190, live: false },
  { date: '24 Jul 20:40', table: 'Friday Night NLH', stakes: '1 / 2',   game: 'NLH',  hands: 268, buyin: 200,   cashout: 512,   pnl: 312,    rake: 140, live: false },
  { date: '23 Jul 21:08', table: 'Deep Stack 5-10',  stakes: '5 / 10',  game: 'NLH',  hands: 148, buyin: 1_500, cashout: 0,     pnl: -1_500, rake: 310, live: false },
  { date: '22 Jul 19:12', table: 'Rail Room PLO',    stakes: '2 / 4',   game: 'PLO4', hands: 226, buyin: 400,   cashout: 940,   pnl: 540,    rake: 220, live: false }
];

const MEMBER_TOURNEY_HISTORY = [
  { date: '25 Jul 20:00', name: 'Main Event Satellite', game: 'NLH',  buyin: '55 + 5',   entries: 92,  finish: '3 / 92',  prize: 420,   pnl: 360 },
  { date: '24 Jul 17:00', name: 'Weekend Warm-Up',      game: 'PLO4', buyin: '1,000 + 100', entries: 78, finish: '22 / 78', prize: 0,   pnl: -1_100 },
  { date: '22 Jul 14:00', name: 'Daily Turbo 50',       game: 'NLH',  buyin: '50 + 5',   entries: 188, finish: '1 / 188', prize: 2_240, pnl: 2_185 },
  { date: '19 Jul 18:00', name: 'Sunday Major',         game: 'NLH',  buyin: '500 + 50', entries: 204, finish: '48 / 204',prize: 0,     pnl: -550 },
  { date: '18 Jul 12:00', name: 'Bounty Hunter',        game: 'NLH',  buyin: '100 + 10', entries: 142, finish: '11 / 142',prize: 280,   pnl: 170 }
];

const MEMBER_BALANCE_HISTORY = [
  { when: '26 Jul 13:40', by: 'mgr_wallace', byRole: 'Manager',     dir: 'sent',      amount: 5_000,  start: 3_960,  end: 8_960,  note: 'Approved chip request' },
  { when: '25 Jul 11:02', by: 'ag_novak',    byRole: 'Agent',       dir: 'reclaimed', amount: 2_400,  start: 6_360,  end: 3_960,  note: 'End-of-week settle' },
  { when: '23 Jul 20:18', by: 'ag_novak',    byRole: 'Agent',       dir: 'sent',      amount: 4_000,  start: 2_360,  end: 6_360,  note: 'Approved chip request' },
  { when: '22 Jul 09:41', by: 'sa_delacruz', byRole: 'Super Agent', dir: 'sent',      amount: 2_000,  start: 360,    end: 2_360,  note: '' },
  { when: '20 Jul 22:55', by: 'ag_novak',    byRole: 'Agent',       dir: 'reclaimed', amount: 6_800,  start: 7_160,  end: 360,    note: 'Cashed out' }
];

const MEMBER_TICKET_HISTORY = [
  { when: '26 Jul 10:52', ticket: 'Sunday Major $500+50', spec: 'Specific tournament', value: 550, from: 'kurtis_c', status: 'Unused', expires: '26 Jul 18:45' },
  { when: '21 Jul 16:20', ticket: 'Any MTT ≤ $110',       spec: 'Value',               value: 110, from: 'kurtis_c', status: 'Used',   expires: '—' },
  { when: '14 Jul 12:08', ticket: 'Daily Turbo $50+5',    spec: 'Specific tournament', value: 55,  from: 'mgr_wallace', status: 'Used', expires: '—' },
  { when: '07 Jul 18:44', ticket: 'Any MTT ≤ $55',        spec: 'Value',               value: 55,  from: 'kurtis_c', status: 'Expired', expires: '14 Jul 2026' }
];

const MEMBER_LOGIN_HISTORY = [
  { when: '26 Jul 13:44', device: 'iPhone 16 Pro',   platform: 'iOS 19.2',     ip: '73.42.18.204',  loc: 'Los Angeles, US', result: 'Success' },
  { when: '26 Jul 08:12', device: 'MacBook Pro',     platform: 'Chrome 141',   ip: '73.42.18.204',  loc: 'Los Angeles, US', result: 'Success' },
  { when: '25 Jul 22:06', device: 'iPhone 16 Pro',   platform: 'iOS 19.2',     ip: '73.42.18.204',  loc: 'Los Angeles, US', result: 'Success' },
  { when: '25 Jul 19:30', device: 'Pixel 9',         platform: 'Android 16',   ip: '104.28.60.11',  loc: 'Las Vegas, US',   result: 'Success' },
  { when: '25 Jul 19:28', device: 'Pixel 9',         platform: 'Android 16',   ip: '104.28.60.11',  loc: 'Las Vegas, US',   result: 'Failed — password' },
  { when: '24 Jul 12:41', device: 'iPad Air',        platform: 'iPadOS 19.1',  ip: '73.42.18.204',  loc: 'Los Angeles, US', result: 'Success' }
];

/* Devices used — ClubGG surfaces this as a linked field on Member
   Information that opens a "Device ID List" popup. Same here. */
const MEMBER_DEVICES = [
  { no: 5, when: '2026-07-26 11:37:04', platform: 'iOS',     id: 'EABEEFB3-0999-4D00-87F7-303A699A218F' },
  { no: 4, when: '2026-06-15 19:29:18', platform: 'iOS',     id: '1E50AC9F-8461-4351-B6B6-A5CBE51C7509' },
  { no: 3, when: '2026-05-24 21:18:11', platform: 'Android', id: 'AE38F999-7887-48B7-A459-1A8D49E078E7' },
  { no: 2, when: '2026-03-13 20:10:19', platform: 'Windows', id: 'EA2D8C12-4FB0-45DA-83AE-4227B7093A34' },
  { no: 1, when: '2025-12-02 19:35:19', platform: 'iOS',     id: '0B5ED819-B1BA-4700-9E37-7391B9E4DD89' }
];

/* Linked accounts — other accounts seen on the same device. Grouped by
   device, matching ClubGG's popup. This is the multi-accounting signal. */
const LINKED_ACCOUNTS = [
  {
    device: 'EABEEFB3-0999-4D00-87F7-303A699A218F', platform: 'iOS',
    accounts: [
      { uid: '2490-0305', nick: 'sa_delacruz', date: '2026-07-26 11:37:04', ip: '73.42.18.204', loc: 'Los Angeles, US', logins: 191 }
    ]
  },
  {
    device: 'EA2D8C12-4FB0-45DA-83AE-4227B7093A34', platform: 'Windows',
    accounts: [
      { uid: '2490-0305', nick: 'sa_delacruz', date: '2026-03-13 20:10:19', ip: '104.28.60.11', loc: 'Las Vegas, US', logins: 19 },
      { uid: '2054-2226', nick: 'flopsweat',   date: '2026-05-09 22:44:42', ip: '104.28.60.11', loc: 'Las Vegas, US', logins: 2 },
      { uid: '1182-7953', nick: 'nit_nate',    date: '2026-05-15 03:28:51', ip: '104.28.60.11', loc: 'Las Vegas, US', logins: 4 },
      { uid: '9284-1649', nick: 'tiltmonster', date: '2026-06-26 04:25:33', ip: '104.28.60.11', loc: 'Las Vegas, US', logins: 2 }
    ]
  }
];

const MEMBER_DOWNLINE = [
  { nick: 'ag_novak',   role: 'Agent',  chips: 46_200, pnl: 3_410,  hands: 3_280, members: 9, lastActive: '25 Jul' },
  { nick: 'quadqueen',  role: 'Player', chips: 8_960,  pnl: -9_240, hands: 4_820, members: 0, lastActive: '26 Jul' },
  { nick: 'flopsweat',  role: 'Player', chips: 14_600, pnl: 2_180,  hands: 2_940, members: 0, lastActive: '26 Jul' },
  { nick: 'tiltmonster',role: 'Player', chips: 2_100,  pnl: -6_420, hands: 3_610, members: 0, lastActive: '24 Jul' },
  { nick: 'nit_nate',   role: 'Player', chips: 22_400, pnl: 1_040,  hands: 1_880, members: 0, lastActive: '23 Jul' },
  { nick: 'allin_ava',  role: 'Player', chips: 640,    pnl: -3_180, hands: 2_240, members: 0, lastActive: '26 Jul' }
];

const CLUB_SECURITY = {
  devices: [
    { device: 'iPhone 16 Pro',  platform: 'iOS 19.2',    members: 84, lastSeen: '26 Jul 14:12' },
    { device: 'Pixel 9',        platform: 'Android 16',  members: 61, lastSeen: '26 Jul 13:58' },
    { device: 'Samsung S25',    platform: 'Android 16',  members: 42, lastSeen: '26 Jul 12:40' },
    { device: 'Desktop web',    platform: 'Chrome 141',  members: 27, lastSeen: '26 Jul 14:02' }
  ],
  flags: [
    { kind: 'Linked accounts', detail: '3 members share a device fingerprint with another account', severity: 'Review', when: '24 Jul 2026' },
    { kind: 'Shared IP',       detail: '2 members played the same table from 104.28.60.11',        severity: 'Review', when: '22 Jul 2026' },
    { kind: 'GPS proximity',   detail: 'No same-table GPS collisions in the period',               severity: 'Clear',  when: '26 Jul 2026' }
  ]
};

/* ── Chip budget (Chips & Credits sidebar) ────────────────────────── */
const CHIP_BUDGET = {
  clubBudget: 400_000,
  clubSpent: 268_400,
  agentAllocations: [
    { nick: 'sa_delacruz', role: 'Super Agent', budget: 150_000, spent: 118_400, creditLimit: -25_000 },
    { nick: 'ag_novak',    role: 'Agent',       budget: 60_000,  spent: 46_200,  creditLimit: -10_000 },
    { nick: 'sa_ferreira', role: 'Super Agent', budget: 100_000, spent: 74_900,  creditLimit: -20_000 }
  ]
};
