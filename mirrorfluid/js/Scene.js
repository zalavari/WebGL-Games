"use strict";
const Scene = function(gl) {
  this.vsQuad = new Shader(gl, gl.VERTEX_SHADER, "quad_vs.essl");
  this.fsTrace = new Shader(gl, gl.FRAGMENT_SHADER, "trace_fs.essl");
  this.traceProgram = new Program(gl, this.vsQuad, this.fsTrace);

  this.quadGeometry = new QuadGeometry(gl);
  this.traceMaterial = new Material(gl, this.traceProgram);
  this.traceMaterial.envTexture.set(new TextureCube(gl, [
	"media/sky/posx512.jpg",
	"media/sky/negx512.jpg",
	"media/sky/posy512.jpg",
	"media/sky/negy512.jpg",
	"media/sky/posz512.jpg",
	"media/sky/negz512.jpg",]
	));
 // this.traceMaterial.noiseTexture.set(new Texture2D(gl, 'media/noise.png'))
  this.traceMesh = new Mesh(this.quadGeometry, this.traceMaterial);

  this.gameObjects = [];
  this.gameObjects.push(new GameObject(this.traceMesh));  

  this.timeAtFirstFrame = new Date().getTime();
  this.timeAtLastFrame = this.timeAtFirstFrame;

  this.camera = new PerspectiveCamera();
  this.camera.position.set(0,0,20);
  
  this.balls=[];
  for (let i=0; i<8; i++)
  {
  this.balls.push(new Vec4(0,0,0,i/8.0));
  }
  
  

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

  //METABALLS
  /*
  this.balls[8].set(5.0*Math.sin(t),0,5.0*Math.cos(t));
  this.balls[9].set(5.0*Math.cos(t),0,5.0*Math.sin(t));
  this.balls[10].set(5.0*Math.sin(t),5.0*Math.cos(t),0);
  this.balls[11].set(5.0*Math.cos(t),5.0*Math.sin(t),0);
  this.balls[12].set(0,5.0*Math.sin(t),5.0*Math.cos(t));
  this.balls[13].set(0,5.0*Math.cos(t),5.0*Math.sin(t));
  */
  
  this.balls[0].set(5.0*Math.sin(t),5.0*Math.sin(t),5.0*Math.sin(t),1.2);
  this.balls[1].set(5.0*Math.cos(t),5.0*Math.sin(t),5.0*Math.sin(t),2.3);
  this.balls[2].set(5.0*Math.sin(t),5.0*Math.cos(t),5.0*Math.sin(t),0.4);
  this.balls[3].set(5.0*Math.sin(t),5.0*Math.sin(t),5.0*Math.cos(t),0.5);
  this.balls[4].set(5.0*Math.sin(t),5.0*Math.cos(t),5.0*Math.cos(t),0.6);
  this.balls[5].set(5.0*Math.cos(t),5.0*Math.sin(t),5.0*Math.cos(t),0.7);
  this.balls[6].set(5.0*Math.cos(t),5.0*Math.cos(t),5.0*Math.sin(t),0.8);
  this.balls[7].set(5.0*Math.cos(t),5.0*Math.cos(t),5.0*Math.cos(t),0.9);

  
  
   for(let i=0; i<this.balls.length; i++) {
    Uniforms.meta.balls.at(i).set(this.balls[i]);
  }
  
  //LIGHT
  Uniforms.light.dir.set(200,100,100);
  Uniforms.light.kd.set(0.9,0.9,0.7);
  Uniforms.light.ks.set(2.8,2.8,2.8);
  Uniforms.light.gamma.set(15);
  

};


