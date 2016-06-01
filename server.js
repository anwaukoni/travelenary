'use strict';

var request = require('request');
var express = require('express');
var nunjucks = require('nunjucks');
var app = express();

nunjucks.configure('views',{
  autoescape: true,
  express: app,
  watch:true
});


var meetupApiKey= '45482a6536f5068326310786f80351c';
var meetupURL = 'https://api.meetup.com/2/open_events';
var geoCodeApiKey = "AIzaSyDkLWiFHDZ-kgcUKAMkv0wNAiieQZi21ls";
var myUrl = "https://api.meetup.com/2/open_events/?&key=" + meetupApiKey + "&sign=true&photo-host=public&zip=90001&country=UnitedStates&page=100&category=1,5,10,11,20,21,23,30,31,32";
// var state = req.query.state;
// var city = req.query.city;
var zipCode;

// var myFilters = {
//   //Create userfilters for location
//   cityState: request( 'https://maps.googleapis.com/maps/api/geocode/json?address='+state,'+'+ city +'&key='+'geoCodeApiKey', function(){}),
//
//
//   //Create userfilter for Time period
//   startTime: function()
//
// }

app.get('/', function(req,res) {
  //if the url has ?location=dallas
  // "dallas" will now be stored in `location`; else `location` should be
  // undefined.

  // var startTime = req.query.time;

  var location = req.query.location;

  var meetups = [];

  if (location){
    request(myUrl,  function(error,response,html){

      var events = JSON.parse(html);

      for(var i = 0; i < events.results.length; i++){
        meetups.push(events.results[i]);
      }

      console.log(meetups);
      res.render('index.html', {name:"Gus", logged_in: true, meetups: meetups, location:location});

    });

  }else{
    res.render('index.html', {name:"Gus", logged_in: true, meetups: meetups,location:location});
  }
  //Once we know the location, the template wants to tell the user his chosen
  // location, so we send it in to the dictionary.

});

app.listen(3000);

///use meetups API to retrieve a non-empty list for `meetups`
///then, filter it based on time.
// var meetups = [ {location: "44street", time: '4pm, June 1st'}
//   , {location: "44street", time: '5pm, June 1st'}
//   , {location: "44street", time: '6pm, June 2st'}
//   , {location: "44street", time: '2pm, June 3st'}
//   , {location: "44street", time: '4pm, June 1st'}
// ];
