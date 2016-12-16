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
  if(shots.length > num){
    var largestDist = 0;
    var indexToRemove;
    for (var i = 0; i < shots.length; i++) {
      var dist = Math.abs(shots[i].vel.origin.x - planets[0].vel.origin.x) + Math.abs(shots[i].vel.origin.y - planets[0].vel.origin.y);
      if(dist > largestDist){
        largestDist = dist;
        indexToRemove = i;
      }
    }
    shots.splice(indexToRemove, 1);
  }
}
function reduceAsteroids(num){
  if(asteroids.length > num){
    var largestDist = 0;
    var indexToRemove;
    for (var i = 0; i < asteroids.length; i++) {
      var dist = Math.abs(asteroids[i].vel.origin.x - planets[0].vel.origin.x) + Math.abs(asteroids[i].vel.origin.y - planets[0].vel.origin.y);
      if(dist > largestDist){
        largestDist = dist;
        indexToRemove = i;
      }
    }
    asteroids.splice(indexToRemove, 1);
  }
}
function expireFaders(){
  var removeFaders = [];
  for (var i = 0; i < faders.length; i++) {
    if(faders[i].frameCount <= 0){
      removeFaders.push(i);
    }
  }
  for (var i = removeFaders.length - 1; i >= 0; i--) {
    faders.splice(removeFaders[i], 1);
  }
}
function checkcomplete(){
  for (var i = 0; i < asteroids.length; i++) {
    if(asteroids[i].vel.origin.x < 1000 * orbs.unit && asteroids[i].vel.origin.y < 1000 * orbs.unit && asteroids[i].vel.origin.x > 0 && asteroids[i].vel.origin.y > 0){
      return false;
    }
  }
  return true;
}

function checkCollisions(){
  if(!gameEnd){
    checkShipEscaped();
    checkShipPlanetCollision();
    checkAsteroidShipCollision();
    if(bonus && bonus != 'start'){
      checkBonusShipCollision();
    }
  }
  checkShotPlanetCollisions();
  checkShotAsteroidCollisions();
  checkAsteroidPlanetCollisions();
  checkShotShipCollisions();
}
function renderPlanets(){
  for (var i = 0; i < planets.length; i++) {
    planets[i].resetAccel();
    for (var j = 0; j < planets.length; j++) {
      if(i !== j){
        planets[i].applyGravity(planets[j]);
      }
    }
  }
  for (var i = 0; i < planets.length; i++) {
    if(!paused){
      planets[i].applyMotion();
    }
    planets[i].draw();
  }
}
function renderShip(){
  if(start && !paused){
    ship.resetAccel();
    if(loaded && !exploded){
      ship.shoot();
      loaded = false;
    }
    for (var i = 0; i < planets.length; i++) {
      ship.applyGravity(planets[i]);
    }
    if(burning){
      ship.flame = true;
      if(dampenBurn){
        ship.burn(.02 * orbs.unit);
      }
      else{
        ship.burn(.06 * orbs.unit);
      }
    }
    else{
      ship.flame = false;
    }
    if(dampenRot){
      if(ship.deltaRot < -.003){
        ship.deltaRot += .001;
      }
      else if(ship.deltaRot > .003){
        ship.deltaRot -= .001;
      }
      else{
        ship.deltaRot = 0;
      }
    }
    ship.rotate(rot);
    if(!exploded){
      ship.applyMotion();
    }
  }
  ship.draw();
}
function renderStartScreen(){
  name = sessionStorage.getItem('previousName');
  if(name && name != 'null'){
    initializeNameInput(name);
    startScreen = false;
    requestAnimationFrame(renderFrame);
  }
  else{
    initializeNameInput('');
    if(!newScore){
      newScore = true;
    }
  }
}
function renderAsteroids(){
  for (var i = 0; i < asteroids.length; i++) {
    if(!paused){
      asteroids[i].rotate();
      asteroids[i].resetAccel();
      for (var j = 0; j < planets.length; j++) {
        asteroids[i].applyGravity(planets[j]);
      }
      asteroids[i].applyMotion();
    }
    asteroids[i].draw();
  }
}
function renderFaders(){
  for (var i = 0; i < faders.length; i++) {
    faders[i].draw();
  }
}
function renderShots(){
  for (var i = 0; i < shots.length; i++) {
    if(!paused){
      shots[i].resetAccel();
      for (var j = 0; j < planets.length; j++) {
        shots[i].applyGravity(planets[j]);
      }
      shots[i].applyMotion();
    }
    shots[i].draw();
  }
}
function renderBonus(){
  if(bonus && bonus !== 'start' && !gameEnd){
    if(!paused){
      bonus.resetAccel();
      for (var i = 0; i < planets.length; i++) {
        bonus.applyGravity(planets[i]);
      }
      bonus.applyMotion();
    }
    bonus.draw();
  }
}
function renderText(){
  orbs.ctx.strokeStyle = '#ffffff';
  orbs.ctx.lineWidth = orbs.unit;
  orbs.ctx.strokeRect(0, 0, 600 * orbs.unit, 600 * orbs.unit);
  if(paused){
    orbs.ctx.fillStyle = '#000000';
    orbs.ctx.font = 18 * orbs.unit + 'px Arial';
    orbs.ctx.textAlign = 'center';
    orbs.ctx.fillText('Paused', 300 * orbs.unit, 300 * orbs.unit);
  }
  orbs.ctx.strokeStyle = '#00ffff';
  orbs.ctx.font = 12 * orbs.unit + 'px Arial';
  orbs.ctx.textAlign = 'left';
  orbs.ctx.strokeText('LIVES: ' + lives, 10 * orbs.unit, 18 * orbs.unit);

  orbs.ctx.strokeStyle = '#ffff00';
  orbs.ctx.textAlign = 'right';
  orbs.ctx.strokeText('SCORE: ' + score, 590 * orbs.unit, 18 * orbs.unit);
}
function renderEndScreen(){
  if(newScore){
    var thisFinalScore = new ScoreItem(score, name);
    retrieveScores();
    addScore(thisFinalScore);
    storeScores();
    newScore = false;
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
    if(!scoreSelected && scores[i].finalScore === score && scores[i].name === name){
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
}
function setTextarea(){
  nameInput.style.margin = 400 * orbs.unit + 'px 50%';
}

function renderFrame(){
  if(startScreen || gameEnd){
    nameInput.style.display = 'block';
  }
  else{
    nameInput.style.display = 'none';
  }
  if(startScreen){
    renderStartScreen();
  }
  else{
    requestAnimationFrame(renderFrame);
    orbs.ctx.clearRect(0, 0, 600 * orbs.unit, 600 * orbs.unit);
    sunAngle += .0005;
    renderPlanets();
    if(!paused){
      checkCollisions();
    }
    if(!gameEnd){
      renderShip();
      if(checkcomplete() && !paused){
        addWave();
      }
    }
    renderAsteroids();
    renderFaders();
    renderShots();
    renderBonus();
    renderText();
    if(gameEnd){
      renderEndScreen();
    }

    reduceShots(maxShots);
    reduceAsteroids(maxAsteroids);
    expireFaders();
  }
}

init();
renderFrame();
