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
  // DOM is loaded and ready for manipulation here
  const displayMessage = (type, message) => {
    $("#Message-Container").show().delay(5000).fadeOut("slow");
    if (message) {
      $(`#${type}-Message-Text`).text(message);
    }
    $(`#${type}-Message`).show().delay(5000).fadeOut("slow");
  };

  var testOrganization = getCookie("OrganizationName");
  console.log(testOrganization);

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

  var Webflow = Webflow || [];
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var clientId = new URL(location.href).searchParams.get("clientId");
  var orgToken = getCookie(clientId);
  setCookie("sprytnyToken", orgToken, 72000);
  var DomainName = getCookie("sprytnyDomainName");
  var userKey = getCookie("sprytnyUsername") || "me";

  var organizationName = getCookie("OrganizationName");
  $("#NewOrganizationName").val(organizationName);
  var formId = "#wf-form-NewOrganizationName";
  var formIdDelete = "#wf-form-DeleteOrganization";
  var formIdInvite = "#wf-form-Invite-User";
  var formIdCreate = "#wf-form-Create-Shop";
  var formIdNewWh = "#wf-form-Create-wholesaler";
  var formIdNewServer = "#wf-form-Create-server";
  var formIdEditBilling = "#wf-form-editCompanyBilling-form-correct";
  const OrganizationBread0 = document.getElementById("OrganizationBread0");
  const OrganizationNameHeader = document.getElementById("organizationName");

  OrganizationNameHeader.textContent = organizationName;
  OrganizationBread0.textContent = organizationName;
  OrganizationBread0.setAttribute(
    "href",
    "https://" +
      DomainName +
      "/app/tenants/organization?name=" +
      organizationName +
      "&clientId=" +
      clientId,
  );

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
            attr.startsWith("phonenumber:"),
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
                  "Oops. Coś poszło nie tak, spróbuj ponownie.",
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
              720000,
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
              "Oops. Coś poszło nie tak, spróbuj ponownie.",
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
                  "Oops. Coś poszło nie tak, spróbuj ponownie.",
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
      (name) => !document.cookie.includes(`${name}=`),
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

  // Sprawdzenie statusu organizacji (suspended guard)
  // Na stronie organizacji: nie robimy redirect, tylko uruchamiamy suspended UI
  (async function checkOrgAccessLevel() {
    var clientId = getCookie("sprytnyOrganizationclientId");
    if (!clientId) return;
    var aclCookie = getCookie("sc_acl_" + clientId);
    var urlSuspended = new URLSearchParams(window.location.search).get("suspended") === "true";
    if (urlSuspended && aclCookie !== "restricted") {
      setCookie("sc_acl_" + clientId, "restricted", 72000);
      aclCookie = "restricted";
    }
    if (aclCookie === "restricted") {
      // Poczekaj na sprytnyUserRole (ustawiany przez getUserRole)
      var attempts = 0;
      while (!getCookie("sprytnyUserRole") && attempts < 5) {
        await new Promise(function(r) { setTimeout(r, 1000); });
        attempts++;
      }
      displaySuspendedMessage();
    }
  })();

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

  function validateInput(event, input) {
    const charCode = event.which ? event.which : event.keyCode;

    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
      return false;
    }

    if (charCode === 46 && input.value.includes(".")) {
      return false;
    }

    const [integer, decimal] = input.value.split(".");
    if (charCode !== 46 && decimal && decimal.length >= 2) {
      return false;
    }
    if (integer.length > 3 || parseFloat(input.value) > 500) {
      return false;
    }

    return true;
  }

  function updateStatus(
    changeOfStatus,
    wholesalerKey,
    onErrorCallback,
    isVanMember,
  ) {
    console.log("starting Updating function");
    var form = $("#wf-form-WholesalerChangeStatusForm ");
    var container = form.parent();

    var data = [
      {
        op: "replace",
        path: "/enabled",
        value: changeOfStatus,
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
          // call custom callback
          result = successCallback(resultData);
          if (!result) {
            // show error (fail) block
            displayMessage(
              "Error",
              "Nie udało się zmienić statusu. Spróbuj ponownie.",
            );
            console.log(e);
            return;
          }
        }
        displayMessage("Success", "Status dostawcy został zmieniony.");
        if (isVanMember && changeOfStatus) {
          $("#smartVanDialog").css("display", "flex");

          const loginValue = (
            organizationName +
            "." +
            wholesalerKey
          ).toLowerCase();

          $("#Wholesaler-Login-2").prop("disabled", true).val(loginValue);
        }
      },
      error: function (jqXHR, exception) {
        console.log("błąd");
        console.log(jqXHR);
        console.log(exception);
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
        form.show();
        return;
      },
    });
  }

  function LogoutNonUser() {
    if (getCookie("sprytnycookie") == null) {
      alert("Twoja sesja wygasła.");
      window.location.href = "https://sprytnykupiec.pl/login-page";
    }
  }

  function getUserRole() {
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      let endpoint = new URL(InvokeURL + "users/" + userKey);
      request.open("GET", endpoint, true);
      request.setRequestHeader("Authorization", orgToken);
      request.setRequestHeader("Requested-By", "webflow-3-4");
      request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
          var data = JSON.parse(request.responseText);
          function setCookieAndSession(cName, cValue, expirationSec) {
            let date = new Date();
            date.setTime(date.getTime() + expirationSec * 1000);
            const expires = "expires=" + date.toUTCString();
            document.cookie =
              cName + "=" + cValue + "; " + expires + "; path=/";
          }
          setCookieAndSession("sprytnyUserRole", data.role, 72000);
          resolve(data.role); // Resolve with the user role
        } else {
          console.error("Error fetching user role. Status:", request.status);
          reject("Error fetching user role"); // Reject if there's an error
        }
      };
      request.onerror = function () {
        console.error("Request error:", request.status);
        reject("Request error"); // Reject if there's a request error
      };
      request.send();
    });
  }

  function displaySuspendedMessage() {
    if (getCookie("sprytnyUserRole") === "admin") {
      displayMessage(
        "Error",
        "Prosimy o uregulowanie zaległych faktur przed dalszym korzystaniem z platformy.",
      );
      hideTabsExceptSettings();
      navigateToInvoiceRow();
      hideTabsExceptSettings();
    } else {
      hideTabsExceptSettings();
      displayMessage(
        "Error",
        "Organizacja została zawieszona. Prosimy o kontakt z opiekunem Twojej organizacji.",
      );
      setTimeout(() => {
        window.location = `https://${DomainName}/app/users/me`;
      }, 3000);
    }
  }

  function hideTabsExceptSettings() {
    $(document).ready(function () {
      const tabsToHide = ["Shops", "Policy", "Integrations", "Documents"];
      tabsToHide.forEach((tab) => $(`a[data-w-tab="${tab}"]`).hide());
      $('a[data-w-tab="Settings"]').show();
    });
  }

  $('.w-tab-link[data-w-tab="Tenant-Informations"]').on("click", function () {
    GetTenantBilling();
  });

  function navigateToInvoiceRow() {
    setTimeout(() => {
      document.querySelector('a[data-w-tab="Settings"]').click();
      setTimeout(() => {
        document.querySelector('a[data-w-tab="Tenant-Informations"]').click();
        setTimeout(() => {
          document
            .getElementById("invoicerow")
            .scrollIntoView({ behavior: "smooth" });
        }, 501);
      }, 501);
    }, 501);
  }

  function setupShopSearch() {
    const searchContainer = document.getElementById("search-shops");
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
        const shopContainer = document.getElementById("Shops-Container");
        if (!shopContainer) return;

        console.log("Filtering shops for term:", searchTerm);
        const shopRows = shopContainer.children;

        for (let row of shopRows) {
          if (row.id === "sampleRowShops") {
            row.style.display = "none";
            continue;
          }

          const shopNameElement = row.querySelector("[shopdata='shopName']");
          const shopKeyElement = row.querySelector("[shopdata='shopKey']");

          if (shopNameElement && shopKeyElement) {
            const shopName = shopNameElement.textContent.toLowerCase();
            const shopKey = shopKeyElement.textContent.toLowerCase();

            if (shopName.includes(searchTerm) || shopKey.includes(searchTerm)) {
              row.style.display = "flex";
            } else {
              row.style.display = "none";
            }
          }
        }
      }, 1); // Debounce to delay execution
    });
  }

  function _n(email) {
    return (email || "").trim().toLowerCase();
  }

  const _NOVUM_B64 =
    "YmllbGN6YUBza2xlcHlub3Z1bS5wbD1CSUVMQ1pBCmJyemVza29Ac2tsZXB5bm92dW0ucGw9QlJaRVNLTwp3b2xhLmRlYmluc2thQHNrbGVweW5vdnVtLnBsPURFQk5PCmtvYnlsZUBza2xlcHlub3Z1bS5wbD1LT0JZTEUKbGFza293YUBza2xlcHlub3Z1bS5wbD1MQVNLT1dBCmxla2lAc2tsZXB5bm92dW0ucGw9TEVLSQptdWNob3drYUBza2xlcHlub3Z1bS5wbD1NVUNIT1dLQQpva29jaW1Ac2tsZXB5bm92dW0ucGw9T0tPQ0lNCnBvcmFia2EuaXdrb3dza2FAc2tsZXB5bm92dW0ucGw9UE9SQUJLQUkKcHJ6eWJvcm93QHNrbGVweW5vdnVtLnBsPVBSWllCT1JPCnVzemV3QHNrbGVweW5vdnVtLnBsPVVTWkVXCnpha2xpY3p5bkBza2xlcHlub3Z1bS5wbD1aQUtMSUNaWQp6ZWdvY2luYUBza2xlcHlub3Z1bS5wbD1aRUdPQ0lOQQpwbGVzbmFAc2tsZXB5bm92dW0ucGw9UExFU05BCmdub2puaWtAc2tsZXB5bm92dW0ucGw9R05PSk5JSwp6bG90YUBza2xlcHlub3Z1bS5wbD1aTE9UQQpncm9zemVrLmtyb2xvd2thQG9wLnBsPVRPVEEKZ3Jvc3play53aXNuaWN6QG9wLnBsPVRPVEEKYnJ6ZXNrby5ibGVraXRuYUBza2xlcHlub3Z1bS5wbD1CUlpFU0tPQgppd2tvd2FAc2tsZXB5bm92dW0ucGw9SVdLT1dBCmJpZXNpYWRraUBza2xlcHlub3Z1bS5wbD1CSUVTSUFESwo=";

  let _novumMapCache = null;

  function _decodeNovumMap() {
    if (_novumMapCache) return _novumMapCache;

    const raw = atob(_NOVUM_B64);
    const m = Object.create(null);

    raw.split("\n").forEach((line) => {
      const s = line.trim();
      if (!s) return;

      const idx = s.indexOf("=");
      if (idx === -1) return;

      const email = _n(s.slice(0, idx));
      const shopKey = s.slice(idx + 1).trim();

      if (email && shopKey) m[email] = shopKey;
    });

    _novumMapCache = m;
    return m;
  }

  function _czestochowaShopKeys(userEmail) {
    const domain = "@spolem.czest.pl";

    if (!userEmail.endsWith(domain)) {
      return null;
    }

    const prefix = userEmail.split("@")[0];

    if (prefix === "megasam") return ["701"];
    if (prefix === "sezam") return ["600"];

    if (prefix.startsWith("sklep")) {
      let num = prefix.slice(5);
      num = num.padStart(3, "0");
      return [num];
    }

    return null;
  }

  function getAllowedShopKeys(userEmail) {
    const email = _n(userEmail);
    if (!email) return null;

    // Pobierz aktualną organizację
    const currentOrganization = getCookie("OrganizationName");

    // NOVUM - filtruj tylko dla organizacji "Novum"
    if (currentOrganization === "Novum") {
      const novum = _decodeNovumMap();
      const novumKey = novum[email];
      if (novumKey) return [novumKey];
    }

    // CZĘSTOCHOWA - filtruj tylko dla organizacji "Spolem" (lub jak się nazywa)
    if (currentOrganization === "PSSCzestochowa") {
      const cz = _czestochowaShopKeys(email);
      if (cz) return cz;
    }

    // Dla wszystkich innych organizacji - pełny dostęp
    return null;
  }

  function getShops() {
    let url = new URL(InvokeURL + "shops?perPage=50");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        const data = JSON.parse(this.response);
        const allShops = data.items;

        const allowedShopKeys = getAllowedShopKeys(attributes["email"]);

        const toParse = allowedShopKeys
          ? allShops.filter((shop) => allowedShopKeys.includes(shop.shopKey))
          : allShops; // null oznacza pełny dostęp

        const shopNumber = toParse.length;

        if (shopNumber > 0) {
          const deleteButton = document.getElementById(
            "deleteOrganizationButton",
          );
          deleteButton.disabled = true;
          deleteButton.style.opacity = "0.4";
          $("#deleteTenantMessage").show();
        }

        const shopContainer = document.getElementById("Shops-Container");
        const shopContainerDocuments = document.getElementById("documentShop");

        toParse.forEach((shop) => {
          const opt = document.createElement("option");
          opt.value = shop.shopKey;
          opt.innerHTML = shop.shopKey;
          shopContainerDocuments.appendChild(opt);
        });

        toParse.forEach((shop) => {
          const style = document.getElementById("sampleRowShops");
          const row = style.cloneNode(true);
          row.style.display = "flex";
          row.removeAttribute("id");

          const shopNameElement = row.querySelector("[shopdata='shopName']");
          if (shopNameElement) shopNameElement.textContent = shop.name;

          const shopKeyElement = row.querySelector("[shopdata='shopKey']");
          if (shopKeyElement) shopKeyElement.textContent = shop.shopKey;

          row.href = `https://${DomainName}/app/shops/shop?shopKey=${shop.shopKey}`;
          shopContainer.appendChild(row);
        });

        setupShopSearch();

        if (toParse.length === 0) {
          document.getElementById("tablecontentshops").style.display = "none";
          document.getElementById("emptystateshops").style.display = "flex";
        }
      } else if (request.status === 401) {
        console.log("Unauthorized");
      } else {
        console.error("Error loading shop info:", request.status);
      }
    };

    request.onerror = function () {
      console.error("Error loading shop info:", request.statusText);
    };

    request.send();
  }

  async function getUsers() {
    while (!getCookie("sprytnyUserRole") && attempts < 5) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (getCookie("sprytnyUserRole") !== "admin") {
      console.log("Action not permitted for non-admin users.");
      return;
    }

    let url = new URL(InvokeURL + "users?perPage=100");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      let dataItems =
        request.status >= 200 && request.status < 400
          ? JSON.parse(this.response).items
          : [];
      if (
        request.status == 403 ||
        (request.status >= 200 && request.status < 400)
      ) {
        var tableUsers = $("#table_users_list").DataTable({
          pagingType: "full_numbers",
          pageLength: 10,
          scrollY: "60vh",
          scrollCollapse: true,
          destroy: true,
          orderMulti: true,
          order: [[3, "desc"]],
          dom: '<"top">frt<"bottom"lip>',
          language: {
            emptyTable: "Nie posiadasz odpowiednich uprawnień",
            info: "Pokazuje _START_ - _END_ z _TOTAL_ rezultatów",
            infoEmpty: "Brak danych",
            infoFiltered: "(z _MAX_ rezultatów)",
            lengthMenu: "Pokaż _MENU_ rekordów",
            loadingRecords: "<div class='spinner'</div>",
            processing: "<div class='spinner'</div>",
            search: "Szukaj:",
            zeroRecords: "Brak pasujących rezultatów",
            paginate: {
              first: "<<",
              last: ">>",
              next: " >",
              previous: "< ",
            },
            aria: {
              sortAscending: ": Sortowanie rosnące",
              sortDescending: ": Sortowanie malejące",
            },
          },
          data: dataItems,
          search: {
            return: true,
          },
          columns: [
            {
              orderable: false,
              data: null,
              width: "20px",
              defaultContent:
                '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d463e9ce9fb54c6dfda04_person-circle.svg" loading="lazy" >',
            },
            {
              orderable: false,
              visible: false,
              data: "id",
            },
            {
              orderable: true,
              data: "email",
            },
            {
              orderable: true,
              data: "status",
              width: "172px",
              render: function (data) {
                if (data === "active") {
                  return '<spann class="positive">Aktywny</spann>';
                } else {
                  return '<spann class="medium">Oczekuję</spann>';
                }
              },
            },
            {
              orderable: true,
              data: "role",
              width: "172px",
              render: function (data, type, row) {
                if (type === "display") {
                  // If role is null, display a disabled dropdown
                  if (data === null) {
                    return `<select class="user-role-select" disabled>
                              <option>-</option>
                            </select>`;
                  }
                  let selectAdminSelected = data === "admin" ? " selected" : "";
                  let selectUserSelected = data === "user" ? " selected" : "";
                  return `
                    <select class="user-role-select" data-user-id="${row.id}">
                      <option value="admin"${selectAdminSelected}>Administrator</option>
                      <option value="user"${selectUserSelected}>Użytkownik</option>
                    </select>
                  `;
                }
                return data;
              },
            },
            {
              orderable: false,
              class: "details-control4",
              width: "36px",
              data: null,
              defaultContent:
                "<img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg' alt='details'></img>",
            },
          ],
        });
        if (request.status == 401) {
          console.log("Unauthorized");
        }
      }
    };
    request.send();
  }

  async function getInvoices() {
    // --- Helpery ---
    const $byId = (id) => document.getElementById(id);
    const safeArr = (v) => (Array.isArray(v) ? v : []);
    const safeStr = (v, fallback = "") => (v == null ? fallback : String(v));
    const safeNum = (v, fallback = 0) =>
      Number.isFinite(Number(v)) ? Number(v) : fallback;
    const safeDate = (v, locale = "pl-PL", fallback = "—") => {
      if (!v) return fallback;
      const d = new Date(v);
      return isNaN(d.getTime()) ? fallback : d.toLocaleDateString(locale);
    };
    const safeMoney = (
      v,
      currency = "PLN",
      locale = "pl-PL",
      fallback = "—",
    ) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return fallback;
      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
        }).format(n);
      } catch {
        return n.toFixed(2);
      }
    };

    // --- Poczekaj max 5s na sprytnyUserRole ---
    let attempts = 0;
    while (!getCookie("sprytnyUserRole") && attempts < 5) {
      await new Promise((r) => setTimeout(r, 1000));
      attempts++;
    }

    // --- Sprawdź rolę admin ---
    const role = getCookie("sprytnyUserRole");
    if (role !== "admin") {
      console.log("Action not permitted for non-admin users.");
      return;
    }

    // --- Sprawdź wymagane elementy DOM, ale nie wywalaj całej funkcji ---
    const emptyEl = $byId("emptystateinvoices");
    const listEl = $byId("invoicesstateinvoices");
    const tableEl = $("#table_invoices_list"); // DataTables używa selektora jQuery

    if (!emptyEl || !listEl) {
      console.warn(
        "Brak elementów #emptystateinvoices / #invoicesstateinvoices – przerwano render.",
      );
      return;
    }

    // --- Zbuduj URL i nagłówki ---
    const url = new URL(InvokeURL + "billing/invoices?perPage=25");

    // --- Pobierz dane (XMLHttpRequest zachowany jak w Twojej wersji) ---
    const request = new XMLHttpRequest();
    request.open("GET", url.toString(), true);
    request.setRequestHeader("Authorization", orgToken);

    request.onload = function () {
      let dataItems = [];
      let okRange = request.status >= 200 && request.status < 400;

      if (okRange) {
        try {
          const response = JSON.parse(this.response);
          dataItems = safeArr(response?.items);
        } catch (error) {
          console.error("Error parsing response:", error);
          dataItems = [];
        }
      }

      // Backend może zwracać 403, ale też puste items – traktuj oba przypadki jako „renderuj stan UI”
      if (request.status === 403 || okRange) {
        const hasRows = Array.isArray(dataItems) && dataItems.length > 0;

        if (!hasRows) {
          emptyEl.style.display = "flex";
          listEl.style.display = "none";
          return;
        }

        emptyEl.style.display = "none";
        listEl.style.display = "flex";

        // Bezpieczny dostęp do organizationName (jeśli global nie istnieje – wstaw pusty)
        const tenantNameSafe =
          typeof organizationName !== "undefined" ? organizationName : "";

        // Inicjalizacja DataTables z defensywnym renderem kolumn
        try {
          // Jeśli DataTables nie jest załadowane
          if (typeof $.fn.DataTable !== "function") {
            console.warn("DataTables not available – pomijam render tabeli.");
            return;
          }

          $("#table_invoices_list").DataTable({
            pagingType: "full_numbers",
            pageLength: 10,
            scrollY: "60vh",
            scrollCollapse: true,
            destroy: true,
            orderMulti: true,
            order: [[3, "asc"]],
            dom: '<"top">frt<"bottom"lip>',
            language: {
              emptyTable: "Brak faktur",
              info: "Pokazuje _START_ - _END_ z _TOTAL_ rezultatów",
              infoEmpty: "Brak danych",
              infoFiltered: "(z _MAX_ rezultatów)",
              lengthMenu: "Pokaż _MENU_ rekordów",
              loadingRecords: "<div class='spinner'></div>",
              processing: "<div class='spinner'></div>",
              search: "Szukaj:",
              zeroRecords: "Brak pasujących rezultatów",
              paginate: { first: "<<", last: ">>", next: " >", previous: "< " },
              aria: {
                sortAscending: ": Sortowanie rosnące",
                sortDescending: ": Sortowanie malejące",
              },
            },
            data: dataItems,
            search: { return: true },
            columns: [
              {
                orderable: false,
                data: null,
                width: "20px",
                defaultContent:
                  '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg" loading="lazy" >',
              },
              {
                orderable: true,
                data: "number",
                render: function (_data, _type, row) {
                  const mainNumber = safeStr(row?.number, "—");
                  const mainContent = `<div>${mainNumber}</div>`;
                  const corrective = safeArr(row?.correctiveInvoices)
                    .map(
                      (c) =>
                        `<div style="margin-top: 5px; font-style: italic;"> - ${safeStr(
                          c?.number,
                          "—",
                        )}</div>`,
                    )
                    .join("");
                  return `${mainContent}${corrective}`;
                },
              },
              {
                orderable: true,
                data: "status",
                width: "128px",
                render: function (_data, _type, row) {
                  const mapBadge = (status) => {
                    switch (status) {
                      case "draft":
                        return '<span class="noneexisting">Szkic</span>';
                      case "sent":
                        return '<span class="noneexisting">Nie Zapłacono</span>';
                      case "paid":
                        return '<span class="positive">Zapłacono</span>';
                      case "overdue":
                        return '<span class="positive">Po terminie</span>';
                      default:
                        return '<span class="noneexisting">Nieznany</span>';
                    }
                  };

                  const main = mapBadge(safeStr(row?.status));
                  const corrective = safeArr(row?.correctiveInvoices)
                    .map(
                      (c) =>
                        `<div style="margin-top: 5px;">${mapBadge(
                          safeStr(c?.status),
                        )}</div>`,
                    )
                    .join("");
                  return `${main}${corrective}`;
                },
              },
              {
                orderable: true,
                data: "paymentDueDate",
                type: "date",
                render: function (_data, _type, row) {
                  const main = safeDate(row?.paymentDueDate);
                  const corrective = safeArr(row?.correctiveInvoices)
                    .map(
                      (c) =>
                        `<div style="margin-top: 5px; font-style: italic;">${safeDate(
                          c?.paymentDueDate,
                        )}</div>`,
                    )
                    .join("");
                  return `${main}${corrective}`;
                },
              },
              {
                orderable: true,
                data: "netTotal",
                render: function (_data, _type, row) {
                  const main = safeMoney(row?.netTotal);
                  const corrective = safeArr(row?.correctiveInvoices)
                    .map(
                      (c) =>
                        `<div style="margin-top: 5px; font-style: italic;">${safeMoney(
                          c?.netTotal,
                        )}</div>`,
                    )
                    .join("");
                  return `${main}${corrective}`;
                },
              },
              {
                orderable: false,
                width: "156px",
                data: null,
                render: function (_data, _type, row) {
                  // Link płatności tylko gdy nie zapłacono i link istnieje
                  const showPay =
                    safeStr(row?.status) !== "paid" &&
                    !!safeStr(row?.paymentLink, "").trim();
                  const paymentLink = showPay
                    ? `<a href="${safeStr(
                        row?.paymentLink,
                      )}" target="_blank" style="margin-left: 0.25rem;">
                       <span class="positive">Zapłać</span>
                     </a>`
                    : " ";

                  const uuid = safeStr(row?.uuid);
                  const number = safeStr(row?.number, "—");

                  const downloadLink = `
                  <a href="#" class="download-invoice" data-uuid="${uuid}" data-tenant="${tenantNameSafe}" data-number="${number}" data-document-type="regular">
                    <img style="margin-left: 0.25rem;" src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg' alt='Pobierz oryginał'>
                  </a>
                  <a href="#" class="download-invoice" data-uuid="${uuid}" data-tenant="${tenantNameSafe}" data-number="${number}" data-document-type="duplicate">
                    <span class="noneexisting" style="margin-left: 0.25rem;">Duplikat</span>
                  </a>
                `;

                  const correctiveLinks = safeArr(row?.correctiveInvoices)
                    .map((c) => {
                      const cPay =
                        safeStr(c?.status) !== "paid" &&
                        !!safeStr(c?.paymentLink, "").trim()
                          ? `<a href="${safeStr(
                              c?.paymentLink,
                            )}" target="_blank" style="margin-left: 0.25rem;">
                           <span class="positive">Zapłać</span>
                         </a>`
                          : " ";
                      return `
                      <div style="margin-top: 0.25rem;">
                        <a href="#" class="download-invoice" data-uuid="${safeStr(
                          c?.uuid,
                        )}" data-tenant="${tenantNameSafe}" data-number="${safeStr(
                          c?.number,
                          "—",
                        )}" data-document-type="regular">
                          <img style="margin-left: 0.25rem;" src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg' alt='Pobierz oryginał'>
                        </a>
                        <a href="#" class="download-invoice" data-uuid="${safeStr(
                          c?.uuid,
                        )}" data-tenant="${tenantNameSafe}" data-number="${safeStr(
                          c?.number,
                          "—",
                        )}" data-document-type="duplicate">
                          <span class="noneexisting" style="margin-left: 0.25rem;">Duplikat</span>
                        </a>
                        ${cPay}
                      </div>`;
                    })
                    .join(" ");

                  return `<div class="action-container">${downloadLink} ${paymentLink}</div> ${correctiveLinks}`;
                },
              },
            ],
          });
        } catch (dtErr) {
          console.error("Błąd renderowania tabeli faktur:", dtErr);
          emptyEl.style.display = "flex";
          listEl.style.display = "none";
        }
      }

      if (request.status === 401) {
        console.log("Unauthorized");
        emptyEl.style.display = "flex";
        listEl.style.display = "none";
      }
    };

    request.onerror = function () {
      console.error("Request failed");
      if ($byId("emptystateinvoices"))
        $byId("emptystateinvoices").style.display = "flex";
      if ($byId("invoicesstateinvoices"))
        $byId("invoicesstateinvoices").style.display = "none";
    };

    request.send();
  }

  $(document).on("click", ".download-invoice", function (e) {
    e.preventDefault();
    const uuid = $(this).data("uuid");
    const tenant = $(this).data("tenant");
    const number = $(this).data("number");
    const documentType = $(this).data("document-type") || "regular"; // Default to "regular" if not specified

    // Function to sanitize the file name
    function sanitizeFilename(name) {
      return name ? name.replace(/[^a-z0-9]/gi, "_").toLowerCase() : "unknown";
    }

    const sanitizedOrganizationName = sanitizeFilename(tenant);
    const sanitizedNumber = sanitizeFilename(number);
    const filename = `${sanitizedOrganizationName}-${sanitizedNumber}.pdf`;

    const url = `${InvokeURL}billing/invoices/${uuid}?documentType=${documentType}`;

    // Show waiting screen
    $("#waitingdots").show();

    fetch(url, {
      headers: {
        Authorization: orgToken,
        Accept: "application/pdf",
        "Requested-By": "webflow-3-4",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename; // Use the sanitized file name here
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Error downloading invoice:", error))
      .finally(() => {
        // Hide waiting screen
        $("#waitingdots").hide();
      });
  });

  $("#table_users_list").on("change", ".user-role-select", function () {
    var userId = $(this).data("user-id");
    var newRole = $(this).val();

    var data = JSON.stringify([
      {
        op: "replace",
        path: "/role",
        value: newRole,
      },
    ]);

    $.ajax({
      url: InvokeURL + "users/" + userId,
      type: "PATCH",
      contentType: "application/json",
      headers: {
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },
      data: data,
      success: function (response) {
        displayMessage("Success", "Rola użytkownika została zmieniona.");
        console.log("Role updated successfully", response);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        displayMessage("Error", "Nie udało się zmienić roli użytkownika.");
        console.error("Failed to update role", textStatus, errorThrown);
      },
    });
  });

  $("#table_users_list").on("click", ".details-control4", function () {
    var row = $(this).closest("tr");

    // Retrieve the DataTable API object
    var dataTable = $("#table_users_list").DataTable();
    var rowData = dataTable.row(row).data();
    var userId = rowData.id; // Assuming the 'id' is stored in the hidden column

    if (!userId) {
      console.error("User ID not found");
      return;
    }

    // Confirm deletion
    if (!confirm("Czyt na pewno chcesz usunąć tego użytkownika?")) {
      return;
    }

    // Proceed with the DELETE request
    $.ajax({
      url: InvokeURL + "users/" + userId, // Construct the request URL
      type: "DELETE",
      contentType: "application/json", // Set the content type to application/json
      headers: {
        Authorization: orgToken, // Ensure you include the authorization header
        "Requested-By": "webflow-3-4",
      },
      success: function (response) {
        console.log("User deleted successfully", response);
        displayMessage("Success", "Użytkownik został usunięty.");
        // Directly targeting the clicked icon's parent row for removal
        dataTable.row(row).remove().draw();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        displayMessage("Error", "Nie udało się usunąć użytkownika.");
        console.error("Failed to delete user", textStatus, errorThrown);
      },
    });
  });

  async function GetTenantBilling() {
    // ---------- Helpery ----------
    const $id = (x) => document.getElementById(x);
    const $ = window.$; // jQuery (jeśli jest)
    const safeArr = (v) => (Array.isArray(v) ? v : []);
    const safeStr = (v, fb = "") => (v == null ? fb : String(v));
    const safeNum = (v, fb = 0) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : fb;
    };
    const safeDateTxt = (v, fb = "—", locale = "pl-PL") => {
      if (!v || v === "0001-01-01T00:00:00Z") return fb;
      const d = new Date(v);
      return isNaN(d.getTime()) ? fb : d.toLocaleDateString(locale);
    };
    const money = (v, currency = "PLN", locale = "pl-PL", fb = "—") => {
      const n = Number(v);
      if (!Number.isFinite(n)) return fb;
      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
        }).format(n);
      } catch {
        return n.toFixed(2);
      }
    };

    // ---------- Czekanie na rolę (max 5s) ----------
    let attempts = 0;
    while (!getCookie("sprytnyUserRole") && attempts < 5) {
      await new Promise((r) => setTimeout(r, 1000));
      attempts++;
    }
    if (getCookie("sprytnyUserRole") !== "admin") {
      console.log("Action not permitted for non-admin users.");
      return;
    }

    // ---------- Kropki na aktywnej karcie ----------
    function showDotForActiveTab() {
      setTimeout(function () {
        const isTab4Active = document.querySelector(
          "#w-tabs-0-data-w-tab-4.w--current",
        );
        const isTab1Active = document.querySelector(
          "#w-tabs-2-data-w-tab-1.w--current",
        );
        const nb1 = document.querySelector(".nb1");
        const nb2 = document.querySelector(".nb2");
        const nb3 = document.querySelector(".nb3");
        const fill = document.querySelector("#fillUpOrganizationDetail");

        if (nb1) nb1.classList.toggle("hidden", !!isTab4Active);
        if (nb2)
          nb2.classList.toggle("hidden", !isTab4Active || !!isTab1Active);
        if (nb3) nb3.classList.toggle("hidden", !isTab1Active);
        if (fill) fill.classList.toggle("hidden", !isTab1Active);
      }, 150);
    }

    // ---------- Request ----------
    const url = new URL(InvokeURL + "billing");
    const request = new XMLHttpRequest();
    request.open("GET", url.toString(), true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");

    request.onload = function () {
      if (request.status < 200 || request.status >= 400) {
        console.error("Error loading tenant billing info:", request.status);
        return;
      }

      // ---------- Parsowanie bez wywrotki ----------
      let data = {};
      try {
        data = JSON.parse(this.response) || {};
      } catch (e) {
        console.error("JSON parse error:", e);
        data = {};
      }

      // Pola mogą być null → zabezpiecz
      const address = data.address ?? {};
      const pricing = data.pricing ?? null; // może być null
      const mcb = data.monthCostBreakdown ?? null; // może być null
      const toDate = mcb?.toDate ?? { total: 0, standard: 0, premium: 0 };
      const forecast = mcb?.forecast ?? { total: 0 };

      // ---------- „All is good” + cookie ----------
      const hasRequiredKeys =
        data.taxId != null &&
        data.companyName != null &&
        address &&
        address.country != null &&
        address.line1 != null &&
        address.town != null &&
        address.postcode != null;

      if (hasRequiredKeys) {
        const setCookieAndSession = (cName, cValue, expirationSec) => {
          const date = new Date();
          date.setTime(date.getTime() + expirationSec * 1000);
          document.cookie = `${cName}=${cValue}; expires=${date.toUTCString()}; path=/`;
        };
        setCookieAndSession("sprytnyOrganizationTaxId", data.taxId, 72000);
      } else {
        showDotForActiveTab();
        document.querySelectorAll("[data-w-tab]").forEach((link) => {
          link.addEventListener("click", showDotForActiveTab);
        });
      }

      // ---------- Wypełnianie formularza (bezpiecznie) ----------
      if ($) {
        $("#tenantNameEdit").val(safeStr(data.companyName));
        $("#tenantTaxIdEdit").val(safeStr(data.taxId));
        $("#firstName").val(safeStr(data.firstName));
        $("#lastName").val(safeStr(data.lastName));
        $("#tenantTownEdit").val(safeStr(address.town));
        $("#tenantPostcodeEdit").val(safeStr(address.postcode));
        $("#tenantAdressEdit").val(safeStr(address.line1));
        $("#tenantAdressEdit2").val(safeStr(address.line2));
        $("#tenantPhoneEdit").val(safeStr(data.phones?.[0]?.phone));
        $("#tenantActivityKind").val(
          safeStr(data.activityKind || "other_business"),
        );
      }

      // ---------- Koszty (null-safe) ----------
      const totalCost = safeNum(toDate.total, 0);
      const standardCost = safeNum(toDate.standard, 0);
      const premiumCost = safeNum(toDate.premium, 0);

      const $std = $id("deleteStandardToDate");
      const $prem = $id("deletePremiumToDate");
      const $sum = $id("deleteTotalToDate");
      if ($std) $std.innerHTML = `Plan Podstawowy: ${money(standardCost)}`;
      if ($prem) $prem.innerHTML = `Plan Premium: ${money(premiumCost)}`;
      if ($sum) $sum.innerHTML = `Suma: ${money(totalCost)}`;

      const $del = $id("deleteTenantDetails");
      if ($del)
        $del.innerHTML = `<strong>Kwota faktury do zapłacenia za bieżący okres wynosi ${money(
          totalCost,
        )}.</strong>`;

      // ---------- Specjalny cennik (pricing może być null) ----------
      const hasSpecial = !!pricing?.specialService;
      const specialBox = $id("specialServiceBox");
      const pricingStandardBox = $id("pricingStandard");
      const pricingPremiumBox = $id("pricingPremium");
      if (specialBox) specialBox.style.display = hasSpecial ? "flex" : "none";
      if (pricingStandardBox)
        pricingStandardBox.style.display = hasSpecial ? "none" : "";
      if (pricingPremiumBox)
        pricingPremiumBox.style.display = hasSpecial ? "none" : "";

      // ---------- Trial / Daty (null-safe) ----------
      const now = new Date();
      let trialEndDateText = "Aktywny";
      let daysLeft = 999;

      if (data.trialEndDate) {
        const trialEndDate = new Date(data.trialEndDate);
        if (!isNaN(trialEndDate.getTime())) {
          const diff = trialEndDate.getTime() - now.getTime();
          daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
          if (daysLeft < 0) {
            trialEndDateText = "Aktywny";
          } else if (daysLeft === 0) {
            trialEndDateText =
              "Twój bezpłatny okres testowy kończy się dzisiaj.";
          } else if (daysLeft === 1) {
            trialEndDateText = "Twój bezpłatny okres testowy kończy się jutro.";
          } else if (daysLeft > 30) {
            const fakeTrialEnd = new Date(
              now.getTime() + 30 * 24 * 60 * 60 * 1000,
            );
            trialEndDateText = `Twój bezpłatny okres testowy kończy się za 30 dni - ${fakeTrialEnd.toLocaleDateString(
              "pl-PL",
            )}.`;
          } else {
            trialEndDateText = `Twój bezpłatny okres testowy kończy się za ${daysLeft} dni - ${trialEndDate.toLocaleDateString(
              "pl-PL",
            )}.`;
          }
        }
      }

      const nextInvoiceDateTxt = safeDateTxt(data.nextInvoiceDate);

      // ---------- Kolorowe kropki animacji ----------
      (function updateAnimationColors(dl) {
        let color = "rgba(42, 168, 255, 0.8)";
        if (dl <= 3) color = "rgba(255, 0, 0, 0.8)";
        else if (dl <= 7) color = "rgba(255, 165, 0, 0.8)";

        // Stosuj unikalny id stylu, aby nie duplikować
        const STYLE_ID = "tourDot-style";
        if (!document.getElementById(STYLE_ID)) {
          const styleSheet = document.createElement("style");
          styleSheet.type = "text/css";
          styleSheet.id = STYLE_ID;
          styleSheet.innerText = `
          @keyframes tourDot {
            0%   { box-shadow: 0 0 0 0px ${color}; }
            80%  { box-shadow: 0 0 0 36px ${color.replace("0.8", "0")}; }
            100% { box-shadow: 0 0 0 36px ${color.replace("0.8", "0")}; }
          }
          .tooltip-dot { animation: tourDot 2.0s ease-out infinite; }
        `;
          document.head.appendChild(styleSheet);
        }

        document.querySelectorAll(".tooltip-dot").forEach((dot) => {
          if (dl <= 1) {
            dot.style.backgroundColor = "rgb(255, 0, 0)";
            dot.style.borderColor = "rgb(255, 0, 0)";
            dot.style.boxShadow = "0 0 0 50px rgba(255, 0, 0, 0)";
          } else if (dl <= 7) {
            dot.style.backgroundColor = "rgb(255, 165, 0)";
            dot.style.borderColor = "rgb(255, 165, 0)";
            dot.style.boxShadow = "0 0 0 50px rgba(255, 165, 0, 0)";
          }
        });
      })(daysLeft);

      // ---------- E-maile (max 3 pola) ----------
      if ($ && Array.isArray(data.emails)) {
        data.emails.slice(0, 3).forEach((email, idx) => {
          $(`#tenantEmailEdit${idx + 1}`).val(safeStr(email?.email));
          $(`#tenantEmailEditDescription${idx + 1}`).val(
            safeStr(email?.description),
          );
        });
      }

      // ---------- Elementy [tenantData] ----------
      document.querySelectorAll("[tenantData]").forEach((el) => {
        const dataType = el.getAttribute("tenantData");
        switch (dataType) {
          case "tenantTrialEndDate":
            el.textContent = trialEndDateText || "Aktywny";
            break;
          case "tenantName":
            el.textContent = safeStr(data.companyName, "N/A");
            break;
          case "organizationName":
            el.textContent =
              typeof organizationName !== "undefined" && organizationName
                ? organizationName
                : "N/A";
            break;
          case "phone":
            el.textContent = safeStr(data.phones?.[0]?.phone, "N/A");
            break;
          case "nextInvoiceDate":
            el.textContent = `Data odnowienia subskrypcji: ${nextInvoiceDateTxt}`;
            break;
          case "forecastTotal":
            el.textContent = `Szacowana kwota faktury: ${money(
              forecast.total ?? 0,
            )}`;
            break;
          case "standard":
            el.textContent = `${money(pricing?.standard ?? 0)}/sklep/mies.`;
            break;
          case "premium":
            el.textContent = `${money(pricing?.premium ?? 0)}/sklep/mies.`;
            break;
          case "specialService":
            if (pricing?.specialService?.fee) {
              el.textContent = `${safeStr(
                pricing.specialService.description,
              )} - ${money(pricing.specialService.fee)}/mies.`;
            } else {
              el.textContent = "N/A";
            }
            break;
          case "name":
            el.textContent = safeStr(data.name, "N/A");
            break;
          case "taxId":
            el.textContent = safeStr(data.taxId, "N/A");
            break;
          case "address": {
            const parts = [
              address.town,
              address.postcode,
              address.line1,
              address.line2,
              address.country,
            ]
              .filter(Boolean)
              .map((x) => safeStr(x));
            el.textContent = parts.length ? parts.join(", ") : "N/A";
            break;
          }
          case "country":
            el.textContent = safeStr(address.country, "N/A");
            break;
          case "town":
            el.textContent = safeStr(address.town, "N/A");
            break;
          case "postcode":
            el.textContent = safeStr(address.postcode, "N/A");
            break;
          case "emails": {
            const emails = safeArr(data.emails)
              .map((e) => safeStr(e?.email))
              .filter(Boolean)
              .join(", ");
            el.textContent = emails || "N/A";
            break;
          }
        }
      });

      // ---------- Self-employment toggle ----------
      const tenantActivityKind = $id("tenantActivityKind");
      const selfEploymentContainer = $id("selfEploymentContainer");
      function toggleSelfEploymentContainer() {
        if (!tenantActivityKind || !selfEploymentContainer) return;
        selfEploymentContainer.style.display =
          tenantActivityKind.value !== "other_business" ? "grid" : "none";
      }
      if (tenantActivityKind) {
        tenantActivityKind.addEventListener(
          "change",
          toggleSelfEploymentContainer,
        );
        toggleSelfEploymentContainer();
      }
    };

    request.onerror = function () {
      console.error(
        "Error loading tenant billing info:",
        request.statusText || "network error",
      );
    };

    request.send();
  }

  let isLoadingWholesalers = false;
  async function getWholesalers() {
    if (isLoadingWholesalers) return;
    isLoadingWholesalers = true;
    const PAGE_SIZE = 50;
    const baseUrl = InvokeURL + "wholesalers";
    const fetchHeaders = {
      Authorization: orgToken,
      "Requested-By": "webflow-3-4",
    };

    async function fetchWholesalersPage(page, perPage) {
      const res = await fetch(
        `${baseUrl}?perPage=${perPage}&page=${page}`,
        { headers: fetchHeaders },
      );
      if (res.status === 401) {
        const err = new Error("Unauthorized");
        err.status = 401;
        throw err;
      }
      if (!res.ok) {
        throw new Error("Failed to load wholesalers page " + page);
      }
      return res.json();
    }

    try {
      // 1) Zapytanie sondujące — pobieramy 1 rekord, żeby poznać total
      const probe = await fetchWholesalersPage(1, 1);
      const total = Number(probe && probe.total) || 0;
      const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 0;

      // 2) Równoległe paczki po PAGE_SIZE — łączymy w jedną listę
      const pagePromises = [];
      for (let p = 1; p <= totalPages; p++) {
        pagePromises.push(fetchWholesalersPage(p, PAGE_SIZE));
      }
      const pages = await Promise.all(pagePromises);
      const items = pages.flatMap((pg) => (pg && pg.items) || []);

      // Ukrycie loadera dopiero po 1sek
      setTimeout(function () {
        $("#waitingdots").hide();
      }, 2000); // 1000 milliseconds = 1 second

      var toParse = items;

        // Sortowanie: najpierw aktywni, potem alfabetycznie po nazwie
        toParse.sort(function (a, b) {
          const enabledDiff = (b.enabled ? 1 : 0) - (a.enabled ? 1 : 0);
          if (enabledDiff !== 0) return enabledDiff;
          return (a.name || "").localeCompare(b.name || "", "pl", {
            sensitivity: "base",
          });
        });

        const organizationName = getCookie("OrganizationName");

        // Mapowanie nazw organizacji na ich TaxId
        const organizationMapping = {
          UnitedBeverages: "8792220128",
          Distribev: "5213681831",
          "Alco-Trade": "6670004078",
          "PGD-Polska": "7792272047",
          Delko: "6792106727",
          Specjal: "5170199121",
          TediDystrybucja: "8440002668",
        };

        // Pobierz TaxId na podstawie nazwy organizacji
        const currentTaxId = organizationMapping[organizationName];

        // Lista TaxID dla UB
        const allowedTaxIds = [
          organizationMapping["UnitedBeverages"],
          organizationMapping["Distribev"],
          organizationMapping["Alco-Trade"],
        ];

        if (organizationName === "PGD-Polska") {
          // Dla PGD filtruj tylko swoje rekordy
          const found = toParse.some((item) => item.taxId === currentTaxId);
          if (found) {
            toParse = toParse.filter((item) => item.taxId === currentTaxId);
          }
        } else if (allowedTaxIds.includes(currentTaxId)) {
          // Dla UB filtruj wszystkie rekordy UB
          toParse = toParse.filter((item) =>
            allowedTaxIds.includes(item.taxId),
          );
        } else if (organizationName === "Delko") {
          // Dla Delko filtruj tylko swoje rekordy
          const found = toParse.some((item) => item.taxId === currentTaxId);
          if (found) {
            toParse = toParse.filter((item) => item.taxId === currentTaxId);
          }
        } else if (organizationName === "Specjal") {
          // Dla Specjal filtruj tylko swoje rekordy
          const found = toParse.some((item) => item.taxId === currentTaxId);
          if (found) {
            toParse = toParse.filter((item) => item.taxId === currentTaxId);
          }
        } else if (organizationName === "TediDystrybucja") {
          // Dla Specjal filtruj tylko swoje rekordy
          const found = toParse.some((item) => item.taxId === currentTaxId);
          if (found) {
            toParse = toParse.filter((item) => item.taxId === currentTaxId);
          }
        } else {
          // Dla innych pozostaw bez zmian
          toParse = toParse;
        }

        // Code for exclusive

        const wholesalerContainer = document.getElementById("wholesalerPicker");
        wholesalerContainer.innerHTML = "";
        var opt = document.createElement("option");
        opt.value = null;
        opt.innerHTML = "BLOKADA";
        wholesalerContainer.appendChild(opt);
        toParse.forEach((wholesaler) => {
          if (wholesaler.enabled) {
            var opt = document.createElement("option");
            opt.value = wholesaler.wholesalerKey;
            opt.innerHTML = wholesaler.name;
            wholesalerContainer.appendChild(opt);
          }
        });

        // Code for documents

        const wholesalerContainerDocuments =
          document.getElementById("documentWholesaler");
        wholesalerContainerDocuments.innerHTML = "";
        toParse.forEach((wholesaler) => {
          if (wholesaler.enabled) {
            var opt = document.createElement("option");
            opt.value = wholesaler.wholesalerKey;
            opt.innerHTML = wholesaler.name;
            wholesalerContainerDocuments.appendChild(opt);
          }
        });

        [
          "WholesalerSelector-Exclusive-2",
          "WholesalerSelector-Exclusive-Edit",
        ].forEach((id) => {
          const container = document.getElementById(id);
          container.innerHTML = "";

          // Dodaj opcję BLOKADA
          const blockOpt = document.createElement("option");
          blockOpt.value = null;
          blockOpt.innerHTML = "BLOKADA";
          container.appendChild(blockOpt);

          // Dodaj hurtowników
          toParse.forEach((wholesaler) => {
            if (wholesaler.enabled) {
              const opt = document.createElement("option");
              opt.value = wholesaler.wholesalerKey;
              opt.innerHTML = wholesaler.name;
              container.appendChild(opt);
            }
          });
        });

        var enabledWholesalers = toParse.filter(function (item) {
          return item.enabled === true;
        });

        $("#table_wholesalers_list").DataTable({
          destroy: true, // Zapobiega duplikatom tabeli
          data: toParse,
          pagingType: "full_numbers",
          order: [],
          dom: '<"top">frt<"bottom"lip>',
          scrollY: "60vh",
          scrollCollapse: true,
          pageLength: 100,
          language: {
            emptyTable: "Brak danych do wyświetlenia",
            info: "Pokazuje _START_ - _END_ z _TOTAL_ rezultatów",
            infoEmpty: "Brak danych",
            infoFiltered: "(z _MAX_ rezultatów)",
            lengthMenu: "Pokaż _MENU_ rekordów",
            loadingRecords: "<div class='spinner'</div>",
            processing: "<div class='spinner'</div>",
            search: "Szukaj:",
            zeroRecords: "Brak pasujących rezultatów",
            paginate: {
              first: "<<",
              last: ">>",
              next: " >",
              previous: "< ",
            },
            aria: {
              sortAscending: ": Sortowanie rosnące",
              sortDescending: ": Sortowanie malejące",
            },
          },
          columns: [
            {
              orderable: false,
              searchable: false,
              data: "image",
              width: "36px",
              height: "36px",
              render: function (data) {
                if (data !== null) {
                  return (
                    "<div style='height:36px width: 36px' class='details-container2'><img src='data:image/png;base64," +
                    data +
                    "' alt='logo'></img></div>"
                  );
                }
                if (data === null) {
                  return "<div style='height:36px width: 36px' class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61ae41350933c525ec8ea03a_office-building.svg' alt='wholesaler'></img></div>";
                }
              },
            },
            {
              orderable: true,
              data: "name",
              render: function (data, type, row) {
                if (data !== null) {
                  // Sprawdzenie, czy vanMember jest true
                  if (row.vanMember) {
                    return `${data} <div class="positive" data-tippy-content="Aktywuj dostawcę, a integracja rozpocznie się automatycznie" style="margin-left: 8px;">SmartVAN</div>`;
                  }
                  return data;
                }
                return ""; // Jeśli data jest null
              },
            },
            {
              orderable: true,
              data: "taxId",
              render: function (data) {
                if (data !== null) {
                  return data;
                }
                if (data === null) {
                  return "";
                }
              },
            },
            {
              orderable: true,
              data: "address",
              visible: false,
              render: function (data) {
                if (data !== null) {
                  return (
                    data.state &&
                    data.state[0].toUpperCase() + data.state.slice(1)
                  );
                }
                if (data === null) {
                  return "";
                }
              },
            },
            {
              orderable: false,
              data: "wholesalerKey",
              visible: false,
              render: function (data) {
                if (data !== null) {
                  return data;
                }
                if (data === null) {
                  return "";
                }
              },
            },
            {
              orderable: true,
              data: "smartvan.smtp.enabled",
              visible: false,
              render: function (data) {
                if (data === true) {
                  return '<span class="positive">Tak</span>';
                } else if (data === false) {
                  return '<span class="negative">Nie</span>';
                }
                return "";
              },
            },
            {
              orderable: true,
              data: "platformUrl",
              render: function (data) {
                if (data !== null) {
                  return '<spann class="positive">Tak</spann>';
                } else {
                  return '<spann class="negative">Nie</spann>';
                }
              },
            },
            {
              orderable: true,
              searchable: false,
              data: "connections.retroactive",
              width: "108px",
              visible: true,
              render: function (data) {
                if (data !== null) {
                  if (data.enabled) {
                    return '<spann class="positive">Tak</spann>';
                  } else {
                    return '<spann class="negative">Nie</spann>';
                  }
                } else {
                  return '<spann class="negative">Nie</spann>';
                }
              },
            },
            {
              orderable: true,
              data: "enabled",
              render: function (data, type, row) {
                if (type === "display") {
                  if (data) {
                    return (
                      '<label class="switchCss"><input type="checkbox" checked class="editor-active"  wholesalerKey="' +
                      row["wholesalerKey"] +
                      '"><span class="slider round"></span></label>'
                    );
                  } else {
                    return (
                      '<label class="switchCss"><input type="checkbox" class="editor-active" wholesalerKey="' +
                      row["wholesalerKey"] +
                      '"><span class="slider round"></span></label>'
                    );
                  }
                }
                return data;
              },
            },
            {
              orderable: false,
              data: "wholesalerKey",
              render: function (data) {
                if (data !== null) {
                  return (
                    '<div class="action-container"><a href="https://' +
                    DomainName +
                    "/app/wholesalers/wholesaler-page?wholesalerKey=" +
                    data +
                    '"class="buttonoutline editme w-button">Przejdź</a></div>'
                  );
                }
                if (data === null) {
                  return "";
                }
              },
            },
          ],
          initComplete: function () {
            // Powiąż pole wyszukiwania z funkcją wyszukiwania tabeli
            $(
              'input[type="search"][aria-controls="table_wholesalers_list"]',
            ).off("keyup").on("keyup", (e) => {
              this.api().search(e.target.value).draw();
            });
            initializeSimpleTooltips();
          },
        });

        $("#table_wholesalers_list_bonus").DataTable({
          destroy: true, // Zapobiega duplikatom tabeli
          data: enabledWholesalers,
          pagingType: "full_numbers",
          order: [],
          dom: '<"top">frt<"bottom"lip>',
          scrollY: "60vh",
          scrollCollapse: true,
          pageLength: 100,
          language: {
            emptyTable: "Brak danych do wyświetlenia",
            info: "Pokazuje _START_ - _END_ z _TOTAL_ rezultatów",
            infoEmpty: "Brak danych",
            infoFiltered: "(z _MAX_ rezultatów)",
            lengthMenu: "Pokaż _MENU_ rekordów",
            loadingRecords: "<div class='spinner'</div>",
            processing: "<div class='spinner'</div>",
            search: "Szukaj:",
            zeroRecords: "Brak pasujących rezultatów",
            paginate: {
              first: "<<",
              last: ">>",
              next: " >",
              previous: "< ",
            },
            aria: {
              sortAscending: ": Sortowanie rosnące",
              sortDescending: ": Sortowanie malejące",
            },
          },
          columns: [
            {
              orderable: false,
              searchable: false,
              data: "image",
              width: "36px",
              height: "36px",
              render: function (data) {
                if (data !== null) {
                  return (
                    "<div style='height:36px width: 36px' class='details-container2'><img src='data:image/png;base64," +
                    data +
                    "' alt='logo'></img></div>"
                  );
                }
                if (data === null) {
                  return "<div style='height:36px width: 36px' class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61ae41350933c525ec8ea03a_office-building.svg' alt='wholesaler'></img></div>";
                }
              },
            },
            {
              orderable: true,
              data: "name",
              render: function (data) {
                if (data !== null) {
                  return data;
                }
                if (data === null) {
                  return "";
                }
              },
            },
            {
              orderable: true,
              data: "taxId",
              render: function (data) {
                if (data !== null) {
                  return data;
                }
                if (data === null) {
                  return "";
                }
              },
            },
            {
              orderable: false,
              data: "wholesalerKey",
              visible: false,
              render: function (data) {
                if (data !== null) {
                  return data;
                }
                if (data === null) {
                  return "";
                }
              },
            },
            {
              orderable: false,
              data: "preferentialBonus",
              render: function (data, type, row) {
                return (
                  '<input type="number" step="0.01" style="max-width: 80px" title="Wprowadź wartość od -99.99 do 500.0 z dokładnością do dwóch miejsc dziesiętnych." min="-99.99" max="500" value="' +
                  data +
                  '">'
                );
              },
            },
          ],
          initComplete: function () {
            // Powiąż pole wyszukiwania z funkcją wyszukiwania tabeli
            $(
              'input[type="search"][aria-controls="table_wholesalers_list_bonus"]',
            ).off("keyup").on("keyup", (e) => {
              this.api().search(e.target.value).draw();
            });
          },
        });

        $("#table_wholesalers_list").on(
          "change",
          "input.editor-active",
          function () {
            var checkbox = this; // Reference to the checkbox
            var isChecked = checkbox.checked; // Current state
            var row = $("#table_wholesalers_list")
              .DataTable()
              .row($(this).closest("tr")); // Get the DataTable row
            var data = row.data(); // Get row data

            var onErrorCallback = function () {
              // Revert checkbox state if there's an error
              $(checkbox).prop("checked", !isChecked);
            };

            if (isChecked) {
              updateStatus(
                true,
                checkbox.getAttribute("wholesalerKey"),
                onErrorCallback,
                data.vanMember,
              );
              // Add to the second table if enabled
              addToSecondTable(data);
            } else {
              updateStatus(
                false,
                checkbox.getAttribute("wholesalerKey"),
                onErrorCallback,
                data.vanMember,
              );
              // Remove from the second table if disabled
              removeFromSecondTable(data.wholesalerKey);
            }
          },
        );

        function addToSecondTable(data) {
          var tableBonus = $("#table_wholesalers_list_bonus").DataTable();
          tableBonus.row.add(data).draw();
        }

        function removeFromSecondTable(wholesalerKey) {
          var tableBonus = $("#table_wholesalers_list_bonus").DataTable();
          var rowIndex = tableBonus
            .rows(function (idx, data, node) {
              return data.wholesalerKey === wholesalerKey;
            })
            .indexes();
          tableBonus.row(rowIndex).remove().draw();
        }

    } catch (err) {
      if (err && err.status === 401) {
        console.log("Unauthorized");
      } else {
        console.error("Error loading wholesalers:", err);
      }
      $("#waitingdots").hide();
    } finally {
      isLoadingWholesalers = false;
    }
  }

  const policyLink = document.querySelector('a[data-w-tab="Policy"]');
  if (!policyLink) return;

  policyLink.addEventListener("click", async () => {
    try {
      console.log("▶️ Kliknięto Policy. Pokazuję spinner...");
      $("#waitingdots").show();

      // Wymuś render (tick event loop)
      await new Promise((resolve) => setTimeout(resolve, 0));

      console.log("📦 Rozpoczynam getWholesalers()");
      await getWholesalers();

      console.log("📦 Rozpoczynam getExclusiveProducts()");
      await getExclusiveProducts();
      console.log("✅ getExclusiveProducts() zakończony");

      console.log("📦 Rozpoczynam getPricats()");
      await getPricats();
      console.log("✅ getPricats() zakończony");
    } catch (error) {
      console.error("❌ Błąd:", error);
    } finally {
      console.log("🛑 Ukrywam spinner...");
      $("#waitingdots").hide();
    }
  });

  // --- start: podpięcie zakładki Integracje (tylko admin) ---
  getUserRole()
    .then((role) => {
      return Promise.all([
        getUsers(),
        getInvoices(),
        controlTabVisibility(),
      ]).then(() => role);
    })
    .then((role) => {
      if (role === "admin") {
        const integrationsTab = document.querySelector(
          "#w-tabs-0-data-w-tab-3",
        );
        if (integrationsTab) {
          console.log("Integration Tab");
          integrationsTab.addEventListener(
            "click",
            () => {
              // Bez kulek: kafle ładujemy od razu, testy startują w tle.
              getIntegrations();
            },
            { once: true },
          );
        }
      }

      setTimeout(
        () => initializeSimpleTooltips && initializeSimpleTooltips(),
        1000,
      );

      // Przekierowanie do konkretnej zakładki na podstawie parametru URL ?tab=
      var tabParam = new URLSearchParams(window.location.search).get("tab");
      if (tabParam) {
        // Sub-taby zagnieżdżone w "Policy" (Polityka Zakupowa)
        var policySubTabs = [
          "Wholesalers",
          "Pricelists",
          "Exclusive",
          "Premium",
        ];
        if (policySubTabs.indexOf(tabParam) !== -1) {
          // Najpierw kliknij tab nadrzędny "Policy"
          var policyTab = document.querySelector('a[data-w-tab="Policy"]');
          if (policyTab) {
            policyTab.click();
          }
        }
        // Kliknij docelowy tab (sub-tab lub główny)
        setTimeout(function () {
          var tabLink = document.querySelector(
            'a[data-w-tab="' + tabParam + '"]',
          );
          if (tabLink) {
            tabLink.click();
          }
        }, 300);
      }
    })
    .catch((error) => {
      console.error(
        "Error while fetching user role or subsequent data:",
        error,
      );
    });

  // 2) Ładowanie kafli + tławe testy (BEZ kulek)
  async function getIntegrations() {
    // anty-duplikat (opcjonalnie)
    if (window._integrationsLoaded) return;

    // poczekaj max 5s na cookie roli
    let attempts = 0;
    while (!getCookie("sprytnyUserRole") && attempts < 5) {
      await new Promise((r) => setTimeout(r, 1000));
      attempts++;
    }
    if (getCookie("sprytnyUserRole") !== "admin") {
      console.log("Action not permitted for non-admin users.");
      return;
    }

    try {
      const url = new URL(InvokeURL + "integrations");
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: orgToken, "Requested-By": "webflow-3-4" },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const items = data.items || [];

      // render kafli natychmiast; testy odpalamy w tle
      items.forEach(processIntegration);

      // tooltipy po wyrenderowaniu kafli
      setTimeout(
        () => initializeSimpleTooltips && initializeSimpleTooltips(),
        0,
      );

      window._integrationsLoaded = true;
    } catch (error) {
      console.error("Error fetching integrations:", error);
    }
  }

  function processIntegration(integration) {
    const $row = $("#Sample-Integration").clone().css("display", "flex");

    $row.find("h6").eq(0).text(integration.name);
    $row
      .find("img")
      .eq(0)
      .attr("src", `data:image/png;base64,${integration.image}`);

    const $status = $row.find("h6").eq(2);

    // 1) Status początkowy
    if (integration.enabled === true) {
      if (integration.integrationKey === "kc-firma") {
        // bez testu
        updateIntegrationStatus($status, "Succeeded");
      } else {
        // test będzie w tle → „Testuję”
        updateIntegrationStatus($status, "Testuję...");
        // 2) Start testu w tle
        checkIntegrationStatus(integration, $status);
      }
    } else {
      updateIntegrationStatus($status, "Oczekuję");
    }

    // link
    $row.attr("href", getIntegrationHref(integration.integrationKey));

    // (opcjonalnie) przycisk akcji do „altowania” integracji
    // <button class="js-integration-action" data-key="pc-market" data-action="enable">Włącz</button>
    // Podpinamy delegację niżej.

    $("#Integrations-Container").append($row);
  }

  function updateIntegrationStatus($element, statusText) {
    // Mapowanie: Succeeded → Aktywny, Oczekuję → Oczekuję, wszystko inne → Błąd
    let uiText, color;
    if (statusText === "Succeeded") {
      uiText = "Aktywny";
      color = "green";
    } else if (statusText === "Oczekuję") {
      uiText = "Oczekuję";
      color = "gray";
    } else if (statusText === "Testuję...") {
      uiText = "Testuję...";
      color = "gray";
    } else {
      uiText = "Błąd";
      color = "red"; // np. 504, Failed, Error, itp.
    }
    $element.text(uiText).css("color", color || "");
    // tippy
    $element.attr("class", "tippy"); // nadpisanie klas pod tippy
    $element.attr("data-tippy-content", `Status: ${uiText}`);
  }

  // Test integracji – w tle, BEZ kulek
  function checkIntegrationStatus(integration, $integrationStatus) {
    $.ajax({
      url: new URL(
        InvokeURL + "integrations/" + integration.integrationKey + "/test",
      ),
      type: "GET",
      headers: { Authorization: orgToken, "Requested-By": "webflow-3-4" },
      success: (response) => {
        // jeżeli backend zwraca np. { status: "Succeeded" | "Failed" ... }
        const s = (response && response.status) || "Failed";
        updateIntegrationStatus(
          $integrationStatus,
          s === "Succeeded" ? "Succeeded" : "Failed",
        );
      },
      error: (xhr) => {
        // 504 = Błąd
        if (xhr && xhr.status === 504) {
          updateIntegrationStatus($integrationStatus, "504");
        } else {
          updateIntegrationStatus($integrationStatus, "Failed");
        }
      },
    });
  }

  function getIntegrationHref(integrationKey) {
    switch (integrationKey) {
      case "retroactive":
        return `https://${DomainName}/app/integrations/contracts`;
      case "merchant-console":
        return `https://${DomainName}/app/integrations/merchant-console`;
      case "pc-market":
        return `https://${DomainName}/app/integrations/pc-market`;
      case "kc-firma":
        return `https://${DomainName}/app/integrations/kc-firma`;
      default:
        return "#";
    }
  }

  // 3) „Kulki” TYLKO dla akcji zmieniających stan integracji (enable/disable/retry itp.)
  $(document).on("click", ".js-integration-action", async function (e) {
    e.preventDefault();

    const $btn = $(this);
    const key = $btn.data("key"); // np. "pc-market"
    const action = $btn.data("action"); // np. "enable" | "disable" | "retest"
    const $status = $btn
      .closest("#Sample-Integration, .integration-row")
      .find("h6")
      .eq(2);

    try {
      $("#waitingdots").show(); // kulki TYLKO na czas „altowania”
      // przykład – dopasuj endpoint/metodę do swojej API:
      const resp = await fetch(
        new URL(InvokeURL + `integrations/${key}/${action}`),
        {
          method: "POST",
          headers: { Authorization: orgToken, "Requested-By": "webflow-3-4" },
        },
      );

      if (!resp.ok) {
        // 504 → Błąd
        if (resp.status === 504) {
          updateIntegrationStatus($status, "504");
        } else {
          updateIntegrationStatus($status, "Failed");
        }
        throw new Error(`${resp.status} ${resp.statusText}`);
      }

      // Po udanej operacji możesz:
      // 1) odświeżyć status pojedynczej integracji testem w tle
      updateIntegrationStatus($status, "Oczekuję");
      checkIntegrationStatus({ integrationKey: key }, $status);
    } catch (err) {
      console.error("Błąd akcji integracji:", err);
    } finally {
      $("#waitingdots").hide();
    }
  });

  // --- end: getIntegrations ---

  makeWebflowFormAjaxDelete = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var endpoint = InvokeURL + "tenants/" + organizationName;

        $.ajax({
          type: "DELETE",
          url: endpoint,
          cors: true,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            $("#waitingdots").hide();
          },
          headers: {
            Authorization: orgToken,
            "Requested-By": "webflow-3-4",
          },
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();

                displayMessage("Error", "Nie udało się usunąć organizacji.");
                failBlock.show();
                return;
              }
            }
            $("#deleteOrganizationModal").hide();
            displayMessage("Success", "Organizacja została usunięta.");
            window.setTimeout(function () {
              window.location = "https://" + DomainName + "/app/users/me";
            }, 1000);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";
            if (jqXHR.status === 0) {
              msg = "Not connect.\n Verify Network.";
            } else if (jqXHR.status === 403) {
              msg = "Użytkownik nie ma uprawnień do usunięcia organizacji.";
            } else if (jqXHR.status === 409) {
              msg =
                "Aby móc usunąć organizację, prosimy o uregulowanie zaległych faktur.";
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
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxInvite = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action = InvokeURL + "users";
        var emailInput = $("#InviteUserEmail");
        var emailValue = emailInput.val();

        // Check if the email domain is @gmail.com and convert it to lowercase
        if (emailValue.indexOf("@gmail.com") !== -1) {
          emailValue = emailValue.toLowerCase();
        }

        var data = {
          email: emailValue,
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
                displayMessage("Error", "Nie udało się wysłać zaproszenia.");
                console.log(e);
                return;
              }
            }
            displayMessage(
              "Success",
              "Zaproszenie zostało wysłane. Możesz wysłać kolejne.",
            );
            emailInput.val("");
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";

            // Handle different error cases
            if (jqXHR.status === 0) {
              msg = "Not connect. Verify Network.";
            } else if (jqXHR.status === 403) {
              msg =
                "Użytkownika nie ma na liście osób uprawnionych do dołączenia do organizacji. Proszę skontaktuj się z nami w celu dodania uprawnień. kontakt@smartcommerce.net";
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
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjax = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        event.preventDefault();
        var action = InvokeURL + "tenants/" + organizationName;
        var NewOrgName = $("#NewOrganizationName").val();

        var data = [
          {
            op: "replace",
            path: "/name",
            value: NewOrgName,
          },
        ];
        // call via ajax
        $.ajax({
          type: "PATCH",
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
                displayMessage("Error", "Nie udało się utworzyć organizacji.");
                console.log(e);
                return;
              }
            }
            form.hide();
            displayMessage("Success", "Organizacja została utworzona.");
            window.setTimeout(function () {
              window.location = "https://" + DomainName + "/app/users/me";
            }, 500);
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
            return;
          },
        });
        // prevent default webdlow action
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxCreate = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var modalCreateShop = $("#modalCreateShop");
        var action = InvokeURL + "shops";
        var data = {
          name: $("#newShopName").val(),
          shopKey: $("#newShopKey").val().toUpperCase(),
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
                displayMessage("Error", "Nie udało się utworzyć sklepu.");
                console.log(e);
                return;
              }
            }
            form.hide();
            modalCreateShop.hide();
            displayMessage("Success", "Twój sklep został utworzony.");
            window.setTimeout(function () {
              location.reload();
            }, 1000);
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            displayMessage("Error", "Nie udało się utworzyć sklepu.");
            console.log(e);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  async function getExclusiveProducts() {
    const nowDate = new Date();
    let initialrecords = null;

    if ($.fn.dataTable.isDataTable("#table_id")) {
      $("#table_id").DataTable().clear().destroy();
    }

    $("#table_id").DataTable({
      pagingType: "full_numbers",
      order: [],
      dom: '<"top">rt<"bottom"lip>',
      scrollY: "60vh",
      scrollCollapse: true,
      pageLength: 25,
      language: {
        emptyTable: "Brak danych do wyświetlenia",
        info: "Pokazuje _START_ - _END_ z _TOTAL_ rezultatów",
        infoEmpty: "Brak danych",
        infoFiltered: "(z _MAX_ rezultatów)",
        lengthMenu: "Pokaż _MENU_ rezultatów",
        search: "Szukaj:",
        zeroRecords: "Brak pasujących rezultatów",
        paginate: { first: "<<", last: ">>", next: " >", previous: "< " },
      },
      serverSide: true,
      processing: false,
      destroy: true,
      search: { return: true },
      ajax: function (data, callback, settings) {
        let QStr = `?perPage=${data.length}&page=${
          (data.start + data.length) / data.length
        }`;

        const searchBox = $("#gtinName").val().trim();
        if (/^\d+$/.test(searchBox)) {
          QStr += `&gtin=${searchBox}`;
        } else if (searchBox) {
          QStr += `&name=like:${searchBox}`;
        }

        const wholesaler = $("#wholesalerPicker")
          .map(function () {
            return this.value;
          })
          .get()
          .toString();
        if (wholesaler) QStr += `&wholesalerKey=${wholesaler}`;

        const startDate = $("#startDate").val();
        if (startDate) QStr += `&startDate=gte:${startDate}T00:00:00Z`;

        const endDate = $("#endDate").val();
        if (endDate) QStr += `&endDate=lte:${endDate}T00:00:00Z`;

        const status = $("#statusPicker").val();
        if (status) QStr += `&status=${status}`;

        const sortColumnMap = {
          3: "gtin:",
          4: "name:",
          6: "wholesalerKey:",
          8: "startDate:",
          9: "endDate:",
          10: "modified.by:",
          11: "modified.at:",
        };
        let sortColumn = "null",
          direction = "desc";
        if (data.order.length > 0) {
          sortColumn = sortColumnMap[data.order[0].column] || "null";
          direction = data.order[0].dir;
        }
        if (sortColumn !== "null") QStr += `&sort=${sortColumn}${direction}`;

        $.ajax({
          url: InvokeURL + "exclusive-products" + QStr,
          method: "GET",
          headers: { Authorization: orgToken, "Requested-By": "webflow-3-4" },
          beforeSend: () => $("#waitingdots").show(),
          success: function (res) {
            const isFirstRequest = initialrecords === null;
            if (isFirstRequest) initialrecords = res.total;

            callback({
              recordsTotal: res.total,
              recordsFiltered: res.total,
              data: res.items,
            });

            const showEmptyState = isFirstRequest && res.total === 0;
            $("#emptystateexclusive").css(
              "display",
              showEmptyState ? "flex" : "none",
            );
            $("#fullstateexclusive").css(
              "display",
              showEmptyState ? "none" : "flex",
            );

            setTimeout(() => {
              $.fn.dataTable
                .tables({ visible: true, api: true })
                .columns.adjust();
            }, 400);
          },
          error: function (jqXHR, exception) {
            let msg = "";
            const serverMsg =
              jqXHR?.responseJSON?.message || jqXHR?.responseText;

            if (jqXHR.status === 0) {
              msg = "Brak połączenia z siecią. Sprawdź internet.";
            } else if (jqXHR.status === 403) {
              msg = "Brak uprawnień do wykonania tej operacji (403).";
            } else if (jqXHR.status === 400) {
              if (typeof serverMsg === "string") {
                if (/Invalid GTIN length/i.test(serverMsg)) {
                  msg = "Nieprawidłowa długość GTIN. Zweryfikuj wpisany numer.";
                } else if (
                  /Field \[.*\] not supported for sorting/i.test(serverMsg)
                ) {
                  const match = serverMsg.match(
                    /Supported fields:\s*\[(.+)\]/i,
                  );
                  const supported = match
                    ? match[1].replace(/\s*http:\/\/\s*/g, "").trim()
                    : "";
                  msg =
                    "To pole nie jest obsługiwane do sortowania. Dozwolone pola: " +
                    supported +
                    ".";
                } else {
                  msg = serverMsg;
                }
              } else {
                msg = "Nieprawidłowe dane zapytania (400).";
              }
            } else if (jqXHR.status === 500) {
              msg = "Błąd serwera (500). Spróbuj ponownie później.";
            } else if (exception === "parsererror") {
              msg = "Błąd przetwarzania odpowiedzi (parsererror).";
            } else if (exception === "timeout") {
              msg = "Przekroczono czas oczekiwania (timeout).";
            } else if (exception === "abort") {
              msg = "Żądanie zostało przerwane (abort).";
            } else {
              msg = serverMsg || "Wystąpił nieznany błąd.";
            }

            console.log(jqXHR);
            console.log(exception);

            if (typeof displayMessage === "function") {
              displayMessage("Error", msg);
            } else {
              alert(msg);
            }

            callback({ recordsTotal: 0, recordsFiltered: 0, data: [] });
          },
          complete: () => $("#waitingdots").hide(),
        });
      },
      columns: [
        { visible: false, orderable: false, data: "uuid" },
        { visible: false, orderable: false, data: "created.at" },
        { visible: false, orderable: false, data: "created.by" },
        { orderable: true, data: "gtin" },
        { orderable: true, data: "name" },
        {
          orderable: false,
          data: "countryDistributorName",
          defaultContent: "-",
        },
        {
          orderable: true,
          data: null,
          render: function (data) {
            if (data?.wholesalerName != null) return data.wholesalerName;
            return "BLOKADA";
          },
        },
        { orderable: false, data: "priceThreshold", defaultContent: "-" },
        {
          visible: false,
          orderable: true,
          data: "wholesalerKey",
          render: function (data) {
            if (data !== null) return data;
            return "BLOKADA";
          },
        },
        {
          orderable: true,
          data: "startDate",
          render: function (data) {
            if (data !== null) {
              const startDate = new Date(data);
              return startDate.toLocaleDateString("pl-PL");
            }
            return "";
          },
        },
        {
          orderable: true,
          data: null,
          render: function (data) {
            const val = data?.endDate;
            if (val === "infinity")
              return '<span class="positive">Bezterminowo</span>';
            if (!val) return "";
            const end = new Date(val);
            if (isNaN(end.getTime()))
              return '<span class="noneexisting">—</span>';

            const now = new Date();
            const todayUTC = new Date(
              Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
              ),
            );
            const endDateUTC = new Date(
              Date.UTC(
                end.getUTCFullYear(),
                end.getUTCMonth(),
                end.getUTCDate(),
              ),
            );

            const myendDate = endDateUTC.toLocaleDateString("pl-PL", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
            return endDateUTC >= todayUTC
              ? '<span class="positive">' + myendDate + "</span>"
              : '<span class="noneexisting">' + myendDate + "</span>";
          },
        },
        {
          orderable: true,
          data: "modified",
          render: function (data) {
            if (data?.by) return data.by;
            return "-";
          },
        },
        {
          orderable: false,
          data: "modified",
          render: function (data) {
            if (data?.at) {
              const d = new Date(data.at);
              return d.toLocaleString("pl-PL", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              });
            }
            return "";
          },
        },
        {
          orderable: false,
          data: null,
          width: "72px",
          render: function (row) {
            const ICON = (src, action, disabled = false, title = "") => {
              const size = 18;
              const base = `width:${size}px;height:${size}px;vertical-align:middle;`;
              const extra = disabled
                ? "opacity:.4;cursor:not-allowed"
                : "cursor:pointer";
              return `<img style="${base}${extra}" src="${src}" action="${action}" alt="${action}" title="${title}">`;
            };
            const WRAP = (html) =>
              `<span style="display:inline-flex;align-items:center;gap:8px">${html}</span>`;

            const editIcon = ICON(
              "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/640442ed27be9b5e30c7dc31_edit.svg",
              "edit",
              false,
              "Edytuj",
            );
            const plusIcon = ICON(
              "https://cdn.prod.website-files.com/6041108bece36760b4e14016/64c8d07d6149a13907618b26_icon_plus.svg",
              "create",
              false,
              "Dodaj nową na podstawie",
            );
            const deleteIcon = ICON(
              "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg",
              "delete",
              false,
              "Usuń",
            );

            // --- ROBUST: wykrywamy BLOKADĘ także gdy wholesalerKey jest undefined
            const isBlock =
              !("wholesalerKey" in row) || row.wholesalerKey == null;

            // Daty → północ UTC
            const toUtcMidnight = (v) => {
              if (!v) return null;
              if (v === "infinity") return "infinity";
              const d = new Date(v);
              if (isNaN(d.getTime())) return null;
              return new Date(
                Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
              );
            };

            const now = new Date();
            const todayUTC = new Date(
              Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
              ),
            );
            const start = row?.startDate ? new Date(row.startDate) : null;
            const endUTC = toUtcMidnight(row?.endDate);
            const isInfinity = endUTC === "infinity";
            const hasStarted = !!start && start <= now;
            const isActiveNow =
              isInfinity || (endUTC && endUTC >= todayUTC && hasStarted);
            const isEnded =
              endUTC && endUTC !== "infinity" && endUTC < todayUTC;

            if (isBlock) {
              // BLOKADY:
              //  - aktywne lub bezterminowe → EDIT
              //  - zakończone lub jeszcze nieaktywne → PLUS
              return isActiveNow
                ? WRAP(editIcon + deleteIcon)
                : WRAP(plusIcon + deleteIcon);
            }

            if (isEnded) {
              // zakończone nie-blokady: pozwól utworzyć nową na podstawie starej
              return WRAP(plusIcon + deleteIcon);
            }
            return WRAP(editIcon + deleteIcon);
          },
        },
      ],
      initComplete: function () {
        const api = this.api();
        const textBox = $("#table_id_filter label input");

        $("#wholesalerPicker").on("change", () => api.draw());
        $("#statusPicker").on("change", () => api.draw());

        let typingTimer;
        const typingDelay = 3000;
        $("#gtinName")
          .on("input", function () {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => api.draw(), typingDelay);
          })
          .on("keypress", function (e) {
            if (e.key === "Enter") {
              clearTimeout(typingTimer);
              api.draw();
            }
          });

        $("#startDate, #endDate").each(function () {
          $(this)
            .datepicker({ onSelect: () => $(this).change() })
            .on("change", () => api.draw());
        });

        $(".dataTables_filter input").on("focusout", () => api.draw());

        textBox.unbind().bind("keyup input", function (e) {
          if (e.keyCode == 13) api.search(this.value).draw();
        });

        $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
      },
    });
  }

  async function getPricats() {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // Prosty pluralizer – „1 dzień” / „2 dni”
    const plural = (n, sing, plur) => (n === 1 ? sing : plur);

    // ===================== 1. FETCH =====================
    const url = new URL(`${InvokeURL}van/pricats?perPage=1000`);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: orgToken,
          "Requested-By": "webflow-3-4",
        },
      });

      if (!response.ok) throw new Error(response.status);

      const data = await response.json();

      // ================= 2. MAPOWANIE ===================
      const now = new Date(); // bieżąca chwila
      const parsed = data.items.map((item) => {
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);

        // Koniec dnia – 23:59:59, żeby „dziś” nie przepadało o północy
        endDate.setHours(23, 59, 59, 999);

        const diffDays = Math.floor((endDate - now) / MS_PER_DAY); // pełne dni w dół
        const bucket = diffDays < 0 ? 1 : 0; // 0 = nadal ważny, 1 = wygasły

        // ---------- 2a. Teksty dla kolumn ----------
        let status, label;

        if (diffDays > 3) {
          status = "Aktywny";
          label = `Ważny jeszcze ${diffDays} ${plural(
            diffDays,
            "dzień",
            "dni",
          )}`;
        } else if (diffDays > 0) {
          status = "Kończy się";
          label = `Kończy się za ${diffDays} ${plural(
            diffDays,
            "dzień",
            "dni",
          )}`;
        } else if (diffDays === 0) {
          status = "Kończy się";
          label = "Kończy się dziś";
        } else if (diffDays === -1) {
          status = "Zakończony wczoraj";
          label = "Zakończony wczoraj";
        } else {
          status = "Zakończony";
          label = `Skończył się ${Math.abs(diffDays)} ${plural(
            Math.abs(diffDays),
            "dzień",
            "dni",
          )} temu`;
        }

        // ---------- 2b. Klasy kolorystyczne ----------
        const ageClass =
          diffDays > 3
            ? "positive"
            : diffDays >= 0
              ? "medium" // 0-3 dni
              : diffDays >= -3
                ? "negative"
                : "negative";

        return {
          ...item,
          diffDays,
          bucket, // <── DODANE
          status,
          label,
          ageClass,
          startDate, // przyda się później do sortowania
          endDate,
        };
      });

      // Pokaż/ukryj pusty stan
      $("#emptystatepricelists").toggle(parsed.length === 0);
      $("#pricelistscontainer").toggle(parsed.length > 0);

      // ========= 3. (Re)INIT DATATABLE ===============
      if ($.fn.DataTable.isDataTable("#table_pricelists_list")) {
        $("#table_pricelists_list").DataTable().clear().destroy();
      }

      const table = $("#table_pricelists_list").DataTable({
        data: parsed,
        order: [[5, "desc"]],
        pagingType: "full_numbers",
        scrollY: "60vh",
        scrollCollapse: true,
        pageLength: 10,
        dom: '<"top">rt<"bottom"lip>',
        language: {
          emptyTable: "Brak danych do wyświetlenia",
          info: "Pokazuje _START_ – _END_ z _TOTAL_ rezultatów",
          infoEmpty: "Brak danych",
          infoFiltered: "(z _MAX_ rezultatów)",
          lengthMenu: "Pokaż _MENU_ rekordów",
          loadingRecords: "<div class='spinner'></div>",
          processing: "<div class='spinner'></div>",
          search: "Szukaj:",
          zeroRecords: "Brak pasujących rezultatów",
          paginate: { first: "<<", last: ">>", next: " >", previous: "< " },
          aria: {
            sortAscending: ": Sortowanie rosnące",
            sortDescending: ": Sortowanie malejące",
          },
        },

        // =========== 4. DEFINICJE KOLUMN ==============
        columns: [
          {
            // ikona dokumentu
            orderable: false,
            data: null,
            width: "36px",
            defaultContent:
              "<div class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg' alt='offer'></div>",
          },
          {
            // uuid (ukryty)
            visible: false,
            data: "uuid",
          },
          {
            // Dostawca
            data: "wholesalerKey",
          },
          /* 3 ─ Bucket (0/1) – UKRYTY, ale sortuje całe zestawienie ─ */
          { title: "Bucket", visible: false, data: "bucket", type: "num" },
          {
            // Status (kolor + ikonka) (ukryty)
            data: "status",
            visible: false,
            render: (data) => {
              const map = {
                Aktywny: "positive",
                "Kończy się": "medium",
                Przyszły: "noneexisting",
                Przeszły: "noneexisting",
              };
              return `<span class="${
                map[data] || "noneexisting"
              }">${data}</span>`;
            },
          },
          {
            // Etap – linkuje label + klasa do diffDays
            data: "label",
            type: "num", // sortujemy wg diffDays
            render: (data, type, row) => {
              if (type === "sort") return row.diffDays;
              return `<span class="${row.ageClass}" data-tippy-content="${row.label}">${row.label}</span>`;
            },
          },
          {
            // Sklepy (bez zmian, przeniesione z pierwotnego kodu)
            data: "shops",
            orderable: false,
            render: function (data) {
              if (!data || !data.length)
                return `<span class="tippy noneexisting">Brak</span>`;

              const translate = (s) =>
                ({
                  success: "Gotowa",
                  error: "Błąd",
                  waiting: "Oczekująca",
                  "in progress": "W trakcie",
                })[s] || "Brak danych";

              const statusClass =
                {
                  success: "positive",
                  error: "noneexisting",
                  waiting: "medium",
                  "in progress": "negative",
                }[data[0].status] || "noneexisting";

              if (data.length === 1) {
                return `<span class="tippy" data-tippy-content="${translate(
                  data[0].status,
                )}">${data[0].key}</span>`;
              }

              const tooltip = data
                .map((s) => `${s.key} – ${translate(s.status)}`)
                .join(", ");

              return `<span class="tippy" data-tippy-content="${tooltip}">${data.length}</span>`;
            },
          },
          {
            // Obowiązuje od
            data: "startDate",
            render: (d) => new Date(d).toLocaleDateString("pl-PL"),
          },
          {
            // Obowiązuje do
            data: "endDate",
            render: (d) => new Date(d).toLocaleDateString("pl-PL"),
          },
          {
            // Autor
            data: "created.by",
          },
          {
            // Przejdź
            orderable: false,
            data: null,
            defaultContent:
              '<div class="action-container"><a href="#" class="buttonoutline editme w-button">Przejdź</a></div>',
          },
          {
            // Kosz
            orderable: false,
            class: "details-control4",
            width: "20px",
            data: null,
            defaultContent:
              "<img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg' alt='trash'>",
          },
        ],

        // =========== 5. FILTRY SELECT ================
        initComplete: function () {
          const filters = [
            { column: 2, elementId: "wholesalerKeyIndicator" }, // Dostawca
            { column: 4, elementId: "statusIndicator" }, // Status
            { column: 9, elementId: "authorIndicator" }, // Autor
          ];

          filters.forEach(({ column, elementId }) => {
            const col = this.api().column(column);
            const select = $(`#${elementId}`)
              .empty()
              .append('<option value=""></option>');

            col
              .data()
              .unique()
              .sort()
              .each((d) => select.append(`<option value="${d}">${d}</option>`));

            select.on("change", function () {
              const val = $.fn.dataTable.util.escapeRegex($(this).val());
              col.search(val ? `^${val}$` : "", true, false).draw();
            });
          });
        },
      });

      // Globalne wyszukiwanie
      $(".dataTables_filter input")
        .off()
        .on("input", function () {
          table.search(this.value).draw();
        });
    } catch (err) {
      console.error("getPricats() error:", err);
      if (err.message === "401") console.log("Unauthorized");
    }
  }

  function getDocuments() {
    var tableDocuments = $("#table_documents").DataTable({
      pagingType: "full_numbers",
      order: [],
      dom: '<"top">rt<"bottom"lip>',
      scrollY: "60vh",
      scrollCollapse: true,
      pageLength: 10,
      searching: true,
      language: {
        emptyTable: "Brak danych do wyświetlenia",
        info: "Pokazuje _START_ - _END_ z _TOTAL_ rezultatów",
        infoEmpty: "Brak danych",
        infoFiltered: "(z _MAX_ rezultatów)",
        lengthMenu: "Pokaż _MENU_ rekordów",
        loadingRecords: "<div class='spinner'></div>",
        processing: "<div class='spinner'></div>",
        search: "Szukaj:",
        zeroRecords: "Brak pasujących rezultatów",
        paginate: {
          first: "<<",
          last: ">>",
          next: " >",
          previous: "< ",
        },
        aria: {
          sortAscending: ": Sortowanie rosnące",
          sortDescending: ": Sortowanie malejące",
        },
      },
      ajax: function (data, callback, settings) {
        $.ajaxSetup({
          headers: {
            Authorization: orgToken,
          },
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            $("#waitingdots").hide();
          },
        });

        $.get(
          InvokeURL + "van/transactions",
          {
            perPage: 1000, // Fetch 1000 items
            page: 1,
          },
          function (res) {
            // Populate filter options
            populateFilters(res.items);

            callback({
              recordsTotal: res.total,
              recordsFiltered: res.total,
              data: res.items,
            });
          },
        );
      },
      processing: true,
      serverSide: false, // Perform sorting and searching client-side
      search: {
        return: true,
      },
      columns: [
        {
          orderable: false,
          data: null,
          width: "36px",
          defaultContent:
            "<div class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg' alt='offer'></img></div>",
        },
        {
          orderable: false,
          visible: false,
          data: "uuid",
          render: function (data) {
            return data !== null ? data : "";
          },
        },
        {
          orderable: true,
          data: "wholesalerKey",
          render: function (data) {
            return data !== null ? data : "";
          },
        },
        {
          orderable: true,
          data: "type",
          render: function (data) {
            switch (data) {
              case "DESADV":
                return "Dostawa";
              case "INVOIC":
                return "Faktura";
              default:
                return data;
            }
          },
        },
        {
          orderable: true,
          data: "name",
          render: function (data) {
            return data !== null ? data : "";
          },
        },
        {
          data: "shopKeys",
          orderable: true,
          render: function (data, type, row) {
            if (data && data.length > 2) {
              return `Sklepów: ${data.length}`;
            } else {
              return data ? data.join(", ") : "";
            }
          },
        },
        {
          orderable: true,
          type: "date",
          data: "created.at",
          render: function (data) {
            if (data !== null) {
              var utcDate = new Date(Date.parse(data));
              return utcDate.toLocaleString("pl-PL", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
            }
            return "";
          },
        },
        {
          orderable: true,
          type: "date",
          data: "created.by",
          render: function (data) {
            return data !== null ? data : "";
          },
        },
        {
          orderable: true,
          type: "date",
          data: "modified.at",
          render: function (data) {
            if (data !== null) {
              var utcDate = new Date(Date.parse(data));
              return utcDate.toLocaleString("pl-PL", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
            }
            return "";
          },
        },
        {
          orderable: true,
          type: "date",
          data: "modified.by",
          render: function (data) {
            return data !== null ? data : "-";
          },
        },
        {
          orderable: false,
          data: null,
          defaultContent:
            '<div class="action-container">' +
            '<img style="cursor: pointer;margin-right:4px;" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/640442ed27be9b5e30c7dc31_edit.svg" action="edit" alt="edit">' +
            '<img style="cursor: pointer;margin-right:4px;" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg" action="delete" alt="delete">' +
            '<img style="cursor: pointer;margin-right:4px;" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6693849fa8a89c4e5ead5615_download.svg" action="download" alt="download">' +
            "</div>",
        },
      ],
      initComplete: function (settings, json) {
        var hasEntries = tableDocuments.data().any();
        if (!hasEntries) {
          $("#emptystatedocuments").show();
          $("#documentscontainer").hide();
        } else {
          $("#emptystatedocuments").hide();
          $("#documentscontainer").show();
        }

        // Filter table based on selected options
        $(".filterinput").on("change", function () {
          tableDocuments.draw();
        });

        // Custom filtering function for DataTable
        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
          var wholesaler = $("#wholesalerPickerDocuments").val();
          var documentType = $("#documentTypePicker").val();
          var shop = $("#documentShopPicker").val();
          var author = $("#documentAuthorPicker").val();

          var wholesalerMatch = wholesaler ? data[2] == wholesaler : true; // Adjust index based on your columns
          var documentTypeMatch = documentType ? data[3] == documentType : true; // Adjust index based on your columns
          var shopMatch = shop ? data[5] && data[5].includes(shop) : true; // Adjust index based on your columns
          var authorMatch = author ? data[6] == author : true; // Adjust index based on your columns

          return (
            wholesalerMatch && documentTypeMatch && shopMatch && authorMatch
          );
        });

        // Clear all filters
        $("#ClearAllButton").on("click", function (e) {
          e.preventDefault();
          $(".filterinput").val("").trigger("change");
        });

        // Event delegation for edit, delete, and download actions
        $("#table_documents tbody").on(
          "click",
          'img[action="edit"]',
          function () {
            var data = tableDocuments.row($(this).parents("tr")).data();
            // Implement your edit functionality here
            console.log("Edit:", data);
          },
        );

        $("#table_documents tbody").on(
          "click",
          'img[action="delete"]',
          function () {
            var data = tableDocuments.row($(this).parents("tr")).data();
            // Implement your delete functionality here
            console.log("Delete:", data);
          },
        );

        $("#table_documents tbody").on(
          "click",
          'img[action="download"]',
          function () {
            var data = tableDocuments.row($(this).parents("tr")).data();
            // Implement your download functionality here
            console.log("Download:", data);
            // Example: Redirect to the download URL
            window.location.href = `/download/${data.uuid}`;
          },
        );
      },
    });

    function populateFilters(items) {
      var wholesalers = new Set();
      var documentTypes = new Set();
      var shops = new Set();
      var authors = new Set();

      items.forEach(function (item) {
        wholesalers.add(item.wholesalerKey);
        documentTypes.add(item.type);
        if (item.shopKeys) {
          item.shopKeys.forEach(function (shop) {
            shops.add(shop);
          });
        }
        authors.add(item.created.by);
      });

      wholesalers.forEach(function (wholesaler) {
        $("#wholesalerPickerDocuments").append(
          new Option(wholesaler, wholesaler),
        );
      });

      var documentTypeMapping = {
        DESADV: "Dostawa",
        INVOIC: "Faktura",
        DEFAULT: "Inne",
      };

      documentTypes.forEach(function (type) {
        var displayName =
          documentTypeMapping[type] || documentTypeMapping["DEFAULT"];
        $("#documentTypePicker").append(new Option(displayName, type));
      });

      shops.forEach(function (shop) {
        $("#documentShopPicker").append(new Option(shop, shop));
      });

      authors.forEach(function (author) {
        $("#documentAuthorPicker").append(new Option(author, author));
      });
    }
  }

  function DocumentFileUpload(skipTypeCheck) {
    var xhr = new XMLHttpRequest();
    var documentFile = document.getElementById("documentfile").files[0];
    var fileSize = documentFile.size;

    // Check for file size exceeding 10 MB
    if (fileSize > 10 * 1024 * 1024) {
      $("#wrongfilemodal").css("display", "flex");
      $("#wrongfilemessage").text(
        "Jeden z Twoich plików jest zbyt duży. Plik jest większy niż 10 MB",
      );
      $("#addDocumentModal").css("display", "none");
      document.getElementById("documentfile").value = "";
      return; // Exit the function
    }

    $("#waitingdots").show();

    // Build query parameters
    var queryParams =
      `name=${encodeURIComponent($("#documentName").val())}&` +
      `type=${encodeURIComponent($("#documentType").val())}&` +
      `shopKey=${encodeURIComponent($("#documentShop").val())}&` +
      `wholesalerKey=${encodeURIComponent($("#documentWholesaler").val())}`;

    var action = InvokeURL + "van/transactions?" + queryParams;
    if (skipTypeCheck) {
      action += "&skipTypeCheck=true";
    }
    xhr.open("POST", action, true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.setRequestHeader("Authorization", orgToken);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        $("#waitingdots").hide();
        if (xhr.status === 201) {
          var response = JSON.parse(xhr.responseText);
          displayMessage("Success", "Dokument został stworzony.");
        } else {
          var msg = "";
          try {
            var jsonResponse = JSON.parse(xhr.responseText);
            msg = jsonResponse.message || "Unknown error occurred";
          } catch (e) {
            msg = "Unable to parse response";
          }
          console.log(xhr);
          if (xhr.status === 0) {
            msg = "Not connect.\n Verify Network.";
          } else if (xhr.status === 400) {
            msg = jsonResponse.message;
          } else if (xhr.status === 403) {
            msg = "Oops! Coś poszło nie tak. Proszę spróbuj ponownie.";
          } else if (xhr.status === 500) {
            msg = "Internal Server Error [500].";
            $("#orderfile").val("");
          } else {
            msg = jsonResponse.message;
            $("#orderfile").val("");
          }
          displayMessage("Error", msg);
        }
      }
    };

    // Read the file as binary and send it
    var reader = new FileReader();
    reader.onload = function (event) {
      var binaryData = event.target.result;
      xhr.send(binaryData);
    };
    reader.readAsArrayBuffer(documentFile);
  }

  const documentButton = document.getElementById("documentButton");
  const UploadDocumentfile = document.getElementById("documentfile");

  documentButton.addEventListener("click", (event) => {
    if (UploadDocumentfile.files.length > 0) {
      DocumentFileUpload(true);
    } else {
      console.log("There is no file");
    }
  });

  UploadDocumentfile.addEventListener("change", (event) => {
    var isFile = UploadDocumentfile.files.length > 0;
    if (isFile) {
      documentButton.classList.remove("disabledfornow");
      documentButton.textContent = "Kontynuuj";
      documentButton.style.opacity = 1;
      documentButton.style.cursor = "pointer";
    } else {
      documentButton.classList.add("disabledfornow");
      documentButton.textContent = "Najpierw wybierz plik dokumentu.";
      documentButton.style.opacity = 0.5;
      documentButton.style.cursor = "default";
    }
  });

  // Call with custom header
  $("#skipButton").on("click", function () {
    DocumentFileUpload(true);
  });

  ///koniec//

  $("#table_pricelists_list").on(
    "click",
    "a.buttonoutline.editme",
    function (event) {
      event.preventDefault();
      var table = $("#table_pricelists_list").DataTable();
      var rowData = table.row($(this).closest("tr")).data();
      window.location.replace(
        "https://" +
          DomainName +
          "/app/van/pricats/pricat?uuid=" +
          rowData.uuid,
      );
    },
  );

  $("#table_pricelists_list").on("click", "td.details-control4", function () {
    var table = $("#table_pricelists_list").DataTable();
    var tr = $(this).closest("tr");
    var rowData = table.row(tr).data();

    if (rowData && rowData.uuid) {
      // Wyświetl potwierdzenie usuwania
      var confirmDelete = confirm("Czy na pewno chcesz usunąć ten cennik?");

      if (confirmDelete) {
        var endpoint = InvokeURL + "van/transactions/" + rowData.uuid;

        $.ajax({
          type: "DELETE",
          url: endpoint,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            $("#waitingdots").hide();
          },
          headers: {
            Authorization: orgToken,
            "Requested-By": "webflow-3-4",
          },
          success: function () {
            console.log("Rekord został pomyślnie usunięty.");
            $("#waitingdots").show(1).delay(150).hide(1);
            table.row(tr).remove().draw(); // Use the captured `tr` directly
          },
          error: function (xhr, status, error) {
            console.error("Błąd usuwania rekordu:", error);
          },
        });
      }
    } else {
      console.error("Brak UUID w danych rekordu.");
    }
  });

  makeWebflowFormAjaxNewWh = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action =
          "https://hook.integromat.com/1xsh5m1qtu8wj7vns24y5tekcrgq2pc3";
        var data = {
          whname: $("#Wholesaler-Name").val(),
          taxId: $("#taxId").val(),
          platformUrl: $("#platformUrl").val(),
          organizationName: $("#organizationName").text(),
          form: "new-Wholesaler",
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
                displayMessage("Error", "Nie udało się zgłosić dostawcy.");
                console.log(e);
                return;
              }
            }
            form.show();
            displayMessage(
              "Success",
              "Dostawca został zgłoszony. Możesz zgłosić kolejnego.",
            );
            $("#Wholesaler-Name").val("");
            $("#taxId").val("");
            $("#platformUrl").val("");
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            displayMessage("Error", "Nie udało się zgłosić dostawcy.");
            console.log(e);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxPatchTenantBilling = function (
    forms,
    successCallback,
    errorCallback,
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        event.preventDefault();
        const organizationName = $("#organizationName").text();

        const url = `${InvokeURL}billing`;

        // Pobierz aktualne dane billingowe
        $.ajax({
          type: "GET",
          url: url,
          contentType: "application/json",
          dataType: "json",
          headers: {
            Authorization: orgToken,
            Accept: "application/json",
            "Requested-By": "webflow-3-4",
          },
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            $("#waitingdots").hide();
          },
          success: function (currentData) {
            const { patchData } = preparePatchData(currentData);

            if (patchData.length > 0) {
              // Wykonaj pierwsze PATCH dla billingowych danych
              $.ajax({
                type: "PATCH",
                url: url,
                data: JSON.stringify(patchData),
                contentType: "application/json",
                dataType: "json",
                headers: {
                  Authorization: orgToken,
                  "Requested-By": "webflow-3-4",
                },
                beforeSend: function () {
                  $("#waitingdots").show();
                },
                complete: function () {
                  $("#waitingdots").hide();
                },
                success: function (resultData) {
                  displayMessage(
                    "Success",
                    "Dane billingowe zostały zaktualizowane.",
                  );
                },
                error: function () {
                  displayMessage(
                    "Error",
                    "Nie udało się zaktualizować danych billingowych.",
                  );
                },
              });
            } else {
              displayMessage("Success", "Brak zmian do zapisania.");
            }
          },
          error: function () {
            displayMessage(
              "Error",
              "Nie udało się pobrać aktualnych danych. Spróbuj ponownie.",
            );
          },
        });
        return false; // Zapobiega normalnemu przesłaniu formularza
      });
    });
  };

  function preparePatchData(currentData) {
    var patchData = [];

    // Name
    var newName = $("#tenantNameEdit").val();
    if (newName !== currentData.companyName) {
      patchData.push({ op: "replace", path: "/companyName", value: newName });
    }

    // Tax ID
    var newTaxId = $("#tenantTaxIdEdit").val();
    if (newTaxId !== currentData.taxId) {
      patchData.push({ op: "replace", path: "/taxId", value: newTaxId });
    }

    // Phones (single input)
    var newPhone = $("#tenantPhoneEdit").val();
    var oldPhone = (currentData.phones && currentData.phones[0]?.phone) || "";

    if (newPhone !== oldPhone) {
      patchData.push({
        op: "replace",
        path: "/phones",
        value: newPhone ? [{ phone: newPhone }] : [],
      });
      phoneChanged = true;
    }

    // Address
    var newAddress = {
      country: "PL", // zakładam że zawsze Polska
      line1: $("#tenantAdressEdit").val(),
      town: $("#tenantTownEdit").val(),
      postcode: $("#tenantPostcodeEdit").val(),
    };

    if ($("#tenantAdressEdit2").val().trim() !== "") {
      newAddress.line2 = $("#tenantAdressEdit2").val();
    }

    // Compare each property to see if any part of the address has changed
    var addressChanged = false;

    if (currentData.address) {
      for (var key in newAddress) {
        if (
          newAddress[key] !==
          (currentData.address[key] === null ? null : currentData.address[key])
        ) {
          addressChanged = true;
          break;
        }
      }
    } else {
      // Jeśli address w currentData jest null, każde nowe dane są zmianą
      addressChanged = true;
    }

    if (addressChanged) {
      patchData.push({ op: "replace", path: "/address", value: newAddress });
    }

    // Emails
    var newEmails = [];
    for (let i = 1; i <= 3; i++) {
      let email = $(`#tenantEmailEdit${i}`).val();
      let description = $(`#tenantEmailEditDescription${i}`).val();
      if (email) {
        let emailObj = { email: email };
        if (description && description.trim() !== "") {
          emailObj.description = description;
        }
        newEmails.push(emailObj);
      }
    }

    // Only replace emails if there's a difference, using JSON.stringify for a quick deep comparison
    if (JSON.stringify(newEmails) !== JSON.stringify(currentData.emails)) {
      patchData.push({ op: "replace", path: "/emails", value: newEmails });
    }

    // Tenant Activity Kind
    var newActivityKind = $("#tenantActivityKind").val();
    if (newActivityKind !== currentData.activityKind) {
      patchData.push({
        op: "replace",
        path: "/activityKind",
        value: newActivityKind,
      });
    }

    // First Name and Last Name if tenantActivityKind is not "other_business"
    if (newActivityKind !== "other_business") {
      var newFirstName = $("#firstName").val();
      var newLastName = $("#lastName").val();
      if (newFirstName !== currentData.firstName) {
        patchData.push({
          op: "replace",
          path: "/firstName",
          value: newFirstName,
        });
      }
      if (newLastName !== currentData.lastName) {
        patchData.push({
          op: "replace",
          path: "/lastName",
          value: newLastName,
        });
      }
    }

    return {
      patchData,
    };
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
      z-index: 1000;
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

  getShops();

  LogoutNonUser();

  console.log("Checking organization name:", organizationName);
  if (DomainName === "sprytny01.webflow.io" || organizationName === "Góral") {
    console.log("Organizacja: " + organizationName);
    console.log("Documents available");
    getDocuments();
    $('a[data-w-tab="Documents"]').show();
  } else {
    $('a[data-w-tab="Documents"]').hide();
  }

  async function controlTabVisibility() {
    const hiddenTabsForAdmin = ["Documents"];
    const visibleTabsForUser = [
      "Shops",
      "Policy",
      "Wholesalers",
      "Pricelists",
      "Exclusive",
      "Premium",
    ];

    const maxAttempts = 10;
    let attempts = 0;
    let role = null;

    // Czekaj na ciasteczko z rolą
    while (!role && attempts < maxAttempts) {
      role = getCookie("sprytnyUserRole");
      if (!role) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }
    }

    if (!role) {
      console.warn("Nie udało się ustalić roli użytkownika.");
      return;
    }

    const $allTabs = $("a[data-w-tab]");

    if (role === "admin") {
      // Pokaż wszystkie
      $allTabs.show();

      // Ukryj tylko wybrane
      hiddenTabsForAdmin.forEach((tab) => {
        $(`a[data-w-tab="${tab}"]`).hide();
      });
    } else if (role === "user") {
      // Ukryj wszystkie
      $allTabs.hide();

      // Pokaż tylko wybrane
      visibleTabsForUser.forEach((tab) => {
        $(`a[data-w-tab="${tab}"]`).show();
      });
    } else {
      console.warn("Nieznana rola:", role);
    }
  }

  var formIdCreateSingleExclusive = "#wf-form-SingleExclusiveForm";
  var formIdEditSingleExclusive = "#wf-form-SingleExclusiveForm-Edit-2";
  var nowDateFull = new Date();
  nowDateFull.setUTCHours(0, 0, 0, 0);
  var nowDate = nowDateFull.toISOString().split(".")[0] + "Z";

  function initializeDatePicker(selector, defaultDate = 1) {
    $(selector).datepicker({
      dateFormat: "yy-mm-dd",
      altFormat: "yy-mm-dd",
      dayNames: [
        "Niedziela",
        "Poniedziałek",
        "Wtorek",
        "Środa",
        "Czwartek",
        "Piątek",
        "Sobota",
      ],
      dayNamesShort: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"],
      dayNamesMin: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"],
      firstDay: 1,
      monthNames: [
        "Styczeń",
        "Luty",
        "Marzec",
        "Kwiecień",
        "Maj",
        "Czerwiec",
        "Lipiec",
        "Sierpień",
        "Wrzesień",
        "Październik",
        "Listopad",
        "Grudzień",
      ],
      monthNamesShort: [
        "Sty",
        "Lut",
        "Mar",
        "Kwi",
        "Maj",
        "Cze",
        "Lip",
        "Sie",
        "Wrz",
        "Paź",
        "Lis",
        "Gru",
      ],
      defaultDate: defaultDate,
    });
  }

  function setupDatePickers() {
    initializeDatePicker("#startDate");
    initializeDatePicker("#endDate");
    initializeDatePicker("#startDate-Exclusive-Edit", new Date(Date.now()));
    initializeDatePicker("#endDate-Exclusive-Edit", new Date(Date.now()));
    initializeDatePicker("#startDate-Exclusive-2", new Date(Date.now()));
    initializeDatePicker("#endDate-Exclusive-2", new Date(Date.now()));
  }

  setupDatePickers();

  // Walidacja dat (czas ignorowany). Wymagania:
  // - startDate istnieje i jest >= dzisiaj (wg lokalnego czasu)
  // - jeśli nie „Nigdy”, to endDate istnieje i > startDate (ściśle późniejsza data)
  function validateDateRange(startLocal, endLocal, neverChecked) {
    if (!startLocal) return { ok: false, reason: "Wybierz datę rozpoczęcia." };

    const todayLocal = toDateOnlyString(new Date());
    if (startLocal < todayLocal) {
      return {
        ok: false,
        reason: "Data rozpoczęcia nie może być wcześniejsza niż dzisiaj.",
      };
    }

    if (neverChecked) return { ok: true };

    if (!endLocal) return { ok: false, reason: "Wybierz datę zakończenia." };
    if (endLocal <= startLocal) {
      return {
        ok: false,
        reason: "Data zakończenia musi być późniejsza niż data rozpoczęcia.",
      };
    }
    return { ok: true };
  }

  function normalizeGTIN(value) {
    return (value || "").toString().replace(/\s+/g, "");
  }

  function isValidGTIN(gtinRaw) {
    const gtin = normalizeGTIN(gtinRaw);
    if (!/^\d+$/.test(gtin))
      return { ok: false, reason: "Niedozwolone znaki." };
    const len = gtin.length;
    if (![8, 12, 13, 14].includes(len)) {
      return { ok: false, reason: "Nieprawidłowa długość." };
    }
    const digits = gtin.split("").map(Number);
    const check = digits.pop();
    let sum = 0;
    for (let i = digits.length - 1, pos = 0; i >= 0; i--, pos++) {
      const weight = pos % 2 === 0 ? 3 : 1;
      sum += digits[i] * weight;
    }
    const calcCheck = (10 - (sum % 10)) % 10;
    if (calcCheck !== check) {
      return { ok: false, reason: "Nieprawidłowa cyfra kontrolna." };
    }
    return { ok: true };
  }

  // Escapowanie nazwy (XSS / znaków specjalnych)
  function escapeName(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Zwraca YYYY-MM-DD (tylko część daty)
  function toDateOnlyString(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Walidacja dat (czas ignorowany). Wymagania:
  // - startDate istnieje i jest >= dzisiaj (wg lokalnego czasu)
  // - jeśli nie „Nigdy”, to endDate istnieje i > startDate (ściśle późniejsza data)
  function validateDateRange(startLocal, endLocal, neverChecked) {
    if (!startLocal) return { ok: false, reason: "Wybierz datę rozpoczęcia." };

    const todayLocal = toDateOnlyString(new Date());
    if (startLocal < todayLocal) {
      return {
        ok: false,
        reason: "Data rozpoczęcia nie może być wcześniejsza niż dzisiaj.",
      };
    }

    if (neverChecked) return { ok: true };

    if (!endLocal) return { ok: false, reason: "Wybierz datę zakończenia." };
    if (endLocal <= startLocal) {
      return {
        ok: false,
        reason: "Data zakończenia musi być późniejsza niż data rozpoczęcia.",
      };
    }
    return { ok: true };
  }

  // Escapowanie nazwy (XSS / znaków specjalnych)
  function escapeName(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Parsowanie wielu GTIN-ów (enter, przecinek, średnik, spacja)
  function parseMultipleGTINs(raw) {
    const tokens = (raw || "")
      .split(/[\s,;]+/g)
      .map((t) => t.trim())
      .filter(Boolean);
    // unikalne, w oryginalnej kolejności
    const seen = new Set();
    const out = [];
    for (const t of tokens) {
      if (!seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
    }
    return out;
  }

  // --- Główna funkcja z walidacją frontową i nowym body POST ---
  makeWebflowFormAjaxSingle = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      // ---- Wyłącz Webflow submit hijack ----
      form.attr("data-wf-ignore", "true");
      form.off("submit"); // zdejmuje webflow'owe bindy (np. .w-form)

      form.on("submit.sksingle", function (event) {
        event.preventDefault();

        const action = InvokeURL + "exclusive-products";
        const method = "POST";

        // wholesalerKey: "null" → null (tworzy blokadę)
        let wholesalerKeyPOST = $("#WholesalerSelector-Exclusive-2").val();
        if (wholesalerKeyPOST === "null") wholesalerKeyPOST = null;

        const neverChecked = $("#NeverSingle").is(":checked");

        // --- threshold: jeśli podany, to > 0 i < 999999.99 ---
        const thresholdRaw = ($("#priceThresholdInput").val() || "")
          .replace(",", ".")
          .trim();
        let thresholdNum = null;
        if (thresholdRaw !== "") {
          const n = Number(thresholdRaw);
          if (!isFinite(n) || n <= 0) {
            displayMessage("Error", "Próg ceny musi być liczbą większą od 0.");
            return false;
          }
          if (n >= 999999.99) {
            displayMessage(
              "Error",
              "Próg ceny musi być mniejszy niż 999999.99.",
            );
            return false;
          }
          // Zaokrąglenie do 2 miejsc jeśli trzeba (serwer i tak zweryfikuje)
          thresholdNum = Math.round(n * 100) / 100;
        }

        // --- Nazwa (escapowana) ---
        const nameRaw = "name";
        const escapedName = escapeName(nameRaw);
        if (!escapedName) {
          displayMessage("Error", "Podaj nazwę produktu.");
          return false;
        }

        // --- Wielokrotne GTIN-y ---
        const gtinInputRaw = $("#GTINInput").val();
        const gtinsRawList = parseMultipleGTINs(gtinInputRaw);
        if (!gtinsRawList.length) {
          displayMessage("Error", "Podaj przynajmniej jeden numer GTIN.");
          return false;
        }

        // Walidacja każdego GTIN-a
        const invalids = [];
        const items = [];
        for (const raw of gtinsRawList) {
          const gtinNormalized = normalizeGTIN(raw);
          const check = isValidGTIN(gtinNormalized);
          if (!check.ok) {
            invalids.push(`${raw} (${check.reason})`);
          } else {
            items.push(
              Object.assign(
                {
                  gtin: gtinNormalized,
                  name: escapedName,
                },
                thresholdNum !== null ? { priceThreshold: thresholdNum } : {},
              ),
            );
          }
        }

        if (invalids.length) {
          displayMessage(
            "Error",
            "Nieprawidłowe GTIN-y:\n• " + invalids.join("\n• "),
          );
          return false;
        }

        // --- Walidacja dat: tylko część dzienna ma znaczenie ---
        const startLocal = $("#startDate-Exclusive-2").val(); // YYYY-MM-DD
        const endLocal = $("#endDate-Exclusive-2").val(); // YYYY-MM-DD
        const dateCheck = validateDateRange(startLocal, endLocal, neverChecked);
        if (!dateCheck.ok) {
          displayMessage("Error", dateCheck.reason);
          return false;
        }

        // Serwer „ignoruje” godzinę → wyślij RFC3339 z północy UTC.
        const startISO = startLocal + "T00:00:00.000Z";
        const endISO = neverChecked ? "infinity" : endLocal + "T00:00:00.000Z";

        // --- NOWY KSZTAŁT BODY ---
        const postData = {
          wholesalerKey: wholesalerKeyPOST, // null → tworzy blokadę
          startDate: startISO, // RFC3339 (czas i tak ignorowany)
          endDate: endISO, // RFC3339 lub 'infinity'
          items: items, // [{ gtin, name, priceThreshold? }, ...]
        };

        $.ajax({
          type: method,
          url: action,
          cors: true,
          contentType: "application/json",
          dataType: "json",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: orgToken,
            "Requested-By": "webflow-3-4",
          },
          data: JSON.stringify(postData),
          beforeSend: function () {
            $("#waitingdots").show();
          },
          success: function (resultData) {
            if (typeof successCallback === "function") {
              const proceed = successCallback(resultData);
              if (!proceed) {
                form.show();
                displayMessage(
                  "Error",
                  "Ups. Coś poszło nie tak, spróbuj ponownie.",
                );
                return;
              }
            }
            form.show();
            displayMessage("Success", `Blokada została założona.`);
            $("#GTINInput").val("");
            // 🚀 Odśwież tabelę
            if ($.fn.DataTable.isDataTable("#table_id")) {
              $("#table_id").DataTable().ajax.reload(null, false);
              // drugi parametr = false → zostawia aktualną stronę i sortowanie
            }
          },
          error: function (jqXHR, exception) {
            const serverMsg =
              jqXHR?.responseJSON?.message || jqXHR?.responseText || "";

            let msg = "";
            if (jqXHR.status === 0) {
              msg = "Brak połączenia z siecią. Sprawdź internet.";
            } else if (jqXHR.status === 401 || jqXHR.status === 403) {
              // Admin only / brak uprawnień
              if (/admin/i.test(serverMsg)) {
                msg = "Operacja dostępna wyłącznie dla administratora.";
              } else {
                msg = "Brak uprawnień do wykonania tej operacji.";
              }
            } else if (jqXHR.status === 400) {
              if (/wholesaler.*not enabled/i.test(serverMsg)) {
                msg =
                  "Wybrany wholesalerKey nie jest włączony dla tego tenant'a.";
              } else if (/Invalid GTIN length/i.test(serverMsg)) {
                msg = "Nieprawidłowa długość GTIN. Zweryfikuj numery.";
              } else if (/gtin must be valid/i.test(serverMsg)) {
                msg =
                  "Co najmniej jeden GTIN jest nieprawidłowy (8/12/13/14 cyfr).";
              } else if (/start.*before.*end/i.test(serverMsg)) {
                msg = "Data zakończenia musi być późniejsza niż rozpoczęcia.";
              } else if (/start.*must be.*now/i.test(serverMsg)) {
                msg = "Data rozpoczęcia nie może być wcześniejsza niż dzisiaj.";
              } else if (/threshold/i.test(serverMsg)) {
                msg = "Próg ceny musi być > 0 i < 999999.99.";
              } else if (/Invalid request body/i.test(serverMsg)) {
                msg = "Nieprawidłowe dane. Sprawdź formularz.";
              } else {
                msg =
                  serverMsg || "Nieprawidłowe dane (400). Sprawdź formularz.";
              }
            } else if (jqXHR.status === 409) {
              msg = "Blokada o podanych parametrach już istnieje.";
              displayMessage("Error", msg);

              if (typeof errorCallback === "function") {
                errorCallback(jqXHR, exception);
              }
              return;
            } else if (jqXHR.status === 500) {
              msg = "Błąd serwera (500). Spróbuj ponownie później.";
            } else if (exception === "parsererror") {
              msg = "Błąd przetwarzania odpowiedzi serwera.";
            } else if (exception === "timeout") {
              msg = "Przekroczono czas oczekiwania na odpowiedź.";
            } else if (exception === "abort") {
              msg = "Żądanie zostało przerwane.";
            } else {
              msg = serverMsg || "Wystąpił nieznany błąd.";
            }

            console.log(jqXHR);
            console.log(exception);

            if (typeof errorCallback === "function") {
              errorCallback(jqXHR, exception, msg);
            }

            form.show();
            displayMessage("Error", msg);
          },
          complete: function () {
            $("#waitingdots").hide();
          },
        });

        return false;
      });
    });
  };

  makeWebflowFormAjaxSingleEdit = function (
    forms,
    successCallback,
    errorCallback,
  ) {
    // --- helpery lokalne ---
    const dateOnlyUTC = (d) =>
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

    const todayDateOnlyUTC = () => {
      const now = new Date();
      return dateOnlyUTC(
        new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
        ),
      );
    };

    const validateDateRangeUTC = (startLocalStr, endLocalStr, never) => {
      if (!startLocalStr)
        return { ok: false, reason: "Wybierz datę rozpoczęcia." };

      const startUTC = new Date(startLocalStr + "T00:00:00.000Z");
      if (isNaN(startUTC.getTime()))
        return { ok: false, reason: "Nieprawidłowy format daty rozpoczęcia." };

      const startOnly = dateOnlyUTC(startUTC);
      const todayOnly = todayDateOnlyUTC();
      if (startOnly < todayOnly) {
        return {
          ok: false,
          reason: "Data rozpoczęcia nie może być wcześniejsza niż dzisiaj.",
        };
      }

      if (never) return { ok: true };

      if (!endLocalStr)
        return { ok: false, reason: "Wybierz datę zakończenia." };
      const endUTC = new Date(endLocalStr + "T00:00:00.000Z");
      if (isNaN(endUTC.getTime()))
        return { ok: false, reason: "Nieprawidłowy format daty zakończenia." };

      const endOnly = dateOnlyUTC(endUTC);
      if (endOnly <= startOnly) {
        return {
          ok: false,
          reason: "Data zakończenia musi być późniejsza niż data rozpoczęcia.",
        };
      }
      return { ok: true };
    };

    const extractMsg = (jqXHR) => {
      let msg = jqXHR?.responseJSON?.message || "";
      if (!msg && jqXHR?.responseText) {
        try {
          const parsed = JSON.parse(jqXHR.responseText);
          msg = parsed?.message || jqXHR.responseText;
        } catch {
          msg = jqXHR.responseText;
        }
      }
      return (msg || "").toString().trim();
    };

    forms.each(function () {
      var form = $(this);

      form.on("submit", function (event) {
        event.preventDefault();

        const exclusiveProductId = $("#exclusiveProductId").val();
        const action =
          InvokeURL +
          "exclusive-products/" +
          encodeURIComponent(exclusiveProductId);
        const method = "PATCH";

        const never = $("#NeverSingleEdit").is(":checked");

        // start date – jeśli input jest disabled, ustaw mu wcześniej data-iso-date="YYYY-MM-DD"
        const startLocal =
          $("#startDate-Exclusive-Edit").data("isoDate") ||
          $("#startDate-Exclusive-Edit").val(); // YYYY-MM-DD

        const endLocal = $("#endDate-Exclusive-Edit").val(); // YYYY-MM-DD

        // walidacja zakresu (UI)
        const dateCheck = validateDateRangeUTC(startLocal, endLocal, never);
        if (!dateCheck.ok) {
          displayMessage("Error", dateCheck.reason);
          return false;
        }

        // docelowe wartości
        const newStartISO = startLocal + "T00:00:00.000Z";
        const newEndISO = never ? "infinity" : endLocal + "T00:00:00.000Z";

        // wholesalerKey: "null" → null (BLOKADA)
        const wkRaw = $("#WholesalerSelector-Exclusive-Edit").val();
        const newWhKey = wkRaw === "null" ? null : wkRaw;

        // priceThreshold (opcjonalnie)
        const thrInput = document.querySelector("#priceThresholdInput-Edit");
        const thrRaw = thrInput
          ? (thrInput.value || "").replace(",", ".").trim()
          : null;

        // najpierw pobierz bieżący rekord
        $.ajax({
          type: "GET",
          url: action,
          headers: { Authorization: orgToken, Accept: "application/json" },
          success: function (currentValues) {
            const postData = [];

            // Wyznacz czy blokada już trwa: current.startDate ≤ dziś
            const todayOnly = todayDateOnlyUTC();
            const curStart = new Date(currentValues.startDate || "");
            const curStartOnly = isNaN(curStart.getTime())
              ? null
              : dateOnlyUTC(curStart);
            const isOngoing = !!curStartOnly && curStartOnly <= todayOnly;

            // /startDate: dodaj tylko jeżeli NIE jest ongoing i data faktycznie się zmienia
            if (!isOngoing) {
              if (newStartISO !== currentValues.startDate) {
                postData.push({
                  op: "replace",
                  path: "/startDate",
                  value: newStartISO,
                });
              }
            }

            // /endDate: można zmienić zawsze (także na "infinity")
            if (newEndISO !== currentValues.endDate) {
              postData.push({
                op: "replace",
                path: "/endDate",
                value: newEndISO,
              });
            }

            // /wholesalerKey: zmiana = replace, BLOKADA (null) = delete
            if (newWhKey !== currentValues.wholesalerKey) {
              if (newWhKey === null) {
                // ustaw null po stronie backendu
                postData.push({ op: "delete", path: "/wholesalerKey" });
              } else {
                postData.push({
                  op: "replace",
                  path: "/wholesalerKey",
                  value: newWhKey,
                });
              }
            }

            // /priceThreshold: replace / remove
            const curThr = currentValues.priceThreshold;
            if (thrRaw !== null) {
              if (thrRaw === "") {
                if (typeof curThr !== "undefined" && curThr !== null) {
                  postData.push({ op: "remove", path: "/priceThreshold" });
                }
              } else {
                const n = Number(thrRaw);
                if (!isFinite(n) || n <= 0 || n >= 999999.99) {
                  displayMessage(
                    "Error",
                    "Próg ceny musi być > 0 i < 999999.99.",
                  );
                  return false;
                }
                const rounded = Math.round(n * 100) / 100;
                if (curThr !== rounded) {
                  postData.push({
                    op: "replace",
                    path: "/priceThreshold",
                    value: rounded,
                  });
                }
              }
            }

            if (!postData.length) {
              displayMessage("Warning", "Brak zmian do zapisania.");
              return;
            }

            // sanity-check relacji dat
            const effectiveStartISO =
              postData.find((p) => p.path === "/startDate")?.value ||
              currentValues.startDate;
            const effectiveEndISO =
              postData.find((p) => p.path === "/endDate")?.value ||
              currentValues.endDate;

            if (effectiveEndISO !== "infinity") {
              const sOnly = dateOnlyUTC(new Date(effectiveStartISO));
              const eOnly = dateOnlyUTC(new Date(effectiveEndISO));
              if (eOnly <= sOnly) {
                displayMessage(
                  "Error",
                  "Data zakończenia musi być późniejsza niż data rozpoczęcia.",
                );
                return;
              }
            }

            // wyślij PATCH
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
              data: JSON.stringify(postData),
              success: function (resultData) {
                if (typeof successCallback === "function") {
                  const proceed = successCallback(resultData);
                  if (!proceed) {
                    displayMessage(
                      "Error",
                      "Ups. Coś poszło nie tak, spróbuj ponownie.",
                    );
                    return;
                  }
                }
                displayMessage("Success", "Blokada została zmieniona.");
                // 🚀 Odśwież tabelę
                if ($.fn.DataTable.isDataTable("#table_id")) {
                  $("#table_id").DataTable().ajax.reload(null, false);
                  // drugi parametr = false → zostawia aktualną stronę i sortowanie
                }
                if (typeof refreshTable === "function") refreshTable();
              },
              error: function (jqXHR, exception) {
                const serverMsg = extractMsg(jqXHR);
                let msg = "";
                if (jqXHR.status === 0) {
                  msg = "Brak połączenia z siecią. Sprawdź internet.";
                } else if (jqXHR.status === 401 || jqXHR.status === 403) {
                  msg = /admin/i.test(serverMsg)
                    ? "Operacja dostępna wyłącznie dla administratora."
                    : "Brak uprawnień do wykonania tej operacji.";
                } else if (jqXHR.status === 400) {
                  if (/start.*before.*end/i.test(serverMsg)) {
                    msg =
                      "Data zakończenia musi być późniejsza niż rozpoczęcia.";
                  } else if (
                    /Change of startDate is not allowed for ongoing events/i.test(
                      serverMsg,
                    )
                  ) {
                    msg =
                      "Nie można zmienić daty rozpoczęcia trwającej blokady.";
                  } else if (/threshold/i.test(serverMsg)) {
                    msg = "Próg ceny musi być > 0 i < 999999.99.";
                  } else {
                    msg = serverMsg || "Nieprawidłowe dane (400).";
                  }
                } else if (jqXHR.status === 409) {
                  msg = serverMsg || "Konflikt z istniejącymi rekordami (409).";
                } else if (jqXHR.status === 500) {
                  msg = "Błąd serwera (500). Spróbuj ponownie później.";
                } else if (exception === "parsererror") {
                  msg = "Błąd przetwarzania odpowiedzi serwera.";
                } else if (exception === "timeout") {
                  msg = "Przekroczono czas oczekiwania na odpowiedź.";
                } else if (exception === "abort") {
                  msg = "Żądanie zostało przerwane.";
                } else {
                  msg = serverMsg || "Wystąpił nieznany błąd.";
                }

                if (typeof errorCallback === "function") {
                  errorCallback(jqXHR, exception, msg);
                }
                displayMessage("Error", msg);
              },
            });
          },
          error: function (jqXHR) {
            const msg =
              "Nie udało się pobrać danych produktu.\n" + extractMsg(jqXHR);
            displayMessage("Error", msg);
          },
        });

        return false;
      });
    });
  };

  makeWebflowFormAjaxServerWh = function (
    forms,
    successCallback,
    errorCallback,
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        event.preventDefault();

        var container = form.parent();
        var doneBlock = $("#wf-form-Create-wholesaler-done", container);
        var failBlock = $("#wf-form-Create-wholesaler-fail", container);
        var wholesalerInput = $("#Wholesaler-Login-2");
        var wholesalerKey = wholesalerInput.val().split(".")[1];
        var baseAction =
          InvokeURL +
          "wholesalers/" +
          wholesalerKey +
          "/ftp?notifyWholesaler=true";
        var method = "POST";

        var data = {
          username: wholesalerInput.val().toLowerCase(),
        };

        $.ajax({
          type: method,
          url: baseAction,
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
            document.getElementById("credentialsvan").innerHTML =
              credentialsHTML;

            doneBlock.show();
            failBlock.hide();

            // Resetowanie formularza do stanu początkowego gdy ktoś kliknie element o id #resetwhform
            $("#resetwhform").on("click", function () {
              // Reset formularza
              form.trigger("reset");
              setTimeout(function () {
                form.show();
                doneBlock.hide();
                failBlock.hide();
              }, 1000);
            });
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

            // Resetowanie formularza do stanu początkowego w przypadku błędu
            setTimeout(function () {
              form.trigger("reset");
              form.show();
              doneBlock.hide();
              failBlock.hide();
            }, 5000);
          },
        });

        return false;
      });
    });
  };

  function refreshTable() {
    $.ajaxSetup({
      headers: {
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },
      beforeSend: function () {
        $("#waitingdots").show();
      },
      complete: function () {
        $("#waitingdots").hide();
      },
    });

    $.get(InvokeURL + "exclusive-products", function (res) {
      var tabela = $("#table_id").DataTable();
      tabela.clear().rows.add(res.items).draw();
    });
  }

  makeWebflowFormAjaxSingleEdit($(formIdEditSingleExclusive));
  makeWebflowFormAjaxSingle($(formIdCreateSingleExclusive));

  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));
  makeWebflowFormAjaxPatchTenantBilling($(formIdEditBilling));
  makeWebflowFormAjax($(formId));
  makeWebflowFormAjaxDelete($(formIdDelete));
  makeWebflowFormAjaxInvite($(formIdInvite));
  makeWebflowFormAjaxCreate($(formIdCreate));
  makeWebflowFormAjaxNewWh($(formIdNewWh));
  makeWebflowFormAjaxServerWh($(formIdNewServer));

  $("table.dataTable").on("page.dt", function () {
    $(this).DataTable().draw(false);
  });

  $("#table_wholesalers_list_bonus").on(
    "focusout",
    "input[type='number']",
    function () {
      var table = $("#table_wholesalers_list_bonus").DataTable();
      let newValue = parseFloat($(this).val());
      var initialValue = parseFloat($(this).data("initialValue"));
      var form = $("#wf-form-WholesalerChangeStatusForm");
      var $input = $(this);

      if (newValue !== initialValue) {
        var row = table.row($input.parents("tr"));
        var data = row.data();
        var wholesalerKey = data.wholesalerKey;

        if (!wholesalerKey) {
          console.error("No wholesaler key found for the row.");
          resetInputValue($input, initialValue);
          return;
        }

        var patchData = [
          {
            op: "add",
            path: "/preferentialBonus",
            value: newValue,
          },
        ];

        $.ajax({
          url: InvokeURL + "wholesalers/" + wholesalerKey,
          type: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: orgToken,
            "Requested-By": "webflow-3-4",
          },
          data: JSON.stringify(patchData),
          success: function (response) {
            console.log("Data updated successfully", response);
            displayMessage("Success", "Premia została zaktualizowana.");
            $input.attr("value", newValue).data("initialValue", newValue);
          },
          error: function (jqXHR, exception) {
            console.log("błąd");
            console.log(jqXHR);
            console.log(exception);

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

            if (typeof onErrorCallback === "function") {
              onErrorCallback();
            }

            form.show();
            displayMessage("Error", msg);
            resetInputValue($input, initialValue);
          },
        });
      }
    },
  );

  function resetInputValue($input, value) {
    $input.val(value).attr("value", value).data("initialValue", value);
  }

  // --- WSPÓLNE POMOCNICZE ---
  const addYears = (d, years) => {
    const nd = new Date(d.getTime());
    nd.setFullYear(nd.getFullYear() + years);
    return nd;
  };

  // maks(today + 25y, 2050-01-01)
  const farFutureDate = () => {
    const today = new Date();
    const plus25 = addYears(today, 25);
    const y2050 = new Date(Date.UTC(2050, 0, 1)); // 2050-01-01 UTC (datepicker i tak liczy lokalnie)
    return plus25 > y2050 ? plus25 : y2050;
  };

  // bezpieczne ustawienie disabled + opacity
  const setDisabled = ($el, disabled, opacityIfDisabled = 0.6) => {
    $el.prop("disabled", !!disabled);
    $el.css("opacity", disabled ? opacityIfDisabled : "1");
  };

  // Klik w ikonki akcji (edit / create / delete)
  $("#table_id")
    .off("click.actionImgs")
    .on("click.actionImgs", "img", function () {
      const $img = $(this);
      const action = $img.attr("action"); // "edit" | "create" | "delete"
      const table = $("#table_id").DataTable();
      const row = table.row($img.closest("tr")).data();

      // --- Helpers ---
      const toUtcMidnight = (v) => {
        if (!v) return null;
        if (v === "infinity") return "infinity";
        const d = new Date(v);
        if (isNaN(d.getTime())) return null;
        return new Date(
          Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
        );
      };

      // ====== DELETE ======
      if (action === "delete") {
        $.ajax({
          type: "DELETE",
          url: InvokeURL + "exclusive-products/" + row.uuid,
          cors: true,
          beforeSend: () => $("#waitingdots").show(),
          complete: () => $("#waitingdots").hide(),
          contentType: "application/json",
          dataType: "json",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: orgToken,
            "Requested-By": "webflow-3-4",
          },
          success: function () {
            table.row($img.closest("tr")).remove().draw(false);
            $("#deleteInline-Success").show().fadeOut(4000);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR, exception);
            $("#deleteInline-Fail").show().fadeOut(4000);
          },
        });
        return;
      }

      // ====== EDIT POPUP ( #EditExclusivePopup ) ======
      if (action === "edit") {
        // --- helpers tylko dla EDIT ---
        const setDisabled = ($el, disabled, opacityIfDisabled = 0.6) => {
          $el.prop("disabled", !!disabled);
          if (disabled) $el.css("opacity", opacityIfDisabled);
          else $el.css("opacity", "1");
        };

        const today = new Date();
        const toLocalDate = (d) => (d instanceof Date ? d : new Date(d));

        // Twarde sterowanie stanem "Bezterminowo" (input + wizual)
        const applyNeverStateEdit = (checked) => {
          const $input = $("#NeverSingleEdit");
          const $visual = $(
            "#NeverSingle-Edit .w-checkbox-input, #NeverSingle-Edit .never-checkbox",
          );
          const $end = $("#endDate-Exclusive-Edit");

          $input.prop("checked", !!checked);
          $visual
            .attr("aria-checked", checked ? "true" : "false")
            .toggleClass("w--redirected-checked", !!checked);

          if (checked) {
            // W EDIT też ustawiamy daleką datę dla spójności UX
            const ff = farFutureDate();
            $end.datepicker("setDate", ff);
            setDisabled($end, true);
          } else {
            setDisabled($end, false);
            const cur = $end.datepicker("getDate");
            if (!cur) $end.datepicker("setDate", new Date());
          }
        };

        const bindNeverCheckboxEdit = () => {
          // zmiana "prawdziwego" inputa
          $("#NeverSingleEdit")
            .off("change.Edit")
            .on("change.Edit", function () {
              applyNeverStateEdit(this.checked);
            });

          // klik w label / wizual (często Webflow używa div jako „checkboxa”)
          $("#NeverSingle-Edit")
            .off("click.toggleEdit")
            .on("click.toggleEdit", function (e) {
              // jeżeli klik nie pochodził bezpośrednio z inputa, ręcznie przełącz
              if (e.target.id !== "NeverSingleEdit") {
                const next = !$("#NeverSingleEdit").is(":checked");
                applyNeverStateEdit(next);
                // zapobiegaj podwójnemu przełączeniu, jeśli label kliknąłby input
                e.preventDefault();
                e.stopPropagation();
              }
            });
        };

        const fillStaticMetaDisabled = (row) => {
          const createdLocal = (() => {
            const d = new Date(row?.created?.at);
            if (isNaN(d)) return "";
            return d
              .toLocaleString("pl-PL", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
              .replace(",", "");
          })();

          // Ustaw wartości…
          $("#Creator").val(row?.created?.by || "");
          $("#Created").val(createdLocal);

          // …i zablokuj na stałe (Twoje wymaganie)
          setDisabled($("#Creator"), true);
          setDisabled($("#Created"), true);
        };

        // --- otwórz modal i przygotuj UI ---
        $("#EditExclusivePopup").css("display", "flex");

        // Pola edytowalne w EDIT (poza Creator/Created)
        $(
          "#GTINInputEdit, #WholesalerSelector-Exclusive-Edit, #priceThresholdInput-Edit",
        )
          .prop("disabled", false)
          .css("opacity", "1");
        $("#startDate-Exclusive-Edit, #endDate-Exclusive-Edit")
          .datepicker("enable")
          .css("opacity", "1");

        // Prefille
        $("#GTINInputEdit").val(row.gtin || "");
        $("#priceThresholdInput-Edit").val(row.priceThreshold ?? "");
        $("#WholesalerSelector-Exclusive-Edit")
          .val(row.wholesalerKey ?? "null")
          .change();
        $("#exclusiveProductId").val(row.uuid || "");

        // Metadane → disabled
        fillStaticMetaDisabled(row);

        // Start date zawsze na dziś (automatycznie)
        $("#startDate-Exclusive-Edit").datepicker("setDate", today);

        // Podpięcie logiki „Bezterminowo”
        bindNeverCheckboxEdit();

        // Ustal stan końcowy wg rekordu: infinity => bezterminowo
        const endIsInfinity =
          row?.endDate === "infinity" ||
          toUtcMidnight(row?.endDate) === "infinity";
        if (endIsInfinity) {
          applyNeverStateEdit(true);
        } else {
          // nie bezterminowo → odblokuj datę końca; jeśli jest w rekordzie, ustaw ją, inaczej dziś
          applyNeverStateEdit(false);
          const endLocal = row?.endDate ? toLocalDate(row.endDate) : today;
          $("#endDate-Exclusive-Edit").datepicker("setDate", endLocal);
        }

        return;
      }

      // ====== CREATE POPUP ( #singleexclusivemodal ) ======
      if (action === "create") {
        const enableCreateFields = () => {
          // GTIN ma być disabled
          setDisabled($("#GTINInput"), true); // <<<<<<<<<<<<<<<<< TU: disabled
          setDisabled($("#WholesalerSelector-Exclusive-2"), false);
          setDisabled($("#priceThresholdInput"), false);
          $("#startDate-Exclusive-2, #endDate-Exclusive-2")
            .datepicker("enable")
            .css("opacity", "1");
        };

        const applyNeverStateCreate = (checked) => {
          const $input = $("#NeverSingle");
          const $visual = $(
            "#singleexclusivemodal .never-checkbox, #singleexclusivemodal .w-checkbox-input",
          );
          const $end = $("#endDate-Exclusive-2");

          $input.prop("checked", !!checked);
          $visual
            .attr("aria-checked", checked ? "true" : "false")
            .toggleClass("w--redirected-checked", !!checked);

          if (checked) {
            // USTAWIAMY DALEKĄ DATĘ (wizualnie) i BLOKUJEMY POLE
            const ff = farFutureDate();
            $end.datepicker("setDate", ff);
            setDisabled($end, true); // pole nieedytowalne
          } else {
            setDisabled($end, false); // odblokuj
            const cur = $end.datepicker("getDate");
            if (!cur) $end.datepicker("setDate", new Date()); // podpowiedz dziś
          }
        };

        const bindNeverCheckboxCreate = () => {
          $("#NeverSingle")
            .off("change.Create")
            .on("change.Create", function () {
              applyNeverStateCreate(this.checked);
            });
          // klik w label/ikonę
          $("#singleexclusivemodal .nevercheckbox")
            .off("click.toggleCreate")
            .on("click.toggleCreate", function (e) {
              if (e.target.id !== "NeverSingle") {
                const next = !$("#NeverSingle").is(":checked");
                applyNeverStateCreate(next);
                e.preventDefault();
                e.stopPropagation();
              }
            });
        };

        // otwórz modal create
        $("#singleexclusivemodal").css("display", "flex");

        // UI
        enableCreateFields();
        bindNeverCheckboxCreate();

        // Prefill (GTIN disabled – ale nadal go ustawiamy z wiersza, jeśli jest)
        $("#GTINInput").val(row?.gtin || "");
        $("#priceThresholdInput").val(row?.priceThreshold ?? "");
        $("#WholesalerSelector-Exclusive-2")
          .val(row?.wholesalerKey ?? "null")
          .change();

        // Daty
        const today = new Date();
        $("#startDate-Exclusive-2").datepicker("setDate", today);

        // Domyślnie NIE bezterminowo (aktywny end z dzisiejszą datą)
        applyNeverStateCreate(false);
        $("#endDate-Exclusive-2").datepicker("setDate", today);

        return;
      }
    });

  $('a[role="tab"]').click(function (e) {
    if ($.fn.dataTable) {
      const delays = [1, 49, 151, 901];
      delays.forEach((delay) => {
        setTimeout(() => {
          try {
            const tables = $.fn.dataTable.tables({ visible: true, api: true });
            if (tables) {
              tables.columns.adjust();
              console.log("DataTable adjusted (delay: " + delay + "ms)");
            }
          } catch (error) {
            console.error("DataTables error:", error);
          }
        }, delay);
      });
    }
  });
});
