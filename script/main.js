/**
 * Created by Nicolas on 09.06.2016.
 */

/**
 * This variable defines all the functions for the mainscreen
 */
var main = {
    /**
     * Creates the main screen and appends it to the main
     */
    createAndAppendMainView: function () {
        var mainscreen = "<header><h1 class='headerText'>GEO GAME</h1></header>" +
            "<section class='centerButtons'>" +
            "<button id='newGameButton' class='button btn btn-default'>Play!</button><br/>" +
            "<button id='highscoreButton' class='button btn btn-default'>Highscore</button><br/>" +
            "<button id='configButton' class='button btn btn-default'>Config</button><br/>" +
            "<button id='aboutButton' class='button btn btn-default'>About</button><br/>" +
            "<button id='logoutButton' class='button btn btn-default'>Logout</button><br/>" +
            "</section>";
        $("main").append(mainscreen);
    },

    /**
     * This function adds the Listener to the buttons
     */
    addButtonListeners: function () {
        $('body').on('click', '#newGameButton', function (event) {
            event.preventDefault();
            openGameScreen();
        });

        $('body').on('click', '#highscoreButton', function (event) {
            event.preventDefault();
            openHighscoreScreen();
        });

        $('body').on('click', '#configButton', function (event) {
            event.preventDefault();
            openConfigScreen();
        });

        $('body').on('click', '#aboutButton', function (event) {
            event.preventDefault();
            openAboutScreen();
        });

        $('body').on('click', '#logoutButton', function (event) {
            event.preventDefault();
            openLoginScreen();
        });
    }
};
