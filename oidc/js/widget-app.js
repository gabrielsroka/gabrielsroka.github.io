requirejs.config({
    'baseUrl': 'js',
    'paths': {
      'jquery': "jquery-2.1.4.min",
      'okta-widget': 'https://example.oktapreview.com/js/sdk/okta-signin-widget/1.3.3/js/okta-sign-in-1.3.3.min',
      'okta-config': 'config'
    }
});

define(['jquery', 'okta-widget', 'okta-config'], function($, OktaSignIn, OktaConfig) {

  // Set initial config options for widget
  var oktaSignIn = new OktaSignIn({
    baseUrl: OktaConfig.orgUrl,
    clientId: OktaConfig.clientId,
    logo: '/images/acme_logo.png',

    features: {
      securityImage: false,
      rememberMe: true,
      smsRecovery: true,
      selfServiceUnlock: true,
      multiOptionalFactorEnroll: true
    },

    helpLinks: {
      help: 'http://example.com/custom/help/page',

      // Override default recovery flows with custom links
      // forgotPassword: 'http://example.com/custom/forgot/pass/page',
      // unlock: 'http://example.com/custom/unlock/page',

      // Add additional links to widget
      custom: [
        { text: 'custom link text 1', href: 'http://example.com/custom/link1' },
        { text: 'custom link text 2', href: 'http://example.com/custom/link2' }
      ]
    },

    // See dictionary of labels
    labels: {
      "primaryauth.title": "Acme Partner Login",
      "primaryauth.username": "Partner ID",
      "primaryauth.username.tooltip": "Enter your @example.com username",
      "primaryauth.password": "Password",
      "primaryauth.password.tooltip": "Super secret password"
    },

    // Add Social IdPs (FACEBOOK, GOOGLE, or LINKEDIN)
    idps: [
      {
        type: 'FACEBOOK',
        id: OktaConfig.idp
      }
    ],

    authParams: {
      scope: OktaConfig.scope
    }
  });

  var resetDisplay = function() {
    $('#claims').hide();
    $('#actions').hide();
    $('#api-resources').hide();
    $('#error').hide();
  };

  var displayError = function(msg) {
    $('#error').html('<p>'+ msg + '</p>');
    $('#error').show();
  };

  var displayClaims = function(claims) {
    $('#claims code').html(JSON.stringify(claims, null, '  '));
    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });
    $('#claims').show();
  };

  var displayActions = function(addSignInWidget) {
    var actions = [];
    if (addSignInWidget) {
      actions.push('<button id="btn-sign-in" type="button" class="btn">Sign-in with Account</button>');
    }
    actions.push('<button id="btn-sign-out" type="button" class="btn">Sign out</button>');
    actions.push('<button id="btn-refresh" type="button" class="btn">Refresh Token</button>');

    $('#actions').html(actions.join()).show();
  }

  var displayApiResources = function(idToken) {
    $('#error').hide();
    $.ajax({
        url : '/protected',
        headers: {
          Authorization: 'Bearer ' + idToken
        },
        processData : false,
    }).done(function(b64data){
      $('#api-resources')
        .html('<img src="data:image/png;base64,' + b64data + '">')
        .show();
    }).fail(function(jqXHR, textStatus) {
      var msg = 'Unable to fetch protected resource';
      msg += '<br>' + jqXHR.status + ' ' + jqXHR.responseText;
      if (jqXHR.status === 401) {
        msg += '<br>Your token may be expired'
      }
      displayError(msg);
    });
  };

  var renderWidget = function() {
    oktaSignIn.renderEl({
      el: '#widget',
    },
    // Success function - called at terminal states like authStatus SUCCESS or
    // when the recovery emails are sent (forgot password and unlock)
    function (res) {
      if (res.status === 'SUCCESS') {
        console.log('User %s succesfully authenticated %o', res.claims.email, res);
        $('#widget').hide();
        $('#error').hide();
        displayClaims(res.claims);
        displayActions(false);
        displayApiResources(res.idToken);
      }
      else if (res.status === 'FORGOT_PASSWORD_EMAIL_SENT') {
        // res.username - value user entered in the forgot password form
        console.log('User %s sent recovery code via email to reset password', res.username);
      }
      else if (res.status === 'UNLOCK_ACCOUNT_EMAIL_SENT') {
        // res.username - value user entered in the unlock account form
        console.log('User %s sent recovery code via email to unlock account', res.username);
      }
    },
    // Error function - called when the widget experiences an unrecoverable error
    function (err) {
      // err is an Error object (ConfigError, UnsupportedBrowserError, etc)
      displayError('Unexpected error authenticating user: ', + err);
    });
  }

  $('body').on('click', '#btn-refresh', function() {
    oktaSignIn.idToken.refresh(
      localStorage.getItem('id_token'),
      function(res) {
        console.log('id_token: %s', res.idToken);
        displayClaims(res.claims);
        localStorage.setItem('id_token', res.idToken);
      }, {
        scope: OktaConfig.scope
      }
    );
  });

  $('body').on('click', '#btn-sign-in', function() {
    resetDisplay();
    renderWidget();
  });

  $('body').on('click', '#btn-sign-out', function() {
    oktaSignIn.session.close();
    localStorage.setItem('id_token', null);
    window.location.reload();
    //resetDisplay();
    //$('#widget').show();
  });

  oktaSignIn.session.get(function(session) {
    console.log(session);
    if (session.status === 'ACTIVE') {
      displayClaims(session);
      displayActions(true);
    } else {
      console.log('user does not have an active session @%s', OktaConfig.orgUrl);
      renderWidget();
    }
  });
});
