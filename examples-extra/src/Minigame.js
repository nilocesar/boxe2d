
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.tilemap('map', 'assets/tilemaps/maps/collision_test.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('ground_1x1', 'assets/tilemaps/tiles/ground_1x1.png');
    game.load.image('walls_1x2', 'assets/tilemaps/tiles/walls_1x2.png');
    game.load.image('tiles2', 'assets/tilemaps/tiles/tiles2.png');
    game.load.image('ship', 'assets/sprites/thrust_ship2.png');
    game.load.image('bullet', 'assets/sprites/shmup-bullet.png');
    game.load.image('enemy', 'assets/sprites/shmup-baddie3.png');
    game.load.image('enemybullet', 'assets/sprites/enemy-bullet.png');
    
    game.load.spritesheet('smallboom', 'assets/sprites/boom32wh12.png', 32, 32, 12);
    game.load.spritesheet('bigboom', 'assets/sprites/explosion.png', 64, 64, 23);
    
    game.load.audio('playerFire', 'assets/audio/SoundEffects/pistol.wav');
    game.load.audio('wallHit', 'assets/audio/SoundEffects/lazer.wav');
    game.load.audio('enemyHit', 'assets/audio/SoundEffects/explode1.wav');
    game.load.audio('gainedSight', 'assets/audio/SoundEffects/door_open.wav');
    game.load.audio('lostSight', 'assets/audio/SoundEffects/numkey_wrong.wav');
    game.load.audio('enemyFire', 'assets/audio/SoundEffects/shotgun.wav');

}

var CATEGORY_WALL = 1;
var CATEGORY_ENEMY = 2;
var CATEGORY_PLAYER = 3;

var ship;
var layer;
var leftButton, rightButton, upButton, downButton;
var firing = false;
var fireTimeout = 0;
var enemies = [];
var smallExplosions;
var largeExplosions;
var caption1, caption2, caption3;
var timeTaken = 0;
var enemyPositions = [[90, 70], [226, 462], [71, 507], [488, 452], [785, 523], [962, 336], [1008, 415], [1153, 329], [736, 382], [1538, 320], [1184,515], [1535, 507], [547, 108], [1557,66], [1119,418]];

var sound_playerFire;

function create() {

    sound_playerFire = game.add.audio('playerFire');
    sound_wallHit = game.add.audio('wallHit');
    sound_enemyHit = game.add.audio('enemyHit');
    sound_gainedSight = game.add.audio('gainedSight');
    sound_lostSight = game.add.audio('lostSight');
    sound_enemyFire = game.add.audio('enemyFire');

    game.physics.startSystem(Phaser.Physics.BOX2D);

    game.stage.backgroundColor = '#2d2d2d';

    var map = game.add.tilemap('map');

    map.addTilesetImage('ground_1x1');
    map.addTilesetImage('walls_1x2');
    map.addTilesetImage('tiles2');
    
    layer = map.createLayer('Tile Layer 1');

    layer.resizeWorld();

    // Set the tiles for collision.
    // Do this BEFORE generating the Box2D bodies below.
    map.setCollisionBetween(1, 12);

    // Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.
    // This call returns an array of body objects which you can perform addition actions on if
    // required. There is also a parameter to control optimising the map build.
    var tilemapBodies = game.physics.box2d.convertTilemap(map, layer);
    
    // Set the collision category of wall tiles to 1
    for (var i = 0; i < tilemapBodies.length; i++) {
        tilemapBodies[i].setCollisionCategory(CATEGORY_WALL);
    }

    // Create the ship.
    ship = game.add.sprite(32, 290, 'ship');
    game.physics.box2d.enable(ship);
    ship.body.setCircle(14);
    ship.body.angle = 90;
    ship.body.linearDamping = 0.5;
    ship.body.setCollisionCategory(CATEGORY_PLAYER);
    ship.life = 5;

    game.camera.follow(ship);
    
    leftButton =  game.input.keyboard.addKey(Phaser.Keyboard.A);
    rightButton = game.input.keyboard.addKey(Phaser.Keyboard.D);
    upButton =    game.input.keyboard.addKey(Phaser.Keyboard.W);
    downButton =  game.input.keyboard.addKey(Phaser.Keyboard.S);
    
    game.input.onDown.add(onMouseDown, this);
    game.input.onUp.add(onMouseUp, this);
    
    // Create the enemy turrets
    for (var i = 0; i < enemyPositions.length; i++) {
        var pos = enemyPositions[i];
        var enemy = game.add.sprite(pos[0], pos[1], 'enemy');
        game.physics.box2d.enable(enemy);
        enemy.body.kinematic = true;
        enemy.body.setCircle(22);
        enemy.body.setCollisionCategory(CATEGORY_ENEMY);
        enemy.body.angle = 360 * Math.random();
        enemy.life = 10;
        enemy.seesPlayer = false;
        enemy.fireTimeout = 0;
        enemies.push(enemy);
    }
    
    // Explosion pool for small explosions
    smallExplosions = game.add.group();
    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = smallExplosions.create(0, 0, 'smallboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.scale.setTo(0.5);
        explosionAnimation.animations.add('smallboom');
    }
    
    // Explosion pool for large explosions
    largeExplosions = game.add.group();
    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = largeExplosions.create(0, 0, 'bigboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('bigboom');
    }
    
    var instructionsCaption = game.add.text(5, 5, 'Use WASD to move, mouse button to shoot.', { fill: '#ffffff', font: '14pt Arial' });
    caption1 = game.add.text(5, 25, '', { fill: '#ffffcc', font: '14pt Arial' });
    caption2 = game.add.text(5, 45, '', { fill: '#ccffcc', font: '14pt Arial' });
    caption3 = game.add.text(5, 65, '', { fill: '#ccccff', font: '14pt Arial' });
    
    instructionsCaption.fixedToCamera = true;
    caption1.fixedToCamera = true;
    caption2.fixedToCamera = true;
    caption3.fixedToCamera = true;    
}

