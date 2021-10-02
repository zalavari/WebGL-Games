"use strict";
const Scene = function(gl) {
	this.vsTrafo = new Shader(gl, gl.VERTEX_SHADER, "trafo_vs.essl");
	this.vsEnv = new Shader(gl, gl.VERTEX_SHADER, "env_vs.essl");
	this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured_fs.essl");
	this.fsProceduralTextured = new Shader(gl, gl.FRAGMENT_SHADER, "proc_textured_fs.essl");
	this.fsEnv = new Shader(gl, gl.FRAGMENT_SHADER, "env_fs.essl");
	this.solidProgram = new Program(gl, this.vsTrafo, this.fsTextured);
	this.proceduralTextureProgram = new Program(gl, this.vsTrafo, this.fsProceduralTextured);
	this.envProgram = new Program(gl, this.vsEnv, this.fsEnv);

	this.quadGeometry = new QuadGeometry(gl);
	this.infinitePlane = new InfinitePlane(gl);

	this.timeAtFirstFrame = new Date().getTime();
	this.timeAtLastFrame = this.timeAtFirstFrame;
	
	this.gameObjects = [];
	this.balls = [];
	
	
	//BACKGROUND
	this.backgroundMaterial = new Material(gl, this.envProgram);
	this.envTexture = new TextureCube(gl, [
	"media/sky/posx512.jpg",
	"media/sky/negx512.jpg",
	"media/sky/posy512.jpg",
	"media/sky/negy512.jpg",
	"media/sky/posz512.jpg",
	"media/sky/negz512.jpg",]
	);
	this.backgroundMaterial.envTexture.set (this.envTexture);
	this.backgroundObj= new GameObject(new Mesh(this.quadGeometry, this.backgroundMaterial));

								
	//TREES
	this.treeMaterial = new Material(gl, this.solidProgram);
	//this.treeMaterial.colorTexture.set(new Texture2D(gl, 'media/json/tree.png'));
	this.treeMesh=new MultiMesh(gl, "media/json/tree.json", [this.treeMaterial]);
	
	
	//SPHERES
	this.sphereMeshes = [];
	
	for (let i=0; i<9; i++)
	{
		this.sphereMaterial = new Material(gl, this.proceduralTextureProgram);
		//this.sphereMaterial.colorTexture.set(new Texture2D(gl, 'media/planets/'+ i +'.jpg'));
		this.sphereMesh=new MultiMesh(gl, "media/json/sphere.json", [this.sphereMaterial]);
		this.sphereMeshes.push(this.sphereMesh);
	}
	
	
	
	for (let i=0; i<10; i++)
	{
		let tree=new GameObject(this.treeMesh);
		
		tree.position.setRandom({x:-300, y:0, z:-300}, {x:300, y:0, z:300});
		//this.gameObjects.push(tree);
	}
	
	for (let i=0; i<6; i++)
	{
		let sphere=new Ball(this.sphereMeshes[i%9]);
		
		sphere.body.position.setRandom({x:-300, y:10, z:-300}, {x:300, y:60, z:300});
		//sphere.body.position.set(-20,20,50);
		//sphere.body.scale.set(10,10,10)
		//sphere.orientation.set(0,0,Math.PI);
		
		this.gameObjects.push(sphere);
		this.balls.push(sphere);
	}

   


	//FLOOR
	this.floorMaterial = new Material(gl, this.solidProgram);
	//this.floorMaterial.envMapTexture.set(this.envTexture);
	//this.floorMaterial.colorTexture.set(new Texture2D(gl, 'media/floor.png'));

	
	this.plane= new GameObject(new Mesh(this.infinitePlane, this.floorMaterial));
	this.plane.position.set(0,0,0);
	this.plane.scale.set(100,100,100);
	
	
	

	//CAMERA
	
	this.cameracooldown=0.1;
	this.perspectiveCamera =new PerspectiveCamera();
	this.perspectiveCamera.position.set(5,15,40);	
	this.camera = this.perspectiveCamera;
	
	this.heli=true;
	this.heliCamera =new HeliCamera();
	//this.camera = this.heliCamera;
	//this.camera.obj.position.set(0,10,-49);


	//CHEVY
	
	this.chevyMaterial = new Material(gl, this.solidProgram);
	//this.chevyMaterial.colorTexture.set(new Texture2D(gl, 'media/json/chevy/chevy.png'));
	
	this.chevyMaterial.envMapTexture.set(this.envTexture); //////////////
	
	this.chevyMesh=new MultiMesh(gl, "media/json/chevy/chassis.json", [this.chevyMaterial]);
	this.chevyWheelMesh=new MultiMesh(gl, "media/json/chevy/wheel.json", [this.chevyMaterial]);
	this.chevyObject=new Car(this.chevyMesh, this.chevyWheelMesh);
	this.chevyObject.body.position.set(-5,6, -30);
	this.chevyObject.body.position.set(0,6, 0);
	this.chevyObject.body.resistance.set(1.5,0.1,0.5);




	

	this.gameObjects.push(this.backgroundObj);


	this.gameObjects.push(this.chevyObject);
	//this.gameObjects.push(this.chevyWheelObject);
	// this.gameObjects.push(this.myObject);
	//this.gameObjects.push(this.plane);


	


	gl.enable(gl.DEPTH_TEST);

	gl.enable(gl.BLEND);
	gl.blendFunc(
	gl.SRC_ALPHA,
	gl.ONE_MINUS_SRC_ALPHA);
};

Scene.prototype.update = function(gl, keysPressed) {
  //jshint bitwise:false
  //jshint unused:false

	const timeAtThisFrame = new Date().getTime();
	const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
	const t = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0; 
	this.timeAtLastFrame = timeAtThisFrame;
	
	if (t<1) return;
	
	//Change camera
	if (keysPressed.C)
	{
		if (this.cameracooldown<0)
		{
			this.heli=!this.heli;
			this.cameracooldown=0.2;
		}
		if (this.heli)
			this.camera = this.perspectiveCamera;
		else
			this.camera = this.heliCamera;
	}
	this.cameracooldown-=dt;
  
  
  this.chevyObject.move(t, dt, keysPressed, this.gameObjects);
  
  
  this.heliCamera.requiredPosition=this.chevyObject.cameraPos;
  this.heliCamera.requiredOrientation=this.chevyObject.body.orientation.plus(0,Math.PI,0);
  
  this.camera.move(dt, keysPressed);
  
  for(let i=0; i<this.balls.length; i++) {
    this.balls[i].move(t, dt, keysPressed, this.chevyObject, this.balls);
  }

  // clear the screen
  gl.clearColor(0.0, 0.0, 0.3, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  for(let i=0; i<this.gameObjects.length; i++) {
    this.gameObjects[i].draw(this.camera);
  }
  
 
  
  
  Uniforms.trafo.rayDirMatrix.set(this.camera.rayDirMatrix);
  
  
  Uniforms.light.lightPos.set(1000*Math.cos(t),1000,1000*Math.sin(t));
  Uniforms.light.cameraPos.set(this.camera.position);
  Uniforms.light.kd.set(0.5,0.5,0.5);
  Uniforms.light.ks.set(1.8,1.8,1.8);
  Uniforms.light.gamma.set(10);

};


