'use strict';

orbs.levels = [
  {
    setPlanets: function(){
      var mass1 = (Math.pow(80 * orbs.unit, 3) / 1200) * orbs.unit,
        mass2 = (Math.pow(40 * orbs.unit, 3) / 1200) * orbs.unit,
        totalMass = mass1 + mass2,
        dist = orbs.engine.vecDelta(new orbs.engine.Point(200, 200), new orbs.engine.Point(250, 250));
      orbs.planets = [
        new orbs.objects.Planet(mass1, 60 * orbs.unit, orbs.engine.vecCirc(dist.forwardAngle + Math.PI / 2, orbs.physics.findOrbitalVelocity(new orbs.objects.Planet(totalMass), dist.len) * mass2 / totalMass, new orbs.engine.Point(320 * orbs.unit, 320 * orbs.unit)), 0, [0, 80, 255], true),
        new orbs.objects.Planet(mass2, 20 * orbs.unit, orbs.engine.vecCirc(dist.forwardAngle - Math.PI / 2, orbs.physics.findOrbitalVelocity(new orbs.objects.Planet(totalMass), dist.len) * mass1 / totalMass, new orbs.engine.Point(150 * orbs.unit, 150 * orbs.unit)), 0, [80, 80, 80], false)
      ];
    },
    setShipTop: function(){
      orbs.start = false;
      orbs.destroyed = false;
      var shipVel = orbs.engine.vecCirc(Math.PI, 0, new orbs.engine.Point(300 * orbs.unit, 599 * orbs.unit));
      orbs.ship = new orbs.objects.Ship(shipVel, Math.PI, 0, '#ffffff');
    },
    launchAsteroid: function(planetIndex, alt, placement, direction, maxRadius){
      if(!orbs.start){
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
      var startingPointVec = orbs.engine.vecCirc(startAngle, alt, orbs.planets[planetIndex].vel.origin);
      if(direction){
        var prograde = startingPointVec.forwardAngle + Math.PI / 2;
      }
      else{
        prograde = startingPointVec.forwardAngle - Math.PI / 2;
      }
      var vel = orbs.engine.vecCirc(prograde, orbs.physics.findOrbitalVelocity(orbs.planets[planetIndex], startingPointVec.len), startingPointVec.head);
      new orbs.objects.Asteroid(vel, maxRadius);
    },
    launchBonus: function(){
      var vel = orbs.engine.vecDelta(new orbs.engine.Point(0, 0), new orbs.engine.Point(300 * orbs.unit, 300 * orbs.unit));
      orbs.bonuses[0] = new Bonus(vel);
    },
    addWave: function(){
      if(Math.random() > .5){
        var direction = true;
      }
      else direction = false;
      for (var i = 0, inc = 0; i <= orbs.score; inc += 1000, i += inc) {
        if(orbs.score >= i){
          orbs.levels[0].launchAsteroid(0, 150 * orbs.unit, Math.PI / 3 + Math.random() * 1.5 * Math.PI, direction, 40 * orbs.unit);
        }
      }
      if(orbs.bonuses[0] === null){
        orbs.levels[0].launchBonus();
      }
      else if(orbs.bonuses[0] === 'start'){
        orbs.bonuses[0] = null;
      }
    }
  }
];
