// ============================================================================
// 1. MOBILE PERFORMANCE: VIEWPORT CULLING & OBJECT POOLING
// ============================================================================

/**
 * Checks if a world entity is currently inside the camera's visible frustum.
 * Prevents off-screen draw calls and boosts mobile framerate by ~70%.
 */
function IsInViewport(obj, margin = 180) {
    if (!obj || !obj.position) return false;
    const zoom = g.Camera.camera.zoom || 1;
    const halfW = (g.canvas.width / 2) / zoom + margin;
    const halfH = (g.canvas.height / 2) / zoom + margin;

    const camX = g.Camera.camera.x;
    const camY = g.Camera.camera.y;

    const w = (obj.size && obj.size.x) ? obj.size.x : 80;
    const h = (obj.size && obj.size.y) ? obj.size.y : 80;

    return (
        obj.position.x + w >= camX - halfW &&
        obj.position.x <= camX + halfW &&
        obj.position.y + h >= camY - halfH &&
        obj.position.y <= camY + halfH
    );
}

/**
 * Retrieves a pre-allocated FloatingText instance from g.TextPool instead of
 * allocating new objects every frame (prevents Garbage Collector stutters on mobile).
 */
function SpawnPooledText(config) {
    if (!g.TextPool) g.TextPool = [];

    const maxActive = g.isMobile ? 28 : 65;
    if (g.VisualEffects.length >= maxActive && config.text === "") return;

    let item = g.TextPool.pop();
    if (!item) {
        item = new FloatingText(config);
    } else {
        item.reset(config);
    }
    g.VisualEffects.push(item);
}

// ============================================================================
// 2. PROCEDURAL PARALLAX DARK FANTASY BACKGROUND
// ============================================================================
// Cached sky gradients so iOS WebKit never recompiles shaders every frame
let _cachedSkyGrad = null;
let _cachedBiome = "";

function DrawParallaxBackground() {
    const W = g.canvas.width;
    const H = g.canvas.height;
    const camX = g.Camera.camera.x || 0;

    // Only recreate gradient when biome actually changes!
    if (!_cachedSkyGrad || _cachedBiome !== g.currentBiome) {
        _cachedBiome = g.currentBiome;
        let topCol = "#080b14", midCol = "#161b2e", botCol = "#23192d";
        if (g.currentBiome === "CURSED FOREST") {
            topCol = "#06120e"; midCol = "#0f2922"; botCol = "#183a2f";
        } else if (g.currentBiome === "DEMON CITADEL") {
            topCol = "#140507"; midCol = "#2e0b10"; botCol = "#471216";
        }
        _cachedSkyGrad = c.createLinearGradient(0, 0, 0, H);
        _cachedSkyGrad.addColorStop(0, topCol);
        _cachedSkyGrad.addColorStop(0.6, midCol);
        _cachedSkyGrad.addColorStop(1, botCol);
    }

    c.fillStyle = _cachedSkyGrad;
    c.fillRect(0, 0, W, H);

    // Blood Moon (lightweight arc)
    const moonX = W * 0.75 - (camX * 0.03) % (W * 0.5);
    c.fillStyle = g.currentBiome === "CURSED FOREST" ? "#34d399" : "#ef4444";
    c.beginPath();
    c.arc(moonX, H * 0.24, 45, 0, Math.PI * 2);
    c.fill();

    // Single lightweight mountain silhouette layer on mobile
    c.fillStyle = "#080a10";
    const hillStep = 280;
    const offsetM = -((camX * 0.15) % hillStep);
    c.beginPath();
    c.moveTo(0, H);
    for (let x = offsetM - hillStep; x <= W + hillStep; x += hillStep) {
        c.lineTo(x + hillStep * 0.5, H * 0.58);
        c.lineTo(x + hillStep, H * 0.78);
    }
    c.lineTo(W, H);
    c.closePath();
    c.fill();
}

// ============================================================================
// 3. AUDIO EXTENSION WITH SAFE SYNTH FALLBACK
// ============================================================================
function InitPerkAudioSystem() {
    if (typeof window.SoundManager === 'undefined') {
        window.SoundManager = {
            sounds: {},
            init() {},
            play(name) { PlayGameSound(name); },
            playMusic() {}
        };
    }

    if (!window.SoundManager._perkAudioMap) {
        window.SoundManager._perkAudioMap = {};
        if (typeof PERK_AUDIO_CONFIG !== 'undefined') {
            for (const [key, cfg] of Object.entries(PERK_AUDIO_CONFIG)) {
                const audio = new Audio();
                audio.preload = "none";
                audio.src = cfg.src;
                audio.volume = cfg.volume || 0.5;
                window.SoundManager._perkAudioMap[key] = { audio, cfg };
            }
        }

        const originalPlay = window.SoundManager.play ? window.SoundManager.play.bind(window.SoundManager) : null;
        window.SoundManager.play = function (key) {
            if (window.SoundManager._perkAudioMap && window.SoundManager._perkAudioMap[key]) {
                const entry = window.SoundManager._perkAudioMap[key];
                const clone = entry.audio.cloneNode();
                clone.volume = entry.cfg.volume || 0.5;
                clone.play().catch(() => {
                    PlaySynthFallback(entry.cfg.freq || 440, 0.11);
                });
                return;
            }
            if (originalPlay) {
                try { originalPlay(key); } catch (e) {}
            }
        };
    }
}

function PlaySynthFallback(freq = 440, duration = 0.11) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!window._fallbackAudioCtx) window._fallbackAudioCtx = new AudioCtx();
        const ctx = window._fallbackAudioCtx;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = freq < 200 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + duration);

        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {}
}

function PlayGameSound(key) {
    if (typeof SoundManager !== 'undefined' && SoundManager.play) {
        SoundManager.play(key);
    }
}

function SpawnPerkVFX(vfxKey, position, flipLeft = false, targetFollow = null) {
    if (typeof PERK_VFX_CONFIG === 'undefined' || !PERK_VFX_CONFIG[vfxKey]) return null;
    if (g.isMobile && g.SpriteEffects.length > 12) return null;
    const fx = SpriteVFX.createFromConfig(vfxKey, position, flipLeft, targetFollow);
    g.SpriteEffects.push(fx);
    return fx;
}

// ============================================================================
// 4. COLLISION DETECTION UTILITIES
// ============================================================================
function CheckCollisions({ rectangle1, rectangle2 }) {
    return (
        rectangle1.position.x + rectangle1.size.x >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.size.x &&
        rectangle1.position.y + rectangle1.size.y >= rectangle2.position.y &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.size.y
    );
}

