function whenReadyAndDataTables(fn) {
  function check() {
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      if (
        typeof window.jQuery !== "undefined" &&
        typeof $.fn.DataTable !== "undefined"
      ) {
        fn();
      } else {
        setTimeout(check, 100); // Poczekaj aż DataTables się załaduje
      }
    } else {
      document.addEventListener("DOMContentLoaded", check);
    }
  }
  check();
}

whenReadyAndDataTables(function () {
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
      return decodeURIComponent(parts.pop().split(";").shift());
  }

  function enablePasswordToggle() {
    document
      .querySelectorAll('input[type="password"]')
      .forEach(function (input) {
        // Sprawdź, czy input już ma wrapper (żeby nie dublować)
        if (input.parentNode.classList.contains("password-wrapper")) return;

        // Tworzymy wrapper wokół inputa
        const wrapper = document.createElement("div");
        wrapper.className = "password-wrapper";
        wrapper.style.position = "relative";
        wrapper.style.display = "block"; // zachowuje szerokość inputa automatycznie
        wrapper.style.width = "100%";

        // Podmieniamy inputa na wrapper
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        // Dodajemy padding na input, żeby tekst nie wchodził pod ikonę
        input.style.paddingRight = "40px";
        input.style.width = "100%";

        // Tworzymy ikonę
        const eyeIcon = document.createElement("img");
        eyeIcon.src =
          "https://cdn.prod.website-files.com/6041108bece36760b4e14016/68563a97a30070647f1763d1_watch-crossed.svg";
        eyeIcon.alt = "Pokaż hasło";
        eyeIcon.className = "eye-icon";
        eyeIcon.style.position = "absolute";
        eyeIcon.style.right = "10px";
        eyeIcon.style.top = "50%";
        eyeIcon.style.transform = "translateY(-50%)";
        eyeIcon.style.cursor = "pointer";
        eyeIcon.style.width = "20px";
        eyeIcon.style.height = "20px";
        eyeIcon.style.objectFit = "contain";

        wrapper.appendChild(eyeIcon);

        // Obsługa kliknięcia
        eyeIcon.addEventListener("click", function () {
          if (input.type === "password") {
            input.type = "text";
            eyeIcon.src =
              "https://cdn.prod.website-files.com/6041108bece36760b4e14016/64a10152fd5bcfa2fb16b3e6_watch.svg";
          } else {
            input.type = "password";
            eyeIcon.src =
              "https://cdn.prod.website-files.com/6041108bece36760b4e14016/68563a97a30070647f1763d1_watch-crossed.svg";
          }
        });
      });
  }

  // Wywołanie funkcji
  enablePasswordToggle();

  $(document).on("click", ".modal-wrapper", function (e) {
    // Jeśli kliknięto bezpośrednio w wrapper (a nie w sam modal lub jego dzieci)
    if ($(e.target).is(".modal-wrapper")) {
      $(this).hide(); // lub np. fadeOut() jeśli chcesz efekt
    }
  });

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

  var smartToken = getCookie("sprytnycookie");
  var accessToken = null;

  if (smartToken && smartToken.includes("Bearer ")) {
    accessToken = smartToken.split("Bearer ")[1];
  } else {
    console.warn("Brak poprawnego tokena w ciasteczku 'sprytnycookie'");
  }
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var DomainName = getCookie("sprytnyDomainName");
  var formId = "#wf-form-Create-Organization-Form";
  const emailElement = document.getElementById("useremail");
  const welcomeMessage = document.getElementById("WelcomeMessage");

  function parseAttributes(cookieValue) {
    const decodedValue = decodeURIComponent(cookieValue || "");
    const attributes = decodedValue.split("|");
    const result = {};

    attributes.forEach((attribute) => {
      const parts = attribute.split(":");
      if (parts.length >= 2) {
        const key = parts[0]?.trim();
        const value = parts.slice(1).join(":").trim(); // obsługa wartości z dodatkowymi ":"
        if (key) {
          result[key] = value;
        }
      }
    });

    return result;
  }

  const displayMessage = (type, message) => {
    $("#Message-Container").show().delay(5000).fadeOut("slow");
    if (message) {
      $(`#${type}-Message-Text`).text(message);
    }
    $(`#${type}-Message`).show().delay(5000).fadeOut("slow");
  };

  postEditUserProfile = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        const firstNameUser = $("#firstNameUser").val();
        const lastNameUser = $("#lastNameUser").val();
        const emailadressUser = $("#emailadressUser").val();
        const phoneNumber = $("#phoneNumber").val();
        const phoneNumberPrefixWithPrefix = phoneNumber
          ? "+48" + phoneNumber
          : ""; // Only add prefix if phoneNumber is not empty

        // Get the existing phone number from the cookie
        const existingUserAttributes = getCookie("SpytnyUserAttributes");
        let existingPhoneNumber = null;
        if (existingUserAttributes) {
          const attributes = existingUserAttributes.split("|");
          const phoneNumberAttribute = attributes.find((attr) =>
            attr.startsWith("phonenumber:")
          );
          if (phoneNumberAttribute) {
            existingPhoneNumber = phoneNumberAttribute.split(":")[1];
          }
        }

        // Prepare the data to send
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
          ],
        };

        // Add phone_number attribute only if phoneNumber is not empty
        if (phoneNumber) {
          datatosend.UserAttributes.push({
            Name: "phone_number",
            Value: phoneNumberPrefixWithPrefix,
          });
        }

        // If the user wants to delete the phone number (empty field) and it previously existed
        if (!phoneNumber && existingPhoneNumber) {
          datatosend.UserAttributes.push({
            Name: "phone_number",
            Value: "", // Sending an empty value to delete the phone number
          });
        }

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
                emailadressUser +
                "|phonenumber:" +
                phoneNumber,
              720000
            );
            displayMessage("Success", "Twoje dane zostały zmienione");
            const welcomeMessage = document.getElementById("welcomeMessage");
            if (welcomeMessage) {
              welcomeMessage.textContent =
                "Witaj, " + firstNameUser + " " + lastNameUser + "!";
            } else {
              console.log("Witaj");
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

  function logoutUser(accessToken, domainToRedirect) {
    // Global SignOut z Cognito
    $.ajax({
      type: "POST",
      url: "https://cognito-idp.us-east-1.amazonaws.com/",
      headers: {
        "x-amz-target": "AWSCognitoIdentityProviderService.GlobalSignOut",
        "Content-Type": "application/x-amz-json-1.1",
        authorization: accessToken,
      },
      data: JSON.stringify({ AccessToken: accessToken }),
      contentType: "application/json",
      dataType: "json",
      success: function () {
        // Usuń cookies
        document.cookie.split(";").forEach((cookie) => {
          const name = cookie.split("=")[0].trim();
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        });

        localStorage.clear();
        sessionStorage.clear();

        displayMessage("Success", "Wylogowano. Do zobaczenia wkrótce!");

        setTimeout(function () {
          window.location.replace(`https://${domainToRedirect}`);
        }, 3000);
      },
      error: function () {
        displayMessage("Error", "Błąd podczas wylogowywania.");
        setTimeout(function () {
          window.location.replace(`https://${domainToRedirect}`);
        }, 3000);
      },
    });
  }

  function checkCookiePresenceAndLogout() {
    const cookiesToCheck = [
      "sprytnyUser",
      "sprytnyUsername",
      "sprytnyDomainName",
      "sprytnyOrganizationclientId",
      "sprytnyInvokeURL",
      "sprytnycookie",
    ];

    const missing = cookiesToCheck.some(
      (name) => !document.cookie.includes(`${name}=`)
    );

    if (missing) {
      const modal = document.getElementById("logout-modal");
      modal.style.display = "flex";

      const smartToken = getCookie("sprytnycookie");
      const accessToken = smartToken?.split("Bearer ")[1];
      const domainName = getCookie("sprytnyDomainName");

      document
        .getElementById("logout-button")
        .addEventListener("click", function () {
          logoutUser(accessToken, domainName || window.location.hostname);
        });

      setTimeout(function () {
        logoutUser(accessToken, domainName || window.location.hostname);
      }, 10000);
    }
  }

  setTimeout(checkCookiePresenceAndLogout, 5000);

  // Obsługa formularza logout
  $("#wf-form-LogoutUser").on("submit", function (e) {
    e.preventDefault();

    const smartToken = getCookie("sprytnycookie");
    const accessToken = smartToken?.split("Bearer ")[1];
    const domainName = getCookie("sprytnyDomainName");

    if (accessToken && domainName) {
      logoutUser(accessToken, domainName);
    } else {
      displayMessage("Error", "Brak danych do wylogowania.");
    }

    return false;
  });

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
        var createorgmodal = $("#createorgmodal");
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
            "Requested-By": "webflow-3-4",
          },
          data: JSON.stringify(data),
          success: function (resultData) {
            if (typeof successCallback === "function") {
              // call custom callback
              result = successCallback(resultData);
              if (!result) {
                // show error (fail) block
                form.show();
                displayMessage(
                  "Error",
                  "Oops. Coś poszło nie tak, spróbuj ponownie."
                );
                return;
              }
            }
            createorgmodal.hide();
            form.hide();
            displayMessage("Success", "Twoja organizacja została stworzona.");
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
        "Requested-By": "webflow-3-4",
      },
      success: function () {
        window.location.reload();
      },
      error: function (jqXHR, exception) {
        if (jqXHR.status === 401) {
          displayMessage("Error", "Twoja sesja wygasła. Zaloguj się ponownie");
        }
      },
    });
  }

  function getInvitations() {
    let url = new URL(InvokeURL + "users/me/invitations");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", smartToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");

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
        displayMessage("Error", "Twoja sesja wygasła. Zaloguj się ponownie");
      } else {
        console.log(
          "Wystąpił błąd podczas komunikacji z serwerem. Kod błędu: " +
            request.status
        );
        displayMessage(
          "Error",
          "Wystąpił błąd podczas komunikacji z serwerem."
        );
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
    setCookie("OrganizationName", OrganizationName, 72000);

    var redirectWithParameter = "";
    // Check organization status first
    if (OrganizationStatus === "Suspended") {
      displayMessage(
        "Error",
        "Prosimy o uregulowanie zaległych faktur przed dalszym korzystaniem z platformy."
      );
      redirectWithParameter = "&suspended=true"; // Display message if suspended
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
          "Requested-By": "webflow-3-4",
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
              "/app/tenants/organization?clientId=" +
              OrganizationclientId +
              redirectWithParameter
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
          "/app/tenants/organization?clientId=" +
          OrganizationclientId +
          redirectWithParameter
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
        "Requested-By": "webflow-3-4",
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
        const orgContainer = document.getElementById("Organization-Container");
        let hasOnboarding = false;

        // Check if any organization has status 'onboarding'
        if (total > 0) {
          toParse.forEach((organization) => {
            if (organization.status.toLowerCase() === "onboarding") {
              hasOnboarding = true;
            }
          });
        }

        // Show or hide createOrgButton based on the onboarding status and total organizations
        if (total === 0 || !hasOnboarding) {
          createOrgButton.style.display = "flex";
          createOrgButton.style.pointerEvents = "auto";
          createOrgButton.style.opacity = "1";
        } else {
          createOrgButton.style.display = "flex";
          createOrgButton.style.pointerEvents = "none";
          createOrgButton.style.opacity = "0.5";
        }

        // Hide starting images if more than 4 organizations
        if (total >= 4) {
          $("img[id^='startingImage']").hide();
        }

        if (total > 0) {
          toParse.forEach((organization) => {
            const template = document.getElementById("samplerow");
            const row = template.cloneNode(true);

            // Usuń atrybuty ID z klonowanych wierszy, aby uniknąć duplikatów
            row.removeAttribute("id");

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

            // Update organization-specific attributes
            row.querySelector(
              "[organizationData='organizationName']"
            ).textContent = organization.name || "Brak";
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

            // Handle click events based on organization status
            row.addEventListener("click", LoginIntoOrganization, false);
          });
          setupOrganizationSearch();
        }
      })
      .catch((error) => {
        console.error("Failed to fetch organizations:", error.message);
        displayMessage("Error", error.message);
      });
  }

  function setupOrganizationSearch() {
    const searchContainer = document.getElementById("search-organizations");
    if (!searchContainer) return;

    const searchInput = searchContainer.querySelector("input[type='search']");
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener("input", function () {
      clearTimeout(debounceTimer);

      if (searchInput.value.length < 2 && searchInput.value.length > 0) {
        return;
      }

      debounceTimer = setTimeout(() => {
        const searchTerm = searchInput.value.toLowerCase();
        const organizationContainer = document.getElementById(
          "Organization-Container"
        );
        if (!organizationContainer) return;

        const organizationRows = organizationContainer.children;

        for (let row of organizationRows) {
          if (row.id === "samplerow" || row.id === "sampleInvitation") {
            row.style.display = "none";
            continue;
          }

          const organizationNameElement = row.querySelector(
            "[organizationData='organizationName']"
          );

          if (organizationNameElement) {
            const organizationName =
              organizationNameElement.textContent.toLowerCase();

            if (organizationName.includes(searchTerm)) {
              row.style.display = "flex";
            } else {
              row.style.display = "none";
            }
          }
        }
      }, 1); // Debounce to delay execution
    });
  }

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
      if (request.status >= 200 && request.status < 400) {
        var UserInfo = JSON.parse(this.response);
        console.log(UserInfo);

        // Helper function to get attribute value by name
        function getAttributeValue(attributes, name) {
          const attribute = attributes.find((attr) => attr.Name === name);
          return attribute ? attribute.Value : null;
        }

        const firstName = getAttributeValue(UserInfo.UserAttributes, "name");
        const lastName = getAttributeValue(
          UserInfo.UserAttributes,
          "family_name"
        );
        const email = getAttributeValue(UserInfo.UserAttributes, "email");
        const phoneNumber = getAttributeValue(
          UserInfo.UserAttributes,
          "phone_number"
        );

        // Check if phoneNumber exists before slicing
        const trimmedPhoneNumber = phoneNumber ? phoneNumber.slice(3) : ""; // Trim the first 3 characters (+48) if phoneNumber exists

        const username = document.getElementById("firstNameUser");
        if (username) username.value = firstName;

        const userfamilyname = document.getElementById("lastNameUser");
        if (userfamilyname) userfamilyname.value = lastName;

        const emailElement = document.getElementById("emailadressUser");
        if (emailElement) emailElement.value = email;

        const emailElement2 = document.getElementById("useremail");

        if (emailElement2) {
          emailElement2.textContent = "Email: " + email;
        }

        const phoneElement = document.getElementById("phoneNumber");
        if (phoneElement) phoneElement.value = trimmedPhoneNumber;

        setCookie(
          "SpytnyUserAttributes",
          `username:${firstName}|familyname:${lastName}|email:${email}|phonenumber:${trimmedPhoneNumber}`,
          72000
        );

        const welcomeMessage = document.getElementById("WelcomeMessage");
        if (welcomeMessage) {
          welcomeMessage.textContent = `Witaj, ${firstName}!`;
        }

        setCookie("sprytnyUser", email, 72000);
        setCookie("sprytnyUsername", UserInfo.Username, 72000);
      } else if (request.status === 401) {
        console.log("Błąd autoryzacji - Nie masz uprawnień do dostępu.");
      } else {
        console.log(
          "Wystąpił błąd podczas komunikacji z serwerem. Kod błędu: " +
            request.status +
            " " +
            request.message
        );
        displayMessage("Error", request.message);
      }
    };

    request.onerror = function () {
      console.log("Wystąpił błąd podczas wysyłania żądania.");
    };

    request.send(JSON.stringify(datatosend));
  }
  function initializeSimpleTooltips() {
    // CSS styling for tooltip
    const style = document.createElement("style");
    style.innerHTML = `
    .newtippy {
      position: absolute;
      background-color: #333;
      color: #fff;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
      z-index: 6000;
    }
  `;
    document.head.appendChild(style);

    const elements = document.querySelectorAll("[data-tippy-content]");

    elements.forEach((element) => {
      element.addEventListener("mouseenter", (event) => {
        const tooltipText = element.getAttribute("data-tippy-content");
        if (!tooltipText) return;

        // Create tooltip element
        const tooltip = document.createElement("div");
        tooltip.className = "newtippy";
        tooltip.textContent = tooltipText;
        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
        tooltip.style.top = `${
          rect.top + window.scrollY - tooltip.offsetHeight - 5
        }px`;
        tooltip.style.opacity = "1";

        // Center tooltip
        tooltip.style.left = `${
          parseFloat(tooltip.style.left) - tooltip.offsetWidth / 2
        }px`;

        // Mouseleave event to remove tooltip
        element.addEventListener("mouseleave", () => {
          tooltip.style.opacity = "0";
          setTimeout(() => tooltip.remove(), 200); // Delay for fade-out effect
        });
      });
    });
  }

  // Initialize tooltips on page load
  initializeSimpleTooltips();

  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));
  makeWebflowFormAjax($(formId));
  getInvitations();
  getOrganizations();
  getUser();
});
