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

  const ExclusiveWizardBread = document.getElementById("ExclusiveResults");
  ExclusiveWizardBread.setAttribute("href", "" + window.location.href);

  var formIdCreateSingleExclusive = "#wf-form-SingleExclusiveForm";
  var formIdEditSingleExclusive = "#wf-form-SingleExclusiveForm-Edit-2";
  var nowDateFull = new Date();
  nowDateFull.setUTCHours(0, 0, 0, 0);
  var nowDate = nowDateFull.toISOString().split(".")[0] + "Z";

  $("#startDate").datepicker({
    dateFormat: "yy-mm-dd",
    altFormat: "yy-mm-dd",
    dayNames: [
      "Niedziela",
      "Poniedziałek",
      "Wtorek",
      "Środa",
      "Czwartek",
      "Piątek",
      "Sobota",
    ],
    dayNamesShort: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
    dayNamesMin: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
    firstDay: 1,
    monthNames: [
      "Styczeń",
      "Luty",
      "Marzec",
      "Kwiecień",
      "Maj",
      "Czerwiec",
      "Lipiec",
      "Sierpień",
      "Wrzesień",
      "Październik",
      "Listopad",
      "Grudzień",
    ],
    monthNamesShort: [
      "Sty",
      "Lut",
      "Mar",
      "Kwi",
      "Maj",
      "Cze",
      "Lip",
      "Sie",
      "Wrz",
      "Paź",
      "Lis",
      "Gru",
    ],
    defaultDate: 1,
  });

  $("#endDate").datepicker({
    dateFormat: "yy-mm-dd",
    altFormat: "yy-mm-dd",
    dayNames: [
      "Niedziela",
      "Poniedziałek",
      "Wtorek",
      "Środa",
      "Czwartek",
      "Piątek",
      "Sobota",
    ],
    dayNamesShort: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
    dayNamesMin: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
    firstDay: 1,
    monthNames: [
      "Styczeń",
      "Luty",
      "Marzec",
      "Kwiecień",
      "Maj",
      "Czerwiec",
      "Lipiec",
      "Sierpień",
      "Wrzesień",
      "Październik",
      "Listopad",
      "Grudzień",
    ],
    monthNamesShort: [
      "Sty",
      "Lut",
      "Mar",
      "Kwi",
      "Maj",
      "Cze",
      "Lip",
      "Sie",
      "Wrz",
      "Paź",
      "Lis",
      "Gru",
    ],
    defaultDate: 1,
  });

  $("#startDate-Exclusive-Edit")
    .datepicker({
      dateFormat: "yy-mm-dd",
      altFormat: "yy-mm-dd",
      dayNames: [
        "Niedziela",
        "Poniedziałek",
        "Wtorek",
        "Środa",
        "Czwartek",
        "Piątek",
        "Sobota",
      ],
      dayNamesShort: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
      dayNamesMin: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
      firstDay: 1,
      monthNames: [
        "Styczeń",
        "Luty",
        "Marzec",
        "Kwiecień",
        "Maj",
        "Czerwiec",
        "Lipiec",
        "Sierpień",
        "Wrzesień",
        "Październik",
        "Listopad",
        "Grudzień",
      ],
      monthNamesShort: [
        "Sty",
        "Lut",
        "Mar",
        "Kwi",
        "Maj",
        "Cze",
        "Lip",
        "Sie",
        "Wrz",
        "Paź",
        "Lis",
        "Gru",
      ],
      defaultDate: 1,
    })
    .datepicker("setDate", new Date(Date.now()));

  $("#endDate-Exclusive-Edit").datepicker({
    dateFormat: "yy-mm-dd",
    altFormat: "yy-mm-dd",
    dayNames: [
      "Niedziela",
      "Poniedziałek",
      "Wtorek",
      "Środa",
      "Czwartek",
      "Piątek",
      "Sobota",
    ],
    dayNamesShort: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
    dayNamesMin: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
    firstDay: 1,
    monthNames: [
      "Styczeń",
      "Luty",
      "Marzec",
      "Kwiecień",
      "Maj",
      "Czerwiec",
      "Lipiec",
      "Sierpień",
      "Wrzesień",
      "Październik",
      "Listopad",
      "Grudzień",
    ],
    monthNamesShort: [
      "Sty",
      "Lut",
      "Mar",
      "Kwi",
      "Maj",
      "Cze",
      "Lip",
      "Sie",
      "Wrz",
      "Paź",
      "Lis",
      "Gru",
    ],
    defaultDate: 1,
  });

  $("#startDate-Exclusive-2")
    .datepicker({
      dateFormat: "yy-mm-dd",
      altFormat: "yy-mm-dd",
      dayNames: [
        "Niedziela",
        "Poniedziałek",
        "Wtorek",
        "Środa",
        "Czwartek",
        "Piątek",
        "Sobota",
      ],
      dayNamesShort: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
      dayNamesMin: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
      firstDay: 1,
      monthNames: [
        "Styczeń",
        "Luty",
        "Marzec",
        "Kwiecień",
        "Maj",
        "Czerwiec",
        "Lipiec",
        "Sierpień",
        "Wrzesień",
        "Październik",
        "Listopad",
        "Grudzień",
      ],
      monthNamesShort: [
        "Sty",
        "Lut",
        "Mar",
        "Kwi",
        "Maj",
        "Cze",
        "Lip",
        "Sie",
        "Wrz",
        "Paź",
        "Lis",
        "Gru",
      ],
      defaultDate: 1,
    })
    .datepicker("setDate", new Date(Date.now()));

  $("#endDate-Exclusive-2")
    .datepicker({
      dateFormat: "yy-mm-dd",
      altFormat: "yy-mm-dd",
      dayNames: [
        "Niedziela",
        "Poniedziałek",
        "Wtorek",
        "Środa",
        "Czwartek",
        "Piątek",
        "Sobota",
      ],
      dayNamesShort: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
      dayNamesMin: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
      firstDay: 1,
      monthNames: [
        "Styczeń",
        "Luty",
        "Marzec",
        "Kwiecień",
        "Maj",
        "Czerwiec",
        "Lipiec",
        "Sierpień",
        "Wrzesień",
        "Październik",
        "Listopad",
        "Grudzień",
      ],
      monthNamesShort: [
        "Sty",
        "Lut",
        "Mar",
        "Kwi",
        "Maj",
        "Cze",
        "Lip",
        "Sie",
        "Wrz",
        "Paź",
        "Lis",
        "Gru",
      ],
      defaultDate: 1,
    })
    .datepicker("setDate", new Date(Date.now()));

  var table = $("#table_id").DataTable({
    pagingType: "full_numbers",
    order: [],
    dom: '<"top"fB>rt<"bottom"lip>',
    buttons: [
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
      {
        extend: "pdfHtml5",
        text: '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg" alt="pdf">',
        titleAttr: "PDF",
      },
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
        /// this need to be changed to gtin
        QStr = QStr + "&gtin=" + searchBox;
      } else if (searchBox) {
        QStr = QStr + "&name=like:" + searchBox;
      } else {
      }

      var whKeyIndi = $("#wholesalerPicker")
        .map(function () {
          return this.value;
        })
        .get();
      var whKeyIndiStr = whKeyIndi.toString();
      if (whKeyIndiStr != "") {
        QStr = QStr + "&wholesalerKey=" + whKeyIndiStr;
      }

      // This is usefull
      var nowTime = new Date(Date.now()).toISOString().split("T")[0];

      var startDatePicker = $("#startDate")
        .map(function () {
          return this.value;
        })
        .get();
      var startDatePickerStr = startDatePicker.toString();
      if (startDatePickerStr != "") {
        QStr = QStr + "&startDate=gte:" + startDatePickerStr + "T00:00:00Z";
      }

      var endDatePicker = $("#endDate")
        .map(function () {
          return this.value;
        })
        .get();
      var endDatePickerStr = endDatePicker.toString();
      if (endDatePickerStr != "") {
        QStr = QStr + "&endDate=lte:" + endDatePickerStr + "T00:00:00Z";
      }

      var whichColumns = "";
      var direction = "desc";

      if (data.order.length == 0) {
        whichColumns = 0;
      } else {
        whichColumns = data.order[0]["column"];
        direction = data.order[0]["dir"];
      }
      console.log(whichColumns);

      switch (whichColumns) {
        case 3:
          whichColumns = "gtin:";
          break;
        case 4:
          whichColumns = "name:";
          break;
        case 6:
          whichColumns = "wholesalerKey:";
          break;
        case 8:
          whichColumns = "startDate:";
          break;
        case 9:
          whichColumns = "endDate:";
          break;
        case 10:
          whichColumns = "modified.by:";
          break;
        case 11:
          whichColumns = "updated.at:";
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
      $.get(InvokeURL + "exclusive-products" + QStr, function (res) {
        callback({
          recordsTotal: res.total,
          recordsFiltered: res.total,
          data: res.items,
        });
      });
    },
    processing: false,
    serverSide: true,
    search: {
      return: true,
    },
    columns: [
      {
        visible: false,
        orderable: false,
        data: "uuid",
      },
      {
        visible: false,
        orderable: false,
        data: "created.at",
      },
      {
        visible: false,
        orderable: false,
        data: "created.by",
      },
      {
        orderable: true,
        data: "gtin",
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
        orderable: true,
        data: null,
        render: function (data) {
          if (
            data.wholesalerName !== null &&
            data.hasOwnProperty("wholesalerName") &&
            typeof data.wholesalerName !== "undefined"
          ) {
            return data.wholesalerName;
          } else {
            return "BLOKADA";
          }
        },
      },
      {
        visible: false,
        orderable: false,
        data: "wholesalerKey",
        render: function (data) {
          if (data !== null) {
            return data;
          }
          if (data === null) {
            return "BLOKADA";
          }
        },
      },
      {
        orderable: true,
        data: "startDate",
        render: function (data) {
          if (data !== null) {
            var startDate = new Date(data);
            return startDate.toLocaleDateString("pl-PL");
          }
          if (data === null) {
            return "";
          }
        },
      },
      {
        orderable: true,
        data: null,
        render: function (data) {
          if (
            data.endDate !== null &&
            typeof data.endDate !== "undefined" &&
            data.endDate !== "infinity"
          ) {
            myendDate = new Date(data.endDate).toLocaleDateString("pl-PL", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
            if (data.endDate >= nowDate) {
              return '<span class="positive">' + myendDate + "</span>";
            } else {
              return '<span class="noneexisting">' + myendDate + "</span>";
            }
          }

          if (data.endDate === "infinity") {
            return '<span class="positive">Nigdy</span>';
          }
        },
      },

      {
        orderable: true,
        data: "modified",
        render: function (data) {
          if (data !== null && data.hasOwnProperty("by") && data.by !== null) {
            return data.by;
          } else {
            return "-";
          }
        },
      },
      {
        orderable: true,
        data: "modified",
        render: function (data) {
          if (data !== null && data.hasOwnProperty("at") && data.at !== null) {
            var lastModificationDate = new Date(data.at);
            var formattedDate = lastModificationDate.toLocaleString("pl-PL", {
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
          if (data === null) {
            return "";
          }
        },
      },
      {
        orderable: false,
        data: null,
        width: "48px",
        render: function (data) {
          if (nowDate >= data.endDate && nowDate >= data.startDate) {
            return "<img style='opacity:0.4;cursor: not-allowed !important' src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/640442ed27be9b5e30c7dc31_edit.svg' action='disabled' alt='disabled'></img><img style='cursor: pointer' src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg' action='delete' alt='delete'></img>";
          } else {
            return "<img style='cursor: pointer' src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/640442ed27be9b5e30c7dc31_edit.svg' action='edit' alt='edit'></img><img style='cursor: pointer' src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg' action='delete' alt='delete'></img>";
          }
        },
      },
    ],
    initComplete: function (settings, json) {
      var api = this.api();
      var textBox = $("#table_id_filter label input");
      $("#wholesalerPicker").on("change", function () {
        table.draw();
      });

      $("#startDate")
        .datepicker({
          onSelect: function (dateText) {
            WholesalerSelector;
            console.log(
              "Selected date: " +
                dateText +
                "; input's current value: " +
                this.value
            );
            $(this).change();
          },
        })
        .on("change", function () {
          console.log("Got change event from field");
          table.draw();
        });

      $("#endDate")
        .datepicker({
          onSelect: function (dateText) {
            console.log(
              "Selected date: " +
                dateText +
                "; input's current value: " +
                this.value
            );
            $(this).change();
          },
        })
        .on("change", function () {
          console.log("Got change event from field");
          table.draw();
        });

      $("#table_id").on("click", "img", function () {
        //Get the cell of the input
        var table = $("#table_id").DataTable();
        var data = table.row($(this).parents("tr")).data();
        var action = $(this).attr("action");

        if (action === "delete") {
          $.ajax({
            type: "DELETE",
            url: InvokeURL + "exclusive-products/" + data.uuid,
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
              table.row($(this).parents("tr")).remove().draw();
              $("#deleteInline-Success").show();
              $("#deleteInline-Success").fadeOut(4000);
            },
            error: function (jqXHR, exception) {
              console.log(jqXHR);
              console.log(jqXHR);
              console.log(exception);
              $("#deleteInline-Fail").show();
              $("#deleteInline-Fail").fadeOut(4000);
              return;
            },
          });
        }
        if (action === "edit") {
          $("#EditExclusivePopup").css("display", "flex");

          var offset = new Date().getTimezoneOffset();
          var localeTime = new Date(
            Date.parse(data.created.at) - offset * 60 * 1000
          ).toISOString();
          var creationDate = localeTime.split("T");
          var creationTime = creationDate[1].split("Z");
          CreatedTime = creationDate[0] + " " + creationTime[0].slice(0, -4);

          $("#GTINInputEdit")
            .prop("disabled", true)
            .css("opacity", "0.6")
            .val(data.gtin);
          $("#Creator")
            .prop("disabled", true)
            .css("opacity", "0.6")
            .val(data.created.by);
          $("#Created")
            .prop("disabled", true)
            .css("opacity", "0.6")
            .val(CreatedTime);

          $("#exclusiveProductId").val(data.uuid);
          $("#WholesalerSelector-Exclusive-Edit")
            .val(data.wholesalerKey)
            .change();

          if (nowDate > data.endDate && nowDate >= startDate) {
            $("#WholesalerSelector-Exclusive-Edit")
              .prop("disabled", true)
              .css("opacity", "0.6")
              .val(CreatedTime);
          }

          if (nowDate > data.endDate || data.endDate == "infinity") {
            if (data.endDate != "infinity") {
              $("#endDate-Exclusive-Edit").datepicker(
                "setDate",
                new Date(Date.parse(data.endDate))
              );
              $("#endDate-Exclusive-Edit").prop("disabled", true);
              $("#endDate-Exclusive-Edit").css("opacity", "0.6");
            } else {
              console.log("infinity");
              //$("#NeverSingleEdit").prop("checked", true);
            }
          }

          if (nowDate <= data.endDate) {
            $("#endDate-Exclusive-Edit").datepicker(
              "setDate",
              new Date(Date.parse(data.endDate))
            );
          } else {
          }

          if (nowDate >= data.startDate) {
            $("#startDate-Exclusive-Edit").css("opacity", "0.6");
            $("#startDate-Exclusive-Edit").datepicker(
              "setDate",
              new Date(Date.parse(data.startDate))
            );
            $("#startDate-Exclusive-Edit").prop("disabled", true);
          } else {
            $("#startDate-Exclusive-Edit").datepicker(
              "setDate",
              new Date(Date.now())
            );
          }
        }
      });

      $(".dataTables_filter input").on("focusout", function () {
        table.draw();
      });
      textBox.unbind();
      textBox.bind("keyup input", function (e) {
        if (e.keyCode == 13) {
          api.search(this.value).draw();
        }
      });
      $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
    },
  });

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

      const wholesalerContainer = document.getElementById("wholesalerPicker");
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
        "WholesalerSelector-Exclusive-Edit"
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

      const wholesalerContainer3 = document.getElementById(
        "WholesalerSelector-Exclusive-2"
      );
      var opt = document.createElement("option");
      opt.value = null;
      opt.innerHTML = "BLOKADA";
      wholesalerContainer3.appendChild(opt);
      toParse.forEach((wholesaler) => {
        if (wholesaler.enabled) {
          var opt = document.createElement("option");
          opt.value = wholesaler.wholesalerKey;
          opt.innerHTML = wholesaler.name;
          wholesalerContainer3.appendChild(opt);
        }
      });
    } catch (e) {
      if (e.message === "HTTP 401") console.log("Unauthorized");
      else console.error("Failed to load wholesalers", e);
    }
  }

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
            form.show();
            displayMessage("Success", "Blokada została założona.");
            refreshTable();
            $("#GTINInput").val("");
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(jqXHR);
            console.log(exception);
            var msg =
              "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
            var elements =
              document.getElementsByClassName("warningmessagetext");
            for (var i = 0; i < elements.length; i++) {
              elements[i].textContent = msg;
            }
            form.show();
            displayMessage(
              "Error",
              "Oops. Coś poszło nie tak, spróbuj ponownie."
            );
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxSingleEdit = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action =
          InvokeURL + "exclusive-products/" + $("#exclusiveProductId").val();
        var method = "PATCH";

        if ($("#NeverSingleEdit").is(":checked")) {
          var postData = [
            {
              op: "replace",
              path: "/startDate",
              value: $("#startDate-Exclusive-Edit").val() + "T00:00:01.00Z",
            },
            {
              op: "replace",
              path: "/endDate",
              value: "infinity",
            },
            {
              op: "replace",
              path: "/wholesalerKey",
              value: $("#WholesalerSelector-Exclusive-Edit").val(),
            },
          ];
        } else {
          var postData = [
            {
              op: "replace",
              path: "/startDate",
              value: $("#startDate-Exclusive-Edit").val() + "T00:00:01.00Z",
            },
            {
              op: "replace",
              path: "/endDate",
              value: $("#endDate-Exclusive-Edit").val() + "T00:00:01.00Z",
            },
            {
              op: "replace",
              path: "/wholesalerKey",
              value: $("#WholesalerSelector-Exclusive-Edit").val(),
            },
          ];
        }

        console.log(postData);

        if ($("#WholesalerSelector-Exclusive-Edit").val() === "null") {
          delete postData[0].wholesalerKey;
          console.log("delete wholesalerKey");
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
          data: JSON.stringify(postData),
          success: function (resultData) {
            console.log(resultData);
            form.show();
            displayMessage("Success", "Blokada została zmieniona.");
            refreshTable();
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(jqXHR);
            console.log(exception);
            var msg =
              "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
            var elements =
              document.getElementsByClassName("warningmessagetext");
            for (var i = 0; i < elements.length; i++) {
              elements[i].textContent = msg;
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

  function refreshTable() {
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

    $.get(InvokeURL + "exclusive-products", function (res) {
      var tabela = $("#table_id").DataTable();
      tabela.clear().rows.add(res.items).draw();
    });
  }

  makeWebflowFormAjaxSingleEdit($(formIdEditSingleExclusive));
  makeWebflowFormAjaxSingle($(formIdCreateSingleExclusive));
  getWholesalersSh();

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
  });
});
