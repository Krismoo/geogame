/**
 * Created by Nicolas on 09.06.2016.
 */

/**
 * This variable defines all the functions for the about screen
 */
var about = {
    /**
     * Creates the about view and appends it to the main
     */
    createAndAppendAboutView: function () {
        $.get("pageContent/aboutScreen.html", function (aboutScreen) {
            $("main").append(aboutScreen);
        });
    },

    /**
     * This function adds the Listener to the Button
     */
    addButtonListeners: function () {
        $('body').on('click', '#zurueckButtonA', function (event) {
            event.preventDefault();
            openMainScreen();
        });
    }
};
