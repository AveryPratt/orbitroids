'use strict';

orbs.collisions = {
  checkShipEscaped: function(){
    if(ship.vel.origin.x <= 0 || ship.vel.origin.x >= 600 * u || ship.vel.origin.y <= 0 || ship.vel.origin.y >= 600 * u){
      exploded = true;
    }
  },
  checkShipPlanetCollision: function(){
    for (var i = 0; i < planets.length; i++) {
      if(vecCart(ship.vel.origin, planets[i].vel.origin).len < planets[i].radius + 10 * u){
        var noseVec = vecCart(ship.nose.head, planets[i].vel.origin);
        var leftSideVec = vecCart(ship.leftSide.head, planets[i].vel.origin);
        var rightSideVec = vecCart(ship.rightSide.head, planets[i].vel.origin);
        if(noseVec.len <= planets[i].radius || leftSideVec.len <= planets[i].radius || rightSideVec.len <= planets[i].radius){
          exploded = true;
          new Fader(ship.vel.origin, 12, '255, 0, 0', 100, '-1');
        }
      }
    }
  },
  checkShotPlanetCollisions: function(){
    for (var i = 0; i < shots.length; i++) {
      for (var j = 0; j < planets.length; j++) {
        var distVec = vecCart(shots[i].vel.origin, planets[j].vel.origin);
        if(distVec.len <= planets[j].radius){
          shots.splice(i, 1);
          i -= 1;
          break;
        }
      }
    }
  },
  checkAsteroidPlanetCollisions: function(){
    for (var i = 0; i < asteroids.length; i++) {
      var asteroidExploded = false;
      for (var j = 0; j < planets.length; j++) {
        var distVec = vecCart(asteroids[i].vel.origin, planets[j].vel.origin);
        if(distVec.len <= planets[j].radius + asteroids[i].maxRadius){
          for (var k = 0; k < asteroids[i].arms.length; k++) {
            if(vecCart(asteroids[i].arms[k].head, planets[j].vel.origin).len <= planets[j].radius){
              if(!gameEnd){
                var added = Math.round(100 * u / asteroids[i].maxRadius);
                score += added;
                new Fader(asteroids[i].vel.origin, 8, '255, 255, 0', 50, '+' + added);
              }
              explodeAsteroid(i, distVec.forwardAngle);
              asteroidExploded = true;
              i -= 1;
              break;
            }
          }
        }
        if (asteroidExploded){
          break;
        }
      }
    }
  },
  checkAsteroidShipCollision: function(){
    if(!exploded && !destroyed){
      for (var i = 0; i < asteroids.length; i++) {
        if(vecCart(ship.vel.origin, asteroids[i].vel.origin).len < asteroids[i].maxRadius + 10 * u){
          var noseVec = vecCart(ship.nose.head, asteroids[i].vel.origin);
          var leftSideVec = vecCart(ship.leftSide.head, asteroids[i].vel.origin);
          var rightSideVec = vecCart(ship.rightSide.head, asteroids[i].vel.origin);
          var shipVecs = [noseVec, leftSideVec, rightSideVec];
          var asteroidVecs = [];
          for (var j = 0; j < asteroids[i].arms.length; j++) {
            asteroidVecs.push(vecCart(asteroids[i].arms[j].head, ship.vel.origin));
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
                i -= 1;
                break;
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
                  i -= 1;
                  break;
                }
              }
            }
          }
        }
      }
    }
  },
  checkShotAsteroidCollisions: function(){
    for (var i = 0; i < asteroids.length; i++) {
      for (var j = 0; j < shots.length; j++) {
        var distVec = vecCart(asteroids[i].vel.origin, shots[j].vel.origin);
        if(distVec.len < asteroids[i].maxRadius){
          if(checkPointInsidePolygon(shots[j].vel.origin, asteroids[i].arms)){
            if(!gameEnd){
              var added = Math.round(100 * u / asteroids[i].maxRadius) * 10;
              score += added;
              new Fader(asteroids[i].vel.origin, 8, '255, 255, 0', 50, '+' + added);
            }
            explodeAsteroid(i);
            i -= 1;
            shots.splice(j, 1);
            // j -= 1;
            break;
          }
        }
      }
    }
  },
  checkShotShipCollisions: function(){
    for (var i = 0; i < shots.length; i++) {
      if(vecCart(ship.vel.origin, shots[i].vel.origin).len < 10 * u){
        var noseVec = vecCart(ship.nose.head, shots[i].vel.origin);
        var leftSideVec = vecCart(ship.leftSide.head, shots[i].vel.origin);
        var rightSideVec = vecCart(ship.rightSide.head, shots[i].vel.origin);
        var shipVecs = [noseVec, leftSideVec, rightSideVec];
        if(checkPointInsidePolygon(shots[i].vel.origin, shipVecs)){
          exploded = true;
          new Fader(ship.vel.origin, 12, '255, 0, 0', 100, '-1');
          shots.splice(i, 1);
          i -= 1;
        }
      }
    }
  },
  checkPointInsidePolygon: function(point, vecArr){
    var angles = [];
    var temp;
    var total = 0;
    for (var i = 0; i < vecArr.length; i++) {
      angles.push(vecCart(point, vecArr[i].head).forwardAngle);
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
  },
  checkBonusShipCollision: function(){
    if(!destroyed && !exploded){
      var dist = vecCart(ship.vel.origin, bonus.vel.origin).len;
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
    }
  },
  explodeAsteroid: function(index, tangentAngle){
    if(asteroids[index].maxRadius >= 30 * u){
      var parentAsteroid = asteroids[index];
      var rad1 = newRad(parentAsteroid.maxRadius);
      var rad2 = newRad(parentAsteroid.maxRadius);
      var rad3 = newRad(parentAsteroid.maxRadius);
      var newVec1 = addVectors(parentAsteroid.vel, vecCirc(parentAsteroid.forwardAngle, 6 * u * u / rad1));
      var newVec2 = addVectors(parentAsteroid.vel, vecCirc(parentAsteroid.forwardAngle + 2 * Math.PI / 3, 6 * u * u / rad2));
      var newVec3 = addVectors(parentAsteroid.vel, vecCirc(parentAsteroid.forwardAngle + 4 * Math.PI / 3, 6 * u * u / rad3));
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
      newVec1 = addVectors(parentAsteroid.vel, vecCirc(parentAsteroid.forwardAngle, 6 * u * u / rad1));
      newVec2 = addVectors(parentAsteroid.vel, vecCirc(parentAsteroid.forwardAngle + Math.PI, 6 * u * u / rad2));
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
    asteroids.splice(index, 1);
  },
  newRad: function(oldRad){
    return (Math.random() / 3 + 1 / 3) * oldRad;
  }
};
