"use strict";
const Scene = function(gl) {
  this.vsQuad = new Shader(gl, gl.VERTEX_SHADER, "quad_vs.essl");
  this.fsTrace = new Shader(gl, gl.FRAGMENT_SHADER, "trace_fs.essl");
  this.traceProgram = new Program(gl, this.vsQuad, this.fsTrace);

  this.quadGeometry = new QuadGeometry(gl);
  this.traceMaterial = new Material(gl, this.traceProgram);
  this.traceMaterial.envTexture.set(new TextureCube(gl, [
    "media/posx512.jpg",
    "media/negx512.jpg",
    "media/posy512.jpg",
    "media/negy512.jpg",
    "media/posz512.jpg",
    "media/negz512.jpg",]
  ));
  this.traceMaterial.noiseTexture.set(new Texture2D(gl, 'media/noise.png'))
  this.traceMesh = new Mesh(this.quadGeometry, this.traceMaterial);

  this.gameObjects = [];
  this.gameObjects.push(new GameObject(this.traceMesh));  

  this.timeAtFirstFrame = new Date().getTime();
  this.timeAtLastFrame = this.timeAtFirstFrame;

  this.camera = new PerspectiveCamera();

  gl.enable(gl.DEPTH_TEST);
};

Scene.prototype.update = function(gl, keysPressed) {
  //jshint bitwise:false
  //jshint unused:false
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  const t = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0;  
  this.timeAtLastFrame = timeAtThisFrame;

  // clear the screen
  gl.clearColor(0.6, 0.0, 0.3, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.camera.move(dt, keysPressed);
  Uniforms.camera.rayDirMatrix.set(this.camera.rayDirMatrix);
  Uniforms.camera.position.set(this.camera.position);

  for(let i=0; i<this.gameObjects.length; i++) {
    this.gameObjects[i].draw(this.camera);
  }

};


