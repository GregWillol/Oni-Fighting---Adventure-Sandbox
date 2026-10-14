// - - - MAP & MODE LOADER - - -
const map = localStorage.getItem("MapNumber") === null ? 1 : parseInt(localStorage.getItem("MapNumber"));
const mode = localStorage.getItem("ModeNumber") === null ? 1 : parseInt(localStorage.getItem("ModeNumber"));
g.loadMode(mode);
g.loadMap(map);

InitPerkAudioSystem();

const Player1 = Fighter.createFighters(1);
// Load equipped Skin, Aura, Trail and Gamepasses bought in shop.html
(function applyShopLoadout() {
    const loadout = JSON.parse(localStorage.getItem('oni_active_loadout') || 'null');
    if (!loadout || !Player1) return;

    Player1.skinFilter = loadout.skinFilter || 'none';
    Player1.customTrailColor = loadout.trailColor || null;

    // Permanent stat upgrades
    if (loadout.bonusHp) {
        Player1.MaxHealthPoints += loadout.bonusHp;
        Player1.HealthPoints = Player1.MaxHealthPoints;
    }
    if (loadout.bonusDmg) Player1.Damage += loadout.bonusDmg;
    if (loadout.vipCoins) {
        Object.values(FIGHTER_STATS).forEach(st => { if (st.value) st.value *= 2; });
    }
    if (loadout.freeStartPerk) {
        const randId = Math.floor(Math.random() * 12) + 1;
        Mask.CreateMask(0, 0, randId).MaskTaken(Player1);
    }

    // Equip permanent Aura
    if (loadout.auraType === 'sprite1' || loadout.auraType === 'sprite2') {
        Player1.PoweredUp = true;
        if (loadout.auraType === 'sprite2' && typeof Aura2 !== 'undefined') {
            Aura1.image = Aura2.image;
            Aura1.scale = Aura2.scale;
            Aura1.offset = Aura2.offset;
        }
    } else if (loadout.auraType === 'procedural_gold') {
        Player1.PoweredUp = true;
        Player1.speedMult = (Player1.speedMult || 1) + 0.1;
    }
})();
g.Fighters = [Player1];

const Aura1 = Sprite.CreateAura(1);
const Aura2 = Sprite.CreateAura(2);

g.Pointers.push(FloatingPointers.createPointers(Player1));

function Gameloop(currentTime) {
    if (!g.FlagGame) return;

    if (g.roomState === "RESTART" && g.roundEnded && g.isPerked) {
        g.roomState = "FIGHTING";
        g.isPerked = false;
        g.startTimer();
    }

    if (!g.lastTime) g.lastTime = currentTime;
    let dt = (currentTime - g.lastTime) / (1000 / 60);
    g.lastTime = currentTime;

    if (isNaN(dt) || dt > 1.5 || dt < 0) dt = 1;

    if (g.hitStopFrames > 0) {
        g.hitStopFrames--;
        dt = 0;
    }

    c.save();
    if (g.cameraShake > 0) {
        const shakeX = (Math.random() - 0.5) * g.cameraShake;
        const shakeY = (Math.random() - 0.5) * g.cameraShake;
        c.translate(shakeX, shakeY);
        g.cameraShake *= 0.88;
        if (g.cameraShake < 0.25) g.cameraShake = 0;
    }

    const coinUI = document.getElementById('coin-counter');
    if (coinUI && Player1) {
        coinUI.innerText = `🪙 ${Player1.coins}`;
    }

    // - - - CAMERA & PARALLAX BACKGROUND - - -
    updateCamera();
    g.cameraMovement();

    // - - - PLATFORMS (Culled automatically via IsInViewport) - - -
    for (let i = 0; i < g.Platforms.length; i++) {
        g.Platforms[i].Draw();
    }

    // - - - OPEN WORLD SHRINES - - -
    for (let i = 0; i < g.WorldObjects.length; i++) {
        g.WorldObjects[i].update(dt);
    }

    // - - - BLUE JUMP ORBS FOR SKULL BOSS STOMP - - -
    for (let i = 0; i < g.BlueOrbs.length; i++) {
        g.BlueOrbs[i].update(dt);
    }

    if (Player1.PoweredUp && !Player1.Dead) {
        Aura1.update(dt);
    }

    // - - - SHOP MASKS - - -
    for (let i = g.PowerUps.length - 1; i >= 0; i--) {
        const mask = g.PowerUps[i];
        if (!mask) continue;
        if (mask.Placed && !mask.GotTaken) mask.update(dt);
        else if (mask.GotTaken) g.PowerUps.splice(i, 1);
    }

    // - - - FIGHTERS & SKULL BOSS - - -
    for (let i = 0; i < g.Fighters.length; i++) {
        const fighter = g.Fighters[i];
        HandleMovement(fighter);
        if (!fighter.imploded) fighter.update(dt);
    }

    // - - - BULLETS - - -
    for (let i = g.Bullets.length - 1; i >= 0; i--) {
        const b = g.Bullets[i];
        if (b && !b.hasHit && !b.Dead) b.update(dt);
        else g.Bullets.splice(i, 1);
    }

    // - - - SOUL ORBS - - -
    for (let i = g.SoulOrbs.length - 1; i >= 0; i--) {
        const orb = g.SoulOrbs[i];
        orb.update(dt);
        if (orb.dead) g.SoulOrbs.splice(i, 1);
    }

    // - - - ANIMATED PERK SPRITE VFX - - -
    for (let i = g.SpriteEffects.length - 1; i >= 0; i--) {
        const sfx = g.SpriteEffects[i];
        sfx.update(dt);
        if (sfx.dead) g.SpriteEffects.splice(i, 1);
    }

    // - - - VICTORY CHECK - - -
    CheckVictory({ player1: Player1, timerId: g.TimerIntervalId });

    // - - - POOLED FLOATING TEXT VFX (Returns dead objects to g.TextPool!) - - -
    for (let i = g.VisualEffects.length - 1; i >= 0; i--) {
        const effect = g.VisualEffects[i];
        effect.update();
        if (effect.dead) {
            g.VisualEffects.splice(i, 1);
            g.TextPool.push(effect); // Recycle into pool!
        }
    }

    // - - - HP POINTERS - - -
    for (let i = 0; i < g.Pointers.length; i++) {
        g.Pointers[i].update(dt);
    }

    // Restore Camera Space
    c.restore();

    // Draw Screen-Space HUD (Boss Health Bar + Open World Minimap)
    DrawOpenWorldHUD();

    // Restore Screen Shake
    c.restore();

    window.requestAnimationFrame(Gameloop);
}

