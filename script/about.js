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
        var aboutScreen = "<header><h3 class='headerText'>About us</h3></header>" +
            "<section id='about'>" +
            "<p>Dies ist eine Single Page App, erstellt im Rahmen des Erfahrungsnotenprojektes des Moduls webeC (Web Engineering) and der FHNW in Brugg.</p>" +
            "<p>Developer: </p>" +
            "<ul><li>Simon Rissi</li><li>Dominic Bär</li><li>Nicolas Novak</li></ul>" +
            "<br/><p class='buttonContainer'>" +
            "<button id='zurueckButtonA' class='button btn btn-default'>Zurück</button>" +
            "</p></section>";
        $("main").append(aboutScreen);
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
