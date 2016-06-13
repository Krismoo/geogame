$(document).ready(function () {
    addListeners();
    if (localStorage.getItem("token") !== null) {
        openGameScreen();
    } else {
        openLoginScreen();
    }

});

///////////////////////////////////////////
// Here the global variables get defined //
///////////////////////////////////////////

var name = null;

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
    localStorage.setItem("token", aCurrentToken);
    console.log("Login successful: " + name + ", " + localStorage.getItem("token"));
}

//TODO: Getters for name, token and position?
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
    return name;
}


/**
 * proceeds the ajax calls for the Game screen
 * @param url       the url where the request gets sent to
 * @param request   the data to send
 * @param type      the HTML type like GET or POST
 */
function sendAjaxCallG(url, request, type) {
    $.ajax({
        url: "api/" + url,
        data: request,
        dataType: "json",
        type: type,
        success: function (answer) {
            handleAjaxAnswer(url, answer);
        }
    });
}


/**
 * proceeds the ajax calls for the Login screen
 * @param url        the url where the request gets sent to
 * @param request    the data to send
 * @param type       type of the ajax e.g. GET or POST
 * @param errorContainer  node where to append the error message
 */
function sendAjaxCallL(url, request, type, errorContainer) {
    var currentToken;
    $.ajax({
        url: "api/" + url,
        data: JSON.stringify(request),
        dataType: "json",
        type: type,
        success: function (answer) {
            if (answer.hasOwnProperty('message')) {
                createAndAppendErrorMessage(errorContainer, answer.message);
            } else {
                setLoggedInUser(answer.name, answer.currenttoken);
                openMainScreen();
            }
        }
    });
}