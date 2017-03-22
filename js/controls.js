'use strict';

orbs.controls = {
  flying: false,
  gameStart: false,
  gameEnd: false,
  paused: false,
  rot: 0,
  dampenRot: false,
  loaded: false,
  name: null,
  handleKeydown: function(event){
    switch(event.keyCode){
    case 13: // enter
      if(!orbs.controls.gameStart){
        event.preventDefault();
        orbs.startScreen = false;
        orbs.controls.name = nameInput.value;
        sessionStorage.setItem('previousName', orbs.controls.name);
        orbs.levels[orbs.level].setPlanets();
        orbs.controls.gameStart = true;
        renderFrame();
      }
      else if(orbs.controls.gameEnd){
        nameInput.focus = true;
        event.preventDefault();
        orbs.controls.name = nameInput.value;
        sessionStorage.setItem('previousName', orbs.controls.name);
        init();
      }
      break;
    case 16: // shift
      if(!orbs.controls.gameEnd){
        event.preventDefault();
        orbs.ship.dampenRot = true;
      }
      break;
    case 38: // up
    case 87: // w
      if(orbs.controls.gameStart && !orbs.controls.gameEnd && !orbs.controls.paused && orbs.ship){
        event.preventDefault();
        if(!orbs.controls.flying){
          // orbs.ship.vel = vecCirc(Math.PI, 1.5 * u, orbs.ship.vel.origin);
          orbs.controls.flying = true;
        }
        orbs.ship.burning = true;
      }
      break;
    case 40: // down
    case 83: // s
      if(orbs.controls.gameStart && !orbs.controls.gameEnd && !orbs.controls.paused && orbs.ship){
        event.preventDefault();
        orbs.ship.burning = true;
        orbs.ship.dampenBurn = true;
      }
      break;
    case 37: // left
    case 65: // a
      if(orbs.controls.gameStart && !orbs.controls.gameEnd && !orbs.controls.paused && orbs.ship){
        event.preventDefault();
        orbs.controls.rot = .003;
      }
      break;
    case 39: // right
    case 68: // d
      if(orbs.controls.gameStart && !orbs.controls.gameEnd && !orbs.controls.paused && orbs.ship){
        event.preventDefault();
        orbs.controls.rot = -.003;
      }
      break;
    case 32: // space
      if(!orbs.controls.gameEnd){
        event.preventDefault();
        if(!orbs.ship){
          orbs.levels[0].setShipTop();
        }
        else if(orbs.controls.flying){
          orbs.ship.loaded = true;
        }
      }
      break;
    case 80: // p
      if(!orbs.controls.gameEnd){
        event.preventDefault();
        if(orbs.controls.paused){
          orbs.controls.paused = false;
        }
        else if(!orbs.controls.paused){
          orbs.controls.paused = true;
        }
      }
      break;
    default:
      break;
    }
  },
  handleKeyup: function(event){
    event.preventDefault();
    switch(event.keyCode){
    case 16: // shift
      orbs.ship.dampenRot = false;
      break;
    case 38: // up
    case 87: // w
      orbs.ship.burning = false;
      break;
    case 40: // down
    case 83: // s
      orbs.ship.burning = false;
      orbs.ship.dampenBurn = false;
      break;
    case 37: // left
    case 65: // a
      orbs.controls.rot = 0;
      break;
    case 39: // right
    case 68: // d
      orbs.controls.rot = 0;
      break;
    default:
      break;
    }
  }
};

window.addEventListener('keydown', orbs.controls.handleKeydown);
window.addEventListener('keyup', orbs.controls.handleKeyup);
