'use strict';

orbs.collisions = {
  checkShipEscaped: function(){
    if(orbs.ship.vel.origin.x <= -300 * orbs.unit || orbs.ship.vel.origin.x >= 300 * orbs.unit || orbs.ship.vel.origin.y <= -300 || orbs.ship.vel.origin.y >= 300 * orbs.unit){
      orbs.exploded = true;
    }
  },
  checkShipPlanetCollision: function(){
    for (var i = 0; i < orbs.planets.length; i++) {
      if(orbs.engine.vecCart(orbs.ship.vel.origin, orbs.planets[i].vel.origin).len < orbs.planets[i].radius + 10 * orbs.unit){
        var noseVec = orbs.engine.vecCart(orbs.ship.nose.head, orbs.planets[i].vel.origin);
        var leftSideVec = orbs.engine.vecCart(orbs.ship.leftSide.head, orbs.planets[i].vel.origin);
        var rightSideVec = orbs.engine.vecCart(orbs.ship.rightSide.head, orbs.planets[i].vel.origin);
        if(noseVec.len <= orbs.planets[i].radius || leftSideVec.len <= orbs.planets[i].radius || rightSideVec.len <= orbs.planets[i].radius){
          orbs.exploded = true;
          new orbs.objects.Fader(orbs.ship.vel.origin, 12, '255, 0, 0', 100, '-1');
        }
      }
    }
  },
  checkShotPlanetCollisions: function(){
    for (var i = 0; i < orbs.shots.length; i++) {
      for (var j = 0; j < orbs.planets.length; j++) {
        var distVec = orbs.engine.vecCart(orbs.shots[i].vel.origin, orbs.planets[j].vel.origin);
        if(distVec.len <= orbs.planets[j].radius){
          orbs.shots.splice(i, 1);
          i -= 1;
          break;
        }
      }
    }
  },
  checkAsteroidPlanetCollisions: function(){
    for (var i = 0; i < orbs.asteroids.length; i++) {
      var asteroidExploded = false;
      for (var j = 0; j < orbs.planets.length; j++) {
        var distVec = orbs.engine.vecCart(orbs.asteroids[i].vel.origin, orbs.planets[j].vel.origin);
        if(distVec.len <= orbs.planets[j].radius + orbs.asteroids[i].maxRadius){
          for (var k = 0; k < orbs.asteroids[i].arms.length; k++) {
            if(orbs.engine.vecCart(orbs.asteroids[i].arms[k].head, orbs.planets[j].vel.origin).len <= orbs.planets[j].radius){
              if(!orbs.controls.gameEnd){
                var added = Math.round(100 * orbs.unit / orbs.asteroids[i].maxRadius);
                orbs.score += added;
                new orbs.objects.Fader(orbs.asteroids[i].vel.origin, 8, '255, 255, 0', 50, '+' + added);
              }
              orbs.collisions.explodeAsteroid(i, distVec.forwardAngle);
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
    if(!orbs.exploded && !orbs.destroyed){
      for (var i = 0; i < orbs.asteroids.length; i++) {
        if(orbs.engine.vecCart(orbs.ship.vel.origin, orbs.asteroids[i].vel.origin).len < orbs.asteroids[i].maxRadius + 10 * orbs.unit){
          var noseVec = orbs.engine.vecCart(orbs.ship.nose.head, orbs.asteroids[i].vel.origin);
          var leftSideVec = orbs.engine.vecCart(orbs.ship.leftSide.head, orbs.asteroids[i].vel.origin);
          var rightSideVec = orbs.engine.vecCart(orbs.ship.rightSide.head, orbs.asteroids[i].vel.origin);
          var shipVecs = [noseVec, leftSideVec, rightSideVec];
          var asteroidVecs = [];
          for (var j = 0; j < orbs.asteroids[i].arms.length; j++) {
            asteroidVecs.push(orbs.engine.vecCart(orbs.asteroids[i].arms[j].head, orbs.ship.vel.origin));
          }
          for (var j = 0; j < shipVecs.length; j++) {
            if(shipVecs[j].len <= orbs.asteroids[i].maxRadius){
              if(orbs.collisions.checkPointInsidePolygon(shipVecs[j].head, asteroidVecs)){
                orbs.exploded = true;
                new orbs.objects.Fader(orbs.ship.vel.origin, 12, '255, 0, 0', 100, '-1');
                if(!orbs.controls.gameEnd){
                  var added = Math.round(100 * orbs.unit / orbs.asteroids[i].maxRadius);
                  orbs.score += added;
                  new orbs.objects.Fader(orbs.asteroids[i].vel.origin, 8, '255, 255, 0', 50, '+' + added);
                }
                orbs.collisions.explodeAsteroid(i);
                i -= 1;
                break;
              }
            }
          }
          if(!orbs.exploded){
            for (var j = 0; j < asteroidVecs.length; j++) {
              if(asteroidVecs[j].len <= 10 * orbs.unit){
                if(orbs.collisions.checkPointInsidePolygon(asteroidVecs[j].head, shipVecs)){
                  orbs.exploded = true;
                  new orbs.objects.Fader(orbs.ship.vel.origin, 12, '255, 0, 0', 100, '-1');
                  if(!orbs.controls.gameEnd){
                    added = Math.round(100 * orbs.unit / orbs.asteroids[i].maxRadius);
                    orbs.score += added;
                    new orbs.objects.Fader(orbs.asteroids[i].vel.origin, 8, '255, 255, 0', 50, '+' + added);
                  }
                  orbs.collisions.explodeAsteroid(i);
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
    for (var i = 0; i < orbs.asteroids.length; i++) {
      for (var j = 0; j < orbs.shots.length; j++) {
        var distVec = orbs.engine.vecCart(orbs.asteroids[i].vel.origin, orbs.shots[j].vel.origin);
        if(distVec.len < orbs.asteroids[i].maxRadius){
          if(orbs.collisions.checkPointInsidePolygon(orbs.shots[j].vel.origin, orbs.asteroids[i].arms)){
            if(!orbs.controls.gameEnd){
              var added = Math.round(100 * orbs.unit / orbs.asteroids[i].maxRadius) * 10;
              orbs.score += added;
              new orbs.objects.Fader(orbs.asteroids[i].vel.origin, 8, '255, 255, 0', 50, '+' + added);
            }
            orbs.collisions.explodeAsteroid(i);
            i -= 1;
            orbs.shots.splice(j, 1);
            // j -= 1;
            break;
          }
        }
      }
    }
  },
  checkShotShipCollisions: function(){
    for (var i = 0; i < orbs.shots.length; i++) {
      if(orbs.engine.vecCart(orbs.ship.vel.origin, orbs.shots[i].vel.origin).len < 10 * orbs.unit){
        var noseVec = orbs.engine.vecCart(orbs.ship.nose.head, orbs.shots[i].vel.origin);
        var leftSideVec = orbs.engine.vecCart(orbs.ship.leftSide.head, orbs.shots[i].vel.origin);
        var rightSideVec = orbs.engine.vecCart(orbs.ship.rightSide.head, orbs.shots[i].vel.origin);
        var shipVecs = [noseVec, leftSideVec, rightSideVec];
        if(orbs.collisions.checkPointInsidePolygon(orbs.shots[i].vel.origin, shipVecs)){
          orbs.exploded = true;
          new orbs.objects.Fader(orbs.ship.vel.origin, 12, '255, 0, 0', 100, '-1');
          orbs.shots.splice(i, 1);
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
      angles.push(orbs.engine.vecCart(point, vecArr[i].head).forwardAngle);
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
    if(!orbs.destroyed && !orbs.exploded){
      var dist = orbs.engine.vecCart(orbs.ship.vel.origin, bonus.vel.origin).len;
      if(dist < 10 * orbs.unit){
        if(lives === 3){
          invincible = true;
          if(!orbs.controls.gameEnd){
            orbs.score += 1000;
            new orbs.objects.Fader(bonus.vel.origin, 12, '255, 255, 0', 100, '1000');
          }
        }
        else{
          lives += 1;
          new orbs.objects.Fader(bonus.vel.origin, 12, '0, 255, 255', 100, '+1');
        }
        bonus = null;
      }
    }
  },
  explodeAsteroid: function(index, tangentAngle){
    if(orbs.asteroids[index].maxRadius >= 30 * orbs.unit){
      var parentAsteroid = orbs.asteroids[index];
      var rad1 = orbs.collisions.newRad(parentAsteroid.maxRadius);
      var rad2 = orbs.collisions.newRad(parentAsteroid.maxRadius);
      var rad3 = orbs.collisions.newRad(parentAsteroid.maxRadius);
      var newVec1 = orbs.engine.addVectors(parentAsteroid.vel, orbs.engine.vecCirc(parentAsteroid.forwardAngle, 6 * orbs.unit * orbs.unit / rad1));
      var newVec2 = orbs.engine.addVectors(parentAsteroid.vel, orbs.engine.vecCirc(parentAsteroid.forwardAngle + 2 * Math.PI / 3, 6 * orbs.unit * orbs.unit / rad2));
      var newVec3 = orbs.engine.addVectors(parentAsteroid.vel, orbs.engine.vecCirc(parentAsteroid.forwardAngle + 4 * Math.PI / 3, 6 * orbs.unit * orbs.unit / rad3));
      if(tangentAngle){
        var bounce = orbs.engine.vecCirc(tangentAngle, -Math.abs(Math.cos(tangentAngle - parentAsteroid.vel.forwardAngle)));
        newVec1 = orbs.engine.addVectors(newVec1, bounce);
        newVec1.refineForwardAngle();
        newVec2 = orbs.engine.addVectors(newVec2, bounce);
        newVec2.refineForwardAngle();
        newVec3 = orbs.engine.addVectors(newVec2, bounce);
        newVec3.refineForwardAngle();
      }
      new orbs.objects.Asteroid(newVec1, rad1);
      new orbs.objects.Asteroid(newVec2, rad2);
      new orbs.objects.Asteroid(newVec3, rad3);
    }
    else if(orbs.asteroids[index].maxRadius >= 15 * orbs.unit){
      parentAsteroid = orbs.asteroids[index];
      rad1 = orbs.collisions.newRad(parentAsteroid.maxRadius);
      rad2 = orbs.collisions.newRad(parentAsteroid.maxRadius);
      newVec1 = orbs.engine.addVectors(parentAsteroid.vel, orbs.engine.vecCirc(parentAsteroid.forwardAngle, 6 * orbs.unit * orbs.unit / rad1));
      newVec2 = orbs.engine.addVectors(parentAsteroid.vel, orbs.engine.vecCirc(parentAsteroid.forwardAngle + Math.PI, 6 * orbs.unit * orbs.unit / rad2));
      if(tangentAngle){
        bounce = orbs.engine.vecCirc(tangentAngle, -Math.abs(Math.cos(tangentAngle - parentAsteroid.vel.forwardAngle)));
        newVec1 = orbs.engine.addVectors(newVec1, bounce);
        newVec1.refineForwardAngle();
        newVec2 = orbs.engine.addVectors(newVec2, bounce);
        newVec2.refineForwardAngle();
      }
      new orbs.objects.Asteroid(newVec1, rad1);
      new orbs.objects.Asteroid(newVec2, rad2);
    }
    orbs.asteroids.splice(index, 1);
  },
  newRad: function(oldRad){
    return (Math.random() / 3 + 1 / 3) * oldRad;
  }
};