function updateCaptions() {
    caption1.text = "Enemies remaining: " + (enemies.length > 0 ? enemies.length : 'zero, you win!');
    caption2.text = "Health: " + (ship ? ship.life : 'dead!');
    caption3.text = "Time: " + timeTaken;
    
    // Use this to show where the mouse is (handy for placing enemies)
    // caption2.text = "Mouse: "+(game.camera.x+game.input.mousePointer.x)+", "+(game.camera.y+game.input.mousePointer.y);
}

function onMouseDown() {
    firing = true;
}

function onMouseUp() {
    firing = false;
}

function playerFireBullet() {
    
    // This position is first given in local coordinates of the ship sprite, 
    // then we convert it to a world position. The toWorldPoint takes into
    // account the position and rotation of the ship.
    var point = new box2d.b2Vec2(0, -24); // a bit in front of the ship, in the middle
    ship.body.toWorldPoint( point, point );
    
    // Create the bullet body and set the angle
    var bullet = game.add.sprite(point.x, point.y, 'bullet');
    game.physics.box2d.enable(bullet);
    bullet.body.angle = ship.body.angle - 90; // bullet is horizontal in the sprite image
    
    // Start the bullet moving in the same direction as the ship
    // is facing. The direction is first given in local coordinates
    // of the ship sprite, then we convert it to a world direction.
    var direction = new box2d.b2Vec2(0, -1); // up
    ship.body.toWorldVector( direction, direction );
    
    // Multiply direction by bullet speed
    direction.x *= 400;
    direction.y *= 400;
    
    // Add ship velocity to bullet velocity
    bullet.body.velocity.x = ship.body.velocity.x + direction.x;
    bullet.body.velocity.y = ship.body.velocity.y + direction.y;
    
    // Set up the contact callbacks for when the bullet hits something
    bullet.body.setCategoryContactCallback(CATEGORY_WALL, bulletHitWall, this);
    bullet.body.setCategoryContactCallback(CATEGORY_ENEMY, bulletHitEnemy, this);
    
    sound_playerFire.play();
    
    // Give the bullet sprite a tag, so we can identify it. This is needed
    // because we want to ignore bullets when checking line-of-sight between
    // the enemies and the ship.
    bullet.tag = 123;
}

