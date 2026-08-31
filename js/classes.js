class Sprite{
    constructor({position = {x:0 , y:0},size,color,imageSrc,scale = 1,framesMax=1, offset = {x : 0 , y : 0},sprites}){
        this.position = position; 
        this.size = size; 
        this.color = color ; 

        //Inserting images
        this.image = new Image()
        if (imageSrc) {
        this.image.src = imageSrc
        }
        this.scale = scale
        this.framesMax = framesMax
        this.framesCurrent = 0
        this.framesElapsed = 0
        this.framesHold = 6
        this.offset = offset
        this.sprites=sprites 
        for (const sprite in this.sprites) {
            sprites[sprite].image = new Image()
            sprites[sprite].image.src = sprites[sprite].imageSrc
        }
    }
    Draw(){
        // - - - DEBUG - - -
        //c.fillStyle = this.color;
        //c.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
        
        
        if (!this.image || !this.image.src) {
            c.fillStyle = this.color;
            c.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
            return; 
        }
        const frameWidth = this.image.width / this.framesMax;
        // Saving before for safety
        c.save();

        //Mirror Logic
        if (this.Direction && this.Direction.left) {
            c.translate(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2);
            c.scale(-1, 1);
            c.translate(-(this.position.x + this.size.x / 2), -(this.position.y + this.size.y / 2));
        }
        c.drawImage(
            this.image,
            // CROP
            this.framesCurrent * frameWidth,
            0,
            frameWidth,
            this.image.height,
            this.position.x - this.offset.x, 
            this.position.y - this.offset.y, 
            frameWidth * this.scale, 
            this.image.height * this.scale
        );
        c.restore();
    }
    animateFrames(dt) {
        this.framesElapsed += dt ;
        if (this.framesElapsed >= this.framesHold ) {
            if (this.framesCurrent < this.framesMax - 1) {
                this.framesCurrent++
            } else {
                this.framesCurrent = 0
            }
            this.framesElapsed -= this.framesHold;
        }
    }
    update (dt){
        this.Draw();
        this.animateFrames(dt);
    }
    static CreateAura(id){
        const config = AURA_STATS[id];
        return new Sprite ({
            color : config.color, 
            size : config.size,
            imageSrc : config.imageSrc, 
            framesMax : config.framesMax,
            scale : config.scale,
            offset : config.offset
        })
    }
} 


