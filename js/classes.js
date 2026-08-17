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
    constructor ({position,velocity = {x:0 , y:0},size = {x: 0, y:0},color,HealthPoints,MaxHealthPoints = 100 ,keys = {up : {pressed : false},left : {pressed : false},attack : {pressed : false},right : {pressed : false},defend : {pressed: false}},ControlKeys,AttackBox = {position : {x: 0, y:0}, size : {x:StandardAttBoxWid, y:g.HitHeight},shape : ""},Direction = {right : false, left : false},Player,imageSrc,scale = 1,framesMax=1, offset = {x : 0 , y : 0},sprites,Damage = 10,isAI,attackFrame,type}){
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
    
        // for AI checking if it's stuck
        this.checkStuckTimer = 0;
        this.previousPositionX = this.position.x;
    }
    update(dt){ 
        
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
        this.velocity.x *= 0.8*dt ;  
        //- - - DIRECTION SETTING - - - 
        if (!isKnockedBack && this.HitStun === 0 && g.FlagFight){
            //Setting direction of the Sprite using the LastKeyPressed on X-Axis (so left or right)
            if (this.keys.right.pressed && this.LastKeyPressed === this.ControlKeys.right && !this.Defending && !this.Dead && !this.isAttacking && !this.imploded) {
                this.Direction.right = true; 
                this.Direction.left = false; 
                this.velocity.x = 5.5*dt;
                CreateVFX(this,"RUN")
                
            } else if (this.keys.left.pressed && this.LastKeyPressed === this.ControlKeys.left && !this.Defending && !this.Dead && !this.isAttacking) {
                this.Direction.left = true;
                this.Direction.right = false; 
                this.velocity.x = -5.5*dt;
                CreateVFX(this,"RUN")
            }
            //- - - VERIFYING JUMP CONDITION - - - 
            if (this.keys.up.pressed && this.OnGround && !this.Defending && !this.Dead && !this.isAttacking) {
                this.velocity.y = -15;
                this.OnGround = false;
            }
        }
        //Before needs to check the inputs 
        this.position.x +=this.velocity.x; 
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
        this.velocity.y+=g.Gravity_Acceleration * dt;
        this.position.y +=this.velocity.y;
        //Collisions with platforms 
        g.Platforms.forEach(c =>{
            if(CheckCollisions({rectangle1: this, rectangle2 : c})){
                PlatformCollisions({rectangle1: this, rectangle2 : c});
                CreateVFX(this,"JUMP")
                
            }
        })
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
            
            

    // Check if the animation has reached the active impact frame
    if (this.framesCurrent == this.attackFrame) {

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

                if (!victim.Defending) {
                    // --- SUCCESSFUL HIT LOGIC ---
                    CreateVFX(victim, "HIT");
                    CreateVFX(victim, "DAM");
                    ApplyKnockback(victim, this);

                    let mult = 1;

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

                    // Apply damage and trigger hurt state
                    victim.HealthPoints -= this.Damage * mult;
                    ReduceAddHP(victim);
                    victim.hurt();

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
        if (this.keys.defend.pressed && this.LastKeyPressed === this.ControlKeys.defend && !this.isAttacking && g.FlagFight && this.defenseBuffer === 0){ //These 2 lines can be placed in eventlisteners
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
                this.velocity.x = this.Direction.right ? 25*dt : -25*dt;
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

        
        
    }
    
    switchSprite(spriteName) {
        // - - - ATTACK SCENARIO - - -
        if (
            this.image === this.sprites.attack.image && 
            this.framesCurrent < this.sprites.attack.framesMax - 1
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
        }
        
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
            this.castBullet(this, bulletType);
            
            // Il boss ha un cooldown più lungo (circa 3 secondi e mezzo)
            this.attackCooldown = this.type === "BigAhhLauncher" ? 200 : 120; 
        }
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
        
        if (ids > 2) {
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
        })
    }
}

