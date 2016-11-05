'use strict';

function Planet(mass, radius, vel, deltaRot, col){
  if(vel){this.vel = vel;}
  else{this.vel = vecCirc();}

  if(deltaRot){this.deltaRot = deltaRot;}
  else{this.deltaRot = 0;}

  if(col){this.col = col;}
  else{this.col = '#ffffff';}

  this.radius = radius;
  this.mass = mass;
  this.draw = function(){
    ctx.beginPath();
    var planetSunVec = vecCirc(sunAngle, this.radius * .8, this.vel.origin);
    var planetGrd = ctx.createRadialGradient(planetSunVec.head.x, planetSunVec.head.y, 0, planetSunVec.head.x, planetSunVec.head.y, this.radius * 1.2);
    planetGrd.addColorStop(0, 'rgba(255, 127, 0, 1)');
    planetGrd.addColorStop(1, 'rgba(12, 0, 12, 1)');
    ctx.arc(this.vel.origin.x, this.vel.origin.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = planetGrd;
    ctx.fill();
    var atmoSunVec = vecCirc(sunAngle, this.radius, this.vel.origin);
    var atmoGrd = ctx.createRadialGradient(atmoSunVec.head.x, atmoSunVec.head.y, 0, this.vel.origin.x, this.vel.origin.y, this.radius * 1.2);
    atmoGrd.addColorStop(0, 'rgba(127, 127, 255, .7)');
    atmoGrd.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.arc(this.vel.origin.x, this.vel.origin.y, radius * 1.2, 0, 2 * Math.PI, false);
    ctx.fillStyle = atmoGrd;
    ctx.fill();
  };
}
Planet.prototype = new Orbital(vecCart(), vecCart(), 0, 0);
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

  this.trueAnom = 0;

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
        if(!paused){
          this.explosionCount -= 1;
        }
        ctx.beginPath();
        ctx.arc(this.vel.origin.x, this.vel.origin.y, this.explosionCount * u / 3.3, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#ff0000';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.vel.origin.x, this.vel.origin.y, this.explosionCount * u / 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#ff8000';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.vel.origin.x, this.vel.origin.y, this.explosionCount * u / 10, 0, 2 * Math.PI, false);
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
      ctx.beginPath();
      ctx.moveTo(this.nose.head.x, this.nose.head.y);
      ctx.lineTo(this.leftSide.head.x, this.leftSide.head.y);
      ctx.lineTo(this.vel.origin.x, this.vel.origin.y);
      ctx.lineTo(this.rightSide.head.x, this.rightSide.head.y);
      ctx.closePath();
      ctx.lineWidth = 1 * u;
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
        ctx.lineWidth = 1 * u;
        ctx.fillStyle = '#ff0000';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.vel.origin.x, this.vel.origin.y);
        ctx.lineTo(this.leftSide.head.x - (this.leftSide.delta.x - this.leftSide.delta.x * .5 * mult), this.leftSide.head.y - (this.leftSide.delta.y - this.leftSide.delta.y * .5 * mult));
        ctx.lineTo(this.rear.head.x - (this.rear.delta.x - this.rear.delta.x * mult), this.rear.head.y - (this.rear.delta.y - this.rear.delta.y * mult));
        ctx.lineTo(this.rightSide.head.x - (this.rightSide.delta.x - this.rightSide.delta.x * .5 * mult), this.rightSide.head.y - (this.rightSide.delta.y - this.rightSide.delta.y * .5 * mult));
        ctx.closePath();
        ctx.lineWidth = 1 * u;
        ctx.fillStyle = '#ffff00';
        ctx.fill();
      }
    }
  };
  this.alignPoints = function(){
    this.nose = vecCirc(this.forwardAngle, 10 * u, this.vel.origin);
    this.rear = vecCirc(this.forwardAngle - Math.PI, 10 * u, this.vel.origin);
    this.leftSide = vecCirc(this.forwardAngle + 5 * Math.PI / 6, 10 * u, this.vel.origin);
    this.leftSide.refineForwardAngle();
    this.rightSide = vecCirc(this.forwardAngle + 7 * Math.PI / 6, 10 * u, this.vel.origin);
    this.rightSide.refineForwardAngle();
  };
  this.rotate = function(accelRot){
    if(accelRot){
      if(accelRot < 0 && this.deltaRot > -.2){this.deltaRot += accelRot;}
      else if(accelRot > 0 && this.deltaRot < .2){this.deltaRot += accelRot;}
    }
    this.forwardAngle += this.deltaRot;
    this.refineForwardAngle();
  };
  this.applyMotion = function(){
    this.vel = addVectors(this.vel, this.accel);
    this.vel = vecCirc(this.vel.forwardAngle, this.vel.len, this.vel.head, this.vel.deltaRot);
    this.trueAnom = vecCart(new Point(planet.vel.origin.x - this.vel.origin.x, planet.vel.origin.y - this.vel.origin.y), planet.origin);
    if(!this.trueAnom.forwardAngle){
      this.trueAnom.forwardAngle = 0;
    }
    this.alignPoints();
  };
  this.burn = function(force){
    var forceVec = vecCirc(this.forwardAngle, force);
    this.accel = addVectors(this.accel, forceVec);
  };
  this.shoot = function(){
    this.accel = addVectors(this.accel, vecCirc(this.forwardAngle - Math.PI, .5 * u));
    var projection = addVectors(vecCirc(this.forwardAngle, 2.5 * u, this.nose.head), this.vel);
    new Shot(projection);
  };
  this.alignPoints();
};
Ship.prototype = new Orbital(vecCart(), vecCart(), 0, 0);
function Shot(vel){
  this.vel = vel;
  this.draw = function(){
    ctx.beginPath();
    ctx.arc(this.vel.origin.x, this.vel.origin.y, 1.5 * u, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    if(!paused){
      new Fader(this.vel.origin, 1 * u, '127, 0, 127', 5, 'circ');
    }
  };
  shots.push(this);
}
Shot.prototype = new Orbital(vecCart(), vecCart(), 0, 0);
function Asteroid(vel, maxRadius, roughness, deltaRot, forwardAngle){
  if(vel){this.vel = vel;}
  else{this.vel = vecCirc();}

  if(maxRadius){this.maxRadius = maxRadius;}
  else{this.maxRadius = (Math.random() * 20 + 20) * u;}

  if(roughness){this.roughness = roughness;}
  else{this.roughness = .5;}

  if(deltaRot){this.deltaRot = deltaRot;}
  else{this.deltaRot = Math.random() / 10 - .05;}

  if(forwardAngle){this.forwardAngle = forwardAngle;}
  else{this.forwardAngle = 0;}

  this.arms = [];
  this.armLengths = [];
  for (var i = 0; i < 1 + Math.sqrt(this.maxRadius / u); i++) {
    this.armLengths[i] = this.maxRadius - Math.random() * this.maxRadius * this.roughness;
  }
  this.alignPoints = function(){
    for (var i = 0; i < this.armLengths.length; i++) {
      var angle = this.forwardAngle + i * 2 * Math.PI / this.armLengths.length;
      this.arms[i] = vecCirc(angle, this.armLengths[i], this.vel.origin, this.deltaRot);
    }
  };
  this.draw = function(){
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
function Bonus(vel){
  if(vel){this.vel = vel;}
  else{this.vel = vecCirc();}

  this.points = [];
  this.alignPoints = function(){
    if(lives === 3){
      for (var i = 0; i < 5; i++) {
        this.points[i] = vecCirc(Math.PI + i * 2 * Math.PI / 5, 5 * u, this.vel.origin);
      }
    }
    else{
      for (var i = 0; i < 4; i++) {
        this.points[i] = vecCirc(Math.PI + i * Math.PI / 2, 5 * u, this.vel.origin);
      }
    }
  };
  this.draw = function(){
    this.alignPoints();
    if(lives === 3){
      ctx.beginPath();
      ctx.moveTo(this.points[0].head.x, this.points[0].head.y);
      for (var i = 1; i < 5; i++) {
        ctx.lineTo(this.points[i * 3 % 5].head.x, this.points[i * 3 % 5].head.y);
      }
      ctx.closePath();
      ctx.fillStyle = '#ffff00';
      ctx.fill();
    }
    else{
      ctx.beginPath();
      ctx.moveTo(this.points[0].head.x, this.points[0].head.y);
      ctx.lineTo(this.points[2].head.x, this.points[2].head.y);
      ctx.moveTo(this.points[1].head.x, this.points[1].head.y);
      ctx.lineTo(this.points[3].head.x, this.points[3].head.y);
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3 * u;
      ctx.stroke();
      ctx.lineWidth = 1 * u;
    }
  };
}
Bonus.prototype = new Orbital(vecCart(), vecCart(), 0, 0);
function Fader(location, size, rgbVals, frameCount, message){
  this.origin = location;
  this.message = message;
  this.size = size;
  this.rgbVals = rgbVals;
  this.frameCount = frameCount;
  this.totalCount = frameCount;
  this.draw = function(){
    ctx.fillStyle = 'rgba(' + rgbVals + ', ' + this.frameCount / this.totalCount + ')';
    if(message === 'circ'){
      ctx.beginPath();
      ctx.arc(this.origin.x, this.origin.y, size, 0, 2 * Math.PI, false);
      ctx.fill();
    }
    else if(typeof message === 'string'){
      ctx.font = size * u + 'px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(message, this.origin.x, this.origin.y);
    }
    if(!paused){
      this.frameCount -= 1;
    }
  }
  faders.push(this);
}
