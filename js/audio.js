const SoundManager = {
    sounds: {},

    // 1. Carichiamo i suoni in memoria all'avvio
    init: function() {
        this.sounds.hit = new Audio('./audio/hit.mp3');
        this.sounds.parry = new Audio('./audio/parry.mp3');
        this.sounds.dash = new Audio('./audio/dash.mp3');
        
        // Abbassiamo il volume di default per non spaccare le orecchie
        for (let key in this.sounds) {
            this.sounds[key].volume = 0.5; 
        }
    },

    // 2. Funzione per riprodurre (con cloni per sovrapposizione rapida)
    play: function(name) {
        if (!this.sounds[name]) return;
        
        // Cloniamo il nodo audio al volo. 
        // In questo modo se fai 3 dash veloci, senti 3 suoni che si sovrappongono bene
        const clone = this.sounds[name].cloneNode();
        clone.volume = this.sounds[name].volume;
        
        // Il catch evita che il browser dia errore in console se l'utente non ha ancora cliccato nulla
        clone.play().catch(() => {}); 
    }
};