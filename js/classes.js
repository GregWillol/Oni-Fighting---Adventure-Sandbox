// ============================================================================
// BASE SPRITE CLASS & SELF-CONTAINED AUDIO / VFX BRIDGES
// ============================================================================
window._imgCache = window._imgCache || {};
function GetCachedImage(src) {
    if (!src) return null;
    if (!window._imgCache[src]) {
        const img = new Image();
        img._failed = false;
        img.onerror = () => { img._failed = true; };
        img.src = src;
        window._imgCache[src] = img;
    }
    return window._imgCache[src];
}

// Ponte Audio Universale: garantisce che Boss Stomp, Globo Blu, Hit Spada e Perk
// suonino SEMPRE, anche se non hai il file .mp3 corrispondente in SoundManager!
window._sfxCtx = null;
function PlaySynthSFX(type) {
    try {
        if (typeof SoundManager !== 'undefined' && SoundManager.isMuted) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!window._sfxCtx) window._sfxCtx = new AudioCtx();
        if (window._sfxCtx.state === 'suspended') window._sfxCtx.resume();

        const ctx = window._sfxCtx;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'bossStompHit') {
            // Suona anche l'esplosione + parry se presenti per dare un impatto devastante!
            if (typeof SoundManager !== 'undefined' && SoundManager.sounds) {
                if (SoundManager.sounds.fireExplosion) SoundManager.play('fireExplosion');
                if (SoundManager.sounds.parry) SoundManager.play('parry');
            }
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, t);
            osc.frequency.exponentialRampToValueAtTime(28, t + 0.42);
            gain.gain.setValueAtTime(0.55, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.42);
            osc.start(t);
            osc.stop(t + 0.42);
        } else if (type === 'swordHit') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(170, t);
            osc.frequency.exponentialRampToValueAtTime(38, t + 0.13);
            gain.gain.setValueAtTime(0.45, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.13);
            osc.start(t);
            osc.stop(t + 0.13);
        } else if (type === 'blueOrbBounce' || type === 'windDash') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(260, t);
            osc.frequency.exponentialRampToValueAtTime(840, t + 0.25);
            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
            osc.start(t);
            osc.stop(t + 0.25);
        } else if (type === 'bossBeam' || type === 'bossMissileLock') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(680, t);
            osc.frequency.exponentialRampToValueAtTime(220, t + 0.2);
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc.start(t);
            osc.stop(t + 0.2);
        } else if (type === 'magicCast' || type === 'splitShot' || type === 'ricochetBounce') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(480, t);
            osc.frequency.exponentialRampToValueAtTime(960, t + 0.14);
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
            osc.start(t);
            osc.stop(t + 0.14);
        } else {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, t);
            osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
            osc.start(t);
            osc.stop(t + 0.12);
        }
    } catch (e) {}
}

// Sovrascrive PlayGameSound in modo sicuro così nessun suono va mai perso
window.PlayGameSound = function(name) {
    if (typeof SoundManager !== 'undefined' && SoundManager.sounds && SoundManager.sounds[name]) {
        SoundManager.play(name);
    } else {
        PlaySynthSFX(name);
    }
};

// Garantisce che SpawnPerkVFX funzioni sempre senza crashare
window.SpawnPerkVFX = function(key, position, flipLeft = false, targetFollow = null) {
    if (typeof g === 'undefined') return;
    if (!g.SpriteEffects) g.SpriteEffects = [];
    const vfx = SpriteVFX.createFromConfig(key, position, flipLeft, targetFollow);
    if (vfx) g.SpriteEffects.push(vfx);
};

class Sprite {
    constructor({ position = { x: 0, y: 0 }, size, color, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 }, sprites, row = 0, frameWidth = null, frameHeight = null }) {
        this.position = { x: position.x, y: position.y };
        this.size = size ? { x: size.x, y: size.y } : { x: 50, y: 50 };
        this.color = color;

        this.image = GetCachedImage(imageSrc);

        this.scale = scale;
        this.framesMax = framesMax;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 6;
        this.offset = offset ? { x: offset.x, y: offset.y } : { x: 0, y: 0 };
        this.row = row;
        this.customFrameWidth = frameWidth;
        this.customFrameHeight = frameHeight;

        this.sprites = sprites;
        for (const sprite in this.sprites) {
            sprites[sprite].image = GetCachedImage(sprites[sprite].imageSrc);
        }
    }

    hasValidImage() {
        return this.image && !this.image._failed && this.image.complete && this.image.naturalWidth > 0;
    }

    Draw() {
        if (!IsInViewport(this, 220)) return;

        if (!this.hasValidImage()) {
            if (this.type === "SkullBoss") {
                this.drawSkullBossFallback();
                return;
            }
            if (this.color) {
                c.fillStyle = this.color;
                c.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
            }
            return;
        }

        const isMultiRowSheet = (this.customFrameWidth && this.image.height >= this.customFrameHeight * 2);
        const fw = isMultiRowSheet ? this.customFrameWidth : (this.image.width / this.framesMax);
        const fh = isMultiRowSheet ? this.customFrameHeight : this.image.height;
        const sy = isMultiRowSheet ? (this.row * fh) : 0;

        c.save();
        if (this.Direction && this.Direction.left) {
            c.translate(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2);
            c.scale(-1, 1);
            c.translate(-(this.position.x + this.size.x / 2), -(this.position.y + this.size.y / 2));
        }
        if (this.skinFilter && this.skinFilter !== 'none') c.filter = this.skinFilter;
        c.drawImage(
            this.image,
            this.framesCurrent * fw,
            sy,
            fw,
            fh,
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            fw * this.scale,
            fh * this.scale
        );
        c.restore();
    }

    drawSkullBossFallback() {
        const cx = this.position.x + this.size.x / 2;
        const cy = this.position.y + this.size.y / 2;
        c.save();
        c.fillStyle = this.bossArmorActive ? "rgba(0, 229, 255, 0.28)" : "rgba(239, 68, 68, 0.35)";
        c.beginPath();
        c.arc(cx, cy, 78, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = this.bossStunTimer > 0 ? "#94a3b8" : "#f8fafc";
        c.beginPath();
        c.arc(cx, cy - 8, 52, 0, Math.PI * 2);
        c.fill();
        c.fillRect(cx - 28, cy + 25, 56, 26);

        c.fillStyle = this.currentAttackType === 'attack2' ? "#ff0055" : "#00e5ff";
        c.beginPath();
        c.arc(cx - 18, cy - 10, 11, 0, Math.PI * 2);
        c.arc(cx + 18, cy - 10, 11, 0, Math.PI * 2);
        c.fill();
        c.restore();
    }

    animateFrames(dt) {
        this.framesElapsed += dt;
        if (this.framesElapsed >= this.framesHold) {
            if (this.framesCurrent < this.framesMax - 1) {
                this.framesCurrent++;
            } else {
                this.framesCurrent = 0;
            }
            this.framesElapsed -= this.framesHold;
        }
    }

    update(dt) {
        this.Draw();
        this.animateFrames(dt);
    }

    static CreateAura(id) {
        const config = AURA_STATS[id];
        return new Sprite({
            color: config.color,
            size: config.size,
            imageSrc: config.imageSrc,
            framesMax: config.framesMax,
            scale: config.scale,
            offset: config.offset
        });
    }
}

// ============================================================================
// BLUE JUMP ORB CLASS (Launches Player high enough to stomp Wither-height Boss!)
// ============================================================================
class BlueJumpOrb extends Sprite {
    constructor({ position }) {
        const cfg = (typeof PERK_VFX_CONFIG !== 'undefined' && PERK_VFX_CONFIG.blueJumpOrb) || {
            size: { x: 70, y: 70 }, color: "#00e5ff", imageSrc: "", scale: 1, framesMax: 6, offset: { x: 0, y: 0 }
        };
        super({
            position: { x: position.x, y: position.y },
            size: { x: cfg.size.x, y: cfg.size.y },
            color: cfg.color,
            imageSrc: cfg.imageSrc,
            scale: cfg.scale,
            framesMax: cfg.framesMax,
            offset: cfg.offset
        });
        this.floatTimer = 0;
        this.baseY = position.y;
        this.cooldown = 0;
    }

    update(dt = 1) {
        this.animateFrames(dt);
        this.floatTimer += 0.08 * dt;
        if (this.cooldown > 0) this.cooldown -= dt;

        const boss = g.Fighters.find(f => f.type === "SkullBoss" && !f.Dead);
        if (boss) {
            const targetOrbX = boss.position.x + (Math.sin(this.floatTimer * 0.4) * 140);
            this.position.x += (targetOrbX - this.position.x) * 0.05 * dt;
        }
        this.position.y = this.baseY + Math.sin(this.floatTimer) * 8;

        this.Draw();

        if (Player1 && !Player1.Dead && this.cooldown <= 0) {
            if (CheckCollisions({ rectangle1: Player1, rectangle2: this })) {
                this.cooldown = 35;
                Player1.velocity.y = -55; // Spinta potenziata per superare l'altezza Wither del Boss!
                Player1.OnGround = false;
                Player1.isSuperJumping = true;
                PlayGameSound('blueOrbBounce');
                SpawnPerkVFX('jumpWind', { x: this.position.x, y: this.position.y });
                CreateVFX(Player1, "MASK", "SUPER JUMP! STOMP THE HEAD!");
            }
        }
    }

    Draw() {
        if (!IsInViewport(this)) return;
        if (this.hasValidImage()) {
            super.Draw();
            return;
        }
        const cx = this.position.x + this.size.x / 2;
        const cy = this.position.y + this.size.y / 2;
        c.save();
        c.fillStyle = "rgba(0, 229, 255, 0.3)";
        c.beginPath();
        c.arc(cx, cy, 38, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#00e5ff";
        c.beginPath();
        c.arc(cx, cy, 24, 0, Math.PI * 2);
        c.fill();

        c.strokeStyle = "#ffffff";
        c.lineWidth = 3;
        c.stroke();

        c.font = "bold 9px 'Press Start 2P', monospace";
        c.fillStyle = "#ffffff";
        c.textAlign = "center";
        c.fillText("JUMP!", cx, cy - 32);
        c.restore();
    }
}

// ============================================================================
// SPRITE VFX CLASS (Safe fallback if key or PNG is missing!)
// ============================================================================
const FALLBACK_VFX_PRESETS = {
    toxicHit:         { size: { x: 95, y: 95 },  color: "#39ff14", framesMax: 6, framesHold: 3, fallbackType: "burst" },
    demonSlash:       { size: { x: 130, y: 110 },color: "#ff0055", framesMax: 6, framesHold: 3, fallbackType: "slash" },
    executionerSlash: { size: { x: 140, y: 140 },color: "#ef4444", framesMax: 6, framesHold: 3, fallbackType: "crossSlash" },
    staticBurst:      { size: { x: 120, y: 120 },color: "#00e5ff", framesMax: 6, framesHold: 3, fallbackType: "burst" },
    vampireDrain:     { size: { x: 100, y: 100 },color: "#e11d48", framesMax: 6, framesHold: 3, fallbackType: "burst" },
    jumpWind:         { size: { x: 90, y: 50 },  color: "#cbd5e1", framesMax: 5, framesHold: 3, fallbackType: "ring" },
    windStep:         { size: { x: 60, y: 40 },  color: "#38bdf8", framesMax: 5, framesHold: 3, fallbackType: "ring" },
    soulLevelUp:      { size: { x: 120, y: 120 },color: "#c084fc", framesMax: 7, framesHold: 3, fallbackType: "burst" },
    combatPortal:     { size: { x: 130, y: 130 },color: "#ffd700", framesMax: 7, framesHold: 3, fallbackType: "burst" },
    heal:             { size: { x: 100, y: 100 },color: "#4ade80", framesMax: 6, framesHold: 3, fallbackType: "burst" }
};

class SpriteVFX extends Sprite {
    constructor({ position, size, color, imageSrc, scale = 1, framesMax = 6, framesHold = 4, offset = { x: 0, y: 0 }, loop = false, flipLeft = false, fallbackType = 'burst', targetFollow = null }) {
        super({ position, size, color, imageSrc, scale, framesMax, offset });
        this.framesHold = framesHold;
        this.loop = loop;
        this.dead = false;
        this.Direction = { left: flipLeft, right: !flipLeft };
        this.fallbackType = fallbackType;
        this.targetFollow = targetFollow;
        this.progress = 0;
    }

