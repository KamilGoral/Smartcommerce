console.log("Script Loaded v3");

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

  var InvokeURL = getCookie("sprytnyInvokeURL");
  var smartToken = getCookie("sprytnycookie");
  var DomainName = getCookie("sprytnyDomainName");
  var formId = "#wf-form-Create-Organization-Form";
  var smartToken = getCookie("sprytnycookie");
  var accessToken = smartToken.split("Bearer ")[1];
  var emailElement = document.getElementById("useremail");
  var formIdChangePassword = "#wf-form-Form-Change-Password";

  function setCookieAndSession(cName, cValue, expirationSec) {
    let date = new Date();
    date.setTime(date.getTime() + expirationSec * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
  }

  makeWebflowFormAjax = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $(".w-form-done", container);
        var failBlock = $(".w-form-fail", container);
        var action = InvokeURL + "tenants";
        var method = form.attr("method");
        var data = {
          name: $(formId + " #newOrgName").val(),
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
            Authorization: smartToken,
          },
          data: JSON.stringify(data),
          success: function (resultData) {
            console.log(resultData);

            if (typeof successCallback === "function") {
              // call custom callback
              result = successCallback(resultData);
              if (!result) {
                // show error (fail) block
                form.show();
                doneBlock.hide();
                failBlock.show();
                return;
              }
            }

            form.hide();
            doneBlock.show();
            failBlock.hide();
            window.location.replace("https://" + DomainName + "/app/users/me");
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";
            if (jqXHR.status === 0) {
              msg = "Not connect.\n Verify Network.";
            } else if (jqXHR.status == 404) {
              msg = "Requested page not found. [404]";
            } else if (jqXHR.status == 403) {
              msg =
                "Dostęp zablokowany - skontaktujemy się z Państwem do 24 godzin, Zespół Sprytnykupiec.pl";

              // Jeśli wystąpił błąd 403, przygotuj dane do wysłania
              var emailElement = document.getElementById("useremail");
              var requestData = [
                {
                  org_nip: "",
                  phonenumber: "",
                  admin_email: emailElement ? emailElement.textContent : "",
                  Voivodeship: "tworzenie organizacji - brak uprawnien",
                  shop_no: "",
                  ehurt_no: "",
                },
              ];

              // Wyślij żądanie POST
              $.ajax({
                type: "POST",
                url: "https://hook.eu1.make.com/67j7dm1drdz5yi6fl71pw9tigwuoxihe",
                data: JSON.stringify(requestData),
                contentType: "application/json",
                dataType: "json",
                success: function (response) {
                  // Obsłuż odpowiedź z endpointu
                  console.log("Wysłano dane na endpoint.");
                },
                error: function (error) {
                  console.log("Błąd podczas wysyłania danych na endpoint.");
                },
              });
            } else if (jqXHR.status == 500) {
              msg = "Internal Server Error [500].";
            } else if (exception === "parsererror") {
              msg = "Requested JSON parse failed.";
            } else if (exception === "timeout") {
              msg = "Time out error.";
            } else if (exception === "abort") {
              msg = "Ajax request aborted.";
            } else {
              msg =
                "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
            }
            $(".warningmessagetext").text(msg);
            form.show();
            doneBlock.hide();
            failBlock.show();
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  function MessageBox(text) {
    const messageBox = document.querySelector("#WarningMessageMain");
    messageBox.innerText = text;
    messageBox.setAttribute(
      "onclick",
      "location='https://sprytnykupiec.pl/login-page'"
    );
    messageBox.setAttribute("style", "cursor:pointer;");
    $("#WarningMessageContainer").show();
  }

  function StringToColour(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = "#";
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xff;
      colour += ("00" + value.toString(16)).substr(-2);
    }
    return colour;
  }

  function decisionInviation(but) {
    console.log(but);
    const actionUrl = but.getAttribute("action");
    const decision = but.getAttribute("decision");
    var isTrueSet = decision === "accept";
    var data = [
      {
        op: "replace",
        path: "/accepted",
        value: isTrueSet,
      },
    ];

    $.ajax({
      type: "PATCH",
      url: actionUrl,
      beforeSend: function () {
        $("#waitingdots").show();
      },
      complete: function () {
        $("#waitingdots").hide();
      },
      data: JSON.stringify(data),
      contentType: "application/json;charset=UTF-8",
      headers: {
        Authorization: smartToken,
      },
      success: function () {
        window.location.reload();
      },
      error: function (jqXHR, exception) {
        if (jqXHR.status === 401) {
          MessageBox("Twoja sesja wygasła. Zaloguj się ponownie");
        }
      },
    });
  }

  function getInvitations() {
    let url = new URL(InvokeURL + "users/me/invitations");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", smartToken);

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        const orgContainer = document.getElementById("Organization-Container");
        const style = document.getElementById("samplerowInvitation");

        var data = JSON.parse(this.response);
        var toParse = data.items;

        toParse.forEach((invitation) => {
          const row = style.cloneNode(true);
          row.style.display = "flex";
          const tenantName = row.querySelector("H6");
          tenantName.textContent = invitation.tenantName;

          function setupButton(button, action) {
            button.setAttribute(
              "action",
              InvokeURL + "users/me/invitations/" + invitation.id
            );
            button.setAttribute("decision", action);
            button.onclick = function () {
              decisionInviation(button);
            };
          }

          setupButton(row.querySelector("a:nth-child(2)"), "reject");
          setupButton(row.querySelector("a:nth-child(1)"), "accept");

          orgContainer.appendChild(row);
        });

        if (data.total > 0) {
          const emptystateorganization = document.getElementById(
            "emptystateorganization"
          );
          emptystateorganization.style.display = "none";
        } else {
          console.log("Brak zaproszeń");
        }
      } else if (request.status == 401) {
        MessageBox("Twoja sesja wygasła. Zaloguj się ponownie");
      } else {
        console.log(
          "Wystąpił błąd podczas komunikacji z serwerem. Kod błędu: " +
            request.status +
            " " +
            data.message
        );
        MessageBox(data.message);
      }
    };

    request.onerror = function () {
      console.log("Wystąpił błąd podczas wysyłania żądania.");
    };
    request.send();
  }

  function LoginIntoOrganization(evt) {
    evt.preventDefault();
    var OrganizationName = this.getAttribute("organizationname");
    var OrganizationclientId = this.getAttribute("organizationclientid");
    var data = {
      smartToken: smartToken,
      OrganizationclientId: OrganizationclientId,
      OrganizationName: OrganizationName,
    };
    $.ajax({
      type: "POST",
      url: "https://hook.integromat.com/3k5pcq058xulm1gafamujedv9hwx6qn8",
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
        setCookieAndSession(
          "sprytnyToken",
          "Bearer " + resultData.AccessToken,
          resultData.ExpiresIn
        );
        sessionStorage.clear();
        sessionStorage.setItem("OrganizationclientId", OrganizationclientId);
        sessionStorage.setItem("OrganizationName", OrganizationName);
        if (typeof successCallback === "function") {
          result = successCallback(resultData);
          if (!result) {
            return;
          }
        }
        window.location.replace(
          "https://" +
            DomainName +
            "/app/tenants/organization" +
            "?name=" +
            OrganizationName +
            "&clientId=" +
            OrganizationclientId
        );
      },
      error: function (jqXHR, exception) {
        console.log(jqXHR);
        console.log(exception);
        return;
      },
    });
    event.preventDefault();
    return false;
  }

  function getOrganizations() {
    const url = `${InvokeURL}users/me/tenants`;
  
    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': smartToken
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      const { items: toParse, total } = data;
  
      if (total >= 4) {
        $("img[id^='startingImage']").hide();
      }
  
      if (total > 0) {
        const orgContainer = document.getElementById("Organization-Container");
        toParse.forEach(organization => {
          const template = document.getElementById("samplerow");
          const row = template.cloneNode(true);
          row.removeAttribute('id'); // Remove the samplerow id to avoid duplicate ids
          // Update organization specific attributes
          row.querySelector("#tenantName").textContent = organization.name;
          row.querySelector("#tenantTaxId").textContent = organization.clientId; // Assuming clientId is the tax ID for demonstration
          row.querySelector("#tenantStatus").textContent = "Aktywny"; // Example status, adjust as necessary
  
          // Setting organization attributes for row
          row.setAttribute("OrganizationName", organization.name);
          row.setAttribute("OrganizationclientId", organization.clientId);
          row.style.display = "flex";
    
          // Append row to the container
          orgContainer.appendChild(row);
  
          // Adding click listener for each row
          row.addEventListener("click", () => LoginIntoOrganization(organization.clientId), false);
        });
      } else if (total === 0) {
        document.getElementById("emptystateorganization").style.display = "none";
      }
    })
    .catch(error => {
      console.error("Failed to fetch organizations:", error.message);
      MessageBox(error.message);
    });
  }
  

  makeWebflowFormAjaxCreate = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#wf-form-Form-Change-Password-done", container);
        var failBlock = $("#wf-form-Form-Change-Password-fail", container);
        var action =
          "https://hook.integromat.com/49ulcdq4vjorv11dbsq316xvpjjpa6ye";
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
            console.log(resultData);
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                doneBlock.hide();
                failBlock.show();
                console.log(e);
                return;
              }
            }
            form.hide();
            doneBlock.show();
            failBlock.hide();
            window.setTimeout(function () {
              location.reload();
            }, 1000);
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            doneBlock.hide();
            failBlock.show();
            console.log(e);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  function getUser() {
    var datatosend = {
      AccessToken: accessToken,
    };
    let url = "https://cognito-idp.us-east-1.amazonaws.com/";
    let request = new XMLHttpRequest();
    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/x-amz-json-1.1");
    request.setRequestHeader(
      "x-amz-target",
      "AWSCognitoIdentityProviderService.GetUser"
    );
    request.onload = function () {
      var UserInfo = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        const userid = document.getElementById("userid");
        userid.textContent = UserInfo.Username;
        const username = document.getElementById("username");
        username.textContent = UserInfo.UserAttributes[2].Value;
        const userfamilyname = document.getElementById("userfamilyname");
        userfamilyname.textContent = UserInfo.UserAttributes[3].Value;
        var useremail = document.getElementById("useremail");
        useremail.textContent = UserInfo.UserAttributes[4].Value;
        const welcomeMessage = document.getElementById("WelcomeMessage");
        welcomeMessage.textContent =
          "Witaj, " +
          UserInfo.UserAttributes[2].Value +
          " " +
          UserInfo.UserAttributes[3].Value +
          "!";

        function setCookieAndSession(cName, cValue, expirationSec) {
          let date = new Date();
          date.setTime(date.getTime() + expirationSec * 1000);
          const expires = "expires=" + date.toUTCString();
          document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
        }
        setCookieAndSession(
          "sprytnyUser",
          UserInfo.UserAttributes[4].Value,
          72000
        );
        setCookieAndSession("sprytnyUsername", UserInfo.Username, 72000);
      } else if (request.status === 401) {
        console.log("Błąd autoryzacji - Nie masz uprawnień do dostępu.");
      } else {
        console.log(
          "Wystąpił błąd podczas komunikacji z serwerem. Kod błędu: " +
            request.status +
            " " +
            UserInfo.message
        );
        MessageBox(UserInfo.message);
      }
    };

    request.onerror = function () {
      console.log("Wystąpił błąd podczas wysyłania żądania.");
    };

    request.send(JSON.stringify(datatosend));
  }

  function LoadTippy() {
    $.getScript(
      "https://unpkg.com/popper.js@1",
      function (data, textStatus, jqxhr) {
        $.getScript(
          "https://unpkg.com/tippy.js@4",
          function (data, textStatus, jqxhr) {
            tippy(".tippy", {
              // Add the class tippy to your element
              theme: "light", // Dark or Light
              animation: "scale", // Options, shift-away, shift-toward, scale, persepctive
              duration: 250, // Duration of the Animation
              arrow: true, // Add arrow to the tooltip
              arrowType: "round", // Sharp, round or empty for none
              delay: [0, 50], // Trigger delay in & out
              maxWidth: 240, // Optional, max width settings
            });
          }
        );
      }
    );
  }

  makeWebflowFormAjaxCreate($(formIdChangePassword));
  makeWebflowFormAjax($(formId));
  getInvitations();
  getOrganizations();
  getUser();
  LoadTippy();
});
