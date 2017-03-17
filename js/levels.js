'use strict';

orbs.levels = [
  {
    barycenter: null,
    setPlanets: function(){
      var mass1 = (Math.pow(80 * orbs.unit, 3) / 1200) * orbs.unit,
        mass2 = (Math.pow(40 * orbs.unit, 3) / 1200) * orbs.unit,
        totalMass = mass1 + mass2,
        dist = orbs.engine.vecDelta(new orbs.engine.Point(200, 200), new orbs.engine.Point(250, 250));
      this.barycenter = new orbs.objects.Planet(totalMass);
      var speed1 = orbs.physics.findOrbitalVelocity(this.barycenter, dist.len) * mass2 / totalMass,
        speed2 =  orbs.physics.findOrbitalVelocity(this.barycenter, dist.len) * mass1 / totalMass,
        vel1 = orbs.engine.vecCirc(dist.forwardAngle + Math.PI / 2, speed1, new orbs.engine.Point(0 * orbs.unit, 0 * orbs.unit)),
        vel2 = orbs.engine.vecCirc(dist.forwardAngle - Math.PI / 2, speed2, new orbs.engine.Point(170 * orbs.unit, 170 * orbs.unit));
      orbs.planets = [
        new orbs.objects.Planet(mass1, 60 * orbs.unit, vel1, 0, [0, 80, 255], true),
        new orbs.objects.Planet(mass2, 20 * orbs.unit, vel2, 0, [80, 80, 80], false)
      ];
    },
    setShipTop: function(){
      orbs.start = false;
      orbs.destroyed = false;
      var shipVel = orbs.engine.vecCirc(Math.PI, 0, new orbs.engine.Point(0, 299 * orbs.unit));
      orbs.ship = new orbs.objects.Ship(shipVel, Math.PI, 0, '#ffffff');
    },
    launchAsteroid: function(origin, alt, placement, direction, maxRadius){
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
      var startingPointVec = orbs.engine.vecCirc(startAngle, alt, origin);
      if(direction){
        var prograde = startingPointVec.forwardAngle + Math.PI / 2;
      }
      else{
        prograde = startingPointVec.forwardAngle - Math.PI / 2;
      }
      var vel = orbs.engine.vecCirc(prograde, orbs.physics.findOrbitalVelocity(this.barycenter, startingPointVec.len), startingPointVec.head);
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
      var i = 0, inc = 1000;
      while (i <= orbs.score){
        orbs.levels[0].launchAsteroid(this.barycenter.vel.origin, 150 * orbs.unit, Math.PI / 3 + Math.random() * 1.5 * Math.PI, direction, 40 * orbs.unit);
        inc += 1000;
        i += inc;
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
