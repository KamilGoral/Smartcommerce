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
  var counter = 0;
  var offerId = "latest"
  var changesPayload = [];
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


  function saveToSessionStorage(productsData) {
    // Konwersja obiektu do JSON
    const jsonData = JSON.stringify(productsData);

    // Zapisanie JSON do sessionStorage
    sessionStorage.setItem(orderId, jsonData);

  }


  function getProductsDataFromSessionStorage(orderId) {
    const jsonData = sessionStorage.getItem(orderId);

    if (jsonData) {
      return JSON.parse(jsonData);
    }

    return null;
  }


  function updateTableInputsFromSessionStorage(orderId) {
    const productsData = getProductsDataFromSessionStorage(orderId);
    const productsDataItems = productsData.items;

    if (productsDataItems) {
      const table = $('#table_id').DataTable();

      table.rows().every(function () {
        const rowData = this.data();
        const gtin = rowData.gtin;
        const productData = productsDataItems.find(item => item.gtin === gtin);

        if (productData) {
          const inputField = $(this.node()).find('input[type="number"]');
          inputField.val(productData.quantity);
        } else {
          const inputField = $(this.node()).find('input[type="number"]');
          inputField.val(null); // Jeśli nie znaleziono produktu w sessionStorage, ustaw wartość na null
        }
      });
    }
  }



  async function CreateOrder() {
    const tableId = "#spl_table";

    if ($.fn.dataTable.isDataTable(tableId)) {
      // Usuń wszystkie rekordy z tabeli podzielonych produktów
      const tableToClear = $("#spl_table").DataTable();
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
              },
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
              },
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
              },
            },
            {
              orderable: false,
              data: "wholesalerKey",
              render: function (data) {
                if (OrganizationName !== "Suzyw123") {
                  if (data === "agra") {
                    return '<div class="div-block-20"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da5308ca3b98f7f653_pc-FILE.svg" loading="lazy" fileformat="text/plain" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6234df3f287c53243b955790_spreadsheet.svg" loading="lazy" fileformat="text/csv" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg" loading="lazy" fileformat="application/pdf" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64f899b627cb527b193815cd_TemaSimple.svg" loading="lazy" fileformat="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="filedownloadicon"></div>';
                  } else if (data === "mirex") {
                    return '<div class="div-block-20"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da5308ca3b98f7f653_pc-FILE.svg" loading="lazy" fileformat="text/plain" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg" loading="lazy" fileformat="application/pdf" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64f899b627cb527b193815cd_TemaSimple.svg" loading="lazy" fileformat="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="filedownloadicon"></div>';
                  } else {
                    return '<div class="div-block-20"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da5308ca3b98f7f653_pc-FILE.svg" loading="lazy" fileformat="text/plain" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da6407030dde16ffb9_kc-FILE.svg" loading="lazy" fileformat="text/csv" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg" loading="lazy" fileformat="application/pdf" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64f899b627cb527b193815cd_TemaSimple.svg" loading="lazy" fileformat="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="filedownloadicon"></div>';
                  }
                } else {
                  if (data === "agra") {
                    return '<div class="div-block-20"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da5308ca3b98f7f653_pc-FILE.svg" loading="lazy" fileformat="text/plain" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6234df3f287c53243b955790_spreadsheet.svg" loading="lazy" fileformat="text/csv" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg" loading="lazy" fileformat="application/pdf" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64f899b627cb527b193815cd_TemaSimple.svg" loading="lazy" fileformat="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="filedownloadicon"></div>';
                  } else if (data === "mirex") {
                    return '<div class="div-block-20"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da5308ca3b98f7f653_pc-FILE.svg" loading="lazy" fileformat="text/plain" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg" loading="lazy" fileformat="application/pdf" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64f899b627cb527b193815cd_TemaSimple.svg" loading="lazy" fileformat="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="filedownloadicon"></div>';
                  } else {
                    return '<div class="div-block-20"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da5308ca3b98f7f653_pc-FILE.svg" loading="lazy" fileformat="text/plain" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da6407030dde16ffb9_kc-FILE.svg" loading="lazy" fileformat="text/csv" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg" loading="lazy" fileformat="application/pdf" class="filedownloadicon"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64f899b627cb527b193815cd_TemaSimple.svg" loading="lazy" fileformat="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="filedownloadicon"></div>';
                  }
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
            var table = $("#table_splited_wh").DataTable();

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
      error: function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 404) {
          try {
            var response = JSON.parse(jqXHR.responseText);
            var regex =
              /Order with given orderId \[.*\] does not exist for shop with key \[.*\]/;
            if (regex.test(response.message)) {
              window.location.href =
                "https://" + DomainName + "/app/shops/shop?shopKey=" + shopKey;
            }
          } catch (e) {
            console.error("Error parsing response:", e);
          }
        }
      },
    });
  }

  function getOffers() {
    let url = new URL(
      InvokeURL +
      "shops/" +
      shopKey +
      "/offers?perPage=100&sort=createDate:desc"
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
          var statusText = "";

          if (offer.status !== null) {
            if (offer.status == "ready") {
              statusText = "Gotowa";
            }
            if (offer.status == "error") {
              statusText = "Problem";
            }
            if (offer.status == "in progress") {
              statusText = "W trakcie";
            }
            if (offer.status == "incomplete") {
              statusText = "Niekompletna";
            }
            if (offer.status == "batching") {
              statusText = "W kolejce";
            }
            if (offer.status == "forced") {
              statusText = "W kolejce";
            }
          }

          opt.textContent =
            creationDate[0] +
            " " +
            creationTime[0].slice(0, -4) +
            " " +
            statusText;
          OffersSelector.appendChild(opt);
        });
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
      var showRelated = "";
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
          showRelated =
            '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/624017e4560dba7a9f97ae97_shortcut.svg" loading="lazy" class ="showdata" data-content="' +
            item.promotion.relatedGtins +
            '" alt="">';
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

  function generateWholesalerSelect(
    selectedWholesalerKey,
    jsonData,
    isDisabled
  ) {
    const wholesalersData = JSON.parse(
      sessionStorage.getItem("wholesalersData")
    );
    if (wholesalersData && wholesalersData.length > 0) {
      let selectHTML = "";
      if (isDisabled == 1) {
        selectHTML =
          '<select style="width: 120px;" class="wholesalerSelect" disabled>';
      } else if (selectedWholesalerKey == "unassigned") {
        selectHTML = '<select style="width: 120px;" class="wholesalerSelect">';
        selectHTML += `<option value="unassigned" selected style="font-weight: bold">Nieprzydzielony</option>`;
      } else {
        selectHTML = '<select style="width: 120px;" class="wholesalerSelect">';
      }

      // Sortowanie dostawców z JSON na podstawie klucza 'netPrice', jeśli jsonData nie jest równy null
      if (jsonData !== null && jsonData.length > 0) {
        jsonData.sort((a, b) => a.netPrice - b.netPrice);

        // Usuwanie powtarzających się pozycji dostawców z jsonData
        jsonData = jsonData.filter((item, index, self) => {
          return (
            index ===
            self.findIndex((t) => t.wholesalerKey === item.wholesalerKey)
          );
        });

        // Dodawanie dostawców z JSON na górze listy wyboru
        jsonData.forEach((item) => {
          const wholesaler = wholesalersData.find(
            (wholesaler) => wholesaler.wholesalerKey === item.wholesalerKey
          );
          const wholesalerName = wholesaler
            ? wholesaler.name
            : item.wholesalerKey;
          selectHTML += `<option value="${item.wholesalerKey}"${item.wholesalerKey === selectedWholesalerKey
            ? ' selected style="font-weight: bold"'
            : ""
            }>${wholesalerName}</option>`;
        });
      } else {
        // Dodawanie nieprzydzielone górze listy wyboru
        selectHTML += `<option value="unassigned" selected style="font-weight: bold">Nieprzydzielony</option>`;
      }

      // Dodawanie pozostałych dostawców z sessionStorage do listy wyboru
      wholesalersData.forEach((wholesaler) => {
        if (
          !jsonData ||
          !jsonData.some(
            (item) => item.wholesalerKey === wholesaler.wholesalerKey
          )
        ) {
          selectHTML += `<option value="${wholesaler.wholesalerKey}"${wholesaler.wholesalerKey === selectedWholesalerKey
            ? ' selected style="font-weight: bold"'
            : ""
            } style = "background-color: #EBECF0;">${wholesaler.name}</option>`;
        }
      });

      selectHTML +=
        "<option value='remove' style='font-weight: bold'>Anuluj wybór</option></select>";

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
      url:
        InvokeURL +
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
        // Wywołaj funkcję do zapisania w ciasteczku
        saveToSessionStorage(resultProducts);
        updateTableInputsFromSessionStorage(orderId);

        $("#splitted-products").show();
        var table = $("#spl_table").DataTable({
          order: [[10, "desc"]], // This is column that contain values "Obniz Cene"
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
          data: resultProducts.items,
          search: {
            return: true,
          },
          columns: [
            {
              data: null,
              defaultContent: "",
              createdCell: function (
                cell,
                cellData,
                rowData,
                rowIndex,
                colIndex
              ) {
                if (rowData.asks && rowData.asks.length > 0) {
                  $(cell).addClass("details-control");
                }
              },
              orderable: false,
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
                  const kodHTML = generujKodHTML(data.gtin);
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
                return (
                  '<input type="number" style="max-width: 80px" onkeypress="return event.charCode >= 48" min="0" value="' +
                  data.quantity +
                  '">'
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
                return (
                  '<p style="font-size: 0;display: none">' +
                  data.wholesalerKey +
                  "</p>" +
                  generateWholesalerSelect(data.wholesalerKey, data.asks, 0)
                );
              },
            },
            {
              orderable: true,
              data: "assignmentSource",
              render: function (data) {
                if (data !== null) {
                  if (data === "bestMatch") {
                    return '<div style="display: flex;"><img loading="lazy" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d6bd8990da458a9f9cd78_smart-basket.svg" alt="" class="small-icon nomargins" style="margin: auto;"><p style="font-size: 0;">1</p></div>';
                  } else if (data === "exclusive") {
                    return '<div style="display: flex;"><img loading="lazy" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d4663e22be5693754eea7_lock-filled.svg" alt="" class="small-icon nomargins" style="margin: auto;"><p style="font-size: 0;">2</p></div>';
                  } else {
                    return '<div style="display: flex;"><img loading="lazy" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d463e9ce9fb54c6dfda04_person-circle.svg" alt="" class="small-icon nomargins" style="margin: auto;"><p style="font-size: 0;">3</p></div>';
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
                  let currentPrice = 0;
                  let lowestPrice = 0;
                  if (data.netNetPrice !== null) {
                    currentPrice = data.netNetPrice;
                    lowestPrice = data.asks.length
                      ? Math.min(
                        ...data.asks
                          .map((a) => a.netNetPrice)
                          .filter((price) => price !== null)
                      )
                      : null;
                  } else {
                    currentPrice = data.netPrice;
                    lowestPrice = data.asks.length
                      ? Math.min(
                        ...data.asks
                          .map((a) => a.netPrice)
                          .filter((price) => price !== null)
                      )
                      : null;
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
            },
          ],
          rowCallback: function (row, data) {
            if (data.hasOwnProperty("asks") && data.asks !== null) {
              let currentPrice = 0;
              let lowestPrice = 0;
              if (data.netNetPrice !== null) {
                currentPrice = data.netNetPrice;
                lowestPrice = data.asks.length
                  ? Math.min(
                    ...data.asks
                      .map((a) => a.netNetPrice)
                      .filter((price) => price !== null)
                  )
                  : null;
              } else {
                currentPrice = data.netPrice;
                lowestPrice = data.asks.length
                  ? Math.min(
                    ...data.asks
                      .map((a) => a.netPrice)
                      .filter((price) => price !== null)
                  )
                  : null;
              }

              if (currentPrice > lowestPrice) {
                $("td", row).css("background-color", "#FFFAE6");
              }
            } else {
            }
          },
          initComplete: function (settings, json) {
            LoadTippy();
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
        var action =
          InvokeURL + "shops/" + shopKey + "/orders/" + orderId + "/products";
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

  function addBlurOverlay(targetDivId, messageText) {
    // Upewnij się, że nakładka nie została już dodana
    if (
      !$("#" + targetDivId)
        .prev()
        .hasClass("blur-overlay")
    ) {
      const tableDiv = $("#table-content");
      const targetDiv = $("#" + targetDivId);
      const overlayDiv = $('<div class="blur-overlay"></div>');
      const messageDiv = $("<div></div>");

      // Dodaj tekst do messageDiv
      messageDiv.text(messageText);

      // Ustaw inline CSS dla messageDiv
      messageDiv.css({
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        color: "black", // Ustaw kolor tekstu
        fontSize: "16px", // Ustaw rozmiar czcionki
        fontWeight: "bold", // Ustaw pogrubienie czcionki
      });

      overlayDiv.css({
        position: "absolute",
        width: targetDiv.outerWidth(),
        height: targetDiv.outerHeight(),
        top: targetDiv.position().top,
        left: targetDiv.position().left,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(0.5px)",
        pointerEvents: "none",
        zIndex: 10,
      });

      // Dodaj messageDiv do overlayDiv
      overlayDiv.append(messageDiv);

      // Dodaj overlayDiv przed targetDiv
      targetDiv.before(overlayDiv);

      // Dodaj no click event
      tableDiv.css("pointer-events", "none");
    }
  }

  function updateOverlaySize(targetDivId) {
    const targetDiv = $("#" + targetDivId);
    const overlayDiv = targetDiv.prev(".blur-overlay");

    // Sprawdź, czy nakładka istnieje, zanim zaktualizujesz jej rozmiar
    if (overlayDiv.length) {
      overlayDiv.css({
        width: targetDiv.outerWidth(),
        height: targetDiv.outerHeight(),
        top: targetDiv.position().top,
        left: targetDiv.position().left,
      });
    }
  }

  function checkChangesPayload() {
    if (changesPayload.length > 0) {
      //
      disableTabLinks();
      // Dodaj nakładkę tylko wtedy, gdy nie istnieje
      if (!$(".blur-overlay").length) {
        addBlurOverlay(
          "table-content",
          "Wykryto zmiany w produktach, podziel zamówienie ponownie."
        );
      }
    } else {
      // Usuń nakładkę, jeśli liczba rekordów wynosi 0
      removeBlurOverlay();
    }
  }

  function removeBlurOverlay() {
    $(".blur-overlay").remove();
    $("#table-content").css("pointer-events", "");
  }

  function isValidBarcode(value) {
    // We only allow correct length barcodes
    if (!value.match(/^(\d{8}|\d{12,14})$/)) {
      return false;
    }

    const paddedValue = value.padStart(14, "0");

    let result = 0;
    for (let i = 0; i < paddedValue.length - 1; i += 1) {
      result += parseInt(paddedValue.charAt(i), 10) * (i % 2 === 0 ? 3 : 1);
    }

    return (10 - (result % 10)) % 10 === parseInt(paddedValue.charAt(13), 10);
  }

  function addObject(changesPayload, newObj) {
    const existingObj = changesPayload.find(
      (item) => item.path === newObj.path
    );

    if (existingObj) {
      existingObj.value = newObj.value;
    } else {
      changesPayload.push(newObj);
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
      "/history?perPage=91&page=1"
    );
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var jsonek = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        function displayData(x) {
          if (isFinite(x) && Number.isInteger(x) && !isNaN(x)) {
            return x;
          }
          return "";
        }
        var dataToChart = arrayConvert(jsonek);
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
        typeOfSource = "PC-Market";
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

  function getWholesalersSh() {
    let url = new URL(InvokeURL + "wholesalers" + "?enabled=true&perPage=1000");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      if (request.status >= 200 && request.status < 400) {
        sessionStorage.setItem("wholesalersData", JSON.stringify(toParse));
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

  function getOfferStatus() {
    let url = new URL(
      InvokeURL + "shops/" + shopKey + "/offers/" + offerId + "/status"
    );
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      if (
        request.status >= 200 &&
        request.status < 400 &&
        data.status === "incomplete" ||
        data.status === "batching" ||
        data.status === "forced"
      ) {
        $("#warningstatus").css("display", "flex");
        $("#warningstatus").attr("data-tippy-content", data.messages);
      } else if (request.status == 401) {
        console.log("Unauthorized");
      } else {
        $("#positivestatus").css("display", "flex");
      }
    };
    request.send();
  }

  function fetchDataFromEndpoint() {
    let url = new URL(InvokeURL + "shops/" + shopKey + "/orders/" + orderId + "/products?perPage=10000");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        const productsData = JSON.parse(request.responseText);
        saveToSessionStorage(productsData);
      } else {
        console.error("Błąd podczas pobierania danych z endpointu.");
      }
    };
    request.send();
  }

  makeWebflowFormAjaxDelete = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#OrderDeleteSuccess", container);
        var failBlock = $("#OrderDeleteFail", container);
        var action = InvokeURL + "shops/" + shopKey + "/orders/" + orderId;
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
          },
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                doneBlock.hide();
                failBlock.show();
                console.log(e);
                return;
              }
            }
            form.show();
            doneBlock.show();
            failBlock.hide();
            window.setTimeout(function () {
              document.location =
                "https://" + DomainName + "/app/shops/shop?shopKey=" + shopKey;
            }, 3000);
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            doneBlock.hide();
            failBlock.show();
            console.log(e);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

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
          organization: organization,
          organizationId: organizationId,
          data: {
            gtin: $("#gtin").val(),
            "old-name": oldname.textContent,
            "new-name": $("#new-name").val(),
            brand: $("#brand").val(),
            measurement: $("#measurement").val(),
            quantity: $("#quantity").val(),
          },
        };

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
                window.setTimeout(function () {
                  $("#ProposeChangeInGtinModal").css("display", "none");
                  $("#Edit-Success").css("display", "none");
                }, 2000);
                form.trigger("reset");
                return;
              }
            }
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
        event.preventDefault();
        form.trigger("reset");
        return false;
      });
    });
  };

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
        QStr = QStr + "&gtin=" + encodeURIComponent(searchBox);
      } else if (searchBox) {
        QStr = QStr + "&name=like:" + encodeURIComponent(searchBox);
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

      $(document).on("click", 'input[type="checkbox"]', function () {
        $('input[type="checkbox"]').not(this).prop("checked", false);
      });

      if (whKeyIndiStr) {
        QStr = QStr + "&wholesalerKey=" + whKeyIndiStr;
        if ($("#best").is(":checked")) {
          QStr = QStr + ":best";
        }
        if ($("#exclusive").is(":checked")) {
          QStr = QStr + ":exclusive";
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
    processing: false,
    serverSide: true,
    search: {
      return: true,
    },
    columns: [
      {
        data: null,
        orderable: false,
        defaultContent: "",
        width: "20px",
        createdCell: function (
          cell,
          cellData,
          rowData,
          rowIndex,
          colIndex
        ) {
          if (rowData.asks && rowData.asks.length > 0) {
            $(cell).addClass("details-control");
          }
        },
        orderable: false,
      },
      {
        orderable: false,
        class: "details-control2",
        width: "20px",
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
        data: "gtin",
      },
      {
        orderable: false,
        data: null,
        render: function (data) {
          return (
            '<input type="number" style="max-width: 80px" onkeypress="return event.charCode >= 48" min="0" value="">'
          );
        },
      },
      {
        orderable: true,
        data: "inStock",
        render: function (data) {
          if (data !== null) {
            return "" + data.value;
          }
          if (data === null) {
            return "-";
          }
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
            return "-";
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
        orderable: true,
        data: "standardPrice",
        render: function (data) {
          if (data !== null) {
            return "" + data.value.toFixed(2);
          }
          if (data === null) {
            return "-";
          }
        },
      },
      {
        //Tutaj beda promocje jako obrazki renderowane
        orderable: false,
        data: "asks",
        render: function (data) {
          if (data !== null && data.length > 0 && data.netPrice !== null) {
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
            return "-";
          }
          return "-";
        },
      },
      {
        orderable: false,
        data: "asks",
        defaultContent: "brak",
        render: function (data) {
          if (data !== null && data.length > 0 && data.netPrice !== null) {
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
        class: "details-control3",
        width: "20px",
        data: null,
        defaultContent:
          "<img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/64a0fe50a9833a36d21f1669_edit.svg' alt='details'></img>",
      }
    ],
    drawCallback: function (settings) {
      updateTableInputsFromSessionStorage(orderId);
    },
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
      $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
    },
  });

  function handleTabContainerClick() {
    // Wyświetl informacyjny alert
    alert("Dokonano zmian w zamówieniu. Proszę podzielić zamówienie przed przejściem do innej zakładki.");
  }

  function disableTabLinks() {
    const tabsContainer = document.getElementById('tabscontainer');
    const tabLinks = tabsContainer.querySelectorAll('a');
    // Zablokuj kliknięcia na wszystkich zakładkach
    tabLinks.forEach(tabLink => {
      tabLink.style.pointerEvents = 'none';
    });

    tabsContainer.addEventListener('click', handleTabContainerClick);

  }


  function enableTabLinks() {
    const tabsContainer = document.getElementById('tabscontainer');
    const tabLinks = tabsContainer.querySelectorAll('a');

    tabLinks.forEach(tabLink => {
      tabLink.style.pointerEvents = 'auto';
    });
    tabsContainer.removeEventListener('click', handleTabContainerClick);
  }


  function enableTabLinks() {
    const tabsContainer = document.getElementById('tabscontainer');
    const tabLinks = tabsContainer.querySelectorAll('a');
    tabLinks.forEach(tabLink => {
      tabLink.style.pointerEvents = 'auto';
    });
  }



  $("#table_splited_wh").on("click", "img", function () {
    // Get the right table
    var table = $("#table_splited_wh").DataTable();
    var cell = $(this).closest("td");
    var row = $(this).closest("tr");
    var data = table.row($(this).parents("tr")).data();

    if (!data || !data.wholesalerKey) {
      console.error("Data or wholesalerKey is undefined");
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
      $("#waitingdots").show();
      var headersResponse = [];
      fetch(downloadLink, {
        headers: {
          Accept: "application/zip",
          Authorization: orgToken,
        },
      })
        .then((res) => {
          if (res && res.headers) {
            res.headers.forEach((e) => headersResponse.push(e));
          }
          return res.blob();
        })
        .then((blobby) => {
          $("#waitingdots").hide();
          if (
            headersResponse.length > 0 &&
            headersResponse[0].includes("filename=")
          ) {
            var fileName = headersResponse[0].split("filename=")[1];
            let objectUrl = window.URL.createObjectURL(blobby);
            anchor.href = objectUrl;
            anchor.download = fileName;
            anchor.click();
            window.URL.revokeObjectURL(objectUrl);
          } else {
            console.error("Filename not found in the response headers.");
          }
        })
        .catch((error) => {
          console.error("Error fetching the file:", error);
        });
    } else {
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
          if (
            headersResponse.length > 0 &&
            headersResponse[0].includes("filename=")
          ) {
            var fileName = headersResponse[0].split("filename=")[1];
            var link = document.createElement("a");
            link.href = uril;
            link.download = "" + fileName;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            console.error("Filename not found in the response headers.");
          }
        });
    }
  });

  $("#spl_table").on("click", "td.details-control", function () {
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
  });

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
      console.log(data);
      if (data.gtin !== null) {
        let quantity = parseInt(newValue);
        if (isNaN(quantity) || quantity < 0) {
          quantity = 0; // If so, change the value to 0
        }

        if (data.derived !== null) {
          var product;
          if (quantity === null && data.derived !== null) {
            product = {
              op: "remove",
              path: "/" + data.derived.gtin,
            };
          } else {
            product = {
              op: "replace",
              path: "/" + data.derived.gtin + "/quantity",
              value: data.derived.set * quantity,
            };
          }
        } else {
          if (quantity !== null) {
            var product = {
              op: "replace",
              path: "/" + data.gtin + "/quantity",
              value: quantity,
            };
          } else {
            var product = {
              op: "remove",
              path: "/" + data.gtin,
            };
          }
        }
        addObject(changesPayload, product);
        // Emulate changes for the user
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
    const dataToDisplay = $(this);
    const popupContainer = document.getElementById("ReleatedProducts");
    const popupContent = document.getElementById("popupContent");
    const input = dataToDisplay.data("content");

    if (!input) {
      console.error("Brak danych do wyświetlenia.");
      return;
    }

    let output;
    if (Array.isArray(input)) {
      output = "<td>" + input.join("<br>") + "</td>";
    } else {
      output = "<td>" + input + "</td>";
    }

    popupContent.innerHTML = output;
    popupContainer.style.display = "flex";
  });

  $("#spl_table").on("click", "td.details-control3", function () {
    var table = $("#spl_table").DataTable();
    var tr = $(this).closest("tr");
    var rowData = table.row(tr).data();

    if (isValidBarcode(rowData.gtin)) {
      var GTINEdit = document.getElementById("gtin");
      GTINEdit.value = rowData.gtin;
      GTINEdit.disabled = true;
      var NameInput = document.getElementById("new-name");
      NameInput.value = rowData.name;
      NameInput.textContent = rowData.name;
      $("#ProposeChangeInGtinModal").css("display", "flex");
    }
  });

  $("#spl_table").on("click", "td.details-control4", function () {
    var table = $("#spl_table").DataTable();
    var tr = $(this).closest("tr");
    var rowData = table.row(tr).data();

    if (rowData.derived !== null) {
      var trueGtin2 = rowData.derived.gtin;
    } else {
      var trueGtin2 = rowData.gtin;
    }

    var payloadDelete = { op: "remove", path: "/" + trueGtin2 };
    addObject(changesPayload, payloadDelete);
    // Emulate changes for user
    $("#waitingdots").show(1).delay(150).hide(1);
    table.row($(this).parents("tr")).remove().draw();
    checkChangesPayload();

    // Aktualizuj wartość input w tabeli $('#table_id') na null
    var tableId = $('#table_id').DataTable();
    tableId.rows().every(function () {
      var rowDataId = this.data();
      if (rowDataId.gtin === trueGtin2) {
        var inputField = $(this.node()).find('input[type="number"]');
        inputField.val(null);
      }
    });
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

      if (data.derived !== null) {
        var trueGtin = data.derived.gtin;
      } else {
        var trueGtin = data.gtin;
      }

      if (trueGtin !== null && newValue === "remove") {
        var product = {
          op: "remove",
          path: "/" + trueGtin + "/rigidAssignment/wholesalerKey",
        };
        addObject(changesPayload, product);
        // Emulate changes for user
        $("#waitingdots").show(1).delay(150).hide(1);
        checkChangesPayload();
      } else if (trueGtin !== null && newValue) {
        var product = {
          op: "replace",
          path: "/" + trueGtin + "/rigidAssignment/wholesalerKey",
          value: newValue,
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

  $("#table_id tbody").on("click", "img.showdata", function () {
    var dataToDisplay = $(this)
    const popupContainer = document.getElementById('ReleatedProducts');
    const popupContent = document.getElementById('popupContent');
    var input = dataToDisplay.data('content');
    var values = input.split(",");
    var output = "<td>" + values.join("<br>") + "</td>";
    popupContent.innerHTML = output;
    popupContainer.style.display = 'flex';
  });

  $("#table_id tbody").on("click", "td.details-control2", function () {
    var tr = $(this).closest("tr");
    var rowData = table.row(tr).data();
    $("#ProductCard").css("display", "flex");
    getProductDetails(rowData);
    getProductHistory(rowData);
  });

  $("#table_id tbody").on("click", "td.details-control3", function () {
    var tr = $(this).closest("tr");
    var rowData = table.row(tr).data();
    var GTINEdit = document.getElementById("gtin");
    GTINEdit.value = rowData.gtin
    GTINEdit.disabled = true;
    var NameInput = document.getElementById("new-name");
    NameInput.value = rowData.name
    NameInput.textContent = rowData.name
    $("#ProposeChangeInGtinModal").css("display", "flex");
  });

  $("#table_id").on("focusin", "input", function () {
    // Store the current value when the input element is focused
    $(this).data("initialValue", $(this).val());
  });

  $("#table_id").on("focusout", "input", function () {
    // Get the right table
    // Change amount of product

    var table = $("#table_id").DataTable();
    let newValue = $(this).val();
    var initialValue = parseInt($(this).data("initialValue"));
    console.log(initialValue);
    console.log(newValue);
    // Check if the value has changed
    if (newValue !== initialValue && parseInt(newValue) >= 0) {
      $(this).attr("value", newValue);
      var data = table.row($(this).parents("tr")).data();

      if (data.gtin !== null) {
        let quantity = parseInt(newValue);
        if (isNaN(quantity)) {
          quantity = null; // If so, set quantity to null
        }

        var product;
        if (isNaN(initialValue) && newValue !== initialValue) {
          product = {
            op: "add",
            path: "/" + data.gtin,
            value: {
              "quantity": quantity
            }
          };
        } else if (quantity !== null) {
          product = {
            op: "replace",
            path: "/" + data.gtin + "/quantity",
            value: quantity,
          };
        } else {
          product = {
            op: "remove",
            path: "/" + data.gtin,
          };
        }

        addObject(changesPayload, product);
        disableTabSwitching();
        // Emulate changes for the user
        $("#waitingdots").show(1).delay(150).hide(1);
        checkChangesPayload();
      } else {
        console.log("GTIN is null");
      }
    }
  });

  $('div[role="tablist"]').click(function () {
    setTimeout(function () {
      console.log("Adjusting");
      updateOverlaySize("table-content");

      // Check if the overlay element exists
      const overlay = document.querySelector("#detailspane > div.blur-overlay");
      if (overlay) {
        const tabElement = document.querySelector("[data-w-tab='Details']");

        function toggleOverlay() {
          if (tabElement && tabElement.classList.contains("w--current")) {
            overlay.style.transition = "opacity 0.3s"; // Transition for 200ms (0.2 seconds)
            overlay.style.opacity = 1; // Set opacity to 100%
          } else {
            overlay.style.transition = "opacity 0.3s"; // Transition for 200ms (0.2 seconds)
            overlay.style.opacity = 0; // Set opacity to 0
          }
        }

        toggleOverlay();
      }

      $.fn.dataTable
        .tables({
          visible: true,
          api: true,
        })
        .columns.adjust();
    }, 300);
  });

  $("#table_id").on("show", function (e) {
    $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
  });
  $("#spl_table").on("show", function (e) {
    $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
  });

  var elements = document.getElementsByClassName("splitbutton");
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", (event) => {
      CreateOrder();
      enableTabLinks()
      var detailsLink = document.getElementById('details');
      if (detailsLink) {
        detailsLink.click();
      }
    });
  }

  var elements2 = document.getElementsByClassName("showproducts");
  for (var i = 0; i < elements2.length; i++) {
    elements2[i].addEventListener("click", (event) => {
      GetSplittedProducts();
    });
  }

  $.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
    var elem = document.getElementById("DataTablesModule");
    elem.remove();
    document.getElementById("EmptyOfferState").style.display = "flex";
  };

  $(window).on("resize", function () {
    updateOverlaySize("table-content");
  });

  CreateOrder();
  getOffers();
  getWholesalersSh();
  fetchDataFromEndpoint();
  getOfferStatus();

  makeWebflowFormAjaxCreate($("#wf-form-ProposeChangeInGtin"));
  makeWebflowFormAjaxDelete($("#wf-form-DeleteOrder"));

  $(document).ready(function ($) {
    $("tableSelector").DataTable({
      dom: '<"pull-left"f><"pull-right"l>tip',
    });
    $("#table_splited").on("show", function (e) {
      $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
    });
    $("#table_id")
      .on("init.dt", function () {
        LoadTippy();
        var x = 0;
        var intervalID = setInterval(function () {
          // For some reason we have to fire this function multiple times in order to work...
          $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
          console.log("Adjusting");

          if (++x === 1) {
            window.clearInterval(intervalID);
          }
        }, 1000);
      })
      .dataTable();
  });
});
