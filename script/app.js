$(document).ready(function () {
    openLoginScreen();
    addListeners();

    window.navigator.geolocation.getCurrentPosition(function (aPosition) {
        console.log(aPosition);
        position = aPosition;
    })
});

///////////////////////////////////////////
// Here the global variables get defined //
///////////////////////////////////////////

var name = null;
var currentToken = null;
var position = null;

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
    game.getPointsOfActualGame();
    var loadedPictures = game.loadPictures();
    if (loadedPictures !== null) {
        game.appendPictureAndIndicatorNodesInCarousel(loadedPictures);
    } else {
        //TODO where to append? :(
        createAndAppendErrorMessage("main", "could not load game!");
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
 * removes all error messages
 */
function removeErrorMessages() {
    $(".alert").remove();
}

/**
 * Setter to set login information
 * @param aName          the name of the logged in user
 * @param aCurrenttoken  the current token
 */
function setLoggedInUser(aName, aCurrentToken) {
    name = aName;
    currentToken = aCurrentToken;
    console.log("Login successful: " + name + ", " + currentToken);
}

//TODO: Getters for name, token and position?
/**
 * returns a JSON object with the login data
 * @returns {{name: *, token: *}}
 */
function getLoginJSON() {
    return {
        'name': name,
        'token': currentToken
    };
}