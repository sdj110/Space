

import { Star } from "./star.js";

// get main canvas/context
var Context = 
{
	canvas : null,
	context : null,
	create: function(canvas_tag_id)
	{
		this.canvas = document.getElementById(canvas_tag_id);
		this.context = this.canvas.getContext('2d');
		this.canvas.width  = window.innerWidth - 20;
		this.canvas.height = window.innerHeight - 50;
		
		// set default text
		this.context.font = "16px Arial";
		
		// return struct
		return this.context;
	},
	
	// Resize window
	resize: function()
	{
		this.canvas.width  = window.innerWidth - 20;
		this.canvas.height = window.innerHeight - 50;		
	}
	
};





class Vector2
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}
}



//
//
//
// collision rect
class CollisionRect
{
	// Constructor
	constructor(x, y)
	{
		// set dimensions
		this.x = x;
		this.y = y;
		this.width = 0;
		this.height = 0;
		
		// each vertex
		this.pointA = [];
		this.pointB = [];
		this.pointC = [];
		this.pointD = [];
		
	}
	
	
	
	init(width, height)
	{
		// set dimension of collision rect
		this.width = width;
		this.height = height;
		
		// init each vertice
		this.pointA = [this.x, this.y];
		this.pointB = [this.x + this.width, this.y];
		this.pointC = [this.x, this.y + this.height];
		this.pointD = [this.x + this.width, this.y + this.height];
	}
	

	
	// move rect with object
	update(x, y)
	{
		// set x and y to object
		this.x = x;
		this.y = y;
		
		// update 4 verticies of Collision Rectangle
		this.pointA = [this.x, this.y];
		this.pointB = [this.x + this.width, this.y];
		this.pointC = [this.x, this.y + this.height];
		this.pointD = [this.x + this.width, this.y + this.height];

	}
	
	
	
	// draw collision rect
	draw()
	{
		// Make rect transparent
		Context.context.globalAlpha = 0.2;
		Context.context.fillStyle = "#FFFFFF";
		Context.context.fillRect(this.x, this.y, this.width, this.height);
		Context.context.globalAlpha = 1.0;
	}
	
	
	
	// check for collision with another rect
	checkCollision(rect2)
	{
		// top left corner
		if (this.pointA[0] > rect2.pointA[0] &&
			this.pointA[0] < rect2.pointD[0] &&
			this.pointA[1] > rect2.pointA[1] &&
			this.pointA[1] < rect2.pointD[1])
		{
			return true;
		}
		
		// top right
		if (this.pointB[0] > rect2.pointA[0] &&
			this.pointB[0] < rect2.pointD[0] &&
			this.pointB[1] > rect2.pointA[1] &&
			this.pointB[1] < rect2.pointD[1])
		{
			return true;
		}
		
		// bottom left
		if (this.pointC[0] > rect2.pointA[0] &&
			this.pointC[0] < rect2.pointD[0] &&
			this.pointC[1] > rect2.pointA[1] &&
			this.pointC[1] < rect2.pointD[1])
		{
			return true;
		}
		
		// bottom right
		if (this.pointD[0] > rect2.pointA[0] &&
			this.pointD[0] < rect2.pointD[0] && 
			this.pointD[1] > rect2.pointA[1] && 
			this.pointD[1] < rect2.pointD[1])
		{
			return true;
		}
		
		// no collision
		return false;
		
	}
}






















//
//
//
// Sprite class
class Sprite
{
	//constructor
	constructor(filename, is_pattern)
	{
		this.image = null;
		this.pattern = null;
		this.TO_DEG = Math.PI/180;
		
		// Error check file name
		if (filename != undefined && filename != "" && filename != null)
		{
			this.image = new Image();
			this.image.src = filename;
			
			if (is_pattern)
			{
				this.pattern = Context.context.createPattern(this.image, 'repeat');
			}
		}
		else
		{
			console.log("Unable to load Sprite from filepath");
		}
	}
	
	
	
	// get image width
	getWidth()
	{
		return this.image.width;
	}
	
	
	
	// get image height
	getHeight()
	{
		return this.image.height;
	}
	
	
	// draw sprite
	draw(x, y, w, h)
	{
		// is pattern
		if (this.pattern != null)
		{
			Context.context.fillStyle = this.pattern;
			Context.context.fillRect(x ,y, w, h);
		}
		else
		{
			// Image (not pattern)
			if (w != undefined || h != undefined)
			{
				Context.context.drawImage(this.image, x, y, 
											this.image.width,
											this.image.height);
			}
			else
			{
				// strectch picture
				Context.context.drawImage(this.image, x, y, w, h);
				
			}
		}
	}
	
	// draw expanding image
	expand(x, y, w, h)
	{
		// draw image
		Context.context.drawImage(this.image, x, y, w, h);
	}
	
	
	// draw rotation
	rotate(x, y, angle)
	{
		// save context before drawing new frame
		Context.context.save();
		Context.context.translate(x, y);
		Context.context.rotate(angle * this.TO_DEG);
		
		// draw image
		Context.context.drawImage(this.image,
								-(this.image.width/2), 
								-(this.image.height / 2));
		
		// restore canvas before rotation
		Context.context.restore();
	}
	
// END OF SPRITE
}





















//
//
//
// ENEMY CLASS
class Enemy
{
	// Enemy Class Constructor
	constructor(filepath, x, y)
	{
		// set coords
		this.x = x;
		this.y = y;
		this.width = 0;
		this.height = 0;
		this.angle = 0;
		
		// enemy properties
		this.health = 100;
		this.vel = 20;
		
		//health bar coords and dimensions
		this.barX1 = 0;
		this.barY1 = 0;
		this.bar1Width = 0;
		
		this.barX2 = 0;
		this.barY2 = 0;
		this.bar2Width = 0;
		
		this.barHeight = 0;
		
		// check if hit by laser
		this.hitByLaser = false;
		
		// create image
		this.image = new Sprite(filepath, false);
		
		// create collision rect
		this.rect = new CollisionRect(this.x, this.y);
		
		// init enemy
		this.init();
	}
	
