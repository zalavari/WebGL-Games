"use strict"; 
const Car = function(bodyMesh, wheelMesh) { 
	this.speed=30;
	this.radius=12;
	
	this.wheelsteering = 0; 
	this.body= new GameObject(bodyMesh);
	this.wheels=[];
	let wheel;

	//front-left
	wheel= new GameObject(wheelMesh);
	wheel.position.set(7,-3,14);
	wheel.parentModelMatrix=this.body.modelMatrix;
	this.wheels.push(wheel);
	//front-right
	wheel= new GameObject(wheelMesh);
	wheel.position.set(-7,-3,14);
	wheel.parentModelMatrix=this.body.modelMatrix;
	this.wheels.push(wheel);
	//rear-left
	wheel= new GameObject(wheelMesh);
	wheel.position.set(7,-3,-11);
	wheel.parentModelMatrix=this.body.modelMatrix;
	this.wheels.push(wheel);
	//rear-right
	wheel= new GameObject(wheelMesh);
	wheel.position.set(-7,-3,-11);
	wheel.parentModelMatrix=this.body.modelMatrix;
	this.wheels.push(wheel);
	
	
	this.heli= new GameObject(wheelMesh); //dont need mesh, we wont draw it
	this.heli.position.set(0,10,-50);
	this.heli.parentModelMatrix=this.body.modelMatrix;
	
	this.cameraPos= new Vec3();
	this.temp = new Vec4();
	
	//this.cameraPos= this.body.position.plus(0,10,30);
	
};


Car.prototype.draw = function(camera){ 

	this.body.draw(camera);
	for (let i=0; i< this.wheels.length; i++)
	{
		this.wheels[i].draw(camera);
	}
};

Car.prototype.move = function(t, dt, keysPressed, gameObjects) {
	this.heli.updateModelMatrix();
	
this.cameraPos.set().xyz1mul(this.heli.modelMatrix);
//this.cameraPos.set(this.temp.x, this.temp.y, this.temp.z);


	
	this.wheelsteering*=Math.exp(-dt*10);

	this.body.acceleration.set();
	
	let elore=-this.body.ahead.dot(this.body.velocity);
	//let sgn=elore;
	//let sgn= elore>0.1 ? 1 : elore<0.1 ? -1 : 0;
	//let sgn= keysPressed.UP ? 1 : keysPressed.DOWN ? -1 : 0;
	
	if(keysPressed.DOWN) {
		this.body.acceleration.addScaled(3000* dt, this.body.ahead);
	}
	if(keysPressed.UP) {
		this.body.acceleration.addScaled(-5000* dt, this.body.ahead);
	}
	if(keysPressed.RIGHT) { 
		this.body.orientation.y-=0.5*dt*elore*0.03; 
		this.wheelsteering-=0.2;
	} 
	if(keysPressed.LEFT) { 
		this.body.orientation.y+=0.5*dt*elore*0.03; 
		this.wheelsteering+=0.2;
	}
	this.body.move(t, dt);

	//for all wheels
	for (let i=0; i< this.wheels.length; i++)
	{
		let wheel=this.wheels[i];
		wheel.move(t, dt);
		wheel.orientation.x-=0.25*dt*this.body.velocity.dot(this.body.ahead);
	}

	//for the front wheels
	for (let i=0; i<2; i++)
	{
		let wheel=this.wheels[i];
		wheel.orientation.y=this.wheelsteering;
	}


  
  
}