    update(dt = 1) {
        if (this.targetFollow && !this.targetFollow.Dead) {
            this.position.x = this.targetFollow.position.x + this.targetFollow.size.x / 2 - this.size.x / 2;
            this.position.y = this.targetFollow.position.y + this.targetFollow.size.y / 2 - this.size.y / 2;
        }

        this.framesElapsed += dt;
        if (this.framesElapsed >= this.framesHold) {
            this.framesElapsed -= this.framesHold;
            if (this.framesCurrent < this.framesMax - 1) {
                this.framesCurrent++;
            } else if (this.loop) {
                this.framesCurrent = 0;
            } else {
                this.dead = true;
            }
        }
        this.progress = (this.framesCurrent + (this.framesElapsed / this.framesHold)) / this.framesMax;
        this.Draw();
    }

    Draw() {
        if (!IsInViewport(this, 250)) return;
        if (this.hasValidImage()) {
            super.Draw();
            return;
        }

        // Effetto procedurale ad alta visibilità quando il file PNG non è presente
        const cx = this.position.x + this.size.x / 2;
        const cy = this.position.y + this.size.y / 2;
        const alpha = Math.max(0, 1 - this.progress * 0.85);
        const radius = (Math.max(this.size.x, this.size.y) / 2) * (0.35 + this.progress * 0.85);

        c.save();
        c.globalAlpha = alpha;
        c.strokeStyle = this.color || "#00e5ff";
        c.fillStyle = this.color || "#00e5ff";
        c.lineWidth = 6;

        if (this.fallbackType === 'slash') {
            const dir = this.Direction.left ? -1 : 1;
            c.beginPath();
            c.arc(cx, cy, radius, dir > 0 ? -1.0 : 2.1, dir > 0 ? 1.0 : 4.1);
            c.stroke();
        } else if (this.fallbackType === 'crossSlash') {
            c.beginPath();
            c.moveTo(cx - radius, cy - radius);
            c.lineTo(cx + radius, cy + radius);
            c.moveTo(cx + radius, cy - radius);
            c.lineTo(cx - radius, cy + radius);
            c.stroke();
        } else if (this.fallbackType === 'ring') {
            c.beginPath();
            c.ellipse(cx, cy, radius * 1.3, radius * 0.4, 0, 0, Math.PI * 2);
            c.stroke();
        } else {
            // Burst energetico doppio
            c.beginPath();
            c.arc(cx, cy, radius, 0, Math.PI * 2);
            c.stroke();
            c.globalAlpha = alpha * 0.35;
            c.beginPath();
            c.arc(cx, cy, radius * 0.65, 0, Math.PI * 2);
            c.fill();
        }
        c.restore();
    }

    static createFromConfig(key, position, flipLeft = false, targetFollow = null) {
        const cfg = (typeof PERK_VFX_CONFIG !== 'undefined' && PERK_VFX_CONFIG[key])
            || FALLBACK_VFX_PRESETS[key]
            || { size: { x: 100, y: 100 }, color: "#ffd700", imageSrc: "", scale: 1, framesMax: 6, framesHold: 3, fallbackType: "burst" };

        const pos = position || { x: 0, y: 0 };
        return new SpriteVFX({
            position: { x: pos.x, y: pos.y },
            size: { x: cfg.size ? cfg.size.x : 100, y: cfg.size ? cfg.size.y : 100 },
            color: cfg.color || "#ffd700",
            imageSrc: cfg.imageSrc || "",
            scale: cfg.scale || 1,
            framesMax: cfg.framesMax || 6,
            framesHold: cfg.framesHold || 4,
            offset: cfg.offset || { x: 0, y: 0 },
            flipLeft,
            fallbackType: cfg.fallbackType || 'burst',
            targetFollow
        });
    }
}

class SoulOrb extends Sprite {
    constructor({ position, target, value = 3 }) {
        const cfg = PERK_VFX_CONFIG.soulOrb;
        super({
            position: { x: position.x, y: position.y },
            size: { x: cfg.size.x, y: cfg.size.y },
            color: cfg.color,
            imageSrc: cfg.imageSrc,
            scale: cfg.scale,
            framesMax: cfg.framesMax,
            offset: cfg.offset
        });
        this.target = target;
        this.value = value;
        this.dead = false;
        this.speed = 5;
    }

    update(dt = 1) {
        if (!this.target || this.target.Dead) { this.dead = true; return; }
        this.animateFrames(dt);
        this.speed = Math.min(24, this.speed + 0.5 * dt);

        const tx = this.target.position.x + this.target.size.x / 2;
        const ty = this.target.position.y + this.target.size.y / 2;
        const dx = tx - this.position.x;
        const dy = ty - this.position.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 34) {
            this.dead = true;
            PlayGameSound('soulAbsorb');
            this.target.runCoins = (this.target.runCoins || 0) + this.value;
            if (this.target.runCoins >= 10) {
                this.target.runCoins -= 10;
                const sLvl = this.target.soulLevel || 1;
                this.target.Damage = Math.floor(this.target.Damage * (1.03 + sLvl * 0.02)) + 2 * sLvl;
                CreateVFX(this.target, "SOUL", "+SOUL DMG!");
                SpawnPerkVFX('soulLevelUp', { x: this.target.position.x, y: this.target.position.y }, false, this.target);
                PlayGameSound('soulPowerUp');
            }
            return;
        }

        this.position.x += (dx / dist) * this.speed * dt;
        this.position.y += (dy / dist) * this.speed * dt;
        this.Draw();
    }

    Draw() {
        if (!IsInViewport(this)) return;
        if (this.hasValidImage()) { super.Draw(); return; }
        c.save();
        c.fillStyle = "#c084fc";
        c.beginPath();
        c.arc(this.position.x + 10, this.position.y + 10, 9, 0, Math.PI * 2);
        c.fill();
        c.restore();
    }
}

class WorldShrine extends Sprite {
    constructor({ type, position }) {
        const cfg = WORLD_OBJECTS_CONFIG[type];
        super({
            position: { x: position.x, y: position.y },
            size: { x: cfg.size.x, y: cfg.size.y },
            color: cfg.color,
            imageSrc: cfg.imageSrc,
            scale: cfg.scale,
            framesMax: cfg.framesMax,
            offset: cfg.offset
        });
        this.type = type;
        this.cfg = cfg;
        this.cooldown = 0;
        this.floatTimer = Math.random() * Math.PI * 2;
    }

    update(dt = 1) {
        if (this.cooldown > 0) this.cooldown -= dt;
        if (!IsInViewport(this, 180)) return;

        this.floatTimer += 0.05 * dt;
        this.animateFrames(dt);
        this.Draw();

        if (!Player1 || Player1.Dead || this.cooldown > 0) return;

        const distX = Math.abs((this.position.x + this.size.x / 2) - (Player1.position.x + Player1.size.x / 2));
        const distY = Math.abs((this.position.y + this.size.y / 2) - (Player1.position.y + Player1.size.y / 2));

        if (this.cfg.isAutoTrigger && distX < 65 && distY < 90) {
            this.cooldown = this.cfg.cooldownMax;
            Player1.velocity.y = -38;
            Player1.OnGround = false;
            SpawnPerkVFX('jumpWind', { x: this.position.x, y: this.position.y });
            PlayGameSound('windDash');
            return;
        }

        if (distX < 95 && distY < 115) {
            c.save();
            c.font = "bold 10px 'Press Start 2P', sans-serif";
            c.textAlign = "center";
            const bx = this.position.x + this.size.x / 2;
            const by = this.position.y - 22;
            c.fillStyle = "rgba(0, 0, 0, 0.85)";
            c.fillRect(bx - 120, by - 30, 240, 40);
            c.strokeStyle = this.color;
            c.strokeRect(bx - 120, by - 30, 240, 40);
            c.fillStyle = this.color;
            c.fillText(this.cfg.name, bx, by - 15);
            c.fillStyle = "#ffffff";
            c.fillText(this.cfg.prompt, bx, by);
            c.restore();

            if (Player1.keys.interact && Player1.keys.interact.pressed) {
                Player1.keys.interact.pressed = false;
                this.activate(Player1);
            }
        }
    }

    activate(player) {
        this.cooldown = this.cfg.cooldownMax;
        PlayGameSound('shrineActivate');
        if (this.type === 'healShrine') {
            const healAmt = Math.floor(player.MaxHealthPoints * 0.4);
            player.HealthPoints = Math.min(player.MaxHealthPoints, player.HealthPoints + healAmt);
            ReduceAddHP(player);
            CreateVFX(player, "HP", `+${healAmt} HP`);
            SpawnPerkVFX('heal', { x: player.position.x, y: player.position.y }, false, player);
        } else if (this.type === 'soulChest') {
            player.coins += 12;
            CreateVFX(player, "MASK", "+12 COINS 🪙");
            SpawnPerkVFX('combatPortal', { x: this.position.x, y: this.position.y });
        } else if (this.type === 'battleAltar') {
            const cost = Math.floor(player.MaxHealthPoints * 0.15);
            if (player.HealthPoints > cost + 50) {
                player.HealthPoints -= cost;
                player.Damage = Math.floor(player.Damage * 1.2);
                ReduceAddHP(player);
                CreateVFX(player, "CRIT", "+20% DMG!");
                SpawnPerkVFX('demonSlash', { x: player.position.x, y: player.position.y }, false, player);
            } else {
                this.cooldown = 0;
            }
        }
    }

    Draw() {
        if (this.hasValidImage()) {
            c.save();
            if (this.cooldown > 0) c.globalAlpha = 0.3;
            super.Draw();
            c.restore();
            return;
        }
        c.save();
        c.globalAlpha = this.cooldown > 0 ? 0.25 : 0.92;
        c.fillStyle = this.color;
        const bob = Math.sin(this.floatTimer) * 3;
        c.fillRect(this.position.x, this.position.y + bob, this.size.x, this.size.y - bob);
        c.strokeStyle = "#ffd700";
        c.lineWidth = 2;
        c.strokeRect(this.position.x, this.position.y + bob, this.size.x, this.size.y - bob);
        c.restore();
    }
}