	// init enemy
	init()
	{
		this.rect.init(this.image.getWidth(), this.image.getHeight());
		
		//set dimensions
		this.width = this.image.getWidth();
		this.height = this.image.getHeight();

		// set health bar dimension
		this.bar1Width = this.health;
		this.bar2Width = this.health;
		this.barHeight = 10;
	}
	
	// draw sprite to canvas
	draw()
	{
		// draw player sprite on canvas
		this.image.rotate(this.x, this.y, this.angle);
		
		// Draw health bar
		if (this.hitByLaser == true)
		{
			this.drawHealthBar();
		}
		
		// draw rect
		this.rect.draw();
		
		// update enemy 
		this.update();
	}
	
		// create health bar
	createHealthBar()
	{

		// set green health bar coords
		this.barX1 = (this.x - this.image.getWidth() / 2) - 10;
		this.barY1 = (this.y - this.image.getHeight() / 2) - 10;
		// set red background
		this.barX2 = this.barX1;
		this.barY2 = this.barY1;
		
		// set bar 1 to health level
		this.bar1Width = this.health;
		
		// set context style and fillRect for background bar
		Context.context.fillStyle = "#FF0000";
		Context.context.fillRect(this.barX2, this.barY2, this.bar2Width , this.barHeight);
		
		// set context style and fillRect for green bar
		Context.context.fillStyle = "#00FF00";
		Context.context.fillRect(this.barX1, this.barY1, this.bar1Width, this.barHeight);
		
	}
	
	// draw player health bar
	drawHealthBar()
	{
		this.createHealthBar();
		
		Context.context.fillStyle = "#FFFFFF";
		Context.context.fillText("Health", this.barX1 + 5, this.barY1 + 17);
	}
	
	
	// enemy hit with laser takes dmg
	takeDamage(laserDmg)
	{
		// hit by laser
		this.hitByLaser = true;
		
		// lower health
		this.health -= laserDmg;
		
	}
	
	
	
	// handle all enemy logic
	update()
	{
		// update x and y values
		this.x += this.xVel;
		this.y += this.yVel;
		this.angle += this.rotate;
		
		// update collision rect
		this.rect.update(this.x - this.rect.width / 2, this.y - this.rect.height / 2);
	}
	
	
	
}
























//
//
//
// METEOR CLASS
class Meteor
{
	// meteor class constructor
	constructor(x, y, type)
	{
		// Meteor dimensions
		this.x = x;
		this.y = y;
		
		this.width = 0;
		this.height = 0;
		
		this.angle = 0;
		this.rotate = 0;
		
		// determines sprite/level of meteor
		this.type = type;
		this.name = "UNKNOWN";
		
		// meteors total health
		this.health = 0;
		
		// health bar coords
		this.barX1 = 0;
		this.barY1 = 0;
		this.barX2 = 0;
		this.barY2 = 0;
		
		// health bar dimensions
		this.bar1Width = 0;
		this.bar2Width = 0;
		this.barHeight = 10;
		
		// change trajectory of meteor
		this.xVel = 0;
		this.yVel = 0;
		
		// true if hit by laser
		this.hitByLaser = false;
				
		// list of file names
		this.filenames = 
		[
			// BIGBROWN [0 - 3]
			"Sprites/Meteors/meteorBrown_big1.png", //0
			"Sprites/Meteors/meteorBrown_big2.png", //1
			"Sprites/Meteors/meteorBrown_big3.png", //2
			"Sprites/Meteors/meteorBrown_big4.png", //3
			
			// BIGGREY [4 -7]
			"Sprites/Meteors/meteorGrey_big1.png", //4
			"Sprites/Meteors/meteorGrey_big2.png", //5
			"Sprites/Meteors/meteorGrey_big3.png", //6
			"Sprites/Meteors/meteorGrey_big4.png", //7
			
			// MEDBROWN [8 - 9 ]
			"Sprites/Meteors/meteorGrey_med1.png", //8
			"Sprites/Meteors/meteorGrey_med2.png", //9
			
			// MEDGREY [10 - 11]
			"Sprites/Meteors/meteorBrown_med1.png", //10
			"Sprites/Meteors/meteorBrown_med2.png", //11
			
			// SMALLBROWN [12 - 13]
			"Sprites/Meteors/meteorBrown_small1.png", //12
			"Sprites/Meteors/meteorBrown_small2.png", //13
			
			// SMALLGREY [14 - 15]
			"Sprites/Meteors/meteorGrey_small1.png", //14
			"Sprites/Meteors/meteorGrey_small2.png", //15			
			
			// TINYBROWN [16 - 17]
			"Sprites/Meteors/meteorBrown_tiny1.png", //16
			"Sprites/Meteors/meteorBrown_tiny2.png", //17
			
			// TINYGREY [18 - 19]
			"Sprites/Meteors/meteorGrey_tiny1.png", //18
			"Sprites/Meteors/meteorGrey_tiny2.png" //19

		];
		
		
		// set initial trajectory and rotation
		this.xVel = (Math.random() * 10) - 5;
		this.yVel = (Math.random() * 10) - 5;
		this.rotate = (Math.random() * 10) - 5;
		
		// create Sprite
		this.image = new Sprite(this.filenames[this.type], false);
		
		// create collision rect
		this.rect = new CollisionRect(this.x, this.y);
		
		// explosion sound
		this.snd = new Audio("Sprites/Sounds/explosion1.wav"); 
		
		// init meteor
		this.init();
		
	}
	
	
	// init dimensions and rect
	init()
	{
		//set dimensions
		this.width = this.image.getWidth();
		this.height = this.image.getHeight();

		
		// init Meteor based on type
		this.initType();
		
		// set health bar dimension
		this.bar1Width = this.health;
		this.bar2Width = this.health;
		this.barHeight = 10;
	}
	
