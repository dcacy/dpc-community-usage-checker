

/*
 * call the /getAllCommunities API and create a datatable from the results
 */
function getAllCommunities() {
  $('#communitiesLoadingDiv').mask('Please Wait...<br/><img src="/images/watson.gif">');
  $.get('/getAllCommunities', 

     function (data, status, jq) {
      var communitiesTable = $('#communitiesTable').DataTable( {
        data: data,
        autoWidth: false,
        "columns": [
          { "data": "title" },
          { "data": "owner" },
          { "data": "created"},
          { "data": "updated"},
          { "data": "membercount"}            
        ],
        "columnDefs" : [
        	{ "className" : "communityName", "targets": 0},
        	{ "className" : "dt-body-right", "targets": 4},
          { "title": "Name", "targets": 0 },
          { "title": "Owner", "targets": 1 },
          { "title": "Created", "targets": 2, render: function(created, type) {
		      		// if type is display or filter then format the date
		      		if ( type === 'display' || type === 'filter') {
		      			return dateFormat(new Date(created), 'dd mmm yyyy h:MM:sstt');
		      		} else {
		      			// otherwise it must be for sorting so return the raw value
		      			return created;
		      		}    			
		      	} 
		      },
          { "title": "Last Updated", "targets": 3, render: function(updated, type) {
	        		// if type is display or filter then format the date
	        		if ( type === 'display' || type === 'filter') {
	        			return dateFormat(new Date(updated), 'dd mmm yyyy h:MM:sstt');
	        		} else {
	        			// otherwise it must be for sorting so return the raw value
	        			return updated;
	        		}    			
	        	} 
          },
          { "title": "Nbr of Members", "targets": 4 }
        ],
        "fnCreatedRow": function( nRow, aData, iDataIndex ) {
        	// create an attribute for the message ID so we can retrieve it later when we click on this message
        	nRow.getElementsByTagName('td')[0].setAttribute('community-id', aData.id); 
        }
      });
      
//      setTimeout("SemTagSvc.parseDom(null, 'communitiesTableWrapper')", 500 );
      communitiesTable.on('click', 'td', function(){
//      $('td.communityName').on('click', 'td', function(){
//      	console.log('click');
      	// highlight chosen message
    		$('.communityName').toggleClass('chosenCommunity',false); // un-highlight all communities
    		$(this).toggleClass('chosenCommunity'); // now highlight just this one

//    		$('#tabs').remove();

//    		$('#messageWrapper').show();
        $('#detailsLoadingDiv').mask('<div style="text-align:center;" style="background-color:#fff;">Please Wait...<br/><img src="/images/watson.gif"></div>',200);
        // we set the community-id attribute earlier so that it would be here now
    		$.get('/getCommunityDetails', { id : this.getAttribute('community-id')}, processCommunityDetails, 'json')
    		.fail(function(err) {
    			console.log('an error occurred getting message details:', err);
    			$('#error').html(err.responseText);
//    			$('#loginMessage').show();
//    			$('#appWrapper').hide();
    		})
    		.always(function() {
//    			console.log('in always');
    			$('#detailsLoadingDiv').unmask();
    		});
    	});

    },
    'json')
    .fail(function(error) {
    	console.log('error getting all communities', error);
    })
	  .always(function() {
//	    console.log( "finished" );
	    $('#communitiesLoadingDiv').unmask();
	  });
//      $('#loadingDiv').unmask();
//    },
//    error: function(jq, status, error) {
//      console.log('error! ', error);
//    },
//    always: function(){
//    	console.log('in always');
//    			$('#communitiesLoadingDiv').unmask();
//    }
//  });
}

//function formatDate(connectionsDate) {
//  // date looks like 2016-09-30T01:04:49.546Z
//	var dateIso = connectionsDate.split('T');
//	var time = dateIso[1].split("."); // we don't care about 10ths of a second
//	var splitIso = dateIso[0].split("-");
//	var uYear = splitIso[0];
//	var uMonth = splitIso[1];
//	var uDay = splitIso[2];
//	var uDate = uYear + '-' + uMonth + '-' + uDay + ' ' + time[0] + ' UTC';
//	return uDate;
//}



