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

  var shopKey = new URL(location.href).searchParams.get("shopKey");
  var orgToken = getCookie("sprytnyToken");
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var DomainName = getCookie("sprytnyDomainName");
  var ClientID = sessionStorage.getItem("OrganizationclientId");
  var OrganizationName = sessionStorage.getItem("OrganizationName");
  const OrganizationBread0 = document.getElementById("OrganizationBread0");
  const UploadButton = document.getElementById("UploadButton");
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
  $("#Wholesaler-profile-Selector-box").hide();

  function getShop() {
    var request = new XMLHttpRequest();
    let endpoint = new URL(InvokeURL + "shops/" + shopKey);
    request.open("GET", endpoint.toString(), true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);

      if (request.status >= 200 && request.status < 400) {
        const itemContainer = document.getElementById("shop-Container");
        const item = document.getElementById("sampleShop");
        const shName = document.getElementById("shName");
        const shName2 = document.getElementById("shName2");
        const shCountry = document.getElementById("shCountry");
        const shLine1 = document.getElementById("shLine1");
        const shTown = document.getElementById("shTown");
        const shState = document.getElementById("shState");
        const shPostcode = document.getElementById("shPostcode");
        const shShopKey = document.getElementById("shShopKey");

        const shNameInput = document.getElementById("NewShopName");
        const shKeyInput = document.getElementById("NewShopKey");
        const shCountryInput = document.getElementById("NewShopCountry");
        const shLine1Input = document.getElementById("NewShopLine");
        const shTownInput = document.getElementById("NewShopTown");
        const shStateInput = document.getElementById("NewShopState");
        const shPostcodeInput = document.getElementById("NewShopPostCode");
        const pcMarketId = document.getElementById("pcMarketId");

        sessionStorage.setItem("shopKey", data.shopKey);
        sessionStorage.setItem("shopName", data.name);
        var ShopKeyBreadName = sessionStorage.getItem("shopName");
        const ShopNameBread = document.getElementById("ShopNameBread");
        ShopNameBread.textContent = data.name;
        ShopNameBread.setAttribute(
          "href",
          "https://" + DomainName + "/app/shops/shop?shopKey=" + data.shopKey
        );

        shName.textContent = data.name;
        shName2.textContent = data.name;
        shCountry.textContent = data.address.country;
        shLine1.textContent = data.address.line1;
        shTown.textContent = data.address.town;
        shState.textContent = data.address.state;
        shPostcode.textContent = data.address.postcode;
        shShopKey.textContent = data.shopKey;
        pcMarketId.textContent = data.pcmarketShopId;

        shNameInput.value = data.name;
        shKeyInput.value = data.shopKey;
        shCountryInput.value = data.address.country;
        shLine1Input.value = data.address.line1;
        shTownInput.value = data.address.town;
        shStateInput.value = data.address.state;
        shPostcodeInput.value = data.address.postcode;
      } else {
        console.log("error");
      }
    };

    // Send request
    request.send();
  }

  function getOrders() {
    var table = $("#table_orders").DataTable({
      pagingType: "full_numbers",
      order: [],
      dom: '<"top">rt<"bottom"lip>',
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

        var whichColumns = "";
        var direction = "desc";

        if (data.order.length == 0) {
          whichColumns = 0;
        } else {
          whichColumns = data.order[0]["column"];
          direction = data.order[0]["dir"];
        }

        switch (whichColumns) {
          case 0:
            whichColumns = "createDate:";
            break;
          case 2:
            whichColumns = "createDate:";
            break;
          case 3:
            whichColumns = "createDate:";
            break;
          default:
            whichColumns = "createDate:";
        }

        var sort = "" + whichColumns + direction;

        $.get(
          InvokeURL + "shops/" + shopKey + "/orders",
          {
            sort: sort,
            perPage: data.length,
            page: (data.start + data.length) / data.length,
          },
          function (res) {
            // map your server's response to the DataTables format and pass it to
            // DataTables' callback
            callback({
              recordsTotal: res.total,
              recordsFiltered: res.total,
              data: res.items,
            });
          }
        );
      },
      processing: true,
      search: {
        return: true,
      },
      serverSide: true,
      search: {
        return: true,
      },
      columns: [
        {
          orderable: false,
          data: null,
          width: "36px",
          defaultContent:
            "<div class='details-container'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg' alt='offer'></img></div>",
        },
        {
          orderable: false,
          visible: false,
          data: "orderId",
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
          orderable: false,
          data: "createdBy",
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
          orderable: false,
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
          data: "createDate",
          render: function (data) {
            if (data !== null) {
              var createDate = "";
              var offset = new Date().getTimezoneOffset();
              var localeTime = new Date(
                Date.parse(data) - offset * 60 * 1000
              ).toISOString();
              var creationDate = localeTime.split("T");
              var creationTime = creationDate[1].split("Z");
              createDate = creationDate[0] + " " + creationTime[0].slice(0, -4);

              return createDate;
            }
            if (data === null) {
              return "";
            }
          },
        },
      ],
      initComplete: function (settings, json) {
        var api = this.api();
        var textBox = $("#table_offers_filter label input");
        textBox.unbind();
        textBox.bind("keyup input", function (e) {
          if (
            (e.keyCode == 8 && !textBox.val()) ||
            (e.keyCode == 46 && !textBox.val())
          ) {
          } else if (e.keyCode == 13 || !textBox.val()) {
            api.search(this.value).draw();
          }
        });
      },
    });

    $("#table_orders").on("click", "tr", function () {
      var rowData = table.row(this).data();
      window.location.replace(
        "https://" +
          DomainName +
          "/app/orders/order?orderId=" +
          rowData.orderId +
          "&shopKey=" +
          shopKey
      );
    });
  }
  function getOffers() {
    var table = $("#table_offers").DataTable({
      pagingType: "full_numbers",
      order: [],
      dom: '<"top">rt<"bottom"lip>',
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

        var whichColumns = "";
        var direction = "desc";

        if (data.order.length == 0) {
          whichColumns = 0;
        } else {
          whichColumns = data.order[0]["column"];
          direction = data.order[0]["dir"];
        }

        switch (whichColumns) {
          case 0:
            whichColumns = "createDate:";
            break;
          case 2:
            whichColumns = "status:";
            break;
          case 3:
            whichColumns = "createDate:";
            break;
          default:
            whichColumns = "createDate:";
        }

        var sort = "" + whichColumns + direction;

        $.get(
          InvokeURL + "shops/" + shopKey + "/offers",
          {
            sort: sort,
            perPage: data.length,
            page: (data.start + data.length) / data.length,
          },
          function (res) {
            // map your server's response to the DataTables format and pass it to
            // DataTables' callback
            callback({
              recordsTotal: res.total,
              recordsFiltered: res.total,
              data: res.items,
            });
          }
        );
      },
      processing: true,
      search: {
        return: true,
      },
      serverSide: true,
      search: {
        return: true,
      },
      columns: [
        {
          orderable: false,
          data: null,
          width: "36px",
          defaultContent:
            "<div class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg' alt='offer'></img></div>",
        },
        {
          orderable: false,
          visible: false,
          data: "offerId",
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
          data: "createDate",
          render: function (data) {
            if (data !== null) {
              var createDate = "";
              var offset = new Date().getTimezoneOffset();
              var localeTime = new Date(
                Date.parse(data) - offset * 60 * 1000
              ).toISOString();
              var creationDate = localeTime.split("T");
              var creationTime = creationDate[1].split("Z");
              createDate = creationDate[0] + " " + creationTime[0].slice(0, -4);

              return createDate;
            }
            if (data === null) {
              return "";
            }
          },
        },
        {
          orderable: true,
          data: "status",
          render: function (data) {
            if (data !== null) {
              if (data == "ready") {
                return '<spann class="positive">Gotowa</spann>';
              }
              if (data == "error") {
                return '<spann class="negative">Problem</spann>';
              }
              if (data == "in progress") {
                return '<spann class="medium">W trakcie</spann>';
              }
              if (data == "incomplete") {
                return '<spann class="medium">Niekompletna</spann>';
              }
            }
            if (data === null) {
              return "";
            }
          },
        },
        {
          orderable: false,
          data: null,
          render: function (data, type, row) {
            if (type === "display") {
              return (
                '<div class="action-container"><a href="#" status="' +
                row["status"] +
                '" offerId="' +
                row["offerId"] +
                '" class="buttonoutline editme w-button">Przejdź</a></div>'
              );
            }
          },
        },
      ],
      initComplete: function (settings, json) {
        var api = this.api();
        var textBox = $("#table_offers_filter label input");
        textBox.unbind();
        textBox.bind("keyup input", function (e) {
          if (
            (e.keyCode == 8 && !textBox.val()) ||
            (e.keyCode == 46 && !textBox.val())
          ) {
          } else if (e.keyCode == 13 || !textBox.val()) {
            api.search(this.value).draw();
          }
        });
      },
    });

    $("#table_offers").on("click", "a", function () {
      var clikedEl = this;
      var MessageContainer = document.getElementById("WarningMessageContainer");
      var MessageText = document.getElementById("WarningMessageMain");

      if (clikedEl.getAttribute("status") == "in progress") {
        MessageText.textContent =
          "Oferta w trakcie tworzenia. Proszę poczekaj...";
        MessageContainer.style.display = "flex";
        $("#WarningMessageContainer").fadeOut(3000);
        MessageContainer.style.display = "none";
      }
      if (clikedEl.getAttribute("status") == "error") {
        MessageText.textContent =
          "Oops! Coś poszło nie tak. Spróbuj ponownie...";
        MessageContainer.style.display = "flex";
        $("#WarningMessageContainer").fadeOut(3000);
        MessageContainer.style.display = "none";
      }
      if (clikedEl.getAttribute("status") == "ready") {
        window.location.replace(
          "https://" +
            DomainName +
            "/app/offers/offer?shopKey=" +
            shopKey +
            "&offerId=" +
            clikedEl.getAttribute("offerId")
        );
      }
      if (clikedEl.getAttribute("status") == "incomplete") {
        $.ajax({
          url:
            InvokeURL +
            "shops/" +
            shopKey +
            "/offers/" +
            clikedEl.getAttribute("offerId") +
            "/status",
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", orgToken);
          },
          success: function (data) {
            MessageText.textContent =
              "Uwaga! Oferta nie jest komplenta. " + data.messages;
            MessageContainer.style.display = "flex";
            $("#WarningMessageContainer").fadeOut(3000, function () {
              MessageContainer.style.display = "none";
              document.location =
                "https://" +
                DomainName +
                "/app/offers/offer?shopKey=" +
                shopKey +
                "&offerId=" +
                clikedEl.getAttribute("offerId");
            });
          },
        });
      }
    });
  }
  function getPriceLists() {
    var table = $("#table_pricelists_list").DataTable({
      pagingType: "full_numbers",
      order: [],
      dom: '<"top">rt<"bottom"lip>',
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

        var whichColumns = "";
        var direction = "desc";

        if (data.order.length == 0) {
          whichColumns = 0;
        } else {
          whichColumns = data.order[0]["column"];
          direction = data.order[0]["dir"];
        }

        switch (whichColumns) {
          case 0:
            whichColumns = "createDate:";
            break;
          case 2:
            whichColumns = "createDate:";
            break;
          case 3:
            whichColumns = "createDate:";
            break;
          default:
            whichColumns = "createDate:";
        }

        var sort = "" + whichColumns + direction;

        $.get(
          InvokeURL + "/price-lists?shopKey=" + shopKey,
          {
            sort: sort,
            perPage: data.length,
            page: (data.start + data.length) / data.length,
          },
          function (res) {
            // map your server's response to the DataTables format and pass it to
            // DataTables' callback
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
          data: null,
          width: "36px",
          defaultContent:
            "<div class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61ae41350933c525ec8ea03a_office-building.svg' alt='offer'></img></div>",
        },
        {
          orderable: false,
          data: "wholesalerKey",
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
          data: "createDate",
          render: function (data) {
            if (data !== null) {
              var createDate = "";
              var offset = new Date().getTimezoneOffset();
              var localeTime = new Date(
                Date.parse(data) - offset * 60 * 1000
              ).toISOString();
              var creationDate = localeTime.split("T");
              var creationTime = creationDate[1].split("Z");
              createDate = creationDate[0] + " " + creationTime[0].slice(0, -4);

              return createDate;
            }
            if (data === null) {
              return "";
            }
          },
        },
        {
          orderable: false,
          data: "startDate",
          render: function (data) {
            if (data !== null) {
              var startDate = "";
              var offset = new Date().getTimezoneOffset();
              var localeTime = new Date(
                Date.parse(data) - offset * 60 * 1000
              ).toISOString();
              var creationDate = localeTime.split("T");
              var creationTime = creationDate[1].split("Z");
              startDate = creationDate[0]; //+ ' ' + creationTime[0].slice(0, -4);

              return startDate;
            }
            if (data === null) {
              return "";
            }
          },
        },
        {
          orderable: false,
          data: "endDate",
          render: function (data) {
            if (data !== null) {
              var endDate = "";
              var nowDate = new Date().toISOString();
              var offset = new Date().getTimezoneOffset();
              var localeTime = new Date(
                Date.parse(data) - offset * 60 * 1000
              ).toISOString();
              var creationDate = localeTime.split("T");
              var creationTime = creationDate[1].split("Z");
              endDate = creationDate[0]; //+ ' ' + creationTime[0].slice(0, -4);

              if (data > nowDate) {
                return '<spann class="positive">' + endDate + "</spann>";
              } else {
                return '<spann class="medium">' + endDate + "</spann>";
              }
            }
            if (data === null) {
              return "";
            }
          },
        },
        {
          orderable: false,
          data: "createdBy",
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
          orderable: false,
          data: "lastModificationDate",
          render: function (data) {
            if (data !== null) {
              var lastModificationDate = "";
              var offset = new Date().getTimezoneOffset();
              var localeTime = new Date(
                Date.parse(data) - offset * 60 * 1000
              ).toISOString();
              var creationDate = localeTime.split("T");
              var creationTime = creationDate[1].split("Z");
              lastModificationDate =
                creationDate[0] + " " + creationTime[0].slice(0, -4);

              return lastModificationDate;
            }
            if (data === null) {
              return "";
            }
          },
        },
      ],
    });

    $("#table_pricelists_list").on("click", "tr", function () {
      var rowData = table.row(this).data();
      window.location.replace(
        "https://" +
          DomainName +
          "/app/pricelists/pricelist?priceListId=" +
          rowData.priceListId +
          "&shopKey=" +
          shopKey
      );
    });
  }
  function getWholesalers() {
    let url = new URL(
      InvokeURL +
        "shops/" +
        shopKey +
        "/wholesalers?sort=wholesalerKey:desc&perPage=1000&page=1"
    );
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      toParse.sort(function (a, b) {
        return b.enabled - a.enabled;
      });

      if (request.status >= 200 && request.status < 400) {
        var table = $("#table_wholesalers").DataTable({
          data: toParse,
          pagingType: "full_numbers",
          order: [],
          dom: '<"top">rt<"bottom"lip>',
          scrollY: "60vh",
          scrollCollapse: true,
          pageLength: 100,
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
              data: null,
              width: "36px",
              defaultContent:
                "<div class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61ae41350933c525ec8ea03a_office-building.svg' alt='offer'></img></div>",
            },
            {
              orderable: false,
              data: "wholesalerKey",
              visible: false,
              render: function (data) {
                if (data !== null) {
                  return data;
                } else {
                  return "";
                }
              },
            },
            {
              orderable: true,
              data: "name",
              render: function (data) {
                if (data !== null) {
                  return data;
                } else {
                  return "";
                }
              },
            },
            {
              orderable: true,
              data: "logisticMinimum",
              width: "108px",
              render: function (data) {
                if (data !== null) {
                  return data;
                } else {
                  return "-";
                }
              },
            },
            {
              orderable: true,
              data: "connections.retroactive",
              width: "108px",
              visible: true,
              render: function (data) {
                if (data !== null) {
                  if (data.enabled) {
                    return '<spann class="positive">Tak</spann>';
                  } else {
                    return '<spann class="negative">Nie</spann>';
                  }
                } else {
                  return '<spann class="negative">Nie</spann>';
                }
              },
            },
            {
              orderable: true,
              data: "connections.ftp",
              width: "72px",
              render: function (data) {
                if (data !== null) {
                  if (data.enabled) {
                    return '<spann class="positive">Tak</spann>';
                  } else {
                    return '<spann class="medium">Dodaj</spann>';
                  }
                } else {
                  return '<spann class="negative">Nie</spann>';
                }
              },
            },
            {
              orderable: true,
              data: "connections.wms",
              width: "72px",
              render: function (data) {
                if (data !== null) {
                  if (data.enabled) {
                    return '<spann class="positive">Tak</spann>';
                  } else {
                    return '<spann class="noneexisting">Brak</spann>';
                  }
                } else {
                  return '<spann class="noneexisting">Brak</spann>';
                }
              },
            },
            {
              orderable: true,
              data: "connections.onlineOffer",
              width: "72px",
              render: function (data) {
                if (data !== null) {
                  if (data.enabled) {
                    return '<spann class="positive">Tak</spann>';
                  } else {
                    return '<spann class="medium">Dodaj</spann>';
                  }
                } else {
                  return '<spann class="noneexisting">Brak</spann>';
                }
              },
            },
            {
              orderable: false,
              data: null,
              width: "108px",
              defaultContent:
                '<div class="action-container"><a href="#" class="buttonoutline editme w-button">Przejdź</a></div>',
            },
          ],
        });

        $("#table_wholesalers").on("click", "tr", function () {
          var rowData = table.row(this).data();
          document.location =
            "https://" +
            DomainName +
            "/app/wholesalers/wholesaler?shopKey=" +
            shopKey +
            "&wholesalerKey=" +
            rowData.wholesalerKey;
        });
      }
      if (request.status == 401) {
        console.log("Unauthorized");
      }
    };
    request.send();
  }

  makeWebflowFormAjaxDelete = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#ShopDeleteSuccess", container);
        var failBlock = $("#ShopDeleteFail", container);
        var action = InvokeURL + "shops/" + shopKey;
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
                "https://" +
                DomainName +
                "/app/tenants/organization?name=" +
                OrganizationName +
                "&clientId=" +
                ClientID;
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
  makeWebflowFormAjax = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#form-doneEditShopInformation", container);
        var failBlock = $("#form-failEditShopInformation", container);
        var action = InvokeURL + "shops/" + shopKey;
        var data = [
          {
            op: "add",
            path: "/name",
            value: $("#NewShopName").val(),
          },
          {
            op: "add",
            path: "/key",
            value: $("#NewShopKey").val(),
          },
          {
            op: "add",
            path: "/address/country",
            value: $("#NewShopCountry").val(),
          },
          {
            op: "add",
            path: "/address/line1",
            value: $("#NewShopLine").val(),
          },
          {
            op: "add",
            path: "/address/town",
            value: $("#NewShopTown").val(),
          },
          {
            op: "add",
            path: "/address/state",
            value: $("#NewShopState").val(),
          },
          {
            op: "add",
            path: "/address/postcode",
            value: $("#NewShopPostCode").val(),
          },
        ];
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
          data: JSON.stringify(data),
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
            doneBlock.fadeOut(3000);
            failBlock.hide();
            window.setTimeout(function () {
              location.reload();
            }, 3500);
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

  makeWebflowFormAjaxRefreshOffer = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#wf-form-RefreshOfferFormdone", container);
        var failBlock = $("#wf-form-RefreshOfferFormfail", container);
        var action = InvokeURL + "shops/" + shopKey + "/offers";
        var method = "POST";
        var data = "";

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
          data: JSON.stringify(data),
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                doneBlock.hide();
                failBlock.show();
                return;
              }
            }
            form.show();
            doneBlock.show();
            doneBlock.fadeOut(3000);
            failBlock.hide();
            window.setTimeout(function () {
              location.reload();
            }, 3500);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";
            var MessageText = document.getElementById("WarningMessageMain");
            if (jqXHR.status === 0) {
              msg = "Not connect.\n Verify Network.";
            } else if (jqXHR.status === 403) {
              msg = "Oops! Coś poszło nie tak. Proszę spróbuj ponownie.";
            } else if (jqXHR.status === 500) {
              msg = "Internal Server Error [500].";
            } else if (exception === "parsererror") {
              msg = "Requested JSON parse failed.";
            } else if (exception === "timeout") {
              msg = "Time out error.";
            } else if (exception === "abort") {
              msg = "Ajax request aborted.";
            } else {
              msg = "" + jqXHR.responseText;
            }
            MessageText.textContent = msg;
            $("#WarningMessageContainer").fadeOut(3000);
            form.show();
            doneBlock.hide();
            failBlock.show();
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  function FileUpload() {
    $("#waitingdots").show();
    const xhr = new XMLHttpRequest();
    var formData = new FormData();

    var myUploadedFiles = document.getElementById("orderfile").files;
    for (var i = 0; i < myUploadedFiles.length; i++) {
      formData.append("file", myUploadedFiles[i]);
    }
    formData.append("name", $("#OrderName").val());
    console.log(formData);
    var action = InvokeURL + "shops/" + shopKey + "/orders";
    xhr.open("POST", action);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Authorization", orgToken);
    xhr.onreadystatechange = function() {
      $("#waitingdots").hide();
      if (xhr.status === 201 ) {
        var response = JSON.parse(xhr.responseText);
        var action =
          InvokeURL + "shops/" + shopKey + "/orders/" + response.orderId;
        var method = "PATCH";
        var data = [{
          op: "add",
          path: "/name",
          value: $("#OrderName").val(),
        }, ];
        $.ajax({
          type: method,
          url: action,
          cors: true,
          beforeSend: function() {
            $("#waitingdots").show();
          },
          complete: function() {
            $("#waitingdots").hide();
          },
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify(data),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: orgToken,
          },
          success: function(resultData) {
            document.getElementById(
              "wf-form-doneCreate-Order"
            ).style.display = "block";
            window.setTimeout(function() {
              window.location.replace(
                "https://" +
                DomainName +
                "/app/orders/order?orderId=" +
                response.orderId +
                "&shopKey=" +
                shopKey
              );
            }, 100);
          },
          error: function(jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
          },
        });
      }
      else {
          jsonResponse = JSON.parse(xhr.responseText);
          console.log(xhr);
          var msg = "";
          if (xhr.status === 0) {
            msg = "Not connect.\n Verify Network."; 
          } else if (xhr.status === 400) {
            msg = jsonResponse.message;
          } else if (xhr.status === 403) {
            msg = "Oops! Coś poszło nie tak. Proszę spróbuj ponownie.";
          } else if (xhr.status === 500) {
            msg = "Internal Server Error [500].";
          } else {
            msg = jsonResponse.message;
          }
          $(".warningmessagetext").text(msg);
          $("#wf-form-failCreate-Order").show();
          $("#orderfile").val('');
          $("#wf-form-failCreate-Order").fadeOut(9000);
      }
    };
    xhr.send(formData);
  }

  

  UploadButton.addEventListener("click", (event) => {
    FileUpload();
  });

  makeWebflowFormAjaxDelete($("#wf-form-DeleteShop"));
  makeWebflowFormAjax($("#wf-form-EditShopInformation"));
  makeWebflowFormAjaxRefreshOffer($("#wf-form-RefreshOfferForm"));

  getWholesalers();
  getShop();
  getOrders();
  getOffers();
  getPriceLists();

  $('div[role="tablist"]').click(function () {
    setTimeout(function () {
      console.log("Adjusting");
      $.fn.dataTable
        .tables({
          visible: true,
          api: true,
        })
        .columns.adjust();
    }, 300);
  });
  $("#table_pricelists_list").on("show", function (e) {
    $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
  });
  $("#table_wholesalers").on("show", function (e) {
    $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
  });
  $("#table_orders").on("show", function (e) {
    $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
  });
  $("#table_offers").on("show", function (e) {
    $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
  });
});
