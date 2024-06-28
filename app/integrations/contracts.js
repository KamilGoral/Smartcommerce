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
  document.getElementById("waitingdots").style.display = "flex";
  document.getElementById("Sample-Integration").style.display = "none";
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var orgToken = getCookie("sprytnyToken");
  const emailElement = document.getElementById("useremail");
  emailElement.textContent = getCookie("sprytnyUser");
  var DomainName = getCookie("sprytnyDomainName");
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

  function getRetroactive() {
    let url = new URL(InvokeURL + "integrations/retroactive");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        document.getElementById("deleteblock").style.display = "flex";
        document.getElementById("Sample-Integration").style.display = "grid";
        const integrationName = document.getElementById("integrationName");
        integrationName.textContent = data.name;
        IntegrationBread.textContent = data.name;
        IntegrationBread.setAttribute("href", window.location.href);

        const IntegrationHeader = document.getElementById("IntegrationHeader");
        IntegrationHeader.textContent = data.name;
        const integrationDescription = document.getElementById(
          "integrationDescription"
        );
        integrationDescription.textContent = data.description;
        const integrationLogo = document.getElementById("integrationLogo");
        integrationLogo.src = "data:image/png;base64," + data.image;
        const integrationStatus = document.getElementById("integrationStatus");
        const integrationButton = document.getElementById("integrationButton");

        if (data.enabled === true) {
          integrationStatus.textContent = "Aktywny";
          integrationStatus.style.color = "green";
          integrationButton.value = "Zmień dane logowania";
        } else {
          integrationStatus.textContent = "Nieaktywny";
        }

        if (request.status === 401) {
          console.log("Unauthorized");
        }
      }
    };
    request.send();
  }

  var formIdRetroactive = "#wf-form-retroactive";
  var formIdRetroactiveDelete = "#wf-form-retroactiveDelete";

  makeWebflowFormAjax = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $(".w-form-done", container);
        var failBlock = $(".w-form-fail", container);
        var inputdata = form.serializeArray();

        var data = {
          id: inputdata[0].value,
        };

        console.log(data);

        $.ajax({
          type: "PUT",
          url: InvokeURL + "integrations/retroactive",
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
        var doneBlock = $("#ShopDeleteSuccess", container);
        var failBlock = $("#ShopDeleteFail", container);
        var action = InvokeURL + "integrations/retroactive";
        var method = "DELETE";

        // call via ajax
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
              // call custom callback
              result = successCallback(resultData);
              if (!result) {
                // show error (fail) block
                form.show();
                doneBlock.hide();
                failBlock.show();
                console.log(e);
                return;
              }
            }
            // show success (done) block

            form.show();
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
            // call custom callback
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            // show error (fail) block
            form.show();
            doneBlock.hide();
            failBlock.show();
            console.log(e);
          },
        });
        // prevent default webdlow action
        event.preventDefault();
        return false;
      });
    });
  };

  getRetroactive();
  $("#waitingdots").hide();
  makeWebflowFormAjax($(formIdRetroactive));
  makeWebflowFormAjaxDelete($(formIdRetroactiveDelete));
});
