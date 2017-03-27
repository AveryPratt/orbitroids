'use strict';

var orbs = {};
orbs.init = function(){
  this.score = 0;
  this.totalScore = 0;
  this.lives = 3;
  this.ship = null;
  this.asteroids = [];
  this.maxAsteroids = 50;
  this.shots = [];
  this.maxShots = 50;
  this.faders = [];
  this.planets = [];
  this.bonuses = [];
  this.startScreen = true;
  this.newScore = false;
  this.sunAngle = 0;
};
orbs.canvas = document.getElementById('canvasas');
orbs.ctx = canvas.getContext('2d');
orbs.view = {
  scale: 1,
  center: {x: canvas.width / 2, y: canvas.height / 2},
  convert: function(point){
    var newPoint = {x: point.x, y: point.y};
    newPoint.x *= this.scale;
    newPoint.y *= this.scale;
    newPoint.x += this.center.x;
    newPoint.y += this.center.y;
    return newPoint;
  }
};
orbs.unit = canvas.width / (1000 * orbs.view.scale);
orbs.level = 0;
orbs.init();

// var canvas,
//   u,
//   ctx,
//   name,
//   start,
//   destroyed,
//   launched,
//   burning,
//   dampenRot,
//   dampenBurn,
//   rot,
//   loaded,
//   asteroids,
//   shots,
//   faders,
//   exploded,
//   lives,
//   invincible,
//   planets,
//   ship,
//   gameEnd,
//   startScreen,
//   score,
//   bonus,
//   paused,
//   maxShots,
//   maxAsteroids,
//   scores,
//   scoreNumber,
//   newScore,
//   nameInput,
//   sunAngle;
