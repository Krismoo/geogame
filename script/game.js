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

        body.on('click', '.closeModal', function (event) {
            event.preventDefault();
            $("#gameModal").hide();
        });
    },

    /**
     * this loads the pictures from the right playround
     */
    loadPictures: function () {
        var request = {"token": getCurrentToken()};
        $.ajax({
            url: "api/pictures",
            data: request,
            dataType: "json",
            type: "GET",
            success: function (answer) {
                appendPictureAndIndicatorNodesInCarousel(answer);
            }
        });
    },

    /**
     * This calls ajax to get a hint of the actual puzzle
     */
    giveAHint: function () {
        var request = {
            'puzzleid': getActualPuzzleId(),
            'token': getCurrentToken()
        };
        $.ajax({
            url: "api/usehint",
            data: JSON.stringify(request),
            dataType: "json",
            type: "POST",
            success: function (answer) {
                $("#" + answer.puzzleid).find(".carousel-caption").last().append("<p class='hint'>" + answer.hint + "</p>");
                game.getUserPoints();
            }
        });
    },

    /**
     * calls an Ajax to get the points of the user
     */
    getUserPoints: function () {
        var request = {'token': getCurrentToken()};
        $.ajax({
            url: "api/userpoints",
            data: request,
            dataType: "json",
            type: "GET",
            success: function (answer) {
                $("#points").empty().text("Punkte: " + answer.points);
            }
        });
    },

    /**
     * calls an Ajax to validate a puzzle with current location
     */
    verifyLocation: function () {
        window.navigator.geolocation.getCurrentPosition(function (currentPosition) {
            var request = {
                'token': getCurrentToken(),
                'puzzleid': getActualPuzzleId(),
                'latitude': currentPosition.coords.latitude,
                'longitude': currentPosition.coords.longitude,
                'tolerance': config.getVerifyDistance()
            };
            $.ajax({
                url: "api/verifylocation",
                data: JSON.stringify(request),
                dataType: "json",
                type: "POST",
                success: function (answer) {
                    if (String(answer.success) === "1") {
                        $("#" + answer.puzzleid).find(".carousel-caption").prepend("<p class='statusPuzzle'>" + answer.message + "</p>");
                    }
                    showGamePopup(answer.message);

                    if (answer.reload === 1) {
                        game.loadPictures();
                        showGamePopup("Super! Neues Spiel wird geladen");
                    }
                    game.getUserPoints();
                }
            });
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
        $.ajax({
            url: "api/skippicture",
            data: JSON.stringify(request),
            dataType: "json",
            type: "POST",
            success: function (answer) {
                $("#" + answer.puzzleid).find(".carousel-caption").prepend("<p class='statusPuzzle'>übersprungen</p>");
                game.getUserPoints();
                if (answer.reload === 1) {
                    game.loadPictures();
                    showGamePopup("Super! Neues Spiel wird geladen");
                }
            }
        });
    },

    /**
     * creates the Gamepopup and appends it to the background
     */
    createGamePopup: function () {
        $.get("pageContent/gameModal.html", function (gameModal) {
            $("main").append(gameModal);
        });
    }
};

///////////////////////////////////////////////////////////////////////////////////
// Here the functions used by several (other) functions in this file get defined //
///////////////////////////////////////////////////////////////////////////////////
/**
 * Creates the Picture and indicator nodes and appends them into the Carousel
 * @param pictures  the data for the pictures
 */
function appendPictureAndIndicatorNodesInCarousel(pictures) {
    $("main").find(".carousel-indicators").empty();
    $("main").find(".carousel-inner").empty();

    for (var i = 0; i < pictures.length; i++) {
        var pictureNode = "";
        var indicatorNode = "";
        pictureNode = "<section class='item' id='" + pictures[i].ID + "'>" +
            "<img src='" + pictures[i].location.Source + ".jpg' alt='Picture'>" +
            "<div class='carousel-caption'></div></section>";
        $("main").find(".carousel-inner").append(pictureNode);
        appendCaptions(pictures[i]);
        indicatorNode = "<li data-target='#myCarousel' data-slide-to='" + i + "'></li>";
        $("main").find(".carousel-indicators").append(indicatorNode);

    }
    var activePicture = $("main").find(".item").first();
    activePicture.addClass("active item-active");
    $("li").first().addClass("active");
}

/**
 * returns the actual Puzzle (picture) id
 * @returns {*|jQuery}
 */
function getActualPuzzleId() {
    return $(".carousel-inner").find(".active").attr('id');
}

/**
 * Shows the Game popup with a message
 * @param message   the message to show
 */
function showGamePopup(message) {
    $("#gameModalText").empty().html(message);
    $("#gameModal").show();
}

/**
 * Appends the captions to a picture
 * @param picture   the picture data to compute
 */
function appendCaptions(picture) {
    if (picture.done === "1") {
        appendCaptionToCarouselCaption("statusPuzzle", picture.ID, picture.donetxt);
    }

    if (picture.location.Hint !== "") {
        appendCaptionToCarouselCaption("hint", picture.ID, picture.location.Hint);
    }
}

/**
 * Appends a paragraph to a caption
 * @param classP    the class of the element
 * @param id        the id where the element will be added
 * @param text      the text of the element
 */
function appendCaptionToCarouselCaption(classP, id, text) {
    $("#" + id).find(".carousel-caption").append("<figcaption class='" + classP + "'>" + text + "</figcaption>");
}