/**
 * Created by Nicolas on 09.06.2016.
 */
var range = [5, 15]; //default range beetween range[0] and range[1] (in km)
var difficulty = "middle"; //TODO: difficulty still needs to be defined
var MAX_RANGE = [1, 100];//this will be a range from 1km to >99km

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
        $("select").val(difficulty);
        var newRange = [range[0], range[1]];
        var newDifficulty = difficulty;

        $("#slider-range").slider({
            range: true,
            min: MAX_RANGE[0],
            max: MAX_RANGE[1],
            values: [range[0], range[1]],
            slide: function (event, ui) {
                if (ui.values[1] === MAX_RANGE[1]) {
                    $("#range").val(ui.values[0] + "km - >" + (ui.values[1] - 1) + "km");
                    newRange = [ui.values[0], ui.values[1]];
                } else {
                    $("#range").val(ui.values[0] + "km - " + ui.values[1] + "km");
                    newRange = [ui.values[0], ui.values[1]];
                }
            }
        });

        $("#range").val($("#slider-range").slider("values", 0) +
            "km - " + $("#slider-range").slider("values", 1) + "km");

        $('select').on('change', function () {
            newDifficulty = this.value;
        });

        $('body').on('click', '#saveConfigButton', function (event) {
            event.preventDefault();
            config.saveConfig(newRange, newDifficulty);
        });
    },

    /**
     * This function saves the configuration
     */
    saveConfig: function (newRange, newDifficulty) {
        range = newRange;
        difficulty = newDifficulty;
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
