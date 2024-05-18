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
    const cookies = document.cookie.split('; ');
    
    // Iterate through each cookie string
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const [name, value] = cookie.split('=');  // Split each cookie into name and value
  
      // Decode the cookie value and compare it to the searchValue
      if (decodeURIComponent(value) === searchValue) {
        return name;  // Return the cookie name if the values match
      }
    }
  
    return null; // Return null if no matching value is found
  }
  var orgToken = getCookie("sprytnyToken");
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var DomainName = getCookie("sprytnyDomainName");
  var integrationKeyId = "pc-market";
  var smartToken = getCookie("sprytnycookie");
  document.getElementById("waitingdots").style.display = "flex";
  document.getElementById("integrationcontainer").style.display = "none";
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
          getShops();
          return (integrationStatus.innerHTML =
            '<label class="switchCss"><input type="checkbox" checked class="editor-active" "><span class="slider round"></span></label>');
        } else {
          return (integrationStatus.innerHTML =
            '<label class="switchCss"><input type="checkbox" class="editor-active" "><span class="slider round"></span></label>');
        }
      }
      if (request.status === 401) {
        console.log("Unauthorized");
      }
    };
    request.send();
  }

  function getShopsIntegration() {
    let url = new URL(InvokeURL + "integrations/pc-market/shops");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      if (request.status >= 200 && request.status < 400 && data.total > 0) {
        console.log(toParse);
        for (var i = 0; i < toParse.length; i++) {
          var divId = toParse[i].shopKey;
          var parentDiv = document.getElementById(divId);
          if (parentDiv) {
            var anchorElement = parentDiv.querySelector(
              "div.createandsearch > a"
            );
            if (anchorElement) {
              anchorElement.classList.add("iscredentialseditable");
              anchorElement.textContent = "Edytuj";
            }
          }
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
        const shopContainer = document.getElementById("Shops-Container");
        toParse.forEach((shop) => {
          const style = document.getElementById("sampleRowShops");
          const row = style.cloneNode(true);
          row.setAttribute("id", shop.shopKey);
          row.style.display = "grid";
          const shopName = row.getElementsByTagName("H3")[0];
          shopName.textContent = shop.name;
          const shopKey = row.getElementsByTagName("H6")[0];
          shopKey.textContent = shop.shopKey;
          const shopKeyButton = row.getElementsByTagName("a")[0];
          shopKeyButton.setAttribute("shopkey", shop.shopKey);
          shopKeyButton.textContent = "Dodaj";

          if (shop.merchantConsoleShopId === null) {
            //pass
          } else {
            shopKeyButton.classList.add("redirecttomerchant");
            shopKeyButton.textContent = "Edytuj w Konsoli Kupca";
            shopKeyButton.setAttribute(
              "href",
              "https://" + DomainName + "/app/integrations/merchant-console"
            );
          }
          shopContainer.appendChild(row);
        });
        $("#waitingdots").show();
        getShopsIntegration();
        LoadButtons();
        $("#waitingdots").hide();
        if (request.status == 401) {
          console.log("Unauthorized");
        }
      }
      if (request.status >= 200 && request.status < 400 && data.total == 0) {
        const emptystateshops = document.getElementById("emptystateshops");
        const newShopModal = document.getElementById("newShopModal");
        newShopModal.setAttribute(
          "href",
          "https://" +
            DomainName +
            "/app/tenants/organization?name=" +
            OrganizationName +
            "&clientId=" +
            ClientID
        );
        emptystateshops.style.display = "flex";
      }
    };
    request.send();
  }

  function updateStatus(changeOfStatus) {
    console.log("starting Updating function");
    var doneBlock = $("#integrationsuccess");
    var failBlock = $("#integrationfail");

    var ajaxConfig = {
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
      success: function (resultData) {
        console.log(resultData);

        if (typeof resultData !== "undefined" && resultData.enabled == true) {
          console.log("Aktywny");
          $("#integrationStatus .editor-active").prop("checked", true);
        } else {
          console.log("Nieaktywny");
          $("#integrationStatus .editor-active").prop("checked", false);
        }

        if (typeof successCallback === "function") {
          // call custom callback
          result = successCallback(resultData);
          if (!result) {
            // show error (fail) block
            // doneBlock.hide();
            // failBlock.show();
            // console.log(e);
            return;
          }
        }
        //show success (done) block
        doneBlock.show();
        setTimeout(function () {
          doneBlock.hide();
        }, 2000);
        failBlock.hide();
        window.setTimeout(function () {
          location.reload();
        }, 1000);
      },
      error: function (jqXHR, exception) {
        console.log("błąd");
        console.log(jqXHR);
        console.log(exception);
        $("#customSwitchText").attr("disabled", "disabled");
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

        $(".warningmessagetext").text(msg);
        doneBlock.hide();
        failBlock.show();
        setTimeout(function () {
          failBlock.hide();
        }, 2000);
        return;
      },
    };

    if (changeOfStatus === true) {
      ajaxConfig.type = "PUT";
      var data = [
        {
          op: "add",
          path: "/enabled",
          value: changeOfStatus,
        },
      ];
      ajaxConfig.data = JSON.stringify(data);
    } else {
      ajaxConfig.type = "DELETE";
    }

    $.ajax(ajaxConfig);
  }

  makeWebflowFormAjaxCreate = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var doneBlock = $("#w-form-done4");
        var failBlock = $("#w-form-fail4");
        var inputdata = form.serializeArray();
        var shopKey = $("#shopKeyIntegrate").attr("shopkey");

        var data = {
          shopKey: shopKey,
          credentials: {
            username: inputdata[0].value,
            password: inputdata[1].value,
            host: inputdata[2].value.trim(),
            port: parseInt(inputdata[3].value.trim()),
            engine: inputdata[4].value,
            dbname: inputdata[5].value.trim(),
          },
        };

        console.log(data);
        console.log(shopKey);

        $.ajax({
          type: "POST",
          url: InvokeURL + "integrations/pc-market/shops",
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
                form.hide();
                doneBlock.hide();
                failBlock.show();
                console.log(e);
                return;
              }
            }
            doneBlock.show();
            failBlock.hide();
            window.setTimeout(function () {
              location.reload();
            }, 1000);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);

            var msg = "";
            if (jqXHR.status === 0) {
              msg =
                "Nieznany błąd. Sprawdź, czy adres IP SmartMerchant jest umieszczony na białej liście w opcjach VPN Twojej bazy danych, zweryfikuj poprawność ustawień VPN oraz zweryfikuj szczegóły połączenia integracji.";
            } else if (jqXHR.status == 400) {
              msg = "Nie znaleziono strony";
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
              msg =
                "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
            }

            var elements =
              document.getElementsByClassName("warningmessagetext");
            for (var i = 0; i < elements.length; i++) {
              elements[i].textContent = msg;
            }
            form.show();
            failBlock.show();
            failBlock.fadeOut(10000);
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
        var shopKey = $("#shopKeyIntegrateEdit").attr("shopkey");
        var action = InvokeURL + "integrations/pc-market/shops/" + shopKey;
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
            }, 5000);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(jqXHR);
            console.log(exception);
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

  makeWebflowFormAjaxSingleEdit = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var shopKey = $("#shopKeyIntegrateEdit").attr("shopkey");
        var inputdata = form.serializeArray();
        var doneBlock = $("#w-form-done2");
        var failBlock = $("#w-form-fail2");
        var postData = [
          {
            op: "replace",
            path: "/credentials/username",
            value: inputdata[0].value,
          },
          {
            op: "replace",
            path: "/credentials/password",
            value: inputdata[1].value,
          },
          {
            op: "replace",
            path: "/credentials/host",
            value: inputdata[2].value,
          },
          {
            op: "replace",
            path: "/credentials/port",
            value: parseInt(inputdata[3].value),
          },
          {
            op: "replace",
            path: "/credentials/engine",
            value: inputdata[4].value,
          },
          {
            op: "replace",
            path: "/credentials/dbname",
            value: inputdata[5].value,
          },
        ];

        $.ajax({
          type: "PATCH",
          url: InvokeURL + "integrations/pc-market/shops/" + shopKey,
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
          data: JSON.stringify(postData),
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
            console.log(jqXHR);
            console.log(jqXHR);
            console.log(exception);
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

  $("#waitingdots").show();
  getIntegrations();

  $("#waitingdots").hide();
  document.getElementById("integrationcontainer").style.display = "block";
  makeWebflowFormAjaxCreate($("#wf-form-IntegrationsForm"));
  makeWebflowFormAjaxDelete($("#wf-form-DeleteIntegration"));
  makeWebflowFormAjaxSingleEdit($("#wf-form-IntegrationsFormEdit"));

  $("#integrationStatus").on("change", "input.editor-active", function () {
    var myValue = $(this);
    console.log(myValue);
    if (this.checked) {
      console.log("Nieaktywny był");
      updateStatus(true);
    } else {
      console.log("Aktywny był");
      updateStatus(false);
    }
  });

  function LoadButtons() {
    $(".buttonmain.edit.w-button").click(function () {
      if ($(this).hasClass("redirecttomerchant")) {
        //pass
      } else if ($(this).hasClass("iscredentialseditable")) {
        $(".modal-wrapper.edit-shop").css("display", "grid");
        var shopKey = $(this).attr("shopkey");
        $("#shopKeyIntegrateEdit").attr("shopKey", shopKey);
        console.log($("#shopKeyIntegrateEdit"));
      } else {
        $(".modal-wrapper.create-connection").css("display", "grid");
        var shopKey = $(this).attr("shopkey");
        $("#shopKeyIntegrate").attr("shopKey", shopKey);
        console.log($("#shopKeyIntegrate"));
      }
    });
  }
});
