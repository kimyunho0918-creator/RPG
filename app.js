let starters = [];
let selected = new Set();
let state = null;

const starterList = document.getElementById('starterList');
const starterBudget = document.getElementById('starterBudget');
const startRunBtn = document.getElementById('startRunBtn');
const resetSaveBtn = document.getElementById('resetSaveBtn');
const battleScreen = document.getElementById('battleScreen');
const actions = document.getElementById('actions');
const swapPanel = document.getElementById('swapPanel');
const rewardPanel = document.getElementById('rewardPanel');
const logEl = document.getElementById('log');
const runMeta = document.getElementById('runMeta');
const swapBtn = document.getElementById('swapBtn');

const ELEMENT_THEME = {
  Flame: { icon: '🔥', bg1: '#ff8b5f', bg2: '#8f3f3f', edge: '#ffd29d', aura: '#ff8d62' },
  Verdant: { icon: '🌿', bg1: '#71dc8c', bg2: '#2d7a58', edge: '#d8ffd8', aura: '#84f0a3' },
  Storm: { icon: '⚡', bg1: '#9cc4ff', bg2: '#4258bf', edge: '#f6f9ff', aura: '#7bb7ff' },
  Tide: { icon: '🌊', bg1: '#73d2ff', bg2: '#2f6cb5', edge: '#d8fbff', aura: '#84e8ff' },
  Umbral: { icon: '🌑', bg1: '#c191ff', bg2: '#56367d', edge: '#f0e7ff', aura: '#c09eff' },
  Radiant: { icon: '☀️', bg1: '#ffe07e', bg2: '#b97a29', edge: '#fff7d9', aura: '#ffd56b' },
  Frost: { icon: '❄️', bg1: '#b7f0ff', bg2: '#4c8fca', edge: '#f3ffff', aura: '#aeeaff' },
  Iron: { icon: '⛓️', bg1: '#dce4ef', bg2: '#66738f', edge: '#ffffff', aura: '#d4deeb' }
};

