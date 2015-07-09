var cwd = process.cwd();
var async = require('async');
var request = require('request');
// @todo lint all files
// @todo use async and not forEachAsync
// @todo update all files for style
// @todo use res.stash for storing things instead of req.cities, etc
// @todo remove open street map and just make the requests yoself
var tspDriver = require(cwd + '/tspDriver')();
// Get cities json.
var citiesData = require(__dirname + '/cities.json');

module.exports = function cities () {

  return {
    getCities: getCities,
    list: list,
    uniqueIds: uniqueIds,
    getChoices: getChoices,
    getLatitudeLongtitude: getLatitudeLongtitude,
    shortestNearestNeighbor: shortestNearestNeighbor,
    respond: respond
  };

  /**
   * Gets cities data from json and adds to req object.
   */
  function getCities (req, res, next) {
    // Add cities to req object.
    req.cities = [];
    // Add IDs to resource output for ease of use.
    for (var i = 0; i < citiesData.length; i++) {
      citiesData[i].id = i;
      req.cities[i] = citiesData[i];
    }

    next();
  }

  /**
   * List cities.
   */
  function list (req, res) {
    // Respond.
    res.send(JSON.stringify(req.cities));
  }

  /**
   * Get the posted choices list and add to the req object.
   */
  function getChoices (req, res, next) {
    var indices = req.body;
    var indicesLength = indices.length;
    var choices = [];
    // Populate choices array with city and state data.
    for (var i = 0; i < indices.length; i++) {
      // Add id.
      req.cities[indices[i]].id = indices[i];
      choices.push(req.cities[indices[i]]);
    }
    // Create data object to pass along city and state data.
    req.choices = choices;

    next();
  }
  /**
   * Remove duplicates from choices.
   * http://stackoverflow.com/questions/1960473/unique-values-in-an-array
   */
  function uniqueIds (req, res, next) {
    // @todo use lodash for this
    var uniqueIds = [],
        chosen = {};

    for (var i = 0; i < req.body.length; i++) {
      // Bypass duplicate.
      if (chosen.hasOwnProperty(req.body[i])) {
        continue;
      }
      uniqueIds.push(req.body[i]);
      chosen[req.body[i]] = 1;
    }
    req.body = uniqueIds;
    next();
  }
  /**
   * Use Open Street Map to get latitude/longtitude of each city. Add to req.choices.
   */
  function getLatitudeLongtitude (req, res, next) {
    // @todo cache the lat/lon results to reduce requests
    async.each(
      req.choices,
      function geocode (cityId, )
    );





    var city = '';
    forEachAsync.forEachAsync(req.choices, function (nextIteration, element, index, array) {
      cityString = element.city + ', ' + element.state;
      // Use Open Street Map service to get latitude/longtitude.
      osmGeocoder.geocode(cityString, function (err, geocodeRes) {
        // @todo handle err
        if (typeof geocodeRes[0] !== 'undefined') {
          element.latitude = geocodeRes[0].lat;
          element.longtitude = geocodeRes[0].lon;
        }
        nextIteration();
      });
    }).then(function() {
      next();
    });
  }
  /**
   * Call the traveling salesman problem driver for shortest nearest neighbor.
   */
  function shortestNearestNeighbor (req, res, next) {
    req.shortestTourPath = tspDriver.shortestNearestNeighbor(req.choices);
    next();
  };
  /**
   * Form output and respond.
   */
  function respond (req, res) {
    // Form readable output.
    var output = {
          "route": [],
          "description": "This algorithm runs the nearest neighbor algorithm once for every city, " +
                         "allowing each city to serve once as the origin. " +
                         "It returns the shortest route of these trials. " +
                         "The route list should be read in order from route[0] to route[route.length - 1] to route[0]"
        },
        cityData;
    // Form route list in output.
    for (var i = 0; i < req.shortestTourPath.length; i++) {
      // Use city id in path to get city data.
      cityData = req.cities[req.shortestTourPath[i][2]];
      output.route[i] = {};
      output.route[i].id = req.shortestTourPath[i][2];
      output.route[i].city = cityData.city;
      output.route[i].state = cityData.state;
      output.route[i].latitude = req.shortestTourPath[i][0];
      output.route[i].longtitude = req.shortestTourPath[i][1];
    }

    res.send(JSON.stringify(output));
  };
};
