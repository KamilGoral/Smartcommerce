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

  const ExclusiveWizardBread = document.getElementById("ExclusiveWizardBread");
  ExclusiveWizardBread.setAttribute("href", "" + window.location.href);
  var formIdCreatePricing = "#wf-form-NewPricingList";
  var formIdCreateSingleExclusive = "#wf-form-SingleExclusiveForm";

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
          "WholesalerSelector-Exclusive-2"
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
      if (validateGTIN(element.gtin)) {
        myValidProducts.products.push({
          gtin: "" + validateGTIN(element.gtin),
          name: element.name,
        });
      } else {
        myInvalidProducts.products.push({
          gtin: "" + element.gtin,
          name: element.name,
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
      " 02. Podejrzyj zaimportowany kody (" + resultData.length + ")";

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

  makeWebflowFormAjax = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action = InvokeURL + "exclusive-products";
        var method = "POST";
        var table = $("#validproducts").DataTable();
        var productsFromTable = table.rows().data().toArray();

        var wholesalerKeyPOST = $("#WholesalerSelector").val();

        if (wholesalerKeyPOST === "null") {
          wholesalerKeyPOST = null;
        }

        if ($("#Never").is(":checked")) {
          var postData = productsFromTable.map(function (el) {
            var o = Object.assign({}, el);
            o.wholesalerKey = wholesalerKeyPOST;
            o.startDate = $("#startDate").val() + "T00:00:01.00Z";
            o.endDate = "infinity";
            return o;
          });
        } else {
          var postData = productsFromTable.map(function (el) {
            var o = Object.assign({}, el);
            o.wholesalerKey = wholesalerKeyPOST;
            o.startDate = $("#startDate").val() + "T00:00:01.00Z";
            o.endDate = $("#endDate").val() + "T23:59:59.00Z";
            return o;
          });
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
          },
          data: JSON.stringify(postData),
          success: function (resultData) {
            console.log(resultData);
            $("#Create-Pricelist-Success").show();
            $("#Create-Pricelist-Success").fadeOut(10000);
            window.setTimeout(function () {
              location.reload();
            }, 3000);
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
            $("#Create-Pricelist-Fail").show();
            $("#Create-Pricelist-Fail").fadeOut(10000);
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxSingle = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action = InvokeURL + "exclusive-products";
        var method = "POST";

        if ($("#NeverSingle").is(":checked")) {
          var postData = [
            {
              gtin: $("#GTINInput").val(),
              name: "name1",
              wholesalerKey: $("#WholesalerSelector-Exclusive-2").val(),
              startDate: $("#startDate-Exclusive-2").val() + "T00:00:01.00Z",
              endDate: "infinity",
            },
          ];
        } else {
          var postData = [
            {
              gtin: $("#GTINInput").val(),
              name: "name1",
              wholesalerKey: $("#WholesalerSelector-Exclusive-2").val(),
              startDate: $("#startDate-Exclusive-2").val() + "T00:00:01.00Z",
              endDate: $("#endDate-Exclusive-2").val() + "T23:59:59.00Z",
            },
          ];
        }
        if ($("#WholesalerSelector-Exclusive-2").val() === "null") {
          for (var i = 0; i < postData.length; i++) {
            delete postData[i].wholesalerKey;
          }
          console.log("delete wholesalerKey");
        }

        console.log(postData);
        var existingBlocksDisplayed = false; // Flag to track if existing blocks are displayed

        $.ajax({
          type: method,
          url: action,
          cors: true,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            if (existingBlocksDisplayed) {
              $("#waitingdots").hide();
            }
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
            form.show();
            $("#Create-Exclusive-Success").show();
            $("#Create-Exclusive-Success").fadeOut(10000);
            $("#GTINInput").val("");
            $("#waitingdots").hide();
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            if (jqXHR.status === 409) {
              getExclusiveProduct(postData, function (msg) {
                form.show();
              });
            } else {
              var msg =
                "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
              var elements =
                document.getElementsByClassName("warningmessagetext");
              for (var i = 0; i < elements.length; i++) {
                elements[i].textContent = msg;
              }
              form.show();
              $("#Create-Pricelist-Fail").show();
              $("#Create-Pricelist-Fail").fadeOut(15000);

              // Set the flag to indicate that existing blocks are displayed
              existingBlocksDisplayed = true;
              return;
            }
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  function getExclusiveProduct(postData, callback) {
    const gtin = postData[0].gtin;
    const url = new URL(
      InvokeURL + "exclusive-products?gtin=" + gtin + "&perPage=1000"
    );

    // Ustaw postData.endDate na datę za 100 lat, jeśli ma wartość "infinity"
    if (postData[0].endDate === "infinity") {
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setFullYear(now.getFullYear() + 100);
      postData[0].endDate = futureDate.toISOString();
    }

    $.ajax({
      type: "GET",
      url: url,
      headers: {
        Authorization: orgToken,
      },
      beforeSend: function () {
        $("#waitingdots").show();
      },
      complete: function () {
        $("#waitingdots").hide();
      },
      success: function (data) {
        // Filter items based on conditions
        console.log(data);
        const tableContainer = document.getElementById("messageText");
        tableContainer.innerHTML = ""; // Clear existing content

        const table = document.createElement("table");
        table.setAttribute("border", "1");

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        // Add table headers
        const headers = ["Dostawca", "Od", "Do"];
        headers.forEach((headerText) => {
          const th = document.createElement("th");
          th.textContent = headerText;
          headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        data.items.forEach((item) => {
          const itemStartDate = new Date(item.startDate);
          const itemEndDate = new Date(item.endDate);
          const postDataStartDate = new Date(postData[0].startDate);
          const postDataEndDate = new Date(postData[0].endDate);

          // Formatuj daty do lokalnego formatu "dd.mm.yyyy"
          const formatDate = (date) => {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            return `${day < 10 ? "0" : ""}${day}.${month < 10 ? "0" : ""
              }${month}.${year}`;
          };

          // Sprawdź czy spełnione są warunki
          if (
            postDataStartDate < itemEndDate &&
            postDataEndDate > itemStartDate
          ) {
            const row = document.createElement("tr");

            const wholesalerCell = document.createElement("td");
            wholesalerCell.textContent = item.wholesalerName;

            const startDateCell = document.createElement("td");
            startDateCell.textContent = formatDate(itemStartDate);

            const endDateCell = document.createElement("td");
            endDateCell.textContent = formatDate(itemEndDate);

            row.appendChild(wholesalerCell);
            row.appendChild(startDateCell);
            row.appendChild(endDateCell);

            tbody.appendChild(row);
          }
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);

        $("#singleexclusivemodal").css("display", "none");
        $("#existingblocks").css("display", "flex");

        callback();
      },
      error: function (jqXHR, exception) {
        console.log(jqXHR);
        console.log(exception);
        if (jqXHR.status === 409) {
          // Handle the 409 error here, e.g., by calling a callback function
          callback("409 Error"); // You can customize this message as needed
        } else {
          var msg =
            "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
          var elements = document.getElementsByClassName("warningmessagetext");
          for (var i = 0; i < elements.length; i++) {
            elements[i].textContent = msg;
          }
          form.show();
          $("#Create-Pricelist-Fail").show();
          $("#Create-Pricelist-Fail").fadeOut(15000);
          return;
        }
      },
    });
  }

  makeWebflowFormAjaxSingle($(formIdCreateSingleExclusive));
  makeWebflowFormAjax($(formIdCreatePricing));
  getWholesalersSh();
  LoadTippy();

  $(document).ready(function () {
    $.fn.dataTable.ext.errMode = () =>
      alert(
        'Plik nie zawiera jednej z kolumn: "Nazwa", "Kod". Sprawdź plik i spróbuj ponownie.'
      );
  });

  $(document).ready(function () {
    $("#csv-file").change(handleFileSelect);
  });
});