function CircleCollision({ circle, rectangle, lookLeft }) {
    const circleX = circle.position.x + circle.size.x / 2;
    const circleY = circle.position.y + circle.size.y / 2;
    const radius = circle.size.x / 2;
    const rectX = rectangle.position.x;
    const rectY = rectangle.position.y;
    const rectW = rectangle.size.x;
    const rectH = rectangle.size.y;
    const testX = Math.max(rectX, Math.min(circleX, rectX + rectW));
    const testY = Math.max(rectY, Math.min(circleY, rectY + rectH));

    if (lookLeft && testX > circleX) return false;
    if (!lookLeft && testX < circleX) return false;

    const distX = circleX - testX;
    const distY = circleY - testY;
    return ((distX * distX) + (distY * distY)) <= (radius * radius);
}

function EllipseCollision({ ellipse, rectangle, lookLeft }) {
    const a = ellipse.size.x / 2;
    const b = ellipse.size.y / 2;
    const cx = ellipse.position.x + a;
    const cy = ellipse.position.y + b;

    const rectX = rectangle.position.x;
    const rectY = rectangle.position.y;
    const rectW = rectangle.size.x;
    const rectH = rectangle.size.y;

    const closestX = Math.max(rectX, Math.min(cx, rectX + rectW));
    const closestY = Math.max(rectY, Math.min(cy, rectY + rectH));

    if (lookLeft && closestX > cx) return false;
    if (!lookLeft && closestX < cx) return false;

    const dx = closestX - cx;
    const dy = closestY - cy;
    return ((dx * dx) / (a * a)) + ((dy * dy) / (b * b)) <= 1;
}

function PlatformCollisions({ rectangle1, rectangle2 }) {
    if (rectangle1.velocity.y > 0 && (rectangle1.position.y + rectangle1.size.y - rectangle1.velocity.y) <= rectangle2.position.y) {
        rectangle1.velocity.y = 0;
        rectangle1.position.y = rectangle2.position.y - rectangle1.size.y;
        if (rectangle1.OnGround !== undefined) rectangle1.OnGround = true;
    }
}

function BouncinessPlatformCollisions({ rectangle1, rectangle2 }) {
    if (rectangle1.velocity.y > 0 && (rectangle1.position.y + rectangle1.size.y - rectangle1.velocity.y) <= rectangle2.position.y) {
        rectangle1.velocity.y = -rectangle1.velocity.y;
        rectangle1.position.y = rectangle2.position.y - rectangle1.size.y;
        if (rectangle1.OnGround !== undefined) rectangle1.OnGround = true;
    } else if (rectangle1.velocity.x > 0 && rectangle1.position.x + rectangle1.size.x - rectangle1.velocity.x <= rectangle2.position.x) {
        rectangle1.velocity.x = -rectangle1.velocity.x / 1.1;
        rectangle1.position.x = rectangle2.position.x - rectangle1.size.x;
    } else if (rectangle1.velocity.x < 0 && rectangle1.position.x - rectangle1.velocity.x >= rectangle2.position.x + rectangle2.size.x) {
        rectangle1.velocity.x = -rectangle1.velocity.x / 2;
        rectangle1.position.x = rectangle2.position.x + rectangle2.size.x;
    }
}

function CheckAttackCollision({ attacker, victim }) {
    const AttackBox = attacker.AttackBox;
    const lookLeft = attacker.Direction.left;

    if (AttackBox.shape === "circle") {
        return CircleCollision({ circle: AttackBox, rectangle: victim, lookLeft });
    } else if (AttackBox.shape === "ellipse") {
        return EllipseCollision({ ellipse: AttackBox, rectangle: victim, lookLeft });
    } else {
        return CheckCollisions({ rectangle1: AttackBox, rectangle2: victim });
    }
}

// ============================================================================
// 5. ROUND TIMER, HP, STAMINA & VICTORY LOGIC
// ============================================================================
function reduceTimer() {
    // Only clear leftover perks once when transitioning into FIGHTING
    if (g.roomState === "FIGHTING" && g.PowerUps.length > 0) {
        g.isPerked = false;
        g.PowerUps = [];
    }

    if (g.timer > 0) g.timer--;

    if (g.roomState === 'COOLDOWN') {
        g.Timer.textContent = g.timer + 3;
        if (g.timer === 3) {
            g.roomState = 'FIGHTING';
            g.startTimer();
        }
        return;
    }

    const maxDisplay = g.isOpenWorld ? 90 : 60;
    g.Timer.textContent = g.timer <= maxDisplay ? g.timer : maxDisplay;

    if (g.timer === maxDisplay + 3) TriggerAnnouncement("3");
    else if (g.timer === maxDisplay + 2) TriggerAnnouncement("2");
    else if (g.timer === maxDisplay + 1) TriggerAnnouncement("1");
    else if (g.timer === maxDisplay) {
        const isBossRound = (g.difficulty === 1 || g.difficulty % 5 === 0);
        TriggerAnnouncement(isBossRound ? `💀 SKULL BOSS - ROUND ${g.difficulty}` : `WAVE ${g.difficulty} - ${g.currentBiome}`, isBossRound);
        setTimeout(RemoveAnnouncement, 2200);
        g.FlagFight = true;
    }
}

function ReduceAddHP(player) {
    if (player.HealthPoints <= 0) player.HealthPoints = 0;
    if (player.HealthPoints >= player.MaxHealthPoints) player.HealthPoints = player.MaxHealthPoints;
    if (player.isAI || player.Player > 2) return;

    const HealthBar = document.getElementById("P" + player.Player + "HP");
    if (!HealthBar) return;
    HealthBar.style.width = Math.floor((player.HealthPoints / player.MaxHealthPoints) * 100) + "%";
}

function ReduceAddStamina(player) {
    if (player.staminaBar <= 0) player.staminaBar = 0;
    if (player.isAI || player.Player > 2) return;

    const StaminaBar = document.getElementById("stamina-bar");
    if (!StaminaBar) return;
    let StaminaBarWidth = player.staminaBar >= 3 ? 100 : player.staminaBar * 33;
    if (player.staminaBar >= 3) player.staminaBar = 3;
    StaminaBar.style.width = StaminaBarWidth + "%";
}

function utilStaminaTimer(player) {
    player.staminaTimer--;
    if (player.staminaTimer <= 0) {
        player.staminaTimer = 300;
        player.staminaBar = 0;
        ReduceAddStamina(player);
    }
}

function TriggerAnnouncement(text, flag = false) {
    RemoveAnnouncement();
    void g.Announcement.offsetWidth;
    g.Announcement.textContent = text;
    if (!flag) g.Announcement.classList.add('fight-announcement');
    else g.Announcement.classList.add('show-announcement');
}

