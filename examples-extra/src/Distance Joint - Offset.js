
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

	game.load.image('a', 'assets/sprites/a.png');
	game.load.image('b', 'assets/sprites/b.png');

}

var codeCaption;
var spriteA;

function create() {
	
	game.stage.backgroundColor = '#124184';

	// Enable Box2D physics
	game.physics.startSystem(Phaser.Physics.BOX2D);
	game.physics.box2d.debugDraw.joints = true;
	game.physics.box2d.gravity.y = 500;

	// Distance joint with distance and offset specified. Joint is 200px long regardless of the starting points of the bodies and
    // the joint starts at the bottom center of spriteA and connects to spriteB in the top left corner
	{
		// Static box
		spriteA = game.add.sprite(game.world.centerX, 200, 'a');
		game.physics.box2d.enable(spriteA);
		spriteA.body.static = true;
		
		// Dynamic box
		var spriteB = game.add.sprite(game.world.centerX + 100, 400, 'b');
		game.physics.box2d.enable(spriteB);
		
		//bodyA, bodyB, length, ax, ay, bx, by, frequency, damping
		game.physics.box2d.distanceJoint(spriteA, spriteB, 200, 0, 50, -spriteB.width / 2, -spriteB.height / 2); 
		
	}
	
	

	// Set up handlers for mouse events
	game.input.onDown.add(mouseDragStart, this);
	game.input.addMoveCallback(mouseDragMove, this);
	game.input.onUp.add(mouseDragEnd, this);
	
	game.add.text(5, 5, 'Distance joint - Click to start. Mouse over bodyA to see the code used to create the joint', { fill: '#ffffff', font: '14pt Arial' });
	codeCaption = game.add.text(5, 30, 'Parameters: bodyA, bodyB, length, ax, ay, bx, by, frequency, damping', { fill: '#dddddd', font: '10pt Arial' });
	codeCaption = game.add.text(5, 50, '', { fill: '#ccffcc', font: '13pt Arial' });
	
	// Start paused so user can see how the joints start out
	game.paused = true;
	game.input.onDown.add(function(){game.paused = false;}, this);
}

function mouseDragStart() { game.physics.box2d.mouseDragStart(game.input.mousePointer); }
function mouseDragMove() {  game.physics.box2d.mouseDragMove(game.input.mousePointer); }
function mouseDragEnd() {   game.physics.box2d.mouseDragEnd(); }

function update() {
	
	if ( spriteA.body.containsPoint(game.input.mousePointer) ) {
		codeCaption.text = 'game.physics.box2d.distanceJoint(spriteA, spriteB, 200, 0, 50, -spriteB.width / 2, -spriteB.height / 2);';
	} else {
        codeCaption.text = '';
    }
	
}

function render() {
	
	// update will not be called while paused, but we want to change the caption on mouse-over
	if ( game.paused ) {
		update();
	}
	
	game.debug.box2dWorld();
	
}