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
  var orgToken = getCookie("sprytnyToken");
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var DomainName = getCookie("sprytnyDomainName");
  var integrationKeyId = "pc-market";
  var smartToken = getCookie("sprytnycookie");
  document.getElementById("waitingdots").style.display = "flex";
  document.getElementById("integrationcontainer").style.display = "none";
  var ClientID = sessionStorage.getItem("OrganizationclientId");
  var OrganizationName = sessionStorage.getItem("OrganizationName");
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
    let url = new URL(InvokeURL + "integrations/" + integrationKeyId);
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        const integrationLogo = document.getElementById("whLogo");
        integrationLogo.src = "data:image/png;base64," + data.image;
        const integrationStatus = document.getElementById("integrationStatus");
        if (data.enabled) {
          return integrationStatus.innerHTML = '<label class="switchCss"><input type="checkbox" checked class="editor-active" "><span class="slider round"></span></label>';
        } else {
          return integrationStatus.innerHTML = '<label class="switchCss"><input type="checkbox" class="editor-active" "><span class="slider round"></span></label>';
        }
      }
      if (request.status === 401) {
        console.log("Unauthorized");
      }
    };
    request.send();
  }

  function getShops() {
    let url = new URL(InvokeURL + "integrations/pc-market/shops");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      if (request.status >= 200 && request.status < 400 && data.total > 0) {
        const shopContainer = document.getElementById("integrationcontainer");
        toParse.forEach((shop) => {
          const style = document.getElementById("integrationbox");
          const row = style.cloneNode(true);
          row.setAttribute("shopKey", shop.shopKey);
          row.style.display = "flex";
          const shopName = row.getElementsByTagName("H6")[1];
          shopName.textContent = shop.name;
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

  function updateStatus(changeOfStatus) {
    console.log("starting Updating function");
    // var form = $("#wf-form-WholesalerChangeStatusForm ");
    // var container = form.parent();
    // var doneBlock = $(".w-form-done", container);
    // var failBlock = $(".w-form-fail", container);

    var data = [
      {
        op: "add",
        path: "/enabled",
        value: changeOfStatus,
      },
    ];

    $.ajax({
      type: "PUT",
      url: InvokeURL + "integrations/pc-market",
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

        if (resultData.enabled == true) {
          console.log("Aktywny");
        } else {
          console.log("Nieaktywny");
        }

        if (typeof successCallback === "function") {
          // call custom callback
          result = successCallback(resultData);
          if (!result) {
            // show error (fail) block
            // doneBlock.hide();
            // failBlock.show();
            console.log(e);
            return;
          }
        }
        // show success (done) block
        // doneBlock.show();
        // setTimeout(function () {
        //   doneBlock.hide();
        // }, 2000);
        // failBlock.hide();
      },
      error: function (jqXHR, exception) {
        console.log("błąd");
        console.log(jqXHR);
        console.log(exception);
        //$('#customSwitchText').attr('disabled', 'disabled');
        var msg = "";
        if (jqXHR.status === 0) {
          msg = "Nie masz połączenia z internetem.";
        } else if (jqXHR.status == 404) {
          msg = "Nie znaleziono strony";
        } else if (jqXHR.status == 403) {
          msg = "Nie masz uprawnień do tej czynności";
        } else if (jqXHR.status == 409) {
          msg =
            "Nie można usunąć dostawcy. Jeden ze sklepów wciąż korzysta z jego usług.";
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

        // $(".warningmessagetext").text(msg);
        // form.show();
        // doneBlock.hide();
        // failBlock.show();
        // setTimeout(function () {
        //   failBlock.hide();
        // }, 2000);
        return;
      },
    });
  }

  $("#integrationStatus").on(
    "change",
    "input.editor-active",
    function () {
      var myValue = $(this);
      console.log(myValue);
      if (this.checked) {
        console.log("Nieaktywny był");
        updateStatus(true);
      } else {
        console.log("Aktywny był");
        updateStatus(false);
      }
    }
  );

  makeWebflowFormAjaxCreate = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $(".w-form-done", container);
        var failBlock = $(".w-form-fail", container);
        var inputdata = form.serializeArray();

        var data = {
          username: inputdata[0].value,
          password: inputdata[1].value,
          host: inputdata[2].value,
          port: parseInt(inputdata[3].value),
          engine: inputdata[4].value,
          dbname: inputdata[5].value,
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
                console.log(e);
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

  getIntegrations();
  getShops();
  $("#waitingdots").hide();
  document.getElementById("integrationcontainer").style.display = "block";
  makeWebflowFormAjaxCreate($("#wf-form-pcmarket"));
  makeWebflowFormAjaxDelete($("#wf-form-DeleteIntegration"));
});