class Fighter extends Sprite{
    constructor ({position,velocity = {x:0 , y:0},size = {x: 0, y:0},color,value = 0 ,HealthPoints,MaxHealthPoints = 100 ,keys = {up : {pressed : false},left : {pressed : false},attack : {pressed : false},right : {pressed : false},defend : {pressed: false},slam : {pressed : false}, inter : {pressed : false}},ControlKeys,AttackBox = {position : {x: 0, y:0}, size : {x:StandardAttBoxWid, y:g.HitHeight},shape : ""},Direction = {right : false, left : false},Player,imageSrc,scale = 1,framesMax=1, offset = {x : 0 , y : 0},sprites,Damage = 10,isAI,attackFrame,type}){
        super({
            position,
            size,
            color,
            imageSrc,
            scale,
            framesMax,
            offset,
            sprites
        })

        //Fighter variables
        this.velocity= velocity; 
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
        this.jumpBuffer = 0 ;
        this.attackCooldown = 0; 
        this.jumpBuffer = 0 ;
        this.KnockBack = 1 ;
        this.attackFrame = attackFrame;
        this.type = type ;
        this.BulletCooldown = 0;
        this.aiTimer = 0;
        this.staminaBar = 0;
        this.staminaTimer = 300;
        this.imploded = false;
        this.inventory = [];
        this.hasShot = false;
        this.isPlunging = false; 
        this.stepTimer = 0;
        this.coins = 0;
        this.hasPaid = false;
        this.runCoins = 0;       // Per Soul Collector
        this.shieldTimer = 0;    // Per Static Shield
        this.hasShield = false;  // Stato dello scudo
        this.toxicTimer = 0;     // Per Toxic Trail

        this.value = value; 
    
        // for AI checking if it's stuck
        this.checkStuckTimer = 0;
        this.previousPositionX = this.position.x;
        this.previousPositionY = this.position.y;
    }
    update(dt){ 
        this.previousPositionY = this.position.y;
        
        if (this.isAI) {
            this.aiTimer++;
            if (this.aiTimer % 2 === 0){
                this.runAI();
            }

        }

        
        
        //first thing before it can be changed
        if (this.HitStun > 0){
            this.HitStun--;
        }
        const isKnockedBack = Math.abs(this.velocity.x) > 7;
        this.Draw(); 
        this.animateFrames(dt);
        //Setting X-Component of Velocity to 0 each frame for boundaries limits 
        this.velocity.x *= 0.8 ;  
        //- - - DIRECTION SETTING - - - 
        if (!isKnockedBack && this.HitStun === 0 && g.FlagFight ){
            
            //Setting direction of the Sprite using the LastKeyPressed on X-Axis (so left or right)
            if (this.keys.right.pressed && this.LastKeyPressed === this.ControlKeys.right && !this.Defending && !this.Dead && !this.isAttacking && !this.imploded) {
                this.Direction.right = true; 
                this.Direction.left = false; 
                this.velocity.x = 10*(this.speedMult || 1);
                CreateVFX(this,"RUN")
                
            } else if (this.keys.left.pressed && this.LastKeyPressed === this.ControlKeys.left && !this.Defending && !this.Dead && !this.isAttacking) {
                this.Direction.left = true;
                this.Direction.right = false; 
                this.velocity.x = -10*(this.speedMult || 1);
                CreateVFX(this,"RUN")
            }
            //- - - VERIFYING JUMP CONDITION - - - 
            if (this.keys.up.pressed && this.OnGround && !this.Defending && !this.Dead && !this.isAttacking) {
                this.velocity.y = -30 + (this.jumpPower || 0);;
                this.OnGround = false;
            }
            // - - - SCHIANTO A TERRA (GROUND SLAM) - - -
            if (this.keys.slam.pressed && !this.OnGround && this.staminaBar >= 1 && !this.isPlunging) {
                this.keys.slam.pressed = false; // Consuma l'input
                this.staminaBar--;                // Togli una stamina
                if (!this.isAI) ReduceAddStamina(this); // Aggiorna UI
                
                this.isPlunging = true;
                this.velocity.x = 0;   // Ti fermi a mezz'aria
                this.velocity.y = 35;  // Cadi come un meteorite!
                this.switchSprite('attack'); // Mettiamo l'animazione di attacco mentre cade
            }
        }
        if (Math.abs(this.velocity.x) > 1 && this.OnGround && this.Player === 1) {
            if (this.stepTimer <= 0) {
                SoundManager.play('steps'); // Suona un passo casuale!
                this.stepTimer = 25; // Aspetta 20 frame prima del prossimo passo (regola questo numero se i passi sono troppo veloci/lenti)
            } else {
                this.stepTimer--;
            }
        } else {
            // Se si ferma o salta, resetta il timer così il primo passo è immediato appena riparte
            this.stepTimer = 0; 
        }
        // - - - TOXIC TRAIL (Nuovo Perk) - - -
        if (this.ToxicTrail && Math.abs(this.velocity.x) > 1 && this.OnGround) {
            this.toxicTimer++;
            if (this.toxicTimer > 15) { // Lascia una scia ogni quarto di secondo
                this.toxicTimer = 0;
                
                // Usiamo un Bullet invisibile/verde fisso a terra come "area velenosa"
                g.Bullets.push(new Bullet({
                    position: { x: this.position.x + this.size.x / 2, y: this.position.y + this.size.y - 15 },
                    velocity: { x: 0, y: 0 }, 
                    size: { x: 60, y: 20 },
                    color: "rgba(57, 255, 20, 0.6)", // Verde fosforescente
                    imageSrc: '', // Lascia vuoto per ora, usa il colore
                    framesMax: 1,
                    Damage: Math.floor(this.Damage * 0.1), // Danno basso ma continuo
                    KnockBack: 0, // Non sposta i nemici
                    caster: this,
                    liveFrames: 150, // Muore in fretta (circa 2.5 secondi)
                    isUnblockable: true,
                    isMute : true
                }));
            }
        }
        //Before needs to check the inputs 
        this.position.x +=this.velocity.x * dt; 
        //this condition needs to be here beacause velocity.x variable could not maintain the value given before with the EventListeners
        // - - - BOUNDARIES - - -
        //Bound X-Axis
        if (this.position.x+this.size.x > g.MAX_WIDTH){
            this.velocity.x = 0;
            this.position.x = g.MAX_WIDTH-this.size.x;
        }
        else if (this.position.x< 0){
            this.velocity.x = 0;
            this.position.x = 0;
        }
        // Y-Axis :Gravity,Velocity updating
        this.velocity.y+=g.Gravity_Acceleration*dt;
        const MAX_FALL_SPEED = 50; 
        if (this.velocity.y > MAX_FALL_SPEED) {
                this.velocity.y = MAX_FALL_SPEED;
            }
        this.position.y +=this.velocity.y*dt;
        //Collisions with platforms 
       g.Platforms.forEach(c => {
            // 1. Calcoliamo la posizione dei piedi PRIMA e ADESSO
            const prevBottom = this.previousPositionY + this.size.y;
            const currentBottom = this.position.y + this.size.y;
                            // 2. Controllo Orizzontale: Il personaggio è in corrispondenza della piattaforma?
            const isHorizontallyAligned = 
                this.position.x + this.size.x >= c.position.x && 
                this.position.x <= c.position.x + c.size.x;
                            // 3. LA MAGIA: I piedi prima erano SOPRA (o pari), e adesso sono SOTTO (o pari)?
            const crossedPlatform = prevBottom <= c.position.y && currentBottom >= c.position.y;
                            // 4. Se si sta muovendo verso il basso (cadendo) e attraversa la linea, LO BLOCCIAMO!
            if (isHorizontallyAligned && crossedPlatform && this.velocity.y >= 0) {
                
                // Lo costringiamo fisicamente a stare esattamente sopra la piattaforma
                this.position.y = c.position.y - this.size.y; 
                
                this.velocity.y = 0; // Azzera la velocità di caduta
                this.OnGround = true; // Diciamo al gioco che è a terra
                
                // Se c'è lo schianto a terra, serve resettarlo o non capisce che è atterrato
                
                             // Le tue funzioni originali per gli effetti e altre meccaniche
                PlatformCollisions({rectangle1: this, rectangle2: c}); 
                CreateVFX(this, "JUMP");
            }
        });
        if (!this.OnGround && g.FlagFight){
            this.jumpBuffer =20;
        }
        // - - - BOUNDARIES - - -
        //Bound Y-Axis
        if (this.position.y+this.size.y > g.MAX_HEIGHT){
            this.velocity.y = 0;
            this.position.y = g.MAX_HEIGHT-this.size.y;
            if (map === 2) this.HealthPoints=0;
            
            CreateVFX(this,"JUMP")
            this.OnGround = true;
        }
        // - - - IMPATTO DEL GROUND SLAM - - -
        if (this.OnGround && this.isPlunging) {
            this.isPlunging = false; // Spegne la picchiata
            
            // 1. Danno ad area (Trova i nemici vicini)
            const bersagli = g.Fighters.filter(f => f !== this && !f.Dead && f.Player !== this.Player);
            bersagli.forEach(victim => {
                const distanzaX = Math.abs(victim.position.x - this.position.x);
                const distanzaY = Math.abs(victim.position.y - this.position.y);
                
                // Se sono entro 200 pixel di distanza...
                if (distanzaX < 200 && distanzaY < 150) {
                    victim.HealthPoints -= (this.Damage * 1.5); // Danno bonus!
                    victim.velocity.y = -18; // Lanciati in aria
                    
                    // Spinta orizzontale a destra o sinistra a seconda di dove si trovano
                    const pushDir = victim.position.x > this.position.x ? 1 : -1;
                    victim.velocity.x = 10 * pushDir;
                    
                    ReduceAddHP(victim);
                    victim.hurt();
                    CreateVFX(victim, "HIT");
                }
            });

            // 2. SPAWN DELL'EFFETTO VISIVO BLU
            // Usiamo il tuo array g.Bullets per "barare" e creare un VFX senza scrivere array nuovi!
            g.Bullets.push(new Shockwave({ 
                position: { 
                    x: this.position.x + this.size.x / 2, 
                    y: this.position.y + this.size.y 
                } 
            }));
            
            // Un bel salto all'indietro o rimbalzo per chiudere l'animazione
            this.velocity.y = -10; 
            this.OnGround = false;
        }
        // - - - ATTACK BOX - - -
         //Obj going right so AttackBox direction need to be directed to the right
                  // Y position of AttackBox
            
            if (this.Player === 1){
                this.AttackBox.position.y = this.position.y-this.AttackBox.size.y/3; 
            }
            else {
                this.AttackBox.position.y = this.position.y-this.AttackBox.size.y/2; 
            }
            
            const AttackOffset= -20; 

            if (this.Direction.right ){ //condition for Dx-Direction and when nothing has been pressed yet 
                this.AttackBox.position.x = this.position.x+AttackOffset;              // X position of AttackBox   
            }
            else if (this.Direction.left ){ //condition for Sx-Direction and when nothing has been pressed yet 
                //Updating position info of AttackBox
                this.AttackBox.position.x = this.position.x+this.size.x-this.AttackBox.size.x-AttackOffset;     // X position of AttackBox
            } 
            
            
            
        // - - - ATTACK - - - 
        if (this.attackCooldown >0){ 
            this.isAttacking=false;
            if (this.attackCooldown%30 === 0) CreateVFX(this,"COOLDOWN",this.attackCooldown / 30)
            this.attackCooldown--;
        }

        else if (this.isAttacking && !this.Dead && this.attackCooldown === 0) {
            if (!this.attackSoundPlayed && this.Player === 1 ) {
                    SoundManager.play('blade');
                    this.attackSoundPlayed = true; // Chiude il lucchetto!
                }
            
            
            

    // Check if the animation has reached the active impact frame
    if (this.framesCurrent == this.attackFrame) {

        // --- MAGIC CASTER (PROIETTILI) ---
        if (this.CanShoot && !this.hasShot) {
            const dir = this.Direction.right ? 1 : -1;
            g.Bullets.push(new Bullet({
                position: { x: this.AttackBox.position.x, y: this.AttackBox.position.y },
                velocity: { x: 40 * dir, y: 4 },
                size: { x: 60, y: 60 },
                color: "#8f00ff",
                imageSrc: './img/VFX/Bullets/Fireball.png', // <-- ECCO LA TUA FIREBALL!
                framesMax: 5, // Se la fireball ha un'animazione a più frame, cambialo
                Damage: this.Damage,
                KnockBack: this.KnockBack,
                caster: this,
                scale: 4
            }));
            // --- SPLIT SHOT (Nuovo Perk) ---
            // Se hai lo split shot, partono due colpi aggiuntivi a ventaglio!
            if (this.SplitShot) {
                // Proiettile che va verso l'alto
                g.Bullets.push(new Bullet({
                    position: { x: this.AttackBox.position.x, y: this.AttackBox.position.y },
                    velocity: { x: 40 * dir, y: -4 }, // Va in alto in diagonale
                    size: { x: 60, y: 60 },
                    color: "#8f00ff",
                    imageSrc: './img/VFX/Bullets/Fireball.png',
                    framesMax: 5,
                    Damage: Math.floor(this.Damage * 0.7), // Fan un po' meno danno per bilanciare
                    KnockBack: this.KnockBack,
                    caster: this,
                    scale: 3 // Un pelo più piccoli
                }));
                // Proiettile che spiove giù drastico
                g.Bullets.push(new Bullet({
                    position: { x: this.AttackBox.position.x, y: this.AttackBox.position.y },
                    velocity: { x: 40 * dir, y: 12 }, // Va in basso deciso
                    size: { x: 60, y: 60 },
                    color: "#8f00ff",
                    imageSrc: './img/VFX/Bullets/Fireball.png',
                    framesMax: 5,
                    Damage: Math.floor(this.Damage * 0.7),
                    KnockBack: this.KnockBack,
                    caster: this,
                    scale: 3
                }));
            }
            
        }
        

        // Determine active targets based on the current game mode
            let targets = [];
                if (this.Player === 1) {
                    targets = g.Fighters.filter(f => f !== this && !f.Dead);
                } else {
                    targets = g.Fighters.filter(f => f.Player === 1 && !f.Dead);
                }
        for (let i = 0; i < targets.length; i++) {
            const victim = targets[i];

            // 1. Skip if victim is null, dead, self, or already hit during this swing
            if (!victim || victim.Dead || victim === this || this.hitEnemies.includes(victim)) continue;

            // 2. Early distance check on X-axis to avoid unnecessary collision calculations
            if (Math.abs(this.position.x - victim.position.x) > 300) continue;

            // 3. Perform actual hitbox collision check
            if (CheckAttackCollision({ attacker: this, victim: victim })) {

                // Register victim immediately to prevent multiple hits per swing

                this.hitEnemies.push(victim);
                // --- STATIC SHIELD PARRY (Nuovo Perk) ---
                if (victim.StaticShield && victim.hasShield) {
                    victim.hasShield = false; // Rompi lo scudo
                    CreateVFX(victim, "DEF");
                    SoundManager.play('parry');

                    // Esplosione! Usiamo la tua Shockwave blu
                    g.Bullets.push(new Shockwave({ 
                        position: { x: victim.position.x + victim.size.x / 2, y: victim.position.y + victim.size.y } 
                    }));

                    // Respinge te (l'attaccante) violentemente e ti stordisce
                    this.velocity.x = (this.position.x > victim.position.x ? 25 : -25);
                    this.velocity.y = -10;
                    this.HitStun = 30; // Mezzo secondo di blocco comandi
                    
                    continue; // INTERROMPE IL COLPO: Nessun danno per il bersaglio
                }

                if (!victim.Defending) {
                    // --- SUCCESSFUL HIT LOGIC ---
                    g.hitStopFrames = 6;
                    g.cameraShake = 6;
                    CreateVFX(victim, "HIT");
                    CreateVFX(victim, "DAM");
                    ApplyKnockback(victim, this);

                    let mult = 1;

                    // --- EXECUTIONER'S MARK (Nuovo Perk) ---
                    // Se l'attaccante ha il potere e il bersaglio ha il 30% o meno di vita massima
                    if (this.Executioner && victim.HealthPoints <= (victim.MaxHealthPoints * 0.30)) {
                        mult = 2.5; // Danno assurdo (colpo di grazia)
                        CreateVFX(this, "CRIT"); 
                        // Opzionale: SoundManager.play('execute_sound_se_lo_hai');
                    }

                    // Critical hit chance for Player 1
                    if (this.Player === 1 && Math.random() <= 0.2) {
                        mult = 2;
                        CreateVFX(this, "CRIT");
                    } 
                    // Life steal passive for Player 2
                    else if (this.Player === 2) {
                        this.HealthPoints += 5;
                        ReduceAddHP(this);
                        CreateVFX(this, "HP");
                    }

                    victim.HealthPoints -= Math.floor(this.Damage * mult);
                    ReduceAddHP(victim);
                    victim.hurt();
                    
                    if (this.lifeSteal) {
                        this.HealthPoints += Math.floor((this.Damage * mult) * this.lifeSteal);
                        // Limite massimo per sicurezza
                        if(this.HealthPoints > this.MaxHealthPoints) this.HealthPoints = this.MaxHealthPoints;
                        
                        ReduceAddHP(this); 
                        CreateVFX(this,"HP");
                    }

                } else {
                    // --- BLOCKED ATTACK LOGIC ---
                    CreateVFX(victim, "DEF");
                    if (!victim.isAI && victim.staminaBar < 3){
                        victim.staminaBar++;
                        ReduceAddStamina(victim);
                    }
                }
            }
        }
    }
    
    // End of attack animation: trigger cooldown and clear hit entities tracking
    if (this.isAttacking && this.framesCurrent >= this.sprites.attack.framesMax - 1) {
        this.isAttacking = false;
        this.attackCooldown = this.staminaBar >= 3 ? 10 : 90;
        this.hitEnemies.length = 0; // Fast array reset without memory re-allocation
        // --- RIFLESSIONE PROIETTILI ---
        // --- RIFLESSIONE PROIETTILI ---
// --- RIFLESSIONE PROIETTILI ---
g.Bullets.forEach(bullet => {
    // IGNORA: proiettili già colpiti, imparabili o sparati da te
    if (bullet.Dead || bullet.hasHit || bullet.caster === this || bullet.isUnblockable) return;

    // Se la tua AttackBox tocca QUESTO specifico proiettile nemico:
    if (CheckCollisions({ rectangle1: this.AttackBox, rectangle2: bullet }) && !this.isAI) {
        
        const isMoving = Math.abs(this.velocity.x) > 1 || Math.abs(this.velocity.y) > 1;
        if (isMoving && Math.random() < 0.4) {
            return; // Fallimento parata in movimento
        }
        SoundManager.play('parry');

        // 1. Spegniamo il proiettile nemico originale
        bullet.hasHit = true;
        bullet.Dead = true;
        CreateVFX(bullet, "DEF");

        const originalCaster = bullet.caster;
        const dir = this.Direction.right ? 1 : -1;
        

        // 2. Generiamo i 3 frammenti SOLO E UNICAMENTE dalle coordinate del proiettile parato
        for (let i = -1; i <= 1; i++) {
            const fragment = new Bullet({
                position: { x: bullet.position.x, y: bullet.position.y },
                velocity: { x: 18 * dir, y: i * 5 }, // Ventaglio: uno su, uno dritto, uno giù
                size: { x: bullet.size.x * 0.6, y: bullet.size.y * 0.6 },
                color: bullet.color,
                imageSrc : bullet.image.src, // CORRETTO, pesca l'URL dall'immagine vera,
                framesMax: bullet.framesMax,
                scale: bullet.scale * 0.6,
                offset: bullet.offset,
                Damage: bullet.Damage / 3,
                KnockBack: bullet.KnockBack,
                caster: this,
                other: originalCaster
            });

            // Aggiungiamo i frammenti all'array
            g.Bullets.push(fragment);
        }
    }
});
    }

    
        
}
        

        // - - - DEFENSE - - -
        if (this.keys.defend.pressed && this.LastKeyPressed === this.ControlKeys.defend && !this.isAttacking && g.FlagFight && this.defenseBuffer === 0 && !this.Dead){ //These 2 lines can be placed in eventlisteners
            this.keys.defend.pressed = false
            this.defenseBuffer = 50 ; 
            CreateVFX(this,"DASH")
            this.Defending = true;
            this.defend();
        }
        else if (this.defenseBuffer > 0){
            this.defenseBuffer--;
            if (this.defenseBuffer>40){
                this.Defending= true;
                this.velocity.x = this.Direction.right ? 60*dt : -60*dt;
            }
            else {
                this.Defending = false;
                if (this.keys.left.pressed){
                    this.LastKeyPressed=this.ControlKeys.left

                }
                else if (this.keys.right.pressed){
                    this.LastKeyPressed=this.ControlKeys.right
                }
            }
        }
        
        // - - - AURA - - -
       if (this.PoweredUp) {
            const aura = this.Player ===1 ? Aura1 :Aura2;
            aura.position.x= this.position.x;
            aura.position.y = this.position.y;
        }
        
        if (this.staminaBar >= 3){
            utilStaminaTimer(this);
            CreateVFX(this,"UP");
        }
        
        
        // - - - RECHARGE STATIC SHIELD (Nuovo Perk) - - -
        if (this.StaticShield && !this.hasShield) {
            this.shieldTimer++;
            if (this.shieldTimer >= 900) { // 900 frame = 15 secondi
                this.hasShield = true;
                this.shieldTimer = 0;
                CreateVFX(this, "UP"); // Effetto visivo quando torna lo scudo
            }
        }
        
        /*
        // --- INCOLLA QUI IL DEBUG HITBOXES ---
        c.save();

        // 1. Hurtbox (Rettangolo verde)
        c.strokeStyle = "rgba(0, 255, 0, 1)";
        c.lineWidth = 2;
        c.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y);

        // 2. AttackBox
        if (this.AttackBox) {
            if (this.debugHitboxTimer === undefined) this.debugHitboxTimer = 0;
            
            // Si attiva nel frame esatto dell'attacco
            if (this.isAttacking && this.framesCurrent === this.attackFrame) {
                this.debugHitboxTimer = 20; 
            }

            if (this.debugHitboxTimer > 0) {
                this.debugHitboxTimer--;
            }

            const showActive = this.debugHitboxTimer > 0;
            c.strokeStyle = showActive ? "rgba(255, 0, 0, 1)" : "rgba(255, 165, 0, 0.5)";
            
            const radiusX = this.AttackBox.size.x / 2;
            const radiusY = this.AttackBox.size.y / 2;
            const centerX = this.AttackBox.position.x + radiusX;
            const centerY = this.AttackBox.position.y + radiusY;
            
            const startAngle = this.Direction.left ? Math.PI / 2 : -Math.PI / 2;
            const endAngle = this.Direction.left ? (3 * Math.PI) / 2 : Math.PI / 2;

            c.beginPath();
            if (this.Player === 1) {
                c.ellipse(centerX, centerY, radiusX, radiusY, 0, startAngle, endAngle);
            } else {
                c.arc(centerX, centerY, radiusX, startAngle, endAngle);
            }
            c.closePath();
            c.stroke();

            // Rettangolo vero dell'AttackBox
            c.strokeStyle = "rgba(0, 0, 255, 0.3)";
            c.strokeRect(this.AttackBox.position.x, this.AttackBox.position.y, this.AttackBox.size.x, this.AttackBox.size.y);
        }
        c.restore();
        // --- FINE DEBUG ---
        */

    } 
    
