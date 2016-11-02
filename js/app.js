'use strict';

function checkcomplete(){
  for (var i = 0; i < asteroids.length; i++) {
    if(asteroids[i].vel.origin.x < 600 * u && asteroids[i].vel.origin.y < 600 * u && asteroids[i].vel.origin.x > 0 && asteroids[i].vel.origin.y > 0){
      return false;
    }
  }
  return true;
}
function launchBonus(placement, direction, diversion){
  if(placement){
    var startingPointVec = vecCirc(ship.trueAnom.forwardAngle - 2 * Math.PI / 6, 150 * u, planet.vel.origin);
  }
  else {
    startingPointVec = vecCirc(ship.trueAnom.forwardAngle + 2 * Math.PI / 6, 150 * u, planet.vel.origin);
  }
  if(direction){
    var prograde = startingPointVec.forwardAngle + Math.PI / 2;
  }
  else{
    prograde = startingPointVec.forwardAngle - Math.PI / 2;
  }
  if(diversion){
    prograde += diversion * Math.PI / 2;
  }
  var vel = vecCirc(prograde, (findOrbitalVelocity(planet, startingPointVec.len) / u + Math.random() * .2 - .1) * u, startingPointVec.head);
  bonus = new Bonus(vel);
}
function launchAsteroid(placement, direction, maxRadius){
  if(!start){
    var startingPointVec = vecCirc(Math.random() * 2 * Math.PI, 150 * u, planet.vel.origin);
  }
  else{
    if(placement){
      startingPointVec = vecCirc(ship.trueAnom.forwardAngle + 2 * Math.PI / 6, 150 * u, planet.vel.origin);
    }
    else {
      startingPointVec = vecCirc(ship.trueAnom.forwardAngle - 2 * Math.PI / 6, 150 * u, planet.vel.origin);
    }
  }
  if(direction){
    var prograde = startingPointVec.forwardAngle + Math.PI / 2;
  }
  else{
    prograde = startingPointVec.forwardAngle - Math.PI / 2;
  }
  var vel = vecCirc(prograde, findOrbitalVelocity(planet, startingPointVec.len), startingPointVec.head);
  new Asteroid(vel, maxRadius);
};
function setShipTop(){
  start = false;
  var shipVel = vecCirc(0, 0, new Point(planet.vel.origin.x, planet.vel.origin.y - (planet.radius + 10 * u)));
  ship = new Ship(Math.PI, 0, shipVel, '#ffffff');
}
function reduceShots(num){
  if(shots.length > num){
    var largestDist = 0;
    var indexToRemove;
    for (var i = 0; i < shots.length; i++) {
      var dist = Math.abs(shots[i].vel.origin.x - planet.vel.origin.x) + Math.abs(shots[i].vel.origin.y - planet.vel.origin.y);
      if(dist > largestDist){
        largestDist = dist;
        indexToRemove = i;
      }
    }
    console.log(Math.abs(shots[indexToRemove].vel.origin.x) + Math.abs(shots[indexToRemove].vel.origin.y));
    shots.splice(indexToRemove, 1);
  }
}
function reduceAsteroids(num){
  if(asteroids.length > num){
    var largestDist = 0;
    var indexToRemove;
    for (var i = 0; i < asteroids.length; i++) {
      var dist = Math.abs(asteroids[i].vel.origin.x - planet.vel.origin.x) + Math.abs(asteroids[i].vel.origin.y - planet.vel.origin.y);
      if(dist > largestDist){
        largestDist = dist;
        indexToRemove = i;
      }
    }
    asteroids.splice(indexToRemove, 1);
  }
}
function initializeNameInput(previousName){
  if(previousName){
    nameInput.value = previousName;
  }
}
function setPlanet(){
  planet = new Planet((Math.pow(75 * u, 2) / 14) * u, 75 * u, vecCart(new Point(0, 0), new Point(300 * u, 300 * u)), 0, '#008000');
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
function renderShip(){
  if(start && !paused){
    ship.resetAccel();
    if(loaded && !exploded){
      ship.shoot();
      loaded = false;
    }
    ship.applyGravity(planet);
    if(burning){
      ship.flame = true;
      if(dampenControls){
        ship.burn(.02 * u);
      }
      else{
        ship.burn(.1 * u);
      }
    }
    else{
      ship.flame = false;
    }
    if(dampenControls){
      ship.rotate(rot / 5);
    }
    else{
      ship.rotate(rot);
    }
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
      asteroids[i].applyGravity(planet);
      asteroids[i].applyMotion();
    }
    asteroids[i].draw();
  }
}
function renderShots(){
  for (var i = 0; i < shots.length; i++) {
    if(!paused){
      shots[i].resetAccel();
      shots[i].applyGravity(planet);
      shots[i].applyMotion();
    }
    shots[i].draw();
  }
}
function renderBonus(){
  if(bonus && bonus !== 'start' && !gameEnd){
    if(!paused){
      bonus.resetAccel();
      bonus.applyGravity(planet);
      bonus.applyMotion();
    }
    bonus.draw();
  }
}
function renderText(){
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = u;
  ctx.strokeRect(0, 0, 600 * u, 600 * u);
  if(paused){
    ctx.fillStyle = '#000000';
    ctx.font = 18 * u + 'px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', 300 * u, 300 * u);
  }
  ctx.strokeStyle = '#00ffff';
  ctx.font = 12 * u + 'px Arial';
  ctx.textAlign = 'left';
  ctx.strokeText('LIVES: ' + lives, 10 * u, 18 * u);

  ctx.strokeStyle = '#ffff00';
  ctx.textAlign = 'right';
  ctx.strokeText('SCORE: ' + score, 590 * u, 18 * u);
}
function renderEndScreen(){
  if(newScore){
    var thisFinalScore = new ScoreItem(score, name);
    retrieveScores();
    addScore(thisFinalScore);
    storeScores();
    newScore = false;
  }
  ctx.fillStyle = 'rgba(255, 255, 255, .6)';
  ctx.fillRect(0, 0, 600 * u, 600 * u);
  ctx.fillStyle = '#000000';
  ctx.font = 24 * u + 'px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', 300 * u, 60 * u);
  ctx.font = 12 * u + 'px Arial';
  ctx.fillText('Press enter to play again', 300 * u, 290 * u);
  ctx.font = 18 * u + 'px Arial';
  ctx.textAlign = 'center';
  var scoreSelected = false;
  for (var i = 0; i < scores.length; i++) {
    if(!scoreSelected && scores[i].finalScore === score && scores[i].name === name){
      ctx.fillStyle = '#ff0000';
      scoreSelected = true;
    }
    else{
      ctx.fillStyle = '#000000';
    }
    ctx.fillText(scores[i].finalScore + ' - ' + scores[i].name, 300 * u, (85 + 20 * i) * u);
  }
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(200 * u, 65 * u, 200 * u, 210 * u);
}
function addWave(){
  var placement;
  var direction;
  if(Math.random() > .5){
    placement = true;
  }
  else placement = false;
  if(Math.random() > .5){
    direction = true;
  }
  else direction = false;
  launchAsteroid(placement, direction);
  if(bonus === null){
    launchBonus(placement, direction, Math.random() - .5);
  }
  else if(bonus === 'start'){
    bonus = null;
  }
}

