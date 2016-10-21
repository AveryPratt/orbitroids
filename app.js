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
  this.point;
  this.len;
  this.extend = function(mult){
    this.len *= mult;
    this.point.x = this.origin.x + (this.point.x - this.origin.x) * mult;
    this.point.y = this.origin.y + (this.point.y - this.origin.y) * mult;
  };
  this.rotate = function(accelRot){
    this.deltaRot += accelRot;
    this.forwardAngle += this.deltaRot;
    this.refineForwardAngle();
    var newX = this.point.x * Math.cos(this.deltaRot) - this.point.y * Math.sin(this.deltaRot);
    var newY = this.point.x * Math.sin(this.deltaRot) + this.point.y * Math.cos(this.deltaRot);
    this.point.x = newX;
    this.point.y = newY;
  };
  this.translate = function(vec){
    this.point.x += vec.point.x - vec.origin.x;
    this.origin.x += vec.point.x - vec.origin.x;
    this.point.y += vec.point.y - vec.origin.y;
    this.origin.y += vec.point.y - vec.origin.y;
  };
  this.combineVectors = function(vec){
    var newPoint = new Point(this.point.x + vec.point.x, this.point.y + vec.point.y);
    return new VecCart(newPoint, this.origin);
  };
}
Vector.prototype = new Rotational(0, 0);
function VecCart(point, origin){
  this.point = point;
  this.origin = origin;
  this.len = Math.sqrt(Math.pow(point.x - origin.x, 2) + Math.pow(point.y - origin.y, 2));
  var dx = (point.x - origin.x) / this.len;
  var dy = (point.y - origin.y) / this.len;
  this.forwardAngle = Math.asin(dx);
  if(dy < 0){
    this.forwardAngle = Math.PI - this.forwardAngle;
    this.refineForwardAngle();
  }
}
VecCart.prototype = new Vector();
function VecCirc(forwardAngle, len, origin){
  this.forwardAngle = forwardAngle;
  this.len = len;
  this.origin = origin;
  this.point = new Point(len * Math.sin(forwardAngle), len * Math.cos(forwardAngle));
}
VecCirc.prototype = new Vector();

function Orbital(center, vel){
  this.center = center;
  this.vel = vel;
  this.accel = new VecCirc(0, 0, new Point(0, 0));
  this.applyGravity = function(planet){
    var distVec = new VecCart(planet.center, this.center);
    var gForce = planet.mass / (Math.pow(distVec.len));
    this.accel = this.accel.combineVectors(new VecCirc(distVec.forwardAngle, gForce, this.center));
    this.vel = this.vel.combineVectors(this.accel);
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
function Ship(center, vel, color){
  this.center = center;
  this.vel = vel;
  this.nose = new VecCart(new Point(this.center.x + 0, this.center.y + -10), this.center);
  this.leftSide = new VecCart(new Point(this.center.x + 4, this.center.y + 5), this.center);
  this.rightSide = new VecCart(new Point(this.center.x + -4, this.center.y + 5), this.center);
  this.thrust = .1;
  this.draw = function(){
    ctx.beginPath();
    ctx.moveTo(this.nose.x, this.nose.y);
    ctx.lineTo(this.leftSide.x, this.leftSide.y);
    ctx.lineTo(this.rightSide.x, this.rightSide.y);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
  };
  this.burn = function(){
    this.accelX += this.thrust * Math.sin(this.forwardAngle);
    this.accelY += this.thrust * Math.cos(this.forwardAngle);
  };
  this.rotate = function(){
    this.forwardAngle += deltaRot;
    if(this.forwardAngle >= Math.PI * 2){
      this.forwardAngle -= Math.PI * 2;
    }
    this.nose.rotate(deltaRot);
    this.leftSide.rotate(deltaRot);
    this.rightSide.rotate(deltaRot);
  };
};
Ship.prototype = new Orbital(new Point(0, 0), new VecCart(new Point(0, 0), new Point(0, 0))); // args for Orbital() constructor: new Point(0, 0), new VecCart(new Point(0, 0), new Point(0, 0))

var planet = new Planet(new Point(canvas.width / 2, canvas.height / 2), canvas.width / 8, 200, 'green');
var ship = new Ship(new Point(planet.center.x, planet.center.y - (planet.radius + 5)), new Point(-1.8, 0), '#ffffff');

ship.x = planet.center.x;
ship.y = planet.center.y - (planet.radius + 10);
ship.deltaX = -1.8;

// function renderFrame(){
//   requestAnimationFrame(renderFrame);
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//
//   planet.draw();
//
//   ship.applyGravity(planet);
//   ship.draw(ctx);
// }
// renderFrame();

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