class Mask extends Sprite{
    constructor({position,velocity = {x: 0 , y : 0},size ,color = "black",imageSrc,sprites,scale = 1 , framesMax=1 ,offset = {x:0, y:0},CuringHealth,DamageMult = 1,KnockBack = 1}){
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
    }
    update(dt){
        this.animateFrames(dt);

        this.velocity.x = 0 ; 
        this.position.x += this.velocity.x ; 

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

        this.velocity.y+=g.Gravity_Acceleration;
        this.position.y +=this.velocity.y;

        // - - - BOUNDARIES - - -
        //Bound Y-Axis
        if (this.position.y+this.size.y > g.MAX_HEIGHT){
            this.velocity.y = 0;
            this.position.y = g.MAX_HEIGHT-this.size.y;
        }
        else if (this.position.y< 0){
            this.velocity.y = 0;
            this.position.y = 0;
        }

        // - - - COLLISIONS WITH PLAYERS - - - 
    
        if (!this.GotTaken){
            if (CheckCollisions({rectangle1 : this, rectangle2 : Player1})){
                this.MaskTaken(Player1,Player2);
            }
            else if (CheckCollisions({rectangle1 : this, rectangle2 : Player2})){
                this.MaskTaken(Player2,Player1);
            }
        }
        // - - - COLLISIONS WITH PLATFORMS - - - 
        //Collisions with platforms 
        g.Platforms.forEach(c =>{
            if(CheckCollisions({rectangle1: this, rectangle2 : c})){
                PlatformCollisions({rectangle1 : this, rectangle2 : c});
            }
        })

        this.Draw();
    }
    MaskTaken(player,other){
        player.PoweredUp = true ;
        //player is winning so less power 
        const Mult = player.HealthPoints > other.HealthPoints ? 0.5 : 1;
        
        player.Damage = this.DamageMult !== 1 ? player.Damage*this.DamageMult*(Mult) : player.Damage;
        player.KnockBack *= this.KnockBack;
        player.HealthPoints+= Math.floor(this.CuringHealth*Mult);
        
        CreateVFX(player,"MASK")
        ReduceAddHP(player);
        this.GotTaken = true;
    }
    static CreateMask(val){
        // 50 % that power up has knockback and less curing health
        const config = val < 0.5 ? MASK_STATS[1] : MASK_STATS[2]
        g.maskTitle = val < 0.5  ? "Damage Mult." : "KnockBack Mult.";

        const randomX = val < 0.5 
            ? Math.floor(Math.random() * (g.MAX_WIDTH - 200) + 50) 
            : Math.floor(Math.random() * (g.MAX_WIDTH / 2) + 478);
        
        return new Mask ({
            position : {x : randomX, y:0},
            size : config.size,
            CuringHealth:config.CuringHealth,
            DamageMult : config.DamageMult,
            KnockBack : config.KnockBack,
            imageSrc : config.imageSrc,
            framesMax : config.framesMax,
            scale: config.scale,
            offset: config.offset
        });
    }
    
}
class FloatingText{
    constructor({position = {x: 0, y:0},velocity = {x:0, y:-0.5},text,opacity = 1,color ="white"}){
        this.position = position;
        this.velocity = velocity;
        this.text = text;
        this.color = color;
        this.opacity = opacity;
        this.dead = false;
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
        this.opacity -= 0.02;
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
    constructor({position,velocity = {x: 0 , y : 0},size ,color = "black",imageSrc,sprites,scale = 1 , framesMax=1 ,offset = {x:0, y:0},Damage,KnockBack,caster,other,liveFrames = 0,isUnblockable = false}){
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

        // - - - BOUNDARIES - - -

        /*Bound X-Axis
        if (this.position.x+this.size.x > g.MAX_WIDTH){
            this.velocity.x = 0;
            this.position.x = g.MAX_WIDTH-this.size.x;
        }
        else if (this.position.x< 0){
            this.velocity.x = 0;
            this.position.x = 0;
        }

        

        // - - - BOUNDARIES - - -
        //Bound Y-Axis
        if (this.position.y+this.size.y > g.MAX_HEIGHT){
            this.velocity.y = 0;
            this.position.y = g.MAX_HEIGHT-this.size.y;
        }
        else if (this.position.y< 0){
            this.velocity.y = 0;
            this.position.y = 0;
        }*/

        // - - - COLLISIONS WITH PLAYERS - - - 
        if (this.liveFrames > 300){
                    const index =  g.Bullets.indexOf(this);
                    this.hasHit = true;
                    if (index !== -1){
                        g.Bullets.splice(index,1);
                    }
                    CreateVFX(this, "DISAPPEAR","",false)
                    console.log(g.Bullets);
            }
    
        else if (!this.hasHit && this.other && !this.other.Dead) {
            
            if (CheckCollisions({ rectangle1: this, rectangle2: this.other })) {
                this.hasHit = true;
                this.Dead = true; // Segna il proiettile per l'eliminazione
               

                if (!this.other.Defending || this.isUnblockable) {
                    
                    this.other.HealthPoints -= this.Damage;
                    ReduceAddHP(this.other);
                    this.other.hurt();
                    CreateVFX(this.other, "HIT");
                    CreateVFX(this.other, "DAM");

                    // Knockback coerente: spinge nella direzione del VOLO del proiettile
                    const pushDir = this.velocity.x >= 0 ? 1 : -1;
                    this.other.velocity.x = pushDir * this.KnockBack;
                } else {
                    CreateVFX(this.other, "DEF");
                    if (this.other.staminaBar< 3){
                        this.other.staminaBar++;
                        ReduceAddStamina(this.other);
                    }
                }
                const index =  g.Bullets.indexOf(this);
                    this.hasHit = true;
                    if (index !== -1){
                        g.Bullets.splice(index,1);
                    }
                    CreateVFX(this, "DISAPPEAR","",false)
                    
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