    switchSprite(spriteName) {
        // - - - ATTACK SCENARIO - - -
        if (
            this.image === this.sprites.attack.image && 
            this.framesCurrent < this.sprites.attack.framesMax - 1 && spriteName !== 'death'
        )   return;  

        // - - - HURT SCENARIO - - -
        else if (this.image === this.sprites.hurt.image && 
            this.framesCurrent < this.sprites.hurt.framesMax -1
        ) return ;  

        // - - - DEATH SCENARIO - - -
         else if (this.image === this.sprites.death.image && 
            this.framesCurrent < this.sprites.death.framesMax -1
        ) return ;  
       // - - - DEATH SCENARIO ENDED - - -
        else if (this.image === this.sprites.death.image && 
            this.framesCurrent === this.sprites.death.framesMax-1
        ){
            this.imploded = true;
            if(!this.hasPaid && !Player1.Dead){
                this.hasPaid = true;
                Player1.coins += this.value;
                
                // --- SOUL COLLECTOR (Nuovo Perk) ---
                if (Player1.SoulCollector) {
                    // Contatore segreto monete totali
                    if(!Player1.runCoins) Player1.runCoins = 0;
                    Player1.runCoins += this.value;
                    
                    // Se superiamo la soglia di 10 monete raccolte...
                    if (Player1.runCoins >= 10) {
                        // Resetta e tieni il resto
                        Player1.runCoins -= 10;
                        
                        // Aumenta il danno fisso (es: +1 al danno o +2%)
                        Player1.Damage = Math.floor(Player1.Damage * 1.02); 
                        // Feedback grafico al volo
                        CreateVFX(Player1, "SOUL"); 
                        
                    }
                }
                
            }
        }
        // - - - PLUNGE SCENARIO - - -
        else if (
            this.sprites.slam && // <-- EVITA IL CRASH SE LO SPRITE NON ESISTE
            this.image === this.sprites.slam.image && 
            this.framesCurrent < this.sprites.slam.framesMax - 1
        ) return;
        
        if (!this.sprites[spriteName]) return;

        if (this.image === this.sprites[spriteName].image) return

        this.image = this.sprites[spriteName].image
        this.framesMax = this.sprites[spriteName].framesMax
        this.framesHold = this.sprites[spriteName].framesHold || 6;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
    }

