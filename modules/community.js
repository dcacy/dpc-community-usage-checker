var https = require('https');
var parseString = require('xml2js').parseString;
var rp = require('request-promise');
var Promise = require('promise');
var dateMath = require('date-arithmetic');

/*
* get the managers from Connections.
* Creates a simple JSON Array with manager name and email
*/
exports.getCommunityMembers = function(properties, id) {

	var COMM_MEMBERS_URI = '/communities/service/atom/community/members?communityUuid=';


  console.log('in getCommunityMembers');
  var options = {
	    method: 'GET',
	    uri: 'https://' + properties.get('connections_host') + COMM_MEMBERS_URI + id,
	    "auth": {
        "user": properties.get('connections_userid'),
        "pass": properties.get('connections_password')
    },
    resolveWithFullResponse: true, // gives us the statusCode
    json: false // Automatically parses the body to JSON
	};
	console.log('getting community members with options:', options);

	return new Promise(function(resolve, reject){
		
	
		rp(options)
	  .then(function (result) {
//	  	console.log('result is', result.body);
	  	// force and array so we can iterate through it, even if there is only one result
	    parseString(result.body, { explicitArray:true }, function(err, parsedXml) {
//	    	console.dir(parsedXml);
//	    	console.dir(parsedXml.feed.entry);
//	    	console.log('id', id, 'has this many members:', parsedXml.feed['opensearch:totalResults']._);
	    	console.log('nbr of entries:', parsedXml.feed.entry.length);
	    	var members = [];
	    	for (var i = 0; i < parsedXml.feed.entry.length; i++) {
	    		var member = {
	    				name: parsedXml.feed.entry[i].contributor[0].name[0],
	    				email: parsedXml.feed.entry[i].contributor[0].email[0],
	    				state: parsedXml.feed.entry[i].contributor[0]["snx:userState"][0]._
	    		};
	    		members.push(member);
	    	}
//	    	resolve(parsedXml.feed['opensearch:totalResults']._);
	    	resolve({"type":"members", "data": members});
//	    }
	//    	for (var i = 0;)
	//      res.setHeader('Content-Type','text/plain');
	//      res.end(JSON.stringify(parsedXml, null, 3));
	  });
	//  	res.end(result.body);
	  })
	  .catch(function(err){
	  	console.log('error getting community members', err.message);
	  	reject('error getting community members: ' + err.message);
	  });
	});


};


exports.getCommunityFiles = function(properties, id){
	var COMM_FILES_URI = '/files/basic/api/communitycollection/'
		+ id
		+ '/feed?sC=document&pageSize=500&sortBy=title&type=communityFiles';


  console.log('in getCommunityFiles');
  var options = {
	    method: 'GET',
	    uri: 'https://' + properties.get('connections_host') + COMM_FILES_URI,
	    "auth": {
        "user": properties.get('connections_userid'),
        "pass": properties.get('connections_password')
    },
    resolveWithFullResponse: true, // gives us the statusCode
    json: false // don't parse the body to JSON
	};
	console.log('getting community files with options:', options);

	return new Promise(function(resolve, reject){
		
		rp(options)
	  .then(function (result) {
//	  	console.log('result is', result.body);
	    parseString(result.body, { explicitArray:true }, function(err, parsedXml) {
//	    	console.log('json version is', parsedXml);
	    	if ( err ) {
	    		console.log('error in parsing files!', err);
	    	}
//	    	console.log('id', id, 'has this many files:', parsedXml.feed['opensearch:totalResults']);
	    	var files = [];
	    	if ( parsedXml.feed['opensearch:totalResults'] > 0 ) {
	//	    	console.log('nbr of files:', parsedXml.feed.entry.length);
		    	for (var i = 0; i < parsedXml.feed.entry.length; i++) {
//		    		console.dir(parsedXml.feed.entry[i].link);
		    		var sizeLink = parsedXml.feed.entry[i].link.find(function(item) {
		    			return typeof item.$.length !== 'undefined';
		    		});
//		    		console.log('title is', parsedXml.feed.entry[i].title);
		    		var file = {
		    				title: parsedXml.feed.entry[i].title[0]._,
		    				size: sizeLink.$.length
		    		};
		    		files.push(file);
		    	}
	//	    	resolve(parsedXml.feed['opensearch:totalResults']._);
	//	    }
	    	} else {
	    		// no files
	    	}
	    	resolve({"type":"files", "data": files});
	//    	for (var i = 0;)
	//      res.setHeader('Content-Type','text/plain');
	//      res.end(JSON.stringify(parsedXml, null, 3));
	  });
	//  	res.end(result.body);
	  })
	  .catch(function(err){
	  	console.log('error getting community files', err);
	  	reject(err);
	  });
	});
};

exports.getRecentActivity = function(properties, id){
	
	var oneMonthAgo = dateMath.subtract(new Date(), 30, 'day').toISOString();
	console.log('onemonthago is', oneMonthAgo);
//	  return newDate.toISOString();
	
	var COMM_ACTIVITY_URI = '/connections/opensocial/basic/rest/activitystreams/urn:lsid:lconn.ibm.com:communities.community:'
		+ id 
		+ '/@all/@all?rollup=true&shortStrings=true&format=json&updatedSince' + oneMonthAgo;
		

  console.log('in getRecentActivity');
  var options = {
	    method: 'GET',
	    uri: 'https://' + properties.get('connections_host') + COMM_ACTIVITY_URI,
	    "auth": {
        "user": properties.get('connections_userid'),
        "pass": properties.get('connections_password')
    },
    resolveWithFullResponse: true, // gives us the statusCode
    json: true // parse the body to JSON
	};
	console.log('getting recent activity files with options:', options);

	return new Promise(function(resolve, reject){
		
		rp(options)
	  .then(function (result) {
	  	console.dir(result.body.list);
	    	console.log('id', id, 'has this many updates:', result.body.list.length);
	    	var activity = [];
	    	for (var i = 0; i < result.body.list.length; i++) {
	        var details = {
	            name : result.body.list[i].connections.containerName,
	            title: result.body.list[i].connections.plainTitle,
	            author: result.body.list[i].actor.displayName,
	            publishedDate: result.body.list[i].published,
	            shortTitle: result.body.list[i].connections.shortTitle,
	            itemUrl: result.body.list[i].openSocial.embed.context.itemUrl
	          };
	          activity.push(details);
	    	}

	    	resolve({"type":"activity", "data": activity});

	  })
	  .catch(function(err){
	  	console.log('error getting recent activity', err);
	  	reject(err);
	  });
	});
};
