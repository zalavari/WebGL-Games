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
	let tankA=new GameObject(this.avatarAmesh)
	tankA.position.set(-5,-5);
	tankA.radius=0.6;
	tankA.invmass=5;
	this.movingLogicA = function(t, dt, keysPressed, gameObjects)
		{
			this.bounce(gameObjects.walls);
			
			for (let i=0; i<gameObjects.balls.length; i++)
			{
				let ball = gameObjects.balls[i]
				let dist = ball.position.minus(this.position);
				if (dist.length()<this.radius+ball.radius)
					this.hit=true;
			} 
			
			this.cooldown-=dt;
			this.acceleration.set();
			//this.acceleration.set(-Math.sin(this.orientation),Math.cos(this.orientation),0);
			if (keysPressed["LEFT"])
			{
				this.orientation+=Math.PI*dt;				
			}
			if (keysPressed["RIGHT"])
			{
				this.orientation+=-Math.PI*dt;	
			}
			if (keysPressed["UP"])
			{
				this.acceleration.set(-Math.sin(this.orientation),Math.cos(this.orientation),0);
			}
			if (keysPressed["DOWN"])
			{
				this.acceleration.set(Math.sin(this.orientation),-Math.cos(this.orientation),0);
			}

			this.velocity.setScaled(this.velocity, Math.exp(-dt));
			
			this.acceleration.mul(this.invmass);
			
			this.velocity.addScaled(dt, this.acceleration);
			this.position.addScaled(dt, this.velocity);			
		}
	tankA.move = this.movingLogicA
	
	this.gameObjects.tanks.push(tankA);
	
	let tankB=new GameObject(this.avatarBmesh)
	tankB.position.set(5,5);
	tankB.radius=0.6;
	tankB.invmass=5;
	tankB.orientation=Math.PI;
	this.movingLogicB = function(t, dt, keysPressed, gameObjects)
		{
			
			this.bounce(gameObjects.walls);
			
			for (let i=0; i<gameObjects.balls.length; i++)
			{
				let ball = gameObjects.balls[i]
				let dist = ball.position.minus(this.position);
				if (dist.length()<this.radius+ball.radius)
				{
					this.hit=true;					
				}
			} 
			
			this.cooldown-=dt;
			this.acceleration.set();
			//this.acceleration.set(-Math.sin(this.orientation),Math.cos(this.orientation),0);
			if (keysPressed["A"])
			{
				this.orientation+=Math.PI*dt;				
			}
			if (keysPressed["D"])
			{
				this.orientation+=-Math.PI*dt;	
			}
			if (keysPressed["W"])
			{
				this.acceleration.set(-Math.sin(this.orientation),Math.cos(this.orientation),0);
			}
			if (keysPressed["S"])
			{
				this.acceleration.set(Math.sin(this.orientation),-Math.cos(this.orientation),0);
			}

			this.velocity.setScaled(this.velocity, Math.exp(-dt));
			
			this.acceleration.mul(this.invmass);
			
			this.velocity.addScaled(dt, this.acceleration);
			this.position.addScaled(dt, this.velocity);			
		}
	tankB.move = this.movingLogicB
	
	this.gameObjects.tanks.push(tankB);
	
	
	this.movingLogic = [];
	this.movingLogic.push(this.movingLogicA);
	this.movingLogic.push(this.movingLogicB);
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
	
	
		
	
	//BALLS SETUP
	this.ballmovinglogic= function(t, dt, keysPressed, gameObjects)
		{
			this.bounce(gameObjects.walls);
						
			this.timeToLive-=dt;
			this.acceleration.set();
			
			this.velocity.addScaled(dt, this.acceleration);
			this.position.addScaled(dt, this.velocity);
			
			//this.velocity.setScaled(this.velocity, Math.exp(-dt));			
		}
	
	//EXPLOSION
	this.explosiomovinglogic= function(t, dt, keysPressed, gameObjects)
	{
		this.timeToLive-=dt;
		let kepkocka=35-Math.ceil(this.timeToLive/3*36);
		this.mesh.material.offsetTexture.set(Math.floor(kepkocka%6),Math.floor(kepkocka/6));			
	}
	this.explodingmovinglogic= function(t, dt, keysPressed, gameObjects)
	{
		this.timeToLive-=dt;
		this.acceleration.set();
		this.velocity.set();	
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
	
	//for (let i=0; i<this.gameObjects.length; i++)
	//	this.gameObjects[i].move(t, dt, keysPressed, this.gameObjects);
	
	for (let i=0; i<this.gameObjects.walls.length; i++)
	{
		this.gameObjects.walls[i].draw(this.camera);
	}
	
	let torlendo=-1;
	for (let i=0; i<this.gameObjects.balls.length; i++)
	{
		let ball=this.gameObjects.balls[i];
		ball.move(t, dt, keysPressed, this.gameObjects)
		ball.draw(this.camera);
		if (ball.timeToLive<0)
			torlendo=i;
	}
	this.gameObjects.balls.splice(0, torlendo+1);
	
	
	
	for (let i=0; i<this.gameObjects.tanks.length; i++)
	{
		let tank=this.gameObjects.tanks[i];

		tank.move(t, dt, keysPressed, this.gameObjects)

		if (tank.dead)
		{
			if (tank.timeToLive<0)
			{
				tank.dead=false;
				tank.move=this.movingLogic[i];
			}
			continue;
		}
		
		
		tank.draw(this.camera);
		
		if (tank.hit && !tank.dead)
		{
			this.kill(tank);			
		}
		
	}
		
	
	torlendo=-1;
	for (let i=0; i<this.gameObjects.animations.length; i++)
	{
		let anim=this.gameObjects.animations[i]
		anim.move(t, dt, keysPressed, this.gameObjects)
		anim.draw(this.camera);
		
		if (anim.timeToLive<0)
			torlendo=i;
	}
	this.gameObjects.animations.splice(0, torlendo+1);
 
};

Scene.prototype.fire = function(tank)
{
	if (tank.cooldown>0)
		return null;
	
	tank.cooldown=0.5;
	let ballObject= new GameObject(this.ballmesh);
	let dir= new Vec3(-Math.sin(tank.orientation),Math.cos(tank.orientation),0);
	
	ballObject.position.set(tank.position);
	
	ballObject.position.addScaled(tank.radius+2*ballObject.radius,dir);
	ballObject.scale.set(0.1,0.1,0);
	ballObject.velocity.setScaled(dir,5);
	ballObject.velocity.add(tank.velocity);
	ballObject.move=this.ballmovinglogic;
	ballObject.timeToLive=5;
	
	this.gameObjects.balls.push(ballObject);
	
}

Scene.prototype.kill = function(tank)
{
	tank.dead = true;
	tank.hit = false;
	tank.move=this.explodingmovinglogic;
	tank.timeToLive=5;
	
	let anim=new GameObject(this.explosionMesh);
	anim.position.set(tank.position);
	anim.move=this.explosiomovinglogic;
	anim.timeToLive=3;
	this.gameObjects.animations.push(anim);	
			
}





