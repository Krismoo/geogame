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
        $.get("pageContent/mainScreen.html", function (mainScreen) {
            $("main").append(mainScreen);
        });
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
            var request = {token: localStorage.getItem("token"),};
            $.ajax({
                url: "api/logout",
                data: JSON.stringify(request),
                dataType: "json",
                type: "POST"
            });
            localStorage.removeItem("token");
            openLoginScreen();
        });
    }
};
