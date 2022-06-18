console.log("Script Loaded v3");
function docReady(fn) {
  // see if DOM is already available
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // call on next available tick
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

  var Webflow = Webflow || [];
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var orgToken = getCookie("sprytnyToken");
  var DomainName = getCookie("sprytnyDomainName");
  var userKey = getCookie("sprytnyUsername");
  var clientId = new URL(location.href).searchParams.get("clientId");
  var organizationName = new URL(document.location.href).searchParams.get(
    "name"
  );
  var formId = "#wf-form-NewOrganizationName";
  var formIdDelete = "#wf-form-DeleteOrganization";
  var formIdInvite = "#wf-form-Invite-User";
  var formIdCreate = "#wf-form-Create-Shop";
  const orgName = document.getElementById("orgName");
  const OrganizationBread0 = document.getElementById("OrganizationBread0");
  const OrganizationNameHeader = document.getElementById("organizationName");
  orgName.textContent = organizationName;
  OrganizationNameHeader.textContent = organizationName;
  OrganizationBread0.textContent = organizationName;
  OrganizationBread0.setAttribute(
    "href",
    "https://" +
      DomainName +
      "/app/tenants/organization?name=" +
      organizationName +
      "&clientId=" +
      clientId
  );

  function LogoutNonUser() {
    if (
      getCookie("sprytnyInvokeURL") == null ||
      getCookie("sprytnycookie") == null ||
      getCookie("sprytnyToken") == null ||
      getCookie("sprytnyDomainName") == null
    ) {
      alert("Twoja sesja wygasła.");
      window.location.href = "https://sprytnykupiec.pl/login-page";
    }
  }

  function getUserRole() {
    var request = new XMLHttpRequest();
    let endpoint = new URL(InvokeURL + "users/" + userKey);
    request.open("GET", endpoint, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);

      if (request.status >= 200 && request.status < 400) {
        console.log(data);
        console.log(data.role);
        document.cookie = "sprytnyUserRole=" + data.role;
        +"; expires=Fri, 31 Dec 9999 23:59:59 GMT";
      } else {
        console.log("error");
      }
    };

    // Send request
    request.send();
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
        const shopContainer = document.getElementById("Shops-Container");
        toParse.forEach((shop) => {
          const style = document.getElementById("sampleRowShops");
          const row = style.cloneNode(true);
          row.setAttribute("id", "");
          row.style.display = "flex";
          const shopName = row.getElementsByTagName("H6")[1];
          shopName.textContent = shop.name;
          const shopKey = row.getElementsByTagName("H6")[0];
          shopKey.textContent = shop.shopKey;
          row.setAttribute(
            "href",
            "https://" +
              DomainName +
              "/app/shops/shop" +
              "?shopKey=" +
              shop.shopKey
          );
          shopContainer.appendChild(row);
        });
        if (request.status == 401) {
          console.log("Unauthorized");
        }
      }
      if (request.status >= 200 && request.status < 400 && data.total == 0) {
        const emptystateshops = document.getElementById("emptystateshops");
        emptystateshops.style.display = "flex";
      }
    };
    request.send();
  }

  function getUsers() {
    let url = new URL(InvokeURL + "users");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      if (request.status >= 200 && request.status < 400) {
        const userContainer = document.getElementById("Users-Container");
        toParse.forEach((user) => {
          const style = document.getElementById("sampleRowUsers");
          const row = style.cloneNode(true);
          row.setAttribute("id", "");
          row.style.display = "flex";
          const userEmail = row.getElementsByTagName("H6")[1];
          userEmail.textContent = user.email;

          const userRole = row.getElementsByTagName("H6")[0];
          if (user.role == "admin") {
            userRole.textContent = "Admin";
          } else {
            userRole.textContent = "Użytkownik";
          }

          const userStatus = row.getElementsByTagName("H6")[3];
          if (user.status == "active") {
            userStatus.textContent = "Aktywny";
            userStatus.style.color = "green";
          } else {
            userStatus.textContent = "Oczekuję...";
          }
          row.setAttribute(
            "href",
            "https://" + DomainName + "/app/users/user" + "?id=" + user.id
          );
          userContainer.appendChild(row);
        });
        if (request.status == 401) {
          console.log("Unauthorized");
        }
      }
    };
    request.send();
  }

  function getWholesalers() {
    let url = new URL(InvokeURL + "wholesalers?perPage=1000");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      toParse.sort(function (a, b) {
        return b.enabled - a.enabled;
      });
      console.log(toParse);

      if (request.status >= 200 && request.status < 400) {
        $("#table_wholesalers_list").DataTable({
          data: toParse,
          pagingType: "full_numbers",
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
          columns: [
            {
              orderable: false,
              data: null,
              width: "36px",
              defaultContent:
                "<div class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61ae41350933c525ec8ea03a_office-building.svg' alt='offer'></img></div>",
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
              data: "taxId",
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
              data: "address",
              render: function (data) {
                if (data !== null) {
                  return (
                    data.state &&
                    data.state[0].toUpperCase() + data.state.slice(1)
                  );
                }
                if (data === null) {
                  return "";
                }
              },
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
              data: "onlineOfferSupport",
              render: function (data) {
                if (data !== null) {
                  if (data === true) {
                    return "Tak";
                  } else {
                    return "Nie";
                  }
                }
                if (data === null) {
                  return "";
                }
              },
            },
            {
              orderable: true,
              data: "enabled",
              render: function (data) {
                if (data !== null) {
                  if (data === true) {
                    return "Tak";
                  } else {
                    return "Nie";
                  }
                }
                if (data === null) {
                  return "";
                }
              },
            },
          ],
        });
      }
      if (request.status == 401) {
        console.log("Unauthorized");
      }
    };
    request.send();
  }

  function getIntegrations() {
    let url = new URL(InvokeURL + "integrations");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      if (request.status >= 200 && request.status < 400) {
        const integrationContainer = document.getElementById(
          "Integrations-Container"
        );
        toParse.forEach((integration) => {
          console.log(integration);
          const style = document.getElementById("Sample-Integration");
          const row = style.cloneNode(true);
          row.style.display = "flex";
          const integrationName = row.getElementsByTagName("H6")[1];
          integrationName.textContent = integration.name;
          const integrationLogo = row.getElementsByTagName("img")[0];
          integrationLogo.src = "data:image/png;base64," + integration.image;
          const integrationStatus = row.getElementsByTagName("H6")[3];
          if (integration.enabled === true) {
            integrationStatus.textContent = "Aktywny";
            integrationStatus.style.color = "green";
          } else {
            integrationStatus.textContent = "Oczekuję...";
          }

          if (integration.integrationKey === "retroactive") {
            row.setAttribute(
              "href",
              "https://" + DomainName + "/app/integrations/contracts"
            );
          } else {
            row.setAttribute(
              "href",
              "https://" +
                DomainName +
                "/app/integrations/integration?integrationKey=" +
                integration.integrationKey
            );
          }

          integrationContainer.appendChild(row);
        });
        if (request.status == 401) {
          console.log("Unauthorized");
        }
      }
    };
    request.send();
  }

  makeWebflowFormAjaxDelete = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $(".w-form-done", container);
        var failBlock = $(".w-form-fail", container);
        var endpoint =
          InvokeURL +
          "tenants/" +
          document.querySelector("#organizationName").textContent;

        $.ajax({
          type: "DELETE",
          url: endpoint,
          cors: true,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            $("#waitingdots").hide();
          },
          headers: {
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
            form.hide();
            doneBlock.show();
            failBlock.hide();
            window.setTimeout(function () {
              window.location = "https://" + DomainName + "/app/users/me";
            }, 500);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";
            if (jqXHR.status === 0) {
              msg = "Not connect.\n Verify Network.";
            } else if (jqXHR.status === 403) {
              msg = "Użytkownik nie ma uprawnień do usunięcia organizacji.";
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
            const message = document.getElementById("WarningMessage");
            message.textContent = msg;
            form.show();
            doneBlock.hide();
            failBlock.show();
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxInvite = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $(".w-form-done", container);
        var failBlock = $(".w-form-fail", container);
        var action = InvokeURL + "users";
        var data = {
          email: $("#InviteUserEmail").val(),
        };
        $.ajax({
          type: "POST",
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

            doneBlock.show();
            failBlock.hide();
            $("#InviteUserEmail").val("");
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";
            if (jqXHR.status === 0) {
              msg = "Not connect.\n Verify Network.";
            } else if (jqXHR.status === 403) {
              msg =
                "Użytkownika nie ma na liście osób uprawnionych do dołączenia do organizacji. Proszę skontaktuj się z nami w celu dodania uprawnień. kontakt@smartcommerce.net";
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
            const message = document.getElementById("WarningMessage");
            message.textContent = msg;
            form.show();
            doneBlock.hide();
            failBlock.show();
            return;
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
        event.preventDefault();
        var container = form.parent();
        var doneBlock = $(".w-form-done", container);
        var failBlock = $(".w-form-fail", container);
        var action = InvokeURL + "tenants/" + organizationName;
        var NewOrgName = $("#NewOrganizationName").val();

        var data = [
          {
            op: "replace",
            path: "/name",
            value: NewOrgName,
          },
        ];
        // call via ajax
        $.ajax({
          type: "PATCH",
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
            form.hide();
            doneBlock.show();
            failBlock.hide();
            window.setTimeout(function () {
              window.location = "https://" + DomainName + "/app/users/me";
            }, 500);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";
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
            const message = document.getElementById("WarningMessage");
            message.textContent = msg;
            form.show();
            doneBlock.hide();
            failBlock.show();
            return;
          },
        });
        // prevent default webdlow action
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxCreate = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $(".w-form-done", container);
        var failBlock = $(".w-form-fail", container);
        var action = InvokeURL + "shops";
        var data = {
          name: $("#newShopName").val(),
          shopKey: $("#newShopKey").val(),
        };
        $.ajax({
          type: "POST",
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
            form.hide();
            doneBlock.show();
            failBlock.hide();
            window.setTimeout(function () {
              location.reload();
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
      console.log(data);
      console.log(data.order.length);

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
        InvokeURL + "price-lists",
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
            var offset = new Date().getTimezoneOffset();
            var localeTime = new Date(
              Date.parse(data) - offset * 60 * 1000
            ).toISOString();
            var creationDate = localeTime.split("T");
            var creationTime = creationDate[1].split("Z");
            endDate = creationDate[0]; //+ ' ' + creationTime[0].slice(0, -4);

            return endDate;
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
        rowData.priceListId
    );
  });

  $("#table_wholesalers_list").on("click", "tr", function () {
    var rowData = table.row(this).data();
    window.location.replace(
      "https://" +
        DomainName +
        "/app/wholesalers/wholesaler?wholesalerKey=" +
        rowData.wholesalerKey
    );
  });

  $('div[role="tablist"]').click(function () {
    console.log("Adjusting");
    // We have to wait 100ms fade out is done
    setTimeout(() => {
      console.log("Delayed for 1 second.");
      $("#table_wholesalers_list").DataTable().columns.adjust();
      $("#table_pricelists_list").DataTable().columns.adjust();
    }, 200);
  });

  Webflow.push(function () {
    // display error message
    function displayError(message) {
      hideLoading();
      failureMessage.innerText = message;
      failureMessage.style.display = "block";
    }

    // hiding the loading indicator
    function hideLoading() {
      $("#waitingdots").hide();
    }

    // hide the form
    function hideForm() {
      form.style.display = "none";
    }

    // show the loading indicator
    function showLoading() {
      //hideForm(); if you want to hide the form --> uncomment
      $("#waitingdots").show();
    }

    // show the form
    function showForm() {
      form.style.display = "block";
    }

    // listen for xhr events
    function addListeners(xhr) {
      xhr.addEventListener("loadstart", showLoading);
    }

    // add xhr settings
    function addSettings(xhr) {
      xhr.timeout = requestTimeout;
    }

    // triggered form submit
    function triggerSubmit(event) {
      // prevent default behavior form submit behavior
      event.preventDefault();

      // setup + send xhr request
      var formData = {
        whname: $("#Wholesaler-Name").val(),
        taxId: $("#taxId").val(),
        platformUrl: $("#platformUrl").val(),
        form: "new-Wholesaler",
      };
      let xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        "https://hook.integromat.com/1xsh5m1qtu8wj7vns24y5tekcrgq2pc3"
      );
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      addListeners(xhr);
      addSettings(xhr);
      xhr.send(JSON.stringify(formData));

      // capture xhr response
      xhr.onload = function () {
        if (xhr.status === 200) {
          $("#waitingdots").hide();
          $("#wf-form-Create-wholesaler").hide();
          $("#wf-form-Create-wholesaler-done").show();

          setTimeout(function () {
            $("#wf-form-Create-wholesaler-done").hide();
          }, 3000);
        } else {
          displayError(errorMessage);
          $("#wf-form-Create-wholesaler-fail").show();

          setTimeout(function () {
            $("#wf-form-Create-wholesaler-fail").hide();
          }, 6000);
        }
      };

      // capture xhr request timeout
      xhr.ontimeout = function () {
        displayError(errorMessageTimedOut);
      };
      setTimeout(function () {
        window.location.reload();
      }, 4000);
    }

    // replace with your form ID
    const form = document.getElementById("wf-form-Create-wholesaler");

    // set the Webflow Error Message Div Block ID to 'error-message'
    let failureMessage = document.getElementById("WarningMessage");

    // set the Webflow Success Message Div Block ID to 'success-message'
    //let successMessage = document.getElementById('success-message');

    // set request timeout in milliseconds (1000ms = 1second)
    let requestTimeout = 100000;

    // error messages
    let errorMessageTimedOut = "Oops! Seems this timed out. Please try again.";
    let errorMessage = "Oops! Something went wrong. Please try again.";

    // capture form submit
    form.addEventListener("submit", triggerSubmit);
  });

  makeWebflowFormAjax($(formId));
  makeWebflowFormAjaxDelete($(formIdDelete));
  makeWebflowFormAjaxInvite($(formIdInvite));
  makeWebflowFormAjaxCreate($(formIdCreate));
  LogoutNonUser();
  getShops();
  getUsers();
  getIntegrations();
  getWholesalers();
});