    attack() {
        if (this.attackCooldown === 0){
            this.switchSprite('attack') 
            this.isAttacking = true;
            this.framesCurrent = 0; 
            this.framesElapsed = 0;
            this.hitEnemies = [];
            // - - - AUDIO - - - 
            this.attackSoundPlayed = false;
        }
        else return ; 
    }
    castRangedAttack() {
        if (this.attackCooldown === 0 && !this.isAttacking) {
            this.switchSprite('attack'); 
            this.isAttacking = true;
            this.framesCurrent = 0; 
            this.framesElapsed = 0;
            this.hitEnemies = [];

            this.keys.left.pressed = false;
            this.keys.right.pressed = false;
            this.velocity.x = 0; 
            

            // Se è il BigAhhLauncher spara la meteora (tipo 2), altrimenti il proiettile base (tipo 1)
            const bulletType = this.type === "BigAhhLauncher" ? 2 : 1;
            this.type === "BigAhhLauncher" ? SoundManager.play('BigFireballs') : SoundManager.play('SmallFireballs');
            this.castBullet(this, bulletType);
            
            // Il boss ha un cooldown più lungo (circa 3 secondi e mezzo)
            this.attackCooldown = this.type === "BigAhhLauncher" ? 200 : 120; 
        }
    }

    plunge(){
        this.isPlunging = true;
        this.switchSprite('slam');
    }
    hurt(){
        this.isAttacking = false;
        this.switchSprite('hurt') 
    }
    death (){
        this.Dead=true;
        this.PoweredUp = false;
        this.switchSprite('death') 
        
        
    }
    defend (){
        this.switchSprite('defence') 
    }
    runAI() {
    if (!g.FlagFight) return ;

    // - - - FINDING NEAREST ENEMY - - -
    let other = null; 
    let minDist = Infinity ; 

        g.Fighters.forEach(f => {
            // finding player1
            if (f !== this && !f.Dead && f.Player === 1) { 
                let d = Math.abs(f.position.x - this.position.x);
                if (d < minDist) {
                    minDist = d;
                    other = f;
                }
            }
        });

        if (!other) return;
    // - - - RESET KEYS - - - 
    this.keys.right.pressed = false;
    this.keys.left.pressed = false;
    this.keys.up.pressed = false;
    this.keys.defend.pressed = false;

    // - - - ORIENTATION - - -
    const diffX = other.position.x - this.position.x;
    const diffY = other.position.y - this.position.y; 
    const dist = Math.abs(diffX);

    if (this.type === "base"){
            // - - - DEFENCE - - - 
        if ((dist < this.AttackBox.size.x +other.size.x && !this.isAttacking && other.isAttacking && Math.random()<0.4)) {
            this.keys.defend.pressed = true ;
            this.LastKeyPressed=this.ControlKeys.defend
            return ; 
        }

        const SafeZone = 100 ; 
        if (dist > 250){
            if (diffX > 0){
                this.keys.right.pressed = true;
                this.LastKeyPressed = this.ControlKeys.right;
            }
            else {
                this.keys.left.pressed = true;
                this.LastKeyPressed = this.ControlKeys.left;
            }
        }

        else if (dist > SafeZone) {
            if (Math.random() > 0.02){
                if (diffX > 0){
                    this.keys.right.pressed = true;
                    this.LastKeyPressed = this.ControlKeys.right;
                } 
                else {
                    this.keys.left.pressed = true;
                    this.LastKeyPressed = this.ControlKeys.left;
                }
            }
        } 
        // too close to the player
        else if (dist < SafeZone-this.size.x){
            if (Math.random()<0.1){
                if (diffX>0){
                    this.keys.left.pressed = true;
                    this.LastKeyPressed = this.ControlKeys.left;
                }
                else {
                    this.keys.right.pressed = true;
                    this.LastKeyPressed = this.ControlKeys.right;
                }
            }
        }

            // - - - DIRECTION - - -
            if (!this.isAttacking){
                if (diffX > 0) {
                    this.Direction.right = true;
                    this.Direction.left = false;
                } else {
                    this.Direction.right = false;
                    this.Direction.left = true;
                }
            }
        if (Math.random() < 0.01 && !this.OnGround  && diffX > 0){
            this.plunge();
        }
        

        // - - - ATTACK - - -
        if (dist < this.AttackBox.size.x && !this.isAttacking && !this.Dead) {
            if (Math.random() < 0.05) { 
                this.attack();
            }
        }
        // Random defence / jump
        if ((diffY < -100 && this.OnGround) || (Math.random()<0.005 && this.OnGround)) {
            const ran = Math.random();
            if (ran>0.5){
                this.keys.up.pressed = true;
                this.LastKeyPressed=this.ControlKeys.up;
            }
            else {
                this.keys.defend.pressed = true;
                this.LastKeyPressed=this.ControlKeys.defend;
            }
        }
        
    }
       else if (this.type === "launcher") {

            if (this.isAttacking && this.framesCurrent >= this.sprites.attack.framesMax - 1){
                this.keys.left.pressed = false;
                this.keys.right.pressed = false;
                return;
            }
            
            // 3. GESTIONE DISTANZA E ANGOLI (Kiting)
            const MinDistance = 350; 
            const MaxDistance = 550; 
            const CornerMargin = 60; // Limite dai bordi della mappa

            // Controlla se ha toccato i bordi dello schermo
            const atLeftWall = this.position.x <= CornerMargin;
            const atRightWall = (this.position.x + this.size.x) >= (g.MAX_WIDTH - CornerMargin);
            let isCornered = false;

            // Troppo vicino -> Scappa, MA controlla se c'è un muro!
            if (dist < MinDistance) {
                if (diffX > 0) { // Player a destra, scappa a sinistra
                    if (!atLeftWall) {
                        this.keys.left.pressed = true;
                        this.LastKeyPressed = this.ControlKeys.left;
                    } else {
                        isCornered = true; // Incastrato a sinistra!
                    }
                } else { // Player a sinistra, scappa a destra
                    if (!atRightWall) {
                        this.keys.right.pressed = true;
                        this.LastKeyPressed = this.ControlKeys.right;
                    } else {
                        isCornered = true; // Incastrato a destra!
                    }
                }
            } 
            // Troppo lontano -> Si avvicina
            else if (dist > MaxDistance) {
                if (diffX > 0) {
                    this.keys.right.pressed = true;
                    this.LastKeyPressed = this.ControlKeys.right;
                } else {
                    this.keys.left.pressed = true;
                    this.LastKeyPressed = this.ControlKeys.left;
                }
            }

            // 4. EVASIONE DISPERATA (Se è all'angolo o il player gli addosso)
            if ((isCornered || dist < 120) && this.OnGround && Math.random() < 0.1) {
                this.keys.up.pressed = true; // Salta
                this.LastKeyPressed = this.ControlKeys.up;
                
                // Se è all'angolo, corre verso il player saltando per scavalcarlo
                if (isCornered) {
                    const runForward = atLeftWall ? 'right' : 'left';
                    this.keys[runForward].pressed = true;
                    this.LastKeyPressed = this.ControlKeys[runForward];
                }
            }

            // 5. ATTACCO RANGED (Spara a distanza ottimale, OPPURE se è con le spalle al muro)
            if (((dist >= MinDistance && dist <= MaxDistance) || isCornered) && !this.Dead) {
                if (Math.random() < 0.04) { 
                    this.castRangedAttack();
                }
            }
        }
        else if (this.type === "BigAhhLauncher") {

            if (this.isAttacking && this.framesCurrent >= this.sprites.attack.framesMax - 1){
                return;
            }
            
            // 1. NON SI MUOVE MAI. Si limita a guardare minacciosamente il player.
            if (diffX > 0) {
                this.Direction.right = true;
                this.Direction.left = false;
            } else {
                this.Direction.right = false;
                this.Direction.left = true;
            }

            // 2. ATTACCO RANGED (Spara a intervalli regolari)
            if (!this.Dead && this.attackCooldown === 0) {
                if (Math.random() < 0.03) { 
                    this.castRangedAttack();
                }
            }
        }
    } 