	// set meteors health based on type
	initType()
	{
		// check what meteor's type is
		// set collision rect and health based on type
		// if big
		if (this.type >= 0 && this.type <= 7)
		{
			this.rect.init(60, 60);
			this.health = 100;
			
			// check color
			if (this.type >= 0 && this.type <= 3)
				this.name = "BIGBROWN";
			else
			{
				this.name = "BIGGREY";
			}
		}
		
		// if med
		else if (this.type >= 8 && this.type <= 11)
		{
			this.rect.init(40, 40);
			this.health = 75;
			
			// check color
			if (this.type == 8 || this.type == 9)
			{
				this.name = "MEDBROWN";
			}
			else
			{
				this.name = "MEDGREY";
			}
		}
		
		// if small
		else if (this.type >= 12 && this.type <= 15)
		{
			this.rect.init(20, 20);
			this.health = 30;
			
			// check color
			if (this.type == 12 || this.type == 13)
			{
				this.name = "SMALLBROWN";
			}
			else
			{
				this.name = "SMALLGREY";
			}
			
		}
		
		// if tiny
		else if (this.type >= 16 && this.type <= 19)
		{
			this.rect.init(15, 15);
			this.health = 10;
			
			//check color
			if (this.type == 16 || this.type == 17)
			{
				this.name = "TINYBROWN";
			}
			else
			{
				this.name = "TINYGREY";
			}
			
		}
		
		// unknown type error
		else
		{
			console.log("Unknown Meteor type: ", this.type);
		}
		
	}
	
	// create health bar
	createHealthBar()
	{

		// set green health bar coords
		this.barX1 = (this.x - this.image.getWidth() / 2) - 10;
		this.barY1 = (this.y - this.image.getHeight() / 2) - 10;
		// set red background
		this.barX2 = this.barX1;
		this.barY2 = this.barY1;
		
		// set bar 1 to health level
		this.bar1Width = this.health;
		
		// set context style and fillRect for background bar
		Context.context.fillStyle = "#FF0000";
		Context.context.fillRect(this.barX2, this.barY2, this.bar2Width , this.barHeight);
		
		// set context style and fillRect for green bar
		Context.context.fillStyle = "#00FF00";
		Context.context.fillRect(this.barX1, this.barY1, this.bar1Width, this.barHeight);
		
	}
	
	
	
	// draw player health bar
	drawHealthBar()
	{
		this.createHealthBar();
		
		Context.context.fillStyle = "#FFFFFF";
		Context.context.fillText("Health", this.barX1 + 5, this.barY1 + 17);
	}
	
	
	
	// draw sprite to canvas
	draw()
	{
		// draw player sprite on canvas
		this.image.rotate(this.x, this.y, this.angle);
		
		// draw rect
		//this.rect.draw();
		
		// Draw health bar
		if (this.hitByLaser == true)
		{
			this.drawHealthBar();
		}
	}
	
	
	
	// handle all meteor logic
	update()
	{
		// update x and y values
		this.x += this.xVel;
		this.y += this.yVel;
		this.angle += this.rotate;
		
		// update collision rect
		this.rect.update(this.x - this.rect.width / 2, this.y - this.rect.height / 2);
	}
	
	
	
	// meteor hit with laser takes dmg
	takeDamage(meteorList, meteor, laserDmg, upgradeList)
	{
		// hit by laser
		this.hitByLaser = true;
		
		// lower health
		this.health -= laserDmg;
		
		// check if destroyed
		this.checkIfDestroyed(meteorList, meteor, upgradeList);
	}
	
	
	
	// check if destroyed
	checkIfDestroyed(meteorList, meteor, upgradeList)
	{
		// if the Meteor's health reaches 0
		if (this.health <= 0)
		{
			// remove meteor from the list
			meteorList.splice(meteorList.indexOf(meteor), 1);
			
			// break into new meteors
			this.breakApart(meteorList, meteor);
			
			// generate new upgrade
			this.generateUpgrade(upgradeList, meteor);
			
			// play sound
			//this.snd.play();
		}
		
	}
	
	// generate new upgrade
	generateUpgrade(upgradeList, meteor)
	{
		var rand = Math.random() * 10;
		var randType = Math.random() * (3);
		var randType = Math.random() * (3);
		
		
		if (rand >= 0 && rand <= 5)
		{
			upgradeList.push(new Upgrade(meteor.x, meteor.y, Math.floor(randType)));
		}

	}
	
	
	
	// check if meteor is outside level
	generateNewPosition(meteorList, meteor, maxX, maxY)
	{
		
		if (this.x < maxX - meteor.image.getWidth() ||
			this.y < maxY - meteor.image.getWidth() ||
			this.x > window.innerWidth ||
			this.y > window.innerHeight)
		{
			// remove out of bounds meteor
			meteorList.splice(meteorList.indexOf(meteor), 1);
			
			// generate random numbers
			var randX = (Math.random() * -(self.levelX - Context.canvas.width)) + (self.levelX + Context.canvas.width/4) - 100;
			var randY = (Math.random() * -(self.levelY - Context.canvas.height)) + (self.levelY + Context.canvas.height / 4) - 100;
			var randType = Math.floor(Math.random() * 19);
			
			// create new meteor
			meteorList.push(new Meteor(randX, randY, randType));
			//meteorList[meteorList.length - 1].init();
		}
		
	}
	
	
	
