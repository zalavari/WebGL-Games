"use strict"; 
const SnakeElement = function(wheelMesh) { 

	this.prevObj= null;
	this.nextObj= null;
	this.requiredPositionBefore = new Vec3();
	this.requiredOrientationBefore = new Vec3();
	this.requiredPositionAfter = new Vec3();
	this.requiredOrientationAfter = new Vec3();
  
	this.radius=12;
	

	this.obj= new GameObject(wheelMesh);	
	this.obj.position.set(0,5,5);
	this.obj.resistance.set(5,5,5);
	this.angularVelocity= new Vec3();
	this.angularAcceleration= new Vec3();

};


SnakeElement.prototype.draw = function(camera){ 

	this.obj.draw(camera);

};

SnakeElement.prototype.move = function(t, dt, keysPressed, gameObjects) {
	
	this.requiredPositionBefore.set(this.prevObj.position);
	this.requiredOrientationBefore.set(this.prevObj.orientation);
	

	

	this.obj.acceleration.set();
	
	
	let dir=this.requiredPositionBefore.minus(this.obj.position);
	let dir2=new Vec3(dir);
	dir2.setScaled(dir2.normalize(), 5);
	
	let dir3= new Vec3();
	dir3=dir.minus(dir2);
	this.obj.acceleration.setScaled(dir3, 10);	 
	

	let angDir=this.requiredOrientationBefore.minus(this.obj.orientation);
	this.angularVelocity.set();
	
	this.angularAcceleration.setScaled(angDir, 100);
	this.angularVelocity.addScaled(dt, this.angularAcceleration);
	this.obj.orientation.addScaled(dt, this.angularVelocity);
	
	this.angularVelocity.setScaled(this.angularVelocity, Math.exp(-dt*10));
	




	this.obj.move(t,dt);
	this.obj.updateModelMatrix();


  
  
}