// Form field validators.

function validateText(id, msg) {
    /// <summary>Validate a text box.</summary>
    /// <param name="id" type="String">Text box id.</param>
    /// <param name="msg" type="String">Error message if text box doesn't validate.</param>
    /// <returns type="Boolean">true if valid, false if invalid.</returns>

    var ctl = document.getElementById(id);
    if (ctl.value == "") {
        return invalidControl(msg, ctl);
    }
    return true;
}

function validateRegExp(re, id, msg) {
    /// <summary>Validate a text box using a regular expression.</summary>
    /// <param name="re" type="RegExp">Regular expression.</param>
    /// <param name="id" type="String">Text box id.</param>
    /// <param name="msg" type="String">Error message if text box doesn't validate.</param>
    /// <returns type="Boolean">true if valid, false if invalid.</returns>

    var ctl = document.getElementById(id);
    if (!re.test(ctl.value)) {
        return invalidControl(msg, ctl);
    }
    return true;
}

function validateEmail(id, msg) {
    /// <summary>Validate an email text box.</summary>
    /// <param name="id" type="String">Text box id.</param>
    /// <param name="msg" type="String">Error message if text box doesn't validate.</param>
    /// <returns type="Boolean">true if valid, false if invalid.</returns>

    var validEmail = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/; // .NET email validator. \w = [a-zA-Z0-9_]
    // var validEmail = /[^ ]+@[^ ]+\.[^ ]+/; // old version
    return validateRegExp(validEmail, id, msg);
}

function validateRadio(ids, msg) {
    /// <summary>Validate an array of radio buttons.</summary>
    /// <param name="ids" type="String[]">Array of radio button ids</param>
    /// <param name="msg" type="String">Error message if text box doesn't validate.</param>
    /// <returns type="Boolean">true if valid, false if invalid.</returns>

    var ctl;
    for (var i = ids.length - 1; i >= 0; i--) { // Go backwards so ctl == ids[0] if no ctls are checked.
        ctl = document.getElementById(ids[i]);
        if (ctl.checked) {
            return true;
        }
    }
    return invalidControl(msg, ctl);
}

function invalidControl(msg, ctl) {
    /// <summary>Show error message for invalid control.</summary>
    /// <param name="msg" type="String">Error message for invalid control</param>
    /// <param name="ctl" type="DomElement">Invalid control</param>
    /// <returns type="Boolean">false</returns>

    alert(msg);
    ctl.focus();
    return false;
}