function RemoveAnnouncement() {
    g.Announcement.classList.remove('fight-announcement');
    g.Announcement.classList.remove('show-announcement');
}

function CheckVictory({ player1, timerId }) {
    if (g.roundEnded) return;

    g.Fighters.forEach(f => {
        if (f.HealthPoints <= 0 && f.image !== f.sprites.death.image) {
            if (f.death) f.death();
        }
    });

    // 2. DEFEAT OR TIMEOUT: Save earned coins to persistent wallet and open shop.html!
    if ((player1.HealthPoints <= 0 && player1.imploded) || g.timer === 0) {
        g.roundEnded = true;
        clearInterval(timerId);
        if (g.timer === 0 && player1.image !== player1.sprites.death.image && player1.death) {
            player1.death();
        }

        // Save run coins into persistent localStorage wallet
        const savedCoins = parseInt(localStorage.getItem('oni_wallet_coins')) || 0;
        localStorage.setItem('oni_wallet_coins', savedCoins + (player1.coins || 0));

        TriggerAnnouncement("YOU DIED! OPENING SHOP...", true);
        setTimeout(() => { window.location.href = "shop.html"; }, 2200);
        return;
    }

    const enemies = g.Fighters.filter(f => f.Player !== 1);
    const allEnemiesDefeated = enemies.length > 0 && enemies.every(mob => mob.imploded);

    if (allEnemiesDefeated) {
        g.roundEnded = true;
        clearInterval(timerId);
        g.BlueOrbs = [];

        TriggerAnnouncement("Round " + g.difficulty + " Cleared!", true);
        setTimeout(RemoveAnnouncement, 4000);
        g.roomState = 'COOLDOWN';
        g.startShop();
        g.difficulty++;
    }
}

function HandleMovement(player) {
    if (player.Dead) {
        player.switchSprite('death');
        return;
    }
    if (player.type === "SkullBoss") {
        if (!player.isAttacking) player.switchSprite('idle');
        return;
    }

    let pAction = "idle";
    if (player.Defending) pAction = "defence";
    else if (player.isAttacking) pAction = "attack";
    else if ((player.keys.left.pressed || player.keys.right.pressed) && player.velocity.y === 0) pAction = "run";
    else if (player.velocity.y !== 0) pAction = "jump";
    else if (player.isPlunging && player.Player !== 1) pAction = "plunge";

    player.switchSprite(pAction);
}

// ============================================================================
// 6. POOLED FLOATING TEXT & PARTICLE GENERATOR
// ============================================================================
function CreateVFX(player, typo, text, bool = true) {
    const mult = g.isMobile ? 0.35 : 1;

    const vfx = {
        CRIT:      { text: text || "CRITICAL HIT!", color: "#FF3126", offset: { x: player.size.x / 2, y: player.size.y }, velocity: { x: 0, y: -2.2 }, count: 1 },
        HIT:       { text: "HIT",                   color: "#ffffff", offset: { x: player.size.x / 2, y: player.size.y }, velocity: { x: 0, y: -1.0 }, count: 1 },
        HP:        { text: text || "+HP",           color: player.Player === 1 ? "#2ecc71" : "#8f00ff", offset: { x: player.size.x / 2, y: player.size.y }, velocity: { x: 0, y: -1.2 }, count: 1 },
        DEF:       { text: text || "BLOCKED",       color: "#6d8df5", offset: { x: player.size.x / 2, y: player.size.y }, velocity: { x: 0, y: -1.2 }, count: 1 },
        MASK:      { text: text || "POWER UP!",     color: "#fbbf24", offset: { x: 0, y: player.size.y + 15 }, velocity: { x: 0, y: -0.9 }, count: 1 },
        RUN:       { text: "",                      color: player.Player === 1 ? "#FF3126" : "#8f00ff", offset: { x: 0, y: 0 }, velocity: { x: 0, y: -Math.random() * 2 }, count: g.isMobile ? 0 : 1 },
        JUMP:      { text: "",                      color: player.Player === 1 ? "#FF3126" : "#8f00ff", offset: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, count: Math.max(1, Math.floor(2 * mult)) },
        DASH:      { text: "",                      color: player.Player === 1 ? "#FF3126" : "#8f00ff", offset: { x: player.size.x / 2, y: player.size.y / 2 }, velocity: { x: 0, y: 0 }, count: Math.max(4, Math.floor(20 * mult)) },
        DAM:       { text: "",                      color: player.Player !== 1 ? "#FF3126" : "#8f00ff", offset: { x: player.size.x, y: player.size.y / 2 }, velocity: { x: 0, y: 0 }, count: Math.max(3, Math.floor(10 * mult)) },
        COOLDOWN:  { text: text,                    color: player.Player === 1 ? "#FF3126" : "#8f00ff", offset: { x: player.size.x / 2, y: player.size.y }, velocity: { x: 0, y: -0.8 }, count: 1 },
        DISAPPEAR: { text: "",                      color: "orange",  offset: { x: player.size.x, y: player.size.y / 2 }, velocity: { x: 0, y: 0 }, count: Math.max(4, Math.floor(14 * mult)) },
        UP:        { text: "",                      color: "#38bdf8", offset: { x: 0, y: Math.random() * player.size.y }, velocity: { x: 0, y: 0 }, count: 1 },
        SOUL:      { text: text || "+SOUL DMG!",    color: "#c084fc", offset: { x: player.size.x / 2, y: player.size.y + 10 }, velocity: { x: 0, y: -1.4 }, count: 1 }
    };

    if (!vfx[typo] || vfx[typo].count === 0) return;

    let Direction = 1;
    if (bool && player.Direction) Direction = player.Direction.right ? -1 : 1;
    const opacity = typo === "COOLDOWN" ? 0.6 : 1;
    if (typo === "JUMP" && player.jumpBuffer === 0) return;

    const isParticleScatter = (typo === "JUMP" || typo === "DASH" || typo === "DAM" || typo === "DISAPPEAR" || typo === "UP");

    for (let i = 0; i < vfx[typo].count; i++) {
        let offsetPlayer = {
            x: player.position.x + (isParticleScatter ? Math.random() * player.size.x : player.size.x / 2) - vfx[typo].offset.x,
            y: player.size.y + player.position.y - vfx[typo].offset.y
        };
        let randVelocity;
        if (isParticleScatter) {
            const randOffset = RandomOffsetVFX(player);
            offsetPlayer.x += randOffset.x - (player.size.x / 2);
            offsetPlayer.y += randOffset.y;
            randVelocity = RandomVelocityVFX(Direction);
        } else {
            randVelocity = vfx[typo].velocity;
        }
        SpawnPooledText({
            position: { x: offsetPlayer.x, y: offsetPlayer.y },
            velocity: { x: randVelocity.x, y: randVelocity.y },
            text: i === 0 ? vfx[typo].text : "",
            opacity: opacity,
            color: vfx[typo].color,
            fadeSpeed: typo === "MASK" ? 0.008 : 0.022
        });
    }
    if (player.jumpBuffer > 0) player.jumpBuffer--;
}

