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
    // Po migracji domeny: strona glowna zyje na sprytnykupiec.pl, nie na old.*
    if (domainToRedirect === "old.sprytnykupiec.pl") domainToRedirect = "sprytnykupiec.pl";
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

  // Sprawdzenie statusu organizacji (suspended guard)
  (function checkOrgAccessLevel() {
    var clientId = getCookie("sprytnyOrganizationclientId");
    if (!clientId) return;
    var aclCookie = getCookie("sc_acl_" + clientId);
    if (aclCookie === "restricted") {
      var DomainName = getCookie("sprytnyDomainName");
      window.location.replace(
        "https://" + DomainName + "/app/tenants/organization?clientId=" + clientId + "&suspended=true"
      );
    }
  })();

  // Obsługa formularza logout
  $("#wf-form-LogoutUser").on("submit", function (e) {
    e.preventDefault();

    const smartToken = getCookie("sprytnycookie");
    const accessToken = smartToken?.split("Bearer ")[1];
    const domainName = getCookie("sprytnyDomainName");

    if (accessToken) {
      logoutUser(accessToken, domainName || window.location.hostname);
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
  var ClientID = getCookieNameByValue(orgToken);
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var OrganizationName = getCookie("OrganizationName");
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

  const ExclusiveWizardBread = document.getElementById("ExclusiveWizardBread");
  ExclusiveWizardBread.setAttribute("href", "" + window.location.href);
  var formIdCreatePricing = "#wf-form-NewPricingList";
  var formIdCreateSingleExclusive = "#wf-form-SingleExclusiveForm";

  async function fetchAllPages(baseUrl, headers) {
    const perPage = 50;
    const sep = baseUrl.includes("?") ? "&" : "?";
    const probe = await fetch(baseUrl + sep + "perPage=1", { headers });
    if (!probe.ok) throw new Error("HTTP " + probe.status);
    const total = (await probe.json()).total || 0;
    if (total === 0) return [];
    const responses = await Promise.all(
      Array.from({ length: Math.ceil(total / perPage) }, (_, i) =>
        fetch(baseUrl + sep + "perPage=" + perPage + "&page=" + (i + 1), { headers })
          .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      )
    );
    return responses.flatMap(function (r) { return r.items || []; });
  }

  async function getWholesalersSh() {
    try {
      const toParse = await fetchAllPages(InvokeURL + "wholesalers?enabled=true&sort=wholesalerKey", {
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      });

      console.log(toParse.length);

      const wholesalerContainer =
        document.getElementById("WholesalerSelector");
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

      const wholesalerContainer2 = document.getElementById(
        "WholesalerSelector-Exclusive-2"
      );
      var opt = document.createElement("option");
      opt.value = null;
      opt.innerHTML = "BLOKADA";
      wholesalerContainer2.appendChild(opt);
      toParse.forEach((wholesaler) => {
        if (wholesaler.enabled) {
          var opt = document.createElement("option");
          opt.value = wholesaler.wholesalerKey;
          opt.innerHTML = wholesaler.name;
          wholesalerContainer2.appendChild(opt);
        }
      });
    } catch (e) {
      if (e.message === "HTTP 401") console.log("Unauthorized");
      else console.error("Failed to load wholesalers", e);
    }
  }

  function printPapaObject(papa) {
    var myproducts = papa.data;
    console.log(papa.data);
    var myInvalidProducts = {
      products: [],
    };
    var myValidProducts = {
      products: [],
    };

    function validateGTIN(barcode) {
      if (barcode === null || barcode === undefined) return false;
      barcode = String(barcode).replace(/\D/g, ""); // tylko cyfry

      const x = barcode.length;
      if (x < 5 || x > 13) return false;

      // dopełnienie do 8/13
      barcode =
        x <= 8 ? "0".repeat(8 - x) + barcode : "0".repeat(13 - x) + barcode;

      const lastDigit = Number(barcode.slice(-1));
      if (Number.isNaN(lastDigit)) return false;

      const arr = barcode.slice(0, -1).split("").reverse();
      let oddTotal = 0,
        evenTotal = 0;
      for (let i = 0; i < arr.length; i++) {
        const d = Number(arr[i]);
        if (Number.isNaN(d)) return false;
        if (i % 2 === 0) oddTotal += d * 3;
        else evenTotal += d;
      }
      const checkSum = (10 - ((evenTotal + oddTotal) % 10)) % 10;
      return checkSum === lastDigit ? barcode : false;
    }

    function validateProduct(element) {
      if (validateGTIN(element.gtin)) {
        myValidProducts.products.push({
          gtin: "" + validateGTIN(element.gtin),
          name: element.name,
          // NEW — zachowaj wartość, jeśli jest liczbą
          priceThreshold:
            element.priceThreshold === null ||
            element.priceThreshold === undefined
              ? null
              : Number(element.priceThreshold),
        });
      } else {
        myInvalidProducts.products.push({
          gtin: "" + element.gtin,
          name: element.name,
          // opcjonalnie pokaż też co było w progu przy błędnym GTIN
          priceThreshold:
            element.priceThreshold === null ||
            element.priceThreshold === undefined
              ? null
              : Number(element.priceThreshold),
        });
      }
    }

    myproducts.forEach((element) => {
      validateProduct(element);
    });

    $("#validTableContainer").show();
    $("#invalidTableContainer").show();
    $("#CreatePriceListContainer").css("display", "block");

    const inValidRows = document.getElementById("inValidRows");
    inValidRows.textContent =
      "03. Nie udało się zaimportotwać (" +
      myInvalidProducts.products.length +
      ")";
    const validRows = document.getElementById("validRows");

    var preDuplicates = myValidProducts.products;

    const filteredArr = preDuplicates.reduce((acc, current) => {
      const x = acc.find((item) => item.gtin === current.gtin);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    var filteredArray = preDuplicates.filter(
      (value) => !filteredArr.includes(value)
    );
    var old = new Set(filteredArray.map(({ gtin }) => gtin));
    var resultData = filteredArr.filter(({ gtin }) => !old.has(gtin));

    validRows.textContent =
      " 02. Podejrzyj zaimportowany kody (" + resultData.length + ")";

    $(document).ready(function () {
      var tables = $.fn.dataTable.fnTables(true);

      $(tables).each(function () {
        $(this).dataTable().fnDestroy();
      });

      var validproductsTable = $("#validproducts").DataTable({
        pagingType: "full_numbers",
        order: [],
        dom: '<"top"f>rt<"bottom"lip>',
        scrollY: "60vh",
        scrollCollapse: true,
        pageLength: 10,
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
        data: resultData,
        paging: true,
        autoWidth: true,
        columns: [
          {
            data: "gtin",
          },
          {
            data: "name",
          },
          {
            data: "priceThreshold",
            render: function (v) {
              return v === null || v === undefined || v === "" ? "" : String(v);
            },
          },
        ],
      });
      var invalidproductsTable = $("#invalidproducts").DataTable({
        pagingType: "full_numbers",
        order: [],
        dom: '<"top"f>rt<"bottom"lip>',
        scrollY: "60vh",
        scrollCollapse: true,
        pageLength: 10,
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
        data: myInvalidProducts.products,
        paging: true,
        autoWidth: true,
        columns: [
          {
            data: "gtin",
          },
          {
            data: "name",
          },
          {
            data: "priceThreshold",
            title: "Próg ceny",
            render: function (v) {
              return v === null || v === undefined || v === "" ? "" : String(v);
            },
          },
        ],
      });
    });
  }

  // normalizacja nagłówków -> bez ogonków, lower, bez spacji
  function normalizeHeader(h) {
    return String(h || "")
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // usuń diakrytyki
      .toLowerCase()
      .replace(/\s+/g, "_");
  }

  // mapowanie różnych wariantów nagłówków do spójnych kluczy
  function mapHeaderToKey(hNorm) {
    if (["ean", "kod", "kod_ean", "gtin", "barcode", "code"].includes(hNorm))
      return "gtin";
    if (
      ["nazwa", "name", "produkt", "product", "nazwa_indeksu"].includes(hNorm)
    )
      return "name";
    if (
      [
        "prog",
        "prog_ceny",
        "prog_cen",
        "prog_cenowy",
        "próg",
        "próg_ceny",
        "threshold",
        "price",
        "price_threshold",
      ].includes(hNorm)
    )
      return "priceThreshold";
    return hNorm; // zostaw inne jak są
  }

  // heurystyka „krzaków” (mojibake) w nagłówkach
  function looksMojibake(headers) {
    const s = headers.join(" ");
    return /Ã|Â|Ă|�/.test(s);
  }

  // transform wartości kolumn
  function transformCell(value, column) {
    if (column === "gtin") return String(value || "").replace(/\D/g, "");
    if (column === "priceThreshold") {
      if (value === null || value === undefined || value === "") return null;
      const v = String(value).replace(",", ".").trim();
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }
    return value;
  }

  // wspólna konfiguracja Papa dla znanego contentu (stringa)
  function parseCsvString(content, delimiter, onComplete) {
    Papa.parse(content, {
      header: true,
      delimiter,
      skipEmptyLines: "greedy",
      transformHeader: (h) => mapHeaderToKey(normalizeHeader(h)),
      transform: transformCell,
      dynamicTyping: false, // trzymamy kontrolę nad konwersjami
      complete: onComplete,
    });
  }

  function handleFileSelect(evt) {
    const file = evt.target.files[0];
    if (!file) {
      alert("Dozwolony format pliku to .csv");
      return;
    }

    // 1) Spróbuj UTF-8, potem Windows-1250
    const tryEncodings = ["utf-8", "windows-1250"];

    (function tryNextEncoding(idx) {
      if (idx >= tryEncodings.length) {
        displayMessage("Error", "Nie udało się odczytać pliku (kodowanie).");
        return;
      }

      const enc = tryEncodings[idx];
      const fr = new FileReader();
      fr.onload = () => {
        const text = fr.result || "";

        // 2) Najpierw średnik, jak nie wyjdzie — przecinek
        const tryDelims = [";", ","];
        (function tryNextDelim(di) {
          if (di >= tryDelims.length) {
            // spróbuj kolejne kodowanie
            tryNextEncoding(idx + 1);
            return;
          }
          const delim = tryDelims[di];

          parseCsvString(text, delim, (results) => {
            const headers = results.meta?.fields || [];
            const haveCore =
              headers.includes("gtin") && headers.includes("name"); // próg opcjonalny

            // jeśli krzaki w nagłówkach albo nie mamy required pól -> próbuj dalej
            if (!haveCore || looksMojibake(headers)) {
              tryNextDelim(di + 1);
              return;
            }

            // OK — mamy sensowne nagłówki
            printPapaObject(results);
          });
        })(0);
      };

      fr.onerror = () => tryNextEncoding(idx + 1);
      fr.readAsText(file, enc);
    })(0);
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

  // NEW — helper do PATCH priceThreshold
  function patchExclusivePriceThreshold(
    exclusiveId,
    op,
    value,
    onDone,
    onFail
  ) {
    // op: "add" | "replace" | "remove"
    // jeśli op === "remove", value pomiń
    const body =
      op === "remove"
        ? [{ op: "remove", path: "/priceThreshold" }]
        : [{ op, path: "/priceThreshold", value }];

    $.ajax({
      type: "PATCH",
      url: InvokeURL + "exclusive-products/" + encodeURIComponent(exclusiveId),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },
      data: JSON.stringify(body),
      beforeSend: function () {
        $("#waitingdots").show();
      },
      complete: function () {
        $("#waitingdots").hide();
      },
      success: function (res) {
        displayMessage("Success", "Zaktualizowano próg ceny.");
        if (typeof onDone === "function") onDone(res);
      },
      error: function (jqXHR) {
        const msg =
          jqXHR?.responseJSON?.message || "Nie udało się zaktualizować progu.";
        displayMessage("Error", msg);
        if (typeof onFail === "function") onFail(jqXHR);
      },
    });
  }

  makeWebflowFormAjax = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);

      form.on("submit", function (event) {
        event.preventDefault();

        const action = InvokeURL + "exclusive-products";
        const method = "POST";

        // Dane z tabeli (każdy wiersz powinien zawierać przynajmniej gtin, name, opcjonalnie priceThreshold)
        const table = $("#validproducts").DataTable();
        const productsFromTable = table.rows().data().toArray();

        // wholesalerKey: "null" → null (tworzy blokadę)
        let wholesalerKeyPOST = $("#WholesalerSelector").val();
        if (wholesalerKeyPOST === "null") wholesalerKeyPOST = null;

        const neverChecked = $("#Never").is(":checked");

        // Daty jako YYYY-MM-DD; serwer ignoruje czas (wysyłamy T00:00:00.000Z)
        const startLocal = $("#startDate").val();
        const endLocal = $("#endDate").val();

        // Walidacja zakresu dat (start ≥ dzisiaj, end > start jeśli nie 'Nigdy')
        const dateCheck = validateDateRange(startLocal, endLocal, neverChecked);
        if (!dateCheck.ok) {
          displayMessage("Error", dateCheck.reason);
          return false;
        }
        const startISO = startLocal + "T00:00:00.000Z";
        const endISO = neverChecked ? "infinity" : endLocal + "T00:00:00.000Z";

        // Zbuduj items z tabeli + walidacje GTIN/threshold oraz escapowanie nazw
        const invalids = [];
        const items = [];

        for (const el of productsFromTable) {
          // Nazwa może być w różnych polach — wybierz pierwszą niepustą
          const nameRaw =
            el.name ??
            el.productName ??
            el.product_name ??
            el.Name ??
            el.nazwa ??
            "";

          const escapedName = escapeName(String(nameRaw || "").trim());
          if (!escapedName) {
            invalids.push("Brak nazwy produktu dla jednego z wierszy.");
            continue;
          }

          // GTIN
          const gtinRaw =
            el.gtin ?? el.GTIN ?? el.code ?? el.kod ?? el.productGtin ?? "";
          const gtinNormalized = normalizeGTIN(gtinRaw);
          const gtinCheck = isValidGTIN(gtinNormalized);
          if (!gtinNormalized || !gtinCheck.ok) {
            invalids.push(
              `${gtinRaw || "(pusty)"}${
                gtinCheck.reason ? " (" + gtinCheck.reason + ")" : ""
              }`
            );
            continue;
          }

          // Threshold (opcjonalny): > 0 i < 999999.99
          let item = { gtin: gtinNormalized, name: escapedName };

          if (
            el.priceThreshold !== null &&
            el.priceThreshold !== undefined &&
            el.priceThreshold !== ""
          ) {
            const n = Number(String(el.priceThreshold).replace(",", "."));
            if (!isFinite(n) || n <= 0 || n >= 999999.99) {
              invalids.push(
                `${gtinNormalized} (nieprawidłowy priceThreshold: musi być > 0 i < 999999.99)`
              );
              continue;
            }
            item.priceThreshold = Math.round(n * 100) / 100;
          }

          items.push(item);
        }

        if (invalids.length) {
          displayMessage(
            "Error",
            "Nieprawidłowe rekordy:\n• " + invalids.join("\n• ")
          );
          return false;
        }

        if (!items.length) {
          displayMessage("Error", "Brak poprawnych pozycji do wysłania.");
          return false;
        }

        // NOWY FORMAT BODY
        const postData = {
          wholesalerKey: wholesalerKeyPOST, // null → blokada
          startDate: startISO, // RFC3339, czas ignorowany po stronie backendu
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
          complete: function () {
            $("#waitingdots").hide();
          },
          success: function (resultData) {
            if (typeof successCallback === "function") {
              const proceed = successCallback(resultData);
              if (!proceed) {
                form.show();
                displayMessage(
                  "Error",
                  "Ups. Coś poszło nie tak, spróbuj ponownie."
                );
                return;
              }
            }

            displayMessage(
              "Success",
              `Dodano/zmodyfikowano pozycje: ${items.length}.`
            );
            window.setTimeout(function () {
              location.reload();
            }, 2000);
          },
          error: function (jqXHR, exception) {
            // --- lepsze wyciąganie komunikatu
            const extractMsg = () => {
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
            const parseConflictGtins = (txt) => {
              if (!txt) return [];
              const matches = txt.match(/\b\d{8,14}\b/g) || [];
              return [...new Set(matches)];
            };

            const serverMsg = extractMsg();
            let msg = "";

            if (jqXHR.status === 0) {
              msg = "Brak połączenia z siecią. Sprawdź internet.";
            } else if (jqXHR.status === 401 || jqXHR.status === 403) {
              msg = /admin/i.test(serverMsg)
                ? "Operacja dostępna wyłącznie dla administratora."
                : "Brak uprawnień do wykonania tej operacji.";
            } else if (jqXHR.status === 400) {
              if (/wholesaler.*not enabled/i.test(serverMsg)) {
                msg =
                  "Wybrany wholesalerKey nie jest włączony dla tego tenant'a.";
              } else if (/gtin.*valid/i.test(serverMsg)) {
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
                msg = serverMsg || "Nieprawidłowe dane (400).";
              }
            } else if (jqXHR.status === 409) {
              // Konflikt: wypisz listę GTIN-ów z komunikatu
              const conflicts = parseConflictGtins(serverMsg);
              msg = conflicts.length
                ? "Konflikt z istniejącymi rekordami dla GTIN:\n• " +
                  conflicts.join("\n• ")
                : serverMsg || "Konflikt z istniejącymi rekordami (409).";

              // Pokaż i spróbuj doładować szczegóły (jeśli masz funkcję)
              displayMessage("Error", msg);
              try {
                if (typeof getExclusiveProduct === "function") {
                  getExclusiveProduct(
                    { gtins: conflicts, wholesalerKey: wholesalerKeyPOST },
                    function () {}
                  );
                }
              } catch (e) {
                console.warn("getExclusiveProduct nie powiodło się:", e);
              }

              if (typeof errorCallback === "function") {
                errorCallback(jqXHR, exception, msg);
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

            displayMessage("Error", msg);
          },
        });

        return false;
      });
    });
  };

  // --- Helpers: walidacja GTIN (GS1 modulo-10) i dat, escapowanie ---
  // Usuwa spacje i separatory
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

      form.on("submit", function (event) {
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
              "Próg ceny musi być mniejszy niż 999999.99."
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
                thresholdNum !== null ? { priceThreshold: thresholdNum } : {}
              )
            );
          }
        }

        if (invalids.length) {
          displayMessage(
            "Error",
            "Nieprawidłowe GTIN-y:\n• " + invalids.join("\n• ")
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
                  "Ups. Coś poszło nie tak, spróbuj ponownie."
                );
                return;
              }
            }
            form.show();
            displayMessage(
              "Success",
              `Blokada została założona dla ${items.length} GTIN ${
                items.length === 1 ? "" : "ów"
              }.`
            );
            $("#GTINInput").val("");
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

  function getExclusiveProduct(postData, callback) {
    const gtin = postData[0].gtin;
    const url = new URL(
      InvokeURL + "exclusive-products?gtin=" + gtin + "&perPage=1000"
    );

    // Ustaw postData.endDate na datę za 100 lat, jeśli ma wartość "infinity"
    if (postData[0].endDate === "infinity") {
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setFullYear(now.getFullYear() + 100);
      postData[0].endDate = futureDate.toISOString();
    }

    $.ajax({
      type: "GET",
      url: url,
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
        // Filter items based on conditions
        console.log(data);
        const tableContainer = document.getElementById("messageText");
        tableContainer.innerHTML = ""; // Clear existing content

        const table = document.createElement("table");
        table.setAttribute("border", "1");

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        // Add table headers
        const headers = ["Dostawca", "Od", "Do"];
        headers.forEach((headerText) => {
          const th = document.createElement("th");
          th.textContent = headerText;
          headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        data.items.forEach((item) => {
          const itemStartDate = new Date(item.startDate);
          const itemEndDate = new Date(item.endDate);
          const postDataStartDate = new Date(postData[0].startDate);
          const postDataEndDate = new Date(postData[0].endDate);

          // Formatuj daty do lokalnego formatu "dd.mm.yyyy"
          const formatDate = (date) => {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            return `${day < 10 ? "0" : ""}${day}.${
              month < 10 ? "0" : ""
            }${month}.${year}`;
          };

          // Sprawdź czy spełnione są warunki
          if (
            postDataStartDate < itemEndDate &&
            postDataEndDate > itemStartDate
          ) {
            const row = document.createElement("tr");

            const wholesalerCell = document.createElement("td");
            wholesalerCell.textContent = item.wholesalerName;

            const startDateCell = document.createElement("td");
            startDateCell.textContent = formatDate(itemStartDate);

            const endDateCell = document.createElement("td");
            endDateCell.textContent = formatDate(itemEndDate);

            row.appendChild(wholesalerCell);
            row.appendChild(startDateCell);
            row.appendChild(endDateCell);

            tbody.appendChild(row);
          }
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);

        $("#singleexclusivemodal").css("display", "none");
        $("#existingblocks").css("display", "flex");

        callback();
      },
      error: function (jqXHR, exception) {
        console.log(jqXHR);
        console.log(exception);
        if (jqXHR.status === 409) {
          callback("409 Error"); // You can customize this message as needed
        } else {
          var msg =
            "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
          var elements = document.getElementsByClassName("warningmessagetext");
          for (var i = 0; i < elements.length; i++) {
            elements[i].textContent = msg;
          }
          form.show();
          $("#Create-Pricelist-Fail").show();
          $("#Create-Pricelist-Fail").fadeOut(15000);
          return;
        }
      },
    });
  }

  makeWebflowFormAjaxSingle($(formIdCreateSingleExclusive));
  makeWebflowFormAjax($(formIdCreatePricing));
  getWholesalersSh();
  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));
  initializeSimpleTooltips();

  $(document).ready(function () {
    $.fn.dataTable.ext.errMode = () =>
      alert(
        'Plik nie zawiera jednej z kolumn: "Nazwa", "Kod" lub nie jest ma rozszerzenia .csv. Sprawdź plik i spróbuj ponownie.'
      );
  });

  $(document).ready(function () {
    $("#csv-file").change(handleFileSelect);
  });
});
