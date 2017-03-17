'use strict';

var orbs = {};
orbs.canvas = document.getElementById('canvasas');
orbs.ctx = canvas.getContext('2d');
orbs.view = {
  scale: 1,
  center: {x: canvas.width / 2, y: canvas.height / 2},
  // center: {x: 0, y: 0},
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
orbs.score = 0;
orbs.totalScore = 0;
orbs.lives = 3;
orbs.ship = null;
orbs.asteroids = [];
orbs.maxAsteroids = 50;
orbs.shots = 50;
orbs.maxShots = [];
orbs.faders = [];
orbs.planets = [];
orbs.bonuses = [];
orbs.startScreen = true;
orbs.newScore = false;
orbs.sunAngle = 0;

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
