// Automatically creates the lookup relation data structure
"use strict";
// source is parent, mapping is child
var map = {};
// var apps = [];
var fieldCode = "textFieldX"

// Since API GET can only get up to 100 apps per call, we
// need to account for cases where there are more than 100 apps
function fetchApps(opt_offset, opt_limit, opt_apps) {
    var offset = opt_offset || 0;
    var limit = opt_limit || 100;
    var allApps = opt_apps || [];
    var params = {limit: limit, offset: offset};
    return kintone.api('/k/v1/apps', 'GET', params).then(function(resp) {
        allApps = allApps.concat(resp.apps);
        if (resp.apps.length === limit) {
            return fetchApps(offset + limit, limit, allApps);
        }
        return allApps;
    });
}

function fetchLookups(apps, appIndex, opt_map) {
    var entireMap = opt_map || {};
    var appId = apps[appIndex]["appId"];
    var params = {app: appId};
    return kintone.api('/k/v1/app/form/fields', 'GET', params).then(function(resp) {
        var fields = resp.properties;
        for (var key in fields) {
            var field = fields[key];
            var lookup = field.lookup;
            if (lookup) {
                var sourceAppId = lookup.relatedApp.app;
                var fieldMappings = lookup.fieldMappings;
                if (!entireMap[sourceAppId]) {
                    entireMap[sourceAppId] = {};
                }
                entireMap[sourceAppId][appId] = lookup.fieldMappings;
            }
        }
        if (appIndex + 1 < apps.length) {
            return fetchLookups(apps, appIndex + 1, entireMap);
        }
        return entireMap;
    });
}

function generateMap() {
    return new Promise(function(resolve, reject) {
        resolve(fetchApps());
    }).then( function(allApps) {
        return fetchLookups(allApps, 0);
    }).then( function(entireMap) {
        map = entireMap;
        return entireMap;
    });
}

function findMap() {
    kintone.api('/k/v1/apps', 'GET', {name: "XXX"}).then(function(resp) {
        return resp.apps[0].appId;
    }).then(function(mapAppId) {
        var body = {
             "app": mapAppId,
             "id": 10
        };
        kintone.api(kintone.api.url('/k/v1/record', true), 'GET', body, function(resp) {
            map = JSON.parse(resp.record[fieldCode].value);
            console.log(map);
            console.log("found");
        }, function(error) {
            // error: the record (and therefore map as JSON) hasn't been created yet.
            generateMap().then(function(entireMap) {
                var body = {
                    "app": mapAppId,
                    "record": {}
                };
                body.record[fieldCode] = {};
                body.record[fieldCode].value = JSON.stringify(entireMap);
                kintone.api(kintone.api.url('/k/v1/record', true), 'POST', body, function(resp) {
                    // success: record creation succeeded.
                    console.log(resp);
                }, function(error) {
                    // error: record creation failed.
                    console.log(error);
                });
            });

        });
    });

    // kintone.api(kintone.api.url('/k/v1/apps', true), 'GET', {name: "X_X_X"}, function(resp) {
    //     mapAppId = resp.apps[0].appId;
    // });
    //
    // var body = {
    //     "app": mapAppId,
    //     "id": 5
    // };
    // kintone.api(kintone.api.url('/k/v1/record', true), 'GET', body, function(resp) {
    //     map = JSON.parse(resp.record[fieldCode].value);
    // }, function(error) {
    //     // error: the record (and therefore map as JSON) hasn't been created yet.
    //     generateMap();
    //     var body = {
    //         "app": mapAppId,
    //         "record": {
    //             fieldCode: {
    //                 "value": JSON.stringify(map)
    //             }
    //         }
    //     };
    //     kintone.api(kintone.api.url('/k/v1/record', true), 'POST', body, function(resp) {
    //         // success: record creation succeeded.
    //         console.log(resp);
    //     }, function(error) {
    //         // error: record creation failed.
    //         console.log(error);
    //     });
    // });
}
function compareMap() {

}
