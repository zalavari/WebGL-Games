const Pellet = function(mesh, tank)
{
	GameObject.call(this, mesh);

	let dir= new Vec3(-Math.sin(tank.orientation),Math.cos(tank.orientation),0);
	
	this.position.set(tank.position);
	this.radius=0.1;	
	this.position.addScaled(tank.radius+2*this.radius,dir);
	this.scale.set(0.1,0.1,0);
	this.velocity.setScaled(dir,5);
	this.velocity.add(tank.velocity);
	this.timeToLive=5;
	
};

Pellet.prototype = Object.create(GameObject.prototype);

Object.defineProperty(Pellet.prototype, 'constructor', {
	value: Pellet,
	enumerable: false,
	writable: true });

Pellet.prototype.move = function(t, dt, keysPressed, gameObjects)
{
	this.bounce(gameObjects.walls);
				
	this.timeToLive-=dt;
	this.acceleration.set();
	
	this.velocity.addScaled(dt, this.acceleration);
	this.position.addScaled(dt, this.velocity);
	
	//this.velocity.setScaled(this.velocity, Math.exp(-dt));			
}