var self = this;
/*
 * Modules.
 */
var osmGeocoder = require('../node_modules/osmgeocoder'),
    forEachAsync = require('../node_modules/forEachAsync'),
    tspDriver = require('../tspDriver');
/**
 * Gets cities data from json and adds to req object.
 */
exports.getCities = function(req, res, next) {
  // Get cities json.
  var cities = require('./cities.json');
  // Add cities to req object.
  req.cities = [];
  // Add IDs to resource output for ease of use.
  for (var i in cities) {
    cities[i].id = i;
    req.cities[i] = cities[i];
  }

  next();
};
/**
 * List cities.
 */
exports.list = function(req, res) {
  // Respond.
  res.send(JSON.stringify(req.cities));
};
/**
 * Get the posted choices list and add to the req object.
 */
exports.getChoices = function(req, res, next) {
  var indices = req.body,
      indicesLength = indices.length,
      choices = [];
  // Populate choices array with city and state data.
  for (var i = 0; i < indices.length; i++) {
    // Add id.
    req.cities[indices[i]].id = indices[i];
    choices.push(req.cities[indices[i]]);
  }
  // Create data object to pass along city and state data.
  req.choices = choices;

  next();
};
/**
 * Remove duplicates from choices.
 * http://stackoverflow.com/questions/1960473/unique-values-in-an-array
 */
exports.uniqueIds = function(req, res, next) {
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
};
/**
 * Use Open Street Map to get latitude/longtitude of each city. Add to req.choices.
 */
exports.getLatitudeLongtitude = function(req, res, next) {
  var city = "";
  forEachAsync.forEachAsync(req.choices, function(nextIteration, element, index, array) {
    cityString = element.city + ", " + element.state;
    // Use Open Street Map service to get latitude/longtitude.
    osmGeocoder.geocode(cityString, function(err, geocodeRes) {
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
};
/**
 * Call the traveling salesman problem driver for shortest nearest neighbor.
 */
exports.shortestNearestNeighbor = function(req, res, next) {
  req.shortestTourPath = tspDriver.shortestNearestNeighbor(req.choices);
  next();
};
/**
 * Form output and respond.
 */
exports.respond = function(req, res) {
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
  for (var i in req.shortestTourPath) {
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

/*
 * Routes.
 */
// List cities.
app.get('/cities', self.getCities, self.list);
// Init TSP process.
// @todo add validation
app.post('/cities', self.uniqueIds, self.getCities, self.getChoices, self.getLatitudeLongtitude, self.shortestNearestNeighbor, self.respond);
