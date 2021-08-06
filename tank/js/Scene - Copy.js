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

	this.modelMatrix = new Mat4();  
	this.offsetTexture = new Vec2(0,0);
	this.directionRight=1.0; //1.0 if moving right, -1.0 if moving left (preserves the last state if moving nowhere)
	
	this.avatarmaterial = new Material(gl, this.solidProgram);	
	this.avatarmaterial.colorTexture.set(new Texture2D(gl, "media/tankA.png"));
	this.avatarmaterial.scaleTexture.set(new Vec2(1,1));
	this.avatarmesh = new Mesh(this.quadGeometry, this.avatarmaterial);
	
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
	this.wallmaterial.colorTexture.set(new Texture2D(gl, "media/sky.jpg"));
	this.wallmesh = new Mesh(this.quadGeometry, this.wallmaterial);
	
	
	this.gameObjects = {
		tanks : [],
		balls : [],
		walls : [],
		animations : []
	}
	
	//TANKS SETUP
	let tankA=new GameObject(this.avatarmesh)
	tankA.position.set(0,0);	
	let movingLogic = function(t, dt, keysPressed, gameObjects)
		{
			for (let i=0; i<gameObjects.balls.length; i++)
			{
				let ball = gameObjects.balls[i]
				let dist = ball.position.minus(this.position);
				if (dist.length()<0.15)
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
			
			this.velocity.addScaled(dt, this.acceleration);
			this.position.addScaled(dt, this.velocity);			
		}
	tankA.move = movingLogic
	this.gameObjects.tanks.push(tankA);
	
	let tankB=new GameObject(this.avatarBmesh)
	tankB.position.set(0,0);	
	movingLogic = function(t, dt, keysPressed, gameObjects)
		{
			for (let i=0; i<gameObjects.balls.length; i++)
			{
				let ball = gameObjects.balls[i]
				let dist = ball.position.minus(this.position);
				if (dist.length()<0.15)
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
			
			this.velocity.addScaled(dt, this.acceleration);
			this.position.addScaled(dt, this.velocity);			
		}
	tankB.move = movingLogic
	this.gameObjects.tanks.push(tankB);
	
	
	//WALLS SETUP
	let wall = new GameObject(this.wallmesh);
	wall.position.set(-0.9,0.9);
	wall.scale.set(10,0.1,0);
	//this.gameObjects.walls.push(wall);
	
	//BALLS SETUP
	this.ballmovinglogic= function(t, dt, keysPressed, gameObjects)
		{
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
		console.log(kepkocka + " " +  Math.floor(kepkocka/6)+":" + Math.floor(kepkocka%6) );
		this.mesh.material.offsetTexture.set(Math.floor(kepkocka%6),Math.floor(kepkocka/6));			
	}
	this.explodingmovinglogic= function(t, dt, keysPressed, gameObjects)
	{
		this.timeToLive-=dt;
		this.acceleration.set();
		this.velocity.set();	
	}
		
	this.camera = new OrthoCamera();
	
	this.bgmaterial = new Material(gl, this.backgroundProgram);
	this.bgmaterial.colorTexture.set(new Texture2D(gl, "media/bg.jpg"));
	this.bgmesh= new Mesh(this.quadGeometry, this.bgmaterial);
	this.bgObject = new GameObject(this.bgmesh);
	
	
	//blending
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
	
	
	if (keysPressed["SPACE"])
	{
		this.fire(this.gameObjects.tanks[0]);
	}
	if (keysPressed["Q"])
	{
		this.fire(this.gameObjects.tanks[1]);
	}
	
	// clear the screen
	//gl.clearColor(0.9, 0.5, 0.3, 1.0);
	//gl.clearDepth(1.0);
	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//this.camera.position=this.gameObjects[0].position;
	//this.camera.updateViewProjMatrix();
	
	this.bgObject.draw(this.camera);
	
	//for (let i=0; i<this.gameObjects.length; i++)
	//	this.gameObjects[i].move(t, dt, keysPressed, this.gameObjects);
	
	for (let i=0; i<this.gameObjects.walls.length; i++)
	{
		this.gameObjects.walls[i].move(t, dt, keysPressed, this.gameObjects)
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
	
	tank.cooldown=0.2;
	let ballObject= new GameObject(this.ballmesh);
	let dir= new Vec3(-Math.sin(tank.orientation),Math.cos(tank.orientation),0);
	
	ballObject.position.set(tank.position);
	ballObject.position.addScaled(0.16,dir);
	ballObject.scale.set(0.1,0.1,0);
	ballObject.velocity.set(dir);
	ballObject.velocity.add(tank.velocity);
	ballObject.move=this.ballmovinglogic;
	
	this.gameObjects.balls.push(ballObject);
	
}

Scene.prototype.kill = function(tank)
{
	tank.cooldown=0.2;
	tank.dead=true
	tank.move=this.explodingmovinglogic
	
	let anim=new GameObject(this.explosionMesh);
	anim.position.set(tank.position)
	anim.move=this.explosiomovinglogic;
	this.gameObjects.animations.push(anim);
	
	
			
}



