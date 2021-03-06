var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, render: render });


function preload() {
    game.load.image('tetris', 'assets/sprites/tetrisblock3.png');
}

//vertices to define an irregular polygon shape. in x1,y1,x2,y2,x3,y3,... format. Points are relative to center of body
var polygonVertices = [-25,-50, -50,-25, -50,25, 50,25, 50,-25, 25,-50, 0,-125];

//vertices to define tetris piece shape
var tetrisVertices = [24,-48, 24,0, -72,0, -72,48, 72,48, 72,-48];
function create() {
	
	game.stage.backgroundColor = '#124184';

	// Enable Box2D physics
	game.physics.startSystem(Phaser.Physics.BOX2D);
    
	game.physics.box2d.gravity.y = 500;
    game.physics.box2d.setBoundsToWorld();
    game.physics.box2d.restitution = 0.6;
    
    //create an irregular polygon using all the vertices in polygonVertices
    var polygonBody = new Phaser.Physics.Box2D.Body(this.game, null, 0, 1);
	polygonBody.setPolygon(polygonVertices);
    polygonBody.x = game.world.centerX - 150;
    polygonBody.y = game.world.centerY;
    
    //create a hexagon shaped body using vertices 0 through 6
    var hexagonBody = new Phaser.Physics.Box2D.Body(this.game, null, 0, 1);
	hexagonBody.setPolygon(polygonVertices, 0, 6);
    hexagonBody.x = game.world.centerX;
    hexagonBody.y = game.world.centerY;
    
    //create a tetris piece sprite with a box2d body, then set the body shape to a polygon defined by tetrisVertices
    var tetrisPiece = game.add.sprite(game.world.centerX, game.world.centerY - 200, 'tetris');
    game.physics.box2d.enable(tetrisPiece);
    tetrisPiece.body.setPolygon(tetrisVertices);
    
    
    //create a triangle body for the floor
    var triangleBody = new Phaser.Physics.Box2D.Body(this.game, null, 0, 1);
    triangleBody.setPolygon([-300,-200, -300,0, 300,0]);
    triangleBody.x = game.world.centerX;
    triangleBody.y = 600;
    
    
}

function render() {
	
	game.debug.box2dWorld();
	
}