const SHAPES = {
  ember_lynx: { ears: 'polygon points="34,28 58,6 74,44" opacity="0.9"', rightEar: 'polygon points="186,28 162,6 146,44" opacity="0.9"', body: 'path d="M68 156 C82 110, 118 76, 146 76 C176 76, 198 98, 204 136 C208 164, 196 196, 168 212 C140 228, 96 224, 74 192 C66 180, 64 170, 68 156 Z"', accent: 'path d="M106 158 C118 140, 140 130, 160 132 C150 144, 144 162, 146 178 C130 182, 116 174, 106 158 Z"' },
  moss_torto: { shell: 'ellipse cx="128" cy="142" rx="72" ry="56"', body: 'path d="M60 158 C62 114, 88 88, 130 88 C182 88, 206 112, 208 152 C210 188, 190 212, 134 216 C78 220, 58 196, 60 158 Z"', accent: 'path d="M84 142 C98 120, 128 106, 162 114 C178 118, 190 126, 198 138 C172 144, 150 158, 130 178 C106 174, 92 162, 84 142 Z"' },
  volt_raven: { wingL: 'path d="M62 156 C42 124, 38 90, 56 74 C88 96, 100 134, 100 176 C86 176, 74 170, 62 156 Z"', wingR: 'path d="M194 156 C214 124, 218 90, 200 74 C168 96, 156 134, 156 176 C170 176, 182 170, 194 156 Z"', body: 'path d="M102 172 C92 122, 108 82, 130 76 C150 82, 164 122, 154 172 C148 198, 140 214, 128 214 C116 214, 108 198, 102 172 Z"', accent: 'polygon points="126,138 170,160 134,172"' },
  tide_manta: { fins: 'path d="M32 138 C74 82, 104 70, 128 78 C154 70, 182 82, 224 138 C194 132, 168 138, 128 174 C88 138, 62 132, 32 138 Z"', body: 'ellipse cx="128" cy="144" rx="58" ry="48"', accent: 'path d="M128 116 C142 132, 148 150, 144 174 C130 184, 116 184, 102 174 C98 150, 110 132, 128 116 Z"' },
  shade_mole: { body: 'ellipse cx="128" cy="156" rx="70" ry="54"', accent: 'path d="M84 132 C104 102, 142 98, 170 118 C154 132, 144 152, 142 174 C114 182, 92 166, 84 132 Z"', nose: 'circle cx="166" cy="156" r="12"' },
  auric_stag: { antlerL: 'path d="M82 88 C68 66, 62 44, 66 18 M82 88 C60 80, 44 66, 34 50 M82 70 C60 58, 48 42, 42 26"', antlerR: 'path d="M174 88 C188 66, 194 44, 190 18 M174 88 C196 80, 212 66, 222 50 M174 70 C196 58, 208 42, 214 26"', body: 'path d="M74 164 C74 122, 98 92, 128 92 C158 92, 182 122, 182 164 C182 200, 160 222, 128 222 C96 222, 74 200, 74 164 Z"', accent: 'path d="M98 158 C112 134, 146 128, 168 144 C156 166, 140 182, 120 190 C104 184, 96 174, 98 158 Z"' },
  frost_pika: { ears: 'ellipse cx="84" cy="48" rx="18" ry="38"', rightEar: 'ellipse cx="172" cy="48" rx="18" ry="38"', body: 'ellipse cx="128" cy="154" rx="66" ry="58"', accent: 'path d="M86 148 C104 126, 148 120, 174 144 C164 170, 146 186, 116 188 C96 178, 86 166, 86 148 Z"' },
  iron_hound: { earL: 'polygon points="76,72 100,24 114,86"', earR: 'polygon points="180,72 156,24 142,86"', body: 'path d="M66 166 C60 126, 86 88, 126 84 C176 80, 202 112, 200 162 C198 202, 172 224, 126 224 C88 224, 72 202, 66 166 Z"', accent: 'path d="M94 150 C116 126, 152 126, 172 148 C158 174, 142 190, 118 194 C100 186, 92 172, 94 150 Z"' }
};

function totalCost() {
  return [...selected].reduce((sum, id) => sum + starters.find((s) => s.id === id).cost, 0);
}

