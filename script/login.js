/**
 * Created by Nicolas on 09.06.2016.
 */

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
            "<input class='form-control' id='usernameInput' onkeyup='userInputKeyUp()' placeholder='Username' type='text'/></br>" +
            "</section>" +
            "<section class='input-group input-group-lg'>" +
            "<h4  class='input-group-addon input-addon-login'>Passwort: </h4>" +
            "<input class='form-control' id='passwordInput' onkeyup='userInputKeyUp()' placeholder='Password' type='password'/></br>" +
            "</section>" +
            "<input id='registerButton' type='submit' value='Register' class='btn btn-lg btn-default'/>" +
            "<input id='loginButton' type='submit' value='Login' class='btn btn-lg btn-default' disabled/>" +
            "</form>" +
            "</section>";
        $("main").append(loginScreen);
    },

    /**
     * This function adds the Listeners to the buttons
     */
    addButtonListeners: function () {
        var body = $('body');
        body.on('click', '#registerButton', function (event) {
            event.preventDefault();
            $("#createUserModal").show();
        });

        body.on('click', '#loginButton', function (event) {
            event.preventDefault();
            login.loginCheck($("#usernameInput").val(), $("#passwordInput").val());
        });

        body.on('click', '#closeModal', function (event) {
            event.preventDefault();
            $("#createUserModal").hide();
        });

        //TODO how can this has a complexity of 2??? => kills the mark by 2.5p
        window.onclick = function (event) {
            if (event.target === $("#createUserModal")) {
                $("#createUserModal").hide();
            }
        };

        body.on('click', '#registrationSubmitButton', function (event) {
            event.preventDefault();
            if ($("#newPasswordInput").val() === $("#newPassword2Input").val()) {
                login.createUser($("#newUsernameInput").val(), $("#newPasswordInput").val());
            } else {
                createAndAppendErrorMessage($("section.modal-content"), "Passwörter stimmen nicht überein!");
            }
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
            "<input class='form-control' onkeyup='newUserInputKeyUp()' id='newUsernameInput' type='text'>" +
            "</section>" +
            "<section class='input-group'>" +
            "<p class='input-group-addon input-addon-login'>Passwort:</p>" +
            "<input class='form-control' onkeyup='newUserInputKeyUp()' id='newPasswordInput' type='password'>" +
            "</section>" +
            "<section class='input-group'>" +
            "<p class='input-group-addon input-addon-login'>Passwort wiederholen:</p>" +
            "<input class='form-control' onkeyup='newUserInputKeyUp()' id='newPassword2Input' type='password'>" +
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
    createUser: function (username, password) {
        removeErrorMessages();
        var request = {
            name: username,
            password: password
        };
        var answer = sendAjaxCall("register", request, "POST", $("section.modal-content"));
    },

    /**
     *  This function logs the user in
     * @param username  dito
     * @param password  dito
     */
    loginCheck: function (username, password) {
        removeErrorMessages();
        //TODO: TEST
        if (username === 't') {
            openMainScreen();
            return;
        } else {
            var request = {
                name: username,
                password: password
            };
            var answer = sendAjaxCall("login", request, "GET", $("main"));
            //...
        }
    }
};

///////////////////////////////////////////////////////////////////////////////////
// Here the functions used by several (other) functions of this file get defined //
///////////////////////////////////////////////////////////////////////////////////

/**
 * gets called when a key is pressed in the newUsername input, toggles the button
 */
function newUserInputKeyUp() {
    var regB = $("#registrationSubmitButton");
    var nUInpVal = $("#newUsernameInput").val();
    var nPWInVal = $("#newPasswordInput").val();
    var nPWIn2Val = $("#newPassword2Input").val();
    toggleButton(regB, [nUInpVal, nPWInVal, nPWIn2Val]);
}

/**
 * gets called when a key is pressed in the username / password input, toggles the button
 */
function userInputKeyUp() {
    var logInB = $("#loginButton");
    var uInpVal = $("#usernameInput").val();
    var pwInVal = $("#passwordInput").val();
    toggleButton(logInB, [uInpVal, pwInVal]);
}

/**
 * disables / enables a certain button on the recognition whether a value is bigger than zero or not
 * @param button    the button which should be enabled / disabled
 * @param values     the values which should be checked
 */
function toggleButton(button, values) {
    if (allStringsNotEmpty(values)) {
        button.prop('disabled', false);
    } else {
        button.prop('disabled', true);
    }
}

/**
 * this function evaluates if all Strings are longer than 0 (not mepty)
 * @param values         an array with values (preferably strings but not obligatory)
 * @returns {boolean}   returns true if all the strings in the value array are longer than 0
 */
function allStringsNotEmpty(values) {
    var i = 0;
    while (i < values.length && String(values[i]).length > 0) {
        i++;
    }
    return i === values.length;
}

/**
 *  sends an ajax call
 * @param url       the url where the request gets sent to
 * @param request   the data to send
 * @param type      type of the ajax e.g. GET or POST
 * @param context   the context of the call, say where to append error messages
 */
function sendAjaxCall(url, request, type, context) {
    $.ajax({
        url: "api/" + url,
        data: JSON.stringify(request),
        dataType: "json",
        type: type,
        success: function (answer) {
            if (answer.message !== undefined) {
                createAndAppendErrorMessage(context, answer.message);
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