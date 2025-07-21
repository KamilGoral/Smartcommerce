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
  var orgToken = getCookie("sprytnyToken");
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var DomainName = getCookie("sprytnyDomainName");
  var integrationKeyId = "kc-firma";
  document.getElementById("waitingdots").style.display = "flex";
  var ClientID = getCookieNameByValue(orgToken);
  var OrganizationName = getCookie("OrganizationName");
  const IntegrationBread = document.getElementById("IntegrationBread");
  IntegrationBread.setAttribute("href", window.location.href);
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

  function getIntegrations() {
    let url = new URL(InvokeURL + "integrations/kc-firma");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      var data = JSON.parse(this.response);
      console.log(data);

      // Obsługa logo
      const whLogo = document.getElementById("whLogo");
      if (whLogo && data.image) {
        whLogo.src = `data:image/png;base64,${data.image}`;
        whLogo.style.objectFit = "contain";
      } else {
        console.log("Brak logo lub niepoprawny obrazek.");
      }

      // Elementy przełącznika
      const isEnabled = data.enabled === true;
      if (isEnabled === true) {
        getShops();
      }
      const $checkbox = $("#KC-Integration-Switch");
      const $customSwitch = $checkbox.siblings(".w-checkbox-input");

      // Ustawienie stanu checkboxa i klasy Webflow
      $checkbox.prop("checked", isEnabled);
      $customSwitch.toggleClass("w--redirected-checked", isEnabled);

      // Ukrycie/pokazanie alertu
      $("#kc-alert").toggle(!isEnabled);

      // 🔄 Zmiana tekstu etykiety (np. Aktywuj / Integracja aktywna)
      const $label = $(".text-block-64"); // lub bardziej precyzyjnie: $('form#KC-Integration-Form').closest('.div-block-69').find('.text-block-64')
      $label.text(isEnabled ? "Integracja aktywna:" : "Aktywuj:");
      $("#integrationGrid").show();
    };
    request.send();
  }

  function putKcFirmaIntegration(enabled) {
    const $checkbox = $("#KC-Integration-Switch");
    const $customSwitch = $checkbox.siblings(".w-checkbox-input");
    const $label = $checkbox.closest(".div-block-69").find(".text-block-64");

    if (!enabled) {
      // Wywołanie DELETE do wyłączenia integracji KC-Firma
      $.ajax({
        type: "DELETE",
        url: InvokeURL + "integrations/kc-firma",
        cors: true,
        beforeSend: function () {
          $("#waitingdots").show();
        },
        complete: function () {
          $("#waitingdots").hide();
        },
        headers: {
          Accept: "application/json",
          Authorization: orgToken,
          "Requested-By": "webflow-3-4",
        },
        success: function () {
          displayMessage("Success", "Integracja KC-Firma została wyłączona.");

          $checkbox.prop("checked", false);
          $customSwitch.removeClass("w--redirected-checked");
          $label.text("Aktywuj:");
          $("#kc-alert").show();
        },
        error: function (jqXHR) {
          var msg =
            "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
          displayMessage("Error", msg);
          console.error("Error disabling KC-Firma integration:", msg);
        },
      });
      return;
    }

    // Aktywacja integracji KC-Firma
    $.ajax({
      type: "PUT",
      url: InvokeURL + "integrations/kc-firma",
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
        const isEnabled = resultData.enabled === true;

        $checkbox.prop("checked", isEnabled);
        $customSwitch.toggleClass("w--redirected-checked", isEnabled);
        $label.text(isEnabled ? "Integracja aktywna:" : "Aktywuj:");
        $("#kc-alert").toggle(!isEnabled);
        getShops();
        displayMessage(
          "Success",
          "Integracja KC-Firma została pomyślnie aktywowana."
        );
      },
      error: function (jqXHR) {
        var msg = "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
        displayMessage("Error", msg);
        console.error("Error activating KC-Firma integration:", msg);
      },
    });
  }

  $("#KC-Integration-Switch").change(function () {
    const isChecked = $(this).is(":checked");
    putKcFirmaIntegration(isChecked);
  });

  // Mapa aktywnych żądań do sklepów
  const activeShopRequests = new Map();

  function activateKcFirmaIntegrationForShop(shopKey, buttonElement) {
    const now = Date.now();
    const cooldownMs = 5000; // 5 sekund

    // Sprawdź, czy trwa lub niedawno trwało inne zapytanie
    if (activeShopRequests.has(shopKey)) {
      const lastRequestTime = activeShopRequests.get(shopKey);
      if (now - lastRequestTime < cooldownMs) {
        console.log(
          `⛔ Blokada aktywacji: sklep ${shopKey} — spróbuj ponownie za ${(
            (cooldownMs - (now - lastRequestTime)) /
            1000
          ).toFixed(1)}s`
        );
        return;
      }
    }

    // Zarejestruj rozpoczęcie żądania
    activeShopRequests.set(shopKey, now);

    $.ajax({
      type: "POST",
      url: InvokeURL + "integrations/kc-firma/shops",
      contentType: "application/json",
      dataType: "json",
      headers: {
        Accept: "application/json",
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },
      data: JSON.stringify({ shopKey: shopKey }),
      beforeSend: function () {
        $(buttonElement).text("Przetwarzanie...");
      },
      success: function (response) {
        const parent = $(buttonElement).closest(".stacked-list3_item");

        $(buttonElement)
          .text("Aktywna")
          .addClass("disabled secondary")
          .prop("disabled", true);

        const badge = parent.find("#enabled");
        badge
          .text("Aktywna")
          .removeClass("badge-red wider")
          .addClass("badge enabled");

        parent.find(".stacked-list3_content-right").removeClass("defaulthide");
        parent.removeClass("preenabled").addClass("enabled");

        displayMessage(
          "Success",
          `Integracja KC-Firma została aktywowana dla sklepu ${shopKey}.`
        );

        console.log("🔐 Dane dostępowe:", response.credentials);
      },
      error: function (jqXHR) {
        let msg = "Wystąpił błąd.";
        if (jqXHR.status === 409) {
          msg = `Sklep ${shopKey} jest już przypisany do innej integracji WMS.`;
        } else if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
          msg = jqXHR.responseJSON.message;
        }
        $(buttonElement).text("Aktywuj");
        displayMessage("Error", msg);
        console.error("Błąd aktywacji:", msg);
      },
      complete: function () {
        // Po 5 sekundach zdejmij blokadę
        setTimeout(() => {
          activeShopRequests.delete(shopKey);
        }, cooldownMs);
      },
    });
  }

  $("#Shops-Container").on("click", ".buttonmain", function (e) {
    e.preventDefault();
    const parent = $(this).closest(".stacked-list3_item");
    const shopKey = parent.find('[shopdata="shopKey"]').text().trim();

    if (!shopKey) {
      displayMessage("Error", "Nie można znaleźć klucza sklepu.");
      return;
    }

    activateKcFirmaIntegrationForShop(shopKey, this);
  });

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

        const shopRows = shopContainer.children;

        for (let row of shopRows) {
          // Pomijamy wiersze szablonów
          if (
            row.id === "sampleRowShops" ||
            row.id === "sampleRowShopsActive"
          ) {
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
      }, 1);
    });
  }

  function getShops() {
    const style = document.getElementById("sampleRowShops");
    const shopsPanel = document.getElementById("shopsPanel");

    style.style.display = "none"; // <- ukryj oryginał

    const shopsUrl = new URL(InvokeURL + "shops?perPage=50");
    const integrationsUrl = new URL(InvokeURL + "integrations/kc-firma/shops");

    const requestShops = new XMLHttpRequest();
    const requestIntegrations = new XMLHttpRequest();

    // Etap 1: pobierz listę aktywowanych integracji
    requestIntegrations.open("GET", integrationsUrl, true);
    requestIntegrations.setRequestHeader("Authorization", orgToken);
    requestIntegrations.onload = function () {
      let activeShopKeys = new Set();
      if (
        requestIntegrations.status >= 200 &&
        requestIntegrations.status < 400
      ) {
        const integrationData = JSON.parse(this.response);
        integrationData.items.forEach((entry) => {
          activeShopKeys.add(entry.shopKey);
        });
      }

      // Etap 2: pobierz listę sklepów
      requestShops.open("GET", shopsUrl, true);
      requestShops.setRequestHeader("Authorization", orgToken);
      requestShops.onload = function () {
        if (requestShops.status >= 200 && requestShops.status < 400) {
          const data = JSON.parse(this.response);
          const toParse = data.items;
          const shopContainer = document.getElementById("Shops-Container");

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

            const isActive = activeShopKeys.has(shop.shopKey);

            if (isActive) {
              // Aktywny: zmień klasę, pokaż trzy kropki, zablokuj przycisk
              row.classList.remove("preenabled");
              row.classList.add("enabled");

              const badge = row.querySelector("#enabled");
              if (badge) {
                badge.textContent = "Aktywna";
                badge.classList.remove("wider");
                badge.classList.add("enabled");
              }

              const btn = row.querySelector(".buttonmain");
              if (btn) {
                btn.textContent = "Aktywna";
                btn.classList.add("disabled", "secondary");
                btn.disabled = true;
              }

              const dots = row.querySelector(".stacked-list3_content-right");
              if (dots) {
                dots.classList.remove("defaulthide");
              }
            }

            shopContainer.appendChild(row);
            // Odśwież interakcje Webflowa
            Webflow.destroy();
            Webflow.ready();
          });

          setupShopSearch();

          if (toParse.length === 0) {
            document.getElementById("tablecontentshops").style.display = "none";
            document.getElementById("emptystateshops").style.display = "flex";
          }
        } else {
          console.error("Błąd pobierania sklepów:", requestShops.status);
        }
      };

      requestShops.send();
    };

    requestIntegrations.onerror = function () {
      console.error(
        "Błąd pobierania statusów integracji:",
        requestIntegrations.statusText
      );
    };

    requestIntegrations.send();

    // Delegacja kliknięć do aktywacji integracji
    $("#Shops-Container").on("click", ".buttonmain", function (e) {
      e.preventDefault();
      const parent = $(this).closest(".stacked-list3_item");
      const shopKey = parent.find('[shopdata="shopKey"]').text().trim();

      if (!shopKey) {
        displayMessage("Error", "Nie można znaleźć klucza sklepu.");
        return;
      }

      activateKcFirmaIntegrationForShop(shopKey, this);
    });
  }

  function deactivateKcFirmaIntegrationForShop(shopKey, triggerElement) {
    $.ajax({
      type: "DELETE",
      url: InvokeURL + "integrations/kc-firma/shops/" + shopKey,
      headers: {
        Accept: "application/json",
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },
      beforeSend: function () {
        $("#waitingdots").show();
      },
      success: function () {
        $("#waitingdots").hide();
        const parent = $(triggerElement).closest(".stacked-list3_item");

        // 1. Zmiana klas głównych
        parent.removeClass("enabled").addClass("preenabled");

        // 2. Zmiana badge'a
        const badge = parent.find("#enabled");
        badge.text("Nieaktywna").removeClass("enabled").addClass("wider");

        // 3. Przycisk: Aktywuj + odblokuj
        const btn = parent.find(".buttonmain");
        btn
          .text("Aktywuj")
          .removeClass("disabled secondary")
          .prop("disabled", false);

        // 4. Ukryj trzy kropki (dropdown)
        parent.find(".stacked-list3_content-right").addClass("defaulthide");

        // 5. Schowaj otwarty dropdown (jeśli był otwarty)
        const dropdown = $(triggerElement).closest(".w-dropdown");
        dropdown.removeClass("w--open");
        dropdown.find(".w-dropdown-list").removeClass("w--open");

        const dropdownList = dropdown.find(".w-dropdown-list");
        dropdownList.removeClass("w--open");
        displayMessage(
          "Success",
          `Integracja KC-Firma została usunięta dla sklepu ${shopKey}.`
        );
      },
      error: function (jqXHR) {
        $("#waitingdots").hide();
        let msg = "Wystąpił błąd podczas usuwania integracji.";
        if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
          msg = jqXHR.responseJSON.message;
        }
        displayMessage("Error", msg);
        console.error("Błąd dezaktywacji:", msg);
      },
    });
  }

  $("#Shops-Container").on("click", "[step='delete']", function (e) {
    e.preventDefault();
    const parent = $(this).closest(".stacked-list3_item");
    const shopKey = parent.find("[shopdata='shopKey']").text().trim();

    if (!shopKey) {
      displayMessage("Error", "Nie można znaleźć klucza sklepu.");
      return;
    }

    deactivateKcFirmaIntegrationForShop(shopKey, this);
  });

  function resetKcFirmaPasswordForShop(shopKey, triggerElement) {
    // 1. Pokaż loading
    $("#waitingdots").show();

    // 2. Schowaj dropdown (jeśli otwarty)
    const dropdown = $(triggerElement).closest(".w-dropdown");
    dropdown.removeClass("w--open");
    dropdown.find(".w-dropdown-list").removeClass("w--open");

    const dropdownList = dropdown.find(".w-dropdown-list");
    dropdownList.removeClass("w--open");
    // 3. Zapytanie o nowe dane dostępowe
    $.ajax({
      type: "GET",
      url:
        InvokeURL +
        "integrations/kc-firma/shops/" +
        shopKey +
        "/reset-password",
      headers: {
        Accept: "application/json",
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },
      success: function (response) {
        const { username, password } = response.credentials;

        // 4. Komunikat końcowy
        displayMessage(
          "Success",
          `
        <strong>Nowe dane logowania dla sklepu ${response.shopKey}:</strong><br>
        <strong>Użytkownik:</strong> ${username}<br>
        <strong>Hasło:</strong> ${password}
      `
        );

        console.log("🔐 Nowe dane logowania:", response.credentials);
      },
      error: function (jqXHR) {
        let msg = "Wystąpił błąd podczas resetowania hasła.";
        if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
          msg = jqXHR.responseJSON.message;
        }
        displayMessage("Error", msg);
        console.error("Błąd resetowania hasła:", msg);
      },
      complete: function () {
        // 5. Ukryj loading zawsze
        $("#waitingdots").hide();
      },
    });
  }

  $("#Shops-Container").on("click", "[step='reset-password']", function (e) {
    e.preventDefault();
    const parent = $(this).closest(".stacked-list3_item");
    const shopKey = parent.find("[shopdata='shopKey']").text().trim();

    if (!shopKey) {
      displayMessage("Error", "Nie można znaleźć klucza sklepu.");
      return;
    }

    resetKcFirmaPasswordForShop(shopKey, this);
  });

  makeWebflowFormAjaxCreate = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var inputdata = form.serializeArray();

        var data = {
          username: inputdata[0].value,
          password: inputdata[1].value,
          host: inputdata[2].value.trim(),
          port: parseInt(inputdata[3].value.trim()),
          engine: inputdata[4].value,
          dbname: inputdata[5].value.trim(),
        };

        $.ajax({
          type: "PUT",
          url: InvokeURL + "integrations/merchant-console",
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
                displayMessage(
                  "Error",
                  "Oops. Coś poszło nie tak, spróbuj ponownie."
                );
                console.log(e);
                return;
              }
            }
            form.show();
            displayMessage(
              "Success",
              "Integracja z Konsolą Kupca przebiegła pomyślnie."
            );
            window.setTimeout(function () {
              location.reload();
            }, 1000);
          },
          error: function (jqXHR, exception) {
            var msg =
              "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
            displayMessage("Error", msg);
            form.show();
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxDelete = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action = InvokeURL + "integrations/" + integrationKeyId;
        var method = "DELETE";

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
              "Integracja z Konsolą Kupca została usunięta."
            );
            window.setTimeout(function () {
              (document.location = "href"),
                "https://" +
                  DomainName +
                  "/app/tenants/organization?name=" +
                  OrganizationName +
                  "&clientId=" +
                  ClientID;
            }, 5000);
          },
          error: function (jqXHR, exception) {
            var msg =
              "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
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

  getIntegrations();
  getShops();
  $("#waitingdots").hide();
  makeWebflowFormAjaxCreate($("#wf-form-pcmarket"));
  makeWebflowFormAjaxDelete($("#wf-form-DeleteIntegration"));
  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));
});
