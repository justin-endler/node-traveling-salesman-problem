
module.exports = function tour () {

  return {
    nearestNeighbor: nearestNeighbor
  };

  /**
   * Execute recursive nearest neighbor algorithm.
   * @param {Object} pathData
   * @return {Object} pathData
   */
  function nearestNeighbor (pathData) {
    coordsCopy = [];
    for (var i = 0; i < pathData.coords.length; i++) {
      // Removed cities.
      if (pathData.coords[i] === null) {
        coordsCopy[i] = null;
      }
      // Active cities.
      else {
        coordsCopy[i] = [];
        coordsCopy[i].push(pathData.coords[i][0]);
        coordsCopy[i].push(pathData.coords[i][1]);
        coordsCopy[i].push(pathData.coords[i][2]);
      }
    }
    // Update location.
    var currentLocationIndex = pathData.originIndex,
        currentLocation = coordsCopy[currentLocationIndex];
        currentId = currentLocation[2];

    // Update path.
    pathData.path[pathData.cityIndex] = currentLocation;
    pathData.cityIndex++;
    // Remove current city.
    coordsCopy[pathData.originIndex] = null;

    var min = false,
        currentDistance = false,
        indexOfNearest = 0,
        hasCity = false,
        location;

    // Get nearest neighbor.
    for (i = 0; i < coordsCopy.length; i++) {
      // Still active?
      if (coordsCopy[i] !== null) {
        hasCity = true;
        location = coordsCopy[i];
        // Not current location.
        if (location[0] != currentLocation[0] && location[1] != currentLocation[0]) {
          currentDistance = distance(location, currentLocation);
          if (min === false || currentDistance === false || currentDistance < min) {
            min = currentDistance;
            indexOfNearest = i;
          }
        }
      }
    }
    // If there are cities left to try.
    if (hasCity) {
      pathData.pathDistance += currentDistance;

      return self.nearestNeighbor({
        originIndex: indexOfNearest,
        coords: coordsCopy,
        cityIndex: pathData.cityIndex,
        pathDistance: pathData.pathDistance,
        path: pathData.path
      });
    }
    else {
      // End of algorithm, return.
      return {
        pathDistance: pathData.pathDistance,
        path: pathData.path
      };
    }
  };
  /**
   * Calculate distance between two locations.
   * @param {Number} locationA
   * @param {Number} locationB
   * @return {Number}
   */
  function distance (locationA, locationB) {
    var latDiff = locationA[0] - locationB[0],
        lonDiff = locationA[1] - locationB[1];

    return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
  }
};

