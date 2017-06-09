/**
 *
 *********************** IBM COPYRIGHT START  *********************************
// @copyright(disclaimer)
//
// Licensed Materials - Property of IBM
// 5724-L31
// (C) Copyright IBM Corp. 2017. All Rights Reserved.
//
// US Government Users Restricted Rights
// Use, duplication or disclosure restricted by GSA ADP Schedule
// Contract with IBM Corp.
//
// DISCLAIMER OF WARRANTIES :
//
// Permission is granted to copy and modify this Sample code, and to
// distribute modified versions provided that both the copyright
// notice, and this permission notice and warranty disclaimer appear
// in all copies and modified versions.
//
// THIS SAMPLE CODE IS LICENSED TO YOU "AS-IS".
// IBM  AND ITS SUPPLIERS AND LICENSORS  DISCLAIM
// ALL WARRANTIES, EITHER EXPRESS OR IMPLIED, IN SUCH SAMPLE CODE,
// INCLUDING THE WARRANTY OF NON-INFRINGEMENT AND THE IMPLIED WARRANTIES
// OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT
// WILL IBM OR ITS LICENSORS OR SUPPLIERS BE LIABLE FOR ANY DAMAGES ARISING
// OUT OF THE USE OF  OR INABILITY TO USE THE SAMPLE CODE, DISTRIBUTION OF
// THE SAMPLE CODE, OR COMBINATION OF THE SAMPLE CODE WITH ANY OTHER CODE.
// IN NO EVENT SHALL IBM OR ITS LICENSORS AND SUPPLIERS BE LIABLE FOR ANY
// LOST REVENUE, LOST PROFITS OR DATA, OR FOR DIRECT, INDIRECT, SPECIAL,
// CONSEQUENTIAL,INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER CAUSED AND REGARDLESS
// OF THE THEORY OF LIABILITY, EVEN IF IBM OR ITS LICENSORS OR SUPPLIERS
// HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
//
// @endCopyright
//*********************** IBM COPYRIGHT END  ***********************************
 *
 *@author Darren Cacy dcacy@us.ibm.com
 */
var express = require('express');
var cfenv = require('cfenv');
var app = express();
var rp = require('request-promise');
var Promise = require('promise');
var url = require('url');
var bodyParser = require('body-parser');
app.use(bodyParser.json());

var parseString = require('xml2js').parseString;

var appEnv = cfenv.getAppEnv();

// read parameters from a properties file; has connections hostname, userid, password
var propertiesReader = require('properties-reader');
var properties = propertiesReader('./connections.properties');

// this module knows how to get Community content
var community = require('./modules/community');

/**
* Get the list of Communities from Connections
* @returns {object} json containing the data from Connections
*/
app.get('/getAllCommunities', function(req, res) {
	community.getAllCommunities(properties)  // it's a promise
	.then(function(result){
		res.json(result);
	})
	.catch(function(err){
		console.log('getAllCommunities returned error',err);
		res.status(500).end('get all communities returned error:' + err.message);
	});
});

/**
 * Get the members, files, and recent activity for a community
 * @param {string} the community Uuid
 * @returns {object} json array containing the members, files, and recent activity
 */
app.get('/getCommunityDetails', function(req, res){
	console.log('in /getCommunityDetails');
  var qs = url.parse(req.url,true).query;
  if ( qs.id ) {
  	var promises = [];
    promises.push(community.getCommunityMembers(properties, qs.id));
    promises.push(community.getCommunityFiles(properties, qs.id));
    promises.push(community.getRecentActivity(properties, qs.id));
    promises.push(community.getSubcommunities(properties, qs.id));
  	Promise.all(promises) // process all promises once they've all returned
  	.then(function(allData) {
  		res.json(allData);
  	})
  	.catch(function(err){
  		console.log('error in one of the promises:', err);
  		res.status(500).json(err);
  	});
  } else {
  	res.status(400).end('no Community ID provided');
  }
});

// serve static files from /public directory
app.use(express.static(__dirname + '/public'));

app.listen(appEnv.port || 3001, '0.0.0.0', function() {
  console.log('server starting on ', appEnv.url);
});
