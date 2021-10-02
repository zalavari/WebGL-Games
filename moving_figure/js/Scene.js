"use strict";
const Scene = function(gl) {
	this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "hf01_vs.essl");
	this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "hf01_fs.essl");
	this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);
	this.quadGeometry = new QuadGeometry(gl);

	this.timeAtFirstFrame = new Date().getTime();
	this.timeAtLastFrame = this.timeAtFirstFrame;

	this.modelMatrix = new Mat4();  
	this.offsetTexture = new Vec2(0,0);
	this.directionRight=1.0; //1.0 if moving right, -1.0 if moving left (preserves the last state if moving nowhere)

	this.texture=new Texture2D(gl, "media/platformer_sprites_base.png");
	
	//blending
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
	this.solidProgram.commit();

};

Scene.prototype.update = function(gl, keysPressed) {
	//this.solidProgram.commit();
	//jshint bitwise:false
	//jshint unused:false
	const timeAtThisFrame = new Date().getTime();
	const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
	const t = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0; 
	this.timeAtLastFrame = timeAtThisFrame;

	//animate box
	this.step= new Vec2(0, 0);
	if (keysPressed["LEFT"] || keysPressed["RIGHT"]) //moving in progress
	{
		this.step.x=0.2;
		if (keysPressed["UP"]) //climb up
		{
			this.step.y = 0.15;
			this.offsetTexture.y=6;
		}
		else if (keysPressed["DOWN"]) //climb down
		{
			this.step.y = -0.15;
			this.offsetTexture.y=7;
		}  	
		else if (keysPressed["SHIFT"]) //run
		{
			this.step.x *= 2.0;
			this.offsetTexture.y=0;
		} 
		else //walk
		{
			this.offsetTexture.y=4;
		}  
		this.directionRight=keysPressed["RIGHT"] ? 1.0 : -1.0;
	}
	
	
	this.offsetTexture.x=Math.floor(this.directionRight*this.modelMatrix.storage[3]*25)%8; //count a frame
	
	this.step.x*=this.directionRight; //flip the direction of moving if neccessary
	this.modelMatrix.translate(this.step.times(dt));//move the box
	this.modelMatrix.storage[0]=this.directionRight; //mirror the model vertically (if needed)


	// clear the screen
	gl.clearColor(0.9, 0.5, 0.3, 1.0);
	gl.clearDepth(1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//set uniform variables
	gl.uniformMatrix4fv(gl.getUniformLocation(this.solidProgram.glProgram, "modelMatrix"),false,this.modelMatrix.storage);
	gl.uniform2fv(gl.getUniformLocation(this.solidProgram.glProgram, "offsetTexture"),this.offsetTexture.storage);

	this.texture.commit(gl,gl.getUniformLocation(this.solidProgram.glProgram, "colorTexture"),0);

	this.solidProgram.commit();
	this.quadGeometry.draw();
 
};