// This is very similar to playerFireBullet
function enemyFireBullet(enemy) {
    
    // This position is first given in local coordinates of the enemy sprite, 
    // then we convert it to a world position. The toWorldPoint takes into
    // account the position and rotation of the enemy.
    var offset = Math.random() > 0.5 ? 10 : -10;
    var point = new box2d.b2Vec2(-30, offset); // a bit in front of the enemy
    enemy.body.toWorldPoint( point, point );
    
    // Create the bullet body and set the angle
    var bullet = game.add.sprite(point.x, point.y, 'enemybullet');
    game.physics.box2d.enable(bullet);
    bullet.body.setCircle(2);
    bullet.body.angle = enemy.body.angle;
    
    // Start the bullet moving in the same direction as the enemy
    // is facing. The direction is first given in local coordinates
    // of the enemy sprite, then we convert it to a world direction.
    var direction = new box2d.b2Vec2(-1, 0); // up
    enemy.body.toWorldVector( direction, direction );
    
    // Multiply direction by bullet speed
    direction.x *= 100;
    direction.y *= 100;
    
    // Set velocity
    bullet.body.velocity.x = direction.x;
    bullet.body.velocity.y = direction.y;
    
    // Set up the contact callbacks for when the bullet hits something
    bullet.body.setCategoryContactCallback(CATEGORY_WALL, bulletHitWall, this);
    bullet.body.setCategoryContactCallback(CATEGORY_ENEMY, bulletHitEnemy, this);
    bullet.body.setCategoryContactCallback(CATEGORY_PLAYER, bulletHitPlayer, this);
    
    sound_enemyFire.play();
    
    // Give the bullet sprite a tag, so we can identify it. This is needed
    // because we want to ignore bullets when checking line-of-sight between
    // the enemies and the enemy.
    bullet.tag = 123;
}

// body1 is the bullet, body2 is the wall
function bulletHitWall(body1, body2, fixture1, fixture2, begin) {
    
    if ( !begin ) {
        return;
    }
    
    // It is possible for the bullet to collide with more than one tile body 
    // in the same timestep, in which case this will run twice, so we need to
    // check if the sprite has already been destroyed.
    if (body1.sprite) {
        
        // Create a small explosion at the bullet location        
        var explosionAnimation = smallExplosions.getFirstExists(false);
        if (explosionAnimation) {
            explosionAnimation.reset(body1.x, body1.y);
            explosionAnimation.play('smallboom', 30, false, true);
        }
        
        body1.sprite.destroy();        
        sound_wallHit.play();
    }
    
}

// body1 is the bullet, body2 is the enemy
function bulletHitEnemy(body1, body2, fixture1, fixture2, begin) {
    
    if ( !begin ) {
        return;
    }
        
    // Reduce life of the enemy
    body2.sprite.life -= 1;
    
    // Check if enemy has been killed
    if ( body2.sprite.life <= 0 ) {       
        
        // Create a large explosion at the enemy location
        var explosionAnimation = largeExplosions.getFirstExists(false);
        if (explosionAnimation) {
            explosionAnimation.reset(body2.x, body2.y);
            explosionAnimation.play('bigboom', 30, false, true);
        }
        
        body2.sprite.destroy();
        sound_enemyHit.play();
    }
    
    // Also do the same as when bullet hits wall (small explosion, remove bullet)
    bulletHitWall(body1, body2, fixture1, fixture2, begin);
    
}

// body1 is the bullet, body2 is the player
function bulletHitPlayer(body1, body2, fixture1, fixture2, begin) {
    
    if ( !begin ) {
        return;
    }
        
    // Reduce life of the player
    body2.sprite.life -= 1;
    
    // Check if player has been killed
    if ( body2.sprite.life <= 0 ) {       
        
        // Create a large explosion at the player location
        var explosionAnimation = largeExplosions.getFirstExists(false);
        explosionAnimation.reset(body2.x, body2.y);
        explosionAnimation.play('bigboom', 30, false, true);
        
        body2.sprite.destroy();
        sound_wallHit.play();
        
        ship = null;
    }
    
    // Also do the same as when bullet hits wall (small explosion, remove bullet)
    bulletHitWall(body1, body2, fixture1, fixture2, begin);
    
}

