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

  function enablePasswordToggle() {
    // Znajdujemy wszystkie inputy typu password
    document
      .querySelectorAll('input[type="password"]')
      .forEach(function (input) {
        // Dodajemy padding, żeby nie zasłaniać tekstu
        input.style.paddingRight = "40px";

        // Dodajemy ikonę tylko jeśli jeszcze jej nie ma
        if (input.parentNode.querySelector(".eye-icon")) return;

        const eyeIcon = document.createElement("img");
        eyeIcon.src =
          "https://cdn.prod.website-files.com/6041108bece36760b4e14016/68563a97a30070647f1763d1_watch-crossed.svg";
        eyeIcon.alt = "Pokaż hasło";
        eyeIcon.className = "eye-icon";
        eyeIcon.style.position = "absolute";
        eyeIcon.style.right = "10px";
        eyeIcon.style.cursor = "pointer";
        eyeIcon.style.width = "20px";
        eyeIcon.style.height = "20px";
        eyeIcon.style.objectFit = "contain";

        // Upewniamy się, że rodzic ma relative
        const parent = input.parentNode;
        if (getComputedStyle(parent).position === "static") {
          parent.style.position = "relative";
        }
        parent.appendChild(eyeIcon);

        // Czekamy aż wszystko będzie narysowane i dopiero liczymy wysokość
        const observer = new ResizeObserver(() => {
          const inputHeight = input.offsetHeight;
          const iconHeight = 20;
          const topPosition = (inputHeight - iconHeight) / 2;
          eyeIcon.style.top = `${topPosition}px`;
        });
        observer.observe(input);

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
  // DOM is loaded and ready for manipulation here
  const displayMessage = (type, message) => {
    $("#Message-Container").show().delay(5000).fadeOut("slow");
    if (message) {
      $(`#${type}-Message-Text`).text(message);
    }
    $(`#${type}-Message`).show().delay(5000).fadeOut("slow");
  };

  function setCookie(cName, cValue, expirationSec) {
    let date = new Date();
    date.setTime(date.getTime() + expirationSec * 1000);
    const expires = "expires=" + date.toUTCString();
    const encodedValue = encodeURIComponent(cValue);
    document.cookie = `${cName}=${encodedValue}; ${expires}; path=/`;
  }

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

  var smartToken = getCookie("sprytnycookie");
  var accessToken = null;

  if (smartToken && smartToken.includes("Bearer ")) {
    accessToken = smartToken.split("Bearer ")[1];
  } else {
    console.warn("Brak poprawnego tokena w ciasteczku 'sprytnycookie'");
  }
  const attributes = parseAttributes(getCookie("SpytnyUserAttributes"));
  const username = document.getElementById("firstNameUser");
  username.value = attributes["username"];
  const userfamilyname = document.getElementById("lastNameUser");
  userfamilyname.value = attributes["familyname"];
  const emailElement = document.getElementById("useremail");
  const emailadress = document.getElementById("emailadressUser");
  emailElement.textContent = attributes["email"];
  emailadress.value = attributes["email"];
  const phoneNumberElement = document.getElementById("phoneNumber");
  phoneNumberElement.value = attributes["phonenumber"];
  const orderEmailForm = $("#wf-form-Order-Email-Form");
  var organizationName = getCookie("OrganizationName");

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
  var formIdDeleteServer = "#wf-form-Delete-Ftp";
  var formIdResetPassword = "#wf-form-Reset-Password";

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
    request.setRequestHeader("Requested-By", "webflow-3-4");
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
        const whVan = document.getElementById("whVan");
        whLogo.src = "data:image/png;base64," + data.image;
        whLogo.style.objectFit = "contain";
        wholesalerName.textContent = data.company;

        if (
          data &&
          data.smartvan &&
          data.smartvan.smtp &&
          typeof data.smartvan.smtp.enabled === "boolean"
        ) {
          var smtpEnabled = data.smartvan.smtp.enabled;
          var switchInput = $("#Order-Email-Switch");
          var switchDiv = switchInput.siblings(".w-checkbox-input");

          if (smtpEnabled) {
            switchInput.prop("checked", true);
            switchDiv.addClass("w--redirected-checked"); // Dodaj klasę Webflow
          } else {
            switchInput.prop("checked", false);
            switchDiv.removeClass("w--redirected-checked"); // Usuń klasę Webflow
          }
        } else {
          console.error(
            "Invalid response format: Missing smartvan.smtp.enabled"
          );
        }

        if (data.platformUrl !== null) {
          whPlatformUrl.setAttribute("href", "" + data.platformUrl);
          $("#Iehurt").addClass("enabled");
        } else {
          $("#loginButton").hide();
        }

        const vanElements = document.querySelectorAll('[vanfunction="true"]');
        // Check if vanMember is true
        if (data.vanMember) {
          whVan.textContent = "Tak";

          // Pokaż elementy SmartVAN
          $("#smartVanInfo").show();
          $("#smartVanGuide").show();

          // Ukryj elementy standardowego hurtownika
          $("#info").hide();
          $("#guide").hide();

          // Show elements and enable/check checkboxes
          vanElements.forEach(function (element) {
            element.style.display = "flex";
            const checkbox = element.querySelector('input[type="checkbox"]');

            // Check if the checkbox exists and set it as checked
            if (checkbox) {
              checkbox.checked = true;
              checkbox.disabled = false; // Enable the checkbox
            }
          });
        } else {
          // Hide elements and disable/uncheck checkboxes
          whVan.textContent = "Nie";

          // Ukryj elementy SmartVAN
          $("#smartVanInfo").hide();
          $("#smartVanGuide").hide();

          // Pokaż elementy standardowego hurtownika
          $("#info").show();
          $("#guide").show();

          vanElements.forEach(function (element) {
            // Hide the element
            element.style.display = "none";

            // Find the checkbox within this element
            const checkbox = element.querySelector('input[type="checkbox"]');

            // Check if the checkbox exists and set it as unchecked and disabled
            if (checkbox) {
              checkbox.checked = false;
              checkbox.disabled = true; // Disable the checkbox
            }
          });
        }

        if (data.enabled) {
          $("#enabled").addClass("enabled");
          getFTP();
        } else {
          $("#createserver").show();
        }

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
    request.setRequestHeader("Requested-By", "webflow-3-4");
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
        var baseAction = InvokeURL + "wholesalers/" + wholesalerKey + "/ftp";
        var method = "POST";

        var data = {
          username: $("#Wholesaler-Login").val(),
        };

        var notifyWholesalerCheckbox = $("#notifyWholesalerCreate");
        var action = baseAction;

        if (
          notifyWholesalerCheckbox.is(":visible") &&
          !notifyWholesalerCheckbox.is(":disabled") &&
          notifyWholesalerCheckbox.is(":checked")
        ) {
          action += "?notifyWholesaler=true";
        }

        // Define the updateStatus function locally
        function updateStatus(wholesalerKey, onErrorCallback) {
          var data = [
            {
              op: "replace",
              path: "/enabled",
              value: true,
            },
          ];

          $.ajax({
            type: "PATCH",
            url: InvokeURL + "wholesalers/" + wholesalerKey,
            cors: true,
            beforeSend: function () {
              $("#waitingdots").show();
            },
            complete: function () {
              setTimeout(function () {
                $("#waitingdots").hide();
              }, 2000); // Ukryj element po 2 sekundach (2000 ms)
            },
            contentType: "application/json",
            dataType: "json",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: orgToken,
              "Requested-By": "webflow-3-4",
            },
            data: JSON.stringify(data),
            success: function (resultData, textStatus, jqXHR) {
              if (jqXHR.status === 200) {
                // Jeśli updateStatus zwrócił 200, wywołaj żądanie utworzenia serwera
                sendCreateServerRequest();
              } else {
                displayMessage(
                  "Error",
                  "Nie udało się zmienić statusu. Spróbuj ponownie."
                );
              }
            },
            error: function (jqXHR, exception) {
              var msg = "";
              if (jqXHR.status === 0) {
                msg = "Nie masz połączenia z internetem.";
              } else if (jqXHR.status == 404) {
                msg = "Nie znaleziono strony";
              } else if (jqXHR.status == 403) {
                msg = "Nie masz uprawnień do tej czynności";
              } else if (jqXHR.status == 409) {
                msg =
                  "Nie można usunąć dostawcy. Jeden ze sklepów wciąż korzysta z jego usług.";
              } else if (jqXHR.status == 500) {
                msg =
                  "Serwer napotkał problemy. Prosimy o kontakt kontakt@smartcommerce.net [500].";
              } else if (exception === "parsererror") {
                msg = "Nie udało się odczytać danych";
              } else if (exception === "timeout") {
                msg = "Przekroczony czas oczekiwania";
              } else if (exception === "abort") {
                msg = "Twoje żądanie zostało zaniechane";
              } else {
                msg = "" + jqXHR.responseJSON.message;
              }
              displayMessage("Error", msg);
              if (onErrorCallback) {
                onErrorCallback(msg);
              }
            },
          });
        }

        // Check if the #Iftp element has the "enabled" class
        if (!$("#enabled").hasClass("enabled")) {
          // Activate the wholesaler first if not enabled
          updateStatus(wholesalerKey, function (error) {
            if (error) {
              failBlock.show();
              $(".warningmessagetext").text(
                "Nie udało się aktywować dostawcy."
              );
              return;
            }
          });
        } else {
          // If already enabled, proceed directly to create the server
          sendCreateServerRequest();
        }

        // Function to handle the server creation request
        function sendCreateServerRequest() {
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
              "Requested-By": "webflow-3-4",
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
              const credentialsHTML = `Login: ${resultData.credentials.username}<br />Hasło: ${resultData.credentials.password}<br />`;

              document.getElementById("credentialsbox").innerHTML =
                credentialsHTML;
              document.getElementById("credentialsvan").innerHTML =
                credentialsHTML;

              const ftpUsername = document.getElementById("ftpUsername");
              ftpUsername.textContent = resultData.credentials.username;
              $("#Iftp").addClass("enabled");
              $("#credentials").show();
              $("#createserver").hide();

              const isVan = $("#whVan").text() === "Tak";
              $("#successvan").css("display", isVan ? "flex" : "none");
              $("#successnovan").css("display", isVan ? "none" : "flex");
              doneBlock.show();

              failBlock.hide();
            },
            error: function (jqXHR, exception) {
              var msg = "";
              if (jqXHR.status === 0) {
                msg = "Not connect.\n Verify Network.";
              } else if (jqXHR.status === 403) {
                msg = "Oops! Coś poszło nie tak. Proszę spróbuj ponownie.";
              } else if (jqXHR.status === 409) {
                msg = "Ta nazwa użytkownika jest zajęta. Spróbuj inną.";
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
        }

        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxEmailEnabled = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var orderEmailSwitch = $("#Order-Email-Switch");
        var enabled = orderEmailSwitch.is(":checked");

        var data = [
          {
            op: "replace",
            path: "/smartvan/smtp/enabled",
            value: !enabled,
          },
        ];

        $.ajax({
          type: "PATCH",
          url: InvokeURL + "wholesalers/" + wholesalerKey,
          cors: true,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            setTimeout(function () {
              $("#waitingdots").hide();
            }, 500);
          },
          contentType: "application/json",
          dataType: "json",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: orgToken,
            "Requested-By": "webflow-3-4",
          },
          data: JSON.stringify(data),
          success: function (resultData, textStatus, jqXHR) {
            if (jqXHR.status === 200) {
              if (typeof successCallback === "function") {
                successCallback(resultData);
              }
              displayMessage(
                "Success",
                "Ustawienia e-mial zostały zaktualizowane."
              );
            } else {
              displayMessage(
                "Error",
                "Nie udało się zaktualizować ustawień e-mail."
              );
            }
          },
          error: function (jqXHR, exception) {
            var msg = "";
            if (jqXHR.status === 0) {
              msg = "Nie masz połączenia z internetem.";
            } else if (jqXHR.status == 404) {
              msg = "Nie znaleziono strony";
            } else if (jqXHR.status == 403) {
              msg = "Nie masz uprawnień do tej czynności";
            } else if (jqXHR.status == 409) {
              msg = "Konflikt danych.";
            } else if (jqXHR.status == 500) {
              msg =
                "Serwer napotkał problemy. Prosimy o kontakt kontakt@smartcommerce.net [500].";
            } else if (exception === "parsererror") {
              msg = "Nie udało się odczytać danych";
            } else if (exception === "timeout") {
              msg = "Przekroczony czas oczekiwania";
            } else if (exception === "abort") {
              msg = "Twoje żądanie zostało zaniechane";
            } else {
              msg = "" + jqXHR.responseJSON.message;
            }
            displayMessage("Error", msg);
            failBlock.show();
            doneBlock.hide();
            if (errorCallback) {
              errorCallback(msg);
            }
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
        var doneBlock = $("#wf-form-reset-password-done", container);
        var failBlock = $("#wf-form-reset-password-fail", container);
        var baseAction =
          InvokeURL + "wholesalers/" + wholesalerKey + "/ftp/reset-password";
        var method = "GET";

        // Initialize action URL
        var action = baseAction;

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
            "Requested-By": "webflow-3-4",
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
            const ftpUsernameVal =
              document.getElementById("ftpUsername").textContent;

            const credentialsHTML = `Login: ${ftpUsernameVal}<br />Hasło: ${resultData.credentials.password}<br />`;

            document.getElementById("resetpasswordtext").innerHTML =
              credentialsHTML;
            document.getElementById("credentialsvanreset").innerHTML =
              credentialsHTML;

            ftpUsername.textContent = resultData.credentials.username;
            $("#Iftp").addClass("enabled");
            $("#credentials").removeClass("hide");

            doneBlock.show();
            const isVan = $("#whVan").text() === "Tak";
            $("#successvanreset").css("display", isVan ? "flex" : "none");
            $("#successnovanreset").css("display", isVan ? "none" : "flex");

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
            displayMessage("Error", msg);
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
        var baseAction = InvokeURL + "wholesalers/" + wholesalerKey + "/ftp";
        var method = "DELETE";

        // Initialize action URL
        var action = baseAction;

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
            "Requested-By": "webflow-3-4",
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
  makeWebflowFormAjaxEmailEnabled($(orderEmailForm));

  orderEmailForm.find(".w-checkbox-input").on("click", function () {
    orderEmailForm.trigger("submit");
    console.log("click");
  });

  const loginValue = (organizationName + "." + wholesalerKey).toLowerCase();

  $("#Wholesaler-Login").prop("disabled", true).val(loginValue);

  makeWebflowFormAjaxServerWh($(formIdNewServer));
  makeWebflowFormAjaxResetPassword($(formIdResetPassword));
  makeWebflowFormAjaxDeleteServerWh($(formIdDeleteServer));
  LogoutNonUser();
});
