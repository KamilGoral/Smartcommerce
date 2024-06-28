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
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

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
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var DomainName = getCookie("sprytnyDomainName");
  const emailElement = document.getElementById("useremail");
  emailElement.textContent = getCookie("sprytnyUser");
  var shopKey = new URL(location.href).searchParams.get("shopKey");
  var offerId = new URL(location.href).searchParams.get("offerId");
  var integrationKeyId = "merchant-console";
  var smartToken = getCookie("sprytnycookie");
  document.getElementById("waitingdots").style.display = "flex";
  document.getElementById("Sample-Integration").style.display = "none";
  var ClientID = getCookieNameByValue(orgToken);
  var OrganizationName = getCookie("OrganizationName");
  const IntegrationBread = document.getElementById("IntegrationBread");
  IntegrationBread.setAttribute("href", window.location.href);
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

  function getIntegrations() {
    let url = new URL(InvokeURL + "integrations/merchant-console");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        document.getElementById("Sample-Integration").style.display = "grid";

        const integrationDescription = document.getElementById(
          "integrationDescription"
        );
        integrationDescription.textContent = data.description;

        const integrationLogo = document.getElementById("integrationLogo");
        integrationLogo.src = "data:image/png;base64," + data.image;

        const integrationStatus = document.getElementById("integrationStatus");
        const integrationButton = document.getElementById("integrationButton");
        const integrationBlock = document.getElementById("enabledblock");

        if (data.enabled === true) {
          integrationStatus.textContent = "Aktywny";
          integrationStatus.style.color = "green";
          integrationButton.value = "Zmień dane logowania";
          getShops();
          integrationBlock.style.display = "flex";
        } else {
          integrationStatus.textContent = "Nieaktywny";
        }

        if (data.credentials) {
          const integrationLogin = document.getElementById("Username");
          integrationLogin.value = data.credentials.username || "";

          const integrationHost = document.getElementById("Host");
          integrationHost.value = data.credentials.host || "";

          const integrationPort = document.getElementById("Port");
          integrationPort.value = data.credentials.port || "";

          const integrationEngine = document.getElementById("engine");
          integrationEngine.value = data.credentials.engine || "";

          const integrationDbName = document.getElementById("dbname");
          integrationDbName.value = data.credentials.dbname || "";
        } else {
          console.warn("Credentials data is missing or undefined.");
        }
      } else if (request.status === 401) {
        console.log("Unauthorized");
      }
    };
    request.send();
  }

  function getShops() {
    async function getIDS() {
      let times = [{ id: "", shortName: "" }];
      let url2 = new URL(
        InvokeURL + "integrations/merchant-console/shops?perPage=1000"
      );
      let request2 = new XMLHttpRequest();
      request2.open("GET", url2, true);
      request2.setRequestHeader("Authorization", orgToken);
      request2.onload = async function () {
        var data2 = JSON.parse(this.response);
        var toParse2 = data2.items;
        if (request2.status >= 200 && request2.status < 400) {
          toParse2.forEach((item) => {
            times.push({
              id: item.id,
              shortName: item.shortName,
            });
          });
          createAll(times);
          return await new Promise(
            (resolve) => (request2.onload = resolve(times))
          );
        }
        if (request2.status == 401) {
          console.log("Unauthorized");
          console.log(times);
          return await new Promise(
            (resolve) => (request2.onload = resolve(times))
          );
        }
      };
      request2.send();
    }

    function format(d) {
      var toDisplayHtml =
        "<tr><td>Nazwa:</td><td>" +
        d.name +
        "</td><tr><td>Konsola-Kupca SklepId:</td><td>" +
        d.merchantConsoleShopId +
        "</td><tr><td>Klucz Sklepu:</td><td>" +
        d.shopKey +
        "</td>";
      return (
        "<table style='display: flex;' ><tr><th></th><th></th></tr>" +
        toDisplayHtml +
        "</table>"
      );
    }

    function createAll(sklepy) {
      const optionsHTML = sklepy.reduce(
        (html, value) =>
          html + `<option value=${value.id}>${value.shortName}</option>`,
        ""
      );
      const selectHTML = `<select class="id100">${optionsHTML}</select>`;

      let url = new URL(InvokeURL + "shops?perPage=100");
      let request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.setRequestHeader("Authorization", orgToken);
      request.onload = function () {
        var data2 = JSON.parse(this.response);
        var table = $("#table_integrated_shops_list").DataTable({
          data: data2.items,
          pagingType: "full_numbers",
          order: [],
          dom: '<"top">frt<"bottom"lip>',
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
              class: "details-control",
              data: null,
              defaultContent: "",
            },
            {
              orderable: true,
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
              data: "shopKey",
              visible: false,
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
              data: "merchantConsoleShopId",
              render: function (data) {
                return selectHTML.toString();
              },
            },
          ],
          rowCallback: function (row, data) {
            var pickMe = data.merchantConsoleShopId;
            if (data.merchantConsoleShopId === null) {
              pickMe = "";
            }
            $("td:eq(2) select", row).val(data.merchantConsoleShopId);
            $("td:eq(2) select", row).change();
          },
        });

        $("#table_integrated_shops_list").on(
          "click",
          "td.details-control",
          function () {
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

        $(".id100").on("focusin", function () {
          $(this).data("val", parseInt($(this).val()));
        });

        $(".id100").on("change", function () {
          var shopKey = table.row($(this).closest("tr")).data().shopKey;
          var previousMCSId = $(this).data("val");
          var merchantConsoleShopId = parseInt($(this).val());

          var payload = [];
          var method = "PATCH";

          if (isNaN(merchantConsoleShopId)) {
            var action =
              InvokeURL +
              "integrations/merchant-console/shops/" +
              previousMCSId;
            console.log("delete");
            var content = {
              op: "remove",
              path: "/shopKey",
            };
            payload.push(content);
          } else if (previousMCSId > 0) {
            console.log("Deleting old one");
            $.ajax({
              type: method,
              async: false, // important
              url:
                InvokeURL +
                "integrations/merchant-console/shops/" +
                previousMCSId,
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
              data: JSON.stringify([{ op: "remove", path: "/shopKey" }]),
              processData: false,
              success: function (resultData) {
                $(".warningmessagetext").css("color", "#ffffff");
                if (isNaN(merchantConsoleShopId)) {
                  $(".warningmessagetext").text(
                    "Sukces. Pomyślnie usunięto integracje sklepu z Konsolą Kupca"
                  );
                } else {
                  $(".warningmessagetext").text(
                    "Sukces. Pomyślnie zintegrowano sklep z Konsolą Kupca"
                  );
                }
                $(".error-message-fixed-main").css(
                  "background-color",
                  "#00754e"
                );
                $("#WarningMessageContainer").show();
                $("#WarningMessageContainer").fadeOut(6000);

                if (typeof successCallback === "function") {
                  result = successCallback(resultData);
                  if (!result) {
                    return;
                  }
                }
              },
              error: function (jqXHR, exception) {
                var msg = "";
                if (jqXHR.status === 0) {
                  msg = "Nie masz połączenia z internetem.";
                } else if (jqXHR.status == 404) {
                  msg = "Nie znaleziono strony";
                } else if (jqXHR.status == 403) {
                  msg = "Nie masz uprawnień do tej czynności";
                } else if (jqXHR.status == 409) {
                  msg =
                    "Nie można zmienić kodu. Jeden ze sklepów wciąż korzysta z tego kodu.";
                } else if (jqXHR.status == 500) {
                  msg =
                    "Serwer napotkał problemy. Prosimy o kontakt kontakt@smartcommerce.net [500].";
                } else if (exception === "parsererror") {
                  msg = "Nie udało się odczytać danych";
                } else if (exception === "timeout") {
                  msg = "Przekroczony czas oczekiwania";
                } else if (exception === "abort") {
                  msg = "Twoje żądanie zostało zaniechane";
                } else {
                  msg = "" + jqXHR.responseText;
                }

                $(".warningmessagetext").css("color", "#3a4570");
                $(".warningmessagetext").text(msg);
                $(".error-message-fixed-main").css(
                  "background-color",
                  "#ffc53d"
                );
                $("#WarningMessageContainer").show();
                $("#WarningMessageContainer").fadeOut(6000);
                return;
              },
            });
            var action =
              InvokeURL +
              "integrations/merchant-console/shops/" +
              merchantConsoleShopId;
            var content = {
              op: "add",
              path: "/shopKey",
              value: shopKey,
            };
            payload.push(content);
          } else {
            console.log("add");
            var action =
              InvokeURL +
              "integrations/merchant-console/shops/" +
              merchantConsoleShopId;
            var content = {
              op: "add",
              path: "/shopKey",
              value: shopKey,
            };
            payload.push(content);
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
            data: JSON.stringify(payload),
            processData: false,
            success: function (resultData) {
              $(".warningmessagetext").css("color", "#ffffff");
              if (isNaN(merchantConsoleShopId)) {
                $(".warningmessagetext").text(
                  "Sukces. Pomyślnie usunięto integracje sklepu z Konsolą Kupca"
                );
              } else {
                $(".warningmessagetext").text(
                  "Sukces. Pomyślnie zintegrowano sklep z Konsolą Kupca"
                );
              }
              $(".error-message-fixed-main").css("background-color", "#00754e");
              $("#WarningMessageContainer").show();
              $("#WarningMessageContainer").fadeOut(6000);

              if (typeof successCallback === "function") {
                result = successCallback(resultData);
                if (!result) {
                  return;
                }
              }
            },
            error: function (jqXHR, exception) {
              var msg = "";
              if (jqXHR.status === 0) {
                msg = "Nie masz połączenia z internetem.";
              } else if (jqXHR.status == 404) {
                msg = "Nie znaleziono strony";
              } else if (jqXHR.status == 403) {
                msg = "Nie masz uprawnień do tej czynności";
              } else if (jqXHR.status == 409) {
                msg =
                  "Nie można zmienić kodu. Jeden ze sklepów wciąż korzysta z tego kodu.";
              } else if (jqXHR.status == 500) {
                msg =
                  "Serwer napotkał problemy. Prosimy o kontakt kontakt@smartcommerce.net [500].";
              } else if (exception === "parsererror") {
                msg = "Nie udało się odczytać danych";
              } else if (exception === "timeout") {
                msg = "Przekroczony czas oczekiwania";
              } else if (exception === "abort") {
                msg = "Twoje żądanie zostało zaniechane";
              } else {
                msg = "" + jqXHR.responseText;
              }

              $(".warningmessagetext").css("color", "#3a4570");
              $(".warningmessagetext").text(msg);
              $(".error-message-fixed-main").css("background-color", "#ffc53d");
              $("#WarningMessageContainer").show();
              $("#WarningMessageContainer").fadeOut(6000);
              return;
            },
          });
        });
      };
      request.send();
    }

    async function main() {
      let result = await getIDS();
    }
    main();
  }

  makeWebflowFormAjaxCreate = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $(".w-form-done2", container);
        var failBlock = $(".w-form-fail2", container);
        var inputdata = form.serializeArray();

        var data = {
          username: inputdata[0].value,
          password: inputdata[1].value,
          host: inputdata[2].value.trim(),
          port: parseInt(inputdata[3].value.trim()),
          engine: inputdata[4].value,
          dbname: inputdata[5].value.trim(),
        };

        $.ajax({
          type: "PUT",
          url: InvokeURL + "integrations/merchant-console",
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
            form.hide();
            doneBlock.show();
            failBlock.hide();
            window.setTimeout(function () {
              location.reload();
            }, 1000);
          },
          error: function (jqXHR, exception) {
            var msg =
              "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
            var elements =
              document.getElementsByClassName("warningmessagetext");
            for (var i = 0; i < elements.length; i++) {
              elements[i].textContent = msg;
            }
            form.show();
            failBlock.show();
            failBlock.fadeOut(5000);
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxDelete = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#IntegrationDeleteSuccess", container);
        var failBlock = $("#IntegrationDeleteFail", container);
        var action = InvokeURL + "integrations/" + integrationKeyId;
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
                return;
              }
            }
            form.show();
            doneBlock.show();
            failBlock.hide();
            window.setTimeout(function () {
              (document.location = "href"),
                "https://" +
                  DomainName +
                  "/app/tenants/organization?name=" +
                  OrganizationName +
                  "&clientId=" +
                  ClientID;
            }, 5000);
          },
          error: function (jqXHR, exception) {
            var msg =
              "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
            var elements =
              document.getElementsByClassName("warningmessagetext");
            for (var i = 0; i < elements.length; i++) {
              elements[i].textContent = msg;
            }
            form.show();
            failBlock.show();
            failBlock.fadeOut(5000);
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  getIntegrations();
  $("#waitingdots").hide();
  makeWebflowFormAjaxCreate($("#wf-form-pcmarket"));
  makeWebflowFormAjaxDelete($("#wf-form-DeleteIntegration"));
});