function updateShip() {

    // Horizontal movement
    if (leftButton.isDown && !rightButton.isDown)
    {
        ship.body.applyForce( -1, 0 );
    }
    else if (!leftButton.isDown && rightButton.isDown)
    {
        ship.body.applyForce( 1, 0 );
    }
    
    // Vertical movement
    if (upButton.isDown && !downButton.isDown)
    {
        ship.body.applyForce( 0, -1 );
    }
    else if (!upButton.isDown && downButton.isDown)
    {
        ship.body.applyForce( 0, 1 );
    }

    // Rotate ship to mouse pointer
    var dx = (game.camera.x + game.input.mousePointer.x) - ship.x;
    var dy = (game.camera.y + game.input.mousePointer.y) - ship.y;
    ship.body.rotation = Math.atan2(dy,dx); // works in radians
    ship.body.angle += 90; // easier to do this in degrees
    
    // Check if a bullet should be spawned
    if (firing && game.time.now > fireTimeout)
    {
        playerFireBullet();
        fireTimeout = game.time.now + 125;
    }
    
}

function filterRaycastHitsIgnoreBullets(body, fixture, point, normal) {

    // Ignore bullets
	if ( body.sprite && body.sprite.tag && body.sprite.tag == 123 )
		return false;
	
	return true;
}

function updateEnemies() {
    
    for (var i = enemies.length - 1; i >= 0; i--) {
        var enemy = enemies[i];
        
        if ( enemy.life <= 0 ) {
            enemies.splice(i,1);
            console.log(enemies.length+" enemies remaining");
            continue;
        }
        
        var couldSeeBefore = enemy.seesPlayer;
        
        if ( ship ) {
            // Check if this enemy can see the ship. Do a raycast from the enemy to
            // the ship. If the enemy has line-of-sight to the ship, the ray will
            // hit the ship fixture. If not, it will hit something else instead.
            var raycastOutput = game.physics.box2d.raycast( enemy.x, enemy.y, ship.x, ship.y, true, filterRaycastHitsIgnoreBullets );
            if ( raycastOutput.length < 1 ) {
                // Should never happen for this case, but be sure to check this in your own game
                continue;
            }
            enemy.seesPlayer = raycastOutput[0].body == ship.body;
        }
        else {
            enemy.seesPlayer = false;
        }        
        
        var canSeeNow = enemy.seesPlayer;
        
        // Play a sound if the enemy has just sighted the ship, or just lost sight
        if (!couldSeeBefore && canSeeNow) {
            sound_gainedSight.play();
        }
        else if (couldSeeBefore && !canSeeNow) {
            sound_lostSight.play();
        }
        
        // If this enemy can't see the player, just do continuous scanning rotation
        if ( !enemy.seesPlayer ) {            
           enemy.body.angle += 1;
           continue;
        }
        
        // Find difference in angle between current direction and ship position
        var dx = ship.x - enemy.x;
        var dy = ship.y - enemy.y;
        var desiredAngle = Phaser.Math.radToDeg(Math.atan2(dy,dx)) + 180;
        var angleDelta = Phaser.Math.wrapAngle(desiredAngle - enemy.body.angle);
        
        // If current angle is nearly pointing at ship, fire
        if ( Math.abs(angleDelta) < 5 ) {
            if ( game.time.now > enemy.fireTimeout ) {
                enemyFireBullet(enemy);
                enemy.fireTimeout = game.time.now + 500;
            }
        }
        
        // Rotate enemy to ship, with maximum speed of 1 degree per step
        angleDelta = Phaser.Math.clamp(angleDelta, -1, 1);
        enemy.body.angle += angleDelta;
    }
}

function update() {
    
    if ( enemies.length > 0 ) {
        timeTaken += 1;
    }
    
    if ( ship ) {
        updateShip();
    }    
    updateEnemies();
    updateCaptions();
}

function debugLine(x1, y1, x2, y2) {
    game.debug.context.strokeStyle = 'rgba(255,0,0,0.75)';
	game.debug.context.beginPath();
	game.debug.context.moveTo(x1, y1);
	game.debug.context.lineTo(x2, y2);
	game.debug.context.stroke();
}

function render() {

    //game.debug.box2dWorld();

    // Render red lines for enemies that can see the player
    game.debug.start();
    if ( ship ) {        
        for (var i = 0; i < enemies.length; i++) {
            var enemy = enemies[i];
            if ( enemy.seesPlayer ) {
                debugLine(-game.camera.x + enemy.x, enemy.y, -game.camera.x + ship.x, ship.y);
            }
        }
    }
    game.debug.stop();

}
