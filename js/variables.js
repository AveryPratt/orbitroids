'use strict';

var canvas = document.getElementById('canvas');
var u = 600 / canvas.height;
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
var maxShots = 30;
var maxAsteroids = 20;

var scores = [];
var scoreNumber = 10;
var newScore = true;
var nameInput = document.getElementById('nameInput');