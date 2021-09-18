const Tank = function(mesh, forward, backward, left, right)
{
	GameObject.call(this, mesh);

	this.forward = forward;
	this.backward = backward;
	this.left = left;
	this.right = right;

	this.cooldown=0;
	this.hit=false;
	this.dead=false;
	this.invmass=5;
	this.radius=0.6;
};

Tank.prototype = Object.create(GameObject.prototype);

Object.defineProperty(Tank.prototype, 'constructor', {
	value: Tank,
	enumerable: false,
	writable: true });

Tank.prototype.move = function(t, dt, keysPressed, gameObjects)
{
	if (this.dead)
	{
		this.timeToLive-=dt;
		if (this.timeToLive<0)
		{
			this.dead=false;
		}
		return;
	}
	
	this.bounce(gameObjects.walls);
	
	for (let i=0; i<gameObjects.balls.length; i++)
	{
		let ball = gameObjects.balls[i]
		let dist = ball.position.minus(this.position);
		if (dist.length()<this.radius+ball.radius)
		{
			this.hit=true;					
		}
	} 
	
	this.cooldown-=dt;
	this.acceleration.set();
	//this.acceleration.set(-Math.sin(this.orientation),Math.cos(this.orientation),0);
	if (keysPressed[this.left])
	{
		this.orientation+=Math.PI*dt;				
	}
	if (keysPressed[this.right])
	{
		this.orientation+=-Math.PI*dt;	
	}
	if (keysPressed[this.forward])
	{
		this.acceleration.set(-Math.sin(this.orientation),Math.cos(this.orientation),0);
	}
	if (keysPressed[this.backward])
	{
		this.acceleration.set(Math.sin(this.orientation),-Math.cos(this.orientation),0);
	}

	this.velocity.setScaled(this.velocity, Math.exp(-dt));
	
	this.acceleration.mul(this.invmass);
	
	this.velocity.addScaled(dt, this.acceleration);
	this.position.addScaled(dt, this.velocity);			
}