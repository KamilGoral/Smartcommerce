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
  var clientId = new URL(location.href).searchParams.get("clientId");
  var organizationName = new URL(document.location.href).searchParams.get(
    "name"
  );
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

  function updateStatus(changeOfStatus, wholesalerKey, onErrorCallback) {
    console.log("starting Updating function");
    var form = $("#wf-form-WholesalerChangeStatusForm ");
    var container = form.parent();
    var doneBlock = $(".w-form-done", container);
    var failBlock = $(".w-form-fail", container);

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
            doneBlock.hide();
            failBlock.show();
            console.log(e);
            return;
          }
        }
        // show success (done) block
        doneBlock.show();
        setTimeout(function () {
          doneBlock.hide();
        }, 2000);
        failBlock.hide();
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

        // Call the onErrorCallback if defined
        if (typeof onErrorCallback === "function") {
          onErrorCallback();
        }

        $(".warningmessagetext").text(msg);
        form.show();
        doneBlock.hide();
        failBlock.show();
        setTimeout(function () {
          failBlock.hide();
        }, 2000);
        return;
      },
    });
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

  function getUserRole() {
    var request = new XMLHttpRequest();
    let endpoint = new URL(InvokeURL + "users/" + userKey);
    request.open("GET", endpoint, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);

      if (request.status >= 200 && request.status < 400) {
        function setCookieAndSession(cName, cValue, expirationSec) {
          let date = new Date();
          date.setTime(date.getTime() + expirationSec * 1000);
          const expires = "expires=" + date.toUTCString();
          document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
        }
        setCookieAndSession("sprytnyUserRole", data.role, 72000);
      } else {
        console.log("error");
      }
    };

    // Send request
    request.send();
  }

  function getShops() {
    let url = new URL(InvokeURL + "shops?perPage=20");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(this.response);
        var toParse = data.items;
        var shopNumber = data.total;

        if (shopNumber > 0) {
          const deleteButton = document.getElementById(
            "deleteOrganizationButton"
          );
          const deleteOrganizationText = document.getElementById(
            "deleteOrganizationText"
          );

          deleteButton.disabled = true;
          deleteButton.style.opacity = "0.4";

          deleteButton.classList.add("tippy");

          deleteOrganizationText.textContent =
            "Nie możesz usunąć organizacji, w której są aktywne sklepy. Najpierw usuń sklepy, aby móc usunąć organizację.";
        }

        const shopContainer = document.getElementById("Shops-Container");

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

  function getUsers() {
    let url = new URL(InvokeURL + "users?perPage=30");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
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
                  return '<spann class="medium">Oczekuję...</spann>';
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
      },
      data: data,
      success: function (response) {
        console.log("Role updated successfully", response);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("Failed to update role", textStatus, errorThrown);
      },
    });
  });

  $("#table_users_list").on("click", ".details-control4", function () {
    // Retrieve the DataTable row as a jQuery object
    var row = $(this).closest("tr");

    // Retrieve the DataTable API object
    var dataTable = $("#table_users_list").DataTable();

    // Get the data for the row
    var rowData = dataTable.row(row).data();

    // Extract the user ID from the hidden column
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
      },
      success: function (response) {
        console.log("User deleted successfully", response);
        // Directly targeting the clicked icon's parent row for removal
        dataTable.row(row).remove().draw();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("Failed to delete user", textStatus, errorThrown);
      },
    });
  });

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

      // if (organizationName == "Famix") {
      //   const filteredItems = data.items.filter((item) => {
      //     return (
      //       organizationName === "Famix" &&
      //       (item.wholesalerKey === "famix-krakow" ||
      //         item.wholesalerKey === "central-warehouse")
      //     );
      //   });
      //   toParse = filteredItems;
      // }

      if (request.status >= 200 && request.status < 400) {
        var tableWh = $("#table_wholesalers_list").DataTable({
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

        $("#table_wholesalers_list").on(
          "change",
          "input.editor-active",
          function () {
            var checkbox = this; // Store reference to the checkbox
            var isChecked = this.checked; // Store the current state

            // Define what to do in case of error
            var onErrorCallback = function () {
              // Revert checkbox state
              $(checkbox).prop("checked", !isChecked);
            };

            if (isChecked) {
              console.log(checkbox.getAttribute("wholesalerkey"));
              console.log("Nieaktywny był");
              updateStatus(
                true,
                checkbox.getAttribute("wholesalerkey"),
                onErrorCallback
              );
            } else {
              console.log(checkbox.getAttribute("wholesalerkey"));
              console.log("Aktywny był");
              updateStatus(
                false,
                checkbox.getAttribute("wholesalerkey"),
                onErrorCallback
              );
            }
          }
        );
      }
      if (request.status == 401) {
        console.log("Unauthorized");
      }
    };
    request.send();
  }

  function GetTenantBilling() {
    userRole = getCookie("sprytnyUserRole");

    if (userRole !== "admin") {
      console.log("Action not permitted for non-admin users.");
      return;
    }

    function showDotForActiveTab() {
      setTimeout(function () {
        const isTab3Active = document.querySelector(
          "#w-tabs-0-data-w-tab-3.w--current"
        );
        const isTab1Active = document.querySelector(
          "#w-tabs-2-data-w-tab-1.w--current"
        );
        document.querySelector(".nb1").classList.toggle("hidden", isTab3Active);
        document
          .querySelector(".nb2")
          .classList.toggle("hidden", !isTab3Active || isTab1Active);
        document
          .querySelector(".nb3")
          .classList.toggle("hidden", !isTab1Active);
        document
          .querySelector("#fillUpOrganizationDetail")
          .classList.toggle("hidden", !isTab1Active);
      }, 150); // Delay the execution by 150 milliseconds
    }

    let url = new URL(
      InvokeURL +
        "tenants/" +
        document.querySelector("#organizationName").textContent +
        "/billing"
    );
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(this.response);
        const hasRequiredKeys =
          data.taxId !== null &&
          data.name !== null &&
          data.address && // Check if address object itself exists
          data.address.country !== null &&
          data.address.line1 !== null && // 'line2' is not required
          data.address.town !== null &&
          data.address.state !== null &&
          data.address.postcode !== null && // 'phones' is not required
          data.pricing && // Check if pricing object itself exists
          data.pricing.standard !== null &&
          data.pricing.premium !== null; // 'specialService' and 'trialEndDate' are not required

        console.log(hasRequiredKeys);

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
        $("#tenantNameEdit").val(data.name || "");
        $("#tenantTaxIdEdit").val(data.taxId || "");

        // Mapping Polish state names to <select> element values
        var stateMapping = {
          Dolnośląskie: "LowerSilesian",
          "Kujawsko-pomorskie": "Kuyavian-Pomeranian",
          Lubelskie: "Lublin",
          Lubuskie: "Lubusz",
          Łódzkie: "Łódź",
          Małopolskie: "Lesser Poland",
          Mazowieckie: "Masovian",
          Opolskie: "Opole",
          Podkarpackie: "Subcarpathian",
          Podlaskie: "Podlaskie",
          Pomorskie: "Pomeranian",
          Śląskie: "Silesian",
          Świętokrzyskie: "HolyCross",
          "Warmińsko-Mazurskie": "Warmian-Masurian",
          Wielkopolskie: "Greater Poland",
          Zachodniopomorskie: "West Pomeranian",
        };

        if (data.address && typeof data.address.state !== "undefined") {
          $("#tenantStateEdit").val(stateMapping[data.address.state] || "");
        } else {
          $("#tenantStateEdit").val("");
        }

        $("#tenantTownEdit").val((data.address && data.address.town) || "");
        $("#tenantPostcodeEdit").val(
          (data.address && data.address.postcode) || ""
        );
        $("#tenantAdressEdit").val((data.address && data.address.line1) || "");
        $("#tenantPhoneEdit").val((data.phones && data.phones[0].phone) || "");

        // Inform the user about the days left and the exact end date
        var trialEndDateText = "";
        const now = new Date();
        const trialEndDate = new Date(toParse.trialEndDate);
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
          trialEndDateText = `Twój bezpłatny okres próbny ma jeszcze 1 dzień i zakończy się ${trialEndDate.toLocaleDateString(
            "pl-PL"
          )}.`;
        } else if (daysLeft === 0) {
          trialEndDateText = `Twój bezpłatny okres próbny kończy się dzisiaj, ${trialEndDate.toLocaleDateString(
            "pl-PL"
          )}.`;
        } else if (daysLeft > 30) {
          trialEndDateText = `Twój bezpłatny okres próbny ma jeszcze 30 dni i zakończy się ${fakeTrialEnd.toLocaleDateString(
            "pl-PL"
          )}.`;
        } else {
          trialEndDateText = `Twój bezpłatny okres próbny ma jeszcze ${daysLeft} dni i zakończy się ${trialEndDate.toLocaleDateString(
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
          } else {
            // If specialService is null, hide #specialServiceBox
            document.getElementById("specialServiceBox").style.display = "none";
          }

          switch (dataType) {
            case "tenantTrialEndDate":
              element.textContent = trialEndDateText || "Aktywny";
              break;
            case "tenantName":
              element.textContent = organizationName || "N/A";
              break;
            case "phone":
              if (
                toParse.phones &&
                toParse.phones.length > 0 &&
                toParse.phones[0].phone
              ) {
                element.textContent = toParse.phones[0].phone;
              } else {
                element.textContent = "N/A";
              }
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
                    toParse.address.state,
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
            case "state":
              element.textContent =
                toParse.address && toParse.address.state
                  ? toParse.address.state
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

  async function getIntegrations() {
    let attempts = 0;
    let userRole = getCookie("sprytnyUserRole");

    while (!userRole && attempts < 3) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      userRole = getCookie("sprytnyUserRole");
      console.log(userRole);
      console.log(attempts);
      attempts++;
    }

    if (userRole !== "admin") {
      console.log("Action not permitted for non-admin users.");
      return;
    }

    try {
      GetTenantBilling();
      const url = new URL(InvokeURL + "integrations");
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: orgToken },
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
      updateIntegrationStatus($integrationStatus, "Oczekuję...", null);
    }

    const href = getIntegrationHref(integration.integrationKey);
    $row.attr("href", href);

    $("#Integrations-Container").append($row);
  }

  function updateIntegrationStatus($element, statusText, color) {
    if (statusText === "Succeeded") {
      statusText = "Aktywny";
      color = "green";
    } else if (statusText === "Oczekuję...") {
      statusText = "Oczekuję...";
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
      headers: { Authorization: orgToken },
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
            modalCreateShop.hide();
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

  var tablePriceLists = $("#table_pricelists_list").DataTable({
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

      var whichColumns = "";
      var direction = "desc";

      if (data.order.length == 0) {
        whichColumns = 2;
      } else {
        whichColumns = data.order[0]["column"];
        direction = data.order[0]["dir"];
      }

      switch (whichColumns) {
        case 2:
          whichColumns = "created.at:";
          break;
        case 3:
          whichColumns = "startDate:";
          break;
        case 4:
          whichColumns = "endDate:";
          break;
        default:
          whichColumns = "created.at:";
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
          "<div class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg' alt='offer'></img></div>",
      },
      {
        orderable: false,
        visible: false,
        data: "uuid",
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
              second: "2-digit",
              hour12: false,
            });
          }
          if (data === null) {
            return "";
          }
        },
      },
      {
        orderable: true,
        data: "startDate",
        render: function (data) {
          if (data !== null) {
            var utcDate = new Date(Date.parse(data));
            return utcDate.toLocaleDateString("pl-PL");
          }
          if (data === null) {
            return "";
          }
        },
      },
      {
        orderable: true,
        data: "endDate",
        render: function (data) {
          if (data !== null) {
            var utcDate = new Date(Date.parse(data));
            var nowDate = new Date();
            nowDate.setUTCHours(0, 0, 0, 0);

            if (utcDate >= nowDate) {
              return (
                '<span class="positive">' +
                utcDate.toLocaleDateString("pl-PL") +
                "</span>"
              );
            } else {
              return (
                '<span class="medium">' +
                utcDate.toLocaleDateString("pl-PL") +
                "</span>"
              );
            }
          }
          if (data === null) {
            return "";
          }
        },
      },
      {
        orderable: false,
        data: "created.by",
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
              second: "2-digit",
              hour12: false,
            });
          }
          if (data === null) {
            return "";
          }
        },
      },
      {
        orderable: false,
        data: "modified.by",
        render: function (data) {
          if (data !== null) {
            return data;
          }
          if (data === null) {
            return "-";
          }
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
  });

  function toggleEmptyState() {
    // Check if the table has any entries
    var hasEntries = tablePriceLists.data().any();
    // If the table is empty, show the custom empty state div
    // Otherwise, hide it
    if (!hasEntries) {
      $("#emptystatepricelists").show();
      $("#pricelistscontainer").hide();
    } else {
      $("#emptystatepricelists").hide();
      $("#pricelistscontainer").show();
    }
  }

  // Initial check after the table is initialized
  toggleEmptyState();

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
          },
          success: function () {
            console.log("Rekord został pomyślnie usunięty.");
            $("#waitingdots").show(1).delay(150).hide(1);
            table.row($(this).parents("tr")).remove().draw();
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
        var container = form.parent();
        var doneBlock = $(".w-form-done", container);
        var failBlock = $(".w-form-fail", container);
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
          },
          beforeSend: function () {
            $("#waitingdots").show();
          },
          complete: function () {
            $("#waitingdots").hide();
          },
          success: function (currentData) {
            const patchData = preparePatchData(currentData);

            $.ajax({
              type: "PATCH",
              url: url,
              data: JSON.stringify(patchData),
              contentType: "application/json",
              dataType: "json",
              headers: {
                Authorization: orgToken,
              },
              beforeSend: function () {
                $("#waitingdots").show();
              },
              complete: function () {
                setTimeout(function () {
                  $("#waitingdots").hide();
                }, 1000); // 1000 milliseconds = 1 second
              },
              success: function (resultData) {
                if (typeof successCallback === "function") {
                  successCallback(resultData);
                }
                // Hide editBillingModal and show form-done-edit for 2 seconds
                $("#form-done-edit").css("display", "flex");
                setTimeout(function () {
                  $("#editBillingModal").hide();
                  location.reload();
                }, 3000);
              },
              error: function () {
                if (typeof errorCallback === "function") {
                  errorCallback();
                }
                // Show form-done-fail-edit on error
                $("#form-done-fail-edit").css("display", "flex");
              },
            });
          },
          error: function () {
            if (typeof errorCallback === "function") {
              errorCallback();
            }
            // Show form-done-fail-edit on error
            $("#form-done-fail-edit").css("display", "flex");
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
    if (newName !== currentData.name) {
      patchData.push({ op: "replace", path: "/name", value: newName });
    }

    // Tax ID
    var newTaxId = $("#tenantTaxIdEdit").val();
    if (newTaxId !== currentData.taxId) {
      patchData.push({ op: "replace", path: "/taxId", value: newTaxId });
    }

    // Telephone number

    var newTelephone = $("#tenantPhoneEdit").val();
    if (newTelephone === "") {
      newTelephone = null;
    }
    if (newTelephone !== currentData.phones) {
      patchData.push({
        op: "replace",
        path: "/phones",
        value: [{ phone: newTelephone, description: "Główny" }],
      });
    }

    // Address
    var newAddress = {
      country: "Polska", // Assuming the country is always Poland
      line1: $("#tenantAdressEdit").val(),
      town: $("#tenantTownEdit").val(),
      state: $("#tenantStateEdit option:selected").text(),
      postcode: $("#tenantPostcodeEdit").val(),
    };

    // Compare each property to see if any part of the address has changed
    var addressChanged = Object.keys(newAddress).some(
      (key) => newAddress[key] !== (currentData.address[key] || "")
    );
    if (addressChanged) {
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

  LogoutNonUser();
  getUserRole();
  getShops();
  getUsers();
  getIntegrations();
  getWholesalers();
  LoadTippy();

  makeWebflowFormAjaxPatchTenantBilling($(formIdEditBilling));
  makeWebflowFormAjax($(formId));
  makeWebflowFormAjaxDelete($(formIdDelete));
  makeWebflowFormAjaxInvite($(formIdInvite));
  makeWebflowFormAjaxCreate($(formIdCreate));
  makeWebflowFormAjaxNewWh($(formIdNewWh));

  $("table.dataTable").on("page.dt", function () {
    $(this).DataTable().draw(false);
  });

  $('div[role="tablist"]').click(function () {
    setTimeout(function () {
      console.log("Adjusting");
      $.fn.dataTable
        .tables({
          visible: true,
          api: true,
        })
        .columns.adjust();
    }, 300);
  });
});
