"use strict"; 
const GameObject = function(mesh) { 
  this.mesh = mesh;
  
  this.ahead = new Vec3(0.0, 0.0, 1.0);
  this.right = new Vec3(1.0, 0.0, 0.0);
  this.up = new Vec3(0.0, 1.0, 0.0); 
  this.worldUp = new Vec3(0.0, 1.0, 0.0); 
  
  this.velocityModel = new Vec3(0,0,0);

  this.position = new Vec3(0, 0, 0); 
  this.orientation = new Vec3(0, 0, 0); 
  this.scale = new Vec3(1, 1, 1); 

  this.modelMatrix = new Mat4(); 
  this.rotateMatrix = new Mat4(); 
  this.parentModelMatrix = new Mat4(); 
  
  this.angularAcceleration= new Vec3(0,0,0);
  this.angularVelocity= new Vec3(0,0,0);
  
  this.velocity=  new Vec3(0,0,0);
  this.acceleration= new Vec3();
  
  this.resistance= new Vec3(0.1,0.1,0.1);
  
};

GameObject.prototype.updateModelMatrix =
                              function(){ 


this.rotateMatrix.set( 
    this.right.x          ,  this.right.y      ,  this.right.z       , 0, 
    this.up.x             ,  this.up.y         ,  this.up.z          , 0, 
   -this.ahead.x          , -this.ahead.y      ,  -this.ahead.z      , 0, 
    0  , 0  , 0   , 1)
	
	
	this.modelMatrix.set().
    scale(this.scale).
    mul(this.rotateMatrix).
    translate(this.position).
	mul(this.parentModelMatrix);
};

GameObject.prototype.draw = function(camera){ 
  
  this.updateModelMatrix();
  Uniforms.trafo.modelMatrix.set(this.modelMatrix);
  Uniforms.trafo.viewProjMatrix.set(camera.viewProjMatrix);
  this.mesh.draw(); 
};

GameObject.prototype.move = function(t, dt) {


this.velocity.addScaled(dt, this.acceleration);
this.position.addScaled(dt, this.velocity);


this.calculateAheadFromOrientation();


this.velocityModel.x=this.right.dot(this.velocity);
this.velocityModel.y=this.up.dot(this.velocity);
this.velocityModel.z=this.ahead.dot(this.velocity);

this.velocityModel.x*=Math.exp(-dt*this.resistance.x);
this.velocityModel.y*=Math.exp(-dt*this.resistance.y);
this.velocityModel.z*=Math.exp(-dt*this.resistance.z);


this.velocity.set();
this.velocity.addScaled(this.velocityModel.z, this.ahead);
this.velocity.addScaled(this.velocityModel.y, this.up);
this.velocity.addScaled(this.velocityModel.x, this.right);

}

GameObject.prototype.calculateAheadFromOrientation = function()
{
this.ahead = new Vec3(-Math.sin(this.orientation.y)*Math.cos(this.orientation.x),      Math.sin(this.orientation.x),    -Math.cos(this.orientation.y)*Math.cos(this.orientation.x) ); 


this.ahead.normalize(); 
this.calculateRightAndUpFromAhead();

}

GameObject.prototype.calculateRightAndUpFromAhead = function()
{
	this.right.setVectorProduct(this.ahead, this.worldUp); 
	this.right.mul(Math.cos(this.orientation.x));
this.right.normalize();


this.up.setVectorProduct(this.right, this.ahead); 
	
}


