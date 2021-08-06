"use strict"; 
const Ball = function(bodyMesh, wheelMesh) { 

	this.gravity=new Vec3(0,-100,0);
	
    this.worldUp = new Vec3(0.0, 1.0, 0.0); 

	this.body= new GameObject(bodyMesh);
	this.radius=10;
	this.body.scale.set(this.radius,this.radius,this.radius)
	
	this.rotateMatrixFromAngularVelocity = new Mat4();
	
	this.body.calculateAheadFromOrientation = function(){};
};


Ball.prototype.draw = function(camera){ 

	this.body.draw(camera);
	
};

Ball.prototype.move = function(t, dt, keysPressed, chevy, balls) {
	
	//console.log(this.body.position.x + " " +this.body.position.y + " " +this.body.position.z);
	this.body.acceleration.set();

	this.body.angularVelocity.setVectorProduct(this.body.velocity, this.worldUp); 
	this.body.angularVelocity.mul(-1/this.radius*dt);
	this.body.angularVelocity.add(0,dt,0)

	
	this.rotateMatrixFromAngularVelocity.set().rotate(this.body.angularVelocity.length(), this.body.angularVelocity);
	
	this.body.ahead.xyz0mul(this.rotateMatrixFromAngularVelocity);
	this.body.right.xyz0mul(this.rotateMatrixFromAngularVelocity);
	this.body.up.xyz0mul(this.rotateMatrixFromAngularVelocity);
	
	
    //Ütközés autóval
	let dir = this.body.position.minus(chevy.body.position);
	if (dir.length()<this.radius+chevy.radius)
	this.body.acceleration.addScaled(10000/dir.length(), dir.normalize());

	//Ütközés másik labdával
	for (let i=0; i<balls.length; i++)
	{
		let otherball=balls[i];
		if (otherball===this) continue;
		let dir = this.body.position.minus(otherball.body.position);
		if (dir.length()<this.radius+otherball.radius)
		this.body.acceleration.addScaled(10, dir);
	}
	
	

	//gravitáció menedzsment
//	this.body.acceleration.add(this.gravity);
	
	
	if (this.body.position.y<this.radius)
	{
		this.body.velocity.y=Math.abs(this.body.velocity.y);
		this.body.position.y=10;
	}
	//console.log(this.body.position.x + " " +this.body.position.y + " " +this.body.position.z);
	//console.log("dt: " + dt);
	//console.log(this.body.velocity.x + " " +this.body.velocity.y + " " +this.body.velocity.z);
	this.body.move(t, dt);  
	//console.log(this.body.position.x + " " +this.body.position.y + " " +this.body.position.z);
  
}