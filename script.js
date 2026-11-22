'use strict';
/* ===== Exam Prep Tracker — vanilla JS, data in localStorage ===== */
const KEY = 'examPrepV1', $ = s => document.querySelector(s);
const h = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const j = a => a.join('');
const iso = d => d.toLocaleDateString('en-CA');
const today = () => iso(new Date());
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = s => new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const KINDS = ['Task', 'Study target', 'Assignment', 'Revision'], PRIS = ['High', 'Medium', 'Low'];

// id, short, name, exam date, priority, start time ('' = not confirmed)
const SUB = [
  ['dme', 'DME', 'Design of Machine Elements (DME)', '2026-12-09', 'Very High', '10:00'],
  ['ice', 'ICE', 'Internal Combustion Engines (ICE)', '2026-12-14', 'Very High', '10:00'],
  ['met', 'Metallurgy', 'Metallurgy', '2026-12-11', 'Very High', '10:00'],
  ['amt', 'AMT', 'Advance Manufacturing Technology (AMT)', '2026-12-07', 'High', '10:00'],
  ['cdt', 'CDT', 'Creativity and Design Thinking (CDT)', '2026-12-16', 'Medium', '10:00'],
  ['aiml', 'AI & ML', 'AI & ML – MDM', '2026-12-21', 'Medium', '']];
const PLAN = [['06:30', '07:00', 'Wake up', ''], ['07:00', '09:00', 'DME Theory', 'dme'], ['09:00', '09:30', 'Breakfast', ''],
  ['09:30', '11:00', 'DME Numericals', 'dme'], ['11:00', '11:30', 'Break', ''], ['11:30', '13:00', 'Secondary Subject', ''],
  ['13:00', '14:30', 'Lunch and Rest', ''], ['14:30', '16:00', 'ICE / Metallurgy', 'ice'], ['16:00', '16:30', 'Break', ''],
  ['16:30', '18:00', 'AMT / ICE / Metallurgy Practice', 'amt'], ['18:00', '19:30', 'Personal Time', ''],
  ['19:30', '20:30', 'Revision', ''], ['20:30', '21:00', 'Plan Tomorrow', '']];

// Official unit-wise syllabus transcribed from the supplied PAH Solapur University PDFs.
const SYLLABUS = {
  amt: [
    ['Unit 1: Conventional Lathe Machine', ['Centre lathe: parts and functions','Lathe specifications, accessories and attachments','Lathe operations','Taper turning methods','Thread cutting numericals','CNC machine tools: classification, advantages, limitations and applications']],
    ['Unit 2: Hole Making Machine Tools', ['Classification, construction and working of pillar and radial drilling machines','Job and tool holding devices, accessories and drilling operations','Horizontal and vertical boring machines: construction, working, boring tools and bars','Jig boring machines','Broaching: principle, classification, pull and push type broaches, advantages, limitations and applications']],
    ['Unit 3: Reciprocating Motion Machine Tools', ['Principle, types, specifications and operations of shapers','Types of shapers','Types of planers','Standard double-housing planer: construction and operations','Slotting machine: construction and working']],
    ['Unit 4: Milling and Gear Manufacturing', ['Classification of milling machines','Column and knee type milling machines: construction and working','Up milling and down milling','Milling operations','Gear cutting on milling machines','Gear hobbing, gear shaving and gear burnishing','Indexing methods and indexing numericals']],
    ['Unit 5: Finishing Processes', ['Grinding machine classifications: cylindrical, centreless and surface grinders','Grinding wheel selection and mounting','Glazing, loading, truing and balancing','Surface finishing processes: honing, lapping and superfinishing']],
    ['Unit 6: Unconventional Machining', ['Introduction, classification and significance of unconventional machining','Electrical Discharge Machining (EDM)','Electrochemical Machining (ECM)','Ultrasonic Machining (USM)','Abrasive Water Jet Machining (AWJM)','Principles, working, applications, advantages and limitations']]
  ],
  dme: [
    ['Unit 1: Basics of Engineering Design', ['General design process and procedure','Types of loads','Factor of safety: selection and significance','Theories of failure and their applications','Aesthetic and ergonomic considerations in design','Design considerations for casting','Design considerations for forging','Design considerations for machined parts','Design for manufacture and assembly']],
    ['Unit 2: Design Against Fluctuating Loads', ['Stress concentration: causes and remedies','Fatigue failure','Endurance limit','Notch sensitivity','Goodman and Soderberg diagrams','Modified Goodman diagram (theoretical treatment)','Design for finite and infinite life under reversed and fluctuating stresses (numericals)']],
    ['Unit 3: Selection of Belt', ['Selection of flat belts using standard manufacturers’ catalogues / design data book (numericals)','Selection of V-belts using standard manufacturers’ catalogues / design data book (numericals)']],
    ['Unit 4: Design of Shafts and Couplings', ['Materials for shafts','Design of solid and hollow shafts on strength basis','Maximum principal stress theory','Maximum shear stress theory','Shaft design on torsional rigidity basis','ASME code for shaft design','Splined shafts (introductory treatment)','Types of couplings: muff and rigid flange (numericals)']],
    ['Unit 5: Design of Springs', ['Types of springs and applications','Helical spring terminology','Styles of spring ends','Spring materials','Stress and deflection in helical springs','Springs in series and parallel','Introduction to leaf springs (no numericals)']],
    ['Unit 6: Design of Joints', ['Bolted joints: simple analysis','Eccentrically loaded bolted joints in shear','Eccentric load parallel to bolt axis','Eccentric load perpendicular to bolt axis (static-loading numericals)','Strength of butt welds','Strength of transverse fillet welds','Axially loaded unsymmetrical lap joints','Eccentrically loaded welded joints in shear','Design of fillet welds (numericals)']]
  ],
  met: [
    ['Unit 1: Introduction to Ferrous Alloys', ['Brief classification of metals','Phase rule','Solid solutions and their types','Intermetallic compounds','Allotropy','Concept of alloying','Classification of cooling curves','Types of equilibrium diagrams','Lever rule']],
    ['Unit 2: Ferrous Metals and Alloys', ['Fe–Fe3C equilibrium diagram','Eutectic, eutectoid and peritectic transformations','Critical temperatures','Plain carbon steels: composition, applications and properties','Effect of alloying elements on steels','Cast iron: introduction, types, composition, properties and applications','HSLA steels','Spring steels and silicon steels','Hadfield manganese steels and HCHC steels','Water-, oil- and air-hardening steels','Hot-working tool steels and free-cutting steels','High-speed steels (HSS) and ONHS','Stainless steels and their types']],
    ['Unit 3: Non-Ferrous Alloys, Composites and Nanomaterials', ['Copper alloys: Cu–Zn equilibrium diagram, brasses and bronzes','Aluminium alloys: Al–Si and Al–Cu alloys','Steps in precipitation hardening','Babbitts','Pb–Sn alloys','Composite materials: classification, properties and applications','Nanomaterials: classification, properties and applications']],
    ['Unit 4: Heat Treatments of Steel', ['Objectives of heat treatment','TTT and CCT diagrams for eutectoid steel','Annealing: concept, process, types, advantages, limitations and applications','Normalizing: concept, process, types, advantages, limitations and applications','Hardening and tempering: concepts, processes, advantages, limitations and applications','Carburising and nitriding','Carbonitriding','Induction hardening and flame hardening','Surface-hardening processes: concepts, processes, advantages, limitations and applications']],
    ['Unit 5: Destructive and Non-Destructive Testing', ['Destructive testing: test procedures and significance','Tensile testing','Hardness testing','Impact testing','Creep testing','Fatigue testing','Non-destructive testing (NDT): dye penetrant testing','Magnetic particle testing','Ultrasonic testing','Radiography testing','Eddy-current testing','Introduction to advanced NDT methods']],
    ['Unit 6: Introduction to Powder Metallurgy', ['Definition of powder metallurgy','Methods of powder production','Steps in manufacturing components using the P/M technique','Advantages, disadvantages and applications of powder metallurgy','Applications and flow charts: self-lubricated bearings','Cemented-carbide cutting tools and friction materials']]
  ],
  cdt: [
    ['Unit 1: Introduction to Creativity and Design Thinking', ['Creativity and innovation: definition, importance and characteristics','Design thinking process','Empathize','Define','Ideate','Prototype','Test','Barriers to creativity and techniques to overcome barriers']],
    ['Unit 2: Ideation and Concept Development', ['Problem-solving approaches: divergent and convergent thinking','Idea-generation methods: brainstorming','SCAMPER','TRIZ','Mind mapping','Transforming ideas into concepts: concept sketching','Storytelling and visualization techniques']],
    ['Unit 3: Creativity and Prototyping', ['Applying creativity, brainstorming and concept generation in problem-solving','Low-fidelity and high-fidelity prototypes','Rapid prototyping','Iterative design','Real-life case studies: customer-driven designs and product specifications']],
    ['Unit 4: Sustainable Design and Product Development', ['Design for Environment principles','Environmental sustainability throughout the product life cycle','Product development models: staged, spiral and agile','Selecting and implementing a development model based on project needs','Case studies in sustainable engineering product development']]
  ]
};
const makeUnits = id => (SYLLABUS[id] || []).map(([n, topics]) => ({
  id: uid(), n, done: false, topics: topics.map(t => ({ id: uid(), t, done: false, rev: false }))
}));
function migrateSyllabus(data) {
  for (const id of Object.keys(SYLLABUS)) {
    const s = data.subjects?.find(x => x.id === id);
    if (!s || !Array.isArray(s.units)) continue;
    const untouchedPlaceholders = s.units.length === 5 && s.units.every((u, i) =>
      u.n === 'Unit ' + (i + 1) && !u.done && Array.isArray(u.topics) && u.topics.length === 0);
    if (untouchedPlaceholders) s.units = makeUnits(id);
  }
}

