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
    const decodedValue = decodeURIComponent(cookieValue);
    const attributes = decodedValue.split("|");
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

  postEditUserProfile = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        const firstNameUser = $("#firstNameUser").val();
        const lastNameUser = $("#lastNameUser").val();
        const emailadressUser = $("#emailadressUser").val();

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
                emailadressUser,
              720000
            );
            displayMessage("Success", "Twoje dane zostały zmienione");
            const welcomeMessage = document.getElementById("welcomeMessage");
            if (welcomeMessage) {
              welcomeMessage.textContent =
                "Witaj, " + firstNameUser + " " + lastNameUser + "!";
            } else {
              console.log(
                "Element 'welcomeMessage' nie został znaleziony. Pomijam ustawienie powitania."
              );
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

  function getWholesalersSh() {
    let url = new URL(InvokeURL + "wholesalers" + "?enabled=true&perPage=1000");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      if (request.status >= 200 && request.status < 400) {
        console.log(Object.keys(toParse).length);
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
        if (request.status == 401) {
          console.log("Unauthorized");
        }
      }
    };
    request.send();
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

      // Find all elements with the 'file_uploader' attribute
      const uploadButtons = document.querySelectorAll("[file_uploader]");

      uploadButtons.forEach((button) => {
        // Create a hidden file input element
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.style.display = "none"; // Hide the file input
        fileInput.name = button.getAttribute("file_uploader"); // Set name to the value of the attribute

        // Append the file input to the body (or wherever appropriate)
        document.body.appendChild(fileInput);

        // Create and hide the delete file button initially
        const deleteFileButton = document.getElementById("deleteFileButton");
        deleteFileButton.style.display = "none";

        // When the button is clicked, trigger the file input if the file is not selected
        button.addEventListener("click", function (e) {
          if (!button.classList.contains("file-selected")) {
            e.preventDefault(); // Prevent any default button actions if file not selected yet
            fileInput.click();
          } else {
            // If file is selected, submit the form
            form3.submit();
          }
        });

        // When a file is selected, update the button text with the file name
        fileInput.addEventListener("change", function () {
          if (fileInput.files.length > 0) {
            const fileName = fileInput.files[0].name; // Get the file name

            // Update the button's inner HTML with the file name and the icon
            button.innerHTML = `
              Wyslij cennik: ${fileName}
              <div class="icon-embed-xsmall w-embed">
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--ph" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256">
                      <path fill="currentColor" d="M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0ZM88 88h32v64a8 8 0 0 0 16 0V88h32a8 8 0 0 0 5.66-13.66l-40-40a8 8 0 0 0-11.32 0l-40 40A8 8 0 0 0 88 88Z"></path>
                  </svg>
              </div>
            `;

            // Show the delete button
            deleteFileButton.style.display = "block";

            // Change the button role to submit and add a class to indicate a file is selected
            button.classList.add("file-selected");
          }
        });

        // Add event listener to delete button
        deleteFileButton.addEventListener("click", function (e) {
          e.preventDefault(); // Prevent default behavior

          // Clear the selected file
          fileInput.value = "";
          button.classList.remove("file-selected");

          // Reset button text
          button.innerHTML = `
            <div>Dodaj plik cennika</div>
            <div class="icon-embed-xsmall w-embed">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--ph" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256">
                    <path fill="currentColor" d="M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0ZM88 88h32v64a8 8 0 0 0 16 0V88h32a8 8 0 0 0 5.66-13.66l-40-40a8 8 0 0 0-11.32 0l-40 40A8 8 0 0 0 88 88Z"></path>
                </svg>
            </div>
          `;

          // Hide the delete button
          deleteFileButton.style.display = "none";
        });
      });

      form3.on("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        var wholesalerKey = $("#WholesalerSelector").val();
        if (!wholesalerKey) {
          displayMessage(
            "Error",
            "Nie wybrano dostawcy. Proszę wybrać dostawcę z listy."
          );
          return false;
        }

        // Retrieve the selected file from the dynamically created input
        let uploadedFile = null;
        uploadButtons.forEach((button) => {
          const fileInput = document.querySelector(
            `input[name='${button.getAttribute("file_uploader")}']`
          );
          if (fileInput && fileInput.files.length > 0) {
            uploadedFile = fileInput.files[0];
          }
        });

        // Check if the file size exceeds 10 MB (10 * 1024 * 1024 bytes)
        if (uploadedFile && uploadedFile.size > 10 * 1024 * 1024) {
          displayMessage(
            "Error",
            "Plik cennika jest za duży. Maksymalny rozmiar to 10 MB."
          );
          resetButton();
          return false;
        }

        if (!uploadedFile) {
          displayMessage(
            "Error",
            "Nie wybrano pliku z cennikiem. Proszę wybrać plik w formacie .csv, .ods lub .xlsx."
          );
          resetButton();
          return false;
        }

        const formData = new FormData();

        // Determine the MIME type based on file extension, default to text/plain
        var fileType = "text/plain"; // Default MIME type
        var fileExtension = uploadedFile.name.split(".").pop().toLowerCase();
        console.log(fileExtension);

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
          // Default case will now use text/plain
        }

        // JSON data should be of type application/json
        const jsonData = {
          wholesalerKey: wholesalerKey,
          shopKeys: $("#shopKeys").val(),
          startDate: $("#startDate").val() + "T00:00:00.000Z",
          endDate: $("#endDate").val() + "T23:59:59.999Z",
        };

        // Sprawdzenie, czy lista sklepów jest pusta
        if (!jsonData.shopKeys || jsonData.shopKeys.length === 0) {
          console.log(jsonData);
          displayMessage("Error", "Błąd: Lista Sklepów jest pusta.");
          return false;
        }

        // Funkcja sprawdzająca, czy string jest w formacie daty "YYYY-MM-DD"
        function isValidDateString(dateString) {
          // Sprawdzenie, czy string pasuje do formatu YYYY-MM-DD
          const datePattern = /^\d{4}-\d{2}-\d{2}$/;

          if (!datePattern.test(dateString)) {
            return false;
          }

          // Konwersja do obiektu Date i sprawdzenie, czy jest prawidłowa
          const date = new Date(dateString);
          return date instanceof Date && !isNaN(date);
        }

        // Sprawdzenie, czy startDate i endDate nie są puste oraz są poprawne
        if (!jsonData.startDate || !isValidDateString(jsonData.startDate)) {
          displayMessage(
            "Error",
            "Błąd: Niepoprawny format daty początkowej. Proszę wprowadzić datę w formacie YYYY-MM-DD."
          );
          return false;
        }

        if (!jsonData.endDate || !isValidDateString(jsonData.endDate)) {
          displayMessage(
            "Error",
            "Błąd: Niepoprawny format daty końcowej. Proszę wprowadzić datę w formacie YYYY-MM-DD."
          );
          return false;
        }

        // Konwersja stringów na obiekty Date
        const startDate = new Date(jsonData.startDate);
        const endDate = new Date(jsonData.endDate);

        // Pobranie aktualnej daty
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Ustawienie godziny na 00:00:00.000

        // Sprawdzenie, czy startDate i endDate są >= dzisiejszej dacie
        if (startDate < today || endDate < today) {
          console.log(jsonData);
          displayMessage(
            "Error",
            "Błąd: Data początkowa lub końcowa jest wcześniejsza niż dzisiejsza data."
          );
          return false;
        }

        formData.append(
          "json",
          new Blob([JSON.stringify(jsonData)], { type: "application/json" })
        );

        // Append the file with the determined or default MIME type
        formData.append(
          "file",
          new Blob([uploadedFile], { type: fileType }),
          uploadedFile.name
        );

        var uploadEndpoint = InvokeURL + "price-lists";

        console.log("FormData prepared:", formData);

        // Show loading animation
        $("#waitingdots").show();

        axios
          .post(uploadEndpoint, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: orgToken,
              "Requested-By": "webflow-3-4",
            },
          })
          .then(function (response) {
            // Hide loading animation
            $("#waitingdots").hide();

            if (typeof successCallback === "function") {
              var result = successCallback(response.data);
              console.log(result);
              if (!result) {
                form3.show();
                displayMessage(
                  "Error",
                  "Oops. Coś poszło nie tak, spróbuj ponownie."
                );
                resetButton();
                return;
              }
            }

            displayMessage("Success", "Cennik został dodany.");
            var pricelistUrl =
              "https://" +
              DomainName +
              "/app/pricelists/pricelist?uuid=" +
              response.data.items[0].uuid;
            setTimeout(function () {
              window.location.href = pricelistUrl;
            }, 1500);
          })
          .catch(function (error) {
            // Hide loading animation
            $("#waitingdots").hide();

            console.log(error);
            var msg = "";
            if (error.response) {
              if (error.response.status === 0) {
                msg = "Not connect.\n Verify Network.";
              } else if (error.response.status == 403) {
                msg = "Użytkownik nie ma uprawnień do tworzenia organizacji.";
              } else if (error.response.status == 400) {
                msg = error.response.message;
              } else if (error.response.status == 500) {
                msg = "Internal Server Error [500].";
              } else {
                msg = error.response.data.message;
              }
            } else if (error.request) {
              msg = "No response from the server.";
            } else {
              msg = error.response.message;
            }

            displayMessage("Error", msg);
            resetButton();
            if (typeof errorCallback === "function") {
              errorCallback(error);
            }
          });

        return false;
      });

      function resetButton(button) {
        // Reset button text
        button.innerHTML = `
            <div>Dodaj plik cennika</div>
            <div class="icon-embed-xsmall w-embed">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--ph" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256">
                    <path fill="currentColor" d="M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0ZM88 88h32v64a8 8 0 0 0 16 0V88h32a8 8 0 0 0 5.66-13.66l-40-40a8 8 0 0 0-11.32 0l-40 40A8 8 0 0 0 88 88Z"></path>
                </svg>
            </div>
        `;
        // Hide the delete button
        const deleteFileButton = document.getElementById("deleteFileButton");
        deleteFileButton.style.display = "none";
      }
    });
  };

  makeWebflowFormAjax($("#wf-form-NewPricingList"));
  getShops();
  getWholesalersSh();
  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));
});
