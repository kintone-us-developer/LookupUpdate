jQuery.noConflict();

(function($, PLUGIN_ID) {
    'use strict';
    var config = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (config && config.activation !== 'active') {
        return;
    }

    kintone.events.on(SUBMIT_EVENTS, function(event) {
        // TODO: Change destination values
        // but we also need to propagate the change down the chain
        return event;
    });
})(jQuery, kintone.$PLUGIN_ID);