	// break into pieces
	breakApart(meteorList, meteor)
	{
		if (this.name == "BIGBROWN")
		{
			for (var i = 0; i < 4; i++)
			{
				// random number
				var randomType = Math.floor(Math.random() * (12 - 10) + 10);
				
				meteorList.push(new Meteor(meteor.x, meteor.y, randomType));
			}
		}
		
		else if (this.name == "BIGGREY")
		{
			for (var i = 0; i < 4; i++)
			{
				// random number
				var randomType = Math.floor(Math.random() * (10 - 8) + 8);
				
				meteorList.push(new Meteor(meteor.x, meteor.y, randomType));
			}
		}
		
		else if (this.name == "MEDBROWN")
		{
			for (var i = 0; i < 2; i++)
			{
				// random number
				var randomType = Math.floor(Math.random() * (16 - 14) + 14);
				
				meteorList.push(new Meteor(meteor.x, meteor.y, randomType));
			}
		}
		
		else if (this.name == "MEDGREY")
		{
			for (var i = 0; i < 2; i++)
			{
				// random number
				var randomType = Math.floor(Math.random() * (14 - 12) + 12);
				
				meteorList.push(new Meteor(meteor.x, meteor.y, randomType));
			}
		}
		
		
		else
		{

		}
	}
	
// END OF METEOR CLASS
}

















//
//
//
// UPGRADE Class
class Upgrade
{
	// Upgrade class constructor
	constructor(x, y, type)
	{
		// set position
		this.x = x;
		this.y = y;
		
		// set type
		this.type = type;
		this.filenames = 
		[
			"Sprites/Upgrades/powerupGreen_bolt.png",
			"Sprites/Upgrades/powerupBlue_shield.png",
			"Sprites/Upgrades/powerupRed_star.png"
		];
		
		// set up sprite
		this.image = new Sprite(this.filenames[this.type], false);
		
		// create collision rect
		this.rect = new CollisionRect(this.x, this.y);
		this.rect.init(32, 32);
		
		// upgrade sound
		this.snd = new Audio("Sprites/Sounds/upgrade1.wav");
		
		
	}
	
	// draw upgrade
	draw()
	{	
		// draw sprite
		this.image.draw(this.x, this.y, 32, 32);
		
		// draw collison rect
		//this.rect.draw();
	}
	
	// play sound when picked up
	playSound()
	{
		// play sound
		//this.snd.play();
	}
	
	
	update()
	{
		// update collision rect
		this.rect.update(this.x, this.y);
	}
	

//END OF UPGRADE CLASS	
}



















//
//
//
// LASER CLASS
class Laser
{
	// Laser Constructor
	constructor(x, y, angle, filepath, soundFilepath)
	{
		// Laser dimensions
		this.x = x;
		this.y = y;
		this.width = 7;
		this.height = 7;
		
		//angle of direction
		this.angle = angle;
		
		// check if bomb
		this.isBomb = false;
		
		// set rotation
		this.rotate = 0;
		
		// laser speed
		this.vel = 50;
		
		// lifespan of laser
		this.life = 0;
		
		// laser's damage
		this.laserDmg = 20;
		
		// how long laser has existed
		this.timer = 0;
		
		// laser sound file
		this.snd = new Audio(soundFilepath); 

		
		// create Sprite
		this.image = new Sprite(filepath, false);
		
		// create collision rect
		this.rect = new CollisionRect(this.x, this.y);
		this.rect.init(this.width, this.height);

	}
	
	// play laser sound
	playSound()
	{
		this.snd.play();
	}
	
	// Draw laser
	draw()
	{
		// check if want to draw bomb
		if (this.isBomb == true)
		{
			
		}
		// is laser not bomb
		else 
		{
			// draw Laser at player sprite on canvas
			this.image.rotate(this.x, this.y, this.angle);	
		}

		// show collision rect
		this.rect.draw();
	}
	
	
	// init laser
	init(vel, damage, width, height, rotate, life = 1, bomb = false)
	{
		// set properties
		this.vel = vel;
		this.laserDmg = damage;
		this.rect.init(width, height);
		this.rotate = rotate;
		this.life = life;
		this.isBomb = bomb;
	}
	
	
	
	// Handle all laser logic
	update(laserList)
	{
		// move laser on canvas
		this.x += this.vel * Math.cos(this.angle * Math.PI / 180);
		this.y += this.vel * Math.sin(this.angle * Math.PI / 180);
		
		// will rotate image
		this.angle += this.rotate;
		
		//update collision rect
		this.rect.update(this.x - this.rect.width / 2, this.y - this.rect.height / 2);
		
		// update timer
		this.timer += 1/30;
		
		// check Timer
		this.checkTimer(laserList);
		

	}
	
	
	// check laser timer
	checkTimer(laserList)
	{
		// loop through list and check each timer
		for (var i = 0; i < laserList.length; i++)
		{
			if (laserList[i].timer > this.life)
			{
				// remove laser from list
				laserList.pop();
			}
		}
		
	}
	
	// check if laser hits a target
	checkForHit(meteorList, laserList, laser, player, upgradeList)
	{
		for (var i = 0; i < meteorList.length; i++)
		{
			// check for any collision
			if (this.rect.checkCollision(meteorList[i].rect) || meteorList[i].rect.checkCollision(this.rect))
			{
				// laser is removed
				laserList.splice(laserList.indexOf(laser), 1);
			
				// meteor takes damage
				meteorList[i].takeDamage(meteorList, meteorList[i], laser.laserDmg, upgradeList);
				
				// player gets score
				player.score += 3;
				
				return true;
			}
		}
	}
}



















