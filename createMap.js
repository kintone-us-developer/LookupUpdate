// Automatically creates the lookup relation data structure
"use strict";

var map = {};
// get all apps
kintone.api(kintone.api.url('/k/v1/apps', true), 'GET', {}, function(resp) {
  var apps = resp.apps;
  var l = apps.length;
  var appId;
  for (var i = 0; i < l; i++) {
    appId = apps[i].appId
    // get an app's fields
    kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {"app": appId}, function(resp) {
      var fields = resp.properties;
      for (var key in fields) {
        var field = fields[key];
        if (field.type === "SINGLE_LINE_TEXT" && field.lookup) {
          // we've found a lookup field
        }
      }
    });

  }
});
