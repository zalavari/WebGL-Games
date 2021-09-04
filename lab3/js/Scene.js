"use strict";
const Scene = function(gl) {
  this.vsTrafo = new Shader(gl, gl.VERTEX_SHADER, "trafo_vs.essl");
  this.vsEnv = new Shader(gl, gl.VERTEX_SHADER, "env_vs.essl");
  this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured_fs.essl");
  this.fsEnv = new Shader(gl, gl.FRAGMENT_SHADER, "env_fs.essl");
  this.solidProgram = new Program(gl, this.vsTrafo, this.fsTextured);
  this.envProgram = new Program(gl, this.vsEnv, this.fsEnv);
  
  this.quadGeometry = new QuadGeometry(gl);
  this.infinitePlane = new InfinitePlane(gl);

  this.timeAtFirstFrame = new Date().getTime();
  this.timeAtLastFrame = this.timeAtFirstFrame;
	
  this.slowMaterial = new Material(gl, this.solidProgram);
  this.slowMaterial.colorTexture.set(
    new Texture2D(gl, 'media/slowpoke/YadonDh.png'));
	
  this.slowEyeMaterial = new Material(gl, this.solidProgram);
  this.slowEyeMaterial.colorTexture.set(
    new Texture2D(gl, 'media/slowpoke/YadonEyeDh.png'));
	
  this.asteroidMaterial = new Material(gl, this.solidProgram);
  this.asteroidMaterial.colorTexture.set(
    new Texture2D(gl, 'media/asteroid.png'));

	
	this.plane= new GameObject(new Mesh(this.infinitePlane, this.asteroidMaterial));
	this.plane.position.set(0,-6,0);
	
	
  this.gameObjects = [];
  
  this.camera = new PerspectiveCamera();
  
  this.myPokeMesh=new MultiMesh(gl, "media/slowpoke/Slowpoke.json", [this.slowMaterial, this.slowEyeMaterial]);
  this.myPokeObject=new GameObject(this.myPokeMesh);
  this.myPokeObject.position.set(0,-5,-50);
  
  
  this.backgroundMaterial = new Material(gl, this.envProgram);
  
  this.backgroundMaterial.barmi = new Mat4();
  
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
  
  this.gameObjects.push(this.backgroundObj);
  this.gameObjects.push(this.myPokeObject);
  this.gameObjects.push(this.plane);
  
gl.enable(gl.DEPTH_TEST);

  gl.enable(gl.BLEND);
  gl.blendFunc(
    gl.SRC_ALPHA,
    gl.ONE_MINUS_SRC_ALPHA);
};

Scene.prototype.update = function(gl, keysPressed) {
  //jshint bitwise:false
  //jshint unused:false
  var timeAtThisFrame = new Date().getTime();
  var dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;
  
  this.camera.move(dt, keysPressed);

  // clear the screen
  gl.clearColor(0.0, 0.0, 0.3, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for(let i=0; i<this.gameObjects.length; i++) {
    this.gameObjects[i].draw(this.camera);
  }
  
  
  Uniforms.trafo.rayDirMatrix.set(this.camera.rayDirMatrix);

};


