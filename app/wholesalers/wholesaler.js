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
  var previousFormats = []; // Wartość formatów, które są już zapisane w systemie
  var previousEmail = ""; // Wartość emaila, która jest już zapisana w systemie, do porównania

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
              msg =
                "Serwer napotkał problemy. Prosimy o kontakt kontakt@smartcommerce.net";
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

  var Webflow = Webflow || [];
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var orgToken = getCookie("sprytnyToken");
  var DomainName = getCookie("sprytnyDomainName");
  var userKey = getCookie("sprytnyUsername") || "me";
  const orgName = document.getElementById("orgName");
  var formIdEdit = "#wf-form-CredentialsFormEdit";
  var formIdNew = "#wf-form-ehurt";
  var formCustomerIdForm = "#wf-form-customerId";
  var formIdDelete = "#wf-form-DeleteWholesalerCredential";
  var formWhLogistic = "#wf-form-NewLogisticsMinimum-2";
  var formWhSMTP = "#wf-form-editSMTP-2";
  const Iehurt = document.getElementById("Iehurt");
  emailElement.textContent = getCookie("sprytnyUser");
  var LastStatusMessage = document.getElementById("LastStatusMessage");

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

  const ShopBread = document.getElementById("ShopBread0");
  const urlParams = new URL(document.location.href).searchParams;
  var shopKey = urlParams.get("shopKey") || urlParams.get("shopkey");

  if (shopKey) {
    ShopBread.textContent = shopKey;
    ShopBread.setAttribute(
      "href",
      "https://" + DomainName + "/app/shops/shop?shopKey=" + shopKey
    );
  }

  const WholesalerIdBread = document.getElementById("WholesalerBread0");
  var wholesalerKey = new URL(document.location.href).searchParams.get(
    "wholesalerKey"
  );
  WholesalerIdBread.textContent = wholesalerKey;
  WholesalerIdBread.setAttribute("href", window.location.href);

  // Funkcja do ustawiania tekstu w elemencie (jeśli istnieje)
  function setText(selector, text, prefix = "") {
    const el = document.querySelector(`[wholesalerdata="${selector}"]`);
    if (el)
      el.textContent =
        text !== null && text !== undefined
          ? `${prefix}${text}`
          : `${prefix} -`;
  }

  // Funkcja do ustawiania linku (jeśli istnieje)
  function setLink(selector, url, prefix = "") {
    const el = document.querySelector(`[wholesalerdata="${selector}"]`);
    if (el) {
      const displayUrl = url !== null && url !== undefined ? url : "-";
      el.innerHTML = `${prefix}&nbsp;<a href="${
        displayUrl === "-" ? "#" : displayUrl
      }" target="_blank">${displayUrl}</a>`;
    }
  }

  function LogoutNonUser() {
    if (
      getCookie("sprytnyInvokeURL") == null ||
      getCookie("sprytnycookie") == null ||
      getCookie("sprytnyToken") == null ||
      getCookie("sprytnyDomainName") == null
    ) {
      alert("Twoja sesja wygasła.");
      window.location.href = "https://sprytnykupiec.pl/login-page";
    }
  }

  function getWholesaler() {
    let url2 = new URL(
      InvokeURL +
        "shops/" +
        shopKey +
        "/wholesalers/" +
        wholesalerKey +
        "/e-commerce"
    );
    let request2 = new XMLHttpRequest();
    request2.open("GET", url2, true);
    request2.setRequestHeader("Authorization", orgToken);
    request2.onload = function () {
      var data2 = JSON.parse(this.response);
      if (request2.status >= 200 && request2.status < 400) {
        Iehurt.classList.add("enabled");
        Iehurt.classList.remove("hide");
        $("#ehurtBox").show();
        $("#ehurtBoxDelete").show();

        const statusmessagebox = document.getElementById("statusmessagebox");

        if (
          data2 &&
          data2.authorization.credentials &&
          data2.authorization.credentials.extraFields &&
          data2.authorization.credentials.extraFields.company
        ) {
          // Dane istnieją, ustawiamy tekst i pokazujemy pole
          setText(
            "extrafield",
            data2.authorization.credentials.extraFields.company,
            "Firma: "
          );
          document.getElementById("specialServiceBoxCompany").style.display =
            "flex"; // Zakładając, że extrafield to ID pola
          $("#CompanyNameEdit").val(
            data2.authorization.credentials.extraFields.company
          );
          // Brak danych, ukrywamy pole
          document.getElementById("specialServiceBoxProfile").style.display =
            "none";
        } else {
        }
        setText(
          "username",
          data2.authorization.credentials
            ? data2.authorization.credentials.username
            : "",
          "Login: "
        );
        $("#Username-Edit").val(data2.authorization.credentials.username);

        setText("password", "******", "Hasło: ");
        setText(
          "profile",
          data2.authorization.profile ? data2.authorization.profile.name : "",
          "Profil: "
        );

        if (data2.modules.offer.lastDownload !== null) {
          var firstData = data2.modules.offer.lastDownload;
          var firstCreateDate = "";
          var firstStatus = "";
          var firstMessage = "";

          var offset = new Date().getTimezoneOffset();
          var localeTime = new Date(
            Date.parse(firstData.createDate) - offset * 60 * 1000
          ).toISOString();
          var creationDate = localeTime.split("T");
          var creationTime = creationDate[1].split("Z");
          firstCreateDate =
            creationDate[0] + " " + creationTime[0].slice(0, -4);

          if (firstData.status === "Succeeded") {
            firstStatus = "Sukces";
            var LastStatusMessage =
              document.getElementById("LastStatusMessage");

            LastStatusMessage.textContent =
              "Status: " +
              firstStatus +
              ". Data pobrania ostatniej oferty: " +
              firstCreateDate;
          }
          if (firstData.status === "Failed") {
            statusmessagebox.classList.add("problem");
            firstStatus = "Problem";
            firstMessage = firstData.message;

            if (firstMessage === "Profile for wholesaler have to be set.") {
              firstMessage = "Proszę wybrać profil dla dostawcy z listy";
            }

            // Sprawdzamy, czy są dostępne eventy i czy nie są null lub puste
            if (
              firstData.events &&
              Array.isArray(firstData.events) &&
              firstData.events.length > 0
            ) {
              const lastEvent = firstData.events[firstData.events.length - 1]; // Ostatni event
              firstMessage += ` | Zdarzenie: ${lastEvent.type} - ${lastEvent.message}`;
            }

            var LastStatusMessage =
              document.getElementById("LastStatusMessage");
            LastStatusMessage.textContent =
              "Status: " +
              firstStatus +
              " Informacja: " +
              firstMessage +
              ". Data próby pobrania oferty: " +
              firstCreateDate;
          }
        } else {
          var LastStatusMessage = document.getElementById("LastStatusMessage");
          LastStatusMessage.textContent =
            "Dostawca poprawnie skonfigurowany. Wkrótce nastąpi pierwsze pobranie oferty";
          Iehurt.classList.add("enabled");
        }

        firstMessage;
        onlineOfferSupportFlow();
      } else if (request2.status >= 400) {
        const LastStatusMessage = document.getElementById("LastStatusMessage");

        const customMessages = {
          lobo: `Zanim rozpoczniesz integrację, skontaktuj się z hurtownią Lobo, aby uzyskać możliwość automatycznej wymiany danych.<br>Zazwyczaj hurtownia aktywuje integrację jeszcze tego samego dnia.`,
          eurocash:
            "Skontaktuj się z Twoim opiekunem lub wyślij e-mail na kontakt@sprytnykupiec.pl w celu rozpoczęcia integracji",
          "eurocash-serwis":
            "Skontaktuj się z Twoim opiekunem lub wyślij e-mail na kontakt@sprytnykupiec.pl w celu rozpoczęcia integracji",
          "sobik-nabial":
            "Integracja z e-hurtownią Sobik-Nabiał jest obecnie niedostępna. W celu dalszego korzystania z usług, prosimy o skorzystanie z wersji Sobik-Nabiał Sellitem.",
          "sobik-suchy":
            "Integracja z e-hurtownią Sobik-Suchy jest obecnie niedostępna. W celu dalszego korzystania z usług, prosimy o skorzystanie z wersji Sobik-Suchy Sellitem.",
        };

        if (customMessages[wholesalerKey]) {
          if (wholesalerKey === "lobo") {
            LastStatusMessage.innerHTML = customMessages[wholesalerKey];
          } else {
            LastStatusMessage.innerHTML = customMessages[wholesalerKey];
            $("#login-credentials-container").hide();
          }
        } else {
          LastStatusMessage.textContent = "Dostawca gotowy do integracji.";
          $("#ehurtStart").removeClass("hide");
          $("#ehurtBox").hide();
          $("#ehurtBoxDelete").hide();
        }

        $("#Wholesaler-profile-Selector-box").hide();
        $("#Wholesaler-profile-Selector").removeAttr("required");
        $("#Wholesaler-profile-Selector")
          .find("option")
          .remove()
          .end()
          .append("<option value=null>Wybierz profil</option>")
          .val("null");
      } else {
        console.log("bug");
      }
    };
    request2.send();

    var request = new XMLHttpRequest();
    let apiUrl = new URL(InvokeURL + "wholesalers/" + wholesalerKey);
    request.open("GET", apiUrl.toString(), true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      var data = JSON.parse(this.response);
      console.log(data);
      if (request.status >= 200 && request.status < 400) {
        if (data.onlineOfferSupport) {
          $("#status-container").show();
        }
        // conditional for EC and ECS
        if (
          data.wholesalerKey === "eurocash" ||
          data.wholesalerKey === "eurocash-serwis"
        ) {
          $("#ftpBox").show();
          console.log("EC or ECS");
        } else {
          $("#ftpBox").hide();
          console.log("Not EC or ECS");
        }

        if (data.platformUrl === null) {
          $("#ehurtBox").hide();
          $("#ehurtBoxDelete").hide();
        }

        // Ustawienia podstawowych danych
        setText("name", data.company);
        setText("taxId", data.taxId, "NIP: ");
        setLink("platformUrl", data.platformUrl, "Strona E-hurt:");
        setLink("website", data.website, "Strona www:");

        // Ustawienia badgy
        const smartVanBadge = document.querySelector("#IsmartVan");

        if (smartVanBadge) {
          if (data.vanMember) {
            smartVanBadge.classList.remove("hide");
            smartVanBadge.classList.add("enabled");
          }
        }

        const ftpElement = document.getElementById("Iftp");

        if (data.smartvan.ftp && data.smartvan.ftp.username) {
          ftpElement.classList.remove("hide");
          ftpElement.classList.add("enabled");
        } else {
          console.log("tutaj");
        }

        const retroactiveElement = document.getElementById("Iretroactive");
        if (
          data.connections.retroactive &&
          data.connections.retroactive.enabled
        ) {
          retroactiveElement.classList.remove("hide");
          retroactiveElement.classList.add("enabled");
        }

        // Obsługa numeru telefonu
        const wholesalerPhone = document.querySelector(
          '[wholesalerdata="phone"]'
        );
        if (wholesalerPhone) {
          if (data.phones && data.phones.length > 0) {
            const phoneData = data.phones[0];
            wholesalerPhone.innerHTML = `Numer telefonu: <a href="tel:${phoneData.phone}">${phoneData.phone}</a> (${phoneData.description})`;
          } else {
            wholesalerPhone.textContent = "Numer telefonu: -";
          }
        }

        // Obsługa logo
        const whLogo = document.querySelector('[wholesalerdata="logo"]');
        if (whLogo && data.image) {
          whLogo.src = `data:image/png;base64,${data.image}`;
          whLogo.style.objectFit = "contain";
        }
      } else {
        console.log("error");
      }
    };
    request.send();
  }

  function getWhSmartVan() {
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
        let data2 = {};
        try {
          data2 = JSON.parse(this.response);
        } catch (e) {
          console.error("Błąd parsowania JSON:", e);
          return;
        }

        // Obsługuje e-mail
        let smtpEmail = data2?.smtp?.email ?? "-";
        document.querySelector('[wholesalerdata="smtpEmail"]').innerHTML =
          "Adres e-mail: " + smtpEmail;
        document.getElementById("smtpEmail").value =
          smtpEmail !== "-" ? smtpEmail : "";
        previousEmail = smtpEmail !== "-" ? smtpEmail : null;

        // Obsługuje formaty
        let formats = data2?.smtp?.formats ?? [];
        let formatsElement = document.querySelector(
          '[wholesalerdata="smtpFormats"]'
        );
        let formatsSelect = document.getElementById("formats");

        if (formats.length === 0) {
          formatsElement.innerHTML = "Wybrane formaty: -";
        } else {
          formatsElement.innerHTML = "Wybrane formaty: " + formats.join(", ");
          formats.forEach(function (format) {
            let option = formatsSelect.querySelector(
              `option[value="${format}"]`
            );
            if (option) {
              option.selected = true;
            }
          });
          previousFormats = formats;
        }

        // Obsługuje ostatnią transakcję SMTP
        let lastTransactionDate = data2?.smtp?.lastTransaction?.createDate;
        let formattedDate = lastTransactionDate
          ? new Date(lastTransactionDate).toLocaleString("pl-PL")
          : "-";
        document.querySelector(
          '[wholesalerdata="smtpLastTransaction"]'
        ).innerHTML = "Data ostatniej operacji: " + formattedDate;

        // Obsługuje FTP
        let ftp = data2?.ftp ?? {};
        let ftpCustomerId = ftp.customerId ?? "-";
        let ftpUsername = ftp.username ?? "-";
        let ftpLastTransaction = ftp.lastTransaction ?? "-";

        document.querySelector('[wholesalerdata="customerId"]').innerHTML =
          "Identyfikator Klienta: " + ftpCustomerId;
        document.getElementById("customerId").value =
          ftpCustomerId !== "-" ? ftpCustomerId : "";
        document.querySelector('[wholesalerdata="ftpUsername"]').innerHTML =
          "Login: " + ftpUsername;
        document.querySelector(
          '[wholesalerdata="FtpLastTransaction"]'
        ).innerHTML = "Ostatnia zmiana: " + ftpLastTransaction;
      } else if (request2.status >= 400) {
        console.error("Błąd: ", request2.status, this.response);
      } else {
        console.log("Nieoczekiwany błąd");
      }
    };

    request2.send();
  }

  // Funkcja do dostosowania szerokości selecta do najszerszej opcji
  // function adjustSelectWidth() {
  //   const select = document.getElementById("Wholesaler-profile-Selector");
  //   const options = select.getElementsByTagName("option");
  //   let maxWidth = 411;

  //   // Znajdź najszerszą opcję
  //   for (let i = 0; i < options.length; i++) {
  //     const option = options[i];
  //     const optionWidth = option.scrollWidth;
  //     if (optionWidth > maxWidth) {
  //       maxWidth = optionWidth;
  //       select.style.width = maxWidth + "px";
  //     }
  //   }
  // }

  function getProfile() {
    let url = new URL(
      InvokeURL +
        "shops/" +
        shopKey +
        "/wholesalers/" +
        wholesalerKey +
        "/e-commerce/profiles"
    );
    console.log("GetProfile");

    return new Promise((resolve, reject) => {
      // Zwracamy Promise
      let request = new XMLHttpRequest();
      request.addEventListener("load", reqListener);

      request.open("GET", url, true);
      $("#waitingdots").show();

      function reqListener() {
        if (request.readyState === 4 && request.status === 200) {
          $("#waitingdots").hide();
        }
      }

      request.setRequestHeader("Authorization", orgToken);
      request.setRequestHeader("Requested-By", "webflow-3-4");

      request.onload = function () {
        try {
          var data = JSON.parse(this.response);
          var toParse = data.items;

          if (request.status >= 200 && request.status < 400 && data.total > 0) {
            $("#Wholesaler-profile-Selector-box").show();
            $("#specialServiceBoxProfile").hide();
            $("#Wholesaler-profile-Selector").attr("required", "");
            const Iehurt = document.getElementById("Iehurt");
            Iehurt.classList.add("enabled");
            const WholesalerProfileSelectorNew = document.getElementById(
              "WholesalerProfileSelector"
            );
            const wholesalerProfileContainer = document.getElementById(
              "Wholesaler-profile-Selector"
            );

            toParse.forEach((profile) => {
              var optProfile = document.createElement("option");
              optProfile.value = profile.id;
              optProfile.name = profile.id;
              optProfile.innerHTML = profile.name;
              WholesalerProfileSelectorNew.appendChild(optProfile);
            });

            toParse.forEach((profile) => {
              var optProfile = document.createElement("option");
              optProfile.value = profile.id;
              optProfile.name = profile.id;
              optProfile.innerHTML = profile.name;
              wholesalerProfileContainer.appendChild(optProfile);
            });
            resolve(data); // Rozwiązujemy Promise z danymi
          } else if (request.status == 401) {
            console.log("Unauthorized");
            reject("Unauthorized"); // Odrzucamy Promise
          } else {
            $("#Wholesaler-profile-Selector-box").hide();
            $("#Wholesaler-profile-Selector").removeAttr("required");
            resolve(data); // Rozwiązujemy Promise z danymi
          }
        } catch (error) {
          reject(error); // Odrzucamy Promise w przypadku błędu JSON
        }
      };

      request.onerror = function () {
        reject("Network Error"); // Odrzucamy Promise w przypadku błędu sieci
      };

      request.send();

      $("#waitingdots").show();
      $("#Wholesaler-profile-Selector")
        .find("option")
        .remove()
        .end()
        .append("<option value=null>Wybierz profil</option>")
        .val("null");
    });
  }

  function getWholesalerHistory() {
    let url = new URL(
      InvokeURL +
        "shops/" +
        shopKey +
        "/wholesalers/" +
        wholesalerKey +
        "/e-commerce/status-history?sort=createDate:asc&perPage=30"
    );
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      console.log(toParse);
      const statusContainer = document.getElementById("StatusContainer");
      function getStatusLabel(status) {
        switch (status) {
          case "Failed":
            return "Problem";
          case "Incomplete":
            return "Niekompletna";
          case "In progress":
            return "W trakcie";
          case "Succeeded":
            return "Sukces";
          default:
            return "";
        }
      }

      if (request.status >= 200 && request.status < 400 && data.total > 0) {
        toParse.forEach((item) => {
          if (item.status !== null) {
            const style = document.getElementById("sampleStatus");
            const row = style.cloneNode(true);
            row.style.display = "block";

            const offset = new Date().getTimezoneOffset();
            const localeTime = new Date(
              Date.parse(item.createDate) - offset * 60 * 1000
            ).toISOString();
            const firstCreateDate = localeTime.split("T")[0];

            row.classList.add("tippy");
            row.setAttribute(
              "data-tippy-content",
              `${firstCreateDate} ${getStatusLabel(item.status)}`
            );

            if (item.status === "Failed") row.classList.add("fail");
            if (item.status === "Incomplete" || item.status === "In progress") {
              row.classList.add("warning");
            }

            // Dodatkowa logika dla "In progress"
            if (item.status === "In progress") {
              const LastStatusMessage =
                document.getElementById("LastStatusMessage");
              if (LastStatusMessage) {
                LastStatusMessage.textContent =
                  "Twoja oferta właśnie jest tworzona! Możesz integrować kolejnych dostawców.";
              }
            }

            statusContainer.appendChild(row);
          }
        });
      } else {
        console.log("here");
      }
      //loadTippyContent need to be there//
      initializeSimpleTooltips();
    };
    request.send();
  }

  function getWholesalerButtons(wholesalerKey) {
    let url = new URL(
      InvokeURL +
        "shops/" +
        shopKey +
        "/wholesalers?sort=wholesalerKey:desc&perPage=1000&page=1"
    );

    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);

        var foundWholesaler = data.items.find(function (item) {
          return item.wholesalerKey === wholesalerKey;
        });

        var logisticMinimum = foundWholesaler.logisticMinimum;

        var additionalFields =
          foundWholesaler.connections.ecommerce?.requiresExtraField || null;

        if (additionalFields) {
          $("#CompanyDivEdit").show();
          $("#CompanyDivStart").show();
        } else {
          $("#CompanyDivEdit").hide();
          $("#CompanyDivStart").hide();
          $("#specialServiceBoxCompany").hide();
        }

        if (logisticMinimum !== null) {
          $("#logisticMinimumEdit").val(logisticMinimum).change();
          setText("logisticMinimum", `${logisticMinimum} zł`, "Wartość: ");
        } else {
          $('div[wholesalerdata="logisticMinimum"]').html("Wartość: -");
        }

        if (
          foundWholesaler &&
          foundWholesaler.connections &&
          foundWholesaler.connections.ecommerce
        ) {
          var onlineOfferData = foundWholesaler.connections.ecommerce;
          if (onlineOfferData.enabled && onlineOfferData.active) {
            console.log("Online Offer: Tak");
            $("#delete-wholesalers-container").removeClass("hide");
          } else if (!onlineOfferData.enabled && !onlineOfferData.active) {
            console.log("Online Offer: Dodaj");
          } else if (onlineOfferData.enabled && !onlineOfferData.active) {
            console.log("Online Offer: Przywróć");
            $("#delete-wholesalers-container").removeClass("hide");
          } else if (!onlineOfferData.enabled && onlineOfferData.active) {
            console.log("Online Offer: Dodaj");
          }
        } else {
          console.log("Online Offer: Brak");
        }
      } else {
        console.error("Błąd zapytania do API. Status: " + request.status);
      }
    };

    request.onerror = function () {
      console.error("Wystąpił błąd połączenia.");
    };
    request.send();
  }

  makeWebflowFormAjaxWhNew = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        event.preventDefault();

        var action =
          InvokeURL +
          "shops/" +
          shopKey +
          "/wholesalers/" +
          wholesalerKey +
          "/e-commerce";
        var method = "PATCH";

        let profileId = $("#WholesalerProfileSelector").val();
        let profileName = $(
          "#WholesalerProfileSelector option:selected"
        ).text();

        var data = [];

        // Jeżeli formularz zawiera już wybrany profil
        if (profileId && profileId !== "null") {
          data = [
            {
              op: "add",
              path: "/authorization/credentials/username",
              value: $("#Username").val().trim(),
            },
            {
              op: "add",
              path: "/authorization/credentials/password",
              value: $("#Password").val(),
            },
            {
              op: "add",
              path: "/authorization/profile",
              value: {
                id: profileId,
                name: profileName,
              },
            },
          ];
        } else {
          // Pierwsze podejście bez profilu, dodaj firmę jeśli istnieje
          data = [
            {
              op: "add",
              path: "/authorization/credentials/username",
              value: $("#Username").val().trim(),
            },
            {
              op: "add",
              path: "/authorization/credentials/password",
              value: $("#Password").val(),
            },
          ];

          if ($("#CompanyNameEdit").val()) {
            data.push({
              op: "add",
              path: "/authorization/credentials/extraFields",
              value: {
                company: $("#CompanyNameEdit").val(),
              },
            });
          }
        }

        $.ajax({
          type: method,
          url: action,
          cors: true,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            window.setTimeout(function () {
              $("#waitingdots").hide();
            }, 2000);
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
            console.log("Wynik successCallback: ", resultData);

            if (!resultData) {
              form.show();
              displayMessage(
                "Error",
                "Oops. Coś poszło nie tak, spróbuj ponownie."
              );
              return;
            }

            if (resultData.authorization.profile === null) {
              console.log("Brak profilu, pobieram profile...");
              getProfile()
                .then(function (profileData) {
                  console.log(profileData);
                  if (profileData.total === 0) {
                    displayMessage(
                      "Success",
                      "Pomyślnie zintegrowano dostawcę."
                    );
                    $("#startEhurtModal").hide();
                    window.setTimeout(function () {
                      location.reload();
                    }, 2000);
                  } else {
                    // pokaż selektor profilu
                    $("#profilBox").css("display", "flex");
                    $("#Wholesaler-profile-Selector")
                      .find("option")
                      .remove()
                      .end()
                      .append("<option value=null>Wybierz profil</option>")
                      .val("null");

                    profileData.items.forEach((profile) => {
                      $("#Wholesaler-profile-Selector").append(
                        $("<option></option>")
                          .attr("value", profile.id)
                          .text(profile.name)
                      );
                    });

                    $("#Username, #Password, #CompanyNameEdit")
                      .closest(".field-wrapper")
                      .hide();

                    displayMessage(
                      "Success",
                      "Proszę wybrać profil sklepu dla tego dostawcy i kliknąć ponownie Integruj."
                    );
                  }
                })
                .catch(function (error) {
                  console.error("Błąd podczas pobierania profilu:", error);
                  displayMessage(
                    "Error",
                    "Wystąpił błąd podczas pobierania profili."
                  );
                });
            } else {
              console.log("Sukces");
              displayMessage("Success", "Pomyślnie zintegrowano dostawcę.");
              window.setTimeout(function () {
                location.reload();
              }, 2000);
            }
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
                  jqXHR.responseJSON.message ==
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
                    : jqXHR.responseJSON?.message || "Nieznany błąd";
                break;
            }
            displayMessage("Error", msg);
          },
        });

        return false;
      });
    });
  };

  makeWebflowFormAjaxWh = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action =
          InvokeURL +
          "shops/" +
          shopKey +
          "/wholesalers/" +
          wholesalerKey +
          "/e-commerce";
        var method = "PATCH";

        if ($("#CompanyNameEdit").val()) {
          //mirex, smakosz, gniezno case
          var data = [
            {
              op: "add",
              path: "/authorization/credentials/username",
              value: $("#Username-Edit").val().trim(),
            },
            {
              op: "add",
              path: "/authorization/credentials/password",
              value: $("#Password-Edit").val(),
            },
            {
              op: "add",
              path: "/authorization/credentials/extraFields",
              value: {
                company: $("#CompanyNameEdit").val(),
              },
            },
          ];
        } else {
          //edit case
          if ($("#Wholesaler-profile-Selector").val() != "null") {
            var data = [
              {
                op: "add",
                path: "/authorization/credentials/username",
                value: $("#Username-Edit").val().trim(),
              },
              {
                op: "add",
                path: "/authorization/credentials/password",
                value: $("#Password-Edit").val(),
              },
              {
                op: "add",
                path: "/authorization/profile",
                value: {
                  id: $("#Wholesaler-profile-Selector").val(),
                  name: $(
                    "#Wholesaler-profile-Selector option:selected"
                  ).text(),
                },
              },
            ];
          } else {
            // add case
            var data = [
              {
                op: "add",
                path: "/authorization/credentials/username",
                value: $("#Username-Edit").val().trim(),
              },
              {
                op: "add",
                path: "/authorization/credentials/password",
                value: $("#Password-Edit").val(),
              },
            ];
          }
        }
        $.ajax({
          type: method,
          url: action,
          cors: true,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            window.setTimeout(function () {
              $("#waitingdots").hide();
            }, 2000);
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
                window.setTimeout(function () {
                  console.log("reload1");
                  location.reload();
                }, 4000);
                return;
              }
            }

            // add case
            if ($("#Wholesaler-profile-Selector").val() === "null") {
              let url = new URL(
                InvokeURL +
                  "shops/" +
                  shopKey +
                  "/wholesalers/" +
                  wholesalerKey +
                  "/e-commerce/profiles"
              );

              let request = new XMLHttpRequest();
              request.addEventListener("load", reqListener);

              request.open("GET", url, true);
              $("#waitingdots").show();

              function reqListener() {
                if (request.readyState === 4 && request.status === 200) {
                  // Hide the loaders
                  $("#waitingdots").hide();
                }
              }

              request.setRequestHeader("Authorization", orgToken);
              request.setRequestHeader("Requested-By", "webflow-3-4");
              request.onload = function () {
                var data = JSON.parse(this.response);
                var toParse = data.items;
                if (
                  request.status >= 200 &&
                  request.status < 400 &&
                  data.total > 0
                ) {
                  $("#Wholesaler-profile-Selector-box").show();
                  $("#Wholesaler-profile-Selector").attr("required", "");
                  const wholesalerProfileContainer = document.getElementById(
                    "Wholesaler-profile-Selector"
                  );
                  toParse.forEach((profile) => {
                    var optProfile = document.createElement("option");
                    optProfile.value = profile.id;
                    optProfile.innerHTML = profile.name;
                    wholesalerProfileContainer.appendChild(optProfile);
                  });
                } else if (
                  request.status >= 200 &&
                  request.status < 400 &&
                  data.total === 0
                ) {
                  LastStatusMessage.textContent =
                    "Wkrótce stworzymy ofertę dla tego dostawcy! Proszę czekaj.";
                  $(".successmessagetext").text("Pomyślnie dodano dostawcę");
                  window.setTimeout(function () {
                    console.log("reload3");
                    location.reload();
                  }, 2000);
                } else if (request.status == 401) {
                  console.log("Unauthorized");
                } else {
                  $("#Wholesaler-profile-Selector-box").hide();
                  $("#Wholesaler-profile-Selector").removeAttr("required");

                  LastStatusMessage.textContent =
                    "Wkrótce stworzymy ofertę dla tego dostawcy! Proszę czekaj.";
                  const Iehurt = document.getElementById("Iehurt");
                  Iehurt.classList.add("enabled");
                  form.show();
                  displayMessage(
                    "Success",
                    "Dostawca został pomyślnie skonfigurowany."
                  );
                }
              };
              request.send();
              if ($("#CompanyDivEdit").is(":visible")) {
                displayMessage(
                  "Success",
                  "Dostawca został pomyślnie skonfigurowany."
                );
              } else {
                $("#Wholesaler-profile-Selector")
                  .find("option")
                  .remove()
                  .end()
                  .append("<option value=null>Wybierz profil</option>")
                  .val("null");
                displayMessage(
                  "Success",
                  "Trwa logowanie... Za moment proszę wybrać profil właściwy dla konfigurowanego sklepu."
                );
                window.setTimeout(function () {
                  displayMessage(
                    "Success",
                    "Proszę wybrać profil z listy dla konfigurowanego sklepu i kliknąć 'Zmień'."
                  );
                }, 2000);
              }
            } else {
              form.show();
              displayMessage(
                "Success",
                "Dostawca został pomyślnie skonfigurowany."
              );
              window.setTimeout(function () {
                location.reload();
              }, 3000);
            }
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
                  jqXHR.responseJSON.message ==
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
                    : jqXHR.responseJSON.message;
                break;
            }
            displayMessage("Error", msg);
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxSMTP = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action =
          InvokeURL +
          "shops/" +
          shopKey +
          "/wholesalers/" +
          wholesalerKey +
          "/smartvan";
        var method = "PATCH";

        var data = [];

        var email = $("#smtpEmail").val().trim();
        var formats = $("#formats").val() || [];

        $("#formats").removeClass("error-highlight");

        // Porównaj email
        if (email && email !== previousEmail) {
          if (previousEmail) {
            data.push({ op: "remove", path: "/smtp/email" });
          }
          data.push({ op: "add", path: "/smtp/email", value: email });
        }

        if (!email && previousEmail && previousEmail.length > 0) {
          data.push({ op: "remove", path: "/smtp/email" });
        }

        // Porównaj formaty - dodaj nowe
        formats.forEach(function (format) {
          if (!previousFormats.includes(format)) {
            data.push({ op: "add", path: "/smtp/formats/-", value: format });
          }
        });

        // Usuń formaty, które zostały odznaczone
        previousFormats.forEach(function (format) {
          if (!formats.includes(format)) {
            data.push({ op: "remove", path: "/smtp/formats/" + format });
          }
        });

        // Walidacja formatów
        if (formats.length < 1 && previousFormats.length < 1) {
          displayMessage(
            "Error",
            "Proszę wybrać przynajmniej jeden format danych do wysyłki."
          );
          $("#formats").addClass("error-highlight");
          return false;
        }

        $.ajax({
          type: method,
          url: action,
          cors: true,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            window.setTimeout(function () {
              $("#waitingdots").hide();
            }, 2000);
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
            setTimeout(function () {
              displayMessage("Success", "Dane zostały zaktualizowane.");
            }, 500);

            if (resultData && resultData.smtp) {
              previousEmail = resultData.smtp.email;
              previousFormats = resultData.smtp.formats || [];

              $("div[wholesalerdata='smtpEmail']").text(
                "Adres e-mail: " + previousEmail
              );

              var formatList = previousFormats.join(", ");
              $("div[wholesalerdata='smtpFormats']").text(
                "Wybrane formaty: " + formatList
              );

              if (typeof successCallback === "function") {
                var result = successCallback(resultData);
                if (!result) {
                  form.show();
                  return;
                }
              }
            }
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
                    : jqXHR.responseJSON?.message || "Wystąpił nieznany błąd";
                break;
            }
            displayMessage("Error", msg);
          },
        });

        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxWhLogistic = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action =
          InvokeURL + "shops/" + shopKey + "/wholesalers/" + wholesalerKey;

        var method = "PATCH";
        var newValue = parseInt($("#logisticMinimumEdit").val());

        if (newValue > 0) {
          var data = [
            {
              op: "add",
              path: "/logisticMinimum",
              value: newValue,
            },
          ];
        } else {
          var data = [
            {
              op: "remove",
              path: "/logisticMinimum",
            },
          ];
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
            setTimeout(function () {
              displayMessage(
                "Success",
                "Minimum logistyczne dla dostawcy zostało zmienione"
              );
            }, 500); // 500 ms = 0,5 sekundy
            var displayValue = newValue > 0 ? newValue + " zł" : "-";
            $('div[wholesalerdata="logisticMinimum"]').text(
              "Wartość: " + displayValue
            );
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

  editCustomerId = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);

      form.on("submit", function (event) {
        event.preventDefault();

        var action =
          InvokeURL + "shops/" + shopKey + "/wholesalers/" + wholesalerKey;

        var method = "PATCH";
        var customerIdValue = $("#customerId").val().trim();

        var data;

        if (customerIdValue === "") {
          // Usuwanie customerId, gdy pole jest puste
          data = [
            {
              op: "remove",
              path: "/customerId",
            },
          ];
        } else if (/^\d{4,12}$/.test(customerIdValue)) {
          // Dodawanie/zmiana customerId, gdy wartość spełnia walidację
          data = [
            {
              op: "add",
              path: "/customerId",
              value: customerIdValue,
            },
          ];
        } else {
          // Błąd walidacji
          displayMessage(
            "Error",
            "Identyfikator klienta musi składać się z od 4 do 12 cyfr."
          );
          return false;
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
          data: JSON.stringify(data),
          success: function (resultData) {
            if (typeof successCallback === "function") {
              var result = successCallback(resultData);
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
              "Identyfikator klienta dla dostawcy został zmieniony."
            );
            $('div[wholesalerdata="customerId"]').html(
              "Identyfikator klienta: " + customerIdValue
            );
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
            console.error(e);
          },
        });

        return false;
      });
    });
  };

  makeWebflowFormAjaxDeleteWh = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action =
          InvokeURL +
          "shops/" +
          shopKey +
          "/wholesalers/" +
          wholesalerKey +
          "/e-commerce";
        var method = "PATCH";

        var data = [
          {
            op: "remove",
            path: "/authorization/credentials",
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
            displayMessage("Success", "Integracja zostałą usunięta.");
            window.setTimeout(function () {
              window.location.replace(
                "https://" + DomainName + "/app/shops/shop?shopKey=" + shopKey
              );
            }, 4000);
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

  $("#Username-Edit").change(function () {
    $("#Wholesaler-profile-Selector").val("null").change();
  });

  $("#formats").on("mousedown", "option", function (event) {
    // Zapobiegaj domyślnej akcji przeglądarki
    event.preventDefault();

    // Przełącz stan zaznaczenia klikniętej opcji
    $(this).prop("selected", !$(this).prop("selected"));

    // Wymuś aktualizację stanu pola <select>
    $("#formats").trigger("change");
  });

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

  //onlineOfferSupport//

  // Wywołanie funkcji z przykładowym wholesalerKey
  getWholesalerButtons(wholesalerKey);
  getWhSmartVan();

  getWholesaler();
  function onlineOfferSupportFlow() {
    getProfile();
    getWholesalerHistory();
    $("#waitingdots").hide();
  }

  //oniline Support not supported flow //

  LogoutNonUser();
  makeWebflowFormAjaxDeleteWh($(formIdDelete));
  makeWebflowFormAjaxWh($(formIdEdit));
  makeWebflowFormAjaxWhNew($(formIdNew));
  makeWebflowFormAjaxWhLogistic($(formWhLogistic));
  editCustomerId($(formCustomerIdForm));
  makeWebflowFormAjaxSMTP($(formWhSMTP));
  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));
  $("#waitingdots").hide();

  const customMessages = {
    "sobik-nabial":
      "Integracja z e-hurtownią Sobik-Nabiał jest obecnie niedostępna. W celu dalszego korzystania z usług, prosimy o skorzystanie z wersji Sobik-Nabiał Sellitem.",
    "sobik-suchy":
      "Integracja z e-hurtownią Sobik-Suchy jest obecnie niedostępna. W celu dalszego korzystania z usług, prosimy o skorzystanie z wersji Sobik-Suchy Sellitem.",
  };

  if (customMessages[wholesalerKey]) {
    document.getElementById("LastStatusMessage").textContent =
      messages[wholesalerKey];
    $("#login-credentials-container").css("display", "none");
  }
});
