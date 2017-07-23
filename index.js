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

  //Creating a new ApiAiApp
  const app = new ApiAiApp({
    request: req,
    response: res
  });

  //Function to handle the welcome intent
  function welcomeUser(app){
    app.ask("Hi! I am your personal movie assistant, which year movie would you want me to recommend?");
  }

  //Mapping each "action" as defined in intent with functions in our JS
  const actionMap = new Map();
  actionMap.set('input.welcome', welcomeUser);
});
