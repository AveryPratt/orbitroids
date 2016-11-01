'use strict';

var checkShipEscaped = function(){
  if(ship.vel.origin.x <= 0 || ship.vel.origin.x >= canvas.width || ship.vel.origin.y <= 0 || ship.vel.origin.y >= canvas.height){
    exploded = true;
  }
}
var checkShipPlanetCollision = function(){
  var noseVec = vecCart(new Point(planet.vel.origin.x - ship.nose.head.x, planet.vel.origin.y - ship.nose.head.y), planet.vel.origin);
  var leftSideVec = vecCart(new Point(planet.vel.origin.x - ship.leftSide.head.x, planet.vel.origin.y - ship.leftSide.head.y), planet.vel.origin);
  var rightSideVec = vecCart(new Point(planet.vel.origin.x - ship.rightSide.head.x, planet.vel.origin.y - ship.rightSide.head.y), planet.vel.origin);
  if(noseVec.len <= planet.radius || leftSideVec.len <= planet.radius || rightSideVec.len <= planet.radius){
    exploded = true;
  }
};
var checkShotPlanetCollisions = function(){
  for (var i = 0; i < shots.length; i++) {
    var distVec = vecCart(new Point(planet.vel.origin.x - shots[i].vel.origin.x, planet.vel.origin.y - shots[i].vel.origin.y), planet.vel.origin);
    if(distVec.len <= planet.radius){
      removeShot(i);
    }
  }
};
var checkAsteroidPlanetCollisions = function(){
  for (var i = 0; i < asteroids.length; i++) {
    var distVec = vecCart(new Point(planet.vel.origin.x - asteroids[i].vel.origin.x, planet.vel.origin.y - asteroids[i].vel.origin.y), planet.vel.origin);
    if(distVec.len <= planet.radius + asteroids[i].maxRadius){
      explodeAsteroid(i, distVec.forwardAngle);
      if(!gameEnd){
        score += 1;
      }
    }
  }
};
var checkAsteroidShipCollision = function(){
  if(!exploded){
    for (var i = 0; i < asteroids.length; i++) {
      if(vecCart(new Point(ship.vel.origin.x - asteroids[i].vel.origin.x, ship.vel.origin.y - asteroids[i].vel.origin.y)).len < asteroids[i].maxRadius + 10){
        var noseVec = vecCart(new Point(ship.nose.head.x - asteroids[i].vel.origin.x, ship.nose.head.y - asteroids[i].vel.origin.y), asteroids[i].vel.origin);
        var leftSideVec = vecCart(new Point(ship.leftSide.head.x - asteroids[i].vel.origin.x, ship.leftSide.head.y - asteroids[i].vel.origin.y), asteroids[i].vel.origin);
        var rightSideVec = vecCart(new Point(ship.rightSide.head.x - asteroids[i].vel.origin.x, ship.rightSide.head.y - asteroids[i].vel.origin.y), asteroids[i].vel.origin);
        var shipVecs = [noseVec, leftSideVec, rightSideVec];
        var asteroidVecs = [];
        for (var j = 0; j < asteroids[i].arms.length; j++) {
          asteroidVecs.push(vecCart(new Point(asteroids[i].arms[j].head.x - ship.vel.origin.x, asteroids[i].arms[j].head.y - ship.vel.origin.y), ship.vel.origin));
        }
        for (var j = 0; j < shipVecs.length; j++) {
          if(shipVecs[j].len <= asteroids[i].maxRadius){
            if(checkPointInsidePolygon(shipVecs[j].head, asteroidVecs)){
              exploded = true;
              explodeAsteroid(i);
              if(!gameEnd){
                score += 1;
              }
            }
          }
        }
        if(!exploded){
          for (var j = 0; j < asteroidVecs.length; j++) {
            if(asteroidVecs[j].len <= 10){
              if(checkPointInsidePolygon(asteroidVecs[j].head, shipVecs)){
                exploded = true;
                explodeAsteroid(i);
                if(!gameEnd){
                  score += 1;
                }
              }
            }
          }
        }
      }
    }
  }
};
var checkShotAsteroidCollisions = function(){
  for (var i = 0; i < asteroids.length; i++) {
    for (var j = 0; j < shots.length; j++) {
      var distVec = vecCart(new Point(asteroids[i].vel.origin.x - shots[j].vel.origin.x, asteroids[i].vel.origin.y - shots[j].vel.origin.y), shots[j].vel.origin);
      if(distVec.len < asteroids[i].maxRadius){
        if(checkPointInsidePolygon(shots[j].vel.origin, asteroids[i].arms)){
          if(!gameEnd){
            score += 5;
          }
          explodeAsteroid(i);
          removeShot(j);
        }
      }
    }
  }
};
var checkShotShipCollisions = function(){
  for (var i = 0; i < shots.length; i++) {
    if(vecCart(new Point(ship.vel.origin.x - shots[i].vel.origin.x, ship.vel.origin.y - shots[i].vel.origin.y)).len < 10){
      var noseVec = vecCart(new Point(ship.nose.head.x - shots[i].vel.origin.x, ship.nose.head.y - shots[i].vel.origin.y), shots[i].vel.origin);
      var leftSideVec = vecCart(new Point(ship.leftSide.head.x - shots[i].vel.origin.x, ship.leftSide.head.y - shots[i].vel.origin.y), shots[i].vel.origin);
      var rightSideVec = vecCart(new Point(ship.rightSide.head.x - shots[i].vel.origin.x, ship.rightSide.head.y - shots[i].vel.origin.y), shots[i].vel.origin);
      var shipVecs = [noseVec, leftSideVec, rightSideVec];
      if(checkPointInsidePolygon(shots[i].vel.origin, shipVecs)){
        exploded = true;
        removeShot(i);
      }
    }
  }
};
var checkPointInsidePolygon = function(point, vecArr){
  var angles = [];
  var temp;
  var total = 0;
  for (var i = 0; i < vecArr.length; i++) {
    angles.push(vecCart(new Point(point.x - vecArr[i].head.x, point.y - vecArr[i].head.y)).forwardAngle);
  }
  temp = angles[angles.length - 1];
  for (var i = 0; i < angles.length; i++) {
    var diff = angles[i] - temp;
    if(Math.abs(diff) > Math.PI){
      if(diff < 0){
        diff -= 2 * Math.PI;
      }
      else{
        diff += 2 * Math.PI;
      }
    }
    total += diff;
    temp = angles[i];
  }
  if(Math.round(total) === 0){
    return false;
  }
  else{
    return true;
  }
};
var checkBonusShipCollision = function(){
  var dist = vecCart(new Point(bonus.vel.origin.x - ship.vel.origin.x, bonus.vel.origin.y - ship.vel.origin.y), bonus.vel.origin).len;
  if(dist < 10){
    if(lives === 3){
      invincible = true;
      if(!gameEnd){
        score += 50;
      }
    }
    else{
      lives += 1;
    }
    bonus = null;
  }
};