// ============================================================================
// FIGHTER CLASS (Player, Balanced Enemies, and True Flying Skull Monster Boss)
// ============================================================================
class Fighter extends Sprite {
    constructor({ position, velocity = { x: 0, y: 0 }, size = { x: 0, y: 0 }, color, value = 0, HealthPoints, MaxHealthPoints = 100, keys = { up: { pressed: false }, left: { pressed: false }, attack: { pressed: false }, right: { pressed: false }, defend: { pressed: false }, slam: { pressed: false }, interact: { pressed: false } }, ControlKeys, AttackBox = { position: { x: 0, y: 0 }, size: { x: g.StandardAttBoxWid, y: g.HitHeight }, shape: "" }, Direction = { right: false, left: false }, Player, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 }, sprites, Damage = 10, isAI, attackFrame, type }) {
        super({ position, size, color, imageSrc, scale, framesMax, offset, sprites });

        this.velocity = velocity;
        this.keys = keys;
        this.LastKeyPressed = "";
        this.OnGround = false;
        this.ControlKeys = ControlKeys;
        this.AttackBox = AttackBox;
        this.Direction = Direction;
        this.HealthPoints = HealthPoints || MaxHealthPoints;
        this.MaxHealthPoints = MaxHealthPoints;
        this.Player = Player;
        this.Defending = false;
        this.isAttacking = false;
        this.hitEnemies = [];
        this.Damage = Damage;
        this.Dead = false;
        this.PoweredUp = false;
        this.HitStun = 0;
        this.isAI = isAI;
        this.defenseBuffer = 0;
        this.jumpBuffer = 0;
        this.attackCooldown = 0;
        this.KnockBack = 1;
        this.attackFrame = attackFrame;
        this.type = type;
        this.aiTimer = 0;
        this.staminaBar = 0;
        this.staminaTimer = 300;
        this.imploded = false;
        this.hasShot = false;
        this.isPlunging = false;
        this.isSuperJumping = false;
        this.stepTimer = 0;
        this.coins = 0;
        this.hasPaid = false;
        this.runCoins = 0;
        this.shieldTimer = 0;
        this.hasShield = false;
        this.toxicTimer = 0;
        this.value = value;
        this.deathTimer = 0;

        this.coyoteTimer = 0;
        this.airJumpsLeft = 1;
        this.maxAirJumps = 1;
        this.jumpKeyWasPressed = false;

        // --- SKULL MONSTER TRUE FLIGHT STATE ---
        this.isFlyingBoss = (type === "SkullBoss");
        this.bossArmorActive = (type === "SkullBoss");
        this.bossStunTimer = 0;
        this.hoverPhase = Math.random() * Math.PI * 2;
        this.flightBaseY = (g.MAX_HEIGHT - 600) - 420;
        this.currentAttackType = 'attack';

        // --- ANTI-KITING STATE FOR LAUNCHER ---
        this.spawnOriginX = position.x;
        this.retreatTimer = 0;
        this.retreatCooldown = 0;

        this.shieldSprite = new Sprite({
            position: { x: 0, y: 0 },
            size: PERK_VFX_CONFIG.staticShieldLoop.size,
            color: PERK_VFX_CONFIG.staticShieldLoop.color,
            imageSrc: PERK_VFX_CONFIG.staticShieldLoop.imageSrc,
            framesMax: PERK_VFX_CONFIG.staticShieldLoop.framesMax,
            scale: PERK_VFX_CONFIG.staticShieldLoop.scale,
            offset: PERK_VFX_CONFIG.staticShieldLoop.offset
        });
        this.execMarkSprite = new Sprite({
            position: { x: 0, y: 0 },
            size: PERK_VFX_CONFIG.executionerMark.size,
            color: PERK_VFX_CONFIG.executionerMark.color,
            imageSrc: PERK_VFX_CONFIG.executionerMark.imageSrc,
            framesMax: PERK_VFX_CONFIG.executionerMark.framesMax,
            scale: PERK_VFX_CONFIG.executionerMark.scale,
            offset: PERK_VFX_CONFIG.executionerMark.offset
        });

        this.previousPositionY = this.position.y;
        this.aiState = "APPROACH";
        this.aiStateTimer = 0;
        this.telegraphTimer = 0;
        this.pendingAction = null;
        this.afterImages = [];
    }

    // Helper universale che assicura la morte e il pagamento monete senza bug 1-HP
    checkAndTriggerDeath(dt = 1) {
        if (this.HealthPoints <= 0 && !this.Dead) {
            this.HealthPoints = 0;
            this.death();
        }
        if (this.Dead && !this.imploded) {
            this.deathTimer += dt;
            // Se l'animazione di morte è finita (o dopo 45 frame per il Boss fallback), fa esplodere e paga!
            const deathMax = (this.sprites && this.sprites.death) ? this.sprites.death.framesMax : 6;
            if (this.framesCurrent >= deathMax - 1 || this.deathTimer > 45) {
                this.imploded = true;
                if (this.Player !== 1 && !this.hasPaid && Player1 && !Player1.Dead) {
                    this.hasPaid = true;
                    Player1.coins += (this.value || 5);
                    if (Player1.killEffect && Player1.killEffect.vfx) {
                        SpawnPerkVFX(Player1.killEffect.vfx, { x: this.position.x, y: this.position.y });
                        if (Player1.killEffect.bonusCoins) Player1.coins += Player1.killEffect.bonusCoins;
                    }
                    if (Player1.SoulCollector) {
                        g.SoulOrbs.push(new SoulOrb({
                            position: { x: this.position.x + this.size.x / 2, y: this.position.y + this.size.y / 2 },
                            target: Player1,
                            value: this.value || 5
                        }));
                    }
                }
            }
        }
    }

    update(dt) {
        this.previousPositionY = this.position.y;
        this.checkAndTriggerDeath(dt);

        if (this.isAI && Player1 && !this.Dead) {
            const distToPlayer = Math.abs(this.position.x - Player1.position.x);
            if (distToPlayer < 1800 || this.isFlyingBoss) {
                this.aiTimer++;
                if (this.aiTimer % 2 === 0) this.runAI(dt);
            }
        }

        // Telegraph execution
        if (this.telegraphTimer > 0 && !this.Dead && this.HitStun === 0) {
            this.telegraphTimer -= dt;
            if (this.telegraphTimer <= 0 && this.pendingAction) {
                const act = this.pendingAction;
                this.pendingAction = null;
                if (act === 'melee') this.attack();
                else if (act === 'ranged') this.castRangedAttack();
                else if (act === 'bossAttack1') this.startSkullBossAttack('attack');
                else if (act === 'bossAttack2') this.startSkullBossAttack('attack2');
            }
        }

        if (this.HitStun > 0) {
            this.HitStun--;
            this.telegraphTimer = 0;
            this.pendingAction = null;
        }

        const isKnockedBack = Math.abs(this.velocity.x) > 7;

        if (this.OnGround) {
            this.coyoteTimer = 8;
            this.isSuperJumping = false;
            this.airJumpsLeft = this.maxAirJumps + (this.HermesBoots ? 1 : 0);
        } else if (this.coyoteTimer > 0) {
            this.coyoteTimer--;
        }

        // ====================================================================
        // SKULL MONSTER TRUE FLIGHT PHYSICS (Runs every frame!)
        // ====================================================================
        if (this.isFlyingBoss && !this.Dead) {
            if (this.bossStunTimer > 0) {
                this.bossStunTimer -= dt;
                this.velocity.x *= 0.85;
                if (this.bossStunTimer <= 0) {
                    this.bossArmorActive = true;
                    this.velocity.y = -18;
                    CreateVFX(this, "MASK", "BOSS ARMOR RESTORED!");
                }
            } else {
                this.OnGround = false;
                this.hoverPhase += 0.045 * dt;
                // Vola in alto stile Wither (-420px), raggiungibile col super-salto (-55) del Globo Blu!
                const targetSkyY = (g.MAX_HEIGHT - 600) - 420 + Math.sin(this.hoverPhase * 1.3) * 50;
                this.position.y += (targetSkyY - this.position.y) * 0.09 * dt;
                this.velocity.y = 0;

                if (Player1 && !Player1.Dead && g.FlagFight) {
                    const diffX = (Player1.position.x + Math.sin(this.hoverPhase * 0.7) * 260) - this.position.x;
                    this.Direction.right = (Player1.position.x - this.position.x) > 0;
                    this.Direction.left = !this.Direction.right;
                    this.velocity.x = Math.max(-6.5, Math.min(6.5, diffX * 0.04));
                } else {
                    this.velocity.x = Math.cos(this.hoverPhase) * 3;
                }
            }
        } else {
            this.velocity.x *= 0.8;
        }

        // - - - PLAYER & GROUND ENEMY MOVEMENT - - -
        const baseMoveSpeed = this.Player === 1 ? 11 : (this.type === "launcher" ? 4.2 : 7.0);

        if (!this.isFlyingBoss && !isKnockedBack && this.HitStun === 0 && g.FlagFight) {
            if (this.keys.right.pressed && this.LastKeyPressed === this.ControlKeys.right && !this.Defending && !this.Dead && !this.isAttacking && !this.imploded) {
                this.Direction.right = true;
                this.Direction.left = false;
                this.velocity.x = baseMoveSpeed * (this.speedMult || 1);
                CreateVFX(this, "RUN");
            } else if (this.keys.left.pressed && this.LastKeyPressed === this.ControlKeys.left && !this.Defending && !this.Dead && !this.isAttacking) {
                this.Direction.left = true;
                this.Direction.right = false;
                this.velocity.x = -baseMoveSpeed * (this.speedMult || 1);
                CreateVFX(this, "RUN");
            }

            const jumpJustTriggered = this.keys.up.pressed && !this.jumpKeyWasPressed;
            if (this.keys.up.pressed && !this.Defending && !this.Dead && !this.isAttacking) {
                if (this.OnGround || this.coyoteTimer > 0) {
                    this.velocity.y = -30 + (this.jumpPower || 0);
                    this.OnGround = false;
                    this.coyoteTimer = 0;
                    if (this.HermesBoots) {
                        SpawnPerkVFX('jumpWind', { x: this.position.x, y: this.position.y + this.size.y - 25 });
                        PlayGameSound('windDash');
                    }
                } else if (jumpJustTriggered && !this.isAI && this.airJumpsLeft > 0) {
                    this.airJumpsLeft--;
                    this.velocity.y = -27 + (this.jumpPower || 0) * 0.6;
                    SpawnPerkVFX('jumpWind', { x: this.position.x, y: this.position.y + this.size.y - 20 });
                    PlayGameSound('windDash');
                }
            }
            this.jumpKeyWasPressed = this.keys.up.pressed;

            if (this.keys.slam.pressed && !this.OnGround && this.staminaBar >= 1 && !this.isPlunging) {
                this.keys.slam.pressed = false;
                this.staminaBar--;
                if (!this.isAI) ReduceAddStamina(this);
                this.isPlunging = true;
                this.velocity.x = 0;
                this.velocity.y = 35;
                this.switchSprite('attack');
            }
        }

        // --- MARIO / BOWSER HEAD STOMP CHECK ON SKULL BOSS (Con Audio & Morte Sicura!) ---
        if (this.Player === 1 && !this.Dead && !this.OnGround) {
            g.Fighters.forEach(boss => {
                if (boss.type === "SkullBoss" && !boss.Dead && boss.bossStunTimer <= 0) {
                    const horizOverlap = (this.position.x + this.size.x >= boss.position.x - 25) &&
                                         (this.position.x <= boss.position.x + boss.size.x + 25);
                    const playerFeet = this.position.y + this.size.y;
                    const HitHeadZone = (playerFeet >= boss.position.y - 40) &&
                                        (this.position.y <= boss.position.y + boss.size.y * 0.75);

                    if (horizOverlap && HitHeadZone && (this.velocity.y > -12 || this.isPlunging || this.isSuperJumping)) {
                        this.velocity.y = -26;
                        this.isPlunging = false;
                        this.isSuperJumping = false;

                        boss.bossArmorActive = false;
                        boss.bossStunTimer = 260;
                        boss.velocity.y = 24;
                        const stompDmg = Math.floor(boss.MaxHealthPoints * 0.28);
                        boss.HealthPoints = Math.max(0, boss.HealthPoints - stompDmg);
                        ReduceAddHP(boss);
                        boss.checkAndTriggerDeath(1);

                        g.hitStopFrames = 8;
                        g.cameraShake = 16;

                        PlayGameSound('bossStompHit');
                        SpawnPerkVFX('staticBurst', { x: boss.position.x, y: boss.position.y });
                        CreateVFX(boss, "CRIT", "HEAD STOMP! ARMOR BROKEN!");
                        g.Bullets.push(new Shockwave({ position: { x: boss.position.x + boss.size.x / 2, y: boss.position.y + 20 } }));
                    }
                }
            });
        }

        // Footsteps & Toxic Trail
        if (Math.abs(this.velocity.x) > 1 && this.OnGround && this.Player === 1) {
            if (this.stepTimer <= 0) {
                PlayGameSound('steps');
                if (this.HermesBoots) {
                    SpawnPerkVFX('windStep', { x: this.position.x, y: this.position.y + this.size.y - 35 }, this.Direction.left);
                }
                this.stepTimer = 22;
            } else this.stepTimer--;
        } else this.stepTimer = 0;

        if (this.ToxicTrail && Math.abs(this.velocity.x) > 1 && this.OnGround) {
            this.toxicTimer++;
            if (this.toxicTimer > 16) {
                this.toxicTimer = 0;
                const toxCfg = PERK_VFX_CONFIG.toxicPuddle;
                PlayGameSound('toxicBubble');
                const tLvl = this.toxicLevel || 1;
                g.Bullets.push(new Bullet({
                    position: { x: this.position.x + this.size.x / 2 - (toxCfg.size.x + tLvl * 15) / 2, y: this.position.y + this.size.y - toxCfg.size.y },
                    velocity: { x: 0, y: 0 },
                    size: { x: toxCfg.size.x + tLvl * 15, y: toxCfg.size.y },
                    color: toxCfg.color,
                    imageSrc: toxCfg.imageSrc,
                    framesMax: toxCfg.framesMax,
                    scale: toxCfg.scale,
                    offset: toxCfg.offset,
                    Damage: Math.max(2, Math.floor(this.Damage * (0.10 * tLvl))),
                    KnockBack: 0,
                    caster: this,
                    liveFrames: 150 + tLvl * 30,
                    isUnblockable: true,
                    isMute: true,
                    isToxicPool: true
                }));
            }
        }

        // Apply Horizontal Physics
        this.position.x += this.velocity.x * dt;
        if (this.position.x + this.size.x > g.MAX_WIDTH) {
            this.velocity.x = 0;
            this.position.x = g.MAX_WIDTH - this.size.x;
        } else if (this.position.x < 0) {
            this.velocity.x = 0;
            this.position.x = 0;
        }

        // Apply Vertical Physics & Platform Collisions
        const shouldApplyGravityAndPlatforms = (!this.isFlyingBoss || this.bossStunTimer > 0 || this.Dead);

        if (shouldApplyGravityAndPlatforms) {
            this.velocity.y += g.Gravity_Acceleration * dt;
            if (this.velocity.y > 50) this.velocity.y = 50;
            this.position.y += this.velocity.y * dt;

            this.OnGround = false;
            g.Platforms.forEach(plat => {
                if (this.isFlyingBoss && !plat.isGround) return;

                const prevBottom = this.previousPositionY + this.size.y;
                const currentBottom = this.position.y + this.size.y;
                const isHorizontallyAligned =
                    this.position.x + this.size.x >= plat.position.x &&
                    this.position.x <= plat.position.x + plat.size.x;
                const crossedPlatform = prevBottom <= plat.position.y + 12 && currentBottom >= plat.position.y;

                if (isHorizontallyAligned && crossedPlatform && this.velocity.y >= 0) {
                    this.position.y = plat.position.y - this.size.y;
                    this.velocity.y = 0;
                    this.OnGround = true;
                    CreateVFX(this, "JUMP");
                }
            });
        }

        if (this.position.y + this.size.y > g.MAX_HEIGHT) {
            this.velocity.y = 0;
            this.position.y = g.MAX_HEIGHT - this.size.y;
            this.OnGround = true;
        }

        // Ground Slam Impact
        if (this.OnGround && this.isPlunging) {
            this.isPlunging = false;
            g.cameraShake = 10;
            PlayGameSound('bossStompHit');
            const bersagli = g.Fighters.filter(f => f !== this && !f.Dead && f.Player !== this.Player);
            bersagli.forEach(victim => {
                if (Math.abs(victim.position.x - this.position.x) < 220 && Math.abs(victim.position.y - this.position.y) < 160) {
                    victim.HealthPoints = Math.max(0, victim.HealthPoints - Math.floor(this.Damage * 1.5));
                    victim.velocity.y = -18;
                    victim.velocity.x = 12 * (victim.position.x > this.position.x ? 1 : -1);
                    ReduceAddHP(victim);
                    victim.hurt();
                    victim.checkAndTriggerDeath(1);
                    CreateVFX(victim, "HIT");
                }
            });
            g.Bullets.push(new Shockwave({ position: { x: this.position.x + this.size.x / 2, y: this.position.y + this.size.y } }));
            this.velocity.y = -10;
            this.OnGround = false;
        }

        // AttackBox Positioning
        this.AttackBox.position.y = this.Player === 1 ? this.position.y - this.AttackBox.size.y / 3 : this.position.y - this.AttackBox.size.y / 2;
        const AttackOffset = -20;
        if (this.Direction.right) this.AttackBox.position.x = this.position.x + AttackOffset;
        else if (this.Direction.left) this.AttackBox.position.x = this.position.x + this.size.x - this.AttackBox.size.x - AttackOffset;

        // Independent cooldown for Magic Caster
        if (this.magicCooldown > 0) this.magicCooldown--;

        // - - - ATTACK & BOSS SPECIAL ATTACK EXECUTION - - -
        if (this.attackCooldown > 0) {
            this.isAttacking = false;
            this.attackCooldown--;
        } else if (this.isAttacking && !this.Dead) {
            if (!this.attackSoundPlayed && this.Player === 1) {
                PlayGameSound('blade');
                if (this.DemonStrength) {
                    PlayGameSound('demonSlash');
                    SpawnPerkVFX('demonSlash', {
                        x: this.Direction.right ? this.position.x + this.size.x : this.position.x - 110,
                        y: this.position.y
                    }, this.Direction.left);
                }
                this.attackSoundPlayed = true;
            }

            // --- SKULL MONSTER BOSS ATTACKS ---
            if (this.isFlyingBoss) {
                if (this.currentAttackType === 'attack' && (this.framesCurrent === 4 || this.framesCurrent === 6 || this.framesCurrent === 8) && this.lastBossShotFrame !== this.framesCurrent) {
                    this.lastBossShotFrame = this.framesCurrent;
                    this.fireSkullBeam();
                } else if (this.currentAttackType === 'attack2' && this.framesCurrent === 6 && !this.hasShot) {
                    this.hasShot = true;
                    this.firePredictiveMissile();
                }
            }

            // Standard Attack Active Frame
            if (!this.isFlyingBoss && this.framesCurrent === this.attackFrame) {
                if (this.CanShoot && !this.hasShot && (!this.magicCooldown || this.magicCooldown <= 0)) {
                    this.hasShot = true;
                    this.magicCooldown = Math.max(55, 135 - ((this.magicLevel || 1) - 1) * 15);

                    const dir = this.Direction.right ? 1 : -1;
                    const muzzlePos = { x: this.Direction.right ? this.position.x + this.size.x : this.position.x - 40, y: this.position.y - 10 };
                    const fireballDmg = Math.max(5, Math.floor(this.Damage * (0.35 + ((this.magicLevel || 1) - 1) * 0.08)));

                    SpawnPerkVFX('magicCast', muzzlePos, this.Direction.left);
                    PlayGameSound('magicCast');

                    g.Bullets.push(new Bullet({
                        position: { x: muzzlePos.x, y: muzzlePos.y },
                        velocity: { x: 32 * dir, y: 5 },
                        size: { x: 40, y: 25 },
                        color: "#8f00ff",
                        imageSrc: './img/VFX/Bullets/Fireball.png',
                        framesMax: 5,
                        Damage: fireballDmg,
                        KnockBack: this.KnockBack * 0.5,
                        caster: this,
                        scale: 2.2
                    }));

                    if (this.SplitShot) {
                        SpawnPerkVFX('splitShotBurst', muzzlePos, this.Direction.left);
                        PlayGameSound('splitShot');
                        const sLvl = Math.min(3, this.splitLevel || 1);
                        for (let s = 1; s <= sLvl; s++) {
                            [-4 * s, 7 * s].forEach(vy => {
                                g.Bullets.push(new Bullet({
                                    position: { x: muzzlePos.x, y: muzzlePos.y },
                                    velocity: { x: 30 * dir, y: vy },
                                    size: { x: 35, y: 22 },
                                    color: "#f43f5e",
                                    imageSrc: './img/VFX/Bullets/Fireball.png',
                                    framesMax: 5,
                                    Damage: Math.max(3, Math.floor(fireballDmg * 0.55)),
                                    KnockBack: this.KnockBack * 0.3,
                                    caster: this,
                                    scale: 1.7
                                }));
                            });
                        }
                    }
                }

                // MELEE ATTACK LOGIC
                let targets = this.Player === 1
                    ? g.Fighters.filter(f => f !== this && !f.Dead)
                    : g.Fighters.filter(f => f.Player === 1 && !f.Dead);

                for (let i = 0; i < targets.length; i++) {
                    const victim = targets[i];
                    if (!victim || victim.Dead || victim === this || this.hitEnemies.includes(victim)) continue;
                    if (Math.abs(this.position.x - victim.position.x) > 340) continue;

                    if (CheckAttackCollision({ attacker: this, victim }) || CheckCollisions({ rectangle1: this.AttackBox, rectangle2: victim })) {
                        this.hitEnemies.push(victim);

                        if (victim.StaticShield && victim.hasShield) {
                            victim.hasShield = false;
                            CreateVFX(victim, "DEF");
                            PlayGameSound('staticBreak');
                            SpawnPerkVFX('staticBurst', { x: victim.position.x - 20, y: victim.position.y - 10 }, false, victim);
                            g.Bullets.push(new Shockwave({ position: { x: victim.position.x + victim.size.x / 2, y: victim.position.y + victim.size.y } }));
                            this.velocity.x = (this.position.x > victim.position.x ? 25 : -25);
                            this.velocity.y = -10;
                            this.HitStun = 30;
                            continue;
                        }

                        if (!victim.Defending) {
                            g.hitStopFrames = 4;
                            g.cameraShake = 5;
                            PlayGameSound('swordHit');
                            CreateVFX(victim, "HIT");
                            CreateVFX(victim, "DAM");
                            ApplyKnockback(victim, this);

                            let mult = 1;
                            if (victim.type === "SkullBoss" && victim.bossArmorActive) {
                                mult = 0.15;
                                CreateVFX(victim, "DEF", "ARMORED! USE BLUE ORB!");
                            } else if (this.Executioner && victim.HealthPoints <= (victim.MaxHealthPoints * 0.30)) {
                                mult = 2.0 + (this.execLevel || 1) * 0.5;
                                CreateVFX(this, "CRIT");
                                SpawnPerkVFX('executionerSlash', { x: victim.position.x - 25, y: victim.position.y - 15 });
                                PlayGameSound('executionerStrike');
                            } else if (this.Player === 1 && Math.random() <= 0.2) {
                                mult = 2;
                                CreateVFX(this, "CRIT");
                            }

                            let totalDmg = Math.max(1, Math.floor(this.Damage * mult));

                            // --- APPLY EQUIPPED KATANA ELEMENTAL PERK ON HIT ---
                            if (this.Player === 1 && this.equippedWeapon) {
                                const el = this.equippedWeapon.element;
                                if (el === 'fire') {
                                    totalDmg += Math.floor(this.Damage * 0.25);
                                    CreateVFX(victim, "CRIT", "🔥 BURN!");
                                } else if (el === 'lightning') {
                                    victim.HitStun = 38;
                                    SpawnPerkVFX('staticBurst', { x: victim.position.x, y: victim.position.y });
                                } else if (el === 'poison') {
                                    SpawnPerkVFX('toxicHit', { x: victim.position.x, y: victim.position.y });
                                    totalDmg += Math.floor(this.Damage * 0.20);
                                } else if (el === 'ice') {
                                    victim.speedMult = 0.5;
                                    CreateVFX(victim, "DEF", "❄️ FROZEN!");
                                } else if (el === 'void' && victim.HealthPoints <= victim.MaxHealthPoints * 0.35) {
                                    totalDmg += Math.floor(this.Damage * 0.8);
                                    CreateVFX(victim, "CRIT", "🌑 VOID EXECUTE!");
                                } else if (el === 'gold' && Math.random() < 0.45) {
                                    this.coins += 2;
                                    CreateVFX(this, "MASK", "+2 🪙");
                                }
                            }

                            victim.HealthPoints = Math.max(0, victim.HealthPoints - totalDmg);
                            ReduceAddHP(victim);
                            if (victim.HealthPoints > 0) victim.hurt();
                            else victim.checkAndTriggerDeath(1);

                            if (this.lifeSteal) {
                                const stolen = Math.max(1, Math.floor(totalDmg * this.lifeSteal));
                                this.HealthPoints = Math.min(this.MaxHealthPoints, this.HealthPoints + stolen);
                                ReduceAddHP(this);
                                CreateVFX(this, "HP", `+${stolen} HP`);
                                SpawnPerkVFX('vampireDrain', { x: this.position.x, y: this.position.y }, false, this);
                                PlayGameSound('vampireDrain');
                            }
                        } else {
                            CreateVFX(victim, "DEF");
                            if (!victim.isAI && victim.staminaBar < 3) {
                                victim.staminaBar++;
                                ReduceAddStamina(victim);
                            }
                        }
                    }
                }
            }

            // End of attack animation
            const activeSpriteObj = this.sprites[this.currentAttackType] || this.sprites.attack;
            if (this.isAttacking && this.framesCurrent >= activeSpriteObj.framesMax - 1) {
                this.isAttacking = false;
                this.currentAttackType = 'attack';
                this.attackCooldown = this.isFlyingBoss ? 90 : (this.staminaBar >= 3 ? 10 : 50);
                this.hitEnemies.length = 0;

                if (!this.isAI) {
                    g.Bullets.forEach(bullet => {
                        if (bullet.Dead || bullet.hasHit || bullet.caster === this || bullet.isUnblockable) return;
                        if (CheckCollisions({ rectangle1: this.AttackBox, rectangle2: bullet })) {
                            if (!this.isAI && this.staminaBar < 3) {
                                this.staminaBar++;
                                ReduceAddStamina(this);
                            }
                            PlayGameSound('parry');
                            SpawnPerkVFX('ricochetSpark', { x: bullet.position.x, y: bullet.position.y });
                            bullet.hasHit = true;
                            bullet.Dead = true;
                            CreateVFX(bullet, "DEF");

                            const dir = this.Direction.right ? 1 : -1;
                            for (let i = -1; i <= 1; i++) {
                                g.Bullets.push(new Bullet({
                                    position: { x: bullet.position.x, y: bullet.position.y },
                                    velocity: { x: 24 * dir, y: i * 5 },
                                    size: { x: bullet.size.x * 0.7, y: bullet.size.y * 0.7 },
                                    color: bullet.color,
                                    imageSrc: bullet.image ? bullet.image.src : '',
                                    framesMax: bullet.framesMax,
                                    scale: bullet.scale * 0.7,
                                    offset: bullet.offset,
                                    Damage: Math.max(20, Math.floor(this.Damage * 0.5)),
                                    KnockBack: bullet.KnockBack,
                                    caster: this
                                }));
                            }
                        }
                    });
                }
            }
        }

        // Dash & After-Images
        if (this.keys.defend.pressed && this.LastKeyPressed === this.ControlKeys.defend && !this.isAttacking && g.FlagFight && this.defenseBuffer === 0 && !this.Dead) {
            this.keys.defend.pressed = false;
            this.defenseBuffer = 45;
            CreateVFX(this, "DASH");
            this.Defending = true;
            this.defend();
        } else if (this.defenseBuffer > 0) {
            this.defenseBuffer--;
            if (this.defenseBuffer > 35) {
                this.Defending = true;
                this.velocity.x = this.Direction.right ? 58 * dt : -58 * dt;
                const maxGhosts = g.isMobile ? 4 : 12;
                if (this.afterImages.length < maxGhosts) {
                    this.afterImages.push({
                        x: this.position.x,
                        y: this.position.y,
                        image: this.image,
                        framesCurrent: this.framesCurrent,
                        framesMax: this.framesMax,
                        right: this.Direction.right,
                        life: 1
                    });
                }
            } else {
                this.Defending = false;
                if (this.keys.left.pressed) this.LastKeyPressed = this.ControlKeys.left;
                else if (this.keys.right.pressed) this.LastKeyPressed = this.ControlKeys.right;
            }
        }

        if (this.staminaBar >= 3) {
            utilStaminaTimer(this);
            CreateVFX(this, "UP");
        }

        if (this.StaticShield && !this.hasShield) {
            this.shieldTimer++;
            const cooldownNeeded = Math.max(180, 720 - ((this.shieldLevel || 1) - 1) * 120);
            if (this.shieldTimer >= cooldownNeeded) {
                this.hasShield = true;
                this.shieldTimer = 0;
                CreateVFX(this, "UP");
                PlayGameSound('staticRecharge');
            }
        }

        // ====================================================================
        // FINAL RENDER STEP (After physics so Player, Weapon & Aura match 100%)
        // ====================================================================
        if (this.afterImages.length > 0) {
            this.afterImages.forEach(a => a.life -= 0.05);
            this.afterImages = this.afterImages.filter(a => a.life > 0);
            this.drawAfterImages();
        }

        // 1. Katana DIETRO quando sei in Idle / Corsa / Salto
        if (!this.isAttacking) this.drawWeapon(dt);

        // 2. Corpo del Giocatore / Nemico
        this.Draw();

        // 3. Katana DAVANTI durante l'attacco
        if (this.isAttacking) this.drawWeapon(dt);

        // 4. Aura, Pet e Scudi SOPRA il giocatore
        this.drawAura(dt);
        this.drawPerkOverlays(dt);
        this.animateFrames(dt);
    }

    startSkullBossAttack(attackKey) {
        this.currentAttackType = attackKey;
        this.switchSprite(attackKey);
        this.isAttacking = true;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.hasShot = false;
        this.lastBossShotFrame = -1;
    }

    fireSkullBeam() {
        if (!Player1) return;
        PlayGameSound('bossBeam');
        const startX = this.position.x + this.size.x / 2;
        const startY = this.position.y + this.size.y / 2;
        const tx = Player1.position.x + Player1.size.x / 2;
        const ty = Player1.position.y + Player1.size.y / 2;
        const angle = Math.atan2(ty - startY, tx - startX);
        const speed = 20;

        g.Bullets.push(new Bullet({
            position: { x: startX, y: startY },
            velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
            size: { x: 48, y: 48 },
            color: "#ff0000",
            imageSrc: './img/VFX/Bullets/Fireball.png',
            framesMax: 5,
            scale: 2.2,
            Damage: this.Damage,
            KnockBack: 18,
            caster: this,
            isSkullBeam: true
        }));
    }

    firePredictiveMissile() {
        if (!Player1) return;
        PlayGameSound('bossMissileLock');

        const leadFrames = 42;
        let predictedX = Player1.position.x + Player1.size.x / 2 + (Player1.velocity.x * leadFrames);
        predictedX = Math.max(100, Math.min(g.MAX_WIDTH - 100, predictedX));
        const groundY = g.MAX_HEIGHT - 600;

        const startX = this.position.x + this.size.x / 2;
        const startY = this.position.y + this.size.y / 2;
        const dx = predictedX - startX;
        const dy = groundY - startY;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const speed = 18;

        g.Bullets.push(new Bullet({
            position: { x: startX, y: startY },
            velocity: { x: (dx / dist) * speed, y: (dy / dist) * speed },
            size: { x: 70, y: 70 },
            color: "#ff0055",
            imageSrc: './img/VFX/Bullets/Fireball.png',
            framesMax: 5,
            scale: 3.2,
            Damage: Math.floor(this.Damage * 1.4),
            KnockBack: 35,
            caster: this,
            isUnblockable: true,
            isPredictiveMissile: true,
            targetStrikeX: predictedX,
            targetStrikeY: groundY
        }));
    }

    drawPerkOverlays(dt) {
        if (this.Dead || !IsInViewport(this)) return;

        if (this.StaticShield && this.hasShield) {
            this.shieldSprite.position.x = this.position.x - 15;
            this.shieldSprite.position.y = this.position.y - 5;
            this.shieldSprite.animateFrames(dt);
            if (this.shieldSprite.hasValidImage()) this.shieldSprite.Draw();
            else {
                c.save();
                c.strokeStyle = "rgba(56, 189, 248, 0.8)";
                c.lineWidth = 3;
                c.beginPath();
                c.ellipse(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2, this.size.x * 0.75, this.size.y * 0.6, 0, 0, Math.PI * 2);
                c.stroke();
                c.restore();
            }
        }

        if (this.Player !== 1 && Player1 && Player1.Executioner && this.HealthPoints <= this.MaxHealthPoints * 0.30) {
            this.execMarkSprite.position.x = this.position.x + this.size.x / 2 - 22;
            this.execMarkSprite.position.y = this.position.y - 62;
            this.execMarkSprite.animateFrames(dt);
            if (this.execMarkSprite.hasValidImage()) this.execMarkSprite.Draw();
            else {
                c.save();
                c.strokeStyle = "#ef4444";
                c.lineWidth = 3;
                const mx = this.position.x + this.size.x / 2;
                const my = this.position.y - 42;
                c.beginPath();
                c.arc(mx, my, 12, 0, Math.PI * 2);
                c.stroke();
                c.restore();
            }
        }

        if (this.isAI && this.telegraphTimer > 0) {
            c.save();
            c.font = "bold 20px 'Press Start 2P', monospace";
            c.fillStyle = this.isFlyingBoss ? "#00e5ff" : "#fbbf24";
            c.textAlign = "center";
            c.fillText(this.pendingAction === 'bossAttack2' ? "⚠️ MISSILE!" : "!", this.position.x + this.size.x / 2, this.position.y - 24);
            c.restore();
        }
    }

    switchSprite(spriteName) {
        if (!this.sprites || !this.sprites[spriteName]) return;
        const activeAttack = this.sprites[this.currentAttackType] || this.sprites.attack;
        const isCurrentAttack = (this.image === this.sprites.attack.image && this.row === (this.sprites.attack.row || 0)) ||
                                (this.sprites.attack2 && this.image === this.sprites.attack2.image && this.row === (this.sprites.attack2.row || 0));
        const isCurrentHurt   = this.sprites.hurt && this.image === this.sprites.hurt.image && this.row === (this.sprites.hurt.row || 0);
        const isCurrentDeath  = this.sprites.death && this.image === this.sprites.death.image && this.row === (this.sprites.death.row || 0);

        // Non bloccare mai la transizione verso 'death'!
        if (spriteName !== 'death') {
            if (isCurrentAttack && this.framesCurrent < activeAttack.framesMax - 1) return;
            if (isCurrentHurt && this.framesCurrent < this.sprites.hurt.framesMax - 1) return;
        }

        if (isCurrentDeath) {
            if (this.framesCurrent >= this.sprites.death.framesMax - 1) {
                this.checkAndTriggerDeath(50);
            }
            return;
        }

        const targetSprite = this.sprites[spriteName];
        if (this.image === targetSprite.image && this.row === (targetSprite.row || 0)) return;

        this.image = targetSprite.image;
        this.framesMax = targetSprite.framesMax;
        this.framesHold = targetSprite.framesHold || 6;
        this.row = targetSprite.row || 0;
        this.customFrameWidth = targetSprite.frameWidth || null;
        this.customFrameHeight = targetSprite.frameHeight || null;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
    }

    attack() {
        if (this.attackCooldown === 0) {
            this.currentAttackType = 'attack';
            this.switchSprite('attack');
            this.isAttacking = true;
            this.framesCurrent = 0;
            this.framesElapsed = 0;
            this.hitEnemies = [];
            this.hasShot = false;
            this.attackSoundPlayed = false;
            if (this.Player === 1 && this.OnGround) {
                this.velocity.x = this.Direction.right ? 8 : -8;
            }
        }
    }

    castRangedAttack() {
        if (this.attackCooldown === 0 && !this.isAttacking) {
            this.switchSprite('attack');
            this.isAttacking = true;
            this.framesCurrent = 0;
            this.framesElapsed = 0;
            this.hitEnemies = [];
            this.velocity.x = 0;

            const bulletType = this.type === "BigAhhLauncher" ? 2 : 1;
            this.type === "BigAhhLauncher" ? PlayGameSound('BigFireballs') : PlayGameSound('SmallFireballs');
            this.castBullet(this, bulletType);
            this.attackCooldown = this.type === "BigAhhLauncher" ? 190 : 115;
        }
    }

    plunge() { this.isPlunging = true; this.switchSprite('slam'); }
    hurt() { if (!this.isFlyingBoss && !this.Dead) { this.isAttacking = false; this.switchSprite('hurt'); } }
    death() { this.Dead = true; this.PoweredUp = false; this.isAttacking = false; this.switchSprite('death'); }
    defend() { this.switchSprite('defence'); }

    drawAfterImages() {
        c.save();
        this.afterImages.forEach(a => {
            if (!a.image || !a.image.complete || a.image.naturalWidth === 0) return;
            const frameWidth = a.image.width / a.framesMax;
            c.save();
            c.globalAlpha = Math.max(0, a.life) * 0.4;
            c.translate(a.x + this.size.x / 2, a.y);
            if (!a.right) c.scale(-1, 1);
            c.drawImage(
                a.image,
                a.framesCurrent * frameWidth, 0,
                frameWidth, a.image.height,
                -this.size.x / 2 - this.offset.x, -this.offset.y,
                frameWidth * this.scale, a.image.height * this.scale
            );
            c.restore();
        });
        c.restore();
    }

    runAI(dt = 1) {
        if (!g.FlagFight || this.Dead || this.telegraphTimer > 0) return;
        const other = Player1;
        if (!other || other.Dead) return;

        const diffX = other.position.x - this.position.x;
        const diffY = other.position.y - this.position.y;
        const dist = Math.abs(diffX);

        if (this.type === "SkullBoss") {
            if (this.bossStunTimer > 0) return;
            if (this.attackCooldown === 0 && !this.isAttacking) {
                this.telegraphTimer = 18;
                this.pendingAction = (Math.random() < 0.55) ? 'bossAttack1' : 'bossAttack2';
                PlayGameSound('enemyTelegraph');
            }
            return;
        }

        this.keys.right.pressed = false;
        this.keys.left.pressed = false;
        this.keys.up.pressed = false;
        this.keys.defend.pressed = false;

        let flockPushX = 0;
        g.Fighters.forEach(ally => {
            if (ally !== this && !ally.Dead && ally.Player !== 1) {
                const dxAlly = this.position.x - ally.position.x;
                if (Math.abs(dxAlly) < 90 && Math.abs(this.position.y - ally.position.y) < 90) {
                    flockPushX += dxAlly >= 0 ? 1 : -1;
                }
            }
        });

        if (this.type === "base") {
            if (diffY < -110 && this.OnGround && dist < 420) {
                this.keys.up.pressed = true;
                this.LastKeyPressed = this.ControlKeys.up;
            }

            this.aiStateTimer -= 2;
            if (this.aiStateTimer <= 0) {
                this.aiStateTimer = 16 + Math.floor(Math.random() * 16);
                if (dist > 220) this.aiState = "APPROACH";
                else if (dist < 55 && flockPushX !== 0) this.aiState = "FLANK";
                else if (dist < this.AttackBox.size.x * 0.85 && !this.isAttacking && Math.abs(diffY) < 130) {
                    this.aiState = Math.random() < 0.62 ? "ATTACK_WINDOW" : "IDLE";
                } else this.aiState = "APPROACH";
            }

            if (this.aiState === "APPROACH") {
                if (diffX > 0) { this.keys.right.pressed = true; this.LastKeyPressed = this.ControlKeys.right; }
                else { this.keys.left.pressed = true; this.LastKeyPressed = this.ControlKeys.left; }
            } else if (this.aiState === "FLANK") {
                if (flockPushX > 0) { this.keys.right.pressed = true; this.LastKeyPressed = this.ControlKeys.right; }
                else { this.keys.left.pressed = true; this.LastKeyPressed = this.ControlKeys.left; }
            } else if (this.aiState === "ATTACK_WINDOW" && dist < this.AttackBox.size.x && !this.isAttacking && this.attackCooldown === 0) {
                this.telegraphTimer = 10;
                this.pendingAction = 'melee';
                PlayGameSound('enemyTelegraph');
                this.aiStateTimer = 18;
            }

            if (!this.isAttacking) {
                this.Direction.right = diffX > 0;
                this.Direction.left = diffX <= 0;
            }
        } else if (this.type === "launcher") {
            if (this.isAttacking && this.framesCurrent >= this.sprites.attack.framesMax - 1) return;

            if (this.retreatCooldown > 0) this.retreatCooldown -= 2;
            if (this.retreatTimer > 0) this.retreatTimer -= 2;

            const MinDistance = 130;
            const MaxDistance = 520;
            const distFromSpawn = Math.abs(this.position.x - (this.spawnOriginX || this.position.x));
            const canRetreat = (distFromSpawn < 280 && this.retreatCooldown <= 0);

            if (dist < MinDistance && canRetreat) {
                if (this.retreatTimer <= 0) {
                    this.retreatTimer = 24;
                    this.retreatCooldown = 120;
                }
            }

            if (this.retreatTimer > 0) {
                if (diffX > 0) { this.keys.left.pressed = true; this.LastKeyPressed = this.ControlKeys.left; }
                else { this.keys.right.pressed = true; this.LastKeyPressed = this.ControlKeys.right; }
            } else if (dist > MaxDistance) {
                if (diffX > 0) { this.keys.right.pressed = true; this.LastKeyPressed = this.ControlKeys.right; }
                else { this.keys.left.pressed = true; this.LastKeyPressed = this.ControlKeys.left; }
            }

            this.Direction.right = diffX > 0;
            this.Direction.left = diffX <= 0;

            if (dist <= MaxDistance && !this.Dead && this.attackCooldown === 0 && Math.random() < 0.05) {
                this.telegraphTimer = 12;
                this.pendingAction = 'ranged';
            }
        } else if (this.type === "BigAhhLauncher") {
            this.Direction.right = diffX > 0;
            this.Direction.left = diffX <= 0;
            if (!this.Dead && this.attackCooldown === 0 && dist < 1350 && Math.random() < 0.04) {
                this.telegraphTimer = 18;
                this.pendingAction = 'ranged';
                PlayGameSound('enemyTelegraph');
            }
        }
    }

    castBullet(caster, type = 1) {
        if (caster.attackCooldown > 0) return;
        g.Bullets.push(Bullet.CreateBullet(type, caster));
    }

    drawAura(dt) {
        if (this.Dead || this.Player !== 1 || !IsInViewport(this)) return;

        // 1. Disegna l'Aura se attiva
        if (this.PoweredUp) {
            const auraType = this.shopAuraType || 'sprite1';
            if ((auraType === 'sprite1' || auraType === 'sprite2') && typeof Aura1 !== 'undefined') {
                Aura1.position.x = this.position.x;
                Aura1.position.y = this.position.y;
                Aura1.update(dt);
            } else if (auraType === 'procedural_lightning' || auraType === 'procedural_gold') {
                const cx = this.position.x + this.size.x / 2;
                const cy = this.position.y + this.size.y / 2;
                const time = Date.now() * 0.008;
                const auraCol = this.shopAuraColor || '#00e5ff';

                c.save();
                c.globalCompositeOperation = "lighter";
                c.strokeStyle = auraCol;
                c.fillStyle = auraCol;
                c.globalAlpha = 0.45 + Math.sin(time * 2) * 0.15;

                c.lineWidth = 3;
                c.beginPath();
                c.ellipse(cx, cy + 5, 46 + Math.sin(time * 3) * 5, 66 + Math.cos(time * 3) * 5, 0, 0, Math.PI * 2);
                c.stroke();

                for (let i = 0; i < 4; i++) {
                    const sx = cx + Math.sin(time * 2.5 + i * 1.7) * 35;
                    const sy = cy + 45 - ((time * 25 + i * 28) % 100);
                    c.fillRect(sx - 2, sy - 6, 4, 12);
                }
                c.restore();
            }
        }

        // 2. Disegna e aggiorna il Pet Guardiano (anche se non hai un'aura equipaggiata!)
        if (this.equippedPet && this.equippedPet.id !== 'pet_none') {
            const pet = this.equippedPet;
            const t = Date.now() * 0.005;
            const px = this.position.x + (this.Direction.right ? -38 : this.size.x + 22) + Math.cos(t * 1.5) * 10;
            const py = this.position.y - 18 + Math.sin(t * 2.2) * 12;

            c.save();
            c.fillStyle = pet.color || '#00e5ff';
            c.beginPath();
            c.arc(px, py, 14, 0, Math.PI * 2);
            c.fill();
            c.font = "16px sans-serif";
            c.textAlign = "center";
            c.fillText(pet.icon || "🐉", px, py + 6);
            c.restore();

            this.petShotTimer = (this.petShotTimer || 0) + 1;
            this.petShotTimer = (this.petShotTimer || 0) + 1;
            const balancedRate = Math.max(135, pet.fireRate || 240); // Mai più raffica: min 2.2s - 4.0s!
            const balancedDmg  = Math.min(90, pet.dmg || 10);        // Danno di supporto bilanciato!

            if (g.FlagFight && this.petShotTimer >= balancedRate) {
                const target = g.Fighters.find(f => f.Player !== 1 && !f.Dead && !(f.type === "SkullBoss" && f.bossArmorActive));
                if (target) {
                    this.petShotTimer = 0;
                    const ang = Math.atan2(target.position.y - py, target.position.x - px);
                    g.Bullets.push(new Bullet({
                        position: { x: px, y: py },
                        velocity: { x: Math.cos(ang) * 22, y: Math.sin(ang) * 22 },
                        size: { x: 22, y: 22 },
                        color: pet.color,
                        Damage: balancedDmg,
                        KnockBack: 2,
                        caster: this,
                        isSkullBeam: true,
                        isMute: true
                    }));
                }
            }
        }
    }

    drawWeapon(dt) {
        if (this.Dead || this.Player !== 1 || !this.equippedWeapon || !IsInViewport(this)) return;
        const wp = this.equippedWeapon;

        const cx = this.position.x + this.size.x / 2;
        const cy = this.position.y + this.size.y / 2;
        const dir = this.Direction.left ? -1 : 1;
        const breathY = (this.framesCurrent % 2 === 0) ? 0 : 2;

        let handX = -6, handY = 10 + breathY, bladeAngle = 1.2 * Math.PI, drawSlashArc = false;

        if (this.isAttacking) {
            const f = this.framesCurrent;
            if (f <= 1)      { handX = -6; handY = -26; bladeAngle = 1.35 * Math.PI; }
            else if (f === 2){ handX = 12; handY = -20; bladeAngle = -0.35 * Math.PI; }
            else if (f === 3){ handX = 32; handY = -2;  bladeAngle = -0.05 * Math.PI; drawSlashArc = true; }
            else             { handX = 38; handY = 8;   bladeAngle = 0.12 * Math.PI;  drawSlashArc = true; }
        } else if (this.velocity.y !== 0) {
            handX = -8; handY = 2; bladeAngle = 1.15 * Math.PI;
        } else if (Math.abs(this.velocity.x) > 1) {
            handX = -10; handY = 12 + breathY; bladeAngle = 1.12 * Math.PI;
        }

        const bladeLen = (wp.length || 90) * 0.85;
        const bladeW = wp.width || 6;

        c.save();
        c.translate(cx, cy);
        c.scale(dir, 1);

        c.save();
        c.translate(handX, handY);
        c.rotate(bladeAngle);

        c.fillStyle = wp.glowColor;
        c.globalAlpha = this.isAttacking ? 0.55 : 0.3;
        c.beginPath();
        c.moveTo(0, -bladeW);
        c.quadraticCurveTo(bladeLen * 0.6, -bladeW * 1.3, bladeLen + 6, -1);
        c.lineTo(bladeLen, bladeW);
        c.lineTo(0, bladeW * 0.5);
        c.closePath();
        c.fill();

        c.globalAlpha = 1;
        c.fillStyle = wp.bladeColor;
        c.beginPath();
        c.moveTo(0, -bladeW * 0.45);
        c.quadraticCurveTo(bladeLen * 0.55, -bladeW * 0.8, bladeLen + 5, -1);
        c.lineTo(bladeLen - 2, bladeW * 0.45);
        c.quadraticCurveTo(bladeLen * 0.5, 0, 0, bladeW * 0.45);
        c.closePath();
        c.fill();

        c.fillStyle = "#ffffff";
        c.fillRect(2, -1, bladeLen * 0.88, 1.5);
        c.fillStyle = "#111318";
        c.fillRect(-16, -2.5, 16, 5);
        c.fillStyle = "#d4af37";
        c.fillRect(-2, -bladeW, 4, bladeW * 2);
        c.restore();

        if (drawSlashArc) {
            c.strokeStyle = wp.glowColor;
            c.lineWidth = 9;
            c.globalAlpha = 0.75;
            c.beginPath();
            c.arc(22, 0, bladeLen + 28, -1.0, 0.75);
            c.stroke();
            c.strokeStyle = wp.bladeColor;
            c.lineWidth = 3.5;
            c.stroke();
        }
        c.restore();
    }

    static createFighters(ids, index = 0) {
        const configMap = {
            1: FIGHTER_STATS.Sekiro,
            2: FIGHTER_STATS.Night,
            3: FIGHTER_STATS.Night3,
            4: FIGHTER_STATS.Night2,
            5: FIGHTER_STATS.SkullBoss
        };

        const configData = configMap[ids] || FIGHTER_STATS.Night;
        const basePos = ids === 1 ? g.StartingPositionP1 : g.StartingPositionP2;
        let spawnPos = { x: basePos.x, y: basePos.y };

        if (ids >= 2) spawnPos.x -= (index * 180) + Math.random() * 60;

        let clonedSprites = {};
        for (const [key, value] of Object.entries(configData.sprites)) {
            clonedSprites[key] = {
                imageSrc: value.imageSrc,
                framesMax: value.framesMax,
                framesHold: value.framesHold,
                row: value.row || 0,
                frameWidth: value.frameWidth || null,
                frameHeight: value.frameHeight || null
            };
        }

        return new Fighter({
            position: spawnPos,
            size: { ...configData.size },
            ControlKeys: configData.ControlKeys,
            color: configData.color,
            Direction: { ...configData.Direction },
            AttackBox: {
                position: { ...configData.AttackBox.position },
                size: { ...configData.AttackBox.size },
                shape: configData.AttackBox.shape
            },
            Damage: configData.Damage,
            Player: ids,
            imageSrc: configData.imageSrc,
            framesMax: configData.framesMax,
            scale: configData.scale,
            offset: { ...configData.offset },
            sprites: clonedSprites,
            isAI: configData.isAI,
            attackFrame: configData.attackFrame,
            type: configData.type,
            HealthPoints: configData.HealthPoints,
            MaxHealthPoints: configData.MaxHealthPoints || configData.HealthPoints,
            value: configData.value
        });
    }
}

