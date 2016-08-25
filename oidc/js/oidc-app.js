requirejs.config({
    "baseUrl": "js",
    "paths": {
      "jquery": "jquery-2.1.4.min",
      "okta-auth-sdk": "OktaAuth.min",
      "okta-config": "config"
    }
});

define(["jquery", "okta-auth-sdk", "okta-config"], function($, OktaAuth, OktaConfig) {

  console.log('Okta Configuration: %o', OktaConfig);
  console.log(OktaAuth);
  var client = new OktaAuth({
    url: OktaConfig.orgUrl,
    clientId: OktaConfig.clientId,
    redirectUri: window.location.href
  });

  var resetDisplay = function() {
    $('div.error').remove();
    $('#claims').empty();
    $('#api-resources').empty();
  };

  var displayClaims = function(claims) {
    $('#claims').append('<pre><code class="json">' +
      JSON.stringify(claims, null, '  ') + '</code></pre>');
    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });
  };

  var displayError = function(msg) {
    $('div.error').remove();
    $('div.login-box').append('<div class="error"><p>'+ msg + '</p></div>');
  }

  $(document).ready(function() {
    $('#btn-sign-in').click(function() {
      resetDisplay();
      client.signIn({
        username: $('#username').val(),
        password: $('#password').val()
      }).then(function(tx) {
        switch(tx.status) {
          case 'SUCCESS':
            client.idToken.authorize({
              scope: OktaConfig.scope,
              sessionToken: tx.sessionToken
            })
              .then(function(res) {
                console.log('id_token: %s', res.idToken);
                displayClaims(res.claims);
                localStorage.setItem('id_token', res.idToken);
              })
              .fail(function(err) {
                console.log(err);
                displayError(err.message);
              })
            break;
          default:
            throw 'We cannot handle the ' + tx.status + ' status';
        }

      }).fail(function(err) {
        console.log(err);
        var message = err.errorCauses.length > 0 ? err.errorCauses[0].errorSummary : err.message;
        displayError(message);
      });
    });

    $('#btn-idp').click(function() {
      resetDisplay();
      client.idToken.authorize({
        scope: OktaConfig.scope,
        prompt: 'login',
        idp: OktaConfig.idp
      })
        .then(function(res) {
          console.log('id_token: %s', res.idToken);
          displayClaims(res.claims);
          localStorage.setItem('id_token', res.idToken);
        })
        .fail(function(err) {
          console.log(err);
          displayError(err.message);
        })
    });

    $('#btn-refresh').click(function() {
      resetDisplay();
      var idToken = localStorage.getItem('id_token');
      if (!idToken) {
        return displayError('You must first sign-in before you can refresh a token!');
      }
      client.idToken.refresh({
        scope: OktaConfig.scope
      })
        .then(function(res) {
          console.log('id_token: %s', res.dToken);
          displayClaims(res.claims);
          localStorage.setItem('id_token', res.idToken);
        })
        .fail(function(err) {
          console.log(err);
          displayError(err.message);
          localStorage.setItem('id_token', null);
        })
    });


    $('#btn-api-request').click(function() {
      resetDisplay();
      var idToken = localStorage.getItem('id_token');
      if (!idToken) {
        return displayError('You must first sign-in before you can refresh a token!');
      }
      $.ajax({
          url : '/protected',
          headers: {
            Authorization: 'Bearer ' + idToken
          },
          processData : false,
      }).done(function(b64data){
        $('#api-resources').append('<img src="data:image/png;base64,' + b64data + '">');
      }).fail(function(jqXHR, textStatus) {
        var msg = 'Unable to fetch protected resource';
        msg += '<br>' + jqXHR.status + ' ' + jqXHR.responseText;
        if (jqXHR.status === 401) {
          msg += '<br>Your token may be expired'
        }
        displayError(msg);
      });
    });
  });
});
