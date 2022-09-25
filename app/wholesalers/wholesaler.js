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


  var Webflow = Webflow || [];
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var orgToken = getCookie("sprytnyToken");
  var DomainName = getCookie("sprytnyDomainName");
  var userKey = getCookie("sprytnyUsername") || "me";
  const orgName = document.getElementById("orgName");
  var formIdEdit = "#wf-form-CredentialsFormEdit";
  var formIdDelete = "#wf-form-DeleteWholesalerCredential";
  var formWhLogistic = "#wf-form-LogisticMinimumForm";

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

  const ShopBread = document.getElementById("ShopBread0");
  var shopKey = new URL(document.location.href).searchParams.get("shopKey");
  ShopBread.textContent = shopKey;
  ShopBread.setAttribute(
    "href",
    "https://" + DomainName + "/app/shops/shop?shopKey=" + shopKey
  );

  const WholesalerIdBread = document.getElementById("WholesalerBread0");
  var wholesalerKey = new URL(document.location.href).searchParams.get(
    "wholesalerKey"
  );
  WholesalerIdBread.textContent = wholesalerKey;
  WholesalerIdBread.setAttribute("href", window.location.href);

  function getWholesaler() {
    $("#CompanyDivEdit").hide();
    $("#Wholesaler-profile-Selector-box").hide();
    $("#status-container").hide();

    if (wholesalerKey == "mirex") {
      $("#CompanyDivEdit").show();
    } else {
      $("#CompanyDivEdit").hide();
    }

    let url2 = new URL(
      InvokeURL +
      "shops/" +
      shopKey +
      "/wholesalers/" +
      wholesalerKey +
      "/online-offer"
    );
    let request2 = new XMLHttpRequest();
    request2.open("GET", url2, true);
    request2.setRequestHeader("Authorization", orgToken);
    request2.onload = function () {
      var data2 = JSON.parse(this.response);
      console.log(data2);
      if (request2.status >= 200 && request2.status < 400 && data2.lastDownload) {

        var firstData = data2.lastDownload;
        var firstCreateDate = "";
        var firstStatus = "";
        var firstMessage = "";

        var offset = new Date().getTimezoneOffset();
        var localeTime = new Date(
          Date.parse(firstData.createDate) - offset * 60 * 1000
        ).toISOString();
        var creationDate = localeTime.split("T");
        var creationTime = creationDate[1].split("Z");
        firstCreateDate = creationDate[0] + " " + creationTime[0].slice(0, -4);

        if (firstData.status === "Succeeded") {
          firstStatus = "Suckes";

          LastStatusMessage.textContent =
            "Status: " +
            firstStatus +
            ". Data pobrania ostatniej oferty: " +
            firstCreateDate;
        }
        if (firstData.status === "Failed") {
          firstStatus = "Problem";
          firstMessage = firstData.message;

          LastStatusMessage.textContent =
            "Status: " +
            firstStatus +
            " Informacja: " +
            firstMessage +
            " Data próby pobrania oferty: " +
            firstCreateDate;
        }

        firstMessage;
      } else {
      }
      $("#UsernameEdit").val(data2.credentials.username).change();
    };
    request2.send();


    var request = new XMLHttpRequest();
    let apiUrl = new URL(InvokeURL + "wholesalers/" + wholesalerKey);
    request.open("GET", apiUrl.toString(), true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      console.log(data);
      if (request.status >= 200 && request.status < 400) {
        if (data.onlineOfferSupport) {
          onlineOfferSupportFlow();
          $("#Wholesaler-profile-Selector-box").show();
          $("#status-container").show();
        }

        const wholesalerName = document.getElementById("WholesalerName");
        const whPlatformUrl = document.getElementById("whPlatformUrl");
        const whTaxId = document.getElementById("whTaxId");
        const whCountry = document.getElementById("whCountry");
        const whLine1 = document.getElementById("whLine1");
        const whLine2 = document.getElementById("whLine2");
        const whTown = document.getElementById("whTown");
        const whState = document.getElementById("whState");
        const whPostcode = document.getElementById("whPostcode");
        const whLogo = document.getElementById("whLogo");
        whLogo.src = "data:image/png;base64," + data.image;
        whLogo.style.objectFit = "contain";
        wholesalerName.textContent = data.company;

        if (data.platformUrl !== null) {
          whPlatformUrl.setAttribute("href", "" + data.platformUrl);
        } else {
          $("#loginButton").hide();
        }
        //
        whTaxId.textContent = data.taxId;
        whCountry.textContent = data.address.country;
        whLine1.textContent = data.address.line1;
        whLine2.textContent = data.address.line2;
        whTown.textContent = data.address.town;
        whState.textContent = data.address.state;
        whPostcode.textContent = data.address.postcode;
      } else {
        console.log("error");
      }
    };
    request.send();
  }


  function getProfile() {
    let url = new URL(
      InvokeURL +
      "shops/" +
      shopKey +
      "/wholesalers/" +
      wholesalerKey +
      "/online-offer/profiles"
    );

    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      if (request.status >= 200 && request.status < 400 && data.total > 0) {
        $("#Wholesaler-profile-Selector-box").show();
        $("#Wholesaler-profile-Selector").attr("required", "");
        const wholesalerProfileContainer = document.getElementById(
          "Wholesaler-profile-Selector"
        );
        toParse.forEach((profile) => {
          var optProfile = document.createElement("option");
          optProfile.value = profile.id;
          optProfile.innerHTML = profile.name;
          wholesalerProfileContainer.appendChild(optProfile);
        });
      } else if (request.status == 401) {
        console.log("Unauthorized");
      } else {
        $("#Wholesaler-profile-Selector-box").hide();
        $("#Wholesaler-profile-Selector").removeAttr("required");
      }
    };
    request.send();

    $("#waitingdots").show();
    $("#Wholesaler-profile-Selector")
      .find("option")
      .remove()
      .end()
      .append("<option value=null>Wybierz profil</option>")
      .val("null");
  }

  function getWholesalerHistory() {
    let url = new URL(
      InvokeURL +
      "shops/" +
      shopKey +
      "/wholesalers/" +
      wholesalerKey +
      "/online-offer/status-history?sort=createDate:asc&per_page=30"
    );
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      console.log(toParse);
      const statusContainer = document.getElementById("StatusContainer");
      var LastStatusMessage = document.getElementById("LastStatusMessage");

      if (request.status >= 200 && request.status < 400 && data.total > 0) {

        toParse.forEach((item) => {
          const style = document.getElementById("sampleStatus");
          const row = style.cloneNode(true);
          row.style.display = "block";
          var firstCreateDate = "";
          var offset = new Date().getTimezoneOffset();
          var localeTime = new Date(
            Date.parse(item.createDate) - offset * 60 * 1000
          ).toISOString();
          var creationDate = localeTime.split("T");
          var creationTime = creationDate[1].split("Z");
          firstCreateDate = creationDate[0] + " " + creationTime[0].slice(0, -4);

          if (item.status === "Failed") {
            row.classList.add("fail");
            row.classList.add("tippy");
            row.setAttribute("data-tippy-content", firstCreateDate + " Problem");
          }
          if (item.status === "Incomplete") {
            row.classList.add("warning");
            row.classList.add("tippy");
            row.setAttribute("data-tippy-content", firstCreateDate + " Niekompletna");
          }
          if (item.status === "Succeeded") {
            row.classList.add("tippy");
            row.setAttribute("data-tippy-content", firstCreateDate + " Sukces");
          }
          statusContainer.appendChild(row);
        });
        //loadTippyContent//
        LoadTippy();
      } else {
        LastStatusMessage.textContent = "Gotowy do integracji !"
      }
    };
    request.send();
  }

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

  makeWebflowFormAjaxWh = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#w-form-done4", container);
        var failBlock = $("#w-form-fail4", container);
        var action =
          InvokeURL +
          "shops/" +
          shopKey +
          "/wholesalers/" +
          wholesalerKey +
          "/online-offer";
        var method = "PATCH";


        if ($("#CompanyEdit").val()) {
          //mirex case
          var data = [
            {
              op: "add",
              path: "/credentials/username",
              value: $("#UsernameEdit").val(),
            },
            {
              op: "add",
              path: "/credentials/password",
              value: $("#PasswordEdit").val(),
            },
            {
              op: "add",
              path: "/credentials/extraFields",
              value: {
                company: $("#CompanyEdit").val(),
              },
            },
          ];
        } else {
          //edit case
          if ($("#Wholesaler-profile-Selector").val() != "null") {
            var data = [
              {
                op: "add",
                path: "/credentials/username",
                value: $("#UsernameEdit").val(),
              },
              {
                op: "add",
                path: "/credentials/password",
                value: $("#PasswordEdit").val(),
              },
              {
                op: "add",
                path: "/profile",
                value: {
                  id: $("#Wholesaler-profile-Selector").val(),
                  name: $("#Wholesaler-profile-Selector").attr("name"),
                },
              },
            ];
          } else {
            // add case
            var data = [
              {
                op: "add",
                path: "/credentials/username",
                value: $("#UsernameEdit").val(),
              },
              {
                op: "add",
                path: "/credentials/password",
                value: $("#PasswordEdit").val(),
              },
            ];
          }
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

            // add case
            if ($("#Wholesaler-profile-Selector").val() === "null") {

              let url = new URL(
                InvokeURL +
                "shops/" +
                shopKey +
                "/wholesalers/" +
                wholesalerKey +
                "/online-offer/profiles"
              );

              let request = new XMLHttpRequest();
              request.open("GET", url, true);
              request.setRequestHeader("Authorization", orgToken);
              request.onload = function () {
                var data = JSON.parse(this.response);
                var toParse = data.items;
                if (request.status >= 200 && request.status < 400 && data.total > 0) {
                  $("#Wholesaler-profile-Selector-box").show();
                  $("#Wholesaler-profile-Selector").attr("required", "");
                  const wholesalerProfileContainer = document.getElementById(
                    "Wholesaler-profile-Selector"
                  );
                  toParse.forEach((profile) => {
                    var optProfile = document.createElement("option");
                    optProfile.value = profile.id;
                    optProfile.innerHTML = profile.name;
                    wholesalerProfileContainer.appendChild(optProfile);
                  });
                } else if (request.status == 401) {
                  console.log("Unauthorized");
                } else {
                  $("#Wholesaler-profile-Selector-box").hide();
                  $("#Wholesaler-profile-Selector").removeAttr("required");

                  LastStatusMessage.textContent = "Wkrótce stworzymy ofertę dla tego dostawcy! Proszę czekaj."
                  const Iehurt = document.getElementById("Iehurt");
                  Iehurt.classList.add("enabled");
                  form.show();
                  doneBlock.show();
                  doneBlock.fadeOut(3000);
                  failBlock.hide();


                }
              };
              request.send();
              $("#waitingdots").show();
              $("#Wholesaler-profile-Selector")
                .find("option")
                .remove()
                .end()
                .append("<option value=null>Wybierz profil</option>")
                .val("null");


            } else {
              form.show();
              doneBlock.show();
              doneBlock.fadeOut(3000);
              failBlock.hide();
            }
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            doneBlock.hide();
            failBlock.show();
            failBlock.fadeOut(3000);
            failBlock.hide();
            console.log(e);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxWhLogistic = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#w-form-done4", container);
        var failBlock = $("#w-form-fail4", container);
        var action =
          InvokeURL + "shops/" + shopKey + "/wholesalers/" + wholesalerKey;

        var method = "PATCH";

        if (parseInt($("#logisticMinimumEdit").val()) > 0) {
          var data = [
            {
              op: "add",
              path: "/logisticMinimum",
              value: parseInt($("#logisticMinimumEdit").val()),
            },
          ];
        } else {
          var data = [
            {
              op: "remove",
              path: "/logisticMinimum",
            },
          ];
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
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            doneBlock.hide();
            failBlock.show();
            failBlock.fadeOut(3000);
            failBlock.hide();
            console.log(e);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxDeleteWh = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#w-form-done3", container);
        var failBlock = $("#w-form-fail3", container);
        var action =
          InvokeURL +
          "shops/" +
          shopKey +
          "/wholesalers/" +
          wholesalerKey +
          "/online-offer";
        var method = "PATCH";

        var data = [
          {
            op: "remove",
            path: "/credentials",
          },
        ];
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
          data: JSON.stringify(data),
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
            doneBlock.fadeOut(3000);
            doneBlock.hide();
            failBlock.hide();
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            doneBlock.hide();
            failBlock.show();
            failBlock.fadeOut(3000);
            failBlock.hide();
            console.log(e);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  $("#UsernameEdit").change(function () {
    $("#Wholesaler-profile-Selector").val("null").change();
  });

  function LoadTippy() {
    $.getScript("https://unpkg.com/popper.js@1", function (data, textStatus, jqxhr) {
      console.log(data); // data returned
      console.log(textStatus); // success
      console.log(jqxhr.status); // 200
      console.log('Load was performed.');
      $.getScript("https://unpkg.com/tippy.js@4", function (data, textStatus, jqxhr) {
        console.log(data); // data returned
        console.log(textStatus); // success
        console.log(jqxhr.status); // 200
        console.log('Load was performed.');
        tippy('.tippy', {          // Add the class tippy to your element
          theme: 'light',          // Dark or Light
          animation: 'scale',      // Options, shift-away, shift-toward, scale, persepctive
          duration: 250,           // Duration of the Animation
          arrow: true,             // Add arrow to the tooltip
          arrowType: 'round',      // Sharp, round or empty for none
          delay: [0, 50],          // Trigger delay in & out
          maxWidth: 240,           // Optional, max width settings
        })
      });
    });
  }




  //onlineOfferSupport//

  getWholesaler();
  function onlineOfferSupportFlow() {
    getProfile();
    getWholesalerHistory();
    $("#waitingdots").hide();
  }

  //oniline Support not supported flow //

  LogoutNonUser();

  makeWebflowFormAjaxDeleteWh($(formIdDelete));
  makeWebflowFormAjaxWh($(formIdEdit));
  makeWebflowFormAjaxWhLogistic($(formWhLogistic));
  $("#waitingdots").hide();

});
