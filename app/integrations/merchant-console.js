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
  var shopKey = new URL(location.href).searchParams.get("shopKey");
  var offerId = new URL(location.href).searchParams.get("offerId");
  var integrationKeyId = "merchant-console";
  document.getElementById("waitingdots").style.display = "flex";
  document.getElementById("Sample-Integration").style.display = "none";
  var ClientID = getCookieNameByValue(orgToken);
  var OrganizationName = getCookie("OrganizationName");
  const IntegrationBread = document.getElementById("IntegrationBread");
  IntegrationBread.setAttribute("href", window.location.href);
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

  function getIntegrations() {
    let url = new URL(InvokeURL + "integrations/merchant-console");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      var data = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        document.getElementById("Sample-Integration").style.display = "grid";

        const integrationDescription = document.getElementById(
          "integrationDescription"
        );
        integrationDescription.textContent = data.description;

        const integrationLogo = document.getElementById("integrationLogo");
        integrationLogo.src = "data:image/png;base64," + data.image;

        const integrationStatus = document.getElementById("integrationStatus");
        const integrationButton = document.getElementById("integrationButton");
        const integrationBlock = document.getElementById("enabledblock");

        if (data.enabled === true) {
          integrationStatus.textContent = "Aktywny";
          integrationStatus.style.color = "green";
          integrationButton.value = "Zmień dane logowania";
          getShops();
          integrationBlock.style.display = "flex";
        } else {
          integrationStatus.textContent = "Nieaktywny";
        }

        if (data.credentials) {
          const integrationLogin = document.getElementById("Username");
          integrationLogin.value = data.credentials.username || "";

          const integrationHost = document.getElementById("Host");
          integrationHost.value = data.credentials.host || "";

          const integrationPort = document.getElementById("Port");
          integrationPort.value = data.credentials.port || "";

          const integrationEngine = document.getElementById("engine");
          integrationEngine.value = data.credentials.engine || "";

          const integrationDbName = document.getElementById("dbname");
          integrationDbName.value = data.credentials.dbname || "";
        } else {
          console.warn("Credentials data is missing or undefined.");
        }
      } else if (request.status === 401) {
        console.log("Unauthorized");
      }
    };
    request.send();
  }

  function getShops() {
    async function getIDS() {
      let times = [{ id: "", shortName: "" }];
      let shopKeyToMCSId = {};
      let url2 = new URL(
        InvokeURL + "integrations/merchant-console/shops?perPage=1000"
      );
      let request2 = new XMLHttpRequest();
      request2.open("GET", url2, true);
      request2.setRequestHeader("Authorization", orgToken);
      request2.onload = async function () {
        var data2 = JSON.parse(this.response);
        var toParse2 = data2.items;
        if (request2.status >= 200 && request2.status < 400) {
          toParse2.forEach((item) => {
            times.push({
              id: item.id,
              shortName: item.shortName,
            });
            if (item.shopKey) {
              shopKeyToMCSId[item.shopKey] = item.id;
            }
          });
          createAll(times, shopKeyToMCSId);
          return await new Promise(
            (resolve) => (request2.onload = resolve(times))
          );
        }
        if (request2.status == 401) {
          console.log("Unauthorized");
          console.log(times);
          return await new Promise(
            (resolve) => (request2.onload = resolve(times))
          );
        }
      };
      request2.send();
    }

    function format(d) {
      var mcsId = d._mcsId || "";
      var toDisplayHtml =
        "<tr><td>Nazwa:</td><td>" +
        d.name +
        "</td><tr><td>Konsola-Kupca SklepId:</td><td>" +
        mcsId +
        "</td><tr><td>Klucz Sklepu:</td><td>" +
        d.shopKey +
        "</td>";
      return (
        "<table style='display: flex;' ><tr><th></th><th></th></tr>" +
        toDisplayHtml +
        "</table>"
      );
    }

    function createAll(sklepy, shopKeyToMCSId) {
      const optionsHTML = sklepy.reduce(
        (html, value) =>
          html + `<option value=${value.id}>${value.shortName}</option>`,
        ""
      );
      const selectHTML = `<select class="id100">${optionsHTML}</select>`;

      let url = new URL(InvokeURL + "shops?perPage=100");
      let request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.setRequestHeader("Authorization", orgToken);
      request.setRequestHeader("Requested-By", "webflow-3-4");
      request.onload = function () {
        var data2 = JSON.parse(this.response);
        var table = $("#table_integrated_shops_list").DataTable({
          data: data2.items,
          pagingType: "full_numbers",
          order: [],
          dom: '<"top">frt<"bottom"lip>',
          scrollY: "60vh",
          scrollCollapse: true,
          pageLength: 100,
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
          columns: [
            {
              orderable: false,
              class: "details-control",
              data: null,
              defaultContent: "",
            },
            {
              orderable: true,
              data: "name",
              render: function (data) {
                if (data !== null) {
                  return data;
                }
                if (data === null) {
                  return "";
                }
              },
            },
            {
              orderable: true,
              data: "shopKey",
              visible: false,
              render: function (data) {
                if (data !== null) {
                  return data;
                }
                if (data === null) {
                  return "";
                }
              },
            },
            {
              orderable: true,
              data: null,
              render: function () {
                return selectHTML.toString();
              },
            },
          ],
          rowCallback: function (row, data) {
            var mcsId = shopKeyToMCSId[data.shopKey] || "";
            data._mcsId = mcsId;
            $("td:eq(2) select", row).val(mcsId);
            $("td:eq(2) select", row).change();
          },
        });

        $("#table_integrated_shops_list").on(
          "click",
          "td.details-control",
          function () {
            var tr = $(this).closest("tr");
            var row = table.row(tr);

            if (row.child.isShown()) {
              row.child.hide();
              tr.removeClass("shown");
            } else {
              row.child(format(row.data())).show();
              tr.addClass("shown");
            }
          }
        );

        $(".id100").on("focusin", function () {
          $(this).data("val", parseInt($(this).val()));
        });

        $(".id100").on("change", function () {
          var shopKey = table.row($(this).closest("tr")).data().shopKey;
          var previousMCSId = $(this).data("val");
          var merchantConsoleShopId = parseInt($(this).val());

          var payload = [];
          var method = "PATCH";

          if (isNaN(merchantConsoleShopId)) {
            var action =
              InvokeURL +
              "integrations/merchant-console/shops/" +
              previousMCSId;
            console.log("delete");
            var content = {
              op: "remove",
              path: "/shopKey",
            };
            payload.push(content);
          } else if (previousMCSId > 0) {
            console.log("Deleting old one");
            $.ajax({
              type: method,
              async: false, // important
              url:
                InvokeURL +
                "integrations/merchant-console/shops/" +
                previousMCSId,
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
              data: JSON.stringify([{ op: "remove", path: "/shopKey" }]),
              processData: false,
              success: function (resultData) {
                $(".warningmessagetext").css("color", "#ffffff");
                if (isNaN(merchantConsoleShopId)) {
                  $(".warningmessagetext").text(
                    "Sukces. Pomyślnie usunięto integracje sklepu z Konsolą Kupca"
                  );
                } else {
                  $(".warningmessagetext").text(
                    "Sukces. Pomyślnie zintegrowano sklep z Konsolą Kupca"
                  );
                }
                $(".error-message-fixed-main").css(
                  "background-color",
                  "#00754e"
                );
                $("#WarningMessageContainer").show();
                $("#WarningMessageContainer").fadeOut(6000);

                if (typeof successCallback === "function") {
                  result = successCallback(resultData);
                  if (!result) {
                    return;
                  }
                }
              },
              error: function (jqXHR, exception) {
                var msg = "";
                if (jqXHR.status === 0) {
                  msg = "Nie masz połączenia z internetem.";
                } else if (jqXHR.status == 404) {
                  msg = "Nie znaleziono strony";
                } else if (jqXHR.status == 403) {
                  msg = "Nie masz uprawnień do tej czynności";
                } else if (jqXHR.status == 409) {
                  msg =
                    "Nie można zmienić kodu. Jeden ze sklepów wciąż korzysta z tego kodu.";
                } else if (jqXHR.status == 500) {
                  msg =
                    "Serwer napotkał problemy. Prosimy o kontakt kontakt@smartcommerce.net [500].";
                } else if (exception === "parsererror") {
                  msg = "Nie udało się odczytać danych";
                } else if (exception === "timeout") {
                  msg = "Przekroczony czas oczekiwania";
                } else if (exception === "abort") {
                  msg = "Twoje żądanie zostało zaniechane";
                } else {
                  msg = "" + jqXHR.responseJSON.message;
                }

                $(".warningmessagetext").css("color", "#3a4570");
                $(".warningmessagetext").text(msg);
                $(".error-message-fixed-main").css(
                  "background-color",
                  "#ffc53d"
                );
                $("#WarningMessageContainer").show();
                $("#WarningMessageContainer").fadeOut(6000);
                return;
              },
            });
            var action =
              InvokeURL +
              "integrations/merchant-console/shops/" +
              merchantConsoleShopId;
            var content = {
              op: "add",
              path: "/shopKey",
              value: shopKey,
            };
            payload.push(content);
          } else {
            console.log("add");
            var action =
              InvokeURL +
              "integrations/merchant-console/shops/" +
              merchantConsoleShopId;
            var content = {
              op: "add",
              path: "/shopKey",
              value: shopKey,
            };
            payload.push(content);
          }

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
            data: JSON.stringify(payload),
            processData: false,
            success: function (resultData) {
              $(".warningmessagetext").css("color", "#ffffff");
              if (isNaN(merchantConsoleShopId)) {
                $(".warningmessagetext").text(
                  "Sukces. Pomyślnie usunięto integracje sklepu z Konsolą Kupca"
                );
              } else {
                $(".warningmessagetext").text(
                  "Sukces. Pomyślnie zintegrowano sklep z Konsolą Kupca"
                );
              }
              $(".error-message-fixed-main").css("background-color", "#00754e");
              $("#WarningMessageContainer").show();
              $("#WarningMessageContainer").fadeOut(6000);

              if (typeof successCallback === "function") {
                result = successCallback(resultData);
                if (!result) {
                  return;
                }
              }
            },
            error: function (jqXHR, exception) {
              var msg = "";
              if (jqXHR.status === 0) {
                msg = "Nie masz połączenia z internetem.";
              } else if (jqXHR.status == 404) {
                msg = "Nie znaleziono strony";
              } else if (jqXHR.status == 403) {
                msg = "Nie masz uprawnień do tej czynności";
              } else if (jqXHR.status == 409) {
                msg =
                  "Nie można zmienić kodu. Jeden ze sklepów wciąż korzysta z tego kodu.";
              } else if (jqXHR.status == 500) {
                msg =
                  "Serwer napotkał problemy. Prosimy o kontakt kontakt@smartcommerce.net [500].";
              } else if (exception === "parsererror") {
                msg = "Nie udało się odczytać danych";
              } else if (exception === "timeout") {
                msg = "Przekroczony czas oczekiwania";
              } else if (exception === "abort") {
                msg = "Twoje żądanie zostało zaniechane";
              } else {
                msg = "" + jqXHR.responseJSON.message;
              }

              $(".warningmessagetext").css("color", "#3a4570");
              $(".warningmessagetext").text(msg);
              $(".error-message-fixed-main").css("background-color", "#ffc53d");
              $("#WarningMessageContainer").show();
              $("#WarningMessageContainer").fadeOut(6000);
              return;
            },
          });
        });
      };
      request.send();
    }

    async function main() {
      let result = await getIDS();
    }
    main();
  }

  makeWebflowFormAjaxCreate = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var inputdata = form.serializeArray();

        var data = {
          username: inputdata[0].value,
          password: inputdata[1].value,
          host: inputdata[2].value.trim(),
          port: parseInt(inputdata[3].value.trim()),
          engine: inputdata[4].value,
          dbname: inputdata[5].value.trim(),
        };

        $.ajax({
          type: "PUT",
          url: InvokeURL + "integrations/merchant-console",
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
                console.log(e);
                return;
              }
            }
            form.show();
            displayMessage(
              "Success",
              "Integracja z Konsolą Kupca przebiegła pomyślnie."
            );
            window.setTimeout(function () {
              location.reload();
            }, 1000);
          },
          error: function (jqXHR, exception) {
            var msg =
              "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
            displayMessage("Error", msg);
            form.show();
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxDelete = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action = InvokeURL + "integrations/" + integrationKeyId;
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
                return;
              }
            }
            form.show();
            displayMessage(
              "Success",
              "Integracja z Konsolą Kupca została usunięta."
            );
            window.setTimeout(function () {
              (document.location = "href"),
                "https://" +
                  DomainName +
                  "/app/tenants/organization?name=" +
                  OrganizationName +
                  "&clientId=" +
                  ClientID;
            }, 5000);
          },
          error: function (jqXHR, exception) {
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

  getIntegrations();
  $("#waitingdots").hide();
  makeWebflowFormAjaxCreate($("#wf-form-pcmarket"));
  makeWebflowFormAjaxDelete($("#wf-form-DeleteIntegration"));
  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));
});