// ============================================================================
// MASK CLASS
// ============================================================================
class Mask extends Sprite {
    constructor({ position, velocity = { x: 0, y: 0 }, size, price, color = "black", imageSrc, sprites, scale = 1, framesMax = 1, offset = { x: 0, y: 0 }, CuringHealth, DamageMult = 1, KnockBack = 1 }) {
        super({ position, size, color, imageSrc, scale, framesMax, offset, sprites });
        this.velocity = velocity;
        this.CuringHealth = CuringHealth;
        this.DamageMult = DamageMult;
        this.KnockBack = KnockBack;
        this.GotTaken = false;
        this.Placed = false;
        this.price = price;
        this.startY = position.y;
        this.timer = 0;
    }

    update(dt) {
        this.animateFrames(dt);
        this.timer += 0.05;
        this.position.y = this.startY + Math.sin(this.timer) * 10;
        this.Draw();

        if (!this.GotTaken && Player1) {
            const finalPrice = this.price;
            const distX = Math.abs((this.position.x + this.size.x / 2) - (Player1.position.x + Player1.size.x / 2));
            const distY = Math.abs((this.position.y + this.size.y / 2) - (Player1.position.y + Player1.size.y / 2));

            if (distX < 95 && distY < 135) {
                c.save();
                c.font = "bold 11px 'Press Start 2P', sans-serif";
                c.textAlign = "center";
                const boxX = this.position.x + this.size.x / 2;
                const boxY = this.position.y - 40;

                c.fillStyle = "rgba(0, 0, 0, 0.85)";
                c.fillRect(boxX - 95, boxY - 35, 190, 45);
                c.strokeStyle = "gold";
                c.lineWidth = 2;
                c.strokeRect(boxX - 95, boxY - 35, 190, 45);

                c.fillStyle = "gold";
                c.fillText(`${this.name || 'Mask'}: ${finalPrice} 🪙`, boxX, boxY - 18);
                c.fillStyle = "#00ffcc";
                c.fillText("[E] Buy", boxX, boxY);
                c.restore();

                if (Player1.keys.interact && Player1.keys.interact.pressed) {
                    Player1.keys.interact.pressed = false;
                    getPerked(this, 1);
                }
            }
        }
    }

