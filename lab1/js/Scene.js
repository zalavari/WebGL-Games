"use strict";
const Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "trafo_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "garish_fs.essl");
  this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);
  this.quadGeometry = new QuadGeometry(gl);
  this.triangleGeometry = new TriangleGeometry(gl);

  this.timeAtFirstFrame = new Date().getTime();
  this.timeAtLastFrame = this.timeAtFirstFrame;

  this.ModelMatrix = new Mat4(); //Ezt adjuk át unformnak
  this.positionModelMatrix = new Mat4();  
  this.hideModelMatrix = new Mat4(0,0,0,0);
  
  this.colorBlue = 0.3;

};

Scene.prototype.update = function(gl, keysPressed) {
	//this.solidProgram.commit();
  //jshint bitwise:false
  //jshint unused:false
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  const t = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0; 
  this.timeAtLastFrame = timeAtThisFrame;
  
  //animate triangle
  this.step = new Vec2(0.1, 0);
  if (keysPressed["RIGHT"])
  this.positionModelMatrix.translate(this.step.times(dt));

  this.step = new Vec2(-0.1, 0);
  if (keysPressed["LEFT"])
  this.positionModelMatrix.translate(this.step.times(dt));

  this.step = new Vec2(0, 0.1);
  if (keysPressed["UP"])
  this.positionModelMatrix.translate(this.step.times(dt));
  
  this.step = new Vec2(0, -0.1);
  if (keysPressed["DOWN"])
  this.positionModelMatrix.translate(this.step.times(dt));

	if (keysPressed["SPACE"])
		this.modelMatrix=this.hideModelMatrix;
	else
		this.modelMatrix=this.positionModelMatrix;

	var i;
	for (i=0; i<10; i+=1)
	{
		if (keysPressed[i.toString()])
		{
			this.colorBlue=0.1*i;
			console.log(this.colorBlue);
		}
	}

  // clear the screen
  gl.clearColor(0.8, 0.0, 0.1, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  //set uniform variables
 gl.uniformMatrix4fv(
  gl.getUniformLocation(
    this.solidProgram.glProgram, "modelMatrix"),
  false,
  this.modelMatrix.storage );

gl.uniform1f(	  gl.getUniformLocation(		this.solidProgram.glProgram, "colorBlue"),	 this.colorBlue);

  this.solidProgram.commit();
  //this.quadGeometry.draw();
  this.triangleGeometry.draw();
};


