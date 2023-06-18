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

        // if (data.enabled === true) {
        //   integrationStatus.textContent = "Aktywny";
        //   integrationStatus.style.color = "green";
        //   integrationButton.value = "Zmień dane logowania";
        //   getShops();
        //   integrationBlock.style.display = "flex";
        // } else {
        //   integrationStatus.textContent = "Nieaktywny";
        // }
        // const integrationLogin = document.getElementById("Username");
        // integrationLogin.value = data.credentials.username;
        // const integrationHost = document.getElementById("Host");
        // integrationHost.value = data.credentials.host;
        // const integrationPort = document.getElementById("Port");
        // integrationPort.value = data.credentials.port;
        // const integrationEngine = document.getElementById("engine");
        // integrationEngine.value = data.credentials.engine;
        // const integrationDbName = document.getElementById("dbname");
        // integrationDbName.value = data.credentials.dbname;
        if (request.status === 401) {
          console.log("Unauthorized");
        }
      }
    };
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
