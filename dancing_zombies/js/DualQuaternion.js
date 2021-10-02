"use strict";

const DualQuaternion = function(q, t) {
  this.q = q || new Vec4(0, 0, 0, 1);
  this.t = t || new Vec4(0, 0, 0, 0);
};

DualQuaternion.prototype.fromMatrix = function(matrix) {

  const m = matrix.storage;
  const t = 1 + m[0] + m[5] + m[10];

  // large enough
  if( t > 0.001)
  {
    const s = Math.sqrt( t) * 2;
    this.q.x = (m[9] - m[6]) / s;
    this.q.y = (m[2] - m[8]) / s;
    this.q.z = (m[4] - m[1]) / s;
    this.q.w = 0.25 * s;
  } // else we have to check several cases
  else if( m[0] > m[5] && m[0] > m[10] )  
  { 
    // Column 0: 
    const s = Math.sqrt( 1 + m[0] - m[5] - m[10]) * 2;
    this.q.x = 0.25 * s;
    this.q.y = (m[4] + m[1]) / s;
    this.q.z = (m[2] + m[8]) / s;
    this.q.w = (m[9] - m[6]) / s;
  } 
  else if( m[5] > m[10]) 
  { 
    // Column 1: 
    const s = Math.sqrt( 1 + m[5] - m[0] - m[10]) * 2;
    this.q.x = (m[4] + m[1]) / s;
    this.q.y = 0.25 * s;
    this.q.z = (m[9] + m[6]) / s;
    this.q.w = (m[2] - m[8]) / s;
  } else 
  { 
    // Column 2:
    const s = Math.sqrt( 1 + m[10] - m[0] - m[5]) * 2;
    this.q.x = (m[2] + m[8]) / s;
    this.q.y = (m[9] + m[6]) / s;
    this.q.z = 0.25 * s;
    this.q.w = (m[4] - m[1]) / s;
  }

  const l = this.q.length();
 // this.q.mul(1/l);

  if(l < 0.99 || l > 1.01){
    console.log("nonononorm");
  }

  let p = new Vec3(m[3], m[7], m[11]);
  this.setTranslation(p);
};

DualQuaternion.prototype.setTranslation = function(t) {
  this.t.x = 0.5*( t.x*this.q.w + t.y*this.q.z - t.z*this.q.y);
  this.t.y = 0.5*(-t.x*this.q.z + t.y*this.q.w + t.z*this.q.x);
  this.t.z = 0.5*( t.x*this.q.y - t.y*this.q.x + t.z*this.q.w);
  this.t.w =-0.5*( t.x*this.q.x + t.y*this.q.y + t.z*this.q.z);
};

DualQuaternion.prototype.setTranslationFromArray = function(t) {
  this.t.x = 0.5*( t[0]*this.q.w + t[1]*this.q.z - t[2]*this.q.y);
  this.t.y = 0.5*(-t[0]*this.q.z + t[1]*this.q.w + t[2]*this.q.x);
  this.t.z = 0.5*( t[0]*this.q.y - t[1]*this.q.x + t[2]*this.q.w);
  this.t.w =-0.5*( t[0]*this.q.x + t[1]*this.q.y + t[2]*this.q.z);
};

DualQuaternion.prototype.setRotationFromArray = function(q) {
  this.q.x = q[1];
  this.q.y = q[2];
  this.q.z = q[3];
  this.q.w = q[0];
};