//
//
//
// Main Player
class Player
{
	// Player constructor
	constructor(x, y, filepath)
	{
		// Initialize player dimensions
		this.x = x;
		this.y = y;
		this.width = 0;
		this.height = 0;
		this.angle = 0;
		
		//determine upgrade level of laser
		this.level = 0;
		
		// number of bombs
		this.bomb = 0;
		
		// has shield?
		this.shield = true;
		this.shieldHealth = 100;
			
		// Other player properties
		// player health
		this.health = 100;
		
		// laser energy
		this.energy = 100;
		
		// get game timer
		this.gameTimer = 0;
		
		// player score
		this.score = 0;

		// health bar coords
		this.barX = 0;
		this.barY = 0;
		
		this.eBarX = 0;
		this.eBarY = 0;
		
		// player velocity
		this.vel = 30;
		
		// get sprite
		this.image = new Sprite(filepath, false);
		
		// shield sprite
		this.shieldImage1 = new Sprite("Sprites/Effects/shield3.png", false);
		this.shieldImage2 = new Sprite("Sprites/Effects/shield2.png", false);
		this.shieldImage3 = new Sprite("Sprites/Effects/shield1.png", false);
		
		// bomb sprite
		this.bombToken = new Sprite("Sprites/Upgrades/powerupRed_star.png", false);
		
		// create collision rect
		this.rect = new CollisionRect(this.x, this.y);

		// holds all fired shots
		this.laserList = [];
	}
	
	
	
	// init player dimension and collision box
	init()
	{
		//set dimensions
		this.width = this.image.getWidth();
		this.height = this.image.getHeight();

		// tune rect to sprite
		this.rect.init(this.width - 10, this.height - 20);
	}
	
	
	
	//Draw player to screen
	draw(camX, camY)
	{
		// draw player sprite on canvas
		this.image.rotate(this.x, this.y, this.angle);
		
		// show shield
		this.drawShield();
		
		// draw health bar on canvas
		this.drawHealthBar(camX, camY);
		
		// show score
		this.showScore();
		
		// show number of bombs owned
		this.drawBombTokens(camX, camY);
		
		// show collision rect
		//this.rect.draw();
	}
	
	// shows how many bombs player has
	drawBombTokens(camX, camY)
	{
		// check how many bombs owned
		
		for (var i = 0; i < this.bomb; i++)
		{
			this.bombToken.draw(-camX + (i * this.bombToken.getWidth()) + 10,  -camY + window.innerHeight - 100, false);
			
		}
	}
	
	// draw player shield
	drawShield()
	{
		if (this.shield)
		{
			// shield phase 1
			if (this.shieldHealth >= 67)
			{
				this.shieldImage1.rotate(this.x, this.y, this.angle + 90);
			}
			// shield phase 1
			else if (this.shieldHealth <= 66 && this.shieldHealth >= 34)
			{
				this.shieldImage2.rotate(this.x, this.y, this.angle + 90);
			}
			// shield phase 1
			else if (this.shieldHealth <= 33 && this.shieldHealth > 0)
			{
				this.shieldImage2.rotate(this.x, this.y, this.angle + 90);
			}
			// shield destroyed
			else if ( this.shieldHealth <= 0)
			{
				this.shield = false;
			}
		}
		else
		{
			// do not show shield
		}
	}
	
	// player take damage
	takeDamage()
	{
		
		// check if player has shield
		if (this.shield)
		{
			// lower shield health
			if (this.shieldHealth > 0)
			{
				this.shieldHealth -= 2;
			}
		}
		// player doesn't have shield
		else 
		{
			if (this.health > 0)
			{
				this.health -= 1;
			}
		}
		
		
	}
	
	// fire weapon
	fireLaser()
	{
		if (this.energy - 3 > 0)
		{
			// check laser gun upgrade
			if (this.level == 0)
			{
				// create new laser single laser shot
				this.laserList.push(new Laser(this.x, this.y, this.angle, "Sprites/Lasers/laserRed03.png", "Sprites/Sounds/laser1.wav"));
				this.laserList[this.laserList.length - 1].init(30, 5, 7, 7, 0);
				//this.laserList[this.laserList.length - 1].playSound();
			}
			
			// if laser is upgraded
			else if (this.level == 1)
			{
				// create new laser single laser shot
				this.laserList.push(new Laser(this.x, this.y, this.angle, "Sprites/Lasers/laserRed08.png", "Sprites/Sounds/laser3.wav"));
				this.laserList[this.laserList.length - 1].init(40, 25, 30, 30, 0);
				//this.laserList[this.laserList.length - 1].playSound();
			}
			
			// laser upgraded again
			else if (this.level == 2)
			{
				// make laser triple shot
				// right shot
				this.laserList.push(new Laser(this.x, this.y, this.angle + 10, "Sprites/Lasers/laserRed11.png", "Sprites/Sounds/laser3.wav"));
				this.laserList[this.laserList.length - 1].init(40, 25, 30, 30, 0);
				
				// middle shot
				this.laserList.push(new Laser(this.x, this.y, this.angle, "Sprites/Lasers/laserRed11.png", "Sprites/Sounds/laser3.wav"));
				this.laserList[this.laserList.length - 1].init(40, 25, 30, 30, 0);
				
				// right shot
				this.laserList.push(new Laser(this.x, this.y, this.angle - 10, "Sprites/Lasers/laserRed11.png", "Sprites/Sounds/laser3.wav"));
				this.laserList[this.laserList.length - 1].init(40, 25, 30, 30, 0);
				
				//this.laserList[this.laserList.length - 1].playSound();
			}
			

			// lower energy
			this.energy -= 3;
		}
		

	}
	
	
	// draw lasers
	drawLaser()
	{
		if(this.laserList.length >= 0)
		{
			for (var i = 0; i < this.laserList.length; i++)
			{
				this.laserList[i].draw();
			}
		}
	}
	
	
	// update lasers
	updateLaser()
	{
		if(this.laserList.length >= 0)
		{
			for (var i = 0; i < this.laserList.length; i++)
			{
				this.laserList[i].update(this.laserList);
			}
		}
	}
	
	
	

	
	// update player in main loop
	update(upgradeList, gameTimer)
	{
		// add 1 energy a second
		if (this.energy < 100)
		{
			this.energy += 1;
			
			if (this.energy > 100)
			{
				this.energy = 100;
			}
		}
		
		// keep health at 0
		if (this.health <= 0)
		{
			this.health = 0;
			
			this.playerIsDead();
		}
		
		// check for collision with any upgrade
		for (var i = 0; i < upgradeList.length; i++)
		{
			if (this.rect.checkCollision(upgradeList[i].rect) || upgradeList[i].rect.checkCollision(this.rect))
			{
				// collision is true
				upgradeList[i].playSound();
				this.useUpgrade(upgradeList[i].type)
				upgradeList.splice(upgradeList.indexOf(upgradeList[i], 1));
				
				
			}
			// no collision
		}
		
		// set timer
		this.gameTimer = gameTimer;
	}
	
