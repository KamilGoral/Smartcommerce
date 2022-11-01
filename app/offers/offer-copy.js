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
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var ClientID = sessionStorage.getItem("OrganizationclientId");
  var OrganizationName = sessionStorage.getItem("OrganizationName");
  var counter = 0;
  var shopKey = new URL(location.href).searchParams.get("shopKey");
  var offerId = new URL(location.href).searchParams.get("offerId");
  var OfferDate = new Date(parseInt(offerId) * 1000).toISOString();
  var OfferDateHuman = OfferDate.split("T");
  var OfferDateHumanTime = OfferDateHuman[1].split("Z");

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

  const ShopBread = document.getElementById("ShopNameBread");
  ShopBread.textContent = shopKey;
  ShopBread.setAttribute(
    "href",
    "https://" + DomainName + "/app/shops/shop?shopKey=" + shopKey
  );

  const OfferDateBread = document.getElementById("OfferDateBread");
  OfferDateBread.textContent = OfferDateHuman[0] + " " + OfferDateHumanTime[0];
  OfferDateBread.setAttribute(
    "href",
    "https://" +
      DomainName +
      "/app/offers/offer?shopKey=" +
      shopKey +
      "&offerId=" +
      offerId
  );

  $.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
    var elem = document.getElementById("DataTablesModule");
    elem.remove();
    document.getElementById("EmptyOfferState").style.display = "flex";
  };

  function getProductDetails(rowData) {
    let url = new URL(
      InvokeURL + "shops/" + shopKey + "/products/" + rowData.gtin
    );
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        const pName = document.getElementById("pName");
        const pEan = document.getElementById("pEan");
        const pInStock = document.getElementById("pInStock");
        const pUnit = document.getElementById("pUnit");
        const pStandardPrice = document.getElementById("pStandardPrice");
        const pRetailPrice = document.getElementById("pRetailPrice");
        const pIndicator = document.getElementById("pIndicator");
        const pBestPrice = document.getElementById("pBestPrice");

        pName.textContent = data.name;
        pEan.textContent = data.gtin;
        if (data.inStock === null) {
          data.inStock = {
            value: 0,
            unit: "pieces",
          };
        }
        pInStock.textContent = data.inStock.value;
        pIndicator.textContent = rowData.rotationIndicator;
        pBestPrice.textContent = rowData.asks[0].netPrice;
        if ((data.inStock.unit = "pieces")) {
          pUnit.textContent = "szt";
        } else {
          pUnit.textContent = data.inStock.unit;
        }
        if (data.standardPrice === null) {
          data.standardPrice = {
            value: 0,
            premium: 0,
          };
        }
        pStandardPrice.textContent = data.standardPrice.value;
        if (data.retailPrice === null) {
          data.retailPrice = 0;
        }
        pRetailPrice.textContent = data.retailPrice;
        if (request.status == 401) {
          console.log("Unauthorized");
        }
      }
    };
    request.send();
  }

  function getProductHistory(rowData) {
    console.log(rowData);
    if (rowData.inStock === null) {
      rowData.inStock = {
        value: 0,
        unit: "pieces",
      };
    }

    function arrayConvert(json) {
      var dataInArrays = {
        date: [],
        highest: [],
        average: [],
        lowest: [],
        retailPrice: [],
        standardPrice: [],
        inStock: [],
        volume: [],
      };

      function checkNested(obj /*, level1, level2, ... levelN*/) {
        var args = Array.prototype.slice.call(arguments, 1);

        for (var i = 0; i < args.length; i++) {
          if (!obj || !obj.hasOwnProperty(args[i])) {
            return false;
          }
          obj = obj[args[i]];
        }
        return true;
      }
      for (let i = 0, l = json.items.length; i < l; i++) {
        if (checkNested(json.items[i].inStock, "value")) {
          dataInArrays.date.push(json.items[i].date.split("T")[0]);
          dataInArrays.highest.push(json.items[i].asks.highest);
          dataInArrays.average.push(json.items[i].asks.average);
          dataInArrays.lowest.push(json.items[i].asks.lowest);
          dataInArrays.retailPrice.push(json.items[i].retailPrice);
          dataInArrays.standardPrice.push(json.items[i].standardPrice.value);
          dataInArrays.inStock.push(json.items[i].inStock.value);
          dataInArrays.volume.push(json.items[i].volume);
        } else {
          dataInArrays.date.push(json.items[i].date.split("T")[0]);
          dataInArrays.highest.push(json.items[i].asks.highest);
          dataInArrays.average.push(json.items[i].asks.average);
          dataInArrays.lowest.push(json.items[i].asks.lowest);
          dataInArrays.retailPrice.push(json.items[i].retailPrice);
          dataInArrays.standardPrice.push(json.items[i].standardPrice);
          dataInArrays.inStock.push(json.items[i].inStock);
          dataInArrays.volume.push(json.items[i].volume);
        }
      }
      return dataInArrays;
    }
    let url = new URL(
      InvokeURL +
        "shops/" +
        shopKey +
        "/products/" +
        rowData.gtin +
        "/history?perPage=365&page=1"
    );
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var jsonek = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        function displayData(x) {
          console.log(x);
          if (isFinite(x) && Number.isInteger(x) && !isNaN(x)) {
            return x;
          }
          return "";
        }
        var dataToChart = arrayConvert(jsonek);
        console.log(dataToChart);
        const pHistory = document.getElementById("pHistory");
        pHistory.textContent = dataToChart.date.length;
        const pHistorySpan = document.getElementById("pHistorySpan");
        pHistorySpan.textContent =
          dataToChart.date.slice(-1)[0] + " - " + dataToChart.date[0];
        const pOfferDate = document.getElementById("pOfferDate");
        pOfferDate.textContent = dataToChart.date[0];
        const pRetailPriceChange =
          document.getElementById("pRetailPriceChange");
        pRetailPriceChange.textContent =
          "(" +
          displayData(
            parseFloat(
              ((dataToChart.retailPrice[0] -
                dataToChart.retailPrice.slice(-1)[0]) /
                dataToChart.retailPrice.slice(-1)[0]) *
                100
            ).toFixed(2)
          ) +
          "%)";
        const pStandardPriceChange = document.getElementById(
          "pStandardPriceChange"
        );
        pStandardPriceChange.textContent =
          "(" +
          displayData(
            parseFloat(
              ((dataToChart.standardPrice[0] -
                dataToChart.standardPrice.slice(-1)[0]) /
                dataToChart.standardPrice.slice(-1)[0]) *
                100
            ).toFixed(2)
          ) +
          "%)";
        const pSales7 = document.getElementById("pSales7");
        pSales7.textContent = displayData(
          dataToChart.volume.slice(0, 7).reduce((a, b) => a + b, 0)
        );
        const pStockDays = document.getElementById("pStockDays");
        pStockDays.textContent = displayData(
          Math.round(
            (rowData.inStock.value /
              dataToChart.volume.slice(0, 7).reduce((a, b) => a + b, 0)) *
              7
          )
        );
        const pSales90 = document.getElementById("pSales90");
        pSales90.textContent = displayData(
          dataToChart.volume.slice(0, 90).reduce((a, b) => a + b, 0)
        );
        "(" +
          displayData(
            parseFloat(
              ((dataToChart.volume.slice(-90).reduce((a, b) => a + b, 0) -
                dataToChart.volume.slice(0, 90).reduce((a, b) => a + b, 0)) /
                dataToChart.volume.slice(0, 90).reduce((a, b) => a + b, 0)) *
                100
            ).toFixed(2)
          ) +
          "%)";

        var scaleMax =
          Math.max.apply(Math, [
            ...dataToChart.highest,
            ...dataToChart.retailPrice,
          ]) * 1.1;
        var scaleMin =
          Math.min.apply(Math, [
            ...dataToChart.lowest,
            ...dataToChart.standardPrice,
          ]) * 0.9;

        var options = {
          series: [
            {
              name: "Najwyzsza",
              type: "line",
              data: dataToChart.highest.reverse(),
            },
            {
              name: "Srednia",
              type: "line",
              data: dataToChart.average.reverse(),
            },
            {
              name: "Najnizsza",
              type: "line",
              data: dataToChart.lowest.reverse(),
            },
            {
              name: "Cena det.",
              type: "line",
              data: dataToChart.retailPrice.reverse(),
            },
            {
              name: "Cena ew.",
              type: "line",
              data: dataToChart.standardPrice.reverse(),
            },
            {
              name: "Sprzedaz",
              type: "bar",
              data: dataToChart.volume.reverse(),
            },
            {
              name: "Stan",
              type: "bar",
              data: dataToChart.inStock.reverse(),
            },
          ],
          chart: {
            id: "productHistoryChart",
            defaultLocale: "pl",
            toolbar: {
              show: true,
              offsetX: 0,
              offsetY: 0,
              tools: {
                download: true,
                selection: true,
                zoom: true,
                zoomin: true,
                zoomout: true,
                pan: true,
                reset: true | '<img src="/static/icons/reset.png" width="20">',
                customIcons: [],
              },
              export: {
                csv: {
                  filename: "PlikCSV",
                  columnDelimiter: ";",
                  headerCategory: "category",
                  headerValue: "value",
                },
                svg: {
                  filename: "Wykres",
                },
                png: {
                  filename: "Wykres",
                },
              },
              autoSelected: "zoom",
            },
            locales: [
              {
                name: "pl",
                options: {
                  months: [
                    "Styczen",
                    "Luty",
                    "Marzec",
                    "Kwiecien",
                    "Maj",
                    "Czerwiec",
                    "Lipiec",
                    "Sierpien",
                    "Wrzesien",
                    "Pazdziernik",
                    "Listopad",
                    "Grudzien",
                  ],
                  shortMonths: [
                    "Sty",
                    "Lut",
                    "Mar",
                    "Kwi",
                    "Maj",
                    "Cze",
                    "Lip",
                    "Sie",
                    "Wrz",
                    "Paz",
                    "Lis",
                    "Gru",
                  ],
                  days: [
                    "Niedziela",
                    "Poniedzialek",
                    "Wtorek",
                    "Sroda",
                    "Czwartek",
                    "Piatek",
                    "Sobota",
                  ],
                  shortDays: ["Nd", "Pon", "Wt", "Sr", "Czw", "Pt", "Sob"],
                  toolbar: {
                    download: "Pobierz SVG",
                    selection: "Zaznacz",
                    selectionZoom: "Powieksz strefe",
                    zoomIn: "Przybliz",
                    zoomOut: "Oddal",
                    pan: "Przesun",
                    reset: "Reset",
                  },
                },
              },
            ],
            height: 350,
            type: "line",
            stacked: false,
          },
          colors: [
            "#FD6A6A",
            "#F9C80E",
            "#4CAF50",
            "#3F51B5",
            "#03A9F4",
            "#92A9BD",
            "#D3DEDC",
          ],
          title: {
            text: "Historia towaru",
            align: "left",
            margin: 10,
            offsetX: 0,
            offsetY: 0,
            floating: false,
            style: {
              fontSize: "14px",
              fontWeight: "bold",
              fontFamily: "Arial",
              color: "#263238",
            },
          },
          stroke: {
            width: [2, 2, 2, 2, 2],
            curve: "smooth",
          },
          plotOptions: {
            bar: {
              columnWidth: "50%",
              colors: {
                backgroundBarOpacity: 0.5,
              },
            },
          },
          markers: {
            size: 0,
          },
          xaxis: {
            type: "category",
            categories: dataToChart.date.reverse(),
            labels: {
              show: true,
              rotate: -45,
              rotateAlways: false,
              hideOverlappingLabels: true,
            },
          },
          yaxis: [
            {
              seriesName: "Najwyzsza",
              max: scaleMax,
              min: scaleMin,
              forceNiceScale: false,
              title: {
                text: "Cena",
              },
            },
            {
              seriesName: "Najwyzsza",
              max: scaleMax,
              min: scaleMin,
              forceNiceScale: false,
              show: false,
            },
            {
              seriesName: "Najwyzsza",
              max: scaleMax,
              min: scaleMin,
              forceNiceScale: false,
              show: false,
            },
            {
              seriesName: "Najwyzsza",
              max: scaleMax,
              min: scaleMin,
              forceNiceScale: false,
              show: false,
            },
            {
              seriesName: "Najwyzsza",
              max: scaleMax,
              min: scaleMin,
              forceNiceScale: false,
              show: false,
            },
            {
              opposite: true,
              seriesName: "Stan",
              max: Math.max.apply(Math, dataToChart.inStock) * 1.1,
              min: Math.min.apply(Math, dataToChart.volume) * 0.9,
              forceNiceScale: true,
              title: {
                text: "Ilosc",
              },
            },
            {
              opposite: true,
              seriesName: "Stan",
              max: Math.max.apply(Math, dataToChart.inStock) * 1.1,
              min: Math.min.apply(Math, dataToChart.volume) * 0.9,
              forceNiceScale: true,
              show: false,
            },
          ],
          tooltip: {
            shared: true,
            intersect: false,
            y: {
              formatter: function (y) {
                if (typeof y !== "null") {
                  return y;
                }
                return "0";
              },
            },
          },
        };
        if (counter == 0) {
          var chart = new ApexCharts(document.getElementById("chart"), options);
          chart.render();
          counter = counter + 1;
        } else {
          console.log("tutaj");
          console.log(options);
          ApexCharts.exec("productHistoryChart", "updateOptions", options);
        }
        if (request.status == 401) {
          console.log("Unauthorized");
        }
      }
    };
    request.send();
  }

  function format(d) {
    const arr = d.asks;
    const lowest = arr.reduce((acc, loc) =>
      acc.netPrice < loc.netPrice ? acc : loc
    );
    var toDisplayHtml = "";

    function myFunction(item) {
      if (item.set === null) {
        item.set = "-";
      }
      if (item.netNetPrice === null) {
        item.netNetPrice = "-";
      }
      var typeOfSource = "";
      if (item.source === "price-list") {
        typeOfSource = "Cennik";
      }
      if (item.source === "online-offer") {
        typeOfSource = "E-hurt";
      }
      if (item.source === "konsola-kupca") {
        typeOfSource = "Pc-Market";
      }

      var tableRowHtml =
        "<tr>" +
        "<td>" +
        item.wholesalerKey +
        "</td>" +
        "<td>" +
        item.netPrice +
        "</td>" +
        "<td>" +
        item.netNetPrice +
        "</td>" +
        "<td>" +
        item.set +
        "</td>" +
        "<td>" +
        typeOfSource +
        "</td>";
      var typeOfPromotion = "";
      if (item.promotion != null) {
        tableRowHtml +=
          "<td>" +
          '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6186eb480941cdf5b47f9d4e_star.svg">' +
          "</td>";
        if (item.promotion.type === "rigid bundle") {
          typeOfPromotion = "Sztywny pakiet";
        }
        if (item.promotion.type === "worth") {
          typeOfPromotion = "Laczna wartosc";
        }
        if (item.promotion.type === "quantity") {
          typeOfPromotion = "Laczna ilosc";
        }
        if (item.promotion.type === "package mix") {
          typeOfPromotion = "Mix opakowan";
        }
        if (item.promotion.type === "quantity bundle") {
          typeOfPromotion = "Pakietowa";
        }
        if (item.promotion.type === "not cumulative quantity") {
          typeOfPromotion = "Okresowa";
        }

        tableRowHtml +=
          "<td>" +
          typeOfPromotion +
          "</td>" +
          "<td>" +
          item.promotion.worthThreshold +
          "</td>" +
          "<td>" +
          item.promotion.quantityThreshold +
          "</td>" +
          "<td>" +
          item.promotion.package +
          "</td>" +
          "</tr>";
      } else {
        tableRowHtml +=
          "<td>" +
          "</td>" +
          "<td>" +
          "</td>" +
          "<td>" +
          "</td>" +
          "<td>" +
          "</td>" +
          "<td>" +
          "</td>" +
          "</tr>";
      }
      toDisplayHtml += tableRowHtml;
    }
    arr.forEach(myFunction);
    return (
      "<table><tr><th>Dostawca</th><th>Cena net</th><th>Cena netnet</th><th>Paczka</th><th>Zrodlo</th><th>Promocja</th><th>Typ</th><th>Prog zlotowkowy</th><th>Prog ilosciowy</th><th>Opakowanie</th></tr>" +
      toDisplayHtml +
      "</table>"
    );
  }

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
      let searchBox = data.search.value;
      if (/^\d+$/.test(searchBox)) {
        QStr = QStr + "&gtin=" + searchBox;
      } else if (searchBox) {
        QStr = QStr + "&name=like:" + searchBox;
      } else {
      }
      var rotIndi = $("#rotationIndicator")
        .map(function () {
          return this.value;
        })
        .get();
      var rotIndiStr = rotIndi.toString();
      if (rotIndiStr) {
        QStr = QStr + "&rotationIndicator=" + rotIndiStr;
      }
      var whKeyIndi = $("#wholesalerKeyIndicator")
        .map(function () {
          return this.value;
        })
        .get();
      var whKeyIndiStr = whKeyIndi.toString();
      if (whKeyIndiStr) {
        QStr = QStr + "&wholesalerKey=" + whKeyIndiStr;
        if ($("#best").is(":checked")) {
          QStr = QStr + ":best";
        }
      }
      var PRmin = parseInt($("#PRmin").val(), 10);
      var PRmax = parseInt($("#PRmax").val(), 10);
      var PEmin = parseInt($("#PEmin").val(), 10);
      var PEmax = parseInt($("#PEmax").val(), 10);
      var iSmin = parseInt($("#iSmin").val(), 10);
      var iSmax = parseInt($("#iSmax").val(), 10);

      function cVal(x) {
        if (typeof x == "number" && !isNaN(x)) {
          return true;
        } else {
          return false;
        }
      }
      if (cVal(PRmin)) {
        QStr = QStr + "&marketPremium=gt:" + PRmin;
      }
      if (cVal(PRmax)) {
        QStr = QStr + "&marketPremium=lt:" + PRmax;
      }
      if (cVal(PEmin)) {
        QStr = QStr + "&standardPremium=gt:" + PEmin;
      }
      if (cVal(PEmax)) {
        QStr = QStr + "&standardPremium=lt:" + PEmax;
      }
      if (cVal(iSmin)) {
        QStr = QStr + "&inStock=gt:" + iSmin;
      }
      if (cVal(iSmax)) {
        QStr = QStr + "&inStock=lt:" + iSmax;
      }

      var whichColumns = "";
      var direction = "desc";

      if (data.order.length == 0) {
        whichColumns = 0;
      } else {
        whichColumns = data.order[0]["column"];
        direction = data.order[0]["dir"];
      }
      console.log(data);

      switch (whichColumns) {
        case 2:
          whichColumns = "name:";
          break;
        case 4:
          whichColumns = "inStock:";
          break;
        case 5:
          whichColumns = "marketPremium:";
          break;
        case 6:
          whichColumns = "standardPremium:";
          break;
        case 7:
          whichColumns = "standardPrice:";
          break;
        case 11:
          whichColumns = "rotationIndicator:";
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
        },
        beforeSend: function () {
          $("#waitingdots").show();
        },
        complete: function () {
          $("#waitingdots").hide();
        },
      });
      $.get(
        InvokeURL + "shops/" + shopKey + "/offers/" + offerId + QStr,
        function (res) {
          callback({
            recordsTotal: res.total,
            recordsFiltered: res.total,
            data: res.items,
          });
        }
      );
    },
    processing: true,
    serverSide: true,
    search: {
      return: true,
    },
    columns: [
      {
        orderable: false,
        class: "details-control",
        data: null,
        defaultContent: "",
      },
      {
        orderable: false,
        class: "details-control2",
        data: null,
        defaultContent:
          "<img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6240120504eebc8de2698a1f_panel.svg' alt='details'></img>",
      },
      {
        orderable: true,
        data: "name",
      },
      {
        orderable: false,
        data: null,
        defaultContent:
          "<input style = 'padding-left: 8px; width: 128px' class='filterinput' autofocus='true' type='number' >",
      },
      {
        orderable: false,
        data: null,
        defaultContent:
          "<input style = 'padding-left: 8px; width: 128px' class='filterinput' autofocus='true' type='number' >",
      },
      {
        orderable: false,
        data: null,
        defaultContent: "8",
      },

      {
        //Tutaj beda promocje jako obrazki renderowane
        orderable: false,
        data: "asks",
        render: function (data) {
          if (data !== null && data.netPrice !== null) {
            var mysorteddata = data.sort(
              (a, b) => (a.netPrice > b.netPrice && 1) || -1
            );
            var size = Object.keys(mysorteddata).length;
            if (size > 0) {
              var bestOffer = data[0];
              if (bestOffer.promotion != null) {
                return '<td><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6186eb480941cdf5b47f9d4e_star.svg"></td>';
              }
              return "-";
            }
            return "-";
          }
          return "-";
        },
      },
      {
        orderable: false,
        data: "asks",
        render: function (data) {
          if (data !== null) {
            var mysorteddata = data.sort(
              (a, b) => (a.netPrice > b.netPrice && 1) || -1
            );
            var size = Object.keys(mysorteddata).length;
            if (size > 0) {
              var bestOffer = data[0];
              return "" + bestOffer.netPrice;
            }
            return "0";
          }
          return "0";
        },
      },
      {
        orderable: false,
        data: "asks",
        defaultContent: "brak",
        render: function (data) {
          if (data !== null && data.netPrice !== null) {
            var mysorteddata = data.sort(
              (a, b) => (a.netPrice > b.netPrice && 1) || -1
            );
            var size = Object.keys(mysorteddata).length;
            var bestPrice = data[0].netPrice;
            var bestWh = [];
            bestWh.push(data[0].wholesalerKey);
            if (size > 1) {
              for (let i in data) {
                if (data[parseInt(i)].netPrice == bestPrice) {
                  bestWh.push(data[parseInt(i)].wholesalerKey);
                }
              }
            }
            let uniqueWh = [...new Set(bestWh)];
            return "" + uniqueWh.toString();
          }
          return "-";
        },
      },
      {
        orderable: true,
        data: "marketPremium",
        render: function (data) {
          if (data !== null) {
            return "" + data;
          }
          if (data === null) {
            return "0";
          }
        },
      },
      {
        orderable: true,
        data: "standardPrice",
        render: function (data) {
          if (
            data !== null &&
            data.hasOwnProperty("premium") &&
            data.premium !== null
          ) {
            if (data.premium >= 0) {
              return '<p class="positive">' + data.premium + "</p>";
            } else {
              return '<p class="negative">' + data.premium + "</p>";
            }
          } else {
            return "-";
          }
        },
      },
      {
        orderable: false,
        data: null,
        defaultContent: "TYMBARK",
      },
      {
        orderable: false,
        data: "gtin",
      },
      {
        orderable: true,
        data: "inStock",
        render: function (data) {
          if (data !== null) {
            return "" + data.value;
          }
          if (data === null) {
            return "0";
          }
        },
      },

      {
        orderable: true,
        data: "standardPrice",
        render: function (data) {
          if (data !== null) {
            return "" + data.value.toFixed(2);
          }
          if (data === null) {
            return "0";
          }
        },
      },

      {
        orderable: true,
        data: "rotationIndicator",
        defaultContent: "brak",
        render: function (data) {
          if (data == "AX") {
            return '<p class="super">' + data + "</p>";
          }
          if (data == "AY" || data == "BX") {
            return '<p class="positive">' + data + "</p>";
          }
          if (data == "AZ" || data == "CX" || data == "BY") {
            return '<p class="medium">' + data + "</p>";
          }
          if (data == "BZ" || data == "CY") {
            return '<p class="negative">' + data + "</p>";
          }
          if (data == "CZ") {
            return '<p class="bad">' + data + "</p>";
          }
          if (data == null) {
            return '<p class="noneexisting">' + "-" + "</p>";
          }
        },
      },
    ],
    initComplete: function (settings, json) {
      var api = this.api();
      var textBox = $("#table_id_filter label input");
      $(".filterinput").on("change", function () {
        table.draw();
      });
      textBox.unbind();
      textBox.bind("keyup input", function (e) {
        if (e.keyCode == 13) {
          api.search(this.value).draw();
        }
      });
    },
  });
  $("#table_id tbody").on("click", "td.details-control", function () {
    var tr = $(this).closest("tr");
    var row = table.row(tr);
    if (row.child.isShown()) {
      row.child.hide();
      tr.removeClass("shown");
    } else {
      row.child(format(row.data())).show();
      tr.addClass("shown");
    }
  });
  $("#table_id tbody").on("click", "td.details-control2", function () {
    var tr = $(this).closest("tr");
    var rowData = table.row(tr).data();
    console.log(rowData);
    $("#ProductCard").css("display", "flex");
    getProductDetails(rowData);
    getProductHistory(rowData);
  });
  $(document).ready(function ($) {
    $("tableSelector").DataTable({
      dom: '<"pull-left"f><"pull-right"l>tip',
    });
    $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
  });

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
        const wholesalerContainer = document.getElementById(
          "wholesalerKeyIndicator"
        );
        toParse.forEach((wholesaler) => {
          if (wholesaler.enabled) {
            var opt = document.createElement("option");
            opt.value = wholesaler.wholesalerKey;
            opt.innerHTML = wholesaler.wholesalerKey;
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

  getWholesalersSh();
});

setTimeout(function () {
  $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
  $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
}, 4000);