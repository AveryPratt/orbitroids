'use strict';

orbs.levels = [
  {
    setPlanets: function(){
      var mass = (Math.pow(80 * unit, 3) / 1200) * unit;
      planets = [
        new Planet(mass, 60 * unit, vecCart(), 0, [0, 80, 255], true)
      ];
    }
  },
  {
    setPlanets: function(){
      var mass1 = (Math.pow(80 * unit, 3) / 1200) * unit,
        mass2 = (Math.pow(40 * unit, 3) / 1200) * unit,
        totalMass = mass1 + mass2,
        dist = vecDelta(new Point(200, 200), new Point(250, 250));
      planets = [
        new Planet(mass1, 60 * unit, vecCirc(dist.forwardAngle + Math.PI / 2, findOrbitalVelocity(new Planet(totalMass), dist.len) * mass2 / totalMass, new Point(320 * unit, 320 * unit)), 0, [0, 80, 255], true),
        new Planet(mass2, 20 * unit, vecCirc(dist.forwardAngle - Math.PI / 2, findOrbitalVelocity(new Planet(totalMass), dist.len) * mass1 / totalMass, new Point(150 * unit, 150 * unit)), 0, [80, 80, 80], false)
      ];
    },
    setShipTop: function(){
      start = false;
      destroyed = false;
      var shipVel = vecCirc(Math.PI, 0, new Point(300 * unit, 599 * unit));
      ship = new Ship(Math.PI, 0, shipVel, '#ffffff');
    },
    launchAsteroid: function(planetIndex, alt, placement, direction, maxRadius){
      if(!start){
        var startAngle = Math.random() * 2 * Math.PI;
      }
      else{
        if(placement){
          startAngle = ship.trueAnom.forwardAngle + placement;
        }
        else {
          startAngle = ship.trueAnom.forwardAngle + Math.PI;
        }
      }
      var startingPointVec = vecCirc(startAngle, alt, planets[planetIndex].vel.origin);
      if(direction){
        var prograde = startingPointVec.forwardAngle + Math.PI / 2;
      }
      else{
        prograde = startingPointVec.forwardAngle - Math.PI / 2;
      }
      var vel = vecCirc(prograde, findOrbitalVelocity(planets[planetIndex], startingPointVec.len), startingPointVec.head);
      new Asteroid(vel, maxRadius);
    },
    launchBonus: function(){
      var vel = vecDelta(new Point(0, 0), new Point(300 * unit, 300 * unit));
      bonus = new Bonus(vel);
    },
    addWave: function(){
      if(Math.random() > .5){
        var direction = true;
      }
      else direction = false;
      for (var i = 0, inc = 0; i <= score; inc += 1000, i += inc) {
        if(score >= i){
          launchAsteroid(0, 150 * unit, Math.PI / 3 + Math.random() * 1.5 * Math.PI, direction, 40 * unit);
        }
      }
      if(bonus === null){
        launchBonus();
      }
      else if(bonus === 'start'){
        bonus = null;
      }
    }
  }
];
