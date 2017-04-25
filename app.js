
var express = require('express');
var cfenv = require('cfenv');
var app = express();
var rp = require('request-promise');
var Promise = require('promise');
var url = require('url');
var bodyParser = require('body-parser');
app.use(bodyParser.json());

//var managers = require('./modules/managers');
//var peopleManaged = require('./modules/peopleManaged');

var parseString = require('xml2js').parseString;

var appEnv = cfenv.getAppEnv();

// read parameters from a properties file
var propertiesReader = require('properties-reader');
var properties = propertiesReader('./connections.properties');
console.log('properties are ', properties);
//console.log('userid is', properties.get('connections_userid'));

//var ALL_COMMUNITIES_URI = '/communities/service/atom/communities/all?ps=500';
//var COMM_MEMBERS_URI = '/communities/service/atom/community/members?communityUuid=';

var community = require('./modules/community');
/*
* this call will get the list of Communities from Connections
* INPUT: n/a
* RETURNS: json containing the data from Connections
*/
app.get('/getAllCommunities', function(req, res) {
	community.getAllCommunities(properties)
	.then(function(result){
		res.json(result);
	})
	.catch(function(err){
		console.log('getAllCommunities returned error',err);
		res.status(500).end('get all communities returned error:' + err.message);
	});


});


app.get('/getCommunityDetails', function(req, res){
	console.log('in /getCommunityDetails');
  var qs = url.parse(req.url,true).query;
  console.log('qs is', qs);
  if ( qs.id ) {
  	var promises = [];
//  	for ( var i = 0; i < managers.length; i++) {
    promises.push(community.getCommunityMembers(properties, qs.id));
    promises.push(community.getCommunityFiles(properties, qs.id));
    promises.push(community.getRecentActivity(properties, qs.id));
//  	}
  	Promise.all(promises)
  	.then(function(allData) {
//  		console.log('all promises are back:', allData);
  		res.json(allData);
//  		res.json('{result:"done"}');
  	})
  	.catch(function(err){
  		console.log('error in one of the promises:', err);
  		res.status(500).json(err);
  	});
  } else {
  	res.status(400).end('no Community ID provided');
  }
});

/**
* Given a Community, return their members
*/
app.get('/getCommunityMembers', function(req, res) {
  console.log('in /getCommunityMembers');
  var qs = url.parse(req.url,true).query;
  console.log('qs is', qs);
  if ( qs.id ) {
  	community.getCommunityMembers(properties, [qs.id])
  	.then(function(result){
  		console.log('got promise and it is', result);
  		res.end(result.toString());
  	})
  	.catch(function(err){
  		console.log('getCommunityMembers returned error',err);
  		res.status(500).end(err);
  	});
  } else {
  	res.end('no id provided');
  }

});

app.get('/bizCard/:protocol/:host/:profiles/:json/:therest', function(req, res) {
//app.get('/bizCard', function(req, res){
	//http://localhost:6014/bizCard/http/dpc-c60.ibmcollabcloud.com%3A80/profiles/json/semanticTagProfileView.do?email=dmishkey@greenwell.com&auth=true&etag=20170405.124747&suppress401=true
//	console.log('host is', req.params.host);
//	console.dir(req.params);
//	console.log('this is url:', req.url);
//	console.log('url is', url);
//	var qs = req.url.split('?');
	
//	var parsed = url.parse(req.url,true);
//	console.log('parsed is', qs[1]);
  var qs = url.parse(req.url,true).query;
//  console.dir(qs);
  var urlString = req.params.protocol + '://' + req.params.host + '/' + req.params.profiles + '/' + req.params.json + '/' + req.params.therest;
  urlString += '?email=' + qs.email + '&auth=' + qs.auth + '&etag=' + qs.etag + '&suppress401=' + qs.suppress401;
//	res.end(urlString);
	rp(urlString)
	.then(function(result){
		console.log('result of bizcard is', result);
		res.json(result);
	})
	.catch(function(err){
		console.log('problem getting business card:', err);
	});
});
//app.get('/credentials/:deviceId', function(req, res) {


app.use(express.static(__dirname + '/public'));

// app.listen(process.env.PORT || 3001);
app.listen(appEnv.port || 3001, '0.0.0.0', function() {
  console.log('server starting on ', appEnv.url);
});
