/*
* Code based on example provided at: https://kintoneapp.com/blog/lookup_improvement/
*/
jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";

    //On Submit
    kintone.events.on(['app.record.edit.submit', 'app.record.index.edit.submit'], function(event) {
        showSpinner();
        var sourceAppId = kintone.app.getId();
        var recordId = event.recordId;
        chain = chain.then(function() {
            return kintone.api('/k/v1/record', 'GET', {app: sourceAppId, id: recordId});
        }).then(function(resp) {
            var recordBeforeChange = resp.record;
            // console.log("before");
            // console.log(recordBeforeChange);
            return recordBeforeChange;
        });
        hideSpinner();
    });

    //On Success
    var chain = Promise.resolve();
    kintone.events.on(['app.record.edit.submit.success', 'app.record.index.edit.submit.success'], function(event) {
        showSpinner();
        var sourceAppId = kintone.app.getId();
        var recordId = event.recordId;
        var recordAfterChange = event.record;
        chain = chain.then( function(recordBeforeChange) {
            checkMap().then( function(map) {
                // console.log(map);
                return updateChildren(sourceAppId, recordBeforeChange, recordAfterChange, recordId);
            }).then( function(message) {
                console.log(message);
                hideSpinner();
            });
        });
        return chain;
    });

    function recordsEqual(recordBeforeChange, recordAfterChange) {
        // only need to compare record values for equality
        delete recordBeforeChange["$revision"];
        delete recordBeforeChange["Updated_datetime"];
        delete recordAfterChange["$revision"];
        delete recordAfterChange["Updated_datetime"];
        // console.log("before");
        // console.log(recordBeforeChange);
        // console.log("after");
        // console.log(recordAfterChange);
        var orderedBefore = {};
        Object.keys(recordBeforeChange).sort().forEach(function(key) {
            orderedBefore[key] = recordBeforeChange[key];
        });
        var orderedAfter = {};
        Object.keys(recordAfterChange).sort().forEach(function(key) {
            orderedAfter[key] = recordAfterChange[key];
        });
        if (JSON.stringify(orderedBefore) === JSON.stringify(orderedAfter)) {
            return true;
        }
        return false;
    }

    // handles " (double quote) in query string
    function escapeStr(str) {
        var escaped = str.replace(/\x22/g, '\\\x22');
        return '"' + escaped + '"';
    }

    // checks if map is defined in current window. Is a promise.
    function checkMap() {
        return new Promise( function(resolve, reject) {
            if (Object.keys(map).length === 0) {
                resolve(findMap());
            } else {
                resolve(map);
            }
        });
    }

    // updates all apps with lookups that use the app with sourceAppId as a source
    function updateChildren(sourceAppId, recordBeforeChange, recordAfterChange, recordId) {
        if (!map[sourceAppId]) {
            return sourceAppId + " no children, end of chain";
        } else if (recordsEqual(recordBeforeChange, recordAfterChange)) {
            return "no change made to record";
        } else {
            var destAppIds = Object.keys(map[sourceAppId]);
            var l = destAppIds.length;
            var chain = Promise.resolve();
            for (let i = 0; i < l; i++) {
                chain = chain.then(function() {
                    return updateRecords(sourceAppId, destAppIds, recordBeforeChange, recordAfterChange, recordId, i);
                });
            }
            return chain;
        }
    }

    // fetches corresponding records from an app using the query
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

    // updates all of the records that use the changed record as a source
    function updateRecords(sourceAppId, destAppIds, recordBeforeChange, recordAfterChange, recordId, appIndex) {
        var destAppId = destAppIds[appIndex];
        var lookupFieldData = map[sourceAppId][destAppId];
        var query = lookupFieldData.fieldCode + ' = ' + escapeStr(recordBeforeChange[lookupFieldData.relatedLookupField].value);
        return fetchRecords(destAppId, query).then( function(records) {
            var recCount = records.length;
            var putCount = Math.ceil(recCount / 100);
            for (var i = 0; i < putCount; i++) {
                var offset = i * 100;
                var initialOffset = offset; //because offset changes in the for loop below
                var limit = 100;
                if (offset + limit > recCount) {
                    limit = recCount - offset;
                }
                var putLimit = limit + offset;

                var editRecords = [];
                // overwrite the new data to matching records
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
                    "sdfsd''//v fsdf"
                    record[lookupFieldData.fieldCode] = recordAfterChange[lookupFieldData.relatedLookupField];
                    lookupFieldData.fieldMappings.forEach( function(mapping) {
                        record[mapping.field] = recordAfterChange[mapping.relatedField];
                    });
                    editRecords.push({'id': recId, 'record': record});
                }

                var l = editRecords.length;
                var chain = Promise.resolve();
                chain = chain.then( function() {
                    return kintone.api('/k/v1/records', 'PUT', {app: destAppId, 'records': editRecords}).then(function(resp) {
                        console.log("DestAppId is: " + destAppId);
                        return "updated records";
                    }, function(error) {
                        throw error;
                    });
                });
                // recursively call updateChildren to update the grandchildren of the record the user changed
                for (let i = 0; i < l; i++) {
                    chain = chain.then( function() {
                        return updateChildren(destAppId, records[initialOffset + i], editRecords[i].record, editRecords[i].id);
                    });
                }
                return chain;
            }
        });
    }

    function showSpinner() {
        // Initialize
        if ($('.kintone-spinner').length === 0) {
            // Create elements for the spinner and the background of the spinner
            var spin_div = $('<div id ="kintone-spin" class="kintone-spinner"></div>');
            var spin_bg_div = $('<div id ="kintone-spin-bg" class="kintone-spinner"></div>');
            // Append spinner to the body
            $(document.body).append(spin_div, spin_bg_div);
            // Set a style for the spinner
            $(spin_div).css({
                'position': 'fixed',
                'top': '50%',
                'left': '50%',
                'z-index': '510',
                'background-color': '#fff',
                'padding': '26px',
                '-moz-border-radius': '4px',
                '-webkit-border-radius': '4px',
                'border-radius': '4px'
            });
            $(spin_bg_div).css({
                'position': 'absolute',
                'top': '0px',
                'left': '0px',
                'z-index': '500',
                'width': '100%',
                'height': '200%',
                'background-color': '#000',
                'opacity': '0.5',
                'filter': 'alpha(opacity=50)',
                '-ms-filter': 'alpha(opacity=50)'
            });
            // Set options for the spinner
            var opts = {
                'color': '#000'
            };
            // Create the spinner
            new Spinner(opts).spin(document.getElementById('kintone-spin'));
        }
        // Display the spinner
        $('.kintone-spinner').show();
    }

    // Function to hide the spinner
    function hideSpinner() {
        // Hide the spinner
        $('.kintone-spinner').hide();
    }
})(jQuery, kintone.$PLUGIN_ID);
