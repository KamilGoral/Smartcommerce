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
  var deliveryName = new URL(location.href).searchParams.get("deliveryName");
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
  function loadDeliveryDetails() {
    $.ajax({
      type: "GET",
      url:
        InvokeURL +
        "van/transactions?type=RECADV&shopKey=" +
        shopKey +
        "&perPage=500",
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
      success: function (response) {
        // Znajdź dokument o odpowiednim UUID
        const data = (response.items || []).find(
          (item) => item.uuid === recadvId,
        );

        if (!data) {
          console.warn("Nie znaleziono dokumentu o UUID:", recadvId);
          return;
        }

        // Tytuł dokumentu
        const deliveryTitle = document.getElementById("DeliveryIdBig");
        if (deliveryTitle && data.name) {
          deliveryTitle.textContent = data.name;
        }

        // Dostawca
        const wholesalerName = document.getElementById("wholesalerName");
        if (wholesalerName && data.wholesalerKey) {
          const formatted =
            data.wholesalerKey.charAt(0).toUpperCase() +
            data.wholesalerKey.slice(1).replace(/-/g, " ");
          wholesalerName.textContent = formatted;
        }

        // Plik źródłowy
        const sourceFile = document.getElementById("sourceFile");
        if (sourceFile && data.sourceFile && data.sourceFile.name) {
          sourceFile.innerHTML = `<strong>${escapeHtml(data.sourceFile.name)}</strong>`;
        }

        // Data utworzenia
        const createdAtBy = document.getElementById("createdAtBy");
        if (createdAtBy && data.created && data.created.at) {
          const date = new Date(data.created.at).toLocaleString("pl-PL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
          const by = data.created.by ? ` przez ${data.created.by}` : "";
          createdAtBy.innerHTML = `<strong>${date}${by}</strong>`;
        }

        // Data modyfikacji
        const modifiedAtBy = document.getElementById("modifiedAtBy");
        if (modifiedAtBy && data.modified && data.modified.at) {
          const date = new Date(data.modified.at).toLocaleString("pl-PL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
          const by = data.modified.by ? ` przez ${data.modified.by}` : "";
          modifiedAtBy.innerHTML = `<strong>${date}${by}</strong>`;
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
    // Liczba produktów
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
    const hasLinked = linked.length > 0;

    const hasProposals = safeArr(rec?.potentialMatches).length > 0;
    const isValid = rec?.valid === true;

    if (!isValid) {
      return {
        key: "invalid",
        label: "Błędna",
        badge: "badge badge--danger",
        sort: 90,
      };
    }

    if (!hasLinked) {
      if (hasProposals) {
        return {
          key: "proposal",
          label: "Propozycja",
          badge: "badge badge--info",
          sort: 20,
        };
      }
      return {
        key: "unmatched",
        label: "Niedopasowano",
        badge: "badge badge--muted",
        sort: 10,
      };
    }

    // linked state + diffs
    const orderedQty = linked.reduce((acc, p) => acc + sumQty(p?.segments), 0);
    const orderedPrice = avgPriceWeighted(linked?.[0]?.segments); // jak na screenie: pierwszy dokument
    const qtyDiff = deliveredQty - orderedQty;

    const deliveredValue =
      deliveredPrice === null ? 0 : deliveredQty * deliveredPrice;
    const orderedValue = orderedPrice === null ? 0 : orderedQty * orderedPrice;
    const valueDiff = deliveredValue - orderedValue;

    const qtyDiffNonZero = Math.abs(qtyDiff) > 0;
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

  function diffSpanNumber(n, italic = false) {
    const v = Number(n);
    if (!Number.isFinite(v))
      return `<span class="${italic ? "muted italic" : "muted"}">-</span>`;
    if (v === 0)
      return `<span class="${italic ? "zero italic" : "zero"}">0</span>`;

    const sign = v > 0 ? "+" : "";
    if (v > 0) {
      const style = italic
        ? "color: #d97706; font-style: italic;"
        : "color: #d97706;";
      return `<span style="${style}">${sign}${v}</span>`;
    } else {
      const cls = italic ? "neg italic" : "neg";
      return `<span class="${cls}">${sign}${v}</span>`;
    }
  }

  function diffSpanMoney(n, italic = false) {
    const v = Number(n);
    if (!Number.isFinite(v))
      return `<span class="${italic ? "muted italic" : "muted"}">-</span>`;
    if (Math.abs(v) < 0.000001)
      return `<span class="${italic ? "zero italic" : "zero"}">${fmtPLN(0)}</span>`;

    const sign = v > 0 ? "+" : "";
    if (v > 0) {
      const style = italic
        ? "color: #d97706; font-style: italic;"
        : "color: #d97706;";
      return `<span style="${style}">${sign}${fmtPLN(Math.abs(v))}</span>`;
    } else {
      const cls = italic ? "neg italic" : "neg";
      return `<span class="${cls}">${sign}${fmtPLN(Math.abs(v))}</span>`;
    }
  }

  // ---------- child row render (warianty/propozycje) ----------
  function renderChildProposals(parent) {
    const proposals = safeArr(parent?.potentialMatches);
    if (proposals.length <= 1) return ""; // nic do rozwijania

    const deliveredQty = sumQty(parent?.segments);
    const deliveredPrice = avgPriceWeighted(parent?.segments);

    const parentName = escapeHtml(parent?.name || "");
    const parentGtin = escapeHtml(parent?.gtin || "");

    // Pomiń pierwszą propozycję (Wariant 1 jest już wyświetlony w głównym wierszu)
    // Renderuj tylko pozostałe warianty, numerując od 1
    const rows = proposals.slice(1).map((m, idx) => {
      const orderedQty = sumQty(m?.segments);
      const orderedPrice = avgPriceWeighted(m?.segments);
      const qtyDiff = orderedQty > 0 ? deliveredQty - orderedQty : 0;

      const deliveredValue =
        deliveredPrice === null ? 0 : deliveredQty * deliveredPrice;
      const orderedValue =
        orderedPrice === null ? 0 : orderedQty * orderedPrice;
      const valueDiff = orderedQty > 0 ? deliveredValue - orderedValue : 0;

      const orderId = m?.orderId || "";
      const matchId = m?.id;

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
        <td class="text-right" style="padding: 8px; color: #9ca3af;">-</td>

        <td class="text-right" style="padding: 8px; font-style: italic;">${fmtQty(orderedQty)}</td>
        <td class="text-right" style="padding: 8px; font-style: italic;">${orderedPrice !== null ? fmtPLN(orderedPrice) : "-"}</td>

        <td class="text-right" style="padding: 8px;">${orderedQty > 0 ? diffSpanNumber(qtyDiff, true) : `<span style="color: #9ca3af; font-style: italic;">-</span>`}</td>
        <td class="text-right" style="padding: 8px;">${orderedQty > 0 ? diffSpanMoney(valueDiff, true) : `<span style="color: #9ca3af; font-style: italic;">-</span>`}</td>

        <td style="padding: 8px; font-style: italic;">
          ${
            orderId
              ? `<div style="font-style: italic;">${formatOrderDisplay(orderId)}</div>`
              : `<span style="color: #9ca3af; font-style: italic;">-</span>`
          }
        </td>

        <td style="padding: 8px;">
          <span class="badge badge--info">Propozycja</span>
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

  function renderOrderDropdown(containerId, orderIds) {
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
      dropdownWrapper.className = "order-dropdown-wrapper";
      dropdownWrapper.style.marginLeft = "auto";
      dropdownWrapper.style.display = "flex";
      dropdownWrapper.style.alignItems = "center";
      container.appendChild(dropdownWrapper);
    }

    // Formatuj opcje z nazwą i datą zamówienia
    const options = orderIds
      .map((orderId) => {
        const details = orderDetailsCache[orderId];
        let displayText = orderId; // fallback to ID

        if (details) {
          if (details.name) {
            // Format: "DD.MM.YYYY - Nazwa zamówienia"
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
              ? `${dateStr} - ${details.name}`
              : details.name;
          } else {
            // Jeśli nie ma nazwy, pokaż skrócone ID
            displayText = `...${orderId.slice(-8)}`;
          }
        }

        return `<option value="${escapeHtml(orderId)}">${escapeHtml(displayText)}</option>`;
      })
      .join("");

    dropdownWrapper.innerHTML = `
      <select id="order-filter-select" style="padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; min-width: 300px; cursor: pointer; background: white;">
        <option value="">Wszystkie zamówienia</option>
        ${options}
      </select>
    `;
  }

  function applyOrderFilter(table, orderId) {
    // Usuń poprzedni filtr zamówienia jeśli istnieje
    if (currentOrderFilterFn) {
      const idx = $.fn.dataTable.ext.search.indexOf(currentOrderFilterFn);
      if (idx > -1) {
        $.fn.dataTable.ext.search.splice(idx, 1);
      }
    }

    if (orderId) {
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

        return hasLinkedOrder || hasProposalOrder;
      };

      $.fn.dataTable.ext.search.push(currentOrderFilterFn);
    } else {
      currentOrderFilterFn = null;
    }

    table.draw();
  }

  function initOrderFilterEvents(table, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.addEventListener("change", function (e) {
      if (e.target.id === "order-filter-select") {
        const orderId = e.target.value;
        applyOrderFilter(table, orderId);
      }
    });
  }

  // ---------- Days Filter (Order Search Range) ----------
  function renderDaysFilter(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container #${containerId} not found`);
      return;
    }

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; color: #374151;">Szukaj w zamówieniach z ostatnich</span>
          <select id="orderingDays" style="padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; cursor: pointer; background: white;">
            <option value="3">3</option>
            <option value="7" selected>7</option>
            <option value="14">14</option>
          </select>
          <span style="font-size: 14px; color: #374151;">dni</span>
        </div>
        <button id="details-toggle-btn" type="button" class="status-filter-btn" style="display: inline-flex; align-items: center; gap: 6px;">
          <span class="filter-label">Szczegóły</span>
          <svg id="details-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" style="transition: transform 0.2s;">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;
  }

  function initDaysFilterEvents(table, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.addEventListener("change", function (e) {
      if (e.target.id === "orderingDays") {
        // Odśwież tabelę z nowymi danymi
        table.ajax.reload();
      }
    });
  }

  // ---------- Details Toggle (Szczegóły dokumentu) ----------
  function initDetailsToggleEvents() {
    const toggleBtn = document.getElementById("details-toggle-btn");
    const chevron = document.getElementById("details-chevron");
    const detailsContainer = document.querySelector(".deliverydetails");

    if (!toggleBtn) {
      console.warn("Toggle button nie znaleziony");
      return;
    }

    if (!detailsContainer) {
      console.warn("Details container nie znaleziony (.deliverydetails)");
      return;
    }

    console.log("Toggle events initialized", { toggleBtn, detailsContainer });

    toggleBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Toggle clicked!", e);
      const isHidden = detailsContainer.classList.contains("nonedisplay");
      console.log("Is hidden:", isHidden);

      if (isHidden) {
        // Rozwiń szczegóły - ultra minimalistyczny styl
        detailsContainer.classList.remove("nonedisplay");
        detailsContainer.style.cssText = `
          padding: 12px 0px !important;
          margin-bottom: 8px !important;
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
          gap: 16px !important;
        `;
        chevron.style.transform = "rotate(180deg)";
        toggleBtn.classList.add("active");

        // Minimalna stylizacja - tylko to co konieczne
        const blocks = detailsContainer.querySelectorAll(".div-block-83");
        blocks.forEach((block) => {
          block.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 6px;
          `;

          const label = block.querySelector(".text-block-69");
          if (label) {
            label.style.cssText = `
              font-size: 12px;
              color: rgb(66, 82, 110);
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            `;
          }

          const value = block.querySelector("[id]");
          if (value) {
            value.style.cssText = `
              font-size: 14px;
              color: rgb(17, 24, 39);
              line-height: 1.5;
            `;
          }
        });
      } else {
        // Zwiń szczegóły
        detailsContainer.classList.add("nonedisplay");
        detailsContainer.style.cssText = "display: none !important;";
        chevron.style.transform = "rotate(0deg)";
        toggleBtn.classList.remove("active");
      }
    });
  }

  // ---------- Status Filter Configuration ----------
  const STATUS_FILTERS = [
    { key: "all", label: "Wszystkie produkty", badge: null },
    { key: "matched", label: "Dopasowane", badge: "badge--success" },
    { key: "proposal", label: "Propozycja", badge: "badge--info" },
    {
      key: "diff",
      label: "Rozbieżności",
      badge: "badge--warn",
      includes: ["diff_qty", "diff_value", "diff_both"],
    },
    { key: "unmatched", label: "Niedopasowane", badge: "badge--muted" },
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
        const counts = countByStatus(json.data);
        updateFilterCounters(counts);

        // Update order dropdown w tym samym kontenerze co filtry statusów
        const orderIds = getAllOrderIds(json.data);
        renderOrderDropdown(containerId, orderIds);
        initOrderFilterEvents(table, containerId);

        // Update statystyk na górze strony
        updateDeliveryStatistics(json.data);
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
    // 1. Aktualizuj liczniki
    const allData = deliveryTable.rows().data().toArray();
    const counts = countByStatus(allData);
    updateFilterCounters(counts);

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

    // 3) inicjalizacja (tu wklejasz swoje DataTable(...) praktycznie 1:1)
    deliveryTable = $("#table_delivery").DataTable({
      pagingType: "full_numbers",
      lengthMenu: [10, 25, 50, 100],
      pageLength: 25,
      order: [[9, "asc"]],
      dom: '<"top"fB>rt<"bottom"lip>',
      scrollY: "70vh",
      scrollCollapse: true,
      autoWidth: false,

      buttons: [
        {
          text: '<span class="dt-btn">Rozwiń</span>',
          titleAttr: "Rozwiń wszystkie (propozycje)",
          action: function (e, dt) {
            dt.rows().every(function () {
              const row = this;
              const data = row.data();
              const tr = $(row.node());
              const proposals = safeArr(data?.potentialMatches);
              if (proposals.length > 1 && !tr.hasClass("shown")) {
                const childRowsHtml = renderChildProposals(data);
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
        info: "Pokazuje _START_ - _END_ z _TOTAL_ pozycji",
        infoEmpty: "Brak danych",
        infoFiltered: "(z _MAX_ pozycji)",
        lengthMenu: "Pokaż _MENU_ pozycji",
        search: "Szukaj:",
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

        // Pobierz wartość dni z dropdownu
        const days = $("#orderingDays").val() || 7;

        $.get(
          InvokeURL +
            "van/recadvs/" +
            encodeURIComponent(recadvId) +
            "/products?perPage=1000&days=" +
            days,
          async function (res) {
            // Pobierz szczegóły zamówień przed wyświetleniem tabeli
            await prefetchOrderDetails(res.items);

            callback({
              recordsTotal: res.total,
              recordsFiltered: res.total,
              data: res.items,
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
            const proposals = safeArr(rowData?.potentialMatches);
            const linked = safeArr(rowData?.linkedOrderProducts);
            // Pokaż ikonę tylko gdy są propozycje (>1) i NIE jest jeszcze połączony
            if (proposals && proposals.length > 1 && linked.length === 0) {
              $(cell).addClass("details-control");
            }
          },
        },
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
        {
          data: "segments",
          orderable: true,
          className: "text-right",
          render: function (segments, type) {
            const q = sumQty(segments);
            if (type === "sort" || type === "type") return q;
            return q ? fmtQty(q) : `<span class="muted">-</span>`;
          },
        },
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
        // Kolumna 4 - Ilość zam.
        {
          data: null,
          orderable: true,
          className: "text-right",
          render: function (data, type, row) {
            const linked = safeArr(row?.linkedOrderProducts);
            const proposals = safeArr(row?.potentialMatches);

            let q = 0;
            let isProposal = false;

            if (linked.length) {
              q = linked.reduce((acc, p) => acc + sumQty(p?.segments), 0);
            } else if (proposals.length) {
              q = sumQty(proposals[0]?.segments);
              isProposal = true;
            } else {
              return `<span class="muted">-</span>`;
            }

            if (type === "sort" || type === "type") return q;
            return q
              ? `<span class="${isProposal ? "italic" : ""}">${fmtQty(q)}</span>`
              : `<span class="muted">-</span>`;
          },
        },

        // Kolumna 5 - Cena zam.
        {
          data: null,
          orderable: true,
          className: "text-right",
          render: function (data, type, row) {
            const linked = safeArr(row?.linkedOrderProducts);
            const proposals = safeArr(row?.potentialMatches);

            let p = null;
            let isProposal = false;

            if (linked.length) {
              p = avgPriceWeighted(linked[0]?.segments);
            } else if (proposals.length) {
              p = avgPriceWeighted(proposals[0]?.segments);
              isProposal = true;
            }

            if (p === null) return `<span class="muted">-</span>`;
            if (type === "sort" || type === "type") return p;
            return `<span class="${isProposal ? "italic" : ""}">${fmtPLN(p)}</span>`;
          },
        },

        // Kolumna 6 - Różnica il.
        {
          data: null,
          orderable: true,
          className: "text-right",
          render: function (data, type, row) {
            const linked = safeArr(row?.linkedOrderProducts);
            const proposals = safeArr(row?.potentialMatches);

            if (!linked.length && !proposals.length)
              return `<span class="muted">-</span>`;

            const deliveredQty = sumQty(row?.segments);
            let orderedQty = 0;
            let isProposal = false;

            if (linked.length) {
              orderedQty = linked.reduce(
                (acc, p) => acc + sumQty(p?.segments),
                0,
              );
            } else if (proposals.length) {
              orderedQty = sumQty(proposals[0]?.segments);
              isProposal = true;
            }

            const diff = deliveredQty - orderedQty;
            if (type === "sort" || type === "type") return diff;
            return diffSpanNumber(diff, isProposal);
          },
        },

        // Kolumna 7 - Różnica wartość
        {
          data: null,
          orderable: true,
          className: "text-right",
          render: function (data, type, row) {
            const linked = safeArr(row?.linkedOrderProducts);
            const proposals = safeArr(row?.potentialMatches);

            if (!linked.length && !proposals.length)
              return `<span class="muted">-</span>`;

            const deliveredValue = valueTotal(row?.segments);
            let orderedQty = 0;
            let orderedPrice = null;
            let isProposal = false;

            if (linked.length) {
              orderedQty = linked.reduce(
                (acc, p) => acc + sumQty(p?.segments),
                0,
              );
              orderedPrice = avgPriceWeighted(linked[0]?.segments);
            } else if (proposals.length) {
              orderedQty = sumQty(proposals[0]?.segments);
              orderedPrice = avgPriceWeighted(proposals[0]?.segments);
              isProposal = true;
            }

            const orderedValue =
              orderedPrice === null ? 0 : orderedQty * orderedPrice;
            const diff = deliveredValue - orderedValue;

            if (type === "sort" || type === "type") return diff;
            return diffSpanMoney(diff, isProposal);
          },
        },

        // Kolumna 8 - Dokument zam.
        {
          data: null,
          orderable: true,
          className: "doc-col",
          width: "200px",
          render: function (data, type, row) {
            const linked = safeArr(row?.linkedOrderProducts);
            const proposals = safeArr(row?.potentialMatches);

            let orderId = null;
            let isProposal = false;

            if (linked.length) {
              orderId = linked[0]?.orderId;
            } else if (proposals.length) {
              orderId = proposals[0]?.orderId;
              isProposal = true;
            }

            if (!orderId) return `<span class="muted">-</span>`;
            if (type === "sort" || type === "type") {
              // Dla sortowania użyj nazwy zamówienia jeśli dostępna, inaczej ID
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
            if (type === "sort" || type === "type") return st.sort;
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

            // Jeśli jest połączony - pokaż "Rozłącz"
            if (linked.length) {
              const linkedId = linked[0]?.id;
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
            }

            // Jeśli jest propozycja - pokaż "Połącz"
            if (proposals.length) {
              const matchId = proposals[0]?.id;
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

            // Brak akcji
            return "";
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
        const proposals = safeArr(data?.potentialMatches);
        if (proposals.length <= 1) return;

        if (tr.hasClass("shown")) {
          // Usuń child rows
          tr.nextUntil(":not(.child-row)").remove();
          tr.removeClass("shown");
        } else {
          // Wstaw child rows bezpośrednio po parent row
          const childRowsHtml = renderChildProposals(data);
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
            const days = $("#orderingDays").val() || 7;
            return $.ajax({
              type: "GET",
              url:
                InvokeURL +
                "van/recadvs/" +
                encodeURIComponent(recadvId) +
                "/products",
              headers: {
                Authorization: orgToken,
                "Requested-By": "webflow-3-4",
              },
              data: {
                gtin: gtin,
                days: days,
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

              row.data(updatedProduct);

              // Usuń klasę details-control z pierwszej komórki (chevron)
              // bo produkt jest teraz połączony i nie powinien mieć ikony rozwijania
              parentTr.find("td:first").removeClass("details-control");

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
            const days = $("#orderingDays").val() || 7;
            return $.ajax({
              type: "GET",
              url:
                InvokeURL +
                "van/recadvs/" +
                encodeURIComponent(recadvId) +
                "/products",
              headers: {
                Authorization: orgToken,
                "Requested-By": "webflow-3-4",
              },
              data: {
                gtin: gtin,
                days: days,
              },
            });
          })
          .then(function (response) {
            const updatedProduct = safeArr(response?.items).find(
              (item) => item.id === productId,
            );

            if (updatedProduct) {
              const parentTr = $(row.node());
              row.data(updatedProduct);

              // Jeśli produkt ma więcej niż 1 propozycję, dodaj z powrotem klasę details-control
              const proposals = safeArr(updatedProduct?.potentialMatches);
              if (proposals && proposals.length > 1) {
                parentTr.find("td:first").addClass("details-control");
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

    // Inicjalizuj toggle szczegółów po krótkim opóźnieniu, aby upewnić się że DOM jest gotowy
    setTimeout(() => {
      initDetailsToggleEvents();
    }, 100);

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
