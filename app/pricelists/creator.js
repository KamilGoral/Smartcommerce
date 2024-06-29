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
            welcomeMessage.textContent =
              "Witaj, " + firstNameUser + " " + lastNameUser + "!";
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
  var formIdCreatePricing = "#wf-form-NewPricingList";

  const translations = {
    "User is not an administrator of this tenant":
      "Użytkownik nie jest administatorem tej organizacji",
    "Error message 2": "Komunikat błędu 2",
    // Dodaj więcej tłumaczeń, jeśli są potrzebne
  };

  function translateErrorMessage(message) {
    // Sprawdź, czy istnieje tłumaczenie dla danego komunikatu
    if (translations[message]) {
      return translations[message];
    } else {
      return message; // Zwróć oryginalny komunikat, jeśli nie ma tłumaczenia
    }
  }

  function getWholesalersSh() {
    let url = new URL(InvokeURL + "wholesalers" + "?enabled=true&perPage=1000");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
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

  function printPapaObject(papa) {
    var myproducts = papa.data;
    var myInvalidProducts = {
      products: [],
    };
    var myValidProducts = {
      products: [],
    };

    function validateGTIN(barcode) {
      if (barcode == null || typeof barcode !== "number" || isNaN(barcode)) {
        return {
          valid: false,
          reason: "Niepoprawny kod EAN",
        };
      }
      if (typeof barcode == "number") {
        var x = barcode.toString().length;
        if (x >= 5 && x <= 13) {
          if (x <= 8) {
            var zeroesToadd = 8 - x;
            barcode = "0".repeat(zeroesToadd) + barcode;
          } else {
            var zeroesToadd = 13 - x;
            barcode = "0".repeat(zeroesToadd) + barcode;
          }

          var lastDigit = Number(barcode.substring(barcode.length - 1));
          var checkSum = 0;
          if (isNaN(lastDigit)) {
            return {
              valid: false,
              reason: "Nieprawidłowa liczba kontrolna kodu EAN",
            };
          } // not a valid upc/GTIN

          var arr = barcode
            .substring(0, barcode.length - 1)
            .split("")
            .reverse();
          var oddTotal = 0,
            evenTotal = 0;

          for (var i = 0; i < arr.length; i++) {
            if (isNaN(arr[i])) {
              return { valid: false, reason: "Brak kodu EAN" };
            } // can't be a valid upc/GTIN we're checking for

            if (i % 2 == 0) {
              oddTotal += Number(arr[i]) * 3;
            } else {
              evenTotal += Number(arr[i]);
            }
          }
          checkSum = (10 - ((evenTotal + oddTotal) % 10)) % 10;

          // true if they are equal
          if (checkSum == lastDigit) {
            return { valid: true, barcode: barcode, reason: "" };
          } else {
            return { valid: false, reason: "Nieprawidłowy kod EAN" };
          }
        } else {
          return { valid: false, reason: "Nieprawidłowa długość kodu EAN" };
        }
      } else {
        return { valid: false, reason: "Kod EAN nie jest liczbą" };
      }
    }

    function validateProduct(element) {
      const gtinValidation = validateGTIN(element.gtin);
      if (
        gtinValidation.valid &&
        typeof element.price == "number" &&
        !isNaN(element.price) &&
        element.price > 0
      ) {
        myValidProducts.products.push({
          gtin: "" + gtinValidation.barcode,
          name: element.name,
          price: element.price,
        });
      } else {
        let invalidReason = gtinValidation.reason;
        if (
          typeof element.price !== "number" ||
          isNaN(element.price) ||
          element.price <= 0
        ) {
          invalidReason = "Nieprawidłowa cena produktu";
        }
        myInvalidProducts.products.push({
          gtin: "" + element.gtin,
          name: element.name,
          price: element.price,
          reason: invalidReason,
        });
      }
    }

    myproducts.forEach((element) => {
      validateProduct(element);
    });

    $("#validTableContainer").show();
    $("#invalidTableContainer").show();
    $("#CreatePriceListContainer").css("display", "block");

    const inValidRows = document.getElementById("inValidRows");
    inValidRows.textContent =
      "03. Nie udało się zaimportotwać (" +
      myInvalidProducts.products.length +
      ")";
    const validRows = document.getElementById("validRows");

    var preDuplicates = myValidProducts.products;

    const filteredArr = preDuplicates.reduce((acc, current) => {
      const x = acc.find((item) => item.gtin === current.gtin);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    var filteredArray = preDuplicates.filter(
      (value) => !filteredArr.includes(value)
    );
    var old = new Set(filteredArray.map(({ gtin }) => gtin));
    var resultData = filteredArr.filter(({ gtin }) => !old.has(gtin));

    validRows.textContent =
      " 02. Podejrzyj zaimportowany cennik (" + resultData.length + ")";

    $(document).ready(function () {
      var tables = $.fn.dataTable.fnTables(true);

      $(tables).each(function () {
        $(this).dataTable().fnDestroy();
      });

      var validproductsTable = $("#validproducts").DataTable({
        pagingType: "full_numbers",
        order: [],
        dom: '<"top"f>rt<"bottom"lip>',
        scrollY: "60vh",
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
        data: resultData,
        paging: true,
        autoWidth: true,
        columns: [
          {
            data: "gtin",
          },
          {
            data: "name",
          },
          {
            data: "price",
          },
        ],
      });
      var invalidproductsTable = $("#invalidproducts").DataTable({
        pagingType: "full_numbers",
        order: [],
        dom: '<"top"f>rt<"bottom"lip>',
        scrollY: "60vh",
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
        data: myInvalidProducts.products,
        paging: true,
        autoWidth: true,
        columns: [
          {
            data: "gtin",
          },
          {
            data: "name",
          },
          {
            data: "price",
          },
          {
            data: "reason",
          },
        ],
      });
    });
  }

  function handleFileSelect(evt) {
    var file = evt.target.files[0];

    if (file) {
      Papa.parse(file, {
        quotes: true,
        header: true,
        encoding: "iso-8859-2",
        transform: function (h, i) {
          switch (i) {
            case "price":
              var value = parseFloat(h.replace(",", "."));
              return value;
            default:
              return h;
          }
        },
        transformHeader: function (h, i) {
          switch (h.trim().toLowerCase()) {
            case "ean":
              return "gtin";
            case "kod":
              return "gtin";
            case "kod ean":
              return "gtin";
            case "nazwa":
              return "name";
            case "nazwa_indeksu":
              return "name";
            case "cena":
              return "price";
            case "cena po rabacie":
              return "price";
            default:
              console.log("Sorry");
          }
        },
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function (results) {
          printPapaObject(results);
        },
      });
    } else {
      alert("Dozwolony format pliku to .csv");
    }
  }

  function getShops() {
    let url = new URL(InvokeURL + "shops?perPage=1000");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
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
      var form = $(this);
      form.on("submit", function (event) {
        var action = InvokeURL + "price-lists";
        var method = "POST";
        var table = $("#validproducts").DataTable();
        var productsFromTable = table.rows().data().toArray();

        var productsToAdd = {
          products: productsFromTable,
        };

        var dataRequest = {
          wholesalerKey: $("#WholesalerSelector").val(),
          startDate: $("#startDate").val() + "T00:00:01.00Z",
          endDate: $("#endDate").val() + "T23:59:59.00Z",
          shopKeys: $("#shopKeys").val(),
        };

        if (!dataRequest.shopKeys || dataRequest.shopKeys.length === 0) {
          var errorMsg = "Błąd: Lista Sklepów jest pusta.";
          console.log(errorMsg);
          var elements = document.getElementsByClassName("warningmessagetext");
          for (var i = 0; i < elements.length; i++) {
            elements[i].textContent = errorMsg;
          }
          $("#Create-Pricelist-Fail").show();
          $("#Create-Pricelist-Fail").fadeOut(5000);
          return;
        }

        let postData = Object.assign(dataRequest, productsToAdd);
        //

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
          data: JSON.stringify(postData),
          success: function (resultData) {
            console.log(resultData);
            $("#Create-Pricelist-Success").show();
            $("#Create-Pricelist-Success").fadeOut(4000);
            var pricelistUrl =
              "https://" +
              DomainName +
              "/app/pricelists/pricelist?uuid=" +
              resultData.uuid;
            // Redirect after a short delay to allow the success message to be shown
            window.setTimeout(function () {
              window.location.href = pricelistUrl;
            }, 1000); // Adjust the timeout duration as needed
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(jqXHR);
            console.log(exception);
            var msg =
              "Błąd.\n" +
              translateErrorMessage(JSON.parse(jqXHR.responseText).message);
            var elements =
              document.getElementsByClassName("warningmessagetext");
            for (var i = 0; i < elements.length; i++) {
              elements[i].textContent = msg;
            }
            form.show();
            $("#Create-Pricelist-Fail").show();
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjax($(formIdCreatePricing));
  getShops();
  getWholesalersSh();

  $(document).ready(function () {
    $.fn.dataTable.ext.errMode = () =>
      alert(
        'Plik nie zawiera jednej z kolumn: "Nazwa", "Kod", "Cena". Sprawdź plik i spróbuj ponownie.'
      );
  });

  $(document).ready(function () {
    $("#csv-file").change(handleFileSelect);
  });
});
