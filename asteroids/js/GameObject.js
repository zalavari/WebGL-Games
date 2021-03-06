const GameObject = function(mesh) { 
  this.mesh = mesh;

  this.position = new Vec3(0, 0, 0); 
  this.orientation = 0; 
  this.scale = new Vec3(1, 1, 1); 

  this.modelMatrix = new Mat4(); 
};

GameObject.prototype.updateModelTransformation = function(){ 

	this.modelMatrix.set().scale(this.scale).rotate(this.orientation).translate(this.position);
};

GameObject.prototype.draw = function(camera){ 

  this.updateModelTransformation();
  Uniforms.trafo.modelMatrix.set().mul(this.modelMatrix).mul(camera.viewProjMatrix);
  Uniforms.trafo.viewInv.set().mul(camera.viewProjMatrix).invert();
	//Uniforms.trafo.modelMatrix.set(this.modelMatrix);


  this.mesh.draw(); 
};

GameObject.prototype.move = function(t, dt, keysPressed, gameObjects) {


}

