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

  var orgToken = getCookie("sprytnyToken");
  var DomainName = getCookie("sprytnyDomainName");
  var ClientID = sessionStorage.getItem("OrganizationclientId");
  var InvokeURL = getCookie("sprytnyInvokeURL");

  var OrganizationName = sessionStorage.getItem("OrganizationName");
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
    "User is not an administrator of this tenant": "Użytkownik nie jest administatorem tej organizacji",
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
    console.log(papa.data);
    var myInvalidProducts = {
      products: [],
    };
    var myValidProducts = {
      products: [],
    };

    function validateGTIN(barcode) {
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
            return false;
          } // not a valid upc/GTIN

          var arr = barcode
            .substring(0, barcode.length - 1)
            .split("")
            .reverse();
          var oddTotal = 0,
            evenTotal = 0;

          for (var i = 0; i < arr.length; i++) {
            if (isNaN(arr[i])) {
              return false;
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
            return barcode;
          } else {
            return false;
          }
        }
      } else {
        return false;
      }
    }

    function validateProduct(element) {
      if (
        validateGTIN(element.gtin) &&
        typeof element.price == "number" &&
        !isNaN(element.price) &&
        element.price > 0
      ) {
        myValidProducts.products.push({
          gtin: "" + validateGTIN(element.gtin),
          name: element.name,
          price: element.price,
        });
      } else {
        myInvalidProducts.products.push({
          gtin: "" + element.gtin,
          name: element.name,
          price: element.price,
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
      " 02. Podejrzyj zaimportowany cennik (" +
      resultData.length +
      ")";

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
    let url = new URL(InvokeURL + "shops");
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
            window.setTimeout(function () {
              location.reload();
            }, 3000);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(jqXHR);
            console.log(exception);
            var msg =
              "Błąd.\n" + translateErrorMessage(JSON.parse(jqXHR.responseText).message);
            var elements = document.getElementsByClassName("warningmessagetext");
            for (var i = 0; i < elements.length; i++) {
              elements[i].textContent = msg;
            }
            form.show();
            $("#Create-Pricelist-Fail").show();
            $("#Create-Pricelist-Fail").fadeOut(5000);
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