function processCommunityDetails(json) {
//	console.log('in processCommunityDetails and json is', json);
//	for (var i = 0; i < json.length; i++) {
////		console.log('item is', json[i]);
////		console.log('type is', json[i].type);
//	}
	$('#communityDetailsWrapper').show();
	$('#tabs').remove();
	var tabsHeader = '';
	var tabsDetail = '';
	var tabsCounter = 0;
	var filesFound = false;
	var membersFound = false;
	var activitiesFound = false;
	
	// find members
	var members = json.find( function(item) {
    return item.type === 'members';
	});
//	console.log('members is', members);
	if (members.data.length > 0) {
		tabsHeader += '<li><a href="#tabs-' + tabsCounter + '">Members (' + members.data.length + ')</a></li>';

		tabsDetail += '<div id="tabs-' + tabsCounter + '">';
		tabsDetail += '<table id="membersTable"></table>';
		tabsDetail += '</div>';
		membersFound = true;
		tabsCounter++;
	}
	
	// find files
	var files = json.find( function(item) {
    return item.type === 'files';
	});
//	console.log('files is', files);
//	console.log('string is', JSON.stringify(files));
	if (files.data.length > 0) {
		tabsHeader += '<li><a href="#tabs-' + tabsCounter + '">Files (' + files.data.length + ')</a></li>';
		var fileSize = 0;
		$.each(files.data, function(index,file) {
//			console.log('file size is', file.size);
			fileSize += file.size*1;
		});
//		console.log('fileSize is', fileSize);
		tabsDetail += '<div id="tabs-' + tabsCounter + '">';
		tabsDetail += '<div class="fileSizeDiv">Total files size:&nbsp;&nbsp;<span class="fileSize">' + fileSize.toLocaleString() + '</span></div>';
		tabsDetail += '<table id="filesTable"></table>';
		tabsDetail += '</div>';
		
		filesFound = true;
		tabsCounter++;
	}
	
	// find activity
	var activities = json.find( function(item) {
    return item.type === 'activity';
	});
//	console.log('activities:', activities);
	if (activities.data.length > 0) {
		tabsHeader += '<li><a href="#tabs-' + tabsCounter + '">Recent Updates (' + activities.data.length + ')</a></li>';
		tabsDetail += '<div id="tabs-' + tabsCounter + '">';
		tabsDetail += '<table id="activitiesTable"></table>';
		tabsDetail += '</div>';
		activitiesFound = true;
		tabsCounter++;
	}
	
	var tabsText = '<div id="tabs" class="tabs">'
		+ '<ul>' + tabsHeader + '</ul>'
		+ tabsDetail
		+ '</div>';
	$('#communityDetails').html(tabsText);
	if ( filesFound) {
	var filesTable = $('#filesTable').DataTable( {
    data: files.data,
    autoWidth: false,
    searching: false,
    paging: determinePaging(files.data),
    "columns": [
      { "data": "title" },
      { "data": "size" }
        
    ],
    "columnDefs" : [
    	{ "className": "dt-body-right", "targets": 1},
      { "title": "Name", "targets": 0 },
      { "title": "Size", "targets": 1, render: function(size, type) {
//      { "title": "Created", "targets": 2, render: function(created, type) {
    		// if type is display or filter then format the date
    		if ( type === 'display' || type === 'filter') {
    			return (size*1).toLocaleString();
    		} else {
    			// otherwise it must be for sorting so return the raw value
    			return size;
    		}    			
    	} 
      }    
    ]
  });
	}
	if ( membersFound ) {
		var membersTable = $('#membersTable').DataTable( {
      data: members.data,
      autoWidth: false,
      searching: false,
      paging: determinePaging(members.data),
      "columns": [
        { "data": "name" },
        { "data": "email" }
          
      ],
      "columnDefs" : [
        { "title": "Name", "targets": 0 },
        { "title": "email", "targets": 1 },       
      ]
    });
	}
	if ( activitiesFound ) {
//		console.log('processing activitites:', activities.data);
		var activitiesTable = $('#activitiesTable').DataTable( {
      data: activities.data,
      autoWidth: false,
      searching: false,
      paging: determinePaging(activities.data),
      "columns": [
        { "data": "author" },
        { "data": "title" },
        { "data": "publishedDate"}
          
      ],
      "columnDefs" : [
        { "title": "Name", "targets": 0 },
        { "title": "Title", "targets": 1 },
        { "title": "Date", "targets": 2, render: function(publishedDate, type) {
//        { "title": "Created", "targets": 2, render: function(created, type) {
      		// if type is display or filter then format the date
      		if ( type === 'display' || type === 'filter') {
      			return dateFormat(new Date(publishedDate), 'dd mmm yyyy h:MM:sstt');
      		} else {
      			// otherwise it must be for sorting so return the raw value
      			return publishedDate;
      		}    			
      	} 
      },
      ]
    });
	}	
	$('#tabs').tabs();
//	$.each(json, function(index,detail) {
//		console.log('detail is', detail);
//		tabsHeader += '<li><a href="#tabs-' + index + '">' + detail.type + '</a></li>';
//		tabsDetail += '<div id="tabs-' + index + '"><p>' ;
//	});
	/*
	 * <div id="tabs">
			  <ul>
			    <li><a href="#tabs-1">Nunc tincidunt</a></li>
			    <li><a href="#tabs-2">Proin dolor</a></li>
			    <li><a href="#tabs-3">Aenean lacinia</a></li>
			  </ul>
			  <div id="tabs-1">
			    <p>Proin elit arcu, rutrum commodo, vehicula tempus, commodo a, risus. Curabitur nec arcu. Donec sollicitudin mi sit amet mauris. Nam elementum quam ullamcorper ante. Etiam aliquet massa et lorem. Mauris dapibus lacus auctor risus. Aenean tempor ullamcorper leo. Vivamus sed magna quis ligula eleifend adipiscing. Duis orci. Aliquam sodales tortor vitae ipsum. Aliquam nulla. Duis aliquam molestie erat. Ut et mauris vel pede varius sollicitudin. Sed ut dolor nec orci tincidunt interdum. Phasellus ipsum. Nunc tristique tempus lectus.</p>
			  </div>
			  <div id="tabs-2">
			    <p>Morbi tincidunt, dui sit amet facilisis feugiat, odio metus gravida ante, ut pharetra massa metus id nunc. Duis scelerisque molestie turpis. Sed fringilla, massa eget luctus malesuada, metus eros molestie lectus, ut tempus eros massa ut dolor. Aenean aliquet fringilla sem. Suspendisse sed ligula in ligula suscipit aliquam. Praesent in eros vestibulum mi adipiscing adipiscing. Morbi facilisis. Curabitur ornare consequat nunc. Aenean vel metus. Ut posuere viverra nulla. Aliquam erat volutpat. Pellentesque convallis. Maecenas feugiat, tellus pellentesque pretium posuere, felis lorem euismod felis, eu ornare leo nisi vel felis. Mauris consectetur tortor et purus.</p>
			  </div>
			  <div id="tabs-3">
			    <p>Mauris eleifend est et turpis. Duis id erat. Suspendisse potenti. Aliquam vulputate, pede vel vehicula accumsan, mi neque rutrum erat, eu congue orci lorem eget lorem. Vestibulum non ante. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Fusce sodales. Quisque eu urna vel enim commodo pellentesque. Praesent eu risus hendrerit ligula tempus pretium. Curabitur lorem enim, pretium nec, feugiat nec, luctus a, lacus.</p>
			    <p>Duis cursus. Maecenas ligula eros, blandit nec, pharetra at, semper at, magna. Nullam ac lacus. Nulla facilisi. Praesent viverra justo vitae neque. Praesent blandit adipiscing velit. Suspendisse potenti. Donec mattis, pede vel pharetra blandit, magna ligula faucibus eros, id euismod lacus dolor eget odio. Nam scelerisque. Donec non libero sed nulla mattis commodo. Ut sagittis. Donec nisi lectus, feugiat porttitor, tempor ac, tempor vitae, pede. Aenean vehicula velit eu tellus interdum rutrum. Maecenas commodo. Pellentesque nec elit. Fusce in lacus. Vivamus a libero vitae lectus hendrerit hendrerit.</p>
			  </div>
			</div>
	 */
}

function determinePaging(someArray) {
	if (someArray.length > 10) {
		return true;
	} else {
		return false;
	}
}

$( document ).ready(function() {
	getAllCommunities();
//	$('#tabs').tabs();
});