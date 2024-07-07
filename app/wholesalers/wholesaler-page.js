console.log("Script Loaded v3");
function docReady(fn) {
  // see if DOM is already available
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // call on next available tick1
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

docReady(function () {
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
      return decodeURIComponent(parts.pop().split(";").shift());
  }
  // DOM is loaded and ready for manipulation here
  const displayMessage = (type, message) => {
    $("#Message-Container").show().delay(5000).fadeOut("slow");
    if (message) {
      $(`#${type}-Message-Text`).text(message);
    }
    $(`#${type}-Message`).show().delay(5000).fadeOut("slow");
  };

  var ecEnabledValue = getCookie("EcEnabled");
  if (ecEnabledValue === "true") {
    $("#alertMessage").show();
  }
  function setCookie(cName, cValue, expirationSec) {
    let date = new Date();
    date.setTime(date.getTime() + expirationSec * 1000);
    const expires = "expires=" + date.toUTCString();
    const encodedValue = encodeURIComponent(cValue);
    document.cookie = `${cName}=${encodedValue}; ${expires}; path=/`;
  }

  function parseAttributes(cookieValue) {
    const decodedValue = decodeURIComponent(cookieValue);
    const attributes = decodedValue.split("|");
    const result = {};
    attributes.forEach((attribute) => {
      const [key, value] = attribute.split(":");
      result[key.trim()] = value.trim();
    });
    return result;
  }

  var smartToken = getCookie("sprytnycookie");
  var accessToken = smartToken.split("Bearer ")[1];
  const attributes = parseAttributes(getCookie("SpytnyUserAttributes"));
  const username = document.getElementById("firstNameUser");
  username.value = attributes["username"];
  const userfamilyname = document.getElementById("lastNameUser");
  userfamilyname.value = attributes["familyname"];
  const emailElement = document.getElementById("useremail");
  const emailadress = document.getElementById("emailadressUser");
  emailElement.textContent = attributes["email"];
  emailadress.value = attributes["email"];

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

  var Webflow = Webflow || [];
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var orgToken = getCookie("sprytnyToken");
  var DomainName = getCookie("sprytnyDomainName");
  var userKey = getCookie("sprytnyUsername") || "me";
  const orgName = document.getElementById("orgName");
  emailElement.textContent = getCookie("sprytnyUser");
  var ClientID = getCookieNameByValue(orgToken);
  var OrganizationName = getCookie("OrganizationName");
  var formIdNewServer = "#wf-form-Create-server";
  var formIdDeleteServer = "#wf-form-Delete-server";
  var formIdResetPassword = "#wf-form-Reset-password";

  const OrganizationBread0 = document.getElementById("OrganizationBread0");
  OrganizationBread0.textContent = OrganizationName;
  OrganizationBread0.setAttribute(
    "href",
    "https://" +
      DomainName +
      "/app/tenants/organization?name=" +
      OrganizationName +
      "&clientId=" +
      ClientID
  );

  const WholesalerIdBread = document.getElementById("WholesalerBread0");
  var wholesalerKey = new URL(document.location.href).searchParams.get(
    "wholesalerKey"
  );
  WholesalerIdBread.textContent = wholesalerKey;
  WholesalerIdBread.setAttribute("href", window.location.href);

  function getWholesaler() {
    var request = new XMLHttpRequest();
    let apiUrl = new URL(InvokeURL + "wholesalers/" + wholesalerKey);
    request.open("GET", apiUrl.toString(), true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        const wholesalerName = document.getElementById("WholesalerName");
        const whPlatformUrl = document.getElementById("whPlatformUrl");
        const whTaxId = document.getElementById("whTaxId");
        const whCountry = document.getElementById("whCountry");
        const whLine1 = document.getElementById("whLine1");
        const whLine2 = document.getElementById("whLine2");
        const whTown = document.getElementById("whTown");
        const whState = document.getElementById("whState");
        const whPostcode = document.getElementById("whPostcode");
        const whLogo = document.getElementById("whLogo");
        whLogo.src = "data:image/png;base64," + data.image;
        whLogo.style.objectFit = "contain";
        wholesalerName.textContent = data.company;

        if (data.platformUrl !== null) {
          whPlatformUrl.setAttribute("href", "" + data.platformUrl);
          $("#Iehurt").addClass("enabled");
        } else {
          $("#loginButton").hide();
        }
        //
        whTaxId.textContent = data.taxId;
        whCountry.textContent = data.address.country;
        whLine1.textContent = data.address.line1;
        whLine2.textContent = data.address.line2;
        whTown.textContent = data.address.town;
        whState.textContent = data.address.state;
        whPostcode.textContent = data.address.postcode;
      } else {
        console.log("error");
      }
    };
    request.send();
  }

  function getFTP() {
    var request = new XMLHttpRequest();
    let apiUrl = new URL(InvokeURL + "wholesalers/" + wholesalerKey + "/ftp");
    request.open("GET", apiUrl.toString(), true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        const ftpUsername = document.getElementById("ftpUsername");

        ftpUsername.textContent = data.credentials.username;
        $("#Iftp").addClass("enabled");
        $("#credentials").show();
        $("#informations").removeClass("hide");
        $("#deleteserver").show();
        $("#resetpassword").show();
      } else {
        console.log("error");
        $("#createserver").show();
        $("#informations").removeClass("hide");
      }
    };
    request.send();
  }

  makeWebflowFormAjaxServerWh = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#wf-form-Create-wholesaler-done", container);
        var failBlock = $("#wf-form-Create-wholesaler-fail", container);
        var action = InvokeURL + "/wholesalers/" + wholesalerKey + "/ftp";
        var method = "POST";

        var data = {
          username: $("#Wholesaler-Login").val(),
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
            Authorization: orgToken,
          },
          data: JSON.stringify(data),
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                doneBlock.hide();
                failBlock.show();
                return;
              }
            }
            form.hide();
            const credentialsbox = document.getElementById("credentialsbox");
            credentialsbox.innerHTML =
              "Login: " + resultData.credentials.username + "<br />";
            credentialsbox.innerHTML +=
              "Hasło: " + resultData.credentials.password + "<br />";

            const ftpUsername = document.getElementById("ftpUsername");
            ftpUsername.textContent = resultData.credentials.username;
            $("#Iftp").addClass("enabled");
            $("#credentials").show();
            $("#createserver").hide();

            doneBlock.show();
            failBlock.hide();
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";
            if (jqXHR.status === 0) {
              msg = "Not connect.\n Verify Network.";
            } else if (jqXHR.status === 403) {
              msg = "Oops! Coś poszło nie tak. Proszę spróbuj ponownie.";
            } else if (jqXHR.status === 500) {
              msg = "Internal Server Error [500].";
            } else if (exception === "parsererror") {
              msg = "Requested JSON parse failed.";
            } else if (exception === "timeout") {
              msg = "Time out error.";
            } else if (exception === "abort") {
              msg = "Ajax request aborted.";
            } else {
              msg = "" + jqXHR.responseJSON.message;
            }
            $(".warningmessagetext").text(msg);
            form.show();
            doneBlock.hide();
            failBlock.show();
            failBlock.fadeOut(5000);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxResetPassword = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#wf-form-Reset-password-done", container);
        var failBlock = $("#wf-form-Reset-password-fail", container);
        var action =
          InvokeURL + "/wholesalers/" + wholesalerKey + "/ftp/reset-password";
        var method = "GET";

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
            Authorization: orgToken,
          },
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                doneBlock.hide();
                failBlock.show();
                return;
              }
            }
            form.hide();
            $(".successmessagetext").text(
              "Gotowe! Hasło zostało zresetowane ! Nowe hasło to: " +
                resultData.credentials.password +
                ". Za moment strona zostanie odświeżona"
            );

            const ftpUsername = document.getElementById("ftpUsername");
            ftpUsername.textContent = resultData.credentials.username;
            $("#Iftp").addClass("enabled");
            $("#credentials").removeClass("hide");

            doneBlock.show();
            failBlock.hide();
            window.setTimeout(function () {
              location.reload();
            }, 10000);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";
            if (jqXHR.status === 0) {
              msg = "Not connect.\n Verify Network.";
            } else if (jqXHR.status === 403) {
              msg = "Oops! Coś poszło nie tak. Proszę spróbuj ponownie.";
            } else if (jqXHR.status === 500) {
              msg = "Internal Server Error [500].";
            } else if (exception === "parsererror") {
              msg = "Requested JSON parse failed.";
            } else if (exception === "timeout") {
              msg = "Time out error.";
            } else if (exception === "abort") {
              msg = "Ajax request aborted.";
            } else {
              msg = "" + jqXHR.responseJSON.message;
            }
            $(".warningmessagetext").text(msg);
            form.show();
            doneBlock.hide();
            failBlock.show();
            failBlock.fadeOut(5000);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxDeleteServerWh = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var action = InvokeURL + "/wholesalers/" + wholesalerKey + "/ftp";
        var method = "DELETE";

        var data = [];

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
          data: JSON.stringify(data),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: orgToken,
          },
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                displayMessage(
                  "Error",
                  "Oops. Coś poszło nie tak, spróbuj ponownie."
                );
                return;
              }
            }
            form.show();
            displayMessage(
              "Success",
              "Serwer FTP dla dostawcy został usunięty."
            );
            window.setTimeout(function () {
              location.reload();
            }, 2000);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";
            if (jqXHR.status === 0) {
              msg = "Not connect.\n Verify Network.";
            } else if (jqXHR.status === 403) {
              msg = "Oops! Coś poszło nie tak. Proszę spróbuj ponownie.";
            } else if (jqXHR.status === 500) {
              msg = "Internal Server Error [500].";
            } else if (exception === "parsererror") {
              msg = "Requested JSON parse failed.";
            } else if (exception === "timeout") {
              msg = "Time out error.";
            } else if (exception === "abort") {
              msg = "Ajax request aborted.";
            } else {
              msg = "" + jqXHR.responseJSON.message;
            }

            form.show();
            displayMessage("Error", msg);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  function LogoutNonUser() {
    if (
      getCookie("sprytnyInvokeURL") == null ||
      getCookie("sprytnycookie") == null ||
      getCookie("sprytnyToken") == null ||
      getCookie("sprytnyDomainName") == null
    ) {
      alert("Twoja sesja wygasła.");
      window.location.href = "https://sprytnykupiec.pl/login-page";
    }
  }
  getFTP();
  getWholesaler();

  postChangePassword = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action =
          "https://hook.eu1.make.com/2laahxeoqfuo7nmf2gh1yyuatq92jiai";
        var inputdata = form.serializeArray();

        var data = {
          "Current-Password": inputdata[0].value,
          "New-Password": inputdata[1].value,
          AccessToken: accessToken,
          "User-Email": $("#useremail").text(),
        };

        $.ajax({
          type: "POST",
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
          data: JSON.stringify(data),
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                displayMessage(
                  "Error",
                  "Oops. Coś poszło nie tak, spróbuj ponownie."
                );
                console.log(e);
                return;
              }
            }
            form.show();
            displayMessage("Success", "Twoje hasło zostało zmienione.");
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";
            if (jqXHR.status === 0) {
              msg = "Not connect.\n Verify Network.";
            } else if (jqXHR.status == 403) {
              msg = "Użytkownik nie ma uprawnień do tworzenia organizacji.";
            } else if (jqXHR.status == 400) {
              msg = "Twoje dotychczasowe hasło jest inne. Spróbuj ponownie.";
            } else if (jqXHR.status == 500) {
              msg = "Internal Server Error [500].";
            } else if (exception === "parsererror") {
              msg = "Requested JSON parse failed.";
            } else if (exception === "timeout") {
              msg = "Time out error.";
            } else if (exception === "abort") {
              msg = "Ajax request aborted.";
            } else {
              msg = "" + jqXHR.responseJSON.message;
            }
            form.show();
            displayMessage("Error", msg);
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  postEditUserProfile = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        const firstNameUser = $("#firstNameUser").val();
        const lastNameUser = $("#lastNameUser").val();
        const emailadressUser = $("#emailadressUser").val();

        const datatosend = {
          AccessToken: accessToken,
          UserAttributes: [
            {
              Name: "name",
              Value: firstNameUser,
            },
            {
              Name: "family_name",
              Value: lastNameUser,
            },
            // {
            //   Name: "email",
            //   Value: emailadressUser,
            // },
          ],
        };

        const url = "https://cognito-idp.us-east-1.amazonaws.com/";

        $.ajax({
          type: "POST",
          url: url,
          headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "x-amz-target":
              "AWSCognitoIdentityProviderService.UpdateUserAttributes",
            Authorization: smartToken,
          },
          cors: true,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            $("#waitingdots").hide();
          },
          data: JSON.stringify(datatosend),
          dataType: "json",
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                displayMessage(
                  "Error",
                  "Oops. Coś poszło nie tak, spróbuj ponownie."
                );
                console.log(e);
                return;
              }
            }
            form.show();
            setCookie(
              "SpytnyUserAttributes",
              "username:" +
                firstNameUser +
                "|familyname:" +
                lastNameUser +
                "|email:" +
                emailadressUser,
              720000
            );
            displayMessage("Success", "Twoje dane zostały zmienione");
            const welcomeMessage = document.getElementById("welcomeMessage");
            if (welcomeMessage) {
              welcomeMessage.textContent =
                "Witaj, " + firstNameUser + " " + lastNameUser + "!";
            } else {
              console.log(
                "Element 'welcomeMessage' nie został znaleziony. Pomijam ustawienie powitania."
              );
            }
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            displayMessage(
              "Error",
              "Oops. Coś poszło nie tak, spróbuj ponownie."
            );
            console.log(e);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));
  makeWebflowFormAjaxServerWh($(formIdNewServer));
  makeWebflowFormAjaxResetPassword($(formIdResetPassword));
  makeWebflowFormAjaxDeleteServerWh($(formIdDeleteServer));
  LogoutNonUser();
});
