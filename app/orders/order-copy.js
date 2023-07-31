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
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var DomainName = getCookie("sprytnyDomainName");
  var shopKey = new URL(location.href).searchParams.get("shopKey");
  var orderId = new URL(location.href).searchParams.get("orderId");
  var ClientID = sessionStorage.getItem("OrganizationclientId");
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

  const ShopBread = document.getElementById("ShopKeyBread");
  ShopBread.textContent = "Testowy";
  ShopBread.setAttribute(
    "href",
    "https://" + DomainName + "/app/shops/shop?shopKey=" + shopKey
  );

  var OrderIdBread = new URL(location.href).searchParams.get("orderId");
  const IdBread = document.getElementById("OrderIdBread");
  IdBread.setAttribute(
    "href",
    "https://" +
    DomainName +
    "/app/orders/order?orderId=" +
    OrderIdBread +
    "&shopKey=" +
    shopKey
  );

  async function CreateOrder() {

    const tableId = '#spl_table';

    if ($.fn.dataTable.isDataTable(tableId)) {
      // Usuń wszystkie rekordy z tabeli podzielonych produktów
      const tableToClear = $('#spl_table').DataTable();
      tableToClear.clear().draw();
      $("#spl_table_wrapper").hide();

      // Wymaż wartwę blur
      removeBlurOverlay();

    } else {
      // Tabela nie została zainicjalizowana jako DataTable
    }

    await makeChangesToOrder();
    var method = "GET";
    var e = document.getElementById("offerId");
    var offerId = e.value;

    var searchIDs = $("#table_splited_wh input:checkbox:checked")
      .map(function () {
        return $(this).val();
      })
      .toArray();
    var deletetedIds = $("#DeletedContainer input:checkbox:checked")
      .map(function () {
        return $(this).val();
      })
      .toArray();
    var deletetedIdstoDelete = $(
      "#DeletedContainer input:checkbox:not(:checked)"
    )
      .map(function () {
        return $(this).val();
      })
      .toArray();

    const DeletedContainer = document.getElementById("DeletedContainer");
    deletetedIds.forEach((wholesaler) => {
      const objToDelete = document.getElementById("d" + wholesaler);
      objToDelete.remove();
    });

    searchIDs.forEach((wholesaler) => {
      $("#DeletedContainer").append(
        '<div class="deletedwh" id="d' +
        wholesaler +
        '">' +
        wholesaler +
        '<input type="checkbox" class="theClass" id="' +
        wholesaler +
        '" value="' +
        wholesaler +
        '" name="' +
        wholesaler +
        '"><label class="mylabel" for="' +
        wholesaler +
        '"></label></div>'
      );
    });
    var UrlParameters = "";
    const exludedWholesalersAlready = deletetedIdstoDelete.join("&exclude=");
    const exludedWholesalers = searchIDs.join("&exclude=");

    if (offerId.length > 0) {
      UrlParameters = "offerId=" + offerId;
    } else {
      UrlParameters = "offerId=latest";
    }

    if (exludedWholesalersAlready.length > 0) {
      UrlParameters = UrlParameters + "&exclude=" + exludedWholesalersAlready;
    }
    if (exludedWholesalers.length > 0) {
      UrlParameters = UrlParameters + "&exclude=" + exludedWholesalers;
    }

    console.log(UrlParameters);

    var action = "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64c754aa424ff3992f4d24c9_getsplit_updated.txt"

    if (exludedWholesalers !== null) {

    var action = "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64c754aad62d7bae62416c5d_getsplitexcluded_updated.txt"

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
      processData: false,
      success: function (resultData) {
        if (typeof successCallback === "function") {
          result = successCallback(resultData);
          if (!result) {
            return;
          }
        }
        $("#table-content").show();
        var data = resultData;
        const totalValue = document.getElementById("totalValue");
        totalValue.textContent = data.netValues.total + " zł";
        const maxValue = document.getElementById("maxValue");
        maxValue.textContent = data.netValues.max + " zł";
        const avgValue = document.getElementById("avgValue");
        avgValue.textContent = data.netValues.avg + " zł";
        const savings = document.getElementById("savings");
        var numb = data.netValues.avg - data.netValues.total;
        savings.textContent = numb.toFixed(2) + " zł";
        var toParse = data.items;
        toParse.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
        $("#details").show();
        $(".target-tab-link").triggerHandler("click");
        $("#splitedwhcontainer").show();
        var table = $("#table_splited_wh").DataTable({
          pagingType: "full_numbers",
          pageLength: 10,
          destroy: true,
          order: [[3, "desc"]],
          dom: '<"top">rt<"bottom"lip>',
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
          data: data.items,
          search: {
            return: true,
          },
          columns: [
            {
              orderable: false,
              data: null,
              defaultContent:
                '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61ae41350933c525ec8ea03a_office-building.svg" loading="lazy" fileformat="text/plain">',
            },
            {
              orderable: true,
              data: "wholesalerName",
              render: function (data) {
                if (data === "unassigned") {
                  return "Nieprzydzielone";
                } else {
                  return data;
                }
              },
            },
            {
              orderable: true,
              data: null,
              render: function (data) {
                if (data.logisticMinimum === null) {
                  return "-";
                } else {
                  var toGo = (data.logisticMinimum - data.value).toFixed(2);
                  if (toGo > 0) {
                    return data.logisticMinimum + " (" + toGo + ")";
                  }
                  return data.logisticMinimum;
                }
              },
            },
            {
              orderable: true,
              data: "netValue",
            },
            {
              orderable: true,
              data: "products",
              render: function (data) {
                if (data.bestMatch === null) {
                  return "-";
                } else {
                  return data.bestMatch;
                }
              }
            },
            {
              orderable: true,
              data: "products",
              render: function (data) {
                if (data.exclusive === null) {
                  return "-";
                } else {
                  return data.exclusive;
                }
              }
            },
            {
              orderable: true,
              data: "products",
              render: function (data) {
                if (data.exclusive === null) {
                  return "-";
                } else {
                  return data.order;
                }
              }
            },
            {
              orderable: false,
              data: "wholesalerKey",
              render: function (data) {
                if (data === "agra") {
                  return '<div class="div-block-20"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da5308ca3b98f7f653_pc-FILE.svg" loading="lazy" fileformat="text/plain" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6234df3f287c53243b955790_spreadsheet.svg" loading="lazy" fileformat="text/csv" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg" loading="lazy" fileformat="application/pdf" class="filedownloadicon"></div>';
                } else if (data === "mirex") {
                  return '<div class="div-block-20"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da5308ca3b98f7f653_pc-FILE.svg" loading="lazy" fileformat="text/plain" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg" loading="lazy" fileformat="application/pdf" class="filedownloadicon"></div>';
                }
                else {
                  return '<div class="div-block-20"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da5308ca3b98f7f653_pc-FILE.svg" loading="lazy" fileformat="text/plain" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da6407030dde16ffb9_kc-FILE.svg" loading="lazy" fileformat="text/csv" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg" loading="lazy" fileformat="application/pdf" class="filedownloadicon"></div>';
                }
              },
            },
            {
              orderable: false,
              data: "wholesalerKey",
              render: function (data) {
                if (data === "unassigned") {
                  return "";
                }
                return (
                  '<input type="checkbox" class="theClass" id="' +
                  data +
                  '" value="' +
                  data +
                  '" /><label class="mylabel" for="' +
                  data +
                  '"></label>'
                );
              },
            },
          ],
          rowCallback: function (row, data) {
            if (data.logisticMinimum > data.value) {
              $("td", row).css("background-color", "#FFFAE6");
            }
          },
          initComplete: function (settings, json) {

            var totalEclusiveProducts = 0;
            var totalOrderedProducts = 0;
            var table = $('#table_splited_wh').DataTable();

            table.rows().every(function () {
              var rowData = this.data();
              var productQuantity = parseInt(rowData["products"]["exclusive"]);
              var productQuantity2 = parseInt(rowData["products"]["order"]);
              totalEclusiveProducts += productQuantity;
              totalOrderedProducts += productQuantity2;
            });

            if (totalEclusiveProducts === 0) {
              // Hide Office column
              table.column(5).visible(false); // Produkty na wyłączność
            }
            if (totalOrderedProducts === 0) {
              // Hide Office column
              table.column(6).visible(false); // Produkty na wyłączność
            }

            var textBox = $("#table_splited_wh filter label input");
            textBox.unbind();
            textBox.bind("keyup input", function (e) {
              if (e.keyCode == 13) {
                api.search(this.value).draw();
              }
            });
          },
        });
        return false;
      },
    });
  }

  function getOffers() {
    let url = new URL(
      "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64c754ab409259bc499faef9_getoffers_updated.txt"
    );
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      if (request.status >= 200 && request.status < 400) {
        const OffersSelector = document.getElementById("offerId");
        toParse.forEach((offer) => {
          var opt = document.createElement("option");
          opt.value = offer.offerId;

          var offset = new Date().getTimezoneOffset();
          var localeTime = new Date(
            Date.parse(offer.createDate) - offset * 60 * 1000
          ).toISOString();
          var creationDate = localeTime.split("T");
          var creationTime = creationDate[1].split("Z");
          opt.textContent =
            creationDate[0] + " " + creationTime[0].slice(0, -4);
          OffersSelector.appendChild(opt);
        });
        if (request.status == 401) {
          console.log("Unauthorized");
        }
      }
    };
    request.send();
  }

  function getWholesalersSh() {
    let url = new URL("https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64c754abf63c85ab7617dd3f_getwholesalers_updated.txt");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(this.response);
        var toParse = data.items;
        sessionStorage.setItem("wholesalersData", JSON.stringify(toParse));
      }

      if (request.status == 401) {
        console.log("Unauthorized");
      }
    }
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
      if (item.source === "PC-Market") {
        typeOfSource = "PC-Market";
      }
      if (item.originated === null) {
        item.originated = "-";
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
        "</td>" +
        "<td>" +
        item.originated +
        "</td>";
      var typeOfPromotion = "";
      var showRelated = ""
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
        if (item.promotion.relatedGtins.length > 0) {
          showRelated = '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/624017e4560dba7a9f97ae97_shortcut.svg" loading="lazy" class ="showdata" data-content="' + item.promotion.relatedGtins + '" alt="">'
        } else {
          showRelated = "-";
        }

        tableRowHtml +=
          "<td>" +
          typeOfPromotion +
          "</td>" +
          "<td>" +
          item.promotion.threshold +
          "</td>" +
          "<td>" +
          item.promotion.maxQuantity +
          "</td>" +
          "<td>" +
          item.promotion.package +
          "</td>" +
          "<td>" +
          showRelated +
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
          "<td>" +
          "</td>" +
          "</tr>";
      }
      toDisplayHtml += tableRowHtml;
    }
    arr.forEach(myFunction);
    return (
      "<table><tr><th>Dostawca</th><th>Cena net</th><th>Cena netnet</th><th>Paczka</th><th>Zrodlo</th><th>Pochodzenie</th><th>Promocja</th><th>Typ</th><th>Próg</th><th>Max</th><th>Opakowanie</th><th>Powiązane</th></tr>" +
      toDisplayHtml +
      "</table>"
    );
  }

  function generateWholesalerSelect(selectedWholesalerKey, jsonData, isDisabled) {
    const wholesalersData = JSON.parse(sessionStorage.getItem("wholesalersData"));
    if (wholesalersData && wholesalersData.length > 0) {
      let selectHTML = "";
      if (isDisabled == 1) {
        selectHTML = '<select style="width: 120px;" class="wholesalerSelect" disabled>';
      } else {
        selectHTML = '<select style="width: 120px;" class="wholesalerSelect">';
      }

      // Sortowanie dostawców z JSON na podstawie klucza 'netPrice', jeśli jsonData nie jest równy null
      if (jsonData !== null) {
        jsonData.sort((a, b) => a.netPrice - b.netPrice);

        // Usuwanie powtarzających się pozycji dostawców z jsonData
        jsonData = jsonData.filter((item, index, self) => {
          return index === self.findIndex((t) => (
            t.wholesalerKey === item.wholesalerKey
          ));
        });

        // Dodawanie dostawców z JSON na górze listy wyboru
        jsonData.forEach((item) => {
          const wholesaler = wholesalersData.find(wholesaler => wholesaler.wholesalerKey === item.wholesalerKey);
          const wholesalerName = wholesaler ? wholesaler.name : item.wholesalerKey;
          selectHTML += `<option value="${item.wholesalerKey}"${item.wholesalerKey === selectedWholesalerKey ? ' selected style="font-weight: bold"' : ''}>${wholesalerName}</option>`;
        });
      } else {
        // Dodawanie nieprzydzielone górze listy wyboru
        selectHTML += `<option value="unassigned" selected style="font-weight: bold">Nieprzydzielony</option>`;
      }

      // Dodawanie pozostałych dostawców z sessionStorage do listy wyboru
      wholesalersData.forEach((wholesaler) => {
        if (!jsonData || !jsonData.some(item => item.wholesalerKey === wholesaler.wholesalerKey)) {
          selectHTML += `<option value="${wholesaler.wholesalerKey}"${wholesaler.wholesalerKey === selectedWholesalerKey ? ' selected style="font-weight: bold"' : ''} style = "background-color: #EBECF0;">${wholesaler.name}</option>`;
        }
      });

      selectHTML += "<option value='remove' style='font-weight: bold'>Anuluj wybór</option></select>";
      return selectHTML;
    } else {
      return "Brak dostawców do wyboru.";
    }
  }

  function generujKodHTML(derived) {
    if (!Array.isArray(derived)) {
      return derived; // Jeśli "derived" nie jest listą, zwróć wartość
    }
  
    // Połącz elementy listy za pomocą przecinka i znaku nowej linii
    const polaczonyWynik = derived.join(",\n");
  
    return polaczonyWynik; // Zwróć wynik jako ciąg znaków
    
  }
    function GetSplittedProducts() {

    $("#spl_table_wrapper").show();
    $.ajax({
      type: "GET",
      url: "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64c754ab569656c515eeae36_getdetails_updated.txt",
      cors: true,
      contentType: "application/json",
      dataType: "json",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: orgToken,
      },
      beforeSend: function () {
        $("#waitingdots").show();
      },
      complete: function () {
        $("#waitingdots").hide();
      },
      success: function (resultProducts) {
        if (typeof successCallback === "function") {
          result = successCallback(resultProducts);
          if (!result) {
            return;
          }
        }
        var products = resultProducts;
        $("#splitted-products").show();
        var table = $("#spl_table").DataTable({
          order: [
            [10, "desc"]
          ], // This is column that contain values "Obniz Cene"
          pagingType: "full_numbers",
          destroy: true,
          dom: '<"top"f>rt<"bottom"lip>',
          scrollY: "60vh",
          scrollCollapse: true,
          pageLength: 25,
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
          data: products.items,
          search: {
            return: true,
          },
          columns: [{
            data: null,
            defaultContent: '',
            createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
              if (rowData.asks && rowData.asks.length > 0) {
                $(cell).addClass('details-control');
              }
            },
            orderable: false
          },
          {
            orderable: true,
            data: "name",
          },
          {
            orderable: true,
            data: "gtin",
          },
          {
            orderable: true,
            data: "derived",
            render: function (data) {
              if (data !== null) {
                // Przetwórz dane przy użyciu funkcji generującej kod HTML
                const kodHTML = generujKodHTML(data);
                return kodHTML;
              }
              if (data === null) {
                return "-";
              }
            },
          },          
          {
            orderable: false,
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
            orderable: false,
            data: null,
            render: function (data) {
              if (data.gtin.indexOf('?') >= 0) {
                return (
                  '<input type="number" style="max-width: 80px" onkeypress="return event.charCode >= 48" min="0" value="' +
                  data.quantity +
                  '" disabled>'

                );
              }
              else {
                return (
                  '<input type="number" style="max-width: 80px" onkeypress="return event.charCode >= 48" min="0" value="' +
                  data.quantity +
                  '" >'

                );
              }
            },
          },
          {
            orderable: false,
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
            data: "netPrice",
            render: function (data) {
              if (data !== null) {
                return "" + data.toFixed(2);
              }
              if (data === null) {
                return "0";
              }
            },
          },
          {
            orderable: true,
            data: null,
            render: function (data) {
              if (data.gtin.indexOf('?') >= 0) {
                return ('<p style="font-size: 0;display: none">' + data.wholesalerKey + '</p>' + generateWholesalerSelect(data.wholesalerKey, data.asks, 1));
              }
              else {
                return ('<p style="font-size: 0;display: none">' + data.wholesalerKey + '</p>' + generateWholesalerSelect(data.wholesalerKey, data.asks, 0));
              }
            },
          },
          {
            orderable: true,
            data: "assignmentSource",
            render: function (data) {
              if (data !== null) {
                if (data === "bestMatch") {
                  return (
                    '<div style="display: flex;"><img loading="lazy" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d6bd8990da458a9f9cd78_smart-basket.svg" alt="" class="small-icon nomargins" style="margin: auto;"><p style="font-size: 0;">1</p></div>'
                  );
                } else if (data === "exclusive") {
                  return (
                    '<div style="display: flex;"><img loading="lazy" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d4663e22be5693754eea7_lock-filled.svg" alt="" class="small-icon nomargins" style="margin: auto;"><p style="font-size: 0;">2</p></div>'
                  );
                } else {
                  return (
                    '<div style="display: flex;"><img loading="lazy" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d463e9ce9fb54c6dfda04_person-circle.svg" alt="" class="small-icon nomargins" style="margin: auto;"><p style="font-size: 0;">3</p></div>'
                  );
                }
              } else {
                return '<p class="neutral">-</p>';
              }
            },
          },
          {
            orderable: true,
            data: null,
            width: "72px",
            // class: "details-invisible",
            render: function (data) {
              if (data.hasOwnProperty("asks") && data.asks !== null) {
                let currentPrice = 0
                let lowestPrice = 0
                if (data.netNetPrice !== null) {
                  currentPrice = data.netNetPrice;
                  lowestPrice = data.asks.length ?
                    Math.min(...data.asks.map((a) => a.netNetPrice).filter((price) => price !== null)) :
                    null;
                } else {
                  currentPrice = data.netPrice;
                  lowestPrice = data.asks.length ?
                    Math.min(...data.asks.map((a) => a.netPrice).filter((price) => price !== null)) :
                    null;
                }

                if (currentPrice > lowestPrice) {
                  var diffPercent = (
                    ((currentPrice - lowestPrice) / currentPrice) *
                    100
                  ).toFixed(2);
                  return (
                    "<td>" +
                    diffPercent +
                    '%<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/63beccb22f025b6529660dda_lower%20the%20price.svg" style="margin-left: 4px;">' +
                    "</td>"
                  );
                } else {
                  return (
                    '<td>0.00%<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/63beccb22e2647577ef4fd95_lowest%20price.svg" style="margin-left: 4px;">' +
                    "</td>"
                  );
                }
              } else {
                return (
                  '<td>0.00%<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/63beccb22e2647577ef4fd95_lowest%20price.svg" style="margin-left: 4px;">' +
                  "</td>"
                );
              }
            },
          },
          {
            orderable: true,
            data: "standardPrice",
            render: function (data) {
              if (
                data !== null &&
                data.hasOwnProperty("wholesalerPremium") &&
                data.wholesalerPremium !== null
              ) {
                if (data.wholesalerPremium >= 0) {
                  return (
                    '<p class="positive">' + data.wholesalerPremium + "</p>"
                  );
                } else {
                  return (
                    '<p class="negative">' + data.wholesalerPremium + "</p>"
                  );
                }
              } else {
                return '<p class="positive">0</p>';
              }
            },
          },
          {
            orderable: false,
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
          {
            orderable: false,
            class: "details-control4",
            width: "20px",
            data: null,
            defaultContent:
              "<img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg' alt='details'></img>",
          },
          {
            orderable: false,
            class: "details-control3",
            width: "20px",
            data: null,
            defaultContent:
              "<img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64a0fe50a9833a36d21f1669_edit.svg' alt='details'></img>",
          }
          ],
          rowCallback: function (row, data) {
            if (data.hasOwnProperty("asks") && data.asks !== null) {
              let currentPrice = 0
              let lowestPrice = 0
              if (data.netNetPrice !== null) {
                currentPrice = data.netNetPrice;
                lowestPrice = data.asks.length ?
                  Math.min(...data.asks.map((a) => a.netNetPrice).filter((price) => price !== null)) :
                  null;
              } else {
                currentPrice = data.netPrice;
                lowestPrice = data.asks.length ?
                  Math.min(...data.asks.map((a) => a.netPrice).filter((price) => price !== null)) :
                  null;
              }

              if (currentPrice > lowestPrice) {
                $("td", row).css("background-color", "#FFFAE6");
              }

            } else { }
          },
          initComplete: function (settings, json) {
            LoadTippy()
            var api = this.api();
            $("#lowerprice").removeClass("details-invisible");
            $("#spl_table").wrap(
              "<div style='overflow:auto; width:100%;position:relative;'></div>"
            );
            var textBox = $("#spl_table_filter label input");
            textBox.unbind();
            textBox.bind("keyup input", function (e) {
              if (e.keyCode == 13) {
                api.search(this.value).draw();
              }
            });
          },
        });

        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      },
      error: function (jqXHR, exception) {
        return;
      },
    });
  }

  function makeChangesToOrder() {
    return new Promise((resolve, reject) => {

      if (changesPayload.length > 0) {

        var action = InvokeURL + "shops/" + shopKey + "/orders/" + orderId + "/products";
        var method = "PATCH";
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
          data: JSON.stringify(changesPayload),
          processData: false,
          success: function (resultData) {
            resolve(resultData);
            changesPayload = [];
          },
          error: function (jqXHR, exception) {
            reject({ jqXHR, exception });
          },
        });
      } else {
        resolve({ message: "No changes made" }); // Dodajemy resolve z odpowiednim komunikatem
      }
    });
  }

  $("#spl_table").on(
    "click",
    "td.details-control",
    function () {
      //Get the righ table
      var table = $("#spl_table").DataTable();
      var tr = $(this).closest("tr");
      var row = table.row(tr);
      if (row.child.isShown()) {
        row.child.hide();
        tr.removeClass("shown");
      } else {
        row.child(format(row.data())).show();
        tr.addClass("shown");
      }
    }
  );

  function addBlurOverlay(targetDivId, messageText) {
    // Upewnij się, że nakładka nie została już dodana
    if (!$('#' + targetDivId).prev().hasClass('blur-overlay')) {
      const targetDiv = $('#' + targetDivId);
      const overlayDiv = $('<div class="blur-overlay"></div>');
      const messageDiv = $('<div></div>');

      // Dodaj tekst do messageDiv
      messageDiv.text(messageText);

      // Ustaw inline CSS dla messageDiv
      messageDiv.css({
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: 'black', // Ustaw kolor tekstu
        fontSize: '16px', // Ustaw rozmiar czcionki
        fontWeight: 'bold' // Ustaw pogrubienie czcionki
      });

      overlayDiv.css({
        position: 'absolute',
        width: targetDiv.outerWidth(),
        height: targetDiv.outerHeight(),
        top: targetDiv.position().top,
        left: targetDiv.position().left,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(0.5px)',
        pointerEvents: 'none',
        zIndex: 10
      });

      // Dodaj messageDiv do overlayDiv
      overlayDiv.append(messageDiv);

      // Dodaj overlayDiv przed targetDiv
      targetDiv.before(overlayDiv);
    }
  }

  function updateOverlaySize(targetDivId) {
    const targetDiv = $('#' + targetDivId);
    const overlayDiv = targetDiv.prev('.blur-overlay');

    // Sprawdź, czy nakładka istnieje, zanim zaktualizujesz jej rozmiar
    if (overlayDiv.length) {
      overlayDiv.css({
        width: targetDiv.outerWidth(),
        height: targetDiv.outerHeight(),
        top: targetDiv.position().top,
        left: targetDiv.position().left
      });
    }
  }

  $(window).on('resize', function () {
    updateOverlaySize('table-content');
  });

  function checkChangesPayload() {
    if (changesPayload.length > 0) {
      // Dodaj nakładkę tylko wtedy, gdy nie istnieje
      if (!$('.blur-overlay').length) {
        addBlurOverlay('table-content', 'Dokonałeś zmian w produktach, podziel zamówienie ponownie.');
      }
    } else {
      // Usuń nakładkę, jeśli liczba rekordów wynosi 0
      removeBlurOverlay();
    }
  }

  function removeBlurOverlay() {
    $('.blur-overlay').remove();
  }

  function isValidBarcode(value) {
    // We only allow correct length barcodes
    if (!value.match(/^(\d{8}|\d{12,14})$/)) {
      return false;
    }

    const paddedValue = value.padStart(14, '0');

    let result = 0;
    for (let i = 0; i < paddedValue.length - 1; i += 1) {
      result += parseInt(paddedValue.charAt(i), 10) * ((i % 2 === 0) ? 3 : 1);
    }

    return ((10 - (result % 10)) % 10) === parseInt(paddedValue.charAt(13), 10);
  }



  $("#zipcontainer").on("click", "img", function () {
    var fileformat = $(this).attr("fileformat");
    const downloadLink = new URL(
      InvokeURL +
      "shops/" +
      shopKey +
      "/orders/" +
      orderId +
      "/wholesalers?filesFormat=" +
      fileformat
    );
    let anchor = document.createElement("a");
    document.body.appendChild(anchor);
    let headers = new Headers();
    headers.append("Authorization", orgToken);
    headers.append("Accept", "application/zip");
    $("#waitingdots").show();
    var headersResponse = [];
    fetch(downloadLink, {
      mode: "cors",
      headers: headers,
    })
      .then((res) => {
        res.headers.forEach((e) => headersResponse.push(e));
        return res.blob();
      })
      .then((blobby) => {
        $("#waitingdots").hide();
        var fileName = headersResponse[0].split("filename=")[1];
        let objectUrl = window.URL.createObjectURL(blobby);
        anchor.href = objectUrl;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(objectUrl);
      });
  });

  $("#table_splited_wh").on("click", "img", function () {
    //Get the righ table
    var table = $("#table_splited_wh").DataTable();
    var cell = $(this).closest("td");
    var row = $(this).closest("tr");
    var data = table.row($(this).parents("tr")).data();
    var fileformat = $(this).attr("fileformat");
    var wholesalerKey = data.wholesalerKey;
    const downloadLink = new URL(
      InvokeURL +
      "shops/" +
      shopKey +
      "/orders/" +
      orderId +
      "/wholesalers/" +
      wholesalerKey
    );
    let anchor = document.createElement("a");
    document.body.appendChild(anchor);
    let headers = new Headers();
    headers.append("Authorization", orgToken);
    headers.append("Accept", fileformat);
    $("#waitingdots").show();
    var headersResponse = [];

    fetch(downloadLink, {
      headers,
    })
      .then((res) => {
        res.headers.forEach((e) => headersResponse.push(e));
        return res.blob();
      })
      .then((blobby) => {
        $("#waitingdots").hide();
        let objectUrl = URL.createObjectURL(blobby);
        return objectUrl;
      })
      .then((uril) => {
        var fileName = headersResponse[0].split("filename=")[1];
        var link = document.createElement("a");
        link.href = uril;
        link.download = "" + fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  });


  var changesPayload = [];

  function addObject(changesPayload, newObj) {
    const existingObj = changesPayload.find(item => item.path === newObj.path);

    if (existingObj) {
      existingObj.value = newObj.value;
    } else {
      changesPayload.push(newObj);
    }
  }

  $("#spl_table").on("focusin", "input", function () {
    // Store the current value when the input element is focused
    $(this).data("initialValue", $(this).val());
  });

  $("#spl_table").on("focusout", "input", function () {
    // Get the right table
    // Change amount of product
    var table = $("#spl_table").DataTable();

    let newValue = $(this).val();
    var initialValue = $(this).data("initialValue");

    // Check if the value has changed
    if (newValue !== initialValue) {

      $(this).attr("value", newValue);
      var data = table.row($(this).parents("tr")).data();
      if (data.gtin !== null) {

        // Sprawdź, czy wartość jest pusta lub nieprawidłowa
        let quantity = parseInt(newValue);
        if (isNaN(quantity) || quantity < 0) {
          quantity = 0; // Jeśli tak, zmień wartość na 0
        }
        var product = {
          op: "replace",
          path: "/" + data.gtin + "/quantity",
          value: quantity,
        };
        addObject(changesPayload, product);
        // Emulate changes for user
        $("#waitingdots").show(1).delay(150).hide(1);
        checkChangesPayload();
      } else {
        console.log("GTIN is null");
      }
    }
  });

  $("#spl_table").on("focusin", "select", function () {
    // Store the current value when the select element is focused
    $(this).data("initialValue", $(this).val());
  });

  $("#spl_table").on("click", "img.showdata", function () {
    var dataToDisplay = $(this)
    const popupContainer = document.getElementById('ReleatedProducts');
    const popupContent = document.getElementById('popupContent');
    var input = dataToDisplay.data('content');
    var values = input.split(",");
    var output = "<td>" + values.join("<br>") + "</td>";
    popupContent.innerHTML = output;
    popupContainer.style.display = 'flex';
  });

  $("#spl_table").on("click", "td.details-control3", function () {
    var table = $("#spl_table").DataTable();
    var tr = $(this).closest("tr");
    var rowData = table.row(tr).data();

    if (isValidBarcode(rowData.gtin)) {
      var GTINEdit = document.getElementById("gtin");
      GTINEdit.value = rowData.gtin
      GTINEdit.disabled = true;
      var NameInput = document.getElementById("new-name");
      NameInput.value = rowData.name
      NameInput.textContent = rowData.name
      $("#ProposeChangeInGtinModal").css("display", "flex");
    }
  });

  $("#spl_table").on("click", "td.details-control4", function () {
    var table = $("#spl_table").DataTable();
    var tr = $(this).closest("tr");
    var rowData = table.row(tr).data();

    if (isValidBarcode(rowData.gtin)) {
      var payloadDelete = { "op": "remove", "path": "/" + rowData.gtin }
      addObject(changesPayload, payloadDelete);
      // Emulate changes for user
      $("#waitingdots").show(1).delay(150).hide(1);
      table
        .row($(this).parents('tr'))
        .remove()
        .draw();
      checkChangesPayload();
    }



  });

  $("#spl_table").on("focusout", "select", function () {
    // Get the right table
    // Change wholesaler of product
    var table = $("#spl_table").DataTable();

    var newValue = $(this).val();
    var initialValue = $(this).data("initialValue");

    // Check if the value has changed
    if (newValue !== initialValue) {
      $(this).attr("value", newValue);
      var data = table.row($(this).parents("tr")).data();

      if (data.gtin !== null && newValue === "remove") {
        var product = {
          op: "remove",
          path: "/" + data.gtin + "/rigidAssignment/wholesalerKey",
        }
        addObject(changesPayload, product);
        // Emulate changes for user
        $("#waitingdots").show(1).delay(150).hide(1);
        checkChangesPayload();
      }
      else if (data.gtin !== null && newValue) {
        var product = {
          op: "replace",
          path: "/" + data.gtin + "/rigidAssignment/wholesalerKey",
          value: newValue,
        }
        addObject(changesPayload, product);
        // Emulate changes for user
        $("#waitingdots").show(1).delay(150).hide(1);
        checkChangesPayload();
      } else {
        console.log("GTIN is null");
      }
    }
  });


  $(document).ready(function ($) {
    $("tableSelector").DataTable({
      dom: '<"pull-left"f><"pull-right"l>tip',
    });
    $("#table_splited").on("show", function (e) {
      $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
    });
  });

  var elements = document.getElementsByClassName("splitbutton");
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", (event) => {
      CreateOrder();
    });
  }

  var elements2 = document.getElementsByClassName("showproducts");
  for (var i = 0; i < elements2.length; i++) {
    elements2[i].addEventListener("click", (event) => {
      GetSplittedProducts();
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
              allowHTML: true, // Add HTML content
              arrowType: "round", // Sharp, round or empty for none
              delay: [0, 50], // Trigger delay in & out
              maxWidth: 240, // Optional, max width settings
            });
          }
        );
      }
    );
  }

  CreateOrder();

  getOffers();
  getWholesalersSh();

  makeWebflowFormAjaxCreate = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var doneBlock = $("#Edit-Success");
        var failBlock = $("#Edit-Fail");
        var organization = sessionStorage.getItem("OrganizationName");
        var organizationId = sessionStorage.getItem("OrganizationclientId");
        var oldname = document.getElementById("new-name");

        var data = {
          "organization": organization,
          "organizationId": organizationId,
          "data": {
            "gtin": $("#gtin").val(),
            "old-name": oldname.textContent,
            "new-name": $("#new-name").val(),
            "brand": $("#brand").val(),
            "measurement": $("#measurement").val(),
            "quantity": $("#quantity").val()
          }
        }


        $.ajax({
          type: "POST",
          url: "https://hook.eu1.make.com/ndsdd602ot8kbt2dpydw37coj015fy75",
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
                console.log("tutaj");
                window.setTimeout(function () {
                  $("#ProposeChangeInGtinModal").css("display", "none");
                  $("#Edit-Success").css("display", "none");
                }, 2000);
                form.trigger("reset");
                return;
              }
            }
            console.log("tutaj2");
            form.show();
            doneBlock.show();
            failBlock.hide();
            form.trigger("reset");
            window.setTimeout(function () {
              $("#ProposeChangeInGtinModal").css("display", "none");
              $("#Edit-Success").css("display", "none");
            }, 2000);
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            console.log("tutaj3");
            form.show();
            doneBlock.hide();
            failBlock.show();
            console.log(e);
            form.trigger("reset");
            window.setTimeout(function () {
              $("#ProposeChangeInGtinModal").css("display", "none");
              $("#Edit-Fail").css("display", "none");
            }, 2000);
          },
        });
        console.log("tutaj4");
        event.preventDefault();
        form.trigger("reset");
        return false;
      });
    });
  };

  makeWebflowFormAjaxCreate($("#wf-form-ProposeChangeInGtin"));
});