	// use upgrade
	useUpgrade(upgrade)
	{
		// weapon upgrade
		if (upgrade == 0)
		{
			// level 1
			if (this.level == 0)
			{
				// change weapon type
				this.level += 1;
				this.energy = 100;
			}
			
			// level 2
			else if (this.level == 1)
			{
				// change weapon
				this.level += 1;
				
				// add energy and health
				this.health = 100;
				this.energy = 100;
			}
			
			// level 3 
			else if (this.level == 2)
			{
				// add energy and health
				this.health = 100;
				this.energy = 100;
			}
		}
		
		// shield upgrade
		if (upgrade == 1)
		{
			this.shield = true;
			this.shieldHealth = 100;
			this.health = 100;
		}
		
		// add bomb to inventory
		if (upgrade == 2)
		{
			// add bomb
			if (this.bomb < 3)
			{
				this.bomb++;
			}
			
		}
		
	}
	
	// player has died
	playerIsDead()
	{
		if (this.health <= 0)
		{
			alert("You DEAD!!");
		}
		

		
		location.reload();
	}
	
	
	// create health bar
	createHealthBar(camX, camY)
	{
		// set health bar coords
		this.barX = -camX + 10;
		this.barY = -camY + 10;
		
		// set energy bar
		this.eBarX = -camX + 10;
		this.eBarY = -camY + 10 + 25;
		
		// set context style and create bar
		Context.context.fillStyle = "#FF0000";
		Context.context.fillRect(this.barX, this.barY, this.health * 2, 25);
		
		// set context and create energy bar
		Context.context.fillStyle = "#00FF00";
		Context.context.fillRect(this.eBarX, this.eBarY, this.energy * 2, 15);
		
	}
	
	
	
	// draw player health bar
	drawHealthBar(camX, camY)
	{
		// draw bars
		this.createHealthBar(camX, camY);
		
		// add text
		Context.context.font = "12px Arial";
		Context.context.fillStyle = "#FFFFFF";
		Context.context.fillText("Health", this.barX + 5, this.barY + 17);
		
		Context.context.fillStyle = "#FFFFFF";
		Context.context.fillText("Energy", this.eBarX + 5, this.eBarY + 12);
	}


	
	// show score on canvas
	showScore()
	{
		Context.context.fillStyle = "#FFFFFF";
		Context.context.font = "25px Arial";
		Context.context.fillText("SCORE:" + this.score, this.eBarX, this.eBarY + 40);
		
		// show game timer
		Context.context.fillStyle = "#FFFFFF";
		Context.context.font = "25px Arial";
		Context.context.fillText("TIME:" + Math.floor(this.gameTimer), this.eBarX, this.eBarY + 65);
		
	}
	
//END OF PLAYER CLASS
}






















//
//
//
// Main Game class
class MainGame
{
	//MainGame Constructor
	constructor(window)
	{
		// get main window
		this.window = window;
		
		// Initialize canvas
		Context.create("MainCanvas");
		
		// list of pressed keys
		this.keys = [];
		
		// set camera position
		this.camX = 0;
		this.camY = 0;
		
		// main canvas collision rect
		this.mainRect = new CollisionRect(this.camX, this.camY);
		
		// mouse x y position
		this.mouseX = 0;
		this.mouseY = 0;
		
		// level dimensions
		this.levelX = -3450;
		this.levelY = -4060;
		
		// Create player
		this.player = new Player(0, 0, "Sprites/Ships/red_ship1.png");
		
		// control movement 
		this.up = false;
		this.down = false;
		this.left = false;
		this.right = false;
		
		// game timer
		this.gameTimer = 0;
		
		// List of stars
		this.starList = [];
		
		// list of meteors
		this.meteorList = [];
		
		// upgrades
		this.upgradeList = [];
		
		// enemy list
		this.enemyList = [];
		this.enemyList.push(new Enemy("Sprites/Enemies/enemyBlack1.png", 100, 40));

		// set this to self for scope
		self = this;
	}
	
	
	// init game pieces
	initPieces()
	{
		// init players
		self.player.init();
		
		for (var i = 0; i < self.enemyList.length; i++)
		{
			self.enemyList[i].init();
		}
		
	}
	
	
	
	// set up game
	run()
	{
		// fill list of stars
		self.generateStars();
		
		// generate meteors
		self.generateMeteors();
		
		// Initialize canvas color
		self.clearScreen("#0f0000");
		
		// Init game pieces
		self.initPieces();
		
		// init collision rect
		self.mainRect.init(window.innerWidth + 50, window.innerHeight + 50);
		
		//initialize main loop
		setInterval(function(){ self.mainLoop() }, 1000 / 30);
		
		// Add event listeners
		// mouse click
		window.addEventListener("mousedown", self.onMouseClick, false);
		window.addEventListener("mouseup", self.onMouseUp, false);
		
		// mouse motion event
		window.addEventListener("mousemove", self.getMousePosition, false);
		
		// check multiple keys
		window.addEventListener("keydown", self.keyPressed, false);
		window.addEventListener("keyup", self.keyReleased, false);
		
	}
	
