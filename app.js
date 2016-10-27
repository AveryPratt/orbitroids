'use strict';

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var start = false;
var burning = false;
var dampenControls = false;
var rot = 0;
var loaded = false;
var asteroids = [];
var shots = [];
var shotRemoveArr = [];
var exploded = false;
var lives = 3;
var planet = new Planet(new Point(canvas.width / 2, canvas.height / 2), canvas.width / 8, 400, '#999999');
var ship;
var gameEnd = false;
var startScreen = true;
var score = 0;

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

  this.trueAnom;

  this.accel = vecCirc();

  this.nose;
  this.leftSide;
  this.rightSide;
  this.rear;

  this.draw = function(){
    if(exploded){
      if(typeof this.explosionCount !== 'number'){
        this.explosionCount = 50;
      }
      else if(this.explosionCount > 0){
        this.explosionCount -= 1;
        ctx.beginPath();
        ctx.arc(this.vel.origin.x, this.vel.origin.y, this.explosionCount / 3.3, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#ff0000';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.vel.origin.x, this.vel.origin.y, this.explosionCount / 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#ff8000';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.vel.origin.x, this.vel.origin.y, this.explosionCount / 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#ffff00';
        ctx.fill();
      }
      else{
        if(!gameEnd){
          lives -= 1;
        }
        exploded = false;
        loaded = false;
        if(lives > 0){
          setShipTop();
        }
        else{
          gameEnd = true;
        }
      }
    }
    else{
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
    this.trueAnom = vecCart(new Point(planet.center.x - this.vel.origin.x, planet.center.y - this.vel.origin.y), planet.origin);
    this.alignPoints();
  };
  this.burn = function(force){
    var forceVec = vecCirc(this.forwardAngle, force);
    this.accel = addVectors(this.accel, forceVec);
  };
  this.shoot = function(){
    this.accel = addVectors(this.accel, vecCirc(this.forwardAngle - Math.PI, 1));
    var projection = addVectors(vecCirc(this.forwardAngle, 2.5, this.nose.head), this.vel);
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
function Asteroid(vel, maxRadius, roughness, deltaRot, forwardAngle){
  if(vel){this.vel = vel;}
  else{this.vel = vecCirc();}

  if(maxRadius){this.maxRadius = maxRadius;}
  else{this.maxRadius = Math.random() * 20 + 20;}

  if(roughness){this.roughness = roughness;}
  else{this.roughness = .5;}

  if(deltaRot){this.deltaRot = deltaRot;}
  else{this.deltaRot = Math.random() / 10 - .05;}

  if(forwardAngle){this.forwardAngle = forwardAngle;}
  else{this.forwardAngle = 0;}

  this.arms = [];
  this.armLengths = [];
  for (var i = 0; i < 1 + Math.sqrt(this.maxRadius); i++) {
    this.armLengths[i] = this.maxRadius - Math.random() * this.maxRadius * this.roughness;
  }
  this.alignPoints = function(){
    for (var i = 0; i < this.armLengths.length; i++) {
      var angle = this.forwardAngle + i * 2 * Math.PI / (1 + Math.sqrt(this.maxRadius));
      this.arms[i] = vecCirc(angle, this.armLengths[i], this.vel.origin, this.deltaRot);
    }
  };
  this.draw = function(){
    this.rotate();
    this.alignPoints();
    ctx.beginPath();
    ctx.moveTo(this.arms[this.arms.length - 1].head.x, this.arms[this.arms.length - 1].head.y);
    for (var i = 0; i < this.arms.length; i++) {
      ctx.lineTo(this.arms[i].head.x, this.arms[i].head.y);
    }
    ctx.closePath();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  };
  this.rotate = function(accelRot){
    if(accelRot){this.deltaRot += accelRot;}
    this.forwardAngle += this.deltaRot;
    this.refineForwardAngle();
  };
  this.alignPoints();
  asteroids.push(this);
}
Asteroid.prototype = new Orbital(vecCart(), vecCart(), 0, 0);
function Life(vel, deltaRot, forwardAngle){
  if(vel){this.vel = vel;}
  else{this.vel = vecCirc();}

  if(deltaRot){this.deltaRot = deltaRot;}
  else{this.deltaRot = Math.random() / 10 - .05;}

  if(forwardAngle){this.forwardAngle = forwardAngle;}
  else{this.forwardAngle = 0;}

  this.draw = function(){

  }
}
Life.prototype = new Orbital(vecCart(), vecCart(), 0, 0);

function newRad(oldRad){
  return (Math.random() + .5) * oldRad / 2;
}
function removeShot(index){
  shotRemoveArr.push(index);
  for (var i = 0; i < shotRemoveArr.length; i++) {
    shots.splice(shotRemoveArr[i], 1);
  }
  shotRemoveArr = [];
}
function explodeAsteroid(index, tangentAngle){
  if(asteroids[index].maxRadius >= 10){
    var parentAsteroid = asteroids[index];
    asteroids.splice(index, 1);
    var rad1 = newRad(parentAsteroid.maxRadius);
    var rad2 = newRad(parentAsteroid.maxRadius);
    var newVec1 = addVectors(parentAsteroid.vel, vecCirc(parentAsteroid.forwardAngle, 3 / rad1));
    var newVec2 = addVectors(parentAsteroid.vel, vecCirc(parentAsteroid.forwardAngle, 3 / rad2));
    if(tangentAngle){
      var bounce = vecCirc(tangentAngle, -Math.abs(Math.cos(tangentAngle - parentAsteroid.vel.forwardAngle)));
      newVec1 = addVectors(newVec1, bounce);
      newVec1.refineForwardAngle();
      newVec2 = addVectors(newVec2, bounce);
      newVec2.refineForwardAngle();
      // forwardAngle, len, origin, deltaRot
    }
    new Asteroid(newVec1, rad1);
    new Asteroid(newVec2, rad2);
  }
  else asteroids.splice(index, 1);
}
function addVectors(vec1, vec2){
  var delta = new Point(vec1.delta.x + vec2.delta.x, vec1.delta.y + vec2.delta.y);
  var origin = new Point(vec1.origin.x, vec1.origin.y);
  return vecCart(delta, origin, vec1.deltaRot);
}
function checkShipEscaped(){
  if(ship.vel.origin.x <= 0 || ship.vel.origin.x >= canvas.width || ship.vel.origin.y <= 0 || ship.vel.origin.y >= canvas.height){
    return true;
  }
  else return false;
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
function checkShotPlanetCollisions(){
  for (var i = 0; i < shots.length; i++) {
    var distVec = vecCart(new Point(planet.center.x - shots[i].vel.origin.x, planet.center.y - shots[i].vel.origin.y), planet.center);
    if(distVec.len <= planet.radius){
      removeShot(i);
    }
  }
}
function checkAsteroidPlanetCollisions(){
  for (var i = 0; i < asteroids.length; i++) {
    var distVec = vecCart(new Point(planet.center.x - asteroids[i].vel.origin.x, planet.center.y - asteroids[i].vel.origin.y), planet.center);
    if(distVec.len <= planet.radius + asteroids[i].maxRadius){
      explodeAsteroid(i, distVec.forwardAngle);
    }
  }
}
function checkAsteroidShipCollision(){
  if(!exploded){
    for (var i = 0; i < asteroids.length; i++) {
      var noseVec = vecCart(new Point(asteroids[i].vel.origin.x - ship.nose.head.x, asteroids[i].vel.origin.y - ship.nose.head.y), asteroids[i].vel.origin);
      var leftSideVec = vecCart(new Point(asteroids[i].vel.origin.x - ship.leftSide.head.x, asteroids[i].vel.origin.y - ship.leftSide.head.y), asteroids[i].vel.origin);
      var rightSideVec = vecCart(new Point(asteroids[i].vel.origin.x - ship.rightSide.head.x, asteroids[i].vel.origin.y - ship.rightSide.head.y), asteroids[i].vel.origin);
      if(noseVec.len <= asteroids[i].maxRadius || leftSideVec.len <= asteroids[i].maxRadius || rightSideVec.len <= asteroids[i].maxRadius){
        exploded = true;
        explodeAsteroid(i);
      }
    }
  }
}
function checkShotAsteroidCollisions(){
  for (var i = 0; i < asteroids.length; i++) {
    for (var j = 0; j < shots.length; j++) {
      var delta = new Point(asteroids[i].vel.origin.x - shots[j].vel.origin.x, asteroids[i].vel.origin.y - shots[j].vel.origin.y);
      var distVec = vecCart(delta, shots[j].vel.origin);
      if(distVec.len < asteroids[i].maxRadius){
        if(!gameEnd){
          score += 5;
        }
        explodeAsteroid(i);
        removeShot(j);
      }
    }
  }
}
function checkCollisions(){
  if(checkShipPlanetCollision() || checkShipEscaped()){
    exploded = true;
  }
  checkAsteroidShipCollision();
  checkShotPlanetCollisions();
  checkShotAsteroidCollisions();
  checkAsteroidPlanetCollisions();
}
function checkcomplete(){
  for (var i = 0; i < asteroids.length; i++) {
    if(asteroids[i].vel.origin.x < canvas.width && asteroids[i].vel.origin.y < canvas.height && asteroids[i].vel.origin.x > 0 && asteroids[i].vel.origin.y > 0){
      return false;
    }
  }
  return true;
}

function setShipTop(){
  start = false;
  var shipVel = vecCirc(0, 0, new Point(planet.center.x, planet.center.y - (planet.radius + 10)));
  ship = new Ship(Math.PI, 0, shipVel, '#ffffff');
}
function launchAsteroid(maxRadius){
  if(!start){
    var startingPointVec = vecCirc(Math.random() * 2 * Math.PI, canvas.width / 4, planet.center);
  }
  else{
    startingPointVec = vecCirc(ship.trueAnom.forwardAngle, canvas.width / 4, planet.center);
  }
  if(Math.random() > .5){
    var prograde = startingPointVec.forwardAngle + Math.PI / 2;
  }
  else prograde = startingPointVec.forwardAngle - Math.PI / 2;
  var asteroidVel = vecCirc(prograde, 1.65, startingPointVec.head);
  new Asteroid(asteroidVel, maxRadius);
};

setShipTop();
launchAsteroid();
(function renderFrame(){
  requestAnimationFrame(renderFrame);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if(startScreen){
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press any key to start', canvas.width / 2, canvas.height / 2);
  }
  else{
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.strokeText('lives: ' + lives, 10, 18);
    checkCollisions();

    ctx.textAlign = 'right';
    ctx.strokeText('score: ' + score, canvas.width - 10, 18)

    planet.draw();
    ship.resetAccel();
    if(loaded && !exploded){
      ship.shoot();
      loaded = false;
    }
    for (var i = 0; i < asteroids.length; i++) {
      asteroids[i].resetAccel();
      asteroids[i].applyGravity(planet);
      asteroids[i].applyMotion();
      asteroids[i].draw();
    }
    for (var i = 0; i < shots.length; i++) {
      shots[i].resetAccel();
      shots[i].applyGravity(planet);
      shots[i].applyMotion();
      shots[i].draw();
    }
    if(gameEnd){
      ctx.fillStyle = '#000000';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    }
    else{
      if(start){
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
      if(checkcomplete()){3
        launchAsteroid();
      }
    }
  }
}());

function handleKeydown(event){
  if(startScreen){
    event.preventDefault();
    startScreen = false;
  }
  else{
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