if (typeof SoundManager !== 'undefined' && SoundManager.init) {
    SoundManager.init();
}

Gameloop();

// - - - KEYBOARD CONTROLS - - -
document.addEventListener("keydown", e => {
    e.preventDefault();
    const KeyPressed = e.key.toLowerCase();
    switch (KeyPressed) {
        case 'w': Player1.keys.up.pressed = true; break;
        case 'a': Player1.keys.left.pressed = true; Player1.LastKeyPressed = KeyPressed; break;
        case 's':
            if (!e.repeat && Player1.attackCooldown === 0 && !Player1.isAttacking) Player1.attack();
            break;
        case 'q':
            if (!e.repeat && Player1.attackCooldown === 0 && !Player1.isAttacking) Player1.keys.slam.pressed = true;
            break;
        case 'd': Player1.keys.right.pressed = true; Player1.LastKeyPressed = KeyPressed; break;
        case 'shift':
            if (!e.repeat) { Player1.keys.defend.pressed = true; Player1.LastKeyPressed = KeyPressed; }
            break;
        case 'e':
            if (!Player1.keys.interact) Player1.keys.interact = { pressed: false };
            Player1.keys.interact.pressed = true;
            Player1.LastKeyPressed = KeyPressed;
            break;
    }
});

document.addEventListener("keyup", e => {
    e.preventDefault();
    const KeyPressed = e.key.toLowerCase();
    switch (KeyPressed) {
        case 'w': Player1.keys.up.pressed = false; break;
        case 'a':
            Player1.keys.left.pressed = false;
            if (Player1.keys.right.pressed) Player1.LastKeyPressed = Player1.ControlKeys.right;
            break;
        case 'd':
            Player1.keys.right.pressed = false;
            if (Player1.keys.left.pressed) Player1.LastKeyPressed = Player1.ControlKeys.left;
            break;
        case 'shift': Player1.keys.defend.pressed = false; Player1.Defending = false; break;
        case 'e': if (Player1.keys.interact) Player1.keys.interact.pressed = false; break;
        case 'q': if (Player1.keys.slam.pressed) Player1.keys.slam.pressed = false; break;
    }
});