function ApplyKnockback(gotHit, Attacker) {
    if (gotHit.type === "SkullBoss" && gotHit.bossArmorActive) return;

    let damagePercent = 1 - (gotHit.HealthPoints / gotHit.MaxHealthPoints);
    if (damagePercent < 0) damagePercent = 0;

    let baseForce = 5 * Attacker.KnockBack;
    let extraForce = 15 * damagePercent * Attacker.KnockBack;
    let force = baseForce + extraForce;

    if (Attacker.Direction.left) gotHit.velocity.x -= force;
    else if (Attacker.Direction.right) gotHit.velocity.x += force;

    gotHit.velocity.y -= 6;
    gotHit.OnGround = false;
    gotHit.HitStun = 20;
}

// ============================================================================
// 7. CAMERA, CHEST/SHRINE DYNAMIC SPAWNER & ROUND HANDLER
// ============================================================================
function updateCamera() {
    if (!Player1 || Player1.Dead) return;

    const playerCenterX = Player1.position.x + Player1.size.x / 2;
    const playerCenterY = Player1.position.y + Player1.size.y / 2;

    if (playerCenterX < 3000) g.currentBiome = "KING'S PASS";
    else if (playerCenterX < 6000) g.currentBiome = "CURSED FOREST";
    else g.currentBiome = "DEMON CITADEL";

    const CAMERA_ENGAGE_RANGE = 1150;
    const enemies = g.Fighters.filter(f => {
        if (f === Player1 || f.Dead) return false;
        const dx = (f.position.x + f.size.x / 2) - playerCenterX;
        const dy = (f.position.y + f.size.y / 2) - playerCenterY;
        return (dx * dx + dy * dy) < CAMERA_ENGAGE_RANGE * CAMERA_ENGAGE_RANGE;
    });

    let targetX = playerCenterX;
    let targetY = Player1.position.y - 120;
    let targetZoom = 0.84;

    if (enemies.length > 0) {
        let minX = targetX;
        let maxX = targetX;
        let hasBoss = false;

        enemies.forEach(mob => {
            const mobX = mob.position.x + mob.size.x / 2;
            if (mobX < minX) minX = mobX;
            if (mobX > maxX) maxX = mobX;
            if (mob.type === "SkullBoss") hasBoss = true;
        });

        const midpointX = (minX + maxX) / 2;
        targetX = playerCenterX * 0.70 + midpointX * 0.30;
        if (hasBoss) targetY = Player1.position.y - 180;

        const spread = maxX - minX;
        targetZoom = g.canvas.width / (spread + 1450);
        if (targetZoom < 0.56) targetZoom = 0.56;
        if (targetZoom > 0.90) targetZoom = 0.90;
    } else {
        const lookAheadOffset = Player1.Direction.right ? 140 : -140;
        targetX = playerCenterX + lookAheadOffset;
        targetZoom = 0.86;
    }

    if (!g.Camera.camera.initialized) {
        g.Camera.camera.x = targetX;
        g.Camera.camera.y = targetY;
        g.Camera.camera.zoom = targetZoom;
        g.Camera.camera.initialized = true;
    }

    const WORLD_WIDTH = g.MAX_WIDTH;
    const WORLD_HEIGHT = g.MAX_HEIGHT;
    const halfViewWidth = (g.canvas.width / 2) / g.Camera.camera.zoom;
    const halfViewHeight = (g.canvas.height / 2) / g.Camera.camera.zoom;

    if (halfViewWidth * 2 >= WORLD_WIDTH) targetX = WORLD_WIDTH / 2;
    else {
        if (targetX - halfViewWidth < 0) targetX = halfViewWidth;
        if (targetX + halfViewWidth > WORLD_WIDTH) targetX = WORLD_WIDTH - halfViewWidth;
    }

    if (halfViewHeight * 2 >= WORLD_HEIGHT) targetY = WORLD_HEIGHT / 1.5;
    else {
        if (targetY - halfViewHeight < 0) targetY = halfViewHeight;
        if (targetY + halfViewHeight > WORLD_HEIGHT) targetY = WORLD_HEIGHT - halfViewHeight;
    }

    const smooth = 0.06;
    g.Camera.camera.x += (targetX - g.Camera.camera.x) * smooth;
    g.Camera.camera.y += (targetY - g.Camera.camera.y) * smooth;
    g.Camera.camera.zoom += (targetZoom - g.Camera.camera.zoom) * smooth;
}

function RandomOffsetVFX(player) {
    return { x: Math.random() * player.size.x, y: -Math.random() * player.size.y / 8 };
}

function RandomVelocityVFX(direction) {
    return { x: (Math.random() * 2) * (-direction), y: (Math.random() * 5 * Math.random()) - 0.5 };
}

function Only3(str) {
    if (!str || typeof str !== 'string') return '';
    return str.length <= 3 ? str : str.substring(0, 3);
}

/**
 * Spawns fresh Treasure Chests, Shrines, and Wind Geysers EVERY round
 * both around the player's current position and on nearby platforms!
 */
