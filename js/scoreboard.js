'use strict';

orbs.scoreboard = {
  scores: [],
  ScoreItem: function(finalScore, name){
    this.finalScore = finalScore;
    this.name = name;
  },
  retrieveScores: function(){
    var scores = JSON.parse(localStorage.getItem('scores'));
    if(scores){
      orbs.scoreboard.scores = scores;
    }
  },
  addScore: function(finalscore){
    orbs.scoreboard.scores.push(finalscore);
    if(orbs.scoreboard.scores.length > 1){
      orbs.scoreboard.scores.sort(function(a, b){
        return b.finalScore - a.finalScore;
      });
    }
    orbs.scoreboard.scores.splice(orbs.score);
  },
  storeScores: function(){
    localStorage.setItem('scores', JSON.stringify(orbs.scoreboard.scores));
  }
};
