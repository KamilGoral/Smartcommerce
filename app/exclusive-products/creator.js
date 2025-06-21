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
        // Ustawiamy input na relative, by można było wstawić ikonę jako absolutną
        input.style.position = "relative";
        input.style.paddingRight = "40px"; // Robimy miejsce na ikonę po prawej

        // Tworzymy ikonę
        const eyeIcon = document.createElement("img");
        eyeIcon.src =
          "https://cdn.prod.website-files.com/6041108bece36760b4e14016/68563a97a30070647f1763d1_watch-crossed.svg";
        eyeIcon.alt = "Toggle password visibility";
        eyeIcon.style.position = "absolute";
        eyeIcon.style.right = "10px";
        eyeIcon.style.top = "50%";
        eyeIcon.style.transform = "translateY(-50%)";
        eyeIcon.style.cursor = "pointer";
        eyeIcon.style.height = "20px";

        // Dodajemy ikonę do rodzica inputa
        input.parentNode.style.position = "relative"; // rodzic musi mieć relative
        input.parentNode.appendChild(eyeIcon);

        // Funkcja przełączania
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
        console.log(Object.keys(toParse).length);

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
        if (request.status == 401) {
          console.log("Unauthorized");
        }
      }
    };
    request.send();
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
      if (typeof barcode == "number") {
        var x = barcode.toString().length;
        if (x >= 5 && x <= 13) {
          if (x <= 8) {
            var zeroesToadd = 8 - x;
            barcode = "0".repeat(zeroesToadd) + barcode;
          } else {
            var zeroesToadd = 13 - x;
            barcode = "0".repeat(zeroesToadd) + barcode;
          }

          var lastDigit = Number(barcode.substring(barcode.length - 1));
          var checkSum = 0;
          if (isNaN(lastDigit)) {
            return false;
          } // not a valid upc/GTIN

          var arr = barcode
            .substring(0, barcode.length - 1)
            .split("")
            .reverse();
          var oddTotal = 0,
            evenTotal = 0;

          for (var i = 0; i < arr.length; i++) {
            if (isNaN(arr[i])) {
              return false;
            } // can't be a valid upc/GTIN we're checking for

            if (i % 2 == 0) {
              oddTotal += Number(arr[i]) * 3;
            } else {
              evenTotal += Number(arr[i]);
            }
          }
          checkSum = (10 - ((evenTotal + oddTotal) % 10)) % 10;

          // true if they are equal
          if (checkSum == lastDigit) {
            return barcode;
          } else {
            return false;
          }
        }
      } else {
        return false;
      }
    }

    function validateProduct(element) {
      if (validateGTIN(element.gtin)) {
        myValidProducts.products.push({
          gtin: "" + validateGTIN(element.gtin),
          name: element.name,
        });
      } else {
        myInvalidProducts.products.push({
          gtin: "" + element.gtin,
          name: element.name,
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
        ],
      });
    });
  }

  function handleFileSelect(evt) {
    var file = evt.target.files[0];

    if (file) {
      Papa.parse(file, {
        quotes: true,
        header: true,
        encoding: "iso-8859-2",
        transform: function (h, i) {
          switch (i) {
            case "price":
              var value = parseFloat(h.replace(",", "."));
              return value;
            default:
              return h;
          }
        },
        transformHeader: function (h, i) {
          switch (h.trim().toLowerCase()) {
            case "ean":
              return "gtin";
            case "kod":
              return "gtin";
            case "kod ean":
              return "gtin";
            case "nazwa":
              return "name";
            case "nazwa_indeksu":
              return "name";
            default:
              console.log("Sorry");
          }
        },
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function (results) {
          printPapaObject(results);
        },
      });
    } else {
      alert("Dozwolony format pliku to .csv");
    }
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

  makeWebflowFormAjax = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action = InvokeURL + "exclusive-products";
        var method = "POST";
        var table = $("#validproducts").DataTable();
        var productsFromTable = table.rows().data().toArray();

        var wholesalerKeyPOST = $("#WholesalerSelector").val();

        if (wholesalerKeyPOST === "null") {
          wholesalerKeyPOST = null;
        }

        if ($("#Never").is(":checked")) {
          var postData = productsFromTable.map(function (el) {
            var o = Object.assign({}, el);
            o.wholesalerKey = wholesalerKeyPOST;
            o.startDate = $("#startDate").val() + "T00:00:01.00Z";
            o.endDate = "infinity";
            return o;
          });
        } else {
          var postData = productsFromTable.map(function (el) {
            var o = Object.assign({}, el);
            o.wholesalerKey = wholesalerKeyPOST;
            o.startDate = $("#startDate").val() + "T00:00:01.00Z";
            o.endDate = $("#endDate").val() + "T23:59:59.00Z";
            return o;
          });
        }
        console.log(postData);

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
            console.log(resultData);
            displayMessage("Success", "Cennik został pomyślnie dodany.");
            window.setTimeout(function () {
              location.reload();
            }, 3000);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(jqXHR);
            console.log(exception);
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

  makeWebflowFormAjaxSingle = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action = InvokeURL + "exclusive-products";
        var method = "POST";

        var wholesalerKeyPOST = $("#WholesalerSelector-Exclusive-2").val();

        if (wholesalerKeyPOST === "null") {
          wholesalerKeyPOST = null;
        }

        console.log(wholesalerKeyPOST);

        if ($("#NeverSingle").is(":checked")) {
          var postData = [
            {
              gtin: $("#GTINInput").val(),
              name: "name1",
              wholesalerKey: wholesalerKeyPOST,
              startDate: $("#startDate-Exclusive-2").val() + "T00:00:01.00Z",
              endDate: "infinity",
            },
          ];
        } else {
          var postData = [
            {
              gtin: $("#GTINInput").val(),
              name: "name1",
              wholesalerKey: wholesalerKeyPOST,
              startDate: $("#startDate-Exclusive-2").val() + "T00:00:01.00Z",
              endDate: $("#endDate-Exclusive-2").val() + "T00:00:01.00Z",
            },
          ];
        }

        console.log(postData);
        var existingBlocksDisplayed = false; // Flag to track if existing blocks are displayed

        $.ajax({
          type: method,
          url: action,
          cors: true,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            if (existingBlocksDisplayed) {
              $("#waitingdots").hide();
            }
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
            console.log(resultData);
            form.show();
            displayMessage("Success", "Blokada została założona.");
            $("#GTINInput").val("");
            $("#waitingdots").hide();
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            if (jqXHR.status === 409) {
              getExclusiveProduct(postData, function (msg) {
                form.show();
              });
            } else {
              msg = "" + jqXHR.responseJSON.message;

              form.show();
              displayMessage(
                "Error",
                "Oops. Coś poszło nie tak, spróbuj ponownie."
              );

              // Set the flag to indicate that existing blocks are displayed
              existingBlocksDisplayed = true;
              return;
            }
          },
        });
        event.preventDefault();
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
