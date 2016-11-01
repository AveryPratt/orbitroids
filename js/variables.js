'use strict';

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var name;
var start = false;
var launched = false;
var burning = false;
var dampenControls = false;
var rot = 0;
var loaded = false;
var asteroids = [];
var shots = [];
var shotRemoveArr = [];
var exploded = false;
var lives = 3;
var invincible;
var planet;
var ship;
var gameEnd = false;
var startScreen = true;
var score = 0;
var bonus = 'start';
var paused = false;
var maxShots = 50;
var maxAsteroids = 20;

var scores = [];
var scoreNumber = 10;
var newScore = true;
var nameInput = new CanvasInput({
  canvas: canvas,
  placeholder: 'Enter your name...',
  x: canvas.width / 2 - 75,
  y: canvas.height / 2
});
