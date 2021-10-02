"use strict"; 
const HeliCamera = function() 
{ 

  this.obj=new GameObject(null);
  this.obj.resistance.set(50,50,50);
  this.obj.orientation.set(0,Math.PI,0);
  
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
  
  this.requiredPosition = new Vec3();
  this.requiredOrientation = new Vec3();
  
  this.rotateMatrixFromAngularVelocity = new Mat4();
  
  this.angularVelocity= new Vec3();
  this.angularAcceleration= new Vec3();
  
  
}; 
HeliCamera.worldUp = new Vec3(0, 1, 0);
HeliCamera.prototype.updateViewMatrix = function(){ 

	this.viewMatrix.set().mul(this.obj.modelMatrix).invert();
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
	this.rayDirMatrix.set().translate(this.obj.position).mul(this.viewMatrix).mul(this.projMatrix).invert(); 
}; 

HeliCamera.prototype.move = function(dt, keysPressed) { 


	//console.log(this.requiredOrientation.x + " " +this.requiredOrientation.y + " " +this.requiredOrientation.z)
	//console.log(this.obj.orientation.x + " " +this.obj.orientation.y + " " +this.obj.orientation.z)

	let dir=this.requiredPosition.minus(this.obj.position);
	 
	this.obj.acceleration.setScaled(dir, 100);	 


	let angDir=this.requiredOrientation.minus(this.obj.orientation);
	this.angularVelocity.set();
	
	this.angularAcceleration.setScaled(angDir, 100);
	this.angularVelocity.addScaled(dt, this.angularAcceleration);
	this.obj.orientation.addScaled(dt, this.angularVelocity);
	
	this.angularVelocity.setScaled(this.angularVelocity, Math.exp(-dt*100));
	
	
	//this.obj.orientation=this.requiredOrientation;
	//this.obj.position=this.requiredPosition;

 this.obj.move(dt,dt);
 this.obj.updateModelMatrix();
 
	this.updateViewMatrix(); 
	
}; 


  // ar: canvas.clientWidth / canvas.clientHeight
HeliCamera.prototype.setAspectRatio = function(ar) 
{ 
  this.aspect = ar; 
  this.updateProjMatrix(); 
};

