var tour = require('../tour');

var shortestTourPath;

exports.shortestNearestNeighbor = function(cities) {
  var minPathDistance = false,
      coords = [],
      pathData;

  // Copy cities into coords. Latitude, longtitude, id.
  for (var i in cities) {
    coords.push([cities[i].latitude, cities[i].longtitude, cities[i].id]);
  }
  // For each city as origin, run nearest neighbor. Keep track of shortest route.
  for (i = 0; i < coords.length; i++) {
    pathData = tour.nearestNeighbor({
      originIndex: i,
      coords: coords,
      cityIndex: 0,
      pathDistance: 0.0,
      path: []
    });
    if (minPathDistance === false || pathData.pathDistance < minPathDistance) {
      minPathDistance = pathData.pathDistance;
      shortestTourPath = pathData.path;
    }
  }
  return shortestTourPath;
};