const defaults = () => ({
  subjects: SUB.map(([id, short, name, date, pri, time]) => ({ id, short, name, date, pri, time, rev: 'Not started', notes: '', imp: [], prac: { done: 0, total: 0 },
    units: SYLLABUS[id] ? makeUnits(id) : [1, 2, 3, 4, 5].map(i => ({ id: uid(), n: 'Unit ' + i, done: false, topics: [] })) })),
  tasks: [], sessions: [], notes: [],
  plan: PLAN.map(([s, e, a, sj]) => ({ id: uid(), s, e, a, sj })),
  set: { theme: 'dark', name: 'Niraj', work: 25, short: 5, long: 15 } });

/* Saved data is merged over defaults so new features never erase progress. */
function load() {
  try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && Array.isArray(x.subjects)) { const d = defaults(); const merged = { ...d, ...x, set: { ...d.set, ...x.set } }; migrateSyllabus(merged); return merged; } } catch (e) {}
  return defaults();
}
let S = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { alert('Could not save (storage blocked or full). Export your data from Settings.'); } };
const V = { view: 'dash', sub: 'dme', cal: 10, day: today(), tf: {}, ntab: 'all', q: '', et: null, en: null, foldedUnits: {} };
const T = { mode: 'work', run: false, end: 0, cycle: 0, subj: 'dme', left: S.set.work * 60 };

