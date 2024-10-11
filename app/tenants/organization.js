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
    if (parts.length === 2)
      return decodeURIComponent(parts.pop().split(";").shift());
  }
  // DOM is loaded and ready for manipulation here
  const displayMessage = (type, message) => {
    $("#Message-Container").show().delay(5000).fadeOut("slow");
    if (message) {
      $(`#${type}-Message-Text`).text(message);
    }
    $(`#${type}-Message`).show().delay(5000).fadeOut("slow");
  };

  var testOrganization = getCookie("OrganizationName");
  console.log(testOrganization);
  if (testOrganization === "Goral") {
    $("#alertMessage").show();
    console.log(testOrganization === "Goral");
  }

  function setCookie(cName, cValue, expirationSec) {
    let date = new Date();
    date.setTime(date.getTime() + expirationSec * 1000);
    const expires = "expires=" + date.toUTCString();
    const encodedValue = encodeURIComponent(cValue);
    document.cookie = `${cName}=${encodedValue}; ${expires}; path=/`;
  }

  function parseAttributes(cookieValue) {
    const decodedValue = decodeURIComponent(cookieValue);
    const attributes = decodedValue.split("|");
    const result = {};
    attributes.forEach((attribute) => {
      const [key, value] = attribute.split(":");
      result[key.trim()] = value.trim();
    });
    return result;
  }
  var smartToken = getCookie("sprytnycookie");
  var accessToken = smartToken.split("Bearer ")[1];
  const attributes = parseAttributes(getCookie("SpytnyUserAttributes"));
  const username = document.getElementById("firstNameUser");
  username.value = attributes["username"];
  const userfamilyname = document.getElementById("lastNameUser");
  userfamilyname.value = attributes["familyname"];
  const emailElement = document.getElementById("useremail");
  const emailadress = document.getElementById("emailadressUser");
  emailElement.textContent = attributes["email"];
  emailadress.value = attributes["email"];
  var Webflow = Webflow || [];
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var clientId = new URL(location.href).searchParams.get("clientId");
  var orgToken = getCookie(clientId);
  setCookie("sprytnyToken", orgToken, 7200);
  var DomainName = getCookie("sprytnyDomainName");
  var userKey = getCookie("sprytnyUsername") || "me";

  var organizationName = getCookie("OrganizationName");
  $("#NewOrganizationName").val(organizationName);
  var formId = "#wf-form-NewOrganizationName";
  var formIdDelete = "#wf-form-DeleteOrganization";
  var formIdInvite = "#wf-form-Invite-User";
  var formIdCreate = "#wf-form-Create-Shop";
  var formIdNewWh = "#wf-form-Create-wholesaler";
  var formIdEditBilling = "#wf-form-editCompanyBilling-form-correct";
  const OrganizationBread0 = document.getElementById("OrganizationBread0");
  const OrganizationNameHeader = document.getElementById("organizationName");

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

  postEditUserProfile = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        const firstNameUser = $("#firstNameUser").val();
        const lastNameUser = $("#lastNameUser").val();
        const emailadressUser = $("#emailadressUser").val();

        const datatosend = {
          AccessToken: accessToken,
          UserAttributes: [
            {
              Name: "name",
              Value: firstNameUser,
            },
            {
              Name: "family_name",
              Value: lastNameUser,
            },
            // {
            //   Name: "email",
            //   Value: emailadressUser,
            // },
          ],
        };

        const url = "https://cognito-idp.us-east-1.amazonaws.com/";

        $.ajax({
          type: "POST",
          url: url,
          headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "x-amz-target":
              "AWSCognitoIdentityProviderService.UpdateUserAttributes",
            Authorization: smartToken,
          },
          cors: true,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            $("#waitingdots").hide();
          },
          data: JSON.stringify(datatosend),
          dataType: "json",
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                displayMessage(
                  "Error",
                  "Oops. Coś poszło nie tak, spróbuj ponownie."
                );
                console.log(e);
                return;
              }
            }
            form.show();
            setCookie(
              "SpytnyUserAttributes",
              "username:" +
                firstNameUser +
                "|familyname:" +
                lastNameUser +
                "|email:" +
                emailadressUser,
              720000
            );
            displayMessage("Success", "Twoje dane zostały zmienione");
            const welcomeMessage = document.getElementById("welcomeMessage");
            if (welcomeMessage) {
              welcomeMessage.textContent =
                "Witaj, " + firstNameUser + " " + lastNameUser + "!";
            } else {
              console.log(
                "Element 'welcomeMessage' nie został znaleziony. Pomijam ustawienie powitania."
              );
            }
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            displayMessage(
              "Error",
              "Oops. Coś poszło nie tak, spróbuj ponownie."
            );
            console.log(e);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  postChangePassword = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action =
          "https://hook.eu1.make.com/2laahxeoqfuo7nmf2gh1yyuatq92jiai";
        var inputdata = form.serializeArray();

        var data = {
          "Current-Password": inputdata[0].value,
          "New-Password": inputdata[1].value,
          AccessToken: accessToken,
          "User-Email": $("#useremail").text(),
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
          data: JSON.stringify(data),
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                displayMessage(
                  "Error",
                  "Oops. Coś poszło nie tak, spróbuj ponownie."
                );
                console.log(e);
                return;
              }
            }
            form.show();
            displayMessage("Success", "Twoje hasło zostało zmienione.");
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";
            if (jqXHR.status === 0) {
              msg = "Not connect.\n Verify Network.";
            } else if (jqXHR.status == 403) {
              msg = "Użytkownik nie ma uprawnień do tworzenia organizacji.";
            } else if (jqXHR.status == 400) {
              msg = "Twoje dotychczasowe hasło jest inne. Spróbuj ponownie.";
            } else if (jqXHR.status == 500) {
              msg = "Internal Server Error [500].";
            } else if (exception === "parsererror") {
              msg = "Requested JSON parse failed.";
            } else if (exception === "timeout") {
              msg = "Time out error.";
            } else if (exception === "abort") {
              msg = "Ajax request aborted.";
            } else {
              msg = "" + jqXHR.responseJSON.message;
            }
            form.show();
            displayMessage("Error", msg);
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  function validateInput(event, input) {
    const charCode = event.which ? event.which : event.keyCode;

    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
      return false;
    }

    if (charCode === 46 && input.value.includes(".")) {
      return false;
    }

    const [integer, decimal] = input.value.split(".");
    if (charCode !== 46 && decimal && decimal.length >= 2) {
      return false;
    }
    if (integer.length > 3 || parseFloat(input.value) > 500) {
      return false;
    }

    return true;
  }

  function updateStatus(changeOfStatus, wholesalerKey, onErrorCallback) {
    console.log("starting Updating function");
    var form = $("#wf-form-WholesalerChangeStatusForm ");
    var container = form.parent();

    var data = [
      {
        op: "replace",
        path: "/enabled",
        value: changeOfStatus,
      },
    ];

    $.ajax({
      type: "PATCH",
      url: InvokeURL + "wholesalers/" + wholesalerKey,
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
        "Requested-By": "webflow-3-4",
      },
      data: JSON.stringify(data),
      success: function (resultData) {
        if (typeof successCallback === "function") {
          // call custom callback
          result = successCallback(resultData);
          if (!result) {
            // show error (fail) block
            displayMessage(
              "Error",
              "Nie udało się zmienić statusu. Spróbuj ponownie."
            );
            console.log(e);
            return;
          }
        }
        displayMessage("Success", "Status dostawcy został zmieniony.");
      },
      error: function (jqXHR, exception) {
        console.log("błąd");
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
          msg = "" + jqXHR.responseJSON.message;
        }
        displayMessage("Error", msg);
        form.show();
        return;
      },
    });
  }

  function LogoutNonUser() {
    if (getCookie("sprytnycookie") == null) {
      alert("Twoja sesja wygasła.");
      window.location.href = "https://sprytnykupiec.pl/login-page";
    }
  }

  function getUserRole() {
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      let endpoint = new URL(InvokeURL + "users/" + userKey);
      request.open("GET", endpoint, true);
      request.setRequestHeader("Authorization", orgToken);
      request.setRequestHeader("Requested-By", "webflow-3-4");
      request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
          var data = JSON.parse(request.responseText);
          function setCookieAndSession(cName, cValue, expirationSec) {
            let date = new Date();
            date.setTime(date.getTime() + expirationSec * 1000);
            const expires = "expires=" + date.toUTCString();
            document.cookie =
              cName + "=" + cValue + "; " + expires + "; path=/";
          }
          setCookieAndSession("sprytnyUserRole", data.role, 72000);
          resolve(data.role); // Resolve with the user role
        } else {
          console.error("Error fetching user role. Status:", request.status);
          reject("Error fetching user role"); // Reject if there's an error
        }
      };
      request.onerror = function () {
        console.error("Request error:", request.status);
        reject("Request error"); // Reject if there's a request error
      };
      request.send();
    });
  }

  async function navigateToInvoiceStateInvoices() {
    let attempts = 0;
    const maxAttempts = 5;
    const urlParams = new URLSearchParams(window.location.search);
    const isSuspended = urlParams.get("suspended") === "true";

    while (!getCookie("sprytnyUserRole") && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (isSuspended) {
      displaySuspendedMessage();
    } else {
      showAllTabs();
    }
  }

  function displaySuspendedMessage() {
    if (getCookie("sprytnyUserRole") === "admin") {
      displayMessage(
        "Error",
        "Prosimy o uregulowanie zaległych faktur przed dalszym korzystaniem z platformy."
      );
      hideTabsExceptSettings();
      navigateToInvoiceRow();
    } else {
      displayMessage(
        "Error",
        "Organizacja została zawieszona. Prosimy o kontakt z opiekunem Twojej organizacji."
      );
      setTimeout(() => {
        window.location = `https://${DomainName}/app/users/me`;
      }, 3000);
    }
  }

  function hideTabsExceptSettings() {
    const tabsToHide = ["Policy", "Integrations", "Documents"];
    tabsToHide.forEach((tab) => $(`a[data-w-tab="${tab}"]`).hide());
    $('a[data-w-tab="Settings"]').show();
  }

  function showAllTabs() {
    const tabsToShow = ["Policy", "Integrations", "Settings"];
    tabsToShow.forEach((tab) => $(`a[data-w-tab="${tab}"]`).show());
  }

  function navigateToInvoiceRow() {
    setTimeout(() => {
      document.querySelector('a[data-w-tab="Settings"]').click();
      setTimeout(() => {
        document.querySelector('a[data-w-tab="Tenant-Informations"]').click();
        setTimeout(() => {
          document
            .getElementById("invoicerow")
            .scrollIntoView({ behavior: "smooth" });
        }, 501);
      }, 501);
    }, 501);
  }

  function getShops() {
    let url = new URL(InvokeURL + "shops?perPage=20");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    // request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(this.response);
        var toParse = data.items;
        var shopNumber = data.total;

        if (shopNumber > 0) {
          const deleteButton = document.getElementById(
            "deleteOrganizationButton"
          );

          deleteButton.disabled = true;
          deleteButton.style.opacity = "0.4";
          $("#deleteTenantMessage").show();
        }

        const shopContainer = document.getElementById("Shops-Container");

        // Code for documents

        const shopContainerDocuments = document.getElementById("documentShop");
        toParse.forEach((shop) => {
          var opt = document.createElement("option");
          opt.value = shop.shopKey;
          opt.innerHTML = shop.shopKey;
          shopContainerDocuments.appendChild(opt);
        });

        toParse.forEach((shop) => {
          const style = document.getElementById("sampleRowShops");
          const row = style.cloneNode(true);
          row.style.display = "flex";
          row.removeAttribute("id");

          const shopNameElement = row.querySelector("[shopdata='shopName']");
          if (shopNameElement) shopNameElement.textContent = shop.name;

          const shopKeyElement = row.querySelector("[shopdata='shopKey']");
          if (shopKeyElement) shopKeyElement.textContent = shop.shopKey;

          row.href = `https://${DomainName}/app/shops/shop?shopKey=${shop.shopKey}`;

          shopContainer.appendChild(row);
        });

        if (data.total === 0) {
          const tablecontentshops =
            document.getElementById("tablecontentshops");
          tablecontentshops.style.display = "none";
          const emptystateshops = document.getElementById("emptystateshops");
          emptystateshops.style.display = "flex";
        }
      } else if (request.status == 401) {
        console.log("Unauthorized");
      } else {
        console.error("Error loading shop info:", request.status);
      }
    };

    request.onerror = function () {
      console.error("Error loading shop info:", request.statusText);
    };

    request.send();
  }

  async function getUsers() {
    while (!getCookie("sprytnyUserRole") && attempts < 5) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (getCookie("sprytnyUserRole") !== "admin") {
      console.log("Action not permitted for non-admin users.");
      return;
    }

    let url = new URL(InvokeURL + "users?perPage=30");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      let dataItems =
        request.status >= 200 && request.status < 400
          ? JSON.parse(this.response).items
          : [];
      if (
        request.status == 403 ||
        (request.status >= 200 && request.status < 400)
      ) {
        var tableUsers = $("#table_users_list").DataTable({
          pagingType: "full_numbers",
          pageLength: 10,
          scrollY: "60vh",
          scrollCollapse: true,
          destroy: true,
          orderMulti: true,
          order: [[3, "desc"]],
          dom: '<"top">rt<"bottom"lip>',
          language: {
            emptyTable: "Nie posiadasz odpowiednich uprawnień",
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
          data: dataItems,
          search: {
            return: true,
          },
          columns: [
            {
              orderable: false,
              data: null,
              width: "20px",
              defaultContent:
                '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/643d463e9ce9fb54c6dfda04_person-circle.svg" loading="lazy" >',
            },
            {
              orderable: false,
              visible: false,
              data: "id",
            },
            {
              orderable: true,
              data: "email",
            },
            {
              orderable: true,
              data: "status",
              width: "172px",
              render: function (data) {
                if (data === "active") {
                  return '<spann class="positive">Aktywny</spann>';
                } else {
                  return '<spann class="medium">Oczekuję</spann>';
                }
              },
            },
            {
              orderable: true,
              data: "role",
              width: "172px",
              render: function (data, type, row) {
                if (type === "display") {
                  // If role is null, display a disabled dropdown
                  if (data === null) {
                    return `<select class="user-role-select" disabled>
                              <option>-</option>
                            </select>`;
                  }
                  let selectAdminSelected = data === "admin" ? " selected" : "";
                  let selectUserSelected = data === "user" ? " selected" : "";
                  return `
                    <select class="user-role-select" data-user-id="${row.id}">
                      <option value="admin"${selectAdminSelected}>Administrator</option>
                      <option value="user"${selectUserSelected}>Użytkownik</option>
                    </select>
                  `;
                }
                return data;
              },
            },
            {
              orderable: false,
              class: "details-control4",
              width: "36px",
              data: null,
              defaultContent:
                "<img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg' alt='details'></img>",
            },
          ],
        });
        if (request.status == 401) {
          console.log("Unauthorized");
        }
      }
    };
    request.send();
  }

  async function getInvoices() {
    let attempts = 0;
    while (!getCookie("sprytnyUserRole") && attempts < 5) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (getCookie("sprytnyUserRole") !== "admin") {
      console.log("Action not permitted for non-admin users.");
      return;
    }

    let url = new URL(
      InvokeURL + "tenants/" + organizationName + "/invoices?perPage=25"
    );
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);

    request.onload = function () {
      let dataItems = [];
      if (request.status >= 200 && request.status < 400) {
        try {
          const response = JSON.parse(this.response);
          dataItems = response.items || [];
        } catch (error) {
          console.error("Error parsing response:", error);
        }
      }

      if (
        request.status == 403 ||
        (request.status >= 200 && request.status < 400)
      ) {
        if (dataItems.length === 0 || dataItems === "") {
          document.getElementById("emptystateinvoices").style.display = "flex";
          document.getElementById("invoicesstateinvoices").style.display =
            "none";
        } else {
          document.getElementById("emptystateinvoices").style.display = "none";
          document.getElementById("invoicesstateinvoices").style.display =
            "flex";

          var tableInvoices = $("#table_invoices_list").DataTable({
            pagingType: "full_numbers",
            pageLength: 10,
            scrollY: "60vh",
            scrollCollapse: true,
            destroy: true,
            orderMulti: true,
            order: [[3, "asc"]],
            dom: '<"top">rt<"bottom"lip>',
            language: {
              emptyTable: "Brak faktur",
              info: "Pokazuje _START_ - _END_ z _TOTAL_ rezultatów",
              infoEmpty: "Brak danych",
              infoFiltered: "(z _MAX_ rezultatów)",
              lengthMenu: "Pokaż _MENU_ rekordów",
              loadingRecords: "<div class='spinner'></div>",
              processing: "<div class='spinner'></div>",
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
            data: dataItems,
            search: {
              return: true,
            },
            columns: [
              {
                orderable: false,
                data: null,
                width: "20px",
                defaultContent:
                  '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg" loading="lazy" >',
              },
              {
                orderable: true,
                data: "number",
                render: function (data, type, row) {
                  let mainContent = `<div>${row.number}</div>`;
                  let correctiveContent = "";
                  if (
                    row.correctiveInvoices &&
                    row.correctiveInvoices.length > 0
                  ) {
                    correctiveContent = row.correctiveInvoices
                      .map((corrective) => {
                        return `<div style="margin-top: 5px; font-style: italic;"> - ${corrective.number}</div>`;
                      })
                      .join("");
                  }
                  return `${mainContent}${correctiveContent}`;
                },
              },
              {
                orderable: true,
                data: "status",
                width: "128px",
                render: function (data, type, row) {
                  let mainContent = "";
                  switch (row.status) {
                    case "draft":
                      mainContent = '<span class="noneexisting">Szkic</span>';
                      break;
                    case "sent":
                      mainContent =
                        '<span class="noneexisting">Nie Zapłacono</span>';
                      break;
                    case "paid":
                      mainContent = '<span class="positive">Zapłacono</span>';
                      break;
                    case "overdue":
                      mainContent = '<span class="positive">Po terminie</span>';
                      break;
                    default:
                      mainContent =
                        '<span class="noneexisting">Nieznany</span>';
                  }
                  let correctiveContent = "";
                  if (
                    row.correctiveInvoices &&
                    row.correctiveInvoices.length > 0
                  ) {
                    correctiveContent = row.correctiveInvoices
                      .map((corrective) => {
                        let status = "";
                        switch (corrective.status) {
                          case "draft":
                            status = '<span class="neutral">Szkic</span>';
                            break;
                          case "sent":
                            status =
                              '<span class="noneexisting">Nie Zapłacono</span>';
                            break;
                          case "paid":
                            status = '<span class="positive">Zapłacono</span>';
                            break;
                          case "overdue":
                            status =
                              '<span class="positive">Po terminie</span>';
                            break;
                          default:
                            status =
                              '<span class="noneexisting">Nieznany</span>';
                        }
                        return `<div style="margin-top: 5px;">${status}</div>`;
                      })
                      .join("");
                  }
                  return `${mainContent}${correctiveContent}`;
                },
              },
              {
                orderable: true,
                data: "paymentDueDate",
                type: "date",
                render: function (data, type, row) {
                  let mainContent = new Date(
                    row.paymentDueDate
                  ).toLocaleDateString("pl-PL");
                  let correctiveContent = "";
                  if (
                    row.correctiveInvoices &&
                    row.correctiveInvoices.length > 0
                  ) {
                    correctiveContent = row.correctiveInvoices
                      .map((corrective) => {
                        return `<div style="margin-top: 5px; font-style: italic;">${new Date(
                          corrective.paymentDueDate
                        ).toLocaleDateString("pl-PL")}</div>`;
                      })
                      .join("");
                  }
                  return `${mainContent}${correctiveContent}`;
                },
              },
              {
                orderable: true,
                data: "netTotal",
                render: function (data, type, row) {
                  let mainContent = new Intl.NumberFormat("pl-PL", {
                    style: "currency",
                    currency: "PLN",
                  }).format(row.netTotal);
                  let correctiveContent = "";
                  if (
                    row.correctiveInvoices &&
                    row.correctiveInvoices.length > 0
                  ) {
                    correctiveContent = row.correctiveInvoices
                      .map((corrective) => {
                        return `<div style="margin-top: 5px; font-style: italic;">${new Intl.NumberFormat(
                          "pl-PL",
                          {
                            style: "currency",
                            currency: "PLN",
                          }
                        ).format(corrective.netTotal)}</div>`;
                      })
                      .join("");
                  }
                  return `${mainContent}${correctiveContent}`;
                },
              },
              {
                orderable: false,
                width: "156px",
                data: null,
                render: function (data, type, row) {
                  const paymentLink =
                    row.status !== "paid" && row.paymentLink
                      ? `
                        <a href="${row.paymentLink}" target="_blank" style="margin-left: 0.25rem;">
                          <span class="positive">Zapłać</span>
                        </a>
                      `
                      : " ";

                  const downloadLink = `
                    <a href="#" class="download-invoice" data-uuid="${row.uuid}" data-tenant="${organizationName}" data-number="${row.number}" data-document-type="regular">
                      <img style="margin-left: 0.25rem;" src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg' alt='Pobierz oryginał'>
                    </a>
                    <a href="#" class="download-invoice" data-uuid="${row.uuid}" data-tenant="${organizationName}" data-number="${row.number}" data-document-type="duplicate">
                      <span class="noneexisting" style="margin-left: 0.25rem;">Duplikat</span>
                    </a>
                  `;

                  let correctiveLinks = "";
                  if (
                    row.correctiveInvoices &&
                    row.correctiveInvoices.length > 0
                  ) {
                    correctiveLinks = row.correctiveInvoices
                      .map((corrective) => {
                        const correctivePaymentLink =
                          corrective.status !== "paid" && corrective.paymentLink
                            ? `
                              <a href="${corrective.paymentLink}" target="_blank" style="margin-left: 0.25rem;">
                                <span class="positive">Zapłać</span>
                              </a>
                            `
                            : " ";

                        return `
                          <div style="margin-top: 0.25rem;">
                            <a href="#" class="download-invoice" data-uuid="${corrective.uuid}" data-tenant="${organizationName}" data-number="${corrective.number}" data-document-type="regular">
                              <img style="margin-left: 0.25rem;" src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg' alt='Pobierz oryginał'>
                            </a>
                            <a href="#" class="download-invoice" data-uuid="${corrective.uuid}" data-tenant="${organizationName}" data-number="${corrective.number}" data-document-type="duplicate">
                              <span class="noneexisting" style="margin-left: 0.25rem;">Duplikat</span>
                            </a>
                            ${correctivePaymentLink}
                          </div>`;
                      })
                      .join(" ");
                  }

                  return `<div class="action-container">${downloadLink} ${paymentLink}</div> ${correctiveLinks}`;
                },
              },
            ],
          });
        }
      }

      if (request.status == 401) {
        console.log("Unauthorized");
      }
    };

    request.onerror = function () {
      console.error("Request failed");
      document.getElementById("emptystateinvoices").style.display = "flex";
      document.getElementById("invoicesstateinvoices").style.display = "none";
    };

    request.send();
  }

  $(document).on("click", ".download-invoice", function (e) {
    e.preventDefault();
    const uuid = $(this).data("uuid");
    const tenant = $(this).data("tenant");
    const number = $(this).data("number");
    const documentType = $(this).data("document-type") || "regular"; // Default to "regular" if not specified

    // Function to sanitize the file name
    function sanitizeFilename(name) {
      return name ? name.replace(/[^a-z0-9]/gi, "_").toLowerCase() : "unknown";
    }

    const sanitizedOrganizationName = sanitizeFilename(tenant);
    const sanitizedNumber = sanitizeFilename(number);
    const filename = `${sanitizedOrganizationName}-${sanitizedNumber}.pdf`;

    const url = `${InvokeURL}tenants/${tenant}/invoices/${uuid}?documentType=${documentType}`;

    // Show waiting screen
    $("#waitingdots").show();

    fetch(url, {
      headers: {
        Authorization: orgToken,
        Accept: "application/pdf",
        "Requested-By": "webflow-3-4",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename; // Use the sanitized file name here
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Error downloading invoice:", error))
      .finally(() => {
        // Hide waiting screen
        $("#waitingdots").hide();
      });
  });

  $("#table_users_list").on("change", ".user-role-select", function () {
    var userId = $(this).data("user-id");
    var newRole = $(this).val();

    var data = JSON.stringify([
      {
        op: "replace",
        path: "/role",
        value: newRole,
      },
    ]);

    $.ajax({
      url: InvokeURL + "users/" + userId,
      type: "PATCH",
      contentType: "application/json",
      headers: {
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },
      data: data,
      success: function (response) {
        displayMessage("Success", "Rola użytkownika została zmieniona.");
        console.log("Role updated successfully", response);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        displayMessage("Error", "Nie udało się zmienić roli użytkownika.");
        console.error("Failed to update role", textStatus, errorThrown);
      },
    });
  });

  $("#table_users_list").on("click", ".details-control4", function () {
    var row = $(this).closest("tr");

    // Retrieve the DataTable API object
    var dataTable = $("#table_users_list").DataTable();
    var rowData = dataTable.row(row).data();
    var userId = rowData.id; // Assuming the 'id' is stored in the hidden column

    if (!userId) {
      console.error("User ID not found");
      return;
    }

    // Confirm deletion
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    // Proceed with the DELETE request
    $.ajax({
      url: InvokeURL + "users/" + userId, // Construct the request URL
      type: "DELETE",
      contentType: "application/json", // Set the content type to application/json
      headers: {
        Authorization: orgToken, // Ensure you include the authorization header
        "Requested-By": "webflow-3-4",
      },
      success: function (response) {
        console.log("User deleted successfully", response);
        displayMessage("Success", "Użytkownik został usunięty.");
        // Directly targeting the clicked icon's parent row for removal
        dataTable.row(row).remove().draw();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        displayMessage("Error", "Nie udało się usunąć użytkownika.");
        console.error("Failed to delete user", textStatus, errorThrown);
      },
    });
  });

  const tenantActivityKind = document.getElementById("tenantActivityKind");
  const selfEploymentContainer = document.getElementById(
    "selfEploymentContainer"
  );

  async function GetTenantBilling() {
    while (!getCookie("sprytnyUserRole") && attempts < 5) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (getCookie("sprytnyUserRole") !== "admin") {
      console.log("Action not permitted for non-admin users.");
      return;
    }

    function showDotForActiveTab() {
      setTimeout(function () {
        const isTab4Active = document.querySelector(
          "#w-tabs-0-data-w-tab-4.w--current"
        );
        const isTab1Active = document.querySelector(
          "#w-tabs-2-data-w-tab-1.w--current"
        );
        document.querySelector(".nb1").classList.toggle("hidden", isTab4Active);
        document
          .querySelector(".nb2")
          .classList.toggle("hidden", !isTab4Active || isTab1Active);
        document
          .querySelector(".nb3")
          .classList.toggle("hidden", !isTab1Active);
        document
          .querySelector("#fillUpOrganizationDetail")
          .classList.toggle("hidden", !isTab1Active);
      }, 150); // Delay the execution by 150 milliseconds
    }

    let url = new URL(
      InvokeURL + "tenants/" + getCookie("OrganizationName") + "/billing"
    );
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(this.response);
        const hasRequiredKeys =
          data.taxId !== null &&
          data.companyName !== null &&
          data.address && // Check if address object itself exists
          data.address.country !== null &&
          data.address.line1 !== null && // 'line2' is not required
          data.address.town !== null &&
          data.address.postcode !== null; // 'phones' is not required

        if (hasRequiredKeys) {
          console.log("All is good");
        } else {
          // Initial check and setup event listeners

          showDotForActiveTab();
          document.querySelectorAll("[data-w-tab]").forEach((link) => {
            link.addEventListener("click", showDotForActiveTab);
          });
        }
        var toParse = data; // Assuming 'data' is the object shown in your example
        // Directly mapping data to fields
        $("#tenantNameEdit").val(data.companyName || "");
        $("#tenantTaxIdEdit").val(data.taxId || "");
        $("#firstName").val(data.firstName || "");
        $("#lastName").val(data.lastName || "");
        $("#tenantTownEdit").val((data.address && data.address.town) || "");
        $("#tenantPostcodeEdit").val(
          (data.address && data.address.postcode) || ""
        );
        $("#tenantAdressEdit").val((data.address && data.address.line1) || "");
        $("#tenantAdressEdit2").val((data.address && data.address.line2) || "");
        $("#tenantPhoneEdit").val((data.phones && data.phones[0]?.phone) || "");
        // Set tenantActivityKind
        $("#tenantActivityKind").val(data.activityKind || "other_business");

        const totalCost = data.monthCostBreakdown.toDate.total;
        const standardCost = data.monthCostBreakdown.toDate.standard;
        const premiumCost = data.monthCostBreakdown.toDate.premium;

        $("#deleteStandardToDate").html(
          "Plan Podstawowy: " + premiumCost + "zł" || ""
        );
        $("#deletePremiumToDate").html(
          "Plan Premium: " + standardCost + "zł" || ""
        );
        $("#deleteTotalToDate").html("Suma: " + totalCost + "zł" || "");

        const deleteTenantDetails = `Kwota faktury do zapłacenia za bieżący okres wynosi ${totalCost} zł.`;

        $("#deleteTenantDetails").html(
          `<strong>${deleteTenantDetails}</strong>` || ""
        );

        function toggleSelfEploymentContainer() {
          if (tenantActivityKind.value !== "other_business") {
            selfEploymentContainer.style.display = "grid";
          } else {
            selfEploymentContainer.style.display = "none";
          }
        }

        tenantActivityKind.addEventListener(
          "change",
          toggleSelfEploymentContainer
        );

        // Initial call to set the correct display based on the initial value
        toggleSelfEploymentContainer();

        // Inform the user about the days left and the exact end date
        var trialEndDateText = "";
        const now = new Date();
        const trialEndDate = new Date(toParse.trialEndDate);
        const nextInvoiceDate = new Date(
          toParse.nextInvoiceDate
        ).toLocaleDateString("pl-PL");
        const diff = trialEndDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const fakeTrialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        var dots = document.querySelectorAll(".tooltip-dot");

        function updateAnimationColors(daysLeft) {
          var color;
          if (daysLeft <= 3) {
            color = "rgba(255, 0, 0, 0.8)"; // Red for high urgency
          } else if (daysLeft <= 7) {
            color = "rgba(255, 165, 0, 0.8)"; // Orange for moderate urgency
          } else {
            color = "rgba(42, 168, 255, 0.8)"; // Original blue for normal situation
          }

          var styleSheet = document.createElement("style");
          styleSheet.type = "text/css";
          styleSheet.innerText = `
            @keyframes tourDot {
              0%   { box-shadow: 0 0 0 0px ${color}; }
              80% { box-shadow: 0 0 0 36px ${color.replace("0.8", "0")}; }
              100% { box-shadow: 0 0 0 36px ${color.replace("0.8", "0")}; }
            }
            .tooltip-dot {
              animation: tourDot 2.0s ease-out infinite;
            }
          `;
          document.head.appendChild(styleSheet);
        }

        updateAnimationColors(daysLeft);

        dots.forEach(function (dot) {
          if (daysLeft <= 1) {
            // Red for high urgency
            dot.style.backgroundColor = "rgb(255, 0, 0)";
            dot.style.borderColor = "rgb(255, 0, 0)";
            dot.style.boxShadow = "0 0 0 50px rgba(255, 0, 0, 0)";
          } else if (daysLeft <= 7) {
            // Orange for moderate urgency
            dot.style.backgroundColor = "rgb(255, 165, 0)";
            dot.style.borderColor = "rgb(255, 165, 0)";
            dot.style.boxShadow = "0 0 0 50px rgba(255, 165, 0, 0)";
          } else {
            // Original blue for normal situation
          }
        });

        if (daysLeft < 0) {
          trialEndDateText = "Aktywny";
        } else if (daysLeft === 1) {
          trialEndDateText = `Twój bezpłatny okres testowy kończy się jutro.`;
        } else if (daysLeft === 0) {
          trialEndDateText = `Twój bezpłatny okres testowy kończy się dzisiaj.`;
        } else if (daysLeft > 30) {
          trialEndDateText = `Twój bezpłatny okres testowy kończy się za 30 dni - ${fakeTrialEnd.toLocaleDateString(
            "pl-PL"
          )}.`;
        } else {
          trialEndDateText = `Twój bezpłatny okres testowy kończy się za ${daysLeft} dni - ${trialEndDate.toLocaleDateString(
            "pl-PL"
          )}.`;
        }

        if (data.emails && data.emails.length > 0) {
          data.emails.forEach((email, index) => {
            if (index < 3) {
              $(`#tenantEmailEdit${index + 1}`).val(email.email || "");
              $(`#tenantEmailEditDescription${index + 1}`).val(
                email.description || ""
              );
            }
          });
        }

        // Iterate over elements with the 'tenantData' attribute
        document.querySelectorAll("[tenantData]").forEach((element) => {
          const dataType = element.getAttribute("tenantData");

          if (toParse.pricing.specialService !== null) {
            // If specialService is not null, show #specialServiceBox
            document.getElementById("specialServiceBox").style.display = "flex";
            document.getElementById("pricingStandard").style.display = "none";
            document.getElementById("pricingPremium").style.display = "none";
          } else {
            // If specialService is null, hide #specialServiceBox
            document.getElementById("specialServiceBox").style.display = "none";
          }

          switch (dataType) {
            case "tenantTrialEndDate":
              element.textContent = trialEndDateText || "Aktywny";
              break;
            case "tenantName":
              element.textContent = data.companyName || "N/A";
              break;
            case "organizationName":
              element.textContent = organizationName || "N/A";
              break;
            case "phone":
              if (toParse.phones && toParse.phones.length > 0) {
                element.textContent = toParse.phones[0].phone || "N/A";
              } else {
                element.textContent = "N/A";
              }
              break;
            case "nextInvoiceDate":
              element.textContent =
                "Data odnowienia subskrypcji: " + nextInvoiceDate || "N/A";
              break;
            case "forecastTotal":
              element.textContent =
                "Szacowana kwota faktury: " +
                  toParse.monthCostBreakdown.forecast.total +
                  " zł" || "N/A";
              break;

            case "standard":
              element.textContent =
                toParse.pricing.standard + " zł za sklep/miesięcznie" || "N/A";
              break;
            case "premium":
              element.textContent =
                toParse.pricing.premium + " zł za sklep/miesięcznie" || "N/A";
              break;
            case "specialService":
              // Safely accessing specialService fee
              element.textContent =
                toParse.pricing.specialService &&
                toParse.pricing.specialService.fee
                  ? toParse.pricing.specialService.description +
                    " - " +
                    toParse.pricing.specialService.fee +
                    " zł/miesięcznie"
                  : "N/A";
              break;
            case "name":
              element.textContent = toParse.name || "N/A";
              break;
            case "taxId":
              element.textContent = toParse.taxId || "N/A";
              break;
            case "address":
              // Łączenie wszystkich części adresu w jeden ciąg
              const addressParts = toParse.address
                ? [
                    toParse.address.town,
                    toParse.address.postcode,
                    toParse.address.line1,
                    toParse.address.line2,
                    toParse.address.country,
                  ]
                    .filter((part) => part)
                    .join(", ")
                : "N/A";
              element.textContent = addressParts;
              break;
            case "country":
              element.textContent =
                toParse.address && toParse.address.country
                  ? toParse.address.country
                  : "N/A";
              break;
            case "town":
              element.textContent =
                toParse.address && toParse.address.town
                  ? toParse.address.town
                  : "N/A";
              break;
            case "postcode":
              element.textContent =
                toParse.address && toParse.address.postcode
                  ? toParse.address.postcode
                  : "N/A";
              break;
            case "emails":
              const emails =
                toParse.emails && toParse.emails.map((e) => e.email).join(", ");
              element.textContent = emails || "N/A";
              break;
          }
        });
      } else {
        console.error("Error loading tenant billing info:", request.status);
      }
    };

    request.onerror = function () {
      console.error("Error loading tenant billing info:", request.statusText);
    };

    request.send();
  }

  async function getWholesalers() {
    while (!getCookie("sprytnyUserRole") && attempts < 5) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (getCookie("sprytnyUserRole") !== "admin") {
      console.log("Action not permitted for non-admin users.");
      return;
    }

    let url = new URL(InvokeURL + "wholesalers?perPage=1000");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.setRequestHeader("Requested-By", "webflow-3-4");
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(this.response);
        var toParse = data.items;
        toParse.sort(function (a, b) {
          return b.enabled - a.enabled;
        });

        // Define mapping of wholesalerKey to organizationName
        const wholesalerTenantMapping = {
          Slodhurt: "slod-hurt",
          HurtowniaTEDI: "kd-tedi",
        };

        if (getCookie("OrganizationName") in wholesalerTenantMapping) {
          toParse = toParse.filter(function (item) {
            return (
              item.wholesalerKey ===
              wholesalerTenantMapping[getCookie("OrganizationName")]
            );
          });
        }

        // Code for exclusive

        const wholesalerContainer = document.getElementById("wholesalerPicker");
        var opt = document.createElement("option");
        opt.value = null;
        opt.innerHTML = "BLOKADA";
        wholesalerContainer.appendChild(opt);
        toParse.forEach((wholesaler) => {
          if (wholesaler.enabled) {
            var opt = document.createElement("option");
            opt.value = wholesaler.wholesalerKey;
            opt.innerHTML = wholesaler.name;
            wholesalerContainer.appendChild(opt);
          }
        });

        // Code for documents

        const wholesalerContainerDocuments =
          document.getElementById("documentWholesaler");
        toParse.forEach((wholesaler) => {
          if (wholesaler.enabled) {
            var opt = document.createElement("option");
            opt.value = wholesaler.wholesalerKey;
            opt.innerHTML = wholesaler.name;
            wholesalerContainerDocuments.appendChild(opt);
          }
        });

        const wholesalerContainer2 = document.getElementById(
          "WholesalerSelector-Exclusive-Edit"
        );
        var opt = document.createElement("option");
        opt.value = null;
        opt.innerHTML = "BLOKADA";
        wholesalerContainer2.appendChild(opt);
        toParse.forEach((wholesaler) => {
          if (wholesaler.enabled) {
            var opt = document.createElement("option");
            opt.value = wholesaler.wholesalerKey;
            opt.innerHTML = wholesaler.name;
            wholesalerContainer2.appendChild(opt);
          }
        });

        var enabledWholesalers = toParse.filter(function (item) {
          return item.enabled === true;
        });

        $("#table_wholesalers_list").DataTable({
          data: toParse,
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
              data: "image",
              width: "36px",
              height: "36px",
              render: function (data) {
                if (data !== null) {
                  return (
                    "<div style='height:36px width: 36px' class='details-container2'><img src='data:image/png;base64," +
                    data +
                    "' alt='logo'></img></div>"
                  );
                }
                if (data === null) {
                  return "<div style='height:36px width: 36px' class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61ae41350933c525ec8ea03a_office-building.svg' alt='wholesaler'></img></div>";
                }
              },
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
              visible: false,
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
              data: "platformUrl",
              render: function (data) {
                if (data !== null) {
                  return '<spann class="positive">Tak</spann>';
                } else {
                  return '<spann class="negative">Nie</spann>';
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
              data: "enabled",
              render: function (data, type, row) {
                if (type === "display") {
                  if (data) {
                    return (
                      '<label class="switchCss"><input type="checkbox" checked class="editor-active"  wholesalerKey="' +
                      row["wholesalerKey"] +
                      '"><span class="slider round"></span></label>'
                    );
                  } else {
                    return (
                      '<label class="switchCss"><input type="checkbox" class="editor-active" wholesalerKey="' +
                      row["wholesalerKey"] +
                      '"><span class="slider round"></span></label>'
                    );
                  }
                }
                return data;
              },
            },
            {
              orderable: false,
              data: "wholesalerKey",
              render: function (data) {
                if (data !== null) {
                  return (
                    '<div class="action-container"><a href="https://' +
                    DomainName +
                    "/app/wholesalers/wholesaler-page?wholesalerKey=" +
                    data +
                    '"class="buttonoutline editme w-button">Przejdź</a></div>'
                  );
                }
                if (data === null) {
                  return "";
                }
              },
            },
          ],
        });
        $("#table_wholesalers_list_bonus").DataTable({
          data: enabledWholesalers,
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
              data: "image",
              width: "36px",
              height: "36px",
              render: function (data) {
                if (data !== null) {
                  return (
                    "<div style='height:36px width: 36px' class='details-container2'><img src='data:image/png;base64," +
                    data +
                    "' alt='logo'></img></div>"
                  );
                }
                if (data === null) {
                  return "<div style='height:36px width: 36px' class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61ae41350933c525ec8ea03a_office-building.svg' alt='wholesaler'></img></div>";
                }
              },
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
              orderable: false,
              data: "wholesalerKey",
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
              orderable: false,
              data: "preferentialBonus",
              render: function (data, type, row) {
                return (
                  '<input type="number" step="0.01" style="max-width: 80px" title="Wprowadź wartość od 0 do 500 z dokładnością do dwóch miejsc dziesiętnych." min="0" max="500" value="' +
                  data +
                  '">'
                );
              },
            },
          ],
        });
        $("#table_wholesalers_list").on(
          "change",
          "input.editor-active",
          function () {
            var checkbox = this; // Reference to the checkbox
            var isChecked = checkbox.checked; // Current state
            var row = $("#table_wholesalers_list")
              .DataTable()
              .row($(this).closest("tr")); // Get the DataTable row
            var data = row.data(); // Get row data

            var onErrorCallback = function () {
              // Revert checkbox state if there's an error
              $(checkbox).prop("checked", !isChecked);
            };

            if (isChecked) {
              updateStatus(
                true,
                checkbox.getAttribute("wholesalerKey"),
                onErrorCallback
              );
              // Add to the second table if enabled
              addToSecondTable(data);
            } else {
              updateStatus(
                false,
                checkbox.getAttribute("wholesalerKey"),
                onErrorCallback
              );
              // Remove from the second table if disabled
              removeFromSecondTable(data.wholesalerKey);
            }
          }
        );
        function addToSecondTable(data) {
          var tableBonus = $("#table_wholesalers_list_bonus").DataTable();
          tableBonus.row.add(data).draw();
        }

        function removeFromSecondTable(wholesalerKey) {
          var tableBonus = $("#table_wholesalers_list_bonus").DataTable();
          var rowIndex = tableBonus
            .rows(function (idx, data, node) {
              return data.wholesalerKey === wholesalerKey;
            })
            .indexes();
          tableBonus.row(rowIndex).remove().draw();
        }
      }

      if (request.status == 401) {
        console.log("Unauthorized");
      }
    };
    request.send();
  }

  async function getIntegrations() {
    let attempts = 0;

    while (!getCookie("sprytnyUserRole") && attempts < 5) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (getCookie("sprytnyUserRole") !== "admin") {
      console.log("Action not permitted for non-admin users.");
      return;
    }

    try {
      GetTenantBilling();
      const url = new URL(InvokeURL + "integrations");
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: orgToken },
        "Requested-By": "webflow-3-4",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const toParse = data.items;

      toParse.forEach(processIntegration);
    } catch (error) {
      console.error("Error fetching integrations:", error);
    }
  }

  function processIntegration(integration) {
    const $row = $("#Sample-Integration").clone().css("display", "flex");

    $row.find("h6").eq(1).text(integration.name);
    $row
      .find("img")
      .eq(0)
      .attr("src", `data:image/png;base64,${integration.image}`);

    const $integrationStatus = $row.find("h6").eq(3);

    if (integration.enabled === true) {
      updateIntegrationStatus($integrationStatus, "Succeeded", "green");
      checkIntegrationStatus(integration, $integrationStatus);
    } else {
      updateIntegrationStatus($integrationStatus, "Oczekuję", null);
    }

    const href = getIntegrationHref(integration.integrationKey);
    $row.attr("href", href);

    $("#Integrations-Container").append($row);
  }

  function updateIntegrationStatus($element, statusText, color) {
    if (statusText === "Succeeded") {
      statusText = "Aktywny";
      color = "green";
    } else if (statusText === "Oczekuję") {
      statusText = "Oczekuję";
      color = "gray";
    } else {
      statusText = "Błąd";
      color = "red";
    }
    $element.text(statusText).css("color", color || "");
    const tippyContent = ` class="tippy" data-tippy-content="Status: ${statusText}" alt=""`;
    $element.attr("class", tippyContent.split(' class="')[1].split('"')[0]);
    $element.attr(
      "data-tippy-content",
      tippyContent.split('data-tippy-content="')[1].split('"')[0]
    );
  }

  function checkIntegrationStatus(integration, $integrationStatus) {
    $.ajax({
      url: new URL(
        InvokeURL + "integrations/" + integration.integrationKey + "/test"
      ),
      type: "GET",
      headers: { Authorization: orgToken, "Requested-By": "webflow-3-4" },
      success: (response) =>
        updateIntegrationStatus($integrationStatus, `${response.status}`),
      error: () =>
        updateIntegrationStatus($integrationStatus, "Error fetching status"),
    });
  }

  function getIntegrationHref(integrationKey) {
    switch (integrationKey) {
      case "retroactive":
        return `https://${DomainName}/app/integrations/contracts`;
      case "merchant-console":
        return `https://${DomainName}/app/integrations/merchant-console`;
      case "pc-market":
        return `https://${DomainName}/app/integrations/pc-market`;
      default:
        return "#"; // Default href if needed
    }
  }

  makeWebflowFormAjaxDelete = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var endpoint = InvokeURL + "tenants/" + organizationName;

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
            "Requested-By": "webflow-3-4",
          },
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();

                displayMessage("Error", "Nie udało się usunąć organizacji.");
                failBlock.show();
                return;
              }
            }
            $("#deleteOrganizationModal").hide();
            displayMessage("Success", "Organizacja została usunięta.");
            window.setTimeout(function () {
              window.location = "https://" + DomainName + "/app/users/me";
            }, 1000);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";
            if (jqXHR.status === 0) {
              msg = "Not connect.\n Verify Network.";
            } else if (jqXHR.status === 403) {
              msg = "Użytkownik nie ma uprawnień do usunięcia organizacji.";
            } else if (jqXHR.status === 409) {
              msg =
                "Aby móc usunąć organizację, prosimy o uregulowanie zaległych faktur.";
            } else if (jqXHR.status === 500) {
              msg = "Internal Server Error [500].";
            } else if (exception === "parsererror") {
              msg = "Requested JSON parse failed.";
            } else if (exception === "timeout") {
              msg = "Time out error.";
            } else if (exception === "abort") {
              msg = "Ajax request aborted.";
            } else {
              msg = "" + jqXHR.responseJSON.message;
            }
            form.show();
            displayMessage("Error", msg);
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
        var action = InvokeURL + "users";
        var emailInput = $("#InviteUserEmail");
        var emailValue = emailInput.val();

        // Check if the email domain is @gmail.com and convert it to lowercase
        if (emailValue.indexOf("@gmail.com") !== -1) {
          emailValue = emailValue.toLowerCase();
        }

        var data = {
          email: emailValue,
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
            "Requested-By": "webflow-3-4",
          },
          data: JSON.stringify(data),
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                displayMessage("Error", "Nie udało się wysłać zaproszenia.");
                console.log(e);
                return;
              }
            }
            displayMessage(
              "Success",
              "Zaproszenie zostało wysłane. Możesz wysłać kolejne."
            );
            emailInput.val("");
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";

            // Handle different error cases
            if (jqXHR.status === 0) {
              msg = "Not connect. Verify Network.";
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
              msg = "" + jqXHR.responseJSON.message;
            }

            form.show();
            displayMessage("Error", msg);
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
            "Requested-By": "webflow-3-4",
          },
          data: JSON.stringify(data),
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                displayMessage("Error", "Nie udało się utworzyć organizacji.");
                console.log(e);
                return;
              }
            }
            form.hide();
            displayMessage("Success", "Organizacja została utworzona.");
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
              msg = "" + jqXHR.responseJSON.message;
            }
            form.show();
            displayMessage("Error", msg);
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
        var modalCreateShop = $("#modalCreateShop");
        var action = InvokeURL + "shops";
        var data = {
          name: $("#newShopName").val(),
          shopKey: $("#newShopKey").val().toUpperCase(),
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
            "Requested-By": "webflow-3-4",
          },
          data: JSON.stringify(data),
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                displayMessage("Error", "Nie udało się utworzyć sklepu.");
                console.log(e);
                return;
              }
            }
            form.hide();
            modalCreateShop.hide();
            displayMessage("Success", "Twój sklep został utworzony.");
            window.setTimeout(function () {
              location.reload();
            }, 1000);
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            displayMessage("Error", "Nie udało się utworzyć sklepu.");
            console.log(e);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  async function getPriceLists() {
    while (!getCookie("sprytnyUserRole") && attempts < 5) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (getCookie("sprytnyUserRole") !== "admin") {
      console.log("Action not permitted for non-admin users.");
      return;
    }
    let url = new URL(InvokeURL + "price-lists?perPage=1000");
    fetch(url, {
      headers: {
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const toParse = data.items.map((item) => {
          const now = new Date().setHours(0, 0, 0, 0);
          const startDate = new Date(item.startDate).setHours(0, 0, 0, 0);
          const endDate = new Date(item.endDate).setHours(0, 0, 0, 0);

          const daysValid = (endDate - now) / (1000 * 60 * 60 * 24);
          let status;
          if (now < startDate) {
            status = "Przyszły";
          } else if (now <= endDate && daysValid == 0) {
            status = "Kończy się";
          } else if (now > endDate && daysValid == -1) {
            status = "Zakończony";
          } else if (now <= endDate) {
            status = "Aktywny";
          } else {
            status = "Przeszły";
          }

          return {
            ...item,
            status: status,
            daysValid: daysValid,
          };
        });

        const hasEntries = toParse.length > 0;
        $("#emptystatepricelists").toggle(!hasEntries);
        $("#pricelistscontainer").toggle(hasEntries);

        const table = $("#table_pricelists_list").DataTable({
          data: toParse,
          pagingType: "full_numbers",
          order: [[4, "desc"]],
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
            loadingRecords: "<div class='spinner'></div>",
            processing: "<div class='spinner'></div>",
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
                "<div class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg' alt='offer'></img></div>",
            },
            {
              orderable: false,
              visible: false,
              data: "uuid",
              render: function (data) {
                return data !== null ? data : "";
              },
            },
            {
              orderable: true,
              data: "wholesalerKey",
              render: function (data) {
                return data !== null ? data : "";
              },
            },
            {
              orderable: true,
              data: "status",
              render: function (data) {
                let className;
                switch (data) {
                  case "Aktywny":
                    className = "positive";
                    break;
                  case "Przyszły":
                    className = "positive";
                    break;
                  case "Przeszły":
                    className = "negative";
                    break;
                  case "Kończy się":
                    className = "medium";
                    break;
                  case "Zakończony":
                    className = "negative";
                    break;
                }
                return `<span class="${className}">${data}</span>`;
              },
            },
            {
              orderable: true,
              data: "daysValid",
              type: "num",
              render: function (data, type, row) {
                // Truncate data to remove decimal part
                const daysValid = Math.trunc(data);

                // For sorting, return the numeric value
                if (type === "sort") {
                  return daysValid;
                }

                // For display, format the text and apply styling
                let className;
                let displayText;

                if (daysValid === 1 || daysValid === -1) {
                  displayText = `${daysValid} dzień`;
                } else {
                  displayText = `${daysValid} dni`;
                }

                if (daysValid > 3) {
                  className = "positive";
                } else if (daysValid >= 1) {
                  className = "positive";
                } else if (daysValid == 0) {
                  className = "medium";
                } else if (daysValid >= -3) {
                  className = "negative";
                } else {
                  className = "negative";
                }

                return `<span class="${className}">${displayText}</span>`;
              },
            },
            {
              orderable: true,
              data: "startDate",
              type: "date",
              render: function (data) {
                if (data !== null) {
                  var utcDate = new Date(Date.parse(data));
                  return utcDate.toLocaleDateString("pl-PL");
                }
                return "";
              },
            },
            {
              orderable: true,
              data: "endDate",
              type: "date",
              render: function (data) {
                if (data !== null) {
                  var utcDate = new Date(Date.parse(data));
                  return utcDate.toLocaleDateString("pl-PL");
                }
                return "";
              },
            },
            {
              orderable: true,
              data: "created.by",
              render: function (data) {
                return data !== null ? data : "";
              },
            },
            {
              orderable: false,
              data: null,
              defaultContent:
                '<div class="action-container"><a href="#" class="buttonoutline editme w-button">Przejdź</a></div>',
            },
            {
              orderable: false,
              class: "details-control4",
              width: "20px",
              data: null,
              defaultContent:
                "<img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg' alt='details'></img>",
            },
          ],
          initComplete: function (settings, json) {
            const filtersToAdd = [
              {
                column: 2,
                name: "Dostawca",
                elementId: "wholesalerKeyIndicator",
              },
              { column: 3, name: "Status", elementId: "statusIndicator" },
              { column: 7, name: "Autor", elementId: "authorIndicator" },
            ];

            filtersToAdd.forEach((filter) => {
              const column = this.api().column(filter.column);
              const select = $(`#${filter.elementId}`);

              // Clear existing options
              select.empty().append('<option value=""></option>');

              // Add new options
              column
                .data()
                .unique()
                .sort()
                .each(function (d, j) {
                  select.append(`<option value="${d}">${d}</option>`);
                });

              // Add change event listener
              select.on("change", function () {
                const val = $.fn.dataTable.util.escapeRegex($(this).val());
                column.search(val ? `^${val}$` : "", true, false).draw();
              });
            });
          },
        });

        // Add global search functionality
        $(".dataTables_filter input")
          .unbind()
          .bind("input", function () {
            table.search(this.value).draw();
          });
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        if (error.message === "Unauthorized") {
          console.log("Unauthorized");
        }
      });
  }

  function getDocuments() {
    var tableDocuments = $("#table_documents").DataTable({
      pagingType: "full_numbers",
      order: [],
      dom: '<"top">rt<"bottom"lip>',
      scrollY: "60vh",
      scrollCollapse: true,
      pageLength: 10,
      searching: true,
      language: {
        emptyTable: "Brak danych do wyświetlenia",
        info: "Pokazuje _START_ - _END_ z _TOTAL_ rezultatów",
        infoEmpty: "Brak danych",
        infoFiltered: "(z _MAX_ rezultatów)",
        lengthMenu: "Pokaż _MENU_ rekordów",
        loadingRecords: "<div class='spinner'></div>",
        processing: "<div class='spinner'></div>",
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

        $.get(
          InvokeURL + "van/transactions",
          {
            perPage: 1000, // Fetch 1000 items
            page: 1,
          },
          function (res) {
            // Populate filter options
            populateFilters(res.items);

            callback({
              recordsTotal: res.total,
              recordsFiltered: res.total,
              data: res.items,
            });
          }
        );
      },
      processing: true,
      serverSide: false, // Perform sorting and searching client-side
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
          data: "uuid",
          render: function (data) {
            return data !== null ? data : "";
          },
        },
        {
          orderable: true,
          data: "wholesalerKey",
          render: function (data) {
            return data !== null ? data : "";
          },
        },
        {
          orderable: true,
          data: "type",
          render: function (data) {
            switch (data) {
              case "DESADV":
                return "Dostawa";
              case "INVOIC":
                return "Faktura";
              default:
                return data;
            }
          },
        },
        {
          orderable: true,
          data: "name",
          render: function (data) {
            return data !== null ? data : "";
          },
        },
        {
          data: "shopKeys",
          orderable: true,
          render: function (data, type, row) {
            if (data && data.length > 2) {
              return `Sklepów: ${data.length}`;
            } else {
              return data ? data.join(", ") : "";
            }
          },
        },
        {
          orderable: true,
          type: "date",
          data: "created.at",
          render: function (data) {
            if (data !== null) {
              var utcDate = new Date(Date.parse(data));
              return utcDate.toLocaleString("pl-PL", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
            }
            return "";
          },
        },
        {
          orderable: true,
          type: "date",
          data: "created.by",
          render: function (data) {
            return data !== null ? data : "";
          },
        },
        {
          orderable: true,
          type: "date",
          data: "modified.at",
          render: function (data) {
            if (data !== null) {
              var utcDate = new Date(Date.parse(data));
              return utcDate.toLocaleString("pl-PL", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
            }
            return "";
          },
        },
        {
          orderable: true,
          type: "date",
          data: "modified.by",
          render: function (data) {
            return data !== null ? data : "-";
          },
        },
        {
          orderable: false,
          data: null,
          defaultContent:
            '<div class="action-container">' +
            '<img style="cursor: pointer;margin-right:4px;" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/640442ed27be9b5e30c7dc31_edit.svg" action="edit" alt="edit">' +
            '<img style="cursor: pointer;margin-right:4px;" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg" action="delete" alt="delete">' +
            '<img style="cursor: pointer;margin-right:4px;" src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6693849fa8a89c4e5ead5615_download.svg" action="download" alt="download">' +
            "</div>",
        },
      ],
      initComplete: function (settings, json) {
        var hasEntries = tableDocuments.data().any();
        if (!hasEntries) {
          $("#emptystatedocuments").show();
          $("#documentscontainer").hide();
        } else {
          $("#emptystatedocuments").hide();
          $("#documentscontainer").show();
        }

        // Filter table based on selected options
        $(".filterinput").on("change", function () {
          tableDocuments.draw();
        });

        // Custom filtering function for DataTable
        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
          var wholesaler = $("#wholesalerPickerDocuments").val();
          var documentType = $("#documentTypePicker").val();
          var shop = $("#documentShopPicker").val();
          var author = $("#documentAuthorPicker").val();

          var wholesalerMatch = wholesaler ? data[2] == wholesaler : true; // Adjust index based on your columns
          var documentTypeMatch = documentType ? data[3] == documentType : true; // Adjust index based on your columns
          var shopMatch = shop ? data[5] && data[5].includes(shop) : true; // Adjust index based on your columns
          var authorMatch = author ? data[6] == author : true; // Adjust index based on your columns

          return (
            wholesalerMatch && documentTypeMatch && shopMatch && authorMatch
          );
        });

        // Clear all filters
        $("#ClearAllButton").on("click", function (e) {
          e.preventDefault();
          $(".filterinput").val("").trigger("change");
        });

        // Event delegation for edit, delete, and download actions
        $("#table_documents tbody").on(
          "click",
          'img[action="edit"]',
          function () {
            var data = tableDocuments.row($(this).parents("tr")).data();
            // Implement your edit functionality here
            console.log("Edit:", data);
          }
        );

        $("#table_documents tbody").on(
          "click",
          'img[action="delete"]',
          function () {
            var data = tableDocuments.row($(this).parents("tr")).data();
            // Implement your delete functionality here
            console.log("Delete:", data);
          }
        );

        $("#table_documents tbody").on(
          "click",
          'img[action="download"]',
          function () {
            var data = tableDocuments.row($(this).parents("tr")).data();
            // Implement your download functionality here
            console.log("Download:", data);
            // Example: Redirect to the download URL
            window.location.href = `/download/${data.uuid}`;
          }
        );
      },
    });

    function populateFilters(items) {
      var wholesalers = new Set();
      var documentTypes = new Set();
      var shops = new Set();
      var authors = new Set();

      items.forEach(function (item) {
        wholesalers.add(item.wholesalerKey);
        documentTypes.add(item.type);
        if (item.shopKeys) {
          item.shopKeys.forEach(function (shop) {
            shops.add(shop);
          });
        }
        authors.add(item.created.by);
      });

      wholesalers.forEach(function (wholesaler) {
        $("#wholesalerPickerDocuments").append(
          new Option(wholesaler, wholesaler)
        );
      });

      var documentTypeMapping = {
        DESADV: "Dostawa",
        INVOIC: "Faktura",
        DEFAULT: "Inne",
      };

      documentTypes.forEach(function (type) {
        var displayName =
          documentTypeMapping[type] || documentTypeMapping["DEFAULT"];
        $("#documentTypePicker").append(new Option(displayName, type));
      });

      shops.forEach(function (shop) {
        $("#documentShopPicker").append(new Option(shop, shop));
      });

      authors.forEach(function (author) {
        $("#documentAuthorPicker").append(new Option(author, author));
      });
    }
  }

  function DocumentFileUpload(skipTypeCheck) {
    var xhr = new XMLHttpRequest();
    var documentFile = document.getElementById("documentfile").files[0];
    var fileSize = documentFile.size;

    // Check for file size exceeding 10 MB
    if (fileSize > 10 * 1024 * 1024) {
      $("#wrongfilemodal").css("display", "flex");
      $("#wrongfilemessage").text(
        "Jeden z Twoich plików jest zbyt duży. Plik jest większy niż 10 MB"
      );
      $("#addDocumentModal").css("display", "none");
      document.getElementById("documentfile").value = "";
      return; // Exit the function
    }

    $("#waitingdots").show();

    // Build query parameters
    var queryParams =
      `name=${encodeURIComponent($("#documentName").val())}&` +
      `type=${encodeURIComponent($("#documentType").val())}&` +
      `shopKey=${encodeURIComponent($("#documentShop").val())}&` +
      `wholesalerKey=${encodeURIComponent($("#documentWholesaler").val())}`;

    var action = InvokeURL + "van/transactions?" + queryParams;
    if (skipTypeCheck) {
      action += "&skipTypeCheck=true";
    }
    xhr.open("POST", action, true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.setRequestHeader("Authorization", orgToken);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        $("#waitingdots").hide();
        if (xhr.status === 201) {
          var response = JSON.parse(xhr.responseText);
          displayMessage("Success", "Dokument został stworzony.");
        } else {
          var msg = "";
          try {
            var jsonResponse = JSON.parse(xhr.responseText);
            msg = jsonResponse.message || "Unknown error occurred";
          } catch (e) {
            msg = "Unable to parse response";
          }
          console.log(xhr);
          if (xhr.status === 0) {
            msg = "Not connect.\n Verify Network.";
          } else if (xhr.status === 400) {
            msg = jsonResponse.message;
          } else if (xhr.status === 403) {
            msg = "Oops! Coś poszło nie tak. Proszę spróbuj ponownie.";
          } else if (xhr.status === 500) {
            msg = "Internal Server Error [500].";
            $("#orderfile").val("");
          } else {
            msg = jsonResponse.message;
            $("#orderfile").val("");
          }
          displayMessage("Error", msg);
        }
      }
    };

    // Read the file as binary and send it
    var reader = new FileReader();
    reader.onload = function (event) {
      var binaryData = event.target.result;
      xhr.send(binaryData);
    };
    reader.readAsArrayBuffer(documentFile);
  }

  const documentButton = document.getElementById("documentButton");
  const UploadDocumentfile = document.getElementById("documentfile");

  documentButton.addEventListener("click", (event) => {
    if (UploadDocumentfile.files.length > 0) {
      DocumentFileUpload(true);
    } else {
      console.log("There is no file");
    }
  });

  UploadDocumentfile.addEventListener("change", (event) => {
    var isFile = UploadDocumentfile.files.length > 0;
    if (isFile) {
      documentButton.classList.remove("disabledfornow");
      documentButton.textContent = "Kontynuuj";
      documentButton.style.opacity = 1;
      documentButton.style.cursor = "pointer";
    } else {
      documentButton.classList.add("disabledfornow");
      documentButton.textContent = "Najpierw wybierz plik dokumentu.";
      documentButton.style.opacity = 0.5;
      documentButton.style.cursor = "default";
    }
  });

  // Call with custom header
  $("#skipButton").on("click", function () {
    DocumentFileUpload(true);
  });

  ///koniec//

  $("#table_pricelists_list").on(
    "click",
    "a.buttonoutline.editme",
    function (event) {
      event.preventDefault();
      var table = $("#table_pricelists_list").DataTable();
      var rowData = table.row($(this).closest("tr")).data();
      window.location.replace(
        "https://" +
          DomainName +
          "/app/pricelists/pricelist?uuid=" +
          rowData.uuid
      );
    }
  );

  $("#table_pricelists_list").on("click", "td.details-control4", function () {
    var table = $("#table_pricelists_list").DataTable();
    var tr = $(this).closest("tr");
    var rowData = table.row(tr).data();

    if (rowData && rowData.uuid) {
      // Wyświetl potwierdzenie usuwania
      var confirmDelete = confirm("Czy na pewno chcesz usunąć ten cennik?");

      if (confirmDelete) {
        var endpoint = InvokeURL + "price-lists/" + rowData.uuid;

        $.ajax({
          type: "DELETE",
          url: endpoint,
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            $("#waitingdots").hide();
          },
          headers: {
            Authorization: orgToken,
            "Requested-By": "webflow-3-4",
          },
          success: function () {
            console.log("Rekord został pomyślnie usunięty.");
            $("#waitingdots").show(1).delay(150).hide(1);
            table.row(tr).remove().draw(); // Use the captured `tr` directly
          },
          error: function (xhr, status, error) {
            console.error("Błąd usuwania rekordu:", error);
          },
        });
      }
    } else {
      console.error("Brak UUID w danych rekordu.");
    }
  });

  makeWebflowFormAjaxNewWh = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action =
          "https://hook.integromat.com/1xsh5m1qtu8wj7vns24y5tekcrgq2pc3";
        var data = {
          whname: $("#Wholesaler-Name").val(),
          taxId: $("#taxId").val(),
          platformUrl: $("#platformUrl").val(),
          organizationName: $("#organizationName").text(),
          form: "new-Wholesaler",
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
            "Requested-By": "webflow-3-4",
          },
          data: JSON.stringify(data),
          success: function (resultData) {
            if (typeof successCallback === "function") {
              result = successCallback(resultData);
              if (!result) {
                form.show();
                displayMessage("Error", "Nie udało się zgłosić dostawcy.");
                console.log(e);
                return;
              }
            }
            form.show();
            displayMessage(
              "Success",
              "Dostawca został zgłoszony. Możesz zgłosić kolejnego."
            );
            $("#Wholesaler-Name").val("");
            $("#taxId").val("");
            $("#platformUrl").val("");
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            displayMessage("Error", "Nie udało się zgłosić dostawcy.");
            console.log(e);
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  makeWebflowFormAjaxPatchTenantBilling = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        event.preventDefault();
        const organizationName = $("#organizationName").text();
        const url = `${InvokeURL}tenants/${organizationName}/billing`;
        $.ajax({
          type: "GET",
          url: url,
          contentType: "application/json",
          dataType: "json",
          headers: {
            Authorization: orgToken,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Requested-By": "webflow-3-4",
          },
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            $("#waitingdots").hide();
          },
          success: function (currentData) {
            const patchData = preparePatchData(currentData);
            console.log(patchData);

            // Additional checks for required fields
            const newActivityKind = $("#tenantActivityKind").val();
            if (newActivityKind === "self_employed") {
              const newFirstName = $("#firstName").val();
              const newLastName = $("#lastName").val();
              if (!newFirstName || !newLastName) {
                displayMessage(
                  "Error",
                  "Pola Imię i Nazwisko są wymagane przy zmianie rodzaju działalności"
                );
                return;
              }
            }

            if (patchData.some((patch) => patch.path === "/taxId")) {
              if (
                !patchData.some((patch) => patch.path === "/companyName") ||
                !patchData.some((patch) => patch.path === "/address")
              ) {
                displayMessage(
                  "Error",
                  "Jeśli zmieniasz NIP, proszę podać również nazwę firmy oraz adres."
                );
                return;
              }
            }

            if (patchData.length > 0) {
              // Send PATCH request only if there are changes
              $.ajax({
                type: "PATCH",
                url: url,
                data: JSON.stringify(patchData),
                contentType: "application/json",
                dataType: "json",
                headers: {
                  Authorization: orgToken,
                  "Requested-By": "webflow-3-4",
                },
                beforeSend: function () {
                  $("#waitingdots").show();
                },
                complete: function () {
                  $("#waitingdots").hide();
                },
                success: function (resultData) {
                  if (typeof successCallback === "function") {
                    successCallback(resultData);
                  }
                  displayMessage("Success", "Dane zostały zaktualizowane.");
                },
                error: function () {
                  if (typeof errorCallback === "function") {
                    errorCallback();
                  }
                  displayMessage(
                    "Error",
                    "Oops. Coś poszło nie tak, spróbuj ponownie."
                  );
                },
              });
            } else {
              if (typeof successCallback === "function") {
                successCallback(currentData);
              }
              displayMessage("Success", "Dane zostały zaktualizowane.");
            }
          },
          error: function () {
            if (typeof errorCallback === "function") {
              errorCallback();
            }
            displayMessage(
              "Error",
              "Oops. Coś poszło nie tak, spróbuj ponownie."
            );
          },
        });
        return false; // Prevent the form from submitting normally
      });
    });
  };

  function preparePatchData(currentData) {
    var patchData = [];

    // Name
    var newName = $("#tenantNameEdit").val();
    if (newName !== currentData.companyName) {
      patchData.push({ op: "replace", path: "/companyName", value: newName });
    }

    // Tax ID
    var newTaxId = $("#tenantTaxIdEdit").val();
    var taxIdChanged = false;
    if (newTaxId !== currentData.taxId) {
      patchData.push({ op: "replace", path: "/taxId", value: newTaxId });
      taxIdChanged = true;
    }

    // Address
    var newAddress = {
      country: "PL", // Assuming the country is always Poland
      line1: $("#tenantAdressEdit").val(),
      line2: $("#tenantAdressEdit2").val(),
      town: $("#tenantTownEdit").val(),
      postcode: $("#tenantPostcodeEdit").val(),
    };

    // Compare each property to see if any part of the address has changed
    var addressChanged = false;
    for (var key in newAddress) {
      if (
        newAddress[key] !==
        (currentData.address[key] === null ? null : currentData.address[key])
      ) {
        addressChanged = true;
        break;
      }
    }

    if (addressChanged || taxIdChanged) {
      patchData.push({ op: "replace", path: "/address", value: newAddress });
    }

    // Emails
    var newEmails = [];
    for (let i = 1; i <= 3; i++) {
      let email = $(`#tenantEmailEdit${i}`).val();
      let description = $(`#tenantEmailEditDescription${i}`).val();
      if (email || description) {
        // Add if either field is filled
        newEmails.push({ email: email, description: description });
      }
    }

    // Only replace emails if there's a difference, using JSON.stringify for a quick deep comparison
    if (JSON.stringify(newEmails) !== JSON.stringify(currentData.emails)) {
      patchData.push({ op: "replace", path: "/emails", value: newEmails });
    }

    // Tenant Activity Kind
    var newActivityKind = $("#tenantActivityKind").val();
    if (newActivityKind !== currentData.activityKind) {
      patchData.push({
        op: "replace",
        path: "/activityKind",
        value: newActivityKind,
      });
    }

    // First Name and Last Name if tenantActivityKind is not "other_business"
    if (newActivityKind !== "other_business") {
      var newFirstName = $("#firstName").val();
      var newLastName = $("#lastName").val();
      if (newFirstName !== currentData.firstName) {
        patchData.push({
          op: "replace",
          path: "/firstName",
          value: newFirstName,
        });
      }
      if (newLastName !== currentData.lastName) {
        patchData.push({
          op: "replace",
          path: "/lastName",
          value: newLastName,
        });
      }
    }

    return patchData;
  }

  function LoadTippy() {
    $.getScript(
      "https://unpkg.com/popper.js@1",
      function (data, textStatus, jqxhr) {
        $.getScript(
          "https://unpkg.com/tippy.js@4",
          function (data, textStatus, jqxhr) {
            tippy(".tippy", {
              // Add the class tippy to your element
              theme: "light", // Dark or Light
              animation: "scale", // Options, shift-away, shift-toward, scale, persepctive
              duration: 250, // Duration of the Animation
              arrow: true, // Add arrow to the tooltip
              arrowType: "round", // Sharp, round or empty for none
              delay: [0, 50], // Trigger delay in & out
              maxWidth: 240, // Optional, max width settings
            });
          }
        );
      }
    );
  }

  getShops();
  LogoutNonUser();

  console.log("Checking organization name:", organizationName);
  if (DomainName === "sprytny01.webflow.io" || organizationName === "Góral") {
    console.log("Organizacja: " + organizationName);
    console.log("Documents available");
    getDocuments();
    $('a[data-w-tab="Documents"]').show();
  } else {
    $('a[data-w-tab="Documents"]').hide();
  }

  getUserRole()
    .then(() => {
      return Promise.all([
        getUsers(),
        getInvoices(),
        navigateToInvoiceStateInvoices(),
        getPriceLists(),
        getIntegrations(),
        getWholesalers(),
      ]);
    })
    .then(() => {
      LoadTippy();
    })
    .catch((error) => {
      console.error(
        "Error while fetching user role or subsequent data:",
        error
      );
      // Handle error if necessary
    });

  var formIdCreateSingleExclusive = "#wf-form-SingleExclusiveForm";
  var formIdEditSingleExclusive = "#wf-form-SingleExclusiveForm-Edit-2";
  var nowDateFull = new Date();
  nowDateFull.setUTCHours(0, 0, 0, 0);
  var nowDate = nowDateFull.toISOString().split(".")[0] + "Z";

  function initializeDatePicker(selector, defaultDate = 1) {
    $(selector).datepicker({
      dateFormat: "yy-mm-dd",
      altFormat: "yy-mm-dd",
      dayNames: [
        "Niedziela",
        "Poniedziałek",
        "Wtorek",
        "Środa",
        "Czwartek",
        "Piątek",
        "Sobota",
      ],
      dayNamesShort: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"],
      dayNamesMin: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"],
      firstDay: 1,
      monthNames: [
        "Styczeń",
        "Luty",
        "Marzec",
        "Kwiecień",
        "Maj",
        "Czerwiec",
        "Lipiec",
        "Sierpień",
        "Wrzesień",
        "Październik",
        "Listopad",
        "Grudzień",
      ],
      monthNamesShort: [
        "Sty",
        "Lut",
        "Mar",
        "Kwi",
        "Maj",
        "Cze",
        "Lip",
        "Sie",
        "Wrz",
        "Paź",
        "Lis",
        "Gru",
      ],
      defaultDate: defaultDate,
    });
  }

  function setupDatePickers() {
    initializeDatePicker("#startDate");
    initializeDatePicker("#endDate");
    initializeDatePicker("#startDate-Exclusive-Edit", new Date(Date.now()));
    initializeDatePicker("#endDate-Exclusive-Edit", new Date(Date.now()));
    initializeDatePicker("#startDate-Exclusive-2", new Date(Date.now()));
    initializeDatePicker("#endDate-Exclusive-2", new Date(Date.now()));
  }

  setupDatePickers();

  var initialrecords = null;

  var table = $("#table_id").DataTable({
    pagingType: "full_numbers",
    order: [],
    dom: '<"top">rt<"bottom"lip>',
    scrollY: "60vh",
    scrollCollapse: true,
    pageLength: 25,
    language: {
      emptyTable: "Brak danych do wyswietlenia",
      info: "Pokazuje _START_ - _END_ z _TOTAL_ rezultatow",
      infoEmpty: "Brak danych",
      infoFiltered: "(z _MAX_ rezultatow)",
      lengthMenu: "Pokaz _MENU_ rezulatow",
      search: "Szukaj:",
      zeroRecords: "Brak pasujacych rezultatow",
      paginate: {
        first: "<<",
        last: ">>",
        next: " >",
        previous: "< ",
      },
    },
    ajax: function (data, callback, settings) {
      var QStr =
        "?perPage=" +
        data.length +
        "&page=" +
        (data.start + data.length) / data.length;
      let searchBox = data.search.value.trim(); // This will remove whitespace from both ends

      if (/^\d+$/.test(searchBox)) {
        /// this need to be changed to gtin
        QStr = QStr + "&gtin=" + searchBox;
      } else if (searchBox) {
        QStr = QStr + "&name=like:" + searchBox;
      } else {
      }

      var whKeyIndi = $("#wholesalerPicker")
        .map(function () {
          return this.value;
        })
        .get();
      var whKeyIndiStr = whKeyIndi.toString();
      if (whKeyIndiStr != "") {
        QStr = QStr + "&wholesalerKey=" + whKeyIndiStr;
      }

      // This is usefull
      var nowTime = new Date(Date.now()).toISOString().split("T")[0];

      var startDatePicker = $("#startDate")
        .map(function () {
          return this.value;
        })
        .get();
      var startDatePickerStr = startDatePicker.toString();
      if (startDatePickerStr != "") {
        QStr = QStr + "&startDate=gte:" + startDatePickerStr + "T00:00:00Z";
      }

      var endDatePicker = $("#endDate")
        .map(function () {
          return this.value;
        })
        .get();
      var endDatePickerStr = endDatePicker.toString();
      if (endDatePickerStr != "") {
        QStr = QStr + "&endDate=lte:" + endDatePickerStr + "T00:00:00Z";
      }

      var whichColumns = "";
      var direction = "desc";

      if (data.order.length == 0) {
        whichColumns = 0;
      } else {
        whichColumns = data.order[0]["column"];
        direction = data.order[0]["dir"];
      }
      console.log(whichColumns);

      switch (whichColumns) {
        case 3:
          whichColumns = "gtin:";
          break;
        case 4:
          whichColumns = "name:";
          break;
        case 6:
          whichColumns = "wholesalerKey:";
          break;
        case 8:
          whichColumns = "startDate:";
          break;
        case 9:
          whichColumns = "endDate:";
          break;
        case 10:
          whichColumns = "modified.by:";
          break;
        case 11:
          whichColumns = "updated.at:";
          break;
        default:
          whichColumns = "null";
      }

      var sort = "&sort=" + whichColumns + direction;
      if (whichColumns != "null") {
        QStr = QStr + sort;
      }

      $.ajaxSetup({
        headers: {
          Authorization: orgToken,
          "Requested-By": "webflow-3-4",
        },
        beforeSend: function () {
          $("#waitingdots").show();
        },
        complete: function () {
          $("#waitingdots").hide();
        },
      });
      $.get(InvokeURL + "exclusive-products" + QStr, function (res) {
        if (initialrecords === null) {
          initialrecords = res.total;
        }

        callback({
          recordsTotal: res.total,
          recordsFiltered: res.total,
          data: res.items,
        });
        if (initialrecords === 0) {
          $("#emptystateexclusive").css("display", "flex");
          $("#fullstateexclusive").css("display", "none");
        } else {
          $("#emptystateexclusive").css("display", "none");
          $("#fullstateexclusive").css("display", "flex");
          setTimeout(function () {
            // Your code to adjust DataTable columns
            $.fn.dataTable
              .tables({ visible: true, api: true })
              .columns.adjust();
          }, 400);
        }
      });
    },
    processing: false,
    serverSide: true,
    search: {
      return: true,
    },
    columns: [
      {
        visible: false,
        orderable: false,
        data: "uuid",
      },
      {
        visible: false,
        orderable: false,
        data: "created.at",
      },
      {
        visible: false,
        orderable: false,
        data: "created.by",
      },
      {
        orderable: true,
        data: "gtin",
      },
      {
        orderable: true,
        data: "name",
      },
      {
        orderable: false,
        data: "countryDistributorName",
        defaultContent: "-",
      },
      {
        orderable: true,
        data: null,
        render: function (data) {
          if (
            data.wholesalerName !== null &&
            data.hasOwnProperty("wholesalerName") &&
            typeof data.wholesalerName !== "undefined"
          ) {
            return data.wholesalerName;
          } else {
            return "BLOKADA";
          }
        },
      },
      {
        visible: false,
        orderable: false,
        data: "wholesalerKey",
        render: function (data) {
          if (data !== null) {
            return data;
          }
          if (data === null) {
            return "BLOKADA";
          }
        },
      },
      {
        orderable: true,
        data: "startDate",
        render: function (data) {
          if (data !== null) {
            var startDate = new Date(data);
            return startDate.toLocaleDateString("pl-PL");
          }
          if (data === null) {
            return "";
          }
        },
      },
      {
        orderable: true,
        data: null,
        render: function (data) {
          if (
            data.endDate !== null &&
            typeof data.endDate !== "undefined" &&
            data.endDate !== "infinity"
          ) {
            myendDate = new Date(data.endDate).toLocaleDateString("pl-PL", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
            if (data.endDate >= nowDate) {
              return '<span class="positive">' + myendDate + "</span>";
            } else {
              return '<span class="noneexisting">' + myendDate + "</span>";
            }
          }

          if (data.endDate === "infinity") {
            return '<span class="positive">Nigdy</span>';
          }
        },
      },

      {
        orderable: true,
        data: "modified",
        render: function (data) {
          if (data !== null && data.hasOwnProperty("by") && data.by !== null) {
            return data.by;
          } else {
            return "-";
          }
        },
      },
      {
        orderable: true,
        data: "modified",
        render: function (data) {
          if (data !== null && data.hasOwnProperty("at") && data.at !== null) {
            var lastModificationDate = new Date(data.at);
            var formattedDate = lastModificationDate.toLocaleString("pl-PL", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });
            return formattedDate;
          }
          if (data === null) {
            return "";
          }
        },
      },
      {
        orderable: false,
        data: null,
        width: "48px",
        render: function (data) {
          if (nowDate >= data.endDate && nowDate >= data.startDate) {
            return "<img style='opacity:0.4;cursor: not-allowed !important' src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/640442ed27be9b5e30c7dc31_edit.svg' action='disabled' alt='disabled'></img><img style='cursor: pointer' src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg' action='delete' alt='delete'></img>";
          } else {
            return "<img style='cursor: pointer' src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/640442ed27be9b5e30c7dc31_edit.svg' action='edit' alt='edit'></img><img style='cursor: pointer' src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg' action='delete' alt='delete'></img>";
          }
        },
      },
    ],
    initComplete: function (settings, json) {
      var api = this.api();
      var textBox = $("#table_id_filter label input");
      $("#wholesalerPicker").on("change", function () {
        table.draw();
      });

      $("#startDate")
        .datepicker({
          onSelect: function (dateText) {
            WholesalerSelector;
            console.log(
              "Selected date: " +
                dateText +
                "; input's current value: " +
                this.value
            );
            $(this).change();
          },
        })
        .on("change", function () {
          console.log("Got change event from field");
          table.draw();
        });

      $("#endDate")
        .datepicker({
          onSelect: function (dateText) {
            console.log(
              "Selected date: " +
                dateText +
                "; input's current value: " +
                this.value
            );
            $(this).change();
          },
        })
        .on("change", function () {
          console.log("Got change event from field");
          table.draw();
        });

      $("#table_id").on("click", "img", function () {
        //Get the cell of the input
        var table = $("#table_id").DataTable();
        var data = table.row($(this).parents("tr")).data();
        var action = $(this).attr("action");

        if (action === "delete") {
          $.ajax({
            type: "DELETE",
            url: InvokeURL + "exclusive-products/" + data.uuid,
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
              "Requested-By": "webflow-3-4",
            },
            success: function (resultData) {
              table.row($(this).parents("tr")).remove().draw();
              displayMessage("Success", "Blokada została usunięta.");
            },
            error: function (jqXHR, exception) {
              console.log(jqXHR);
              console.log(jqXHR);
              console.log(exception);
              displayMessage(
                "Error",
                "Oops. Coś poszło nie tak, spróbuj ponownie."
              );
              return;
            },
          });
        }
        if (action === "edit") {
          $("#EditExclusivePopup").css("display", "flex");

          var offset = new Date().getTimezoneOffset();
          var localeTime = new Date(
            Date.parse(data.created.at) - offset * 60 * 1000
          ).toISOString();
          var creationDate = localeTime.split("T");
          var creationTime = creationDate[1].split("Z");
          CreatedTime = creationDate[0] + " " + creationTime[0].slice(0, -4);

          $("#GTINInputEdit")
            .prop("disabled", true)
            .css("opacity", "0.6")
            .val(data.gtin);
          $("#Creator")
            .prop("disabled", true)
            .css("opacity", "0.6")
            .val(data.created.by);
          $("#Created")
            .prop("disabled", true)
            .css("opacity", "0.6")
            .val(CreatedTime);

          $("#exclusiveProductId").val(data.uuid);
          $("#WholesalerSelector-Exclusive-Edit")
            .val(data.wholesalerKey)
            .change();

          if (nowDate > data.endDate && nowDate >= startDate) {
            $("#WholesalerSelector-Exclusive-Edit")
              .prop("disabled", true)
              .css("opacity", "0.6")
              .val(CreatedTime);
          }

          if (nowDate > data.endDate || data.endDate == "infinity") {
            if (data.endDate != "infinity") {
              $("#endDate-Exclusive-Edit").datepicker(
                "setDate",
                new Date(Date.parse(data.endDate))
              );
              $("#endDate-Exclusive-Edit").prop("disabled", true);
              $("#endDate-Exclusive-Edit").css("opacity", "0.6");
            } else {
              console.log("infinity");
              //$("#NeverSingleEdit").prop("checked", true);
            }
          }

          if (nowDate <= data.endDate) {
            $("#endDate-Exclusive-Edit").datepicker(
              "setDate",
              new Date(Date.parse(data.endDate))
            );
          } else {
          }

          if (nowDate >= data.startDate) {
            $("#startDate-Exclusive-Edit").css("opacity", "0.6");
            $("#startDate-Exclusive-Edit").datepicker(
              "setDate",
              new Date(Date.parse(data.startDate))
            );
            $("#startDate-Exclusive-Edit").prop("disabled", true);
          } else {
            $("#startDate-Exclusive-Edit").datepicker(
              "setDate",
              new Date(Date.now())
            );
          }
        }
      });

      $(".dataTables_filter input").on("focusout", function () {
        table.draw();
      });
      textBox.unbind();
      textBox.bind("keyup input", function (e) {
        if (e.keyCode == 13) {
          api.search(this.value).draw();
        }
      });
      $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
    },
  });

  makeWebflowFormAjaxSingle = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action = InvokeURL + "exclusive-products";
        var method = "POST";

        var wholesalerKeyPOST = $("#WholesalerSelector-Exclusive-2").val();

        if (wholesalerKeyPOST === "null") {
          wholesalerKeyPOST = null;
        }

        console.log(wholesalerKeyPOST);

        if ($("#NeverSingle").is(":checked")) {
          var postData = [
            {
              gtin: $("#GTINInput").val(),
              name: "name1",
              wholesalerKey: wholesalerKeyPOST,
              startDate: $("#startDate-Exclusive-2").val() + "T00:00:00.00Z",
              endDate: "infinity",
            },
          ];
        } else {
          var postData = [
            {
              gtin: $("#GTINInput").val(),
              name: "name1",
              wholesalerKey: wholesalerKeyPOST,
              startDate: $("#startDate-Exclusive-2").val() + "T00:00:00.00Z",
              endDate: $("#endDate-Exclusive-2").val() + "T00:00:00.00Z",
            },
          ];
        }

        console.log(postData);

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
            "Requested-By": "webflow-3-4",
          },
          data: JSON.stringify(postData),
          success: function (resultData) {
            console.log(resultData);
            form.show();
            displayMessage("Success", "Blokada została założona.");
            refreshTable();
            $("#GTINInput").val("");
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
            displayMessage(
              "Error",
              "Oops. Coś poszło nie tak, spróbuj ponownie."
            );
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
        event.preventDefault();

        var exclusiveProductId = $("#exclusiveProductId").val();
        var action = InvokeURL + "exclusive-products/" + exclusiveProductId;
        var method = "PATCH";

        var newValues = {
          startDate: $("#startDate-Exclusive-Edit").val() + "T00:00:00.00Z",
          endDate: $("#NeverSingleEdit").is(":checked")
            ? "infinity"
            : $("#endDate-Exclusive-Edit").val() + "T00:00:00.00Z",
          wholesalerKey: $("#WholesalerSelector-Exclusive-Edit").val(),
        };

        // Fetch current values
        $.ajax({
          type: "GET",
          url: action,
          headers: {
            Authorization: orgToken,
            Accept: "application/json",
          },
          success: function (currentValues) {
            var postData = [];
            var currentDate = new Date().toISOString();

            // Only allow changing startDate if the current date is before the startDate
            if (
              new Date(currentDate) < new Date(currentValues.startDate) &&
              newValues.startDate !== currentValues.startDate
            ) {
              postData.push({
                op: "replace",
                path: "/startDate",
                value: newValues.startDate,
              });
            }

            if (newValues.endDate !== currentValues.endDate) {
              postData.push({
                op: "replace",
                path: "/endDate",
                value: newValues.endDate,
              });
            }

            if (
              newValues.wholesalerKey !== currentValues.wholesalerKey &&
              newValues.wholesalerKey !== "null"
            ) {
              postData.push({
                op: "replace",
                path: "/wholesalerKey",
                value: newValues.wholesalerKey,
              });
            }

            if (postData.length === 0) {
              displayMessage("Info", "No changes detected.");
              return;
            }

            // Send PATCH request
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
              data: JSON.stringify(postData),
              success: function (resultData) {
                console.log(resultData);
                form.show();
                displayMessage("Success", "Blokada została zmieniona.");
                refreshTable();
              },
              error: function (jqXHR, exception) {
                console.log(jqXHR);
                var msg =
                  "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
                var elements =
                  document.getElementsByClassName("warningmessagetext");
                for (var i = 0; i < elements.length; i++) {
                  elements[i].textContent = msg;
                }
                form.show();
                displayMessage("Error", msg);
              },
            });
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            var msg =
              "Failed to fetch current product data.\n" +
              JSON.parse(jqXHR.responseText).message;
            displayMessage("Error", msg);
          },
        });

        return false;
      });
    });
  };

  function refreshTable() {
    $.ajaxSetup({
      headers: {
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },
      beforeSend: function () {
        $("#waitingdots").show();
      },
      complete: function () {
        $("#waitingdots").hide();
      },
    });

    $.get(InvokeURL + "exclusive-products", function (res) {
      var tabela = $("#table_id").DataTable();
      tabela.clear().rows.add(res.items).draw();
    });
  }

  makeWebflowFormAjaxSingleEdit($(formIdEditSingleExclusive));
  makeWebflowFormAjaxSingle($(formIdCreateSingleExclusive));

  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));
  makeWebflowFormAjaxPatchTenantBilling($(formIdEditBilling));
  makeWebflowFormAjax($(formId));
  makeWebflowFormAjaxDelete($(formIdDelete));
  makeWebflowFormAjaxInvite($(formIdInvite));
  makeWebflowFormAjaxCreate($(formIdCreate));
  makeWebflowFormAjaxNewWh($(formIdNewWh));

  $("table.dataTable").on("page.dt", function () {
    $(this).DataTable().draw(false);
  });

  $("#table_wholesalers_list_bonus").on(
    "focusout",
    "input[type='number']",
    function () {
      var table = $("#table_wholesalers_list_bonus").DataTable();
      let newValue = parseFloat($(this).val());
      var initialValue = parseFloat($(this).data("initialValue"));
      var form = $("#wf-form-WholesalerChangeStatusForm");
      var $input = $(this);

      if (newValue !== initialValue) {
        var row = table.row($input.parents("tr"));
        var data = row.data();
        var wholesalerKey = data.wholesalerKey;

        if (!wholesalerKey) {
          console.error("No wholesaler key found for the row.");
          resetInputValue($input, initialValue);
          return;
        }

        var patchData = [
          {
            op: "add",
            path: "/preferentialBonus",
            value: newValue,
          },
        ];

        $.ajax({
          url: InvokeURL + "wholesalers/" + wholesalerKey,
          type: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: orgToken,
            "Requested-By": "webflow-3-4",
          },
          data: JSON.stringify(patchData),
          success: function (response) {
            console.log("Data updated successfully", response);
            displayMessage("Success", "Bonus został zaktualizowany.");
            $input.attr("value", newValue).data("initialValue", newValue);
          },
          error: function (jqXHR, exception) {
            console.log("błąd");
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
              msg = "" + jqXHR.responseJSON.message;
            }

            if (typeof onErrorCallback === "function") {
              onErrorCallback();
            }

            form.show();
            displayMessage("Error", msg);
            resetInputValue($input, initialValue);
          },
        });
      }
    }
  );

  function resetInputValue($input, value) {
    $input.val(value).attr("value", value).data("initialValue", value);
  }

  $('div[role="tablist"], div[role="tab"], div[role="tabpanel"]').click(
    function () {
      setTimeout(function () {
        console.log("Adjusting");
        $.fn.dataTable
          .tables({
            visible: true,
            api: true,
          })
          .columns.adjust();
      }, 600);
    }
  );
});
