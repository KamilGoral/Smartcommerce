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
  console.log("DataTables is ready, DOM is ready");
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

  function handleGoToOrder(url, orderName) {
    setCookie("orderName", orderName, 3600); // np. 1 godzina ważności
    window.location.href = url;
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
          data: null,
          width: "72px",
          render: function (data, type, row) {
            if (type === "display" && row.orderId) {
              let url = `https://${DomainName}/app/orders/order?orderId=${row.orderId}&shopKey=${shopKey}`;
              let orderName = row.name ? encodeURIComponent(row.name) : "";
              return `<div class="action-container">
                      <a href="#" class="buttonoutline editme w-button go-to-order" 
                        data-url="${url}" 
                        data-name="${orderName}">
                        Przejdź
                      </a>
                    </div>`;
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
        // Dodaj eventy do przycisków "Przejdź"
        $(".go-to-order")
          .off("click")
          .on("click", function (e) {
            e.preventDefault();
            const url = $(this).data("url");
            const orderName = decodeURIComponent($(this).data("name"));
            handleGoToOrder(url, orderName);
          });
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

  function filenameBase(name) {
    return (name || "").replace(/\.[^.]+$/, "");
  }

  function normalizeOrderName(raw) {
    if (!raw) return "";
    let s = raw.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    if (s.length > 63) s = s.slice(0, 63).trim();
    return s;
  }

  function longestCommonPrefix(arr) {
    if (!arr.length) return "";
    let p = arr[0];
    for (let i = 1; i < arr.length; i++) {
      while (arr[i].indexOf(p) !== 0) {
        p = p.slice(0, -1);
        if (!p) return "";
      }
    }
    return p;
  }

  /**
   * Zbuduj wieloplikową nazwę: "A + B + C + N plików…"
   * - pilnuje limitu znaków
   * - nie duplikuje nazw
   */
  function buildMultiFileName(bases, maxLen) {
    const unique = Array.from(new Set(bases.map(normalizeOrderName))).filter(
      Boolean
    );
    if (!unique.length) return "";

    let result = "";
    let used = 0;

    for (let i = 0; i < unique.length; i++) {
      const sep = result ? " + " : "";
      const cand = result + sep + unique[i];

      // ile zostanie znaków na ewentualny sufiks " + N plików…"
      const remaining = unique.length - (i + 1);
      const suffix = remaining > 0 ? ` + ${remaining} plikow…` : "";

      if (cand.length + suffix.length <= maxLen) {
        result = cand;
        used = i + 1;
      } else {
        // spróbuj zmieścić chociaż bieżący element skrócony
        const roomForThis =
          maxLen - (result ? result.length + sep.length : 0) - suffix.length;
        if (roomForThis > 0 && remaining >= 0) {
          const shortened = unique[i].slice(0, roomForThis).trim();
          if (shortened) {
            result = (result ? result + sep : "") + shortened + suffix;
            used = i + 1;
            break;
          }
        }
        // nie zmieści się — domknij obecny wynik z sufiksem
        if (remaining > 0) result = result + suffix;
        break;
      }
    }

    // jeśli i tak nic nie weszło (np. pierwszy był ekstremalnie długi), tniemy pierwszy do maxLen
    if (!result) result = unique[0].slice(0, maxLen).trim();
    return result;
  }

  /**
   * Wyprowadź nazwę z listy plików:
   * 1) sensowny LCP (po normalizacji) → bierzemy,
   * 2) inaczej: wieloplikowe "A + B + … + N plików…"
   */
  function deriveNameFromFiles(fileList, maxLen = 63) {
    if (!fileList || !fileList.length) return "";
    const rawBases = Array.from(fileList).map((f) => filenameBase(f.name));
    const lcpRaw = longestCommonPrefix(rawBases);
    const lcp = normalizeOrderName(lcpRaw);

    // heurystyka "sensowności" LCP:
    // - min 6 znaków i
    // - krótszy niż 80% najkrótszej nazwy (żeby nie był praktycznie całą nazwą jednego pliku przypadkiem)
    const minLen = Math.min(...rawBases.map((b) => b.length));
    const lcpIsUseful =
      lcp.length >= 6 && lcp.length <= Math.floor(minLen * 0.8);

    if (lcpIsUseful) {
      return lcp.slice(0, maxLen).trim();
    }

    // brak dobrego LCP → buduj nazwę wieloplikową
    return buildMultiFileName(rawBases, maxLen);
  }

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

    // tylko pliki – BEZ nazwy w multipart
    for (var i = 0; i < myUploadedFiles.length; i++) {
      formData.append("file", myUploadedFiles[i]);
    }

    $("#waitingdots").show();
    xhr.open("POST", action);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Authorization", orgToken);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        $("#waitingdots").hide();
        if (xhr.status === 201) {
          var resp = JSON.parse(xhr.responseText || "{}");
          var orderId = resp.orderId;
          var orderUrl = InvokeURL + "shops/" + shopKey + "/orders/" + orderId;

          // ustal nazwę: input > z plików
          var inputName = ($("#OrderName").val() || "").trim();
          var finalName = inputName || deriveNameFromFiles(myUploadedFiles);

          if (finalName) {
            updateOrderName(orderUrl, finalName, orderId); // redirect w success PATCH
          } else {
            // brak nazwy — sam redirect
            setTimeout(function () {
              window.location.replace(
                "https://" +
                  DomainName +
                  "/app/orders/order?orderId=" +
                  orderId +
                  "&shopKey=" +
                  shopKey
              );
            }, 1000);
          }
        } else {
          handleError(xhr);
        }
      }
    };

    xhr.send(formData);
  }

  function updateOrderName(url, newName, orderId) {
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
        setCookie("orderName", newName, 3600);
        setTimeout(function () {
          window.location.replace(
            "https://" +
              DomainName +
              "/app/orders/order?orderId=" +
              orderId +
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

  //Offer view in shop // Start //

  let offerStatusLoaded = false;
  let lastOfferFetchTimestamp = 0;
  const MIN_FETCH_INTERVAL_MS = 10;

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
              wholesalerKey: wms.key || "Program magazynowy",
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

        const setClass = (id, className) => {
          const el = document.getElementById(id);
          if (el) {
            el.classList.remove("positive", "medium", "negative");
            el.classList.add(className);
          }
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
        let completenessClass = "";

        if (allCount > 0) {
          const percentage = Math.round((successCount / allCount) * 100);
          completenessLabel = `${percentage}%`;

          // Przypisanie klasy w zależności od procentu
          if (percentage >= 90) {
            completenessClass = "positive";
          } else if (percentage >= 80) {
            completenessClass = "medium";
          } else {
            completenessClass = "negative";
          }
        }

        // Ustaw tekst i klasę
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

  function getProductHistory(rowData, { startAt, endAt } = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        // 0) Domyślny stock i zakres czasu
        if (rowData.stock === null) {
          rowData.stock = { value: 0, unit: "pieces" };
        }
        const now = new Date();
        const endISO = endAt || now.toISOString();
        const startISO =
          startAt ||
          new Date(now.getTime() - 1000 * 60 * 60 * 24 * 90).toISOString(); // 90 dni

        // 1) Pobranie nowych endpointów równolegle
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

        // 2) Transformacja: ASKS → serie „stepline”
        //    Każdy segment zaczyna obowiązywać od swojego timestamp.
        //    Dodajemy sztuczny punkt końcowy w endAt, żeby wykres „przeciągnął” ostatnią wartość.
        function transformAsks(segments, startISO, endISO) {
          const lowest = [];
          const average = [];

          // posortuj segmenty po czasie (na wszelki wypadek)
          const sorted = [...segments].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );

          for (const seg of sorted) {
            const t = new Date(seg.timestamp).toISOString();
            lowest.push({ x: t, y: seg.lowest ?? null });
            average.push({ x: t, y: seg.average ?? null });
          }

          // Jeśli mamy przynajmniej jeden segment, „przeciągnij” ostatnią znaną wartość do endISO
          if (sorted.length > 0) {
            const last = sorted[sorted.length - 1];
            lowest.push({ x: endISO, y: last.lowest ?? null });
            average.push({ x: endISO, y: last.average ?? null });
          } else {
            // Brak danych — oznaczamy lukę na cały zakres (null)
            lowest.push({ x: startISO, y: null }, { x: endISO, y: null });
            average.push({ x: startISO, y: null }, { x: endISO, y: null });
          }

          return { lowest, average };
        }

        // 3) Transformacja: WMS → serie dzienne {x:timestamp, y:value}
        function transformWms(daily) {
          // posortuj po czasie rosnąco
          const sorted = [...daily].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );

          const retailPrice = [];
          const standardPrice = [];
          const stock = [];
          const volume = [];
          const units = new Set();

          for (const d of sorted) {
            const x = new Date(d.timestamp).toISOString();
            units.add(d.unit || "");
            retailPrice.push({ x, y: d.retailPrice ?? null });
            standardPrice.push({ x, y: d.standardPrice ?? null });
            stock.push({ x, y: d.stock ?? null });
            volume.push({ x, y: d.volume ?? null });
          }
          return { retailPrice, standardPrice, stock, volume, units };
        }

        const asks = transformAsks(asksSegments, startISO, endISO);
        const wms = transformWms(wmsDaily);

        // 4) Metryki do kart (7, 90 dni) na bazie WMS.volume
        function sumLastDays(series, days) {
          if (!series.length) return 0;
          // bierzemy dane z końca zakresu w dół do 'days' pozycji (one są już posortowane rosnąco)
          const tail = series.slice(-days);
          return tail.reduce(
            (acc, p) => acc + (typeof p.y === "number" ? p.y : 0),
            0
          );
          // Uwaga: jeśli są null-e w środku, liczymy tylko liczby (null = 0)
        }

        const sales7 = sumLastDays(wms.volume, 7);
        const sales90 = sumLastDays(wms.volume, 90);

        const stockNow =
          (typeof rowData?.stock?.value === "number"
            ? rowData.stock.value
            : 0) ||
          (wms.stock.length ? wms.stock[wms.stock.length - 1].y || 0 : 0);

        const stockDays =
          sales7 > 0 ? Math.round((stockNow / (sales7 / 7)) * 1) : "";

        // Zmiany cen (procent) między pierwszym a ostatnim punktem w zakresie
        function pct(first, last) {
          if (
            typeof first !== "number" ||
            typeof last !== "number" ||
            last === 0
          )
            return "";
          return Number((((first - last) / last) * 100).toFixed(2));
        }
        const rpFirst = wms.retailPrice[0]?.y ?? null;
        const rpLast = wms.retailPrice[wms.retailPrice.length - 1]?.y ?? null;
        const spFirst = wms.standardPrice[0]?.y ?? null;
        const spLast =
          wms.standardPrice[wms.standardPrice.length - 1]?.y ?? null;

        const retailPriceDeltaPct = pct(rpFirst, rpLast);
        const standardPriceDeltaPct = pct(spFirst, spLast);

        // 5) Aktualizacja UI (dostosuj id jeśli masz inne)
        const formatDate = (iso) => (iso ? iso.split("T")[0] : "-");
        const pHistory = document.getElementById("pHistory");
        const pHistorySpan = document.getElementById("pHistorySpan");
        const pOfferDate = document.getElementById("pOfferDate");
        const pRetailPriceChange =
          document.getElementById("pRetailPriceChange");
        const pStandardPriceChange = document.getElementById(
          "pStandardPriceChange"
        );
        const pSales7 = document.getElementById("pSales7");
        const pSales90 = document.getElementById("pSales90");
        const pStockDays = document.getElementById("pStockDays");

        // liczba punktów czasowych (łączna z asks + wms)
        const uniqueDates = new Set([
          ...asks.lowest.map((p) => formatDate(p.x)),
          ...wms.retailPrice.map((p) => formatDate(p.x)),
        ]);
        if (pHistory) pHistory.textContent = uniqueDates.size;
        if (pHistorySpan)
          pHistorySpan.textContent = `${formatDate(endISO)} - ${formatDate(
            startISO
          )}`;
        if (pOfferDate) pOfferDate.textContent = formatDate(startISO);
        if (pRetailPriceChange)
          pRetailPriceChange.textContent =
            retailPriceDeltaPct === "" ? "" : `(${retailPriceDeltaPct}%)`;
        if (pStandardPriceChange)
          pStandardPriceChange.textContent =
            standardPriceDeltaPct === "" ? "" : `(${standardPriceDeltaPct}%)`;
        if (pSales7)
          pSales7.textContent = Number.isFinite(sales7) ? sales7 : "";
        if (pSales90)
          pSales90.textContent = Number.isFinite(sales90) ? sales90 : "";
        if (pStockDays)
          pStockDays.textContent = Number.isFinite(stockDays) ? stockDays : "";

        // 6) Budowa serii do ApexCharts (xaxis: datetime)
        //    Utrzymujemy Twoje nazwy serii PL, ale zmieniamy dane na {x,y}
        const series = [
          { name: "Najnizsza (asks)", type: "line", data: asks.lowest },
          { name: "Srednia (asks)", type: "line", data: asks.average },
          { name: "Cena det. (WMS)", type: "line", data: wms.retailPrice },
          { name: "Cena ew. (WMS)", type: "line", data: wms.standardPrice },
          { name: "Sprzedaz (WMS)", type: "bar", data: wms.volume },
          { name: "Stan (WMS)", type: "bar", data: wms.stock },
        ];

        // 7) Skale: ceny oraz ilości
        const priceValues = []
          .concat(asks.lowest.map((p) => p.y))
          .concat(asks.average.map((p) => p.y))
          .concat(wms.retailPrice.map((p) => p.y))
          .concat(wms.standardPrice.map((p) => p.y))
          .filter((v) => typeof v === "number");

        const qtyValues = []
          .concat(wms.volume.map((p) => p.y))
          .concat(wms.stock.map((p) => p.y))
          .filter((v) => typeof v === "number");

        const scaleMax = priceValues.length
          ? Math.max(...priceValues) * 1.1
          : undefined;
        const scaleMin = priceValues.length
          ? Math.min(...priceValues) * 0.9
          : undefined;
        const qtyMax = qtyValues.length
          ? Math.max(...qtyValues) * 1.1
          : undefined;
        const qtyMin = qtyValues.length
          ? Math.min(...qtyValues) * 0.9
          : undefined;

        const options = {
          series,
          chart: {
            id: "productHistoryChart",
            defaultLocale: "pl",
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
          // Kolory możesz zostawić swoje lub nadpisać
          colors: [
            "#FD6A6A",
            "#F9C80E",
            "#3F51B5",
            "#03A9F4",
            "#92A9BD",
            "#D3DEDC",
          ],
          title: {
            text: "Historia towaru",
            align: "left",
            style: {
              fontSize: "14px",
              fontWeight: "bold",
              fontFamily: "Arial",
            },
          },
          stroke: {
            width: [2, 2, 2, 2, 1, 1],
            // asks jako "stepline", reszta smooth
            curve: [
              "stepline",
              "stepline",
              "smooth",
              "smooth",
              "smooth",
              "smooth",
            ],
          },
          plotOptions: {
            bar: { columnWidth: "50%", colors: { backgroundBarOpacity: 0.5 } },
          },
          markers: { size: 0 },
          xaxis: {
            type: "datetime",
            labels: { show: true, rotate: -45, hideOverlappingLabels: true },
            min: new Date(startISO).getTime(),
            max: new Date(endISO).getTime(),
          },
          yaxis: [
            {
              seriesName: "Cena",
              max: scaleMax,
              min: scaleMin,
              forceNiceScale: false,
              title: { text: "Cena" },
            },
            { show: false },
            { show: false },
            { show: false },
            {
              opposite: true,
              seriesName: "Ilosc",
              max: qtyMax,
              min: qtyMin,
              forceNiceScale: true,
              title: { text: "Ilosc" },
            },
            { show: false },
          ],
          tooltip: {
            shared: true,
            intersect: false,
            x: { format: "yyyy-MM-dd HH:mm" },
            y: {
              formatter: function (y) {
                if (y === null || typeof y === "undefined") return "-";
                return y;
              },
            },
          },
          legend: {
            position: "right",
            horizontalAlign: "center",
            offsetX: 0,
            offsetY: 20,
            markers: { width: 12, height: 12, radius: 12 },
          },
        };

        // 8) Render / Update
        if (window.__productHistoryRendered) {
          ApexCharts.exec(
            "productHistoryChart",
            "updateOptions",
            options,
            false,
            true
          );
        } else {
          const chart = new ApexCharts(
            document.getElementById("chart"),
            options
          );
          await chart.render();
          window.__productHistoryRendered = true;
        }

        resolve();
      } catch (err) {
        console.error(err);
        reject(
          "Błąd podczas pobierania/rysowania historii produktu (nowe endpointy)."
        );
      }
    });
  }

  const ASK_CODE_MAP = {
    // 1xxx – błędy danych źródłowych
    1001: {
      name: "Podwójny produkt",
      desc: "Ten sam towar pojawił się kilka razy.",
    },
    1002: { name: "Błędne dane", desc: "Ceny lub ilości nie da się odczytać." },
    1003: {
      name: "Problem z promocją",
      desc: "Nie udało się odczytać danych promocji.",
    },
    1004: { name: "Zła promocja", desc: "Promocja ma niepoprawne dane." },
    1005: {
      name: "Błąd oferty",
      desc: "Promocja działa, ale główna oferta jest błędna.",
    },
    1006: {
      name: "Powtórzona promocja",
      desc: "Ta sama promocja już istnieje.",
    },
    1007: {
      name: "Błędna promocja gratis",
      desc: "Dane o gratisach są niepoprawne.",
    },
    1008: {
      name: "Błędna promocja pakietowa",
      desc: "W promocji pakietowej coś się nie zgadza.",
    },
    1009: {
      name: "Niepoprawny kod produktu",
      desc: "Kod produktu jest błędny.",
    },

    // 2xxx – błędy w obróbce
    2001: {
      name: "Zbyt dziwna cena",
      desc: "Oferta odrzucona – cena zbyt odbiega od innych.",
    },

    // 3xxx – błędy wyświetlania / stanów
    3001: { name: "Brak towaru", desc: "Nie ma tego towaru na stanie." },
  };

  function escapeAttr(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function formatMessageCodesTooltip(codes = []) {
    if (!Array.isArray(codes) || codes.length === 0) return "Brak kodów błędów";
    const lines = codes.map((c) => {
      const code = String(c).trim();
      const meta = ASK_CODE_MAP[code] || ASK_CODE_MAP[Number(code)];
      if (meta) return `${code} – ${meta.name}: ${meta.desc}`;
      return `${code} – Nieznany błąd`;
    });
    return escapeAttr(lines.join(" • "));
  }

  function format(d) {
    const arr = d.asks || [];

    const sourceMap = {
      "price list": "Cennik",
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
          ? `Problemy: ${formatMessageCodesTooltip(item.messageCodes)}`
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

  // Cache: shop|promo|wh → [gtin...]
  const relatedCache = new Map();

  /**
   * Pobiera powiązane GTIN dla promocji (singular === false).
   * Zwraca Promise<Array<string>>.
   */
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

  $("#table_id tbody").on("click", "img.showdata", function () {
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

        // ten sam układ co u Ciebie (grupowanie po 5)
        let output = "";
        for (let i = 0; i < values.length; i++) {
          if (i % 5 === 0)
            output += "<p class='text-size-tiny text-color-grey'>";
          const code = String(values[i]).trim();
          output += `<span class="related-product-code" style="text-decoration: underline; cursor: pointer; margin-right: 6px;" data-code="${code}">${code}</span>`;
          if ((i + 1) % 5 === 0 || i === values.length - 1) output += "</p>";
        }

        popupContent.innerHTML = output;
        popupContainer.style.display = "flex";

        // filtruj tabelę po kliknięciu kodu
        popupContent.querySelectorAll(".related-product-code").forEach((el) => {
          el.addEventListener("click", function () {
            const code = this.getAttribute("data-code");
            const table = $("#table_id").DataTable();
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

  // Zainicjuj po DOMReady / po DataTables draw NIE MUSISZ wołać ponownie,
  // bo używamy delegacji. Jeśli chcesz – możesz wywołać raz tutaj:
  initializeSimpleTooltips();

  getWholesalersSh();
  initOfferStatusTable();

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

  //Offer view in shop // End //

  makeWebflowFormAjaxDeleteOrder($("#wf-form-DeleteOrder"));
  makeWebflowFormAjaxDelete($("#wf-form-DeleteShop"));
  makeWebflowFormAjaxPatchShopEdit($("#wf-form-EditShop"));
  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));

  getWholesalers();
  getShop();
  getOrders();

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
