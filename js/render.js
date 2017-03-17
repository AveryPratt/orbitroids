'use strict';

function initializeNameInput(previousName){
  if(previousName){
    nameInput.value = previousName;
  }
}
function init(){
  setCanvas();
  setTextarea();
  orbs.levels[orbs.level].setShipTop();
}
function reduceShots(num){
  if(orbs.shots.length > num){
    var largestDist = 0;
    var indexToRemove;
    for (var i = 0; i < orbs.shots.length; i++) {
      var dist = Math.abs(orbs.shots[i].vel.origin.x - orbs.planets[0].vel.origin.x) + Math.abs(orbs.shots[i].vel.origin.y - orbs.planets[0].vel.origin.y);
      if(dist > largestDist){
        largestDist = dist;
        indexToRemove = i;
      }
    }
    orbs.shots.splice(indexToRemove, 1);
  }
}
function reduceAsteroids(num){
  if(orbs.asteroids.length > num){
    var largestDist = 0;
    var indexToRemove;
    for (var i = 0; i < orbs.asteroids.length; i++) {
      var dist = Math.abs(orbs.asteroids[i].vel.origin.x - orbs.planets[0].vel.origin.x) + Math.abs(orbs.asteroids[i].vel.origin.y - orbs.planets[0].vel.origin.y);
      if(dist > largestDist){
        largestDist = dist;
        indexToRemove = i;
      }
    }
    orbs.asteroids.splice(indexToRemove, 1);
  }
}
function expireFaders(){
  var removeFaders = [];
  for (var i = 0; i < orbs.faders.length; i++) {
    if(orbs.faders[i].frameCount <= 0){
      removeFaders.push(i);
    }
  }
  for (var i = removeFaders.length - 1; i >= 0; i--) {
    orbs.faders.splice(removeFaders[i], 1);
  }
}
function checkcomplete(){
  for (var i = 0; i < orbs.asteroids.length; i++) {
    if(orbs.asteroids[i].vel.origin.x < 300 * orbs.unit / orbs.view.scale &&
      orbs.asteroids[i].vel.origin.y < 300 * orbs.unit / orbs.view.scale &&
      orbs.asteroids[i].vel.origin.x > -300 * orbs.unit / orbs.view.scale &&
      orbs.asteroids[i].vel.origin.y > -300 * orbs.unit / orbs.view.scale){
      return false;
    }
  }
  return true;
}

