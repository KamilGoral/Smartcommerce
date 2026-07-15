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

  const NewpriceListIdBread = document.getElementById("NewpriceListIdBread");
  NewpriceListIdBread.setAttribute("href", "" + window.location.href);

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
      toParse.forEach((wholesaler) => {
        if (wholesaler.enabled) {
          var opt = document.createElement("option");
          opt.value = wholesaler.wholesalerKey;
          opt.innerHTML = wholesaler.name;
          wholesalerContainer.appendChild(opt);
        }
      });
    } catch (e) {
      if (e.message === "HTTP 401") console.log("Unauthorized");
      else console.error("Failed to load wholesalers", e);
    }
  }

  function getShops() {
    let url = new URL(InvokeURL + "shops?perPage=1000");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;

      if (request.status >= 200 && request.status < 400) {
        const shopKeysContainer = document.getElementById("shopKeys");
        toParse.forEach((shop) => {
          var opt = document.createElement("option");
          opt.value = shop.shopKey;
          opt.innerHTML = shop.name;
          opt.selected = true;
          shopKeysContainer.appendChild(opt);
        });
        if (request.status == 401) {
          console.log("Unauthorized");
        }
        $("option").mousedown(function (e) {
          e.preventDefault();
          var originalScrollTop = $(this).parent().scrollTop();
          console.log(originalScrollTop);
          $(this).prop("selected", $(this).prop("selected") ? false : true);
          var self = this;
          $(this).parent().focus();
          setTimeout(function () {
            $(self).parent().scrollTop(originalScrollTop);
          }, 0);

          return false;
        });
      }
    };
    request.send();
  }

  makeWebflowFormAjax = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form3 = $(this);

      const uploadButtons = form3[0].querySelectorAll("[file_uploader]");
      const deleteFileButton = document.getElementById("deleteFileButton");

      if (deleteFileButton) {
        deleteFileButton.style.display = "none";
      }

      let lastFileInput = null;
      let lastUploadButton = null;

      // -------- PRZYCISKI UPLOAD --------
      uploadButtons.forEach((button) => {
        // zapamiętujemy oryginalny HTML przycisku
        if (!button.dataset.defaultHtml) {
          button.dataset.defaultHtml = button.innerHTML;
        }

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.style.display = "none";
        fileInput.name = button.getAttribute("file_uploader");
        document.body.appendChild(fileInput);

        button.addEventListener("click", function (e) {
          if (!button.classList.contains("file-selected")) {
            // brak pliku – otwórz dialog
            e.preventDefault();
            fileInput.click();
          } else {
            // plik jest – submit
            form3.submit();
          }
        });

        fileInput.addEventListener("change", function () {
          if (fileInput.files.length > 0) {
            const fileName = fileInput.files[0].name;

            lastFileInput = fileInput;
            lastUploadButton = button;

            button.classList.add("file-selected");
            button.innerHTML = `
            Wyślij cennik: ${fileName}
            <div class="icon-embed-xsmall w-embed">
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" class="iconify iconify--ph" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256">
                  <path fill="currentColor" d="M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0ZM88 88h32v64a8 8 0 0 0 16 0V88h32a8 8 0 0 0 5.66-13.66l-40-40a8 8 0 0 0-11.32 0l-40 40A8 8 0 0 0 88 88Z"></path>
              </svg>
            </div>
          `;

            if (deleteFileButton) {
              deleteFileButton.style.display = "block";
            }
          }
        });
      });

      // -------- USUWANIE PLIKU --------
      if (deleteFileButton) {
        deleteFileButton.addEventListener("click", function (e) {
          e.preventDefault();

          if (lastFileInput) {
            lastFileInput.value = "";
          }
          if (lastUploadButton) {
            lastUploadButton.classList.remove("file-selected", "btn-sent");
            lastUploadButton.disabled = false;
            lastUploadButton.innerHTML =
              lastUploadButton.dataset.defaultHtml ||
              `
            <div>Dodaj plik cennika</div>
            <div class="icon-embed-xsmall w-embed">
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" class="iconify iconify--ph" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256">
                  <path fill="currentColor" d="M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0ZM88 88h32v64a8 8 0 0 0 16 0V88h32a8 8 0 0 0 5.66-13.66l-40-40a8 8 0 0 0-11.32 0l-40 40A8 8 0 0 0 88 88Z"></path>
              </svg>
            </div>
          `;
          }
          deleteFileButton.style.display = "none";
        });
      }

      // -------- SUBMIT FORMULARZA --------
      form3.on("submit", function (event) {
        event.preventDefault();

        var wholesalerKey = $("#WholesalerSelector").val();
        if (!wholesalerKey) {
          displayMessage(
            "Error",
            "Nie wybrano dostawcy. Proszę wybrać dostawcę z listy."
          );
          return false;
        }

        let uploadedFile = null;

        if (lastFileInput && lastFileInput.files.length > 0) {
          uploadedFile = lastFileInput.files[0];
        }

        if (!uploadedFile) {
          displayMessage(
            "Error",
            "Nie wybrano pliku z cennikiem. Proszę wybrać plik w formacie .csv, .ods lub .xlsx."
          );
          return false;
        }

        // MIME type
        let fileType = "text/plain";
        const fileExtension = uploadedFile.name.split(".").pop().toLowerCase();

        switch (fileExtension) {
          case "csv":
            fileType = "text/csv";
            break;
          case "xlsx":
            fileType =
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            break;
          case "ods":
            fileType = "application/vnd.oasis.opendocument.spreadsheet";
            break;
          case "txt":
          case "edi":
            fileType = "text/plain";
            break;
        }

        const jsonData = {
          wholesalerKey: wholesalerKey,
          shopKeys: $("#shopKeys").val(),
          startDate: $("#startDate").val() + "T00:00:00.000Z",
          endDate: $("#endDate").val() + "T23:59:59.999Z",
          type: "PRICAT",
        };

        const formData = new FormData();
        formData.append(
          "json",
          new Blob([JSON.stringify(jsonData)], { type: "application/json" })
        );
        formData.append(
          "file",
          new Blob([uploadedFile], { type: fileType }),
          uploadedFile.name
        );

        var uploadEndpoint = InvokeURL + "van/transactions";
        $("#waitingdots").show();

        function getFriendlyErrorMessage(error) {
          if (error.response) {
            switch (error.response.status) {
              case 400:
                if (
                  error.response.data.message &&
                  error.response.data.message.includes("StartDate and EndDate")
                ) {
                  return "Błąd: Nie można używać StartDate i EndDate w obu częściach formularza. Usuń jedną z dat i spróbuj ponownie.";
                }
                return "Błąd: Niepoprawne dane. Sprawdź, czy wszystkie pola są wypełnione prawidłowo.";
              case 403:
                return "Brak uprawnień: Nie masz dostępu do wykonania tej operacji.";
              case 404:
                return "Nie znaleziono: Nie udało się odnaleźć zasobu. Sprawdź swoje dane.";
              case 500:
                return "Błąd serwera: Wystąpił problem z serwerem. Spróbuj ponownie później.";
              default:
                return (
                  (error.response.data && error.response.data.message) ||
                  "Wystąpił nieznany błąd. Spróbuj ponownie później."
                );
            }
          } else if (error.request) {
            return "Błąd sieci: Serwer nie odpowiada. Sprawdź swoje połączenie internetowe i spróbuj ponownie.";
          } else {
            return "Wystąpił nieoczekiwany błąd: " + error.message;
          }
        }

        function resetUploadState() {
          if (form3[0]) form3[0].reset();

          if (lastFileInput) lastFileInput.value = "";

          if (lastUploadButton) {
            lastUploadButton.classList.remove("file-selected", "btn-sent");
            lastUploadButton.disabled = false;
            lastUploadButton.innerHTML =
              lastUploadButton.dataset.defaultHtml ||
              `
            <div>Dodaj plik cennika</div>
            <div class="icon-embed-xsmall w-embed">
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" class="iconify iconify--ph" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256">
                  <path fill="currentColor" d="M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0ZM88 88h32v64a8 8 0 0 0 16 0V88h32a8 8 0 0 0 5.66-13.66l-40-40a8 8 0 0 0-11.32 0l-40 40A8 8 0 0 0 88 88Z"></path>
              </svg>
            </div>
          `;
          }

          if (deleteFileButton) {
            deleteFileButton.style.display = "none";
          }
        }

        function markButtonAsSent() {
          if (!lastUploadButton) return;

          lastUploadButton.disabled = true;
          lastUploadButton.classList.add("btn-sent"); // możesz wystylować w CSS
          lastUploadButton.innerHTML = `
          Cennik wysłany
          <div class="icon-embed-xsmall w-embed">
            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" class="iconify iconify--ph" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256">
              <path fill="currentColor" d="M104 184a8 8 0 0 1-5.66-2.34l-40-40a8 8 0 0 1 11.32-11.32L104 164.69l82.34-82.35a8 8 0 0 1 11.32 11.32l-88 88A8 8 0 0 1 104 184Z"></path>
            </svg>
          </div>
        `;
          if (deleteFileButton) {
            deleteFileButton.style.display = "none";
          }
        }

        function sendRequest(fd) {
          axios
            .post(uploadEndpoint, fd, {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: orgToken,
                "Requested-By": "webflow-3-4",
              },
            })
            .then(function (response) {
              $("#waitingdots").hide();

              // 201 – przyjęte do przetwarzania
              if (response.status === 201) {
                if (response.data?.errorType || response.data?.errorMessage) {
                  const message =
                    response.data.errorMessage ||
                    "Błąd podczas przetwarzania pliku.";
                  displayMessage("Error", `Błąd serwera: ${message}`);

                  if (deleteFileButton) {
                    deleteFileButton.style.display = "block";
                  }
                  return;
                }

                // zmiana przycisku na „wysłany”
                markButtonAsSent();

                displayMessage(
                  "Success",
                  "Cennik został przyjęty do przetwarzania. Zwykle oferta aktualizuje się w ciągu kilku chwil. Możesz dodać kolejny cennik."
                );

                // po 5 sekundach wszystko wraca do stanu początkowego
                setTimeout(function () {
                  resetUploadState();
                }, 5000);

                return;
              }

              // 200 – scenariusz z callbackiem i uuid
              if (typeof successCallback === "function") {
                var result = successCallback(response.data);
                if (!result) {
                  form3.show();
                  displayMessage(
                    "Error",
                    "Oops. Coś poszło nie tak, spróbuj ponownie."
                  );
                  if (deleteFileButton) {
                    deleteFileButton.style.display = "block";
                  }
                  return;
                }
              }

              displayMessage("Success", "Cennik został dodany.");
              const uuid = response?.data?.items?.[0]?.uuid;

              if (uuid) {
                const pricelistUrl = `https://${DomainName}/app/van/pricats/pricat?uuid=${uuid}`;
                setTimeout(function () {
                  window.location.href = pricelistUrl;
                }, 1500);
              } else {
                displayMessage(
                  "Info",
                  "Cennik dodany, ale nie udało się pobrać linku."
                );
              }
            })
            .catch(function (error) {
              $("#waitingdots").hide();

              if (
                error.response &&
                error.response.status === 400 &&
                error.response.data.message &&
                error.response.data.message.includes("StartDate and EndDate")
              ) {
                delete jsonData.startDate;
                delete jsonData.endDate;

                const retryFormData = new FormData();
                retryFormData.append(
                  "json",
                  new Blob([JSON.stringify(jsonData)], {
                    type: "application/json",
                  })
                );
                retryFormData.append(
                  "file",
                  new Blob([uploadedFile], { type: fileType }),
                  uploadedFile.name
                );

                sendRequest(retryFormData);
              } else {
                const friendlyMessage = getFriendlyErrorMessage(error);
                displayMessage("Error", friendlyMessage);

                if (deleteFileButton) {
                  deleteFileButton.style.display = "block";
                }

                if (typeof errorCallback === "function") {
                  errorCallback(error);
                }
              }
            });
        }

        sendRequest(formData);
        return false;
      });
    });
  };

  makeWebflowFormAjax($("#wf-form-NewPricingList"));
  getShops();
  getWholesalersSh();
  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));
});
