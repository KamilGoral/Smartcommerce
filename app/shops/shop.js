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

  var shopKey = new URL(location.href).searchParams.get("shopKey");
  var orgToken = getCookie("sprytnyToken");
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var DomainName = getCookie("sprytnyDomainName");
  var ClientID = getCookieNameByValue(orgToken);
  var OrganizationName = getCookie("OrganizationName");
  const OrganizationBread0 = document.getElementById("OrganizationBread0");
  // const UploadDocumentButton = document.getElementById("UploadDocumentButton");
  const cancelButton = document.getElementById("cancelButton");
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
  $("#Wholesaler-profile-Selector-box").hide();

  userRole = getCookie("sprytnyUserRole");

  if (userRole !== "admin") {
    console.log("Actions not permitted for non-admin users.");
    $("#deleteShopContainer").hide();
  }

  function getShop() {
    var request = new XMLHttpRequest();
    let endpoint = new URL(InvokeURL + "shops/" + shopKey);
    request.open("GET", endpoint.toString(), true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      var data = JSON.parse(this.response);

      if (request.status >= 200 && request.status < 400) {
        sessionStorage.setItem("shopKey", data.shopKey);
        sessionStorage.setItem("shopName", data.name);
        var ShopKeyBreadName = sessionStorage.getItem("shopName");
        const ShopNameBread = document.getElementById("ShopNameBread");
        ShopNameBread.textContent = data.name;
        ShopNameBread.setAttribute(
          "href",
          "https://" + DomainName + "/app/shops/shop?shopKey=" + data.shopKey
        );

        if (data.merchantConsoleShopId === null) {
          data.merchantConsoleShopId = "";
        }

        // Update shopName, shopKey, and other information
        document.querySelector('[shopdata="shopName"]').textContent =
          data.name +
            " - " +
            data.shopKey +
            " | " +
            data.merchantConsoleShopId || "N/A";

        $("#shopNameEdit").val(data.name || "");
        $("#shopCodeEdit").val(data.shopKey || "");
        $("#merchantConsoleShopId")
          .val(data.merchantConsoleShopId || "")
          .prop("disabled", true);

        // Mapping Polish state names to <select> element values
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

        // Address information with phones and emails
        if (data.address) {
          const { country, line1, town, state, postcode } = data.address;
          let addressDescription = `${country}, ${line1}, ${town}, ${state}, ${postcode}`;

          // Add phones if available
          if (Array.isArray(data.phones)) {
            addressDescription += "\n\nTelefon:";
            data.phones.forEach((phone) => {
              addressDescription += `\n${phone.phone} (${
                phone.description || "brak opisu"
              })`;
            });
          }

          // Add emails if available
          if (Array.isArray(data.emails)) {
            addressDescription += "\n\nE-mail:";
            data.emails.forEach((email) => {
              addressDescription += `\n${email.email} (${
                email.description || "brak opisu"
              })`;
            });
          }

          document.querySelector('[shopdata="address"]').textContent =
            addressDescription || "N/A";
        }
      } else {
        console.log("error");
      }
    };

    // Send request
    request.send();
  }

  function getOrders() {
    var tableOrders = $("#table_orders").DataTable({
      pagingType: "full_numbers",
      order: [],
      dom: '<"top">rt<"bottom"lip>',
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
      ajax: function (data, callback, settings) {
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

        var whichColumns = "";
        var direction = "desc";

        if (data.order.length == 0) {
          whichColumns = 0;
        } else {
          whichColumns = data.order[0]["column"];
          direction = data.order[0]["dir"];
        }

        switch (whichColumns) {
          case 0:
            whichColumns = "createDate:";
            break;
          case 2:
            whichColumns = "createDate:";
            break;
          case 3:
            whichColumns = "createDate:";
            break;
          default:
            whichColumns = "createDate:";
        }

        var sort = "" + whichColumns + direction;

        $.get(
          InvokeURL + "shops/" + shopKey + "/orders",
          {
            sort: sort,
            perPage: data.length,
            page: (data.start + data.length) / data.length,
          },
          function (res) {
            // map your server's response to the DataTables format and pass it to
            // DataTables' callback
            callback({
              recordsTotal: res.total,
              recordsFiltered: res.total,
              data: res.items,
            });
          }
        );
      },
      processing: true,
      search: {
        return: true,
      },
      serverSide: true,
      search: {
        return: true,
      },
      columns: [
        {
          orderable: false,
          data: null,
          width: "36px",
          defaultContent:
            "<div class='details-container'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg' alt='offer'></img></div>",
        },
        {
          orderable: false,
          visible: false,
          data: "orderId",
          render: function (data) {
            return data ? data : "";
          },
        },
        {
          orderable: true,
          data: "createDate",
          render: function (data) {
            if (data) {
              var utcDate = new Date(Date.parse(data));
              var formattedDate = utcDate.toLocaleString("pl-PL", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              });
              return formattedDate;
            }
            return "";
          },
        },
        {
          orderable: false,
          data: "createdBy",
          render: function (data) {
            return data ? data : "";
          },
        },
        {
          orderable: false,
          data: "name",
          render: function (data) {
            return data ? data : "";
          },
        },
        {
          orderable: false,
          data: null,
          render: function (data, type, row) {
            // Sprawdź, czy createDate jest przed 2025-04-10
            var createDate = new Date(row.createdAt);
            var cutoffDate = new Date("2025-04-24");

            if (createDate < cutoffDate) {
              return "-";
            }

            var total = row.total || 0;
            var confirmed = row.confirmed || 0;
            var percentage = total > 0 ? (confirmed / total) * 100 : 0;

            // Jeśli confirmed jest 0, nie pokazuj zielonego paska
            var progressBarStyle =
              confirmed > 0
                ? `style="width: ${percentage}%;"`
                : 'style="display: none;"';

            return `
              <div class="progress-bar-container" title="Produktów: ${total}, Potwierdzonych: ${confirmed}">
                <div class="progress-bar" ${progressBarStyle}></div>
                <span>${confirmed}/${total}</span>
              </div>
            `;
          },
          defaultContent: "",
        },
        {
          orderable: false,
          data: "orderId",
          width: "72px",
          render: function (data, type, row) {
            if (type === "display" && data) {
              let url = `https://${DomainName}/app/orders/order?orderId=${data}&shopKey=${shopKey}$orderName=${row.name}`;
              return `<div class="action-container"><a href="${url}" class="buttonoutline editme w-button">Przejdź</a></div>`;
            }
            return "";
          },
          defaultContent: "",
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
      initComplete: function (settings, json) {
        var api = this.api();
        var textBox = $("#table_offers_filter label input");
        textBox.unbind();
        textBox.bind("keyup input", function (e) {
          if (
            (e.keyCode == 8 && !textBox.val()) ||
            (e.keyCode == 46 && !textBox.val())
          ) {
          } else if (e.keyCode == 13 || !textBox.val()) {
            api.search(this.value).draw();
          }
        });
      },
      drawCallback: function (settings) {
        toggleEmptyState();
      },
    });

    function toggleEmptyState() {
      // Check if the table has any entries
      var hasEntries = tableOrders.data().any();
      // If the table is empty, show the custom empty state div
      // Otherwise, hide it
      if (!hasEntries) {
        $("#emptystateorders").show();
        $("#orderscontainer").hide();
      } else {
        $("#emptystateorders").hide();
        $("#orderscontainer").show();
      }
    }
  }

  function getOffers() {
    if ($.fn.DataTable.isDataTable("#table_offers")) {
      $("#table_offers").DataTable().clear().destroy();
    }

    var tableOffers = $("#table_offers").DataTable({
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
            "Requested-By": "webflow-3-4",
          },
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            $("#waitingdots").hide();
          },
        });

        var whichColumns = data.order.length == 0 ? 0 : data.order[0]["column"];
        var direction = data.order.length == 0 ? "desc" : data.order[0]["dir"];

        switch (whichColumns) {
          case 1:
          case 2:
            whichColumns = "updatedAt:";
            break;
          default:
            whichColumns = "updatedAt:";
        }

        var sort = whichColumns + direction;

        $.get(
          InvokeURL + "shops/" + shopKey + "/offers",
          {
            sort: sort,
            perPage: data.length,
            page: (data.start + data.length) / data.length,
          },
          function (res) {
            const groupedData = {};

            res.items.forEach((item) => {
              const dateOnly = item.updatedAt
                ? item.updatedAt.substring(0, 10)
                : new Date().toISOString().substring(0, 10);

              if (!groupedData[dateOnly]) {
                groupedData[dateOnly] = [];
              }

              groupedData[dateOnly].push({
                offerId: item.offerId,
                updatedAt: item.updatedAt || new Date().toISOString(),
              });
            });

            for (const date in groupedData) {
              groupedData[date].sort((a, b) =>
                a.updatedAt > b.updatedAt ? -1 : 1
              );
            }

            const finalStructure = {
              items: Object.keys(groupedData).map((date) => ({
                updatedAt: date,
                offers: [groupedData[date][0]], // tylko najnowsza oferta danego dnia
              })),
            };

            callback({
              recordsTotal: res.total,
              recordsFiltered: res.total,
              data: finalStructure.items,
            });
          }
        );
      },
      processing: true,
      serverSide: true,
      columns: [
        {
          data: null,
          width: "36px",
          defaultContent: "",
          createdCell: function (cell, rowData) {
            if (rowData.offers && rowData.offers.length > 1) {
              $(cell).addClass("details-control");
            } else {
              const imgElement = $("<img>", {
                src: "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg",
                alt: "offer",
              });
              $(cell)
                .addClass("details-container2")
                .css("justify-content", "center")
                .append(imgElement);
            }
          },
          orderable: false,
        },
        {
          orderable: true,
          data: "updatedAt",
          render: function (data) {
            if (data) {
              const dateObj = new Date(data);
              return dateObj.toLocaleString("pl-PL", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                timeZone: "Europe/Warsaw",
              });
            }
            return "-";
          },
        },
        {
          orderable: false,
          data: null,
          width: "72px",
          render: function (data, type, row) {
            if (type === "display") {
              const offer = row.offers[0];
              return `
                <div class="action-container">
                  <a href="#" offerId="${offer.offerId}" class="buttonoutline editme w-button">Przejdź</a>
                </div>`;
            }
            return "-";
          },
        },
      ],
      initComplete: function (settings, json) {
        var api = this.api();
        var textBox = $("#table_offers_filter label input");
        textBox.unbind();
        textBox.bind("keyup input", function (e) {
          if ((e.keyCode === 8 || e.keyCode === 46) && !textBox.val()) {
          } else if (e.keyCode === 13 || !textBox.val()) {
            api.search(this.value).draw();
          }
          toggleEmptyState();
        });
      },
      drawCallback: function () {
        toggleEmptyState();
      },
    });

    function toggleEmptyState() {
      var hasEntries = tableOffers.data().any();
      $("#emptystateoffers").toggle(!hasEntries);
      $("#offerscontainer").toggle(hasEntries);
    }

    $("#table_offers").on("click", "a", function () {
      var el = this;
      const offerId = el.getAttribute("offerId");
      console.log("offerId");
      window.location.replace(
        `https://${DomainName}/app/offers/offer?shopKey=${shopKey}&offerId=${offerId}`
      );
    });
  }

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
          "/app/pricelists/pricelist?uuid=" +
          rowData.uuid
      );
    }
  );

  function getWholesalers() {
    // Usuń stare style, aby uniknąć ich nakładania się
    document
      .querySelectorAll("style[data-tooltip-style]")
      .forEach((style) => style.remove());

    // Dodaj nowe style dla efektu migania
    var styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.setAttribute("data-tooltip-style", "true");
    styleSheet.innerText = `
        @keyframes tourDot {
            0%   { box-shadow: 0 0 0 0px rgba(255, 165, 0, 0.8); }
            80% { box-shadow: 0 0 0 36px rgba(255, 165, 0, 0); }
            100% { box-shadow: 0 0 0 36px rgba(255, 165, 0, 0); }
        }
        .tooltip-dot {
            animation: tourDot 2.0s ease-out infinite;
            background-color: rgb(255, 165, 0);
            border-color: rgb(255, 165, 0);
        }
    `;
    document.head.appendChild(styleSheet);

    // Fetch all data initially
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

    $.get(
      InvokeURL + "shops/" + shopKey + "/wholesalers",
      {
        perPage: 1000, // Fetch all records (adjust as needed)
        page: 1,
      },
      function (res) {
        initializeDataTable(res.items);

        // Check if any wholesaler has the status "Przywróć"
        var hasPrzywroc = res.items.some(function (wholesaler) {
          return (
            wholesaler.connections.ecommerce &&
            wholesaler.connections.ecommerce.enabled &&
            !wholesaler.connections.ecommerce.active
          );
        });

        // If a wholesaler with "Przywróć" is found, show the dot and apply styles
        if (hasPrzywroc) {
          document.querySelectorAll(".tooltip-dot").forEach(function (dot) {
            dot.classList.remove("hidden");
            dot.style.backgroundColor = "rgb(255, 165, 0)";
            dot.style.borderColor = "rgb(255, 165, 0)";
          });
        }
      }
    );

    function initializeDataTable(data) {
      var tablevendors = $("#table_wholesalers").DataTable({
        pagingType: "full_numbers",
        order: [[7, "asc"]],
        dom: '<"top">frt<"bottom"lip>',
        scrollY: "60vh",
        scrollCollapse: true,
        pageLength: 50,
        language: {
          emptyTable: "Brak danych",
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
        data: data, // Pass the fetched data here
        processing: true,
        search: {
          return: true,
        },
        columns: [
          {
            orderable: false,
            data: null,
            width: "36px",
            defaultContent:
              "<div class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61ae41350933c525ec8ea03a_office-building.svg' alt='offer'></img></div>",
          },
          {
            orderable: true,
            data: "wholesalerKey",
            visible: false,
            render: function (data) {
              return data || "";
            },
          },
          {
            orderable: true,
            data: "name",
            render: function (data) {
              return data || "";
            },
          },
          {
            orderable: true,
            data: "smartvan.smtp",
            width: "108px",
            visible: false,
            render: function (data) {
              if (data && data.enabled) {
                return '<span class="positive">Tak</span>';
              } else {
                return '<span class="negative">Nie</span>';
              }
            },
          },
          {
            orderable: false,
            data: "logisticMinimum",
            width: "108px",
            render: function (data) {
              return data || "-";
            },
          },
          {
            orderable: true,
            data: "connections.retroactive",
            width: "108px",
            visible: true,
            render: function (data) {
              if (data && data.enabled) {
                return '<span class="positive">Tak</span>';
              } else {
                return '<span class="noneexisting">Nie</span>';
              }
            },
          },
          {
            orderable: true,
            data: "smartvan.ftp",
            width: "72px",
            render: function (data) {
              if (data && data.enabled) {
                return '<span class="positive">Tak</span>';
              } else {
                return '<span class="medium">Dodaj</span>';
              }
            },
          },
          {
            orderable: false,
            data: "connections.wms",
            visible: false,
            width: "72px",
            render: function (data) {
              if (data && data.enabled) {
                return '<span class="positive">Tak</span>';
              } else {
                return '<span class="noneexisting">Brak</span>';
              }
            },
          },
          {
            orderable: true,
            data: "connections.ecommerce",
            width: "72px",
            render: function (data, type, row) {
              let sortValue = 4; // Domyślnie "Brak"
              let text = "Brak";
              let className = "noneexisting";

              if (data) {
                if (data.enabled && data.active) {
                  sortValue = 3; // "Tak"
                  text = "Tak";
                  className = "positive";
                } else if (!data.enabled && !data.active) {
                  sortValue = 2; // "Dodaj"
                  text = "Dodaj";
                  className = "medium";
                } else if (data.enabled && !data.active) {
                  sortValue = 1; // "Przywróć"
                  text = "Przywróć";
                  className = "improve";
                } else if (!data.enabled && data.active) {
                  sortValue = 2; // "Dodaj"
                  text = "Dodaj";
                  className = "medium";
                }
              }

              return `<span class="${className}"><span style="display:none">${sortValue}</span>${text}</span>`;
            },
          },
          {
            orderable: false,
            data: "wholesalerKey",
            width: "72px",
            render: function (data, type, row, meta) {
              return (
                '<div class="action-container"><a href="https://' +
                DomainName +
                "/app/wholesalers/wholesaler?shopKey=" +
                shopKey +
                "&wholesalerKey=" +
                data +
                '" class="buttonoutline editme w-button">Przejdź</a></div>'
              );
            },
          },
        ],
        drawCallback: function (settings) {
          // Ensure `tablevendors` is defined before calling `data()`
          if (tablevendors && tablevendors.data) {
            toggleEmptyState(tablevendors);
          }
        },
        rowCallback: function (row, data) {
          if (
            data.connections &&
            data.connections.ecommerce &&
            data.connections.ecommerce.enabled &&
            !data.connections.ecommerce.active
          ) {
            $("td", row).css("background-color", "#FFFAE6");
          }
        },
      });

      function toggleEmptyState() {
        var hasEntries = tablevendors.data().any();
        if (!hasEntries) {
          $("#emptystatevendors").show();
          $("#vendorscontainer").hide();
        } else {
          $("#emptystatevendors").hide();
          $("#vendorscontainer").show();
        }
      }
    }
  }

  $("#table_wholesalers").on("click", "tbody tr", function (event) {
    // Zapobiegaj przekierowaniu, jeśli kliknięto link
    if ($(event.target).is("a")) {
      return;
    }

    var table = $("#table_wholesalers").DataTable();
    var rowData = table.row($(this)).data();

    if (rowData && rowData.wholesalerKey) {
      window.location.replace(
        "https://" +
          DomainName +
          "/app/wholesalers/wholesaler?shopKey=" +
          shopKey +
          "&wholesalerKey=" +
          rowData.wholesalerKey
      );
    }
  });

  makeWebflowFormAjaxDeleteOrder = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      var selectedRow = null;
      var selectedOrderId = null;

      // Klik w ikonę kosza -> zapamiętaj dane i pokaż modal
      $("#table_orders").on("click", "td.details-control4", function () {
        var tr = $(this).closest("tr");
        var rowData = $("#table_orders").DataTable().row(tr).data();

        if (!rowData || !rowData.orderId || !shopKey) {
          displayMessage("Error", "Brakuje danych zamówienia lub sklepu.");
          return;
        }

        selectedRow = tr;
        selectedOrderId = rowData.orderId;

        $("#deleteOrderModal").css("display", "flex");
      });

      // Submit formularza modala
      form.on("submit", function (event) {
        event.preventDefault();

        if (!selectedOrderId || !shopKey) {
          displayMessage("Error", "Brakuje danych do usunięcia.");
          return false;
        }

        var action = `${InvokeURL}shops/${shopKey}/orders/${selectedOrderId}`;
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
          success: function () {
            if (typeof successCallback === "function") {
              var result = successCallback();
              if (!result) {
                displayMessage("Error", "Nie udało się usunąć zamówienia.");
                return false;
              }
            }

            if (selectedRow) {
              $("#table_orders").DataTable().row(selectedRow).remove().draw();
            }

            displayMessage("Success", "Zamówienie zostało usunięte.");
            $("#deleteOrderModal").css("display", "none");
            selectedRow = null;
            selectedOrderId = null;
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            displayMessage("Error", "Błąd podczas usuwania zamówienia.");
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
        var action = InvokeURL + "shops/" + shopKey;
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
                console.log(e);
                return;
              }
            }
            form.show();
            displayMessage("Success", "Twój sklep został usunięty.");
            window.setTimeout(function () {
              document.location =
                "https://" +
                DomainName +
                "/app/tenants/organization?name=" +
                OrganizationName +
                "&clientId=" +
                ClientID;
            }, 500);
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
                }, 3000);
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

    // shopCodeEdit
    var shopCodeEdit = $("#shopCodeEdit").val();
    if (shopCodeEdit !== currentData.shopKey) {
      patchData.push({ op: "replace", path: "/key", value: shopCodeEdit });
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

  // Function to handle tab switch
  $(".in-page-menu-link").on("click", function () {
    var $uploadButton = $("#UploadButton");
    var isFile = $("#orderfile").get(0).files.length > 0;

    // Adjust UploadButton based on active tab
    if ($(this).attr("data-w-tab") === "Tab 2") {
      $uploadButton
        .removeClass("disabledfornow")
        .text("Kontynuuj")
        .css({ opacity: 1, cursor: "pointer" });
    } else if (isFile) {
    } else if ($(this).attr("data-w-tab") === "Tab 1") {
      $uploadButton
        .addClass("disabledfornow")
        .text("Najpierw wybierz plik zamówienia.")
        .css({ opacity: 0.5, cursor: "default" });
    }
  });

  // Function to handle file change event
  $("#orderfile").change(function (e) {
    checkFileSelection();
  });

  function checkFileSelection() {
    if ($("#orderfile").get(0).files.length > 0) {
      // Files are selected
      $("#UploadButton")
        .removeClass("disabledfornow") // Remove disabled class
        .text("Kontynuuj") // Change button text
        .css({ opacity: 1, cursor: "pointer" }); // Set opacity and cursor
    } else {
      // No files selected
      $("#UploadButton")
        .addClass("disabledfornow") // Add disabled class
        .text("Najpierw wybierz plik zamówienia.") // Change button text
        .css({ opacity: 0.5, cursor: "default" }); // Set opacity and cursor
    }
  }

  // Click event handling for UploadButton
  $("#UploadButton").on("click", function (e) {
    e.preventDefault(); // Prevent default action

    if ($("#w-tabs-1-data-w-tab-0").hasClass("w--current")) {
      if (!$(this).hasClass("disabledfornow")) {
        // Proceed with upload if button is not disabled
        FileUpload(true);
      }
    } else if ($("#createfromscratch").hasClass("w--current")) {
      // Logic for "Stwórz z oferty" tab
      var action = InvokeURL + "shops/" + shopKey + "/orders";
      action += "?ignoreEmptyGtin=true";
      data = [];

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
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: orgToken,
          "Requested-By": "webflow-3-4",
        },
        success: function (response) {
          // PATCH request to update the created order
          var patchAction =
            InvokeURL + "shops/" + shopKey + "/orders/" + response.orderId;
          var patchData = [
            {
              op: "add",
              path: "/name",
              value: $("#OrderName").val(),
            },
          ];

          $.ajax({
            type: "PATCH",
            url: patchAction,
            cors: true,
            beforeSend: function () {
              $("#waitingdots").show();
            },
            complete: function () {
              $("#waitingdots").hide();
            },
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(patchData),
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: orgToken,
              "Requested-By": "webflow-3-4",
            },
            success: function () {
              displayMessage(
                "Success",
                "Twoje zamówienie zostało stworzone i zaktualizowane."
              );
              window.setTimeout(function () {
                window.location.replace(
                  "https://" +
                    DomainName +
                    "/app/orders/order?orderId=" +
                    response.orderId +
                    "&shopKey=" +
                    shopKey +
                    "&data-w-tab=add"
                );
              }, 1000);
            },
            error: function (jqXHR, exception) {
              console.log(jqXHR);
              console.log(exception);
              displayMessage(
                "Error",
                "Oops! Coś poszło nie tak podczas aktualizacji zamówienia. Proszę spróbuj ponownie."
              );
            },
          });
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(errorThrown);
          displayMessage(
            "Error",
            "Oops! Coś poszło nie tak. Proszę spróbuj ponownie."
          );
        },
      });
    }
  });

  function FileUpload(ignoreGTINs) {
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    var myUploadedFiles = document.getElementById("orderfile").files;
    var action =
      InvokeURL +
      "shops/" +
      shopKey +
      "/orders" +
      (ignoreGTINs ? "?ignoreEmptyGtin=true" : "");

    for (var i = 0; i < myUploadedFiles.length; i++) {
      formData.append("file", myUploadedFiles[i]);
    }
    formData.append("name", $("#OrderName").val());

    $("#waitingdots").show();
    xhr.open("POST", action);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Authorization", orgToken);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        $("#waitingdots").hide();
        if (xhr.status === 201) {
          handleSuccess(xhr);
        } else {
          handleError(xhr);
        }
      }
    };

    xhr.send(formData);
  }

  function handleSuccess(xhr) {
    var response = JSON.parse(xhr.responseText);
    var orderUrl =
      InvokeURL + "shops/" + shopKey + "/orders/" + response.orderId;
    updateOrderName(orderUrl, $("#OrderName").val());
    setTimeout(function () {
      window.location.replace(
        "https://" +
          DomainName +
          "/app/orders/order?orderId=" +
          response.orderId +
          "&shopKey=" +
          shopKey
      );
    }, 1000);
  }

  function updateOrderName(url, newName) {
    $.ajax({
      type: "PATCH",
      url: url,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify([{ op: "add", path: "/name", value: newName }]),
      headers: {
        Accept: "application/json",
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },
      beforeSend: function () {
        $("#waitingdots").show();
      },
      complete: function () {
        $("#waitingdots").hide();
      },
      success: function () {
        displayMessage("Success", "Twoje zamówienie zostało stworzone.");
        setTimeout(function () {
          window.location.replace(
            "https://" +
              DomainName +
              "/app/orders/order?orderId=" +
              response.orderId +
              "&shopKey=" +
              shopKey
          );
        }, 1000);
      },
      error: function (jqXHR, textStatus) {
        console.log(jqXHR);
        console.log(textStatus);
        displayMessage(
          "Error",
          "Oops! Coś poszło nie tak. Proszę spróbuj ponownie."
        );
      },
    });
  }

  function handleError(xhr) {
    var jsonResponse;
    try {
      jsonResponse = JSON.parse(xhr.responseText);
    } catch (e) {
      displayMessage("Error", "Nie można przetłumaczyć odpowiedzi serwera.");
      return;
    }

    var errorMessage =
      jsonResponse.message ||
      "Oops! Coś poszło nie tak. Proszę spróbuj ponownie.";

    // Custom handling for unsupported file format
    if (errorMessage.includes("Unsupported file format")) {
      var fileName = errorMessage.match(/\[([^\]]+)\]/)[1]; // Extracts filename within brackets
      errorMessage = "Nieobsługiwany format dla pliku: " + fileName;
    }

    // Custom handling for GTIN code length error
    if (errorMessage.includes("GTIN code is too long")) {
      var fileName = errorMessage.match(/\[([^\]]+)\]/)[1]; // Extracts filename within brackets
      errorMessage =
        "Nieprawidłowy plik [" +
        fileName +
        "]. Kod GTIN jest zbyt długi (maks. 14 znaków) dla niektórych produktów.";
    }

    displayMessage("Error", errorMessage);
  }

  cancelButton.addEventListener("click", () => {
    const modal = document.getElementById("wronggtinsmodal");
    if (modal) {
      modal.style.display = "none";
    }
  });

  makeWebflowFormAjaxDeleteOrder($("#wf-form-DeleteOrder"));
  makeWebflowFormAjaxDelete($("#wf-form-DeleteShop"));
  makeWebflowFormAjaxPatchShopEdit($("#wf-form-EditShop"));
  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));

  getWholesalers();
  getShop();
  getOrders();
  getOffers();

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
});
