
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

	game.load.image('a', 'assets/sprites/a.png');
	game.load.image('b', 'assets/sprites/b.png');

}

var codeCaption;
var spriteA;
var joint;
function create() {
	
	game.stage.backgroundColor = '#124184';

	// Enable Box2D physics
	game.physics.startSystem(Phaser.Physics.BOX2D);
	game.physics.box2d.debugDraw.joints = true;
	game.physics.box2d.gravity.y = 500;

    //A revolute joint with motor enabled
	{
		// Static box
		var spriteA = game.add.sprite(game.world.centerX, game.world.centerY, 'a');
		game.physics.box2d.enable(spriteA);
		spriteA.body.static = true;
		
		// Dynamic box
		var spriteB = game.add.sprite(game.world.centerX, game.world.centerY, 'b');
		game.physics.box2d.enable(spriteB);
		
		//bodyA, bodyB, ax, ay, bx, by, motorSpeed, motorTorque, motorEnabled, lowerLimit, upperLimit, limitEnabled
		joint = game.physics.box2d.revoluteJoint(spriteA, spriteB, 0, 0, 0, 0, 360, 10, true); 
		
	}
    
	// Set up handlers for mouse events
	game.input.onDown.add(mouseDragStart, this);
	game.input.addMoveCallback(mouseDragMove, this);
	game.input.onUp.add(mouseDragEnd, this);
	
	game.add.text(5, 5, 'A basic revolute joint, Click to begin. Press the Up and Down keys to change motor speed', { fill: '#ffffff', font: '14pt Arial' });

    codeCaption = game.add.text(5, 30, '', { fill: '#ccffcc', font: '14pt Arial' });
	
	// Start paused so user can see how the joints start out
	game.paused = true;
	game.input.onDown.add(function(){game.paused = false;}, this);
    
    
    cursors = game.input.keyboard.createCursorKeys();

}

var pressed;
function update() {

    //increase motor speed when up is pressed
    if (cursors.up.isDown)
    {
        if (!pressed) {
            joint.SetMotorSpeed(Math.floor(joint.GetMotorSpeed() + 1));
            pressed = true;
        }
    }
    //decrease motor speed when down is pressed
    else if (cursors.down.isDown)
    {
        if (!pressed) {
    	    joint.SetMotorSpeed(Math.floor(joint.GetMotorSpeed() - 1));
            pressed = true;
        }
    } else {
        pressed = false;
    }
    
    codeCaption.text = 'Motor Speed: ' + joint.GetMotorSpeed();

}


function mouseDragStart() { game.physics.box2d.mouseDragStart(game.input.mousePointer); }
function mouseDragMove() {  game.physics.box2d.mouseDragMove(game.input.mousePointer); }
function mouseDragEnd() {   game.physics.box2d.mouseDragEnd(); }


function render() {
	
	// update will not be called while paused, but we want to change the caption on mouse-over
	if ( game.paused ) {
		update();
	}
	
	game.debug.box2dWorld();
	
}