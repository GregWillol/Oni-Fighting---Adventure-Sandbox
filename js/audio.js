const SoundManager = {
    sounds: {},
    ctx: null,
    isMuted: false,

    // 1. Carichiamo i tuoi file audio con i volumi corretti (senza sovrascriverli!)
    init: function() {
        const setVol = (arr, vol) => arr.forEach(s => s.volume = vol);

        this.sounds.blade = [
            new Audio('./audio/Blade1.mp3'),
            new Audio('./audio/Blade2.mp3'),
            new Audio('./audio/Blade3.mp3'),
            new Audio('./audio/Blade4.mp3')
        ];
        setVol(this.sounds.blade, 0.45);

        this.sounds.intro = new Audio('./audio/The_Unlit_Hearth.mp3');
        this.sounds.intro.volume = 0.15;
        this.sounds.intro.loop = true;

        this.sounds.steps = [
            new Audio('./audio/Steps/Step1.mp3'),
            new Audio('./audio/Steps/Step2.mp3'),
            new Audio('./audio/Steps/Step3.wav'),
            new Audio('./audio/Steps/Step4.wav'),
            new Audio('./audio/Steps/Step5.wav')
        ];
        setVol(this.sounds.steps, 0.2);

        this.sounds.parry = new Audio('./audio/FightingRelated/Parry.wav');
        this.sounds.parry.volume = 0.4;

        this.sounds.BigFireballs = [
            new Audio('./audio/FightingRelated/BigAhhLauncherFireball1.wav'),
            new Audio('./audio/FightingRelated/BigAhhLauncherFireball2.wav')
        ];
        setVol(this.sounds.BigFireballs, 0.3);

        this.sounds.SmallFireballs = [
            new Audio('./audio/FightingRelated/BigAhhLauncherFireball1.wav'),
            new Audio('./audio/FightingRelated/BigAhhLauncherFireball2.wav')
        ];
        setVol(this.sounds.SmallFireballs, 0.12);

        this.sounds.fireExplosion = new Audio('./audio/FightingRelated/FireballExplosion.wav');
        this.sounds.fireExplosion.volume = 0.15;
    },

    // Richiesto da CrazyGames quando parte una pubblicità
    muteAll: function(muted) {
        this.isMuted = muted;
        if (this.sounds.intro) this.sounds.intro.muted = muted;
    },

    // 2. Riproduce i tuoi file MP3/WAV o genera l'impatto "swordHit" al volo
    play: function(name) {
        if (this.isMuted) return;

        // SUONO SPECIFICO QUANDO LA SPADA COLPISCE UN NEMICO (Impatto pesante!)
        if (name === 'swordHit') {
            this.playHitImpact();
            return;
        }

        const soundTarget = this.sounds[name];
        if (!soundTarget) {
            this.playFallbackSynth(name); // Suono automatico per Perk/Globo Blu se manca l'MP3
            return;
        }

        const sound = Array.isArray(soundTarget)
            ? soundTarget[Math.floor(Math.random() * soundTarget.length)]
            : soundTarget;

        const clone = sound.cloneNode();
        clone.volume = sound.volume;
        // Leggera variazione di pitch casuale (0.92x - 1.08x) per non farlo sembrare robotico
        clone.preservesPitch = false;
        clone.playbackRate = 0.92 + Math.random() * 0.16;
        clone.play().catch(() => {});
    },

    // Combina un tuo suono Blade rallentato/cupo + colpo secco nei bassi per l'Hit!
    playHitImpact: function() {
        if (this.sounds.blade && this.sounds.blade.length > 0) {
            const base = this.sounds.blade[Math.floor(Math.random() * this.sounds.blade.length)];
            const hitClone = base.cloneNode();
            hitClone.volume = 0.65;
            hitClone.preservesPitch = false;
            hitClone.playbackRate = 0.58; // Pitch basso = taglio pesante nella carne/armatura!
            hitClone.play().catch(() => {});
        }
        this.playFallbackSynth('hitThud');
    },

    // Mini-synth leggerissimo per il colpo d'impatto e i Perk senza file audio
    playFallbackSynth: function(key) {
        try {
            if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.ctx.state === 'suspended') this.ctx.resume();
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            if (key === 'hitThud' || key === 'bossStompHit') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.exponentialRampToValueAtTime(32, t + 0.14);
                gain.gain.setValueAtTime(0.45, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
                osc.start(t); osc.stop(t + 0.14);
            } else if (key === 'blueOrbBounce') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(280, t);
                osc.frequency.exponentialRampToValueAtTime(780, t + 0.22);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
                osc.start(t); osc.stop(t + 0.22);
            } else {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(520, t);
                osc.frequency.exponentialRampToValueAtTime(880, t + 0.1);
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.start(t); osc.stop(t + 0.1);
            }
        } catch (e) {}
    },

    playMusic: function(name) {
        if (!this.sounds[name] || this.isMuted) return;
        this.sounds[name].play().catch(() => {});
    }
};