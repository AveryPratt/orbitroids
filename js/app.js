'use strict';

function checkcomplete(){
  for (var i = 0; i < asteroids.length; i++) {
    if(asteroids[i].vel.origin.x < canvas.width && asteroids[i].vel.origin.y < canvas.height && asteroids[i].vel.origin.x > 0 && asteroids[i].vel.origin.y > 0){
      return false;
    }
  }
  return true;
}
function launchBonus(placement, direction, diversion){
  if(placement){
    var startingPointVec = vecCirc(ship.trueAnom.forwardAngle - 2 * Math.PI / 6, canvas.width / 4, planet.vel.origin);
  }
  else {
    startingPointVec = vecCirc(ship.trueAnom.forwardAngle + 2 * Math.PI / 6, canvas.width / 4, planet.vel.origin);
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
  var vel = vecCirc(prograde, 1.65 + Math.random() * .2 - .1, startingPointVec.head);
  bonus = new Bonus(vel);
}
function launchAsteroid(placement, direction, maxRadius){
  if(!start){
    var startingPointVec = vecCirc(Math.random() * 2 * Math.PI, canvas.width / 4, planet.vel.origin);
  }
  else{
    if(placement){
      startingPointVec = vecCirc(ship.trueAnom.forwardAngle + 2 * Math.PI / 6, canvas.width / 4, planet.vel.origin);
    }
    else {
      startingPointVec = vecCirc(ship.trueAnom.forwardAngle - 2 * Math.PI / 6, canvas.width / 4, planet.vel.origin);
    }
  }
  if(direction){
    var prograde = startingPointVec.forwardAngle + Math.PI / 2;
  }
  else{
    prograde = startingPointVec.forwardAngle - Math.PI / 2;
  }
  var vel = vecCirc(prograde, 1.65, startingPointVec.head);
  new Asteroid(vel, maxRadius);
};
function setShipTop(){
  start = false;
  var shipVel = vecCirc(0, 0, new Point(planet.vel.origin.x, planet.vel.origin.y - (planet.radius + 10)));
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
(function setPlanet(){
  planet = new Planet(400, canvas.width / 8, vecCart(new Point(0, 0), new Point(canvas.width / 2, canvas.height / 2)), 0, '#008080');
}());
setShipTop();

function initializeNameInput(previousName){
  nameInput = new CanvasInput({
    canvas: canvas,
    placeholder: 'Enter your name...',
    x: canvas.width / 2 - 75,
    y: canvas.height / 2
  });
  if(previousName){
    nameInput.value = previousName;
  }
}
function renderFrame(){
  if(startScreen){
    name = localStorage.getItem('previousName');
    if(name && name != 'null'){
      initializeNameInput(name);
      console.log(name);
      startScreen = false;
      requestAnimationFrame(renderFrame);
    }
    else{
      initializeNameInput('');
      nameInput.render();
      nameInput.focus();
      if(!newScore){
        newScore = true;
      }
    }
  }
  else{
    requestAnimationFrame(renderFrame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    planet.draw();
    reduceShots(maxShots);
    reduceAsteroids(maxAsteroids);
    if(!paused){
      checkCollisions();
      ship.resetAccel();
      if(loaded && !exploded){
        ship.shoot();
        loaded = false;
      }
    }
    else{
      ctx.fillStyle = '#000000';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.strokeText('lives: ' + lives, 10, 18);

    ctx.textAlign = 'right';
    ctx.strokeText('score: ' + score, canvas.width - 10, 18);
    if(bonus && bonus !== 'start' && !gameEnd){
      if(!paused){
        bonus.resetAccel();
        bonus.applyGravity(planet);
        bonus.applyMotion();
      }
      bonus.draw();
    }
    for (var i = 0; i < asteroids.length; i++) {
      if(!paused){
        asteroids[i].rotate();
        asteroids[i].resetAccel();
        asteroids[i].applyGravity(planet);
        asteroids[i].applyMotion();
      }
      asteroids[i].draw();
    }
    for (var i = 0; i < shots.length; i++) {
      if(!paused){
        shots[i].resetAccel();
        shots[i].applyGravity(planet);
        shots[i].applyMotion();
      }
      shots[i].draw();
    }
    if(gameEnd){
      if(newScore){
        var thisFinalScore = new ScoreItem(score, name);
        retrieveScores();
        addScore(thisFinalScore);
        storeScores();
        newScore = false;
      }
      ctx.fillStyle = 'rgba(255, 255, 255, .6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width / 2, 60);
      ctx.font = '12px Arial';
      ctx.fillText('Press enter to play again', canvas.width / 2, 80);
      ctx.font = '18px Arial';
      ctx.textAlign = 'left';
      var scoreSelected = false;
      for (var i = 0; i < scores.length; i++) {
        if(!scoreSelected && scores[i].finalScore === score && scores[i].name === name){
          ctx.fillStyle = '#ff0000';
          scoreSelected = true;
        }
        else{
          ctx.fillStyle = '#000000';
        }
        ctx.fillText(scores[i].finalScore + ' - ' + scores[i].name, canvas.width / 2 - 60, 100 + 20 * i);
      }
      nameInput.render();
      nameInput.focus();
    }
    else{
      if(start && !paused){
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
        if(!exploded){
          ship.applyMotion();
        }
      }
      ship.draw();
      if(checkcomplete() && !paused){
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
    }
  }
}
renderFrame();
function handleKeydown(event){
  switch(event.keyCode){
  case 13: // enter
    event.preventDefault();
    if(startScreen){
      startScreen = false;
      name = nameInput.selectText().value();
      localStorage.setItem('previousName', name);
      renderFrame();
    }
    else if(gameEnd){
      name = nameInput.selectText().value();
      localStorage.setItem('previousName', name);
      window.location.reload();
    }
    break;
  case 16: // shift
    if(!gameEnd){
      event.preventDefault();
      dampenControls = true;
    }
    break;
  case 38: // up
    if(!startScreen && !gameEnd){
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
