
/**
 * Module dependencies.
 */

var express = require('express');
var cwd = process.cwd();
var routes = require(cwd + '/routes');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');

var cities = require(cwd + '/cities')();

app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', cwd + '/views');
app.set('view engine', 'jade');
// parse the incoming body
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

/*
 * Routes.
 */
app.get('/', routes.index);

// List cities.
app.get('/cities', cities.getCities, cities.list);
// Init TSP process.
// @todo add validation
// @todo move this route somewhere else?
app.post('/tour', cities.uniqueIds, cities.getCities, cities.getChoices, cities.getLatitudeLongtitude, cities.shortestNearestNeighbor, cities.respond);

// development only
if ('development' === app.get('env')) {
  app.use(errorHandler());
}

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
