"use strict";

const DualQuaternionArray = function(size) {
  this.qt = new Vec4Array(size*2);
  this.storage = this.qt.storage;
  this.length = size;
};

DualQuaternionArray.prototype.at = function(index){
  return new DualQuaternion(
    this.qt.at(index*2),
    this.qt.at(index*2+1)
    );
};

DualQuaternionArray.prototype.subarray = function(begin, end){
  const result = Object.create(DualQuaternionArray.prototype);
  result.qt = this.qt.subarray(begin*2, end*2);
  result.storage = result.qt.storage;
  result.length = result.storage.length / 8;
  return result;
};

DualQuaternionArray.prototype.fill = function(value){
  for(let i=0; i<this.qt.length; i++){
  	this.qt.at(i*2).set(value.q);
  	this.qt.at(i*2+1).set(value.t);
  }
};

