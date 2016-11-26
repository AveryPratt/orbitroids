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
      if(!started){
        event.preventDefault();
        startScreen = false;
        name = nameInput.value;
        sessionStorage.setItem('previousName', name);
        orbs.levels[level].setPlanets();
        renderFrame();
      }
      else if(gameEnd){
        nameInput.focus = true;
        event.preventDefault();
        name = nameInput.value;
        sessionStorage.setItem('previousName', name);
        init();
      }
      break;
    case 16: // shift
      if(!gameEnd){
        event.preventDefault();
        dampenRot = true;
      }
      break;
    case 38: // up
    case 87: // w
      if(started && !gameEnd && !paused && ship){
        event.preventDefault();
        if(!start){
          // ship.vel = vecCirc(Math.PI, 1.5 * u, ship.vel.origin);
          start = true;
        }
        burning = true;
      }
      break;
    case 40: // down
    case 83: // s
      if(started && !gameEnd && !paused && ship){
        event.preventDefault();
        burning = true;
        dampenBurn = true;
      }
      break;
    case 37: // left
    case 65: // a
      if(started && !gameEnd && !paused && ship){
        event.preventDefault();
        rot = .003;
      }
      break;
    case 39: // right
    case 68: // d
      if(started && !gameEnd && !paused && ship){
        event.preventDefault();
        rot = -.003;
      }
      break;
    case 32: // space
      if(!gameEnd){
        event.preventDefault();
        if(destroyed){
          destroyed = false;
        }
        else if(start){
          loaded = true;
        }
      }
      break;
    case 80: // p
      if(!gameEnd){
        event.preventDefault();
        if(paused){
          paused = false;
        }
        else if(!paused){
          paused = true;
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
      dampenRot = false;
      break;
    case 38: // up
    case 87: // w
      burning = false;
      break;
    case 37: // left
    case 65: // a
      rot = 0;
      break;
    case 39: // right
    case 68: // d
      rot = 0;
      break;
    case 40: // up
    case 83: // w
      burning = false;
      dampenBurn = false;
      break;
    default:
      break;
    }
  }
};

window.addEventListener('keydown', orbs.controls.handleKeydown);
window.addEventListener('keyup', orbs.controls.handleKeyup);