function initMobileControls() {
    const controls = [
        {
            id: 'btn-interact',
            key: 'interact',
            onPress: () => {
                if (Player1) {
                    if (!Player1.keys.interact) Player1.keys.interact = { pressed: false };
                    Player1.keys.interact.pressed = true;
                }
            }
        },
        { id: 'btn-up', key: 'up' },
        { id: 'btn-defend', key: 'defend' },
        {
            id: 'btn-attack',
            key: 'attack',
            onPress: () => {
                if (Player1 && Player1.attackCooldown === 0 && !Player1.isAttacking) Player1.attack();
            }
        },
        {
            id: 'btn-slam',
            key: 'slam',
            onPress: () => {
                if (Player1 && Player1.keys.slam && Player1.attackCooldown === 0 && !Player1.isAttacking) {
                    Player1.keys.slam.pressed = true;
                }
            }
        }
    ];

    controls.forEach(({ id, key, onPress }) => {
        const btn = document.getElementById(id);
        if (!btn) return;

        const handleStart = (e) => {
            e.preventDefault();
            if (!Player1 || !Player1.keys[key]) return;
            Player1.keys[key].pressed = true;
            if ((key === 'left' || key === 'right' || key === 'defend') && Player1.ControlKeys[key]) {
                Player1.LastKeyPressed = Player1.ControlKeys[key];
            }
            if (onPress) onPress();
        };

        const handleEnd = (e) => {
            e.preventDefault();
            if (Player1 && Player1.keys[key]) {
                Player1.keys[key].pressed = false;
                if (key === 'defend') Player1.Defending = false;
            }
        };

        btn.addEventListener('touchstart', handleStart, { passive: false });
        btn.addEventListener('touchend', handleEnd, { passive: false });
        btn.addEventListener('touchcancel', handleEnd, { passive: false });
    });
}

initMobileControls();

function initJoystick() {
    const zone = document.getElementById('joystick-zone');
    const base = document.getElementById('joystick-base');
    const knob = document.getElementById('joystick-knob');
    if (!zone || !base || !knob) return;

    const maxRadius = 45, deadzone = 12;
    let touchId = null, originX = 0, originY = 0;

    function setDirection(dx) {
        if (dx > deadzone) {
            Player1.keys.right.pressed = true;
            Player1.keys.left.pressed = false;
            Player1.LastKeyPressed = Player1.ControlKeys.right;
        } else if (dx < -deadzone) {
            Player1.keys.left.pressed = true;
            Player1.keys.right.pressed = false;
            Player1.LastKeyPressed = Player1.ControlKeys.left;
        } else {
            Player1.keys.left.pressed = false;
            Player1.keys.right.pressed = false;
        }
    }

    zone.addEventListener('touchstart', e => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        touchId = touch.identifier;
        originX = touch.clientX;
        originY = touch.clientY;
        base.style.left = `${originX}px`;
        base.style.top = `${originY}px`;
        base.style.opacity = '1';
        knob.style.transform = 'translate(-50%, -50%)';
    }, { passive: false });

    zone.addEventListener('touchmove', e => {
        if (touchId === null) return;
        const touch = [...e.changedTouches].find(t => t.identifier === touchId);
        if (!touch) return;
        e.preventDefault();
        const dx = touch.clientX - originX;
        const dy = touch.clientY - originY;
        const dist = Math.min(Math.hypot(dx, dy), maxRadius);
        const angle = Math.atan2(dy, dx);
        knob.style.transform = `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px))`;
        setDirection(dx);
    }, { passive: false });

    const endTouch = e => {
        const touch = [...e.changedTouches].find(t => t.identifier === touchId);
        if (!touch) return;
        touchId = null;
        base.style.opacity = '0';
        Player1.keys.left.pressed = false;
        Player1.keys.right.pressed = false;
    };

    zone.addEventListener('touchend', endTouch, { passive: false });
    zone.addEventListener('touchcancel', endTouch, { passive: false });
}

initJoystick();

if (g.PressToStart) {
    const handleStartGame = (e) => {
        e.preventDefault();
        g.startTimer();
        g.PressToStart.style.display = "none";
        if (typeof SoundManager !== 'undefined' && SoundManager.playMusic) {
            SoundManager.playMusic('intro');
        }
    };
    g.PressToStart.addEventListener('touchstart', handleStartGame, { once: true, passive: false });
    g.PressToStart.addEventListener('click', handleStartGame, { once: true });
}

const btnFullscreen = document.getElementById('btn-fullscreen');
if (btnFullscreen) {
    const toggleFullscreen = (e) => {
        e.preventDefault();
        e.target.blur();
        const gioco = document.getElementById('Gioco');
        if (!document.fullscreenElement) {
            if (gioco.requestFullscreen) gioco.requestFullscreen();
            else if (gioco.webkitRequestFullscreen) gioco.webkitRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
    };
    btnFullscreen.addEventListener('click', toggleFullscreen);
    btnFullscreen.addEventListener('touchend', toggleFullscreen);
}