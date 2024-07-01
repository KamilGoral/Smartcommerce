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

  var ecEnabledValue = getCookie("EcEnabled");
  if (ecEnabledValue === "true") {
    $("#alertMessage").show();
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

  function parseAttributes(cookieValue) {
    const attributes = cookieValue.split(",");
    const result = {};
    attributes.forEach((attribute) => {
      const [key, value] = attribute.split(":");
      result[key.trim()] = value.trim();
    });
    return result;
  }

  var smartToken = getCookie("sprytnycookie");
  var accessToken = smartToken.split("Bearer ")[1];

  var InvokeURL = getCookie("sprytnyInvokeURL");
  var DomainName = getCookie("sprytnyDomainName");
  var formId = "#wf-form-Create-Organization-Form";
  var smartToken = getCookie("sprytnycookie");
  var accessToken = smartToken.split("Bearer ")[1];
  const emailElement = document.getElementById("useremail");
  emailElement.textContent = getCookie("sprytnyUser");

  const welcomeMessage = document.getElementById("WelcomeMessage");

  function setCookie(cName, cValue, expirationSec) {
    let date = new Date();
    date.setTime(date.getTime() + expirationSec * 1000);
    const expires = "expires=" + date.toUTCString();
    const encodedValue = encodeURIComponent(cValue);
    document.cookie = `${cName}=${encodedValue}; ${expires}; path=/`;
  }

  makeWebflowFormAjax = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var createorgmodal = $("#createorgmodal");
        var doneBlock = $(".w-form-done", container);
        var failBlock = $(".w-form-fail", container);
        var action = InvokeURL + "tenants";
        var method = form.attr("method");
        var data = {
          name: $(formId + " #newOrgName").val(),
          taxId: $(formId + " #taxID").val(),
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
            createorgmodal.hide();
            form.hide();
            doneBlock.show();
            failBlock.hide();
            setTimeout(function () {
              window.location.replace(
                "https://" + DomainName + "/app/users/me"
              );
            }, 2000);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";
            if (jqXHR.status === 0) {
              msg = "Brak połączenia. Sprawdź sieć.";
            } else if (jqXHR.status == 404) {
              msg = "Nie znaleziono żądanej strony. [404]";
            } else if (jqXHR.status == 403) {
              msg =
                "Dostęp zablokowany - skontaktujemy się z Państwem do 24 godzin, Zespół Sprytnykupiec.pl";

              // Jeśli wystąpił błąd 403, przygotuj dane do wysłania
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
            } else if (jqXHR.status == 409) {
              try {
                var responseText = JSON.parse(jqXHR.responseText);
                if (
                  responseText.message &&
                  responseText.message.includes("already exist")
                ) {
                  msg =
                    'Organizacja o nazwie:  "' +
                    $(formId + " #newOrgName").val() +
                    '" już istnieje. Proszę wybrać inną nazwę.';
                } else {
                  msg =
                    "Aktualnie trwa proces weryfikacji jednej z Twoich organizacji. Przed założeniem nowej, konieczne jest zakończenie tego procesu.";
                }
              } catch (e) {
                msg = "Błąd związany z konfliktem danych. [409]";
              }
            } else if (jqXHR.status == 409) {
              msg =
                "Aktualnie trwa proces weryfikacji jednej z Twoich organizacji. Przed założeniem nowej, konieczne jest zakończenie tego procesu.";
            } else if (jqXHR.status == 500) {
              msg = "Błąd wewnętrzny serwera [500].";
            } else if (exception === "parsererror") {
              msg = "Nieudana próba parsowania JSON.";
            } else if (exception === "timeout") {
              msg = "Przekroczono czas odpowiedzi.";
            } else if (exception === "abort") {
              msg = "Żądanie AJAX zostało przerwane.";
            } else {
              try {
                var responseText = JSON.parse(jqXHR.responseText);
                msg = "Nieoczekiwany błąd.\n" + responseText.message;
              } catch (e) {
                msg = "Nieoczekiwany błąd.\n" + jqXHR.responseText;
              }
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
    messageBox.setAttribute("style", "cursor:pointer;");
    $("#WarningMessageContainer").show();

    // Set a timeout to hide the message box after 3 seconds
    setTimeout(function () {
      // Fade out the message over 1 second
      $("#WarningMessageContainer").fadeOut(1000, function () {
        // After the fade out, hide the container completely
        $(this).hide();
      });
    }, 3000); // Display time before fade starts
  }

  function decisionInvitation(but) {
    const invitationId = but.dataset.invitationId; // Retrieve the stored invitation ID
    const action = but.dataset.action; // Retrieve the action
    const isTrueSet = action === "accept";

    const actionUrl = InvokeURL + "users/me/invitations/" + invitationId; // Construct the action URL based on the invitation ID

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
        const template = document.getElementById("sampleInvitation");

        var data = JSON.parse(this.response);
        var toParse = data.items;

        toParse.forEach((invitation) => {
          const row = template.cloneNode(true);
          row.style.display = "flex";

          // Update the invitation details
          row.querySelector("#tenantName").textContent =
            invitation.tenantName || "Project name";

          function setupButton(element, invitation, action) {
            // Store the invitation ID and action within the element's dataset for easier retrieval
            element.dataset.invitationId = invitation.id;
            element.dataset.action = action;

            element.onclick = function (event) {
              event.preventDefault(); // Prevent the link from navigating
              decisionInvitation(this); // Pass the element itself to decisionInvitation
            };
          }

          setupButton(
            row.querySelector("#acceptInvitation"),
            invitation,
            "accept"
          );
          setupButton(
            row.querySelector("#rejectInvitation"),
            invitation,
            "reject"
          );

          orgContainer.appendChild(row);
        });

        if (data.total > 0) {
          // document.getElementById("emptystateorganization").style.display = "none";
        } else {
          console.log("Brak zaproszeń");
        }
      } else if (request.status == 401) {
        MessageBox("Twoja sesja wygasła. Zaloguj się ponownie");
      } else {
        console.log(
          "Wystąpił błąd podczas komunikacji z serwerem. Kod błędu: " +
            request.status
        );
        MessageBox("Wystąpił błąd podczas komunikacji z serwerem.");
      }
    };

    request.onerror = function () {
      console.log("Wystąpił błąd podczas wysyłania żądania.");
    };
    request.send();
  }

  function LoginIntoOrganization(evt) {
    evt.preventDefault(); // Prevent the default form submission

    var OrganizationName = this.getAttribute("OrganizationName");
    var OrganizationclientId = this.getAttribute("OrganizationclientId");
    var OrganizationStatus = this.getAttribute("OrganizationStatus");

    // Check organization status first
    if (OrganizationStatus === "Suspended") {
      MessageBox(
        "Nie możesz zalogować się do tej organizacji. Proszę najpierw uregulować zaległe faktury."
      ); // Display message if suspended
      return false; // Exit function after displaying message
    }

    // Check if the organization's client ID is already stored as a cookie
    if (!getCookie(OrganizationclientId)) {
      var data = {
        smartToken: smartToken, // Ensure smartToken is correctly initialized and available
        OrganizationclientId: OrganizationclientId,
        OrganizationName: OrganizationName,
      };

      $.ajax({
        type: "POST",
        url: "https://hook.integromat.com/3k5pcq058xulm1gafamujedv9hwx6qn8",
        cors: true,
        beforeSend: function () {
          $("#waitingdots").show(); // Display loading indicator
        },
        complete: function () {
          $("#waitingdots").hide(); // Hide loading indicator
        },
        contentType: "application/json",
        dataType: "json",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
        success: function (resultData) {
          // Set the cookie and session storage after a successful response
          setCookie(
            OrganizationclientId,
            "Bearer " + resultData.AccessToken,
            resultData.ExpiresIn
          );
          sessionStorage.clear(); // Optionally clear other session data
          if (typeof successCallback === "function") {
            var result = successCallback(resultData);
            if (!result) {
              return;
            }
          }
          // Redirect to the organization's page
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
          console.error("Error during AJAX request:", jqXHR, exception);
        },
      });
    } else {
      // Redirect to the organization's page
      window.location.replace(
        "https://" +
          DomainName +
          "/app/tenants/organization" +
          "?name=" +
          OrganizationName +
          "&clientId=" +
          OrganizationclientId
      );
    }
    return false;
  }

  function getOrganizations() {
    const url = `${InvokeURL}users/me/tenants?perPage=100`;
    const createOrgButton = document.getElementById("CreateOrgButton");

    fetch(url, {
      method: "GET",
      headers: {
        Authorization: smartToken,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Server error: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((data) => {
        const { items: toParse, total } = data;

        if (total >= 4) {
          $("img[id^='startingImage']").hide();
        }

        if (total > 0) {
          const orgContainer = document.getElementById(
            "Organization-Container"
          );
          toParse.forEach((organization) => {
            const template = document.getElementById("samplerow");
            const row = template.cloneNode(true);

            const statusMap = {
              onboarding: { color: "#fff1b8", text: "W trakcie weryfikacji" },
              problem: { color: "#ffd666", text: "Problem" },
              client: { color: "#ffffff00", text: "" },
              suspended: { color: "#ff7875", text: "Zawieszony" },
            };

            // Use the status to get both the color and text
            const statusInfo =
              statusMap[organization.status.toLowerCase()] ||
              statusMap["onboarding"]; // Default to onboarding if not matched
            // Update organization specific attributes
            row.querySelector("#tenantName").textContent =
              organization.name || "Brak";
            // Apply color and text
            row.querySelector("#statusWraper").style.backgroundColor =
              statusInfo.color;
            row.querySelector("#tenantStatus").textContent = statusInfo.text;

            // Setting organization attributes for row
            row.setAttribute("OrganizationName", organization.name);
            row.setAttribute("OrganizationclientId", organization.clientId);
            row.setAttribute("OrganizationStatus", organization.status);
            row.style.display = "flex";

            // Append row to the container
            orgContainer.appendChild(row);

            // If the organization is onboarding, remove click actions and add class .tippy
            if (organization.status.toLowerCase() === "onboarding") {
              createOrgButton.style.pointerEvents = "none"; // Disable pointer events
              createOrgButton.classList.add("tippy"); // Add the tippy class
              createOrgButton.style.opacity = "0.5"; // Set opacity to 50%
              createOrgButton.style.display = "flex";
              row.addEventListener("click", LoginIntoOrganization, false);
            } else {
              row.addEventListener("click", LoginIntoOrganization, false);
            }
          });
        } else if (total === 0) {
          createOrgButton.style.display = "flex";
          // document.getElementById("emptystateorganization").style.display = "none";
        }
      })
      .catch((error) => {
        console.error("Failed to fetch organizations:", error.message);
        MessageBox(error.message);
      });
  }

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
                $("#form-done-edit-password").hide();
                $("#form-done-fail-edit").show();
                console.log(e);
                return;
              }
            }
            form.show();
            $("#form-done-edit-password").show().delay(2000).fadeOut("slow");
            $("#form-done-fail-edit").hide();
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
              msg = "" + jqXHR.responseText;
            }
            const message = document.getElementById(
              "WarningMessageChangePassword"
            );
            message.textContent = msg;
            form.show();
            $("#form-done-edit-password").hide();
            $("#form-done-fail-edit").show();
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
        var failBlock2 = $("#form-done-fail-edit-profile");
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
                $("#form-done-edit-profile").hide();
                failBlock2.show();
                console.log(e);
                return;
              }
            }
            form.show();
            $("#form-done-edit-profile").show().delay(2000).fadeOut("slow");
            failBlock2.hide();
            welcomeMessage.textContent =
              "Witaj, " + firstNameUser + " " + lastNameUser + "!";
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            failBlock2.show();
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
        const username = document.getElementById("firstNameUser");
        username.value = UserInfo.UserAttributes[2].Value;
        const userfamilyname = document.getElementById("lastNameUser");
        userfamilyname.value = UserInfo.UserAttributes[3].Value;

        emailElement.textContent = UserInfo.UserAttributes[4].Value;
        var emailadress = document.getElementById("emailadressUser");
        emailadress.value = UserInfo.UserAttributes[4].Value;

        setCookie(
          "SpytnyUserAttributes",
          "username:" +
            UserInfo.UserAttributes[2].Value +
            ",familyname:" +
            UserInfo.UserAttributes[3].Value +
            ",email:" +
            UserInfo.UserAttributes[4].Value,
          72000
        );

        welcomeMessage.textContent =
          "Witaj, " +
          UserInfo.UserAttributes[2].Value +
          " " +
          UserInfo.UserAttributes[3].Value +
          "!";

        setCookie("sprytnyUser", UserInfo.UserAttributes[4].Value, 72000);
        setCookie("sprytnyUsername", UserInfo.Username, 72000);
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

  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));
  makeWebflowFormAjax($(formId));
  getInvitations();
  getOrganizations();
  getUser();
  LoadTippy();
});
