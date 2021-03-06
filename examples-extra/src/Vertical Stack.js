
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { create: create, render: render });

var cannonBody;

function create() {
	
	game.stage.backgroundColor = '#124184';

	game.physics.startSystem(Phaser.Physics.BOX2D);
    
	game.physics.box2d.gravity.y = 500;
    game.physics.box2d.setBoundsToWorld();
    game.physics.box2d.restitution = 0.5;
    
    var row1 = [];

    for (var i = 0; i < 12; i++) {
        row1[i] = new Phaser.Physics.Box2D.Body(this.game, null, 300, 600 - i * 28, 0);
        row1[i].setRectangle(30, 25, 0, 0, 0);
    }
    
    var row2 = [];

    for (var i = 0; i < 12; i++) {
        row2[i] = new Phaser.Physics.Box2D.Body(this.game, null, 400, 600 - i * 28, 2);
        row2[i].setRectangle(30, 25, 0, 0, 0);
    }
    
    var row3 = [];

    for (var i = 0; i < 12; i++) {
        row3[i] = new Phaser.Physics.Box2D.Body(this.game, null, 500, 600 - i * 28, 2);
        row3[i].setRectangle(30, 25, 0, 0, 0);
    }
    
    var row4 = [];

    for (var i = 0; i < 12; i++) {
        row4[i] = new Phaser.Physics.Box2D.Body(this.game, null, 600, 600 - i * 28, 2);
        row4[i].setRectangle(30, 25, 0, 0, 0);
    }
    
    var row5 = [];

    for (var i = 0; i < 12; i++) {
        row5[i] = new Phaser.Physics.Box2D.Body(this.game, null, 700, 600 - i * 28, 0);
        row5[i].setRectangle(30, 25, 0, 0, 0);
    }
    
    //'cannon' body to launch projectile from
    cannonBody = new Phaser.Physics.Box2D.Body(this.game, null, 0, 1);
    cannonBody.setPolygon([0,-20, -10,-15, -15,0, -10,15, 0,20, 35,12, 35,-12]);
    cannonBody.x = 20;
    cannonBody.y = 400;
    cannonBody.static = true;
    
    game.input.onDown.add(worldClick, this);
    
    game.add.text(5, 5, 'Click anywhere on the screen to launch a projectile', { fill: '#ffffff', font: '14pt Arial' });
    
}

function worldClick(pointer) {

    var projectile = new Phaser.Physics.Box2D.Body(this.game, null, cannonBody.x + 20, cannonBody.y);
    projectile.setCircle(12);
    projectile.applyForce(pointer.x - cannonBody.x, pointer.y - cannonBody.y);
    projectile.bullet = true;

}

function render() {
	
	game.debug.box2dWorld();
	
}
