/*
* Code based on example provided at: https://kintoneapp.com/blog/lookup_improvement/
*/
jQuery.noConflict();
(function($, PLUGIN_ID) {
  "use strict";

  kintone.events.on(['app.record.edit.submit', 'app.record.index.edit.submit'], function(event) {
  	var sourceAppId = kintone.app.getId();
    var destAppId = 88;
    var afterRecord = event.record;
  	var recordId = event.recordId;

    // gotta update for all children
    // for (destAppId in destAppIds) {
    //   updateRecords(sourceAppId, destAppId, afterRecord, recordId);
    // }
    // note: this is when the record's change is committed
  	return event;
  });

  function fetchRecords(appId, query, opt_offset, opt_limit, opt_records) {
  	var offset = opt_offset || 0;
  	var limit = opt_limit || 100;
  	var allRecords = opt_records || [];
  	var params = {app: appId, query: query + ' limit ' + limit + ' offset ' + offset};
  	return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
  		allRecords = allRecords.concat(resp.records);
  		if (resp.records.length === limit) {
  			return fetchRecords(appId, query, offset + limit, limit, allRecords);
  		}
  		return allRecords;
  	});
  }

  function updateRecords(sourceAppId, destAppId, afterRecord, recordId) {
    // get record data of parent app before change
  	kintone.api('/k/v1/record', 'GET', {app: sourceAppId, id: recordId}, function(resp) {
  		var beforeRecord = resp.record;

  		// fetch the matching records in the child lookup app
  		fetchRecords(destAppId.toString(), 'id = "' + beforeRecord.id.value + '"').then( function(records) {
  			var recCount = records.length;
  			var putCount = Math.ceil(recCount / 100);
  			for (var i = 0; i < putCount; i++) {
  				var offset = i * 100;
  				var limit = 100;
  				if (offset + limit > recCount) {
  					limit = recCount - offset;
  				}
  				var putLimit = limit + offset;

  				var editRecords = [];

  				// overwrite the new data to matching records
          // TODO: abort if no change
  				for (offset; offset < putLimit; offset++) {
  					var record = $.extend(true, {}, records[offset]);
  					var recId = record['$id'].value;
  					delete record['$id'];
  					delete record['$revision'];
  					delete record['Record_number'];
  					delete record['Created_datetime'];
  					delete record['Created_by'];
  					delete record['Updated_datetime'];
  					delete record['Updated_by'];
  					record['id'] = afterRecord.id;
  					record['name'] = afterRecord.name;
  					editRecords.push({'id': recId, 'record': record});
  				}
          //TODO: do the same thing for child's children using editRecords and records
          // for (destAppId in destAppIds) {
          //   updateRecords(sourceAppId, destAppId, afterRecord, recordId);
          // }
  				// update the app by putting the updated records
  				kintone.api('/k/v1/records', 'PUT', {app: destAppId, 'records': editRecords},
  						function(resp) {}
  				);
  			}
  		});
  	});
  }
})(jQuery, kintone.$PLUGIN_ID);