    castBullet(caster, type = 1) {
        if (caster.attackCooldown >0) return ; 
        const New = Bullet.CreateBullet(type, caster);
        g.Bullets.push(New);
    }
    static createFighters(ids) {
        // 1. Mappiamo gli ID direttamente ai loro dati (molto più scalabile!)
        const configMap = {
            1: FIGHTER_STATS.Sekiro,
            2: FIGHTER_STATS.Night,
            3: FIGHTER_STATS.Night3,
            4: FIGHTER_STATS.Night2
        };
    
        // Prende i dati giusti in base all'ID, se non lo trova usa Night di default
        const configData = configMap[ids] || FIGHTER_STATS.Night; 
    
        const basePos = ids === 1 ? g.StartingPositionP1 : g.StartingPositionP2;
        let spawnPos =  { x : basePos.x, y: basePos.y };
        
        if (ids >= 2) {
            spawnPos.x -= Math.random() * 300;
        }

        // --- FIX DEL BUG DEI CLONI ---
        // Creiamo una COPIA INDIPENDENTE degli sprites per ogni nuovo nemico!
        let clonedSprites = {};
        for (const [key, value] of Object.entries(configData.sprites)) {
            clonedSprites[key] = {
                imageSrc: value.imageSrc,
                framesMax: value.framesMax,
                framesHold: value.framesHold // se lo usi
                // Non copiamo "image", così la classe Sprite se ne creerà una nuova per conto suo!
            };
        }

        return new Fighter({
            position : spawnPos,
            size : configData.size,
            ControlKeys : configData.ControlKeys,
            color : configData.color,
            Direction : configData.Direction,
            AttackBox : configData.AttackBox,
            Damage : configData.Damage,
            Player :ids,
            imageSrc : configData.imageSrc,
            framesMax : configData.framesMax,
            scale : configData.scale,
            offset : configData.offset,
            
            // Passiamo i cloni, non l'oggetto originale!
            sprites : clonedSprites, 
            
            isAI : configData.isAI,
            attackFrame : configData.attackFrame,
            type : configData.type,
            HealthPoints : configData.HealthPoints,
            MaxHealthPoints : configData.MaxHealthPoints,
            value : configData.value
        })
    }
}

