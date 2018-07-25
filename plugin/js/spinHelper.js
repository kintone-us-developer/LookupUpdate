"use strict";
/* Spinner library function that shows the spinner on screen when called. */
function showSpinner() {
    /* Initialize */
    if (jQuery('.kintone-spinner').length === 0) {
        /* Create elements for the spinner and the background of the spinner */
        var spin_div = jQuery('<div id ="kintone-spin" class="kintone-spinner"></div>');
        var spin_bg_div = jQuery('<div id ="kintone-spin-bg" class="kintone-spinner"></div>');
        /* Append spinner to the body */
        jQuery(document.body).append(spin_div, spin_bg_div);
        /* Set a style for the spinner */
        jQuery(spin_div).css({
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
        jQuery(spin_bg_div).css({
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
        /* Set options for the spinner */
        var opts = {
            'color': '#000'
        };
        /* Create the spinner */
        new Spinner(opts).spin(document.getElementById('kintone-spin'));
    }
    /* Display the spinner */
    jQuery('.kintone-spinner').show();
}

/* Spinner library function that hides the spinner when called. */
function hideSpinner() {
    jQuery('.kintone-spinner').hide();
}