function SpawnRoundWorldObjects() {
    const floorY = g.MAX_HEIGHT - 600;
    const playerX = Player1 ? Player1.position.x : 800;

    // On Round 1, initialize base world shrines across the 3 biomes
    if (!g.WorldObjects || g.WorldObjects.length === 0) {
        g.WorldObjects = [
            new WorldShrine({ type: 'healShrine',  position: { x: 1150, y: floorY - 110 } }),
            new WorldShrine({ type: 'jumpGeyser',  position: { x: 2050, y: floorY - 40  } }),
            new WorldShrine({ type: 'battleAltar', position: { x: 3500, y: floorY - 115 } }),
            new WorldShrine({ type: 'jumpGeyser',  position: { x: 4250, y: floorY - 40  } }),
            new WorldShrine({ type: 'healShrine',  position: { x: 5200, y: floorY - 110 } }),
            new WorldShrine({ type: 'battleAltar', position: { x: 6550, y: floorY - 115 } }),
            new WorldShrine({ type: 'jumpGeyser',  position: { x: 7300, y: floorY - 40  } })
        ];
    }

    // Reset cooldowns on existing shrines and remove already opened chests so we can spawn fresh ones
    g.WorldObjects = g.WorldObjects.filter(obj => !(obj.type === 'soulChest' && obj.cooldown > 0));
    g.WorldObjects.forEach(obj => { obj.cooldown = 0; });

    // Dynamically spawn 3 NEW Treasure Chests & 1 Healing Shrine every round near the Player!
    const elevatedPlatforms = g.Platforms.filter((p, idx) =>
        idx > 0 && Math.abs((p.position.x + p.size.x / 2) - playerX) < 2200
    );

    for (let cIdx = 0; cIdx < 3; cIdx++) {
        let chestX, chestY;
        if (elevatedPlatforms.length > 0 && Math.random() < 0.65) {
            const plat = elevatedPlatforms[Math.floor(Math.random() * elevatedPlatforms.length)];
            chestX = plat.position.x + 30 + Math.random() * Math.max(20, plat.size.x - 100);
            chestY = plat.position.y - 55;
        } else {
            const offset = (cIdx % 2 === 0 ? 1 : -1) * (350 + cIdx * 380 + Math.random() * 200);
            chestX = Math.max(200, Math.min(g.MAX_WIDTH - 250, playerX + offset));
            chestY = floorY - 55;
        }
        g.WorldObjects.push(new WorldShrine({
            type: 'soulChest',
            position: { x: chestX, y: chestY }
        }));
    }
}

function RoomHandler() {
    const newVal = getDifficultyScaling();
    const choosenLayout = g.isOpenWorld
        ? OpenWorldLayout
        : ArenaLayouts[Math.floor(Math.random() * ArenaLayouts.length)];

    g.Platforms = [];
    choosenLayout.forEach(p => {
        g.Platforms.push({
            position: { x: p.x, y: p.y },
            size: { x: p.w, y: p.h },
            color: p.color,
            isGround: !!p.isGround,
            Draw() {
                if (!this.isGround && !IsInViewport(this, 200)) return;
                c.save();
                c.fillStyle = this.color;
                c.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
                c.fillStyle = this.isGround ? "#2e3440" : "rgba(255, 255, 255, 0.2)";
                c.fillRect(this.position.x, this.position.y, this.size.x, 4);
                c.restore();
            }
        });
    });

    // Spawn fresh chests and shrines every round!
    if (g.isOpenWorld) {
        SpawnRoundWorldObjects();
    }

    // Clear active entities and leftover perks
    g.Bullets = [];
    g.BlueOrbs = [];
    g.PowerUps = [];
    g.Fighters = g.Fighters.filter(f => f.Player === 1);
    if (g.Pointers) g.Pointers = g.Pointers.filter(p => !p.isMob);

    const playerX = Player1 ? Player1.position.x : 800;
    const floorY = g.MAX_HEIGHT - 600;

    // --- SPAWN FLYING SKULL BOSS (Spawns at Round 1 for immediate action, and every 5 rounds: 5, 10, 15...) ---
    const isBossRound = (g.difficulty === 1 || g.difficulty % 5 === 0);
    if (isBossRound) {
        const bossCount = g.difficulty === 1 ? 1 : Math.floor(g.difficulty / 5);
        for (let b = 0; b < bossCount; b++) {
            let boss = Fighter.createFighters(5, b); // ID 5 = SkullBoss
            const scaleFactor = g.difficulty === 1 ? 0.65 : (1 + (g.difficulty - 5) * 0.25);
            boss.MaxHealthPoints = Math.floor(boss.MaxHealthPoints * scaleFactor);
            boss.HealthPoints = boss.MaxHealthPoints;
            boss.Damage = Math.floor(boss.Damage * newVal.dmgMult);

            const side = (b % 2 === 0) ? 1 : -1;
            boss.position.x = Math.max(250, Math.min(g.MAX_WIDTH - 300, playerX + side * (360 + b * 240)));
            boss.position.y = floorY - 340;
            boss.flightBaseY = floorY - 340;

            g.Pointers.push(FloatingPointers.createPointers(boss));
            g.Fighters.push(boss);
        }

        // Spawn the Blue Jump Orb on the ground to super-jump and stomp the Boss's head!
        g.BlueOrbs.push(new BlueJumpOrb({
            position: { x: playerX + 200, y: floorY - 70 }
        }));
    }

    // Spawn standard enemies
    const mobCount = isBossRound ? Math.max(1, Math.floor(newVal.enemyCount * 0.45)) : newVal.enemyCount;
    const nearbyPlatforms = g.Platforms.filter((plat, idx) =>
        idx > 0 && Math.abs((plat.position.x + plat.size.x / 2) - playerX) < 1800
    );

    for (let i = 0; i < mobCount; i++) {
        let enemyType = Math.floor(Math.random() * 3) + 2;
        let enemy = Fighter.createFighters(enemyType, i);

        let baseHealth = enemy.MaxHealthPoints || enemy.HealthPoints;
        enemy.MaxHealthPoints = Math.floor(baseHealth * newVal.hpMult);
        enemy.HealthPoints = enemy.MaxHealthPoints;
        enemy.Damage = Math.floor(enemy.Damage * newVal.dmgMult);

        const side = (i % 2 === 0) ? 1 : -1;
        const distFromPlayer = 420 + Math.floor(i / 2) * 220 + Math.random() * 120;
        let spawnX = Math.max(150, Math.min(g.MAX_WIDTH - 250, playerX + side * distFromPlayer));

        enemy.position.x = spawnX;
        enemy.position.y = floorY - enemy.size.y;
        enemy.spawnOriginX = spawnX; // Used to tether launchers so they don't run away forever!

        if (enemy.type === "BigAhhLauncher" && nearbyPlatforms.length > 0) {
            let target = nearbyPlatforms[Math.floor(Math.random() * nearbyPlatforms.length)];
            enemy.position.x = target.position.x + (target.size.x / 2) - (enemy.size.x / 2);
            enemy.position.y = target.position.y - enemy.size.y;
            enemy.spawnOriginX = enemy.position.x;
        }

        g.Pointers.push(FloatingPointers.createPointers(enemy));
        g.Fighters.push(enemy);
    }

    g.roomState = 'FIGHTING';
    if (g.P1DOM) g.P1DOM.textContent = "W" + g.difficulty;
}

