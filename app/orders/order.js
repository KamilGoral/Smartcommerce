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
  ShopBread.textContent = shopKey;
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

  function CreateOrder() {
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
    var action =
      InvokeURL +
      "shops/" +
      shopKey +
      "/orders/" +
      orderId +
      "/split?" +
      UrlParameters;
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
              orderable: false,
              data: "wholesalerKey",
              render: function (data) {
                if (data === "agra") {
                  return '<div class="div-block-20"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da5308ca3b98f7f653_pc-FILE.svg" loading="lazy" fileformat="text/plain" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6234df3f287c53243b955790_spreadsheet.svg" loading="lazy" fileformat="text/csv" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg" loading="lazy" fileformat="application/pdf" class="filedownloadicon"></div>';
                } else {
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
            var table = $('#table_splited_wh').DataTable();

            table.rows().every(function () {
              var rowData = this.data();
              var productQuantity = parseInt(rowData["products"]["exclusive"]);
              totalEclusiveProducts += productQuantity;
            });

            if (totalEclusiveProducts === 0) {
              // Hide Office column
              table.column(5).visible(false); // Produkty na wyłączność
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
      InvokeURL + "shops/" + shopKey + "/offers?sort=createDate:desc"
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
    let url = new URL(InvokeURL + "wholesalers" + "?enabled=true&perPage=1000");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(this.response);
        var toParse = data.items;
        console.log(toParse)
        console.log(Object.keys(toParse).length);
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
    console.log(arr);
    arr.sort((a, b) => (a.netPrice > b.netPrice ? 1 : -1));
    var toDisplayHtml = "";
    console.log(arr);

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
          item.promotion.threshold +
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
          "</tr>";
      }
      toDisplayHtml += tableRowHtml;
    }
    arr.forEach(myFunction);
    return (
      "<table><tr><th>Dostawca</th><th>Cena net</th><th>Cena netnet</th><th>Paczka</th><th>Zrodlo</th><th>Promocja</th><th>Typ</th><th>Próg</th><th>Opakowanie</th></tr>" +
      toDisplayHtml +
      "</table>"
    );
  }

  function generateWholesalerSelect(selectedWholesalerKey, jsonData) {
    const wholesalersData = JSON.parse(sessionStorage.getItem("wholesalersData"));

    if (wholesalersData && wholesalersData.length > 0) {
      let selectHTML = '<select style="width: 120px;" class="wholesalerSelect">';

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
          selectHTML += `<option value="${wholesaler.wholesalerKey}"${wholesaler.wholesalerKey === selectedWholesalerKey ? ' selected' : ''}>${wholesaler.name}</option>`;
        }
      });

      selectHTML += "</select>";
      return selectHTML;
    } else {
      return "Brak dostawców do wyboru.";
    }
  }

  function GetSplittedProducts() {
    $.ajax({
      type: "GET",
      url: InvokeURL +
        "shops/" +
        shopKey +
        "/orders/" +
        orderId +
        "/wholesalers?perPage=10000",
      cors: true,
      contentType: "application/json",
      dataType: "json",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: orgToken,
      },
      beforeSend: function() {
        $("#waitingdots").show();
      },
      complete: function() {
        $("#waitingdots").hide();
      },
      success: function(resultProducts) {
        if (typeof successCallback === "function") {
          result = successCallback(resultProducts);
          if (!result) {
            return;
          }
        }
        var products = resultProducts;
        console.log(products);

        $("#splitted-products").show();
        var table = $("#spl_table").DataTable({
          order: [
            [9, "desc"]
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
              orderable: false,
              class: "details-control",
              data: null,
              defaultContent: "",
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
              orderable: false,
              data: "inStock",
              render: function(data) {
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
              data: "quantity",
              render: function(data) {
                return (
                  '<input type="number" style="max-width: 80px" value="' +
                  data +
                  '"></td>'
                );
              },
            },
            {
              orderable: false,
              data: "standardPrice",
              render: function(data) {
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
              data: null,
              render: function(data) {
                return generateWholesalerSelect(data.wholesalerKey, data.asks);
              },
            },
            {
              orderable: true,
              data: "netPrice",
            },
            {
              orderable: false,
              data: "assignmentSource",
              render: function(data) {
                if (data !== null) {
                  if (data === "bestMatch") {
                    return (
                      '<div style="display: flex;"><img loading="lazy" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d6bd8990da458a9f9cd78_smart-basket.svg" alt="" class="small-icon nomargins"></div>'
                    );
                  } else if (data === "exclusive") {
                    return (
                      '<div style="display: flex;"><img loading="lazy" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d4663e22be5693754eea7_lock-filled.svg" alt="" class="small-icon nomargins"></div>'
                    );
                  } else {
                    return (
                      '<div style="display: flex;"><img loading="lazy" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d463e9ce9fb54c6dfda04_person-circle.svg" alt="" class="small-icon nomargins"></div>'
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
              render: function(data) {
                if (data.hasOwnProperty("asks") && data.asks !== null) {
                  let currentPrice = data.netPrice;
                  let lowestNetPrice = data.asks.length ?
                    Math.min(...data.asks.map((a) => a.netPrice)) :
                    null;
                  if (currentPrice > lowestNetPrice) {
                    var diffPercent = (
                      ((currentPrice - lowestNetPrice) / currentPrice) *
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
              render: function(data) {
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
              render: function(data) {
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
          rowCallback: function(row, data) {
            if (data.hasOwnProperty("asks") && data.asks !== null) {
              let currentPrice = data.netPrice;
              let lowestNetPrice = data.asks.length ?
                Math.min(...data.asks.map((a) => a.netPrice)) :
                null;
              if (data.netPrice > lowestNetPrice) {
                $("td", row).css("background-color", "#FFFAE6");
              } else {}
            } else {}
          },
          initComplete: function(settings, json) {
            LoadTippy()
            var api = this.api();
            $("#lowerprice").removeClass("details-invisible");
            $("#spl_table").wrap(
              "<div style='overflow:auto; width:100%;position:relative;'></div>"
            );
            var textBox = $("#spl_table_filter label input");
            textBox.unbind();
            textBox.bind("keyup input", function(e) {
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
      error: function(jqXHR, exception) {
        return;
      },
    });
  }

  $("#spl_table").on(
    "click",
    "td.details-control",
    function() {
      //Get the righ table
    var table = $("#spl_table").DataTable();
      var tr = $(this).closest("tr");
      var row = table.row(tr);
      if (row.child.isShown()) {
        row.child.hide();
        tr.removeClass("shown");
      } else {
        console.log(row.data);
        row.child(format(row.data())).show();
        tr.addClass("shown");
      }
    }
  );


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
        console.log(headersResponse);
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
        console.log(headersResponse);
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

  var table = $("#table_products").DataTable({
    pagingType: "full_numbers",
    destroy: true,
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
    ajax: function (data, callback, settings) {
      $("#before-split-products").show();
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
        InvokeURL +
        "shops/" +
        shopKey +
        "/orders/" +
        orderId +
        "/products" +
        QStr,
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
        data: "name",
      },
      {
        orderable: false,
        data: "gtin",
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
        data: "quantity",
        render: function (data) {
          return (
            '<input type="number" style="max-width: 80px" value="' +
            data +
            '"></td>'
          );
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
              return "" + bestOffer.netPrice;
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
          if (data !== null && data.netNetPrice !== null) {
            var mysorteddata = data.sort(
              (a, b) => (a.netPrice > b.netPrice && 1) || -1
            );
            var bestOffer = data[0];
            if (bestOffer.netNetPrice === null) {
              return "-";
            }
            return "" + bestOffer.netNetPrice;
          }
          return "-";
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
    ],
    initComplete: function (settings, json) {
      var api = this.api();
      $("#table_products").wrap(
        "<div style='overflow:auto; width:100%;position:relative;'></div>"
      );
      var textBox = $("#table_products_filter label input");
      textBox.unbind();
      textBox.bind("keyup input", function (e) {
        if (e.keyCode == 13) {
          api.search(this.value).draw();
        }
      });
    },
  });

  $("#table_products").on("click", "td.details-control", function () {
    //Get the righ table
    var table = $("#table_products").DataTable();
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

  var changesPayload = [];

  function addObject(changesPayload, newObj) {
    const existingObj = changesPayload.find(item => item.path === newObj.path);

    if (existingObj) {
        existingObj.value = newObj.value;
    } else {
        changesPayload.push(newObj);
    }
}

  $("#spl_table").on("focusout", "input", function () {

    //Get the righ table
    //Change amount of product
    var table = $("#spl_table").DataTable();

    $(this).attr("value", $(this).val());
    var data = table.row($(this).parents("tr")).data();
    if (data.gtin !== null) {
      var product = {
        op: "replace",
        path: "/" + data.gtin + "/quantity",
        value: parseInt($(this).val()),
      };
      addObject(changesPayload, product);
      console.log(changesPayload)
    } else {
      console.log("GTIN is null");
    }
  });

  $("#spl_table").on("focusout", "select", function () {

    //Get the righ table
    //Change wholesaler of product
    var table = $("#spl_table").DataTable();

    $(this).attr("value", $(this).val());
    var data = table.row($(this).parents("tr")).data();
    if (data.gtin !== null) {
      var product = {
        op: "replace",
        path: "/" + data.gtin + "/rigidAssigment/wholesalerKey",
        value: $(this).val(),
      };
      addObject(changesPayload, product);
      console.log(changesPayload)
    } else {
      console.log("GTIN is null");
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
  getOffers();
  getWholesalersSh();
});
