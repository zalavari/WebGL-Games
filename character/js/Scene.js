"use strict";
const Scene = function(gl, canvas) {
  this.canvas = canvas;

  this.vsSkinning = new Shader(gl, gl.VERTEX_SHADER, "skinning_vs.essl");
  this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured_fs.essl");
  this.skinningProgram = new Program(gl, this.vsSkinning, this.fsTextured);

  this.quadGeometry = new QuadGeometry(gl);

  this.vsQuad = new Shader(gl, gl.VERTEX_SHADER, "quad_vs.essl");
  this.fsInterpolate = new Shader(gl, gl.FRAGMENT_SHADER, "interpolate_fs.essl");
  this.interpolationProgram = new Program(gl, this.vsQuad, this.fsInterpolate);
  this.interpolationMaterial = new Material(gl, this.interpolationProgram);

  this.fsChain = new Shader(gl, gl.FRAGMENT_SHADER, "chain_fs.essl");
  this.chainProgram = new Program(gl, this.vsQuad, this.fsChain);
  this.chainMaterial = new Material(gl, this.chainProgram);


  this.timeAtLastFrame = new Date().getTime();
  this.timeAtFirstFrame = this.timeAtLastFrame;  

  this.skinningMaterial = new Material(gl, this.skinningProgram);
  this.skinningMaterial.colorTexture.set(
    new Texture2D(gl, 'media/mrem.jpg'));

  this.gameObjects = [];

  this.camera = new PerspectiveCamera();

  gl.enable(gl.DEPTH_TEST);

  this.multiMesh = new MultiMesh(gl, './media/mrem.json', [this.skinningMaterial], (multiMesh)=>{
    const animatedGeometry = multiMesh.meshes[0].geometry;

    this.gameObjects.push(new GameObject(multiMesh));

    this.animation = new Animation(gl, './media/thriller_part_3.json', animatedGeometry, (animation)=>{

      this.keyTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.keyTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, animation.nKeys*2, animation.nNodes, 0, gl.RGBA, gl.FLOAT, animation.keys.storage);
            
      this.riggingTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.riggingTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, animatedGeometry.nBones*2, 1, 0, gl.RGBA, gl.FLOAT, animatedGeometry.rigging.storage);

      this.skeletonTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.skeletonTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, animatedGeometry.nBones, 1, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, new Uint32Array(animation.skeleton.buffer));
            
      this.nodeQTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.nodeQTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 32, animation.nNodes, 0, gl.RGBA, gl.FLOAT, null);
      this.nodeTTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.nodeTTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 32, animation.nNodes, 0, gl.RGBA, gl.FLOAT, null);  
 
      this.nodeFramebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.nodeFramebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.nodeQTexture, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.nodeTTexture, 0);    
      gl.bindTexture(gl.TEXTURE_2D, null);            

      this.readoutNodes = new Float32Array(32 * animation.nNodes * 4);

      this.boneQTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.boneQTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, animatedGeometry.nBones, 32, 0, gl.RGBA, gl.FLOAT, null);
      this.boneTTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.boneTTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);      
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, animatedGeometry.nBones, 32, 0, gl.RGBA, gl.FLOAT, null);
      gl.bindTexture(gl.TEXTURE_2D, null);            

      this.boneFramebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.boneFramebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.boneQTexture, 0);  
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.boneTTexture, 0);  

      this.readoutBones = new Float32Array(32 * animatedGeometry.nBones * 4);

      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);  

      this.interpolationMaterial.keyTexture.set(this.keyTexture);

      this.chainMaterial.skeletonTexture.set(this.skeletonTexture);
      this.chainMaterial.riggingTexture.set(this.riggingTexture);
      this.chainMaterial.nodeQTexture.set(this.nodeQTexture);
      this.chainMaterial.nodeTTexture.set(this.nodeTTexture);

      this.skinningMaterial.boneQTexture.set(this.boneQTexture);
      this.skinningMaterial.boneTTexture.set(this.boneTTexture);
    });
  });
};

Scene.prototype.update = function(gl, keysPressed) {
  //jshint bitwise:false
  //jshint unused:false
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  const t = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;
  
  if (t<10) return;

  Uniforms.animation.time.set(t);

  // clear the screen
  gl.clearColor(0.6, 0.0, 0.3, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  this.camera.move(dt, keysPressed, this.gameObjects);

  gl.bindFramebuffer(gl.FRAMEBUFFER, this.nodeFramebuffer);
  gl.drawBuffers( [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1] );  
  gl.viewport(0, 0, 32, this.animation.nNodes);
  this.interpolationMaterial.commit();
  this.quadGeometry.draw();

  gl.readPixels(0, 0, 32, this.animation.nNodes, gl.RGBA, gl.FLOAT, this.readoutNodes);

  gl.bindFramebuffer(gl.FRAMEBUFFER, this.boneFramebuffer);
  gl.drawBuffers( [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1] );
  gl.viewport(0, 0, this.multiMesh.meshes[0].geometry.nBones, 32);  
  this.chainMaterial.commit();
  this.quadGeometry.draw();

  gl.readPixels(0, 0, this.multiMesh.meshes[0].geometry.nBones, 32, gl.RGBA, gl.FLOAT, this.readoutBones);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);  
  gl.viewport(0, 0, this.canvas.width, this.canvas.height);

  for(let i=0; i<this.gameObjects.length; i++) {
    this.gameObjects[i].draw(this.camera);
  }

};


