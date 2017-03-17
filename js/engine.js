'use strict';

orbs.engine = {
  Point: function(x, y){
    this.x = x;
    this.y = y;
    this.convert = function(){
      return {x: orbs.view.center.x + (this.x / orbs.unit), y: orbs.view.center.y - (this.y / orbs.unit)};
    };
  },
  Rotational: function(forwardAngle, deltaRot){
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
  },
  Vector: function(){
    this.origin;
    this.head;
    this.delta;
    this.len;

    this.extend = function(add, mult){
      this.len += add;
      if(typeof mult === 'number'){
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

      var newX = this.len * ((this.delta.x / this.len) * Math.cos(this.forwardAngle) - (this.delta.y / this.len) * Math.sin(this.forwardAngle));
      var newY = this.len * ((this.delta.x / this.len) * Math.sin(this.forwardAngle) + (this.delta.y / this.len) * Math.cos(this.forwardAngle));
      this.delta.x = newX;
      this.delta.y = newY;
      this.head.x = this.origin.x + this.delta.x;
      this.head.y = this.origin.y + this.delta.y;
    };
    this.addVector = function(vec){
      this.delta.x += vec.delta.x;
      this.delta.y += vec.delta.y;
      this.head = new orbs.engine.Point(this.origin.x + this.delta.x, this.origin.y + this.delta.y);
    };
  },

  vecCart: function(head, origin, deltaRot){
    var vec = new orbs.engine.Vector();

    if(origin){vec.origin = origin;
    }else{vec.origin = new orbs.engine.Point(0, 0);}

    if(head){vec.head = head;}
    else{vec.head = new orbs.engine.Point(vec.origin.x, vec.origin.y);}

    if(deltaRot){vec.deltaRot = deltaRot;}
    else{vec.deltaRot = 0;}

    vec.delta = new orbs.engine.Point(vec.head.x - vec.origin.x, vec.head.y - vec.origin.y);
    vec.len = Math.sqrt(Math.pow(vec.delta.x, 2) + Math.pow(vec.delta.y, 2));
    var unitDelta = new orbs.engine.Point(vec.delta.x / vec.len, vec.delta.y / vec.len);
    vec.forwardAngle = Math.asin(unitDelta.x);
    if(unitDelta.y < 0){
      vec.forwardAngle = Math.PI - vec.forwardAngle;
      vec.refineForwardAngle();
    }
    return vec;
  },
  vecDelta: function(delta, origin, deltaRot){
    var vec = new orbs.engine.Vector();

    if(delta){vec.delta = delta;}
    else{vec.delta = new orbs.engine.Point(0, 0);}

    if(origin){vec.origin = origin;
    }else{vec.origin = new orbs.engine.Point(0, 0);}

    if(deltaRot){vec.deltaRot = deltaRot;}
    else{vec.deltaRot = 0;}

    vec.head = new orbs.engine.Point(vec.origin.x + vec.delta.x, vec.origin.y + vec.delta.y);
    vec.len = Math.sqrt(Math.pow(vec.delta.x, 2) + Math.pow(vec.delta.y, 2));
    var unitDelta = new orbs.engine.Point(vec.delta.x / vec.len, vec.delta.y / vec.len);
    vec.forwardAngle = Math.asin(unitDelta.x);
    if(unitDelta.y < 0){
      vec.forwardAngle = Math.PI - vec.forwardAngle;
      vec.refineForwardAngle();
    }
    return vec;
  },
  vecCirc: function(forwardAngle, len, origin, deltaRot){
    var vec = new orbs.engine.Vector();

    if(forwardAngle){vec.forwardAngle = forwardAngle;}
    else{vec.forwardAngle = 0;}

    if(len){vec.len = len;}
    else{vec.len = 0;}

    if(origin){vec.origin = origin;}
    else{vec.origin = new orbs.engine.Point(0, 0);}

    if(deltaRot){vec.deltaRot = deltaRot;}
    else{vec.deltaRot = 0;}

    vec.delta = new orbs.engine.Point(vec.len * Math.sin(vec.forwardAngle), vec.len * Math.cos(vec.forwardAngle));
    vec.head = new orbs.engine.Point(vec.origin.x + vec.delta.x, vec.origin.y + vec.delta.y);

    return vec;
  },
  addVectors: function(vec1, vec2){
    var delta = {
      x: vec1.delta.x + vec2.delta.x,
      y: vec1.delta.y + vec2.delta.y
    };
    return orbs.engine.vecDelta(delta, vec1.origin);
  },

  Orbital: function(vel, accel, forwardAngle, deltaRot){
    if(forwardAngle){this.forwardAngle = forwardAngle;}
    else{this.forwardAngle = 0;}

    if(deltaRot){this.deltaRot = deltaRot;}
    else{this.deltaRot = 0;}

    if(vel){this.vel = vel;}
    else{this.vel = orbs.engine.vecCirc();}

    if(accel){this.accel = accel;}
    else{this.accel = orbs.engine.vecCirc();}

    this.applyGravity = function(planet){
      var distVec = orbs.engine.vecCart(planet.vel.origin, this.vel.origin);
      var force = planet.mass / (Math.pow(distVec.len, 2));
      var forceVec = orbs.engine.vecCirc(distVec.forwardAngle, force, this.vel.origin);
      this.accel.addVector(forceVec);
    };
    this.applyAccel = function(accel){
      this.accel.addVector(accel);
    };
    this.resetAccel = function(){
      this.accel = orbs.engine.vecCirc();
    };
    this.applyMotion = function(){
      this.vel.addVector(this.accel);
      this.vel = orbs.engine.vecDelta(this.vel.delta, this.vel.head, this.vel.deltaRot);
    };
  }
};
orbs.engine.Vector.prototype = new orbs.engine.Rotational(0, 0);
orbs.engine.Orbital.prototype = new orbs.engine.Rotational(0, 0);
