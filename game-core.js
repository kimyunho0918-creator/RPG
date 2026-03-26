
(function () {
  const STORAGE_KEY = 'monsterrift_static_save_v1';

  const BIOMES = ['Verdant Grove', 'Ash Dunes', 'Glacier Span', 'Storm Basin', 'Twilight Hollow'];
  const SPECIES = [
    { id: 'ember_lynx', name: 'Ember Lynx', cost: 4, element: 'Flame', maxHp: 92, atk: 18, def: 9, spd: 15, skill: { name: 'Cinder Rush', power: 30, recoil: 4 } },
    { id: 'moss_torto', name: 'Moss Torto', cost: 3, element: 'Verdant', maxHp: 118, atk: 13, def: 16, spd: 7, skill: { name: 'Root Shelter', shield: 10, heal: 8 } },
    { id: 'volt_raven', name: 'Volt Raven', cost: 4, element: 'Storm', maxHp: 84, atk: 20, def: 8, spd: 18, skill: { name: 'Chain Peck', power: 26, stunChance: 0.25 } },
    { id: 'tide_manta', name: 'Tide Manta', cost: 3, element: 'Tide', maxHp: 98, atk: 14, def: 11, spd: 13, skill: { name: 'Foam Mend', heal: 24 } },
    { id: 'shade_mole', name: 'Shade Mole', cost: 2, element: 'Umbral', maxHp: 88, atk: 16, def: 10, spd: 12, skill: { name: 'Burrow Strike', power: 22, guard: 8 } },
    { id: 'auric_stag', name: 'Auric Stag', cost: 5, element: 'Radiant', maxHp: 100, atk: 22, def: 12, spd: 14, skill: { name: 'Sunlance', power: 34 } },
    { id: 'frost_pika', name: 'Frost Pika', cost: 2, element: 'Frost', maxHp: 76, atk: 14, def: 9, spd: 19, skill: { name: 'Hail Needle', power: 20, slow: 3 } },
    { id: 'iron_hound', name: 'Iron Hound', cost: 5, element: 'Iron', maxHp: 108, atk: 21, def: 14, spd: 11, skill: { name: 'Howl Drive', power: 28, selfBuff: 3 } }
  ];

  let currentRun = null;

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return `mr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function deepCopy(v) { return JSON.parse(JSON.stringify(v)); }

  function serializeStarterCatalog() {
    return SPECIES.map(({ id, name, cost, element, maxHp, atk, def, spd, skill }) => ({ id, name, cost, element, maxHp, atk, def, spd, skill }));
  }

  function makeCreatureFromSpecies(speciesId, level = 1, elite = false) {
    const base = SPECIES.find((s) => s.id === speciesId);
    if (!base) throw new Error(`Unknown species: ${speciesId}`);
    const scale = 1 + (level - 1) * 0.18 + (elite ? 0.18 : 0);
    return {
      uid: uid(),
      speciesId: base.id,
      name: base.name,
      element: base.element,
      level,
      maxHp: Math.round(base.maxHp * scale),
      hp: Math.round(base.maxHp * scale),
      atk: Math.round(base.atk * scale),
      def: Math.round(base.def * scale),
      spd: Math.round(base.spd * scale),
      guard: 0,
      tempAtk: 0,
      stunned: false,
      skill: { ...base.skill }
    };
  }

  function generateEncounter(wave) {
    const boss = wave % 5 === 0;
    const level = clamp(Math.ceil(wave / 2), 1, 50);
    const species = pick(SPECIES);
    const creature = makeCreatureFromSpecies(species.id, level, boss);
    if (boss) {
      creature.name = `Boss ${creature.name}`;
      creature.maxHp = Math.round(creature.maxHp * 1.25);
      creature.hp = creature.maxHp;
      creature.atk += 4;
      creature.def += 3;
    }
    return {
      biome: BIOMES[Math.floor((wave - 1) / 5) % BIOMES.length],
      boss,
      creature
    };
  }

  function activeAlly(run) { return run.player.team[run.player.activeIndex]; }
  function calcDamage(attacker, defender, power = 0) {
    const raw = attacker.atk + attacker.tempAtk + randInt(1, 5) + power - Math.floor((defender.def + defender.guard) * 0.55);
    return Math.max(4, raw);
  }
  function pushLog(run, text) {
    run.log.push(text);
    if (run.log.length > 14) run.log.shift();
  }
  function cleanTempState(creature) {
    creature.guard = 0;
    if (creature.tempAtk > 0) creature.tempAtk -= 1;
  }
  function saveRun() {
    if (!currentRun) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentRun));
  }
  function loadRun() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      currentRun = JSON.parse(raw);
      return deepCopy(currentRun);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      currentRun = null;
      return null;
    }
  }
  function clearRun() {
    currentRun = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  function createRun(starterIds) {
    if (!Array.isArray(starterIds) || starterIds.length === 0) throw new Error('Pick at least one starter.');
    const totalCost = starterIds.reduce((sum, id) => {
      const s = SPECIES.find((x) => x.id === id);
      if (!s) throw new Error(`Invalid starter: ${id}`);
      return sum + s.cost;
    }, 0);
    if (totalCost > 10) throw new Error('Starter cost cannot exceed 10.');

    currentRun = {
      id: uid(),
      wave: 1,
      biomeIndex: 0,
      gold: 30,
      relics: [],
      log: ['A new Rift run begins.'],
      rewardChoices: [],
      pendingReward: false,
      over: false,
      victory: false,
      player: {
        team: starterIds.map((sid) => makeCreatureFromSpecies(sid, 1)),
        activeIndex: 0
      },
      enemy: generateEncounter(1),
      turn: 'player'
    };
    saveRun();
    return deepCopy(currentRun);
  }

  function applyEnemyTurn(run) {
    if (run.over || run.pendingReward) return;
    const enemy = run.enemy.creature;
    const ally = activeAlly(run);
    if (enemy.hp <= 0 || ally.hp <= 0) return;

    if (enemy.stunned) {
      enemy.stunned = false;
      pushLog(run, `${enemy.name} is stunned and misses the turn.`);
      cleanTempState(enemy);
      run.turn = 'player';
      return;
    }

    const skillChance = Math.random();
    if (skillChance < 0.3 && enemy.skill.heal && enemy.hp < enemy.maxHp * 0.6) {
      enemy.hp = clamp(enemy.hp + enemy.skill.heal, 0, enemy.maxHp);
      pushLog(run, `${enemy.name} uses ${enemy.skill.name} and recovers ${enemy.skill.heal} HP.`);
    } else if (skillChance < 0.6) {
      const dmg = calcDamage(enemy, ally, enemy.skill.power || 10);
      ally.hp = clamp(ally.hp - dmg, 0, ally.maxHp);
      pushLog(run, `${enemy.name} uses ${enemy.skill.name} for ${dmg} damage.`);
      if (enemy.skill.stunChance && Math.random() < enemy.skill.stunChance) {
        ally.stunned = true;
        pushLog(run, `${ally.name} is stunned.`);
      }
    } else {
      const dmg = calcDamage(enemy, ally, 0);
      ally.hp = clamp(ally.hp - dmg, 0, ally.maxHp);
      pushLog(run, `${enemy.name} attacks for ${dmg} damage.`);
    }

    cleanTempState(enemy);
    if (ally.hp <= 0) {
      pushLog(run, `${ally.name} falls.`);
      const nextIndex = run.player.team.findIndex((c) => c.hp > 0);
      if (nextIndex >= 0) {
        run.player.activeIndex = nextIndex;
        pushLog(run, `${run.player.team[nextIndex].name} enters the battle.`);
      } else {
        run.over = true;
        run.victory = false;
        pushLog(run, 'Your expedition has ended in the Rift.');
      }
    }
    run.turn = 'player';
  }

  function maybeReward(run) {
    const enemy = run.enemy.creature;
    if (enemy.hp > 0) return;
    const payout = 10 + run.wave * 3;
    run.gold += payout;
    pushLog(run, `${enemy.name} is defeated. You gain ${payout} gold.`);
    run.pendingReward = true;
    const recruitPool = SPECIES.filter((s) => !run.player.team.some((t) => t.speciesId === s.id));
    const recruitSpecies = recruitPool.length ? pick(recruitPool) : null;
    run.rewardChoices = [
      { type: 'heal_all', label: 'Campfire', description: 'Heal all allies by 28 HP.' },
      { type: 'relic', label: 'Ancient Relic', description: 'Gain +2 attack for the whole team this run.' },
      recruitSpecies ? { type: 'recruit', label: `Recruit ${recruitSpecies.name}`, description: `Add ${recruitSpecies.name} to your team.`, speciesId: recruitSpecies.id } : { type: 'gold', label: 'Treasure Cache', description: 'Gain 35 extra gold.' },
    ];
  }

  function doPlayerAction(action) {
    const run = currentRun;
    if (!run) throw new Error('Run not found. Start a new run first.');
    if (run.over) throw new Error('The run is over. Start a new one.');
    if (run.pendingReward) throw new Error('Choose a reward before continuing.');
    if (run.turn !== 'player') throw new Error('It is not your turn.');

    const ally = activeAlly(run);
    const enemy = run.enemy.creature;
    if (ally.hp <= 0) throw new Error('Active ally is down.');

    if (ally.stunned) {
      ally.stunned = false;
      pushLog(run, `${ally.name} is stunned and loses the turn.`);
      cleanTempState(ally);
      run.turn = 'enemy';
      applyEnemyTurn(run);
      saveRun();
      return deepCopy(run);
    }

    switch (action.type) {
      case 'attack': {
        const dmg = calcDamage(ally, enemy, 0);
        enemy.hp = clamp(enemy.hp - dmg, 0, enemy.maxHp);
        pushLog(run, `${ally.name} attacks for ${dmg} damage.`);
        break;
      }
      case 'skill': {
        const skill = ally.skill;
        if (skill.heal) {
          ally.hp = clamp(ally.hp + skill.heal, 0, ally.maxHp);
          pushLog(run, `${ally.name} uses ${skill.name} and recovers ${skill.heal} HP.`);
        }
        if (skill.shield) {
          ally.guard += skill.shield;
          pushLog(run, `${ally.name} gains ${skill.shield} guard.`);
        }
        if (skill.power) {
          const dmg = calcDamage(ally, enemy, skill.power);
          enemy.hp = clamp(enemy.hp - dmg, 0, enemy.maxHp);
          pushLog(run, `${ally.name} uses ${skill.name} for ${dmg} damage.`);
        }
        if (skill.recoil) {
          ally.hp = clamp(ally.hp - skill.recoil, 0, ally.maxHp);
          pushLog(run, `${ally.name} takes ${skill.recoil} recoil damage.`);
        }
        if (skill.stunChance && Math.random() < skill.stunChance) {
          enemy.stunned = true;
          pushLog(run, `${enemy.name} is stunned.`);
        }
        if (skill.guard) {
          ally.guard += skill.guard;
          pushLog(run, `${ally.name} gains ${skill.guard} guard.`);
        }
        if (skill.selfBuff) {
          ally.tempAtk += skill.selfBuff;
          pushLog(run, `${ally.name}'s attack rises by ${skill.selfBuff}.`);
        }
        break;
      }
      case 'guard': {
        ally.guard += 12;
        pushLog(run, `${ally.name} braces and gains 12 guard.`);
        break;
      }
      case 'swap': {
        const nextIndex = Number(action.index);
        if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= run.player.team.length) throw new Error('Invalid swap target.');
        if (run.player.team[nextIndex].hp <= 0) throw new Error('That ally has fainted.');
        if (nextIndex === run.player.activeIndex) throw new Error('That ally is already active.');
        run.player.activeIndex = nextIndex;
        pushLog(run, `You swap to ${run.player.team[nextIndex].name}.`);
        break;
      }
      default:
        throw new Error('Unknown action.');
    }

    cleanTempState(ally);
    if (enemy.hp <= 0) {
      maybeReward(run);
      saveRun();
      return deepCopy(run);
    }

    run.turn = 'enemy';
    applyEnemyTurn(run);
    saveRun();
    return deepCopy(run);
  }

  function chooseReward(choiceIndex) {
    const run = currentRun;
    if (!run) throw new Error('Run not found.');
    if (!run.pendingReward) throw new Error('No reward is pending.');
    const choice = run.rewardChoices[choiceIndex];
    if (!choice) throw new Error('Invalid reward choice.');

    switch (choice.type) {
      case 'heal_all':
        run.player.team.forEach((c) => { if (c.hp > 0) c.hp = clamp(c.hp + 28, 0, c.maxHp); });
        pushLog(run, 'The team rests at a campfire and recovers health.');
        break;
      case 'relic':
        run.relics.push('War Sigil');
        run.player.team.forEach((c) => { c.atk += 2; });
        pushLog(run, 'An Ancient Relic empowers your whole team.');
        break;
      case 'gold':
        run.gold += 35;
        pushLog(run, 'You pocket extra treasure.');
        break;
      case 'recruit':
        if (run.player.team.length >= 5) {
          run.gold += 25;
          pushLog(run, 'Your team is full, so the recruit brings you supplies instead.');
        } else {
          const recruit = makeCreatureFromSpecies(choice.speciesId, Math.max(1, Math.floor(run.wave / 2)));
          run.player.team.push(recruit);
          pushLog(run, `${recruit.name} joins your expedition.`);
        }
        break;
    }

    run.pendingReward = false;
    run.rewardChoices = [];
    run.wave += 1;
    if (run.wave > 20) {
      run.over = true;
      run.victory = true;
      pushLog(run, 'You conquer the 20th wave and seal the Rift.');
    } else {
      run.enemy = generateEncounter(run.wave);
      run.turn = 'player';
      const nextAlive = run.player.team.findIndex((c) => c.hp > 0);
      run.player.activeIndex = nextAlive >= 0 ? nextAlive : 0;
    }
    saveRun();
    return deepCopy(run);
  }

  window.MonsterRiftGame = {
    serializeStarterCatalog,
    createRun,
    doPlayerAction,
    chooseReward,
    loadRun,
    clearRun,
    getRun: () => currentRun ? deepCopy(currentRun) : null,
  };
})();
