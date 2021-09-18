const Wall = function(mesh, horizontal, width, length)
{
	GameObject.call(this, mesh);
	
	if (horizontal)
	{
		this.width=width;
		this.length=length;
	}
	else
	{
		this.length=width;
		this.width=length;
	}
	
	this.scale.set(this.length/2, this.width/2, 1);
}

Wall.prototype = Object.create(GameObject.prototype);

Object.defineProperty(Wall.prototype, 'constructor', {
	value: Wall,
	enumerable: false,
	writable: true });
