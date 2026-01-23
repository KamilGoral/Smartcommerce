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
    return (
      v.toLocaleString("pl-PL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " zł"
    );
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

    const linked = safeArr(rec?.linkedOrderProduct); // z API sample: linkedOrderProduct: []
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
    const cls =
      v > 0 ? (italic ? "pos italic" : "pos") : italic ? "neg italic" : "neg";
    const sign = v > 0 ? "+" : "";
    return `<span class="${cls}">${sign}${v}</span>`;
  }

  function diffSpanMoney(n, italic = false) {
    const v = Number(n);
    if (!Number.isFinite(v))
      return `<span class="${italic ? "muted italic" : "muted"}">-</span>`;
    if (Math.abs(v) < 0.000001)
      return `<span class="${italic ? "zero italic" : "zero"}">${fmtPLN(0)}</span>`;
    const cls =
      v > 0 ? (italic ? "pos italic" : "pos") : italic ? "neg italic" : "neg";
    const sign = v > 0 ? "+" : "";
    return `<span class="${cls}">${sign}${fmtPLN(Math.abs(v))}</span>`;
  }

  // ---------- child row render (warianty/propozycje) ----------
  function renderChildProposals(parent) {
    const proposals = safeArr(parent?.potentialMatches);
    if (proposals.length <= 1) return ""; // nic do rozwijania (jak w Twoim podejściu)

    const deliveredQty = sumQty(parent?.segments);
    const deliveredPrice = avgPriceWeighted(parent?.segments);

    const parentName = escapeHtml(parent?.name || "");
    const parentGtin = escapeHtml(parent?.gtin || "");

    // Pierwszy wariant (0) traktujemy jako "default propozycja" na parent row,
    // a w child pokazujemy wszystkie, ale możesz pominąć [0] jeśli chcesz.
    const rows = proposals.map((m, idx) => {
      const orderedQty = sumQty(m?.segments);
      const orderedPrice = avgPriceWeighted(m?.segments);
      const qtyDiff = orderedQty > 0 ? deliveredQty - orderedQty : 0;

      const deliveredValue =
        deliveredPrice === null ? 0 : deliveredQty * deliveredPrice;
      const orderedValue =
        orderedPrice === null ? 0 : orderedQty * orderedPrice;
      const valueDiff = orderedQty > 0 ? deliveredValue - orderedValue : 0;

      const orderId = escapeHtml(m?.orderId || "");
      const matchId = m?.id;

      return `
      <tr class="child-row">
        <td></td>
        <td class="child-product">
          <div class="variant-row">
            <span class="variant-arrow">↳</span>
            <span class="variant-name">Wariant ${idx + 1}</span>
            <span class="variant-meta">${parentGtin ? parentGtin : ""}</span>
          </div>
        </td>

        <td class="text-right muted">-</td>
        <td class="text-right muted separator-right">-</td>

        <td class="text-right italic">${fmtQty(orderedQty)}</td>
        <td class="text-right italic">${orderedPrice !== null ? fmtPLN(orderedPrice) : "-"}</td>

        <td class="text-right">${orderedQty > 0 ? diffSpanNumber(qtyDiff, true) : `<span class="muted italic">-</span>`}</td>
        <td class="text-right">${orderedQty > 0 ? diffSpanMoney(valueDiff, true) : `<span class="muted italic">-</span>`}</td>

        <td class="doc-col italic">
          ${
            orderId
              ? `<a class="doc-link italic" href="/orders/${orderId}" target="_blank" rel="noopener">${orderId}</a>`
              : `<span class="muted italic">-</span>`
          }
        </td>

        <td class="status-col">
          <span class="badge badge--info">Propozycja</span>
        </td>

        <td class="actions-col">
          <button
            class="btn btn-outline btn-sm link-btn"
            data-product-id="${parent?.id}"
            data-match-id="${matchId}"
          >
            <span class="icon-link">🔗</span> Połącz
          </button>
        </td>
      </tr>
    `;
    });

    return `
    <div class="child-wrap">
      <table class="child-table">
        <tbody>
          ${rows.join("")}
        </tbody>
      </table>
    </div>
  `;
  }

  // globalnie (żeby mieć dostęp do instancji i móc ją odświeżać)
  let deliveryTable = null;

  /**
   * Init/Reset DataTables na #table_delivery dla konkretnego recadvId
   * Wymaga: InvokeURL, orgToken
   */
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
              const proposals = safeArr(data?.potentialMatches);
              if (proposals.length > 1 && !row.child.isShown()) {
                row.child(renderChildProposals(data)).show();
                $(row.node()).addClass("shown");
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
              if (row.child.isShown()) {
                row.child.hide();
                $(row.node()).removeClass("shown");
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

        $.get(
          InvokeURL +
            "van/recadvs/" +
            encodeURIComponent(recadvId) +
            "/products?perPage=1000",
          function (res) {
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
          createdCell: function (row, cell) {
            const proposals = safeArr(row?.potentialMatches);
            if (proposals.length > 1) {
              $(cell).addClass("details-control");
            }
            return "";
          },
          orderable: false,
        },
        {
          data: null,
          orderable: true,
          width: "420px",
          render: function (data, type, row) {
            const name = escapeHtml(row?.name || "-");
            const gtin = escapeHtml(row?.gtin || "-");

            if (type === "sort" || type === "type") return row?.name || "";
            if (type === "filter")
              return [row?.name, row?.gtin].filter(Boolean).join(" ");

            return `
            <div class="prod-cell">
              <div class="prod-name">${name}</div>
              <div class="prod-gtin">${gtin}</div>
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
          className: "text-right separator-right",
          render: function (segments, type) {
            const p = avgPriceWeighted(segments);
            if (type === "sort" || type === "type") return p ?? -1;
            return p !== null ? fmtPLN(p) : `<span class="muted">-</span>`;
          },
        },
        {
          data: null,
          orderable: true,
          className: "text-right",
          render: function (data, type, row) {
            const linked = safeArr(row?.linkedOrderProduct);
            if (!linked.length) return `<span class="muted">-</span>`;

            const q = linked.reduce((acc, p) => acc + sumQty(p?.segments), 0);
            if (type === "sort" || type === "type") return q;
            return q ? fmtQty(q) : `<span class="muted">-</span>`;
          },
        },
        {
          data: null,
          orderable: true,
          className: "text-right",
          render: function (data, type, row) {
            const linked = safeArr(row?.linkedOrderProduct);
            if (!linked.length) return `<span class="muted">-</span>`;

            const p = avgPriceWeighted(linked?.[0]?.segments);
            if (type === "sort" || type === "type") return p ?? -1;
            return p !== null ? fmtPLN(p) : `<span class="muted">-</span>`;
          },
        },
        {
          data: null,
          orderable: true,
          className: "text-right",
          render: function (data, type, row) {
            const linked = safeArr(row?.linkedOrderProduct);
            if (!linked.length) return `<span class="muted">-</span>`;

            const deliveredQty = sumQty(row?.segments);
            const orderedQty = linked.reduce(
              (acc, p) => acc + sumQty(p?.segments),
              0,
            );
            const diff = deliveredQty - orderedQty;

            if (type === "sort" || type === "type") return diff;
            return diffSpanNumber(diff);
          },
        },
        {
          data: null,
          orderable: true,
          className: "text-right",
          render: function (data, type, row) {
            const linked = safeArr(row?.linkedOrderProduct);
            if (!linked.length) return `<span class="muted">-</span>`;

            const deliveredValue = valueTotal(row?.segments);

            const orderedQty = linked.reduce(
              (acc, p) => acc + sumQty(p?.segments),
              0,
            );
            const orderedPrice = avgPriceWeighted(linked?.[0]?.segments);
            const orderedValue =
              orderedPrice === null ? 0 : orderedQty * orderedPrice;

            const diff = deliveredValue - orderedValue;

            if (type === "sort" || type === "type") return diff;
            return diffSpanMoney(diff);
          },
        },
        {
          data: null,
          orderable: true,
          className: "doc-col",
          render: function (data, type, row) {
            const linked = safeArr(row?.linkedOrderProduct);
            if (!linked.length) return `<span class="muted">-</span>`;

            const orderId = linked?.[0]?.orderId;
            if (!orderId) return `<span class="muted">-</span>`;

            if (type === "sort" || type === "type") return orderId;

            return `
            <div class="doc-wrap">
              <a class="doc-link" href="/orders/${escapeHtml(orderId)}" target="_blank" rel="noopener">
                ${escapeHtml(orderId)}
              </a>
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
        {
          data: null,
          orderable: false,
          className: "actions-col",
          width: "120px",
          render: function (data, type, row) {
            const linked = safeArr(row?.linkedOrderProduct);
            if (!linked.length) return ""; // Połącz jest w child

            const linkedId = linked?.[0]?.id;
            return `
            <button
              class="btn btn-outline btn-sm unlink-btn"
              data-product-id="${row?.id}"
              data-linked-id="${linkedId}"
              title="Rozłącz powiązanie"
            >
              Rozłącz
            </button>
          `;
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
      "td.expander-col .expander",
      function (e) {
        e.preventDefault();
        const tr = $(this).closest("tr");
        const row = deliveryTable.row(tr);
        const data = row.data();
        const proposals = safeArr(data?.potentialMatches);
        if (proposals.length <= 1) return;

        if (row.child.isShown()) {
          row.child.hide();
          tr.removeClass("shown");
        } else {
          row.child(renderChildProposals(data)).show();
          tr.addClass("shown");
        }
      },
    );

    $(document).on("click.delivery", ".link-btn", function () {
      const productId = $(this).data("product-id");
      const matchId = $(this).data("match-id");
      console.log("LINK", { productId, matchId });

      // linkRecadvProduct(productId, matchId)
      //   .then(() => deliveryTable.ajax.reload(null, false));
    });

    $(document).on("click.delivery", ".unlink-btn", function () {
      const productId = $(this).data("product-id");
      const linkedId = $(this).data("linked-id");
      console.log("UNLINK", { productId, linkedId });

      // unlinkRecadvProduct(productId, linkedId)
      //   .then(() => deliveryTable.ajax.reload(null, false));
    });

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
