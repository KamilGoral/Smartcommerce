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
    if (parts.length === 2)
      return decodeURIComponent(parts.pop().split(";").shift());
  }

  function setCookie(cName, cValue, expirationSec) {
    let date = new Date();
    date.setTime(date.getTime() + expirationSec * 1000);
    const expires = "expires=" + date.toUTCString();
    const encodedValue = encodeURIComponent(cValue);
    document.cookie = `${cName}=${encodedValue}; ${expires}; path=/`;
  }

  function parseAttributes(cookieValue) {
    const attributes = cookieValue.split(",");
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

  postEditUserProfile = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var failBlock2 = $("#form-done-fail-edit-profile");
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
                $("#form-done-edit-profile").hide();
                failBlock2.show();
                console.log(e);
                return;
              }
            }
            form.show();
            setCookie(
              "SpytnyUserAttributes",
              "username:" +
              firstNameUser +
              ",familyname:" +
              lastNameUser +
              ",email:" +
              emailadressUser,
              72000
            );
            $("#form-done-edit-profile").show().delay(2000).fadeOut("slow");
            failBlock2.hide();
          },
          error: function (e) {
            if (typeof errorCallback === "function") {
              errorCallback(e);
            }
            form.show();
            failBlock2.show();
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
                $("#form-done-edit-password").hide();
                $("#form-done-fail-edit").show();
                console.log(e);
                return;
              }
            }
            form.show();
            $("#form-done-edit-password").show().delay(2000).fadeOut("slow");
            $("#form-done-fail-edit").hide();
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
              msg = "" + jqXHR.responseText;
            }
            const message = document.getElementById(
              "WarningMessageChangePassword"
            );
            message.textContent = msg;
            form.show();
            $("#form-done-edit-password").hide();
            $("#form-done-fail-edit").show();
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

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

  var shopKey = new URL(location.href).searchParams.get("shopKey");
  var orgToken = getCookie("sprytnyToken");
  var InvokeURL = getCookie("sprytnyInvokeURL");
  var DomainName = getCookie("sprytnyDomainName");
  var ClientID = getCookieNameByValue(orgToken);
  var OrganizationName = getCookie("OrganizationName");
  const OrganizationBread0 = document.getElementById("OrganizationBread0");
  // const UploadDocumentButton = document.getElementById("UploadDocumentButton");
  const cancelButton = document.getElementById("cancelButton");
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
  $("#Wholesaler-profile-Selector-box").hide();

  userRole = getCookie("sprytnyUserRole");

  if (userRole !== "admin") {
    console.log("Actions not permitted for non-admin users.");
    $("#deleteShopContainer").hide();
    $("#refreshOfferButton").hide();
    $("#createPricelistButton").hide();
  }

  function getShop() {
    var request = new XMLHttpRequest();
    let endpoint = new URL(InvokeURL + "shops/" + shopKey);
    request.open("GET", endpoint.toString(), true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);

      if (request.status >= 200 && request.status < 400) {
        sessionStorage.setItem("shopKey", data.shopKey);
        sessionStorage.setItem("shopName", data.name);
        var ShopKeyBreadName = sessionStorage.getItem("shopName");
        const ShopNameBread = document.getElementById("ShopNameBread");
        ShopNameBread.textContent = data.name;
        ShopNameBread.setAttribute(
          "href",
          "https://" + DomainName + "/app/shops/shop?shopKey=" + data.shopKey
        );

        if (data.merchantConsoleShopId === null) {
          data.merchantConsoleShopId = "";
        }

        // Update shopName, shopKey, and other information
        document.querySelector('[shopdata="shopName"]').textContent =
          data.name +
          " - " +
          data.shopKey +
          " | " +
          data.merchantConsoleShopId || "N/A";

        $("#shopNameEdit").val(data.name || "");
        $("#shopCodeEdit").val(data.shopKey || "");
        $("#merchantConsoleShopId")
          .val(data.merchantConsoleShopId || "")
          .prop("disabled", true);

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
          $("#shopStateEdit").val(stateMapping[data.address.state] || "");
        } else {
          $("#shopStateEdit").val("");
        }

        $("#shopTownEdit").val((data.address && data.address.town) || "");
        $("#shopPostcodeEdit").val(
          (data.address && data.address.postcode) || ""
        );
        $("#shopAdressEdit").val((data.address && data.address.line1) || "");
        $("#shopPhoneEdit").val(
          Array.isArray(data.phones) && data.phones.length > 0
            ? data.phones[0].phone
            : ""
        );

        if (data.emails && data.emails.length > 0) {
          data.emails.forEach((email, index) => {
            if (index < 3) {
              $(`#shopEmailEdit${index + 1}`).val(email.email || "");
              $(`#shopEmailEditDescription${index + 1}`).val(
                email.description || ""
              );
            }
          });
        }

        // Address information
        if (data.address) {
          const { country, line1, town, state, postcode } = data.address;
          const addressDescription = `${country}, ${line1}, ${town}, ${state}, ${postcode}`;
          document.querySelector('[shopdata="address"]').textContent =
            addressDescription || "N/A";
        }
      } else {
        console.log("error");
      }
    };

    // Send request
    request.send();
  }

  function getOrders() {
    var tableOrders = $("#table_orders").DataTable({
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
          InvokeURL + "shops/" + shopKey + "/orders",
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
      search: {
        return: true,
      },
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
            "<div class='details-container'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg' alt='offer'></img></div>",
        },
        {
          orderable: false,
          visible: false,
          data: "orderId",
          render: function (data) {
            return data ? data : "";
          },
        },
        {
          orderable: false,
          data: "createdBy",
          render: function (data) {
            return data ? data : "";
          },
        },
        {
          orderable: false,
          data: "name",
          render: function (data) {
            return data ? data : "";
          },
        },
        {
          orderable: true,
          data: "createDate",
          render: function (data) {
            if (data) {
              var utcDate = new Date(Date.parse(data));
              var formattedDate = utcDate.toLocaleString("pl-PL", {
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
            return "";
          },
        },
        {
          orderable: false,
          data: "orderId",
          width: "72px",
          render: function (data, type, row) {
            if (type === "display" && data) {
              return `<div class="action-container"><a href="https://${DomainName}/app/orders/order?orderId=${data}&shopKey=${shopKey}" class="buttonoutline editme w-button">Przejdź</a></div>`;
            }
            return "";
          },
          defaultContent: "",
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
      initComplete: function (settings, json) {
        var api = this.api();
        var textBox = $("#table_offers_filter label input");
        textBox.unbind();
        textBox.bind("keyup input", function (e) {
          if (
            (e.keyCode == 8 && !textBox.val()) ||
            (e.keyCode == 46 && !textBox.val())
          ) {
          } else if (e.keyCode == 13 || !textBox.val()) {
            api.search(this.value).draw();
          }
        });
      },
      drawCallback: function (settings) {
        toggleEmptyState();
      },
    });

    function toggleEmptyState() {
      // Check if the table has any entries
      var hasEntries = tableOrders.data().any();
      // If the table is empty, show the custom empty state div
      // Otherwise, hide it
      if (!hasEntries) {
        $("#emptystateorders").show();
        $("#orderscontainer").hide();
      } else {
        $("#emptystateorders").hide();
        $("#orderscontainer").show();
      }
    }
  }

  $("#table_orders").on("click", ".details-control4 img", function () {
    var row = $(this).closest("tr");
    var table = $("#table_orders").DataTable();
    var orderData = table.row(row).data();
    var orderId = orderData.orderId;

    if (!orderId) {
      console.error("Order ID not found");
      return;
    }

    // Show waiting dots before the request
    $("#waitingdots").show();

    // Proceed with the DELETE request
    $.ajax({
      url: InvokeURL + "shops/" + shopKey + "/orders/" + orderId,
      type: "DELETE",
      contentType: "application/json",
      headers: {
        Authorization: orgToken,
      },
      success: function () {
        console.log("Order deleted successfully");
        // Introduce a 100ms delay before redrawing the table
        setTimeout(function () {
          // Redraw the table without removing the row, server-side will reflect the deletion
          table.ajax.reload(null, false); // false to keep the current paging
          $("#waitingdots").hide(); // Hide waiting dots after completion
        }, 100); // Ensure at least 100ms delay for backend processing
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("Failed to delete order", textStatus, errorThrown);
        $("#waitingdots").hide(); // Hide waiting dots even if error occurs
      },
    });
  });

  function format(d) {
    var offers = d.offers; // Get the array of offers from the object d
    var toDisplayHtml = "";

    function getStatusHtml(item) {
      switch (item.status) {
        case "ready":
          return '<span class="positive">Gotowa</span>';
        case "error":
          return '<span class="negative">Problem</span>';
        case "in progress":
          return '<span class="medium">W trakcie</span>';
        case "incomplete":
          return '<span class="medium">Niekompletna</span>';
        case "batching":
        case "forced":
          return '<span class="medium">W kolejce</span>';
        default:
          return '-';
      }
    }

    // Get the column widths from the main table
    const columnWidths = [];
    $("#table_offers th").each(function () {
      columnWidths.push($(this).width() + "px");
    });

    // Table headers for the offers table
    toDisplayHtml += '<table style="table-layout: fixed; width: 100%;"><tr>';
    toDisplayHtml += '<th style="width:' + columnWidths[0] + ';"></th>';
    toDisplayHtml += '<th style="width:' + columnWidths[1] + ';">Data utworzenia</th>';
    toDisplayHtml += '<th style="width:' + columnWidths[2] + ';">Status</th>';
    toDisplayHtml += '<th style="width:' + columnWidths[3] + ';">Akcje</th>';
    toDisplayHtml += '</tr>';

    // Iterate through the array of offers
    for (var i = 0; i < offers.length; i++) {
      var formattedDate = '-';
      if (offers[i].createDate) {
        var utcDate = new Date(offers[i].createDate.replace(" ", "T") + "Z");
        formattedDate = utcDate.toLocaleString("pl-PL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
      } else {
        // If createDate is null, use current date and time
        var currentDate = new Date();
        formattedDate = currentDate.toLocaleString("pl-PL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
      }

      toDisplayHtml +=
        '<tr>' +
        '<td class="details-container2" style="width:' + columnWidths[0] + '; justify-content: center;"><img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg" alt="offer"></td>' +
        '<td style="width:' + columnWidths[1] + ';">' + formattedDate + '</td>' +
        '<td style="width:' + columnWidths[2] + ';">' + getStatusHtml(offers[i]) + '</td>' +
        '<td style="width:' + columnWidths[3] + ';"><div class="action-container"';

      if (offers[i].status == "error") {
        toDisplayHtml +=
          ' style="opacity: 0.5;"><a href="#" status="' + offers[i].status + '" offerId="' + offers[i].offerId + '" class="buttonoutline editme w-button">Brak</a></div></td></tr>';
      } else {
        toDisplayHtml +=
          '><a href="#" status="' + offers[i].status + '" offerId="' + offers[i].offerId + '" class="buttonoutline editme w-button">Przejdź</a></div></td></tr>';
      }
    }

    // Close the offers table
    toDisplayHtml += '<tr><td colspan="4"></td></tr></table>';

    return toDisplayHtml;
  }


  var refreshInterval;
  var counterInterval;
  var counter = 60; // 60 seconds for each refresh

  function refreshTable() {
    var hasInProgressOrBatchingOrForced = $("#table_offers")
      .DataTable()
      .data()
      .toArray()
      .some((row) =>
        row.offers.some(
          (offer) =>
            offer.status === "in progress" ||
            offer.status === "batching" ||
            offer.status === "forced"
        )
      );
    console.log(hasInProgressOrBatchingOrForced);

    if (hasInProgressOrBatchingOrForced) {
      console.log("Calling getOffers");
      getOffers(); // Call getOffers instead of reloading the table
      counter = 60; // Reset counter
    } else {
      console.log("Everything is working");
      clearInterval(refreshInterval); // Clear the interval if no 'in progress' or 'batching' status
      clearInterval(counterInterval); // Clear the counter interval as well
      $("#refreshCounter").hide(); // Ukryj licznik
      $("#refreshCounter").text(""); // Clear the counter display
      $("#emptystateoffers").hide();
      $("#offerscontainer").show();
    }
  }

  function getOffers() {
    // Clear existing intervals
    if (refreshInterval) clearInterval(refreshInterval);
    if (counterInterval) clearInterval(counterInterval);

    // Check if the DataTable instance exists and destroy it
    if ($.fn.DataTable.isDataTable("#table_offers")) {
      $("#table_offers").DataTable().clear().destroy();
    }

    // Initialize DataTable
    var tableOffers = $("#table_offers").DataTable({
      pagingType: "full_numbers",
      order: [],
      dom: '<"top">rt<"bottom"lip>',
      scrollY: "60vh",
      scrollCollapse: true,
      pageLength: 25,
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

        var whichColumns = "";
        var direction = "desc";

        if (data.order.length == 0) {
          whichColumns = 0;
        } else {
          whichColumns = data.order[0]["column"];
          direction = data.order[0]["dir"];
        }

        switch (whichColumns) {
          case 1:
            whichColumns = "createDate:";
            break;
          case 2:
            whichColumns = "status:";
            break;
          default:
            whichColumns = "createDate:";
        }

        var sort = "" + whichColumns + direction;

        $.get(
          InvokeURL + "shops/" + shopKey + "/offers",
          {
            sort: sort,
            perPage: data.length,
            page: (data.start + data.length) / data.length,
          },
          function (res) {
            // Tworzenie słownika do grupowania ofert według daty
            const groupedData = {};

            res.items.forEach((item) => {
              if (item.createDate) {
                const createDate = item.createDate.substring(0, 10); // Wyciągnij datę i godzinę w formacie "YYYY-MM-DDTHH:mm"
                const timePart = item.createDate.split("T")[1].slice(0, -1); // Dzieli datę, a następnie usuwa ostatni znak "Z"

                if (!groupedData[createDate]) {
                  groupedData[createDate] = [];
                }

                groupedData[createDate].push({
                  offerId: item.offerId,
                  status: item.status,
                  createDate: createDate + " " + timePart, // Dodaj czas (minuty, sekundy i strefę czasową)
                });
              } else {
                const todayDate = new Date().toISOString().split('T')[0]; // Get today's date in "YYYY-MM-DD" format
                var currentDateTime = new Date().toISOString();

                if (!groupedData[todayDate]) {
                  groupedData[todayDate] = [];
                }
                groupedData[todayDate].push({
                  offerId: item.offerId,
                  status: item.status,
                  createDate: currentDateTime, // Default value when date is missing
                });
              }
            });

            // Sortowanie ofert w każdym dniu od najświeższej do najstarszej
            for (const date in groupedData) {
              groupedData[date].sort((a, b) =>
                a.createDate > b.createDate ? -1 : 1
              );
            }

            // Tworzenie końcowej struktury
            const finalStructure = {
              items: Object.keys(groupedData).map((date) => ({
                createDate: date,
                offers: groupedData[date],
              })),
            };

            // Sprawdzenie obecności ofert "in progress", "batching" lub "forced"
            var hasInProgressOrBatchingOrForced = finalStructure.items.some(
              (row) =>
                row.offers.some(
                  (offer) =>
                    offer.status === "in progress" ||
                    offer.status === "batching" ||
                    offer.status === "forced"
                )
            );

            if (hasInProgressOrBatchingOrForced) {
              $("#refreshCounter").show(); // Pokaż licznik
            } else {
              $("#refreshCounter").hide(); // Ukryj licznik
            }

            // map your server's response to the DataTables format and pass it to
            // DataTables' callback
            callback({
              recordsTotal: res.total,
              recordsFiltered: res.total,
              data: finalStructure.items,
            });
          }
        );
      },
      processing: true,
      search: {
        return: true,
      },
      serverSide: true,
      search: {
        return: true,
      },
      columns: [
        {
          data: null,
          width: "36px",
          defaultContent: "",
          createdCell: function (cell, rowData) {
            if (rowData.offers && rowData.offers.length > 1) {
              $(cell).addClass("details-control");
            } else {
              // Tworzenie elementu <img>
              const imgElement = $("<img>", {
                src: "https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg",
                alt: "offer",
              });
              $(cell)
                .addClass("details-container2")
                .css("justify-content", "center")
                .append(imgElement);
            }
          },
          orderable: false,
        },
        {
          orderable: false,
          visible: false,
          data: null,
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
            if (data === null) {
              var currentDate = new Date();
              formattedDate = currentDate.toLocaleString("pl-PL", {
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
            if (data !== "-" && data !== null) {
              const creationDate = new Date(data);

              const startDate = creationDate.toLocaleDateString("pl-PL", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              });


              return startDate;
            }
            return "-";
          },
        },
        {
          orderable: false,
          data: null,
          render: function (data) {
            if (data !== null) {
              if (data.offers[0].status == "ready") {
                return '<span class="positive">Gotowa</span>';
              }
              if (data.offers[0].status == "error") {
                return '<span class="negative">Problem</span>';
              }
              if (data.offers[0].status == "in progress") {
                return '<span class="medium">W trakcie</span>';
              }
              if (data.offers[0].status == "incomplete") {
                return '<span class="medium">Niekompletna</span>';
              }
              if (data.offers[0].status == "batching") {
                return '<span class="medium">W kolejce</span>';
              }
              if (data.offers[0].status == "forced") {
                return '<span class="medium">W kolejce</span>';
              }
            }
            return "-";
          },
        },
        {
          orderable: false,
          data: null,
          width: "72px",
          render: function (data, type, row) {
            if (type === "display") {
              if (row.offers[0].status == "error") {
                return (
                  '<div class="action-container" style="opacity: 0.5;"><a href="#" status="' +
                  row.offers[0]["status"] +
                  '" offerId="' +
                  row.offers[0]["offerId"] +
                  '" class="buttonoutline editme w-button">Brak</a></div>'
                );
              }
              return (
                '<div class="action-container"><a href="#" status="' +
                row.offers[0]["status"] +
                '" offerId="' +
                row.offers[0]["offerId"] +
                '" class="buttonoutline editme w-button">Przejdź</a></div>'
              );
            }
            return "-";
          },
        },
      ],
      initComplete: function (settings, json) {
        var api = this.api();
        var textBox = $("#table_offers_filter label input");
        textBox.unbind();
        textBox.bind("keyup input", function (e) {
          if (
            (e.keyCode == 8 && !textBox.val()) ||
            (e.keyCode == 46 && !textBox.val())
          ) {
          } else if (e.keyCode == 13 || !textBox.val()) {
            api.search(this.value).draw();
          }
          toggleEmptyState();
        });
      },
      drawCallback: function (settings) {
        toggleEmptyState();
      },
    });

    function toggleEmptyState() {
      // Check if the table has any entries
      var hasEntries = tableOffers.data().any();
      // If the table is empty, show the custom empty state div
      // Otherwise, hide it
      if (!hasEntries) {
        $("#emptystateoffers").show();
        $("#offerscontainer").hide();
      } else {
        $("#emptystateoffers").hide();
        $("#offerscontainer").show();
      }
    }

    // Set up refresh interval
    refreshInterval = setInterval(function () {
      if (counter <= 0) {
        refreshTable();
      }
    }, 1000); // Check every second

    // Decrement counter every second
    counterInterval = setInterval(function () {
      if (counter > 0) {
        counter--;

        // Zmiana tekstu w zależności od wartości licznika
        var counterText = "sekund"; // Domyślnie dla 5 i więcej
        if (counter === 1) {
          counterText = "sekundę"; // 1 sekunda
        } else if (counter > 1 && counter <= 4) {
          counterText = "sekundy"; // 2-4 sekundy
        }

        $("#refreshCounter").text(
          "Następne odświeżenie tabeli ofert za " + counter + " " + counterText
        );
      }
    }, 1000);

    // Reset counter
    counter = 60;

    $("#table_offers").on("click", "a", function () {
      var clikedEl = this;
      var MessageContainer = document.getElementById("WarningMessageContainer");
      var MessageText = document.getElementById("WarningMessageMain");

      if (clikedEl.getAttribute("status") == "in progress") {
        MessageText.textContent =
          "Oferta w trakcie tworzenia. Proszę poczekaj...";
        MessageContainer.style.display = "flex";
        $("#WarningMessageContainer").fadeOut(3000);
        MessageContainer.style.display = "none";
      }
      if (clikedEl.getAttribute("status") == "error") {
        MessageText.textContent =
          "Oops! Coś poszło nie tak. Spróbuj ponownie...";
        MessageContainer.style.display = "flex";
        $("#WarningMessageContainer").fadeOut(3000);
        MessageContainer.style.display = "none";
      }
      if (clikedEl.getAttribute("status") == "ready") {
        window.location.replace(
          "https://" +
          DomainName +
          "/app/offers/offer?shopKey=" +
          shopKey +
          "&offerId=" +
          clikedEl.getAttribute("offerId")
        );
      }
      if (clikedEl.getAttribute("status") == "incomplete") {
        $.ajax({
          url:
            InvokeURL +
            "shops/" +
            shopKey +
            "/offers/" +
            clikedEl.getAttribute("offerId") +
            "/status",
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", orgToken);
          },
          success: function (data) {
            MessageText.textContent =
              "Uwaga! Oferta nie jest kompletna. " + data.messages;
            MessageContainer.style.display = "flex";
            $("#WarningMessageContainer").fadeOut(3000, function () {
              MessageContainer.style.display = "none";
              document.location =
                "https://" +
                DomainName +
                "/app/offers/offer?shopKey=" +
                shopKey +
                "&offerId=" +
                clikedEl.getAttribute("offerId");
            });
          },
        });
      }
    });
  }

  var tablePricelists = $("#table_pricelists_list").DataTable({
    pagingType: "full_numbers",
    order: [],
    dom: '<"top">rt<"bottom"lip>',
    scrollY: "60vh",
    scrollCollapse: true,
    pageLength: 10,
    language: {
      emptyTable: "Brak danych",
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
        InvokeURL + "price-lists?shopKey=" + shopKey,
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
            var formattedDate = utcDate.toLocaleString("pl-PL", {
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
        orderable: true,
        data: "startDate",
        render: function (data) {
          if (data !== null) {
            var utcDate = new Date(Date.parse(data));
            var formattedDate = utcDate.toLocaleString("pl-PL", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
            return formattedDate;
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
            var formattedDate = utcDate.toLocaleString("pl-PL", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });

            var nowDate = new Date();
            nowDate.setHours(0, 0, 0, 0);

            if (utcDate >= nowDate) {
              return '<span class="positive">' + formattedDate + "</span>";
            } else {
              return '<span class="medium">' + formattedDate + "</span>";
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
            var formattedDate = utcDate.toLocaleString("pl-PL", {
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
        data: "modified.by",
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
        data: null,
        width: "72px",
        defaultContent:
          '<div class="action-container"><a href="#" class="buttonoutline editme w-button">Przejdź</a></div>',
      },
    ],
    drawCallback: function (settings) {
      toggleEmptyState();
    },
  });

  function toggleEmptyState() {
    // Check if the table has any entries
    var hasEntries = tablePricelists.data().any();
    // If the table is empty, show the custom empty state div
    // Otherwise, hide it
    if (!hasEntries) {
      $("#emptystatepricelistshop").show();
      $("#pricelistshopcontainer").hide();
    } else {
      $("#emptystatepricelistshop").hide();
      $("#pricelistshopcontainer").show();
    }
  }

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

  function getWholesalers() {
    var tablevendors = $("#table_wholesalers").DataTable({
      pagingType: "full_numbers",
      order: [],
      dom: '<"top">rt<"bottom"lip>',
      scrollY: "60vh",
      scrollCollapse: true,
      pageLength: 50,
      language: {
        emptyTable: "Brak danych",
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
            whichColumns = "wholesalerKey:";
            break;
          case 5:
            whichColumns = "connections.ftp.enabled:";
            break;
          case 7:
            whichColumns = "connections.onlineOffer.enabled:";
            break;
          case 4:
            whichColumns = "connections.retroactive.enabled:";
            break;
          default:
            whichColumns = "wholesalerKey:";
        }

        var sort = "" + whichColumns + direction;

        $.get(
          InvokeURL + "shops/" + shopKey + "/wholesalers",
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
            "<div class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61ae41350933c525ec8ea03a_office-building.svg' alt='offer'></img></div>",
        },
        {
          orderable: true,
          data: "wholesalerKey",
          visible: false,
          render: function (data) {
            if (data !== null) {
              return data;
            } else {
              return "";
            }
          },
        },
        {
          orderable: true,
          data: "name",
          render: function (data) {
            if (data !== null) {
              return data;
            } else {
              return "";
            }
          },
        },
        {
          orderable: false,
          data: "logisticMinimum",
          width: "108px",
          render: function (data) {
            if (data !== null) {
              return data;
            } else {
              return "-";
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
          data: "connections.ftp",
          width: "72px",
          render: function (data) {
            if (data !== null) {
              if (data.enabled) {
                return '<spann class="positive">Tak</spann>';
              } else {
                return '<spann class="medium">Dodaj</spann>';
              }
            } else {
              return '<spann class="negative">Nie</spann>';
            }
          },
        },
        {
          orderable: false,
          data: "connections.wms",
          visible: false,
          width: "72px",
          render: function (data) {
            if (data !== null) {
              if (data.enabled) {
                return '<spann class="positive">Tak</spann>';
              } else {
                return '<spann class="noneexisting">Brak</spann>';
              }
            } else {
              return '<spann class="noneexisting">Brak</spann>';
            }
          },
        },
        {
          orderable: true,
          data: "connections.onlineOffer",
          width: "72px",
          render: function (data) {
            if (data !== null) {
              if (data.enabled == true && data.active == true) {
                return '<spann class="positive">Tak</spann>';
              } else if (data.enabled == false && data.active == false) {
                return '<spann class="medium">Dodaj</spann>';
              } else if (data.enabled == true && data.active == false) {
                return '<spann class="improve">Przywróć</spann>';
              } else if (data.enabled == false && data.active == true) {
                return '<spann class="medium">Dodaj</spann>';
              }
            } else {
              return '<spann class="noneexisting">Brak</spann>';
            }
          },
        },
        {
          orderable: false,
          data: "wholesalerKey",
          width: "72px",
          render: function (data, type, row, meta) {
            // Using render function to dynamically generate the anchor tag
            return (
              '<div class="action-container"><a href="https://' +
              DomainName +
              "/app/wholesalers/wholesaler?shopKey=" +
              shopKey +
              "&wholesalerKey=" +
              data +
              '" class="buttonoutline editme w-button">Przejdź</a></div>'
            );
          },
        },
      ],
      drawCallback: function (settings) {
        toggleEmptyState();
      },
    });
    function toggleEmptyState() {
      // Check if the table has any entries
      var hasEntries = tablevendors.data().any();
      // If the table is empty, show the custom empty state div
      // Otherwise, hide it
      if (!hasEntries) {
        $("#emptystatevendors").show();
        $("#vendorscontainer").hide();
      } else {
        $("#emptystatevendors").hide();
        $("#vendorscontainer").show();
      }
    }
  }

  makeWebflowFormAjaxDelete = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#ShopDeleteSuccess", container);
        var failBlock = $("#ShopDeleteFail", container);
        var action = InvokeURL + "shops/" + shopKey;
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
            }, 500);
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

  makeWebflowFormAjaxPatchShopEdit = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        event.preventDefault();

        const url = InvokeURL + "shops/" + shopKey;

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
                  $("#editShopModal").hide();
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
    var newName = $("#shopNameEdit").val();
    if (newName !== currentData.name) {
      patchData.push({ op: "replace", path: "/name", value: newName });
    }

    // shopCodeEdit
    var shopCodeEdit = $("#shopCodeEdit").val();
    if (shopCodeEdit !== currentData.shopKey) {
      patchData.push({ op: "replace", path: "/key", value: shopCodeEdit });
    }

    // Telephone number

    var newTelephone = $("#shopPhoneEdit").val();
    if (newTelephone === "") {
      newTelephone = null;
    }
    if (newTelephone !== null && newTelephone !== currentData.phones) {
      patchData.push({
        op: "replace",
        path: "/phones",
        value: [{ phone: newTelephone, description: "Główny" }],
      });
    }

    // Address
    var newAddress = {
      country: "Polska", // Assuming the country is always Poland
      line1: $("#shopAdressEdit").val(),
      town: $("#shopTownEdit").val(),
      state: $("#shopStateEdit option:selected").text(),
      postcode: $("#shopPostcodeEdit").val(),
    };

    // Check if the current data has an address to compare against
    var currentAddress = currentData.address || {};
    var addressChanged = Object.keys(newAddress).some(
      (key) => newAddress[key] !== (currentAddress[key] || "")
    );

    if (addressChanged) {
      patchData.push({ op: "replace", path: "/address", value: newAddress });
    }

    // Emails
    var newEmails = [];
    for (let i = 1; i <= 3; i++) {
      let email = $(`#shopEmailEdit${i}`).val();
      let description = $(`#shopEmailEditDescription${i}`).val();
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

  makeWebflowFormAjaxRefreshOffer = function (
    forms,
    successCallback,
    errorCallback
  ) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var container = form.parent();
        var doneBlock = $("#wf-form-RefreshOfferFormdone", container);
        var failBlock = $("#wf-form-RefreshOfferFormfail", container);
        var action = InvokeURL + "shops/" + shopKey + "/offers";
        var method = "POST";
        var data = "";

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
                return;
              }
            }
            form.show();
            doneBlock.show();
            doneBlock.fadeOut(3000);
            failBlock.hide();
            window.setTimeout(function () {
              location.reload();
            }, 3500);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
            var msg = "";

            var MessageText = document.getElementById("WarningMessageMain");
            if (jqXHR.status === 0) {
              msg = "Not connect.\n Verify Network.";
            } else if (jqXHR.status === 403) {
              msg = "Oops! Coś poszło nie tak. Proszę spróbuj ponownie.";
            } else if (jqXHR.status === 429) {
              msg =
                "Oferta dla tego sklepu została utworzona mniej niż 5 minut temu lub jest w trakcie tworzenia.";
            } else if (jqXHR.status === 500) {
              msg = "Internal Server Error [500].";
            } else if (exception === "parsererror") {
              msg = "Requested JSON parse failed.";
            } else if (exception === "timeout") {
              msg = "Time out error.";
            } else if (exception === "abort") {
              msg = "Ajax request aborted.";
            } else {
              var msg =
                "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
            }
            var elements =
              document.getElementsByClassName("warningmessagetext");
            for (var i = 0; i < elements.length; i++) {
              elements[i].textContent = msg;
            }
            $("#WarningMessageContainer").fadeOut(3000);
            form.show();
            doneBlock.hide();
            failBlock.show();
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  function FileUpload(ignoreGTINs) {
    var xhr = new XMLHttpRequest();
    const allowedExtensions = ["txt", "edi", "csv", "kuc", "paczka"];
    var myUploadedFiles = document.getElementById("orderfile").files;

    if (myUploadedFiles.length > 0) {
      var file = myUploadedFiles[0];
      var fileName = file.name;
      // Improved file extension extraction
      var fileExtension = fileName.includes(".")
        ? fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase()
        : "";
      var fileSize = file.size;

      // Check for file size exceeding 10 MB
      if (fileSize > 10 * 1024 * 1024) {
        $("#wrongfilemodal").css("display", "flex");
        $("#wrongfilemessage").text(
          "Jeden z Twoich plików zamówienie jest zbyt duży. Plik jest większy niż 10 MB"
        );
        $("#orderuploadmodal").css("display", "none");
        document.getElementById("orderfile").value = "";
        return; // Exit the function
      }

      // Allow files without extensions and check allowed extensions ( This is not work)
      // if (
      //   (fileName.includes(".") &&
      //     !allowedExtensions.includes(fileExtension)) ||
      //   (!fileName.includes(".") && fileExtension === "")
      // ) {
      //   $("#wrongfilemodal").css("display", "flex");
      //   $("#wrongfilemessage").text(
      //     "Jeden z Twoich plików zamówienie nie jest w wymaganym formacie: *.txt, *.edi, *.csv, *.kuc, *.paczka"
      //   );
      //   $("#orderuploadmodal").css("display", "none");
      //   document.getElementById("orderfile").value = "";
      //   return; // Exit the function
      // }
    }
    $("#waitingdots").show();
    var formData = new FormData();
    for (var i = 0; i < myUploadedFiles.length; i++) {
      formData.append("file", myUploadedFiles[i]);
    }
    formData.append("name", $("#OrderName").val());
    console.log(formData);
    var action = InvokeURL + "shops/" + shopKey + "/orders";
    // Add custom header if ignoreGTINs is true
    if (ignoreGTINs) {
      action += "?ignoreEmptyGtin=true";
    }
    xhr.open("POST", action);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Authorization", orgToken);

    xhr.onreadystatechange = function () {
      $("#waitingdots").hide();
      if (xhr.status === 201) {
        var response = JSON.parse(xhr.responseText);
        var action =
          InvokeURL + "shops/" + shopKey + "/orders/" + response.orderId;
        var method = "PATCH";
        var data = [
          {
            op: "add",
            path: "/name",
            value: $("#OrderName").val(),
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
            document.getElementById("wf-form-doneCreate-Order").style.display =
              "block";
            window.setTimeout(function () {
              window.location.replace(
                "https://" +
                DomainName +
                "/app/orders/order?orderId=" +
                response.orderId +
                "&shopKey=" +
                shopKey
              );
            }, 100);
          },
          error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
          },
        });
      } else {
        jsonResponse = JSON.parse(xhr.responseText);
        console.log(xhr);
        var msg = "";
        if (xhr.status === 0) {
          msg = "Not connect.\n Verify Network.";
        } else if (xhr.status === 400) {
          msg = jsonResponse.message;

          // Extract the file name from the message
          const fileNameMatch = msg.match(/Incorrect file \[(.*?)\]/);
          const fileName = fileNameMatch ? fileNameMatch[1] : "Nieznany plik";

          // Use regular expression to find the product list string after "Missing GTIN code for products"
          const match = msg.match(/Missing GTIN code for products \[(.*?)\]/);
          if (match && match[1]) {
            // Extract the product list string
            const productListString = match[1];

            // Split the string into an array of product-price pairs
            const products = productListString.split(", ");

            function createTable(products, fileName) {
              const table = document.createElement("table");
              table.style.border = "1px solid black";
              table.style.borderCollapse = "collapse";

              // Add additional header row for file name
              const fileHeaderRow = document.createElement("tr");
              const fileHeaderCell = document.createElement("th");
              fileHeaderCell.setAttribute("colspan", "2");
              fileHeaderCell.textContent = `${fileName}`;
              fileHeaderRow.appendChild(fileHeaderCell);
              table.appendChild(fileHeaderRow);

              // Add table header for products
              const headerRow = document.createElement("tr");
              const header = document.createElement("th");
              header.textContent = "Produkt";
              header.style.border = "1px solid black";
              headerRow.appendChild(header);
              table.appendChild(headerRow);

              // Add rows for each product
              products.forEach((product) => {
                const row = document.createElement("tr");
                const cell = document.createElement("td");
                cell.textContent = product;
                cell.style.border = "1px solid black";
                row.appendChild(cell);
                table.appendChild(row);
              });

              return table;
            }

            // Clear existing content and append the new table to the element with ID 'messageText'
            $("#messageText").empty().append(createTable(products, fileName));
            $("#orderuploadmodal").hide();
            $("#wronggtinsmodal").css("display", "flex");
            // Do not clear the file input in case of 400 error
          } else {
            // Handle cases where the product list is not found
            console.error("Product list not found in the message.");
          }
        } else if (xhr.status === 403) {
          msg = "Oops! Coś poszło nie tak. Proszę spróbuj ponownie.";
        } else if (xhr.status === 500) {
          msg = "Internal Server Error [500].";
          $("#orderfile").val("");
        } else {
          msg = jsonResponse.message;
          $("#orderfile").val("");
        }
        $(".warningmessagetext").text(msg);
        $("#wf-form-failCreate-Order").show();
        setTimeout(function () {
          $("#wf-form-failCreate-Order").fadeOut(2000);
        }, 10000);
      }
      // Existing logic for handling the response
    };
    xhr.send(formData);
  }

  // UploadDocumentButton.addEventListener("click", (event) => {
  //   FileUpload(false);
  // });

  cancelButton.addEventListener("click", () => {
    const modal = document.getElementById("wronggtinsmodal");
    if (modal) {
      modal.style.display = "none";
    }
  });

  // Call with custom header
  $("#UploadButton").on("click", function () {
    FileUpload(true);
  });

  makeWebflowFormAjaxDelete($("#wf-form-DeleteShop"));
  makeWebflowFormAjaxPatchShopEdit($("#wf-form-EditShop"));
  makeWebflowFormAjaxRefreshOffer($("#wf-form-RefreshOfferForm"));
  postChangePassword($("#wf-form-Form-Change-Password"));
  postEditUserProfile($("#wf-form-editProfile"));

  getWholesalers();
  getShop();
  getOrders();
  getOffers();

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

  $("#table_offers").on("click", "td.details-control", function () {
    //Get the righ table
    var table = $("#table_offers").DataTable();
    var tr = $(this).closest("tr");
    var row = table.row(tr);
    if (row.child.isShown()) {
      row.child.hide();
      tr.removeClass("shown");
    } else {
      row.child(format(row.data())).show();
      tr.addClass("shown");
    }
  });
});
