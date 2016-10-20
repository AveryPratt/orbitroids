'use strict';

var canvas = document.getElementById('canvas');
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;

var planet = canvas.getContext('2d');
var radius = canvas.width / 8;

var ctx = canvas.getContext('2d');

function Orbital(){
  this.x = centerX;
  this.y = centerY - (radius + 10);
  this.vx = 0;
  this.vy = 0;
  this.ax = 0;
  this.ay = 0;
}

function Shot(){

}

function Asteroid(){
  
}

function Ship(){
  this.draw = function(ctx){
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 5);
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

function renderFrame(){
  requestAnimationFrame(renderFrame);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  planet.beginPath();
  planet.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  planet.fillStyle = 'green';
  planet.fill();

  ship.x += ship.vx;
  ship.y += ship.vy;
  ship.draw(ctx);
}
renderFrame();