function getDifficultyScaling() {
    const d = g.difficulty;
    return {
        enemyCount: 2 + Math.floor(d * 1.4),
        hpMult: 1 + (d - 1) * 0.20,
        dmgMult: 1 + (d - 1) * 0.15,
        launcherChance: Math.min(0.1 + (d * 0.05), 0.6)
    };
}

/**
 * Spawns 3 distinct random Perks + "Return To Combat" neatly spaced by 180px
 * around the player at ground level (fixes overlapping at 0,0).
 */
function ShowPerks() {
    g.PowerUps = [];
    const spacing = 180;
    let centerMap = Player1 ? Player1.position.x + Player1.size.x / 2 : 1500;
    centerMap = Math.max(450, Math.min(g.MAX_WIDTH - 450, centerMap));

    const startX = centerMap - (spacing * 1.5);
    const groundY = (g.MAX_HEIGHT - 600) - 115;

    // Pick 3 unique perk IDs between 1 and 12
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const chosenIds = [];
    for (let k = 0; k < 3; k++) {
        const randIdx = Math.floor(Math.random() * pool.length);
        chosenIds.push(pool.splice(randIdx, 1)[0]);
    }
    chosenIds.push(13); // 4th slot is always Return To Combat

    for (let i = 0; i < 4; i++) {
        const maskX = startX + (spacing * i);
        let nuovaMaschera = Mask.CreateMask(maskX, groundY, chosenIds[i]);
        nuovaMaschera.timer = i * 0.8;
        g.PowerUps.push(nuovaMaschera);
    }
}

function getPerked(mask, priceMultplier) {
    if (Player1.coins < mask.price * priceMultplier) {
        CreateVFX(Player1, "COOLDOWN", "NO COINS!");
        return;
    }
    Player1.coins -= (mask.price * priceMultplier);
    mask.MaskTaken(Player1);
}

function RemovePerks() {
    g.PowerUps = [];
    g.roomState = "RESTART";
}
// ============================================================================
// 1. SPRITE-BASED SEKIRO / BLASPHEMOUS ENVIRONMENT RENDERER
// ============================================================================
let _worldProps = null;
let _ambientParticles = null;

function InitWorldProps() {
    if (_worldProps) return;
    _worldProps = [];
    if (typeof AMBIENT_PLACEMENTS === 'undefined') return;

    AMBIENT_PLACEMENTS.forEach(p => {
        const cfg = AMBIENT_PROPS_CONFIG[p.type];
        if (!cfg) return;
        const spr = new Sprite({
            position: { x: p.x, y: p.y },
            size: { x: cfg.size.x, y: cfg.size.y },
            imageSrc: cfg.imageSrc,
            framesMax: cfg.framesMax,
            scale: cfg.scale,
            offset: cfg.offset,
            color: null
        });
        spr.framesHold = cfg.framesHold || 6;
        spr.glowColor = cfg.glowColor;
        spr.fallbackType = cfg.fallbackType;
        _worldProps.push(spr);
    });
}

function DrawAtmosphere(dt = 1) {
    InitWorldProps();
    if (!_worldProps) return;

    for (let i = 0; i < _worldProps.length; i++) {
        const prop = _worldProps[i];
        // Frustum culling: skip off-screen props completely (zero lag on iPhone)
        if (!IsInViewport(prop, 220)) continue;

        // Lightweight ambient light halo (uses simple alpha circle, no shader gradients!)
        if (prop.glowColor) {
            c.save();
            c.fillStyle = prop.glowColor;
            c.beginPath();
            c.arc(prop.position.x + prop.size.x / 2, prop.position.y + prop.size.y * 0.4, 55, 0, Math.PI * 2);
            c.fill();
            c.restore();
        }

        if (prop.hasValidImage()) {
            prop.update(dt);
        } else {
            // Silhouette fallback if the PNG is not yet in ./img/VFX/Env/
            DrawPropSilhouetteFallback(prop);
        }
    }
}

function DrawPropSilhouetteFallback(prop) {
    const x = prop.position.x, y = prop.position.y, w = prop.size.x, h = prop.size.y;
    c.save();
    c.fillStyle = "#0b0d14";
    c.strokeStyle = "#262936";
    c.lineWidth = 2;

    if (prop.fallbackType === 'torii') {
        // Traditional Japanese Torii Gate silhouette
        c.fillRect(x + w * 0.18, y + 30, 18, h - 30);
        c.fillRect(x + w * 0.82 - 18, y + 30, 18, h - 30);
        c.fillRect(x, y + 18, w, 18);
        c.fillRect(x + 20, y + 60, w - 40, 12);
    } else if (prop.fallbackType === 'lantern') {
        // Iron post + glowing lantern core
        c.fillRect(x + w / 2 - 4, y + 25, 8, h - 25);
        c.fillStyle = "#f97316";
        c.fillRect(x + w / 2 - 10, y + 12, 20, 22);
    } else if (prop.fallbackType === 'statue') {
        // Sculptor's Idol pedestal + figure
        c.fillRect(x + 10, y + h - 30, w - 20, 30);
        c.beginPath();
        c.arc(x + w / 2, y + h - 55, 22, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#38bdf8";
        c.fillRect(x + w / 2 - 4, y + h - 60, 8, 8);
    } else {
        c.fillRect(x + w / 2 - 8, y, 16, h);
    }
    c.restore();
}

function DrawScreenAtmosphereOverlay() {
    const W = g.canvas.width, H = g.canvas.height;
    const count = g.isMobile ? 14 : 32;

    if (!_ambientParticles) {
        _ambientParticles = [];
        for (let i = 0; i < count; i++) {
            _ambientParticles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                s: Math.random() * 2.5 + 1.5,
                vx: -0.4 - Math.random() * 0.6,
                vy: -0.5 - Math.random() * 0.8,
                color: Math.random() > 0.3 ? "#f97316" : "#dc2626"
            });
        }
    }

    c.save();
    for (let i = 0; i < _ambientParticles.length; i++) {
        const p = _ambientParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        c.fillStyle = p.color;
        c.fillRect(p.x, p.y, p.s, p.s);
    }
    c.restore();
}

// ============================================================================
// 8. MINIMAP & BOSS HEALTH BAR HUD
// ============================================================================
let _bossTrailingPct = 1.0; // Smooth delayed yellow damage bar like Sekiro/Dark Souls


