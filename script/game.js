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
     */
    //TODO IMPORTANT: BREAK DOWN FUNCTION! (extract)
    appendPictureAndIndicatorNodesInCarousel: function (pictures) {
        var pictureNodes = "";
        var indicatorNodes = "";

        //TODO: This should use "pictures" from "loadPictures()" and get the pictures on the right way!
        for (var i = 1; i <= 10; i++) {
            var number;
            if (i < 10) {
                number = "00" + i;
            } else if (i < 100) {
                number = "0" + i;
            } else {
                console.error("Cannot proceed more than 99 Pictures!");
            }

            // http://www.w3schools.com/bootstrap/bootstrap_carousel.asp
            //work here with the "pictures" array!
            if (i === 1) {
                console.log("called i === 1");
                pictureNodes += "<p class='item item-active active'>" +
                    "<img src='Assets/Pictures/GeoGame_Picture_" + number + ".jpg' alt='Picture'>" +
                    "</p>";
                indicatorNodes += "<li data-target='#myCarousel' data-slide-to='" + (i - 1) + "' class='active'></li>";
            } else {
                console.log("called else");
                pictureNodes += "<p class='item'>" +
                    "<img src='Assets/Pictures/GeoGame_Picture_" + number + ".jpg' alt='Picture'>" +
                    "</p>";
                indicatorNodes += "<li data-target='#myCarousel' data-slide-to='" + (i - 1) + "'></li>";

            }
        }
        $(".carousel-inner").append(pictureNodes);
        $(".carousel-indicators").append(indicatorNodes);
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
    loadPictures: function (user) {
        var answer = sendGet("pictures", user);
        return answer;
    },

    //TODO: IMPLEMENT "giveAHint"
    giveAHint: function (request) {
        //load here hint!
        var hint = sendGet("usehint", request);
        // var hint = "ich bin ein unbrauchbarer Hinweis!";
        //take away some points! (or db??)
        alert(hint);
    },

    //TODO: IMPLEMENT "skipPicture"
    skipPicture: function (request) {
        var answer = sendGet("skippicture", request);
        return answer;
    },

    //TODO: IMPLEMENT "getPointsOfActualGame" in db!!
    getPointsOfActualGame: function (request) {
        var answer = sendGet("pictures", request);
        return answer;
    },

    //TODO: IMPLEMENT "checkLocation"
    checkLocation: function (positionRequest) {
        var answer = sendGet("verifylocation", positionRequest);
        return answer;
    }
};

/**
 * This function proceeds all the GET ajax calls
 * @param url       the url where the request gets sended to
 * @param request   the data to send
 */
function sendGet(url, request) {
    $.ajax({
        url: "api/" + url,
        data: request,
        dataType: "json",
        success: function (response) {
            console.log("ajax giveAHint success");
            if (response['message'] !== null) {
                //TODO where to append? :(
                createAndAppendErrorMessage($("main"), response['message']);
                return null;
            } else {
                return response;
            }
        },
        error: function () {
            createAndAppendErrorMessage($("main"), "Verbindung unterbrochen!");
            return null;
        }
    });
}