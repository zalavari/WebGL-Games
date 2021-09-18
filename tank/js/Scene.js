"use strict";
const Scene = function(gl) {
	this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "solid_vs.essl");
	this.vsBg = new Shader(gl, gl.VERTEX_SHADER, "bg_vs.essl");
	this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
	this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);
	this.backgroundProgram = new Program(gl, this.vsBg, this.fsSolid);
	this.quadGeometry = new QuadGeometry(gl);

	this.timeAtFirstFrame = new Date().getTime();
	this.timeAtLastFrame = this.timeAtFirstFrame;

	
	this.avatarAmaterial = new Material(gl, this.solidProgram);	
	this.avatarAmaterial.colorTexture.set(new Texture2D(gl, "media/tankA.png"));
	this.avatarAmaterial.scaleTexture.set(new Vec2(1,1));
	this.avatarAmesh = new Mesh(this.quadGeometry, this.avatarAmaterial);
	
	this.avatarBmaterial = new Material(gl, this.solidProgram);	
	this.avatarBmaterial.colorTexture.set(new Texture2D(gl, "media/tankB.png"));
	this.avatarBmaterial.scaleTexture.set(new Vec2(1,1));
	this.avatarBmesh = new Mesh(this.quadGeometry, this.avatarBmaterial);
	
	this.explosionMaterial = new Material(gl, this.solidProgram);	
	this.explosionMaterial.colorTexture.set(new Texture2D(gl, "media/boom.png"));
	this.explosionMaterial.scaleTexture.set(new Vec2(1.0/6,1.0/6));
	this.explosionMesh = new Mesh(this.quadGeometry, this.explosionMaterial);
	
	this.ballmaterial = new Material(gl, this.solidProgram);	
	this.ballmaterial.colorTexture.set(new Texture2D(gl, "media/ball.png"));
	this.ballmaterial.scaleTexture.set(new Vec2(1,1));	
	this.ballmesh = new Mesh(this.quadGeometry, this.ballmaterial);
	
	this.wallmaterial = new Material(gl, this.solidProgram);	
	this.wallmaterial.colorTexture.set(new Texture2D(gl, "media/wall.jpg"));
	this.wallmaterial.scaleTexture.set(new Vec2(0.01,0.01));	
	this.wallmesh = new Mesh(this.quadGeometry, this.wallmaterial);
	
	//BACKGROUND
	this.bgmaterial = new Material(gl, this.backgroundProgram);
	this.bgmaterial.colorTexture.set(new Texture2D(gl, "media/bg.jpg"));
	this.bgmesh= new Mesh(this.quadGeometry, this.bgmaterial);
	this.bgObject = new GameObject(this.bgmesh);
	
	
	this.gameObjects = {
		tanks : [],
		balls : [],
		walls : [],
		animations : []
	}
	
	//TANKS SETUP
	let tankA=new Tank(this.avatarAmesh, "UP", "DOWN", "LEFT", "RIGHT")
	tankA.position.set(-5,-5);
	this.gameObjects.tanks.push(tankA);
	
	let tankB=new Tank(this.avatarBmesh, "W", "S", "A", "D");
	tankB.position.set(5,5);
	tankB.orientation=Math.PI;
	
	this.gameObjects.tanks.push(tankB);
	
	//WALLS SETUP
	let wall;

	wall=new Wall(this.wallmesh,true,0.2,30);
	wall.position.set(0,10);
	this.gameObjects.walls.push(wall);	
	
	wall=new Wall(this.wallmesh,false,0.2,20);
	wall.position.set(-15,0);
	this.gameObjects.walls.push(wall);
	
	wall=new Wall(this.wallmesh,true,0.2,30);
	wall.position.set(0,-10);
	this.gameObjects.walls.push(wall);	

	wall=new Wall(this.wallmesh,false,0.2,20);
	wall.position.set(15,0);
	this.gameObjects.walls.push(wall);
	
	for (let i=1; i<6; i++)
	{	
		wall=new Wall(this.wallmesh,false,0.2,5);
		wall.position.set(-15+5*i,0);
		this.gameObjects.walls.push(wall);
	}
	
	for (let i=1; i<4; i++)
	{	
		wall=new Wall(this.wallmesh,true,0.2,5);
		wall.position.set(0,-10+5*i);
		this.gameObjects.walls.push(wall);
	}	
	
	
	//CAMERA
	this.camera = new OrthoCamera();	
	
	//BLENDING
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
	//this.solidProgram.commit();

};

Scene.prototype.update = function(gl, keysPressed) {
	//this.solidProgram.commit();
	//jshint bitwise:false
	//jshint unused:false
	const timeAtThisFrame = new Date().getTime();
	const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
	const t = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0; 
	this.timeAtLastFrame = timeAtThisFrame;
	
	
	if (keysPressed["ENTER"])
	{
		this.fire(this.gameObjects.tanks[0]);
	}
	if (keysPressed["X"])
	{
		this.fire(this.gameObjects.tanks[1]);
	}
	
	// clear the screen
	//gl.clearColor(0.9, 0.5, 0.3, 1.0);
	//gl.clearDepth(1.0);
	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		
	this.camera.position=(this.gameObjects.tanks[0].position.plus(this.gameObjects.tanks[1].position)).over(2);
	this.camera.updateViewProjMatrix();
	
	this.bgObject.draw(this.camera);
	
	for (let i=0; i<this.gameObjects.walls.length; i++)
	{
		this.gameObjects.walls[i].draw(this.camera);
	}

	//UPDATE PELLETS
	for (let i=0; i<this.gameObjects.balls.length; i++)
	{
		let ball=this.gameObjects.balls[i];
		ball.move(t, dt, keysPressed, this.gameObjects)
		ball.draw(this.camera);
	}

	this.gameObjects.balls = this.gameObjects.balls.filter(function(ball) { return ball.timeToLive > 0 })
	
	
	//UPDATE TANKS
	for (let i=0; i<this.gameObjects.tanks.length; i++)
	{
		let tank=this.gameObjects.tanks[i];

		tank.move(t, dt, keysPressed, this.gameObjects)

		if (tank.dead)
		{
			continue;
		}
		
		
		tank.draw(this.camera);
		
		if (tank.hit && !tank.dead)
		{
			tank.dead = true;
			tank.hit = false;
			tank.timeToLive=5;
			
			let anim=new GameObject(this.explosionMesh);
			anim.position.set(tank.position);
			anim.move = function(t, dt, keysPressed, gameObjects)
			{
				this.timeToLive-=dt;
				let kepkocka=35-Math.ceil(this.timeToLive/3*36);
				this.mesh.material.offsetTexture.set(Math.floor(kepkocka%6),Math.floor(kepkocka/6));			
			}
			anim.timeToLive=3;
			this.gameObjects.animations.push(anim);	
		}
		
	}		
	
	//UPDATE ANIMATIONS
	for (let i=0; i<this.gameObjects.animations.length; i++)
	{
		let anim=this.gameObjects.animations[i]
		anim.move(t, dt, keysPressed, this.gameObjects)
		anim.draw(this.camera);
	}	
	this.gameObjects.animations = this.gameObjects.animations.filter(function(anim) { return anim.timeToLive > 0 })

 
};

Scene.prototype.fire = function(tank)
{
	if (tank.dead || tank.cooldown>0)
		return null;
	
	tank.cooldown=0.5;
	let ballObject= new Pellet(this.ballmesh, tank);	
	this.gameObjects.balls.push(ballObject);	
}