var removeShot = function(index){
  shotRemoveArr.push(index);
  for (var i = 0; i < shotRemoveArr.length; i++) {
    shots.splice(shotRemoveArr[i], 1);
  }
  shotRemoveArr = [];
};
var explodeAsteroid = function(index, tangentAngle){
  if(asteroids[index].maxRadius >= 10){
    var parentAsteroid = asteroids[index];
    asteroids.splice(index, 1);
    var rad1 = newRad(parentAsteroid.maxRadius);
    var rad2 = newRad(parentAsteroid.maxRadius);
    var newVec1 = addVectors(parentAsteroid.vel, vecCirc(parentAsteroid.forwardAngle, .25 + 1 / rad1));
    var newVec2 = addVectors(parentAsteroid.vel, vecCirc(parentAsteroid.forwardAngle + Math.PI, .25 + 1 / rad2));
    if(tangentAngle){
      var bounce = vecCirc(tangentAngle, -Math.abs(Math.cos(tangentAngle - parentAsteroid.vel.forwardAngle)));
      newVec1 = addVectors(newVec1, bounce);
      newVec1.refineForwardAngle();
      newVec2 = addVectors(newVec2, bounce);
      newVec2.refineForwardAngle();
      // forwardAngle, len, origin, deltaRot
    }
    new Asteroid(newVec1, rad1);
    new Asteroid(newVec2, rad2);
  }
  else asteroids.splice(index, 1);
};
var newRad = function(oldRad){
  return (Math.random() + .5) * oldRad / 2;
};
