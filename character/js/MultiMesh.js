"use strict";
const MultiMesh = function(gl, jsonModelFileUrl, materials, onDone) {
  gl.pendingResources[jsonModelFileUrl] = ++gl.pendingResources[jsonModelFileUrl] || 1; 
  this.jsonModelFileUrl = jsonModelFileUrl;
  this.gl = gl;
  this.meshes = [];
  this.materials = materials;
  this.onDone = onDone;
  this.request = new XMLHttpRequest();
  this.request.open("GET", jsonModelFileUrl);
  this.request.onreadystatechange = ()=>{ this.loaded(); };
  this.request.send();
};

MultiMesh.prototype.loaded = function() {
  if (this.request.readyState === 4) {
    const meshesJson = JSON.parse(this.request.responseText).meshes;
    for (let i = meshesJson.length - 1; i >= 0; i--) {
      this.meshes.push(
        new Mesh(
          new InstancedAnimatedGeometry(this.gl, meshesJson[i]),
//          new IndexedTrianglesGeometry(this.gl, meshesJson[i]),
          this.materials[i]
        )
      );
    }
    this.onDone(this);
    if( --this.gl.pendingResources[this.jsonModelFileUrl] === 0 ) {
      delete this.gl.pendingResources[this.jsonModelFileUrl];
    }
  }
};

MultiMesh.prototype.draw = function(){
  for (var i = this.meshes.length - 1; i >= 0; i--) {
    this.meshes[i].draw();
  }
};


