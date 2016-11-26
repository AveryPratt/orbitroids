'use strict';

orbs.levels = [
  {
    setPlanets: function(){
      var mass1 = (Math.pow(80 * u, 3) / 1200) * u,
        mass2 = (Math.pow(40 * u, 3) / 1200) * u,
        totalMass = mass1 + mass2,
        dist = vecDelta(new Point(200, 200), new Point(250, 250));
      planets = [
        new Planet(mass1, 60 * u, vecCirc(dist.forwardAngle + Math.PI / 2, findOrbitalVelocity(new Planet(totalMass), dist.len) * mass2 / totalMass, new Point(320 * u, 320 * u)), 0, [0, 80, 255], true),
        new Planet(mass2, 20 * u, vecCirc(dist.forwardAngle - Math.PI / 2, findOrbitalVelocity(new Planet(totalMass), dist.len) * mass1 / totalMass, new Point(150 * u, 150 * u)), 0, [80, 80, 80], false)
      ];
    }
  }
];
