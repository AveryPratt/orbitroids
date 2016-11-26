'use strict';

orbs.physics = {
  findOrbitalVelocity: function(parentBody, dist){
    return Math.pow(parentBody.mass * (1 / dist), .5);
  }
};