    MaskTaken(player) {
        if (this.DamageMult && this.DamageMult !== 1) player.Damage = Math.floor(player.Damage * this.DamageMult);
        if (this.KnockBack) player.KnockBack *= this.KnockBack;
        if (this.MaxHealthUp) player.MaxHealthPoints += this.MaxHealthUp;
        if (this.CuringHealth) player.HealthPoints = Math.min(player.MaxHealthPoints, player.HealthPoints + this.CuringHealth);

        if (this.DemonStrength) player.DemonStrength = true;
        if (this.LifeSteal) player.lifeSteal = (player.lifeSteal || 0) + this.LifeSteal;
        if (this.SpeedMult) player.speedMult = (player.speedMult || 1) + this.SpeedMult;
        if (this.JumpBoost) player.jumpPower = (player.jumpPower || 0) + this.JumpBoost;
        if (this.HermesBoots) player.HermesBoots = true;
        if (this.TitanHeart) player.TitanHeart = true;
        if (this.isFightTime) { g.isPerked = true; RemovePerks(); }

        if (this.CanShoot) {
            player.CanShoot = true;
            player.magicLevel = (player.magicLevel || 0) + 1;
        }
        if (this.Ricochet) {
            player.Ricochet = true;
            player.ricochetLevel = (player.ricochetLevel || 0) + 1;
        }
        if (this.ToxicTrail) {
            player.ToxicTrail = true;
            player.toxicLevel = (player.toxicLevel || 0) + 1;
        }
        if (this.Executioner) {
            player.Executioner = true;
            player.execLevel = (player.execLevel || 0) + 1;
        }
        if (this.StaticShield) {
            player.StaticShield = true;
            player.hasShield = true;
            player.shieldTimer = 0;
            player.shieldLevel = (player.shieldLevel || 0) + 1;
        }
        if (this.SoulCollector) {
            player.SoulCollector = true;
            player.soulLevel = (player.soulLevel || 0) + 1;
        }
        if (this.SplitShot) {
            player.SplitShot = true;
            player.CanShoot = true;
            player.splitLevel = (player.splitLevel || 0) + 1;
        }

        if (this.vfxKey) SpawnPerkVFX(this.vfxKey, { x: player.position.x, y: player.position.y }, false, player);
        PlayGameSound(this.audioKey || 'perkPickup');
        CreateVFX(player, "MASK", this.name);
        ReduceAddHP(player);

        if (!this.isFightTime) {
            if (!player.perkList) player.perkList = [];
            const existing = player.perkList.find(p => p.name === this.name);
            if (existing) {
                existing.count++;
            } else {
                player.perkList.push({
                    name: this.name || "Perk",
                    desc: (typeof PERK_DESCRIPTIONS !== 'undefined' && PERK_DESCRIPTIONS[this.name]) || "Potenziamento speciale attivo.",
                    image: this.image,
                    count: 1
                });
            }
        }
        this.GotTaken = true;
    }

