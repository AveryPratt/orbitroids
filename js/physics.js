'use strict';

function Point(x, y){
  this.x = x;
  this.y = y;
}
function Rotational(forwardAngle, deltaRot){
  this.forwardAngle = forwardAngle;
  this.deltaRot = deltaRot;

  this.rotate = function(accelRot){
    if(accelRot){this.deltaRot += accelRot;}
    this.forwardAngle += this.deltaRot;
    this.refineForwardAngle();
  };
  this.refineForwardAngle = function(){
    while(this.forwardAngle >= Math.PI * 2){
      this.forwardAngle -= Math.PI * 2;
    }
    while(this.forwardAngle < 0){
      this.forwardAngle += Math.PI * 2;
    }
  };
}
function Vector(){
  this.origin;
  this.head;
  this.delta;
  this.len;

  this.extend = function(add, mult){
    this.len += add;
    if(mult === 0){
      this.len = 0;
    }
    else if(mult){
      this.len *= mult;
    }
    this.delta.x *= mult;
    this.delta.y *= mult;
    this.head.x = this.origin.x + this.delta.x;
    this.head.y = this.origin.y + this.delta.y;
  };
  this.rotate = function(accelRot){
    if(accelRot){this.deltaRot += accelRot;}
    this.forwardAngle += this.deltaRot;
    this.refineForwardAngle();

    this.delta.x = this.len * Math.sin(this.forwardAngle);
    this.delta.y = -this.len * Math.cos(this.forwardAngle);
    this.head.x = this.origin.x + this.delta.x;
    this.head.y = this.origin.y + this.delta.y;
  };
  this.translate = function(vec){
    this.head.addDelta(vec.delta);
    this.origin.addDelta(vec.delta);
  };
}
Vector.prototype = new Rotational(0, 0);
function Orbital(vel, accel, forwardAngle, deltaRot){
  if(forwardAngle){this.forwardAngle = forwardAngle;}
  else{this.forwardAngle = 0;}

  if(deltaRot){this.deltaRot = deltaRot;}
  else{this.deltaRot = 0;}

  if(vel){this.vel = vel;}
  else{this.vel = vecCirc();}

  if(accel){this.accel = accel;}
  else{this.accel = vecCirc();}

  this.applyGravity = function(planet){
    var distVec = vecCart(new Point(planet.vel.origin.x - this.vel.origin.x, planet.vel.origin.y - this.vel.origin.y), this.vel.origin);
    var force = planet.mass / (Math.pow(distVec.len, 2));
    var forceVec = vecCirc(distVec.forwardAngle, force, this.vel.origin);
    this.accel = addVectors(this.accel, forceVec);
  };
  this.applyAccel = function(accel){
    this.accel = addVectors(this.accel, accel);
  };
  this.resetAccel = function(){
    this.accel = vecCirc();
  };
  this.applyMotion = function(){
    this.vel = addVectors(this.vel, this.accel);
    this.vel = vecCart(this.vel.delta, this.vel.head, this.vel.deltaRot);
  };
}
Orbital.prototype = new Rotational(0, 0);

function vecCart(delta, origin, deltaRot){
  var vec = new Vector();

  if(delta){vec.delta = delta;}
  else{vec.delta = new Point(0, 0);}

  if(origin){vec.origin = origin;
  }else{vec.origin = new Point(0, 0);}

  if(deltaRot){vec.deltaRot = deltaRot;}
  else{vec.deltaRot = 0;}

  vec.head = new Point(vec.origin.x + vec.delta.x, vec.origin.y + vec.delta.y);
  vec.len = Math.sqrt(Math.pow(vec.delta.x, 2) + Math.pow(vec.delta.y, 2));
  var unitDelta = new Point(vec.delta.x / vec.len, vec.delta.y / vec.len);
  vec.forwardAngle = Math.asin(unitDelta.x);
  if(unitDelta.y < 0){
    vec.forwardAngle = Math.PI - vec.forwardAngle;
    vec.refineForwardAngle();
  }
  return vec;
}
function vecCirc(forwardAngle, len, origin, deltaRot){
  var vec = new Vector();

  if(forwardAngle){vec.forwardAngle = forwardAngle;}
  else{vec.forwardAngle = 0;}

  if(len){vec.len = len;}
  else{vec.len = 0;}

  if(origin){vec.origin = origin;}
  else{vec.origin = new Point(0, 0);}

  if(deltaRot){vec.deltaRot = deltaRot;}
  else{vec.deltaRot = 0;}

  vec.delta = new Point(vec.len * Math.sin(vec.forwardAngle), vec.len * Math.cos(vec.forwardAngle));
  vec.head = new Point(vec.origin.x + vec.delta.x, vec.origin.y + vec.delta.y);

  return vec;
}
function addVectors(vec1, vec2){
  var delta = new Point(vec1.delta.x + vec2.delta.x, vec1.delta.y + vec2.delta.y);
  var origin = new Point(vec1.origin.x, vec1.origin.y);
  return vecCart(delta, origin, vec1.deltaRot);
}
