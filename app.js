'use strict';

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var start = false;
var burning = false;
var dampenControls = false;
var rot = 0;
var loaded = false;
var shots = [];
var removeArr = [];

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
    this.delta.y = this.len * Math.cos(this.forwardAngle);
    this.head.x = this.origin.x + this.delta.x;
    this.head.y = this.origin.y + this.delta.y;
  };
  this.translate = function(vec){
    this.head.addDelta(vec.delta);
    this.origin.addDelta(vec.delta);
  };
}
Vector.prototype = new Rotational(0, 0);
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
    var distVec = vecCart(new Point(planet.center.x - this.vel.origin.x, planet.center.y - this.vel.origin.y), this.vel.origin);
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

function Planet(center, radius, mass, fillColor){
  this.center = center;
  this.radius = radius;
  this.mass = mass;
  this.draw = function(){
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = fillColor;
    ctx.fill();
  };
}
function Ship(forwardAngle, deltaRot, vel, col){
  this.flame = false;

  if(forwardAngle){this.forwardAngle = forwardAngle;}
  else{this.forwardAngle = 0;}

  if(deltaRot){this.deltaRot = deltaRot;}
  else{this.deltaRot = 0;}

  if(vel){this.vel = vel;}
  else{this.vel = vecCirc();}

  if(col){this.col = col;}
  else{this.col = '#ffffff';}

  this.accel = vecCirc();

  this.nose;
  this.leftSide;
  this.rightSide;
  this.rear;

  this.draw = function(){
    this.applyMotion();
    ctx.beginPath();
    ctx.moveTo(this.nose.head.x, this.nose.head.y);
    ctx.lineTo(this.leftSide.head.x, this.leftSide.head.y);
    ctx.lineTo(this.vel.origin.x, this.vel.origin.y);
    ctx.lineTo(this.rightSide.head.x, this.rightSide.head.y);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = col;
    ctx.stroke();
    if(this.flame){
      if(dampenControls){
        var mult = .25;
      }
      else mult = .5;
      ctx.beginPath();
      ctx.moveTo(this.vel.origin.x, this.vel.origin.y);
      ctx.lineTo(this.leftSide.head.x - (this.leftSide.delta.x - this.leftSide.delta.x * mult), this.leftSide.head.y - (this.leftSide.delta.y - this.leftSide.delta.y * mult));
      ctx.lineTo(this.rear.head.x - (this.rear.delta.x - this.rear.delta.x * 2 * mult), this.rear.head.y - (this.rear.delta.y - this.rear.delta.y * 2 * mult));
      ctx.lineTo(this.rightSide.head.x - (this.rightSide.delta.x - this.rightSide.delta.x * mult), this.rightSide.head.y - (this.rightSide.delta.y - this.rightSide.delta.y * mult));
      ctx.closePath();
      ctx.lineWidth = 1;
      ctx.fillStyle = '#ff0000';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(this.vel.origin.x, this.vel.origin.y);
      ctx.lineTo(this.leftSide.head.x - (this.leftSide.delta.x - this.leftSide.delta.x * .5 * mult), this.leftSide.head.y - (this.leftSide.delta.y - this.leftSide.delta.y * .5 * mult));
      ctx.lineTo(this.rear.head.x - (this.rear.delta.x - this.rear.delta.x * mult), this.rear.head.y - (this.rear.delta.y - this.rear.delta.y * mult));
      ctx.lineTo(this.rightSide.head.x - (this.rightSide.delta.x - this.rightSide.delta.x * .5 * mult), this.rightSide.head.y - (this.rightSide.delta.y - this.rightSide.delta.y * .5 * mult));
      ctx.closePath();
      ctx.lineWidth = 1;
      ctx.fillStyle = '#ffff00';
      ctx.fill();
    }
  };
  this.alignPoints = function(){
    this.nose = vecCirc(this.forwardAngle, 10, this.vel.origin);
    this.rear = vecCirc(this.forwardAngle - Math.PI, 10, this.vel.origin);
    this.leftSide = vecCirc(this.forwardAngle + 5 * Math.PI / 6, 10, this.vel.origin);
    this.leftSide.refineForwardAngle();
    this.rightSide = vecCirc(this.forwardAngle + 7 * Math.PI / 6, 10, this.vel.origin);
    this.rightSide.refineForwardAngle();
  };
  this.rotate = function(accelRot){
    if(accelRot){this.deltaRot += accelRot;}
    this.forwardAngle += this.deltaRot;
    this.refineForwardAngle();
  };
  this.applyMotion = function(){
    this.vel = addVectors(this.vel, this.accel);
    this.vel = vecCirc(this.vel.forwardAngle, this.vel.len, this.vel.head, this.vel.deltaRot);
    this.alignPoints();
  };
  this.burn = function(force){
    var forceVec = vecCirc(this.forwardAngle, force);
    this.accel = addVectors(this.accel, forceVec);
  };
  this.shoot = function(){
    this.accel = addVectors(this.accel, vecCirc(this.forwardAngle - Math.PI, 1));
    var projection = addVectors(this.vel, vecCirc(this.forwardAngle, 2.5, this.nose.origin));
    new Shot(projection);
  };
  this.alignPoints();
};
Ship.prototype = new Orbital(vecCart(), vecCart(), 0, 0);
function Shot(vel){
  this.vel = vel;
  this.draw = function(){
    ctx.beginPath();
    ctx.arc(this.vel.origin.x, this.vel.origin.y, 1, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  };
  shots.push(this);
}
Shot.prototype = new Orbital(vecCart(), vecCart(), 0, 0);

var planet = new Planet(new Point(canvas.width / 2, canvas.height / 2), canvas.width / 8, 300, '#999999');
var shipVel = vecCirc(0, 0, new Point(planet.center.x, planet.center.y - (planet.radius + 10)));
var ship = new Ship(Math.PI, 0, shipVel, '#ffffff');

function addVectors(vec1, vec2){
  var delta = new Point(vec1.delta.x + vec2.delta.x, vec1.delta.y + vec2.delta.y);
  var origin = new Point(vec1.origin.x, vec1.origin.y);
  return vecCart(delta, origin, vec1.deltaRot);
}
function checkShipPlanetCollision(){
  var noseVec = vecCart(new Point(planet.center.x - ship.nose.head.x, planet.center.y - ship.nose.head.y), planet.center);
  var leftSideVec = vecCart(new Point(planet.center.x - ship.leftSide.head.x, planet.center.y - ship.leftSide.head.y), planet.center);
  var rightSideVec = vecCart(new Point(planet.center.x - ship.rightSide.head.x, planet.center.y - ship.rightSide.head.y), planet.center);
  if(noseVec.len <= planet.radius || leftSideVec.len <= planet.radius || rightSideVec.len <= planet.radius){
    return true;
  }
  else return false;
}
function checkShotCollisions(){
  for (var i = 0; i < shots.length; i++) {
    var distVec = vecCart(new Point(planet.center.x - shots[i].vel.head.x, planet.center.y - shots[i].vel.head.y), planet.center);
    if(distVec.len <= planet.radius){
      removeArr.push(i);
    }
  }
  for (var i = 0; i < removeArr.length; i++) {
    shots.splice(removeArr[i], 1);
  }
  removeArr = [];
}
function checkCollisions(){
  if(checkShipPlanetCollision()){
    ship = null;
  }
  checkShotCollisions();
}

(function renderFrame(){
  requestAnimationFrame(renderFrame);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  checkCollisions();

  planet.draw();
  if(start){
    ship.resetAccel();
    if(loaded){
      ship.shoot();
      loaded = false;
      console.log(shots.length);
    }
    for (var i = 0; i < shots.length; i++) {
      shots[i].resetAccel();
      shots[i].applyGravity(planet);
      shots[i].applyMotion();
      shots[i].draw();
    }
    ship.applyGravity(planet);
    if(burning){
      ship.flame = true;
      if(dampenControls){
        ship.burn(.01);
      }
      else{
        ship.burn(.1);
      }
    }
    else{
      ship.flame = false;
    }
    if(dampenControls){
      ship.rotate(rot / 10);
    }
    else{
      ship.rotate(rot);
    }
  }
  ship.draw();
}());

function handleKeydown(event){
  switch(event.keyCode){
  case 16: // shift
    event.preventDefault();
    dampenControls = true;
    break;
  case 38: // up
    event.preventDefault();
    start = true;
    burning = true;
    break;
  case 37: // left
    event.preventDefault();
    rot = .003;
    break;
  case 39: // right
    event.preventDefault();
    rot = -.003;
    break;
  case 32: // space
    event.preventDefault();
    loaded = true;
  default:
    break;
  }
}
function handleKeyup(event){
  event.preventDefault();
  switch(event.keyCode){
  case 16: // shift
    dampenControls = false;
    break;
  case 38: // up
    burning = false;
    break;
  case 37: // left
    rot = 0;
    break;
  case 39: // right
    rot = 0;
    break;
  default:
    break;
  }
}
window.addEventListener('keydown', handleKeydown);
window.addEventListener('keyup', handleKeyup);
