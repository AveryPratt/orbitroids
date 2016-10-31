'use strict';

var ScoreItem = function(finalScore, name){
  this.finalScore = finalScore;
  this.name = name;
};
function retrieveScores(){
  var scoreboard = JSON.parse(localStorage.getItem('scoreboard'));
  if(scoreboard){
    scores = scoreboard;
  }
}
function addScore(finalscore){
  scores.push(finalscore);
  if(scores.length > 1){
    scores.sort(function(a, b){
      return b.finalScore - a.finalScore;
    });
  }
  scores.splice(scoreNumber);
}
function storeScores(){
  localStorage.setItem('scoreboard', JSON.stringify(scores));
}
