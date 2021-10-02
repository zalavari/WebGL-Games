"use strict";
const InstancedAnimatedGeometry = function(gl, jsonObject){
  this.gl = gl;

  // vertex buffer
  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(jsonObject.vertices),
    gl.STATIC_DRAW);

  this.vertexTexCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(jsonObject.texturecoords[0]),
    gl.STATIC_DRAW);

  this.vertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(jsonObject.normals),
    gl.STATIC_DRAW);

  const weights = new Float32Array(jsonObject.vertices.length*4);
  const blendIndices = new Uint8Array(jsonObject.vertices.length*4);
  weights.fill(0);
  blendIndices.fill(0);

  const nWeightsPerVertex = new Uint8Array(jsonObject.vertices.length);
  nWeightsPerVertex.fill(0);
  for(let iBone=0; iBone<jsonObject.bones.length; iBone++) {
    for(let iWeight=0; iWeight<jsonObject.bones[iBone].weights.length; iWeight++) {
      const iVertex = jsonObject.bones[iBone].weights[iWeight][0];
      const weight = jsonObject.bones[iBone].weights[iWeight][1];
      weights[ iVertex*4 + nWeightsPerVertex[iVertex] ] = weight;
      blendIndices[ iVertex*4 + nWeightsPerVertex[iVertex] ] = iBone;
      nWeightsPerVertex[iVertex]++;
    }     
  }

  this.blendIndicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.blendIndicesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    blendIndices,
    gl.STATIC_DRAW);

  this.blendWeightsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.blendWeightsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    weights,
    gl.STATIC_DRAW);  

  // index buffer
  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  const indexArray = new Uint16Array(jsonObject.faces.length*3);
  for(let iFace=0; iFace<jsonObject.faces.length; iFace++){
    indexArray[iFace*3] = jsonObject.faces[iFace][0];
    indexArray[iFace*3+1] = jsonObject.faces[iFace][1];
    indexArray[iFace*3+2] = jsonObject.faces[iFace][2];
  }

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    indexArray,
    gl.STATIC_DRAW);

  this.indexCount = indexArray.length;
  // create and bind input layout with input buffer bindings (OpenGL name: vertex array)
  this.inputLayout = gl.createVertexArray();
  gl.bindVertexArray(this.inputLayout);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0,
    3, gl.FLOAT, //< three pieces of float
    false, //< do not normalize (make unit length)
    0, //< tightly packed
    0 //< data starts at array start
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1,
    3, gl.FLOAT, //< three pieces of float
    false, //< do not normalize (make unit length)
    0, //< tightly packed
    0 //< data starts at array start
  ); 

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTexCoordBuffer); 
  gl.enableVertexAttribArray(2); 
  gl.vertexAttribPointer(2, 
    2, gl.FLOAT, //< two pieces of float 
    false, //< do not normalize (make unit length) 
    0, //< tightly packed 
    0 //< data starts at array start 
  ); 

  gl.bindBuffer(gl.ARRAY_BUFFER, this.blendIndicesBuffer);
  gl.enableVertexAttribArray(3);
  gl.vertexAttribIPointer(3,
    4, gl.UNSIGNED_BYTE, //< three pieces of float
    false, //< do not normalize (make unit length)
    0, //< tightly packed
    0 //< data starts at array start
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, this.blendWeightsBuffer);
  gl.enableVertexAttribArray(4);
  gl.vertexAttribPointer(4,
    4, gl.FLOAT, //< three pieces of float
    false, //< do not normalize (make unit length)
    0, //< tightly packed
    0 //< data starts at array start
  );

  gl.bindVertexArray(null);

  this.nBones = jsonObject.bones.length;
  this.rigging = new DualQuaternionArray(this.nBones);
  this.boneNames = [];

  for(let iBone=0; iBone< this.nBones; iBone++){
    this.boneNames.push(jsonObject.bones[iBone].name);
    const offsetMatrix = new Mat4( jsonObject.bones[iBone].offsetmatrix );
    offsetMatrix.transpose();
    this.rigging.at(iBone).fromMatrix(offsetMatrix);
  }
};

InstancedAnimatedGeometry.prototype.draw = function() {
  const gl = this.gl;

  gl.bindVertexArray(this.inputLayout);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);  

  gl.drawElementsInstanced(gl.TRIANGLES,
    this.indexCount, gl.UNSIGNED_SHORT, 0
    , 32
    );
};