function esc(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function biomeClass(name) {
  const v = String(name || '').toLowerCase();
  if (v.includes('verdant')) return 'biome-verdant';
  if (v.includes('cinder')) return 'biome-cinder';
  if (v.includes('glacier') || v.includes('frost')) return 'biome-glacier';
  if (v.includes('iron')) return 'biome-iron';
  return 'biome-astral';
}

function speciesBaseId(unit) {
  return (unit.speciesId || '').replace(/^boss_/, '');
}

function elementTheme(element) {
  return ELEMENT_THEME[element] || { icon: '✦', bg1: '#8cc2ff', bg2: '#495c9f', edge: '#eef6ff', aura: '#8cc2ff' };
}

function portraitData(unit, scale = 1) {
  const baseId = speciesBaseId(unit);
  const theme = elementTheme(unit.element);
  const shape = SHAPES[baseId] || SHAPES.ember_lynx;
  const eyeY = 126;
  const earL = shape.ears || shape.earL || '';
  const earR = shape.rightEar || shape.earR || '';
  const shell = shape.shell || '';
  const wings = `${shape.wingL || ''}${shape.wingR || ''}`;
  const fins = shape.fins || '';
  const antlers = `${shape.antlerL ? `<g stroke="${theme.edge}" stroke-width="8" stroke-linecap="round" fill="none">${shape.antlerL}</g>` : ''}${shape.antlerR ? `<g stroke="${theme.edge}" stroke-width="8" stroke-linecap="round" fill="none">${shape.antlerR}</g>` : ''}`;
  const nose = shape.nose ? `<g fill="#1c243f">${shape.nose}</g>` : '';
  const bossRing = String(unit.name || '').startsWith('Boss ') ? `<circle cx="128" cy="128" r="108" fill="none" stroke="rgba(255,215,107,0.75)" stroke-width="6" stroke-dasharray="10 10"/>` : '';
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <defs>
      <radialGradient id="bg" cx="50%" cy="36%">
        <stop offset="0%" stop-color="${theme.bg1}" stop-opacity="0.95"/>
        <stop offset="65%" stop-color="${theme.bg2}" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="#11192f" stop-opacity="1"/>
      </radialGradient>
      <radialGradient id="glow" cx="50%" cy="50%">
        <stop offset="0%" stop-color="${theme.aura}" stop-opacity="0.65"/>
        <stop offset="100%" stop-color="${theme.aura}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="body" x1="0" x2="1">
        <stop offset="0%" stop-color="${theme.edge}"/>
        <stop offset="100%" stop-color="${theme.bg1}"/>
      </linearGradient>
      <linearGradient id="accent" x1="0" x2="1">
        <stop offset="0%" stop-color="#fff8e8"/>
        <stop offset="100%" stop-color="${theme.edge}"/>
      </linearGradient>
    </defs>
    <rect width="256" height="256" rx="40" fill="url(#bg)"/>
    <circle cx="128" cy="104" r="86" fill="url(#glow)"/>
    ${bossRing}
    <g transform="scale(${scale}) translate(${(256 - 256 * scale) / (2 * scale)}, ${(256 - 256 * scale) / (2 * scale)})">
      <g fill="url(#body)" stroke="rgba(255,255,255,0.18)" stroke-width="3">
        ${earL}
        ${earR}
        ${shell}
        ${wings}
        ${fins}
        ${shape.body || ''}
      </g>
      ${antlers}
      <g fill="url(#accent)" opacity="0.9">${shape.accent || ''}</g>
      ${nose}
      <g fill="#14203b">
        <ellipse cx="108" cy="${eyeY}" rx="8" ry="11"/>
        <ellipse cx="148" cy="${eyeY}" rx="8" ry="11"/>
      </g>
      <g fill="#fff">
        <circle cx="111" cy="${eyeY-2}" r="2.2"/>
        <circle cx="151" cy="${eyeY-2}" r="2.2"/>
      </g>
      <path d="M114 170 Q128 180 142 170" stroke="#18233d" stroke-width="5" stroke-linecap="round" fill="none"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function elementBadge(element) {
  const t = elementTheme(element);
  return `<span class="element-badge">${t.icon} ${esc(element)}</span>`;
}

function renderStarters() {
  starterBudget.textContent = `Budget: ${totalCost()} / 10`;
  starterList.innerHTML = starters.map((s) => {
    const isSelected = selected.has(s.id);
    return `
      <button class="starter-card ${isSelected ? 'selected' : ''}" data-id="${s.id}">
        <div class="card-head">
          <div class="portrait"><img src="${portraitData(s)}" alt="${esc(s.name)} portrait" /></div>
          <div>
            <h3>${esc(s.name)} <span class="tier-tag">[${s.cost}]</span></h3>
            <div class="row"><span>${elementBadge(s.element)}</span><span>${esc(s.skill.name)}</span></div>
          </div>
        </div>
        <div class="statline">
          <div class="stat-pill">HP ${s.maxHp}</div>
          <div class="stat-pill">ATK ${s.atk}</div>
          <div class="stat-pill">DEF ${s.def}</div>
          <div class="stat-pill">SPD ${s.spd}</div>
        </div>
      </button>
    `;
  }).join('');

  document.querySelectorAll('.starter-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      if (selected.has(id)) selected.delete(id);
      else {
        const nextCost = totalCost() + starters.find((s) => s.id === id).cost;
        if (nextCost <= 10) selected.add(id);
      }
      renderStarters();
    });
  });
}