	// check if window has changed size
	resizeCanvas()
	{
		if(Context.canvas.width != window.innerWidth - 20 || 
			Context.canvas.height != window.innerHeight - 50)
		{
			this.canvas.width  = window.innerWidth - 20;
			this.canvas.height = window.innerHeight - 50;
			self.mainRect.init(window.innerWidth - 20, window.innerHeight - 50);
		}
	}

	
	// clear screen and set to color
	clearScreen(color)
	{
		Context.context.clearRect(0, 0, Context.canvas.width, Context.canvas.height);
		Context.context.fillStyle = color;
		Context.context.fillRect(0, 0, 5000, 5000);
	}
	
	
	
	// set camera inside world space 
	clamp(value, min, max)
	{
		if(value < min)
		{
			return min;
		}			
		else if(value > max)
		{
			return max;
		}
		else
		{
			return value;
		}
	}
	
	
	
	// Draw all game components to the canvas
	drawGame()
	{
		// clear screen
		Context.context.setTransform(1,0,0,1,0,0);//reset the transform matrix as it is cumulative
		self.clearScreen("#0f0000");

		// Clamp the camera position to the world bounds while centering the camera around the player                                             
		self.camX = self.clamp(-self.player.x + Context.canvas.width/2, 0, 5000 - Context.canvas.width);
		self.camY = self.clamp(-self.player.y + Context.canvas.height/2, 0, 5000 - Context.canvas.height);
		// Move canvas
		Context.context.translate(self.camX, self.camY); 
		
		// draw background
		self.drawStar();
		
		// draw meteors
		self.drawMeteors();
		
		// draw lasers
		self.player.drawLaser();
		
		// draw enemies
		self.drawEnemies();
		
		// draw player
		self.player.draw(self.camX, self.camY);
		
		// draw upgrade debugger
		self.handleUpgrades();
		
		//draw main collision rect
		//self.drawMainRect();

	}
	
	// draw level enemies
	drawEnemies()
	{
		// loop list and draw each sprite
		for (var i = 0; i < self.enemyList.length; i++)
		{
			self.enemyList[i].draw();
		}
	}
	
	
	
	//show main collision rect
	drawMainRect()
	{
		// draw main canvas collision rect
		self.mainRect.draw();
	}
	
	
	
	// draw and update upgrades
	handleUpgrades()
	{
		// check if any upgrades exist
		if (self.upgradeList.length > 0)
		{
			for (var i = 0; i < self.upgradeList.length; i++)
			{
				self.upgradeList[i].update();
				self.upgradeList[i].draw();
			}
		}
	}
	
	
	
	// loop through list and draw meteors
	drawMeteors()
	{
		for (var i = 0; i < self.meteorList.length; i++)
		{
			// check if meteor is on screen
			if (self.meteorList[i].rect.checkCollision(self.mainRect))
			{
				// Draw meteors
				self.meteorList[i].draw();
			}
		}
	}
	
	
	
	// fill list of meteors
	generateMeteors()
	{
		// fill list with meteors
		for (var i = 0; i < 105; i++)
		{
			var randX = (Math.random() * -(self.levelX - Context.canvas.width)) + (self.levelX + Context.canvas.width/4) - 100;
			var randY = (Math.random() * -(self.levelY - Context.canvas.height)) + (self.levelY + Context.canvas.height / 4) - 100;
			var randType = Math.floor(Math.random() * 19);
			
			self.meteorList.push(new Meteor(randX, randY, randType));
			
		}
	}
	
	
	
	// update meteor properties
	updateMeteors()
	{
		for (var i = 0; i < self.meteorList.length; i++)
		{
			self.meteorList[i].update();
			self.meteorList[i].generateNewPosition(self.meteorList, self.meteorList[i], self.levelX, self.levelY);
		}
	}
	
	
	
	// Generate list of stars
	generateStars() 
	{
		// loop and generate stars, placing them in starList
		for ( var i = 0; i < 3000; i++){
			self.starList.push(new Star((Math.random() * -(self.levelX - Context.canvas.width)) + (self.levelX + Context.canvas.width/4) - 100,
									(Math.random() * -(self.levelY - Context.canvas.height)) + (self.levelY + Context.canvas.height / 4) - 100,
									(Math.random() * 10)));
		}
	}
	
	
	
	// Draw stars on canvas
	drawStar() 
	{
		for (var i = 0; i < self.starList.length; i++) 
		{
			Context.context.fillStyle = self.starList[i].fill;
			Context.context.fillRect(self.starList[i].x, self.starList[i].y, self.starList[i].width, self.starList[i].height);	
		}	
	}
	
	
	
	// Main game loop, handles all logic
	mainLoop()
	{
		// save context
		Context.context.save();
		
		// check if canvas has been resized
		Context.resize();
		
		//clear screen before drawing
		self.clearScreen("#0f0000");
		
		// update main collision rect
		self.mainRect.update(-(self.camX + 25), -(self.camY + 25));
		
		// move meteors
		self.updateMeteors();
		
		// move player on canvas
		self.movePlayer();
		
		// check for collision
		if (self.checkCollision())
		{
			self.player.takeDamage();
		}
		
		// draw to canvas
		self.drawGame();	
		
		// update game timer
		self.gameTimer += 1/30;

	}
	
	
	// check for collision
	checkCollision()
	{
		// check for collision between player and meteor
		for (var i = 0; i < self.meteorList.length; i++)
		{
			if (self.player.rect.checkCollision(self.meteorList[i].rect) || 
				self.meteorList[i].rect.checkCollision(self.player.rect))
			{
				return true;
			}

		}
		
		
		
		// cheeck for collision between laser and meteor
		if (self.player.laserList.length > 0)
		{
			for (var i = 0; i < self.player.laserList.length; i++)
			{
				self.player.laserList[i].checkForHit(self.meteorList, self.player.laserList, self.player.laserList[i], self.player, self.upgradeList);
			}
		}
		
	}
	
	
	
