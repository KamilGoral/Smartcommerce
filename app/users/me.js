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
  var ClientID = sessionStorage.getItem("OrganizationclientId");
  var useremail = document.getElementById("useremail").text;
  var formIdChangePassword = "#wf-form-Form-Change-Password";

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
                "Użytkownik nie znajduje się na liście osób uprawnnionych do tworzenia organizacji.";
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
            const message = document.getElementById("WarningMessage");
            message.textContent = msg;
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

  function MessageBox() {
    const messageBox = document.querySelector("#WarningMessageMain");
    messageBox.innerText = "Twoja sesja wygasła. Zaloguj się ponownie";
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

  function decisionInviation() {
    const actionUrl = this.getAttribute("action");
    const decision = this.getAttribute("decision");
    var isTrueSet = decision === "accept";
    let request = new XMLHttpRequest();
    var data = [
      {
        op: "replace",
        path: "/accepted",
        value: isTrueSet,
      },
    ];

    request.open("PATCH", actionUrl, true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.setRequestHeader("Authorization", smartToken);
    request.onload = function () {
      let data = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        window.location.reload();
      }
      if (request.status == 401) {
        MessageBox();
      }
    };
    request.send(JSON.stringify(data));
  }

  function getInvitations() {
    let url = new URL(InvokeURL + "users/me/invitations");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", smartToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;

      if (request.status >= 200 && request.status < 400) {
        const orgContainer = document.getElementById("Organization-Container");
        toParse.forEach((invitation) => {
          const style = document.getElementById("samplerowInvitation");
          const row = style.cloneNode(true);
          row.style.display = "flex";
          const tenantName = row.getElementsByTagName("H6")[0];
          tenantName.textContent = invitation.tenantName;

          const rejectButton = row.getElementsByTagName("a")[1];
          rejectButton.setAttribute(
            "action",
            InvokeURL + "users/me/invitations/" + invitation.id
          );
          rejectButton.setAttribute("decision", "reject");
          rejectButton.onclick = function () {
            console.log(rejectButton);
            decisionInviation(rejectButton)
          }

          const acceptButton = row.getElementsByTagName("a")[0];
          acceptButton.setAttribute(
            "action",
            InvokeURL + "users/me/invitations/" + invitation.id
          );
          acceptButton.setAttribute("decision", "accept");
          acceptButton.onclick = function () {
            console.log(acceptButton);
            decisionInviation(acceptButton)
          }
          orgContainer.appendChild(row);
        });
      }
      if (request.status >= 200 && request.status < 400 && data.total > 0) {
        const emptystateorganization = document.getElementById(
          "emptystateorganization"
        );
        emptystateorganization.style.display = "none";
      }
      if (request.status == 401) {
        MessageBox();
      }
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
        function setCookieAndSession(cName, cValue, expirationSec) {
          let date = new Date();
          date.setTime(date.getTime() + expirationSec * 1000);
          const expires = "expires=" + date.toUTCString();
          document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
        }
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

  function getOrganiations() {
    let url = new URL(InvokeURL + "users/me/tenants");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", smartToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      if (request.status >= 200 && request.status < 400 && data.total > 0) {
        const orgContainer = document.getElementById("Organization-Container");
        toParse.forEach((organization) => {
          const style = document.getElementById("samplerow");
          const row = style.cloneNode(true);
          const h6 = row.getElementsByTagName("H6")[0];
          h6.style.pointerEvents = "none";
          row.setAttribute("OrganizationName", organization.name);
          row.setAttribute("OrganizationclientId", organization.clientId);
          row.setAttribute("id", organization.clientId);
          row.style.display = "flex";
          h6.textContent = organization.name;
          var mycolour = StringToColour(organization.name);
          var some_fancy_gradient =
            "linear-gradient(180deg, " +
            mycolour +
            " 27%, rgb(255, 255, 255) 28%)";
          row.style.background = "" + some_fancy_gradient + " no-repeat";
          orgContainer.appendChild(row);
          document
            .getElementById(organization.clientId)
            .addEventListener("click", LoginIntoOrganization, false);
        });
      }
      if (request.status >= 200 && request.status < 400 && data.total > 0) {
        const emptystateorganization = document.getElementById(
          "emptystateorganization"
        );
        emptystateorganization.style.display = "none";
      }
      if (request.status == 401) {
        MessageBox();
      }
    };
    request.send();
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
          ClientID: ClientID,
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
          1440
        );
        setCookieAndSession("sprytnyUsername", UserInfo.Username, 1440);
      }
      if (request.status == 401) {
        console.log("error");
      }
    };
    request.send(JSON.stringify(datatosend));
  }

  makeWebflowFormAjaxCreate($(formIdChangePassword));
  makeWebflowFormAjax($(formId));
  getInvitations();
  getOrganiations();
  getUser();

});
