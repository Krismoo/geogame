/**
 * Created by Nicolas on 09.06.2016.
 */
var verifyDistance = 1000;      //the max distance to validate a puzzle

/**
 * This variable defines all the functions for the config screen
 */
var config = {
    /**
     * Creates the config view  and appends it to the main
     * this is sequential, as the function calls after this function need the
     * structure which gets appended here!
     */
    createAndAppendConfigView: function () {
        $.ajax({
            async: false,
            type: 'GET',
            url: 'pageContent/configScreen.html',
            success: function (configScreen) {
                $("main").append(configScreen);
            }
        });
    },

    /**
     * Intializes the settings which are stored in this js
     */
    intializeSettings: function () {
        var newRange = range;
        $("#slider").slider({
            range: "min",
            value: verifyDistance,
            min: 100,
            max: 2000,
            slide: function (event, ui) {
                $("#range").val(ui.value+"m");
            }
        });

        $("#range").val($("#slider").slider("value") + "m");

        $('body').on('click', '#saveConfigButton', function (event) {
            event.preventDefault();
            config.saveConfig(newRange);
        });
    },

    /**
     * This function saves the configuration
     * @param newVerifyDistance  the new maxiamal verify distance
     */
    saveConfig: function (newVerifyDistance) {
        verifyDistance = newVerifyDistance;
    },

    /**
     * This function adds the Listener to the button
     */
    addButtonListeners: function () {
        $('body').on('click', '#zurueckButtonC', function (event) {
            event.preventDefault();
            openMainScreen();
        });
    }
};
