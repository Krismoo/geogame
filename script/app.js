/**
 * TODO: better to put the variables in the vars they belong? SIMON?
 *          => like config stuff into "config"
 */

///////////////////////////////////////////
// Here all global variables get defined //
///////////////////////////////////////////
var range = [5, 15]; //default range beetween range[0] and range[1] (in km)
var difficulty = "middle"; //TODO: difficulty still needs to be defined
const MAX_RANGE = [1, 100];//this will be a range from 1km to >99km

$(document).ready(function () {
    openLoginScreen();
    addListeners();
    /* TODO: Needed? @SIMON
     $('body').on('click', 'button', function (event) {
     event.preventDefault();
     window.navigator.geolocation.getCurrentPosition(function (position) {
     console.log(position);
     //doSomething()
     });
     });
     */
});

//////////////////////////////////////
// Here all the screens get defined //
//////////////////////////////////////

/**
 * This function opens the Login page
 */
function openLoginScreen() {
    eraseScreen();
    login.createAndAppendLoginView();
    login.createAndAppendRegistrationPopup();
}

/**
 * This function opens the game screen
 */
function openGameScreen() {
    eraseScreen();
    game.createAndAppendGameView();
    game.createAndAppendCarouselNode();
    var loadedPictures = game.loadPictures();
    var actualPoints = game.getPointsOfActualGame();
    if (loadedPictures !== null && actualPoints !== null) {
        game.appendPictureAndIndicatorNodesInCarousel(loadedPictures);
        game.createMenuNode(actualPoints);
    } else {

    }
}

/**
 * This function opens the MainScreen
 */
function openMainScreen() {
    eraseScreen();
    main.createAndAppendMainView();
}

/**
 * This function opens the highscore screen
 */
function openHighscoreScreen() {
    eraseScreen();
    highscore.openAndCreateHighscoreView();
    highscore.loadHighscores();
}

/**
 * This function opens the config screen
 */
function openConfigScreen() {
    eraseScreen();
    config.createAndAppendConfigView();
    config.intializeSettings();
}

/**
 * This function opens the about screen
 */
function openAboutScreen() {
    eraseScreen();
    about.createAndAppendAboutView();
}

////////////////////////////////////////////////////////////
// Here the functions used by several screens get defined //
////////////////////////////////////////////////////////////

/**
 * Empties the main element
 */
function eraseScreen() {
    $("main").empty();
}

/*
 * This creates, once and for all, all the listeners
 * Like this, we can prevent adding the same listener multiple times to an element
 */
function addListeners() {
    login.addButtonListeners();
    game.addButtonListeners();
    main.addButtonListeners();
    highscore.addButtonListeners();
    config.addButtonListeners();
    about.addButtonListeners();
}

/**
 * creates and appends an error message to a node
 */
function createAndAppendErrorMessage(node, message) {
    removeErrorMessages();
    node.append("<h4 class='alert alert-danger' role='alert'>" + message + "</h4>");
}

/**
 * removes all alerts
 */
function removeErrorMessages() {
    $(".alert").remove();
}

