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

////////////////////////////////////////
// Here all the functions get defined //
////////////////////////////////////////

/**
 * This variable defines all the functions for the loginscreen
 */
var login = {
    /**
     * This function creates the login screen and appends it to main
     */
    createAndAppendLoginView: function () {
        var loginScreen = "<header><h1 class='headerText'>GEO GAME</h1></header>" +
            "<section class='loginSize panel panel-default panel-body'>" +
            "<form>" +
            "<section class='input-group input-group-lg'>" +
            "<h4  class='input-group-addon input-addon-login'>Benutzername: </h4>" +
            "<input class='form-control' id='usernameInput' placeholder='Username' type='text'/></br>" +
            "</section>" +
            "<section class='input-group input-group-lg'>" +
            "<h4  class='input-group-addon input-addon-login'>Passwort: </h4>" +
            "<input class='form-control' id='passwordInput' placeholder='Password' type='password'/></br>" +
            "</section>" +
            "<input id='registerButton' type='submit' value='Register' class='btn btn-lg btn-default'/>" +
            "<input id='loginButton' type='submit' value='Login' class='btn btn-lg btn-default' disabled/>" +
            "</form>" +
            "</section>";
        $("main").append(loginScreen);
    },

    /**
     * This function adds the Listener to the buttons
     */
    addButtonListeners: function () {
        $('body').on('click', '#registerButton', function (event) {
            event.preventDefault();
            $("#createUserModal").show();
        });

        $('body').on('click', '#loginButton', function (event) {
            event.preventDefault();
            login.loginCheck($("#usernameInput").val(), $("#passwordInput").val());
        });

        $('body').on('click', '#closeModal', function (event) {
            event.preventDefault();
            $("#createUserModal").hide();
        });

        window.onclick = function (event) {
            if (event.target == $("#createUserModal")) {
                $("#createUserModal").hide();
            }
        }

        $('body').on('click', '#registrationSubmitButton', function (event) {
            event.preventDefault();
            login.createUser($("#newUsernameInput").val(), $("#newPasswordInput").val(), $("#newPassword2Input").val());
        });

        //TODO wird erst gefeuert, wenn man irgendwo hinklickt
        $('body').on('change', '#newUsernameInput', function () {
            console.log("log: " + $("#newUsernameInput").val());
            toggleButton($("#registrationSubmitButton"), $("#newUsernameInput").val(),1);
        });

        $('body').on('change', '#usernameInput', function () {
            console.log("log: " + $("#usernameInput").val());
            toggleButton($("#loginButton"), $("#usernameInput").val(), $("#passwordInput").val());
        });

        $('body').on('change', '#passwordInput', function () {
            console.log("log: " + $("#passwordInput").val());
            toggleButton($("#loginButton"), $("#passwordInput").val(), $("#passwordInput").val());
        });
    },

    /**
     * This function creates and appends the Popup to create a new user
     */
    createAndAppendRegistrationPopup: function () {
        var registerForm = "<header><h4  class='headerText'>Register</h4></header>" +
            "<section  class='center loginSize'>" +
            "<form>" +
            "<section class='input-group'>" +
            "<p class='input-group-addon input-addon-login'>Benutzername:</p>" +
            "<input class='form-control' id='newUsernameInput' type='text'>" +
            "</section>" +
            "<section class='input-group'>" +
            "<p class='input-group-addon input-addon-login'>Passwort:</p>" +
            "<input class='form-control' id='newPasswordInput' type='password'>" +
            "</section>" +
            "<section class='input-group'>" +
            "<p class='input-group-addon input-addon-login'>Passwort wiederholen:</p>" +
            "<input class='form-control' id='newPassword2Input' type='password'>" +
            "</section>" +
            "<input id='registrationSubmitButton' type='submit' value='Register' class='btn btn-default' disabled>" +
            "</form>" +
            "</section>";

        var registrationPopup = "<section id='createUserModal' class='modal'>" +
            "<section class='modal-content'>" +
            "<p id='closeModal'>x</p>" + registerForm + "</section>" +
            "</section>";
        $("main").append(registrationPopup);
    },

    /**
     * This function sends a POST with ajax to create a user
     */
    createUser: function (username, password, password2) {
        removeErrorMessages();
        if (password.length > 0 && (password === password2)) {
            $.ajax({
                url: "api/register",
                data: {
                    name: username,
                    password: password
                },
                dataType: "json",
                type: "POST",
                success: function (response) {
                    console.log("ajax createUser POST success");
                    console.log(response);
                    if (response['message'] !== null) {
                        createAndAppendErrorMessage($("section.modal-content"), response['message']);
                    } else {
                        $("#usernameInput").val(response["name"]);
                        $("#passwordInput").val(response["password"]);
                        $("#createUserModal").hide();
                    }
                },
                error: function () {
                    createAndAppendErrorMessage($("section.modal-content"), "Verbindung unterbrochen!");
                }
            });
        } else {
            createAndAppendErrorMessage($("section.modal-content"), "Überprüfe Dein Passwort!");
        }

    }
    ,

    /**
     * This function logs the user in
     */
    loginCheck: function (username, password) {
        //TODO: database check user&&pw

        //TEST
        if (username === 't') {
            openMainScreen();
            return;
        }

        var request = Array(2);
        request["name"] = username;
        request["password"] = password;
        $.ajax({
            url: "api/login",
            data: JSON.stringify(request),
            dataType: "json",
            success: function ($request) {
                console.log("ajax loginCheck get success");
                if (response === true) {
                    openLoginScreen();
                } else {
                    createAndAppendErrorMessage($("main"), response['message']);
                }
            },
            error: function () {
                createAndAppendErrorMessage($("main"), "Verbindung unterbrochen!");
            }
        });
    }
}