    static CreateMask(xPos = 0, yPos = 0, forcedId = null) {
        let selectedId = forcedId || (Math.floor(Math.random() * 12) + 1);
        const config = MASK_STATS[selectedId] || MASK_STATS[1];

        let newMask = new Mask({
            position: { x: xPos, y: yPos },
            size: { x: config.size.x, y: config.size.y },
            CuringHealth: config.CuringHealth,
            DamageMult: config.DamageMult,
            KnockBack: config.KnockBack,
            imageSrc: config.imageSrc,
            framesMax: config.framesMax,
            scale: config.scale,
            offset: { x: config.offset.x, y: config.offset.y },
            price: config.price
        });

        newMask.name = config.name;
        newMask.MaxHealthUp = config.MaxHealthUp;
        newMask.DemonStrength = config.DemonStrength;
        newMask.CanShoot = config.CanShoot;
        newMask.LifeSteal = config.LifeSteal;
        newMask.SpeedMult = config.SpeedMult;
        newMask.JumpBoost = config.JumpBoost;
        newMask.HermesBoots = config.HermesBoots;
        newMask.TitanHeart = config.TitanHeart;
        newMask.Ricochet = config.Ricochet;
        newMask.ToxicTrail = config.ToxicTrail;
        newMask.Executioner = config.Executioner;
        newMask.StaticShield = config.StaticShield;
        newMask.SoulCollector = config.SoulCollector;
        newMask.SplitShot = config.SplitShot;
        newMask.isFightTime = config.isFightTime;
        newMask.vfxKey = config.vfxKey;
        newMask.audioKey = config.audioKey;
        newMask.Placed = true;

        return newMask;
    }
}

