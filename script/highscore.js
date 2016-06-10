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
        var highscorescreen = "<header><h3 class='headerText'>Highscore</h3></header>" +
            "<section class='contentSize'>" +
            "<table class='center table-responsive panel panel-primary'>" +
            "<thead class='panel-heading'><tr><th>Platz</th><th>Name</th><th class='bigTd'>Punkte</th></tr></thead>" +
            "<tbody class='panel-body'></tbody>" +
            "</table>" +
            "<br/><p class='buttonContainer'>" +
            "<button id='zurueckButtonH' class='button btn btn-default'>Zurück</button>" +
            "</p></section>";
        $("main").append(highscorescreen);
    },

    /**
     * This function loads the highscores and appends them to the table
     */
    loadHighscores: function () {
        $("tr.content").remove();
        var i = 1;
        $.ajax({
            url: "api/highscore",
            data: {},
            dataType: "json",
            success: function (data) {
                $.each(data, function () {
                    var $row = $("<tr class='content'><td>" + i + "</td><td>" + data[i - 1].name + "</td><td class='bigTd'>" + data[i - 1].score + "</td></tr>");
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
