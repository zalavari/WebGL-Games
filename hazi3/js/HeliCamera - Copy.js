"use strict"; 
const HeliCamera = function() 
{ 
  this.position = new Vec3(0.0, 0.0, 0.0); 
  this.ahead = new Vec3(0.0, 0.0, 1.0); 
  this.right = new Vec3(-1.0, 0.0, 0.0); 
  this.up = new Vec3(0.0, 1.0, 0.0);  
  
  this.orientation=new Vec3(0, 0, 0); //aka pitch, yaw, roll (in this order) :)

  this.fov = 1.0; 
  this.aspect = 1.0; 
  this.nearPlane = 10; 
  this.farPlane = 1000.0;
 
  this.viewMatrix = new Mat4(); 
  this.projMatrix = new Mat4();
  this.rayDirMatrix = new Mat4(); 
  this.viewProjMatrix = new Mat4();  
  this.updateViewMatrix();
  this.updateProjMatrix(); 
  this.updateRayDirMatrix(); 
  
  this.requiredPosition = new Vec4();
  this.requiredOrientation = new Vec3();
  
  this.velocity= new Vec3();
  this.acceleration= new Vec3();
  
  this.angularVelocity= new Vec3();
  this.angularAcceleration= new Vec3();
  
}; 
HeliCamera.worldUp = new Vec3(0, 1, 0);
HeliCamera.prototype.updateViewMatrix = function(){ 
  this.viewMatrix.set( 
    this.right.x          ,  this.right.y      ,  this.right.z       , 0, 
    this.up.x             ,  this.up.y         ,  this.up.z          , 0, 
   -this.ahead.x          , -this.ahead.y      ,  -this.ahead.z      , 0, 
    0  , 0  , 0   , 1).translate(this.position).invert();
  this.viewProjMatrix.set(this.viewMatrix).mul(this.projMatrix);
  this.updateRayDirMatrix();
   
}; 

HeliCamera.prototype.updateProjMatrix = function() 
{ 
  var yScale = 1.0 / Math.tan(this.fov * 0.5); 
  var xScale = yScale / this.aspect; 
  var f = this.farPlane; 
  var n = this.nearPlane; 
  this.projMatrix.set( 
      xScale ,    0    ,      0       ,   0, 
        0    ,  yScale ,      0       ,   0, 
        0    ,    0    ,  (n+f)/(n-f) ,  -1, 
        0    ,    0    ,  2*n*f/(n-f) ,   0); 
  this.viewProjMatrix.set(this.viewMatrix).
                      mul(this.projMatrix); 
  this.updateRayDirMatrix();
}; 

HeliCamera.prototype.updateRayDirMatrix = function(){ 
	this.rayDirMatrix.set().translate(this.position).mul(this.viewMatrix).mul(this.projMatrix).invert(); 
}; 

HeliCamera.prototype.move = function(dt, keysPressed) { 
 //this.position=this.requiredPosition;
	let dir=this.requiredPosition.minus(this.position);
	 
	this.acceleration.setScaled(dir, 100);	 
	this.velocity.addScaled(dt, this.acceleration);
	this.position.addScaled(dt, this.velocity);
	
	this.velocity.setScaled(this.velocity, Math.exp(-dt*50));
	


	let angDir=this.requiredOrientation.minus(this.orientation);
	
	this.angularAcceleration.setScaled(angDir, 100);
	this.angularVelocity.addScaled(dt, this.angularAcceleration);
	this.orientation.addScaled(dt, this.angularVelocity);
	
	this.angularVelocity.setScaled(this.angularVelocity, Math.exp(-dt*50));
	
	//this.orientation=this.requiredOrientation;

 
	this.updateViewMatrix(); 
}; 

HeliCamera.prototype.refreshAhead = function()
{
	this.ahead = new Vec3(
     -Math.sin(this.orientation.y)*Math.cos(this.orientation.x),
      Math.sin(this.orientation.x),
     -Math.cos(this.orientation.y)*Math.cos(this.orientation.x) ); 
	  this.right.setVectorProduct(
      this.ahead,
      PerspectiveCamera.worldUp ); 
    this.right.normalize(); 
    this.up.setVectorProduct(this.right, this.ahead); 
}


  // ar: canvas.clientWidth / canvas.clientHeight
HeliCamera.prototype.setAspectRatio = function(ar) 
{ 
  this.aspect = ar; 
  this.updateProjMatrix(); 
};