// ============================================================================
// POOLED FLOATING TEXT CLASS
// ============================================================================
class FloatingText {
    constructor(config = {}) {
        this.reset(config);
    }

    reset({ position = { x: 0, y: 0 }, velocity = { x: 0, y: -0.5 }, text = "", opacity = 1, color = "white", fadeSpeed = 0.02 }) {
        this.position = position;
        this.velocity = velocity;
        this.text = text;
        this.color = color;
        this.opacity = opacity;
        this.dead = false;
        this.fadeSpeed = fadeSpeed;
    }

    draw() {
        if (!IsInViewport(this, 100)) return;
        c.save();
        c.globalAlpha = this.opacity;
        c.fillStyle = this.color;

        if (this.text !== "") {
            c.font = "bold 22px 'Press Start 2P', sans-serif";
            c.lineWidth = 3;
            c.strokeStyle = 'black';
            c.strokeText(this.text, this.position.x, this.position.y);
            c.fillText(this.text, this.position.x, this.position.y);
        } else {
            c.fillRect(this.position.x, this.position.y, 5, 5);
        }
        c.restore();
    }

    update() {
        this.draw();
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
        this.opacity -= this.fadeSpeed;
        if (this.opacity <= 0) {
            this.opacity = 0;
            this.dead = true;
        }
    }
}

class FloatingPointers extends FloatingText {
    constructor({ position, text, color, offset = { x: 0, y: 0 }, target, isMob }) {
        super({ position, text, color });
        this.offset = offset;
        this.target = target;
        this.isMob = isMob;
    }

    static createPointers(player) {
        const isMob = player.Player !== 1;
        return new FloatingPointers({
            text: isMob ? "" : g.Fighter1Name,
            color: isMob ? "red" : "#FF3126",
            target: player,
            isMob
        });
    }

