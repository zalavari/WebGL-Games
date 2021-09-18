const GameObject = function(mesh) { 
  this.mesh = mesh;

  this.position = new Vec3(0, 0, 0); 
  this.orientation = 0; 
  this.scale = new Vec3(1, 1, 1); 

  this.modelMatrix = new Mat4(); 
  
  this.velocity = new Vec3();
  this.acceleration = new Vec3();
  
  this.timeToLive=3;//used by tank, ball, animation  
  this.radius=0.1; //used by tank, ball
};


GameObject.prototype.updateModelTransformation = function(){ 

	this.modelMatrix=(new Mat4()).scale(this.scale).rotate(this.orientation).translate(this.position);
};

GameObject.prototype.draw = function(camera){ 
  this.updateModelTransformation();
  Uniforms.trafo.modelMatrix.set().mul(this.modelMatrix).mul(camera.viewProjMatrix);
  Uniforms.trafo.viewInv.set().mul(camera.viewProjMatrix).invert();

  this.mesh.draw(); 
};

GameObject.prototype.move = function(t, dt, keysPressed, gameObjects) {

	this.position.addScaled(dt,this.velocity);
}

GameObject.prototype.bounce = function(walls)
{
	
	for (let i=0; i<walls.length; i++)
	{
		let wall=walls[i];
		let deltax = Math.abs(wall.position.x-this.position.x);
		let deltay = Math.abs(wall.position.y-this.position.y);
		
		if (deltax<wall.length/2+this.radius) //Falra merőleges irányban van-e?
		{
			if (Math.abs(deltay-wall.width/2)<this.radius)	//Elég közel van-e a fal széléhez?
				if (wall.position.y<this.position.y && this.velocity.y<0 || wall.position.y>this.position.y && this.velocity.y>0) //fal felé halad-e?
				{
					this.velocity.y=-this.velocity.y;
				}
		}	
	
		if (deltay<wall.width/2+this.radius) //Falra merőleges irányban van-e?
		{
			if (Math.abs(deltax-wall.length/2)<this.radius)	//Elég közel van-e a fal széléhez?
				if (wall.position.x<this.position.x && this.velocity.x<0 || wall.position.x>this.position.x && this.velocity.x>0) //fal felé halad-e?
				{
					this.velocity.x=-this.velocity.x;
				}					
		}
		
	}
}