function hpPct(unit) {
  return Math.max(0, Math.round((unit.hp / unit.maxHp) * 100));
}

function memberCard(unit, active = false) {
  return `
    <div class="member ${active ? 'active' : ''}">
      <div class="member-portrait"><img src="${portraitData(unit, 0.92)}" alt="${esc(unit.name)} portrait" /></div>
      <div>
        <h3>${esc(unit.name)}</h3>
        <div class="row"><span>HP ${unit.hp}/${unit.maxHp}</span><span>${unit.hp > 0 ? 'Ready' : 'Down'}</span></div>
        <div class="member-status">${esc(unit.element)} · Lv.${unit.level}</div>
      </div>
    </div>
  `;
}

function statBox(label, value) {
  return `<div class="info-card"><strong>${label}</strong>${value}</div>`;
}

function renderBattle() {
  if (!state) {
    battleScreen.className = 'battle-screen empty';
    battleScreen.textContent = 'No run active.';
    actions.classList.add('hidden');
    rewardPanel.classList.add('hidden');
    swapPanel.classList.add('hidden');
    runMeta.textContent = 'Choose starters and begin a run.';
    return;
  }

  const ally = state.player.team[state.player.activeIndex];
  const enemy = state.enemy.creature;
  const biomeCls = biomeClass(state.enemy.biome);

  battleScreen.className = 'battle-screen';
  battleScreen.innerHTML = `
    <div class="battle-side player">
      <div class="side-header">
        <div>
          <div class="big-name">${esc(ally.name)} Lv.${ally.level}</div>
          <div class="unit-meta">
            ${elementBadge(ally.element)}
            <span class="meta-chip">Guard ${ally.guard}</span>
            <span class="meta-chip">${esc(ally.skill.name)}</span>
          </div>
        </div>
      </div>

      <div class="stage ${biomeCls}">
        <div class="stage-portrait"><img src="${portraitData(ally, 1.02)}" alt="${esc(ally.name)} stage portrait" /></div>
      </div>

      <div class="hpbar"><div class="hpfill" style="width:${hpPct(ally)}%"></div></div>
      <div class="row"><span>HP ${ally.hp} / ${ally.maxHp}</span><span>ATK ${ally.atk + ally.tempAtk} · DEF ${ally.def}</span></div>

      <div class="unit-stats">
        ${statBox('Skill', esc(ally.skill.name))}
        ${statBox('Status', ally.stunned ? 'Stunned' : 'Ready')}
      </div>

      <div class="team">
        ${state.player.team.map((m, i) => memberCard(m, i === state.player.activeIndex)).join('')}
      </div>
    </div>

    <div class="battle-side enemy enemy">
      <div class="side-header">
        <div>
          <div class="big-name">${esc(enemy.name)} Lv.${enemy.level}</div>
          <div class="unit-meta">
            ${elementBadge(enemy.element)}
            <span class="meta-chip">${esc(state.enemy.biome)}${state.enemy.boss ? ' · Boss' : ''}</span>
            <span class="meta-chip">${esc(enemy.skill.name)}</span>
          </div>
        </div>
      </div>

      <div class="stage ${biomeCls}">
        <div class="stage-portrait"><img src="${portraitData(enemy, 1.05)}" alt="${esc(enemy.name)} stage portrait" /></div>
      </div>

      <div class="hpbar"><div class="hpfill" style="width:${hpPct(enemy)}%"></div></div>
      <div class="row"><span>HP ${enemy.hp} / ${enemy.maxHp}</span><span>ATK ${enemy.atk} · DEF ${enemy.def}</span></div>

      <div class="unit-stats">
        ${statBox('Threat', state.enemy.boss ? 'Boss Wave' : 'Wild Encounter')}
        ${statBox('Skill', esc(enemy.skill.name))}
      </div>
    </div>
  `;

  runMeta.textContent = `Wave ${state.wave} · Gold ${state.gold} · Relics ${state.relics.length} · ${state.over ? (state.victory ? 'Victory' : 'Defeat') : 'Run Active'}`;
  actions.classList.toggle('hidden', state.pendingReward || state.over);
  rewardPanel.classList.toggle('hidden', !state.pendingReward);
  swapPanel.classList.add('hidden');
  swapBtn.disabled = state.player.team.filter((m) => m.hp > 0).length <= 1;

  if (state.pendingReward) {
    rewardPanel.innerHTML = `<h2>Choose a Reward</h2>${state.rewardChoices.map((r, i) => `
      <button class="reward-card" data-reward="${i}">
        <h3>${esc(r.label)}</h3>
        <div class="hint">${esc(r.description)}</div>
      </button>
    `).join('')}`;
    rewardPanel.querySelectorAll('[data-reward]').forEach((btn) => {
      btn.addEventListener('click', () => {
        try {
          state = window.MonsterRiftGame.chooseReward(Number(btn.dataset.reward));
          renderAll();
        } catch (err) {
          alert(err.message);
        }
      });
    });
  }

  if (state.over) {
    rewardPanel.classList.remove('hidden');
    rewardPanel.innerHTML = `
      <h2>${state.victory ? 'Rift Sealed' : 'Run Over'}</h2>
      <div class="reward-card">
        <div class="hint">${state.victory ? 'You cleared 20 waves and won the prototype run.' : 'Your team was defeated. Draft a new team and try again.'}</div>
      </div>
    `;
  }
}

