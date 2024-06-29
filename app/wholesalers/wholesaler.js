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
  // DOM is loaded and ready for manipulation here
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
      return decodeURIComponent(parts.pop().split(";").shift());
  }

  function setCookie(cName, cValue, expirationSec) {
    let date = new Date();
    date.setTime(date.getTime() + expirationSec * 1000);
    const expires = "expires=" + date.toUTCString();
    const encodedValue = encodeURIComponent(cValue);
    document.cookie = `${cName}=${encodedValue}; ${expires}; path=/`;
  }

  function parseAttributes(cookieValue) {
    const attributes = cookieValue.split(",");
    const result = {};
    attributes.forEach((attribute) => {
      const [key, value] = attribute.split(":");
      result[key.trim()] = value.trim();
    });
    return result;
  }

  var smartToken = getCookie("sprytnycookie");
  var accessToken = smartToken.split("Bearer ")[1];
  const attributes = parseAttributes(getCookie("SpytnyUserAttributes"));
  const username = document.getElementById("firstNameUser");
  username.value = attributes["username"];
  const userfamilyname = document.getElementById("lastNameUser");
  userfamilyname.value = attributes["familyname"];
  const emailElement = document.getElementById("useremail");
  const emailadress = document.getElementById("emailadressUser");
  emailElement.textContent = attributes["email"];
  emailadress.value = attributes["email"];

  makeWebflowFormAjaxChange = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var failBlock2 = $("#form-done-fail-edit-profile");
        const firstNameUser = $("#firstNameUser").val();
        const lastNameUser = $("#lastNameUser").val();
        // const emailadressUser = $("#emailadressUser").val();

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
            // {
            //   Name: "email",
            //   Value: emailadressUser,
            // },
          ],
        };

        const url = "https://cognito-idp.us-east-1.amazonaws.com/";

        $.ajax({
          type: "POST",
          url: url,
          headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "x-amz-target":
              "AWSCognitoIdentityProviderService.UpdateUserAttributes",
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
                $("#form-done-edit-profile").hide();
                failBlock2.show();
                console.log(e);
                return;
              }
            }
            form.show();
            $("#form-done-edit-profile").show().delay(2000).fadeOut("slow");
            failBlock2.hide();
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            failBlock2.show();
            console.log(e);
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
  var formIdNewWh = "#wf-form-Create-wholesaler";
  var formIdDelete = "#wf-form-DeleteWholesalerCredential";
  var formWhLogistic = "#wf-form-LogisticMinimumForm";
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
  var shopKey = new URL(document.location.href).searchParams.get("shopKey");
  ShopBread.textContent = shopKey;
  ShopBread.setAttribute(
    "href",
    "https://" + DomainName + "/app/shops/shop?shopKey=" + shopKey
  );

  const WholesalerIdBread = document.getElementById("WholesalerBread0");
  var wholesalerKey = new URL(document.location.href).searchParams.get(
    "wholesalerKey"
  );
  WholesalerIdBread.textContent = wholesalerKey;
  WholesalerIdBread.setAttribute("href", window.location.href);

  function getWholesaler() {
    $("#CompanyDivEdit").hide();
    $("#Wholesaler-profile-Selector-box").hide();
    $("#status-container").hide();

    if (
      wholesalerKey == "mirex" ||
      wholesalerKey == "phup-gniezno" ||
      wholesalerKey == "smakosz" ||
      wholesalerKey == "abe-dystrybucja" ||
      wholesalerKey == "etqa" ||
      wholesalerKey == "biologistic" ||
      wholesalerKey == "elleena"
    ) {
      $("#CompanyDivEdit").show();
    } else {
      $("#CompanyDivEdit").hide();
    }

    let url2 = new URL(
      InvokeURL +
        "shops/" +
        shopKey +
        "/wholesalers/" +
        wholesalerKey +
        "/online-offer"
    );
    let request2 = new XMLHttpRequest();
    request2.open("GET", url2, true);
    request2.setRequestHeader("Authorization", orgToken);
    request2.onload = function () {
      var data2 = JSON.parse(this.response);
      if (request2.status >= 200 && request2.status < 400) {
        $("#login-credentials-container").removeClass("hide");
        const statusmessagebox = document.getElementById("statusmessagebox");
        $("#UsernameEdit").val(data2.credentials.username).change();
        $("#logisticMinimumEdit").val(data2).change();
        if (data2.lastDownload !== null) {
          var firstData = data2.lastDownload;
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
            firstStatus = "Suckes";
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

            if ((firstMessage = "Profile for wholesaler have to be set.")) {
              firstMessage = "Proszę wybrać profil dla dostawcy z listy";
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
        var LastStatusMessage = document.getElementById("LastStatusMessage");
        LastStatusMessage.textContent = "Dostawca gotowy do integracji.";
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
    request.onload = function () {
      var data = JSON.parse(this.response);
      console.log(data);
      if (request.status >= 200 && request.status < 400) {
        if (data.onlineOfferSupport) {
          $("#status-container").show();
        }

        const wholesalerName = document.getElementById("WholesalerName");
        const whPlatformUrl = document.getElementById("whPlatformUrl");
        const whTaxId = document.getElementById("whTaxId");
        const whCountry = document.getElementById("whCountry");
        const whLine1 = document.getElementById("whLine1");
        const whLine2 = document.getElementById("whLine2");
        const whTown = document.getElementById("whTown");
        const whState = document.getElementById("whState");
        const whPostcode = document.getElementById("whPostcode");
        const whLogo = document.getElementById("whLogo");
        whLogo.src = "data:image/png;base64," + data.image;
        whLogo.style.objectFit = "contain";
        wholesalerName.textContent = data.company;

        if (data.platformUrl !== null) {
          whPlatformUrl.setAttribute("href", "" + data.platformUrl);
          $("#login-credentials-container").removeClass("hide");
        } else {
          $("#proposeIntegration").removeClass("hide");
          $("#loginButton").hide();
        }
        //
        whTaxId.textContent = data.taxId;
        whCountry.textContent = data.address.country;
        whLine1.textContent = data.address.line1;
        whLine2.textContent = data.address.line2;
        whTown.textContent = data.address.town;
        whState.textContent = data.address.state;
        whPostcode.textContent = data.address.postcode;
      } else {
        console.log("error");
      }
    };
    request.send();
  }

  // Funkcja do dostosowania szerokości selecta do najszerszej opcji
  function adjustSelectWidth() {
    const select = document.getElementById("Wholesaler-profile-Selector");
    const options = select.getElementsByTagName("option");
    let maxWidth = 411;

    // Znajdź najszerszą opcję
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const optionWidth = option.scrollWidth;
      if (optionWidth > maxWidth) {
        maxWidth = optionWidth;
        select.style.width = maxWidth + "px";
      }
    }
  }

  function getProfile() {
    let url = new URL(
      InvokeURL +
        "shops/" +
        shopKey +
        "/wholesalers/" +
        wholesalerKey +
        "/online-offer/profiles"
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
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      if (request.status >= 200 && request.status < 400 && data.total > 0) {
        $("#Wholesaler-profile-Selector-box").show();
        $("#Wholesaler-profile-Selector").attr("required", "");
        const Iehurt = document.getElementById("Iehurt");
        Iehurt.classList.add("enabled");
        const wholesalerProfileContainer = document.getElementById(
          "Wholesaler-profile-Selector"
        );
        toParse.forEach((profile) => {
          var optProfile = document.createElement("option");
          optProfile.value = profile.id;
          optProfile.name = profile.id;
          optProfile.innerHTML = profile.name;
          wholesalerProfileContainer.appendChild(optProfile);
        });
      } else if (request.status == 401) {
        console.log("Unauthorized");
      } else {
        $("#Wholesaler-profile-Selector-box").hide();
        $("#Wholesaler-profile-Selector").removeAttr("required");
      }
    };
    request.send();

    $("#waitingdots").show();
    $("#Wholesaler-profile-Selector")
      .find("option")
      .remove()
      .end()
      .append("<option value=null>Wybierz profil</option>")
      .val("null");

    // Wywołaj funkcję
    adjustSelectWidth();
  }

  function getWholesalerHistory() {
    let url = new URL(
      InvokeURL +
        "shops/" +
        shopKey +
        "/wholesalers/" +
        wholesalerKey +
        "/online-offer/status-history?sort=createDate:asc&perPage=30"
    );
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      console.log(toParse);
      const statusContainer = document.getElementById("StatusContainer");

      if (request.status >= 200 && request.status < 400 && data.total > 0) {
        toParse.forEach((item) => {
          const style = document.getElementById("sampleStatus");
          const row = style.cloneNode(true);
          row.style.display = "block";
          var firstCreateDate = "";
          var offset = new Date().getTimezoneOffset();
          var localeTime = new Date(
            Date.parse(item.createDate) - offset * 60 * 1000
          ).toISOString();
          var creationDate = localeTime.split("T");
          firstCreateDate = creationDate[0];

          if (item.status === "Failed") {
            row.classList.add("fail");
            row.classList.add("tippy");
            row.setAttribute(
              "data-tippy-content",
              firstCreateDate + " Problem"
            );
          }
          if (item.status === "Incomplete") {
            row.classList.add("warning");
            row.classList.add("tippy");
            row.setAttribute(
              "data-tippy-content",
              firstCreateDate + " Niekompletna"
            );
          }
          if (item.status === "Succeeded") {
            row.classList.add("tippy");
            row.setAttribute("data-tippy-content", firstCreateDate + " Sukces");
          }
          statusContainer.appendChild(row);
        });
      } else {
        console.log("here");
      }
      //loadTippyContent need to be there//
      LoadTippy();
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

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);

        var foundWholesaler = data.items.find(function (item) {
          return item.wholesalerKey === wholesalerKey;
        });

        var logisticMinimum = foundWholesaler.logisticMinimum;

        if (logisticMinimum !== null) {
          $("#logisticMinimumEdit").val(logisticMinimum).change();
        }

        if (
          foundWholesaler &&
          foundWholesaler.connections &&
          foundWholesaler.connections.onlineOffer
        ) {
          var onlineOfferData = foundWholesaler.connections.onlineOffer;
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

  makeWebflowFormAjaxWh = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#w-form-done4", container);
        var failBlock = $("#w-form-fail4", container);
        var action =
          InvokeURL +
          "shops/" +
          shopKey +
          "/wholesalers/" +
          wholesalerKey +
          "/online-offer";
        var method = "PATCH";

        if ($("#CompanyEdit").val()) {
          //mirex, smakosz, gniezno case
          var data = [
            {
              op: "add",
              path: "/credentials/username",
              value: $("#UsernameEdit").val().trim(),
            },
            {
              op: "add",
              path: "/credentials/password",
              value: $("#PasswordEdit").val(),
            },
            {
              op: "add",
              path: "/credentials/extraFields",
              value: {
                company: $("#CompanyEdit").val(),
              },
            },
          ];
        } else {
          //edit case
          if ($("#Wholesaler-profile-Selector").val() != "null") {
            var data = [
              {
                op: "add",
                path: "/credentials/username",
                value: $("#UsernameEdit").val().trim(),
              },
              {
                op: "add",
                path: "/credentials/password",
                value: $("#PasswordEdit").val(),
              },
              {
                op: "add",
                path: "/profile",
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
                path: "/credentials/username",
                value: $("#UsernameEdit").val().trim(),
              },
              {
                op: "add",
                path: "/credentials/password",
                value: $("#PasswordEdit").val(),
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
          },
          data: JSON.stringify(data),
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                doneBlock.hide();
                failBlock.show();
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
                  "/online-offer/profiles"
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
                  doneBlock.show();
                  doneBlock.fadeOut(3000);
                  failBlock.hide();
                }
              };
              request.send();
              if ($("#CompanyDivEdit").is(":visible")) {
                doneBlock.show();
                doneBlock.fadeOut(3000);
              } else {
                $("#Wholesaler-profile-Selector")
                  .find("option")
                  .remove()
                  .end()
                  .append("<option value=null>Wybierz profil</option>")
                  .val("null");

                $(".successmessagetext").text(
                  "Trwa logowanie... Za moment proszę wybrać profil właściwy dla konfigurowanego sklepu."
                );
                $(".successmessagetext").text(
                  "Proszę wybrać profil z listy dla konfigurowanego sklepu i kliknąć 'Zmień'."
                );
                doneBlock.show();
              }
            } else {
              form.show();
              console.log("tutaj");
              $(".successmessagetext").text(
                "Dostawca został pomyślnie skonfigurowany."
              );
              $(".warningmessagetext").css("color", "#3a4570");
              $(".error-message-fixed-main").css("background-color", "#ffc53d");
              $("#w-form-done4").show();
              $("#w-form-done4").fadeOut(6000);
              window.setTimeout(function () {
                console.log("reload3");
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
                  "Serwer napotkał problemy. Prosimy o kontakt kontakt@smartcommerce.net [500].";
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
            $(".warningmessagetext").css("color", "#3a4570");
            $(".warningmessagetext").text(msg);
            $(".error-message-fixed-main").css("background-color", "#ffc53d");
            $("#w-form-fail4").show();
            $("#w-form-fail4").fadeOut(6000);
            return;
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
        var container = form.parent();
        var doneBlock = $("#w-form-done4", container);
        var failBlock = $("#w-form-fail4", container);
        var action =
          InvokeURL + "shops/" + shopKey + "/wholesalers/" + wholesalerKey;

        var method = "PATCH";

        if (parseInt($("#logisticMinimumEdit").val()) > 0) {
          var data = [
            {
              op: "add",
              path: "/logisticMinimum",
              value: parseInt($("#logisticMinimumEdit").val()),
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
          },
          data: JSON.stringify(data),
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                doneBlock.hide();
                failBlock.show();
                console.log(e);
                return;
              }
            }
            form.show();
            doneBlock.show();
            doneBlock.fadeOut(3000);
            failBlock.hide();
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            doneBlock.hide();
            failBlock.show();
            failBlock.fadeOut(3000);
            failBlock.hide();
            console.log(e);
          },
        });
        event.preventDefault();
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
        var container = form.parent();
        var doneBlockDelete = $("#w-form-done3", container);
        var failBlockDelete = $("#w-form-fail3", container);
        var action =
          InvokeURL +
          "shops/" +
          shopKey +
          "/wholesalers/" +
          wholesalerKey +
          "/online-offer";
        var method = "PATCH";

        var data = [
          {
            op: "remove",
            path: "/credentials",
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
          },
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                doneBlockDelete.hide();
                failBlockDelete.show();
                console.log(e);
                return;
              }
            }
            form.show();
            doneBlockDelete.show();
            doneBlockDelete.fadeOut(1000);
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
            doneBlockDelete.hide();
            failBlockDelete.show();
            failBlockDelete.fadeOut(1000);
            failBlockDelete.hide();
            console.log(e);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxNewWh = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      console.log("Tutaj");
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $(".w-form-done", container);
        var failBlock = $(".w-form-fail", container);
        var action =
          "https://hook.integromat.com/1xsh5m1qtu8wj7vns24y5tekcrgq2pc3";
        var data = {
          whname: $("#WholesalerName").text(),
          taxId: "random",
          platformUrl: $("#platformUrl").val(),
          organizationName: OrganizationName,
          form: "new-Wholesaler",
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
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: orgToken,
          },
          data: JSON.stringify(data),
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                doneBlock.hide();
                failBlock.show();
                console.log(e);
                return;
              }
            }
            form.hide();
            doneBlock.show();
            failBlock.hide();
            window.setTimeout(function () {
              location.reload();
            }, 1000);
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            doneBlock.hide();
            failBlock.show();
            console.log(e);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  $("#UsernameEdit").change(function () {
    $("#Wholesaler-profile-Selector").val("null").change();
  });

  function LoadTippy() {
    $.getScript(
      "https://unpkg.com/popper.js@1",
      function (data, textStatus, jqxhr) {
        $.getScript(
          "https://unpkg.com/tippy.js@4",
          function (data, textStatus, jqxhr) {
            tippy(".tippy", {
              // Add the class tippy to your element
              theme: "light", // Dark or Light
              animation: "scale", // Options, shift-away, shift-toward, scale, persepctive
              duration: 250, // Duration of the Animation
              arrow: true, // Add arrow to the tooltip
              arrowType: "round", // Sharp, round or empty for none
              delay: [0, 50], // Trigger delay in & out
              maxWidth: 240, // Optional, max width settings
            });
          }
        );
      }
    );
  }

  //onlineOfferSupport//

  // Wywołanie funkcji z przykładowym wholesalerKey
  getWholesalerButtons(wholesalerKey);

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
  makeWebflowFormAjaxWhLogistic($(formWhLogistic));
  makeWebflowFormAjaxNewWh($(formIdNewWh));
  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));
  $("#waitingdots").hide();
});
