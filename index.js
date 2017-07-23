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
  console.log(req);
});
