/**
 * Place for all the global variables like config stuff
 * TODO: better to put the variables in the vars they belong?
 *          => like config stuff into "config"
 */
var iHaveAbsoluteNofunctionalityIswearOnMeMomMate = 0;
var range = [5, 15]; //default range beetween range[0] and range[1] (in km)
var difficulty = "middle"; //TODO: difficulty still needs to be defined
var MAX_RANGE = [1, 100];//this will be a range from 1km to >99km

$(document).ready(function () {
    login.openLoginScreen();

    /* TODO: Needed?
     $('body').on('click', 'button', function (event) {
     event.preventDefault();
     window.navigator.geolocation.getCurrentPosition(function (position) {
     console.log(position);
     //doSomething()
     });
     });
     */
});


/**
 * Here the section starts where all the screens get defined
 */

/**
 * This variable defines all the functions for the loginscreen
 */
var login = {
    /**
     * This function opens the Login page
     */
    openLoginScreen: function () {
        eraseScreen();
        var loginScreen = "<header><h1 class='headerText'>GEO GAME</h1></header>" +
            "<section class='loginSize panel panel-default panel-body'>" +
            "<form>" +
            "<div class='input-group input-group-lg'>" +
            "<h4  class='input-group-addon input-addon-login'>Benutzername: </h4>" +
            "<input class='form-control' id='benutzernameInput' placeholder='Benutzername' type='text'/></br>" +
            "</div>" +
            "<div class='input-group input-group-lg'>" +
            "<h4  class='input-group-addon input-addon-login'>Passwort: </h4>" +
            "<input class='form-control' id='passwortInput' placeholder='Passwort' type='password'/></br>" +
            "</div>" +
            "<input id='registrierenButton' type='submit' value='Registrieren' class='btn btn-lg btn-default'/>" +
            "<input id='loginButton' type='submit' value='Login' class='btn btn-lg btn-default' style='float: right'/>" +
            "</form>" +
            "</section>";
        $("main").append(loginScreen);

        $('body').on('click', '#registrierenButton', function (event) {
            event.preventDefault();
            login.createUser();
        });

        $('body').on('click', '#loginButton', function (event) {
            event.preventDefault();
            login.loginCheck($("#benutzernameInput").val(), $("#passwortInput").val());
        });


        //TODO if: (benutzernameInput.value.length>0  && passwortInput.value.length>0 ){activate login button}
        {
            $('body').on('change', '#benutzernameInput', function (event) {
                event.preventDefault();
            });

            $('body').on('change', '#passwortInput', function (event) {
                event.preventDefault();
            });
        }
    },

    /**
     * This function opens the Popup to create new User
     */
    createUser: function () {
        var registerForm = "<header><h4  class='headerText'>Registrieren</h4></header>" +
            "<section  class='center loginSize'>" +
            "<form>" +
            "<div class='input-group'>" +
            "<p class='input-group-addon input-addon-login'>Benutzername:</p>" +
            "<input class='form-control' id='benutzernameInput' type='text'>" +
            "</div>" +
            "<div class='input-group'>" +
            "<p class='input-group-addon input-addon-login'>Passwort:</p>" +
            "<input class='form-control' id='passwortInput' type='password'>" +
            "</div>" +
            "<div class='input-group'>" +
            "<p class='input-group-addon input-addon-login'>Passwort wiederholen:</p>" +
            "<input class='form-control' id='passwortInput' type='password'>" +
            "</div>" +
            "<input id='registrierungAbschickenButton' type='submit' value='Registrieren' class='btn btn-default'>" +
            "</form>" +
            "</section>";
        var registrierenPopup = "<div id='createUserModal' class='modal'>" +
            "<div class='modal-content'>" +
            "<span id='closeModal'>x</span>" + registerForm + "</div>" +
            "</div>";
        $("main").append(registrierenPopup);

        //TODO: ajax um Benutzernamen bereits benutzt zu überprüfen?? (onChange)
        //TODO: HTTP POST / ajax um den User in der db zu registrieren
        //TODO: Passwörter sollen bei der Usererstellung gleich sein! -> function()
        //TODO: onClick: "registrierungAbschickenButton" ausgefüllter name/pw gleich beim Anmelden eingeben?

        var modal = document.getElementById('createUserModal');
        var span = document.getElementById("closeModal");

        modal.style.display = "block";

        // When the user clicks on <span> (x), close the modal
        span.onclick = function () {
            event.preventDefault();
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function (event) {
            event.preventDefault();
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    },

    /**
     * This function logs the user in
     */
    loginCheck: function (benutzername, passwort) {
        //TODO: database check user&&pw
        var successful = true;
        if (benutzername === "false") {
            successful = false;
        }

        if (successful) {
            main.openMainscreen(); //TODO: login data as parameter? (load config => how?)
        } else {
            login.loginFailed();
        }
    },
    loginFailed: function () {
        $(".alert").remove();
        $("main").append("<h4 class='alert alert-danger' role='alert'>Wrong Login Data!</h4>");
    }
}

/**
 * This variable defines all the functions for the mainscreen
 */
var main = {
    /**
     * This function opens the Mainscreen
     */
    openMainscreen: function () {
        eraseScreen();
        var mainscreen = "<header><h1 class='headerText'>GEO GAME</h1></header>" +
            "<section class='centerButtons'>" +
            "<button id='newGameButton' class='button btn btn-default'>Play!</button><br/>" +
            "<button id='highscoreButton' class='button btn btn-default'>Highscore</button><br/>" +
            "<button id='configButton' class='button btn btn-default'>Config</button><br/>" +
            "<button id='aboutButton' class='button btn btn-default'>About</button><br/>" +
            "<button id='logoutButton' class='button btn btn-default'>Logout</button><br/>" +
            "</section>";
        $("main").append(mainscreen);

        $('body').on('click', '#newGameButton', function (event) {
            event.preventDefault();
            game.openGamescreen();
        });

        $('body').on('click', '#highscoreButton', function (event) {
            event.preventDefault();
            highscore.openHighscorescreen();
        });

        $('body').on('click', '#configButton', function (event) {
            event.preventDefault();
            config.openConfigscreen();
        });

        $('body').on('click', '#aboutButton', function (event) {
            event.preventDefault();
            about.openAboutscreen();
        });

        $('body').on('click', '#logoutButton', function (event) {
            event.preventDefault();
            login.openLoginScreen();
            //TODO different logout needed?
        });
    }
}

/**
 * This variable defines all the functions for the gamescreen
 */
var game = {
    /**
     * This function opens the gamescreen
     */
    openGamescreen: function () {
        eraseScreen();

        var gameScreen = "<header><h3 class='headerText'>Go to the place on this Picture" +
            "<button id='zurueckButtonG' class='menubtn btn btn-default'>Menu</button></h3></header>" +
            "<section>" +
            "<div id='myCarousel' class='carousel slide' data-ride='carousel'></div>" +
            "<div class='menu'></div>" +
            "</section>";

        var carouselNode = "" +
            "<ol class='carousel-indicators'>" +
            "<!-- Indicators! -->" +
            "</ol>" +

            "<!-- Wrapper for slides -->" +
            "<div class='carousel-inner' role='listbox'>" +
            "<!--Pictures! -->" +
            "</div>" +

            "<!-- Left and right controls -->" +
            "<a class='left carousel-control' href='#myCarousel' role='button' data-slide='prev'>" +
            "<span class='glyphicon glyphicon-chevron-left' aria-hidden='true'></span>" +
            "<span class='sr-only'>Previous</span>" +
            "</a>" +
            "<a class='right carousel-control' href='#myCarousel' role='button' data-slide='next'>" +
            "<span class='glyphicon glyphicon-chevron-right' aria-hidden='true'></span>" +
            "<span class='sr-only'>Next</span>" +
            "</a>";

        var pictureNodes = "";
        var indicatorNodes = "";

        //TODO: This should use "loadPictures()" and get the pictures on the right way!
        for (var i = 1; i <= 10; i++) {
            var number;
            if (i < 10) {
                number = "00" + i;
            } else if (i < 100) {
                number = "0" + i;
            } else {
                console.error("Cannot proceed more than 99 Pictures!");
            }

            //TODO: http://www.w3schools.com/bootstrap/bootstrap_carousel.asp
            //TODO: Indicator (circle at the bottom) doesnt work
            if (i === 1) {
                pictureNodes += "<div class='item item-active active'>" +
                    "<img src='Assets/Pictures/GeoGame_Picture_" + number + ".jpg' alt='Picture'>" +
                    "</div>";
                indicatorNodes += "<li data-target='#myCarousel' data-slide-to='" + (i-1) + "' class='active'></li>";
            } else {
                pictureNodes += "<div class='item'>" +
                    "<img src='Assets/Pictures/GeoGame_Picture_" + number + ".jpg' alt='Picture'>" +
                    "</div>";
                indicatorNodes += "<li data-target='#myCarousel' data-slide-to='" + (i - 1) + "'></li>";

            }

        }
        var points = 666;//game.getPointsOfActualGame();
        var menuNode = "<input id='checkLocationButton' type='submit' value='Check Location' class='btn btn-lg btn-default'/>" +
            "<h3>Points: " + points + "</h3>" +
            "<input id='giveAHint' type='submit' value='Give me a hint' class='btn btn btn-default'/><br/>" +
            "<input id='skipPicture' type='submit' value='Skip Picture' class='btn btn btn-default'/>";


        $("main").append(gameScreen);
        $(".carousel").append(carouselNode);
        $(".carousel-inner").append(pictureNodes);
        $(".carousel-indicators").append(indicatorNodes);
        $(".menu").append(menuNode);

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
            main.openMainscreen();
        });
    },

    //TODO: IMPLEMENT "loadPictures"
    loadPictures: function () {
    },

    //TODO: IMPLEMENT "giveAHint"
    giveAHint: function () {
        var hint;
        //TODO load here hint!
        hint = "I am an useless hint!"
        //TODO take away some points!
        alert(hint);
    },

    //TODO: IMPLEMENT "skipPicture"
    skipPicture: function () {
    },

    //TODO: IMPLEMENT "getPointsOfActualGame"
    getPointsOfactualGame: function () {
    },

    //TODO: IMPLEMENT "loadPictures"
    checkLocation: function () {
    }
}

