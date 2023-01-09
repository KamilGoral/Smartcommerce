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

docReady(function() {
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };
  var orgToken = getCookie("sprytnyToken");
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var DomainName = getCookie("sprytnyDomainName");
  var shopKey = new URL(location.href).searchParams.get("shopKey");
  var offerId = new URL(location.href).searchParams.get("offerId");
  var integrationKeyId = "merchant-console"
  var smartToken = getCookie("sprytnycookie");
  document.getElementById('waitingdots').style.display = "flex";
  document.getElementById('Sample-Integration').style.display = "none";
  var ClientID = sessionStorage.getItem('OrganizationclientId')
  var OrganizationName = sessionStorage.getItem('OrganizationName')
  const IntegrationBread = document.getElementById("IntegrationBread");
  IntegrationBread.setAttribute("href", window.location.href);
  const OrganizationBread0 = document.getElementById("OrganizationBread0");
  OrganizationBread0.textContent = OrganizationName;
  OrganizationBread0.setAttribute("href", "https://" + DomainName + "/app/tenants/organization?name=" + OrganizationName + "&clientId=" + ClientID);

  function getIntegrations() {
    let url = new URL(InvokeURL + 'integrations/merchant-console');
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function() {
      var data = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        document.getElementById('Sample-Integration').style.display = "grid";

        const integrationDescription = document.getElementById('integrationDescription');
        integrationDescription.textContent = data.description;
        const integrationLogo = document.getElementById('integrationLogo');
        integrationLogo.src = 'data:image/png;base64,' + data.image;
        const integrationStatus = document.getElementById('integrationStatus');
        const integrationButton = document.getElementById('integrationButton');

        if (data.enabled === true) {
          integrationStatus.textContent = "Aktywny";
          integrationStatus.style.color = 'green';
          integrationButton.value = "Zmień dane logowania";
        } else {
          integrationStatus.textContent = "Nieaktywny";
        };
        const integrationLogin = document.getElementById('Username');
        integrationLogin.value = data.credentials.username;
        const integrationHost = document.getElementById('Host');
        integrationHost.value = data.credentials.host;
        const integrationPort = document.getElementById('Port');
        integrationPort.value = data.credentials.port;
        const integrationEngine = document.getElementById('engine');
        integrationEngine.value = data.credentials.engine;
        const integrationDbName = document.getElementById('dbname');
        integrationDbName.value = data.credentials.dbname;
        if (request.status === 401) {
          console.log("Unauthorized");
        };
      };
    };
    request.send();
  };

  function getShops() {

    async function getIDS() {
      let times = [""]
      let url2 = new URL(InvokeURL + 'integrations/merchant-console/shops');
      let request2 = new XMLHttpRequest();
      request2.open('GET', url2, true);
      request2.setRequestHeader("Authorization", orgToken);
      request2.onload = async function() {
        var data2 = JSON.parse(this.response);
        var toParse2 = data2.items;
        if (request2.status >= 200 && request2.status < 400) {
          toParse2.forEach((item) => {
            times.push(item.id);
          });
          createAll(times)
          return await new Promise(resolve => request2.onload = resolve(times));
        };
        if (request2.status == 401) {
          console.log("Unauthorized");
          console.log(times)
          return await new Promise(resolve => request2.onload = resolve(times));
        }
      }
      request2.send();
    }

    function createAll(sklepy) {
      const optionsHTML = sklepy.reduce((html, value) => html + `<option value="${value}">${value}</option>`, "");
      const selectHTML = `<select class="id100">${optionsHTML}</select>`;

      let url = new URL(InvokeURL + "shops");
      let request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.setRequestHeader("Authorization", orgToken);
      request.onload = function() {
        var data2 = JSON.parse(this.response);
        var table = $("#table_integrated_shops_list").DataTable({
          data: data2.items,
          pagingType: "full_numbers",
          order: [],
          dom: '<"top">frt<"bottom"lip>',
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
          columns: [{
              orderable: false,
              data: null,
              width: "36px",
              defaultContent: "<div class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61ae41350933c525ec8ea03a_office-building.svg' alt='offer'></img></div>",
            },
            {
              orderable: true,
              data: "name",
              render: function(data) {
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
              render: function(data) {
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
              "render": function(data) {
                return selectHTML.toString()
              }
            }
          ],
          rowCallback: function(row, data) {
            $("td:eq(3) select", row).val(data.merchantConsoleShopId);
            $("td:eq(3) select", row).change();
          }
        });
        $("#table_integrated_shops_list").on("change", "select", function() {
          var merchantConsoleShopId = parseInt($(this).val());
          var row = $(this).closest('tr');
          var shopKey = table.row(row).data().shopKey;
          var previousMCSId = table.row(row).data().merchantConsoleShopId;
          console.log(previousMCSId)
          // Pobierz dane z kolumny o nazwie "name"
          var columnData = table.column('name:merchantConsoleShopId').data();
          console.log(columnData)
          ///dodać wielątkowanie replace a add a null na usuniecie

          console.log(sklepy)
          console.log(merchantConsoleShopId)

          var payload = [];

          if (merchantConsoleShopId === 0) {
              var action = InvokeURL + "integrations/merchant-console/shops/" + merchantConsoleShopId;
              var method = "DELETE";
              var content = {
                op: "remove",
                path: "/shopKey",
              };
              payload.push(content);
          } else if (sklepy.indexOf(merchantConsoleShopId) >= 0) {
            var action = InvokeURL + "integrations/merchant-console/shops/" + merchantConsoleShopId;
            var method = "DELETE";
          } else {
            var action = InvokeURL + "integrations/merchant-console/shops/" + merchantConsoleShopId;
            var method = "DELETE";
          }
        
          
          console.log(shopKey);


          var payload = [];
          var product = {
            op: "add",
            path: "/shopKey",
            value: shopKey,
          };
          payload.push(product);
          var action = InvokeURL + "integrations/merchant-console/shops/" + merchantConsoleShopId;
          var method = "PATCH";
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
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: orgToken,
            },
            data: JSON.stringify(payload),
            processData: false,
            success: function(resultData) {
              console.log("success");
              console.log(resultData);
              $(".warningmessagetext").text("Sukces. Pomyślnie zintegrowano sklep z Konsolą Kupca");
              $(".error-message-fixed-main").css("background-color", "#52c41a");
              $("#WarningMessageContainer").show();
              $("#WarningMessageContainer").fadeOut(6000);
              // setTimeout(() => {
              //   console.log("Delayed for 6 second.");
              //   location.reload()
              // }, "6000")
              

              if (typeof successCallback === "function") {
                result = successCallback(resultData);
                if (!result) {
                  return;
                }
              }

            },
            error: function(jqXHR, exception) {
              console.log("error")
              console.log(jqXHR);
              console.log(exception);
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

              $(".warningmessagetext").text(msg);
              $(".error-message-fixed-main").css("background-color", "#ffc53d");
              $("#WarningMessageContainer").show();
              $("#WarningMessageContainer").fadeOut(6000);
              // setTimeout(() => {
              //   console.log("Delayed for 6 second.");
              //   location.reload()
              // }, "6000")
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




  var formIdPcMarket = "#wf-form-pcmarket";

  makeWebflowFormAjaxCreate = function(forms, successCallback, errorCallback) {
    forms.each(function() {
      var form = $(this);
      form.on("submit", function(event) {
        var container = form.parent();
        var doneBlock = $(".w-form-done", container);
        var failBlock = $(".w-form-fail", container);
        var action = InvokeURL + "shops";

        var inputdata = form.serializeArray();

        var data = {
          'username': inputdata[0].value,
          'password': inputdata[1].value,
          'host': inputdata[2].value,
          'port': parseInt(inputdata[3].value),
          'engine': inputdata[4].value,
          'dbname': inputdata[5].value
        };


        $.ajax({
          type: "PUT",
          url: InvokeURL + "integrations/pcmarket",
          cors: true,
          beforeSend: function() {
            $('#waitingdots').show();
          },
          complete: function() {
            $('#waitingdots').hide();
          },
          contentType: 'application/json',
          dataType: 'json',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': orgToken
          },
          data: JSON.stringify(data),
          success: function(resultData) {
            if (typeof successCallback === 'function') {
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
            window.setTimeout(function() {
              location.reload();
            }, 1000);
          },
          error: function(e) {
            if (typeof errorCallback === 'function') {
              errorCallback(e)
            }
            form.show();
            doneBlock.hide();
            failBlock.show();
            console.log(e);
          }
        });
        event.preventDefault();
        return false;
      });
    });
  };

  getIntegrations();
  getShops();
  $('#waitingdots').hide();
  makeWebflowFormAjaxCreate($(formIdPcMarket));

})
