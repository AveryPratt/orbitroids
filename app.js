'use strict';

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var start = false;
var burning = false;
var dampenControls = false;
var rot = 0;
var loaded = false;
var shots = [];

function Point(x, y){
  this.x = x;
  this.y = y;
  this.addDelta = function(point){
    this.x += point.x;
    this.y += point.y;
  };
  this.getDelta = function(point){
    return new Point(point.x - this.x, point.y - this.y);
  };
}
function Rotational(forwardAngle, deltaRot){
  this.forwardAngle = forwardAngle;
  this.deltaRot = deltaRot;
  this.rotate = function(accelRot){
    this.deltaRot += accelRot;
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
  this.extend = function(mult){
    this.len *= mult;
    this.delta.x *= mult;
    this.delta.y *= mult;
    this.head.x = this.origin.x + this.delta.x;
    this.head.y = this.origin.y + this.delta.y;
  };
  this.rotate = function(accelRot){
    this.deltaRot += accelRot;
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
  this.addVec = function(vec){
    this.head.addDelta(vec.delta);
  };
}
Vector.prototype = new Rotational(0, 0);
function VecCart(head, origin){
  this.head = head;
  this.origin = origin;
  this.delta = this.head.getDelta(this.origin);
  this.len = Math.sqrt(Math.pow(this.delta.x, 2) + Math.pow(this.delta.y, 2));
  var unitDX = this.delta.x / this.len;
  var unitDY = this.delta.y / this.len;
  this.forwardAngle = Math.asin(unitDX);
  if(unitDY < 0){
    this.forwardAngle = Math.PI - this.forwardAngle;
    this.refineForwardAngle();
  }
}
VecCart.prototype = new Vector();
function VecCirc(len, origin, forwardAngle){
  this.forwardAngle = forwardAngle;
  this.len = len;
  this.origin = origin;
  this.delta = new Point(len * Math.cos(this.forwardAngle), len * Math.sin(this.forwardAngle));
  this.head = new Point(this.origin.x + this.delta.x, this.origin.y + this.delta.y);
}
VecCirc.prototype = new Vector();
function Orbital(center, vel){
  this.center = center;
  this.vel = vel;
  this.accel = new VecCirc(0, new Point(0, 0), 0);
  this.applyGravity = function(planet){
    var distVec = new VecCart(planet.center, this.center);
    var force = planet.mass / (Math.pow(distVec.len, 2));
    var forceVec = new VecCirc(force, this.center, distVec.forwardAngle);
    this.accel.addVec(forceVec);
  };
  this.resetAccel = function(){
    this.accel = new VecCirc(0, this.center, this.accel.forwardAngle);
  };
  this.applyMotion = function(){
    this.vel.addVec(this.accel);
    this.center = this.vel.head;
    this.vel = new VecCart(new Point(this.vel.head.x + this.vel.delta.x, this.vel.head.y + this.vel.delta.y), this.vel.head);
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
function Ship(center, forwardAngle, vel, color){
  this.center = center;
  this.forwardAngle = forwardAngle;
  this.vel = vel;
  this.thrust = .1;
  this.nose;
  this.leftSide;
  this.rightSide;
  this.draw = function(){
    ctx.beginPath();
    ctx.moveTo(this.nose.head.x, this.nose.head.y);
    ctx.lineTo(this.leftSide.head.x, this.leftSide.head.y);
    ctx.lineTo(this.center.x, this.center.y);
    ctx.lineTo(this.rightSide.head.x, this.rightSide.head.y);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
  };
  this.alignPoints = function(){
    this.nose = new VecCirc(10, this.center, this.forwardAngle);
    this.leftSide = new VecCirc(10, this.center, this.forwardAngle + 5 * Math.PI / 6);
    this.rightSide = new VecCirc(10, this.center, this.forwardAngle + 7 * Math.PI / 6);
  };
  this.rotate = function(accelRot){
    this.deltaRot += accelRot;
    this.forwardAngle += this.deltaRot;
    this.refineForwardAngle();
    this.nose.rotate(this.deltaRot);
    this.leftSide.rotate(this.deltaRot);
    this.rightSide.rotate(this.deltaRot);
  };
  this.setDeltaRot = function(deltaRot){
    this.deltaRot = deltaRot;
    this.nose.deltaRot = deltaRot;
    this.leftSide.deltaRot = deltaRot;
    this.rightSide.deltaRot = deltaRot;
  };
  this.applyMotion = function(){
    this.vel.addVec(this.accel);
    this.center = this.vel.head;
    this.vel = new VecCart(new Point(this.vel.head.x + this.vel.delta.x, this.vel.head.y + this.vel.delta.y), this.vel.head);
    this.alignPoints();
  };
  this.burn = function(accelVec){
    this.accel.addVec(accelVec);
  };
  this.shoot = function(kickback){
    this.accel.addVec(kickback);
    var projection = new VecCirc(2.5, this.nose.head, this.forwardAngle).addVec(this.vel);
    new Shot(projection);
  };
  this.alignPoints();
};
Ship.prototype = new Orbital(new Point(0, 0), new VecCart(new Point(0, 0), new Point(0, 0)));
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
Shot.prototype = new Orbital(new Point(0, 0), new VecCart(new Point(0, 0), new Point(0, 0)));

var planet = new Planet(new Point(canvas.width / 2, canvas.height / 2), canvas.width / 8, 200, 'orange');
var shipCenter = new Point(planet.center.x, planet.center.y - (planet.radius + 10));
var ship = new Ship(shipCenter, 0, new VecCirc(0, shipCenter, 0), '#ffffff');
ship.setDeltaRot(0);

function renderFrame(){
  requestAnimationFrame(renderFrame);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  planet.draw();
  if(start){
    ship.resetAccel();
    if(loaded){
      ship.shoot(new VecCirc(1, ship.center, ship.forwardAngle));
      loaded = false;
    }
    for (var i = 0; i < shots.length; i++) {
      shots[i].resetAccel();
      shots[i].applyGravity(planet);
      shots[i].applyMotion();
      shots[i].draw();
    }
    if(burning){
      if(dampenControls){
        ship.burn(new VecCirc(.01, ship.center, ship.forwardAngle));
      }
      else{
        ship.burn(new VecCirc(.1, ship.center, ship.forwardAngle));
      }
    }
    ship.applyGravity(planet);
    ship.applyMotion();
    if(dampenControls){
      ship.rotate(rot / 10);
    }
    else{
      ship.rotate(rot);
    }
  }
  ship.draw(ctx);
  console.log('forward angle: ' + ship.forwardAngle);
}
renderFrame();

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
  case 32:
    event.preventDefault();
    loaded = true;
    console.log('spacebar pressed');
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
