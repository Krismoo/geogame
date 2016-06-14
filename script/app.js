///////////////////////////////////////
// function called on document ready //
///////////////////////////////////////
/**
 *  if a valid token is in the local storage opens the gamescreen
 *  and loads the config, otherwise opens the login screen
 */
$(document).ready(function () {
    addListeners();
    if (localStorage.getItem("token") !== null) {
        $.ajax({
            url: "api/config",
            data: {token: getCurrentToken()},
            dataType: "json",
            type: "GET",
            success: function (data) {
                config.setVerifyDistanceGUI(data.tolerance);
            }
        });
        openGameScreen();
    } else {
        openLoginScreen();
    }
});

//////////////////////////////////////////
// Here the global variable get defined //
//////////////////////////////////////////

var name;

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
    game.createGamePopup();
    game.loadPictures();
    game.getUserPoints();
}

/**
 * This function opens the main screen
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
 * @param node         to append the message
 * @param message      message to show
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
    localStorage.setItem("token", aCurrentToken);
    localStorage.setItem("name", aName);
}

/**
 * returns the token
 * @returns token from the local storage
 */
function getCurrentToken() {
    return localStorage.getItem("token");
}

/**
 * getter for the name
 * @returns string of the name
 */
function getUserName() {
    return localStorage.getItem("name");
}