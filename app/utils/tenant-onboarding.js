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
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  function setCookieAndSession(cName, cValue, expirationSec) {
    let date = new Date();
    date.setTime(date.getTime() + expirationSec * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
  }

  const successmessagetext = "";
  const WarningMessage = "";

  const tenantName = "";
  const tenantTaxId = "";
  const tenantButton = "";
  const confirmationPassword = "";
  const shopButton = document.getElementById("shopButton");
  const wholesalerLogin = "";
  const wholesalerOptional = "";
  const wholesalerButton = "";
  const skipButton = "";

  const finishOnboarding = "";

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

  var smartToken = getCookie("sprytnycookie");
  var InvokeURL = getCookie("sprytnyInvokeURL");
  const forwardButton = document.getElementById("forwardButton");
  // Onboarding steps required

  // Find all buttons with the class 'nextstep'
  const nextStepButtons = document.querySelectorAll(".nextstep");

  // Add a click event listener to each 'nextstep' button
  nextStepButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Find the button with the ID 'forwardButton' and simulate a click
      if (forwardButton) {
        forwardButton.click();
      }
    });
  });

  function displayWarningMessage(message) {
    $(".warningmessagetext").text(message);
    // Ensure you have a container with class 'warningmessagetext' for displaying error messages
  }

  //step2: Create tenant

  $("#tenantButton").click(function () {
    var name = $("#tenantName").val();
    var taxId = $("#tenantTaxId").val();

    if (!name || !taxId) {
      // Handle missing input
      displayWarningMessage("Proszę wypełnić wszystkie pola.");
      return;
    }

    var action = InvokeURL + "tenants";
    var data = {
      name: name,
      taxId: taxId,
    };

    $.ajax({
      type: "POST",
      url: action,
      contentType: "application/json",
      dataType: "json",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: smartToken,
      },
      data: JSON.stringify(data),
      beforeSend: function () {
        $("#waitingdots").show();
      },
      complete: function () {
        $("#waitingdots").hide();
      },
      success: function (resultData) {
        // Navigate to next slide
        forwardButton.click();
        console.log(resultData);
        setCookieAndSession(
          "sprytnyNewOrganizationId",
          resultData.clientId,
          96000
        );
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Display error message on the current slide
        var errorMsg =
          "Błąd: " +
          (jqXHR.responseJSON && jqXHR.responseJSON.message
            ? jqXHR.responseJSON.message
            : textStatus);
        displayWarningMessage(errorMsg);
      },
    });
  });

  //step3: Login to tenant

  // Get the button by its ID
  const finishOnboardingButton = document.getElementById("finishOnboarding");

  // Check if the button exists to avoid errors
  if (finishOnboardingButton) {
    // Add a click event listener to the button
    finishOnboardingButton.addEventListener("click", function (event) {
      LoginIntoOrganization(event); // Call the function, passing the event object
    });
  } else {
    console.log("The 'finishOnboarding' button was not found on the page.");
  }
  function LoginIntoOrganization(evt) {
    evt.preventDefault(); // Prevent the default form submission

    var OrganizationclientId = getCookie("sprytnyNewOrganizationId");

    // Check if the organization's client ID is already stored as a cookie
    if (!getCookie(OrganizationclientId)) {
      var data = {
        smartToken: smartToken, // Ensure smartToken is correctly initialized and available
        OrganizationclientId: OrganizationclientId,
        OrganizationName: $("#tenantName").val(),
      };

      $.ajax({
        type: "POST",
        url: "https://hook.integromat.com/3k5pcq058xulm1gafamujedv9hwx6qn8",
        cors: true,
        beforeSend: function () {
          $("#waitingdots").show(); // Display loading indicator
        },
        complete: function () {
          $("#waitingdots").hide(); // Hide loading indicator
        },
        contentType: "application/json",
        dataType: "json",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
        success: function (resultData) {
          // Set the cookie and session storage after a successful response
          setCookieAndSession(
            OrganizationclientId,
            "Bearer " + resultData.AccessToken,
            resultData.ExpiresIn
          );
          sessionStorage.clear(); // Optionally clear other session data
          if (typeof successCallback === "function") {
            var result = successCallback(resultData);
            if (!result) {
              return;
            }
          }
          // Redirect to the organization's page
          console.log("Zalogowano");
          forwardButton.click();
          console.log(resultData);
        },
        error: function (jqXHR, exception) {
          console.error("Error during AJAX request:", jqXHR, exception);
        },
      });
    } else {
      console.log("Problem");
      // Redirect to the organization's page
      // window.location.replace(
      //   "https://" +
      //     DomainName +
      //     "/app/tenants/organization" +
      //     "?name=" +
      //     OrganizationName +
      //     "&clientId=" +
      //     OrganizationclientId
      // );
    }
    return false;
  }

  //step4: Create Shop

  // Find the button with the ID 'shopButton'

  // Check if the button exists to avoid errors
  if (shopButton) {
    // Add a click event listener to the button
    shopButton.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent any default action initiated by clicking

      var action = InvokeURL + "shops";
      var data = {
        name: $("#shopName").val(),
        shopKey: $("#shopKey").val().toUpperCase(),
      };

      $.ajax({
        type: "POST",
        url: action,
        cors: true,
        beforeSend: function () {
          $("#waitingdots").show(); // Display loading indicator
        },
        complete: function () {
          $("#waitingdots").hide(); // Hide loading indicator
        },
        contentType: "application/json",
        dataType: "json",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: getCookie(getCookie("sprytnyNewOrganizationId")), // Make sure the 'orgToken' is defined and valid
        },
        data: JSON.stringify(data),
        success: function (resultData) {
          // Assuming 'successCallback' is a function that handles successful data processing
          if (typeof successCallback === "function") {
            var result = successCallback(resultData);
            if (!result) {
              return;
            }
          }
          console.log("Shop created successfully");
          getWholesalers();
          forwardButton.click();
        },
        error: function (error) {
          // Assuming 'errorCallback' is a function that handles error
          if (typeof errorCallback === "function") {
            errorCallback(error);
          }
          console.log("Error creating shop");
          console.error(error);
        },
      });

      return false; // Prevent default form submission if it's nested inside a form
    });
  } else {
    console.log("The 'shopButton' was not found on the page.");
  }

  //step5: Activate Wholesalers

  function getWholesalers() {
    let url = new URL(InvokeURL + "wholesalers?perPage=1000");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader(
      "Authorization",
      getCookie(getCookie("sprytnyNewOrganizationId"))
    );
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(this.response);
        var toParse = data.items;
        toParse.sort(function (a, b) {
          return b.enabled - a.enabled;
        });
        $("#table_wholesalers").DataTable({
          data: toParse,
          pagingType: "full_numbers",
          order: [],
          dom: '<"top">frt',
          scrollY: "268px",
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
          columns: [
            {
              orderable: false,
              data: "image",
              width: "36px",
              height: "36px",
              render: function (data) {
                if (data !== null) {
                  return (
                    "<div style='height:36px width: 36px' class='details-container2'><img src='data:image/png;base64," +
                    data +
                    "' alt='logo'></img></div>"
                  );
                }
                if (data === null) {
                  return "<div style='height:36px width: 36px' class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61ae41350933c525ec8ea03a_office-building.svg' alt='wholesaler'></img></div>";
                }
              },
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
              data: "taxId",
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
              data: "address",
              visible: false,
              render: function (data) {
                if (data !== null) {
                  return (
                    data.state &&
                    data.state[0].toUpperCase() + data.state.slice(1)
                  );
                }
                if (data === null) {
                  return "";
                }
              },
            },
            {
              orderable: false,
              data: "wholesalerKey",
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
              data: "platformUrl",
              render: function (data) {
                if (data !== null) {
                  return '<spann class="positive">Tak</spann>';
                } else {
                  return '<spann class="negative">Nie</spann>';
                }
              },
            },
            {
              orderable: true,
              data: "enabled",
              render: function (data, type, row) {
                if (type === "display") {
                  if (data) {
                    return (
                      '<label class="switchCss"><input type="checkbox" checked class="editor-active"  wholesalerKey="' +
                      row["wholesalerKey"] +
                      '"><span class="slider round"></span></label>'
                    );
                  } else {
                    return (
                      '<label class="switchCss"><input type="checkbox" class="editor-active" wholesalerKey="' +
                      row["wholesalerKey"] +
                      '"><span class="slider round"></span></label>'
                    );
                  }
                }
                return data;
              },
            },
          ],
        });
        $("#table_wholesalers").on(
          "change",
          "input.editor-active",
          function () {
            var checkbox = this; // Reference to the checkbox
            var isChecked = checkbox.checked; // Current state
            var row = $("#table_wholesalers")
              .DataTable()
              .row($(this).closest("tr")); // Get the DataTable row
            var data = row.data(); // Get row data

            var onErrorCallback = function () {
              // Revert checkbox state if there's an error
              $(checkbox).prop("checked", !isChecked);
            };

            if (isChecked) {
              updateStatus(
                true,
                checkbox.getAttribute("wholesalerKey"),
                onErrorCallback
              );
              // Add to the second table if enabled
              addToSecondTable(data);
            } else {
              updateStatus(
                false,
                checkbox.getAttribute("wholesalerKey"),
                onErrorCallback
              );
              // Remove from the second table if disabled
              removeFromSecondTable(data.wholesalerKey);
            }
          }
        );
      }

      if (request.status == 401) {
        console.log("Unauthorized");
      }
    };
    request.send();
  }
  //Step6: Integrate Wholesalers
  //Step7: Redirect to Organization

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

  patchWholesalersCredential = function (
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

  $("#table_wholesalers").on("change", "input.editor-active", function () {
    var checkbox = this; // Reference to the checkbox
    var isChecked = checkbox.checked; // Current state
    var row = $("#table_wholesalers").DataTable().row($(this).closest("tr")); // Get the DataTable row
    var data = row.data(); // Get row data

    var onErrorCallback = function () {
      // Revert checkbox state if there's an error
      $(checkbox).prop("checked", !isChecked);
    };

    if (isChecked) {
      updateStatus(
        true,
        checkbox.getAttribute("wholesalerKey"),
        onErrorCallback
      );
      // Add to the second table if enabled
      addToSecondTable(data);
    } else {
      updateStatus(
        false,
        checkbox.getAttribute("wholesalerKey"),
        onErrorCallback
      );
      // Remove from the second table if disabled
      removeFromSecondTable(data.wholesalerKey);
    }
  });
});