/**
 * This variable defines all the functions for the mainscreen
 */
var main = {
    /**
     * Creates the main screen and appends it to the main
     */
    createAndAppendMainView: function () {
        var mainscreen = "<header><h1 class='headerText'>GEO GAME</h1></header>" +
            "<section class='centerButtons'>" +
            "<button id='newGameButton' class='button btn btn-default'>Play!</button><br/>" +
            "<button id='highscoreButton' class='button btn btn-default'>Highscore</button><br/>" +
            "<button id='configButton' class='button btn btn-default'>Config</button><br/>" +
            "<button id='aboutButton' class='button btn btn-default'>About</button><br/>" +
            "<button id='logoutButton' class='button btn btn-default'>Logout</button><br/>" +
            "</section>";
        $("main").append(mainscreen);
    },

    addButtonListeners: function () {
        $('body').on('click', '#newGameButton', function (event) {
            event.preventDefault();
            openGameScreen();
        });

        $('body').on('click', '#highscoreButton', function (event) {
            event.preventDefault();
            openHighscoreScreen();
        });

        $('body').on('click', '#configButton', function (event) {
            event.preventDefault();
            openConfigScreen();
        });

        $('body').on('click', '#aboutButton', function (event) {
            event.preventDefault();
            openAboutScreen();
        });

        $('body').on('click', '#logoutButton', function (event) {
            event.preventDefault();
            openLoginScreen();
        });
    }
}

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
        $('body').on('click', '#checkLocationButton', function (event) {
            event.preventDefault();
            game.checkLocation();
        });

        $('body').on('click', '#giveAHint', function (event) {
            event.preventDefault();
            game.giveAHint();
        });

        $('body').on('click', '#skipPicture', function (event) {
            event.preventDefault();
            game.skipPicture();
        });

        $('body').on('click', '#zurueckButtonG', function (event) {
            event.preventDefault();
            openMainScreen();
        });
    },

    //TODO: IMPLEMENT "loadPictures"
    loadPictures: function (user) {
        $.ajax({
            url: "api/pictures",
            data: user,
            dataType: "json",
            success: function (response) {
                console.log("ajax loadPictures success");
                console.log(user);
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
    },

    //TODO: IMPLEMENT "giveAHint"
    giveAHint: function (request) {
        //load here hint!
        $.ajax({
            url: "api/usehint",
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
        var hint = "ich bin ein unbrauchbarer Hinweis!";
        //take away some points! (or db??)
        alert(hint);
    },

    //TODO: IMPLEMENT "skipPicture"
    skipPicture: function (request) {
        $.ajax({
            url: "api/skippicture",
            data: request,
            dataType: "json",
            success: function (response) {
                console.log("ajax skipPicture success");
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
    },

    //TODO: IMPLEMENT "getPointsOfActualGame" in db!!
    getPointsOfActualGame: function (request) {
        return 666;
        $.ajax({
            url: "api/pictures",
            data: request,
            dataType: "json",
            success: function (response) {
                console.log("ajax getPointsOfActualGame success");
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
    },

    //TODO: IMPLEMENT "checkLocation"
    checkLocation: function (positionRequest) {
        $.ajax({
            url: "api/verifylocation",
            data: positionRequest,
            dataType: "json",
            success: function (response) {
                console.log("ajax checkLocation success");
                if (response['message'] !== null) {
                    //TODO where to append? :(
                    createAndAppendErrorMessage($("main"), response['message']);
                    return null; //TODO needed?
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
}

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
                console.log(data);
                $.each(data, function () {
                    var $row = $("<tr class='content'><td>" + i + "</td><td>" + data[i - 1]['name'] + "</td><td class='bigTd'>" + data[i - 1]['score'] + "</td></tr>");
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
}

/**
 * This variable defines all the functions for the config screen
 */
var config = {
    /**
     * Creates the config view  and appends it to the main
     */
    createAndAppendConfigView: function () {
        var configscreen = "<header><h3 class='headerText'>Config</h3></header>" +
            "<section class='contentSize'>" +
            "<form>" +
            "<section class='center input-group input-config'>" +
            "<p class='input-group-addon input-addon-login2'>Schwierigkeit: </p>" +
            "<select id='difficulty' class='form-control'>" +
            "<option value='easy'>Leicht</option>" +
            "<option value='middle'>Mittel</option>" +
            "<option value='difficult'>Schwer</option>" +
            "</select> " +
            "</section>" +
            "<section class='center panel panel-default'>" +
            "<section class='panel-heading'>" +
            "<label for='range'>Reichweite:</label>" +
            "<input type='text' id='range' readonly >" +
            "</section>" +
            "<section class='panel-body'><p id='slider-range'></p></p>" +
            "</section></form>" +
            "<p class='buttonContainer'>" +
            "<button id='saveConfigButton' class='button btn btn-default'>Speichern</button><br/>" +
            "<button id='zurueckButtonC' class='button btn btn-default'>Zurück</button>" +
            "</p></section>";
        $("main").append(configscreen);
    },

    /**
     * Intializes the settings which are stored in this js
     */
    intializeSettings: function () {
        $("select").val(difficulty);
        var newRange = [range[0], range[1]];
        var newDifficulty = difficulty;

        $("#slider-range").slider({
            range: true,
            min: MAX_RANGE[0],
            max: MAX_RANGE[1],
            values: [range[0], range[1]],
            slide: function (event, ui) {
                if (ui.values[1] === MAX_RANGE[1]) {
                    $("#range").val(ui.values[0] + "km - >" + (ui.values[1] - 1) + "km");
                    newRange = [ui.values[0], ui.values[1]];
                } else {
                    $("#range").val(ui.values[0] + "km - " + ui.values[1] + "km");
                    newRange = [ui.values[0], ui.values[1]];
                }
            }
        });

        $("#range").val($("#slider-range").slider("values", 0) +
            "km - " + $("#slider-range").slider("values", 1) + "km");

        $('select').on('change', function () {
            newDifficulty = this.value;
        });

        $('body').on('click', '#saveConfigButton', function (event) {
            event.preventDefault();
            config.saveConfig(newRange, newDifficulty);
        });
    },

    /**
     * This function saves the configuration
     */
    saveConfig: function (newRange, newDifficulty) {
        range = newRange;
        difficulty = newDifficulty;
    },

    /**
     * This function adds the Listener to the button
     */
    addButtonListeners: function () {
        $('body').on('click', '#zurueckButtonC', function (event) {
            event.preventDefault();
            openMainScreen();
        });
    }
}
/**
 * This variable defines all the functions for the about screen
 */
var about = {
    /**
     * Creates the about view and appends it to the main
     */
    createAndAppendAboutView: function () {
        var aboutScreen = "<header><h3 class='headerText'>About us</h3></header>" +
            "<section id='about'>" +
            "<p>Dies ist eine Single Page App, erstellt im Rahmen des Erfahrungsnotenprojektes des Moduls webeC (Web Engineering) and der FHNW in Brugg.</p>" +
            "<p>Developer: </p>" +
            "<ul><li>Simon Rissi</li><li>Dominic Bär</li><li>Nicolas Novak</li></ul>" +
            "<br/><p class='buttonContainer'>" +
            "<button id='zurueckButtonA' class='button btn btn-default'>Zurück</button>" +
            "</p></section>";
        $("main").append(aboutScreen);
    },

    /**
     * This function adds the Listener to the Button
     */
    addButtonListeners: function () {
        $('body').on('click', '#zurueckButtonA', function (event) {
            event.preventDefault();
            openMainScreen();
        });
    }
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

/**
 * disables / enables a certain button on the recognition whether a value is bigger than zero or not
 */
function toggleButton(button, value, value2) {
    if (String(value).length > 0 && String(value2).length > 0) { //works until here!
        button.prop('disabled', false);
    } else {
        button.prop('disabled', true);
    }
}