    draw() {
        if (!IsInViewport(this.target)) return;
        if (!this.isMob) {
            super.draw();
        } else {
            const barWidth = this.target.type === "SkullBoss" ? 90 : 54;
            const barHeight = this.target.type === "SkullBoss" ? 8 : 6;
            const maxHp = this.target.MaxHealthPoints || 100;
            const hpPercent = Math.max(0, Math.min(1, this.target.HealthPoints / maxHp));

            c.save();
            c.fillStyle = '#440000';
            c.fillRect(this.position.x, this.position.y, barWidth, barHeight);
            c.fillStyle = this.target.bossArmorActive ? '#00e5ff' : (hpPercent < 0.34 ? '#ff4800' : '#00ff00');
            c.fillRect(this.position.x, this.position.y, barWidth * hpPercent, barHeight);
            c.strokeStyle = 'black';
            c.strokeRect(this.position.x, this.position.y, barWidth, barHeight);
            c.restore();
        }
    }

    update() {
        const player = this.target;
        if (!player || player.Dead) return;
        this.position.x = player.position.x + (player.size.x / 2) - (player.type === "SkullBoss" ? 45 : 27);
        this.position.y = player.position.y - 18;
        this.draw();
    }
}

class Platform extends Sprite {
    constructor({ position, size = { x: 300, y: 15 }, color, imageSrc, sprites, scale = 1, framesMax = 1, offset = { x: 0, y: 0 } }) {
        super({ position, size, color, imageSrc, scale, framesMax, offset, sprites });
    }
}

// ============================================================================
// BULLET CLASS (Fixed Double Movement, Platform Bounce & Red SkullBeam Core!)
// ============================================================================
class Bullet extends Sprite {
    constructor({ position, velocity = { x: 0, y: 0 }, size, isMute = false, color = "black", imageSrc, sprites, scale = 1, framesMax = 1, offset = { x: 0, y: 0 }, Damage, KnockBack, caster, other, liveFrames = 0, isUnblockable = false, isToxicPool = false, isSkullBeam = false, isPredictiveMissile = false, targetStrikeX = 0, targetStrikeY = 0 }) {
        super({ position, size, color, imageSrc, scale, framesMax, offset, sprites });
        this.Damage = Damage;
        this.KnockBack = KnockBack;
        this.hasHit = false;
        this.velocity = velocity;
        this.caster = caster;
        this.other = other;
        this.liveFrames = liveFrames;
        this.isUnblockable = isUnblockable;
        this.isMute = isMute;
        this.isToxicPool = isToxicPool;
        this.isSkullBeam = isSkullBeam;
        this.isPredictiveMissile = isPredictiveMissile;
        this.targetStrikeX = targetStrikeX;
        this.targetStrikeY = targetStrikeY;
    }

    update(dt) {
        this.liveFrames++;
        this.animateFrames(dt);

        if (this.isPredictiveMissile && Player1 && !Player1.Dead && this.liveFrames < 35) {
            const desiredX = Player1.position.x + Player1.velocity.x * 20;
            this.targetStrikeX += (desiredX - this.targetStrikeX) * 0.08;
            const dx = this.targetStrikeX - this.position.x;
            const dy = this.targetStrikeY - this.position.y;
            const mag = Math.max(1, Math.hypot(dx, dy));
            this.velocity.x = (dx / mag) * 20;
            this.velocity.y = (dy / mag) * 20;
        }

        // Single clean physics step per frame (removed duplicate movement!)
        const prevBottom = this.position.y + this.size.y;
        this.position.x += this.velocity.x * dt;
        if (!this.isToxicPool && !this.isSkullBeam && !this.isPredictiveMissile) {
            this.velocity.y += (g.Gravity_Acceleration * 0.35) * dt;
        }
        this.position.y += this.velocity.y * dt;

        // Rimbalzo garantito sulle piattaforme e sul pavimento
        if (!this.isToxicPool && !this.isSkullBeam && !this.isPredictiveMissile) {
            for (let i = 0; i < g.Platforms.length; i++) {
                const plat = g.Platforms[i];
                if (CheckCollisions({ rectangle1: this, rectangle2: plat })) {
                    if (this.velocity.y >= 0 && prevBottom <= plat.position.y + 32) {
                        this.position.y = plat.position.y - this.size.y;
                        this.velocity.y = -Math.max(Math.abs(this.velocity.y) * 0.85, 9);
                    } else {
                        this.velocity.x = -this.velocity.x * 0.85;
                    }
                }
            }
        }

        if (this.isPredictiveMissile && this.position.y + this.size.y >= g.MAX_HEIGHT - 600) {
            PlayGameSound('fireExplosion');
            g.cameraShake = 12;
            g.Bullets.push(new Shockwave({ position: { x: this.position.x + this.size.x / 2, y: g.MAX_HEIGHT - 600 } }));

            if (Player1 && !Player1.Dead && Math.abs(Player1.position.x - this.position.x) < 170 && Math.abs(Player1.position.y - this.position.y) < 150) {
                Player1.HealthPoints = Math.max(0, Player1.HealthPoints - this.Damage);
                ReduceAddHP(Player1);
                Player1.hurt();
                Player1.checkAndTriggerDeath(1);
                CreateVFX(Player1, "HIT");
            }
            this.hasHit = true;
            this.Dead = true;
            return;
        }

        if (this.liveFrames > 260) {
            if (!this.isMute) PlayGameSound('fireExplosion');
            this.hasHit = true;
            this.Dead = true;
            return;
        }

        if (!this.hasHit) {
            const targets = this.caster.Player === 1
                ? g.Fighters.filter(f => f.Player !== 1 && !f.Dead)
                : g.Fighters.filter(f => f.Player === 1 && !f.Dead);

            if (!this.hitVictims) this.hitVictims = [];

            for (let i = 0; i < targets.length; i++) {
                let victim = targets[i];
                if (this.hitVictims.includes(victim)) continue;

                if (CheckCollisions({ rectangle1: this, rectangle2: victim })) {
                    this.hitVictims.push(victim);

                    if (victim.type === "SkullBoss" && victim.bossArmorActive) {
                        CreateVFX(victim, "DEF", "RANGED IMMUNE! USE BLUE ORB!");
                        PlayGameSound('parry');
                        this.hasHit = true;
                        this.Dead = true;
                        break;
                    }

                    if (!victim.Defending || this.isUnblockable) {
                        victim.HealthPoints = Math.max(0, victim.HealthPoints - Math.max(1, Math.floor(this.Damage)));
                        ReduceAddHP(victim);
                        if (victim.HealthPoints > 0) victim.hurt();
                        else victim.checkAndTriggerDeath(1);
                        CreateVFX(victim, "HIT");
                        if (!this.isToxicPool) {
                            victim.velocity.x = (this.velocity.x >= 0 ? 1 : -1) * this.KnockBack;
                        }
                    } else {
                        CreateVFX(victim, "DEF");
                        if (!victim.isAI && victim.staminaBar < 3) {
                            victim.staminaBar++;
                            ReduceAddStamina(victim);
                        }
                    }

                    const maxBounces = (this.caster && this.caster.ricochetLevel) ? this.caster.ricochetLevel : 0;
                    this.bouncesDone = this.bouncesDone || 0;
                    const bounceRange = 260 + maxBounces * 90;

                    if (!this.isToxicPool && maxBounces > 0 && this.bouncesDone < maxBounces) {
                        this.bouncesDone++;
                        let nearest = targets.find(t =>
                            !this.hitVictims.includes(t) &&
                            !t.Dead &&
                            !(t.type === "SkullBoss" && t.bossArmorActive) &&
                            Math.hypot(t.position.x - this.position.x, t.position.y - this.position.y) <= bounceRange
                        );

                        if (nearest) {
                            PlayGameSound('ricochetBounce');
                            this.Damage = Math.max(2, Math.floor(this.Damage * 0.60));
                            const dx = (nearest.position.x + nearest.size.x / 2) - this.position.x;
                            const dy = (nearest.position.y + nearest.size.y / 2) - this.position.y;
                            const mag = Math.max(1, Math.hypot(dx, dy));
                            this.velocity.x = (dx / mag) * 28;
                            this.velocity.y = (dy / mag) * 28;
                            this.liveFrames = 0;
                            break;
                        }
                    }

                    this.hasHit = true;
                    this.Dead = true;
                    break;
                }
            }
        }

        this.Draw();
    }

    Draw() {
        if (this.isPredictiveMissile) {
            c.save();
            c.strokeStyle = "#ff0055";
            c.lineWidth = 3;
            c.beginPath();
            c.arc(this.targetStrikeX, this.targetStrikeY - 8, 45, 0, Math.PI * 2);
            c.stroke();
            c.font = "bold 11px 'Press Start 2P', monospace";
            c.fillStyle = "#ff0055";
            c.textAlign = "center";
            c.fillText("TARGET LOCK", this.targetStrikeX, this.targetStrikeY - 60);
            c.restore();
        }

        if (!IsInViewport(this)) return;

        if (this.isSkullBeam) {
            c.save();
            // Sfera esterna grande del colore scelto (es. rosso "#ff0000")
            c.fillStyle = this.color || "#ff0000";
            c.beginPath();
            c.arc(this.position.x + 24, this.position.y + 24, 34, 0, Math.PI * 2);
            c.fill();
            // Nucleo interno bianco più piccolo (raggio 14 così non copre il rosso!)
            c.fillStyle = "#ffffff";
            c.beginPath();
            c.arc(this.position.x + 24, this.position.y + 24, 14, 0, Math.PI * 2);
            c.fill();
            c.restore();
            return;
        }

        if (!this.hasValidImage()) {
            c.save();
            c.fillStyle = this.color || "#39ff14";
            c.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
            c.restore();
            return;
        }

        const frameWidth = this.image.width / this.framesMax;
        const angle = this.isToxicPool ? 0 : Math.atan2(this.velocity.y, this.velocity.x);

        c.save();
        c.translate(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2);
        c.rotate(angle);
        c.drawImage(
            this.image,
            this.framesCurrent * frameWidth, 0,
            frameWidth, this.image.height,
            -this.size.x / 2 - this.offset.x, -this.size.y / 2 - this.offset.y,
            frameWidth * this.scale, this.image.height * this.scale
        );
        c.restore();
    }

    static CreateBullet(val, caster) {
        const config = val === 1 ? BULLET_STATS[1] : BULLET_STATS[2];
        const other = Player1;
        const dir = caster.Direction.right ? 1 : -1;
        const startX = caster.position.x + (dir === 1 ? caster.size.x : -20);
        const startY = caster.position.y + caster.size.y / 2;
        const dx = (other.position.x + other.size.x / 2) - startX;
        const isMeteor = val === 2;
        const flightTime = isMeteor ? 220 : 90;

        return new Bullet({
            position: { x: startX, y: startY },
            velocity: { x: dx / flightTime, y: isMeteor ? -12 : -6 },
            size: config.size,
            KnockBack: config.KnockBack,
            imageSrc: config.imageSrc,
            framesMax: config.framesMax,
            scale: config.scale,
            offset: config.offset,
            Damage: config.Damage,
            caster,
            other,
            color: config.color,
            isUnblockable: isMeteor
        });
    }
}

class Shockwave extends Sprite {
    constructor({ position }) {
        super({ position });
        this.size = { x: 100, y: 100 };
        this.isUnblockable = true;
        this.radius = 8;
        this.opacity = 1;
        this.Dead = false;
        this.hasHit = false;
    }

    update(dt) {
        this.radius += 12 * dt;
        this.opacity -= 0.045 * dt;
        this.draw();
        if (this.opacity <= 0) this.Dead = true;
    }

    draw() {
        if (!IsInViewport(this, 300)) return;
        c.save();
        c.globalAlpha = Math.max(0, this.opacity);
        c.strokeStyle = "#38bdf8";
        c.lineWidth = 6;
        c.beginPath();
        c.ellipse(this.position.x, this.position.y, this.radius * 1.5, this.radius * 0.4, 0, 0, Math.PI * 2);
        c.stroke();
        c.restore();
    }
}