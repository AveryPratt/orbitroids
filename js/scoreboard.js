'use strict';

orbs.scoreboard = {
  ScoreItem: function(finalScore, name){
    this.finalScore = finalScore;
    this.name = name;
  },
  retrieveScores: function(){
    var scores = JSON.parse(localStorage.getItem('scores'));
    if(scores){
      scores = scores;
    }
  },
  addScore: function(finalscore){
    scores.push(finalscore);
    if(scores.length > 1){
      scores.sort(function(a, b){
        return b.finalScore - a.finalScore;
      });
    }
    scores.splice(scoreNumber);
  },
  storeScores: function(){
    localStorage.setItem('scores', JSON.stringify(scores));
  }
};
