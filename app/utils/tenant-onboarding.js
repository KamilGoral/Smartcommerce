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

  var activeWholesalerCount = 0; // Initialize the active wholesaler count

  // Function to update the button text and state
  function updateActivateWholesalersButton() {
    var button = $("#activateWholesalersButton");
    var buttonText = $(".button-20", button);

    if (activeWholesalerCount >= 3) {
      button.removeClass("disabled");
      buttonText.text("Przejdź dalej");
    } else {
      button.addClass("disabled");
      buttonText.text("Aktywuj jeszcze " + (3 - activeWholesalerCount) + " dostawców.");
    }
  }

  updateActivateWholesalersButton();

  // Handle click event for the activate wholesalers button
  $("#activateWholesalersButton").click(function (event) {
    if (activeWholesalerCount >= 3) {
      // Click the forward button if activeWholesalerCount is more than or equal to 3
      $("#forwardButton").click();
    } else {
      // Prevent default action if activeWholesalerCount is less than 3
      event.preventDefault();
    }
  });

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


  //step5: Activate Wholesalers

  $("#whoYouWorkWith").click(function () {
    getWholesalers();
  });

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
          scrollY: "196px",
          scrollCollapse: true,
          pageLength: 200,
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
              visible: false,
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
            } else {
              updateStatus(
                false,
                checkbox.getAttribute("wholesalerKey"),
                onErrorCallback
              );
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

  function updateStatus(changeOfStatus, wholesalerKey, onErrorCallback) {
    console.log("starting Updating function");

    var form = $("#wf-form-WholesalerChangeStatusForm ");
    var container = form.parent();
    var doneBlock = $(".w-form-done", container);
    var failBlock = $(".w-form-fail", container);

    var data = [
      {
        op: "replace",
        path: "/enabled",
        value: changeOfStatus,
      },
    ];

    $.ajax({
      type: "PATCH",
      url: InvokeURL + "wholesalers/" + wholesalerKey,
      cors: true,
      beforeSend: function () {
        // $("#waitingdots").show();
      },
      complete: function () {
        // $("#waitingdots").hide();
      },
      contentType: "application/json",
      dataType: "json",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: getCookie(getCookie("sprytnyNewOrganizationId")),
      },
      data: JSON.stringify(data),
      success: function (resultData) {
        console.log(resultData);

        if (resultData.enabled == true) {
          console.log("Aktywny");
          activeWholesalerCount = activeWholesalerCount + 1;
          console.log(activeWholesalerCount);
        } else {
          console.log("Nieaktywny");
          activeWholesalerCount = activeWholesalerCount - 1;
          console.log(activeWholesalerCount);
        }

        // Update the button text and state after each status change
        updateActivateWholesalersButton();

        if (typeof successCallback === "function") {
          // call custom callback
          result = successCallback(resultData);
          if (!result) {
            // show error (fail) block
            doneBlock.hide();
            failBlock.show();
            console.log(e);
            return;
          }
        }
        // show success (done) block
        doneBlock.show();
        setTimeout(function () {
          doneBlock.hide();
        }, 2000);
        failBlock.hide();
      },
      error: function (jqXHR, exception) {
        console.log("błąd");
        console.log(jqXHR);
        console.log(exception);
        //$('#customSwitchText').attr('disabled', 'disabled');
        var msg = "";
        if (jqXHR.status === 0) {
          msg = "Nie masz połączenia z internetem.";
        } else if (jqXHR.status == 404) {
          msg = "Nie znaleziono strony";
        } else if (jqXHR.status == 403) {
          msg = "Nie masz uprawnień do tej czynności";
        } else if (jqXHR.status == 409) {
          msg =
            "Nie można usunąć dostawcy. Jeden ze sklepów wciąż korzysta z jego usług.";
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
          msg = "" + jqXHR.responseText;
        }

        // Call the onErrorCallback if defined
        if (typeof onErrorCallback === "function") {
          onErrorCallback();
        }

        $(".warningmessagetext").text(msg);
        form.show();
        doneBlock.hide();
        failBlock.show();
        setTimeout(function () {
          failBlock.hide();
        }, 2000);
        return;
      },
    });
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

});
