var firstName = document.getElementById("firstName");
var lastName = document.getElementById("lastName");
var login = document.getElementById("login");
var email = document.getElementById("email");
var password = document.getElementById("password");
var password2 = document.getElementById("password2");

var firstNameError = document.getElementById("firstNameError");
var lastNameError = document.getElementById("lastNameError");
var loginError = document.getElementById("loginError");
var emailError = document.getElementById("emailError");
var passwordError = document.getElementById("passwordError");
var results = document.getElementById("results");

firstName.select();

document.forms[0].onsubmit = function () {
    if (validate()) {
        var user = {
            profile: {firstName: firstName.value, lastName: lastName.value, login: login.value, email: email.value},
            credentials: {password: {value: password.value}}
        };
        newUser(showResponse, user);
    }
    return false; // Cancel form.submit.
};

function validate() {
    var valid = true;
    firstNameError.innerHTML = "";
    lastNameError.innerHTML = "";
    loginError.innerHTML = "";
    emailError.innerHTML = "";
    passwordError.innerHTML = "";
    
    var emailRe = /.+@.+\..+/;
    if (!firstName.value) {
        firstNameError.innerHTML = "First name cannot be left blank";
        valid = false;
    }
    if (!lastName.value) {
        lastNameError.innerHTML = "Last name cannot be left blank";
        valid = false;
    }
    if (!login.value.match(emailRe)) {
        loginError.innerHTML = "Username must be in the form of an email address (e.g. bob@nowhere.com)";
        valid = false;
    }
    if (!email.value.match(emailRe)) {
        emailError.innerHTML = "Email must be in the form of an email address (e.g. bob@nowhere.com)";
        valid = false;
    }
    if (password.value != password2.value) {
        passwordError.innerHTML = "Passwords don't match";
        valid = false;
    }
    return valid;
}

function showResponse() {
    var OK = 200;
    if (this.status == OK) {
        results.innerHTML = "OK";
    } else {
        var causes = JSON.parse(this.responseText).errorCauses;
        results.innerHTML = "";
        for (var c = 0; c < causes.length; c++) {
            var summary = causes[c].errorSummary;
            if (summary.match(/(firstName|lastName|login|email):/)) {
                var parts = summary.split(":");
                document.getElementById(parts[0] + "Error").innerHTML += parts[1];
            } else if (summary.match(/password/i)) {
                passwordError.innerHTML += summary;
            } else {
                results.innerHTML += summary;
            }
        }
    }
}
