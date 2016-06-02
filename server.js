'use strict';

var request = require('request');
var express = require('express');
var nunjucks = require('nunjucks');
var format = require('string-format')
format.extend(String.prototype)



var app = express();

nunjucks.configure('views',{
  autoescape: true,
  express: app,
  watch:true
});


var meetupApiKey= '45482a6536f5068326310786f80351c';
var geoCodeApiKey = "AIzaSyDkLWiFHDZ-kgcUKAMkv0wNAiieQZi21ls";
var meetupURLTemplate = "https://api.meetup.com/2/open_events/?&key=" + meetupApiKey + "&sign=true&photo-host=public&zip={userZip}&country=UnitedStates&page=1000&category=1,5,10,11,20,21,23,30,31,32";
var zipCode;


function middlewareCity(req,res,next){
  console.log('middlewareCity()');
  var state = req.query.state;
  var city = req.query.city;
  //var googleGeoCode = 'https://maps.googleapis.com/maps/api/geocode/json?address='+state+','+'+'+ city +'&key='+geoCodeApiKey;

  if (city === undefined || state === undefined){
    next();
    return;
  }

  var googleGeoCode = 'https://maps.googleapis.com/maps/api/geocode/json?address={state},+{city}&key={geoCodeApiKey}';
  googleGeoCode = googleGeoCode.format({state:state, city: city, geoCodeApiKey: geoCodeApiKey});
  // googleGeoCode = format(googleGeoCode, {state:state, city: city, geoCodeApiKey: geoCodeApiKey});

  request(googleGeoCode, function(error,response,body){
    // console.log('middlewareCity(),body:',body);
    if (error) throw error;

    var data = JSON.parse(body);


    var results = data.results;

    if (results.length > 0)
    {
      var result = results[0];

      var location = result.geometry.location;
      // console.log(JSON.stringify(location, null, 4));
      req.user_location = location;

    }
    next();


  });


}
function middlewareZip(req,res,next){
  // console.log('middlewareZip()');

  if (req.user_location === undefined){

    next();
    return;
  }

  var lngtd = req.user_location.lng;
  var latd = req.user_location.lat;
  var googleGeoCode = 'https://maps.googleapis.com/maps/api/geocode/json?latlng={latd},{lngtd}&key={geoCodeApiKey}';
  googleGeoCode = googleGeoCode.format({lngtd: lngtd, latd: latd, geoCodeApiKey: geoCodeApiKey});
  request(googleGeoCode, function(error,response,body){
    if (error) throw error;
    var data = JSON.parse(body);
    var results = data.results;
    if (results.length > 0)
    {
      var result = results[0];
      // console.log(result.address_components);
      for(var i = 0; i < result.address_components.length; i++){
        // console.log(result.address_components[i].types[0]);
        if (result.address_components[i].types[0] === "postal_code"){
          var zip = result.address_components[i].long_name;
        }
      }
      req.userZip = zip;
    }
    next();
  });


}


app.get('/',middlewareCity, middlewareZip, function(req,res, next) {
  //if the url has ?location=dallas
  // "dallas" will now be stored in `location`; else `location` should be
  // undefined.
  // var startTime = req.query.time;


  var startDate = req.query.startDate;
  var endDate = req.query.endDate;
  console.log("this is start", typeof startDate);
  console.log("this is end", typeof endDate);

  // console.log('app.get("/")');
  if (req.userZip !== undefined){
    var userZip = req.userZip;

    var meetupURL = meetupURLTemplate.format({userZip: userZip});
    request(meetupURL,  function(error,response,body){
      var meetups = [];
      var betweenDate= [];
      var events = JSON.parse(body);

      for(var i = 0; i < events.results.length; i++){
        var meetup = events.results[i];
        meetups.push(meetup);


      }

      // console.log(meetups);
      res.render('index.html', {name:"Gus", logged_in: true, meetups: meetups, city: req.query.city, state: req.query.state, has_results: true});

    });
  } else {

    res.render('index.html', {name:"Gus", logged_in: true, meetups: [], has_results: false});

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
