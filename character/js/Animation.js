"use strict";
const Animation = function(gl, jsonModelFileUrl, geometry, onDone) {
  gl.pendingResources[jsonModelFileUrl] = ++gl.pendingResources[jsonModelFileUrl] || 1;  
  this.jsonModelFileUrl = jsonModelFileUrl;
  this.gl = gl;
  this.geometry = geometry;
  this.onDone = onDone;
  this.request = new XMLHttpRequest();
  this.request.open("GET", jsonModelFileUrl);
  this.request.onreadystatechange = () => { this.loaded(); };
  this.request.send();

};

Animation.prototype.loaded = function() {
  if (this.request.readyState === 4) {
    const jsonObject = JSON.parse(this.request.responseText);
    this.skeleton = new Uint8Array(this.geometry.nBones*16);
    this.skeleton.fill(255);
    this.nodeNamesToNodeIndices = {};
    this.nodeNamesToNodes = {};
    this.boneTransformationChainNodeIndices =
      new Array(this.geometry.nBones).fill(null).map(() => { return [] });
    this.nNodes = 0;
    this.processNode(jsonObject.rootnode);

    this.nKeys = 768;    
    this.keys = new DualQuaternionArray(this.nNodes * this.nKeys);

    for(let nodeName in this.nodeNamesToNodeIndices){
      const node = this.nodeNamesToNodes[nodeName];
      const dq = new DualQuaternion();
      dq.fromMatrix(new Mat4(node.transformation).transpose());
      this.keys.subarray(
        this.nodeNamesToNodeIndices[nodeName] * this.nKeys,
        this.nodeNamesToNodeIndices[nodeName] * this.nKeys +  this.nKeys).fill(dq);
    }    

    for(let iAnim=0; iAnim<jsonObject.animations.length; iAnim++) {
      const animation = jsonObject.animations[iAnim];
      for(let iChannel=0; iChannel< animation.channels.length; iChannel++) {
        const channel = animation.channels[iChannel];
        const iNode = this.nodeNamesToNodeIndices[channel.name];
        for(let iKey = 0; iKey< channel.rotationkeys.length; iKey++) {
          const dq = this.keys.at(iNode * this.nKeys + iKey);
          dq.setRotationFromArray( channel.rotationkeys[iKey][1] );
          dq.setTranslationFromArray( channel.positionkeys[(iKey<channel.positionkeys.length)?iKey:(channel.positionkeys.length-1)][1] );
        }
      }
    }
    this.onDone(this);
    if( --this.gl.pendingResources[this.jsonModelFileUrl] === 0 ) {
      delete this.gl.pendingResources[this.jsonModelFileUrl];
    }    
  }
};

Animation.prototype.processNode = function(node) {
  this.nodeNamesToNodeIndices[node.name] = this.nNodes;
  this.nodeNamesToNodes[node.name] = node;  
  this.nNodes++;
  const iBone = this.geometry.boneNames.indexOf(node.name);
  if(iBone >= 0){
    let pNode = node;
    while(pNode){
      const pNodeIndex = this.nodeNamesToNodeIndices[pNode.name];
      this.skeleton[iBone * 16 +
         this.boneTransformationChainNodeIndices[iBone].length] =
            pNodeIndex;
      this.boneTransformationChainNodeIndices[iBone].push( pNodeIndex );
      pNode = pNode.parent;
    }
  }
  if(node.children){
    for(let iChild=0; iChild < node.children.length; iChild++) {
      node.children[iChild].parent = node;
      this.processNode(node.children[iChild]);
    }
  }
};