function setCanvas(){
  if(window.innerWidth >= window.innerHeight){
    ctx.canvas.width = window.innerHeight;
    ctx.canvas.height = window.innerHeight;
    u = window.innerHeight / 600;
  }
  else{
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerWidth;
    u = window.innerWidth / 600;
  }
}
function setTextarea(){
  nameInput.style.margin = 300 * u + 'px 50%';
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
    ctx.clearRect(0, 0, 600 * u, 600 * u);
    planet.draw();
    if(!paused){
      checkCollisions();
    }
    if(gameEnd){
      renderEndScreen();
    }
    else{
      renderShip();
      if(checkcomplete() && !paused){
        addWave();
      }
    }
    renderAsteroids();
    renderShots();
    renderBonus();
    renderText();

    reduceShots(maxShots);
    reduceAsteroids(maxAsteroids);
  }
}

function init(){
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  start = false;
  launched = false;
  burning = false;
  dampenControls = false;
  rot = 0;
  loaded = false;
  asteroids = [];
  shots = [];
  shotRemoveArr = [];
  exploded = false;
  lives = 3;
  gameEnd = false;
  startScreen = true;
  score = 0;
  bonus = 'start';
  paused = false;
  maxShots = 30;
  maxAsteroids = 20;

  scores = [];
  scoreNumber = 10;
  newScore = true;
  nameInput = document.getElementById('nameInput');
  setCanvas();
  setTextarea();
  setPlanet();
  setShipTop();
}
function handleKeydown(event){
  switch(event.keyCode){
  case 13: // enter
    if(startScreen){
      event.preventDefault();
      startScreen = false;
      name = nameInput.value;
      sessionStorage.setItem('previousName', name);
      renderFrame();
    }
    else if(gameEnd){
      event.preventDefault();
      name = nameInput.value;
      sessionStorage.setItem('previousName', name);
      init();
    }
    break;
  case 16: // shift
    if(!gameEnd){
      event.preventDefault();
      dampenControls = true;
    }
    break;
  case 38: // up
    if(!startScreen && !gameEnd && !paused){
      event.preventDefault();
      start = true;
      burning = true;
    }
    break;
  case 37: // left
    if(!gameEnd){
      event.preventDefault();
      rot = .003;
    }
    break;
  case 39: // right
    if(!gameEnd){
      event.preventDefault();
      rot = -.003;
    }
    break;
  case 32: // space
    if(!gameEnd){
      event.preventDefault();
      if(start){
        loaded = true;
      }
    }
    break;
  case 80: // p
    if(!gameEnd){
      event.preventDefault();
      if(paused){
        paused = false;
      }
      else if(!paused){
        paused = true;
      }
    }
    break;
  default:
    break;
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

init();
renderFrame();