function renderLog() {
  logEl.innerHTML = (state?.log || ['Waiting for action...'])
    .slice()
    .reverse()
    .map((entry) => `<div class="log-item">${esc(entry)}</div>`)
    .join('');
}

function renderAll() {
  renderStarters();
  renderBattle();
  renderLog();
}

startRunBtn.addEventListener('click', () => {
  if (selected.size === 0) {
    alert('Pick at least one starter.');
    return;
  }
  try {
    state = window.MonsterRiftGame.createRun([...selected]);
    renderAll();
  } catch (err) {
    alert(err.message);
  }
});

resetSaveBtn.addEventListener('click', () => {
  window.MonsterRiftGame.clearRun();
  state = null;
  selected = new Set();
  renderAll();
});

actions.querySelectorAll('[data-action]').forEach((btn) => {
  btn.addEventListener('click', () => {
    try {
      state = window.MonsterRiftGame.doPlayerAction({ type: btn.dataset.action });
      renderAll();
    } catch (err) {
      alert(err.message);
    }
  });
});

swapBtn.addEventListener('click', () => {
  if (!state) return;
  swapPanel.classList.toggle('hidden');
  swapPanel.innerHTML = state.player.team.map((m, i) => `
    <button class="member small" data-swap="${i}" ${m.hp <= 0 || i === state.player.activeIndex ? 'disabled' : ''}>
      <div class="member-portrait"><img src="${portraitData(m, 0.92)}" alt="${esc(m.name)} portrait" /></div>
      <div>
        <h3>${esc(m.name)}</h3>
        <div class="row"><span>HP ${m.hp}/${m.maxHp}</span><span>${esc(m.element)}</span></div>
      </div>
    </button>
  `).join('');
  swapPanel.querySelectorAll('[data-swap]').forEach((btn) => {
    btn.addEventListener('click', () => {
      try {
        state = window.MonsterRiftGame.doPlayerAction({ type: 'swap', index: Number(btn.dataset.swap) });
        renderAll();
      } catch (err) {
        alert(err.message);
      }
    });
  });
});

function boot() {
  starters = window.MonsterRiftGame.serializeStarterCatalog();
  state = window.MonsterRiftGame.loadRun();
  if (state) {
    selected = new Set(state.player.team.map((m) => m.speciesId));
  }
  renderAll();
}

boot();
