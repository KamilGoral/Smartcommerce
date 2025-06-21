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

        // Dodajemy miejsce w input na ikonę
        input.style.paddingRight = "40px";

        // Ustawiamy rodzica na relative, jeśli nie ma
        const parent = input.parentNode;
        if (getComputedStyle(parent).position === "static") {
          parent.style.position = "relative";
        }
        parent.appendChild(eyeIcon);

        // Centrowanie po wyrenderowaniu
        requestAnimationFrame(() => {
          const inputHeight = input.offsetHeight;
          const iconHeight = 20;
          const topPosition = (inputHeight - iconHeight) / 2;
          eyeIcon.style.top = `50%`;
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
  var OrganizationName = getCookie("OrganizationName");
  var shopKey = new URL(location.href).searchParams.get("shopKey");
  var priceListId = new URL(location.href).searchParams.get("uuid");
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var formIdEditPriceList = "#wf-form-UpdatePriceList";
  var formIdDeletePriceList = "#wf-form-DeletePriceList";
  var OrganizationClientId = getCookie("sprytnyOrganizationclientId");
  var formIdEditPriceList = "#wf-form-UpdatePriceList";
  var formIdDeletePriceList = "#wf-form-DeletePriceList";

  const OrganizationBread0 = document.getElementById("OrganizationBread0");
  const priceListIdBread = document.getElementById("priceListIdBread");
  priceListIdBread.setAttribute("href", window.location.href);
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

  function getShops() {
    return new Promise((resolve, reject) => {
      let url = new URL(InvokeURL + "shops?perPage=1000");
      let request = new XMLHttpRequest();

      // Show the waiting dots before the request starts
      $("#waitingdots").show();

      request.open("GET", url, true);
      request.setRequestHeader("Authorization", orgToken);
      request.setRequestHeader("Requested-By", "webflow-3-4");

      request.onload = function () {
        // Hide the waiting dots once the request is complete
        $("#waitingdots").hide();

        if (request.status >= 200 && request.status < 400) {
          try {
            var data = JSON.parse(this.response);
            var toParse = data.items;

            const shopKeysContainer = document.getElementById("shopKeys");
            // Clear existing options
            shopKeysContainer.innerHTML = "";

            // Populate dropdown with shop keys and names
            toParse.forEach((shop) => {
              var opt = document.createElement("option");
              opt.value = shop.shopKey;
              opt.innerHTML = shop.name;
              shopKeysContainer.appendChild(opt);
            });

            resolve(); // Resolve the promise on success
          } catch (error) {
            reject("Error parsing response data"); // Reject if parsing fails
          }
        } else if (request.status === 401) {
          console.error("Unauthorized");
          reject("Unauthorized access");
        } else {
          reject(`Request failed with status: ${request.status}`);
        }
      };

      request.onerror = function () {
        // Hide the waiting dots on error
        $("#waitingdots").hide();
        reject("Network error occurred"); // Reject the promise on network error
      };

      request.send();
    });
  }

  // Funkcja sprawdzająca edytowalność dat
  const isEditable = (startDate, endDate, isFtp) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { canEditStartDate: true, canEditEndDate: true };
    if (now >= start && now <= end)
      return { canEditStartDate: isFtp, canEditEndDate: true };
    return { canEditStartDate: false, canEditEndDate: false };
  };

  // Funkcja konwertująca datę na czytelny format
  const toHumanTime = (dateStr) => {
    const offset = new Date().getTimezoneOffset();
    return new Date(Date.parse(dateStr) - offset * 60 * 1000)
      .toISOString()
      .replace("T", " ")
      .slice(0, -4);
  };

  // Funkcja przygotowująca dane do wysyłki w AJAX
  const setupFormData = (editPermissions) => {
    const data = [];

    // Include startDate only if it can be edited
    if (editPermissions.canEditStartDate && !$("#startDate").prop("disabled")) {
      data.push({
        op: "replace",
        path: "/startDate",
        value: $("#startDate").val() + "T00:00:01.00Z",
      });
    }

    // Include endDate only if it can be edited
    if (editPermissions.canEditEndDate) {
      data.push({
        op: "replace",
        path: "/endDate",
        value: $("#endDate").val() + "T23:59:59.00Z",
      });
    }

    return data;
  };

  let initialShopKeys = []; // Store initial shop keys

  async function getPriceList() {
    try {
      await getShops(); // Fetch shops before proceeding

      $.ajax({
        url: `${InvokeURL}van/pricats/${priceListId}`,
        type: "GET",
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
          // Extract and store the initial shop keys
          initialShopKeys = data.shops.map((shop) => shop.key);

          const isFtp =
            data.created.by.includes("FTP") || data.modified.by.includes("FTP");
          document.getElementById("pricatFTP").textContent = isFtp;

          // Check if the price list is ongoing
          const isOngoing =
            new Date(data.startDate) <= new Date() &&
            new Date(data.endDate) >= new Date();

          // Disable start date editing if the price list is ongoing
          if (isOngoing) {
            $("#startDate").prop("disabled", true);
          }

          const editPermissions = isEditable(
            data.startDate,
            data.endDate,
            isFtp
          );

          document.getElementById("wholesalerKey").textContent =
            data.wholesalerKey;
          document.getElementById("createdBy").textContent = data.created.by;
          document.getElementById("createDate").textContent = toHumanTime(
            data.created.at
          );
          document.getElementById("lastModificationDate").textContent =
            toHumanTime(data.modified.at);
          document.getElementById("startDate").textContent = toHumanTime(
            data.startDate
          );
          $("#startDate").datepicker("setDate", new Date(data.startDate));
          document.getElementById("endDate").textContent = toHumanTime(
            data.endDate
          );
          $("#endDate").datepicker("setDate", new Date(data.endDate));

          const select = document.getElementById("shopKeys");
          const pricatStatus = document.getElementById("pricatStatus");

          // Extract shop keys and statuses from the nested structure
          const shopsData = data.shops.map((shop) => {
            let statusText = shop.status || "No Status";
            let statusClass = "";

            switch (statusText) {
              case "waiting":
                statusText = "Oczekujący";
                statusClass = "medium";
                break;
              case "in progress":
                statusText = "W trakcie";
                statusClass = "informative";
                break;
              case "success":
                statusText = "Gotowa";
                statusClass = "positive";
                break;
              case "error":
                statusText = "Błąd";
                statusClass = "negative";
                break;
              default:
                statusClass = ""; // No specific class for undefined statuses
            }

            return {
              key: shop.key,
              status: statusText,
              statusClass: statusClass,
            };
          });

          // Create a Set of shop keys for faster lookup
          const shopKeysSet = new Set(shopsData.map((shop) => shop.key));

          // Loop through existing options and select those that match keys in shopsData
          Array.from(select.options).forEach((option) => {
            option.selected = shopKeysSet.has(option.value);
          });

          // Display statuses in the pricatStatus element or use tooltip if needed
          if (shopsData.length > 5) {
            const tooltipContent = shopsData
              .map(
                (shop) =>
                  `<span class="${shop.statusClass}">${shop.key} - ${shop.status}</span>`
              )
              .join(", ");
            pricatStatus.textContent = ` ${shopsData.length} Sklepów`;
            pricatStatus.classList.add("tippy");

            // Set sanitized content for tooltip
            pricatStatus.setAttribute("data-tippy-content", tooltipContent);

            // Initialize Tippy with HTML rendering enabled
            tippy(pricatStatus, { allowHTML: true });
          } else {
            pricatStatus.innerHTML = shopsData
              .map(
                (shop) =>
                  `<span class="${shop.statusClass} tippy" data-tippy-content="${shop.status}">${shop.key}</span>`
              )
              .join(", ");

            // Initialize Tippy for each element with tooltips in the smaller list
            tippy(".tippy", {
              allowHTML: true,
            });
          }
        },
        error: function (jqXHR, exception) {
          let msg =
            jqXHR.status === 504
              ? "Przekroczono limit czasu żądania."
              : "Błąd: Wystąpił nieoczekiwany błąd.";
          displayMessage("Error", msg);
          $("#waitingdots").hide();
        },
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  function prepareShopKeysUpdate(updatedShopKeys, priceListId) {
    const operations = [];
    const currentShopKeysSet = new Set(updatedShopKeys);
    const initialShopKeysSet = new Set(initialShopKeys);

    // Find keys to add (present in updatedShopKeys but not in initialShopKeys)
    const keysToAdd = [...currentShopKeysSet].filter(
      (key) => !initialShopKeysSet.has(key)
    );

    // Find keys to remove (present in initialShopKeys but not in updatedShopKeys)
    const keysToRemove = [...initialShopKeysSet].filter(
      (key) => !currentShopKeysSet.has(key)
    );

    // Prepare operations for "add"
    keysToAdd.forEach((key) => {
      operations.push({
        op: "add",
        path: "/shopKeys/-", // Add to the end of the list
        value: key,
      });
    });

    // Prepare operations for "remove"
    keysToRemove.forEach((key) => {
      operations.push({
        op: "remove",
        path: `/shopKeys/${key}`, // Use the key directly
      });
    });

    console.log("Operations to update shop keys:", operations);
    return operations;
  }

  makeWebflowFormAjaxEditPriceList = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);

      form.on("submit", async function (event) {
        // Prevent default form submission behavior
        event.preventDefault();
        event.stopImmediatePropagation(); // Stop further event propagation

        // Extract and convert "pricatFTP" to a boolean
        const pricatFTPText = document
          .getElementById("pricatFTP")
          .textContent.trim();
        const isFtp = pricatFTPText.toLowerCase() === "true";

        // Check edit permissions
        const editPermissions = isEditable(
          $("#startDate").val(),
          $("#endDate").val(),
          isFtp
        );

        // Setup data for the primary PATCH request
        const data = setupFormData(editPermissions);

        try {
          // Perform the primary PATCH request to update the price list
          const primaryPatchResponse = await $.ajax({
            type: "PATCH",
            url: `${InvokeURL}van/pricats/${priceListId}`,
            contentType: "application/json",
            dataType: "json",
            headers: {
              Authorization: orgToken,
              "Requested-By": "webflow-3-4",
            },
            data: JSON.stringify(data),
          });

          // After successful primary PATCH, calculate shop key updates
          const updatedShopKeys = Array.from(
            document.getElementById("shopKeys").selectedOptions
          ).map((option) => option.value);

          const operations = prepareShopKeysUpdate(
            updatedShopKeys,
            priceListId
          );

          // Perform the PATCH request for shop key updates if there are changes
          if (operations.length > 0) {
            const shopKeyPatchResponse = await $.ajax({
              url: `${InvokeURL}van/transactions/${priceListId}`,
              type: "PATCH",
              headers: {
                Authorization: orgToken,
                "Requested-By": "webflow-3-4",
                "Content-Type": "application/json",
              },
              data: JSON.stringify(operations),
            });

            console.log(
              "Shop keys updated successfully:",
              shopKeyPatchResponse
            );
          } else {
            console.log("No shop key updates needed.");
          }

          // Handle success
          if (
            typeof successCallback === "function" &&
            !successCallback(primaryPatchResponse)
          ) {
            form.show();
            displayMessage(
              "Error",
              "Oops. Coś poszło nie tak, spróbuj ponownie."
            );
            return;
          }

          displayMessage("Success", "Cennik został zmieniony.");
          setTimeout(() => window.location.replace(window.location.href), 1000);
        } catch (error) {
          console.error("Error occurred during update:", error);

          // Handle error
          if (typeof errorCallback === "function") errorCallback(error);
          form.show();
          displayMessage(
            "Error",
            "Oops. Coś poszło nie tak, spróbuj ponownie."
          );
        }

        return false; // Ensure no further actions are triggered
      });
    });
  };

  function initializeProductTable(priceListId) {
    // Sprawdzenie, czy tabela już istnieje, i jej zniszczenie, aby odświeżyć dane
    if ($.fn.DataTable.isDataTable("#pricelistproducts")) {
      $("#pricelistproducts").DataTable().destroy();
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
    // Inicjalizacja DataTable z obsługą po stronie serwera
    $("#pricelistproducts").DataTable({
      serverSide: true,
      processing: true,
      pagingType: "full_numbers",
      order: [[1, "asc"]], // domyślne sortowanie po GTIN
      dom: '<"top"f>rt<"bottom"lip>',
      scrollY: "60vh",
      scrollCollapse: true,
      pageLength: 10,
      searchDelay: 3000, // Delay to prevent search on each keystroke
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

      ajax: {
        url: `${InvokeURL}van/pricats/${priceListId}/products`,
        type: "GET",
        headers: {
          Authorization: orgToken,
          "Requested-By": "webflow-3-4",
        },
        data: function (d) {
          // Trim whitespace from search input
          let searchBox = d.search.value.trim();
          let searchParams = {};

          // Check if searchBox is a numeric GTIN or a name
          if (/^\d+$/.test(searchBox)) {
            // If searchBox is numeric, treat it as a GTIN
            searchParams.gtin = searchBox;
          } else if (searchBox) {
            // If searchBox is non-numeric, treat it as a name search with 'like' filter
            searchParams.name = `like:${searchBox}`;
          }

          // Return DataTables parameters along with search-specific query parameters
          return {
            perPage: d.length, // Number of records per page
            page: Math.floor(d.start / d.length) + 1, // Calculate page number
            valid: "true", // Additional filters
            restricted: "false", // Additional filters
            sort: `${d.columns[d.order[0].column].data}:${d.order[0].dir}`, // Sort field and direction
            ...searchParams, // Spread search parameters directly into the object
          };
        },

        dataSrc: function (json) {
          json.recordsTotal = json.total;
          json.recordsFiltered = json.total;
          console.log("API Response:", json);
          return json.items || [];
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error(
            "Wystąpił błąd podczas pobierania danych: ",
            textStatus,
            errorThrown
          );
        },
      },
      columns: [
        { data: "gtin", title: "GTIN" },
        { data: "name", title: "Nazwa", defaultContent: "-" },
        {
          data: "countryDistributorName",
          title: "Dystrybutor",
          defaultContent: "-",
          orderable: false,
        },
        {
          // Access netPrice inside the asks array
          data: "asks",
          title: "Cena",
          defaultContent: "-",
          orderable: false,
          render: function (data) {
            return data && data[0] && data[0].netPrice ? data[0].netPrice : "-";
          },
        },
        {
          // Check promotion in the asks array
          data: "asks",
          title: "Promocja",
          defaultContent: "-",
          orderable: false,
          render: function (data) {
            if (data && data[0] && data[0].promotion) {
              return `${data[0].promotion.type} (threshold: ${data[0].promotion.threshold})`;
            }
            return "-";
          },
        },
        {
          data: "asks",
          title: "Wiadomość",
          defaultContent: "-",
          orderable: false,
          render: function (data) {
            // Sprawdź, czy są jakieś wiadomości w pierwszym elemencie tablicy asks
            if (
              data &&
              data.length > 0 &&
              data[0].messages &&
              data[0].messages.length > 0
            ) {
              // Połącz wszystkie wiadomości w jedną listę z odpowiednimi znacznikami HTML
              return data[0].messages
                .map((message) => `<div>${message}</div>`)
                .join("");
            }
            return ""; // Zwróć pusty ciąg, jeśli nie ma wiadomości
          },
        },
      ],
    });
    // Attach keypress event listener for the search input
    $("#pricelistproducts_filter input")
      .off("input")
      .on("keypress", function (e) {
        if (e.which === 13) {
          // Enter key is pressed
          table.search(this.value).draw(); // Trigger search manually
        }
      });
  }

  // Function to download the product list as a CSV file with enhanced logic
  function downloadProductCsv(priceListId) {
    const csvUrl = `${InvokeURL}van/pricats/${priceListId}/products`;
    const anchor = document.createElement("a");
    document.body.appendChild(anchor);
    const headers = new Headers({
      Authorization: orgToken,
      "Requested-By": "webflow-3-4",
      Accept: "text/csv",
    });
    $("#waitingdots").show();
    let headersResponse = [];

    fetch(csvUrl, { headers })
      .then((res) => {
        res.headers.forEach((value, key) =>
          headersResponse.push(`${key}: ${value}`)
        );
        return res.blob();
      })
      .then((blob) => {
        $("#waitingdots").hide();
        const objectUrl = URL.createObjectURL(blob);

        // Extract filename from headers
        const filenameHeader = headersResponse.find((header) =>
          header.toLowerCase().includes("content-disposition")
        );
        let fileName = "product_list.csv"; // default filename
        if (filenameHeader && filenameHeader.includes("filename=")) {
          fileName = filenameHeader.split("filename=")[1].replace(/"/g, "");
        }

        // Set download attributes and initiate download
        anchor.href = objectUrl;
        anchor.download = fileName;
        anchor.click();
        URL.revokeObjectURL(objectUrl);
      })
      .catch((error) => {
        $("#waitingdots").hide();
        console.error("Error fetching the CSV file:", error);
      })
      .finally(() => {
        document.body.removeChild(anchor);
      });
  }

  // Bind the CSV download function to the button click
  $("#downloadCsvBtn").on("click", function () {
    console.log("Downloadgin file");
    downloadProductCsv(priceListId);
  });

  // Toggle selection on mousedown
  $("#shopKeys").on("mousedown", "option", function (e) {
    e.preventDefault();
    $(this).prop("selected", !$(this).prop("selected"));
    return false;
  });

  // Wywołanie funkcji po załadowaniu dokumentu
  $(document).ready(function () {
    initializeProductTable(priceListId);
  });

  makeWebflowFormAjaxDeletePriceList = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var action = `${InvokeURL}/van/transactions/${priceListId}`;
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
            console.log(resultData);

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
            displayMessage("Success", "Cennik został usunięty.");
            window.setTimeout(function () {
              window.location.replace(
                "https://" +
                  DomainName +
                  "/app/tenants/organization?name=" +
                  OrganizationName +
                  "&clientId=" +
                  ClientID
              );
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
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

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

  makeWebflowFormAjaxDeletePriceList($(formIdDeletePriceList));
  makeWebflowFormAjaxEditPriceList($(formIdEditPriceList));
  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));

  getPriceList();
  $(document).ready(function ($) {
    $("tableSelector").DataTable({
      dom: '<"pull-left"f><"pull-right"l>tip',
    });
    $(".dataTables_filter input").attr("maxLength", 60);
    setTimeout(function () {
      // Your code to adjust DataTable columns
      $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
      console.log("Adjusting");
    }, 2000);
    setTimeout(function () {
      // Your code to adjust DataTable columns
      $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
      console.log("Adjusting");
    }, 4000);
    setTimeout(function () {
      // Your code to adjust DataTable columns
      initializeSimpleTooltips();
      console.log("Tippy activate");
    }, 6000);
  });
});
