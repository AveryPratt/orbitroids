'use strict';

var canvas = document.getElementById('canvas');
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;

var planet = canvas.getContext('2d');
var radius = canvas.width / 8;
var mass = 200;

var ctx = canvas.getContext('2d');

function Orbital(){
  this.x = 0;
  this.y = 0;
  this.vx = 0;
  this.vy = 0;
  this.ax = 0;
  this.ay = 0;
  this.applyGravity = function(){
    var distX = centerX - this.x;
    var distY = centerY - this.y;
    var dist = Math.sqrt(distX * distX + distY * distY);
    var force = mass / (dist * dist);
    this.ax = force * (distX / dist);
    this.ay = force * (distY / dist);
  };
}

function Shot(){

}

function Asteroid(){

}

function Ship(){
  this.draw = function(ctx){
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 10);
    ctx.lineTo(this.x - 4, this.y + 5);
    ctx.lineTo(this.x + 4, this.y + 5);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  };
};
Ship.prototype = new Orbital();
var ship = new Ship();
var ship2 = new Ship();

ship.x = centerX;
ship.y = centerY - ((canvas.width / 8) + 10);
ship.vx = -1.8;

ship2.x = centerX;
ship2.y = centerY + ((canvas.width / 8) + 100);
ship2.vx = -1;

function renderFrame(){
  requestAnimationFrame(renderFrame);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  planet.beginPath();
  planet.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  planet.fillStyle = 'green';
  planet.fill();

  ship.applyGravity();
  ship.vx += ship.ax;
  ship.vy += ship.ay;
  ship.x += ship.vx;
  ship.y += ship.vy;
  ship.draw(ctx);

  ship2.applyGravity();
  ship2.vx += ship2.ax;
  ship2.vy += ship2.ay;
  ship2.x += ship2.vx;
  ship2.y += ship2.vy;
  ship2.draw(ctx);
}
renderFrame();