function checkCollisions(){
  if(!orbs.controls.gameEnd){
    orbs.collisions.checkShipEscaped();
    orbs.collisions.checkShipPlanetCollision();
    orbs.collisions.checkAsteroidShipCollision();
    if(orbs.bonuses[0] && orbs.bonuses[0] != 'start'){
      orbs.collisions.checkBonusShipCollision();
    }
  }
  orbs.collisions.checkShotPlanetCollisions();
  orbs.collisions.checkShotAsteroidCollisions();
  orbs.collisions.checkAsteroidPlanetCollisions();
  orbs.collisions.checkShotShipCollisions();
}
function renderPlanets(){
  for (var i = 0; i < orbs.planets.length; i++) {
    orbs.planets[i].resetAccel();
    for (var j = 0; j < orbs.planets.length; j++) {
      if(i !== j){
        orbs.planets[i].applyGravity(orbs.planets[j]);
      }
    }
  }
  for (var i = 0; i < orbs.planets.length; i++) {
    if(!orbs.controls.paused){
      orbs.planets[i].applyMotion();
    }
    orbs.planets[i].draw();
  }
}
function renderShip(){
  if(orbs.start && !orbs.controls.paused){
    orbs.ship.resetAccel();
    if(loaded && !exploded){
      orbs.ship.shoot();
      loaded = false;
    }
    for (var i = 0; i < orbs.planets.length; i++) {
      orbs.ship.applyGravity(orbs.planets[i]);
    }
    if(burning){
      orbs.ship.flame = true;
      if(dampenBurn){
        orbs.ship.burn(.02 * orbs.unit);
      }
      else{
        orbs.ship.burn(.06 * orbs.unit);
      }
    }
    else{
      orbs.ship.flame = false;
    }
    if(dampenRot){
      if(orbs.ship.deltaRot < -.003){
        orbs.ship.deltaRot += .001;
      }
      else if(orbs.ship.deltaRot > .003){
        orbs.ship.deltaRot -= .001;
      }
      else{
        orbs.ship.deltaRot = 0;
      }
    }
    orbs.ship.rotate(rot);
    if(!exploded){
      orbs.ship.applyMotion();
    }
  }
  orbs.ship.draw();
}
function renderStartScreen(){
  name = sessionStorage.getItem('previousName');
  if(name && name != 'null'){
    initializeNameInput(name);
    orbs.startScreen = false;
    requestAnimationFrame(renderFrame);
  }
  else{
    initializeNameInput('');
    if(!orbs.newScore){
      orbs.newScore = true;
    }
  }
}
function renderAsteroids(){
  for (var i = 0; i < orbs.asteroids.length; i++) {
    if(!orbs.controls.paused){
      orbs.asteroids[i].rotate();
      orbs.asteroids[i].resetAccel();
      for (var j = 0; j < orbs.planets.length; j++) {
        orbs.asteroids[i].applyGravity(orbs.planets[j]);
      }
      orbs.asteroids[i].applyMotion();
    }
    orbs.asteroids[i].draw();
  }
}
function renderFaders(){
  for (var i = 0; i < orbs.faders.length; i++) {
    orbs.faders[i].draw();
  }
}
function renderShots(){
  for (var i = 0; i < orbs.shots.length; i++) {
    if(!orbs.controls.paused){
      orbs.shots[i].resetAccel();
      for (var j = 0; j < orbs.planets.length; j++) {
        orbs.shots[i].applyGravity(orbs.planets[j]);
      }
      orbs.shots[i].applyMotion();
    }
    orbs.shots[i].draw();
  }
}
function renderBonus(){
  if(orbs.bonuses[0] && orbs.bonuses[0] !== 'start' && !orbs.controls.gameEnd){
    if(!orbs.controls.paused){
      orbs.bonuses[0].resetAccel();
      for (var i = 0; i < orbs.planets.length; i++) {
        orbs.bonuses[0].applyGravity(orbs.planets[i]);
      }
      orbs.bonuses[0].applyMotion();
    }
    orbs.bonuses[0].draw();
  }
}
function renderText(){
  orbs.ctx.strokeStyle = '#ffffff';
  orbs.ctx.lineWidth = orbs.unit;
  orbs.ctx.strokeRect(0, 0, 600 * orbs.unit, 600 * orbs.unit);
  if(orbs.controls.paused){
    orbs.ctx.fillStyle = '#000000';
    orbs.ctx.font = 18 * orbs.unit + 'px Arial';
    orbs.ctx.textAlign = 'center';
    orbs.ctx.fillText('Paused', 300 * orbs.unit, 300 * orbs.unit);
  }
  orbs.ctx.strokeStyle = '#00ffff';
  orbs.ctx.font = 12 * orbs.unit + 'px Arial';
  orbs.ctx.textAlign = 'left';
  orbs.ctx.strokeText('LIVES: ' + orbs.lives, 10 * orbs.unit, 18 * orbs.unit);

  orbs.ctx.strokeStyle = '#ffff00';
  orbs.ctx.textAlign = 'right';
  orbs.ctx.strokeText('SCORE: ' + orbs.score, 590 * orbs.unit, 18 * orbs.unit);
}
function renderEndScreen(){
  if(orbs.newScore){
    var thisFinalScore = new ScoreItem(orbs.score, name);
    retrieveScores();
    addScore(thisFinalScore);
    storeScores();
    orbs.newScore = false;
  }
  orbs.ctx.fillStyle = 'rgba(255, 255, 255, .2)';
  orbs.ctx.fillRect(150 * orbs.unit, 100 * orbs.unit, 300 * orbs.unit, 400 * orbs.unit);
  orbs.ctx.fillStyle = '#000000';
  orbs.ctx.font = 24 * orbs.unit + 'px Arial';
  orbs.ctx.textAlign = 'center';
  orbs.ctx.fillText('Game Over', 300 * orbs.unit, 140 * orbs.unit);
  orbs.ctx.font = 12 * orbs.unit + 'px Arial';
  orbs.ctx.fillText('Press enter to play again', 300 * orbs.unit, 370 * orbs.unit);
  orbs.ctx.font = 18 * orbs.unit + 'px Arial';
  orbs.ctx.textAlign = 'center';
  var scoreSelected = false;
  for (var i = 0; i < scores.length; i++) {
    if(!scoreSelected && scores[i].finalScore === orbs.score && scores[i].name === name){
      orbs.ctx.fillStyle = '#ff0000';
      scoreSelected = true;
    }
    else{
      orbs.ctx.fillStyle = '#000000';
    }
    orbs.ctx.fillText(scores[i].finalScore + ' - ' + scores[i].name, 300 * orbs.unit, (165 + 20 * i) * orbs.unit);
  }
  orbs.ctx.strokeStyle = '#ffffff';
  orbs.ctx.strokeRect(200 * orbs.unit, 145 * orbs.unit, 200 * orbs.unit, 210 * orbs.unit);
}

function setCanvas(){
  if(window.innerWidth >= window.innerHeight){
    orbs.ctx.canvas.width = window.innerHeight;
    orbs.ctx.canvas.height = window.innerHeight;
    orbs.unit = window.innerHeight / 600;
  }
  else{
    orbs.ctx.canvas.width = window.innerWidth;
    orbs.ctx.canvas.height = window.innerWidth;
    orbs.unit = window.innerWidth / 600;
  }
  orbs.view.center = {x: canvas.width / 2, y: canvas.height / 2};
}
function setTextarea(){
  nameInput.style.margin = 400 * orbs.unit + 'px 50%';
}

function renderFrame(){
  if(orbs.startScreen || orbs.controls.gameEnd){
    nameInput.style.display = 'block';
  }
  else{
    nameInput.style.display = 'none';
  }
  if(orbs.startScreen){
    renderStartScreen();
  }
  else{
    requestAnimationFrame(renderFrame);
    orbs.ctx.clearRect(0, 0, 600 * orbs.unit, 600 * orbs.unit);
    orbs.levels[orbs.level].sunAngle += .0005;
    renderPlanets();
    if(!orbs.controls.paused){
      checkCollisions();
    }
    if(!orbs.controls.gameEnd){
      renderShip();
      if(checkcomplete() && !orbs.controls.paused){
        orbs.levels[0].addWave();
      }
    }
    renderAsteroids();
    renderFaders();
    renderShots();
    renderBonus();
    renderText();
    if(orbs.controls.gameEnd){
      renderEndScreen();
    }

    reduceShots(orbs.maxShots);
    reduceAsteroids(orbs.maxAsteroids);
    expireFaders();
  }
}

init();
renderFrame();