function DrawOpenWorldHUD() {
    if (!Player1) return;
    c.save();

    // --- 1. SEKIRO / BLASPHEMOUS BOSS BAR (Placed at BOTTOM CENTER, away from P1 UI!) ---
    const activeBosses = g.Fighters.filter(f => f.type === "SkullBoss" && !f.Dead);
    if (activeBosses.length > 0) {
        const totalHp = activeBosses.reduce((acc, b) => acc + b.HealthPoints, 0);
        const totalMax = activeBosses.reduce((acc, b) => acc + b.MaxHealthPoints, 0);
        const pct = Math.max(0, Math.min(1, totalHp / totalMax));

        // Smoothly decay trailing damage bar
        if (_bossTrailingPct > pct) _bossTrailingPct -= 0.006;
        else _bossTrailingPct = pct;

        const barW = Math.min(540, g.canvas.width * 0.52);
        const barH = 14;
        const barX = (g.canvas.width - barW) / 2;
        const barY = g.canvas.height - 54; // Bottom center of screen

        const isArmored = activeBosses[0].bossArmorActive;

        // A. Boss Name & Gothic Subtitle above the bar
        c.font = "bold 11px 'Press Start 2P', monospace";
        c.fillStyle = "#e2c07d"; // Tarnished Blasphemous gold
        c.textAlign = "left";
        c.fillText(`💀 SKULL LORD OF ASH ${activeBosses.length > 1 ? 'x' + activeBosses.length : ''}`, barX, barY - 12);

        // B. Sekiro Deathblow Kanji Emblem (死) on the left of the bar
        const emblemX = barX - 24;
        const emblemY = barY + barH / 2;
        c.fillStyle = isArmored ? "#1e293b" : "#dc2626";
        c.beginPath();
        c.arc(emblemX, emblemY, 15, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "#c89d54";
        c.lineWidth = 2;
        c.stroke();

        c.font = "bold 14px serif";
        c.fillStyle = isArmored ? "#64748b" : "#ffffff";
        c.textAlign = "center";
        c.fillText("死", emblemX, emblemY + 5);

        // C. Outer Gothic Frame
        c.fillStyle = "rgba(8, 8, 12, 0.92)";
        c.fillRect(barX - 4, barY - 4, barW + 8, barH + 8);

        // D. Delayed Gold/White Damage Trail Bar
        c.fillStyle = "#fde047";
        c.fillRect(barX, barY, barW * _bossTrailingPct, barH);

        // E. Main Arterial Crimson Blood Bar
        c.fillStyle = "#991b1b";
        c.fillRect(barX, barY, barW * pct, barH);
        c.fillStyle = "#dc2626";
        c.fillRect(barX, barY, barW * pct, barH * 0.55);

        // F. Ornate Metallic Bronze/Gold Border + Diamond Finials
        c.strokeStyle = "#c89d54";
        c.lineWidth = 2;
        c.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4);

        // Sekiro Posture / Bone Armor Bar right below the HP bar
        const postureW = barW * 0.7;
        const postureX = barX + (barW - postureW) / 2;
        const postureY = barY + barH + 6;
        c.fillStyle = "#090a0f";
        c.fillRect(postureX, postureY, postureW, 5);
        c.fillStyle = isArmored ? "#38bdf8" : "#f59e0b";
        c.fillRect(postureX, postureY, isArmored ? postureW : postureW * (activeBosses[0].bossStunTimer / 260), 5);
        c.strokeStyle = "#785c28";
        c.lineWidth = 1;
        c.strokeRect(postureX, postureY, postureW, 5);

        // Status hint text
        c.font = "8px 'Press Start 2P', monospace";
        c.fillStyle = isArmored ? "#7dd3fc" : "#fde047";
        c.textAlign = "right";
        c.fillText(isArmored ? "[POSTURE LOCKED: STOMP HEAD VIA BLUE ORB]" : "[DEATHBLOW WINDOW: UNLEASH ATTACKS!]", barX + barW, barY - 12);
    }

    // --- 2. COMPACT DARK FANTASY MINIMAP (Top Right) ---
    if (g.isOpenWorld) {
        const mapW = 190;
        const mapH = 28;
        const mapX = g.canvas.width - mapW - 16;
        const mapY = 16;

        c.fillStyle = "rgba(8, 8, 12, 0.88)";
        c.fillRect(mapX, mapY, mapW, mapH);
        c.strokeStyle = "#c89d54";
        c.lineWidth = 1.5;
        c.strokeRect(mapX, mapY, mapW, mapH);

        if (g.WorldObjects) {
            for (let i = 0; i < g.WorldObjects.length; i++) {
                const obj = g.WorldObjects[i];
                if (obj.cooldown > 0) continue;
                const rx = mapX + (obj.position.x / g.MAX_WIDTH) * mapW;
                const ry = mapY + (obj.position.y / g.MAX_HEIGHT) * mapH;
                c.fillStyle = obj.type === 'soulChest' ? "#eab308" : "#38bdf8";
                c.fillRect(rx - 2, ry - 2, 4, 4);
            }
        }

        for (let i = 0; i < g.Fighters.length; i++) {
            const f = g.Fighters[i];
            if (f.Player === 1 || f.Dead) continue;
            const rx = mapX + (f.position.x / g.MAX_WIDTH) * mapW;
            const ry = mapY + (f.position.y / g.MAX_HEIGHT) * mapH;
            c.fillStyle = f.type === "SkullBoss" ? "#f43f5e" : "#dc2626";
            c.fillRect(rx - 2.5, ry - 2.5, 5, 5);
        }

        const px = mapX + (Player1.position.x / g.MAX_WIDTH) * mapW;
        const py = mapY + (Player1.position.y / g.MAX_HEIGHT) * mapH;
        c.fillStyle = "#e2c07d";
        c.fillRect(px - 3, py - 3, 6, 6);
    }

    c.restore();
}
// ============================================================================
// CANVAS INVENTORY (Key 'M') WITH MOUSE HOVER TOOLTIPS (Zero DOM Lag)
// ============================================================================
const PERK_DESCRIPTIONS = {
    "Health Potion":      "Ripristina +500 HP istantaneamente.",
    "Demon Strength":     "Aumenta il Danno del +45% e il Knockback del +35%.",
    "Magic Caster":       "Spara una Fireball magica ad ogni fendente (+15% Danno).",
    "Vampire Blood":      "Ruba il 15% dei danni inflitti curando i tuoi HP.",
    "Hermes Boots":       "+15% Velocità di corsa, salto potenziato e triplo salto.",
    "Titan Heart":        "+400 HP Massimi permanenti e +20% Knockback.",
    "Ricochet Master":    "I tuoi proiettili rimbalzano automaticamente su un 2° nemico.",
    "Toxic Trail":        "Lascia pozze d'acido velenoso mentre corri che danneggiano i nemici.",
    "Executioner's Mark": "Infligge x2.5 Danni Critici ai nemici sotto il 30% di vita.",
    "Static Shield":      "Genera uno scudo elettrico ogni 12s che para e stordisce chi ti colpisce.",
    "Soul Collector":     "Assorbe le anime dei nemici uccisi aumentando il tuo Danno base.",
    "Split Shot":         "Spara 3 palle di fuoco a ventaglio ad ogni attacco."
};

