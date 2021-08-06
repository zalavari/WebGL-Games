const Wall = function(mesh, horizontal, width, length)
{
	this.gameObject=new GameObject(mesh);
	this.horizontal=horizontal;
	this.width=width;
	this.length=length;
	
	this.gameObject.scale.set(this.length/2, this.width/2, 1);
	if (!horizontal)
		this.gameObject.orientation=Math.PI/2;
	

	this.position = this.gameObject.position; 
	
}


Wall.prototype.draw = function(camera){ 

	//console.log(this.gameObject.scale.x);
	
  this.gameObject.updateModelTransformation();
  Uniforms.trafo.modelMatrix.set().mul(this.gameObject.modelMatrix).mul(camera.viewProjMatrix);
  Uniforms.trafo.viewInv.set().mul(camera.viewProjMatrix).invert();
	//Uniforms.trafo.modelMatrix.set(this.modelMatrix);


  this.gameObject.mesh.draw(); 
};