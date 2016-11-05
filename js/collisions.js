'use strict';

var checkShipEscaped = function(){
  if(ship.vel.origin.x <= 0 || ship.vel.origin.x >= 600 * u || ship.vel.origin.y <= 0 || ship.vel.origin.y >= 600 * u){
    exploded = true;
  }
}
var checkShipPlanetCollision = function(){
  var noseVec = vecCart(new Point(planet.vel.origin.x - ship.nose.head.x, planet.vel.origin.y - ship.nose.head.y), planet.vel.origin);
  var leftSideVec = vecCart(new Point(planet.vel.origin.x - ship.leftSide.head.x, planet.vel.origin.y - ship.leftSide.head.y), planet.vel.origin);
  var rightSideVec = vecCart(new Point(planet.vel.origin.x - ship.rightSide.head.x, planet.vel.origin.y - ship.rightSide.head.y), planet.vel.origin);
  if(noseVec.len <= planet.radius || leftSideVec.len <= planet.radius || rightSideVec.len <= planet.radius){
    exploded = true;
    new Fader(ship.vel.origin, 12, '255, 0, 0', 100, '-1');
  }
};
var checkShotPlanetCollisions = function(){
  for (var i = 0; i < shots.length; i++) {
    var distVec = vecCart(new Point(planet.vel.origin.x - shots[i].vel.origin.x, planet.vel.origin.y - shots[i].vel.origin.y), planet.vel.origin);
    if(distVec.len <= planet.radius){
      rShots.push(i);
    }
  }
};
var checkAsteroidPlanetCollisions = function(){
  for (var i = 0; i < asteroids.length; i++) {
    var distVec = vecCart(new Point(planet.vel.origin.x - asteroids[i].vel.origin.x, planet.vel.origin.y - asteroids[i].vel.origin.y), planet.vel.origin);
    if(distVec.len <= planet.radius + asteroids[i].maxRadius){
      if(!gameEnd){
        var added = Math.round(100 * u / asteroids[i].maxRadius);
        score += added;
        new Fader(asteroids[i].vel.origin, 8, '255, 255, 0', 50, '+' + added);
      }
      explodeAsteroid(i, distVec.forwardAngle);
    }
  }
};
var checkAsteroidShipCollision = function(){
  if(!exploded){
    for (var i = 0; i < asteroids.length; i++) {
      if(vecCart(new Point(ship.vel.origin.x - asteroids[i].vel.origin.x, ship.vel.origin.y - asteroids[i].vel.origin.y)).len < asteroids[i].maxRadius + 10 * u){
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
              new Fader(ship.vel.origin, 12, '255, 0, 0', 100, '-1');
              if(!gameEnd){
                var added = Math.round(100 * u / asteroids[i].maxRadius);
                score += added;
                new Fader(asteroids[i].vel.origin, 8, '255, 255, 0', 50, '+' + added);
              }
              explodeAsteroid(i);
            }
          }
        }
        if(!exploded){
          for (var j = 0; j < asteroidVecs.length; j++) {
            if(asteroidVecs[j].len <= 10 * u){
              if(checkPointInsidePolygon(asteroidVecs[j].head, shipVecs)){
                exploded = true;
                new Fader(ship.vel.origin, 12, '255, 0, 0', 100, '-1');
                if(!gameEnd){
                  added = Math.round(100 * u / asteroids[i].maxRadius);
                  score += added;
                  new Fader(asteroids[i].vel.origin, 8, '255, 255, 0', 50, '+' + added);
                }
                explodeAsteroid(i);
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
            var added = Math.round(100 * u / asteroids[i].maxRadius) * 10;
            score += added;
            new Fader(asteroids[i].vel.origin, 8, '255, 255, 0', 50, '+' + added);
          }
          explodeAsteroid(i);
          rShots.push(j);
        }
      }
    }
  }
};
var checkShotShipCollisions = function(){
  for (var i = 0; i < shots.length; i++) {
    if(vecCart(new Point(ship.vel.origin.x - shots[i].vel.origin.x, ship.vel.origin.y - shots[i].vel.origin.y)).len < 10 * u){
      var noseVec = vecCart(new Point(ship.nose.head.x - shots[i].vel.origin.x, ship.nose.head.y - shots[i].vel.origin.y), shots[i].vel.origin);
      var leftSideVec = vecCart(new Point(ship.leftSide.head.x - shots[i].vel.origin.x, ship.leftSide.head.y - shots[i].vel.origin.y), shots[i].vel.origin);
      var rightSideVec = vecCart(new Point(ship.rightSide.head.x - shots[i].vel.origin.x, ship.rightSide.head.y - shots[i].vel.origin.y), shots[i].vel.origin);
      var shipVecs = [noseVec, leftSideVec, rightSideVec];
      if(checkPointInsidePolygon(shots[i].vel.origin, shipVecs)){
        exploded = true;
        new Fader(ship.vel.origin, 12, '255, 0, 0', 100, '-1');
        rShots.push(i);
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
  if(dist < 10 * u){
    if(lives === 3){
      invincible = true;
      if(!gameEnd){
        score += 1000;
        new Fader(bonus.vel.origin, 12, '255, 255, 0', 100, '1000');
      }
    }
    else{
      lives += 1;
      new Fader(bonus.vel.origin, 12, '0, 255, 255', 100, '+1');
    }
    bonus = null;
  }
};

var removeShots = function(){
  for (var i = 0; i < rShots.length; i++) {
    shots.splice(rShots[i], 1);
  }
  rShots = [];
};
var removeAsteroids = function(){
  for (var i = 0; i < rAsteroids.length; i++) {
    asteroids.splice(rAsteroids[i], 1);
  }
  rAsteroids = [];
};
var explodeAsteroid = function(index, tangentAngle){
  if(asteroids[index].maxRadius >= 30 * u){
    var parentAsteroid = asteroids[index];
    var rad1 = newRad(parentAsteroid.maxRadius);
    var rad2 = newRad(parentAsteroid.maxRadius);
    var rad3 = newRad(parentAsteroid.maxRadius);
    var totalRad = rad1 + rad2 + rad3;
    var newVec1 = addVectors(parentAsteroid.vel, vecCirc(parentAsteroid.forwardAngle, rad1 / (2 * totalRad)));
    var newVec2 = addVectors(parentAsteroid.vel, vecCirc(parentAsteroid.forwardAngle + 2 * Math.PI / 3, rad2 / (2 * totalRad)));
    var newVec3 = addVectors(parentAsteroid.vel, vecCirc(parentAsteroid.forwardAngle + 4 * Math.PI / 3, rad3 / (2 * totalRad)));
    if(tangentAngle){
      var bounce = vecCirc(tangentAngle, -Math.abs(Math.cos(tangentAngle - parentAsteroid.vel.forwardAngle)));
      newVec1 = addVectors(newVec1, bounce);
      newVec1.refineForwardAngle();
      newVec2 = addVectors(newVec2, bounce);
      newVec2.refineForwardAngle();
      newVec3 = addVectors(newVec2, bounce);
      newVec3.refineForwardAngle();
    }
    new Asteroid(newVec1, rad1);
    new Asteroid(newVec2, rad2);
    new Asteroid(newVec3, rad3);
  }
  else if(asteroids[index].maxRadius >= 15 * u){
    parentAsteroid = asteroids[index];
    rad1 = newRad(parentAsteroid.maxRadius);
    rad2 = newRad(parentAsteroid.maxRadius);
    totalRad = rad1 + rad2;
    newVec1 = addVectors(parentAsteroid.vel, vecCirc(parentAsteroid.forwardAngle, rad1 / (2 * totalRad)));
    newVec2 = addVectors(parentAsteroid.vel, vecCirc(parentAsteroid.forwardAngle + Math.PI, rad2 / (2 * totalRad)));
    if(tangentAngle){
      bounce = vecCirc(tangentAngle, -Math.abs(Math.cos(tangentAngle - parentAsteroid.vel.forwardAngle)));
      newVec1 = addVectors(newVec1, bounce);
      newVec1.refineForwardAngle();
      newVec2 = addVectors(newVec2, bounce);
      newVec2.refineForwardAngle();
    }
    new Asteroid(newVec1, rad1);
    new Asteroid(newVec2, rad2);
  }
  rAsteroids.push(index);
};
var newRad = function(oldRad){
  return (Math.random() / 4 + .5) * oldRad;
};
