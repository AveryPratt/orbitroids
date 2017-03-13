'use strict';

orbs.controls = {
  started: false,
  gameEnd: false,
  paused: false,
  burning: false,
  dampenBurn: false,
  rot: 0,
  dampenRot: false,
  loaded: false,
  handleKeydown: function(event){
    switch(event.keyCode){
    case 13: // enter
      if(!orbs.controls.started){
        event.preventDefault();
        orbs.startScreen = false;
        name = nameInput.value;
        sessionStorage.setItem('previousName', name);
        orbs.levels[orbs.level].setPlanets();
        renderFrame();
      }
      else if(orbs.controls.gameEnd){
        nameInput.focus = true;
        event.preventDefault();
        name = nameInput.value;
        sessionStorage.setItem('previousName', name);
        init();
      }
      break;
    case 16: // shift
      if(!orbs.controls.gameEnd){
        event.preventDefault();
        orbs.controls.dampenRot = true;
      }
      break;
    case 38: // up
    case 87: // w
      if(orbs.controls.started && !orbs.controls.gameEnd && !orbs.controls.paused && ship){
        event.preventDefault();
        if(!start){
          // ship.vel = vecCirc(Math.PI, 1.5 * u, ship.vel.origin);
          start = true;
        }
        orbs.controls.burning = true;
      }
      break;
    case 40: // down
    case 83: // s
      if(orbs.controls.started && !orbs.controls.gameEnd && !orbs.controls.paused && ship){
        event.preventDefault();
        orbs.controls.burning = true;
        orbs.controls.dampenBurn = true;
      }
      break;
    case 37: // left
    case 65: // a
      if(orbs.controls.started && !orbs.controls.gameEnd && !orbs.controls.paused && ship){
        event.preventDefault();
        orbs.controls.rot = .003;
      }
      break;
    case 39: // right
    case 68: // d
      if(orbs.controls.started && !orbs.controls.gameEnd && !orbs.controls.paused && ship){
        event.preventDefault();
        orbs.controls.rot = -.003;
      }
      break;
    case 32: // space
      if(!orbs.controls.gameEnd){
        event.preventDefault();
        if(destroyed){
          destroyed = false;
        }
        else if(start){
          orbs.controls.loaded = true;
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
      orbs.controls.dampenRot = false;
      break;
    case 38: // up
    case 87: // w
      orbs.controls.burning = false;
      break;
    case 37: // left
    case 65: // a
      orbs.controls.rot = 0;
      break;
    case 39: // right
    case 68: // d
      orbs.controls.rot = 0;
      break;
    case 40: // up
    case 83: // w
      orbs.controls.burning = false;
      orbs.controls.dampenBurn = false;
      break;
    default:
      break;
    }
  }
};

window.addEventListener('keydown', orbs.controls.handleKeydown);
window.addEventListener('keyup', orbs.controls.handleKeyup);
