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
  var counter = 0;
  var changesPayload = [];
  var shopKey = new URL(location.href).searchParams.get("shopKey");
  var orderId = new URL(location.href).searchParams.get("orderId");
  var ClientID = getCookieNameByValue(orgToken);
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

  const ShopBread = document.getElementById("ShopKeyBread");
  ShopBread.textContent = shopKey;
  ShopBread.setAttribute(
    "href",
    "https://" + DomainName + "/app/shops/shop?shopKey=" + shopKey
  );

  var OrderIdBread = new URL(location.href).searchParams.get("orderId");
  const IdBread = document.getElementById("OrderIdBread");
  IdBread.setAttribute(
    "href",
    "https://" +
      DomainName +
      "/app/orders/order?orderId=" +
      OrderIdBread +
      "&shopKey=" +
      shopKey
  );

  const orderNameFromCookie = getCookie("orderName");

  const orderNameElement = document.getElementById("OrderIdBread");
  const orderNameBig = document.getElementById("OrderIdBig");

  if (orderNameFromCookie) {
    orderNameElement.textContent = orderNameFromCookie;
    orderNameBig.textContent = orderNameFromCookie;
  } else {
    orderNameElement.textContent = "Twoje zamówienie";
    orderNameBig.textContent = "Twoje zamówienie";
  }

  function getShop() {
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      let endpoint = new URL(InvokeURL + "shops/" + shopKey);
      request.open("GET", endpoint.toString(), true);
      request.setRequestHeader("Authorization", orgToken);
      request.setRequestHeader("Requested-By", "webflow-3-4");

      request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
          var data = JSON.parse(this.response);

          if (data.merchantConsoleShopId === null) {
            data.merchantConsoleShopId = "";
          }

          // Jeśli brak danych adresowych, emaili i telefonów -> pokaż modal edycji
          const isAddressEmpty = !data.address;
          const areEmailsEmpty = !(data.emails && data.emails.length > 0);
          const arePhonesEmpty = !(data.phones && data.phones.length > 0);

          if (isAddressEmpty && areEmailsEmpty && arePhonesEmpty) {
            $("#editShopModal").css("display", "flex").show();
            $("#shopNameEdit").val(data.name || "");
            $("#shopNameEdit").prop("disabled", true);
            return reject("Please edit shop details");
          }

          // Kontynuuj normalne ustawianie danych
          $("#shopNameEdit").val(data.name || "");

          var stateMapping = {
            Dolnośląskie: "LowerSilesian",
            "Kujawsko-pomorskie": "Kuyavian-Pomeranian",
            Lubelskie: "Lublin",
            Lubuskie: "Lubusz",
            Łódzkie: "Łódź",
            Małopolskie: "Lesser Poland",
            Mazowieckie: "Masovian",
            Opolskie: "Opole",
            Podkarpackie: "Subcarpathian",
            Podlaskie: "Podlaskie",
            Pomorskie: "Pomeranian",
            Śląskie: "Silesian",
            Świętokrzyskie: "HolyCross",
            "Warmińsko-Mazurskie": "Warmian-Masurian",
            Wielkopolskie: "Greater Poland",
            Zachodniopomorskie: "West Pomeranian",
          };

          if (data.address && typeof data.address.state !== "undefined") {
            $("#shopStateEdit").val(stateMapping[data.address.state] || "");
          } else {
            $("#shopStateEdit").val("");
          }

          $("#shopTownEdit").val((data.address && data.address.town) || "");
          $("#shopPostcodeEdit").val(
            (data.address && data.address.postcode) || ""
          );
          $("#shopAdressEdit").val((data.address && data.address.line1) || "");
          $("#shopPhoneEdit").val(
            Array.isArray(data.phones) && data.phones.length > 0
              ? data.phones[0].phone
              : ""
          );

          if (data.emails && data.emails.length > 0) {
            data.emails.forEach((email, index) => {
              if (index < 3) {
                $(`#shopEmailEdit${index + 1}`).val(email.email || "");
                $(`#shopEmailEditDescription${index + 1}`).val(
                  email.description || ""
                );
              }
            });
          }

          // Wypełnij dane do wysyłki
          $("#orderDelivery").prop("disabled", true);
          const shopDescription = `${data.name || ""}`;
          const addressDescription = `${data.address?.line1 || ""}, ${
            data.address?.town || ""
          }, ${data.address?.postcode || ""}`;
          const emails = data.emails?.map((e) => e.email).join(", ") || "";
          const phones = data.phones?.map((p) => p.phone).join(", ") || "";

          $("#orderDelivery").val(
            `${shopDescription} \n${addressDescription} \n${emails} \n${phones}`
          );

          resolve(data);
        } else {
          console.log("Błąd podczas pobierania danych sklepu.");
          reject(new Error("Błąd podczas pobierania danych sklepu."));
        }
      };

      request.onerror = function () {
        reject(new Error("Błąd połączenia z serwerem."));
      };

      request.send();
    });
  }

  function saveToSessionStorage(productsData) {
    // Konwersja obiektu do JSON
    const jsonData = JSON.stringify(productsData);

    // Zapisanie JSON do sessionStorage
    sessionStorage.setItem(orderId, jsonData);
  }

  function getProductsDataFromSessionStorage(orderId) {
    const jsonData = sessionStorage.getItem(orderId);

    if (jsonData) {
      return JSON.parse(jsonData);
    }

    return null;
  }

  function updateTableInputsFromSessionStorage(orderId) {
    const productsData = getProductsDataFromSessionStorage(orderId);
    if (!productsData || !productsData.items) {
      // Handle the case where productsData or items is null
      console.log("No products data or items found.");
      return;
    }
    const productsDataItems = productsData.items;

    const table = $("#table_id").DataTable();

    table.rows().every(function () {
      const rowData = this.data();
      const gtin = rowData.gtin;
      const productData = productsDataItems.find((item) => item.gtin === gtin);

      if (productData) {
        const inputField = $(this.node()).find('input[type="number"]');
        inputField.val(productData.quantity);
      } else {
        const inputField = $(this.node()).find('input[type="number"]');
        inputField.val(null); // Jeśli nie znaleziono produktu w sessionStorage, ustaw wartość na null
      }
    });
  }

  function formatDateToPolishTime(dateString) {
    const date = new Date(dateString);
    const options = {
      timeZone: "Europe/Warsaw",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return date.toLocaleString("pl-PL", options).replace(",", "");
  }

  function bindStatusEvents() {
    initializeSimpleTooltips();

    // Obsługa zdarzenia zmiany statusu
    $("#table_splited_wh")
      .off("change", ".status-dropdown")
      .on("change", ".status-dropdown", function () {
        const selectedValue = $(this).val();
        const previousValue = $(this).data("previous-value");
        console.log(selectedValue);
        console.log(previousValue);

        const selectElement = $(this);
        const table = $("#table_splited_wh").DataTable();
        const row = selectElement.closest("tr");
        const rowData = table.row(row).data();
        const wholesalerKey = rowData.wholesalerKey;
        const wholesalerName = rowData.wholesalerName || wholesalerKey;

        if (previousValue === "potwierdzono" && selectedValue === "w edycji") {
          // Ustawienie tekstu modala
          $("#undotText").text(
            `Czy na pewno chcesz cofnąć zamówienie do dostawcy ${wholesalerName}?`
          );

          // Pokaż modal i przekaż dane
          $("#undoOrderModal").css("display", "flex").data({
            shopKey,
            orderId,
            wholesalerKey,
            selectElement,
            previousValue,
            selectedValue,
          });
        } else {
          selectElement.data("previous-value", selectedValue);
        }
      });

    // Inicjalizacja wartości początkowej dla istniejących dropdownów
    $("#table_splited_wh .status-dropdown").each(function () {
      $(this).data("previous-value", $(this).val());
    });

    // Obsługa anulowania cofnięcia (X lub przycisk "Nie")
    $(".icon-close, #undoNo, #cancelUndoButton")
      .off("click")
      .on("click", function (e) {
        e.preventDefault();
        const modal = $("#undoOrderModal");
        const selectElement = modal.data("selectElement");
        const previousValue = modal.data("previousValue");

        $(selectElement).val(previousValue);
        modal.hide();
      });

    // Obsługa potwierdzenia cofnięcia ("Tak")
    $("#undoForm")
      .off("submit")
      .on("submit", function (e) {
        e.preventDefault();

        const modal = $("#undoOrderModal");
        const modalData = modal.data();
        const selectElement = modalData.selectElement;
        const selectedValue = modalData.selectedValue;

        $(selectElement).data("previous-value", selectedValue);
        modal.hide();

        const table = $("#table_splited_wh").DataTable();

        // Aktualizacja danych w tabeli DataTables
        table.rows().every(function () {
          const rowData = this.data();
          if (rowData.wholesalerKey === modalData.wholesalerKey) {
            // Ustawienie pola potwierdzenia na null
            rowData.confirmedAt = null;

            // Usunięcie zdarzeń typu "downloaded"
            if (Array.isArray(rowData.events)) {
              rowData.events = rowData.events.filter(
                (event) => event.type !== "downloaded"
              );
            }

            this.data(rowData).invalidate().draw(false);
            return false; // zakończenie iteracji
          }
        });

        // Opcjonalnie: tutaj AJAX do backendu o cofnięciu zamówienia
      });
  }

  function buildSplittedTable(data = []) {
    var table = $("#table_splited_wh").DataTable({
      pagingType: "full_numbers",
      pageLength: 25,
      stripeClasses: [],
      destroy: true,
      orderMulti: true,
      order: [[2, "desc"]],
      dom: '<"top">rt<"bottom"lip><"clear">',
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
      data: data,
      search: {
        return: true,
      },
      columns: [
        {
          data: null,
          orderable: false,
          defaultContent: "",
          width: "20px",
          createdCell: function (cell, cellData, rowData) {
            if (rowData.events?.length > 0) {
              $(cell).addClass("details-control");
            }
          },
        },

        {
          orderable: true,
          width: "auto",
          data: null,
          render: function (data, type, row) {
            const bonus = row.preferentialBonus;
            const showBonus = bonus !== 0 && bonus !== null;

            const badge = showBonus
              ? `<span data-tippy-content="Premia preferencyjna"
              class="${bonus >= 0 ? "positive" : "negative"}"
              style="margin-left: 6px; font-size: 10px; white-space: nowrap; display: inline-block;">
         ${bonus > 0 ? "+" : ""}${bonus}%
       </span>`
              : "";

            if (row.wholesalerKey === "unassigned") {
              return `
      <span style="white-space: nowrap;">
        Nieprzydzielone
        <a href="#" 
           style="margin-left: 6px; text-decoration: underline; font-size: 11px;" class="go-to-unassigned">
          Zobacz produkty
        </a>
      </span>`;
            }

            return `<span style="white-space: nowrap;">${row.wholesalerName}${badge}</span>`;
          },
        },

        {
          orderable: true,
          width: "108px",
          className: "dt-right",
          data: null,
          type: "num",
          render: function (data, type, row) {
            let netValue = parseFloat(row.netValue);

            if (type === "sort") {
              return row.wholesalerKey === "unassigned" ? -Infinity : netValue;
            }

            if (type === "display" || type === "filter") {
              const logisticMin = parseFloat(row.logisticMinimum);
              if (logisticMin > 0) {
                const toGo = (logisticMin - netValue).toFixed(2);
                if (toGo > 0) {
                  return `
          <div style="display: flex; justify-content: space-between; align-items: center;" 
               data-tippy-content="Brakuje ${toGo}zł do minimum logistycznego">
            <span style="color: #8E1212; display: flex; align-items: center;">
              <img src="https://cdn.prod.website-files.com/6041108bece36760b4e14016/67e7b1c29157ff0d17d559a4_tabler_alert-triangle.svg" 
                   alt="warning" style="width: 16px; height: 16px; margin-right: 4px;">
            </span>
            <span>${netValue}zł</span>
          </div>
        `;
                } else {
                  return `
          <div style="display: flex; justify-content: space-between; align-items: center;" 
               data-tippy-content="Minimum logistyczne spełnione">
            <img src="https://cdn.prod.website-files.com/6041108bece36760b4e14016/6809fa36f03d6d306438d2f2_done.svg" 
                 alt="done" style="width: 16px; height: 16px;">
            <span>${netValue}zł</span>
          </div>
        `;
                }
              } else {
                return `
        <div style="display: flex; justify-content: space-between; align-items: center;" 
             data-tippy-content="Nie ustalono wymaganego minimum logistycznego">
          <img src="https://cdn.prod.website-files.com/6041108bece36760b4e14016/6809fa36962ab80daf4029f0_horizontal-rule.svg" 
               alt="none" style="width: 16px; height: 16px;">
          <span>${netValue}zł</span>
        </div>
      `;
              }
            }

            return netValue;
          },
        },
        {
          orderable: true,
          data: "products",
          width: "96px",
          render: function (data, type, row) {
            const bm = Number((data && data.bestMatch) || 0);
            const ex = Number((data && data.exclusive) || 0);
            const ord = Number((data && data.order) || 0);
            const total = bm + ex + ord;

            if (type === "sort" || type === "type") return total;

            const onlyBest = bm > 0 && ex === 0 && ord === 0;

            // 1) Tylko bestMatch → sam numer
            if (onlyBest) {
              const tooltip =
                row.wholesalerName === "unassigned"
                  ? "Nieprzydzielono"
                  : `Najlepszy wybór: ${bm}`;
              return `<div data-tippy-content="${tooltip}" style="text-align:center;">${bm}</div>`;
            }

            // 2) Mieszanka typów → ikonki + liczby
            const items = [];

            if (bm > 0) {
              items.push({
                label: "Najlepszy wybór",
                count: bm,
                icon: "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d6bd8990da458a9f9cd78_smart-basket.svg",
              });
            }
            if (ex > 0) {
              items.push({
                label: "Blokada",
                count: ex,
                icon: "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d4663e22be5693754eea7_lock-filled.svg",
              });
            }
            if (ord > 0) {
              items.push({
                label: "Wybór użytkownika",
                count: ord,
                icon: "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d463e9ce9fb54c6dfda04_person-circle.svg",
              });
            }

            const chips = items
              .map(
                (it) => `
        <span data-tippy-content="${it.label}: ${it.count}" 
              style="display:inline-flex;align-items:center;gap:4px;margin:0 2px;">
          <img loading="lazy" src="${it.icon}" alt="" 
               style="width:24px;height:24px;display:block;" />
          <span style="font-size:.875em;line-height:1;">${it.count}</span>
        </span>`
              )
              .join("");

            return `<div style="display:flex;justify-content:center;align-items:center;gap:6px;">${chips}</div>`;
          },
          type: "num",
          defaultContent: "",
          className: "dt-center",
        },

        {
          orderable: true,
          data: null,
          name: "statusColumn",
          width: "48px",
          className: "dt-center status-column",

          render: function (data, type, row) {
            const events = row.events || [];

            const wasEmailed = events.some((e) => e.type === "emailed");
            const currentStatus = wasEmailed
              ? "wysłano"
              : row.confirmedAt
              ? "potwierdzono"
              : "w edycji";

            const isEditable = !wasEmailed;

            const styleBase =
              "width: 107px; height: 28px; font-size: 12px; padding: 2px 6px; border-radius: 6px;";
            const styleDisabled =
              "background-color: #f5f5f5; color: #666; appearance: none; -moz-appearance: none; -webkit-appearance: none;";
            const styleEnabled =
              "background-color: #fff; color: #333; cursor: pointer;";

            const finalStyle =
              styleBase + (isEditable ? styleEnabled : styleDisabled);
            const disabledAttr = isEditable ? "" : "disabled";
            const tooltip =
              currentStatus === "wysłano"
                ? "Zamówienie wysłane. Dalsze zmiany nie są możliwe."
                : "Wyślij lub pobierz zamówienie, aby zmienić status";

            if (isEditable) {
              return `
      <select class="status-dropdown"
              data-wholesaler-key="${row.wholesalerKey}" 
              style="${finalStyle}">
        <option value="w edycji" ${
          currentStatus === "w edycji" ? "selected" : ""
        }>W edycji</option>
        <option value="potwierdzono" ${
          currentStatus === "potwierdzono" ? "selected" : ""
        }>Potwierdzono</option>
      </select>`;
            }

            return `
    <select class="status-dropdown status-disabled" ${disabledAttr}
            data-tippy-content="${tooltip}" 
            data-wholesaler-key="${row.wholesalerKey}" 
            style="${finalStyle}">
      <option selected>${
        currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)
      }</option>
    </select>`;
          },
        },
        {
          orderable: false,
          data: "wholesalerKey",
          width: "152px",
          render: function (data) {
            const icons = {
              text: '<img src="https://cdn.prod.website-files.com/6041108bece36760b4e14016/6801f7b6e9d0c00a6329e3e5_b0fc4e382ede37a3a31a9a8bf2aabe9b_document-PC.svg" loading="lazy" style="height:28px; width:28px" fileformat="text/plain" class="filedownloadicon" data-tippy-content="PC-Market">',
              csv: '<img src="https://cdn.prod.website-files.com/6041108bece36760b4e14016/6801f7b78c32ec3d759793c3_a03eac84060b4e1648f6001c1315e885_document-KC.svg" loading="lazy" style="height:28px; width:28px" fileformat="text/csv" class="filedownloadicon" data-tippy-content="KC-Firma">',
              csvAgra:
                '<img src="https://cdn.prod.website-files.com/6041108bece36760b4e14016/6801f7b76ef39cc6fbfd8190_611b8e60e917c80aab69c05e856e9fb0_document-XLS.svg" loading="lazy" style="height:28px; width:28px" fileformat="text/csv" class="filedownloadicon" data-tippy-content="Excel / Tema">',
              csvMirex:
                '<img src="https://cdn.prod.website-files.com/6041108bece36760b4e14016/6801f7b78c32ec3d759793c3_a03eac84060b4e1648f6001c1315e885_document-KC.svg" loading="lazy" style="height:28px; width:28px" fileformat="text/csv" class="filedownloadicon" data-tippy-content="KC-Firma">',
              pdf: '<img src="https://cdn.prod.website-files.com/6041108bece36760b4e14016/6801f7b64cc69ba2b8b48d5a_8f2324ed696253428b3cd9809eddb252_document-PDF.svg" loading="lazy" style="height:28px; width:28px" fileformat="application/pdf" class="filedownloadicon" data-tippy-content="PDF / Wydruk">',
              xls: '<img src="https://cdn.prod.website-files.com/6041108bece36760b4e14016/6801f7b76ef39cc6fbfd8190_611b8e60e917c80aab69c05e856e9fb0_document-XLS.svg" loading="lazy" style="height:28px; width:28px" fileformat="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="filedownloadicon" data-tippy-content="Excel / Tema">',
            };

            const config = {
              default: [icons.text, icons.csv, icons.pdf, icons.xls],
            };
            const fileIcons = config.default; // uproszczone dla skrótu

            return `<div style="display: flex; align-items: center; gap: 10px;">${fileIcons.join(
              ""
            )}</div>`;
          },
        },
        {
          orderable: false,
          width: "48px",
          data: null,
          render: function (data, type, row) {
            if (row.wholesalerKey === "unassigned") return "";

            const wasEmailed = row.events?.some((e) => e.type === "emailed");
            if (wasEmailed) return ""; // nie pokazuj ikonki

            return `
      <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
        <img src="https://cdn.prod.website-files.com/6041108bece36760b4e14016/6801fc11461d703c6d72b187_send%20email.svg" 
             data-tippy-content="Wyślij - email" class="sendemail" style="cursor: pointer;" />
      </div>`;
          },
          className: "dt-center",
        },

        {
          orderable: false,
          width: "48px",
          data: "wholesalerKey",
          render: function (data, type, row) {
            if (data === "unassigned" || row.confirmedAt) return "";

            return `
              <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
                <input type="checkbox" class="theClass customicon" id="${data}" value="${data}" />
                <label class="mylabel customicon" for="${data}" data-tippy-content="Pomiń" style="margin: 0;">
                  <span class="icon initial"></span>
                  <span class="icon loading"></span>
                  <span class="icon final"></span>
                </label>
              </div>`;
          },
          className: "dt-center",
        },
      ],
      initComplete: function () {
        bindStatusEvents();

        // dodanie formatu pobierania JSON dla organizacji Goral i DH-PSS-Bytom
        addJsonFooterIconIfGoral();

        const api = this.api();
        const allData = api.rows().data().toArray();
        const confirmedCount = allData.filter(
          (r) => r.confirmedAt != null
        ).length;

        $('a[data-w-tab="AddProducts"]').toggle(confirmedCount === 0);

        const textBox = $("#table_splited_wh_filter input");
        textBox.off().on("keyup input", function (e) {
          if (e.keyCode === 13) api.search(this.value).draw();
        });

        updateStatusBadge(api);

        $("#table_splited_wh").on("click", ".go-to-unassigned", function (e) {
          e.preventDefault();

          $("#CartwholesalerKeyIndicator").val("unassigned").trigger("change");

          // 1. Kliknij zakładkę
          const $tab = $('a[data-w-tab="Cart"]');
          $tab.trigger("click");

          // 2. Pokaż odpowiadający tab-pane (Webflow-style)
          const tabName = $tab.attr("data-w-tab");
          const $tabPane = $(`.w-tab-pane[data-w-tab="${tabName}"]`);

          // Dezaktywuj inne zakładki
          $(".w-tab-link").removeClass("w--current");
          $(".w-tab-pane").removeClass("w--tab-active");

          // Aktywuj wybraną
          $tab.addClass("w--current");
          $tabPane.addClass("w--tab-active");
        });

        // Klikanie w szczegóły – TO JEST DOBRE MIEJSCE!
        $("#table_splited_wh tbody").on(
          "click",
          "td.details-control",
          function () {
            var tr = $(this).closest("tr");
            var row = $("#table_splited_wh").DataTable().row(tr);

            if (row.child.isShown()) {
              row.child.hide();
              tr.removeClass("shown");
            } else {
              row.child(formatEvents(row.data())).show();
              tr.addClass("shown");
            }
          }
        );
      },
    });
  }

  // Buduje globalny dropdown CartwholesalerKeyIndicator z response GetSplittedProducts
  function rebuildCartWholesalerFilterFromItems(items = []) {
    // Map: wholesalerKey -> nazwa
    const map = new Map();

    // Spróbuj wziąć pełne nazwy dostawców z cache (getWholesalersSh -> wholesalersData)
    let wholesalersData = [];
    try {
      wholesalersData = JSON.parse(
        sessionStorage.getItem("wholesalersData") || "[]"
      );
    } catch (e) {
      wholesalersData = [];
    }

    const getWhName = (key) => {
      if (!key) return "";
      const w = wholesalersData.find((x) => x.wholesalerKey === key);
      return (w && w.name) || key;
    };

    items.forEach((item) => {
      // 1) aktualnie wybrany dostawca dla produktu
      if (item.wholesalerKey && item.wholesalerKey !== "unassigned") {
        const key = item.wholesalerKey;
        const name = item.wholesalerName || getWhName(key);
        if (!map.has(key)) map.set(key, name);
      }

      // 2) potencjalni dostawcy z asks (wszystkie możliwe z tego response)
      if (Array.isArray(item.asks)) {
        item.asks.forEach((ask) => {
          const k = ask.wholesalerKey;
          if (!k || k === "unassigned") return;

          const name = getWhName(k);
          if (!map.has(k)) map.set(k, name);
        });
      }
    });

    const $sel = $("#CartwholesalerKeyIndicator");
    const current = $sel.val();

    // 🔥 niszczymy starą listę i budujemy od zera
    $sel.empty();

    // Wszyscy
    $sel.append('<option value="" style="font-weight:bold;">Wszyscy</option>');

    // Dostawcy posortowani po nazwie
    Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1], "pl"))
      .forEach(([key, name]) => {
        $sel.append(`<option value="${key}">${name}</option>`);
      });

    // Opcja "Nieprzydzielony / Pomiń" zawsze na końcu
    $sel.append(
      '<option value="unassigned" style="font-weight:bold;">Nieprzydzielony / Pomiń</option>'
    );

    // Zachowaj poprzedni wybór jeśli ma sens
    if (current && map.has(current)) {
      $sel.val(current);
    } else if (current === "unassigned") {
      $sel.val("unassigned");
    } else {
      $sel.val("");
    }
  }

  async function CreateOrder() {
    const tableId = "#spl_table";
    const dotsCheckerInterval = 1000; // co ile ms sprawdzamy spinner
    let dotsChecker = null;
    let isResponseReceived = false;

    function showGenericError() {
      displayMessage("Error", "Oops. Coś poszło nie tak, spróbuj ponownie.");
    }

    try {
      // Ukryj tabelę jeśli istnieje
      if ($.fn.dataTable.isDataTable(tableId)) {
        const tableToClear = $(tableId).DataTable();
        tableToClear.clear().draw();
        $("#spl_table_wrapper").hide();
      }

      await makeChangesToOrder();
      await fetchDataFromEndpoint();

      const searchIDs = $("#table_splited_wh input:checkbox:checked")
        .map(function () {
          return $(this).val();
        })
        .toArray();

      const deletetedIds = $("#DeletedContainer input:checkbox:checked")
        .map(function () {
          return $(this).val();
        })
        .toArray();

      const deletetedIdstoDelete = $(
        "#DeletedContainer input:checkbox:not(:checked)"
      )
        .map(function () {
          return $(this).val();
        })
        .toArray();

      // Usuń zaznaczone do usunięcia
      deletetedIds.forEach((wholesaler) => {
        const objToDelete = document.getElementById("d" + wholesaler);
        if (objToDelete) objToDelete.remove();
      });

      // Dodaj zaznaczone do kontenera
      searchIDs.forEach((wholesaler) => {
        $("#DeletedContainer").append(`
          <div class="deletedwh" id="d${wholesaler}">
            ${wholesaler}
            <input 
              type="checkbox" 
              class="theClass customicon" 
              id="${wholesaler}" 
              value="${wholesaler}" 
              name="${wholesaler}"
            />
            <label 
              class="mylabel customicon" 
              for="${wholesaler}" 
              data-tippy-content="Pomiń"
            >
              <span class="icon initial"></span>
              <span class="icon loading"></span>
              <span class="icon final"></span>
            </label>
          </div>
        `);
      });

      const excludedAlready = deletetedIdstoDelete.join("&exclude=");
      const excludedNow = searchIDs.join("&exclude=");
      const urlParams = [];

      if (excludedAlready.length > 0) {
        urlParams.push("exclude=" + excludedAlready);
      }
      if (excludedNow.length > 0) {
        urlParams.push("exclude=" + excludedNow);
      }

      const queryString = urlParams.length > 0 ? "?" + urlParams.join("&") : "";
      const action = `${InvokeURL}shops/${shopKey}/orders/${orderId}/split${queryString}`;

      $("#waitingdots").show();

      // Sprawdzanie spinnnera co sekundę
      dotsChecker = setInterval(() => {
        if (!isResponseReceived && !$("#waitingdots").is(":visible")) {
          $("#waitingdots").show();
        }
      }, dotsCheckerInterval);

      let response;
      try {
        response = await $.ajax({
          type: "GET",
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
        });

        isResponseReceived = true;
        clearInterval(dotsChecker);
        $("#waitingdots").hide();
        handleSplitResponse(response);
      } catch (error) {
        isResponseReceived = true;
        clearInterval(dotsChecker);
        $("#waitingdots").hide();
        console.log("Błąd w ajax:", error);

        if (error.status === 504) {
          showGenericError();
          return;
        }

        throw error;
      }
    } catch (error) {
      console.log("Error in CreateOrder:", error);

      const isAddProductsTabActive = $("#addProducts").hasClass("w--current");
      if (isAddProductsTabActive) {
        console.log(
          "Tab 'Dodaj produkty' jest aktywny — pomijam obsługę błędu."
        );
        throw error;
      }

      if (error.responseJSON) {
        const parsed = error.responseJSON;
        if (parsed && parsed.items) {
          handleSplitResponse(parsed);
          return;
        }

        let translatedError = "";
        if (
          parsed.message ===
          "Unable to split requested order: no products to split."
        ) {
          translatedError =
            "Nie można podzielić żądanego zamówienia: brak produktów do podziału.";
        } else if (
          parsed.message.includes(
            "Quantities of products exceed limit for GTINs"
          )
        ) {
          const gtins = parsed.message.match(/\[([^\]]+)\]/)?.[1];
          translatedError = `Ilości produktów przekraczają limit dla GTINów: ${gtins}.`;
        } else if (parsed.message.includes("Exceptions occurred for GTINs")) {
          const gtins = parsed.message.match(/\[([^\]]+)\]/)?.[1];
          translatedError = `Wystąpiły wyjątki dla GTINów: ${gtins}.`;
        } else if (
          parsed.message ===
          "Total value for the order exceeded the available limit."
        ) {
          translatedError =
            "Całkowita wartość zamówienia przekroczyła dostępny limit.";
        }

        if (translatedError) {
          console.log(translatedError);
          displayMessage("Error", translatedError);
        }
      } else if (error.status === 404) {
        displayMessage(
          "Error",
          "Niestety, nie znaleziono oferty lub wybrano usunięte zamówienie."
        );
        setTimeout(() => {
          window.location.href = `https://${DomainName}/app/shops/shop?shopKey=${shopKey}`;
        }, 4000);
      } else if (error.responseText) {
        try {
          const parsed = JSON.parse(error.responseText);
          if (parsed.message) {
            displayMessage("Error", parsed.message);
          }
        } catch (e) {
          console.log("Nie udało się sparsować odpowiedzi JSON", e);
        }
      } else {
        showGenericError();
      }
    } finally {
      clearInterval(dotsChecker);
      $("#waitingdots").hide();
    }
  }

  function addJsonFooterIconIfGoral() {
    const t0 =
      typeof performance !== "undefined" && performance.now
        ? performance.now()
        : Date.now();
    console.groupCollapsed(
      "%caddJsonFooterIconIfGoral()",
      "color:#0a0;font-weight:700"
    );
    console.log("→ Start");

    try {
      // 1) Org name
      const orgName =
        (typeof getCookie === "function"
          ? getCookie("OrganizationName")
          : "") || "";
      console.log("Cookie.OrganizationName =", JSON.stringify(orgName));

      // 2) Warunek org (bez zmiany logiki)
      if (
        orgName !== "Goral" &&
        orgName !== "DH-PSS-Bytom" &&
        orgName !== "ATO"
      ) {
        console.warn(
          "Return: org not allowed (expected 'Goral' or 'DH-PSS-Bytom')."
        );
        return;
      }
      console.log("✓ Org allowed");

      // 3) Znajdź pasek w stopce
      const $icons = $("#table_splited_wh tfoot .filedownloadicon");
      console.log("Footer icons found:", $icons.length);

      const $bar = $icons.first().closest("div.dt-center");
      if (!$bar.length) {
        console.warn("Return: footer bar div.dt-center not found.");
        // Pokaż fragment tfoot do diagnozy
        const tfootHtml = $("#table_splited_wh tfoot").html() || "";
        console.log(
          "tfoot snapshot:",
          tfootHtml.slice(0, 400) + (tfootHtml.length > 400 ? " …" : "")
        );
        return;
      }
      console.log("✓ Footer bar OK:", $bar.get(0));

      // 4) Nie duplikuj
      if ($bar.find("#download-order-json-footer").length) {
        console.warn("Return: icon already exists.");
        return;
      }

      // 5) Utwórz i podepnij ikonkę
      const $btn = $(`
      <img
        id="download-order-json-footer"
        src="https://cdn.prod.website-files.com/6041108bece36760b4e14016/68d0e8e381fd6b44c8c126f7_document-JSON.svg"
        alt="JSON"
        data-tippy-content="JSON (SprytnyKupiec)"
        style="height:28px; width:28px; cursor:pointer;"
      >
    `);
      console.log("Button created:", $btn.get(0));

      $bar.append($btn);
      console.log(
        "✓ Button appended to footer bar. Count now:",
        $bar.find("#download-order-json-footer").length
      );

      // 6) Klik – tylko nasz
      $btn.on("click", function (e) {
        console.log("Click on JSON icon → fetchAndDownloadOrderJson()");
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        try {
          fetchAndDownloadOrderJson(); // bez zmiany przekazywanych parametrów
          console.log("✓ fetchAndDownloadOrderJson() called");
        } catch (err) {
          console.warn("fetchAndDownloadOrderJson() error:", err);
        }
      });

      // 7) Tooltips (jeśli jest dostępne)
      if (typeof initializeSimpleTooltips === "function") {
        initializeSimpleTooltips();
        console.log("✓ initializeSimpleTooltips() called");
      } else {
        console.warn(
          "initializeSimpleTooltips not found – skipping tooltips init."
        );
      }

      // 8) Sanity check
      console.assert(
        $("#download-order-json-footer").length >= 1,
        "Icon not present in DOM after append."
      );
      console.log("✓ Completed without exceptions.");
    } catch (e) {
      console.warn("Exception in addJsonFooterIconIfGoral():", e);
    } finally {
      const dt =
        (typeof performance !== "undefined" && performance.now
          ? performance.now()
          : Date.now()) - t0;
      console.log(`⏱ Done in ${dt.toFixed ? dt.toFixed(1) : dt} ms`);
      console.groupEnd();
    }
  }

  async function fetchAndDownloadOrderJson(opts = {}) {
    $("#waitingdots").show();
    const { usernameOverride, filenamePrefix } = opts;

    const base = `${InvokeURL}shops/${shopKey}/orders/${orderId}`;
    const headers = {
      Accept: "application/json",
      Authorization: orgToken,
      "Requested-By": "webflow-3-4",
      // UWAGA: brak Content-Type dla GET!
    };

    const getJson = async (url, { retries = 1 } = {}) => {
      let lastErr;
      for (let i = 0; i <= retries; i++) {
        try {
          const res = await fetch(url, { headers, mode: "cors" });
          if (!res.ok) {
            if (res.status === 401)
              throw new Error("401 Unauthorized – sprawdź token (orgToken).");
            if (res.status === 403)
              throw new Error("403 Forbidden – brak uprawnień do zasobu.");
            if (res.status === 404)
              throw new Error("404 Not Found – sprawdź shopKey/orderId.");
            throw new Error(`${res.status} ${res.statusText}`);
          }
          return await res.json();
        } catch (e) {
          lastErr = e;
          // retry tylko dla sieci/5xx
          if (!(e.message.startsWith("5") || e.name === "TypeError")) break;
        }
      }
      throw lastErr;
    };

    try {
      const [details, itemsPayload] = await Promise.all([
        getJson(base, { retries: 1 }), // /orders/{id}
        getJson(`${base}/wholesalers?perPage=10000`, { retries: 1 }), // /orders/{id}/wholesalers
      ]);

      const items = Array.isArray(itemsPayload?.items)
        ? itemsPayload.items
        : [];
      const products = items.map((it) => ({
        name: it?.name ?? null,
        gtin: it?.gtin ?? null,
        quantity: it?.quantity ?? 0,
        netPrice: it?.netPrice ?? null,
        wholesalerKey: it?.wholesalerKey ?? null,
        confirmed: Boolean(it?.confirmed),
      }));

      const username =
        (typeof usernameOverride === "string" && usernameOverride.trim()) ||
        details?.createdBy ||
        null;

      const createDate = details?.createDate
        ? new Date(details.createDate).toISOString()
        : itemsPayload?.offerDate
        ? new Date(itemsPayload.offerDate).toISOString()
        : new Date().toISOString();

      const name = details?.name ?? "Zamówienie";
      const total = Number.isFinite(details?.total)
        ? details.total
        : products.length;
      const confirmed = Number.isFinite(details?.confirmed)
        ? details.confirmed
        : products.reduce((acc, p) => acc + (p.confirmed ? 1 : 0), 0);

      const payload = {
        username,
        createDate,
        name,
        total,
        confirmed,
        products,
      };

      const pretty = JSON.stringify(payload, null, 2);
      const blob = new Blob([pretty], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const ts = new Date(createDate)
        .toISOString()
        .replace(/\D/g, "")
        .slice(0, 14);
      // => "20250924113345"
      const baseName = (filenamePrefix || name || "zamowienie")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_-]+/g, "");
      const filename = `${baseName}-${ts}.json`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      $("#waitingdots").hide();
    } catch (err) {
      $("#waitingdots").hide();
      console.error("fetchAndDownloadOrderJson error:", err);
      alert(`Nie udało się wygenerować pliku JSON:\n${err?.message || err}`);
    }
  }

  function handleSplitResponse(data) {
    // Obsługa braku danych lub pustej tablicy
    if (
      !data ||
      !data.items ||
      !Array.isArray(data.items) ||
      data.items.length === 0
    ) {
      console.warn("Brak danych - pokazuję pustą tabelę");
      $("#splitedwhcontainer").show();

      if ($.fn.dataTable.isDataTable("#table_splited_wh")) {
        const table = $("#table_splited_wh").DataTable();
        table.clear().draw();
      } else {
        buildSplittedTable([]);
      }
      return;
    }

    // Sortowanie, jeśli potrzebujesz
    data.items.sort((a, b) => parseFloat(b.netValue) - parseFloat(a.netValue));

    // Budowanie tabeli z danymi
    buildSplittedTable(data.items);
    $("#splitedwhcontainer").show();
    $("#table-content").show();

    // ------ Obsługa liczbowych wartości (oszczędności itd.) ------
    function setElementContent(elementId, content, percentage) {
      const element = document.getElementById(elementId);
      if (!element) return;

      if (content === null || typeof content === "undefined") {
        element.textContent = "-";
        return;
      }

      const numericContent = Number(content);
      const formattedContent = isNaN(numericContent)
        ? "-"
        : `${numericContent.toFixed(2)} zł${
            percentage !== undefined ? ` (${percentage.toFixed(2)}%)` : ""
          }`;
      element.textContent = formattedContent;
    }

    const userRole = getCookie && getCookie("sprytnyUserRole");

    function calculateAndSetSavings(values, prefix = "") {
      const savingsValue = values.avg - values.total;
      const savingsPercentage = (savingsValue / values.avg) * 100;
      setElementContent(`${prefix}totalValue`, values.total);
      setElementContent(`${prefix}avgValue`, values.avg);
      return { savingsValue, savingsPercentage };
    }

    // Wyliczenie oszczędności
    const { savingsValue, savingsPercentage } = calculateAndSetSavings(
      data.netValues
    );
    const {
      savingsValue: savingsNetValue,
      savingsPercentage: savingsNetPercentage,
    } = calculateAndSetSavings(data.netNetValues, "net");

    // Dobór koloru oszczędności
    const textColor =
      savingsValue >= 0 || savingsNetValue >= 0 ? "#67ca24" : "#ff5630";

    // Aktualizacja widoków oszczędności
    if (savingsValue >= 0) {
      setElementContent("savings", savingsValue, savingsPercentage);
    } else {
      setElementContent("savings", "Zamówienie nieoptymalne", "-");
    }

    if (savingsNetValue >= 0) {
      setElementContent("savingsNet", "Zamówienie nieoptymalne", "-");
    } else if (
      userRole === "admin" &&
      data.netValues &&
      data.netNetValues &&
      data.netValues.total !== data.netNetValues.total
    ) {
      setElementContent("savingsNet", savingsNetValue, savingsNetPercentage);
    }

    // Ustawienie kolorów w UI
    ["savings", "savingsNet"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.style.color = textColor;
    });
  }

  function updateStatusBadge() {
    const table = $("#table_splited_wh").DataTable();
    const allData = table.rows().data().toArray();
    const confirmedCount = allData.filter(
      (row) => row.confirmedAt != null
    ).length;
    const totalCount = allData.length;

    const $badgeContainer = $(".badgecontainer");
    $badgeContainer.empty();

    if (confirmedCount === 0) {
      $badgeContainer.append(`
        <div data-tippy-content="Możesz swobodnie edytować, usuwać i dodawać produkty do zamówienia" class="badgestatus editstate" style="display: flex;">
          <div>W edycji</div>
        </div>
      `);
    } else if (confirmedCount < totalCount) {
      $badgeContainer.append(`
        <div data-tippy-content="Część pozycji została już potwierdzona – niektóre akcje są teraz zablokowane" class="badgestatus confirmstate" style="display: flex;">
          <div>Częściowo potwierdzone</div>
        </div>
      `);
    } else {
      $badgeContainer.append(`
        <div data-tippy-content="Wszystkie pozycje zostały potwierdzone. Nie można już wprowadzać zmian" class="badgestatus confirmedstate" style="display: flex;">
          <div>Potwierdzone</div>
        </div>
      `);
    }

    initializeSimpleTooltips(); // jeśli używasz tippy.js
  }

  $("#spliterProceed").on("click", function (e) {
    e.preventDefault();
    $("#lockOrderDiv").css("display", "flex");

    $("#lockOrderButton").one("click", function () {
      $("#addProducts").hide();
      $("#lockOrderDiv").hide();

      // Pobierz dane z tabeli
      var table = $("#table_splited_wh").DataTable();

      // Ustaw flagę inRealization dla każdego wiersza
      table.rows().every(function () {
        var data = this.data();
        data.inRealization = true;
        this.data(data); // Aktualizacja wiersza
      });

      // Przerysuj tabelę
      table.draw();
    });
  });

  function format(d) {
    const arr = d.asks || [];

    const sourceMap = {
      pricat: "Cennik",
      "online offer": "E-hurt",
      ecommerce: "E-hurt",
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
    };

    function calculatePackage(promotion) {
      if (!promotion || !promotion.factors) return "-";
      const { type, factors } = promotion;
      const { quantityFactor, consolidationSet } = factors || {};
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

      const arr = Array.isArray(types) ? types : [types];
      return arr.filter(Boolean).map((type) => ({
        icon: iconMap[type] || "",
        text: benefitTexts[type] || "Brak informacji o promocji",
      }));
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
        const promoObj = item.promotion || null;
        const mappedPromo = promoObj ? promotionMap[promoObj.type] : null;
        const promotionType = mappedPromo ? mappedPromo.name : "-";
        const promotionDescription = mappedPromo
          ? mappedPromo.description
          : "Brak promocji";

        // singular === false + mamy identyfikator promocji → można kliknąć i pobrać related
        const canFetchRelated = !!(
          promoObj &&
          promoObj.singular === false &&
          promoObj.id
        );

        // Wstawiamy ikonę z data-* dla fetcha
        const relatedCell = canFetchRelated
          ? `<img
          src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/624017e4560dba7a9f97ae97_shortcut.svg"
          loading="lazy"
          class="showdata"
          data-shop="${shopKey}"
          data-wh="${item.wholesalerKey}"
          data-promo="${promoObj.id}"
          alt="Powiązane"
         />`
          : "-";

        const benefitHtml = getBenefitDetails(promoObj?.benefit);

        // disabled row + tooltip (przetłumaczone kody)
        const rowClass = item.valid ? "" : "disabled-row";
        const tooltipContent = !item.valid
          ? `${formatMessageCodesTooltip(item.messageCodes)}`
          : "";
        const rowTooltip = item.valid
          ? ""
          : `class="tippy" data-tippy-content="${tooltipContent}"`;

        return `
      <tr class="${rowClass}" ${rowTooltip}>
        <td>${item.wholesalerKey ?? "-"}</td>
        <td>${item.netPrice ?? "-"}</td>
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
          mappedPromo
            ? `<td class="tippy" data-tippy-content="${promotionDescription}">${promotionType}</td>`
            : "<td>-</td>"
        }
        <td>${promoObj?.threshold ?? "-"}</td>
        <td>${promoObj?.cap ?? "-"}</td>
        <td>${calculatePackage(promoObj)}</td>
        <td>${benefitHtml}</td>
        <td>${relatedCell}</td>
      </tr>`;
      })
      .join("");

    return `
    <table>
      <tr>
        <th>Dostawca</th>
        <th>Cena net</th>
        <th>Cena netnet</th>
        <th>Paczka</th>
        <th>Źródło</th>
        <th>Pochodzenie</th>
        <th>Dostępność</th>
        <th>Promocja</th>
        <th>Próg</th>
        <th>Max</th>
        <th>Opakowanie</th>
        <th>Bonus</th>
        <th>Powiązane</th>
      </tr>
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

  function formatEvents(data) {
    const events = (data.events || [])
      .slice()
      .sort((a, b) => new Date(b.created.at) - new Date(a.created.at)); // najnowsze na górze

    if (events.length === 0) {
      return `<div style="padding: 12px 44px;">Brak zdarzeń.</div>`;
    }

    const eventTypeMap = {
      downloaded: "Pobrano",
      emailed: "Wysłano",
      unconfirmed: "Niepotwierdzone",
    };

    const rowsHtml = events
      .map((e, index) => {
        const label = eventTypeMap[e.type] || e.type;
        const date = new Date(e.created.at).toLocaleString("pl-PL");
        const user = e.created.by;

        return `
      <div style="margin-bottom: 12px;">
        <div><strong>${label}:</strong> ${date}</div>
        <div><strong>Użytkownik:</strong> ${user}</div>
      </div>
      ${
        index < events.length - 1
          ? `<div style="border-top: 1px solid #ccc; margin: 8px 0;"></div>`
          : ""
      }
    `;
      })
      .join("");

    return `<div style="padding: 0 0 8px 44px;">${rowsHtml}</div>`;
  }

  let splConfirmedWholesalers = new Set();

  function generateWholesalerSelect(
    selectedWholesalerKey,
    jsonData,
    isDisabled,
    assignmentSource,
    tableSelector // zostawiamy dla zgodności, ale nie używamy
  ) {
    const wholesalersDataRaw = sessionStorage.getItem("wholesalersData");
    const wholesalersData = wholesalersDataRaw
      ? JSON.parse(wholesalersDataRaw)
      : [];

    // zamiast liczyć per wiersz – bierzemy z globalnego cache
    const confirmedWholesalers = splConfirmedWholesalers || new Set();

    // --- czy dropdown ma być zablokowany ---
    const shouldDisable = isDisabled == 1 || assignmentSource === "exclusive";

    // --- nagłówek <select> ---
    let selectHTML =
      '<select style="width:120px;" class="wholesalerSelect wh-picker"';

    if (shouldDisable) {
      selectHTML +=
        ' disabled data-tippy-content="Produkt jest zablokowany do tego dostawcy. Zmiana niedostępna."';
    }
    selectHTML += ">";

    // Opcje specjalne tylko gdy NIE jest zablokowane
    if (!shouldDisable) {
      selectHTML += `<option value="unassigned"${
        selectedWholesalerKey === "unassigned"
          ? ' selected style="font-weight:bold"'
          : ""
      }>Nieprzydzielony / Pomiń</option>`;

      if (assignmentSource === "order") {
        selectHTML += `<option value="remove" style="font-weight:bold">Anuluj mój wybór</option>`;
      }
    }

    // --- sort + deduplikacja jsonData ---
    let localList = Array.isArray(jsonData) ? jsonData.slice() : [];
    if (localList.length > 0) {
      localList = localList
        .sort((a, b) => (a.netPrice ?? Infinity) - (b.netPrice ?? Infinity))
        .filter(
          (item, idx, self) =>
            idx ===
            self.findIndex((t) => t.wholesalerKey === item.wholesalerKey)
        );

      // Dostawcy z jsonData (pomijamy potwierdzonych, poza aktualnie wybranym)
      localList.forEach((item) => {
        if (
          confirmedWholesalers.has(item.wholesalerKey) &&
          item.wholesalerKey !== selectedWholesalerKey
        ) {
          return;
        }

        const w = wholesalersData.find(
          (x) => x.wholesalerKey === item.wholesalerKey
        );
        const name = w ? w.name : item.wholesalerKey;

        selectHTML += `<option value="${item.wholesalerKey}" ${
          item.wholesalerKey === selectedWholesalerKey
            ? 'selected style="font-weight:bold"'
            : ""
        }>${name}</option>`;
      });
    }

    // --- dodaj dostawców z wholesalersData, których jeszcze nie ma ---
    wholesalersData.forEach((w) => {
      const alreadyAdded = localList.some(
        (i) => i.wholesalerKey === w.wholesalerKey
      );
      const isConfirmed = confirmedWholesalers.has(w.wholesalerKey);

      if (
        !alreadyAdded &&
        (!isConfirmed || w.wholesalerKey === selectedWholesalerKey)
      ) {
        selectHTML += `<option value="${w.wholesalerKey}" ${
          w.wholesalerKey === selectedWholesalerKey
            ? 'selected style="font-weight:bold"'
            : ""
        } style="background-color:#EBECF0;">${w.name}</option>`;
      }
    });

    selectHTML += "</select>";
    return selectHTML;
  }

  function GetSplittedProducts(successCallback) {
    let resultProducts = { items: [] }; // domyślne dane
    if (!$("#CartwholesalerKeyIndicator").val()) {
      $("#CartwholesalerKeyIndicator").val("");
    }
    $("#CartRotationIndicator").val("");
    $("#spl_table_wrapper").show();

    $.ajax({
      type: "GET",
      url: `${InvokeURL}shops/${shopKey}/orders/${orderId}/wholesalers?perPage=10000`,
      cors: true,
      contentType: "application/json",
      dataType: "json",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },

      beforeSend: function () {
        $("#waitingdots").show();
      },

      success: function (response) {
        resultProducts = response || { items: [] };
        if (!Array.isArray(resultProducts.items)) resultProducts.items = [];
        rebuildCartWholesalerFilterFromItems(resultProducts.items);

        // callback jeśli podany
        if (typeof successCallback === "function") {
          const proceed = successCallback(resultProducts);
          if (!proceed) return;
        }

        // Zapis do sesji + odtworzenie inputów
        saveToSessionStorage(resultProducts);
        updateTableInputsFromSessionStorage(orderId);

        $("#splittedProductsSection").show();
        initializeSimpleTooltips();
      },

      error: function (jqXHR, exception) {
        console.warn("Błąd pobierania danych:", jqXHR.status);
        resultProducts = { items: [] }; // pokaż pustą tabelę
        $("#splittedProductsSection").show();
      },

      complete: function () {
        $("#waitingdots").hide();

        // Zniszcz poprzednią instancję DataTable
        if ($.fn.DataTable.isDataTable("#spl_table")) {
          $("#spl_table").DataTable().destroy();
        }

        // === FILTR: jedna, globalna instancja, oparta o row.data() ===
        // Usuń poprzedni filtr jeśli istniał
        if (window._splFilter) {
          const i = $.fn.dataTable.ext.search.indexOf(window._splFilter);
          if (i > -1) $.fn.dataTable.ext.search.splice(i, 1);
        }

        window._splFilter = function (settings, data, dataIndex) {
          if (settings.nTable.id !== "spl_table") return true;

          // surowe dane wiersza, bez tworzenia nowego Api
          const rowData =
            (settings.aoData[dataIndex] && settings.aoData[dataIndex]._aData) ||
            {};

          const selectedWh = (
            $("#CartwholesalerKeyIndicator").val() || ""
          ).trim();
          const selectedRot = ($("#CartRotationIndicator").val() || "").trim();

          const wholesalerValue = (rowData.wholesalerKey || "").trim();
          const rotationValue = ((rowData.rotationIndicator || "") + "").trim();

          const matchWh = !selectedWh || wholesalerValue === selectedWh;
          const matchRot = !selectedRot || rotationValue === selectedRot;

          return matchWh && matchRot;
        };

        $.fn.dataTable.ext.search.push(window._splFilter);

        // === Inicjalizacja tabeli ===
        const table = $("#spl_table").DataTable({
          order: [[10, "desc"]], // kolumna "Obniż cenę"
          pagingType: "full_numbers",
          destroy: true,
          dom: '<"top"fB>rt<"bottom"lip>',
          scrollY: "60vh",
          scrollCollapse: true,
          pageLength: 25,
          orderCellsTop: true,
          fixedHeader: true,
          orderMulti: true,
          buttons: [
            {
              text: '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/65e83b4c6d4d7190c5f268b9_expand-all.svg" alt="expand-all">',
              titleAttr: "Rozwiń wszystkie",
              action: function (e, dt) {
                dt.rows().every(function () {
                  const row = this;
                  const rowData = row.data();
                  if (
                    Array.isArray(rowData.asks) &&
                    rowData.asks.length > 0 &&
                    !row.child.isShown()
                  ) {
                    row.child(format(rowData)).show();
                    $(row.node()).addClass("shown");
                  }
                });
              },
            },
            {
              text: '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/65e83bae9eb38d00e79cb7d9_collapse-all.svg" alt="collapse-all">',
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
            info: "Pokazuje _START_ - _END_ z _TOTAL_ rezultatów",
            infoEmpty: "Brak danych",
            infoFiltered: "(z _MAX_ rezultatów)",
            lengthMenu: "Pokaż _MENU_ rekordów",
            loadingRecords: "<div class='spinner'</div>",
            processing: "<div class='spinner'</div>",
            search: "Szukaj:",
            zeroRecords: "Brak pasujących rezultatów",
            paginate: { first: "<<", last: ">>", next: " >", previous: "< " },
            aria: {
              sortAscending: ": Sortowanie rosnące",
              sortDescending: ": Sortowanie malejące",
            },
          },
          data: resultProducts.items,
          search: { return: true },

          columns: [
            {
              data: null,
              defaultContent: "",
              createdCell: function (cell, cellData, rowData) {
                if (rowData.asks && rowData.asks.length > 0) {
                  $(cell).addClass("details-control");
                }
              },
              orderable: false,
            },
            { orderable: true, data: "name" },
            {
              orderable: true,
              data: "countryDistributorName",
              defaultContent: "-",
            },
            { orderable: true, data: "gtin" },
            {
              orderable: true,
              data: "stock",
              render: function (data) {
                if (data !== null) return "" + data.value;
                return "0";
              },
            },
            {
              orderable: true,
              data: "quantity",
              render: function (data, type) {
                if (type === "display") {
                  return (
                    '<input type="number" style="max-width: 80px" ' +
                    'onkeypress="return event.charCode >= 48 && (this.value.length < 6 || this.value < 999999)" ' +
                    'min="0" max="999999" value="' +
                    (data ?? "") +
                    '" onpaste="handlePaste(event)">'
                  );
                }
                return data;
              },
            },
            {
              orderable: true,
              data: "standardPrice",
              render: function (data) {
                if (data !== null) return "" + data.value.toFixed(2);
                return "0";
              },
            },
            {
              orderable: true,
              data: "netPrice",
              render: function (data, type, row) {
                if (row.purchaseSegments && row.purchaseSegments.length > 1) {
                  let totalQuantity = 0;
                  let totalValue = 0;
                  let breakdown = [];
                  row.purchaseSegments.forEach((segment) => {
                    totalQuantity += segment.quantity;
                    totalValue += segment.netPrice * segment.quantity;
                    breakdown.push(
                      `${segment.quantity} szt. × ${segment.netPrice.toFixed(
                        2
                      )} zł`
                    );
                  });
                  const weightedPrice = (totalValue / totalQuantity).toFixed(2);
                  const breakdownText = breakdown.join("\n");
                  return `
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <strong>${weightedPrice} zł</strong>
                    <span style="cursor: pointer;" onclick="alert('Cena ważona z segmentów:\\n${breakdownText}')">ℹ️</span>
                  </div>
                `;
                }
                if (data !== null)
                  return `<strong>${data.toFixed(2)} zł</strong>`;
                return "0";
              },
            },
            {
              orderable: true,
              orderData: [8, 1],
              data: null,
              render: function (data) {
                const disabled =
                  data.assignmentSource === "exclusive" ? "disabled" : "";
                return (
                  '<p style="font-size:0;display:none">' +
                  (data.wholesalerKey || "") +
                  "</p>" +
                  generateWholesalerSelect(
                    data.wholesalerKey,
                    data.asks,
                    0,
                    data.assignmentSource,
                    "#table_splited_wh",
                    disabled // przekaż parametr
                  )
                );
              },
            },
            {
              orderable: true,
              data: "assignmentSource",
              render: function (data) {
                if (data !== null) {
                  if (data === "best match") {
                    return '<div style="display: flex;"><img loading="lazy" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d6bd8990da458a9f9cd78_smart-basket.svg" alt="" class="small-icon nomargins" style="margin: auto;"><p style="font-size: 0;">1</p></div>';
                  } else if (data === "exclusive") {
                    return '<div style="display: flex;"><img loading="lazy" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d4663e22be5693754eea7_lock-filled.svg" alt="" class="small-icon nomargins" style="margin: auto;"><p style="font-size: 0;">2</p></div>';
                  } else if (data === "preferential match") {
                    return '<div style="display: flex;"><img loading="lazy" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/661ac96de52db7d23c282bd7_marketplace_preferential.svg" alt="" class="small-icon nomargins" style="margin: auto;"><p style="font-size: 0;">3</p></div>';
                  } else {
                    return '<div style="display: flex;"><img loading="lazy" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d463e9ce9fb54c6dfda04_person-circle.svg" alt="" class="small-icon nomargins" style="margin: auto;"><p style="font-size: 0;">4</p></div>';
                  }
                } else {
                  return '<p class="neutral">-</p>';
                }
              },
            },
            {
              orderable: true,
              data: null,
              width: "80px",
              render: function (data) {
                let currentPrice = null;

                if (data && data.hasOwnProperty("asks") && data.asks !== null) {
                  if (data.netNetPrice !== null && data.netPrice !== null) {
                    currentPrice = Math.min(data.netNetPrice, data.netPrice);
                  } else {
                    currentPrice =
                      data.netNetPrice !== null
                        ? data.netNetPrice
                        : data.netPrice;
                  }
                  if (currentPrice === null) return "<td>0.00%</td>";

                  let lowestNetPrice = Infinity;
                  let lowestNetNetPrice = Infinity;

                  // ✅ bierzemy tylko aski z valid === true i niepotwierdzone
                  data.asks
                    .filter(
                      (ask) =>
                        ask && ask.valid === true && ask.confirmed !== true
                    )
                    .forEach((ask) => {
                      if (ask.netPrice !== null) {
                        lowestNetPrice = Math.min(lowestNetPrice, ask.netPrice);
                      }
                      if (ask.netNetPrice !== null) {
                        lowestNetNetPrice = Math.min(
                          lowestNetNetPrice,
                          ask.netNetPrice
                        );
                      }
                    });

                  if (lowestNetNetPrice === Infinity) lowestNetNetPrice = null;

                  let lowestPrice;
                  if (
                    lowestNetPrice !== Infinity &&
                    lowestNetNetPrice !== null
                  ) {
                    lowestPrice = Math.min(lowestNetPrice, lowestNetNetPrice);
                  } else {
                    lowestPrice =
                      lowestNetPrice !== Infinity ? lowestNetPrice : null;
                  }

                  if (lowestPrice !== null && currentPrice > lowestPrice) {
                    const diffPercent = (
                      ((currentPrice - lowestPrice) / currentPrice) *
                      100
                    ).toFixed(2);
                    return `<td>${diffPercent}%<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/63beccb22f025b6529660dda_lower%20the%20price.svg" style="margin-left: 4px;"></td>`;
                  } else {
                    return '<td>0.00%<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/63beccb22e2647577ef4fd95_lowest%20price.svg" style="margin-left: 4px;"></td>';
                  }
                } else {
                  return '<td>0.00%<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/63beccb22e2647577ef4fd95_lowest%20price.svg" style="margin-left: 4px;"></td>';
                }
              },
            },
            {
              orderable: true,
              data: "standardPrice",
              render: function (data) {
                if (
                  data !== null &&
                  data.hasOwnProperty("wholesalerPremium") &&
                  data.wholesalerPremium !== null
                ) {
                  if (data.wholesalerPremium >= 0) {
                    return (
                      '<p class="positive">' + data.wholesalerPremium + "</p>"
                    );
                  } else {
                    return (
                      '<p class="negative">' + data.wholesalerPremium + "</p>"
                    );
                  }
                } else {
                  return '<p class="positive">0</p>';
                }
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
              width: "80px",
              data: "confirmed",
              type: "boolean",
              render: function (data, type) {
                if (type === "display") {
                  const detailsIcon = `<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6240120504eebc8de2698a1f_panel.svg" alt="details" style="cursor: pointer;" />`;
                  const editIcon = `<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64a0fe50a9833a36d21f1669_edit.svg" alt="edit" style="cursor: pointer;" />`;
                  const trashIcon = `<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg" alt="delete" style="cursor: pointer;" />`;
                  const confirmedIcon = `<img src="https://cdn.prod.website-files.com/6041108bece36760b4e14016/635e6734bc9d9ced67e819e7_done.svg" loading="lazy" alt="Potwierdzono" data-tippy-content="Potwierdzono" style="pointer-events: none; opacity: 0.6; cursor: not-allowed;" />`;
                  if (data === true) {
                    return `<div style="text-align: left; display: flex; align-items: center; gap: 5px;">${detailsIcon}${editIcon}${confirmedIcon}</div>`;
                  } else {
                    return `<div style="text-align: left; display: flex; align-items: center; gap: 5px;">${detailsIcon}${editIcon}${trashIcon}</div>`;
                  }
                }
                return data;
              },
            },
          ],

          rowCallback: function (row, data) {
            if (data && data.hasOwnProperty("asks") && data.asks !== null) {
              let currentPrice;

              if (data.netNetPrice !== null && data.netPrice !== null) {
                currentPrice = Math.min(data.netNetPrice, data.netPrice);
              } else {
                currentPrice =
                  data.netNetPrice !== null ? data.netNetPrice : data.netPrice;
              }

              if (currentPrice !== null) {
                let lowestNetPrice = Infinity;
                let lowestNetNetPrice = Infinity;

                // ✅ tylko ważne, niepotwierdzone aski
                data.asks
                  .filter(
                    (ask) => ask && ask.valid === true && ask.confirmed !== true
                  )
                  .forEach((ask) => {
                    if (ask.netPrice !== null) {
                      lowestNetPrice = Math.min(lowestNetPrice, ask.netPrice);
                    }
                    if (ask.netNetPrice !== null) {
                      lowestNetNetPrice = Math.min(
                        lowestNetNetPrice,
                        ask.netNetPrice
                      );
                    }
                  });

                if (lowestNetNetPrice === Infinity) lowestNetNetPrice = null;

                let lowestPrice;
                if (lowestNetPrice !== Infinity && lowestNetNetPrice !== null) {
                  lowestPrice = Math.min(lowestNetPrice, lowestNetNetPrice);
                } else {
                  lowestPrice =
                    lowestNetPrice !== Infinity ? lowestNetPrice : null;
                }

                if (lowestPrice !== null && currentPrice > lowestPrice) {
                  $("td", row).css("background-color", "#FFFAE6");
                }
              }
            }

            if (data.confirmed === true) {
              $(row).css({
                "background-color": "transparent",
                "font-style": "italic",
                "font-weight": "300",
                cursor: "not-allowed",
              });
              $(row).attr(
                "data-tippy-content",
                "Produkt zamówiony, edycja jest niemożliwa"
              );
              $(row).find("input, select, button").attr("disabled", true).css({
                "pointer-events": "none",
                opacity: "0.6",
                cursor: "not-allowed",
              });
            }
          },
          initComplete: function () {
            initializeSimpleTooltips();
            const api = this.api();

            let splFilterRedrawTimer = null;
            let lastWhValue = $("#CartwholesalerKeyIndicator").val() || "";
            let lastRotValue = $("#CartRotationIndicator").val() || "";

            // --- globalny dropdown dostawcy ---
            $("#CartwholesalerKeyIndicator")
              .off("change._spl")
              .on("change._spl", function () {
                const newVal = this.value || "";

                // jeśli wartość się nie zmieniła – nic nie rób
                if (newVal === lastWhValue) return;
                lastWhValue = newVal;

                if (splFilterRedrawTimer) clearTimeout(splFilterRedrawTimer);
                splFilterRedrawTimer = setTimeout(() => {
                  api.draw(false); // zawężenie tabeli po nowym dostawcy
                }, 0); // może być 0–30ms, chodzi tylko o oddanie sterowania UI
              });

            // --- filtr rotacji ---
            $("#CartRotationIndicator")
              .off("change._spl")
              .on("change._spl", function () {
                const newVal = this.value || "";

                if (newVal === lastRotValue) return;
                lastRotValue = newVal;

                if (splFilterRedrawTimer) clearTimeout(splFilterRedrawTimer);
                splFilterRedrawTimer = setTimeout(() => {
                  api.draw(false);
                }, 0);
              });

            // Upewnij się, że selekt w kolumnie ma klasę (na wypadek gdyby helper jej nie dodał)
            $("#spl_table")
              .find("select")
              .each(function () {
                $(this).addClass("wh-picker");
                const $row = $(this).closest("tr");
                const d = api.row($row).data() || {};
                $(this).data("initialValue", d.wholesalerKey || "");
              });

            // Dodatki UI
            $("#lowerprice").removeClass("details-invisible");
            $("#spl_table").wrap(
              "<div style='overflow:auto; width:100%;position:relative;'></div>"
            );

            api.columns.adjust().draw();

            // ENTER uruchamia globalne filtrowanie
            const textBox = $("#spl_table_filter label input");
            textBox.off(".enter").on("keyup.enter input.enter", function (e) {
              if (e.keyCode === 13) {
                api.search(this.value).draw();
              }
            });
          },
        });
        // cache potwierdzonych dostawców przed każdym rysowaniem
        table.on("preDraw", function () {
          splConfirmedWholesalers = new Set();
          const data = table.rows().data();
          for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (row && row.confirmedAt) {
              splConfirmedWholesalers.add(row.wholesalerKey);
            }
          }
        });
      },
    });
  }

  function makeChangesToOrder() {
    return new Promise((resolve, reject) => {
      if (changesPayload.length > 0) {
        var action =
          InvokeURL + "shops/" + shopKey + "/orders/" + orderId + "/products";
        var method = "PATCH";
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
          data: JSON.stringify(changesPayload),
          processData: false,
          success: function (resultData) {
            try {
              if (resultData.errorMessage) {
                const parsedError = JSON.parse(resultData.errorMessage);
                if (parsedError.code === 409) {
                  displayMessage(
                    "Błąd",
                    "Nie można edytować produktów, które zostały już potwierdzone."
                  );
                  reject(parsedError); // odrzucamy, mimo 200
                  return;
                }
              }

              // brak błędu, normalna ścieżka
              resolve(resultData);
              changesPayload = [];
            } catch (e) {
              displayMessage(
                "Error",
                "Oops. Coś poszło nie tak, spróbuj ponownie."
              );
              reject(e);
            }
          },
          error: function (jqXHR, exception) {
            displayMessage(
              "Error",
              "Oops. Coś poszło nie tak, spróbuj ponownie."
            );
            reject({ jqXHR, exception });
          },
        });
      } else {
        resolve({ message: "No changes made" }); // Dodajemy resolve z odpowiednim komunikatem
      }
    });
  }

  function addBlurOverlay(targetDivId, messageText) {
    // Upewnij się, że nakładka nie została już dodana
    if (
      !$("#" + targetDivId)
        .prev()
        .hasClass("blur-overlay")
    ) {
      const tableDiv = $("#table-content");
      const targetDiv = $("#" + targetDivId);
      const overlayDiv = $('<div class="blur-overlay"></div>');
      const messageDiv = $("<div></div>");

      // Dodaj tekst do messageDiv
      messageDiv.text(messageText);

      // Ustaw inline CSS dla messageDiv
      messageDiv.css({
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        color: "black", // Ustaw kolor tekstu
        fontSize: "16px", // Ustaw rozmiar czcionki
        fontWeight: "bold", // Ustaw pogrubienie czcionki
      });

      overlayDiv.css({
        position: "absolute",
        width: targetDiv.outerWidth(),
        height: targetDiv.outerHeight(),
        top: targetDiv.position().top,
        left: targetDiv.position().left,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(0.5px)",
        pointerEvents: "none",
        zIndex: 10,
      });

      // Dodaj messageDiv do overlayDiv
      overlayDiv.append(messageDiv);

      // Dodaj overlayDiv przed targetDiv
      targetDiv.before(overlayDiv);

      // Dodaj no click event
      tableDiv.css("pointer-events", "none");
    }
  }

  function updateOverlaySize(targetDivId) {
    const targetDiv = $("#" + targetDivId);
    const overlayDiv = targetDiv.prev(".blur-overlay");

    // Sprawdź, czy nakładka istnieje, zanim zaktualizujesz jej rozmiar
    if (overlayDiv.length) {
      overlayDiv.css({
        width: targetDiv.outerWidth(),
        height: targetDiv.outerHeight(),
        top: targetDiv.position().top,
        left: targetDiv.position().left,
      });
    }
  }

  function isValidBarcode(value) {
    // We only allow correct length barcodes
    if (!value.match(/^(\d{8}|\d{12,14})$/)) {
      return false;
    }

    const paddedValue = value.padStart(14, "0");

    let result = 0;
    for (let i = 0; i < paddedValue.length - 1; i += 1) {
      result += parseInt(paddedValue.charAt(i), 10) * (i % 2 === 0 ? 3 : 1);
    }

    return (10 - (result % 10)) % 10 === parseInt(paddedValue.charAt(13), 10);
  }

  function addObject(changesPayload, newObj) {
    const i = changesPayload.findIndex((x) => x.path === newObj.path);
    if (newObj.op === "remove" && "value" in newObj) {
      const { value, ...rest } = newObj;
      newObj = rest;
    }
    if (i > -1) changesPayload[i] = newObj;
    else changesPayload.push(newObj);
    return changesPayload;
  }

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

  // ====== MAPA KOMUNIKATÓW (PL/EN) — bez zmian ======
  const MESSAGE_MAP = {
    "invalid credentials": {
      PL: "Niepoprawne dane logowania.",
      EN: "Invalid credentials.",
    },
    "internal server error": {
      PL: "Wewnętrzny błąd aplikacji.",
      EN: "Internal server error.",
    },
    "missing profile": {
      PL: "Brak przypisanego profilu użytkownika.",
      EN: "Missing user profile.",
    },
    email_notice1: { PL: "Nie znaleziono.", EN: "Not found." },
    "scraper timeout": {
      PL: "Operacja pobierania oferty nie została ukończona w zaplanowanym czasie.",
      EN: "The online offer download operation failed to complete within the desired time.",
    },
    "branch access denied": {
      PL: "Brak dostępu do oddziału.",
      EN: "Branch access denied.",
    },
    email_notice2: {
      PL: "Integracja sklepu z platformą hurtowni została odłączona ze względu na nieprawidłowe dane logowania.",
      EN: "The store's integration with the wholesale platform has been disconnected due to incorrect login credentials.",
    },
    "file not ready": {
      PL: "Plik cennika nie jest dostępny.",
      EN: "Pricelist file not available.",
    },
    "offer not available": {
      PL: "Oferta online nie jest dostępna dla użytkownika.",
      EN: "Online offer is not available for user.",
    },
    "account disabled": {
      PL: "Konto użytkownika zablokowane.",
      EN: "User account disabled.",
    },
    "expired credentials": { PL: "Hasło wygasło.", EN: "Expired credentials." },
    "site cant be accessed": {
      PL: "Platforma e-hurtowni jest niedostępna.",
      EN: "Wholesaler's site can't be accessed.",
    },
  };

  // ====== KANONIZACJA I TŁUMACZENIE ======
  function canonicalize(str) {
    return String(str)
      .toLowerCase()
      .replace(/[’'"]/g, "") // usuń apostrofy/cudzysłowy (can't -> cant)
      .replace(/[.,!?;:]+$/g, "") // usuń końcową interpunkcję
      .replace(/\s+/g, " ") // zredukuj spacje
      .trim();
  }

  // Zbuduj indeks kanoniczny mapy (1x przy starcie)
  const MESSAGE_MAP_CANON = (() => {
    const idx = {};
    Object.keys(MESSAGE_MAP).forEach((k) => {
      idx[canonicalize(k)] = MESSAGE_MAP[k];
    });
    return idx;
  })();

  function translateSingleMessage(msg, lang = "PL") {
    // obsłuż: string lub obiekt {code|key|message|text}
    let raw = "";
    if (typeof msg === "string") {
      raw = msg;
    } else if (msg && typeof msg === "object") {
      raw = msg.code || msg.key || msg.message || msg.text || "";
    }

    const canon = canonicalize(raw);
    const found = MESSAGE_MAP_CANON[canon];

    if (found && found[lang]) return found[lang];

    // fallback — pokaż surowy tekst (lub JSON)
    if (typeof msg === "string") return msg;
    try {
      return msg?.text || msg?.message || JSON.stringify(msg);
    } catch {
      return String(msg);
    }
  }

  function translateMessages(messages, lang = "PL") {
    if (!Array.isArray(messages)) return [];
    return messages.map((m) => translateSingleMessage(m, lang));
  }

  // ====== TWOJA FUNKCJA Z DODANYM TŁUMACZENIEM KOMUNIKATÓW ======
  function getOfferStatus() {
    fetch(`${InvokeURL}shops/${shopKey}/offer/status`, {
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
            const rawMsgs = e.extracting?.messages || [];
            return {
              updatedAt: e.updatedAt,
              status: e.extracting?.status || "unknown",
              messages: translateMessages(rawMsgs, "PL"),
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
            messages: translateMessages(
              latestEvent.extracting?.messages || [],
              "PL"
            ),
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
              wholesalerKey: wms.key || "Program magazynowy",
              source: "Program magazynowy",
              status: latestWmsEvent.extracting?.status || "unknown",
              statusLabel:
                statusMap[latestWmsEvent.extracting?.status] || "Nieznany",
              updatedAt: new Date(latestWmsEvent.updatedAt).toLocaleString(
                "pl-PL"
              ),
              messages: translateMessages(
                latestWmsEvent.extracting?.messages || [],
                "PL"
              ),
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

        const setClass = (id, className) => {
          const el = document.getElementById(id);
          if (el) {
            el.classList.remove("positive", "medium", "negative");
            el.classList.add(className);
          }
        };

        let successCount = 0;
        let errorCount = 0;
        let inProgressCount = 0;
        let allCount = entries.length;

        entries.forEach((entry) => {
          if (entry.status === "success") successCount++;
          else if (entry.status === "error") errorCount++;
          else if (entry.status === "in progress") inProgressCount++;
        });

        setText("offerSuccessCounter", successCount);
        setText("offerErrorCounter", errorCount);
        setText("offerInProgreessCounter", inProgressCount);

        setText("offerAllStatus", `Wszystkie (${allCount})`);
        setText("offerActionStatus", `Problematyczne (${errorCount})`);
        setText("offerSuccessStatus", `Sukces (${successCount})`);

        let completenessLabel = "-";
        let completenessClass = "";

        if (allCount > 0) {
          const percentage = Math.round((successCount / allCount) * 100);
          completenessLabel = `${percentage}%`;

          if (percentage >= 90) {
            completenessClass = "positive";
          } else if (percentage >= 80) {
            completenessClass = "medium";
          } else {
            completenessClass = "negative";
          }
        }

        setText("offerCondition", completenessLabel);
        setClass("offerCondition", completenessClass);
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

  async function getProductHistory(rowData, { startAt, endAt } = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (rowData.stock == null) {
          rowData.stock = { value: 0, unit: "pcs" };
        }

        const now = new Date();
        const endISO = endAt || now.toISOString();
        const startISO =
          startAt ||
          new Date(now.getTime() - 90 * 24 * 3600 * 1000).toISOString();

        const base = `${InvokeURL}shops/${shopKey}/products/${rowData.gtin}`;
        const asksUrl = new URL(`${base}/asks-history`);
        asksUrl.searchParams.set("startAt", startISO);
        asksUrl.searchParams.set("endAt", endISO);

        const wmsUrl = new URL(`${base}/wms-history`);
        wmsUrl.searchParams.set("startAt", startISO);
        wmsUrl.searchParams.set("endAt", endISO);

        async function fetchJSON(url) {
          const res = await fetch(url.toString(), {
            headers: {
              Authorization: orgToken,
              "Requested-By": "webflow-3-4",
            },
          });
          if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status}: ${txt || url}`);
          }
          return res.json();
        }

        const [asksSegments, wmsDaily] = await Promise.all([
          fetchJSON(asksUrl),
          fetchJSON(wmsUrl),
        ]);

        const toISODate = (d) => new Date(d).toISOString().slice(0, 10);

        // WMS dzienne
        const wmsSorted = (Array.isArray(wmsDaily) ? wmsDaily : [])
          .filter((d) => d?.date || d?.timestamp)
          .map((d) => ({
            date: toISODate(d.date ?? d.timestamp),
            retailPrice:
              typeof d.retailPrice === "number" ? d.retailPrice : null,
            standardPrice:
              typeof d.standardPrice === "number" ? d.standardPrice : null,
            stock: Number.isFinite(d.stock) ? d.stock : null,
            volume: Number.isFinite(d.volume) ? d.volume : null,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // ASKS jako segmenty czasowe
        const asksSegmentsSorted = (
          Array.isArray(asksSegments) ? asksSegments : []
        )
          .filter((s) => s?.timestamp)
          .map((s) => {
            const avg =
              typeof s.avgPrice === "number"
                ? s.avgPrice
                : typeof s.average === "number"
                ? s.average
                : null;

            const low =
              typeof s.minPrice === "number"
                ? s.minPrice
                : typeof s.lowest === "number"
                ? s.lowest
                : null;

            return {
              ts: new Date(s.timestamp),
              avg,
              low,
            };
          })
          .sort((a, b) => a.ts - b.ts);

        // mapa WMS po dacie
        const wmsByDate = new Map();
        for (const w of wmsSorted) {
          wmsByDate.set(w.date, w);
        }

        // pełny zakres dni
        const startDay = toISODate(startISO);
        const endDay = toISODate(endISO);

        const allDates = [];
        {
          let cur = new Date(startDay + "T00:00:00.000Z");
          const end = new Date(endDay + "T00:00:00.000Z");
          while (cur <= end) {
            allDates.push(cur.toISOString().slice(0, 10));
            cur.setUTCDate(cur.getUTCDate() + 1);
          }
        }

        const date = [];
        const average = [];
        const lowest = [];
        const retailPrice = [];
        const standardPrice = [];
        const volume = [];
        const stock = [];

        let segIndex = -1;
        for (const day of allDates) {
          const dayEnd = new Date(day + "T23:59:59.999Z");

          while (
            segIndex + 1 < asksSegmentsSorted.length &&
            asksSegmentsSorted[segIndex + 1].ts <= dayEnd
          ) {
            segIndex += 1;
          }

          const seg = segIndex >= 0 ? asksSegmentsSorted[segIndex] : null;
          const w = wmsByDate.get(day) || null;

          date.push(day);
          average.push(seg ? seg.avg : null);
          lowest.push(seg ? seg.low : null);
          retailPrice.push(w?.retailPrice ?? null);
          standardPrice.push(w?.standardPrice ?? null);
          volume.push(w?.volume ?? null);
          stock.push(w?.stock ?? null);
        }

        // pomocnicze funkcje
        const lastDefined = (arr) => {
          for (let i = arr.length - 1; i >= 0; i--) {
            const v = arr[i];
            if (typeof v === "number" && isFinite(v)) return v;
          }
          return null;
        };

        const firstDefined = (arr) => {
          for (let i = 0; i < arr.length; i++) {
            const v = arr[i];
            if (typeof v === "number" && isFinite(v)) return v;
          }
          return null;
        };

        const setText = (id, value) => {
          const el = document.getElementById(id);
          if (!el) return;
          el.textContent = value;
        };

        const setChange = (id, current, base) => {
          const el = document.getElementById(id);
          if (!el) return;

          if (
            typeof current === "number" &&
            typeof base === "number" &&
            base !== 0
          ) {
            const diff = ((current - base) / base) * 100;
            const rounded = diff.toFixed(0);
            const sign = diff > 0 ? "+" : diff < 0 ? "" : "+";
            el.textContent = `(${sign}${rounded}%)`;

            el.classList.remove(
              "neutral-value",
              "positive-value",
              "negative-value",
              "hide"
            );
            if (diff > 0.1) {
              el.classList.add("positive-value");
            } else if (diff < -0.1) {
              el.classList.add("negative-value");
            } else {
              el.classList.add("neutral-value");
            }
          } else {
            el.textContent = "(+0%)";
            el.classList.add("neutral-value", "hide");
          }
        };

        // zakres cen do osi
        const priceVals = [
          ...average,
          ...lowest,
          ...retailPrice,
          ...standardPrice,
        ].filter((v) => typeof v === "number" && isFinite(v));

        let scaleMin = 0;
        let scaleMax = 1;

        if (priceVals.length) {
          const minV = Math.min(...priceVals);
          const maxV = Math.max(...priceVals);
          const spread = Math.max(maxV - minV, Math.abs(maxV) * 0.05, 0.01);
          scaleMin = minV - spread * 0.2;
          scaleMax = maxV + spread * 0.2;
        } else {
          scaleMin = 0;
          scaleMax = 2;
        }

        // zakres ilości
        const qtyVals = [...stock, ...volume].filter(
          (v) => typeof v === "number" && isFinite(v)
        );
        const qtyMax = qtyVals.length
          ? Math.max(1, Math.ceil(Math.max(...qtyVals) / 0.9))
          : 1;

        // uzupełnienie kafelków nagłówka

        // nazwa produktu i EAN
        if (rowData.name) setText("pName", rowData.name);
        if (rowData.gtin) {
          const eanEl = document.getElementById("pEan");
          if (eanEl) {
            eanEl.textContent = rowData.gtin;
            eanEl.href = "#";
          }
        }

        // analizowany okres
        const historyDays = allDates.length > 1 ? allDates.length - 1 : 0;
        setText("pHistory", String(historyDays));

        const spanEl = document.getElementById("pHistorySpan");
        if (spanEl) {
          if (allDates.length) {
            spanEl.textContent = `${allDates[0]} – ${
              allDates[allDates.length - 1]
            }`;
          } else {
            spanEl.textContent = "";
          }
        }

        // aktualne ceny detaliczne i ewidencyjne
        const lastRetail = lastDefined(retailPrice);
        const firstRetail = firstDefined(retailPrice);
        const lastStandard = lastDefined(standardPrice);
        const firstStandard = firstDefined(standardPrice);

        if (lastRetail != null) setText("pRetailPrice", lastRetail.toFixed(2));
        if (lastStandard != null)
          setText("pStandardPrice", lastStandard.toFixed(2));

        setChange("pRetailPriceChange", lastRetail, firstRetail);
        setChange("pStandardPriceChange", lastStandard, firstStandard);

        // najlepsza cena zakupu z rowData, jeśli jest
        if (typeof rowData.bestPurchasePrice === "number") {
          setText("pBestPrice", rowData.bestPurchasePrice.toFixed(2));
        }

        // stan magazynowy i jednostka
        const lastStock = lastDefined(stock);
        if (lastStock != null) {
          setText("pInStock", String(Math.round(lastStock)));
        } else if (typeof rowData.stock.value === "number") {
          setText("pInStock", String(Math.round(rowData.stock.value)));
        }

        const unitEl = document.getElementById("pUnit");
        if (unitEl) {
          unitEl.textContent = rowData.stock.unit || "szt";
        }

        // sprzedaż ostatnich siedmiu dni i dziewięćdziesięciu dni
        const vols = volume.map((v) =>
          typeof v === "number" && isFinite(v) ? v : 0
        );

        const sumLast = (n) => {
          if (!vols.length) return 0;
          let sum = 0;
          const len = vols.length;
          const limit = Math.max(0, len - n);
          for (let i = len - 1; i >= limit; i--) {
            sum += vols[i];
          }
          return sum;
        };

        const sales7 = sumLast(7);
        const sales90 = sumLast(90);

        setText("pSales7", String(Math.round(sales7)));
        setText("pSales90", String(Math.round(sales90)));

        // stan w dniach na podstawie sprzedaży z dziewięćdziesięciu dni
        let stockDays = 0;
        if (sales90 > 0) {
          const daysUsed = Math.min(90, vols.length);
          const avgDaily = sales90 / daysUsed;
          if (
            avgDaily > 0 &&
            (lastStock != null || rowData.stock.value != null)
          ) {
            const curStock =
              lastStock != null ? lastStock : Number(rowData.stock.value) || 0;
            stockDays = Math.round(curStock / avgDaily);
          }
        }
        setText("pStockDays", String(stockDays));

        // wskaźnik rotacji
        const indicator =
          rowData.rotationClass || rowData.indicator || rowData.axbx || "";
        if (indicator) {
          setText("pIndicator", indicator);
        }

        // rysowanie wykresu

        const NEWEST_ON_LEFT = false;
        const maybeReverse = (arr) =>
          NEWEST_ON_LEFT ? arr.slice().reverse() : arr;

        const datesForChart = maybeReverse(date);
        const avgForChart = maybeReverse(average);
        const lowForChart = maybeReverse(lowest);
        const retailForChart = maybeReverse(retailPrice);
        const standardForChart = maybeReverse(standardPrice);
        const volumeForChart = maybeReverse(volume);
        const stockForChart = maybeReverse(stock);

        const options = {
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
          defaultLocale: "pl",

          series: [
            { name: "Srednia", type: "line", data: avgForChart },
            { name: "Najnizsza", type: "line", data: lowForChart },
            { name: "Cena det.", type: "line", data: retailForChart },
            { name: "Cena ew.", type: "line", data: standardForChart },
            { name: "Sprzedaz", type: "bar", data: volumeForChart },
            { name: "Stan", type: "bar", data: stockForChart },
          ],

          chart: {
            id: "productHistoryChart",
            height: 350,
            type: "line",
            stacked: false,
            toolbar: {
              show: true,
              tools: {
                download: true,
                selection: true,
                zoom: true,
                zoomin: true,
                zoomout: true,
                pan: true,
                reset: true,
              },
              export: {
                csv: {
                  filename: "PlikCSV",
                  columnDelimiter: ";",
                  headerCategory: "category",
                  headerValue: "value",
                },
                svg: { filename: "Wykres" },
                png: { filename: "Wykres" },
              },
              autoSelected: "zoom",
            },
          },

          colors: [
            "#F9C80E",
            "#4CAF50",
            "#3F51B5",
            "#03A9F4",
            "#92A9BD",
            "#D3DEDC",
          ],
          dataLabels: { enabled: false },
          stroke: { width: [2, 2, 2, 2, 0, 0], curve: "smooth" },
          plotOptions: { bar: { columnWidth: "50%" } },
          markers: { size: 0 },

          xaxis: {
            type: "category",
            categories: datesForChart,
            labels: {
              show: true,
              rotate: -45,
              hideOverlappingLabels: true,
            },
          },

          yaxis: [
            {
              max: scaleMax,
              min: scaleMin,
              forceNiceScale: false,
              title: { text: "Cena" },
              labels: {
                formatter: (v) => (typeof v === "number" ? v.toFixed(2) : v),
              },
            },
            {
              max: scaleMax,
              min: scaleMin,
              forceNiceScale: false,
              show: false,
              labels: {
                formatter: (v) => (typeof v === "number" ? v.toFixed(2) : v),
              },
            },
            {
              max: scaleMax,
              min: scaleMin,
              forceNiceScale: false,
              show: false,
              labels: {
                formatter: (v) => (typeof v === "number" ? v.toFixed(2) : v),
              },
            },
            {
              max: scaleMax,
              min: scaleMin,
              forceNiceScale: false,
              show: false,
              labels: {
                formatter: (v) => (typeof v === "number" ? v.toFixed(2) : v),
              },
            },
            {
              opposite: true,
              max: qtyMax,
              min: 0,
              forceNiceScale: true,
              title: { text: "Ilość" },
              labels: {
                formatter: (v) =>
                  typeof v === "number" ? String(Math.round(v)) : v,
              },
            },
            {
              opposite: true,
              max: qtyMax,
              min: 0,
              forceNiceScale: true,
              show: false,
              labels: {
                formatter: (v) =>
                  typeof v === "number" ? String(Math.round(v)) : v,
              },
            },
          ],

          tooltip: {
            shared: true,
            intersect: false,
            y: {
              formatter: (y, { seriesIndex }) => {
                if (y == null || Number.isNaN(y)) return "";
                return seriesIndex <= 3
                  ? Number(y).toFixed(2)
                  : String(Math.round(y));
              },
            },
          },

          legend: {
            position: "right",
            horizontalAlign: "center",
            markers: { width: 12, height: 12, radius: 12 },
          },
        };

        if (window.__phChart) {
          await window.__phChart.destroy();
          window.__phChart = null;
        }

        window.__phChart = new ApexCharts(
          document.getElementById("chart"),
          options
        );
        await window.__phChart.render();

        resolve();
      } catch (err) {
        console.error(err);
        reject("Błąd podczas pobierania lub rysowania historii produktu.");
      }
    });
  }

  const ASK_CODE_MAP = {
    // 1xxx – błędy ekstrakcji (źródłowe)
    1001: {
      name: "Podwójny produkt",
      desc: "Powielona oferta dla tego samego towaru.",
      scope: ["r", "p"],
    },
    1002: {
      name: "Błędne dane",
      desc: "Nie udało się odczytać warunków oferty.",
      scope: ["r"],
    },
    1003: {
      name: "Problem z promocją",
      desc: "Nie udało się odczytać promocji.",
      scope: ["r"], // w specyfikacji występuje „R”; traktujemy jak regular ask
    },
    1004: {
      name: "Zła promocja",
      desc: "Promocja ma niepoprawne dane.",
      scope: ["p"],
    },
    1005: {
      name: "Błąd oferty",
      desc: "Promocja została wykluczona z powodu nieprawidłowej ceny regularnej.",
      scope: ["p"],
    },
    1006: {
      name: "Powtórzona promocja",
      desc: "Powielona promocja o tych samych warunkach.",
      scope: ["p"],
    },
    1007: {
      name: "Błędna promocja gratis",
      desc: "Dane o gratisach są niepoprawne.",
      scope: ["p"],
    },
    1008: {
      name: "Błędna promocja pakietowa",
      desc: "Jeden z produktów należących do promocji pakietowej jest nieprawidłowy.",
      scope: ["p"],
    },
    1009: {
      name: "Niepoprawny kod produktu",
      desc: "Kod produktu jest błędny.",
      scope: ["n"], // nie jest zapisywany w DB (wiersz nie może powstać bez klucza produktu)
    },
    1010: {
      name: "Promocja przy zduplikowanej ofercie",
      desc: "Promocja została wykluczona z powodu powielonej oferty regularnej.",
      scope: ["p"],
    },

    // 2xxx – błędy transformacji (obróbki)
    2001: {
      name: "Zbyt dziwna cena",
      desc: "Oferta odrzucona – cena zbyt odbiega od średniej ceny rynkowej.",
      scope: ["r"],
    },

    // 3xxx – błędy wyświetlania / stanów
    3001: {
      name: "Brak towaru",
      desc: "Nie ma tego towaru na stanie.",
      scope: ["r", "p"],
    },
  };

  function escapeAttr(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function escapeTextKeepNewlines(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;"); // nie ruszamy \n
  }

  function formatMessageCodesTooltip(codes = []) {
    if (!Array.isArray(codes) || codes.length === 0) return "Brak kodów błędów";

    const lines = codes.map((c) => {
      const code = String(c).trim();
      const meta = ASK_CODE_MAP[code] || ASK_CODE_MAP[Number(code)];
      const desc = meta?.desc || "Nieznany błąd";
      return `${desc} [${code}]`;
    });

    // Dla atrybutu title – nowa linia przez \n
    return escapeTextKeepNewlines(lines.join("\n"));
  }

  function getWholesalersSh() {
    let url = new URL(InvokeURL + "wholesalers" + "?enabled=true&perPage=1000");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      if (request.status === 401) {
        console.log("Unauthorized");
        return;
      }
      if (request.status >= 200 && request.status < 400) {
        const data = JSON.parse(this.response);
        const select = document.getElementById("wholesalerKeyIndicator");
        const sorted = data.items
          .filter((w) => w.enabled)
          .sort((a, b) =>
            (a.name || "").localeCompare(b.name || "", "pl", {
              sensitivity: "base",
            })
          );
        sessionStorage.setItem("wholesalersData", JSON.stringify(sorted));

        sorted.forEach((w) => {
          const opt = document.createElement("option");
          opt.value = w.wholesalerKey; // wartość formularza
          opt.textContent = w.wholesalerKey; // etykieta widoczna dla użytkownika
          select.appendChild(opt);
        });
      }
    };
    request.send();
  }

  function getWhSmartVan(wholesalerKey) {
    return new Promise((resolve, reject) => {
      let url2 = new URL(
        InvokeURL +
          "shops/" +
          shopKey +
          "/wholesalers/" +
          wholesalerKey +
          "/smartvan"
      );
      let request2 = new XMLHttpRequest();
      request2.open("GET", url2, true);
      request2.setRequestHeader("Authorization", orgToken);

      request2.onload = function () {
        if (request2.status >= 200 && request2.status < 400) {
          var data2 = JSON.parse(this.response);

          let smtpEmailInput = document.getElementById("orderEmail");
          let smtpEmail = data2.smtp ? data2.smtp.email : null;

          let formatsSelect = document.getElementById("formats");
          let formats = data2.smtp ? data2.smtp.formats : [];

          // Obsługa adresu e-mail
          if (smtpEmail === null) {
            smtpEmailInput.value = "";
            smtpEmailInput.disabled = false;
            console.log("zresetowano adres e-mail");
          } else {
            smtpEmailInput.value = smtpEmail;
            smtpEmailInput.disabled = true;
          }

          // Reset zaznaczeń w <select>
          for (let i = 0; i < formatsSelect.options.length; i++) {
            formatsSelect.options[i].selected = false;
          }

          if (formats && formats.length > 0) {
            // Zaznacz dostępne formaty
            formats.forEach(function (format) {
              let option = formatsSelect.querySelector(
                `option[value="${format}"]`
              );
              if (option) {
                option.selected = true;
              }
            });

            // Zablokuj select
            formatsSelect.disabled = true;
            console.log("zaktualizowano i zablokowano formaty");
          } else {
            // Odblokuj select, gdy brak formatów
            formatsSelect.disabled = false;
            console.log("zresetowano i odblokowano formaty");
          }

          resolve(data2);
        } else if (request2.status >= 400) {
          console.log("Błąd: ", request2.status, this.response);
          reject(new Error("Błąd HTTP: " + request2.status));
        } else {
          console.log("Nieoczekiwany błąd");
          reject(new Error("Nieoczekiwany błąd"));
        }
      };

      request2.onerror = function () {
        reject(new Error("Błąd połączenia z serwerem."));
      };

      request2.send();
    });
  }

  function calculateAndDisplayTimeSavings(responseData) {
    // Oblicz całkowitą liczbę ofert (asks) dla wszystkich produktów
    let totalOffers = 0;

    if (
      responseData &&
      responseData.items &&
      Array.isArray(responseData.items)
    ) {
      responseData.items.forEach((item) => {
        if (item.asks && Array.isArray(item.asks)) {
          totalOffers += item.asks.length;
        }
      });
    }

    // Oblicz czas zaoszczędzony w sekundach (liczba ofert × 5 sekund)

    const timeSavedInSeconds = totalOffers * 5;

    // Przelicz sekundy na minuty i zaokrąglij w górę
    let timeSavedInMinutes = Math.ceil(timeSavedInSeconds / 60);

    // Formatuj czas w zależności od długości
    let timeText;
    if (timeSavedInMinutes < 60) {
      timeText = `${timeSavedInMinutes} min`;
    } else {
      const hours = Math.floor(timeSavedInMinutes / 60);
      const minutes = timeSavedInMinutes % 60;
      timeText = `${hours} h ${minutes} min`;

      timeText = minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
    }

    // Zaktualizuj element #timesavings
    const timeSavingsElement = document.getElementById("timesavings");
    if (timeSavingsElement) {
      timeSavingsElement.textContent = timeText;
    }

    return timeSavedInMinutes;
  }

  function fetchDataFromEndpoint() {
    let url = new URL(
      InvokeURL +
        "shops/" +
        shopKey +
        "/orders/" +
        orderId +
        "/products?perPage=10000"
    );
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        const productsData = JSON.parse(request.responseText);
        saveToSessionStorage(productsData);
        calculateAndDisplayTimeSavings(productsData); // Dodane wywołanie funkcji
      } else {
        console.log("Błąd podczas pobierania danych z endpointu.");
      }
    };
    request.send();
  }

  makeWebflowFormUndoOrder = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        event.preventDefault();

        const modal = $("#undoOrderModal");
        const wholesalerKey = modal.data("wholesaler-key");

        const action =
          InvokeURL +
          "shops/" +
          shopKey +
          "/orders/" +
          orderId +
          "/wholesalers/" +
          wholesalerKey;

        const method = "PATCH";
        const payload = [
          {
            op: "replace",
            path: "/confirmed",
            value: false,
          },
        ];

        $.ajax({
          type: method,
          url: action,
          cors: true,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            setTimeout(function () {
              $("#waitingdots").hide();
            }, 10);
          },
          contentType: "application/json",
          dataType: "json",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: orgToken,
            "Requested-By": "webflow-3-4",
          },
          data: JSON.stringify(payload),
          success: function (resultData, textStatus, jqXHR) {
            const isNoContent = jqXHR.status === 204;

            if (isNoContent || (resultData && resultData.success)) {
              if (typeof successCallback === "function") {
                const result = successCallback(resultData);
                if (!result) {
                  form.show();
                  displayMessage(
                    "Error",
                    "Wystąpił problem z cofnięciem zamówienia."
                  );
                  return;
                }
              }

              displayMessage(
                "Success",
                "Zamówienie do dostawcy zostało cofnięte. Za moment zamówienie zostanie ponownie podzielone."
              );
              $("#undoOrderModal").hide();
              setTimeout(function () {
                location.reload();
              }, 1500);
            } else {
              form.show();
              displayMessage(
                "Error",
                "Oops. Coś poszło nie tak, spróbuj ponownie."
              );
            }
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();

            if (e.status === 409) {
              displayMessage(
                "Error",
                "Nie można cofnąć – zamówienie zostało już zrealizowane lub wysłano e-mail."
              );
            } else {
              displayMessage(
                "Error",
                "Oops. Coś poszło nie tak, spróbuj ponownie."
              );
            }

            console.log(e);
          },
        });

        return false;
      });
    });
  };

  makeWebflowFormAjaxDelete = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action = InvokeURL + "shops/" + shopKey + "/orders/" + orderId;
        var method = "DELETE";

        $.ajax({
          type: method,
          url: action,
          cors: true,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            setTimeout(function () {
              $("#waitingdots").hide();
            }, 3000); // 1000 milliseconds = 1 second
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
                console.log(e);
                return;
              }
            }
            $("#deleteorderdmodal").hide();
            displayMessage("Error", "Twoje zamówienie zostało usunięte.");
            window.setTimeout(function () {
              document.location =
                "https://" + DomainName + "/app/shops/shop?shopKey=" + shopKey;
            }, 2000);
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

  sendEmailToWholesaler = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        event.preventDefault();

        // Pobieranie wartości z formularza
        var wholesalerKeyToSend = $("#orderWholesalerKey").attr("data-key");
        var orderEmail = $("#orderEmail").val();
        var formats = $("#formats").val();
        var orderEmailMe = $("#orderEmailMe").is(":checked");
        var orderId = new URL(location.href).searchParams.get("orderId");
        var isEmailDisabled = $("#orderEmail").is(":disabled");

        // Resetowanie podświetlenia błędów
        $("#formats").removeClass("error-highlight");

        // Walidacja formatów
        if (!formats || formats.length < 1) {
          displayMessage(
            "Error",
            "Proszę wybrać przynajmniej jeden format danych do wysyłki."
          );
          $("#formats").addClass("error-highlight");
          return false;
        }

        // Przygotowanie danych do wysłania
        var requestData = {
          orderId: orderId,
          wholesalerKey: wholesalerKeyToSend,
          formats: formats,
          ccToMe: orderEmailMe,
        };

        var action = InvokeURL + "van/orders";
        var method = "POST";

        const updateEmailAndFormats = () => {
          return new Promise((resolve, reject) => {
            if (isEmailDisabled || !orderEmail) {
              resolve(); // Pomijamy jeśli email jest disabled lub pusty
              return;
            }

            var patchAction =
              InvokeURL +
              "shops/" +
              shopKey +
              "/wholesalers/" +
              wholesalerKeyToSend +
              "/smartvan";

            var patchData = [];

            // Pobierz email z inputa i formaty z <select>
            var email = $("#orderEmail").val();
            var formats = $("#formats").val();

            // Dodaj email, jeśli istnieje
            if (email)
              patchData.push({ op: "add", path: "/smtp/email", value: email });

            // Dodaj formaty
            formats.forEach((format) =>
              patchData.push({
                op: "add",
                path: "/smtp/formats/-",
                value: format,
              })
            );

            $.ajax({
              type: "PATCH",
              url: patchAction,
              cors: true,
              contentType: "application/json",
              dataType: "json",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: orgToken,
                "Requested-By": "webflow-3-4",
              },
              data: JSON.stringify(patchData),
              success: function () {
                $("#orderEmail").prop("disabled", true);
                resolve();
              },
              error: function (jqXHR, exception) {
                console.log("error", jqXHR, exception);
                let msg = "";
                switch (jqXHR.status) {
                  case 0:
                    msg = "Nie masz połączenia z internetem.";
                    break;
                  case 404:
                    msg = "Nie znaleziono strony";
                    break;
                  case 403:
                    msg =
                      jqXHR.responseJSON?.message ==
                      "User is not an administrator of this tenant"
                        ? "Nie masz uprawnień do tej czynności"
                        : "Dostęp jest obecnie nieaktywny. Aby aktywować ofertę, prosimy o kontakt z dostawcą.";
                    break;
                  case 409:
                    msg =
                      "Nie można zmienić kodu. Jeden ze sklepów wciąż korzysta z tego kodu.";
                    break;
                  case 500:
                    msg =
                      "Serwer napotkał problemy. Prosimy o kontakt kontakt@smartcommerce.net";
                    break;
                  default:
                    msg =
                      exception === "parsererror"
                        ? "Nie udało się odczytać danych"
                        : exception === "timeout"
                        ? "Przekroczony czas oczekiwania"
                        : exception === "abort"
                        ? "Twoje żądanie zostało zaniechane"
                        : jqXHR.responseJSON?.message ||
                          "Wystąpił nieznany błąd";
                    break;
                }
                displayMessage("Error", msg);
                reject(new Error(msg));
              },
            });
          });
        };

        // Funkcja do wysłania właściwego emaila
        const sendOrderEmail = () => {
          return new Promise((resolve, reject) => {
            $("#waitingdots").show();

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
              data: JSON.stringify(requestData),
              success: function (resultData) {
                console.log("Entering success callback"); // Log entry point
                console.log("Received resultData:", resultData); // Log input data

                setTimeout(function () {
                  console.log("Hiding waiting dots after timeout"); // Log timeout action
                  $("#waitingdots").hide();
                }, 3000);

                if (typeof successCallback === "function") {
                  console.log("Success callback function exists, executing it"); // Log callback check
                  var result = successCallback(resultData);
                  console.log("Callback returned:", result); // Log callback result

                  if (!result) {
                    console.log(
                      "Callback returned false, showing error message"
                    ); // Log error case
                    form.show();
                    displayMessage(
                      "Error",
                      "Oops. Coś poszło nie tak, spróbuj ponownie."
                    );
                    reject(new Error("Callback returned false"));
                    return;
                  }
                } else {
                  console.log("No success callback function provided"); // Log no callback case
                }

                // Zaktualizowanie statusu w tabeli
                console.log("Attempting to update table status"); // Log table update start
                var table = $("#table_splited_wh").DataTable();
                if (table) {
                  console.log(
                    "DataTable found, searching for wholesaler:",
                    wholesalerKeyToSend
                  );

                  let found = false;

                  // Aktualizacja confirmedAt w danych
                  table.rows().every(function () {
                    const rowData = this.data();
                    if (rowData.wholesalerKey === wholesalerKeyToSend) {
                      found = true;

                      // Ustawienie daty potwierdzenia
                      const now = new Date().toISOString();
                      rowData.confirmedAt = now;

                      // Upewnij się, że `events` istnieje jako tablica
                      if (!Array.isArray(rowData.events)) {
                        rowData.events = [];
                      }

                      // Dodaj event `emailed`
                      rowData.events.push({
                        type: "emailed",
                        created: {
                          by: "system",
                          at: now,
                        },
                      });

                      this.data(rowData); // zaktualizuj dane
                      table.row(this.index()).invalidate(); // zaktualizuj widok

                      // ✅ Aktualizacja selecta i previous-value
                      const selectElement = $(this.node()).find(
                        ".status-dropdown"
                      );
                      selectElement.find("option").each(function () {
                        if ($(this).text().trim() === "Wysłano") {
                          $(this).prop("selected", true);
                        }
                      });
                      selectElement.data("previous-value", "Wysłano");

                      // Wyłączenie przycisku wysyłki
                      const rowNode = this.node();
                      const sendButton = rowNode.querySelector(".sendemail");
                      if (sendButton) {
                        sendButton.disabled = true;
                        sendButton.classList.add("disabled");
                        sendButton.style.opacity = "0.5";
                        sendButton.style.cursor = "not-allowed";
                      }

                      return false; // zakończ pętlę po pierwszym trafieniu
                    }
                  });

                  if (!found) {
                    console.warn(
                      "Nie znaleziono wiersza dla tego hurtownika.",
                      {
                        wholesalerKeyToSend,
                        tableData: table.rows().data().toArray(),
                      }
                    );
                  }

                  // Przerysowanie tabeli
                  table.draw(false);
                }

                console.log("Showing success message"); // Log before success message
                displayMessage("Success", "Email został wysłany do dostawcy.");
                $("#SendOrderSMTP").hide();
                console.log("Resolving promise with resultData:", resultData); // Log before resolve
                resolve(resultData);
              },
              error: function (jqXHR, textStatus, errorThrown) {
                setTimeout(function () {
                  $("#waitingdots").hide();
                }, 3000);

                let errorMessage =
                  "Oops. Coś poszło nie tak, spróbuj ponownie.";

                if (
                  jqXHR.status === 409 &&
                  jqXHR.responseJSON?.message?.includes("already exists")
                ) {
                  errorMessage =
                    "Wiadomość z zamówieniem została już wcześniej wysłana do tego dostawcy. Nie można wysłać tego samego zamówienia ponownie.";
                } else if (jqXHR.responseJSON?.message) {
                  errorMessage = jqXHR.responseJSON.message;
                }

                displayMessage("Error", errorMessage);

                if (typeof errorCallback === "function") {
                  errorCallback(jqXHR);
                }

                form.show();
                console.log("Błąd podczas wysyłania emaila:", jqXHR);
                reject(jqXHR);
              },
            });
          });
        };

        // Główna sekwencja wykonania
        updateEmailAndFormats()
          .then(() => sendOrderEmail())
          .catch((error) => {
            console.log("Error in sequence:", error);
            // Błąd już został obsłużony w odpowiednich funkcjach
          });

        return false;
      });
    });
  };

  // Dodaj odpowiedni CSS dla podświetlenia błędów
  var errorHighlightStyle = document.createElement("style");
  errorHighlightStyle.innerHTML = `
    .error-highlight {
      border: 2px solid rgb(10, 24, 224) !important;
      box-shadow: 0 0 5px rgba(6, 3, 192, 0.5) !important;
      animation: pulse 0.5s ease-in-out;
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(errorHighlightStyle);

  makeWebflowFormAjaxPatchShopEdit = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        event.preventDefault();

        const url = InvokeURL + "shops/" + shopKey;

        $.ajax({
          type: "GET",
          url: url,
          contentType: "application/json",
          dataType: "json",
          headers: {
            Authorization: orgToken,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Requested-By": "webflow-3-4",
          },
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            $("#waitingdots").hide();
          },
          success: function (currentData) {
            const patchData = preparePatchData(currentData);

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
                setTimeout(function () {
                  $("#waitingdots").hide();
                }, 1000); // 1000 milliseconds = 1 second
              },
              success: function (resultData) {
                if (typeof successCallback === "function") {
                  successCallback(resultData);
                }
                displayMessage("Success", "Twoje dane zostały zaktualizowane.");
                setTimeout(function () {
                  $("#editShopModal").hide();
                  location.reload();
                }, 1000);
              },
              error: function () {
                if (typeof errorCallback === "function") {
                  errorCallback();
                }
                // Show form-done-fail-edit on error
                displayMessage(
                  "Error",
                  "Oops. Coś poszło nie tak, spróbuj ponownie."
                );
              },
            });
          },
          error: function () {
            if (typeof errorCallback === "function") {
              errorCallback();
            }
            // Show form-done-fail-edit on error
            displayMessage(
              "Error",
              "Oops. Coś poszło nie tak, spróbuj ponownie."
            );
          },
        });
        return false; // Prevent the form from submitting normally
      });
    });
  };

  function preparePatchData(currentData) {
    var patchData = [];

    // Name
    var newName = $("#shopNameEdit").val();
    if (newName !== currentData.name) {
      patchData.push({ op: "replace", path: "/name", value: newName });
    }

    // Telephone number

    var newTelephone = $("#shopPhoneEdit").val();
    if (newTelephone === "") {
      newTelephone = null;
    }
    if (newTelephone !== null && newTelephone !== currentData.phones) {
      patchData.push({
        op: "replace",
        path: "/phones",
        value: [{ phone: newTelephone, description: "Główny" }],
      });
    }

    // Address
    var newAddress = {
      country: "Polska", // Assuming the country is always Poland
      line1: $("#shopAdressEdit").val(),
      town: $("#shopTownEdit").val(),
      state: $("#shopStateEdit option:selected").text(),
      postcode: $("#shopPostcodeEdit").val(),
    };

    // Check if the current data has an address to compare against
    var currentAddress = currentData.address || {};
    var addressChanged = Object.keys(newAddress).some(
      (key) => newAddress[key] !== (currentAddress[key] || "")
    );

    if (addressChanged) {
      patchData.push({ op: "replace", path: "/address", value: newAddress });
    }

    // Emails
    var newEmails = [];
    for (let i = 1; i <= 3; i++) {
      let email = $(`#shopEmailEdit${i}`).val();
      let description = $(`#shopEmailEditDescription${i}`).val();
      if (email || description) {
        // Add if either field is filled
        newEmails.push({ email: email, description: description });
      }
    }

    // Only replace emails if there's a difference, using JSON.stringify for a quick deep comparison
    if (JSON.stringify(newEmails) !== JSON.stringify(currentData.emails)) {
      patchData.push({ op: "replace", path: "/emails", value: newEmails });
    }

    return patchData;
  }

  makeWebflowFormAjaxCreate = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var oldname = document.getElementById("new-name");

        var data = {
          organization: OrganizationName,
          organizationId: OrganizationName,
          data: {
            gtin: $("#gtin").val(),
            "old-name": oldname.textContent,
            "new-name": $("#new-name").val(),
            countryDistributorName: $("#countryDistributorName-2").val(),
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

  // === helper: tylko ważne (valid) ask-i z ceną liczbową
  function getValidAsks(asks) {
    if (!Array.isArray(asks)) return [];
    return asks.filter(
      (a) => a && a.valid === true && typeof a.netPrice === "number"
    );
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

      $(document).on(
        "click",
        'input[type="checkbox"].single-checkbox',
        function () {
          const $group = $('input[type="checkbox"].single-checkbox');
          $group.not(this).prop("checked", false);
        }
      );

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
        case 6:
          whichColumns = "stock:";
          break;
        case 7:
          whichColumns = "marketPremium:";
          break;
        case 8:
          whichColumns = "standardPremium:";
          break;
        case 9:
          whichColumns = "standardPrice:";
          break;
        case 11:
          whichColumns = "bestNetPrice:";
          break;
        case 13:
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
        $.get(InvokeURL + "shops/" + shopKey + "/offer" + QStr, function (res) {
          // Ustawienie daty oferty
          if (!offerStatusLoaded) {
            offerStatusLoaded = true;
            getOfferStatus();
            $("#offerCondition").show();
            $("#offerTag").show();
            $("#seeRightPanel").show();
          }

          callback({
            recordsTotal: res.total,
            recordsFiltered: res.total,
            data: res.items,
          });
        });
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
        orderable: false,
        data: null,
        render: function (data) {
          return (
            '<input type="number" style="max-width: 80px" ' +
            'onkeypress="return event.charCode >= 48 && (this.value.length < 6 || this.value < 999999)" ' +
            'min="0" max="999999" value="' +
            (data.quantity ?? "") +
            '" onpaste="handlePaste(event)">'
          );
        },
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
        orderable: false,
        data: "asks",
        render: function (data) {
          const validAsks = getValidAsks(data);
          if (validAsks.length === 0) return "-";
          const hasPromo = validAsks.some((a) => a.promotion != null);
          return hasPromo
            ? '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6186eb480941cdf5b47f9d4e_star.svg" alt="promo">'
            : "-";
        },
      },

      {
        orderable: true,
        data: "asks",
        render: function (data) {
          const validAsks = getValidAsks(data);
          if (validAsks.length === 0) return "-";
          const bestPrice = Math.min(...validAsks.map((a) => a.netPrice));
          return bestPrice.toFixed(2);
        },
      },

      {
        orderable: false,
        data: "asks",
        render: function (data) {
          const validAsks = getValidAsks(data);
          if (validAsks.length === 0) return "-";
          const bestPrice = Math.min(...validAsks.map((a) => a.netPrice));
          const bestWh = [
            ...new Set(
              validAsks
                .filter((a) => a.netPrice === bestPrice)
                .map((a) => a.wholesalerKey)
            ),
          ];
          return bestWh.length ? bestWh.join(", ") : "-";
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
        width: "70px",
        data: null,
        render: function (data, type) {
          if (type === "display") {
            const detailsIcon = `
        <img 
          src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6240120504eebc8de2698a1f_panel.svg" 
          alt="Szczegóły" 
          title="Pokaż szczegóły" 
          class="icon-details" 
          style="cursor: pointer;"
        />`;
            const editIcon = `
        <img 
          src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64a0fe50a9833a36d21f1669_edit.svg" 
          alt="Edycja" 
          title="Edytuj produkt" 
          class="icon-edit" 
          style="cursor: pointer;"
        />`;

            return `
        <div style="text-align:left; display:flex; align-items:center; gap:6px;">
          ${detailsIcon}${editIcon}
        </div>`;
          }
          return data;
        },
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
    $("#pRetailPrice").text("-");
    $("#pStandardPrice").text("-");
    $("#pBestPrice").text("-");
    $("#pInStock").text("-");
    $("#pStockDays").text("-");
    $("#pSales7").text("-");
    $("#pSales90").text("-");
    $("#pIndicator").text("-");
  }

  $("#table_splited_wh").on("click", ".sendemail", async function () {
    console.log("Kliknięto ikonę wysyłki w tabeli!");

    var table = $("#table_splited_wh").DataTable();
    var row = $(this).closest("tr");
    var data = table.row(row).data();
    const wholesalersData = JSON.parse(
      sessionStorage.getItem("wholesalersData")
    );
    if (wholesalersData) {
      const clickedWholesaler = wholesalersData.find(
        (item) => item.wholesalerKey === data.wholesalerKey
      );

      if (clickedWholesaler) {
        const { company = "", taxId = "", address = {} } = clickedWholesaler;
        const { line1 = "", town = "", postcode = "" } = address;

        const partyText = `${company}\n${line1}, ${town}, ${postcode}\nNIP: ${taxId}`;
        $("#orderParty").val(partyText).prop("disabled", true);
      } else {
        console.warn("❌ Hurtownik o takim kluczu nie został znaleziony.");
      }
    } else {
      console.warn("❌ Brak danych hurtowników w sessionStorage.");
    }

    try {
      // Pokaż animację ładowania
      $("#waitingdots").show();

      // Poczekaj na oba Promise
      await Promise.all([getShop(), getWhSmartVan(data.wholesalerKey)]);

      // orderItems
      const productsSum =
        data.products.bestMatch + data.products.exclusive + data.products.order;
      $("#orderItems").text(productsSum);

      // orderValue
      $("#orderValue").text(data.netValue + " zł");

      // orderWholesalerKey
      $("#orderWholesalerKey").val(data.wholesalerName);
      $("#orderWholesalerKey").attr("data-key", data.wholesalerKey);
      $("#orderWholesalerKey").prop("disabled", true);

      // orderSender
      $("#orderUserName").val(
        (attributes["username"] || "") + " " + (attributes["familyname"] || "")
      );
      $("#orderUserName").prop("disabled", true);

      // Pokaż okno dopiero po załadowaniu danych
      $("#SendOrderSMTP").css("display", "flex");
    } catch (error) {
      console.log("Błąd podczas pobierania danych:", error);
    } finally {
      // Zawsze schowaj animację niezależnie od powodzenia
      $("#waitingdots").hide();
    }
  });

  $("#formats").on("mousedown", "option", function (event) {
    // Zapobiegaj domyślnej akcji przeglądarki
    event.preventDefault();

    // Przełącz stan zaznaczenia klikniętej opcji
    $(this).prop("selected", !$(this).prop("selected"));

    // Wymuś aktualizację stanu pola <select>
    $("#formats").trigger("change");
  });

  const DELAY = 2000;
  let timer = null;

  // Funkcja wywoływana po czasie
  function triggerCreateOrder() {
    timer = null;
    CreateOrder();
  }

  // Funkcja ustawiająca timer (lub restartująca)
  function resetOrderTimer() {
    if (timer) {
      clearTimeout(timer);
    } else {
    }
    timer = setTimeout(triggerCreateOrder, DELAY);
  }

  // ✅ Reaguj na kliknięcie w checkbox/label w tabeli podziału
  $("#table_splited_wh, #DeletedContainer").on(
    "click",
    ".theClass, .mylabel",
    function (e) {
      resetOrderTimer();
    }
  );

  $("#table_splited_wh").on("click", ".filedownloadicon", function () {
    const table = $("#table_splited_wh").DataTable();
    const row = $(this).closest("tr");
    const data = table.row(row).data();
    const fileformat = $(this).attr("fileformat");
    const anchor = document.createElement("a");
    document.body.appendChild(anchor);
    $("#waitingdots").show();

    // ✅ Disable checkbox in a specific row
    const disableCheckboxInRow = (rowElement) => {
      $(rowElement).find("input.theClass").prop("disabled", true);
    };

    // ✅ Disable all checkboxes
    const disableAllCheckboxes = () => {
      $("input.theClass").prop("disabled", true);
    };

    const mimeTypesMap = {
      edi: "application/zip",
      csv: "application/zip",
      pdf: "application/zip",
      tema: "application/zip",
    };

    const acceptMime = mimeTypesMap[fileformat] || fileformat;

    const downloadFile = (url, fileName, onSuccess) => {
      fetch(url, {
        headers: {
          Accept: acceptMime,
          Authorization: orgToken,
          "Requested-By": "webflow-3-4",
        },
      })
        .then((res) => {
          const headersResponse = [];
          res.headers.forEach((e) => headersResponse.push(e));
          return Promise.all([res.blob(), headersResponse]);
        })
        .then(([blob, headersResponse]) => {
          $("#waitingdots").hide();

          const filenameHeader = headersResponse.find((h) =>
            h.includes("filename=")
          );
          if (!filenameHeader) {
            console.log("Filename not found in the response headers.");
            return;
          }

          const fileNameFromHeader = filenameHeader.split("filename=")[1];
          const objectUrl = URL.createObjectURL(blob);
          anchor.href = objectUrl;
          anchor.download = fileNameFromHeader;
          anchor.click();
          URL.revokeObjectURL(objectUrl);

          if (onSuccess) onSuccess();
        })
        .catch((error) => {
          $("#waitingdots").hide();
          console.log("Error fetching the file:", error);
        });
    };

    const updateRowStatus = (matchFn = () => true) => {
      const table = $("#table_splited_wh").DataTable();

      table.rows().every(function () {
        const rowData = this.data();

        if (!matchFn(rowData)) return;

        const now = new Date().toISOString();
        rowData.confirmedAt = now;

        if (!Array.isArray(rowData.events)) {
          rowData.events = [];
        }

        rowData.events.push({
          type: "downloaded",
          created: {
            by: "system",
            at: now,
          },
        });

        this.data(rowData).invalidate().draw(false);

        // ✅ Aktualizacja selecta i previous-value
        const selectElement = $(this.node()).find(".status-dropdown");
        selectElement
          .val("potwierdzono")
          .data("previous-value", "potwierdzono");
        return false; // tylko jeden wiersz
      });

      updateStatusBadge();
    };

    if (!data || !data.wholesalerKey) {
      // ✅ Pobieranie wszystkich – blokuj wszystkie checkboxy
      disableAllCheckboxes();

      const downloadUrl = new URL(
        `${InvokeURL}shops/${shopKey}/orders/${orderId}/wholesalers?filesFormat=${fileformat}`
      );

      downloadFile(downloadUrl, fileformat, () => {
        updateRowStatus();
      });
    } else {
      const wholesalerKey = data.wholesalerKey;

      // ✅ Pobieranie jednego – blokuj checkbox tylko w tym wierszu
      disableCheckboxInRow(row);

      const downloadUrl = new URL(
        `${InvokeURL}shops/${shopKey}/orders/${orderId}/wholesalers/${wholesalerKey}`
      );

      downloadFile(downloadUrl, fileformat, () => {
        updateRowStatus((rowData) => rowData.wholesalerKey === wholesalerKey);
      });
    }
  });

  $("#spl_table").on("click", "td.details-control", function () {
    //Get the righ table
    var table = $("#spl_table").DataTable();
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

  $("#spl_table").on("focusin", "input", function () {
    // Store the current value when the input element is focused
    $(this).data("initialValue", $(this).val());
  });

  $("#spl_table")
    .off("change.whMain", "select.wh-picker")
    .on("change.whMain", "select.wh-picker", function () {
      console.log("Change event triggered on select element");

      const table = $("#spl_table").DataTable();
      const $select = $(this);
      const row = table.row($select.closest("tr"));
      const data = row.data();

      const newValue = String($select.val());
      const initialValue = String($select.data("initialValue") ?? "");

      console.log("New value selected:", newValue);
      console.log("Initial value:", initialValue);

      if (newValue === initialValue) {
        console.log("No change in value, no action taken.");
        return;
      }

      if (!data || !data.gtin) {
        console.log("GTIN is null, cannot proceed.");
        return;
      }

      const addChange = (op, path, value) => {
        const change = { op, path };
        if (value !== undefined) change.value = value;
        addObject(changesPayload, change);
        console.log("Payload added:", change);
      };

      const emulateChangeForUser = () => {
        $("#waitingdots").show(1).delay(150).hide(1);
      };

      switch (newValue) {
        case "remove":
          if (data.active === false) {
            console.log(
              "Option 'remove' for inactive product → enabling product."
            );
            addChange("replace", `/${data.gtin}/active`, true);
          } else {
            console.log("Option 'remove' → removing wholesalerKey.");
            addChange("remove", `/${data.gtin}/rigidAssignment/wholesalerKey`);
          }
          emulateChangeForUser();
          break;

        case "unassigned":
          console.log("Option 'unassigned' → disabling product.");
          addChange("replace", `/${data.gtin}/active`, false);
          emulateChangeForUser();
          break;

        case "enabled":
          console.log("Option 'enabled' → enabling product.");
          addChange("replace", `/${data.gtin}/active`, true);
          emulateChangeForUser();
          break;

        default:
          console.log("Assigning new wholesalerKey:", newValue);
          addChange(
            "replace",
            `/${data.gtin}/rigidAssignment/wholesalerKey`,
            newValue
          );
          emulateChangeForUser();

          // 1) zaktualizuj dane w DataTables (i źródło do ikonki)
          const updatedData = {
            ...data,
            wholesalerKey: newValue,
            assignmentSource: "user",
          };
          row.data(updatedData).invalidate().draw(false);

          // 2) po przerysowaniu znajdź NOWY select w tym wierszu
          const $rowNode = $(row.node());
          const $newSelect = $rowNode.find("select.wh-picker");

          // upewnij się, że opcja istnieje
          const wholesalers =
            JSON.parse(sessionStorage.getItem("wholesalersData")) || [];
          const wh = wholesalers.find((w) => w.wholesalerKey === newValue);
          const label = wh ? wh.name : newValue;

          if ($newSelect.find(`option[value="${newValue}"]`).length === 0) {
            $newSelect.append(`<option value="${newValue}">${label}</option>`);
          }

          // 3) ustaw wartość i initialValue na nowym select
          $newSelect.val(newValue);
          $newSelect.data("initialValue", newValue);

          return; // już wszystko zrobione
      }

      // dla pozostałych case’ów (remove/unassigned/enabled)
      $select.data("initialValue", newValue);
    });

  window.handlePaste = function (event) {
    // Zatrzymanie domyślnej akcji wklejania
    event.preventDefault();

    // Pobranie wklejanej wartości
    const pastedValue = event.clipboardData.getData("text");
    console.log(pastedValue);

    // Sprawdzenie, czy wklejona wartość jest liczbą i nie przekracza maksymalnej wartości
    if (!isNaN(pastedValue) && Number(pastedValue) <= 999999) {
      // Wklejenie poprawnej wartości
      event.target.value = pastedValue;
    } else {
      // Tymczasowe usunięcie nasłuchiwania zdarzenia focusout
      const inputElement = event.target;
      const focusoutHandler = function () {
        console.log(
          "Focusout event triggered, but ignored due to invalid paste."
        );
      };

      // Usuń nasłuchiwanie focusout
      $(inputElement).off("focusout");

      displayMessage(
        "Error",
        `Oops. Ilość ${pastedValue} jest nieprawidłowa. Maksymalna dozwolona ilość to 999999. Wartość w polu nie została zmieniona.`
      );

      // Przywróć nasłuchiwanie focusout po zamknięciu alertu
      setTimeout(() => {
        $(inputElement).on("focusout", focusoutHandler);
      }, 1000);
    }
  };

  // Function to validate GTIN format (checks if GTIN contains '?')
  function isValidGTIN(gtin) {
    // GTIN is considered valid if it does not contain '?'
    return !gtin.includes("?");
  }

  $("#spl_table").on("focusin", "select", function () {
    // Store the current value when the select element is focused
    $(this).data("initialValue", $(this).val());
  });

  $("#spl_table").on("click", "img.showdata", function () {
    const dataToDisplay = $(this);
    const popupContainer = document.getElementById("ReleatedProducts");
    const popupContent = document.getElementById("popupContent");
    const input = dataToDisplay.data("content");

    if (!input) {
      console.log("Brak danych do wyświetlenia.");
      return;
    }

    var output = "";
    if (Array.isArray(input)) {
      output = "<td>" + input.join("<br>") + "</td>";
    } else {
      output = "<td>" + input + "</td>";
    }

    popupContent.innerHTML = output;
    popupContainer.style.display = "flex";
  });

  $("#spl_table").on("click", "img[alt='edit']", function () {
    var table = $("#spl_table").DataTable();
    var tr = $(this).closest("tr");
    var rowData = table.row(tr).data();

    if (isValidBarcode(rowData.gtin)) {
      var GTINEdit = document.getElementById("gtin");
      GTINEdit.value = rowData.gtin;
      GTINEdit.disabled = true;
      var NameInput = document.getElementById("new-name");
      NameInput.value = rowData.name;
      NameInput.textContent = rowData.name;
      var DistributorInput = document.getElementById(
        "countryDistributorName-2"
      );
      DistributorInput.value = rowData.countryDistributorName;
      DistributorInput.textContent = rowData.countryDistributorName;
      $("#ProposeChangeInGtinModal").css("display", "flex");
    }
  });

  $("#spl_table").on("click", "img[alt='delete']", function () {
    var table = $("#spl_table").DataTable();
    var tr = $(this).closest("tr");
    var rowData = table.row(tr).data();

    var payloadDelete = { op: "remove", path: "/" + rowData.gtin };
    addObject(changesPayload, payloadDelete);
    // Emulate changes for user
    $("#waitingdots").show(1).delay(150).hide(1);
    table.row($(this).parents("tr")).remove().draw(false);

    // Aktualizuj wartość input w tabeli $('#table_id') na null
    var tableId = $("#table_id").DataTable();
    tableId.rows().every(function () {
      var rowDataId = this.data();
      if (rowDataId.gtin === rowData.gtin) {
        var inputField = $(this.node()).find('input[type="number"]');
        inputField.val(null);
      }
    });
  });

  $("#spl_table").on("focusin", "input", function () {
    // Store the current value when the input element is focused
    $(this).data("initialValue", $(this).val());
  });

  $("#spl_table").on("keypress", "input", function (e) {
    if (e.key === "Enter") {
      $(this).blur(); // Simulate focusout when Enter key is pressed
    }
  });

  $("#spl_table").on("click", "img[alt='details']", function () {
    var table = $("#spl_table").DataTable();
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

  $("#spl_table").on("focusout", "input", function () {
    const table = $("#spl_table").DataTable();
    const $input = $(this);
    const row = table.row($input.closest("tr"));

    let newValue = $input.val();
    let initialValue = $input.data("initialValue"); // nie parsujemy od razu

    console.log("New value:", newValue, "Initial value (raw):", initialValue);

    // liczby do porównania
    const newNum = newValue === "" ? NaN : parseInt(newValue, 10);
    const initialNum =
      initialValue === "" || initialValue == null
        ? NaN
        : parseInt(initialValue, 10);

    if (newNum !== initialNum && !isNaN(newNum) && newNum >= 0) {
      console.log("Value changed and new value is valid");

      // zaktualizuj atrybut value w input
      $input.attr("value", newValue);

      let data = row.data();

      if (data && data.gtin !== null) {
        let quantity = newNum;
        if (isNaN(quantity)) {
          quantity = null;
        }

        let product;
        if (isNaN(initialNum) && !isNaN(newNum)) {
          // ADD – nie było ilości, a teraz jest
          product = {
            op: "add",
            path: "/" + data.gtin,
            value: {
              quantity: quantity,
            },
          };
        } else if (quantity !== null) {
          // REPLACE – była ilość, podmieniamy
          product = {
            op: "replace",
            path: "/" + data.gtin + "/quantity",
            value: quantity,
          };
        } else {
          // REMOVE – teraz jest „pusto”
          product = {
            op: "remove",
            path: "/" + data.gtin,
          };
        }

        console.log("Adding product to changesPayload:", product);
        addObject(changesPayload, product);

        // 🔥 KLUCZ: aktualizacja danych w DataTables
        data.quantity = quantity;
        row.data(data).invalidate().draw(false);

        // ustaw nową wartość jako initialValue, żeby drugi focusout na tej samej wartości nic nie robił
        $input.data("initialValue", newValue);

        $("#waitingdots").show(1).delay(150).hide(1);
      } else {
        console.log("GTIN is null, cannot proceed.");
      }
    } else {
      console.log("No change in value or invalid input, skipping.");
    }
  });

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

  const relatedCache = new Map();

  function fetchRelatedKeys(shopKey, promotionId, wholesalerKey) {
    const cacheKey = `${shopKey}|${promotionId}|${wholesalerKey}`;
    if (relatedCache.has(cacheKey)) {
      return Promise.resolve(relatedCache.get(cacheKey));
    }

    const url =
      `${InvokeURL}shops/${encodeURIComponent(shopKey)}` +
      `/offer/promotions/${encodeURIComponent(promotionId)}` +
      `/related-keys?wholesalerKey=${encodeURIComponent(wholesalerKey)}`;

    return fetch(url, {
      headers: {
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },
    })
      .then((res) => {
        if (res.ok) return res.json(); // 200 → ["0500...", ...]
        if (res.status === 400 || res.status === 404) return []; // brak danych
        return res.text().then((t) => {
          throw new Error(
            `Related-keys error ${res.status}: ${t || "no body"}`
          );
        });
      })
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        relatedCache.set(cacheKey, arr);
        return arr;
      })
      .catch((err) => {
        // W produkcji można logować do sentry etc.
        console.error("fetchRelatedKeys failed:", err);
        throw err; // pozwól wyżej zareagować (np. pokazać popup z błędem)
      });
  }

  $("#table_id tbody, #spl_table tbody").on(
    "click",
    "img.showdata",
    function () {
      const popupContainer = document.getElementById("ReleatedProducts");
      const popupContent = document.getElementById("popupContent");

      const shopKey = this.getAttribute("data-shop");
      const wholesalerKey = this.getAttribute("data-wh");
      const promotionId = this.getAttribute("data-promo");

      const td = this.closest("td");
      const prevHTML = td.innerHTML;
      td.innerHTML = `<span class="loading-related">Ładuję…</span>`;

      fetchRelatedKeys(shopKey, promotionId, wholesalerKey)
        .then((values) => {
          td.innerHTML = prevHTML;

          if (!values || values.length === 0) {
            popupContent.innerHTML = `<p class='text-size-tiny text-color-grey'>Brak powiązanych produktów.</p>`;
            popupContainer.style.display = "flex";
            return;
          }

          let output = "";
          for (let i = 0; i < values.length; i++) {
            if (i % 5 === 0)
              output += "<p class='text-size-tiny text-color-grey'>";
            const code = String(values[i]).trim();
            output += `<span class="related-product-code"
                       style="text-decoration: underline; cursor: pointer; margin-right: 6px;"
                       data-code="${code}">${code}</span>`;
            if ((i + 1) % 5 === 0 || i === values.length - 1) output += "</p>";
          }

          popupContent.innerHTML = output;
          popupContainer.style.display = "flex";

          popupContent
            .querySelectorAll(".related-product-code")
            .forEach((el) => {
              el.addEventListener("click", function () {
                const code = this.getAttribute("data-code");
                // 🔥 bierzemy DataTable z tej tabeli, w której kliknięto
                const table = $(td).closest("table").DataTable();
                table.search(code).draw();
                popupContainer.style.display = "none";
              });
            });
        })
        .catch(() => {
          td.innerHTML = prevHTML;
          popupContent.innerHTML = `<p class='text-size-tiny text-color-grey'>Nie udało się pobrać powiązań.</p>`;
          popupContainer.style.display = "flex";
        });
    }
  );

  // Close the popup when clicking outside of the popup content
  $(window).on("click", function (event) {
    var popupContainer = document.getElementById("ReleatedProducts");
    if (event.target == popupContainer) {
      popupContainer.style.display = "none";
    }
  });

  $("#table_id").on("click", "img[alt='Szczegóły']", function () {
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

  $("#table_id").on("click", "img[alt='Edycja']", function () {
    console.log("kliklam");
    var table = $("#table_id").DataTable();
    var tr = $(this).closest("tr");
    var rowData = table.row(tr).data();

    if (isValidBarcode(rowData.gtin)) {
      var GTINEdit = document.getElementById("gtin");
      GTINEdit.value = rowData.gtin;
      GTINEdit.disabled = true;
      var NameInput = document.getElementById("new-name");
      NameInput.value = rowData.name;
      NameInput.textContent = rowData.name;
      var DistributorInput = document.getElementById(
        "countryDistributorName-2"
      );
      DistributorInput.value = rowData.countryDistributorName;
      DistributorInput.textContent = rowData.countryDistributorName;
      $("#ProposeChangeInGtinModal").css("display", "flex");
    }
  });

  $("#table_id").on("focusin", "input", function () {
    // Store the current value when the input element is focused
    $(this).data("initialValue", $(this).val());
  });

  $("#table_id").on("keypress", "input", function (e) {
    if (e.key === "Enter") {
      $(this).blur(); // Simulate focusout when Enter key is pressed
    }
  });

  $("#table_id").on("focusout", "input", function () {
    console.log("focusout triggered");

    const table = $("#table_id").DataTable();
    const $input = $(this);
    const row = table.row($input.closest("tr"));

    let newValue = $input.val();
    let initialValue = $input.data("initialValue"); // trzymaj jako string/liczbę, bez parseInt na siłę

    console.log("New value:", newValue);
    console.log("Initial value:", initialValue);

    // jeśli oba są liczbami/stringami liczbowymi można porównać po sparsowaniu:
    const newNum = newValue === "" ? NaN : parseInt(newValue, 10);
    const initialNum =
      initialValue === "" || initialValue == null
        ? NaN
        : parseInt(initialValue, 10);

    if (newNum !== initialNum && !isNaN(newNum) && newNum >= 0) {
      console.log("Value changed and new value is valid");

      $input.attr("value", newValue);

      let data = row.data();
      console.log("Row data before:", data);

      if (data && data.gtin !== null) {
        let quantity = newNum;
        if (isNaN(quantity)) {
          quantity = null;
          console.log("Parsed quantity is NaN, setting to null");
        }

        let product;
        if (isNaN(initialNum) && !isNaN(newNum)) {
          console.log("Operation: ADD");
          product = {
            op: "add",
            path: "/" + data.gtin,
            value: {
              quantity: quantity,
            },
          };
        } else if (quantity !== null) {
          console.log("Operation: REPLACE");
          product = {
            op: "replace",
            path: "/" + data.gtin + "/quantity",
            value: quantity,
          };
        } else {
          console.log("Operation: REMOVE");
          product = {
            op: "remove",
            path: "/" + data.gtin,
          };
        }

        addObject(changesPayload, product);
        console.log("Updated changesPayload:", changesPayload);

        // 🔥 KLUCZ: zaktualizuj dane w DataTables, żeby
        // późniejsze zmiany dostawcy nie przywracały starej ilości
        data.quantity = quantity;
        row.data(data).invalidate().draw(false);

        // zapamiętaj nową wartość jako initialValue
        $input.data("initialValue", newValue);

        $("#waitingdots").show(1).delay(150).hide(1);
      } else {
        console.warn("GTIN is null – row data might be incomplete");
      }
    } else {
      console.log("Value not changed or invalid new value");
    }
  });

  $('div[role="tablist"]').click(function () {
    setTimeout(function () {
      $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
      updateOverlaySize("table-content");

      // Check if the overlay element exists
      const overlay = document.querySelector("#detailspane > div.blur-overlay");
      if (overlay) {
        const tabElement = document.querySelector("[data-w-tab='Details']");

        function toggleOverlay() {
          if (tabElement && tabElement.classList.contains("w--current")) {
            overlay.style.transition = "opacity 0.3s"; // Transition for 200ms (0.2 seconds)
            overlay.style.opacity = 1; // Set opacity to 100%
          } else {
            overlay.style.transition = "opacity 0.3s"; // Transition for 200ms (0.2 seconds)
            overlay.style.opacity = 0; // Set opacity to 0
          }
        }

        toggleOverlay();
      }

      $.fn.dataTable
        .tables({
          visible: true,
          api: true,
        })
        .columns.adjust();
    }, 300);
  });

  $('div[role="tablist"], div[role="tab"], div[role="tabpanel"]').click(
    function () {
      const delays = [1, 49, 151, 901];

      delays.forEach((delay) => {
        setTimeout(function () {
          $.fn.dataTable
            .tables({
              visible: true,
              api: true,
            })
            .columns.adjust();
        }, delay);
      });
    }
  );

  $("table.dataTable").on("page.dt", function () {
    $(this).DataTable().draw(false);
  });

  $('div[role="tablist"], div[role="tab"], div[role="tabpanel"]').click(
    function () {
      const delays = [1, 49, 151, 901];

      delays.forEach((delay) => {
        setTimeout(function () {
          $.fn.dataTable
            .tables({
              visible: true,
              api: true,
            })
            .columns.adjust();
        }, delay);
      });
    }
  );

  let previousTab = "Details";

  function adjustDataTablesColumns() {
    setTimeout(() => {
      console.log("Adjusting DataTables columns...");
      $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
    }, 300);
  }

  function shouldCreateOrder(comingFromDetails) {
    const result = changesPayload.length > 0 && !comingFromDetails;
    console.log(
      "shouldCreateOrder called. comingFromDetails:",
      comingFromDetails,
      "changesPayload.length:",
      changesPayload.length,
      "result:",
      result
    );
    return result;
  }

  $("a[data-w-tab]").on("click", async function () {
    const tab = $(this).data("w-tab");
    const comingFromDetails = previousTab === "Details";

    console.log("Clicked tab:", tab);
    console.log("Previous tab:", previousTab);
    console.log("Coming from Details:", comingFromDetails);

    if (tab === "Cart") {
      console.log("Switching to Cart tab...");
      if (shouldCreateOrder(comingFromDetails)) {
        console.log("Should create order before showing Cart.");
        try {
          console.log("Calling CreateOrder()...");
          await CreateOrder();
          console.log("CreateOrder completed successfully.");
        } catch (err) {
          console.log("Błąd przy tworzeniu zamówienia (Cart):", err);
        } finally {
          console.log("Calling GetSplittedProducts() (Cart - finally)");
          GetSplittedProducts();
        }
      } else {
        console.log(
          "Skipping CreateOrder. Just calling GetSplittedProducts() (Cart)."
        );
        GetSplittedProducts();
      }
    } else if (tab === "AddProducts") {
      console.log("Switching to AddProducts tab...");
      if (shouldCreateOrder(comingFromDetails)) {
        console.log("Should create order before switching to AddProducts.");
        try {
          console.log("Calling CreateOrder()...");
          await CreateOrder();
          console.log("CreateOrder completed successfully (AddProducts).");
        } catch (err) {
          console.log("Błąd przy tworzeniu zamówienia (AddProducts):", err);
        }
      } else {
        console.log(
          "No changes or not coming from Details. Skipping CreateOrder (AddProducts)."
        );
      }
    } else if (tab === "Details") {
      console.log("Switching to Details tab...");
      if (changesPayload.length > 0) {
        console.log(
          "Changes detected. Calling CreateOrder before switching to Details."
        );
        try {
          await CreateOrder();
          console.log("CreateOrder completed successfully (Details).");
        } catch (err) {
          console.log("Błąd przy tworzeniu zamówienia (Details):", err);
        }
      } else {
        console.log("No changes. Skipping CreateOrder (Details).");
      }
    }

    adjustDataTablesColumns();
    console.log("Updating previousTab to:", tab);
    previousTab = tab;

    // Ręczne przełączenie aktywnej zakładki i panela (Webflow-style)
    $(".w-tab-link").removeClass("w--current");
    $(".w-tab-pane").removeClass("w--tab-active");
    $(this).addClass("w--current");
    $(`.w-tab-pane[data-w-tab="${tab}"]`).addClass("w--tab-active");
  });

  $.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
    var elem = document.getElementById("DataTablesModule");
    elem.remove();
    document.getElementById("EmptyOfferState").style.display = "flex";
  };

  $(window).on("resize", function () {
    updateOverlaySize("table-content");
  });

  // Function to check if a parameter exists in the URL query string
  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  // Pobierz wartość parametru "data-w-tab" z URL
  var tabToClick = getParameterByName("data-w-tab");

  // Funkcja do kliknięcia w zakładkę na podstawie atrybutu data-w-tab
  function clickTab(tabName) {
    var tabLink = document.getElementById(tabName);
    if (tabLink) {
      console.log(`Klikam w zakładkę o ID: '${tabName}'`);
      tabLink.click();
    } else {
      console.warn(`Nie znaleziono elementu o ID: '${tabName}'`);
    }
  }

  if (tabToClick === "add") {
    console.log(
      "Parametr 'data-w-tab' to 'add' – pokazuję i klikam zakładkę 'AddProducts'"
    );
    $('a[data-w-tab="AddProducts"]').show();

    setTimeout(function () {
      clickTab("addProducts"); // Kliknij zakładkę po krótkim opóźnieniu
      CreateOrder();
    }, 500);
  } else {
    CreateOrder();
  }

  getWholesalersSh();
  initOfferStatusTable();
  getOfferStatus();
  fetchDataFromEndpoint();

  function initializeSimpleTooltips() {
    // ===== CSS (raz) =====
    if (!document.getElementById("simple-tooltips-style")) {
      const style = document.createElement("style");
      style.id = "simple-tooltips-style";
      style.textContent = `
      .newtippy {
        position: absolute;
        background-color: rgba(33,33,33,.96);
        color: #fff;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        line-height: 1.25;
        white-space: nowrap;
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity .12s ease, transform .12s ease;
        pointer-events: none;
        z-index: 6000;
        box-shadow: 0 6px 16px rgba(0,0,0,.2);
      }
      .newtippy.visible {
        opacity: 1;
        transform: translateY(0);
      }
      .newtippy__arrow {
        position: absolute;
        width: 0; height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid rgba(33,33,33,.96);
        bottom: -6px; left: 50%;
        transform: translateX(-50%);
      }
      .newtippy[data-placement="bottom"] .newtippy__arrow {
        border-top: none;
        border-bottom: 6px solid rgba(33,33,33,.96);
        top: -6px; bottom: auto;
      }
    `;
      document.head.appendChild(style);
    }

    // ===== Jeden globalny tooltip =====
    let tip = document.getElementById("simple-tooltip");
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "simple-tooltip";
      tip.className = "newtippy";
      const arrow = document.createElement("div");
      arrow.className = "newtippy__arrow";
      tip.appendChild(arrow);
      const content = document.createElement("div");
      content.className = "newtippy__content";
      tip.appendChild(content);
      document.body.appendChild(tip);
    }

    const ARROW_H = 6;
    const OFFSET = 8;

    function clamp(n, min, max) {
      return Math.max(min, Math.min(max, n));
    }

    function showTooltip(target) {
      const text = target.getAttribute("data-tippy-content");
      if (!text) return;

      // Ustaw treść
      tip.querySelector(".newtippy__content").textContent = text;

      // Pozycjonowanie
      const rect = target.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;

      // domyślnie NAD elementem
      let placement = "top";
      tip.style.visibility = "hidden";
      tip.classList.remove("visible");
      tip.removeAttribute("data-placement");
      tip.style.left = "0px";
      tip.style.top = "0px";
      // najpierw do DOM, żeby poznać offsetWidth/Height (już jest)
      // szerokość i wysokość:
      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;

      const pageXCenter = rect.left + rect.width / 2 + window.scrollX;
      const pageYTop = rect.top + window.scrollY;
      const pageYBottom = rect.bottom + window.scrollY;

      let left = pageXCenter - tw / 2;
      let top = pageYTop - th - ARROW_H - OFFSET;

      // jeśli nie ma miejsca u góry — pokaż pod elementem
      const hasRoomTop = rect.top >= th + ARROW_H + OFFSET;
      const hasRoomBottom = vh - rect.bottom >= th + ARROW_H + OFFSET;

      if (!hasRoomTop && hasRoomBottom) {
        placement = "bottom";
        top = pageYBottom + ARROW_H + OFFSET;
      }

      // Zaciśnij do szerokości okna
      const minLeft = window.scrollX + 8;
      const maxLeft = window.scrollX + vw - tw - 8;
      left = clamp(left, minLeft, maxLeft);

      tip.setAttribute("data-placement", placement);
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
      tip.style.visibility = "visible";

      // animacja
      requestAnimationFrame(() => tip.classList.add("visible"));
    }

    function hideTooltip() {
      tip.classList.remove("visible");
      // po animacji ukryj, żeby nie łapało focusu itp.
      setTimeout(() => {
        tip.style.visibility = "hidden";
      }, 120);
    }

    // ===== Delegacja: działa na dynamicznej tabeli =====
    // Usuwamy stare listenery (jeśli ktoś wywołał funkcję ponownie)
    document.removeEventListener("mouseover", _onMouseOver, true);
    document.removeEventListener("mouseout", _onMouseOut, true);

    function _onMouseOver(e) {
      const target = e.target.closest("[data-tippy-content]");
      if (!target) return;
      // Jeśli na TR masz cursor: not-allowed, tooltip i tak zadziała,
      // bo nie blokujemy pointer-events.
      showTooltip(target);
    }

    function _onMouseOut(e) {
      // Ukryj, gdy kursor opuszcza element z atrybutem
      const from = e.target.closest("[data-tippy-content]");
      const to =
        e.relatedTarget &&
        e.relatedTarget.closest &&
        e.relatedTarget.closest("[data-tippy-content]");
      // Gdy przechodzimy z jednego elementu z tooltipem na inny, pokaż od razu drugi
      if (from && to) {
        showTooltip(to);
        return;
      }
      if (from && !to) hideTooltip();
    }

    document.addEventListener("mouseover", _onMouseOver, true);
    document.addEventListener("mouseout", _onMouseOut, true);
  }

  makeWebflowFormAjaxCreate($("#wf-form-ProposeChangeInGtin"));
  makeWebflowFormUndoOrder($("#wf-form-undoFormContent"));
  makeWebflowFormAjaxDelete($("#wf-form-DeleteOrder"));
  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));
  makeWebflowFormAjaxPatchShopEdit($("#wf-form-EditShop"));
  sendEmailToWholesaler($("#wf-form-orderForm"));

  // DataTables initialization and event handling
  $("table.dataTable").on("init.dt xhr.dt page.dt draw.dt", function () {
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
