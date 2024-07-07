console.log("Script Loaded");
function docReady(fn) {
  // see if DOM is already available
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

docReady(function () {
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }
  // DOM is loaded and ready for manipulation here

  function setCookie(cName, cValue, expirationSec) {
    let date = new Date();
    date.setTime(date.getTime() + expirationSec * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  function getCookieNameByValue(searchValue) {
    // Get all cookies as a single string and split it into individual cookies
    const cookies = document.cookie.split("; ");

    // Iterate through each cookie string
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const [name, value] = cookie.split("="); // Split each cookie into name and value

      // Decode the cookie value and compare it to the searchValue
      if (decodeURIComponent(value) === searchValue) {
        return name; // Return the cookie name if the values match
      }
    }

    return null; // Return null if no matching value is found
  }

  var formId = "#wf-form-Login-Form";
  var OrganizationclientId = "";

  var DomainName = window.location.hostname;
  var InvokeURL = "";
  if (DomainName == "sprytny01.webflow.io") {
    OrganizationclientId = "44h78imhmpapvejhouor1mgpbo";
    InvokeURL = "https://fpnu4fps0e.execute-api.us-east-1.amazonaws.com/v0/";
    console.log("Dev");
  } else if (DomainName == "sprytnykupiec.pl") {
    OrganizationclientId = "2b3p1rf1ph83pcig182vmln5lk";
    InvokeURL = "https://api.smartcommerce.net/v0/";
    console.log("Production");
  }

  makeWebflowFormAjax = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#wf-form-doneLogin-Form", container);
        var failBlock = $("#wf-form-failLogin-Form", container);
        var action =
          "https://hook.eu1.make.com/btal1sfexvsxkqry9eplik26sc4xxidu";
        var method = form.attr("method");

        var data = {
          login: $(formId + " #login").val(),
          password: $(formId + " #password").val(),
          OrganizationclientId: OrganizationclientId,
          InvokeURL: InvokeURL,
        };
        $.ajax({
          type: method,
          url: action,
          cors: true,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            $("#waitingdots").hide();
          },
          contentType: "application/json",
          dataType: "json",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          data: JSON.stringify(data),
          success: function (resultData) {
            console.log(resultData);
            // Iterate over the array of results and set cookies
            resultData.forEach(function (authResult) {
              console.log(authResult);
              if (authResult.AuthenticationResult) {
                var clientId = authResult.clientId;
                var accessToken = authResult.AuthenticationResult.AccessToken;
                var expiresIn = authResult.AuthenticationResult.ExpiresIn;
                if (!accessToken) {
                  console.error(
                    "AccessToken is missing for clientId:",
                    clientId
                  );
                  return;
                }
                setCookie(clientId, "Bearer " + accessToken, expiresIn);
              } else {
                setCookie(
                  "sprytnycookie",
                  "Bearer " + authResult.AccessToken,
                  authResult.ExpiresIn
                );
                setCookie(
                  "sprytnyDomainName",
                  DomainName,
                  authResult.ExpiresIn
                );
                setCookie(
                  "sprytnyOrganizationclientId",
                  OrganizationclientId,
                  authResult.ExpiresIn
                );
                setCookie("sprytnyInvokeURL", InvokeURL, authResult.ExpiresIn);
              }
            });

            if (typeof successCallback === "function") {
              var result = successCallback(resultData);
              if (!result) {
                form.show();
                doneBlock.hide();
                failBlock.show();
                return;
              }
            }
            window.location.replace("https://" + DomainName + "/app/users/me");
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";
            if (jqXHR.status === 0) {
              msg = "Not connect.\n Verify Network.";
            } else if (jqXHR.status == 403) {
              msg = "Użytkownik nie ma uprawnień do tworzenia organizacji.";
            } else if (jqXHR.status == 500) {
              msg = "Internal Server Error [500].";
            } else if (exception === "parsererror") {
              msg = "Requested JSON parse failed.";
            } else if (exception === "timeout") {
              msg = "Time out error.";
            } else if (exception === "abort") {
              msg = "Ajax request aborted.";
            } else {
              msg = "" + jqXHR.responseText;
            }
            const message = document.getElementById("errormessage");
            message.textContent = "Nieprawidłowy login lub hasło";
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
  };
  makeWebflowFormAjax($(formId));
});
