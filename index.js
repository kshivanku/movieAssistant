//NODE PACKAGES
const express = require('express');
const bodyParser = require('body-parser');
const ApiAiApp = require('actions-on-google').ApiAiApp;
const request = require('request');
const fs = require('fs');

//GLOBAL VARIABLES
var movies = [];
var currentIndex = 0;
var setYear = null;
var setGenre = null;
var genreDB = JSON.parse(fs.readFileSync("genreID.json"));

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
  function welcomeUser(app) {
    resetData();
    app.ask("Hi! I am your personal movie assistant, which year movie would you want me to recommend?");
  }

  function askingMovie(app) {
    var date_period = app.getArgument("date-period");
    var genre = app.getArgument("genre");

    console.log('date_period', date_period);
    console.log('genre', genre);
    console.log('setYear', setYear);
    console.log('setGenre', setGenre);

    var url = "https://api.themoviedb.org/3/discover/movie?api_key=cd4cb70f5659be258a39908dd671ee1f&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1";

    if(date_period != null) {
      setYear = date_period.slice(0,4);
      url = url + "&primary_release_year=" + setYear;
    }
    else if(setYear != null) {
      url = url + "&primary_release_year=" + setYear;
    }

    if(genre != null) {
      setGenre = setGenreID(genre);
      url = url + "&with_genres=" + setGenre;
    }
    else if(setGenre != null) {
      url = url + "&with_genres=" + setGenre;
    }

    console.log("Final URL for request: ", url);

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
      console.log('movies', movies);
      currentIndex = 0;
      app.ask("You might like to watch " + movies[currentIndex].title + ". Relased on " + movies[currentIndex].release_date);
    });
  }

  function askingNext(app) {
    console.log("Inside askingNext");
    currentIndex += 1;
    if(currentIndex < movies.length) {
      app.ask("Ok, how about " + movies[currentIndex].title + ". Relased on " + movies[currentIndex].release_date);
    }
    else {
      app.tell("These are all the movies that I have for the given year");
    }
  }

  function askingPlot(app) {
    app.ask("Here is the plot of " + movies[currentIndex].title + ". "+ movies[currentIndex].plot);
  }

  //Mapping each "action" as defined in intent with functions in our JS
  const actionMap = new Map();
  actionMap.set('input.welcome', welcomeUser);
  actionMap.set('asking.movie', askingMovie);
  actionMap.set('next.recco', askingNext);
  actionMap.set('know.plot', askingPlot);
  app.handleRequest(actionMap);
});

function resetData(){
  movies = [];
  currentIndex = 0;
  setYear = null;
  setGenre = null;
}

function setGenreID(genre) {
  for (var i = 0 ; i < genreDB.genres.length ; i++) {
    if(genreDB.genres[i].name.toLoweCase() == genre.toLoweCase()) {
      return genreDB.genres[i].id;
    }
  }
}
