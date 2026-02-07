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
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
        ${dhBadge(ICON.truck, "Dostawca", `<span id="wholesalerName">${wholesaler}</span>`, "#f9fafb", "#e5e7eb", "#374151")}
        ${dhBadge(ICON.box, "Liczba pozycji", `<span id="productsCountDelivery">-</span>`, "#f9fafb", "#e5e7eb", "#374151")}
        ${dhBadge(ICON.coins, "Wartość dokumentu", `<span id="valueDelivery">-</span>`, "#f9fafb", "#e5e7eb", "#374151")}
        ${dhBadge(ICON.alert, "Wykryte niezgodności", `<span id="diffDeliveryOrders">0</span>`, "#fef2f2", "#fecaca", "#991b1b")}
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

  function loadDeliveryDetails() {
    $.ajax({
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

        // Inicjalizuj datepicker (po renderowaniu nagłówka)
        if (deliveryIssueDate) {
          initDatePickerDefaults();
        }

        // Inicjalizuj toggle szczegółów
        setTimeout(() => {
          if (typeof initDetailsToggleEvents === "function") {
            initDetailsToggleEvents();
          }
        }, 100);
      },
      error: function (error) {
        console.error("Błąd pobierania szczegółów dostawy:", error);
        displayMessage("Error", "Nie udało się pobrać szczegółów dostawy");
      },
    });
  }

  // Wywołaj po załadowaniu strony
  loadDeliveryDetails();

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
    let diffCount = 0;

    tableData.forEach((row) => {
      const deliveredValue = valueTotal(row?.segments);
      totalValue += deliveredValue;

      // Policz rozbieżności
      const state = computeRowState(row);
      if (state.key.startsWith("diff_")) {
        diffCount++;
      }
    });

    // Wartość
    const valueDelivery = document.getElementById("valueDelivery");
    if (valueDelivery) {
      valueDelivery.textContent = fmtPLN(totalValue);
    }

    // Niezgodności
    const diffDeliveryOrders = document.getElementById("diffDeliveryOrders");
    if (diffDeliveryOrders) {
      diffDeliveryOrders.textContent = diffCount;
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
      return {
        key: "invalid",
        label: "Błędna",
        badge: "badge badge--danger",
        sort: 90,
      };
    }

    // Status jest zawsze obliczany z oryginalnych danych serwera (nie zależy od filtra zamówienia)
    const hasLinked = linked.length > 0;
    const hasProposals = proposals.length > 0;

    if (!hasLinked) {
      if (hasProposals) {
        return {
          key: "proposal",
          label: "Do weryfikacji",
          badge: "badge badge--info",
          sort: 20,
        };
      }
      return {
        key: "unmatched",
        label: "Brak dopasowania",
        badge: "badge badge--muted",
        sort: 10,
      };
    }

    // linked state + diffs
    const orderedQty = linked.reduce((acc, p) => acc + sumQty(p?.segments), 0);
    const orderedPrice = avgPriceWeighted(linked?.[0]?.segments); // jak na screenie: pierwszy dokument
    const qtyDiff = roundQty(deliveredQty - orderedQty);

    const deliveredValue =
      deliveredPrice === null ? 0 : deliveredQty * deliveredPrice;
    const orderedValue = orderedPrice === null ? 0 : orderedQty * orderedPrice;
    const valueDiff = deliveredValue - orderedValue;

    const qtyDiffNonZero = Math.abs(qtyDiff) > 0.0001;
    const valueDiffNonZero = Math.abs(valueDiff) > 0.000001; // tolerancja

    if (!qtyDiffNonZero && !valueDiffNonZero) {
      return {
        key: "matched",
        label: "Dopasowano",
        badge: "badge badge--success",
        sort: 40,
      };
    }
    if (qtyDiffNonZero && valueDiffNonZero) {
      return {
        key: "diff_both",
        label: "Rozbieżność il./wart.",
        badge: "badge badge--danger",
        sort: 60,
      };
    }
    if (qtyDiffNonZero) {
      return {
        key: "diff_qty",
        label: "Rozbieżność ilościowa",
        badge: "badge badge--warn",
        sort: 50,
      };
    }
    return {
      key: "diff_value",
      label: "Rozbieżność wartościowa",
      badge: "badge badge--warn2",
      sort: 55,
    };
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
      const qtyDiff = orderedQty > 0 ? roundQty(deliveredQty - orderedQty) : 0;

      const deliveredValue =
        deliveredPrice === null ? 0 : deliveredQty * deliveredPrice;
      const orderedValue =
        orderedPrice === null ? 0 : orderedQty * orderedPrice;
      const valueDiff = orderedQty > 0 ? orderedValue - deliveredValue : 0;

      const orderId = m?.orderId || "";
      const matchId = m?.id;

      // Format price difference with proper sign (ordered - delivered: + = oszczędność, - = strata)
      const priceDiff =
        orderedPrice !== null && deliveredPrice !== null
          ? orderedPrice - deliveredPrice
          : 0;
      const priceDiffFormatted =
        orderedPrice !== null && deliveredPrice !== null
          ? priceDiff >= 0
            ? `+${fmtPLN(priceDiff)}`
            : fmtPLN(priceDiff)
          : "-";

      return `
      <tr class="child-row" style="background: #f9fafb;">
        <td style="padding: 8px; text-align: center;"></td>
        <td style="padding: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; padding-left: 20px;">
            <span style="color: #9ca3af;">↳</span>
            <span style="font-weight: 400;">Wariant ${idx + 1}</span>
          </div>
        </td>

        <td class="text-right" style="padding: 8px; color: #9ca3af;">-</td>
        <td class="text-right" style="padding: 8px; font-style: italic;">${fmtQty(orderedQty)}</td>
        <td class="text-right" style="padding: 8px;">${orderedQty > 0 ? diffSpanNumber(qtyDiff, true) : `<span style="color: #9ca3af; font-style: italic;">-</span>`}</td>
        <td class="text-right" style="padding: 8px; color: #9ca3af;">-</td>
        <td class="text-right" style="padding: 8px; font-style: italic;">${orderedPrice !== null ? fmtPLN(orderedPrice) : "-"}</td>
        <td class="text-right" style="padding: 8px;">${(() => {
          if (orderedQty <= 0) return `<span style="color: #9ca3af; font-style: italic;">-</span>`;
          const hasQD = Math.abs(qtyDiff) > 0.0001;
          const hasPD = Math.abs(priceDiff) > 0.000001;
          if (hasQD && hasPD) {
            const commonQ = Math.min(deliveredQty, orderedQty);
            const pdVal = commonQ * priceDiff;
            const pdColor = pdVal > 0 ? "#16a34a" : "#dc2626";
            return `<div style="display: flex; flex-direction: column; gap: 1px; align-items: flex-end; font-style: italic;">
              <span style="color: ${pdColor};">${(pdVal > 0 ? "+" : "") + fmtPLN(Math.abs(pdVal))}</span>
              <span style="color: #dc2626; font-size: 11px;">${qtyDiff > 0 ? "+" : ""}${roundQty(qtyDiff)} szt.</span>
            </div>`;
          }
          return diffSpanMoney(valueDiff, true);
        })()}</td>

        <td style="padding: 8px; font-style: italic;">
          ${
            orderId
              ? `<div style="font-style: italic;">${formatOrderDisplay(orderId)}</div>`
              : `<span style="color: #9ca3af; font-style: italic;">-</span>`
          }
        </td>

        <td style="padding: 8px;">
          <span class="badge badge--info">Do weryfikacji</span>
        </td>

        <td style="padding: 8px;">
          <button
            class="btn btn-outline btn-sm link-btn"
            data-product-id="${parent?.id}"
            data-match-id="${matchId}"
            title="Połącz z zamówieniem"
            style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 12px; border: 1px solid #9ca3af; border-radius: 6px; background: transparent; cursor: pointer; font-size: 12px; color: currentColor; font-weight: 500; transition: all 0.2s; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); width: 100px;"
            onmouseover="this.style.background='#f9fafb'; this.style.color='#374151';"
            onmouseout="this.style.background='transparent'; this.style.color='currentColor';"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
              <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
              <line x1="8" x2="16" y1="12" y2="12"></line>
            </svg>
            Połącz
          </button>
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
      // Utwórz wrapper dla dropdownu
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
      <span class="dh-order-label">Porównuj z</span>
      <select id="order-filter-select" class="dh-order-select">
        <option value="">Wszystkie zamówienia</option>
        ${options}
      </select>
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

    table.draw();

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

        // Zastosuj filtr
        applyOrderFilter(table, orderId);

        // Wymuś porządek sortowania po zmianie zamówienia
        table.order([[9, "asc"], [1, "asc"]]).draw();
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
        <span id="issueDateBadge" style="display: none; align-items: center; gap: 5px; padding: 4px 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 20px; font-size: 12px; color: #1e40af; font-weight: 500; white-space: nowrap;">
          ${ICON.calendar}
          Data dokumentu: <strong id="issueDateBadgeValue">-</strong>
        </span>
        <div id="dateRangeToggle" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 12px; color: #374151; cursor: pointer; user-select: none; transition: background 0.15s;">
          ${ICON.calendar}
          <span style="color: #6b7280;">Zakres zamówień:</span>
          <strong id="dateRangeLabel">—</strong>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style="margin-left: 2px;"><path d="M3 4.5L6 7.5L9 4.5" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <input type="hidden" id="orderDateStart" />
        <input type="hidden" id="orderDateEnd" />
        <div id="drpPopover" style="display: none; position: absolute; top: 100%; left: 0; margin-top: 6px; z-index: 5000;"></div>
        <button id="details-toggle-btn" type="button" style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 12px; color: #6b7280; cursor: pointer; transition: background 0.15s; font-family: inherit;">
          Szczegóły
          <svg id="details-chevron" width="10" height="10" viewBox="0 0 12 12" fill="none" style="transition: transform 0.2s;">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
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

  // ---------- Status Filter Configuration ----------
  const STATUS_FILTERS = [
    { key: "all", label: "Wszystkie pozycje", badge: null },
    { key: "matched", label: "Dopasowane", badge: "badge--success" },
    { key: "proposal", label: "Do weryfikacji", badge: "badge--info" },
    {
      key: "diff",
      label: "Rozbieżności",
      badge: "badge--warn",
      includes: ["diff_qty", "diff_value", "diff_both"],
    },
    { key: "unmatched", label: "Brak dopasowania", badge: "badge--muted" },
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
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dh-order-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #9ca3af;
          white-space: nowrap;
        }
        .dh-order-select {
          padding: 4px 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 12px;
          font-family: inherit;
          min-width: 260px;
          cursor: pointer;
          background: white;
          color: #374151;
        }
      `;
      document.head.appendChild(style);
    }

    // Ustaw flexbox layout na kontenerze
    container.style.display = "flex";
    container.style.flexWrap = "wrap";
    container.style.alignItems = "center";
    container.style.gap = "8px";

    const html = STATUS_FILTERS.map(
      (filter) => `
    <button
      type="button"
      class="status-filter-btn ${filter.key === "all" ? "active" : ""}"
      data-filter="${filter.key}"
    >
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
      diff_qty: 0,
      diff_value: 0,
      diff_both: 0,
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

      let count;
      if (filter.key === "all") {
        count = counts.all;
      } else if (filter.includes) {
        // Sumuj wiele statusów (np. dla "Rozbieżności" = diff_qty + diff_value + diff_both)
        count = filter.includes.reduce(
          (sum, key) => sum + (counts[key] || 0),
          0,
        );
      } else {
        count = counts[filter.key] || 0;
      }

      countEl.textContent = count;
    });
  }

  // ---------- Apply Filter to DataTable ----------
  let currentFilterFn = null;

  function applyStatusFilter(table, filterKey) {
    // Usuń poprzedni custom search jeśli istnieje
    if (currentFilterFn) {
      const idx = $.fn.dataTable.ext.search.indexOf(currentFilterFn);
      if (idx > -1) {
        $.fn.dataTable.ext.search.splice(idx, 1);
      }
    }

    if (filterKey !== "all") {
      const filterConfig = STATUS_FILTERS.find((f) => f.key === filterKey);
      const keysToMatch = filterConfig?.includes || [filterKey];

      currentFilterFn = function (settings, data, dataIndex) {
        // Upewnij się że to nasza tabela
        if (settings.nTable.id !== "table_delivery") return true;

        const rowData = table.row(dataIndex).data();
        const state = computeRowState(rowData);
        return keysToMatch.includes(state.key);
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

    // Click na przycisk filtra
    container.addEventListener("click", function (e) {
      const btn = e.target.closest(".status-filter-btn");
      if (!btn) return;

      // Update active state
      container
        .querySelectorAll(".status-filter-btn")
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

        // Update order dropdown w tym samym kontenerze co filtry statusów
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

  function initDeliveryTable({ recadvId, InvokeURL, orgToken }) {
    // 1) jeśli już stoi – ubij i wyczyść
    if ($.fn.DataTable.isDataTable("#table_delivery")) {
      $("#table_delivery").DataTable().clear().destroy();
      $("#table_delivery tbody").empty();
    }

    // 2) zdejmij poprzednie eventy (unikasz dubli)
    $("#table_delivery tbody").off(".delivery");
    $(document).off(".delivery");

    // 3) Dodaj tfoot jeśli nie istnieje (potrzebne dla footerCallback)
    if (!$("#table_delivery tfoot").length) {
      const colCount = $("#table_delivery thead th").length || 11;
      const cells = Array(colCount).fill('<td></td>').join('');
      $("#table_delivery").append(`<tfoot><tr>${cells}</tr></tfoot>`);
    }

    // 4) inicjalizacja
    deliveryTable = $("#table_delivery").DataTable({
      pagingType: "full_numbers",
      lengthMenu: [10, 25, 50, 100],
      pageLength: 25,
      order: [
        [9, "asc"],
        [1, "asc"],
      ], // Sortuj najpierw po statusie, potem po nazwie produktu
      dom: '<"top"fB>rt<"bottom"lip>',
      scrollY: "70vh",
      scrollCollapse: true,
      autoWidth: false,

      footerCallback: function (row, data, start, end, display) {
        const api = this.api();

        // Suma kolumny 7 (Różnica wart.) ze WSZYSTKICH przefiltrowanych wierszy (nie tylko bieżąca strona)
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

        // Wyświetl sumę w kolumnie 7
        const footerCell = $(api.column(7).footer());
        if (Math.abs(totalValueDiff) < 0.001) {
          footerCell.html(`<span style="color: #6b7280; font-weight: 600;">${fmtPLN(0)}</span>`);
        } else {
          const sign = totalValueDiff > 0 ? "+" : "";
          const color = totalValueDiff > 0 ? "#16a34a" : "#dc2626";
          footerCell.html(`<span style="color: ${color}; font-weight: 600;">${sign}${fmtPLN(Math.abs(totalValueDiff))}</span>`);
        }
        footerCell.css({ "text-align": "right", "padding": "10px 8px", "border-top": "2px solid #e5e7eb" });

        // Etykieta w pierwszej kolumnie
        const labelCell = $(api.column(0).footer());
        labelCell.attr("colspan", 1);
        // Etykieta w kolumnie Produkt
        const prodCell = $(api.column(1).footer());
        prodCell.html(`<span style="font-weight: 600; color: #374151;">Łącznie</span>`);
        prodCell.css({ "padding": "10px 8px", "border-top": "2px solid #e5e7eb" });

        // Wyczyść i styluj pozostałe komórki footera
        for (let i = 0; i <= 10; i++) {
          const cell = $(api.column(i).footer());
          if (i !== 1 && i !== 7) {
            cell.html("");
          }
          cell.css({ "border-top": "2px solid #e5e7eb", "padding": "10px 8px" });
        }
      },

      buttons: [
        {
          text: '<span class="dt-btn">Rozwiń</span>',
          titleAttr: "Rozwiń wszystkie (propozycje)",
          action: function (e, dt) {
            dt.rows().every(function () {
              const row = this;
              const data = row.data();
              const tr = $(row.node());
              // Oblicz liczbę wariantów do wyświetlenia w rozwinięciu
              let proposalsToRenderCount;
              if (selectedOrderId && data?._variantMatches) {
                proposalsToRenderCount = data._variantMatches.length;
              } else {
                const proposals = safeArr(data?.potentialMatches);
                proposalsToRenderCount = proposals.length > 1 ? proposals.length - 1 : 0;
              }

              if (proposalsToRenderCount > 0 && !tr.hasClass("shown")) {
                const childRowsHtml = renderChildProposals(
                  data,
                  selectedOrderId,
                );
                tr.after(childRowsHtml);
                tr.addClass("shown");
              }
            });
          },
        },
        {
          text: '<span class="dt-btn">Zwiń</span>',
          titleAttr: "Zwiń wszystkie",
          action: function (e, dt) {
            dt.rows().every(function () {
              const row = this;
              const tr = $(row.node());
              if (tr.hasClass("shown")) {
                tr.nextUntil(":not(.child-row)").remove();
                tr.removeClass("shown");
              }
            });
          },
        },
      ],

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
        {
          data: null,
          orderable: false,
          defaultContent: "",
          width: "20px",
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
        // Kolumna 1 - Produkt
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

        // Kolumna 2 - Ilość dost.
        {
          data: "segments",
          orderable: true,
          className: "text-right",
          render: function (segments, type, row) {
            const q = sumQty(segments);
            if (type === "sort" || type === "type") return q;

            // Gdy filtrowanie według zamówienia: pokaż ilość dostarczoną
            if (selectedOrderId) {
              return q ? fmtQty(q) : `<span class="muted">-</span>`;
            }

            // Brak filtrowania - oryginalna logika
            return q ? fmtQty(q) : `<span class="muted">-</span>`;
          },
        },

        // Kolumna 3 - Ilość zam.
        {
          data: null,
          orderable: true,
          className: "text-right",
          render: function (data, type, row) {
            let q = 0;
            let isProposal = false;

            if (selectedOrderId && row?._primaryMatch) {
              q = sumQty(row._primaryMatch?.segments);
              isProposal = !!row._isPrimaryProposal;
            } else {
              const linked = safeArr(row?.linkedOrderProducts);
              const proposals = safeArr(row?.potentialMatches);

              if (linked.length) {
                q = linked.reduce((acc, p) => acc + sumQty(p?.segments), 0);
              } else if (proposals.length) {
                q = sumQty(proposals[0]?.segments);
                isProposal = true;
              } else {
                if (type === "sort" || type === "type") return 0;
                return `<span class="muted">-</span>`;
              }
            }

            if (type === "sort" || type === "type") return q;
            return q
              ? `<span class="${isProposal ? "italic" : ""}">${fmtQty(q)}</span>`
              : `<span class="muted">-</span>`;
          },
        },

        // Kolumna 4 - Różnica il.
        {
          data: null,
          orderable: true,
          className: "text-right",
          render: function (data, type, row) {
            const deliveredQty = sumQty(row?.segments);
            let orderedQty = 0;
            let isProposal = false;

            if (selectedOrderId && row?._primaryMatch) {
              orderedQty = sumQty(row._primaryMatch?.segments);
              isProposal = !!row._isPrimaryProposal;
            } else {
              const linked = safeArr(row?.linkedOrderProducts);
              const proposals = safeArr(row?.potentialMatches);

              if (!linked.length && !proposals.length)
                return type === "sort" || type === "type" ? 0 : `<span class="muted">-</span>`;

              if (linked.length) {
                orderedQty = linked.reduce((acc, p) => acc + sumQty(p?.segments), 0);
              } else if (proposals.length) {
                orderedQty = sumQty(proposals[0]?.segments);
                isProposal = true;
              }
            }

            const diff = roundQty(deliveredQty - orderedQty);
            if (type === "sort" || type === "type") return diff;
            return diffSpanNumber(diff, isProposal);
          },
        },

        // Kolumna 5 - Cena dost.
        {
          data: "segments",
          orderable: true,
          className: "text-right",
          render: function (segments, type) {
            const p = avgPriceWeighted(segments);
            if (type === "sort" || type === "type") return p ?? -1;
            return p !== null ? fmtPLN(p) : `<span class="muted">-</span>`;
          },
        },

        // Kolumna 6 - Cena zam.
        {
          data: null,
          orderable: true,
          className: "text-right",
          render: function (data, type, row) {
            let p = null;
            let isProposal = false;

            if (selectedOrderId && row?._primaryMatch) {
              p = avgPriceWeighted(row._primaryMatch?.segments);
              isProposal = !!row._isPrimaryProposal;
            } else {
              const linked = safeArr(row?.linkedOrderProducts);
              const proposals = safeArr(row?.potentialMatches);

              if (linked.length) {
                p = avgPriceWeighted(linked[0]?.segments);
              } else if (proposals.length) {
                p = avgPriceWeighted(proposals[0]?.segments);
                isProposal = true;
              }
            }

            if (p === null) return type === "sort" || type === "type" ? -1 : `<span class="muted">-</span>`;
            if (type === "sort" || type === "type") return p;
            return `<span class="${isProposal ? "italic" : ""}">${fmtPLN(p)}</span>`;
          },
        },

        // Kolumna 7 - Różnica wartość
        {
          data: null,
          orderable: true,
          className: "text-right",
          render: function (data, type, row) {
            const deliveredQty = sumQty(row?.segments);
            const deliveredPrice = avgPriceWeighted(row?.segments);
            let orderedQty = 0;
            let orderedPrice = null;
            let isProposal = false;

            if (selectedOrderId && row?._primaryMatch) {
              orderedQty = sumQty(row._primaryMatch?.segments);
              orderedPrice = avgPriceWeighted(row._primaryMatch?.segments);
              isProposal = !!row._isPrimaryProposal;
            } else {
              const linked = safeArr(row?.linkedOrderProducts);
              const proposals = safeArr(row?.potentialMatches);

              if (!linked.length && !proposals.length)
                return type === "sort" || type === "type" ? 0 : `<span class="muted">-</span>`;

              if (linked.length) {
                orderedQty = linked.reduce((acc, p) => acc + sumQty(p?.segments), 0);
                orderedPrice = avgPriceWeighted(linked[0]?.segments);
              } else if (proposals.length) {
                orderedQty = sumQty(proposals[0]?.segments);
                orderedPrice = avgPriceWeighted(proposals[0]?.segments);
                isProposal = true;
              }
            }

            const deliveredValue = deliveredPrice === null ? 0 : deliveredQty * deliveredPrice;
            const orderedValue = orderedPrice === null ? 0 : orderedQty * orderedPrice;
            // Konwencja: zamówione - dostarczone (+ = oszczędność, - = strata)
            const totalDiff = orderedValue - deliveredValue;

            if (type === "sort" || type === "type") return totalDiff;

            // Rozłóż różnicę na składniki
            const qtyDiff = roundQty(deliveredQty - orderedQty);
            const priceDiff = (deliveredPrice !== null && orderedPrice !== null)
              ? orderedPrice - deliveredPrice : 0;
            const hasQtyDiff = Math.abs(qtyDiff) > 0.0001;
            const hasPriceDiff = Math.abs(priceDiff) > 0.000001;

            if (!hasQtyDiff && !hasPriceDiff) {
              return diffSpanMoney(totalDiff, isProposal);
            }

            if (hasQtyDiff && hasPriceDiff) {
              // Linia 1: różnica cenowa × min(delivered, ordered) sztuk
              const commonQty = Math.min(deliveredQty, orderedQty);
              const priceDiffValue = commonQty * priceDiff;

              const italicStyle = isProposal ? " font-style: italic;" : "";
              const priceColor = priceDiffValue > 0 ? "#16a34a" : "#dc2626";
              return `<div style="display: flex; flex-direction: column; gap: 1px; align-items: flex-end;${italicStyle}">
                <span style="color: ${priceColor};" title="Różnica cenowa: ${fmtPLN(Math.abs(priceDiff))}/szt. × ${commonQty} szt.">${(priceDiffValue > 0 ? "+" : "") + fmtPLN(Math.abs(priceDiffValue))}</span>
                <span style="color: #dc2626; font-size: 11px;" title="Różnica ilościowa">${qtyDiff > 0 ? "+" : ""}${qtyDiff} szt.</span>
              </div>`;
            }

            // Tylko jedna składowa
            return diffSpanMoney(totalDiff, isProposal);
          },
        },

        // Kolumna 8 - Dokument zam.
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
            return `<span class="${st.badge}">${st.label}</span>`;
          },
        },
        // Kolumna 10 - Akcje
        {
          data: null,
          orderable: false,
          className: "actions-col",
          width: "120px",
          render: function (data, type, row) {
            const linked = safeArr(row?.linkedOrderProducts);
            const proposals = safeArr(row?.potentialMatches);

            // Określ primary match (z _primaryMatch lub fallback)
            let actionMatch = null;
            let isLinked = false;

            if (selectedOrderId && row?._primaryMatch) {
              actionMatch = row._primaryMatch;
              // Sprawdź czy to linked czy proposal
              isLinked = !row._isPrimaryProposal;
            } else {
              if (linked.length) {
                actionMatch = linked[0];
                isLinked = true;
              } else if (proposals.length) {
                actionMatch = proposals[0];
                isLinked = false;
              }
            }

            if (!actionMatch) return "";

            if (isLinked) {
              const linkedId = actionMatch?.id;
              return `
          <button
            class="btn btn-outline btn-sm unlink-btn"
            data-product-id="${row?.id}"
            data-linked-id="${linkedId}"
            title="Rozłącz powiązanie"
            style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 12px; border: 1px solid #9ca3af; border-radius: 6px; background: transparent; cursor: pointer; font-size: 12px; color: currentColor; font-weight: 500; transition: all 0.2s; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); width: 100px;"
            onmouseover="this.style.background='#f9fafb'; this.style.color='#374151';"
            onmouseout="this.style.background='transparent'; this.style.color='currentColor';"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"></path>
              <path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"></path>
              <line x1="8" x2="8" y1="2" y2="5"></line>
              <line x1="2" x2="5" y1="8" y2="8"></line>
              <line x1="16" x2="16" y1="19" y2="22"></line>
              <line x1="19" x2="22" y1="16" y2="16"></line>
            </svg>
            Rozłącz
          </button>
        `;
            } else {
              const matchId = actionMatch?.id;
              return `
          <button
            class="btn btn-outline btn-sm link-btn"
            data-product-id="${row?.id}"
            data-match-id="${matchId}"
            title="Połącz z zamówieniem"
            style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 12px; border: 1px solid #9ca3af; border-radius: 6px; background: transparent; cursor: pointer; font-size: 12px; color: currentColor; font-weight: 500; transition: all 0.2s; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); width: 100px;"
            onmouseover="this.style.background='#f9fafb'; this.style.color='#374151';"
            onmouseout="this.style.background='transparent'; this.style.color='currentColor';"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
              <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
              <line x1="8" x2="16" y1="12" y2="12"></line>
            </svg>
            Połącz
          </button>
        `;
            }
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

    // Event: Połącz produkt
    $(document)
      .off("click.delivery", ".link-btn")
      .on("click.delivery", ".link-btn", function () {
        const btn = $(this);
        const productId = btn.data("product-id");
        const matchId = btn.data("match-id");

        // Znajdź parent row (dla child rows, znajdź poprzedni tr który nie jest child-row)
        let tr = btn.closest("tr");
        if (tr.hasClass("child-row")) {
          tr = tr.prevAll("tr").not(".child-row").first();
        }

        const row = deliveryTable.row(tr);
        const rowData = row.data();
        const gtin = rowData?.gtin;

        const proposal = safeArr(rowData?.potentialMatches).find(
          (p) => p.id === matchId,
        );
        const quantity = proposal?.matchableQty || sumQty(rowData?.segments);

        console.log("LINK", { recadvId, productId, matchId, quantity, gtin });

        btn.prop("disabled", true).css("opacity", "0.5");

        linkRecadvProduct(recadvId, productId, matchId, quantity)
          .then(function () {
            // Pobierz świeże dane z pełnym stanem (potentialMatches, linkedOrderProducts)
            const dateParams = getDateRangeParams();
            return $.ajax({
              type: "GET",
              url:
                InvokeURL +
                "van/recadvs/" +
                encodeURIComponent(recadvId) +
                "/products?" + dateParams,
              headers: {
                Authorization: orgToken,
                "Requested-By": "webflow-3-4",
              },
              data: {
                gtin: gtin,
              },
            });
          })
          .then(function (response) {
            const updatedProduct = safeArr(response?.items).find(
              (item) => item.id === productId,
            );

            if (updatedProduct) {
              // Zamknij child rows jeśli były otwarte
              const parentTr = $(row.node());
              if (parentTr.hasClass("shown")) {
                parentTr.nextUntil(":not(.child-row)").remove();
                parentTr.removeClass("shown");
              }

              // Re-normalizuj dane produktu
              const normalizedProduct = normalizeRowsForSelectedOrder([updatedProduct])[0];
              row.data(normalizedProduct);

              // Aktualizuj klasę details-control w zależności od liczby wariantów do wyświetlenia
              let proposalsToRenderCount;
              if (selectedOrderId && normalizedProduct?._variantMatches) {
                proposalsToRenderCount = normalizedProduct._variantMatches.length;
              } else {
                const proposals = safeArr(normalizedProduct?.potentialMatches);
                proposalsToRenderCount = proposals.length > 1 ? proposals.length - 1 : 0;
              }

              if (proposalsToRenderCount > 0) {
                parentTr.find("td:first").addClass("details-control");
              } else {
                parentTr.find("td:first").removeClass("details-control");
              }

              refreshFiltersAfterUpdate();
            }

            displayMessage("Success", "Produkt został połączony");
          })
          .catch(function (error) {
            console.error("Link error:", error);
            const msg =
              error.responseJSON?.message || "Nie udało się połączyć produktu";
            displayMessage("Error", msg);
            btn.prop("disabled", false).css("opacity", "1");
          });
      });

    // Event: Rozłącz produkt
    $(document)
      .off("click.delivery", ".unlink-btn")
      .on("click.delivery", ".unlink-btn", function () {
        const btn = $(this);
        const tr = btn.closest("tr");
        const row = deliveryTable.row(tr);
        const rowData = row.data();

        const productId = btn.data("product-id");
        const linkedId = btn.data("linked-id");
        const gtin = rowData?.gtin;

        console.log("UNLINK", { recadvId, productId, linkedId, gtin });

        btn.prop("disabled", true).css("opacity", "0.5");

        unlinkRecadvProduct(recadvId, productId, linkedId)
          .then(function () {
            // Pobierz świeże dane z potentialMatches
            const dateParams = getDateRangeParams();
            return $.ajax({
              type: "GET",
              url:
                InvokeURL +
                "van/recadvs/" +
                encodeURIComponent(recadvId) +
                "/products?" + dateParams,
              headers: {
                Authorization: orgToken,
                "Requested-By": "webflow-3-4",
              },
              data: {
                gtin: gtin,
              },
            });
          })
          .then(function (response) {
            const updatedProduct = safeArr(response?.items).find(
              (item) => item.id === productId,
            );

            if (updatedProduct) {
              const parentTr = $(row.node());

              // Re-normalizuj dane produktu
              const normalizedProduct = normalizeRowsForSelectedOrder([updatedProduct])[0];
              row.data(normalizedProduct);

              // Aktualizuj klasę details-control w zależności od liczby wariantów do wyświetlenia
              let proposalsToRenderCount;
              if (selectedOrderId && normalizedProduct?._variantMatches) {
                proposalsToRenderCount = normalizedProduct._variantMatches.length;
              } else {
                const proposals = safeArr(normalizedProduct?.potentialMatches);
                proposalsToRenderCount = proposals.length > 1 ? proposals.length - 1 : 0;
              }

              if (proposalsToRenderCount > 0) {
                parentTr.find("td:first").addClass("details-control");
              } else {
                parentTr.find("td:first").removeClass("details-control");
              }

              refreshFiltersAfterUpdate();
            }

            displayMessage("Success", "Powiązanie zostało usunięte");
          })
          .catch(function (error) {
            console.error("Unlink error:", error);
            const msg =
              error.responseJSON?.message || "Nie udało się rozłączyć produktu";
            displayMessage("Error", msg);
            btn.prop("disabled", false).css("opacity", "1");
          });
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

  initDeliveryTable({ recadvId, InvokeURL, orgToken });
  initializeSimpleTooltips();
});
