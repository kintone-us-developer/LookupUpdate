// Automatically creates the lookup relation data structure
"use strict";
// source is parent, mapping is child
var map = {};

// var appId = [];


var getAllApps = new Promise(
    // get all apps
    function (resolve, reject) {
      var appId = [];
      kintone.api(kintone.api.url('/k/v1/apps', true), 'GET', {}, function(resp) {
        var apps = resp.apps;
        var i, numApps = apps.length;
        for (i = 0; i < numApps; i++) {
          appId[i] = apps[i].appId;
        }
      }, function(error) {
        // error
        console.log(error);
      });
      resolve(appId);
    }
);

// kintone.api(kintone.api.url('/k/v1/apps', true), 'GET', {}, function(resp) {
  // var apps = resp.apps;
  // var i, numApps = apps.length;
  // for (i = 0; i < numApps; i++) {
  //   var mapAppId = apps[i].appId;
getAllApps.then( function(appId) {
    // get an app's fields
    for (var appKey in appId) {
      var mapAppId = appId[appKey];
      kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {"app": mapAppId}, function(resp2) {
        var fields = resp2.properties;
        for (var key in fields) {
          var field = fields[key];
          var lookup = field.lookup;
          if (lookup) { // && field.code.indexOf("INDICATOR") !== -1
            // we've found a lookup field
            var sourceAppId = lookup.relatedApp.app;
            var fieldMappings = lookup.fieldMappings;
            // var j, numFieldMaps = fieldMappings.length;
            // var fieldMapping, sourceField, mapField;
            // for (j = 0; j < numFieldMaps; j++) {
            //   fieldMapping = fieldMappings[j];
            //   sourceField = fieldMapping.relatedField;
            //   mapField = fieldMapping.field;
            if (!map[sourceAppId]) {
              map[sourceAppId] = {};
            }
            map[sourceAppId][mapAppId] = lookup.fieldMappings;
            // should we account for multiple lookup fields in one app that
            // look up into the same source app?
          }
        }
      });
    }
});
