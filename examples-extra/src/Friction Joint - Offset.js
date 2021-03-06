
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, render: render });

function preload() {
    game.load.image('a', 'assets/sprites/a.png');
	game.load.image('b', 'assets/sprites/b.png');
}


function create() {
	
	game.stage.backgroundColor = '#124184';

	// Enable Box2D physics
	game.physics.startSystem(Phaser.Physics.BOX2D);
    
    game.physics.box2d.setBoundsToWorld();
    game.physics.box2d.debugDraw.joints = true;
    
    game.physics.box2d.restitution = 0.5;
    

    
    // Static box
	var spriteA = game.add.sprite(game.world.centerX, game.world.centerY, 'a');
	game.physics.box2d.enable(spriteA);
	spriteA.body.static = true;
		
	// Dynamic box
	var spriteB = game.add.sprite(game.world.centerX, game.world.centerY, 'b');
	game.physics.box2d.enable(spriteB);
		
	// bodyA, bodyB, maxForce, maxTorque, ax, ay, bx, by
	game.physics.box2d.frictionJoint(spriteA, spriteB, 50, 50, 0, -spriteA.height / 2, 100, 0);
		
    
    
    //Text to tell user how to use this example
    game.add.text(5, 10, 'Friction Joint - Angular and linear friction with offset anchor points', { fill: '#ffffff', font: '13pt Arial' });
    game.add.text(5, 30, 'Use the mouse to grab Box B and throw it around to see the effect of the friction joint', { fill: '#ffffff', font: '13pt Arial' });

    
    
    //input callbacks to keep track of mouse drags
    game.input.onDown.add(mouseDragStart, this);
	game.input.addMoveCallback(mouseDragMove, this);
	game.input.onUp.add(mouseDragEnd, this);
    
}

function mouseDragStart() { game.physics.box2d.mouseDragStart(game.input.mousePointer); }
function mouseDragMove() {  game.physics.box2d.mouseDragMove(game.input.mousePointer); }
function mouseDragEnd() {   game.physics.box2d.mouseDragEnd(); }




function render() {
	
	game.debug.box2dWorld();
	
}