/**
 * This variable defines all the functions for the highscore screen
 */
var highscore = {
    /**
     * This function opens the highscore screen
     */
    openHighscorescreen: function () {
        eraseScreen();
        var highscoreData = highscore.loadHighscores();
        var highscorescreen = "<header><h3 class='headerText'>Highscore</h3></header>" +
            "<section class='contentSize'>" +
                //Two hours for this stupid, stupidly awesome looking Table LOL
            "<table class='center table-responsive panel panel-primary'>" +
            "<thead class='panel-heading'><tr><th>Platz</th><th>Name</th><th class='bigTd'>Datum</th><th class='bigTd'>Punkte</th></tr></thead>" +
            "<tbody class='panel-body'>" +
            "<tr><td>1</td><td>Simon</td><td class='bigTd'>29.05.2016</td><td class='bigTd'>66666</td></tr>" +
            "<tr><td>2</td><td>Dominic</td><td class='bigTd'>28.05.2016</td class='bigTd'><td>6666</td></tr>" +
            "<tr><td>3</td><td>Nicolas</td><td class='bigTd'>27.05.2016</td class='bigTd'><td>666</td></tr>" +
            "<tr><td>4</td><td>Nicolas</td><td class='bigTd'>27.05.2016</td class='bigTd'><td>66</td></tr>" +
            "<tr><td>5</td><td>Nicolas</td><td class='bigTd'>27.05.2016</td class='bigTd'><td>6</td></tr>" +
            "<tr><td>6</td><td>Nicolas</td><td class='bigTd'>27.05.2016</td class='bigTd'><td>0.6</td></tr>" +
            "<tr><td>7</td><td>Nicolas</td><td class='bigTd'>27.05.2016</td class='bigTd'><td>0.06</td></tr>" +
            "<tr><td>8</td><td>Nicolas</td><td class='bigTd'>27.05.2016</td class='bigTd'><td>0.006</td></tr>" +
            "<tr><td>9</td><td>Nicolas</td><td class='bigTd'>27.05.2016</td class='bigTd'><td>0.0006</td></tr>" +
            "<tr><td>10</td><td>Nicolas</td><td class='bigTd'>27.05.2016</td class='bigTd'><td>0.00006</td></tr>" +
            "</tbody>" +
            "</table>" +
            "<br/><div class='buttonContainer'>" +
            "<button id='zurueckButtonH' class='button btn btn-default'>Zurück</button>" +
            "</div></section>";
        $("main").append(highscorescreen);
        //TODO: make a foreach which appends the rows


        $('body').on('click', '#zurueckButtonH', function (event) {
            event.preventDefault();
            main.openMainscreen();
        });

    },

    loadHighscores: function () {
        //TODO: load ALLLLL the highsocredata
    }
}

