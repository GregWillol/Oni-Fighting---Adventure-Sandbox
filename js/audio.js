const SoundManager = {
    sounds: {},

    // 1. Carichiamo i suoni in memoria all'avvio
    init: function() {
            this.sounds.blade = [
            new Audio('./audio/Blade1.mp3'),
            new Audio('./audio/Blade2.mp3'),
            new Audio('./audio/Blade3.mp3'),
            new Audio('./audio/Blade4.mp3')
            ];
            
        
        // Abbassiamo il volume di default per non spaccare le orecchie
       for (let key in this.sounds) {
            const sound = this.sounds[key];
            if (Array.isArray(sound)) {
                sound.forEach(s => s.volume = 0.5);
            } else {
                sound.volume = 0.5;
            }
        }
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
        for (let key in this.sounds) {
            const sound = this.sounds[key];
            if (Array.isArray(sound)) {
                sound.forEach(s => s.volume = 0.2);
            } else {
                sound.volume = 0.2;
            }
        }
        this.sounds.parry = new Audio('./audio/FightingRelated/Parry.wav');
        this.sounds.parry.volume = 0.4;

         this.sounds.BigFireballs = [
            new Audio('./audio/FightingRelated/BigAhhLauncherFireball1.wav'),
            new Audio('./audio/FightingRelated/BigAhhLauncherFireball2.wav'),
            ];
            for (let key in this.sounds) {
            const sound = this.sounds[key];
            if (Array.isArray(sound)) {
                sound.forEach(s => s.volume = 0.3);
            } else {
                sound.volume = 0.3;
            }
        }

        this.sounds.SmallFireballs = [
            new Audio('./audio/FightingRelated/BigAhhLauncherFireball1.wav'),
            new Audio('./audio/FightingRelated/BigAhhLauncherFireball2.wav'),
            ];
            for (let key in this.sounds) {
            const sound = this.sounds[key];
            if (Array.isArray(sound)) {
                sound.forEach(s => s.volume = 0.1);
            } else {
                sound.volume = 0.1;
            }
        }
        this.sounds.fireExplosion = new Audio('./audio/FightingRelated/FireballExplosion.wav');
        this.sounds.fireExplosion.volume = 0.1;
        
    },

    // 2. Funzione per riprodurre (con cloni per sovrapposizione rapida)
    play: function(name) {
        const soundTarget = this.sounds[name];
        if (!soundTarget) return;

        // Se è un array sceglie un elemento casuale, altrimenti usa l'audio singolo
        const sound = Array.isArray(soundTarget)
            ? soundTarget[Math.floor(Math.random() * soundTarget.length)]
            : soundTarget;

        const clone = sound.cloneNode();
        clone.volume = sound.volume;
        clone.play().catch(() => {});
    },
    playMusic: function(name) {
        if (!this.sounds[name]) return;
        
        // Lo facciamo partire, e se il browser lo blocca lo ignoriamo in silenzio
        this.sounds[name].play().catch(() => {
            console.log("In attesa dell'interazione dell'utente per la musica...");
        });
    }
};