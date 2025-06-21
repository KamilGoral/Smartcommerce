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
        // Tworzymy wrapper, który otoczy tylko input
        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.display = "inline-block";
        wrapper.style.width = input.offsetWidth + "px";

        // Wstawiamy wrapper przed inputem
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        // Dodajemy miejsce w input na ikonę
        input.style.paddingRight = "40px";

        // Tworzymy ikonę
        const eyeIcon = document.createElement("img");
        eyeIcon.src =
          "https://cdn.prod.website-files.com/6041108bece36760b4e14016/68563a97a30070647f1763d1_watch-crossed.svg";
        eyeIcon.alt = "Pokaż hasło";
        eyeIcon.style.position = "absolute";
        eyeIcon.style.right = "10px";
        eyeIcon.style.cursor = "pointer";
        eyeIcon.style.width = "20px";
        eyeIcon.style.height = "20px";
        eyeIcon.style.objectFit = "contain";

        wrapper.appendChild(eyeIcon);

        // Centrowanie dokładne po wysokości inputa
        requestAnimationFrame(() => {
          const inputHeight = input.offsetHeight;
          const iconHeight = 20;
          const topPosition = (inputHeight - iconHeight) / 2;
          eyeIcon.style.top = `${topPosition}px`;
        });

        // Przełączanie widoczności hasła
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

  enablePasswordToggle();

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

  let offerStatusLoaded = false;
  let lastOfferFetchTimestamp = 0;
  const MIN_FETCH_INTERVAL_MS = 10;

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
  const userRole = getCookie("sprytnyUserRole");

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
  var DomainName = getCookie("sprytnyDomainName");
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var ClientID = getCookieNameByValue(orgToken);
  var OrganizationName = getCookie("OrganizationName");
  var counter = 0;
  var shopKey = new URL(location.href).searchParams.get("shopKey");
  var offerId = new URL(location.href).searchParams.get("offerId");

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

  const ShopBread = document.getElementById("ShopNameBread");
  ShopBread.textContent = shopKey;
  ShopBread.setAttribute(
    "href",
    "https://" + DomainName + "/app/shops/shop?shopKey=" + shopKey
  );

  const OfferIDBread = document.getElementById("OfferDateBread");
  OfferIDBread.textContent = offerId;
  OfferIDBread.setAttribute(
    "href",
    "https://" +
      DomainName +
      "/app/offers/offer?shopKey=" +
      shopKey +
      "&offerId=" +
      offerId
  );

  function getProductDetails(rowData) {
    return new Promise((resolve, reject) => {
      const url = new URL(
        InvokeURL + "shops/" + shopKey + "/products/" + rowData.gtin
      );

      const request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.setRequestHeader("Authorization", orgToken);
      request.setRequestHeader("Requested-By", "webflow-3-4");

      request.onload = function () {
        if (request.status === 401) {
          console.log("Unauthorized");
          reject("Unauthorized or error");
          return;
        }

        if (request.status < 200 || request.status >= 400) {
          console.log("Request failed with status", request.status);
          reject("Request failed with status");
          return;
        }

        let data;
        try {
          data = JSON.parse(this.response);
        } catch (e) {
          console.log("Error parsing response JSON:", e);
          reject("Parse error");
          return;
        }

        // Elementy DOM
        const pName = document.getElementById("pName");
        const pEan = document.getElementById("pEan");
        const pInStock = document.getElementById("pInStock");
        const pUnit = document.getElementById("pUnit");
        const pStandardPrice = document.getElementById("pStandardPrice");
        const pRetailPrice = document.getElementById("pRetailPrice");
        const pIndicator = document.getElementById("pIndicator");
        const pBestPrice = document.getElementById("pBestPrice");

        // Wypełnianie danych
        pName.textContent = data?.name || "-";
        pEan.textContent = data?.gtin || "-";

        const stock = data?.stock ?? { value: 0, unit: "pieces" };
        pInStock.textContent = stock.value;
        pUnit.textContent = stock.unit === "pieces" ? "szt" : stock.unit;

        const standardPrice = data?.standardPrice?.value ?? 0;
        pStandardPrice.textContent = standardPrice;

        const retailPrice = data?.retailPrice ?? 0;
        pRetailPrice.textContent = retailPrice;

        pIndicator.textContent = rowData?.rotationIndicator ?? "-";

        if (Array.isArray(rowData?.asks) && rowData.asks.length > 0) {
          pBestPrice.textContent = rowData.asks[0].netPrice;
        } else {
          pBestPrice.textContent = "-";
        }
        resolve();
      };

      request.onerror = function () {
        console.log("Network error while fetching product details.");
        reject("Network error");
      };

      request.send();
    });
  }

  function isToday(isoDateStr) {
    if (!isoDateStr) return false;
    const date = new Date(isoDateStr);
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  function getOfferStatus() {
    fetch(`${InvokeURL}shops/${shopKey}/offers/latest/status`, {
      headers: {
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        const statusMap = {
          success: "Sukces",
          error: "Problem",
          "in progress": "W trakcie",
          incomplete: "Niekompletna",
          batching: "W kolejce",
          forced: "W kolejce",
          queued: "W kolejce",
          unknown: "Nieznany",
        };

        const entries = [];

        // ========== 1. ECOMMERCE ==========
        (res.ecommerce || []).forEach((entry) => {
          const events = entry.events || [];

          if (events.length === 0) {
            entries.push({
              wholesalerKey: entry.wholesalerKey,
              source: "E-hurt",
              status: "unknown",
              statusLabel: statusMap["unknown"],
              updatedAt: "Brak danych",
              messages: [],
              allEvents: [],
              expandable: false,
            });
            return;
          }

          const latestEvent = events
            .slice()
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

          const enrichedEvents = events.map((e) => {
            const isLatestSuccess =
              e.updatedAt === latestEvent.updatedAt &&
              latestEvent.extracting?.status === "success";
            return {
              updatedAt: e.updatedAt,
              status: e.extracting?.status || "unknown",
              messages: e.extracting?.messages || [],
              offerTimestamp: isLatestSuccess
                ? entry.lastMutation?.offerTimestamp || null
                : null,
            };
          });

          entries.push({
            wholesalerKey: entry.wholesalerKey,
            source: "E-hurt",
            status: latestEvent.extracting?.status || "unknown",
            statusLabel:
              statusMap[latestEvent.extracting?.status] || statusMap["unknown"],
            updatedAt: new Date(latestEvent.updatedAt).toLocaleString("pl-PL"),
            messages: latestEvent.extracting?.messages || [],
            allEvents: enrichedEvents,
            expandable:
              enrichedEvents.length > 1 || enrichedEvents[0].status === "error",
          });
        });

        // ========== 2. INTEGRATIONS.WMS ==========
        if (res.integrations?.wms) {
          const wms = res.integrations.wms;
          const wmsEvents = wms.events || [];
          if (wmsEvents.length > 0) {
            const latestWmsEvent = wmsEvents
              .slice()
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
            entries.push({
              wholesalerKey: wms.key || "pc-market",
              source: "Program magazynowy",
              status: latestWmsEvent.extracting?.status || "unknown",
              statusLabel:
                statusMap[latestWmsEvent.extracting?.status] || "Nieznany",
              updatedAt: new Date(latestWmsEvent.updatedAt).toLocaleString(
                "pl-PL"
              ),
              messages: latestWmsEvent.extracting?.messages || [],
            });
          }
        }

        // ========== 3. INTEGRATIONS.RETROACTIVE ==========
        if (res.integrations?.retroactive?.updatedAt) {
          entries.push({
            wholesalerKey: "-",
            source: "Kontrakty z dostawcami",
            status: "success",
            statusLabel: "Sukces",
            updatedAt: new Date(
              res.integrations.retroactive.updatedAt
            ).toLocaleString("pl-PL"),
            messages: [],
          });
        }

        // ========== 4. PRICATS ==========
        (res.pricats || []).forEach((pricat) => {
          const isPending = !pricat.updatedAt;
          entries.push({
            wholesalerKey: pricat.wholesalerKey || "-",
            source: "Cennik",
            status: isPending ? "in progress" : "success",
            statusLabel: isPending ? "W trakcie" : "Sukces",
            updatedAt: isPending
              ? "Brak danych"
              : new Date(pricat.updatedAt).toLocaleString("pl-PL"),
            messages: [],
          });
        });

        // ====================== STATYSTYKI ======================
        const setText = (id, text) => {
          const el = document.getElementById(id);
          if (el) el.innerText = text;
        };

        // Statystyki
        let successCount = 0;
        let errorCount = 0;
        let inProgressCount = 0;
        let allCount = entries.length;

        entries.forEach((entry) => {
          if (entry.status === "success") successCount++;
          else if (entry.status === "error") errorCount++;
          else if (entry.status === "in progress") inProgressCount++;
        });

        // Ustawienie liczników
        setText("offerSuccessCounter", successCount);
        setText("offerErrorCounter", errorCount);
        setText("offerInProgreessCounter", inProgressCount);

        // Nagłówki zbiorcze
        setText("offerAllStatus", `Wszystkie (${allCount})`);
        setText("offerActionStatus", `Problematyczne (${errorCount})`);
        setText("offerSuccessStatus", `Sukces (${successCount})`);

        // Kompletność oferty w %
        let completenessLabel = "-";
        if (allCount > 0) {
          const percentage = Math.round((successCount / allCount) * 100);
          completenessLabel = `${percentage}%`;
        }
        setText("offerCondition", "Kompletność oferty: " + completenessLabel);
        setText("offerHealthCounter", completenessLabel);

        // ========== Wstaw dane do tabeli ==========
        tableStatus.clear().rows.add(entries).draw();
      })
      .catch((err) => {
        console.log("Błąd ładowania statusów ofert:", err);
      });
  }

  function formatStatusDetails(rowData) {
    if (!rowData.allEvents || rowData.allEvents.length === 0) return "";

    const sortedEvents = rowData.allEvents
      .slice()
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const statusMap = {
      success: { label: "Sukces", class: "positive" },
      error: { label: "Problem", class: "negative" },
      "in progress": { label: "W trakcie", class: "inprogress" },
      incomplete: { label: "Niekompletna", class: "noneexisting" },
      batching: { label: "W kolejce", class: "noneexisting" },
      forced: { label: "W kolejce", class: "noneexisting" },
      unknown: { label: "Nieznany", class: "noneexisting" },
    };

    let content = `<div style="padding: 10px 20px;">`;

    sortedEvents.forEach((event) => {
      const date = new Date(event.updatedAt).toLocaleString("pl-PL");
      const statusKey = event.status || "unknown";
      const status = statusMap[statusKey] || statusMap["unknown"];
      const offerTimestampLine = `<strong>Data źródłowa oferty:</strong> ${
        event.offerTimestamp
          ? new Date(event.offerTimestamp).toLocaleString("pl-PL")
          : "-"
      }<br>`;

      const messages = event.messages.length
        ? event.messages.join("<br>")
        : "-";

      content += `
      <div style="margin-bottom:10px; padding-bottom: 10px; border-bottom: 1px solid #ccc;">
        <strong>Czas zdarzenia:</strong> ${date}<br>
        <strong>Status:</strong> <span class="${status.class}">${status.label}</span><br>
${offerTimestampLine}
<strong>Komunikat:</strong> ${messages}
      </div>
    `;
    });

    content += `</div>`;
    return content;
  }

  let tableStatus;

  function initOfferStatusTable() {
    tableStatus = $("#table_status").DataTable({
      pagingType: "full_numbers",
      dom: '<"top"f>rt<"bottom"lip>',
      scrollY: "60vh",
      scrollCollapse: true,
      pageLength: 25,
      order: [
        [3, "asc"],
        [4, "desc"],
      ], // najpierw Status (asc), potem Ost. Zmiana (desc)
      language: {
        emptyTable: "Brak danych do wyswietlenia",
        info: "Pokazuje _START_ - _END_ z _TOTAL_ rezultatow",
        infoEmpty: "Brak danych",
        infoFiltered: "(z _MAX_ rezultatow)",
        lengthMenu: "Pokaz _MENU_ rezulatow",
        search: "Szukaj:",
        zeroRecords: "Brak pasujacych rezultatow",
        paginate: {
          first: "<<",
          last: ">>",
          next: " >",
          previous: "< ",
        },
      },
      columns: [
        {
          data: null,
          orderable: false,
          width: "20px",
          render: function (data, type, row) {
            return ""; // bez strzałki
          },
          createdCell: function (td, cellData, rowData, row, col) {
            if (rowData.expandable) {
              $(td).addClass("details-control");
            } else {
              $(td).removeClass("details-control");
            }
          },
        },

        { data: "wholesalerKey", title: "Dostawca" },
        { data: "source", title: "Źródło" },
        {
          data: "statusLabel",
          title: "Status",
          render: function (data, type, row) {
            let baseClass = "";
            switch (row.status) {
              case "success":
                baseClass += "positive";
                break;
              case "error":
                baseClass += "negative";
                break;
              default:
                baseClass += "noneexisting";
            }
            return `<span class="${baseClass}">${data}</span>`;
          },
        },

        { data: "updatedAt", title: "Ost. Zmiana" },
      ],
      initComplete: function () {
        this.api()
          .rows()
          .every(function () {
            const rowData = this.data();
            const tr = $(this.node());

            if (rowData.status === "error" && rowData.expandable) {
              this.child(formatStatusDetails(rowData)).show();
              tr.addClass("shown");
            }
          });

        // toggle pojedynczy wiersz
        $("#table_status tbody").on("click", "td.details-control", function () {
          const tr = $(this).closest("tr");
          const row = tableStatus.row(tr);
          const rowData = row.data();

          if (!rowData.expandable) return;

          if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass("shown");
          } else {
            row.child(formatStatusDetails(rowData)).show();
            tr.addClass("shown");
          }
        });
      },
    });
  }

  // Wszystkie
  $('[data-w-tab="Tab 1"]').on("click", function () {
    tableStatus.column(3).search("").draw(); // Pokaż wszystkie
  });

  // Problematyczne (error)
  $('[data-w-tab="Tab 2"]').on("click", function () {
    tableStatus.column(3).search("Problem", true, false).draw(); // Tylko error
  });

  // Sukces (success)
  $('[data-w-tab="Tab 3"]').on("click", function () {
    tableStatus.column(3).search("Sukces", true, false).draw(); // Tylko success
  });

  function getProductHistory(rowData) {
    return new Promise((resolve, reject) => {
      if (rowData.stock === null) {
        rowData.stock = {
          value: 0,
          unit: "pieces",
        };
      }

      function arrayConvert(json) {
        var dataInArrays = {
          date: [],
          highest: [],
          average: [],
          lowest: [],
          retailPrice: [],
          standardPrice: [],
          stock: [],
          volume: [],
        };

        function checkNested(obj /*, level1, level2, ... levelN*/) {
          var args = Array.prototype.slice.call(arguments, 1);
          for (var i = 0; i < args.length; i++) {
            if (
              !obj ||
              typeof obj !== "object" ||
              !obj.hasOwnProperty(args[i])
            ) {
              return false;
            }
            obj = obj[args[i]];
          }
          return true;
        }

        for (let i = 0, l = json.items.length; i < l; i++) {
          const item = json.items[i];

          // Zabezpiecz dane historyczne
          dataInArrays.date.push(item.date?.split("T")[0] || "-");

          dataInArrays.highest.push(
            checkNested(item, "asks", "highest") ? item.asks.highest : 0
          );
          dataInArrays.average.push(
            checkNested(item, "asks", "average") ? item.asks.average : 0
          );
          dataInArrays.lowest.push(
            checkNested(item, "asks", "lowest") ? item.asks.lowest : 0
          );
          dataInArrays.retailPrice.push(item.retailPrice ?? 0);

          const stdPrice = checkNested(item, "standardPrice", "value")
            ? item.standardPrice.value
            : item.standardPrice ?? 0;
          dataInArrays.standardPrice.push(stdPrice);

          const stock = checkNested(item, "stock", "value")
            ? item.stock.value
            : item.stock ?? 0;
          dataInArrays.stock.push(stock);

          dataInArrays.volume.push(item.volume ?? 0);
        }

        return dataInArrays;
      }

      let url = new URL(
        InvokeURL +
          "shops/" +
          shopKey +
          "/products/" +
          rowData.gtin +
          "/history?perPage=91&page=1"
      );
      let request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.setRequestHeader("Authorization", orgToken);
      request.setRequestHeader("Requested-By", "webflow-3-4");
      request.onload = function () {
        if (request.status < 200 || request.status >= 400) {
          reject("Błąd podczas pobierania historii produktu");
          return;
        }
        var jsonek = JSON.parse(this.response);
        if (request.status >= 200 && request.status < 400) {
          function displayData(x) {
            if (isFinite(x) && Number.isInteger(x) && !isNaN(x)) {
              return x;
            }
            return "";
          }
          var dataToChart = arrayConvert(jsonek);
          const pHistory = document.getElementById("pHistory");
          pHistory.textContent = dataToChart.date.length;
          const pHistorySpan = document.getElementById("pHistorySpan");
          pHistorySpan.textContent =
            dataToChart.date.slice(-1)[0] + " - " + dataToChart.date[0];
          const pOfferDate = document.getElementById("pOfferDate");
          pOfferDate.textContent = dataToChart.date[0];
          const pRetailPriceChange =
            document.getElementById("pRetailPriceChange");
          pRetailPriceChange.textContent =
            "(" +
            displayData(
              parseFloat(
                ((dataToChart.retailPrice[0] -
                  dataToChart.retailPrice.slice(-1)[0]) /
                  dataToChart.retailPrice.slice(-1)[0]) *
                  100
              ).toFixed(2)
            ) +
            "%)";
          const pStandardPriceChange = document.getElementById(
            "pStandardPriceChange"
          );
          pStandardPriceChange.textContent =
            "(" +
            displayData(
              parseFloat(
                ((dataToChart.standardPrice[0] -
                  dataToChart.standardPrice.slice(-1)[0]) /
                  dataToChart.standardPrice.slice(-1)[0]) *
                  100
              ).toFixed(2)
            ) +
            "%)";
          const pSales7 = document.getElementById("pSales7");
          pSales7.textContent = displayData(
            dataToChart.volume.slice(0, 7).reduce((a, b) => a + b, 0)
          );
          const pStockDays = document.getElementById("pStockDays");
          pStockDays.textContent = displayData(
            Math.round(
              (rowData.stock.value /
                dataToChart.volume.slice(0, 7).reduce((a, b) => a + b, 0)) *
                7
            )
          );
          const pSales90 = document.getElementById("pSales90");
          pSales90.textContent = displayData(
            dataToChart.volume.slice(0, 90).reduce((a, b) => a + b, 0)
          );
          "(" +
            displayData(
              parseFloat(
                ((dataToChart.volume.slice(-90).reduce((a, b) => a + b, 0) -
                  dataToChart.volume.slice(0, 90).reduce((a, b) => a + b, 0)) /
                  dataToChart.volume.slice(0, 90).reduce((a, b) => a + b, 0)) *
                  100
              ).toFixed(2)
            ) +
            "%)";

          var scaleMax =
            Math.max.apply(Math, [
              ...dataToChart.highest,
              ...dataToChart.retailPrice,
            ]) * 1.1;
          var scaleMin =
            Math.min.apply(Math, [
              ...dataToChart.lowest,
              ...dataToChart.standardPrice,
            ]) * 0.9;

          var options = {
            series: [
              {
                name: "Najwyzsza",
                type: "line",
                data: dataToChart.highest.reverse(),
              },
              {
                name: "Srednia",
                type: "line",
                data: dataToChart.average.reverse(),
              },
              {
                name: "Najnizsza",
                type: "line",
                data: dataToChart.lowest.reverse(),
              },
              {
                name: "Cena det.",
                type: "line",
                data: dataToChart.retailPrice.reverse(),
              },
              {
                name: "Cena ew.",
                type: "line",
                data: dataToChart.standardPrice.reverse(),
              },
              {
                name: "Sprzedaz",
                type: "bar",
                data: dataToChart.volume.reverse(),
              },
              {
                name: "Stan",
                type: "bar",
                data: dataToChart.stock.reverse(),
              },
            ],
            chart: {
              id: "productHistoryChart",
              defaultLocale: "pl",
              toolbar: {
                show: true,
                offsetX: 0,
                offsetY: 0,
                tools: {
                  download: true,
                  selection: true,
                  zoom: true,
                  zoomin: true,
                  zoomout: true,
                  pan: true,
                  reset:
                    true | '<img src="/static/icons/reset.png" width="20">',
                  customIcons: [],
                },
                export: {
                  csv: {
                    filename: "PlikCSV",
                    columnDelimiter: ";",
                    headerCategory: "category",
                    headerValue: "value",
                  },
                  svg: {
                    filename: "Wykres",
                  },
                  png: {
                    filename: "Wykres",
                  },
                },
                autoSelected: "zoom",
              },
              locales: [
                {
                  name: "pl",
                  options: {
                    months: [
                      "Styczen",
                      "Luty",
                      "Marzec",
                      "Kwiecien",
                      "Maj",
                      "Czerwiec",
                      "Lipiec",
                      "Sierpien",
                      "Wrzesien",
                      "Pazdziernik",
                      "Listopad",
                      "Grudzien",
                    ],
                    shortMonths: [
                      "Sty",
                      "Lut",
                      "Mar",
                      "Kwi",
                      "Maj",
                      "Cze",
                      "Lip",
                      "Sie",
                      "Wrz",
                      "Paz",
                      "Lis",
                      "Gru",
                    ],
                    days: [
                      "Niedziela",
                      "Poniedzialek",
                      "Wtorek",
                      "Sroda",
                      "Czwartek",
                      "Piatek",
                      "Sobota",
                    ],
                    shortDays: ["Nd", "Pon", "Wt", "Sr", "Czw", "Pt", "Sob"],
                    toolbar: {
                      download: "Pobierz SVG",
                      selection: "Zaznacz",
                      selectionZoom: "Powieksz strefe",
                      zoomIn: "Przybliz",
                      zoomOut: "Oddal",
                      pan: "Przesun",
                      reset: "Reset",
                    },
                  },
                },
              ],
              height: 350,
              type: "line",
              stacked: false,
            },
            colors: [
              "#FD6A6A",
              "#F9C80E",
              "#4CAF50",
              "#3F51B5",
              "#03A9F4",
              "#92A9BD",
              "#D3DEDC",
            ],
            title: {
              text: "Historia towaru",
              align: "left",
              margin: 10,
              offsetX: 0,
              offsetY: 0,
              floating: false,
              style: {
                fontSize: "14px",
                fontWeight: "bold",
                fontFamily: "Arial",
                color: "#263238",
              },
            },
            stroke: {
              width: [2, 2, 2, 2, 2],
              curve: "smooth",
            },
            plotOptions: {
              bar: {
                columnWidth: "50%",
                colors: {
                  backgroundBarOpacity: 0.5,
                },
              },
            },
            markers: {
              size: 0,
            },
            xaxis: {
              type: "category",
              categories: dataToChart.date.reverse(),
              labels: {
                show: true,
                rotate: -45,
                rotateAlways: false,
                hideOverlappingLabels: true,
              },
            },
            yaxis: [
              {
                seriesName: "Najwyzsza",
                max: scaleMax,
                min: scaleMin,
                forceNiceScale: false,
                title: {
                  text: "Cena",
                },
              },
              {
                seriesName: "Najwyzsza",
                max: scaleMax,
                min: scaleMin,
                forceNiceScale: false,
                show: false,
              },
              {
                seriesName: "Najwyzsza",
                max: scaleMax,
                min: scaleMin,
                forceNiceScale: false,
                show: false,
              },
              {
                seriesName: "Najwyzsza",
                max: scaleMax,
                min: scaleMin,
                forceNiceScale: false,
                show: false,
              },
              {
                seriesName: "Najwyzsza",
                max: scaleMax,
                min: scaleMin,
                forceNiceScale: false,
                show: false,
              },
              {
                opposite: true,
                seriesName: "Stan",
                max: Math.max.apply(Math, dataToChart.stock) * 1.1,
                min: Math.min.apply(Math, dataToChart.volume) * 0.9,
                forceNiceScale: true,
                title: {
                  text: "Ilosc",
                },
              },
              {
                opposite: true,
                seriesName: "Stan",
                max: Math.max.apply(Math, dataToChart.stock) * 1.1,
                min: Math.min.apply(Math, dataToChart.volume) * 0.9,
                forceNiceScale: true,
                show: false,
              },
            ],
            tooltip: {
              shared: true,
              intersect: false,
              y: {
                formatter: function (y) {
                  if (typeof y !== "null") {
                    return y;
                  }
                  return "0";
                },
              },
            },
            legend: {
              position: "right",
              horizontalAlign: "center",
              floating: false,
              offsetX: 0,
              offsetY: 20,
              markers: {
                width: 12,
                height: 12,
                radius: 12,
              },
              labels: {
                useSeriesColors: false,
              },
            },
          };
          if (counter == 0) {
            var chart = new ApexCharts(
              document.getElementById("chart"),
              options
            );
            chart.render();
            counter = counter + 1;
            resolve();
          } else {
            ApexCharts.exec("productHistoryChart", "updateOptions", options);
            resolve();
          }
          if (request.status == 401) {
            console.log("Unauthorized");
            reject();
          }
        }
      };
      request.send();
    });
  }

  function format(d) {
    const arr = d.asks;
    const sourceMap = {
      "price list": "Cennik",
      "online offer": "E-hurt",
      wms: "PC-Market",
    };

    const promotionMap = {
      "rigid bundle": {
        name: "Sztywny pakiet",
        description: "Pakiet ze stałymi progami promocyjnymi",
      },
      worth: {
        name: "Łączna wartość",
        description: "Promocja od sumy wartości produktów",
      },
      quantity: {
        name: "Łączna ilość",
        description: "Promocja od sumy ilości produktów",
      },
      "package mix": {
        name: "Mix opakowań",
        description: "Promocja od sumy ilości różnych opakowań",
      },
      "quantity bundle": {
        name: "Pakietowa",
        description: "Promocja przy zakupie pakietu określonych ilości",
      },
      "not cumulative quantity": {
        name: "Mix ilość",
        description:
          "Przy określonej ilości, wszystkie produkty w promocji tanieją.",
      },
      // Add more as needed
    };

    function calculatePackage(promotion) {
      if (!promotion || !promotion.factors) return "-";
      const { type, factors } = promotion;
      const { quantityFactor, consolidationSet } = factors;

      if (!quantityFactor) return "-";

      if (type === "package mix") {
        return Math.round((1 / quantityFactor) * (consolidationSet || 1));
      }

      return "-";
    }

    function getBenefitTextAndIcons(types) {
      const iconMap = {
        discount:
          "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/66adf79f42f794589e8672c6_discount.svg",
        gratis:
          "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/66adf79fdb314702dd02c146_gratis.svg",
        "self-discount":
          "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/66adf79f4b8335a91b6fc74a_self-discount.svg",
        "self-gratis":
          "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/66adf79fcb35781959d04e2e_self-gratis.svg",
      };

      const benefitTexts = {
        discount:
          "W ramach tej promocji otrzymasz inne produkty w obniżonej cenie.",
        gratis: "W ramach tej promocji otrzymasz inne produkty gratis.",
        "self-discount":
          "W ramach tej promocji otrzymasz ten produkt w obniżonej cenie.",
        "self-gratis": "W ramach tej promocji otrzymasz ten produkt gratis.",
      };

      if (Array.isArray(types)) {
        return types.map((type) => {
          const icon = iconMap[type] || "";
          const text = benefitTexts[type] || "Brak informacji o promocji";
          return { icon, text };
        });
      } else {
        const icon = iconMap[types] || "";
        const text = benefitTexts[types] || "Brak informacji o promocji";
        return [{ icon, text }];
      }
    }

    function getBenefitDetails(benefit) {
      if (!benefit) return "-";
      const benefits = getBenefitTextAndIcons(benefit.type);
      let details = benefits
        .map(
          ({ icon, text }) =>
            `<img src="${icon}" alt="${text}" class="tippy" data-tippy-content="${text}"/>`
        )
        .join(" ");
      if (benefit.gratis) {
        details += `: ${benefit.gratis.quantity}x za ${benefit.gratis.price} zł`;
      }
      return details;
    }

    const toDisplayHtml = arr
      .map((item) => {
        const promotion = promotionMap[item.promotion?.type];
        const promotionType = promotion ? promotion.name : "-";
        const promotionDescription = promotion
          ? promotion.description
          : "Brak promocji";

        const showRelated =
          item.promotion && item.promotion.relatedGtins.length > 0
            ? `<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/624017e4560dba7a9f97ae97_shortcut.svg" loading="lazy" class="showdata" data-content="${item.promotion.relatedGtins}" alt="">`
            : "-";

        const benefitHtml = getBenefitDetails(item.promotion?.benefit);

        return `<tr>
            <td>${item.wholesalerKey}</td>
            <td>${item.netPrice}</td>
             <td>${
               getCookie("sprytnyUserRole") === "admin"
                 ? item.netNetPrice ?? "-"
                 : "-"
             }</td>
            <td>${item.set ?? "-"}</td>
            <td>${sourceMap[item.source] || "-"}</td>
            <td>${item.originated ?? "-"}</td>
            <td>${item.stock ?? "-"}</td>
            ${
              promotion
                ? `<td class="tippy" data-tippy-content="${promotionDescription}">${promotionType}</td>`
                : "<td>-</td>"
            }
            <td>${item.promotion?.threshold ?? "-"}</td>
            <td>${item.promotion?.cap ?? "-"}</td>
            <td>${calculatePackage(item.promotion)}</td>
            <td>${benefitHtml}</td>
            <td>${showRelated}</td>    
        </tr>`;
      })
      .join("");

    return `
        <table>
            <tr><th>Dostawca</th><th>Cena net</th><th>Cena netnet</th><th>Paczka</th><th>Źródło</th><th>Pochodzenie</th><th>Dostępność</th><th>Promocja</th><th>Próg</th><th>Max</th><th>Opakowanie</th><th>Bonus</th><th>Powiązane</th></tr>
            ${toDisplayHtml}
        </table>
    `;
  }

  // Domyślne opcje dla lengthMenu
  var lengthMenuOptions = [
    [25, 50, 100], // Backendowe wartości
    [25, 50, 100], // Wyświetlane etykiety
  ];

  // Jeśli organizacja to PSS-Podwawelska, dodaj opcję 5000
  if (OrganizationName === "PSS-Podwawelska") {
    lengthMenuOptions[0].push(5000); // Dodaj wartość backendową
    lengthMenuOptions[1].push("5000"); // Dodaj wyświetlaną etykietę
  }

  var table = $("#table_id").DataTable({
    pagingType: "full_numbers",
    lengthMenu: lengthMenuOptions,
    order: [],
    dom: '<"top"fB>rt<"bottom"lip>',
    buttons: [
      {
        text: '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/65e83b4c6d4d7190c5f268b9_expand-all.svg" alt="expand-all">',
        titleAttr: "Rozwiń wszystkie",
        action: function (e, dt, node, config) {
          dt.rows().every(function () {
            var row = this;
            if (!row.child.isShown()) {
              row.child(format(row.data())).show();
              $(row.node()).addClass("shown");
            }
          });
        },
      },
      {
        text: '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/65e83bae9eb38d00e79cb7d9_collapse-all.svg" alt="collapse-all">',
        titleAttr: "Zwiń wszystkie",
        action: function (e, dt, node, config) {
          dt.rows().every(function () {
            var row = this;
            if (row.child.isShown()) {
              row.child.hide();
              $(row.node()).removeClass("shown");
            }
          });
        },
      },
      {
        extend: "copyHtml5",
        text: '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6234df44ecd49d3c56c47ea6_copy.svg" alt="copy">',
        titleAttr: "Copy",
      },
      {
        extend: "excelHtml5",
        text: '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6234df3f287c53243b955790_spreadsheet.svg" alt="spreadsheet">',
        titleAttr: "Excel",
      },
      // ,
      // {
      //   extend: "pdfHtml5",
      //   text: '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg" alt="pdf">',
      //   titleAttr: "PDF",
      // },
    ],
    scrollY: "60vh",
    scrollCollapse: true,
    pageLength: 25,
    language: {
      emptyTable: "Brak danych do wyswietlenia",
      info: "Pokazuje _START_ - _END_ z _TOTAL_ rezultatow",
      infoEmpty: "Brak danych",
      infoFiltered: "(z _MAX_ rezultatow)",
      lengthMenu: "Pokaz _MENU_ rezulatow",
      search: "Szukaj:",
      zeroRecords: "Brak pasujacych rezultatow",
      paginate: {
        first: "<<",
        last: ">>",
        next: " >",
        previous: "< ",
      },
    },
    ajax: function (data, callback, settings) {
      var QStr =
        "?perPage=" +
        data.length +
        "&page=" +
        (data.start + data.length) / data.length;
      let searchBox = data.search.value.trim(); // This will remove whitespace from both ends
      if (/^\d+$/.test(searchBox)) {
        QStr = QStr + "&gtin=" + encodeURIComponent(searchBox);
      } else if (searchBox) {
        QStr = QStr + "&name=like:" + encodeURIComponent(searchBox);
      } else {
      }
      var rotIndi = $("#rotationIndicator")
        .map(function () {
          return this.value;
        })
        .get();
      var rotIndiStr = rotIndi.toString();
      if (rotIndiStr) {
        QStr = QStr + "&rotationIndicator=" + rotIndiStr;
      }

      var whKeyIndi = $("#wholesalerKeyIndicator")
        .map(function () {
          return this.value;
        })
        .get();
      var whKeyIndiStr = whKeyIndi.toString();

      var cdKeyIndi = $("#countryDistributorName")
        .map(function () {
          return this.value;
        })
        .get();
      var cdKeyIndiStr = cdKeyIndi.toString();
      if (cdKeyIndiStr) {
        QStr = QStr + "&countryDistributorTaxId=" + cdKeyIndiStr;
      }

      $(document).on("click", 'input[type="checkbox"]', function () {
        $('input[type="checkbox"]').not(this).prop("checked", false);
      });

      if (whKeyIndiStr) {
        QStr = QStr + "&wholesalerKey=" + whKeyIndiStr;
        if ($("#best").is(":checked")) {
          QStr = QStr + ":best";
        }
        if ($("#exclusive").is(":checked")) {
          QStr = QStr + ":exclusive";
        }
      }
      var PRmin = parseInt($("#PRmin").val(), 10);
      var PRmax = parseInt($("#PRmax").val(), 10);
      var PEmin = parseInt($("#PEmin").val(), 10);
      var PEmax = parseInt($("#PEmax").val(), 10);
      var iSmin = parseInt($("#iSmin").val(), 10);
      var iSmax = parseInt($("#iSmax").val(), 10);

      function cVal(x) {
        if (typeof x == "number" && !isNaN(x)) {
          return true;
        } else {
          return false;
        }
      }
      if (cVal(PRmin)) {
        QStr = QStr + "&marketPremium=gt:" + PRmin;
      }
      if (cVal(PRmax)) {
        QStr = QStr + "&marketPremium=lt:" + PRmax;
      }
      if (cVal(PEmin)) {
        QStr = QStr + "&standardPremium=gt:" + PEmin;
      }
      if (cVal(PEmax)) {
        QStr = QStr + "&standardPremium=lt:" + PEmax;
      }
      if (cVal(iSmin)) {
        QStr = QStr + "&stock=gt:" + iSmin;
      }
      if (cVal(iSmax)) {
        QStr = QStr + "&stock=lt:" + iSmax;
      }

      var whichColumns = "";
      var direction = "desc";

      if (data.order.length == 0) {
        whichColumns = 0;
      } else {
        whichColumns = data.order[0]["column"];
        direction = data.order[0]["dir"];
      }

      switch (whichColumns) {
        case 2:
          whichColumns = "name:";
          break;
        case 5:
          whichColumns = "stock:";
          break;
        case 6:
          whichColumns = "marketPremium:";
          break;
        case 7:
          whichColumns = "standardPremium:";
          break;
        case 8:
          whichColumns = "standardPrice:";
          break;
        case 10:
          whichColumns = "bestNetPrice:";
          break;
        case 12:
          whichColumns = "rotationIndicator:";
          break;
        default:
          whichColumns = "null";
      }

      var sort = "&sort=" + whichColumns + direction;
      if (whichColumns != "null") {
        QStr = QStr + sort;
      }

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
      const now = Date.now();
      if (now - lastOfferFetchTimestamp >= MIN_FETCH_INTERVAL_MS) {
        lastOfferFetchTimestamp = now;
        $.get(
          InvokeURL + "shops/" + shopKey + "/offers/" + offerId + QStr,
          function (res) {
            // Ustawienie daty oferty
            if (res.offerDate) {
              const formattedDate = new Date(res.offerDate).toLocaleString(
                "pl-PL"
              );
              $("#offerDate").text("Data oferty: " + formattedDate);
              $("#offerDate2").text("Data oferty: " + formattedDate);
            } else {
              $("#offerDate").text("Data oferty: brak danych");
              $("#offerDate2").text("Data oferty: brak danych");
            }

            if (isToday(res.offerDate)) {
              if (!offerStatusLoaded) {
                offerStatusLoaded = true;
                getOfferStatus();
              }

              $("#offerCondition").show();
              $("#seeRightPanel").show();
              $("#offerDate2").show();
            } else {
              $("#offerCondition").hide();
              $(".seeRightPanel").hide();
              $("#offerDate2").show();
            }

            callback({
              recordsTotal: res.total,
              recordsFiltered: res.total,
              data: res.items,
            });
          }
        );
      }
    },
    processing: false,
    serverSide: true,
    search: {
      return: true,
    },
    columns: [
      {
        data: null,
        orderable: false,
        defaultContent: "",
        width: "20px",
        createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
          if (rowData.asks && rowData.asks.length > 0) {
            $(cell).addClass("details-control");
          }
        },
        orderable: false,
      },
      {
        orderable: false,
        class: "details-control2",
        width: "20px",
        data: null,
        defaultContent:
          "<img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6240120504eebc8de2698a1f_panel.svg' alt='details'></img>",
      },
      {
        orderable: true,
        data: "name",
      },
      {
        orderable: false,
        data: "countryDistributorName",
        defaultContent: "-",
      },
      {
        orderable: false,
        data: "gtin",
      },
      {
        orderable: true,
        data: "stock",
        render: function (data) {
          if (data !== null) {
            return "" + data.value;
          }
          if (data === null) {
            return "-";
          }
        },
      },
      {
        orderable: true,
        data: "marketPremium",
        render: function (data) {
          if (data !== null) {
            return "" + data;
          }
          if (data === null) {
            return "-";
          }
        },
      },
      {
        orderable: true,
        data: "standardPrice",
        render: function (data) {
          if (
            data !== null &&
            data.hasOwnProperty("premium") &&
            data.premium !== null
          ) {
            if (data.premium >= 0) {
              return '<p class="positive">' + data.premium + "</p>";
            } else {
              return '<p class="negative">' + data.premium + "</p>";
            }
          } else {
            return "-";
          }
        },
      },
      {
        orderable: true,
        data: "standardPrice",
        render: function (data) {
          if (data !== null) {
            return "" + data.value.toFixed(2);
          }
          if (data === null) {
            return "-";
          }
        },
      },
      {
        //Tutaj beda promocje jako obrazki renderowane
        orderable: false,
        data: "asks",
        render: function (data) {
          if (data !== null && data.length > 0 && data.netPrice !== null) {
            var mysorteddata = data.sort(
              (a, b) => (a.netPrice > b.netPrice && 1) || -1
            );
            var size = Object.keys(mysorteddata).length;
            if (size > 0) {
              var bestOffer = data[0];
              if (bestOffer.promotion != null) {
                return '<td><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6186eb480941cdf5b47f9d4e_star.svg"></td>';
              }
              return "-";
            }
            return "-";
          }
          return "-";
        },
      },
      {
        orderable: true,
        data: "asks",
        render: function (data) {
          if (data !== null) {
            var mysorteddata = data.sort(
              (a, b) => (a.netPrice > b.netPrice && 1) || -1
            );
            var size = Object.keys(mysorteddata).length;
            if (size > 0) {
              var bestOffer = data[0];
              return "" + bestOffer.netPrice;
            }
            return "-";
          }
          return "-";
        },
      },
      {
        orderable: false,
        data: "asks",
        defaultContent: "brak",
        render: function (data) {
          if (data !== null && data.length > 0 && data.netPrice !== null) {
            var mysorteddata = data.sort(
              (a, b) => (a.netPrice > b.netPrice && 1) || -1
            );
            var size = Object.keys(mysorteddata).length;
            var bestPrice = data[0].netPrice;
            var bestWh = [];
            bestWh.push(data[0].wholesalerKey);
            if (size > 1) {
              for (let i in data) {
                if (data[parseInt(i)].netPrice == bestPrice) {
                  bestWh.push(data[parseInt(i)].wholesalerKey);
                }
              }
            }
            let uniqueWh = [...new Set(bestWh)];
            return "" + uniqueWh.toString();
          }
          return "-";
        },
      },
      {
        orderable: true,
        data: "rotationIndicator",
        defaultContent: "brak",
        render: function (data) {
          var tippyContent;
          var baseClass = "tippy";

          switch (data) {
            case "AX":
              tippyContent =
                ' class="super ' +
                baseClass +
                '" data-tippy-content="Grupa A (80% marży) i X (stała sprzedaż)" alt=""';
              break;
            case "AY":
              tippyContent =
                ' class="positive ' +
                baseClass +
                '" data-tippy-content="Grupa A (80% marży) i Y (zmienna sprzedaż)" alt=""';
              break;
            case "BX":
              tippyContent =
                ' class="positive ' +
                baseClass +
                '" data-tippy-content="Grupa B (15% marży) i X (stała sprzedaż)" alt=""';
              break;
            case "AZ":
              tippyContent =
                ' class="medium ' +
                baseClass +
                '" data-tippy-content="Grupa A (80% marży) i Z (nieregularna sprzedaż)" alt=""';
              break;
            case "CX":
              tippyContent =
                ' class="medium ' +
                baseClass +
                '" data-tippy-content="Grupa C (5% marży) i X (stała sprzedaż)" alt=""';
              break;
            case "BY":
              tippyContent =
                ' class="medium ' +
                baseClass +
                '" data-tippy-content="Grupa B (15% marży) i Y (zmienna sprzedaż)" alt=""';
              break;
            case "BZ":
              tippyContent =
                ' class="negative ' +
                baseClass +
                '" data-tippy-content="Grupa B (15% marży) i Z (nieregularna sprzedaż)" alt=""';
              break;
            case "CY":
              tippyContent =
                ' class="negative ' +
                baseClass +
                '" data-tippy-content="Grupa C (5% marży) i Y (zmienna sprzedaż)" alt=""';
              break;
            case "CZ":
              tippyContent =
                ' class="bad ' +
                baseClass +
                '" data-tippy-content="Grupa C (5% marży) i Z (nieregularna sprzedaż)" alt=""';
              break;
            default:
              tippyContent =
                ' class="noneexisting ' +
                baseClass +
                '" data-tippy-content="Niewystarczająca historia" alt=""';
          }

          return "<p" + tippyContent + ">" + (data || "-") + "</p>";
        },
      },
      {
        orderable: false,
        class: "details-control3",
        width: "20px",
        data: null,
        defaultContent:
          "<img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64a0fe50a9833a36d21f1669_edit.svg' alt='details'></img>",
      },
    ],
    initComplete: function (settings, json) {
      var api = this.api();
      var textBox = $("#table_id_filter label input");

      $(".filterinput").on("change", function () {
        table.draw();
        checkFilters();
      });

      textBox.unbind();
      textBox.bind("keyup input", function (e) {
        if (e.keyCode == 13) {
          api.search(this.value).draw();
          checkFilters();
        }
      });

      $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();

      $("table.dataTable").on("show", function () {
        $(this).DataTable().columns.adjust();
      });

      // Check filters initially
      checkFilters();

      // Clear all filters
      $("#ClearAllButton").on("click", function () {
        // Reset search field
        $("#table_id_filter input[type='search']").val("");

        // Reset all input fields
        $(".filterinput").each(function () {
          if (this.type === "text" || this.type === "number") {
            $(this).val("");
          } else if (this.type === "checkbox") {
            $(this).prop("checked", false);
          } else if (this.tagName.toLowerCase() === "select") {
            $(this).prop("selectedIndex", 0);
          }
        });

        // Clear the internal DataTable search state
        table.state.clear();

        // Disable the draw callback temporarily to prevent multiple requests
        table.off("preXhr.dt");

        // Combine search clearing and data reload into a single operation
        table.search("").ajax.reload(function () {
          // Re-enable the draw callback after reload
          table.on("preXhr.dt", function (e, settings, data) {
            // Add custom logic to modify data object here if necessary
          });
          checkFilters(); // Re-check filters after clearing
        }, false);
      });

      function checkFilters() {
        var searchValue = api.search();
        var anyFilterActive =
          searchValue !== "" ||
          $(".filterinput").filter(function () {
            return this.value !== "";
          }).length > 2; // Two checkboxes are allways active

        if (anyFilterActive) {
          $("#ClearAllButton").show();
        } else {
          $("#ClearAllButton").hide();
        }
      }
    },
  });

  function clearProductPopupData() {
    // Set the content of specified elements to "-"
    $("#pEan").text("-");
    $("#pHistory").text("-");
    $("#pHistorySpan").text("-");
    $("#pOfferDate").text("-");
    $("#pRetailPrice").text("-");
    $("#pStandardPrice").text("-");
    $("#pBestPrice").text("-");
    $("#pInStock").text("-");
    $("#pStockDays").text("-");
    $("#pSales7").text("-");
    $("#pSales90").text("-");
    $("#pIndicator").text("-");
  }

  $("#table_id tbody").on("click", "td.details-control", function () {
    var tr = $(this).closest("tr");
    var row = table.row(tr);
    if (row.child.isShown()) {
      row.child.hide();
      tr.removeClass("shown");
    } else {
      row.child(format(row.data())).show();
      tr.addClass("shown");
      initializeSimpleTooltips();
    }
  });

  $("#table_id tbody").on("click", "img.showdata", function () {
    const popupContainer = document.getElementById("ReleatedProducts");
    const popupContent = document.getElementById("popupContent");
    const input = $(this).attr("data-content");
    const values = input.split(",");
    let output = "";

    for (let i = 0; i < values.length; i++) {
      if (i % 5 === 0) output += "<p class='text-size-tiny text-color-grey'>";

      const trimmedCode = values[i].trim();
      output += `<span class="related-product-code" style="text-decoration: underline; cursor: pointer; margin-right: 6px;" data-code="${trimmedCode}">${trimmedCode}</span>`;

      if ((i + 1) % 5 === 0 || i === values.length - 1) output += "</p>";
    }

    popupContent.innerHTML = output;
    popupContainer.style.display = "flex";

    // Dodanie nasłuchu do każdego <span>
    popupContent.querySelectorAll(".related-product-code").forEach((el) => {
      el.addEventListener("click", function () {
        const code = this.getAttribute("data-code");
        const table = $("#table_id").DataTable();
        table.search(code).draw();
        popupContainer.style.display = "none";
      });
    });
  });

  // Close the popup when clicking outside of the popup content
  $(window).on("click", function (event) {
    var popupContainer = document.getElementById("ReleatedProducts");
    if (event.target == popupContainer) {
      popupContainer.style.display = "none";
    }
  });

  $("#table_id tbody").on("click", "td.details-control2", function () {
    var table = $("#table_id").DataTable();
    var tr = $(this).closest("tr");
    var rowData = table.row(tr).data();

    // Pokaż loader
    $("#ProductCard").hide();
    $("#waitingdots").show(); // Zakładamy, że masz element z id="loader"

    Promise.all([getProductDetails(rowData), getProductHistory(rowData)])
      .then(() => {
        $("#waitingdots").hide();
        $("#ProductCard").css("display", "flex");
      })
      .catch((err) => {
        console.log("Błąd ładowania danych:", err);
        $("#waitingdots").hide();
        alert("Nie udało się załadować danych.");
      });
  });

  $("#table_id tbody").on("click", "td.details-control3", function () {
    var tr = $(this).closest("tr");
    var rowData = table.row(tr).data();
    console.log(rowData);
    var GTINEdit = document.getElementById("gtin");
    GTINEdit.value = rowData.gtin;
    GTINEdit.disabled = true;
    var NameInput = document.getElementById("new-name");
    NameInput.value = rowData.name;
    NameInput.textContent = rowData.name;
    $("#ProposeChangeInGtinModal").css("display", "flex");
  });

  function getWholesalersSh() {
    let url = new URL(InvokeURL + "wholesalers" + "?enabled=true&perPage=1000");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      if (request.status >= 200 && request.status < 400) {
        const wholesalerContainer = document.getElementById(
          "wholesalerKeyIndicator"
        );
        toParse.forEach((wholesaler) => {
          if (wholesaler.enabled) {
            var opt = document.createElement("option");
            opt.value = wholesaler.wholesalerKey;
            opt.innerHTML = wholesaler.wholesalerKey;
            wholesalerContainer.appendChild(opt);
          }
        });
        if (request.status == 401) {
          console.log("Unauthorized");
        }
      }
    };
    request.send();
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

  getWholesalersSh();
  initOfferStatusTable();
  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));

  makeWebflowFormAjaxCreate = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var organization = sessionStorage.getItem("OrganizationName");
        var organizationId = sessionStorage.getItem("OrganizationclientId");
        var oldname = document.getElementById("new-name");

        var data = {
          organization: organization,
          organizationId: organizationId,
          data: {
            gtin: $("#gtin").val(),
            "old-name": oldname.textContent,
            "new-name": $("#new-name").val(),
            countryDistributorName: $("#countryDistributorName").val(),
            brand: $("#brand").val(),
            measurement: $("#measurement").val(),
            quantity: $("#quantity").val(),
          },
        };

        $.ajax({
          type: "POST",
          url: "https://hook.eu1.make.com/ndsdd602ot8kbt2dpydw37coj015fy75",
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
                form.trigger("reset");
                return;
              }
            }
            form.show();
            displayMessage(
              "Success",
              "Twoje zgłoszenie została przyjęte. Dziękujemy."
            );
            form.trigger("reset");
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
            form.trigger("reset");
          },
        });
        event.preventDefault();
        form.trigger("reset");
        return false;
      });
    });
  };

  makeWebflowFormAjaxCreate($("#wf-form-ProposeChangeInGtin"));

  $("table.dataTable").on("init.dt xhr.dt", function () {
    $(this).DataTable().columns.adjust();
    initializeSimpleTooltips();
  });

  $("table.dataTable").on("page.dt", function () {
    $(this).DataTable().draw(false);
  });

  $('div[role="tab"]').click(function () {
    if ($.fn.dataTable) {
      const delays = [1, 49, 151, 901];

      delays.forEach((delay) => {
        setTimeout(() => {
          $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
        }, delay);
      });
    }
  });

  $("#seeRightPanel").on("click", function () {
    if ($.fn.dataTable) {
      const delays = [50, 200, 500]; // możesz zmodyfikować w razie potrzeby

      delays.forEach((delay) => {
        setTimeout(() => {
          $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
        }, delay);
      });
    }
  });

  $(document).ready(function ($) {
    $("tableSelector").DataTable({
      dom: '<"pull-left"f><"pull-right"l>tip',
    });
    $(".dataTables_filter input").attr("maxLength", 60);
  });
});
