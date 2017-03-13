'use strict';

orbs.objects = {
  Planet: function(mass, radius, vel, deltaRot, col, atm){
    if(vel){this.vel = vel;}
    else{this.vel = orbs.engine.vecCirc();}

    if(deltaRot){this.deltaRot = deltaRot;}
    else{this.deltaRot = 0;}

    if(col){this.col = col;}
    else{this.col = [255, 255, 255];}

    if(atm){this.atm = atm;}
    else{this.atm = false;}

    this.radius = radius;
    this.mass = mass;
    this.draw = function(){
      ctx.beginPath();
      var canvasPoint = this.vel.origin.convert();
      var planetSunVec = orbs.engine.vecCirc(sunAngle, this.radius * .8, canvasPoint);
      var planetGrd = ctx.createLinearGradient(planetSunVec.head.x, planetSunVec.head.y, canvasPoint.x, canvasPoint.y);
      planetGrd.addColorStop(0, 'rgba(' + this.col[0] + ', ' + this.col[1] + ', ' + this.col[2] + ', 1)');
      planetGrd.addColorStop(1, 'rgba(' + Math.round(this.col[0] / 4) + ', ' + Math.round(this.col[1] / 4) + ', ' + Math.round(this.col[2] / 4) + ', 1)');
      ctx.arc(canvasPoint.x, canvasPoint.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = planetGrd;
      ctx.fill();
      if(this.atm){
        var atmoSunVec = orbs.engine.vecCirc(sunAngle, this.radius, canvasPoint);
        var atmoGrd = ctx.createRadialGradient(atmoSunVec.head.x, atmoSunVec.head.y, 0, canvasPoint.x, canvasPoint.y, this.radius * 1.2);
        atmoGrd.addColorStop(0, 'rgba(255, 255, 255, .5)');
        atmoGrd.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.arc(canvasPoint.x, canvasPoint.y, radius * 1.2, 0, 2 * Math.PI, false);
        ctx.fillStyle = atmoGrd;
        ctx.fill();
      }
    };
  },
  Ship: function(vel, forwardAngle, deltaRot, col){
    this.burning = false;
    this.dampenRot = false;
    this.dampenBurn = false;
    this.loaded = false;
    this.exploded = false;
    this.trueAnom = 0;

    this.accel = orbs.engine.vecCirc();

    this.nose;
    this.leftSide;
    this.rightSide;
    this.rear;

    if(forwardAngle){this.forwardAngle = forwardAngle;}
    else{this.forwardAngle = 0;}

    if(deltaRot){this.deltaRot = deltaRot;}
    else{this.deltaRot = 0;}

    if(vel){this.vel = vel;}
    else{this.vel = orbs.engine.vecCirc();}

    if(col){this.col = col;}
    else{this.col = '#ffffff';}

    this.draw = function(){
      var velPoint = this.vel.origin.convert();
      var nosePoint = this.nose.head.convert();
      var leftSidePoint = this.leftSide.head.convert();
      var rightSidePoint = this.rightSide.head.convert();
      var rearPoint = this.rear.head.convert();
      if(this.exploded){
        if(typeof this.explosionCount !== 'number'){
          this.explosionCount = 50;
        }
        else if(this.explosionCount > 0){
          if(!paused){
            this.explosionCount -= 1;
          }
          ctx.beginPath();
          ctx.arc(velPoint.x, velPoint.y, this.explosionCount * orbs.unit / 3.3, 0, 2 * Math.PI, false);
          ctx.fillStyle = '#ff0000';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(velPoint.x, velPoint.y, this.explosionCount * orbs.unit / 5, 0, 2 * Math.PI, false);
          ctx.fillStyle = '#ff8000';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(velPoint.x, velPoint.y, this.explosionCount * orbs.unit / 10, 0, 2 * Math.PI, false);
          ctx.fillStyle = '#ffff00';
          ctx.fill();
        }
        else{
          lives -= 1;
          ship = null;
        }
      }
      else{
        ctx.beginPath();
        ctx.moveTo(nosePoint.x, nosePoint.y);
        ctx.lineTo(leftSidePoint.x, leftSidePoint.y);
        ctx.lineTo(velPoint.x, velPoint.y);
        ctx.lineTo(rightSidePoint.x, rightSidePoint.y);
        ctx.closePath();
        ctx.lineWidth = 1 * orbs.unit;
        ctx.strokeStyle = col;
        ctx.stroke();
        if(this.flame){
          if(dampenBurn){
            var mult = .25;
          }
          else mult = .5;
          ctx.beginPath();
          ctx.moveTo(velPoint.x, velPoint.y);
          ctx.lineTo(leftSidePoint.x - (this.leftSide.delta.x - this.leftSide.delta.x * mult) / orbs.unit, leftSidePoint.y - (this.leftSide.delta.y - this.leftSide.delta.y * mult) / orbs.unit);
          ctx.lineTo(rearPoint.x - (this.rear.delta.x - this.rear.delta.x * 2 * mult) / orbs.unit, rearPoint.y - (this.rear.delta.y - this.rear.delta.y * 2 * mult) / orbs.unit);
          ctx.lineTo(rightSidePoint.x - (this.rightSide.delta.x - this.rightSide.delta.x * mult) / orbs.unit, rightSidePoint.y - (this.rightSide.delta.y - this.rightSide.delta.y * mult) / orbs.unit);
          ctx.closePath();
          ctx.lineWidth = 1 * orbs.unit;
          ctx.fillStyle = '#ff0000';
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(velPoint.x, velPoint.y);
          ctx.lineTo(leftSidePoint.x - (this.leftSide.delta.x - this.leftSide.delta.x * .5 * mult) / orbs.unit, leftSidePoint.y - (this.leftSide.delta.y - this.leftSide.delta.y * .5 * mult) / orbs.unit);
          ctx.lineTo(rearPoint.x - (this.rear.delta.x - this.rear.delta.x * mult) / orbs.unit, rearPoint.y - (this.rear.delta.y - this.rear.delta.y * mult) / orbs.unit);
          ctx.lineTo(rightSidePoint.x - (this.rightSide.delta.x - this.rightSide.delta.x * .5 * mult) / orbs.unit, rightSidePoint.y - (this.rightSide.delta.y - this.rightSide.delta.y * .5 * mult) / orbs.unit);
          ctx.closePath();
          ctx.lineWidth = 1 * orbs.unit;
          ctx.fillStyle = '#ffff00';
          ctx.fill();
        }
      }
    };
    this.alignPoints = function(){
      this.nose = orbs.engine.vecCirc(this.forwardAngle, 10 * orbs.unit, this.vel.origin);
      this.rear = orbs.engine.vecCirc(this.forwardAngle - Math.PI, 10 * orbs.unit, this.vel.origin);
      this.leftSide = orbs.engine.vecCirc(this.forwardAngle + 5 * Math.PI / 6, 10 * orbs.unit, this.vel.origin);
      this.leftSide.refineForwardAngle();
      this.rightSide = orbs.engine.vecCirc(this.forwardAngle + 7 * Math.PI / 6, 10 * orbs.unit, this.vel.origin);
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
      this.vel.addVector(this.accel);
      this.vel = orbs.engine.vecCirc(this.vel.forwardAngle, this.vel.len, this.vel.head, this.vel.deltaRot);
      this.trueAnom = vecCart(this.vel.origin, planets[0].origin);
      if(!this.trueAnom.forwardAngle){
        this.trueAnom.forwardAngle = 0;
      }
      this.alignPoints();
    };
    this.burn = function(force){
      var forceVec = orbs.engine.vecCirc(this.forwardAngle, force);
      this.accel.addVector(forceVec);
    };
    this.shoot = function(){
      this.accel.addVector(vecCirc(this.forwardAngle - Math.PI, .5 * orbs.unit));
      var projection = orbs.engine.vecCirc(this.forwardAngle, 2.5 * orbs.unit, this.nose.head).addVector(this.vel);
      new Shot(projection);
    };
    this.alignPoints();
  },
  Shot: function(vel){
    this.vel = vel;
    this.draw = function(){
      var velPoint = this.vel.origin.convert();
      ctx.beginPath();
      ctx.arc(velPoint.x, velPoint.y, 1.5 * orbs.unit, 0, 2 * Math.PI, false);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      if(!paused){
        new Fader(this.vel.origin, 1 * orbs.unit, '127, 0, 127', 5, 'circ');
      }
    };
    shots.push(this);
  },
  Asteroid: function(vel, maxRadius, roughness, deltaRot, forwardAngle){
    if(vel){this.vel = vel;}
    else{this.vel = orbs.engine.vecCirc();}

    if(maxRadius){this.maxRadius = maxRadius;}
    else{this.maxRadius = (Math.random() * 20 + 40) * orbs.unit;}

    if(roughness){this.roughness = roughness;}
    else{this.roughness = .5;}

    if(deltaRot){this.deltaRot = deltaRot;}
    else{this.deltaRot = (Math.random() - .5) / (this.maxRadius / orbs.unit);}

    if(forwardAngle){this.forwardAngle = forwardAngle;}
    else{this.forwardAngle = 0;}

    this.arms = [];
    this.armLengths = [];
    for (var i = 0; i < 1 + Math.sqrt(this.maxRadius / orbs.unit); i++) {
      this.armLengths[i] = this.maxRadius - Math.random() * this.maxRadius * this.roughness;
    }
    this.alignPoints = function(){
      for (var i = 0; i < this.armLengths.length; i++) {
        var angle = this.forwardAngle + i * 2 * Math.PI / this.armLengths.length;
        this.arms[i] = orbs.engine.vecCirc(angle, this.armLengths[i], this.vel.origin, this.deltaRot);
      }
    };
    this.draw = function(){
      this.alignPoints();
      ctx.beginPath();
      var canvasPoints = [];
      for (var i = 0; i < this.arms.length; i++) {
        canvasPoints[i] = this.arms[i].head.convert();
      }
      ctx.moveTo(canvasPoints[canvasPoints.length - 1].head.x, canvasPoints[canvasPoints.length - 1].head.y);
      for (var i = 0; i < canvasPoints.length; i++) {
        ctx.lineTo(canvasPoints[i].head.x, canvasPoints[i].head.y);
      }
      ctx.closePath();
      var sunVec = orbs.engine.vecCirc(sunAngle + Math.PI, this.maxRadius, this.vel.origin);
      var grd = ctx.createRadialGradient(sunVec.head.x, sunVec.head.y, this.maxRadius, this.vel.origin.x, this.vel.origin.y, this.maxRadius * 2);
      grd.addColorStop(0, 'rgba(63, 63, 63, 1)');
      grd.addColorStop(1, 'rgba(255, 255, 255, 1)');
      ctx.fillStyle = grd;
      ctx.fill();
    };
    this.rotate = function(accelRot){
      if(accelRot){this.deltaRot += accelRot;}
      this.forwardAngle += this.deltaRot;
      this.refineForwardAngle();
    };
    this.alignPoints();
    asteroids.push(this);
  },
  Bonus: function(vel){
    if(vel){this.vel = vel;}
    else{this.vel = orbs.engine.vecCirc();}

    this.points = [];
    this.alignPoints = function(){
      if(lives === 3){
        for (var i = 0; i < 5; i++) {
          this.points[i] = orbs.engine.vecCirc(Math.PI + i * 2 * Math.PI / 5, 5 * orbs.unit, this.vel.origin);
        }
      }
      else{
        for (var i = 0; i < 4; i++) {
          this.points[i] = orbs.engine.vecCirc(Math.PI + i * Math.PI / 2, 5 * orbs.unit, this.vel.origin);
        }
      }
    };
    this.draw = function(){
      this.alignPoints();
      var centerPoint = this.vel.origin.convert();
      var canvasPoints = [];
      for (var i = 0; i < thispoints.length; i++) {
        canvasPoints[i] = thispoints[i].head.convert();
      }
      ctx.beginPath();
      if(lives === 3){
        ctx.beginPath();
        ctx.moveTo(canvasPoints[0].head.x, canvasPoints[0].head.y);
        for (var i = 1; i < 5; i++) {
          ctx.lineTo(canvasPoints[i * 3 % 5].head.x, canvasPoints[i * 3 % 5].head.y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 0, 1)';
        ctx.fill();
      }
      else{
        ctx.beginPath();
        ctx.moveTo(canvasPoints[0].head.x, canvasPoints[0].head.y);
        ctx.lineTo(canvasPoints[2].head.x, canvasPoints[2].head.y);
        ctx.moveTo(canvasPoints[1].head.x, canvasPoints[1].head.y);
        ctx.lineTo(canvasPoints[3].head.x, canvasPoints[3].head.y);
        ctx.strokeStyle = 'rgba(0, 255, 255, 1)';
        ctx.lineWidth = 3 * orbs.unit;
        ctx.stroke();
        ctx.lineWidth = 1 * orbs.unit;
      }
      var sunVec = orbs.engine.vecCirc(sunAngle, 5 * orbs.unit, centerPoint);
      var grd = ctx.createLinearGradient(sunVec.head.x, sunVec.head.y, centerPoint.x, centerPoint.y);
      grd.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grd;
      ctx.arc(centerPoint.x, centerPoint.y, 5 * orbs.unit, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, .5)';
      ctx.stroke();
    };
  },
  Fader: function(origin, size, rgbVals, frameCount, message){
    this.origin = origin;
    this.message = message;
    this.size = size;
    this.rgbVals = rgbVals;
    this.frameCount = frameCount;
    this.totalCount = frameCount;
    this.draw = function(){
      var centerPoint = this.origin.convert();
      ctx.fillStyle = 'rgba(' + rgbVals + ', ' + this.frameCount / this.totalCount + ')';
      if(message === 'circ'){
        ctx.beginPath();
        ctx.arc(centerPoint.x, centerPoint.y, size, 0, 2 * Math.PI, false);
        ctx.fill();
      }
      else if(typeof message === 'string'){
        ctx.font = size * orbs.unit + 'px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(message, centerPoint.x, centerPoint.y);
      }
      if(!paused){
        this.frameCount -= 1;
      }
    };
    faders.push(this);
  }
};
orbs.objects.Planet.prototype = new orbs.engine.Orbital(orbs.engine.vecCart(), orbs.engine.vecCart(), 0, 0);
orbs.objects.Ship.prototype = new orbs.engine.Orbital(orbs.engine.vecCart(), orbs.engine.vecCart(), 0, 0);
orbs.objects.Shot.prototype = new orbs.engine.Orbital(orbs.engine.vecCart(), orbs.engine.vecCart(), 0, 0);
orbs.objects.Asteroid.prototype = new orbs.engine.Orbital(orbs.engine.vecCart(), orbs.engine.vecCart(), 0, 0);
orbs.objects.Bonus.prototype = new orbs.engine.Orbital(orbs.engine.vecCart(), orbs.engine.vecCart(), 0, 0);
