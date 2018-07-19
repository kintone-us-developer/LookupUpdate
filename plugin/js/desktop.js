
/*
* Code based on example provided at: https://kintoneapp.com/blog/lookup_improvement/
*/
jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";

    // checks if map is defined. Is a promise.
    function checkMap() {
        return new Promise( function(resolve, reject) {
            if (Object.keys(map).length === 0) {
                console.log("Not Found");
                findMap().then( function(map2) {
                    resolve(map2);
                });
                // var mappp = findMap();
                // console.log(mappp);
                // resolve(mappp);
            } else {
                console.log("Found");
                resolve(map);
            }
        });
    }
    

    kintone.events.on(['app.record.edit.submit', 'app.record.index.edit.submit'], function(event) {
        var sourceAppId = kintone.app.getId();
        var recordAfterChange = event.record;
        var recordId = event.recordId;
        checkMap().then( function(map1) {
            console.log(map1); //map undefined here
            var destAppIds = Object.keys(map1[sourceAppId]); //errors here
            console.log("destAppIds: " + destAppIds);
            console.log("recordId: " + recordId);
            console.log(event.record);
            return updateRecords(sourceAppId, destAppIds, recordAfterChange, recordId, 0);
        }).then( function(message) {
            console.log(message);
            return event;
        });
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

    function updateRecords(sourceAppId, destAppIds, recordAfterChange, recordId, appIndex) {
        // get record data of parent app before change
        var destAppId = destAppIds[appIndex];
        var lookupFieldData = map[sourceAppId][destAppId];
        return kintone.api('/k/v1/record', 'GET', {app: sourceAppId, id: recordId}).then(function(resp) {
            var recordBeforeChange = resp.record;
            // fetch the matching records in the child lookup app
            var query = lookupFieldData.fieldCode + ' = ' + recordBeforeChange[lookupFieldData.relatedLookupField].value;
            // console.log("query is: " + query);
            fetchRecords(destAppId, query).then( function(records) {
                // console.log("records is: " + records);
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
                        record[lookupFieldData.fieldCode] = recordAfterChange[lookupFieldData.relatedLookupField];
                        lookupFieldData.fieldMappings.forEach( function(mapping) {
                            record[mapping.field] = recordAfterChange[mapping.relatedField];
                        });
                        // record['id'] = recordAfterChange.id;
                        // record['name'] = recordAfterChange.name;
                        editRecords.push({'id': recId, 'record': record});
                    }
                    //TODO: do the same thing for child's children using editRecords and records
                    // for (destAppId in destAppIds) {
                    //   updateRecords(sourceAppId, destAppId, recordAfterChange, recordId);
                    // }
                    // update the app by putting the updated records
                    return kintone.api('/k/v1/records', 'PUT', {app: destAppId, 'records': editRecords}).then(function(resp) {
                        return "updated records";
                    });
                }
            });
        }).then( function(message) {
            return message;
        });
    }
})(jQuery, kintone.$PLUGIN_ID);
