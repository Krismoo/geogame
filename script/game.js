/**
 * Created by Nicolas on 09.06.2016.
 */

/**
 * This variable defines all the functions for the gamescreen
 */
var game = {
    /**
     * Creates the Mainstructure for the Gameview and appends it to the main
     * this is sequential, as the function calls after this function need the
     * structure which gets appended here!
     */
    createAndAppendGameView: function () {
        $.ajax({
            async: false,
            type: 'GET',
            url: 'pageContent/gameScreen.html',
            success: function (gameScreen) {
                $("main").append(gameScreen);
            }
        });
    },

    /**
     * This function adds the Listener to the buttons
     */
    addButtonListeners: function () {
        var body = $("body");
        body.on('click', '#verifyLocationButton', function (event) {
            event.preventDefault();
            game.verifyLocation();
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

    /**
     * this loads the pictures from the right playround
     */
    loadPictures: function () {
        var request = {"token": getCurrentToken()};
        sendAjaxCallG("pictures", request, "GET");
    },

    /**
     * This calls ajax to get a hint of the actual puzzle
     */
    giveAHint: function () {
        var request = {
            "puzzleid": getActualPuzzleId(),
            'token': getCurrentToken()
        };
        sendAjaxCallG("usehint", request, "POST");
    },

    /**
     * calls an Ajax to get the points of the user
     */
    getUserPoints: function () {
        var request = {'token': getCurrentToken()};
        sendAjaxCallG("userpoints", request, "GET");
    },

    /**
     * calls an Ajax to validate a puzzle with current location
     */
    verifyLocation: function () {
        window.navigator.geolocation.getCurrentPosition(function (currentPosition) {
            console.log(currentPosition);
            var request = {
                "puzzleid": getActualPuzzleId(),
                "latitude": currentPosition.coords.latitude,
                "longitude": currentPosition.coords.longitude
            };
            sendAjaxCallG("verifylocation", request, "POST");
        });

    },

    /**
     * This sends a request to skip a picture
     */
    skipPicture: function () {
        var request = {
            "token": getCurrentToken(),
            "puzzleid": getActualPuzzleId(),
        };
        sendAjaxCallG("skippicture", request, "POST");
    }
};

///////////////////////////////////////////////////////////////////////////////////
// Here the functions used by several (other) functions in this file get defined //
///////////////////////////////////////////////////////////////////////////////////

/**
 * This function handles the ajax answers
 * @param requestUrl   from which url the answer is from
 * @param answer    the answer to compute
 */
function handleAjaxAnswer(requestUrl, answer) {
    switch (requestUrl) {
        case "usehint":
            $("#" + answer.puzzleId).find(".hint").text(answer.hint);
            break;
        case "userpoints":
            $("#points").text("Punkte: " + answer.points);
            break;
        case "pictures":
            appendPictureAndIndicatorNodesInCarousel(answer);
            break;
        default:
            break;
    }
}

/**
 * Creates the Picture and indicator nodes and appends them into the Carousel
 * @param pictures  the data for the pictures
 */
function appendPictureAndIndicatorNodesInCarousel(pictures) {
    console.log(pictures);
    var pictureNodes = "";
    var indicatorNodes = "";
    for (var i = 0; i < pictures.length; i++) {
        // http://www.w3schools.com/bootstrap/bootstrap_carousel.asp
        pictureNodes += "<section class='item' id='" + pictures[i].ID + "'>" +
            "<img src='" + pictures[i].location.Source + ".jpg' alt='Picture'>" +
            "<div class='carousel-caption'><p class='hint'></p><p class='statusPuzzle'></p>" +
            "</div></section>";

        indicatorNodes += "<li data-target='#myCarousel' data-slide-to='" + i + "'></li>";
    }
    $("main").find(".carousel-inner").append(pictureNodes);
    $("main").find(".carousel-indicators").append(indicatorNodes);

    var activePicture = $("main").find(".item").first();
    activePicture.addClass("active item-active");
    puzzleId = activePicture.attr('id');
    $("li").first().addClass("active");
}

function getActualPuzzleId() {
    return $("carousel-inner").find(".active");
}