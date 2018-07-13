// Automatically creates the lookup relation data structure
"use strict";
// source is parent, mapping is child
var map = {};
// var apps = [];

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
  fetchApps().then( function(allApps) {
    fetchLookups(allApps, 0).then( function(entireMap) {
      map = entireMap;
      console.log("done");
    });
  });
}
//
// var getAllApps = new Promise(
//     // get all apps
//     function (resolve, reject) {
//       var appId = [];
//       kintone.api(kintone.api.url('/k/v1/apps', true), 'GET', {}, function(resp) {
//         var apps = resp.apps;
//         var i, numApps = apps.length;
//         for (i = 0; i < numApps; i++) {
//           appId[i] = apps[i].appId;
//         }
//       }, function(error) {
//         // error
//         console.log(error);
//       });
//       resolve(appId);
//     }
// );
//
// // kintone.api(kintone.api.url('/k/v1/apps', true), 'GET', {}, function(resp) {
//   // var apps = resp.apps;
  // var i, numApps = apps.length;
  // for (i = 0; i < numApps; i++) {
  //   var mapAppId = apps[i].appId;
// getAllApps.then( function(appId) {
//     // get an app's fields
//     for (var appKey in appId) {
//       var mapAppId = appId[appKey];
//       kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {"app": mapAppId}, function(resp2) {
//         var fields = resp2.properties;
//         for (var key in fields) {
//           var field = fields[key];
//           var lookup = field.lookup;
//           if (lookup) { // && field.code.indexOf("INDICATOR") !== -1
//             // we've found a lookup field
//             var sourceAppId = lookup.relatedApp.app;
//             var fieldMappings = lookup.fieldMappings;
//             // var j, numFieldMaps = fieldMappings.length;
//             // var fieldMapping, sourceField, mapField;
//             // for (j = 0; j < numFieldMaps; j++) {
//             //   fieldMapping = fieldMappings[j];
//             //   sourceField = fieldMapping.relatedField;
//             //   mapField = fieldMapping.field;
//             if (!map[sourceAppId]) {
//               map[sourceAppId] = {};
//             }
//             map[sourceAppId][mapAppId] = lookup.fieldMappings;
//             // should we account for multiple lookup fields in one app that
//             // look up into the same source app?
//           }
//         }
//       });
//     }
// });