class Mask extends Sprite{
    constructor({position,velocity = {x: 0 , y : 0},size ,price,color = "black",imageSrc,sprites,scale = 1 , framesMax=1 ,offset = {x:0, y:0},CuringHealth,DamageMult = 1,KnockBack = 1}){
        super({
            position,
            size,
            color,
            imageSrc,
            scale,
            framesMax,
            offset,
            sprites
        })
        this.velocity = velocity;
        this.CuringHealth = CuringHealth;
        this.DamageMult = DamageMult;
        this.KnockBack = KnockBack;
        this.GotTaken = false;
        this.Placed = false;
        this.price = price;
        this.startY = this.position.y;
        this.timer =0;
    }
    update(dt) {
        this.animateFrames(dt);
        
        // 1. Oscillazione
        this.timer += 0.05;
        this.position.y = this.startY + Math.sin(this.timer) * 10;

        // 2. Disegna lo sprite
        this.Draw();

        // 3. Controllo Prossimità e Testo a schermo
        if (!this.GotTaken) {
            const priceMultplier = 1;
            const finalPrice = this.price * priceMultplier;

            // Calcola la distanza tra il centro del Player e il centro della Maschera
            const distX = Math.abs((this.position.x + this.size.x / 2) - (Player1.position.x + Player1.size.x / 2));
            const distY = Math.abs((this.position.y + this.size.y / 2) - (Player1.position.y + Player1.size.y / 2));

            // Se il Player è vicino (entro 100px orizzontali e 120px verticali)
            if (distX < 100 && distY < 120) {
                
                // Disegna il box con prezzo e tasto direttamente nel Canvas
                c.save();
                c.font = "bold 12px 'Press Start 2P', sans-serif";
                c.textAlign = "center";
                
                const boxX = this.position.x + this.size.x / 2;
                const boxY = this.position.y - 40;

                // Sfondo nero semitrasparente
                c.fillStyle = "rgba(0, 0, 0, 0.8)";
                c.fillRect(boxX - 90, boxY - 35, 180, 45);
                
                // Bordo dorato
                c.strokeStyle = "gold";
                c.lineWidth = 2;
                c.strokeRect(boxX - 90, boxY - 35, 180, 45);

                // Testo
                c.fillStyle = "gold";
                c.fillText(`${this.name || 'Mask'}: ${finalPrice} 🪙`, boxX, boxY - 18);
                c.fillStyle = "#00ffcc";
                c.fillText("[E] Compra", boxX, boxY);
                
                c.restore();

                // Controllo pressione tasto E
                if (Player1.keys.interact && Player1.keys.interact.pressed) {
                    Player1.keys.interact.pressed = false; // Consuma l'input
                    
                    getPerked(this,priceMultplier);
                }
            }
        }
    }
    MaskTaken(player) {
        
        
        // 1. Danno e Knockback base (senza il malus del PvP)
        if (this.DamageMult && this.DamageMult !== 1) {
            player.Damage = Math.floor(player.Damage * this.DamageMult);
        }
        if (this.KnockBack) player.KnockBack *= this.KnockBack;
        
        // 2. Salute Massima e Cura
        if (this.MaxHealthUp) player.MaxHealthPoints += this.MaxHealthUp;
        
        if (this.CuringHealth) player.HealthPoints += this.CuringHealth;
        
        // Sicurezza: non farlo andare oltre la vita massima
        if (player.HealthPoints > player.MaxHealthPoints) {
            player.HealthPoints = player.MaxHealthPoints;
        }
        
        // 3. Nuove abilità speciali (se presenti nella maschera)
        if (this.CanShoot) player.CanShoot = true;
        if (this.LifeSteal) player.lifeSteal = this.LifeSteal;
        if (this.SpeedMult) player.speedMult = this.SpeedMult;
        if (this.JumpBoost) player.jumpPower = (player.jumpPower || -15) + this.JumpBoost;
        if (this.Ricochet) player.Ricochet = true;
        if (this.ToxicTrail) player.ToxicTrail = true;
        if (this.Executioner) player.Executioner = true;
        if (this.StaticShield) player.StaticShield = true;
        if (this.SoulCollector) player.SoulCollector = true;
        if (this.SplitShot) player.SplitShot = true;
        if (this.isFightTime) {
            g.isPerked = true;
            RemovePerks();
        }
        
        
        CreateVFX(player, "MASK", this.name);
        ReduceAddHP(player); // Aggiorna la UI della vita
       // --- LOGICA DOM INVENTARIO (STACKING) ---
        const inventoryDiv = document.getElementById('inventory-container');
        if (inventoryDiv && !this.isFightTime) {
            // Creiamo un ID univoco usando il nome (es. "Maschera Cura" -> "maschera-cura")
            // Se non hai definito this.name per sbaglio, usiamo l'URL dell'immagine come fallback di sicurezza
            let rawName = this.name ? this.name : this.image.src;
            let perkId = rawName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            
            // Controlliamo se esiste già uno slot per questo perk
            let existingSlot = inventoryDiv.querySelector(`[data-perk-id="${perkId}"]`);

            if (existingSlot) {
                // IL PERK ESISTE GIÀ: Aggiorniamo il contatore
                let badge = existingSlot.querySelector('.perk-badge');
                let count = parseInt(badge.innerText.replace('x', '')) || 1;
                count++;
                badge.innerText = `x${count}`;
                badge.style.display = 'block'; // Mostriamo il badge dal x2 in poi
            } else {
                // IL PERK È NUOVO: Creiamo l'icona
                const slot = document.createElement('div');
                slot.classList.add('perk-slot');
                slot.setAttribute('data-perk-id', perkId);

                const icon = document.createElement('img');
                icon.src = this.image.src;
                icon.classList.add('inventory-item');

                const badge = document.createElement('div');
                badge.classList.add('perk-badge');
                badge.innerText = 'x1';
                badge.style.display = 'none'; // A x1 lo teniamo nascosto per pulizia visiva

                slot.appendChild(icon);
                slot.appendChild(badge);
                inventoryDiv.appendChild(slot);
            }
        }
        // ----------------------------------------
        
        this.GotTaken = true;
    }
    static CreateMask(xPos, yPos) {
        let selectedId = Math.floor(Math.random() * 12) + 1; 
        if(g.PowerUps.length === 3){
            selectedId = 13;
        }
        // Estrae un numero a caso da 1 a 12
        
        const config = MASK_STATS[selectedId];

        let newMask = new Mask({
            position: { x: xPos, y: yPos },
            size: config.size,
            CuringHealth: config.CuringHealth,
            DamageMult: config.DamageMult,
            KnockBack: config.KnockBack,
            imageSrc: config.imageSrc,
            framesMax: config.framesMax,
            scale: config.scale,
            offset: config.offset,
            price: config.price
        });
        
        // Stats Vecchie
        newMask.MaxHealthUp = config.MaxHealthUp;
        newMask.CanShoot = config.CanShoot;
        newMask.LifeSteal = config.LifeSteal;
        newMask.SpeedMult = config.SpeedMult;
        newMask.JumpBoost = config.JumpBoost;
        
        // Stats Nuove (le passiamo alla maschera prima di essere presa)
        newMask.Ricochet = config.Ricochet;
        newMask.ToxicTrail = config.ToxicTrail;
        newMask.Executioner = config.Executioner;
        newMask.StaticShield = config.StaticShield;
        newMask.SoulCollector = config.SoulCollector;
        newMask.SplitShot = config.SplitShot;
        newMask.isFightTime = config.isFightTime;

        newMask.name = config.name;
        newMask.Placed = true;

        return newMask;
    }
    
}
class FloatingText{
    constructor({position = {x: 0, y:0},velocity = {x:0, y:-0.5},text,opacity = 1,color ="white",fadeSpeed = 0.02}){
        this.position = position;
        this.velocity = velocity;
        this.text = text;
        this.color = color;
        this.opacity = opacity;
        this.dead = false;
        this.fadeSpeed = fadeSpeed;
    }
    draw(){

        c.save()
        c.globalAlpha = this.opacity 
        c.font = "bold 30px 'Press Start 2P', sans-serif"
        c.fillStyle = this.color
        
        if (this.text !== ""){
            c.lineWidth = 3
            c.strokeStyle = 'black'
            c.strokeText(this.text, this.position.x, this.position.y)
            c.fillText(this.text, this.position.x, this.position.y)
        }
        else {
            
            c.fillRect(this.position.x, this.position.y,5,5);
        }
        c.restore()
    }
    update(){
        this.draw();
        this.position.y +=this.velocity.y;
        this.position.x +=this.velocity.x;
        this.opacity -= this.fadeSpeed;
        if (this.opacity<= 0 ){
            this.opacity = 0 ; 
            this.dead= true;
        }
    }
}
class FloatingPointers extends FloatingText{
    constructor({position,text,color,offset = {x:0,y:0},target,isMob}){
        super({
            position,
            text,
            color
        })
        this.offset = offset;
        this.target = target;
        this.isMob = isMob;
    }
    static createPointers(player) {
        let color, name, isMob = false;

        if (player.Player === 1) {
            color = "#FF3126";
            name = g.Fighter1Name;
        } else if (player.Player === 2 && !player.isAI) {
            color = "#8f00ff";
            name = "2";
        } else {
            color = "red";
            name = "3"; // Niente nome per i mob
            isMob = true; 
        }
        
        return new FloatingPointers({
            text: name,
            color: color,
            target: player,
            isMob: isMob
        });
    }
    draw(){
        if(!this.isMob){
            super.draw();
        }
        else {
            const barWidth = 50; 
            const barHeight = 5;
            const hpPercent = Math.max(0,this.target.HealthPoints / 100);

            // Color and Style
            c.save();
            c.fillStyle = '#440000'; 
            c.fillRect(this.position.x, this.position.y, barWidth, barHeight);
            if (hpPercent < 0.34){
                c.fillStyle = '#ff4800'; 

            }
            else if (hpPercent > 0.34 && hpPercent < 0.5){
                c.fillStyle = '#ffbf00'; 

            }
            else {
                c.fillStyle = '#00ff00'; 
            }
            
            c.fillRect(this.position.x, this.position.y, barWidth * hpPercent, barHeight);
            
            c.strokeStyle = 'black'; 
            c.lineWidth = 0.5;
            c.strokeRect(this.position.x, this.position.y, barWidth, barHeight);
            c.restore();

        }
    }
    update(){
        const player = this.target;
        if (player.Dead) return ;
        if (this.isMob) {
            this.position.x = player.position.x + (player.size.x /2) -20;
            this.position.y = player.position.y - 15;
        }
        else {
            this.position.x = player.position.x + this.offset.x;
            this.position.y = player.position.y + this.offset.y;

        }
        this.draw();
    }
}
class Platform extends Sprite{
    constructor({position,size = {x:300,y:15},color,imageSrc,sprites,scale = 1 , framesMax=1 ,offset = {x:0, y:0}}){
        super({
            position,
            size,
            color,
            imageSrc,
            scale,
            framesMax,
            offset,
            sprites
        })
    }
    
}
class Bullet extends Sprite{
    constructor({position,velocity = {x: 0 , y : 0},size ,isMute = false,color = "black",imageSrc,sprites,scale = 1 , framesMax=1 ,offset = {x:0, y:0},Damage,KnockBack,caster,other,liveFrames = 0,isUnblockable = false}){
        super({
            position,
            size,
            color,
            imageSrc,
            scale,
            framesMax,
            offset,
            sprites
        })
        this.Damage = Damage;
        this.KnockBack = KnockBack;
        this.hasHit = false;
        this.Bullets = [];
        this.velocity=velocity;
        this.caster = caster;
        this.other = other;
        this.liveFrames = liveFrames;
        this.framesMax = framesMax;
        this.isUnblockable = isUnblockable;
        this.isMute = isMute;
        
        this.Direction = {
            left: this.velocity.x < 0,
            right: this.velocity.x >= 0
        };

    }
    update(dt){
        this.liveFrames++;

        this.Direction = {
            left: this.velocity.x < 0,
            right: this.velocity.x >= 0
        };
        this.animateFrames(dt);

         
        this.position.x += this.velocity.x*dt; 

        this.velocity.y+=g.Gravity_Acceleration/8;
        this.position.y +=this.velocity.y *dt;

        // - - - COLLISIONS WITH PLAYERS - - - 
        if (this.liveFrames > 300 ){
                    if (!this.isMute){
                        SoundManager.play('fireExplosion');
                    }
                    const index =  g.Bullets.indexOf(this);
                    this.hasHit = true;
                    if (index !== -1){
                        g.Bullets.splice(index,1);
                    }
                    CreateVFX(this, "DISAPPEAR","",false)
            }
    
       else if (!this.hasHit) {
            // Troviamo i bersagli (se sei P1 colpisci tutti i mob, se sei un mob colpisci P1)
            const targets = this.caster.Player === 1 
                ? g.Fighters.filter(f => f.Player !== 1 && !f.Dead) 
                : g.Fighters.filter(f => f.Player === 1 && !f.Dead);

            // Controlliamo se la fireball tocca uno qualsiasi dei bersagli
            for (let i = 0; i < targets.length; i++) {
                let victim = targets[i];
                
                if (CheckCollisions({ rectangle1: this, rectangle2: victim })) {
                    
                    // Applica i danni e gli effetti standard a "victim"
                    if (!victim.Defending || this.isUnblockable) {
                        victim.HealthPoints -= this.Damage;
                        ReduceAddHP(victim);
                        victim.hurt();
                        CreateVFX(victim, "HIT");
                        CreateVFX(victim, "DAM");
                        const pushDir = this.velocity.x >= 0 ? 1 : -1;
                        victim.velocity.x = pushDir * this.KnockBack;
                    } else {
                        CreateVFX(victim, "DEF");
                        if (victim.staminaBar < 3) {
                            victim.staminaBar++;
                            ReduceAddStamina(victim);
                        }
                    }

                    // --- RICOCHET MASTER (Nuovo Perk) ---
                    if (this.caster && this.caster.Ricochet && !this.hasBounced) {
                        this.hasBounced = true; // Permette 1 solo rimbalzo
                        this.Damage = Math.floor(this.Damage * 0.7); // 70% del danno

                        // Trova il nemico più vicino escluso chi hai appena colpito
                        let nearestEnemy = null;
                        let minDist = 400; // Cerca nel raggio di 400 pixel
                        
                        for (let t of targets) {
                            if (t !== victim) {
                                const dist = Math.abs(t.position.x - this.position.x);
                                if (dist < minDist) {
                                    minDist = dist;
                                    nearestEnemy = t;
                                }
                            }
                        }

                        // Se trova una seconda vittima, fa rimbalzare il colpo!
                        if (nearestEnemy) {
                            SoundManager.play('parry'); // Suono metallico per il rimbalzo
                            
                            const dx = nearestEnemy.position.x - this.position.x;
                            const dy = nearestEnemy.position.y - this.position.y;
                            const mag = Math.sqrt(dx*dx + dy*dy);
                            
                            // Nuova velocità verso il nemico
                            this.velocity.x = (dx / mag) * 35;
                            this.velocity.y = (dy / mag) * 35;
                            this.liveFrames = 0; // Resetta la vita del bullet
                            
                            break; // Esce dal ciclo attuale ma il bullet CONTINUA A VOLARE
                        }
                    }
                    
                    // --- DISTRUZIONE STANDARD ---
                    // Se non ha rimbalzato (o ha già rimbalzato 1 volta), esplode e muore
                    SoundManager.play('fireExplosion');
                    this.hasHit = true;
                    this.Dead = true;

                    const index = g.Bullets.indexOf(this);
                    if (index !== -1) g.Bullets.splice(index, 1);
                    CreateVFX(this, "DISAPPEAR", "", false);
                    
                    break;
                }
            }
        }
        

        // - - - COLLISIONS WITH PLATFORMS - - - 
        g.Platforms.forEach(c => {
            if (CheckCollisions({ rectangle1: this, rectangle2: c })) {
                BouncinessPlatformCollisions({ rectangle1: this, rectangle2: c });
            }
        });

        this.Draw();
    }
    Draw() {
        // - - - DEBUG BOX - - -
        //c.fillStyle = this.color;
        //c.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);

        if (!this.image || !this.image.complete || this.image.naturalWidth === 0) return;

        const frameWidth = this.image.width / this.framesMax;
        const angle = Math.atan2(this.velocity.y, this.velocity.x);

        c.save();

        const centerX = this.position.x + this.size.x / 2;
        const centerY = this.position.y + this.size.y / 2;
        c.translate(centerX, centerY);

        c.rotate(angle);

        c.drawImage(
            this.image,
            this.framesCurrent * frameWidth,
            0,
            frameWidth,
            this.image.height,
            -this.size.x / 2 - this.offset.x, 
            -this.size.y / 2 - this.offset.y, 
            frameWidth * this.scale,
            this.image.height * this.scale
        );

        c.restore();
    }
    static CreateBullet(val, caster) {
        const config = val === 1 ? BULLET_STATS[1] : BULLET_STATS[2]; 
        const other = caster.Player === 1 ? Player2 : Player1;
        const dir = caster.Direction.right ? 1 : -1;

        // 1. Punti di partenza e bersaglio
        const startX = caster.position.x + (dir === 1 ? caster.size.x : -20);
        const startY = caster.position.y + caster.size.y / 2;

        const targetX = other.position.x + other.size.x / 2;
        const targetY = other.position.y + other.size.y / 2;

        const dx = targetX - startX;
        const dy = targetY - startY;

        // 2. Gravità applicata al proiettile
        const gravity = g.Gravity_Acceleration / 8;

        // --- LA MAGIA DELLA VELOCITÀ È QUI ---
        const isMeteor = val === 2;
        
        // Impulso verso l'alto: la meteora va altissima e scende pesante (-12)
        const vy = isMeteor ? -12 : Math.random() * 10 * -1; 

        // Tempo di volo in frame: 100 = roba veloce. 260 = quasi 4 secondi di terrore puro
        const flightTime = isMeteor ? 260 : 100; 
        
        // 5. Velocità orizzontale scalata in base al tempo
        const vx = dx / flightTime;

        return new Bullet({
            position: { x: startX, y: startY },
            velocity: { x: vx, y: vy }, 
            size: config.size,
            KnockBack: config.KnockBack,
            imageSrc: config.imageSrc,
            framesMax: config.framesMax,
            scale: config.scale,
            offset: config.offset,
            Damage: config.Damage, 
            caster: caster,
            other: other, 
            color : config.color,
            isUnblockable: isMeteor // La meteora (2) non si para
        });
    }
}
class Shockwave extends Sprite {
    constructor({ position }) {
        super({ position });

        this.size = { x: 0, y: 0 }; 
        this.isUnblockable = true;
        this.radius = 5;
        this.opacity = 1;
        this.Dead = false;
        this.hasHit = false; // non fa danni come un Bullet normale

        // Lingue di fiamma che si alzano dal punto d'impatto
        this.flames = [];
        const flameCount = 14;
        for (let i = 0; i < flameCount; i++) {
            this.flames.push({
                angle: (Math.PI / (flameCount - 1)) * i, // ventaglio verso l'alto
                dist: 0,
                maxDist: 30 + Math.random() * 60,
                height: 30 + Math.random() * 40,
                width: 4 + Math.random() * 5,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.15 + Math.random() * 0.15,
                life: 1,
                decay: 0.015 + Math.random() * 0.015,
                delay: Math.random() * 6 // partenze sfalsate = più organico
            });
        }
    }