/**
 * This variable defines all the functions for the config screen
 */
var config = {
    /**
     * This function opens the config screen
     */
    openConfigscreen: function () {
        eraseScreen();
        var configscreen = "<header><h3 class='headerText'>Config</h3></header>" +
            "<section class='contentSize'>" +
            "<form>" +
            "<div class='center input-group input-config'>" +
            "<p class='input-group-addon input-addon-login2'>Schwierigkeit: </p>" +
            "<select id='difficulty' class='form-control'>" +
            "<option value='easy'>Leicht</option>" +
            "<option value='middle'>Mittel</option>" +
            "<option value='difficult'>Schwer</option>" +
            "</select> " +
            "</div>" +
            "<div class='center panel panel-default'>" +
            "<p class='panel-heading'>" +
            "<label for='range'>Reichweite:</label>" +
            "<input type='text' id='range' readonly >" +
            "</p>" +
            "<div class='panel-body'><div id='slider-range'></div></div>" +
            "</div></form>" +
            "<br/><div class='buttonContainer'>" +
            "<button id='saveConfigButton' class='button btn btn-default'>Speichern</button><br/>" +
            "<button id='zurueckButtonC' class='button btn btn-default'>Zurück</button>" +
            "</div></section>";
        $("main").append(configscreen);
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

        $('body').on('click', '#zurueckButtonC', function (event) {
            event.preventDefault();
            main.openMainscreen();
        });
    },
    /**
     * This function saves the configuration
     */
    saveConfig: function (newRange, newDifficulty) {
        //TODO: Save configuration
        range = newRange;
        difficulty = newDifficulty;
    }
}
/**
 * This variable defines all the functions for the about screen
 */
var about = {
    /**
     * This function opens the about screen
     */
    openAboutscreen: function () {
        eraseScreen();
        var aboutScreen = "<header><h3 class='headerText'>About us</h3></header>" +
            "<section style='width: 90%; margin: auto;'>" +
            "<p>Dies ist eine Single Page App, erstellt im Rahmen des Erfahrungsnotenprojektes des Moduls webeC (Web Engineering) and der FHNW in Brugg.</p>" +
            "<p>Developer: </p>" +
            "<ul><li>Simon Rissi</li><li>Dominic Bär</li><li>Nicolas Novak</li></ul>" +
            "<br/><div class='buttonContainer'>" +
            "<button id='zurueckButtonA' class='button btn btn-default'>Zurück</button>" +
            "</div></section>";
        $("main").append(aboutScreen);

        $('body').on('click', '#zurueckButtonA', function (event) {
            event.preventDefault();
            main.openMainscreen();
        });
    }
}

function eraseScreen() {
    $("main").empty();
}