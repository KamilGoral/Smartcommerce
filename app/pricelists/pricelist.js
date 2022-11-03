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
  var OrganizationName = sessionStorage.getItem("OrganizationName");
  var shopKey = new URL(location.href).searchParams.get("shopKey");
  var priceListId = new URL(location.href).searchParams.get("priceListId");
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var formIdEditPriceList = "#wf-form-UpdatePriceList";
  var formIdDeletePriceList = "#wf-form-DeletePriceList";
  var OrganizationClientId = getCookie("sprytnyOrganizationclientId");
  var formIdEditPriceList = "#wf-form-UpdatePriceList";
  var formIdDeletePriceList = "#wf-form-DeletePriceList";

  const OrganizationBread0 = document.getElementById("OrganizationBread0");
  const priceListIdBread = document.getElementById("priceListIdBread");
  priceListIdBread.setAttribute("href", window.location.href);
  const priceListIdBreadBig = document.getElementById("priceListIdBreadBig");
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

  function getPriceList() {
    getShops();

    var request = new XMLHttpRequest();
    let endpoint = new URL(InvokeURL + "price-lists/" + priceListId);

    request.open("GET", endpoint.toString(), true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Accept", "application/json");
    request.onload = function () {
      var data = JSON.parse(this.response);

      if (request.status >= 200 && request.status < 400) {
        const wholesalerKey = document.getElementById("wholesalerKey");
        const createdBy = document.getElementById("createdBy");
        const createDate = document.getElementById("createDate");
        const lastModificationDate = document.getElementById(
          "lastModificationDate"
        );
        const startDate = document.getElementById("startDate");
        const endDate = document.getElementById("endDate");
        shopKeysStart = data.shopKeys;

        function ToHumanTime(data) {
          var offset = new Date().getTimezoneOffset();
          var localeTime = new Date(
            Date.parse(data) - offset * 60 * 1000
          ).toISOString();
          var creationDate = localeTime.split("T");
          var creationTime = creationDate[1].split("Z");
          var humanTime = creationDate[0] + " " + creationTime[0].slice(0, -4);
          return humanTime;
        }
        wholesalerKey.textContent = data.wholesalerKey;
        createdBy.textContent = data.createdBy;
        createDate.textContent = ToHumanTime(data.createDate);
        lastModificationDate.textContent = ToHumanTime(
          data.lastModificationDate
        );
        startDate.textContent = ToHumanTime(data.startDate);
        $("#startDate").datepicker("setDate", new Date(data.startDate));
        endDate.textContent = ToHumanTime(data.endDate);
        $("#endDate").datepicker("setDate", new Date(data.endDate));

        const select = document.getElementById("shopKeys");
        var ShopArray = data.shopKeys;
        for (const option of document.querySelectorAll("#shopKeys option")) {
          const value = option.value;
          if (ShopArray.indexOf(value) !== -1) {
            option.setAttribute("selected", "selected");
          } else {
            option.removeAttribute("selected");
          }
        }

        $("option").mousedown(function (e) {
          e.preventDefault();
          $(this).prop("selected", !$(this).prop("selected"));
          return false;
        });
        var myValidProducts = data.products;

        $(document).ready(function () {
          var tables = $.fn.dataTable.fnTables(true);

          $(tables).each(function () {
            $(this).dataTable().fnDestroy();
          });

          var validproductsTable = $("#pricelistproducts").DataTable({
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
            data: myValidProducts,
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
      } else {
        console.log("error");
      }
    };
    request.send();
  }

  makeWebflowFormAjaxEditPriceList = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#wf-form-DoneUpdatePriceList", container);
        var failBlock = $("#wf-form-FailUpdatePriceList", container);
        var action = InvokeURL + "price-lists/" + priceListId;
        var method = "PATCH";
        var data = [
          {
            op: "replace",
            path: "/startDate",
            value: $("#startDate").val() + "T00:00:01.00Z",
          },
          {
            op: "replace",
            path: "/endDate",
            value: $("#endDate").val() + "T23:59:59.00Z",
          },
        ];

        function symmetricDifference(a1, a2) {
          var result = [];
          for (var i = 0; i < a1.length; i++) {
            if (a2.indexOf(a1[i]) === -1) {
              data.push({
                op: "remove",
                path: "/shopKeys/-",
                value: a1[i],
              });
            }
          }
          for (i = 0; i < a2.length; i++) {
            if (a1.indexOf(a2[i]) === -1) {
              data.push({
                op: "add",
                path: "/shopKeys/-",
                value: a2[i],
              });
            }
          }
        }

        symmetricDifference(shopKeysStart, $("#shopKeys").val());

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
            console.log(resultData);

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

            $("#wf-form-DoneUpdatePriceList").show();
            $("#wf-form-DoneUpdatePriceList").fadeOut(3000);
            failBlock.hide();
            window.setTimeout(function () {
              window.location.replace(window.location.href);
            }, 1000);
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

  makeWebflowFormAjaxDeletePriceList = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#wf-form-DoneDeletePriceList", container);
        var failBlock = $("#wf-form-FailDeletePriceList", container);

        if (shopKey) {
          var action =
            InvokeURL + "shops/" + shopKey + "/price-lists/" + priceListId;
        } else {
          var action = InvokeURL + "price-lists/" + priceListId;
        }
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
            console.log(resultData);

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
            form.hide();
            doneBlock.show();
            failBlock.hide();
            window.setTimeout(function () {
              window.location.replace(
                "https://" +
                  DomainName +
                  "/app/tenants/organization?name=" +
                  OrganizationName +
                  "&clientId=" +
                  OrganizationClientId
              );
            }, 2000);
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
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

  makeWebflowFormAjaxDeletePriceList($(formIdDeletePriceList));
  makeWebflowFormAjaxEditPriceList($(formIdEditPriceList));
  getPriceList();
});
