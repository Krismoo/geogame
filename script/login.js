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

        window.onclick = function (event) {
            if (event.target == $("#createUserModal")) {
                $("#createUserModal").hide();
            }
        };

        body.on('click', '#registrationSubmitButton', function (event) {
            event.preventDefault();
            login.createUser($("#newUsernameInput").val(), $("#newPasswordInput").val(), $("#newPassword2Input").val());
        });

        //TODO wird erst gefeuert, wenn man irgendwo hinklickt
        body.on('change', '#newUsernameInput', function () {
            console.log("log: " + $("#newUsernameInput").val());
            toggleButton($("#registrationSubmitButton"), $("#newUsernameInput").val(),1);
        });

        body.on('change', '#usernameInput', function () {
            console.log("log: " + $("#usernameInput").val());
            toggleButton($("#loginButton"), $("#usernameInput").val(), $("#passwordInput").val());
        });

        body.on('change', '#passwordInput', function () {
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
    },

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

        var request = new Array(2);
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
};