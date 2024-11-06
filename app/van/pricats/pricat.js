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
            "Requested-By": "webflow-3-4",
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
    let url = new URL(InvokeURL + "shops");
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
          shopKeysContainer.appendChild(opt);
        });
        if (request.status == 401) {
          console.log("Unauthorized");
        }
      }
    };
    request.send();
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
    if (editPermissions.canEditStartDate) {
      data.push({
        op: "replace",
        path: "/startDate",
        value: $("#startDate").val() + "T00:00:01.00Z",
      });
    }
    if (editPermissions.canEditEndDate) {
      data.push({
        op: "replace",
        path: "/endDate",
        value: $("#endDate").val() + "T23:59:59.00Z",
      });
    }
    return data;
  };

  // Zaktualizowana funkcja getPriceList
  function getPriceList() {
    getShops();
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
        const isFtp =
          data.created.by.includes("FTP") || data.modified.by.includes("FTP");
        document.getElementById("pricatFTP").textContent = isFtp;
        const editPermissions = isEditable(data.startDate, data.endDate, isFtp);

        if (!editPermissions.canEditStartDate)
          $("#startDate").prop("disabled", true);
        if (!editPermissions.canEditEndDate)
          $("#endDate").prop("disabled", true);

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
  }

  // Zaktualizowana funkcja makeWebflowFormAjaxEditPriceList
  makeWebflowFormAjaxEditPriceList = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        // Get the text content from the element with ID "pricatFTP"
        const pricatFTPText = document
          .getElementById("pricatFTP")
          .textContent.trim();

        // Convert the text to a boolean
        const isFtp = pricatFTPText.toLowerCase() === "true";
        const editPermissions = isEditable(
          $("#startDate").val(),
          $("#endDate").val(),
          isFtp
        );
        const data = setupFormData(editPermissions);

        $.ajax({
          type: "PATCH",
          url: `${InvokeURL}van/pricats/${priceListId}`,
          contentType: "application/json",
          dataType: "json",
          headers: {
            Authorization: orgToken,
            "Requested-By": "webflow-3-4",
          },
          data: JSON.stringify(data),
          success: function (resultData) {
            if (
              typeof successCallback === "function" &&
              !successCallback(resultData)
            ) {
              form.show();
              displayMessage(
                "Error",
                "Oops. Coś poszło nie tak, spróbuj ponownie."
              );
              return;
            }
            displayMessage("Success", "Cennik został zmieniony.");
            setTimeout(
              () => window.location.replace(window.location.href),
              1000
            );
          },
          error: function (e) {
            if (typeof errorCallback === "function") errorCallback(e);
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

  // Funkcja do tłumaczenia wiadomości błędu, jeśli jest potrzebna
  function translateErrorMessage(message) {
    const errorTranslations = {
      "Timeout exceeded": "Przekroczono limit czasu",
      "Unauthorized access": "Nieautoryzowany dostęp",
      // Dodaj inne tłumaczenia błędów, jeśli są potrzebne
    };
    return errorTranslations[message] || message;
  }

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
        url: `https://fpnu4fps0e.execute-api.us-east-1.amazonaws.com/v0/van/pricats/${priceListId}/products`,
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
          render: function (data) {
            return data && data[0] && data[0].netPrice ? data[0].netPrice : "-";
          },
        },
        {
          // Check promotion in the asks array
          data: "asks",
          title: "Promocja",
          defaultContent: "-",
          render: function (data) {
            if (data && data[0] && data[0].promotion) {
              return `${data[0].promotion.type} (threshold: ${data[0].promotion.threshold})`;
            }
            return "-";
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
    LoadTippy();
  });
});
