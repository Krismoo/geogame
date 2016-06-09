/**
 * Created by Nicolas on 09.06.2016.
 */

/**
 * This variable defines all the functions for the config screen
 */
var config = {
    /**
     * Creates the config view  and appends it to the main
     */
    createAndAppendConfigView: function () {
        var configscreen = "<header><h3 class='headerText'>Config</h3></header>" +
            "<section class='contentSize'>" +
            "<form>" +
            "<section class='center input-group input-config'>" +
            "<p class='input-group-addon input-addon-login2'>Schwierigkeit: </p>" +
            "<select id='difficulty' class='form-control'>" +
            "<option value='easy'>Leicht</option>" +
            "<option value='middle'>Mittel</option>" +
            "<option value='difficult'>Schwer</option>" +
            "</select> " +
            "</section>" +
            "<section class='center panel panel-default'>" +
            "<section class='panel-heading'>" +
            "<label for='range'>Reichweite:</label>" +
            "<input type='text' id='range' readonly >" +
            "</section>" +
            "<section class='panel-body'><p id='slider-range'></p></p>" +
            "</section></form>" +
            "<p class='buttonContainer'>" +
            "<button id='saveConfigButton' class='button btn btn-default'>Speichern</button><br/>" +
            "<button id='zurueckButtonC' class='button btn btn-default'>Zurück</button>" +
            "</p></section>";
        $("main").append(configscreen);
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
