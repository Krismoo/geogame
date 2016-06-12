/**
 * Created by Nicolas on 09.06.2016.
 */

/**
 * This variable defines all the functions for the gamescreen
 */
var game = {
    /**
     * Creates the Mainstructure for the Gameview  and appends it to the main
     */
    createAndAppendGameView: function () {
        var gameScreen = "<header><h3 class='headerText'>Go to the place on this Picture" +
            "<button id='zurueckButtonG' class='menubtn btn btn-default'>Menu</button></h3></header>" +
            "<p>" +
            "<section id='myCarousel' class='carousel slide' data-ride='carousel'></section>" +
            "<p class='menu'></p>" +
            "</p>";
        $("main").append(gameScreen);
    },

    /**
     * Creates the Carosuel node for the Gameview and appends it to the Mainstructure
     */
    createAndAppendCarouselNode: function () {
        var carouselNode = "" +
            "<p class='carousel-indicators'>" +
            "<!-- Indicators! -->" +
            "</p>" +

            "<!-- Wrapper for slides -->" +
            "<section class='carousel-inner' role='listbox'>" +
            "<!--Pictures! -->" +
            "</section>" +

            "<!-- Left and right controls -->" +
            "<a class='left carousel-control' href='#myCarousel' role='button' data-slide='prev'>" +
            "<p class='glyphicon glyphicon-chevron-left' aria-hidden='true'></p>" +
            "<p class='sr-only'>Previous</p>" +
            "</a>" +
            "<a class='right carousel-control' href='#myCarousel' role='button' data-slide='next'>" +
            "<p class='glyphicon glyphicon-chevron-right' aria-hidden='true'></p>" +
            "<p class='sr-only'>Next</p>" +
            "</a>";
        $("#myCarousel").append(carouselNode);
    },

    /**
     * Creates the Picture and indicator nodes and appends them into the Carousel
     * @param pictures  the pictures to add
     */
    appendPictureAndIndicatorNodesInCarousel: function (pictures) {
        var pictureNodes = "";
        var indicatorNodes = "";

        //TODO: This should use "pictures" from "loadPictures()" and get the pictures on the right way!
        for (var i = 1; i <= 10; i++) {
            var numberString;
            if (i < 10) {
                numberString = "00" + i;
            } else {
                numberString = "0" + i;
            }
            // http://www.w3schools.com/bootstrap/bootstrap_carousel.asp
            pictureNodes += "<p class='item'>" +
                "<img src='Assets/Pictures/GeoGame_Picture_" + numberString + ".jpg' alt='Picture'>" +
                "</p>";
            indicatorNodes += "<li data-target='#myCarousel' data-slide-to='" + (i - 1) + "'></li>";
        }
        $(".carousel-inner").append(pictureNodes);
        $(".carousel-indicators").append(indicatorNodes);
        $("p.item").first().addClass("active item-active");
        $("li").first().addClass("active");
    },

    /**
     * Creates the Menu node for the game view and appends it to the Mainstructure
     */
    createMenuNode: function (actualPoints) {
        var menuNode = "<input id='checkLocationButton' type='submit' value='Check Location' class='btn btn-lg btn-default'/>" +
            "<h3>Points: " + actualPoints + "</h3>" +
            "<input id='giveAHint' type='submit' value='Give me a hint' class='btn btn btn-default'/><br/>" +
            "<input id='skipPicture' type='submit' value='Skip Picture' class='btn btn btn-default'/>";
        $(".menu").append(menuNode);
    },

    /**
     * This function adds the Listener to the buttons
     */
    addButtonListeners: function () {
        var body = $("body");
        body.on('click', '#checkLocationButton', function (event) {
            event.preventDefault();
            game.checkLocation();
        });

        body.on('click', '#giveAHint', function (event) {
            event.preventDefault();
            game.giveAHint();
        });

        body.on('click', '#skipPicture', function (event) {
            event.preventDefault();
            game.skipPicture();
        });

        body.on('click', '#zurueckButtonG', function (event) {
            event.preventDefault();
            openMainScreen();
        });
    },

    //TODO: IMPLEMENT "loadPictures"
    /**
     * this loads the pictures from the right playround
     */
    loadPictures: function () {
        //sends wrong... -.-
        //TODO: omg why password and ID??
        //take this away and use getLoginJSON() !!
        var request = {
            'id': 1,
            'name': "rissi",
            'pwd': "teeest",
            'token': "hjhfzufljnu8655556vdjfhg"
        };

        //TODO CALLBACK NEEDED!
        var answer = sendAjaxCall("pictures", getLoginJSON(), "GET");
        console.log(answer);
        return answer;
    },

    //TODO: IMPLEMENT "giveAHint"
    giveAHint: function (request) {
        //load here hint!
        var hint = sendAjaxCall("usehint", request, "GET");
        //take away some points! (or db??)
        //show hint
    },

    //TODO: IMPLEMENT "skipPicture"
    skipPicture: function (request) {
        var answer = sendAjaxCall("skippicture", request, "GET");
        return answer;
    },

    //TODO: IMPLEMENT "getPointsOfActualGame" in db!!
    getPointsOfActualGame: function (request) {
        var answer = sendAjaxCall("pictures", request, "GET");
        if (answer === undefined) {
            return "666";
        }
        return answer;
    },

    //TODO: IMPLEMENT "checkLocation"
    checkLocation: function (positionRequest) {
        var answer = sendAjaxCall("verifylocation", positionRequest, "POST");
        return answer;
    }
};

///////////////////////////////////////////////////////////////////////////////////
// Here the functions used by several (other) functions in this file get defined //
///////////////////////////////////////////////////////////////////////////////////

/**
 * This function proceeds all the GET ajax calls
 * @param url       the url where the request gets sent to
 * @param request   the data to send
 */
function sendAjaxCall(url, request, type) {
    $.ajax({
        url: "api/" + url,
        data: request,
        dataType: "json",
        type: type,
        success: function (answer) {
            if (answer.message !== null) {
                //TODO where to append? :(
                createAndAppendErrorMessage($("main"), answer.message);
                return null;
            } else {
                return answer;
            }
        },
        error: function () {
            createAndAppendErrorMessage($("main"), "Verbindung unterbrochen!");
            return null;
        }
    });
}