/* ===== helpers ===== */
const sb = id => S.subjects.find(s => s.id === id);
const sname = id => sb(id)?.short || 'General';
const opts = (sel, blank) => (blank ? `<option value="">${blank}</option>` : '') + j(S.subjects.map(s => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${h(s.short)}</option>`));
const selOpts = (arr, sel) => j(arr.map(x => `<option ${x === sel ? 'selected' : ''}>${x}</option>`));
const unit = id => S.subjects.flatMap(s => s.units).find(u => u.id === id);
const topic = (u, id) => u.topics.find(t => t.id === id);
const task = id => S.tasks.find(t => t.id === id);
const examStart = s => new Date(s.date + 'T' + (s.time || '00:00') + ':00').getTime();
const formatTime = t => { if (!t) return 'Time not confirmed'; const [hh, mm] = t.split(':').map(Number); return new Date(2020, 0, 1, hh, mm).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); };
const examTime = s => s.time ? `${formatTime(s.time)}–${formatTime('13:00')}` : 'Time not confirmed';
const examEnd = s => new Date(s.date + 'T' + (s.time ? '13:00' : '23:59') + ':00').getTime();
const nextExams = () => S.subjects.filter(s => examEnd(s) > Date.now()).sort((a, b) => examStart(a) - examStart(b));
const mins = (sid, date) => S.sessions.filter(x => (!sid || x.subj === sid) && (!date || x.date === date)).reduce((a, x) => a + x.min, 0);
const hrs = m => (m / 60).toFixed(1);
const overdue = t => !t.done && (t.due || t.date) && (t.due || t.date) < today();
/* Subject progress: topic-based when topics exist, otherwise completed units. */
function prog(s) {
  const tt = s.units.reduce((a, u) => a + u.topics.length, 0);
  if (tt) return s.units.reduce((a, u) => a + u.topics.filter(t => t.done).length, 0) / tt * 100;
  return s.units.length ? s.units.filter(u => u.done).length / s.units.length * 100 : 0;
}
function cdText(ms) {
  if (ms <= 0) return 'Exam day';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 86400)}d ${Math.floor(s % 86400 / 3600)}h ${Math.floor(s % 3600 / 60)}m ${s % 60}s`;
}
/* Streak = consecutive days (ending today or yesterday) with a study session, finished task or finished planner slot. */
function streak() {
  const a = new Set([...S.sessions.map(x => x.date), ...S.tasks.filter(t => t.done).map(t => t.doneOn), ...S.plan.filter(p => p.d && p.sj).map(p => p.d)]);
  const d = new Date(); if (!a.has(iso(d))) d.setDate(d.getDate() - 1);
  let n = 0; while (a.has(iso(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
const bar = p => `<div class="pb"><u style="width:${Math.min(100, p).toFixed(0)}%"></u></div>`;
const row = (l, p, v) => `<div class="br"><span>${h(l)}</span><i class="pb"><u style="width:${Math.min(100, p).toFixed(0)}%"></u></i><em>${v}</em></div>`;
const donut = (p, l) => `<div class="dn"><svg viewBox="0 0 36 36"><circle class="bg" cx="18" cy="18" r="15.9"/><circle class="fg" cx="18" cy="18" r="15.9" pathLength="100" stroke-dasharray="${p.toFixed(1)} 100"/></svg><b>${Math.round(p)}%</b><small class="mu">${l}</small></div>`;
const cols = d => { const m = Math.max(...d.map(x => x[1]), 0.1); return `<div class="cols">${j(d.map(([l, v]) => `<div><em>${v}</em><u style="height:${v / m * 80}%"></u>${l}</div>`))}</div>`; };
const lastDays = n => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (n - 1 - i)); return d; });

/* ===== views ===== */
const VIEWS = [['dash', 'Home'], ['subj', 'Subjects'], ['tasks', 'Tasks'], ['timer', 'Timer'], ['plan', 'Planner'], ['cal', 'Calendar'], ['notes', 'Notes'], ['prog', 'Progress'], ['set', 'Settings']];
const PRIM = ['dash', 'subj', 'tasks', 'timer']; // shown in the mobile pill; the rest live under "More"
const ICON = {
  dash: 'M12 3 3 11h2v9h5v-6h4v6h5v-9h2z', subj: 'M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z',
  tasks: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.5 14.5-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4z',
  timer: 'M9 2h6v2H9zm3 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm1 3v4.6l3 1.8-.8 1.3L11 14V9z',
  plan: 'M3 5h18v3H3zm0 6h18v3H3zm0 6h12v3H3z', cal: 'M6 2h2v2h8V2h2v2h3v18H3V4h3zM5 10v10h14V10z',
  notes: 'M5 3h14v18H5zm3 4v2h8V7zm0 4v2h8v-2zm0 4v2h5v-2z', prog: 'M11 3v10h10a10 10 0 1 1-10-10zm2 0a10 10 0 0 1 8 8h-8z',
  set: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-1-6h2l.5 2.5 2 .9 2.2-1.4 1.4 1.4-1.4 2.2.9 2 2.5.5v2l-2.5.5-.9 2 1.4 2.2-1.4 1.4-2.2-1.4-2 .9-.5 2.5h-2l-.5-2.5-2-.9-2.2 1.4-1.4-1.4 1.4-2.2-.9-2L2 14v-2l2.5-.5.9-2L4 7.3l1.4-1.4 2.2 1.4 2-.9z',
  more: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z' };
const ic = k => `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" fill-rule="evenodd" aria-hidden="true"><path d="${ICON[k]}"/></svg>`;

function dash() {
  const t = today(), tt = S.tasks.filter(x => x.date === t), td = tt.filter(x => x.done).length;
  const pl = S.plan.filter(p => p.sj), pd = pl.filter(p => p.d === t).length, tot = tt.length + pl.length;
  const dp = tot ? (td + pd) / tot * 100 : 0, all = S.subjects.reduce((a, s) => a + prog(s), 0) / S.subjects.length;
  const up = nextExams();
  return `<h1>Welcome back${S.set.name ? ', ' + h(S.set.name) : ''}</h1>
  <div class="card row"><div class="grow"><div class="mu">${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div><div class="big" id="clk"></div></div>
  <div class="grow"><div class="mu">${up[0] ? 'Next exam: ' + h(up[0].short) : 'No upcoming exams'}</div><div class="big" id="cd"></div></div></div>
  <div class="grid">
  <div class="card stat"><span class="mu">Total study hours</span><b>${hrs(mins())}</b></div>
  <div class="card stat"><span class="mu">Today's tasks done</span><b>${td}/${tt.length}</b></div>
  <div class="card stat"><span class="mu">Daily progress</span><b>${Math.round(dp)}%</b>${bar(dp)}</div>
  <div class="card stat"><span class="mu">Syllabus complete</span><b>${Math.round(all)}%</b>${bar(all)}</div>
  <div class="card stat"><span class="mu">Study streak</span><b>${streak()} 🔥</b></div></div>
  <h2>Upcoming exams</h2><div class="grid">${up.length ? j(up.map(s => `<div class="card" style="cursor:pointer" data-a="exam" data-id="${s.id}"><b>${h(s.short)}</b><div class="mu">${fmt(s.date)} · ${s.time ? '10:00 AM' : 'time TBC'}</div><span class="tag">${s.pri}</span>${bar(prog(s))}</div>`)) : '<div class="empty">All exams are over. Well done!</div>'}</div>
  <div class="card"><h2>Subject progress</h2>${j(S.subjects.map(s => row(s.short, prog(s), Math.round(prog(s)) + '%')))}</div>`;
}

function subj() {
  const s = sb(V.sub) || S.subjects[0]; V.sub = s.id;
  const tt = s.units.reduce((a, u) => a + u.topics.length, 0), td = s.units.reduce((a, u) => a + u.topics.filter(t => t.done).length, 0);
  return `<h1>My Subjects</h1><div class="chips">${j(S.subjects.map(x => `<button class="chip ${x.id === s.id ? 'on' : ''}" data-a="sub" data-id="${x.id}">${h(x.short)}</button>`))}</div>
  <div class="card"><div class="row"><input class="grow" value="${h(s.name)}" data-c="sub" data-k="name" aria-label="Subject name" maxlength="80">
  <input type="date" value="${s.date}" data-c="sub" data-k="date" aria-label="Exam date">
  <select data-c="sub" data-k="pri" aria-label="Priority">${selOpts(['Very High', 'High', 'Medium', 'Low'], s.pri)}</select>
  <select data-c="sub" data-k="rev" aria-label="Revision status">${selOpts(['Not started', 'In progress', 'Revised'], s.rev)}</select></div>
  <p class="mu">Exam ${fmt(s.date)}, ${examTime(s)}. Units ${s.units.filter(u => u.done).length}/${s.units.length}. Topics ${td}/${tt}. Completion ${Math.round(prog(s))}%</p>${bar(prog(s))}</div>
  ${j(s.units.map(u => { const folded = !!V.foldedUnits[u.id]; return `<div class="card unit-card ${u.done ? 'done' : ''}"><div class="row unit-head"><input type="checkbox" ${u.done ? 'checked' : ''} data-c="unit" data-u="${u.id}" data-k="done" title="Unit completed">
  <input class="grow" value="${h(u.n)}" data-c="unit" data-u="${u.id}" data-k="n" maxlength="80" aria-label="Unit name"><button type="button" class="unit-toggle ${folded ? 'is-folded' : ''}" data-a="unitToggle" data-u="${u.id}" aria-expanded="${!folded}" aria-label="${folded ? 'Show' : 'Hide'} topics for ${h(u.n)}"><span>Topics · ${u.topics.length}</span><span class="unit-chevron" aria-hidden="true">⌄</span></button><button class="ib" data-a="unitDel" data-u="${u.id}" title="Delete unit">🗑</button></div>
  <div class="unit-topics ${folded ? 'is-folded' : ''}">${u.topics.length ? j(u.topics.map(t => `<div class="row tp"><input type="checkbox" ${t.done ? 'checked' : ''} data-c="top" data-u="${u.id}" data-t="${t.id}" data-k="done">
  <input class="grow" value="${h(t.t)}" data-c="top" data-u="${u.id}" data-t="${t.id}" data-k="t" maxlength="120"><label title="Mark for revision"><input type="checkbox" ${t.rev ? 'checked' : ''} data-c="top" data-u="${u.id}" data-t="${t.id}" data-k="rev"> 🔁</label>
  <button class="ib" data-a="topDel" data-u="${u.id}" data-t="${t.id}">×</button></div>`)) : '<p class="mu tp">No topics yet. Add them from your syllabus.</p>'}
  <form class="row tp" data-f="topAdd" data-u="${u.id}"><input name="t" class="grow" placeholder="Add topic" maxlength="120"><button class="btn alt">Add topic</button></form></div></div>`; }))}
  <p><button class="btn alt" data-a="unitAdd">+ Add unit</button></p><br>
  <div class="card"><h2>Practice questions</h2><div class="row"><input type="number" min="0" value="${s.prac.done}" data-c="prac" data-k="done" style="width:90px"> solved of <input type="number" min="0" value="${s.prac.total}" data-c="prac" data-k="total" style="width:90px"> total</div>${bar(s.prac.total ? s.prac.done / s.prac.total * 100 : 0)}</div>
  <div class="card"><h2>Study notes</h2><textarea data-c="subnotes" placeholder="Quick notes for ${h(s.short)}…">${h(s.notes)}</textarea></div>
  <div class="card"><h2>Important questions</h2>${s.imp.length ? j(s.imp.map((q, i) => `<div class="row"><span class="grow">${h(q)}</span><button class="ib" data-a="impDel" data-i="${i}">×</button></div>`)) : '<p class="mu">None added yet.</p>'}
  <form class="row" data-f="impAdd"><input name="q" class="grow" placeholder="Add an important question" maxlength="300"><button class="btn alt">Add</button></form></div>`;
}

function plan() {
  const t = today(), list = [...S.plan].sort((a, b) => a.s.localeCompare(b.s));
  return `<h1>Daily Planner</h1><p class="mu" style="margin-bottom:10px">Ticks and actual minutes reset each day. Actual minutes on a subject slot count towards study time.</p>
  ${list.length ? j(list.map(p => `<div class="card ${p.d === t ? 'done' : ''}"><div class="row"><input type="checkbox" ${p.d === t ? 'checked' : ''} data-c="pdone" data-id="${p.id}" title="Done today">
  <input type="time" value="${p.s}" data-c="pf" data-id="${p.id}" data-k="s"><input type="time" value="${p.e}" data-c="pf" data-id="${p.id}" data-k="e">
  <input class="grow tt" value="${h(p.a)}" data-c="pf" data-id="${p.id}" data-k="a" maxlength="80"><select data-c="pf" data-id="${p.id}" data-k="sj">${opts(p.sj, '— none —')}</select>
  <input type="number" min="0" max="600" placeholder="min" style="width:80px" value="${p.d === t && p.m ? p.m : ''}" data-c="pact" data-id="${p.id}" title="Actual minutes today"><button class="ib" data-a="pDel" data-id="${p.id}">🗑</button></div></div>`)) : '<div class="empty">No sessions. Add one below.</div>'}
  <form class="card row" data-f="plan"><b>Add session</b><input type="time" name="s" required><input type="time" name="e" required><input name="a" class="grow" placeholder="Activity" required maxlength="80"><select name="sj">${opts('', '— none —')}</select><button class="btn">Add</button></form>`;
}

function taskForm(t = {}) {
  return `<form class="card" data-f="task"><input type="hidden" name="id" value="${t.id || ''}"><div class="row"><input class="grow" name="title" placeholder="Task title" maxlength="120" required value="${h(t.title)}">
  <select name="subj">${opts(t.subj || V.sub, '')}</select><select name="kind">${selOpts(KINDS, t.kind)}</select><select name="pri">${selOpts(PRIS, t.pri || 'Medium')}</select></div>
  <div class="row"><label class="mu">Date <input type="date" name="date" value="${t.date || V.day}"></label><label class="mu">Deadline <input type="date" name="due" value="${t.due || ''}"></label>
  <button class="btn">${t.id ? 'Save task' : 'Add task'}</button>${t.id ? '<button type="button" class="btn alt" data-a="cancelEdit">Cancel</button>' : ''}</div></form>`;
}
const taskRow = t => `<div class="card ${t.done ? 'done' : ''}"><div class="row"><input type="checkbox" ${t.done ? 'checked' : ''} data-c="tgl" data-id="${t.id}">
  <span class="grow tt">${h(t.title)}</span><span class="tag">${h(sname(t.subj))}</span><span class="tag">${t.kind || 'Task'}</span><span class="tag ${t.pri === 'High' ? 'er' : ''}">${t.pri}</span>
  ${overdue(t) ? '<span class="tag er">Overdue</span>' : ''}<span class="mu">${t.date ? fmt(t.date) : ''}${t.due ? ' → ' + fmt(t.due) : ''}</span>
  <button class="ib" data-a="tEdit" data-id="${t.id}">✏️</button><button class="ib" data-a="tDel" data-id="${t.id}">🗑</button></div></div>`;

function tasks() {
  const f = V.tf;
  const list = S.tasks.filter(t => (!f.s || t.subj === f.s) && (!f.d || t.date === f.d) && (!f.p || t.pri === f.p) &&
    (!f.st || (f.st === 'done' ? t.done : f.st === 'pending' ? !t.done : overdue(t)))).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const od = S.tasks.filter(overdue).length, pe = S.tasks.filter(t => !t.done).length;
  return `<h1>Tasks</h1>${taskForm(V.et ? task(V.et) : {})}
  <div class="row"><select data-c="tf" data-k="s">${opts(f.s, 'All subjects')}</select><input type="date" value="${f.d || ''}" data-c="tf" data-k="d"><select data-c="tf" data-k="p"><option value="">All priorities</option>${selOpts(PRIS, f.p)}</select>
  <select data-c="tf" data-k="st"><option value="">All</option>${j(['pending', 'done', 'overdue'].map(x => `<option ${f.st === x ? 'selected' : ''}>${x}</option>`))}</select>
  <span class="mu">${pe} pending · ${od} overdue</span></div>
  ${list.length ? j(list.map(taskRow)) : '<div class="empty">No tasks match. Add one above.</div>'}`;
}

const DUR = { work: 'Focus', short: 'Short break', long: 'Long break' };
function timer() {
  const td = today(), tsess = S.sessions.filter(x => x.date === td).length;
  return `<h1>Study Timer</h1><div class="card"><div class="chips">${j(Object.keys(DUR).map(m => `<button class="chip ${T.mode === m ? 'on' : ''}" data-a="tmode" data-id="${m}">${DUR[m]} ${S.set[m]}m</button>`))}</div>
  <div class="tm ${T.run ? 'running' : ''}" id="tm"></div><div class="row" style="justify-content:center"><select data-c="tsubj" aria-label="Subject">${opts(T.subj)}</select>
  <button class="btn" data-a="tgo">${T.run ? 'Pause' : 'Start'}</button><button class="btn alt" data-a="treset">Reset</button></div>
  <p class="mu" style="text-align:center">${tsess} focus sessions today · ${hrs(mins(null, td))} h</p></div>
  <div class="card"><h2>Total time per subject</h2>${j(S.subjects.map(s => row(s.short, mins() ? mins(s.id) / mins() * 100 : 0, hrs(mins(s.id)) + ' h')))}</div>`;
}

function cal() {
  const m = V.cal, first = new Date(2026, m, 1), days = new Date(2026, m + 1, 0).getDate(), t = today();
  let cells = j(['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<div class="hd">${d}</div>`)) + '<div class="hd"></div>'.repeat(first.getDay());
  for (let d = 1; d <= days; d++) {
    const ds = iso(new Date(2026, m, d)), ex = S.subjects.filter(s => s.date === ds), it = S.tasks.filter(x => x.date === ds || x.due === ds);
    const col = (first.getDay() + d - 1) % 7;
    const examLabel = ex.length ? `; Exam: ${ex.map(s => `${s.name}, ${examTime(s)}`).join('; ')}` : '';
    const week = Math.floor((first.getDay() + d - 1) / 7);
    cells += `<button type="button" class="calendar-day ${ex.length ? 'ex' : ''} ${ds === V.day ? 'sel' : ''} ${ds === t ? 'td' : ''}" data-a="day" data-id="${ds}" data-col="${col}" data-week="${week}" aria-label="${h(fmt(ds) + examLabel)}" ${ex.length ? `aria-describedby="exam-popover-${ds}"` : ''}><span class="day-number">${d}</span>${ex.map(s => `<small>${h(s.short)}</small>`).join('')}
    ${j(it.slice(0, 5).map(x => `<span class="dot ${x.done ? 'd' : x.kind === 'Assignment' ? 'a' : x.kind === 'Revision' ? 'r' : ''}"></span>`))}
    ${ex.length ? `<span class="exam-popover" id="exam-popover-${ds}" role="tooltip"><span class="exam-popover-kicker">EXAM DAY</span>${j(ex.map(s => `<span class="exam-preview"><span class="exam-preview-subject">${h(s.short)}</span><span class="exam-preview-info"><strong>${h(s.name)}</strong><small>${fmt(s.date)} · ${examTime(s)}</small><small>${h(s.pri)} priority · ${Math.round(prog(s))}% prepared</small><span class="pb"><u style="width:${prog(s)}%"></u></span></span></span>`))}</span>` : ''}</button>`;
  }
  const ex = S.subjects.filter(s => s.date === V.day), it = S.tasks.filter(x => x.date === V.day || x.due === V.day);
  return `<h1>Calendar</h1><div class="chips"><button class="chip ${m === 10 ? 'on' : ''}" data-a="month" data-id="10">November 2026</button><button class="chip ${m === 11 ? 'on' : ''}" data-a="month" data-id="11">December 2026</button></div>
  <div class="cal">${cells}</div><p class="mu" style="margin:8px 0">Gradient = exam · blue = task/target · amber = assignment · purple = revision · green = completed</p>
  <h2>${fmt(V.day)}</h2>${j(ex.map(s => `<div class="card"><b>${h(s.name)}</b> <span class="tag">${s.pri}</span><p class="mu">${examTime(s)} · ${cdText(examStart(s) - Date.now())}</p>${bar(prog(s))}<span class="mu">Preparation ${Math.round(prog(s))}%</span></div>`))}
  ${it.length ? j(it.map(taskRow)) : '<div class="empty">Nothing planned for this day.</div>'}${taskForm({ date: V.day })}`;
}

function notes() {
  const tabs = [['all', 'All'], ['note', 'Notes'], ['formula', 'Formula sheet'], ['question', 'Exam questions']], n = V.en ? S.notes.find(x => x.id === V.en) || {} : {};
  const list = S.notes.filter(x => (V.ntab === 'all' || x.type === V.ntab) && (!V.q || (x.title + x.body + x.unit).toLowerCase().includes(V.q.toLowerCase()))).sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0));
  const rev = S.subjects.flatMap(s => s.units.flatMap(u => u.topics.filter(t => t.rev && !t.done).map(t => `${s.short}: ${t.t}`)));
  return `<h1>Notes & Revision</h1><div class="chips">${j(tabs.map(([k, l]) => `<button class="chip ${V.ntab === k ? 'on' : ''}" data-a="ntab" data-id="${k}">${l}</button>`))}</div>
  <form class="card" data-f="note"><input type="hidden" name="id" value="${n.id || ''}"><div class="row"><input class="grow" name="title" placeholder="Title" required maxlength="100" value="${h(n.title)}"><select name="type">${j(tabs.slice(1).map(([k, l]) => `<option value="${k}" ${n.type === k ? 'selected' : ''}>${l}</option>`))}</select>
  <select name="subj">${opts(n.subj || V.sub)}</select><input name="unit" placeholder="Unit" maxlength="40" value="${h(n.unit)}" style="width:110px"></div>
  <textarea name="body" placeholder="Write here…" required>${h(n.body)}</textarea><div class="row" style="margin:8px 0 0"><button class="btn">${n.id ? 'Save' : 'Add'}</button>${n.id ? '<button type="button" class="btn alt" data-a="nCancel">Cancel</button>' : ''}</div></form>
  <div class="row"><input class="grow" placeholder="Search notes…" value="${h(V.q)}" data-c="nq"></div>
  ${list.length ? j(list.map(x => `<div class="card"><div class="row"><b class="grow">${x.pin ? '📌 ' : ''}${h(x.title)}</b><span class="tag">${h(sname(x.subj))}${x.unit ? ' · ' + h(x.unit) : ''}</span><span class="tag">${x.type}</span>
  <button class="ib" data-a="nPin" data-id="${x.id}">📌</button><button class="ib" data-a="nEdit" data-id="${x.id}">✏️</button><button class="ib" data-a="nDel" data-id="${x.id}">🗑</button></div><div style="white-space:pre-wrap;${x.type === 'formula' ? 'font-family:monospace' : ''}">${h(x.body)}</div></div>`)) : '<div class="empty">No notes yet.</div>'}
  <div class="card"><h2>Topics marked for revision</h2>${rev.length ? j(rev.map(r => `<div>🔁 ${h(r)}</div>`)) : '<p class="mu">Tick 🔁 next to a topic in My Subjects to list it here.</p>'}</div>`;
}

function prog_() {
  const all = S.subjects.reduce((a, s) => a + prog(s), 0) / S.subjects.length, tk = S.tasks.length ? S.tasks.filter(t => t.done).length / S.tasks.length * 100 : 0;
  const un = S.subjects.reduce((a, s) => a + s.units.length, 0), ud = S.subjects.reduce((a, s) => a + s.units.filter(u => u.done).length, 0);
  const d7 = lastDays(7).map(d => [d.toLocaleDateString('en-IN', { weekday: 'short' }), +hrs(mins(null, iso(d)))]);
  const wk = [3, 2, 1, 0].map(w => [w ? w + 'w ago' : 'This wk', +hrs(lastDays(7 * (w + 1)).slice(0, 7).reduce((a, d) => a + mins(null, iso(d)), 0))]);
  return `<h1>Progress</h1><div class="card dns">${donut(all, 'Syllabus')}${donut(un ? ud / un * 100 : 0, 'Units')}${donut(tk, 'Tasks')}<div class="dn"><b style="top:30px;font-size:2rem">${streak()}🔥</b><br><br><br><small class="mu">Day streak</small></div></div>
  <div class="card"><h2>Daily study hours (7 days)</h2>${cols(d7)}</div><div class="card"><h2>Weekly study hours</h2>${cols(wk)}</div>
  <div class="card"><h2>Subject-wise study time</h2>${j(S.subjects.map(s => row(s.short, mins() ? mins(s.id) / mins() * 100 : 0, hrs(mins(s.id)) + ' h')))}</div>
  <div class="card"><h2>Topic completion by subject</h2>${j(S.subjects.map(s => row(s.short, prog(s), Math.round(prog(s)) + '%')))}</div>`;
}

function set() {
  const x = S.set;
  return `<h1>Settings</h1><div class="card"><div class="row"><label>Name <input data-c="set" data-k="name" value="${h(x.name)}" maxlength="30"></label>
  <label>Theme <select data-c="set" data-k="theme"><option value="dark" ${x.theme === 'dark' ? 'selected' : ''}>Dark</option><option value="light" ${x.theme === 'light' ? 'selected' : ''}>Light</option></select></label></div>
  <div class="row"><label>Focus (min) <input type="number" min="1" max="180" style="width:80px" data-c="set" data-k="work" value="${x.work}"></label><label>Short break <input type="number" min="1" max="60" style="width:80px" data-c="set" data-k="short" value="${x.short}"></label>
  <label>Long break <input type="number" min="1" max="90" style="width:80px" data-c="set" data-k="long" value="${x.long}"></label></div></div>
  <div class="card"><h2>Backup</h2><div class="row"><button class="btn" data-a="export">Export data (JSON)</button><label class="btn alt">Import data<input type="file" accept=".json,application/json" data-c="import" hidden></label><button class="btn bad" data-a="reset">Reset everything</button></div>
  <p class="mu">All data lives only in this browser. Export regularly to keep a backup.</p></div>`;
}

const VIEW_FN = { dash, subj, plan, tasks, timer, cal, notes, prog: prog_, set };

/* ===== render ===== */
function render(animate = false) {
  document.documentElement.dataset.theme = S.set.theme;
  const nb = ([k, l]) => `<button class="${V.view === k ? 'on' : ''}" data-a="nav" data-id="${k}">${ic(k)}<span>${l}</span></button>`;
  const prim = VIEWS.filter(v => PRIM.includes(v[0])), rest = VIEWS.filter(v => !PRIM.includes(v[0]));
  $('#nav').innerHTML = `<div class="pill">${j(prim.map(nb))}<button class="more-btn ${V.more || rest.some(r => r[0] === V.view) ? 'on' : ''}" data-a="more">${ic('more')}<span>More</span></button></div><div class="sheet ${V.more ? 'open' : ''}">${j(rest.map(nb))}</div>`;
  $('#app').innerHTML = `<div class="${animate ? 'view-enter' : ''}">${VIEW_FN[V.view]()}</div>`;
  tick();
}
/* Runs every second: clock, exam countdown, timer display. */
function tick() {
  const c = $('#clk'), d = $('#cd'), tm = $('#tm'), n = nextExams()[0];
  if (c) c.textContent = new Date().toLocaleTimeString('en-IN');
  if (d) d.textContent = n ? cdText(examStart(n) - Date.now()) : '—';
  if (T.run) { T.left = Math.max(0, Math.round((T.end - Date.now()) / 1000)); if (!T.left) return finish(); }
  const t = `${String(Math.floor(T.left / 60)).padStart(2, '0')}:${String(T.left % 60).padStart(2, '0')}`;
  if (tm) {
    tm.textContent = t;
    if (T.run && !matchMedia('(prefers-reduced-motion: reduce)').matches) tm.animate(
      [{ transform: 'translateY(-3px)', opacity: .82 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
  document.title = T.run ? `${t} · Exam Prep` : 'Exam Prep Tracker';
}
function beep() {
  try { const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(); o.connect(a.destination); o.start(); o.stop(a.currentTime + .4); navigator.vibrate?.([300, 150, 300]); } catch (e) {}
}
/* Timer finished: log focus sessions, then switch to the right break. */
function finish() {
  T.run = false;
  if (T.mode === 'work') { S.sessions.push({ id: uid(), subj: T.subj, min: S.set.work, date: today() }); T.cycle++; save(); T.mode = T.cycle % 4 ? 'short' : 'long'; } else T.mode = 'work';
  T.left = S.set[T.mode] * 60; beep(); render(true);
}

/* ===== events ===== */
const go = (v) => { V.view = v; V.more = false; render(true); scrollTo(0, 0); };
const A = {
  nav: b => go(b.dataset.id), more: () => { V.more = !V.more; render(); }, sub: b => { V.sub = b.dataset.id; render(true); },
  exam: b => { const s = sb(b.dataset.id); V.cal = +s.date.slice(5, 7) - 1; V.day = s.date; go('cal'); },
  unitToggle: b => { V.foldedUnits[b.dataset.u] = !V.foldedUnits[b.dataset.u]; render(); },
  unitAdd: () => { sb(V.sub).units.push({ id: uid(), n: 'Unit ' + (sb(V.sub).units.length + 1), done: false, topics: [] }); save(); render(); },
  unitDel: b => { if (confirm('Delete this unit and its topics?')) { const s = sb(V.sub); s.units = s.units.filter(u => u.id !== b.dataset.u); save(); render(); } },
  topDel: b => { const u = unit(b.dataset.u); u.topics = u.topics.filter(t => t.id !== b.dataset.t); save(); render(); },
  impDel: b => { sb(V.sub).imp.splice(+b.dataset.i, 1); save(); render(); },
  pDel: b => { S.plan = S.plan.filter(p => p.id !== b.dataset.id); save(); render(); },
  tEdit: b => { V.et = b.dataset.id; if (V.view === 'cal') go('tasks'); else { render(); scrollTo(0, 0); } },
  tDel: b => { if (confirm('Delete this task?')) { S.tasks = S.tasks.filter(t => t.id !== b.dataset.id); save(); render(); } },
  cancelEdit: () => { V.et = null; render(); },
  month: b => { V.cal = +b.dataset.id; render(true); }, day: b => { V.day = b.dataset.id; render(); },
  tmode: b => { if (T.run) return; T.mode = b.dataset.id; T.left = S.set[T.mode] * 60; render(true); },
  tgo: () => { T.run = !T.run; if (T.run) T.end = Date.now() + T.left * 1000; render(true); },
  treset: () => { T.run = false; T.left = S.set[T.mode] * 60; render(true); },
  ntab: b => { V.ntab = b.dataset.id; render(true); },
  nPin: b => { const n = S.notes.find(x => x.id === b.dataset.id); n.pin = !n.pin; save(); render(); },
  nEdit: b => { V.en = b.dataset.id; render(); scrollTo(0, 0); }, nCancel: () => { V.en = null; render(); },
  nDel: b => { if (confirm('Delete this note?')) { S.notes = S.notes.filter(x => x.id !== b.dataset.id); save(); render(); } },
  export: () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
    a.download = `exam-prep-backup-${today()}.json`; a.click(); URL.revokeObjectURL(a.href);
  },
  reset: () => { if (confirm('Erase ALL data? This cannot be undone. Export a backup first.') && confirm('Really erase everything?')) { localStorage.removeItem(KEY); S = defaults(); render(); } }
};
const C = {
  sub: e => { const s = sb(V.sub), k = e.dataset.k, v = e.value.trim(); if (k === 'date' && !v) return render(); if (k === 'name' && !v) return render(); s[k] = v; },
  unit: e => { const u = unit(e.dataset.u), k = e.dataset.k; if (k === 'done') u.done = e.checked; else if (e.value.trim()) u.n = e.value.trim(); },
  top: e => { const t = topic(unit(e.dataset.u), e.dataset.t), k = e.dataset.k; if (k === 't') { if (e.value.trim()) t.t = e.value.trim(); } else t[k] = e.checked; },
  prac: e => { sb(V.sub).prac[e.dataset.k] = Math.max(0, parseInt(e.value) || 0); },
  subnotes: e => { sb(V.sub).notes = e.value; return false; },
  pdone: e => { const p = S.plan.find(x => x.id === e.dataset.id); if (e.checked) p.d = today(); else { p.d = null; p.m = 0; syncActual(p); } },
  pf: e => { const p = S.plan.find(x => x.id === e.dataset.id), k = e.dataset.k, v = e.value.trim(); if ((k === 'a' || k === 's' || k === 'e') && !v) return; p[k] = v; if (k === 'sj') syncActual(p); },
  pact: e => { const p = S.plan.find(x => x.id === e.dataset.id); p.m = Math.min(600, Math.max(0, parseInt(e.value) || 0)); p.d = p.m ? today() : p.d; syncActual(p); },
  tgl: e => { const t = task(e.dataset.id); t.done = e.checked; t.doneOn = e.checked ? today() : null; },
  tf: e => { V.tf[e.dataset.k] = e.value; },
  tsubj: e => { T.subj = e.value; return false; },
  nq: e => { V.q = e.value; },
  set: e => { const k = e.dataset.k; S.set[k] = e.type === 'number' ? Math.max(1, parseInt(e.value) || S.set[k]) : e.value.trim() || S.set[k]; if (!T.run) T.left = S.set[T.mode] * 60; },
  import: e => {
    const f = e.files[0]; if (!f) return; const r = new FileReader();
    r.onload = () => { try { const x = JSON.parse(r.result); if (!Array.isArray(x.subjects) || !Array.isArray(x.tasks)) throw 0; if (confirm('Replace current data with this backup?')) { S = { ...defaults(), ...x, set: { ...defaults().set, ...x.set } }; save(); render(); } } catch (err) { alert('That file is not a valid backup.'); } };
    r.readAsText(f);
  }
};
/* Keep planner "actual minutes" in step with the study-time totals. */
function syncActual(p) {
  S.sessions = S.sessions.filter(x => !(x.pid === p.id && x.date === today()));
  if (p.sj && p.m > 0 && p.d === today()) S.sessions.push({ id: uid(), pid: p.id, subj: p.sj, min: p.m, date: today() });
}
const bad = m => { alert(m); return false; };
const F = {
  topAdd: (f, d) => { const v = d.t.trim(); if (!v) return bad('Enter a topic name.'); unit(f.dataset.u).topics.push({ id: uid(), t: v, done: false, rev: false }); },
  impAdd: (f, d) => { if (!d.q.trim()) return bad('Enter a question.'); sb(V.sub).imp.push(d.q.trim()); },
  plan: (f, d) => { if (d.e <= d.s) return bad('End time must be after start time.'); S.plan.push({ id: uid(), s: d.s, e: d.e, a: d.a.trim(), sj: d.sj }); },
  task: (f, d) => {
    if (!d.title.trim()) return bad('Enter a task title.');
    if (d.date && d.due && d.due < d.date) return bad('Deadline cannot be before the task date.');
    const o = { title: d.title.trim(), subj: d.subj, kind: d.kind, pri: d.pri, date: d.date, due: d.due };
    if (d.id) Object.assign(task(d.id), o); else S.tasks.push({ id: uid(), done: false, ...o }); V.et = null;
  },
  note: (f, d) => {
    const o = { title: d.title.trim(), type: d.type, subj: d.subj, unit: d.unit.trim(), body: d.body.trim() };
    if (!o.title || !o.body) return bad('Title and text are required.');
    if (d.id) Object.assign(S.notes.find(x => x.id === d.id), o); else S.notes.push({ id: uid(), pin: false, ...o }); V.en = null;
  }
};
document.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b && A[b.dataset.a]) A[b.dataset.a](b); });
document.addEventListener('change', e => {
  const t = e.target, fn = C[t.dataset.c]; if (!fn) return;
  if (fn(t) !== false) { save(); render(); } else save();
});
document.addEventListener('submit', e => {
  const f = e.target; if (!f.dataset.f) return; e.preventDefault();
  if (F[f.dataset.f](f, Object.fromEntries(new FormData(f))) === false) return; save(); render();
});
setInterval(tick, 1000);
render();
