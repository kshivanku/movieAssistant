//NODE PACKAGES
const express = require('express');
const bodyParser = require('body-parser');
const ApiAiApp = require('actions-on-google').ApiAiApp;
const request = require('request');

//GLOBAL VARIABLES
var movies = [];
var currentIndex = 0;

//SETTING UP SERVICE
const restService = express();
restService.use(bodyParser.json());
restService.listen((process.env.PORT || 5000), function() {
  console.log("Server listening");
});

//WEBHOOK Requests
restService.post('/hook', function(req, res) {

  console.log("request received");

  //Creating a new ApiAiApp
  const app = new ApiAiApp({
    request: req,
    response: res
  });

  //Function to handle the welcome intent
  function welcomeUser(app) {
    app.ask("Hi! I am your personal movie assistant, which year movie would you want me to recommend?");
  }

  function askingMovie(app) {
    var date_period = app.getArgument("date-period");
    var genre = app.getArgument("genre");
    var year = date_period.slice(0,4);
    var url = "https://api.themoviedb.org/3/discover/movie?api_key=cd4cb70f5659be258a39908dd671ee1f&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&release_date.lte=" + year;
    if(genre != null) {
      url = url + "&with_genres=" + genre;
    }
    request({
      uri: url,
      method: 'GET'
    }, function(err, response, body){
      body = JSON.parse(body);
      for(var i = 0 ; i < body.results.length ; i++) {
        movies[i] = {
          "title" : body.results[i].title,
          "plot" : body.results[i].overview,
          "release_date" : body.results[i].release_date
        }
      }
      app.ask("You might like to watch " + movies[currentIndex].title + ". Relased on " + movies[currentIndex].release_date);
    });
  }

  //Mapping each "action" as defined in intent with functions in our JS
  const actionMap = new Map();
  actionMap.set('input.welcome', welcomeUser);
  actionMap.set('asking.movie', askingMovie);
  app.handleRequest(actionMap);
});
