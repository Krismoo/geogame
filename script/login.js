/**
 * Created by Nicolas on 09.06.2016.
 */
var currentToken;

/**
 * This variable defines all the functions for the loginscreen
 */
var login = {
    /**
     * This function creates the login screen and appends it to main
     */
    createAndAppendLoginView: function () {
        $.get("pageContent/loginScreen.html", function (loginScreen) {
            $("main").append(loginScreen);
        });
    },

    /**
     * This function creates and appends the Popup to create a new user
     */
    createAndAppendRegistrationPopup: function () {
        $.get("pageContent/registrationModal.html", function (registerForm) {
            $("main").append(registerForm);
        });
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
     * This function sends a POST with ajax to create a user
     */
    createUser: function (username, password) {
        removeErrorMessages();
        var request = {
            name: username,
            password: password
        };
        sendAjaxCallL("register", request, "POST", $("section.modal-content"));
    },

    /**
     *  This function logs the user in
     * @param username  dito
     * @param password  dito
     */
    loginCheck: function (username, password) {
        removeErrorMessages();
        var request = {
            name: username,
            password: password
        };
        sendAjaxCallL("login", request, "POST", $("main"));
    }
};