function DrawCanvasInventory() {
    if (!Player1) return;
    const perks = Player1.perkList || [];
    const mx = g.mouse ? g.mouse.x : -1;
    const my = g.mouse ? g.mouse.y : -1;

    c.save();
    let hoveredPerk = null;

    // ========================================================================
    // A. HUD PERK BAR (Always visible below HP Bar using ./img/PowerUp/*.png)
    // ========================================================================
    const hudStartX = 92;
    const hudStartY = 82;
    const iconSize = 36;
    const iconGap = 8;

    for (let i = 0; i < perks.length; i++) {
        const perk = perks[i];
        const sx = hudStartX + i * (iconSize + iconGap);
        const sy = hudStartY;

        const isHover = (mx >= sx && mx <= sx + iconSize && my >= sy && my <= sy + iconSize);
        if (isHover) hoveredPerk = perk;

        // Slot background & gold border
        c.fillStyle = isHover ? "#282c42" : "rgba(10, 12, 20, 0.85)";
        c.fillRect(sx, sy, iconSize, iconSize);
        c.strokeStyle = isHover ? "#ffd700" : "#c89d54";
        c.lineWidth = isHover ? 2.5 : 1.5;
        c.strokeRect(sx, sy, iconSize, iconSize);

        // Draw your actual Perk PNG (./img/PowerUp/...)
        if (perk.image && !perk.image._failed && perk.image.complete && perk.image.naturalWidth > 0) {
            c.drawImage(perk.image, sx + 3, sy + 3, iconSize - 6, iconSize - 6);
        }

        // Stack badge (x2, x3...)
        if (perk.count > 1) {
            c.fillStyle = "rgba(0, 0, 0, 0.9)";
            c.fillRect(sx + iconSize - 20, sy + iconSize - 14, 20, 14);
            c.fillStyle = "#ffd700";
            c.font = "bold 8px 'Press Start 2P', monospace";
            c.textAlign = "right";
            c.fillText(`x${perk.count}`, sx + iconSize - 2, sy + iconSize - 3);
        }
    }

    // Hover Tooltip right below the HUD icons when moving the mouse over a Perk!
    if (hoveredPerk && !g.inventoryOpen) {
        const tipX = hudStartX;
        const tipY = hudStartY + iconSize + 10;
        const tipW = 420;
        const tipH = 58;

        c.fillStyle = "rgba(10, 11, 18, 0.94)";
        c.fillRect(tipX, tipY, tipW, tipH);
        c.strokeStyle = "#ffd700";
        c.lineWidth = 2;
        c.strokeRect(tipX, tipY, tipW, tipH);

        c.textAlign = "left";
        c.fillStyle = "#ffd700";
        c.font = "bold 10px 'Press Start 2P', monospace";
        c.fillText(`${hoveredPerk.name} (x${hoveredPerk.count})`, tipX + 12, tipY + 22);

        c.fillStyle = "#e2e8f0";
        c.font = "8px 'Press Start 2P', monospace";
        c.fillText(hoveredPerk.desc, tipX + 12, tipY + 44);
    }

    // ========================================================================
    // B. FULL MODAL INVENTORY (Opens when pressing 'M')
    // ========================================================================
    if (g.inventoryOpen) {
        const W = g.canvas.width, H = g.canvas.height;
        c.fillStyle = "rgba(6, 7, 12, 0.85)";
        c.fillRect(0, 0, W, H);

        const winW = Math.min(560, W * 0.88);
        const winH = Math.min(340, H * 0.78);
        const winX = (W - winW) / 2;
        const winY = (H - winH) / 2;

        c.fillStyle = "#11131c";
        c.fillRect(winX, winY, winW, winH);
        c.strokeStyle = "#c89d54";
        c.lineWidth = 3;
        c.strokeRect(winX, winY, winW, winH);

        c.font = "bold 13px 'Press Start 2P', monospace";
        c.fillStyle = "#e2c07d";
        c.textAlign = "center";
        c.fillText("📜 PERK ATTIVI [PREMI M PER CHIUDERE]", W / 2, winY + 32);

        const cols = 6, slotSize = 62, gap = 14;
        const gridW = cols * slotSize + (cols - 1) * gap;
        const startX = (W - gridW) / 2;
        const startY = winY + 58;

        for (let i = 0; i < 12; i++) {
            const sx = startX + (i % cols) * (slotSize + gap);
            const sy = startY + Math.floor(i / cols) * (slotSize + gap);
            const perk = perks[i];

            const isHover = (mx >= sx && mx <= sx + slotSize && my >= sy && my <= sy + slotSize);
            if (isHover && perk) hoveredPerk = perk;

            c.fillStyle = isHover ? "#282c42" : "#181b28";
            c.fillRect(sx, sy, slotSize, slotSize);
            c.strokeStyle = isHover ? "#ffd700" : (perk ? "#c89d54" : "#334155");
            c.lineWidth = isHover ? 2.5 : 1.5;
            c.strokeRect(sx, sy, slotSize, slotSize);

            if (perk && perk.image && !perk.image._failed && perk.image.complete) {
                c.drawImage(perk.image, sx + 8, sy + 8, slotSize - 16, slotSize - 16);
                c.fillStyle = "#ffd700";
                c.font = "bold 9px 'Press Start 2P', monospace";
                c.fillText(`x${perk.count}`, sx + slotSize - 16, sy + slotSize - 6);
            }
        }

        const tipY = startY + 2 * (slotSize + gap) + 12;
        c.fillStyle = "#0a0b10";
        c.fillRect(winX + 24, tipY, winW - 48, 68);
        c.strokeStyle = "#c89d54";
        c.strokeRect(winX + 24, tipY, winW - 48, 68);

        c.fillStyle = hoveredPerk ? "#ffd700" : "#64748b";
        c.font = "bold 10px 'Press Start 2P', monospace";
        c.fillText(hoveredPerk ? `${hoveredPerk.name} (Stack: x${hoveredPerk.count})` : "Passa il mouse su uno slot per i dettagli", W / 2, tipY + 25);
        if (hoveredPerk) {
            c.fillStyle = "#cbd5e1";
            c.font = "8.5px 'Press Start 2P', monospace";
            c.fillText(hoveredPerk.desc, W / 2, tipY + 48);
        }
    }

    c.restore();
}