'use strict';

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function Point(x, y){
  this.x = x;
  this.y = y;
}
function Rotational(forwardAngle, deltaRot){
  this.forwardAngle = forwardAngle;
  this.deltaRot = deltaRot;
  this.rotate = function(){
    this.forwardAngle += deltaRot;
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
  this.len;
  this.dx;
  this.dy;
  this.extend = function(mult){
    this.len *= mult;
    this.head.x = this.origin.x + (this.dx) * mult;
    this.head.y = this.origin.y + (this.dy) * mult;
  };
  this.rotate = function(rot){
    this.forwardAngle += rot;
    this.refineForwardAngle();
    var newDX = this.len * Math.cos(this.forwardAngle);
    var newDY = this.len * Math.sin(this.forwardAngle);
    this.dx = newDX;
    this.dy = newDY;
    this.head.x = this.origin.x + this.dx;
    this.head.y = this.origin.y + this.dy;
  };
  this.translate = function(vec){
    this.head.x += vec.dx;
    this.head.y += vec.dy;
    this.origin.x += vec.dx;
    this.origin.y += vec.dy;
  };
  this.combineVectors = function(vec){
    var newPoint = new Point(this.head.x + vec.dx, this.head.y + vec.dy);
    return new VecCart(newPoint, this.origin);
  };
}
Vector.prototype = new Rotational(0, 0);
function VecCart(head, origin){
  this.head = head;
  this.origin = origin;
  this.dx = this.head.x - this.origin.x;
  this.dy = this.head.y - this.origin.y;
  this.len = Math.sqrt(Math.pow(head.x - origin.x, 2) + Math.pow(head.y - origin.y, 2));
  var ux = this.dx / this.len;
  var uy = this.dy / this.len;
  this.forwardAngle = Math.asin(ux);
  if(uy < 0){
    this.forwardAngle = Math.PI - this.forwardAngle;
    this.refineForwardAngle();
  }
}
VecCart.prototype = new Vector();
function VecCirc(len, origin, forwardAngle){
  this.forwardAngle = forwardAngle;
  this.len = len;
  this.origin = origin;
  this.dx = len * Math.sin(forwardAngle);
  this.dy = len * Math.cos(forwardAngle);
  this.head = new Point(this.origin.x + this.dx, this.origin.y + this.dy);
}
VecCirc.prototype = new Vector();
function Orbital(center, vel){
  this.center = center;
  this.vel = vel;
  this.accel = new VecCirc(0, new Point(0, 0), 0);
  this.applyGravity = function(planet){
    var distVec = new VecCart(planet.center, this.center);
    var force = planet.mass / (Math.pow(distVec.len, 2));
    console.log(force);
    var forceVec = new VecCirc(force, this.center, distVec.forwardAngle);
    this.accel = this.accel.combineVectors(forceVec);
  };
  this.resetAccel = function(){
    this.accel = new VecCirc(0, this.center, this.accel.forwardAngle);
  };
  this.applyMotion = function(){
    this.vel = this.vel.combineVectors(this.accel);
    this.center = this.vel.head;
  };
}
Orbital.prototype = new Rotational(0, 0);

function Planet(center, radius, mass, fillColor){
  this.center = center;
  this.radius = radius;
  this.mass = mass;
  this.draw = function(){
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
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
    this.leftSide = new VecCirc(10, this.center, 5 * Math.PI / 6 + this.forwardAngle);
    this.rightSide = new VecCirc(10, this.center, 7 * Math.PI / 6 + this.forwardAngle);
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
    this.vel = this.vel.combineVectors(this.accel);
    this.center = this.vel.head;
    this.vel = new VecCart(new Point(this.vel.head.x + this.vel.dx, this.vel.head.y + this.vel.dy), this.vel.head);
    this.alignPoints();
  };
  this.alignPoints();
};
Ship.prototype = new Orbital(new Point(0, 0), new VecCart(new Point(0, 0), new Point(0, 0)));

var planet = new Planet(new Point(canvas.width / 2, canvas.height / 2), canvas.width / 8, 200, 'green');
var shipCenter = new Point(planet.center.x, planet.center.y - (planet.radius + 10));
var ship = new Ship(shipCenter, 0, new VecCirc(1.55, shipCenter, Math.PI / 2), '#ffffff');
ship.setDeltaRot(-.03);

function renderFrame(){
  requestAnimationFrame(renderFrame);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  planet.draw();
  ship.resetAccel();
  ship.applyGravity(planet);
  ship.applyMotion();
  ship.rotate(.0001);
  ship.draw(ctx);
}
renderFrame();

function handleKeyDown(event){
  switch(event.keyCode){
  case 38:
    ship.burn();
    break;
  case 37:
    ship.rotateLeft();
    break;
  case 39:
    ship.rotateRight();
    break;
  default:
    break;
  }
}
window.addEventListener('keydown', handleKeyDown);