    update(dt) {
        this.radius += 10 * dt;
        this.opacity -= 0.035 * dt;

        this.flames.forEach(f => {
            if (f.delay > 0) { f.delay -= dt; return; }
            f.dist = Math.min(f.dist + 2.5 * dt, f.maxDist);
            f.wobble += f.wobbleSpeed * dt;
            f.life -= f.decay * dt;
        });

        this.draw();
        if (this.opacity <= 0) this.Dead = true;
    }

    draw() {
        c.save();
        c.globalCompositeOperation = "lighter";

        // Alone/anello a terra
        c.globalAlpha = Math.max(0, this.opacity) * 0.5;
        const ringGrad = c.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, this.radius * 1.6
        );
        ringGrad.addColorStop(0, "rgba(140,220,255,0.9)");
        ringGrad.addColorStop(0.5, "rgba(0,150,255,0.5)");
        ringGrad.addColorStop(1, "rgba(0,80,255,0)");
        c.beginPath();
        c.ellipse(this.position.x, this.position.y, this.radius * 1.6, this.radius * 0.45, 0, 0, Math.PI * 2);
        c.fillStyle = ringGrad;
        c.fill();

        // Lingue di fiamma
        c.globalAlpha = 1;
        this.flames.forEach(f => {
            if (f.life <= 0 || f.delay > 0) return;

            const baseX = this.position.x + Math.cos(f.angle) * f.dist;
            const baseY = this.position.y - Math.sin(f.angle) * f.dist * 0.3;
            const sway = Math.sin(f.wobble) * 6;
            const h = f.height * f.life;

            const grad = c.createLinearGradient(baseX, baseY, baseX + sway, baseY - h);
            grad.addColorStop(0, `rgba(180,240,255,${0.9 * f.life})`);
            grad.addColorStop(0.4, `rgba(40,150,255,${0.7 * f.life})`);
            grad.addColorStop(1, `rgba(10,40,180,0)`);

            c.beginPath();
            c.moveTo(baseX - f.width / 2, baseY);
            c.quadraticCurveTo(baseX + sway * 0.6, baseY - h * 0.5, baseX + sway, baseY - h);
            c.quadraticCurveTo(baseX + sway * 0.4, baseY - h * 0.5, baseX + f.width / 2, baseY);
            c.closePath();
            c.fillStyle = grad;
            c.fill();
        });

        c.restore();
    }
}