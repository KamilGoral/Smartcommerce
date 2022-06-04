console.log("Script Loaded")
function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
      // call on next available tick
      setTimeout(fn, 1);
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }
  
  docReady(function() {
    // DOM is loaded and ready for manipulation here
 
    function setCookie(cName, cValue, expirationSec) {
      let date = new Date();
      date.setTime(date.getTime() + (expirationSec * 1000));
      const expires = "expires=" + date.toUTCString();
      document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
    }
  
  
    var formId = "#wf-form-Login-Form";
    var OrganizationclientId = '';
  
    var DomainName = window.location.hostname;
    var InvokeURL = '';
    if (DomainName == "sprytny01.webflow.io") {
      OrganizationclientId = "44h78imhmpapvejhouor1mgpbo";
      InvokeURL = "https://fpnu4fps0e.execute-api.us-east-1.amazonaws.com/v0/";
      console.log("Dev");
    } else if (DomainName == "sprytnykupiec.pl") {
      OrganizationclientId = '2b3p1rf1ph83pcig182vmln5lk';
      InvokeURL = "https://api.smartcommerce.net/v0/";
      console.log("Production");
    }
  
  
    makeWebflowFormAjax = function(forms, successCallback, errorCallback) {
      forms.each(function() {
        var form = $(this);
        form.on("submit", function(event) {
          var container = form.parent();
          var doneBlock = $("#wf-form-doneLogin-Form", container);
          var failBlock = $("#wf-form-failLogin-Form", container);
          var action = "https://hook.integromat.com/vjrtt8ltcfd1adrpmtidf9u08lptt8op"
          var method = form.attr("method");
  
          var data = {
            'login': $(formId + " #login").val(),
            'password': $(formId + " #password").val(),
            'OrganizationclientId': OrganizationclientId,
            'InvokeURL': InvokeURL
          };
          $.ajax({
            type: method,
            url: action,
            cors: true,
            beforeSend: function() {
              $('#waitingdots').show();
            },
            complete: function() {
              $('#waitingdots').hide();
            },
            contentType: 'application/json',
            dataType: 'json',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            data: JSON.stringify(data),
            success: function(resultData) {
              setCookie('sprytnycookie', "Bearer " + resultData.AuthenticationResult.AccessToken, resultData.AuthenticationResult.ExpiresIn);
              setCookie('sprytnyDomainName', DomainName, resultData.AuthenticationResult.ExpiresIn);
              setCookie('sprytnyOrganizationclientId', OrganizationclientId, resultData.AuthenticationResult.ExpiresIn);
              setCookie('sprytnyInvokeURL', resultData.InvokeURL, resultData.AuthenticationResult.ExpiresIn);
  
              if (typeof successCallback === 'function') {
                result = successCallback(resultData);
                if (!result) {
                  form.show();
                  doneBlock.hide();
                  failBlock.show();
                  return;
                }
              }
              window.location.replace("https://" + DomainName + "/app/users/me");
  
            },
            error: function(jqXHR, exception) {
              console.log(jqXHR);
              console.log(exception);
              var msg = '';
              if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
              } else if (jqXHR.status == 403) {
                msg = 'Użytkownik nie ma uprawnień do tworzenia organizacji.';
              } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
              } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
              } else if (exception === 'timeout') {
                msg = 'Time out error.';
              } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
              } else {
                msg = '' + jqXHR.responseText;
              }
              const message = document.getElementById("errormessage");
              message.textContent = msg;
              form.show();
              doneBlock.hide();
              failBlock.show();
              return;
  
            },
          });
          // prevent default webflow action
          event.preventDefault();
          return false;
        });
      });
    }
    makeWebflowFormAjax($(formId));
  
  });
  