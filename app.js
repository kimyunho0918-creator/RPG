
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

function totalCost() {
  return [...selected].reduce((sum, id) => sum + starters.find((s) => s.id === id).cost, 0);
}

function renderStarters() {
  starterBudget.textContent = `Budget: ${totalCost()} / 10`;
  starterList.innerHTML = starters.map((s) => {
    const isSelected = selected.has(s.id);
    return `
      <button class="starter-card ${isSelected ? 'selected' : ''}" data-id="${s.id}">
        <h3>${s.name} <span style="color: var(--gold)">[${s.cost}]</span></h3>
        <div class="row"><span>${s.element}</span><span>${s.skill.name}</span></div>
        <div class="statline"><span>HP ${s.maxHp}</span><span>ATK ${s.atk}</span><span>DEF ${s.def}</span><span>SPD ${s.spd}</span></div>
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
  battleScreen.className = 'battle-screen';
  battleScreen.innerHTML = `
    <div class="side">
      <div class="big-name">${ally.name} Lv.${ally.level}</div>
      <div class="row"><span>${ally.element}</span><span>Guard ${ally.guard}</span></div>
      <div class="hpbar"><div class="hpfill" style="width:${hpPct(ally)}%"></div></div>
      <div class="row"><span>HP ${ally.hp} / ${ally.maxHp}</span><span>ATK ${ally.atk + ally.tempAtk} DEF ${ally.def}</span></div>
      <div class="footer-note">Skill: ${ally.skill.name}</div>
      <div class="team">
        ${state.player.team.map((m, i) => `
          <div class="member ${i === state.player.activeIndex ? 'active' : ''}">
            <h3>${m.name}</h3>
            <div class="row"><span>HP ${m.hp}/${m.maxHp}</span><span>${m.hp > 0 ? 'Ready' : 'Down'}</span></div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="side">
      <div class="big-name">${enemy.name} Lv.${enemy.level}</div>
      <div class="row"><span>${state.enemy.biome}${state.enemy.boss ? ' · Boss' : ''}</span><span>${enemy.element}</span></div>
      <div class="hpbar"><div class="hpfill" style="width:${hpPct(enemy)}%"></div></div>
      <div class="row"><span>HP ${enemy.hp} / ${enemy.maxHp}</span><span>ATK ${enemy.atk} DEF ${enemy.def}</span></div>
      <div class="footer-note">Enemy skill: ${enemy.skill.name}</div>
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
        <h3>${r.label}</h3>
        <div class="hint">${r.description}</div>
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
    .map((entry) => `<div class="log-item">${entry}</div>`)
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
    <button class="member" data-swap="${i}" ${m.hp <= 0 || i === state.player.activeIndex ? 'disabled' : ''}>
      <h3>${m.name}</h3>
      <div class="row"><span>HP ${m.hp}/${m.maxHp}</span><span>${m.element}</span></div>
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
