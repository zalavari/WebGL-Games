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
	this.avatarmaterial.colorTexture.set(new Texture2D(gl, "media/cannon.png"));
	this.avatarmesh = new Mesh(this.quadGeometry, this.avatarmaterial);
	
	this.gameObjects = [];
	
	for (let i=0; i<4; i++)
	{
		this.material = new Material(gl, this.solidProgram);	
		this.material.colorTexture.set(new Texture2D(gl, "media/asteroid"+i+".png"));
		this.mesh = new Mesh(this.quadGeometry, this.material);
		this.gameObjects.push(new GameObject(this.mesh));
	}

	this.gameObjects.push(new GameObject(this.avatarmesh));
	
	this.gameObjects[0].position.set(-0.5,0.5);
	this.gameObjects[1].position.set(0.5,0.5);
	this.gameObjects[2].position.set(-0.5,-0.5);
	this.gameObjects[3].position.set(0.5,-0.5);
	this.gameObjects[4].position.set(0,-0);
	
	for (let i=0; i<4; i++)
	{
		let movingLogic= function(t, dt, keysPressed, gameObjects)
		{
			let step= new Vec2(0.04*i, 0.02*i);
			
			this.position.add(step.times(dt));
			
			this.orientation=((i+1)*0.3*t)%6.28;
		}		
		
		this.gameObjects[i].move = movingLogic
	}
	
	let movingLogic = function(t, dt, keysPressed, gameObjects)
		{
			let step= new Vec2(0, 0);
			if (keysPressed["LEFT"])
			{
				step.x += -0.4;
				this.orientation=0;				
			}
			if (keysPressed["RIGHT"])
			{
				step.x += 0.4;
				this.orientation=3.14;	
			}
			if (keysPressed["UP"])
			{
				step.y += 0.4;
				this.orientation=3*3.14/2;
			}
			if (keysPressed["DOWN"])
			{
				step.y += -0.4;
				this.orientation=3.14/2;
			}
			
		
			this.position.add(step.times(dt));
			
		}
	this.gameObjects[4].move = movingLogic
	
	
	this.camera = new OrthoCamera();
	
	this.bgmaterial = new Material(gl, this.backgroundProgram);
	this.bgmaterial.colorTexture.set(new Texture2D(gl, "media/sky.jpg"));
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

	
	// clear the screen
	gl.clearColor(0.9, 0.5, 0.3, 1.0);
	gl.clearDepth(1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	this.camera.position=this.gameObjects[4].position;
	this.camera.updateViewProjMatrix();
	
	this.bgObject.draw(this.camera);
	
	for (let i=0; i<this.gameObjects.length; i++)
		this.gameObjects[i].move(t, dt, keysPressed, this.gameObjects);
	
	
	for (let i=0; i<this.gameObjects.length; i++)
		this.gameObjects[i].draw(this.camera);
 
};


