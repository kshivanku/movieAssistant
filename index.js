//NODE PACKAGES
const express = require('express');
const bodyParser = require('body-parser');
const ApiAiApp = require('actions-on-google').ApiAiApp;
const request = require('request');

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
    app.ask("getting movie from " + date_period + " from the genre " + genre);
  }

  //Mapping each "action" as defined in intent with functions in our JS
  const actionMap = new Map();
  actionMap.set('input.welcome', welcomeUser);
  actionMap.set('asking.movie', askingMovie);
  app.handleRequest(actionMap);
});
