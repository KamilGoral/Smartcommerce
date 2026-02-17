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
  var shopKey = new URL(location.href).searchParams.get("shopKey");

  var DomainName = getCookie("sprytnyDomainName");
  var ClientID = getCookieNameByValue(orgToken);
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var OrganizationName = getCookie("OrganizationName");

  const shopBread = document.getElementById("ShopBread0");
  shopBread.textContent = shopKey;
  shopBread.setAttribute(
    "href",
    "https://" + DomainName + "/app/shops/shop?shopKey=" + shopKey,
  );

  const recadvId = new URL(location.href).searchParams.get("deliveryId");

  const deliveryBread = document.getElementById("DeliveryBread0");
  deliveryBread.textContent = recadvId;
  const OrganizationBread0 = document.getElementById("OrganizationBread0");
  OrganizationBread0.textContent = OrganizationName;
  OrganizationBread0.setAttribute(
    "href",
    "https://" +
      DomainName +
      "/app/tenants/organization?name=" +
      OrganizationName +
      "&clientId=" +
      ClientID,
  );

  // ============================================
  // Pobierz szczegóły dokumentu RECADV i wypełnij pola
  // ============================================
  // ---------- Inline SVG (14px) ----------
  const ICON = {
    truck: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    box: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    coins: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    alert: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    file: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    calendar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  };

  // Pomocnik: badge inline (styl jak "Dokument z ...")
  function dhBadge(icon, label, value, bg, border, color) {
    return `<span style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; background: ${bg}; border: 1px solid ${border}; border-radius: 6px; font-size: 12px; color: ${color}; font-weight: 500; white-space: nowrap; line-height: 1.4;">
      ${icon} ${label} <strong>${value}</strong>
    </span>`;
  }

  // ---------- Renderuj cały nagłówek dokumentu ----------
  function renderDeliveryHeader(data) {
    const container = document.getElementById("table-content");
    if (!container) return;

    // Usuń stary HTML statisticsgrid + deliverydetails + poprzedni header jeśli istnieją
    const oldGrid = container.querySelector(".statisticsgrid");
    if (oldGrid) oldGrid.remove();
    const oldDetails = container.querySelector(".deliverydetails");
    if (oldDetails) oldDetails.remove();
    const oldHeader = document.getElementById("delivery-header");
    if (oldHeader) oldHeader.remove();

    // Formatuj dane
    const wholesaler = data.wholesalerKey
      ? data.wholesalerKey.charAt(0).toUpperCase() + data.wholesalerKey.slice(1).replace(/-/g, " ")
      : "-";

    const issueDateFmt = data.issueDate
      ? new Date(data.issueDate).toLocaleDateString("pl-PL", { year: "numeric", month: "2-digit", day: "2-digit" })
      : "-";

    const sourceFileName = data.sourceFile?.name ? escapeHtml(data.sourceFile.name) : "-";

    const createdFmt = data.created?.at
      ? new Date(data.created.at).toLocaleString("pl-PL", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      : "-";
    const createdBy = data.created?.by ? escapeHtml(data.created.by) : "";

    const modifiedFmt = data.modified?.at
      ? new Date(data.modified.at).toLocaleString("pl-PL", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      : "-";
    const modifiedBy = data.modified?.by ? escapeHtml(data.modified.by) : "";

    const headerEl = document.createElement("div");
    headerEl.id = "delivery-header";
    headerEl.style.cssText = "margin-bottom: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;";

    headerEl.innerHTML = `
      <!-- Statystyki - rząd badge'ów -->
      <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 10px;">
        ${dhBadge(ICON.truck, "Dostawca", `<span id="wholesalerName">${wholesaler}</span>`, "#f9fafb", "#e5e7eb", "#374151")}
        ${dhBadge(ICON.box, "Liczba pozycji", `<span id="productsCountDelivery">-</span>`, "#f9fafb", "#e5e7eb", "#374151")}
        ${dhBadge(ICON.coins, "Wartość dokumentu", `<span id="valueDelivery">-</span>`, "#f9fafb", "#e5e7eb", "#374151")}
        <button id="details-toggle-btn" type="button" style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 12px; color: #6b7280; cursor: pointer; transition: background 0.15s; font-family: inherit;">
          Szczegóły
          <svg id="details-chevron" width="10" height="10" viewBox="0 0 12 12" fill="none" style="transition: transform 0.2s;">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Szczegóły dokumentu (domyślnie ukryte) -->
      <div class="deliverydetails" style="display: none;">
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
          ${dhBadge(ICON.file, "Dostawa", `<span id="sourceFile">${sourceFileName}</span>`, "#f9fafb", "#e5e7eb", "#374151")}
          ${dhBadge(ICON.clock, "Utworzony", `<span id="createdAtBy">${createdFmt}</span>${createdBy ? ` <span style="color: #9ca3af; font-weight: 400;">przez ${createdBy}</span>` : ""}`, "#f9fafb", "#e5e7eb", "#374151")}
          ${dhBadge(ICON.edit, "Modyfikacja", `<span id="modifiedAtBy">${modifiedFmt}</span>${modifiedBy ? ` <span style="color: #9ca3af; font-weight: 400;">przez ${modifiedBy}</span>` : ""}`, "#f9fafb", "#e5e7eb", "#374151")}
        </div>
      </div>
    `;

    // Wstaw na początku kontenera (przed tabelą i filtrami)
    container.insertBefore(headerEl, container.firstChild);
  }

  // ============================================
  // Modal wyboru dostawcy (potentialWholesalerKeys)
  // ============================================
  function showWholesalerKeyModal(potentialKeys, currentKey) {
    const modal = document.getElementById("wholesalerKeyChangeModal");
    const select = document.getElementById("wholesalerKeySelector");
    const form = document.getElementById("wf-form-wholesalerKeySelector");
    const closeBtn = modal.querySelector(".icon-close");

    // Funkcja wypełniająca select i pokazująca modal
    function populateAndShow(nameMap) {
      select.innerHTML = '<option value="">Wybierz</option>';
      potentialKeys.forEach(function (key) {
        var option = document.createElement("option");
        option.value = key;
        option.textContent = nameMap[key] || key;
        if (key === currentKey) {
          option.selected = true;
        }
        select.appendChild(option);
      });
      $(modal).css("display", "flex");
    }

    // Pobierz listę dostawców z API, aby wyświetlić pełne nazwy
    $.ajax({
      type: "GET",
      url: InvokeURL + "wholesalers?enabled=true&perPage=1000",
      headers: {
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },
      success: function (resp) {
        var nameMap = {};
        (resp.items || []).forEach(function (w) {
          nameMap[w.wholesalerKey] = w.name || w.wholesalerKey;
        });
        populateAndShow(nameMap);
      },
      error: function () {
        // Fallback — formatuj klucze jako nazwy
        var nameMap = {};
        potentialKeys.forEach(function (key) {
          nameMap[key] =
            key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, " ");
        });
        populateAndShow(nameMap);
      },
    });

    // Obsługa submit formularza — PATCH wholesalerKey
    $(form)
      .off("submit.wholesalerKey")
      .on("submit.wholesalerKey", function (e) {
        e.preventDefault();
        const selectedKey = select.value;
        if (!selectedKey) {
          displayMessage("Error", "Wybierz dostawcę z listy");
          return;
        }

        $.ajax({
          type: "PATCH",
          url:
            InvokeURL +
            "van/transactions/" +
            encodeURIComponent(recadvId),
          headers: {
            Authorization: orgToken,
            "Requested-By": "webflow-3-4",
            "Content-Type": "application/json",
          },
          data: JSON.stringify([
            {
              op: "replace",
              path: "/wholesalerKey",
              value: selectedKey,
            },
            {
              op: "replace",
              path: "/status",
              value: "committed",
            },
          ]),
          beforeSend: function () {
            form.querySelector('input[type="submit"]').disabled = true;
            form.querySelector('input[type="submit"]').value =
              "Proszę czekać...";
          },
          success: function () {
            // Przeładuj stronę — dane zostaną pobrane ponownie z wybranym dostawcą
            location.reload();
          },
          error: function (xhr) {
            form.querySelector('input[type="submit"]').disabled = false;
            form.querySelector('input[type="submit"]').value = "Wybierz";
            console.error("Błąd PATCH wholesalerKey:", xhr);
            displayMessage(
              "Error",
              "Nie udało się zmienić dostawcy. Spróbuj ponownie.",
            );
          },
        });
      });

    // Zamknij modal → powrót do strony sklepu
    var redirectToShop = function () {
      window.location.href =
        "https://" +
        DomainName +
        "/app/shops/shop?shopKey=" +
        shopKey;
    };

    $(closeBtn).off("click.wholesalerKey").on("click.wholesalerKey", redirectToShop);

    // Kliknięcie w tło modala (wrapper) → też powrót
    $(modal)
      .off("click.wholesalerKey")
      .on("click.wholesalerKey", function (e) {
        if ($(e.target).is(".modal-wrapper")) {
          redirectToShop();
        }
      });
  }

  function loadDeliveryDetails() {
    return $.ajax({
      type: "GET",
      url: InvokeURL + "van/recadvs/" + encodeURIComponent(recadvId),
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
      success: function (data) {
        if (!data) {
          console.warn("Nie znaleziono dokumentu o UUID:", recadvId);
          return;
        }

        // Tytuł dokumentu
        const deliveryTitle = document.getElementById("DeliveryIdBig");
        if (deliveryTitle && data.name) {
          deliveryTitle.textContent = data.name;
          deliveryBread.textContent = data.name;
        }

        // Status badges
        if (data.status) {
          const editState = document.querySelector(".editstate");
          const confirmedState = document.querySelector(".confirmedstate");

          if (data.status.toLowerCase() === "draft") {
            if (editState) editState.style.display = "flex";
            if (confirmedState) confirmedState.style.display = "none";
          } else if (data.status.toLowerCase() === "committed") {
            if (editState) editState.style.display = "none";
            if (confirmedState) confirmedState.style.display = "flex";
          }
        }

        // Zapisz issueDate globalnie (do filtrów dat)
        if (data.issueDate) {
          deliveryIssueDate = data.issueDate.substring(0, 10); // "YYYY-MM-DD"
        }

        // Renderuj cały nagłówek (statystyki + szczegóły)
        renderDeliveryHeader(data);

        // Jeśli status draft i są potencjalni dostawcy — pokaż modal wyboru
        if (
          data.status &&
          data.status.toLowerCase() === "draft" &&
          Array.isArray(data.potentialWholesalerKeys) &&
          data.potentialWholesalerKeys.length > 1
        ) {
          showWholesalerKeyModal(data.potentialWholesalerKeys, data.wholesalerKey);
          return; // nie inicjalizuj reszty strony, dopóki użytkownik nie wybierze
        }

        // Inicjalizuj toggle szczegółów
        setTimeout(() => {
          if (typeof initDetailsToggleEvents === "function") {
            initDetailsToggleEvents();
          }
          if (typeof initHelpToggleEvents === "function") {
            initHelpToggleEvents();
          }
        }, 100);
      },
      error: function (error) {
        console.error("Błąd pobierania szczegółów dostawy:", error);
        displayMessage("Error", "Nie udało się pobrać szczegółów dostawy");
      },
    });
  }

  // Wywołaj po załadowaniu strony — tabela czeka na issueDate z detali dostawy
  loadDeliveryDetails().then(function () {
    initDeliveryTable({ recadvId, InvokeURL, orgToken });
    // Datepicker po initDeliveryTable — DOM (#dateRangeToggle) już istnieje
    if (deliveryIssueDate) {
      initDatePickerDefaults();
    }
    initializeSimpleTooltips();
  });

  // ============================================
  // Aktualizuj statystyki na podstawie danych z tabeli
  // ============================================
  function updateDeliveryStatistics(tableData) {
    // Wywoływane tylko raz z xhr.dt z pełnymi danymi GET - stałe, nie zmieniane przez filtry
    const productsCount = document.getElementById("productsCountDelivery");
    if (productsCount) {
      productsCount.textContent = tableData.length;
    }

    // Oblicz wartość całkowitą
    let totalValue = 0;
    tableData.forEach((row) => {
      totalValue += valueTotal(row?.segments);
    });

    // Wartość
    const valueDelivery = document.getElementById("valueDelivery");
    if (valueDelivery) {
      valueDelivery.textContent = fmtPLN(totalValue);
    }

  }

  //tutaj kod

  // ============================================
  // DataTable: Delivery/RECADV view (jak screen)
  // ============================================

  // Wymagane globalnie:
  /// const InvokeURL = ".../";  // np. https://...execute-api.../stage/
  /// const orgToken = "...";
  /// const recadvId = "...";

  // ---------- helpers ----------
  const fmtPLN = (n) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return "-";
    return v.toLocaleString("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const fmtQty = (n) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return "-";
    return String(v);
  };
  const safeArr = (x) => (Array.isArray(x) ? x : []);
  const safeNum = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);

  function sumQty(segments) {
    return safeArr(segments).reduce((acc, s) => acc + safeNum(s?.quantity), 0);
  }
  function avgPriceWeighted(segments) {
    const seg = safeArr(segments);
    let q = 0,
      v = 0;
    seg.forEach((s) => {
      const sq = safeNum(s?.quantity);
      const sp = safeNum(s?.netPrice);
      q += sq;
      v += sq * sp;
    });
    return q > 0 ? v / q : null;
  }
  function valueTotal(segments) {
    const q = sumQty(segments);
    const p = avgPriceWeighted(segments);
    if (p === null) return 0;
    return q * p;
  }
  function uniq(arr) {
    return [...new Set(safeArr(arr).filter(Boolean))];
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---------- status logic ----------
  function computeRowState(rec) {
    // rec: produkt z RECADV
    const deliveredQty = sumQty(rec?.segments);
    const deliveredPrice = avgPriceWeighted(rec?.segments);

    const linked = safeArr(rec?.linkedOrderProducts); // z API sample: linkedOrderProducts: []
    const proposals = safeArr(rec?.potentialMatches);
    const isValid = rec?.valid === true;

    if (!isValid) {
      return { key: "invalid", label: "Błędna", sort: 90,
        bg: "#fef2f2", border: "#fca5a5", color: "#dc2626" };
    }

    // Status jest zawsze obliczany z oryginalnych danych serwera (nie zależy od filtra zamówienia)
    const hasLinked = linked.length > 0;
    const hasProposals = proposals.length > 0;

    if (!hasLinked) {
      if (hasProposals) {
        return { key: "proposal", label: "Proponowane", sort: 20,
          bg: "#f5f3ff", border: "#c4b5fd", color: "#7c3aed" };
      }
      return { key: "unmatched", label: "Brak dopasowania", sort: 10,
        bg: "#f9fafb", border: "#e5e7eb", color: "#9ca3af" };
    }

    // linked state + diffs
    const orderedQty = linked.reduce((acc, p) => acc + sumQty(p?.segments), 0);
    const orderedPrice = avgPriceWeighted(linked?.[0]?.segments);
    const qtyDiff = roundQty(deliveredQty - orderedQty);

    const deliveredValue =
      deliveredPrice === null ? 0 : deliveredQty * deliveredPrice;
    const orderedValue = orderedPrice === null ? 0 : orderedQty * orderedPrice;
    const valueDiff = deliveredValue - orderedValue;

    const qtyDiffNonZero = Math.abs(qtyDiff) > 0.0001;
    const valueDiffNonZero = Math.abs(valueDiff) > 0.000001;

    if (!qtyDiffNonZero && !valueDiffNonZero) {
      return { key: "matched", label: "Zgodne", sort: 40,
        bg: "#f0fdf4", border: "#86efac", color: "#16a34a" };
    }
    return { key: "diff", label: "Rozbieżność", sort: 50,
      bg: "#fffbeb", border: "#fcd34d", color: "#d97706" };
  }

  // Zaokrąglenie różnicy ilościowej do max 3 miejsc po przecinku (floating point safety)
  function roundQty(n) {
    return Math.round(n * 1000) / 1000;
  }

  function diffSpanNumber(n, italic = false) {
    const v = roundQty(Number(n));
    if (!Number.isFinite(v))
      return `<span class="${italic ? "muted italic" : "muted"}">-</span>`;
    if (v === 0) {
      const style = italic
        ? "color: #6b7280; font-style: italic;"
        : "color: #6b7280;";
      return `<span style="${style}">0</span>`;
    }

    // Każda różnica ilościowa (+ lub -) = niezgodność → czerwony
    const sign = v > 0 ? "+" : "";
    const style = italic
      ? "color: #dc2626; font-style: italic;"
      : "color: #dc2626;";
    return `<span style="${style}">${sign}${v}</span>`;
  }

  function diffSpanMoney(n, italic = false) {
    const v = Number(n);
    if (!Number.isFinite(v))
      return `<span class="${italic ? "muted italic" : "muted"}">-</span>`;
    if (Math.abs(v) < 0.000001) {
      const style = italic
        ? "color: #6b7280; font-style: italic;"
        : "color: #6b7280;";
      return `<span style="${style}">${fmtPLN(0)}</span>`;
    }

    // Konwencja: wartość = zamówione - dostarczone
    // + (dodatnia) = zaoszczędzono (dostawa tańsza) → zielony
    // - (ujemna)   = strata (dostawa droższa)       → czerwony
    const color = v > 0 ? "#16a34a" : "#dc2626";
    const sign = v > 0 ? "+" : "";
    const style = italic
      ? `color: ${color}; font-style: italic;`
      : `color: ${color};`;
    return `<span style="${style}">${sign}${fmtPLN(Math.abs(v))}</span>`;
  }

  // ---------- kolumny Weryfikacja + Wartość — renderery ----------

  // Wspólna logika wyciągania danych zamówienia z wiersza
  function extractOrderData(row) {
    var deliveredQty = sumQty(row?.segments);
    var deliveredPrice = avgPriceWeighted(row?.segments);
    var orderedQty = 0;
    var orderedPrice = null;
    var isProposal = false;
    var hasMatch = false;

    if (selectedOrderId && row?._primaryMatch) {
      orderedQty = sumQty(row._primaryMatch?.segments);
      orderedPrice = avgPriceWeighted(row._primaryMatch?.segments);
      isProposal = !!row._isPrimaryProposal;
      hasMatch = true;
    } else {
      var linked = safeArr(row?.linkedOrderProducts);
      var proposals = safeArr(row?.potentialMatches);

      if (linked.length) {
        orderedQty = linked.reduce(function (acc, p) { return acc + sumQty(p?.segments); }, 0);
        orderedPrice = avgPriceWeighted(linked[0]?.segments);
        hasMatch = true;
      } else if (proposals.length) {
        orderedQty = sumQty(proposals[0]?.segments);
        orderedPrice = avgPriceWeighted(proposals[0]?.segments);
        isProposal = true;
        hasMatch = true;
      }
    }

    return { deliveredQty: deliveredQty, deliveredPrice: deliveredPrice, orderedQty: orderedQty, orderedPrice: orderedPrice, isProposal: isProposal, hasMatch: hasMatch };
  }

  // Oblicz różnice na podstawie danych
  function computeDiffs(d) {
    var qtyDiff = roundQty(d.deliveredQty - d.orderedQty);
    var priceDiff = (d.deliveredPrice !== null && d.orderedPrice !== null) ? d.orderedPrice - d.deliveredPrice : 0;
    var commonQty = Math.min(d.deliveredQty, d.orderedQty);
    var totalDiff = (d.deliveredPrice !== null && d.orderedPrice !== null)
      ? commonQty * (d.orderedPrice - d.deliveredPrice)
      : 0;
    var hasQtyDiff = Math.abs(qtyDiff) > 0.0001;
    var hasPriceDiff = Math.abs(priceDiff) > 0.000001;
    return { qtyDiff: qtyDiff, priceDiff: priceDiff, totalDiff: totalDiff, commonQty: commonQty, hasQtyDiff: hasQtyDiff, hasPriceDiff: hasPriceDiff };
  }

  // Szczegóły: zam.il×zam.cena → dost.il×dost.cena (inline, styl jak GTIN)
  function buildDetailLine(d) {
    var zam = fmtQty(d.orderedQty) + "\u00d7" + (d.orderedPrice !== null ? fmtPLN(d.orderedPrice) : "-");
    var dost = fmtQty(d.deliveredQty) + "\u00d7" + (d.deliveredPrice !== null ? fmtPLN(d.deliveredPrice) : "-");
    var tooltip = "Zam\u00f3wienie: " + zam + " \u2192 Dostawa: " + dost;
    return '<span class="nz-detail" title="' + tooltip + '">(' + zam + ' \u2192 ' + dost + ')</span>';
  }

  // Kolumna „Weryfikacja" — badge-e niezgodności
  function renderWeryfikacja(row, type) {
    var d = extractOrderData(row);
    if (!d.hasMatch) {
      if (type === "sort" || type === "type") return 0;
      return '<span class="muted">\u2014</span>';
    }
    var diffs = computeDiffs(d);
    // Sort: 0 = zgodne, 1 = niezgodne (żeby niezgodne były na górze przy asc)
    if (type === "sort" || type === "type") return (diffs.hasQtyDiff || diffs.hasPriceDiff) ? 1 : 0;
    return buildWeryfikacjaHtml(d, diffs);
  }

  function buildWeryfikacjaHtml(d, diffs) {
    var italicStyle = d.isProposal ? " font-style:italic;" : "";
    var detail = ' ' + buildDetailLine(d);

    if (!diffs.hasQtyDiff && !diffs.hasPriceDiff) {
      return '<span class="nz-cell" style="' + italicStyle + '"><span class="nz-ok">\u2713 Zgodne</span>' + detail + '</span>';
    }

    var parts = [];
    if (diffs.hasQtyDiff) {
      var qSign = diffs.qtyDiff > 0 ? "+" : "";
      parts.push('<span class="nz-badge" style="color:#dc2626">' + qSign + roundQty(diffs.qtyDiff) + ' szt.</span>');
    }
    if (diffs.hasPriceDiff) {
      var pSign = diffs.priceDiff > 0 ? "+" : "";
      var pColor = diffs.priceDiff > 0 ? "#16a34a" : "#dc2626";
      parts.push('<span class="nz-badge" style="color:' + pColor + '">' + pSign + fmtPLN(diffs.priceDiff) + '/szt.</span>');
    }

    return '<span class="nz-cell" style="' + italicStyle + '">' + parts.join(' <span style="color:#94a3b8;">\u2022</span> ') + detail + '</span>';
  }

  // Kolumna „Wartość" — impact w PLN
  function renderWartosc(row, type) {
    var d = extractOrderData(row);
    if (!d.hasMatch) {
      if (type === "sort" || type === "type") return 0;
      return '<span class="muted">\u2014</span>';
    }
    var diffs = computeDiffs(d);
    if (type === "sort" || type === "type") return diffs.totalDiff;
    return buildWartoscHtml(diffs, d);
  }

  function buildWartoscHtml(diffs, d) {
    var isProposal = d && d.isProposal;
    var italicStyle = isProposal ? " font-style:italic;" : "";
    if (!diffs.hasPriceDiff) {
      return '<span style="color:#6b7280;' + italicStyle + '">' + fmtPLN(0) + '</span>';
    }
    var sign = diffs.totalDiff > 0 ? "+" : "";
    var color = diffs.totalDiff > 0 ? "#16a34a" : "#dc2626";
    var pSign = diffs.priceDiff > 0 ? "+" : "";
    var tooltip = "R\u00f3\u017cnica ceny: " + pSign + fmtPLN(Math.abs(diffs.priceDiff)) + "/szt. \u00d7 " + fmtQty(diffs.commonQty) + " szt. (zam\u00f3wionych) = " + sign + fmtPLN(Math.abs(diffs.totalDiff));
    return '<span class="nz-impact" style="color:' + color + ';' + italicStyle + '" title="' + tooltip + '">' + sign + fmtPLN(Math.abs(diffs.totalDiff)) + '</span>';
  }

  // Child row renderery
  function renderChildWeryfikacja(deliveredQty, deliveredPrice, orderedQty, orderedPrice) {
    var d = { deliveredQty: deliveredQty, deliveredPrice: deliveredPrice, orderedQty: orderedQty, orderedPrice: orderedPrice, isProposal: true, hasMatch: true };
    var diffs = computeDiffs(d);
    return buildWeryfikacjaHtml(d, diffs);
  }

  function renderChildWartosc(deliveredQty, deliveredPrice, orderedQty, orderedPrice) {
    var d = { deliveredQty: deliveredQty, deliveredPrice: deliveredPrice, orderedQty: orderedQty, orderedPrice: orderedPrice, isProposal: true, hasMatch: true };
    var diffs = computeDiffs(d);
    return buildWartoscHtml(diffs, d);
  }

  // ---------- child row render (warianty/propozycje) ----------
  function renderChildProposals(parent, selectedOrderId) {
    const deliveredQty = sumQty(parent?.segments);
    const deliveredPrice = avgPriceWeighted(parent?.segments);

    const parentName = escapeHtml(parent?.name || "");
    const parentGtin = escapeHtml(parent?.gtin || "");

    // Użyj _variantMatches jeśli dostępne
    let proposalsToRender;
    if (selectedOrderId && parent?._variantMatches) {
      proposalsToRender = parent._variantMatches;
    } else {
      const proposals = safeArr(parent?.potentialMatches);
      proposalsToRender = proposals.slice(1);
    }

    if (proposalsToRender.length === 0) return "";

    const rows = proposalsToRender.map((m, idx) => {
      const orderedQty = sumQty(m?.segments);
      const orderedPrice = avgPriceWeighted(m?.segments);

      const orderId = m?.orderId || "";
      const matchId = m?.id;

      const varKey = makeVariantKey(parent?.id, matchId);
      const varChecked = selectionState.variantRows.has(varKey) ? " checked" : "";
      const werHtml = orderedQty > 0
        ? renderChildWeryfikacja(deliveredQty, deliveredPrice, orderedQty, orderedPrice)
        : '<span class="muted" style="font-style:italic;">\u2014</span>';
      const valHtml = orderedQty > 0
        ? renderChildWartosc(deliveredQty, deliveredPrice, orderedQty, orderedPrice)
        : '<span class="muted" style="font-style:italic;">\u2014</span>';
      return `
      <tr class="child-row" style="background: #f9fafb;">
        <td style="text-align:center;vertical-align:middle;padding:4px 2px;width:28px;">
          <input type="checkbox" class="bulk-cb-variant" data-parent-id="${parent?.id}" data-match-id="${matchId}" data-match-qty="${orderedQty}"${varChecked} />
        </td>
        <td style="padding:4px 2px;width:28px;"></td>
        <td style="padding: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; padding-left: 20px;">
            <span style="color: #9ca3af;">↳</span>
            <span style="font-weight: 400;">Wariant ${idx + 1}</span>
          </div>
        </td>
        <td class="text-right nz-col" style="padding: 8px;">${werHtml}</td>
        <td class="text-right nz-col" style="padding: 8px;">${valHtml}</td>
        <td style="padding: 8px; font-style: italic;">
          ${
            orderId
              ? `<div style="font-style: italic;">${formatOrderDisplay(orderId)}</div>`
              : `<span style="color: #9ca3af; font-style: italic;">-</span>`
          }
        </td>
        <td style="padding: 8px;">
          <span class="st-badge" style="background:#f5f3ff;border-color:#c4b5fd;color:#7c3aed">Proponowane</span>
        </td>
      </tr>
    `;
    });

    // Zwracamy wiersze jako HTML string (bez wrapper table)
    return rows.join("");
  }

  // globalnie (żeby mieć dostęp do instancji i móc ją odświeżać)
  let deliveryTable = null;

  // Data dokumentu (issueDate) – ustawiana z loadDeliveryDetails(), używana do filtrów dat
  let deliveryIssueDate = null;

  // ============================================
  // Bulk Selection State
  // ============================================
  const selectionState = {
    mainRows: new Set(),
    variantRows: new Set(),
    variantData: new Map(),
  };

  function makeVariantKey(parentId, matchId) {
    return parentId + ":" + matchId;
  }

  function toggleMainRow(rowId, checked) {
    if (checked) {
      selectionState.mainRows.add(rowId);
    } else {
      selectionState.mainRows.delete(rowId);
    }
    updateBulkToolbar();
  }

  function toggleVariantRow(parentId, matchId, matchQty, checked) {
    const key = makeVariantKey(parentId, matchId);
    if (checked) {
      selectionState.variantRows.add(key);
      selectionState.variantData.set(key, { parentId, matchId, matchQty });
    } else {
      selectionState.variantRows.delete(key);
      selectionState.variantData.delete(key);
    }
    updateBulkToolbar();
  }

  function clearAllSelections(silent) {
    selectionState.mainRows.clear();
    selectionState.variantRows.clear();
    selectionState.variantData.clear();
    document.querySelectorAll(".bulk-cb-main, .bulk-cb-variant").forEach(function (cb) { cb.checked = false; });
    const selectAll = document.getElementById("bulk-select-all");
    if (selectAll) { selectAll.checked = false; selectAll.indeterminate = false; }
    updateBulkToolbar();
  }

  function getSelectionCounts() {
    const main = selectionState.mainRows.size;
    const variants = selectionState.variantRows.size;
    return { main, variants, total: main + variants };
  }

  function syncSelectAllCheckbox() {
    const selectAll = document.getElementById("bulk-select-all");
    if (!selectAll || !deliveryTable) return;
    const visibleCbs = document.querySelectorAll("#table_delivery tbody .bulk-cb-main");
    if (visibleCbs.length === 0) { selectAll.checked = false; selectAll.indeterminate = false; return; }
    let checkedCount = 0;
    visibleCbs.forEach(function (cb) { if (cb.checked) checkedCount++; });
    selectAll.checked = checkedCount === visibleCbs.length;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < visibleCbs.length;
  }

  // ============================================
  // Bulk Styles Injection
  // ============================================
  function injectBulkStyles() {
    if (document.getElementById("dh-bulk-styles")) return;
    const s = document.createElement("style");
    s.id = "dh-bulk-styles";
    s.textContent = `
      .dataTables_scrollBody>table>thead{visibility:collapse!important;height:0!important;line-height:0!important;overflow:hidden!important}
      #bulk-toolbar{display:flex;align-items:center;gap:8px;background:transparent;border:none;min-height:32px;margin-left:auto;flex-shrink:0}
      .bulk-counter{font-size:14px;color:#94a3b8;font-weight:500;white-space:nowrap;transition:color .2s}
      #bulk-toolbar.has-selection .bulk-counter{color:#1e40af}
      .bulk-action-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;border:1px solid #d1d5db;background:#fff;color:#374151;transition:all .15s;white-space:nowrap;font-family:inherit;line-height:1.4}
      .bulk-action-btn:disabled{opacity:.4;cursor:not-allowed}
      .bulk-action-btn:not(:disabled):hover{background:#f3f4f6;border-color:#9ca3af}
      .bulk-cb-main,.bulk-cb-variant{width:14px;height:14px;cursor:pointer;accent-color:#2563eb;margin:0}
      .bulk-select-cell,.expand-control-cell{text-align:center!important;vertical-align:middle!important;padding:4px 2px!important;width:28px!important;max-width:28px!important}
      td.expand-control-cell::before,td.expand-control-cell::after{content:none!important}
      td.dt-control::before,td.dt-control::after{content:none!important}
      td.details-control{cursor:pointer}
      td.details-control::before{content:"\\203A"!important;display:inline-block;font-size:16px;font-weight:700;color:#94a3b8;transition:transform .15s ease;transform:rotate(0deg)}
      td.details-control::after{content:none!important}
      tr.shown>td.details-control::before{transform:rotate(90deg);color:#3b82f6}
      .nz-col{vertical-align:middle}
      .nz-cell{white-space:nowrap}
      .nz-badge{font-weight:600}
      .nz-detail{color:#6b7280;font-size:.85em;white-space:nowrap;margin-left:4px}
      .nz-impact{font-size:13px;font-weight:600}
      .nz-ok{color:#16a34a;font-weight:500}
      .st-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;border:1px solid;white-space:nowrap;line-height:1.4}
      .filter-dot{display:inline-block;width:8px;height:8px;border-radius:50%;flex-shrink:0}
      #table_delivery_filter{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
      #table_delivery_filter label{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:500;color:#374151;margin:0;font-family:inherit}
      #table_delivery_filter input[type="search"],#table_delivery_filter input{padding:7px 14px;border-radius:8px;font-size:14px;font-weight:400;border:1px solid #d1d5db;background:#fff;color:#374151;outline:none;font-family:inherit;line-height:1.4;min-width:200px;transition:border-color .15s}
      #table_delivery_filter input:focus{border-color:#93c5fd;box-shadow:0 0 0 2px rgba(59,130,246,.15)}
      .top{display:flex;align-items:center;gap:12px;padding:4px 0;flex-wrap:nowrap}
    `;
    document.head.appendChild(s);
  }

  // ============================================
  // Bulk Toolbar
  // ============================================
  function renderBulkToolbar() {
    const existing = document.getElementById("bulk-toolbar");
    if (existing) existing.remove();

    const toolbar = document.createElement("div");
    toolbar.id = "bulk-toolbar";
    toolbar.innerHTML = `
      <span id="bulk-counter" class="bulk-counter">Zaznaczono: 0</span>
      <button id="bulk-link-btn" class="bulk-action-btn" disabled><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Połącz</button>
      <button id="bulk-unlink-btn" class="bulk-action-btn" disabled><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.84 12.25l1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M5.16 11.75l-1.72 1.71a5 5 0 0 0 7.07 7.07l1.72-1.71"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="16" y1="19" x2="16" y2="22"/><line x1="19" y1="16" x2="22" y2="16"/></svg> Rozłącz</button>
      <button id="bulk-undo-btn" class="bulk-action-btn" disabled><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg> Cofnij</button>
    `;

    const topDiv = document.querySelector("#table_delivery_wrapper .top");
    if (topDiv) {
      topDiv.appendChild(toolbar);
    } else {
      const wrapper = document.querySelector("#table_delivery_wrapper");
      if (wrapper) wrapper.insertBefore(toolbar, wrapper.firstChild);
    }
  }

  function updateBulkToolbar() {
    const counter = document.getElementById("bulk-counter");
    const toolbar = document.getElementById("bulk-toolbar");
    if (!counter || !toolbar) return;

    const c = getSelectionCounts();
    if (c.total === 0) {
      counter.textContent = "Zaznaczono: 0";
      toolbar.classList.remove("has-selection");
    } else {
      const parts = [];
      if (c.main > 0) parts.push(c.main + " główn" + (c.main === 1 ? "y" : "ych"));
      if (c.variants > 0) parts.push(c.variants + " wariant" + (c.variants === 1 ? "" : "ów"));
      counter.textContent = "Zaznaczono: " + parts.join(" + ") + " (razem " + c.total + ")";
      toolbar.classList.add("has-selection");
    }

    const btns = toolbar.querySelectorAll(".bulk-action-btn:not(#bulk-undo-btn)");
    btns.forEach(function (btn) { btn.disabled = c.total === 0; });
  }

  // ============================================
  // Bulk Toolbar Event Initialization
  // ============================================
  function initBulkToolbarEvents() {
    // Main row checkbox
    $("#table_delivery tbody").on("change.delivery", ".bulk-cb-main", function () {
      const rowId = Number($(this).data("row-id"));
      toggleMainRow(rowId, this.checked);
      syncSelectAllCheckbox();
    });

    // Variant row checkbox
    $(document).on("change.delivery", ".bulk-cb-variant", function () {
      const parentId = Number($(this).data("parent-id"));
      const matchId = Number($(this).data("match-id"));
      const matchQty = Number($(this).data("match-qty")) || 0;
      toggleVariantRow(parentId, matchId, matchQty, this.checked);
    });

    // Select-all header checkbox
    $(document).on("change.delivery", "#bulk-select-all", function () {
      const checked = this.checked;
      deliveryTable.rows({ search: "applied" }).every(function () {
        const data = this.data();
        if (!data?.id) return;
        if (checked) {
          selectionState.mainRows.add(data.id);
        } else {
          selectionState.mainRows.delete(data.id);
        }
      });
      document.querySelectorAll("#table_delivery tbody .bulk-cb-main").forEach(function (cb) {
        cb.checked = checked;
      });
      updateBulkToolbar();
    });

    // Toolbar buttons
    $(document).on("click.delivery", "#bulk-link-btn", function () { if (!this.disabled) executeBulkLink(); });
    $(document).on("click.delivery", "#bulk-unlink-btn", function () { if (!this.disabled) executeBulkUnlink(); });
    $(document).on("click.delivery", "#bulk-undo-btn", function () {
      if (lastUndoStack && lastUndoStack.length > 0) {
        this.disabled = true;
        executeBulkUndo(lastUndoStack);
        lastUndoStack = null;
      }
    });
  }

  // ============================================
  // Bulk Execution (batch PATCH — jedna tablica operacji w jednym PATCH)
  // ============================================
  async function executeBulkLink() {
    const patchOps = [];
    const undoStack = [];
    let skipped = 0;

    // Main rows — tylko "proposal" (Proponowane), już połączone = skip
    selectionState.mainRows.forEach(function (rowId) {
      const rowData = findRowDataById(rowId);
      if (!rowData) return;
      const state = computeRowState(rowData);
      if (state.key !== "proposal") { skipped++; return; }

      let match = null;
      if (selectedOrderId && rowData._primaryMatch && rowData._isPrimaryProposal) {
        match = rowData._primaryMatch;
      } else {
        const proposals = safeArr(rowData?.potentialMatches);
        if (proposals.length > 0) match = proposals[0];
      }
      if (!match) { skipped++; return; }

      const qty = match.matchableQty || sumQty(match?.segments) || sumQty(rowData?.segments);
      patchOps.push({
        op: "add",
        path: "/" + rowData.id + "/linkedOrderProducts/-",
        value: { orderProductId: match.id, quantity: qty },
      });
      undoStack.push({ type: "linked", productId: rowData.id, gtin: rowData.gtin });
    });

    // Variant rows
    selectionState.variantData.forEach(function (data) {
      const rowData = findRowDataById(data.parentId);
      if (!rowData) return;
      const qty = data.matchQty || sumQty(rowData?.segments);
      patchOps.push({
        op: "add",
        path: "/" + data.parentId + "/linkedOrderProducts/-",
        value: { orderProductId: data.matchId, quantity: qty },
      });
      undoStack.push({ type: "linked", productId: data.parentId, gtin: rowData?.gtin });
    });

    if (patchOps.length === 0) {
      if (skipped > 0) displayMessage("Success", "Wszystkie zaznaczone pozycje są już połączone");
      else displayMessage("Error", "Brak pozycji do połączenia wśród zaznaczonych");
      return;
    }

    const counter = document.getElementById("bulk-counter");
    const btns = document.querySelectorAll(".bulk-action-btn");
    btns.forEach(function (b) { b.disabled = true; });
    if (counter) counter.textContent = "Łączenie " + patchOps.length + " pozycji...";

    let success = patchOps.length, failed = 0;
    try {
      await batchPatchProducts(patchOps);
    } catch (err) {
      console.error("Batch link failed:", err);
      failed = patchOps.length; success = 0;
    }

    await new Promise(function (resolve) {
      deliveryTable.ajax.reload(function () { refreshFiltersAfterUpdate(); resolve(); }, false);
    });
    clearAllSelections(true);
    showBulkResult("Połączono", success, skipped, failed, undoStack);
  }

  async function executeBulkUnlink() {
    const patchOps = [];
    let skipped = 0;

    selectionState.mainRows.forEach(function (rowId) {
      const rowData = findRowDataById(rowId);
      if (!rowData) return;
      const state = computeRowState(rowData);
      if (!["matched", "diff"].includes(state.key)) { skipped++; return; }

      let linked = null;
      if (selectedOrderId && rowData._primaryMatch && !rowData._isPrimaryProposal) {
        linked = rowData._primaryMatch;
      } else {
        const linkedArr = safeArr(rowData?.linkedOrderProducts);
        if (linkedArr.length > 0) linked = linkedArr[0];
      }
      if (!linked) { skipped++; return; }

      patchOps.push({
        op: "remove",
        path: "/" + rowData.id + "/linkedOrderProducts/" + linked.id,
      });
    });

    if (patchOps.length === 0) {
      if (skipped > 0) displayMessage("Success", "Żadna zaznaczona pozycja nie jest połączona");
      else displayMessage("Error", "Brak pozycji do rozłączenia wśród zaznaczonych");
      return;
    }

    const counter = document.getElementById("bulk-counter");
    const btns = document.querySelectorAll(".bulk-action-btn");
    btns.forEach(function (b) { b.disabled = true; });
    if (counter) counter.textContent = "Rozłączanie " + patchOps.length + " pozycji...";

    let success = patchOps.length, failed = 0;
    try {
      await batchPatchProducts(patchOps);
    } catch (err) {
      console.error("Batch unlink failed:", err);
      failed = patchOps.length; success = 0;
    }

    await new Promise(function (resolve) {
      deliveryTable.ajax.reload(function () { refreshFiltersAfterUpdate(); resolve(); }, false);
    });
    clearAllSelections(true);
    showBulkResult("Rozłączono", success, skipped, failed, []);
  }

  function findRowDataById(rowId) {
    if (!deliveryTable) return null;
    let found = null;
    deliveryTable.rows().every(function () {
      const data = this.data();
      if (data && data.id === rowId) { found = data; return false; }
    });
    return found;
  }

  // ============================================
  // Bulk Result + Undo (inline w toolbar)
  // ============================================
  let lastUndoStack = null;

  function showBulkResult(actionLabel, success, skipped, failed, undoStack) {
    let text = actionLabel + " " + success + " pozycji.";
    if (skipped > 0) text += " Pominięto " + skipped + ".";
    if (failed > 0) text += " Błędów: " + failed + ".";

    displayMessage(failed > 0 ? "Error" : "Success", text);

    // Włącz/wyłącz przycisk "Cofnij" w toolbarze
    const undoBtn = document.getElementById("bulk-undo-btn");
    if (undoBtn) {
      if (undoStack && undoStack.length > 0 && failed === 0) {
        lastUndoStack = undoStack;
        undoBtn.disabled = false;
      } else {
        lastUndoStack = null;
        undoBtn.disabled = true;
      }
    }
  }

  async function executeBulkUndo(undoStack) {
    displayMessage("Success", "Cofanie operacji...");
    const dateParams = getDateRangeParams();

    for (const entry of undoStack) {
      if (entry.type === "linked") {
        try {
          // Fetch fresh product data to find the newly created link ID
          const res = await $.ajax({
            type: "GET",
            url: InvokeURL + "van/recadvs/" + encodeURIComponent(recadvId) + "/products?" + dateParams,
            headers: { Authorization: orgToken, "Requested-By": "webflow-3-4" },
            data: { gtin: entry.gtin },
          });
          const product = (res.items || []).find(function (p) { return p.id === entry.productId; });
          if (product) {
            const links = safeArr(product.linkedOrderProducts);
            if (links.length > 0) {
              const lastLink = links[links.length - 1];
              await unlinkRecadvProduct(recadvId, entry.productId, lastLink.id);
            }
          }
        } catch (err) {
          console.warn("Undo failed for product:", entry.productId, err);
        }
      }
    }

    deliveryTable.ajax.reload(function () {
      refreshFiltersAfterUpdate();
    }, false);
    displayMessage("Success", "Operacja cofnięta");
  }

  // Cache dla szczegółów zamówień (orderId -> order details)
  const orderDetailsCache = {};

  /**
   * Pobierz szczegóły zamówienia z API
   */
  async function fetchOrderDetails(orderId) {
    // Sprawdź cache
    if (orderDetailsCache[orderId]) {
      return orderDetailsCache[orderId];
    }

    try {
      const response = await $.ajax({
        type: "GET",
        url:
          InvokeURL +
          "shops/" +
          encodeURIComponent(shopKey) +
          "/orders/" +
          encodeURIComponent(orderId),
        headers: {
          Authorization: orgToken,
          "Requested-By": "webflow-3-4",
        },
      });

      // Zapisz w cache
      orderDetailsCache[orderId] = response;
      return response;
    } catch (error) {
      console.warn(
        "Nie udało się pobrać szczegółów zamówienia:",
        orderId,
        error,
      );
      // Zwróć fallback
      return {
        orderId: orderId,
        name: null,
        createDate: null,
      };
    }
  }

  /**
   * Zbierz wszystkie unikalne orderIds z danych produktów
   */
  function collectOrderIds(products) {
    const orderIds = new Set();

    products.forEach((product) => {
      const linked = safeArr(product?.linkedOrderProducts);
      const proposals = safeArr(product?.potentialMatches);

      linked.forEach((link) => {
        if (link?.orderId) orderIds.add(link.orderId);
      });

      proposals.forEach((proposal) => {
        if (proposal?.orderId) orderIds.add(proposal.orderId);
      });
    });

    return Array.from(orderIds);
  }

  /**
   * Pobierz szczegóły wszystkich zamówień równolegle
   */
  async function prefetchOrderDetails(products) {
    const orderIds = collectOrderIds(products);

    // Filtruj tylko te, których jeszcze nie mamy w cache
    const missingOrderIds = orderIds.filter((id) => !orderDetailsCache[id]);

    if (missingOrderIds.length === 0) {
      return;
    }

    console.log(`Pobieram szczegóły ${missingOrderIds.length} zamówień...`);

    // Pobierz wszystkie równolegle
    const promises = missingOrderIds.map((orderId) =>
      fetchOrderDetails(orderId),
    );
    await Promise.all(promises);

    console.log(`Pobrano szczegóły zamówień`);
  }

  /**
   * Skróć tekst do maxLength znaków i dodaj tooltip
   */
  function truncateWithTooltip(text, maxLength = 35) {
    if (!text || text.length <= maxLength) {
      return escapeHtml(text);
    }
    const truncated = text.substring(0, maxLength);
    const fullText = escapeHtml(text);
    return `<span class="truncated-text" title="${fullText}">${escapeHtml(truncated)}…</span>`;
  }

  /**
   * Formatuj wyświetlanie zamówienia (nazwa + data lub skrócone ID)
   */
  function formatOrderDisplay(orderId) {
    const details = orderDetailsCache[orderId];

    if (!details) {
      // Fallback - pokaż ostatnie 8 znaków ID
      const shortId = orderId ? orderId.slice(-8) : "-";
      return `<span class="muted">${escapeHtml(shortId)}</span>`;
    }

    if (details.name) {
      // Mamy nazwę - pokaż nazwę i datę
      const name = details.name;
      const nameDisplay = truncateWithTooltip(name, 35);
      let dateStr = "";

      if (details.createDate) {
        const date = new Date(details.createDate);
        dateStr = date.toLocaleDateString("pl-PL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      }

      return `
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <a class="doc-link" href="/app/orders/order?orderId=${escapeHtml(orderId)}&shopKey=${escapeHtml(shopKey)}" target="_blank" rel="noopener" style="font-weight: 500;">
            ${nameDisplay}
          </a>
          ${dateStr ? `<span style="font-size: 12px; color: #6b7280;">${dateStr}</span>` : ""}
        </div>
      `;
    } else {
      // Brak nazwy - pokaż skrócone ID (ostatnie 8 znaków)
      const shortId = orderId.slice(-8);
      return `
        <a class="doc-link" href="/app/orders/order?orderId=${escapeHtml(orderId)}&shopKey=${escapeHtml(shopKey)}" target="_blank" rel="noopener">
          ...${escapeHtml(shortId)}
        </a>
      `;
    }
  }

  /**
   * Init/Reset DataTables na #table_delivery dla konkretnego recadvId
   * Wymaga: InvokeURL, orgToken
   */

  // ---------- Order Document Filter ----------
  let currentOrderFilterFn = null;
  let selectedOrderId = null; // Globalna zmienna do przechowywania aktualnie wybranego zamówienia
  let orderFilterEventsBound = false; // Flaga zapobiegająca wielokrotnej rejestracji eventów
  // UWAGA: Gdy selectedOrderId jest ustawione, logika sortowania w kolumnie statusu (indeks 9)
  // priorytetyzuje produkty połączone z wybranym zamówieniem, wyświetlając je jako główne wiersze

  function getAllOrderIds(tableData) {
    const orderIds = new Set();

    tableData.forEach((row) => {
      const linked = safeArr(row?.linkedOrderProducts);
      const proposals = safeArr(row?.potentialMatches);

      // Dodaj Order IDs z linkedOrderProducts
      linked.forEach((link) => {
        if (link?.orderId) orderIds.add(link.orderId);
      });

      // Dodaj Order IDs z potentialMatches
      proposals.forEach((proposal) => {
        if (proposal?.orderId) orderIds.add(proposal.orderId);
      });
    });

    return Array.from(orderIds).sort();
  }

  function renderOrderDropdown(containerId, orderIds, tableData) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container #${containerId} not found`);
      return;
    }

    // Sprawdź czy dropdown już istnieje
    let dropdownWrapper = container.querySelector(".order-dropdown-wrapper");

    if (!dropdownWrapper) {
      // Utwórz wrapper dla dropdownu — pushed to right via margin-left: auto
      dropdownWrapper = document.createElement("div");
      dropdownWrapper.className = "order-dropdown-wrapper dh-order-wrapper";
      container.appendChild(dropdownWrapper);
    }

    // Funkcja do zliczania produktów dla danego zamówienia
    function countProductsForOrder(orderId) {
      let count = 0;
      tableData.forEach((row) => {
        const linked = safeArr(row?.linkedOrderProducts);
        const proposals = safeArr(row?.potentialMatches);

        // Sprawdź czy produkt ma powiązanie z zamówieniem (linked)
        const hasLinkedOrder = linked.some((link) => link?.orderId === orderId);
        // Sprawdź czy produkt ma propozycję z zamówieniem (proposals)
        const hasProposalOrder = proposals.some(
          (proposal) => proposal?.orderId === orderId,
        );

        if (hasLinkedOrder || hasProposalOrder) {
          count++;
        }
      });
      return count;
    }

    // Stwórz tablicę z zamówieniami i ich liczbą produktów
    const ordersWithCounts = orderIds.map((orderId) => {
      const details = orderDetailsCache[orderId];
      const productCount = countProductsForOrder(orderId);
      return { orderId, details, productCount };
    });

    // Posortuj według liczby produktów (od największej do najmniejszej)
    ordersWithCounts.sort((a, b) => b.productCount - a.productCount);

    // Formatuj opcje z nazwą, datą zamówienia i liczbą produktów
    const options = ordersWithCounts
      .map(({ orderId, details, productCount }) => {
        let displayText = orderId; // fallback to ID

        if (details) {
          if (details.name) {
            // Format: "(liczba) DD.MM.YYYY - Nazwa zamówienia"
            let dateStr = "";
            if (details.createDate) {
              const date = new Date(details.createDate);
              dateStr = date.toLocaleDateString("pl-PL", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              });
            }
            displayText = dateStr
              ? `(${productCount}) ${dateStr} - ${details.name}`
              : `(${productCount}) ${details.name}`;
          } else {
            // Jeśli nie ma nazwy, pokaż skrócone ID
            displayText = `(${productCount}) ...${orderId.slice(-8)}`;
          }
        } else {
          // Brak szczegółów - pokaż tylko liczbę i skrócone ID
          displayText = `(${productCount}) ...${orderId.slice(-8)}`;
        }

        const selectedAttr = (selectedOrderId === orderId) ? " selected" : "";
        return `<option value="${escapeHtml(orderId)}"${selectedAttr}>${escapeHtml(displayText)}</option>`;
      })
      .join("");

    dropdownWrapper.innerHTML = `
      <div class="status-filter-btn" style="cursor: pointer;">
        <select id="order-filter-select" class="dh-order-select">
          <option value="">Wszystkie zamówienia</option>
          ${options}
        </select>
      </div>
    `;
  }

  /**
   * Normalizuje dane wierszy dla wybranego zamówienia.
   * Ustawia _primaryMatch (linked lub proposal pasujący do wybranego zamówienia)
   * oraz _variantMatches (pozostałe propozycje).
   */
  function normalizeRowsForSelectedOrder(items) {
    return (items || []).map((row) => {
      const linked = safeArr(row?.linkedOrderProducts);
      const proposals = safeArr(row?.potentialMatches);

      let primary = null;

      if (selectedOrderId) {
        primary = linked.find((l) => l?.orderId === selectedOrderId)
              || proposals.find((p) => p?.orderId === selectedOrderId)
              || null;
      }

      const variants = proposals.filter((p) => p && (!primary || p.id !== primary.id));

      return {
        ...row,
        _primaryMatch: primary,
        _variantMatches: variants,
        _isPrimaryProposal: !!(primary && proposals.some(p => p?.id === primary.id)),
      };
    });
  }

  function applyOrderFilter(table, orderId) {
    // Usuń poprzedni filtr zamówienia jeśli istnieje
    if (currentOrderFilterFn) {
      const idx = $.fn.dataTable.ext.search.indexOf(currentOrderFilterFn);
      if (idx > -1) {
        $.fn.dataTable.ext.search.splice(idx, 1);
      }
    }

    // Aktualizuj globalną zmienną selectedOrderId
    selectedOrderId = orderId || null;

    // Re-normalizuj dane we wszystkich wierszach tabeli
    table.rows().every(function () {
      const rowData = this.data();
      const linked = safeArr(rowData?.linkedOrderProducts);
      const proposals = safeArr(rowData?.potentialMatches);

      let primary = null;

      if (selectedOrderId) {
        primary = linked.find((l) => l?.orderId === selectedOrderId)
              || proposals.find((p) => p?.orderId === selectedOrderId)
              || null;
      }

      const variants = proposals.filter((p) => p && (!primary || p.id !== primary.id));

      rowData._primaryMatch = primary;
      rowData._variantMatches = variants;
      rowData._isPrimaryProposal = !!(primary && proposals.some(p => p?.id === primary.id));

      this.data(rowData);
    });

    if (orderId) {
      console.log(`Applying order filter for orderId: ${orderId}`);
      currentOrderFilterFn = function (settings, data, dataIndex) {
        if (settings.nTable.id !== "table_delivery") return true;

        const rowData = table.row(dataIndex).data();
        const linked = safeArr(rowData?.linkedOrderProducts);
        const proposals = safeArr(rowData?.potentialMatches);

        // Sprawdź czy produkt ma powiązanie z wybranym zamówieniem
        const hasLinkedOrder = linked.some((link) => link?.orderId === orderId);
        const hasProposalOrder = proposals.some(
          (proposal) => proposal?.orderId === orderId,
        );

        // Debug logging
        if (hasLinkedOrder || hasProposalOrder) {
          console.log(`Product ${rowData?.name} matches order ${orderId}`, {
            hasLinkedOrder,
            hasProposalOrder,
            linked,
            proposals,
          });
        }

        // Pokaż tylko produkty, które mają powiązanie z wybranym zamówieniem
        // (zarówno w linkedOrderProducts jak i w potentialMatches)
        return hasLinkedOrder || hasProposalOrder;
      };

      $.fn.dataTable.ext.search.push(currentOrderFilterFn);
    } else {
      currentOrderFilterFn = null;
    }

    table.order([[6, "asc"], [2, "asc"]]).draw();

    // Przelicz liczniki filtrów i statystyki dla widocznego zbioru
    recalcCountersForOrderFilter(table);
  }

  function initOrderFilterEvents(table, containerId) {
    if (orderFilterEventsBound) return;
    orderFilterEventsBound = true;

    const container = document.getElementById(containerId);
    if (!container) return;

    container.addEventListener("change", function (e) {
      if (e.target && e.target.id === "order-filter-select") {
        const orderId = e.target.value || "";

        // Wyczyść selekcje bulk przy zmianie zamówienia
        clearAllSelections(true);

        // Zastosuj filtr (sortowanie + draw wewnątrz)
        applyOrderFilter(table, orderId);
      }
    });
  }

  // ---------- Date Range Filter (Order Search Range) ----------

  // Formatuje Date do "YYYY-MM-DD"
  function fmtDateISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // Zwraca parametry daty do URL: "date=gte:YYYY-MM-DD&date=lte:YYYY-MM-DD"
  function getDateRangeParams() {
    const startVal = $("#orderDateStart").val();
    const endVal = $("#orderDateEnd").val();
    if (startVal && endVal) {
      return "date=gte:" + startVal + "&date=lte:" + endVal;
    }
    // Fallback: -3 dni od issueDate
    const end = deliveryIssueDate || fmtDateISO(new Date());
    const startD = new Date(end + "T00:00:00");
    startD.setDate(startD.getDate() - 3);
    return "date=gte:" + fmtDateISO(startD) + "&date=lte:" + end;
  }

  function renderDaysFilter(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container #${containerId} not found`);
      return;
    }

    container.style.marginBottom = "14px";

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; position: relative;">
        <button id="help-toggle-btn" type="button" style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 12px; color: #6b7280; cursor: pointer; transition: background 0.15s; font-family: inherit;">
          Instrukcja
          <svg id="help-chevron" width="10" height="10" viewBox="0 0 12 12" fill="none" style="transition: transform 0.2s;">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
          <span id="issueDateBadge" style="display: none; align-items: center; gap: 5px; padding: 4px 10px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 12px; color: #374151; font-weight: 500; white-space: nowrap;">
            ${ICON.calendar}
            Data dokumentu: <strong id="issueDateBadgeValue">-</strong>
          </span>
          <div id="dateRangeToggle" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 20px; font-size: 12px; color: #1e40af; cursor: pointer; user-select: none; transition: background 0.15s;">
            ${ICON.calendar}
            <span style="color: #3b82f6;">Zakres zamówień:</span>
            <strong id="dateRangeLabel">\u2014</strong>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style="margin-left: 2px;"><path d="M3 4.5L6 7.5L9 4.5" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
        <input type="hidden" id="orderDateStart" />
        <input type="hidden" id="orderDateEnd" />
        <div id="drpPopover" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 6px; z-index: 5000;"></div>
      </div>
      <!-- Instrukcja (domyślnie ukryta) -->
      <div id="help-section" style="display: none; margin-top: 12px; padding: 14px 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; color: #475569; line-height: 1.6;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #1e293b;">Jak działa ten widok?</p>
        <p style="margin: 0 0 6px;">W tym miejscu sprawdzisz, czy dostawa zgadza się z wcześniejszymi zamówieniami.</p>
        <p style="margin: 0 0 6px;">System porównuje dokument dostawy z zamówieniami z kilku dni przed datą dostawy. Jeśli nie widzisz właściwego zamówienia, możesz zmienić zakres dat u góry ekranu.</p>
        <p style="margin: 0 0 6px;">Zielone wartości oznaczają korzystną różnicę, czerwone \u2013 niezgodność w ilości lub cenie.</p>
        <p style="margin: 0 0 6px;">Jeśli produkt był zamawiany w kilku dokumentach, możesz rozwinąć wiersz, aby zobaczyć wszystkie powiązania.</p>
        <p style="margin: 0;">W razie potrzeby zaznacz pozycje i użyj opcji Połącz lub Rozłącz, aby poprawić dopasowanie.</p>
      </div>
      <div style="border-bottom: 1px solid #e5e7eb; margin-top: 14px;"></div>
    `;
  }

  // Formatuje datę do krótkiego formatu DD.MM
  function fmtDateShort(d) {
    return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" });
  }

  // Aktualizuje label na badge "Zamówienia: DD.MM → DD.MM"
  function updateDateRangeLabel() {
    const label = document.getElementById("dateRangeLabel");
    if (!label) return;
    const sv = $("#orderDateStart").val();
    const ev = $("#orderDateEnd").val();
    if (sv && ev) {
      label.textContent = fmtDateShort(new Date(sv + "T00:00:00")) + "  →  " + fmtDateShort(new Date(ev + "T00:00:00"));
    }
  }

  // ========== Custom Airbnb-style Range Picker ==========
  function initDatePickerDefaults() {
    const startInput = document.getElementById("orderDateStart");
    const endInput = document.getElementById("orderDateEnd");
    const popover = document.getElementById("drpPopover");
    const toggleEl = document.getElementById("dateRangeToggle");
    if (!startInput || !endInput || !popover || !toggleEl) return;

    // Pokaż badge z datą dokumentu
    const badge = document.getElementById("issueDateBadge");
    const badgeValue = document.getElementById("issueDateBadgeValue");
    if (badge && badgeValue && deliveryIssueDate) {
      const issueFmt = new Date(deliveryIssueDate + "T00:00:00").toLocaleDateString("pl-PL", {
        year: "numeric", month: "2-digit", day: "2-digit",
      });
      badgeValue.textContent = issueFmt;
      badge.style.display = "inline-flex";
    }

    // --- Inject CSS (once) ---
    if (!document.getElementById("dh-rangepicker-styles")) {
      const style = document.createElement("style");
      style.id = "dh-rangepicker-styles";
      style.textContent = `
        .drp-popover {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.08);
          padding: 16px;
          min-width: 280px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 13px;
          user-select: none;
        }
        .drp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .drp-header button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          color: #6b7280;
          font-size: 16px;
          line-height: 1;
          transition: background .15s;
        }
        .drp-header button:hover { background: #f3f4f6; }
        .drp-header span {
          font-weight: 600;
          color: #111827;
          font-size: 13px;
        }
        .drp-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          margin-bottom: 4px;
        }
        .drp-weekday {
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
          padding: 4px 0;
          text-transform: uppercase;
        }
        .drp-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        .drp-day-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          position: relative;
        }
        .drp-day {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: pointer;
          font-size: 13px;
          color: #374151;
          transition: background .1s, color .1s;
          position: relative;
          z-index: 2;
        }
        .drp-day:hover:not(.drp-disabled) {
          background: #f3f4f6;
        }
        .drp-day.drp-disabled {
          color: #d1d5db;
          cursor: default;
          pointer-events: none;
        }
        .drp-day.drp-today {
          box-shadow: inset 0 0 0 1.5px #2563eb;
        }
        .drp-day.drp-start,
        .drp-day.drp-end {
          background: #2563eb;
          color: #fff;
          font-weight: 600;
        }
        .drp-day.drp-start:hover,
        .drp-day.drp-end:hover {
          background: #1d4ed8;
        }
        .drp-day-cell.drp-in-range::before {
          content: '';
          position: absolute;
          top: 2px;
          bottom: 2px;
          left: 0;
          right: 0;
          background: #dbeafe;
          z-index: 1;
        }
        .drp-day-cell.drp-range-start::before {
          left: 50%;
        }
        .drp-day-cell.drp-range-end::before {
          right: 50%;
        }
        .drp-day-cell.drp-hover-range::before {
          content: '';
          position: absolute;
          top: 2px;
          bottom: 2px;
          left: 0;
          right: 0;
          background: #eff6ff;
          z-index: 1;
        }
        .drp-day-cell.drp-hover-start::before {
          left: 50%;
        }
        .drp-day-cell.drp-hover-end::before {
          right: 50%;
        }
        .drp-day.drp-hover-target {
          background: #bfdbfe;
          color: #1e40af;
        }
        .drp-hint {
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
          margin-top: 8px;
          min-height: 16px;
        }
        .dataTables_scrollBody {
          overflow-y: scroll !important;
        }
        .dataTables_wrapper {
          width: 100% !important;
          overflow: hidden;
        }
        .dataTables_scroll {
          width: 100% !important;
          overflow: hidden;
        }
        .dataTables_scrollHead,
        .dataTables_scrollFoot {
          width: 100% !important;
          overflow: hidden !important;
        }
        .dataTables_scrollHeadInner,
        .dataTables_scrollFootInner {
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .dataTables_scrollHeadInner > table,
        .dataTables_scrollFootInner > table {
          width: 100% !important;
        }
        .dataTables_scrollBody > table {
          width: 100% !important;
        }
      `;
      document.head.appendChild(style);
    }

    // --- State ---
    const issueD = new Date(deliveryIssueDate + "T00:00:00");
    const minDate = new Date(issueD);
    minDate.setDate(minDate.getDate() - 14);
    const maxDate = new Date(issueD);

    const defaultEnd = new Date(issueD);
    const defaultStart = new Date(issueD);
    defaultStart.setDate(defaultStart.getDate() - 3);

    let rangeStart = fmtDateISO(defaultStart);
    let rangeEnd = fmtDateISO(defaultEnd);
    let pickingState = "idle"; // "idle" | "picking_end"
    let viewYear = defaultStart.getFullYear();
    let viewMonth = defaultStart.getMonth();

    const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
      "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

    // Set initial values
    startInput.value = rangeStart;
    endInput.value = rangeEnd;
    updateDateRangeLabel();

    // --- Render calendar ---
    function renderCalendar() {
      const firstOfMonth = new Date(viewYear, viewMonth, 1);
      let startDay = firstOfMonth.getDay() - 1; // Monday = 0
      if (startDay < 0) startDay = 6;
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      let html = `<div class="drp-popover">`;
      // Header
      html += `<div class="drp-header">
        <button data-drp-nav="prev">‹</button>
        <span>${monthNames[viewMonth]} ${viewYear}</span>
        <button data-drp-nav="next">›</button>
      </div>`;
      // Weekday names
      html += `<div class="drp-weekdays">`;
      ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].forEach(d => {
        html += `<div class="drp-weekday">${d}</div>`;
      });
      html += `</div>`;
      // Days grid
      html += `<div class="drp-days">`;
      // Empty cells before first day
      for (let i = 0; i < startDay; i++) {
        html += `<div class="drp-day-cell"></div>`;
      }
      const todayStr = fmtDateISO(new Date());
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = fmtDateISO(new Date(viewYear, viewMonth, d));
        const dateObj = new Date(viewYear, viewMonth, d);
        const disabled = dateObj < minDate || dateObj > maxDate;
        const isStart = dateStr === rangeStart;
        const isEnd = dateStr === rangeEnd;
        const isToday = dateStr === todayStr;
        const inRange = rangeStart && rangeEnd && dateStr > rangeStart && dateStr < rangeEnd;

        let cellClasses = "drp-day-cell";
        if (inRange) cellClasses += " drp-in-range";
        if (isStart && rangeEnd && rangeStart !== rangeEnd) cellClasses += " drp-in-range drp-range-start";
        if (isEnd && rangeStart && rangeStart !== rangeEnd) cellClasses += " drp-in-range drp-range-end";

        let dayClasses = "drp-day";
        if (disabled) dayClasses += " drp-disabled";
        if (isToday) dayClasses += " drp-today";
        if (isStart) dayClasses += " drp-start";
        if (isEnd) dayClasses += " drp-end";

        html += `<div class="${cellClasses}"><div class="${dayClasses}" data-date="${dateStr}">${d}</div></div>`;
      }
      html += `</div>`;
      // Hint
      const hint = pickingState === "picking_end" ? "Wybierz datę końcową" : "Kliknij aby wybrać zakres";
      html += `<div class="drp-hint">${hint}</div>`;
      html += `</div>`;
      popover.innerHTML = html;
    }

    // --- Hover preview ---
    function applyHoverPreview(hoverDateStr) {
      if (pickingState !== "picking_end" || !rangeStart) return;
      // Clear old hover classes
      popover.querySelectorAll(".drp-hover-range, .drp-hover-start, .drp-hover-end").forEach(el => {
        el.classList.remove("drp-hover-range", "drp-hover-start", "drp-hover-end");
      });
      popover.querySelectorAll(".drp-hover-target").forEach(el => {
        el.classList.remove("drp-hover-target");
      });

      if (!hoverDateStr || hoverDateStr === rangeStart) return;

      let hStart = rangeStart, hEnd = hoverDateStr;
      if (hEnd < hStart) { const t = hStart; hStart = hEnd; hEnd = t; }

      popover.querySelectorAll(".drp-day-cell").forEach(cell => {
        const dayEl = cell.querySelector(".drp-day");
        if (!dayEl || dayEl.classList.contains("drp-disabled")) return;
        const ds = dayEl.getAttribute("data-date");
        if (!ds) return;
        if (ds > hStart && ds < hEnd) {
          cell.classList.add("drp-hover-range");
        }
        if (ds === hStart && hStart !== hEnd) {
          cell.classList.add("drp-hover-range", "drp-hover-start");
        }
        if (ds === hEnd && hStart !== hEnd) {
          cell.classList.add("drp-hover-range", "drp-hover-end");
        }
        if (ds === hoverDateStr) {
          dayEl.classList.add("drp-hover-target");
        }
      });
    }

    // --- Day click handler ---
    function handleDayClick(dateStr) {
      if (pickingState === "idle") {
        // First click — set start, wait for end
        rangeStart = dateStr;
        rangeEnd = null;
        pickingState = "picking_end";
        renderCalendar();
        return; // explicit return — popover stays open
      }

      // picking_end — second click
      // If clicking the same day as start, ignore (require a different day)
      if (dateStr === rangeStart) return;

      let s = rangeStart, e = dateStr;
      if (e < s) { const t = s; s = e; e = t; }

      // Clamp to 14 days
      const sD = new Date(s + "T00:00:00");
      const eD = new Date(e + "T00:00:00");
      const diffDays = Math.round((eD - sD) / 86400000);
      if (diffDays > 14) {
        sD.setTime(eD.getTime());
        sD.setDate(sD.getDate() - 14);
        if (sD < minDate) sD.setTime(minDate.getTime());
        s = fmtDateISO(sD);
      }

      rangeStart = s;
      rangeEnd = e;
      pickingState = "idle";

      // Save to hidden inputs
      startInput.value = rangeStart;
      endInput.value = rangeEnd;
      updateDateRangeLabel();

      // Close popover
      popover.style.display = "none";
      toggleEl.style.background = "#f9fafb";
      toggleEl.style.borderColor = "#e5e7eb";

      // Wyczyść selekcje bulk przy zmianie zakresu dat
      clearAllSelections(true);

      // Reload table
      if (deliveryTable) deliveryTable.ajax.reload();
    }

    // --- Event delegation on popover ---
    popover.addEventListener("click", function (evt) {
      evt.stopPropagation();
      const navBtn = evt.target.closest("[data-drp-nav]");
      if (navBtn) {
        const dir = navBtn.getAttribute("data-drp-nav");
        if (dir === "prev") {
          viewMonth--;
          if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        } else {
          viewMonth++;
          if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        }
        renderCalendar();
        return;
      }
      const dayEl = evt.target.closest(".drp-day:not(.drp-disabled)");
      if (dayEl) {
        handleDayClick(dayEl.getAttribute("data-date"));
      }
    });

    popover.addEventListener("mouseover", function (evt) {
      const dayEl = evt.target.closest(".drp-day:not(.drp-disabled)");
      if (dayEl) {
        applyHoverPreview(dayEl.getAttribute("data-date"));
      }
    });

    popover.addEventListener("mouseleave", function () {
      applyHoverPreview(null);
    });

    // --- Toggle popover on badge click ---
    toggleEl.addEventListener("click", function (evt) {
      evt.stopPropagation();
      const isOpen = popover.style.display === "block";
      if (!isOpen) {
        // Open — reset view to rangeStart month
        if (rangeStart) {
          const rd = new Date(rangeStart + "T00:00:00");
          viewYear = rd.getFullYear();
          viewMonth = rd.getMonth();
        }
        // Restore full range for display if we have both dates
        if (startInput.value && endInput.value) {
          rangeStart = startInput.value;
          rangeEnd = endInput.value;
        }
        pickingState = "idle";
        renderCalendar();
        popover.style.display = "block";
        toggleEl.style.background = "#eff6ff";
        toggleEl.style.borderColor = "#bfdbfe";
      } else {
        // Close — if picking_end, revert to saved range
        if (pickingState === "picking_end") {
          rangeStart = startInput.value;
          rangeEnd = endInput.value;
        }
        popover.style.display = "none";
        toggleEl.style.background = "#f9fafb";
        toggleEl.style.borderColor = "#e5e7eb";
        pickingState = "idle";
      }
    });

    // Hover on toggle badge
    toggleEl.addEventListener("mouseenter", function () {
      if (popover.style.display === "none" || !popover.style.display) {
        toggleEl.style.background = "#f3f4f6";
      }
    });
    toggleEl.addEventListener("mouseleave", function () {
      if (popover.style.display === "none" || !popover.style.display) {
        toggleEl.style.background = "#f9fafb";
      }
    });

    // Close popover on outside click
    document.addEventListener("click", function (evt) {
      if (!popover.contains(evt.target) && !toggleEl.contains(evt.target)) {
        if (popover.style.display === "block") {
          popover.style.display = "none";
          toggleEl.style.background = "#f9fafb";
          toggleEl.style.borderColor = "#e5e7eb";
          // If was picking, reset to last valid range
          if (pickingState === "picking_end" && rangeEnd) {
            pickingState = "idle";
          } else if (pickingState === "picking_end") {
            // Only start was picked, revert
            rangeStart = startInput.value;
            rangeEnd = endInput.value;
            pickingState = "idle";
          }
        }
      }
    });
  }

  function initDaysFilterEvents(table, containerId) {
    // Events obsługiwane przez datepicker onSelect i toggleEl click
    const container = document.getElementById(containerId);
    if (!container) return;
  }

  // ---------- Details Toggle (Szczegóły dokumentu) ----------
  function initDetailsToggleEvents() {
    const toggleBtn = document.getElementById("details-toggle-btn");
    const chevron = document.getElementById("details-chevron");
    const detailsContainer = document.querySelector(".deliverydetails");

    if (!toggleBtn || !detailsContainer) return;

    toggleBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = detailsContainer.style.display === "none";

      if (isHidden) {
        detailsContainer.style.display = "block";
        chevron.style.transform = "rotate(180deg)";
        toggleBtn.classList.add("active");
      } else {
        detailsContainer.style.display = "none";
        chevron.style.transform = "rotate(0deg)";
        toggleBtn.classList.remove("active");
      }
    });
  }

  // ---------- Help Toggle (Instrukcja) ----------
  function initHelpToggleEvents() {
    const toggleBtn = document.getElementById("help-toggle-btn");
    const chevron = document.getElementById("help-chevron");
    const helpSection = document.getElementById("help-section");

    if (!toggleBtn || !helpSection) return;

    toggleBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = helpSection.style.display === "none";

      if (isHidden) {
        helpSection.style.display = "block";
        chevron.style.transform = "rotate(180deg)";
        toggleBtn.classList.add("active");
      } else {
        helpSection.style.display = "none";
        chevron.style.transform = "rotate(0deg)";
        toggleBtn.classList.remove("active");
      }
    });
  }

  // ---------- Status Filter Configuration ----------
  const STATUS_FILTERS = [
    { key: "all", label: "Wszystkie pozycje", dot: null },
    { key: "matched", label: "Zgodne", dot: "#16a34a" },
    { key: "proposal", label: "Proponowane", dot: "#7c3aed" },
    { key: "diff", label: "Rozbieżności", dot: "#d97706" },
    { key: "unmatched", label: "Brak dopasowania", dot: "#9ca3af" },
  ];

  // Możesz dodać też "invalid" jeśli chcesz:
  // { key: 'invalid', label: 'Błędne', badge: 'badge--danger' }

  // ---------- Render Filter Bar ----------
  function renderStatusFilters(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container #${containerId} not found`);
      return;
    }

    // Inject scoped CSS for order dropdown (only once)
    if (!document.getElementById("dh-order-styles")) {
      const style = document.createElement("style");
      style.id = "dh-order-styles";
      style.textContent = `
        .dh-order-wrapper {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
        }
        .dh-order-select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          border: none;
          background: transparent;
          font-size: inherit;
          font-weight: inherit;
          font-family: inherit;
          color: inherit;
          cursor: pointer;
          padding: 0 16px 0 0;
          margin: 0;
          outline: none;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0 center;
        }
      `;
      document.head.appendChild(style);
    }

    // Ustaw flexbox layout na kontenerze
    container.style.display = "flex";
    container.style.flexWrap = "wrap";
    container.style.alignItems = "center";
    container.style.gap = "8px";
    container.style.padding = "14px 0";

    const html = STATUS_FILTERS.map(
      (filter) => `
    <button
      type="button"
      class="status-filter-btn ${filter.key === "all" ? "active" : ""}"
      data-filter="${filter.key}"
    >
      ${filter.dot ? '<span class="filter-dot" style="background:' + filter.dot + '"></span>' : ''}
      <span class="filter-label">${filter.label}</span>
      <span class="filter-count" data-count-for="${filter.key}">0</span>
    </button>
  `,
    ).join("");

    container.innerHTML = html;
  }

  // ---------- Count Products by Status ----------
  function countByStatus(tableData) {
    const counts = {
      all: 0,
      matched: 0,
      proposal: 0,
      diff: 0,
      unmatched: 0,
      invalid: 0,
    };

    tableData.forEach((row) => {
      counts.all++;
      const state = computeRowState(row);
      if (counts.hasOwnProperty(state.key)) {
        counts[state.key]++;
      }
    });

    return counts;
  }

  /**
   * Przelicz liczniki filtrów i statystyki na podstawie wierszy
   * widocznych po zastosowaniu filtra zamówienia.
   * Jeśli żadne zamówienie nie jest wybrane, używa wszystkich wierszy.
   */
  function recalcCountersForOrderFilter(table) {
    // Pobierz wiersze pasujące do filtra zamówienia (ale ignoruj filtr statusu)
    // Używamy wszystkich wierszy i ręcznie sprawdzamy filtr zamówienia
    const allData = table.rows().data().toArray();

    let relevantData;
    if (selectedOrderId) {
      relevantData = allData.filter((row) => {
        const linked = safeArr(row?.linkedOrderProducts);
        const proposals = safeArr(row?.potentialMatches);
        return linked.some((l) => l?.orderId === selectedOrderId)
            || proposals.some((p) => p?.orderId === selectedOrderId);
      });
    } else {
      relevantData = allData;
    }

    // Aktualizuj tylko liczniki filtrów statusów (przyciski)
    // Statystyki na górze strony (Produktów, Wartość, Niezgodności) są stałe z GET
    const counts = countByStatus(relevantData);
    updateFilterCounters(counts);
  }

  // ---------- Update Counter Badges ----------
  function updateFilterCounters(counts) {
    STATUS_FILTERS.forEach((filter) => {
      const countEl = document.querySelector(
        `[data-count-for="${filter.key}"]`,
      );
      if (!countEl) return;

      var count = counts[filter.key] || 0;

      countEl.textContent = count;
    });
  }

  // ---------- Apply Filter to DataTable ----------
  let currentFilterFn = null;

  function applyStatusFilter(table, filterKey) {
    // Wyczyść selekcje bulk przy zmianie filtra
    clearAllSelections(true);

    // Usuń poprzedni custom search jeśli istnieje
    if (currentFilterFn) {
      const idx = $.fn.dataTable.ext.search.indexOf(currentFilterFn);
      if (idx > -1) {
        $.fn.dataTable.ext.search.splice(idx, 1);
      }
    }

    if (filterKey !== "all") {
      currentFilterFn = function (settings, data, dataIndex) {
        // Upewnij się że to nasza tabela
        if (settings.nTable.id !== "table_delivery") return true;

        const rowData = table.row(dataIndex).data();
        const state = computeRowState(rowData);
        return state.key === filterKey;
      };

      $.fn.dataTable.ext.search.push(currentFilterFn);
    } else {
      currentFilterFn = null;
    }

    table.draw();
  }

  // ---------- Initialize Filter Events ----------
  function initStatusFilterEvents(table, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Click na przycisk filtra (ignoruj order dropdown wrapper)
    container.addEventListener("click", function (e) {
      // Ignoruj kliknięcia w order dropdown
      if (e.target.closest(".order-dropdown-wrapper")) return;

      const btn = e.target.closest(".status-filter-btn");
      if (!btn || !btn.dataset.filter) return;

      // Update active state (tylko buttony z data-filter)
      container
        .querySelectorAll(".status-filter-btn[data-filter]")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Apply filter
      const filterKey = btn.dataset.filter;
      applyStatusFilter(table, filterKey);
    });

    // Update counters po każdym renderze tabeli
    table.on("xhr.dt", function (e, settings, json) {
      // Po załadowaniu danych AJAX - update liczników i dropdown
      if (json && json.data) {
        // Statystyki na górze: ustawiane raz z pełnych danych GET (stałe, nie zmieniają się z filtrami)
        updateDeliveryStatistics(json.data);

        // Update order dropdown w kontenerze filtrów statusowych (pushed right)
        const orderIds = getAllOrderIds(json.data);
        renderOrderDropdown(containerId, orderIds, json.data);
        initOrderFilterEvents(table, containerId);

        // Przelicz liczniki przycisków filtrów z uwzględnieniem filtra zamówienia
        // (setTimeout, bo dane trafiają do tabeli dopiero po xhr.dt)
        setTimeout(function () {
          recalcCountersForOrderFilter(table);
        }, 0);
      }
    });

  }

  // ============================================
  // API: Link / Unlink RECADV Products
  // ============================================

  /**
   * Połącz produkt RECADV z produktem zamówienia
   * @param {string} recadvId - ID dokumentu RECADV
   * @param {number} recadvProductId - ID produktu w RECADV (row.id)
   * @param {number} orderProductId - ID produktu zamówienia (z potentialMatches[].id)
   * @param {number} quantity - Ilość do połączenia
   */
  function linkRecadvProduct(
    recadvId,
    recadvProductId,
    orderProductId,
    quantity,
  ) {
    return $.ajax({
      type: "PATCH",
      url:
        InvokeURL + "van/recadvs/" + encodeURIComponent(recadvId) + "/products",
      headers: {
        Authorization: orgToken,
        "Content-Type": "application/json",
        "Requested-By": "webflow-3-4",
      },
      data: JSON.stringify([
        {
          op: "add",
          path: "/" + recadvProductId + "/linkedOrderProducts/-",
          value: {
            orderProductId: orderProductId,
            quantity: quantity,
          },
        },
      ]),
      beforeSend: function () {
        $("#waitingdots").show();
      },
      complete: function () {
        $("#waitingdots").hide();
      },
    });
  }

  /**
   * Rozłącz produkt RECADV od produktu zamówienia
   * @param {string} recadvId - ID dokumentu RECADV
   * @param {number} recadvProductId - ID produktu w RECADV (row.id)
   * @param {number} linkedOrderProductsId - ID powiązania (z linkedOrderProducts[].id)
   */
  function unlinkRecadvProduct(
    recadvId,
    recadvProductId,
    linkedOrderProductsId,
  ) {
    return $.ajax({
      type: "PATCH",
      url:
        InvokeURL + "van/recadvs/" + encodeURIComponent(recadvId) + "/products",
      headers: {
        Authorization: orgToken,
        "Content-Type": "application/json",
        "Requested-By": "webflow-3-4",
      },
      data: JSON.stringify([
        {
          op: "remove",
          path:
            "/" +
            recadvProductId +
            "/linkedOrderProducts/" +
            linkedOrderProductsId,
        },
      ]),
      beforeSend: function () {
        $("#waitingdots").show();
      },
      complete: function () {
        $("#waitingdots").hide();
      },
    });
  }

  /**
   * Batch PATCH — wysyła tablicę operacji JSON Patch w jednym PATCH request
   * @param {Array} ops - tablica obiektów { op, path, value? }
   */
  function batchPatchProducts(ops) {
    return $.ajax({
      type: "PATCH",
      url: InvokeURL + "van/recadvs/" + encodeURIComponent(recadvId) + "/products",
      headers: {
        Authorization: orgToken,
        "Content-Type": "application/json",
        "Requested-By": "webflow-3-4",
      },
      data: JSON.stringify(ops),
      beforeSend: function () { $("#waitingdots").show(); },
      complete: function () { $("#waitingdots").hide(); },
    });
  }

  // Helper: Aktualizuj liczniki i przefiltruj jeśli trzeba
  function refreshFiltersAfterUpdate() {
    // 1. Aktualizuj liczniki z uwzględnieniem filtra zamówienia
    recalcCountersForOrderFilter(deliveryTable);

    // 2. Sprawdź aktywny filtr i przefiltruj
    const activeFilter = document.querySelector(".status-filter-btn.active");
    if (activeFilter) {
      const filterKey = activeFilter.dataset.filter;
      if (filterKey !== "all") {
        // Przefiltruj ponownie (usunie wiersz z widoku jeśli zmienił status)
        deliveryTable.draw(false);
      }
    }
  }

  // Definicja kolumn tabeli (jedno źródło prawdy)
  const TABLE_COLUMNS = [
    { th: "", /* checkbox */ },
    { th: "", /* expand */ },
    { th: "Produkt" },
    { th: "Weryfikacja" },
    { th: "R\u00f3\u017cnica warto\u015bci" },
    { th: "Dokument zam\u00f3wienia" },
    { th: "Status" },
  ];

  function initDeliveryTable({ recadvId, InvokeURL, orgToken }) {
    // 1) jeśli już stoi – ubij i wyczyść
    if ($.fn.DataTable.isDataTable("#table_delivery")) {
      $("#table_delivery").DataTable().clear().destroy();
    }

    // 2) zdejmij poprzednie eventy (unikasz dubli)
    $("#table_delivery tbody").off(".delivery");
    $(document).off(".delivery");

    // 3) Utwórz <table> w #table-container (lub przebuduj istniejącą)
    var container = document.getElementById("table-container");
    if (!container) {
      console.error("Brak #table-container w HTML");
      return;
    }
    var colCount = TABLE_COLUMNS.length;
    var thCells = TABLE_COLUMNS.map(function (c) { return "<th>" + c.th + "</th>"; }).join("");
    var tdCells = Array(colCount).fill("<td></td>").join("");
    container.innerHTML =
      '<table id="table_delivery" class="display dataTable" style="width:100%">' +
        "<thead><tr>" + thCells + "</tr></thead>" +
        "<tfoot><tr>" + tdCells + "</tr></tfoot>" +
      "</table>";

    // 4) inicjalizacja
    deliveryTable = $("#table_delivery").DataTable({
      pagingType: "full_numbers",
      lengthMenu: [25, 50, 100, 200],
      pageLength: 25,
      order: [
        [6, "asc"],
        [2, "asc"],
      ], // Sortuj najpierw po statusie (kol. 6), potem po nazwie produktu (kol. 2)
      dom: '<"top"f>rt<"bottom"lip>',
      scrollY: "70vh",
      scrollCollapse: true,
      autoWidth: false,

      footerCallback: function (row, data, start, end, display) {
        const api = this.api();

        // Suma impactu (kolumna 4 Wartość) ze WSZYSTKICH przefiltrowanych wierszy
        const filteredRows = api.rows({ search: "applied" }).data().toArray();
        let totalValueDiff = 0;

        filteredRows.forEach(function (rowData) {
          const deliveredQty = sumQty(rowData?.segments);
          const deliveredPrice = avgPriceWeighted(rowData?.segments);
          let orderedQty = 0;
          let orderedPrice = null;

          if (selectedOrderId && rowData?._primaryMatch) {
            orderedQty = sumQty(rowData._primaryMatch?.segments);
            orderedPrice = avgPriceWeighted(rowData._primaryMatch?.segments);
          } else {
            const linked = safeArr(rowData?.linkedOrderProducts);
            const proposals = safeArr(rowData?.potentialMatches);

            if (linked.length) {
              orderedQty = linked.reduce((acc, p) => acc + sumQty(p?.segments), 0);
              orderedPrice = avgPriceWeighted(linked[0]?.segments);
            } else if (proposals.length) {
              orderedQty = sumQty(proposals[0]?.segments);
              orderedPrice = avgPriceWeighted(proposals[0]?.segments);
            }
          }

          // Tylko różnica cenowa (nie ilościowa) – konwencja: zamówione - dostarczone
          if (deliveredPrice !== null && orderedPrice !== null) {
            const priceDiff = orderedPrice - deliveredPrice;
            const commonQty = Math.min(deliveredQty, orderedQty);
            totalValueDiff += commonQty * priceDiff;
          }
        });

        // Wyświetl sumę impactu w kolumnie 4 (Wartość)
        const footerCell = $(api.column(4).footer());
        if (Math.abs(totalValueDiff) < 0.001) {
          footerCell.html(`<span style="color: #6b7280; font-weight: 600;">${fmtPLN(0)}</span>`);
        } else {
          const sign = totalValueDiff > 0 ? "+" : "";
          const color = totalValueDiff > 0 ? "#16a34a" : "#dc2626";
          footerCell.html(`<span style="color: ${color}; font-weight: 600;">${sign}${fmtPLN(Math.abs(totalValueDiff))}</span>`);
        }
        footerCell.css({ "text-align": "right", "padding": "10px 8px", "border-top": "2px solid #e5e7eb" });

        // Etykieta w kolumnie Produkt
        const prodCell = $(api.column(2).footer());
        prodCell.html(`<span style="font-weight: 600; color: #374151;">Łącznie</span>`);
        prodCell.css({ "padding": "10px 8px", "border-top": "2px solid #e5e7eb" });

        // Wyczyść i styluj pozostałe komórki footera
        for (let i = 0; i <= 6; i++) {
          const cell = $(api.column(i).footer());
          if (i !== 2 && i !== 4) {
            cell.html("");
          }
          cell.css({ "border-top": "2px solid #e5e7eb", "padding": "10px 8px" });
        }
      },

      buttons: [],

      language: {
        emptyTable: "Brak danych do wyświetlenia",
        info: "Pozycje _START_–_END_ z _TOTAL_",
        infoEmpty: "Brak danych",
        infoFiltered: "(z _MAX_ pozycji)",
        lengthMenu: "Pokaż: _MENU_ pozycji",
        search: "Szukaj produktu:",
        zeroRecords: "Brak pasujących rezultatów",
        paginate: { first: "<<", last: ">>", next: ">", previous: "<" },
      },

      processing: false,
      serverSide: false,
      search: { return: true },

      ajax: function (data, callback) {
        $.ajaxSetup({
          headers: { Authorization: orgToken, "Requested-By": "webflow-3-4" },
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            $("#waitingdots").hide();
          },
        });

        // Pobierz zakres dat z date pickerów
        const dateParams = getDateRangeParams();

        $.get(
          InvokeURL +
            "van/recadvs/" +
            encodeURIComponent(recadvId) +
            "/products?perPage=1000&" +
            dateParams,
          async function (res) {
            // Pobierz szczegóły zamówień przed wyświetleniem tabeli
            await prefetchOrderDetails(res.items);

            const normalized = normalizeRowsForSelectedOrder(res.items);

            callback({
              recordsTotal: res.total,
              recordsFiltered: res.total,
              data: normalized,
            });
          },
        );
      },

      columns: [
        // Kolumna 0 - Checkbox
        {
          data: null,
          orderable: false,
          searchable: false,
          width: "28px",
          className: "bulk-select-cell",
          title: '<input type="checkbox" id="bulk-select-all" title="Zaznacz wszystkie (główne)" />',
          render: function (data, type, row) {
            if (type !== "display") return "";
            const rowId = row?.id;
            if (rowId == null) return "";
            const checked = selectionState.mainRows.has(rowId) ? " checked" : "";
            return '<input type="checkbox" class="bulk-cb-main" data-row-id="' + rowId + '"' + checked + ' />';
          },
        },
        // Kolumna 1 - Expand
        {
          data: null,
          orderable: false,
          defaultContent: "",
          width: "28px",
          className: "expand-control-cell",
          createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
            // Użyj _variantMatches jeśli dostępne, w przeciwnym razie oblicz
            let variantCount;
            if (selectedOrderId && rowData?._variantMatches) {
              variantCount = rowData._variantMatches.length;
            } else {
              const proposals = safeArr(rowData?.potentialMatches);
              variantCount = proposals.length > 1 ? proposals.length - 1 : 0;
            }

            if (variantCount > 0) {
              $(cell).addClass("details-control");
            }
          },
        },
        // Kolumna 2 - Produkt
        {
          data: null,
          orderable: true,
          width: "420px",
          render: function (data, type, row) {
            const name = row?.name || "-";
            const gtin = row?.gtin || "-";

            if (type === "sort" || type === "type") return row?.name || "";
            if (type === "filter")
              return [row?.name, row?.gtin].filter(Boolean).join(" ");

            const nameDisplay = truncateWithTooltip(name, 35);
            const gtinDisplay = escapeHtml(gtin);

            return `
            <div class="prod-cell" style="max-width: 420px; overflow: hidden;">
              <div class="prod-name" style="word-break: break-word;">${nameDisplay}</div>
              <div class="prod-gtin" style="word-break: break-word;">${gtinDisplay}</div>
            </div>
          `;
          },
        },

        // Kolumna 3 - Weryfikacja (badge-e niezgodności: qty, price)
        {
          data: null,
          orderable: true,
          className: "text-right nz-col",
          render: function (data, type, row) {
            return renderWeryfikacja(row, type);
          },
        },

        // Kolumna 4 - Różnica wartości (impact w PLN)
        {
          data: null,
          orderable: true,
          className: "text-right nz-col",
          render: function (data, type, row) {
            return renderWartosc(row, type);
          },
        },

        // Kolumna 5 - Dokument zam.
        {
          data: null,
          orderable: true,
          className: "doc-col",
          width: "200px",
          render: function (data, type, row) {
            let orderId = null;
            let isProposal = false;

            if (selectedOrderId && row?._primaryMatch) {
              orderId = row._primaryMatch?.orderId;
              isProposal = !!row._isPrimaryProposal;
            } else {
              const linked = safeArr(row?.linkedOrderProducts);
              const proposals = safeArr(row?.potentialMatches);

              if (linked.length) {
                orderId = linked[0]?.orderId;
              } else if (proposals.length) {
                orderId = proposals[0]?.orderId;
                isProposal = true;
              }
            }

            if (!orderId) return type === "sort" || type === "type" ? "" : `<span class="muted">-</span>`;
            if (type === "sort" || type === "type") {
              const details = orderDetailsCache[orderId];
              return details?.name || orderId;
            }

            const displayHtml = formatOrderDisplay(orderId);
            return `
      <div class="doc-wrap ${isProposal ? "italic" : ""}" style="max-width: 200px; overflow: hidden; word-break: break-word;">
        ${displayHtml}
      </div>
    `;
          },
        },

        // Kolumna 6 - Status
        {
          data: null,
          orderable: true,
          className: "status-col",
          render: function (data, type, row) {
            const st = computeRowState(row);
            if (type === "sort" || type === "type") {
              // Gdy filtrowanie według zamówienia: produkty połączone z tym zamówieniem mają priorytet
              if (selectedOrderId && row?._primaryMatch && !row._isPrimaryProposal) {
                return st.sort - 100;
              }
              return st.sort;
            }
            return `<span class="st-badge" style="background:${st.bg};border-color:${st.border};color:${st.color}">${st.label}</span>`;
          },
        },
      ],
    });

    // 4) eventy po init – z namespace ".delivery"
    $("#table_delivery_filter label input")
      .off(".delivery")
      .on("keyup.delivery input.delivery", function (e) {
        if (e.keyCode === 13) deliveryTable.search(this.value).draw();
      });

    $("#table_delivery tbody").on(
      "click.delivery",
      "td.details-control",
      function (e) {
        e.preventDefault();
        const td = $(this);
        const tr = td.closest("tr");
        const row = deliveryTable.row(tr);
        const data = row.data();

        // Oblicz liczbę wariantów do wyświetlenia w rozwinięciu
        let proposalsToRenderCount;
        if (selectedOrderId && data?._variantMatches) {
          proposalsToRenderCount = data._variantMatches.length;
        } else {
          const proposals = safeArr(data?.potentialMatches);
          proposalsToRenderCount = proposals.length > 1 ? proposals.length - 1 : 0;
        }

        if (proposalsToRenderCount === 0) return;

        if (tr.hasClass("shown")) {
          // Usuń child rows
          tr.nextUntil(":not(.child-row)").remove();
          tr.removeClass("shown");
        } else {
          // Wstaw child rows bezpośrednio po parent row (bez redraw tabeli)
          const childRowsHtml = renderChildProposals(data, selectedOrderId);
          tr.after(childRowsHtml);
          tr.addClass("shown");
        }
      },
    );

    // === BULK TOOLBAR — inicjalizacja po DataTable ===
    injectBulkStyles();
    renderBulkToolbar();
    initBulkToolbarEvents();

    // Synchronizacja checkboxów i toolbara przy każdym renderze tabeli
    deliveryTable.on("draw.dt", function () {
      syncSelectAllCheckbox();
      updateBulkToolbar();
    });

    // === FILTR DNI (nad filtrami statusów) ===
    renderDaysFilter("days-filter");
    initDaysFilterEvents(deliveryTable, "days-filter");
    // Toggle szczegółów będzie zainicjalizowany w loadDeliveryDetails() po utworzeniu kontenera

    // === FILTRY STATUSÓW I ZAMÓWIEŃ ===
    renderStatusFilters("status-filters");
    initStatusFilterEvents(deliveryTable, "status-filters");
    // Order filter będzie zainicjalizowany w xhr.dt event po załadowaniu danych

    return deliveryTable;
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
    .truncated-text {
      cursor: help;
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

});