	// Check if player in in bounds before moving
	checkPlayerPosition()
	{
		// check player against right side
		if (self.player.x >= Context.canvas.width - self.player.width/2)
		{
			self.player.x -= self.player.vel;
		}	
		
		// check player against left side
		if (self.player.x <= self.levelX)
		{
			self.player.x += self.player.vel;
		}
		
		// check player against bottom	
		if (self.player.y >= Context.canvas.height - self.player.height/2)
		{
			self.player.y -= self.player.vel;
		}
		
		//check player against top
		if (self.player.y <= self.levelY)
		{
			self.player.y += self.player.vel;
		}
	}
	
	
	// poll for mouse click
	onMouseClick(e)
	{
		self.player.fireLaser();	
		

		// DEBUGGING DELETE
		
		//console.log("Angle:", self.player.angle);
		//console.log("MOUSE X:", self.mouseX );
		//console.log("Mouse Y:", self.mouseY);
		
		//console.log("PLAYER X:", self.player.x);
		//console.log("PLAYER Y:", self.player.y);
		
		//console.log(self.mainRect.x, self.mainRect.y, self.mainRect.width, self.mainRect.height);
		//console.log(self.camX);
		
		//console.log("TOTAL METEORS:", self.meteorList.length);

	}
	
	// mouse released
	onMouseUp(e)
	{
		
	}
	
	// get mouse motion
	getMousePosition(e)
	{
		// get mouse x y position
		self.mouseX = e.clientX;
		self.mouseY = e.clientY;
		
		var targetX = (self.mouseX - (self.player.x + self.camX));
		var targetY = (self.mouseY - (self.player.y + self.camY));
		
		self.player.angle = (Math.atan2(targetY, targetX) * 180 / Math.PI);

		
	}
	
	// Check if player related key was pressed
	keyPressed(e)
	{
		switch(e.keyCode)
		{
			// up
			case 87:
				self.up = true;
				break;
				
			// down	
			case 83:
				self.down = true;
				break;
				
			// left	
			case 65:
				self.left = true;
				break;
				
			// right	
			case 68:
				self.right = true;
				break;
				
			// Spacebar
			case 32:
				self.player.fireLaser();	
				break;
				
			// F is pressed
			case 70:
				break;
				
			default:
				break;
		}

		//console.log(e.keyCode);
	}
	
	
	
	// check if that key way released
	keyReleased(e)
	{
		switch(e.keyCode)
		{
			// up
			case 87:
				self.up = false;
				break;
				
			// down
			case 83:
				self.down = false;
				break;
				
			// left
			case 65:
				self.left = false;
				break;
				
			// right
			case 68:
				self.right = false;
				break;
			
			// space bar
			case 32:
				break;
				
			// F key
			case 70:
				
				break;
				
			default:
				break;
		}
	}
	
	
	
	movePlayer()
	{
		// check if player is in bounds
		self.checkPlayerPosition();
			
		if (self.up == true)
		{
			self.player.x += self.player.vel * Math.cos(self.player.angle * Math.PI / 180);
			self.player.y += self.player.vel * Math.sin(self.player.angle * Math.PI / 180);
		}
		
		if (self.down == true)
		{
			self.player.x -= (self.player.vel / 4) * Math.cos(self.player.angle * Math.PI / 180);
			self.player.y -= (self.player.vel / 4) * Math.sin(self.player.angle * Math.PI / 180);
		}
		
		if (self.left == true)
		{
			self.player.angle -= 5;
		}
		
		if (self.right == true)
		{
			self.player.angle += 5;
		}
		
		
		// additional player updates
		
		// update player
		self.player.update(self.upgradeList, self.gameTimer);
		
		// update lasers
		self.player.updateLaser();
		
		// update collision rect
		self.player.rect.update((self.player.x - self.player.width / 2) + 5, (self.player.y - self.player.height / 2) + 10);

	}
	
	
	
	/*
	// control player
	movePlayer(e) 
	{	
		// hold dimension for switch
		var tmp = 0;
		// Check if player is in bounds before moving
		self.checkPlayerPosition();
		
		// Check which key the user has pressed
		// Interact with main Player
		switch (e.keyCode) 
		{
			// move left
			case 37:
			case 65:
				self.player.angle -= 5;
				break;
				
			// move right
			case 39:
			case 68:
				self.player.angle += 5;
				break;
				
			//move up
			case 38:
			case 87:
				self.player.x += self.player.vel * Math.cos(self.player.angle * Math.PI / 180);
				self.player.y += self.player.vel * Math.sin(self.player.angle * Math.PI / 180);
				break;
				
			// move down
			case 40:
			case 83:
				self.player.x -= (self.player.vel * 0.25) * Math.cos((self.player.angle * Math.PI / 180));
				self.player.y -= (self.player.vel * 0.25) * Math.sin((self.player.angle * Math.PI / 180));
				break;
				
			// Keyboard is pressed
			case 32:
				break;
				
			default:
				console.log("Unknown key pressed");
				break;
		}
		
		
		//DEBUG PRINTS
		//console.log(self.player.x, self.player.y);
		//console.log(self.camX, self.camY);
	}
	*/
}





















//
//
// MAIN FUNCTION
function main()
{
	// Create MainGame object
	var mainGame = new MainGame(window);
	
	// runs when webpage loads
	window.onload = mainGame.run;	
}

// call main
main();




