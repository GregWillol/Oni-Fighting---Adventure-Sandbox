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
    constructor ({position,velocity = {x:0 , y:0},size = {x: 0, y:0},color,keys = {up : {pressed : false},left : {pressed : false},attack : {pressed : false},right : {pressed : false},defend : {pressed: false}},ControlKeys,AttackBox = {position : {x: 0, y:0}, size : {x:StandardAttBoxWid, y:g.HitHeight},shape : ""},Direction = {right : false, left : false},Player,imageSrc,scale = 1,framesMax=1, offset = {x : 0 , y : 0},sprites,Damage = 10,isAI=false,attackFrame = 5}){
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
        this.HealthPoints = 100;
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
    
        // for AI checking if it's stuck
        this.checkStuckTimer = 0;
        this.previousPositionX = this.position.x;
    }
    update(Other,dt){ 
        
        if (this.isAI) this.runAI(Other);
        
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
        if (!isKnockedBack && this.HitStun === 0 && g.FlagFight){
            //Setting direction of the Sprite using the LastKeyPressed on X-Axis (so left or right)
            if (this.keys.right.pressed && this.LastKeyPressed === this.ControlKeys.right && !this.Defending && !this.Dead && !this.isAttacking) {
                this.Direction.right = true; 
                this.Direction.left = false; 
                this.velocity.x = 5*dt;
                CreateVFX(this,"RUN")
                
            } else if (this.keys.left.pressed && this.LastKeyPressed === this.ControlKeys.left && !this.Defending && !this.Dead && !this.isAttacking) {
                this.Direction.left = true;
                this.Direction.right = false; 
                this.velocity.x = -5*dt;
                CreateVFX(this,"RUN")
            }
            //- - - VERIFYING JUMP CONDITION - - - 
            if (this.keys.up.pressed && this.OnGround && !this.Defending && !this.Dead && !this.isAttacking) {
                this.velocity.y = -24*dt;
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

if (this === Player1) {
    // Se attacca Player 1, i bersagli sono gli Enemies (Torre) oppure Player 2 (Sandbox)
    targets = g.isAdventure ? g.Enemies : [Player2];
} else {
    // Se attacca CHIUNQUE ALTRO (Player 2 umano, Player 2 IA, o un Mob), il bersaglio è Player 1
    targets = [Player1];
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
                }
            }
        }
    }

    // End of attack animation: trigger cooldown and clear hit entities tracking
    if (this.isAttacking && this.framesCurrent >= this.sprites.attack.framesMax - 1) {
        this.isAttacking = false;
        this.attackCooldown = 90;
        this.hitEnemies.length = 0; // Fast array reset without memory re-allocation
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
            g.FlagGame = false;
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
    runAI(other) {
    if (!g.FlagFight) return ;
    // - - - RESET KEYS - - - 
    this.keys.right.pressed = false;
    this.keys.left.pressed = false;
    this.keys.up.pressed = false;
    this.keys.defend.pressed = false;

    // - - - ORIENTATION - - -
    const diffX = other.position.x - this.position.x;
    const diffY = other.position.y - this.position.y; 
    const dist = Math.abs(diffX);

   // - - - DEFENCE - - - 
    if ((dist < this.AttackBox.size.x +other.size.x && !this.isAttacking && other.isAttacking && Math.random()<0.4)) {
        this.keys.defend.pressed = true ;
        this.LastKeyPressed=this.ControlKeys.defend
        return ; 
    }
    
    const SafeZone = 120 ; 
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
        if (diffX > 0) {
            this.Direction.right = true;
            this.Direction.left = false;
        } else {
            this.Direction.right = false;
            this.Direction.left = true;
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
    static createFighters(ids){

        const configData = ids === 1 ? FIGHTER_STATS.Sekiro : FIGHTER_STATS.Night ; 
        const spawnPos = ids === 1 ? g.StartingPositionP1 : g.StartingPositionP2;
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
            sprites : configData.sprites,
            isAI : configData.isAI
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
    update(){
        this.animateFrames();

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
        
        return new Mask ({
            position : config.position,
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
    constructor({position,text,color,offset = {x:0,y:0},target}){
        super({
            position,
            text,
            color
        })
        this.offset = offset;
        this.target = target;
    }
    static createPointers(player){
        const color = player.Player === 1 ? "#FF3126" : "#8f00ff";
        const name = player.Player === 1 ? g.Fighter1Name : g.Fighter2Name;
        
       
        return new FloatingPointers({
            text : name,
            color : color,
            target : player
        });
        
    }
    update(){
        const player = this.target;
        if (player.Dead) return ;
        this.position.x=player.position.x+this.offset.x;
        this.position.y = player.position.y+this.offset.y;
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
