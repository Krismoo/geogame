/**
 * Created by Nicolas on 09.06.2016.
 */

/**
 * This variable defines all the functions for the highscore screen
 */
var highscore = {
    /**
     * Creates the Highscore view for and appends it to the main
     */
    openAndCreateHighscoreView: function () {
        $.ajax({
            async: false,
            type: 'GET',
            url: 'pageContent/highscoreScreen.html',
            success: function (highscoreScreen) {
                $("main").append(highscoreScreen);
            }
        });
    },

    /**
     * This function loads the highscores and appends them to the table
     */
    loadHighscores: function () {
        var name = getUserName();
        var i = 1;
        $.ajax({
            url: "api/highscore",
            data: {},
            dataType: "json",
            success: function (data) {
                $.each(data, function () {
                    var $row = $("<tr class='content'><td>" + i + "</td><td>" + data[i - 1].name + "</td><td class='bigTd'>" + data[i - 1].score + "</td></tr>");
                    if (String(data[i - 1].name) === name) {
                        $row.addClass("blueRow");
                    }
                    $(".panel-body").append($row);
                    i++;
                });
            },
            error: function () {
                $(".panel-body tr").remove();
            }
        });
    },

    /**
     * This function adds the Listener to the buttons
     */
    addButtonListeners: function () {
        $('body').on('click', '#zurueckButtonH', function (event) {
            event.preventDefault();
            openMainScreen();
        });
    }
};
