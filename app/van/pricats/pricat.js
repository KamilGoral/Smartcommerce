console.log("Script Loaded v4");

// Helper Functions
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2
    ? decodeURIComponent(parts.pop().split(";").shift())
    : null;
}

function setCookie(cName, cValue, expirationSec) {
  const date = new Date();
  date.setTime(date.getTime() + expirationSec * 1000);
  document.cookie = `${cName}=${encodeURIComponent(
    cValue
  )}; expires=${date.toUTCString()}; path=/`;
}

function parseAttributes(cookieValue) {
  const attributes = cookieValue
    ? decodeURIComponent(cookieValue).split("|")
    : [];
  return attributes.reduce((result, attr) => {
    const [key, value] = attr.split(":");
    result[key.trim()] = value ? value.trim() : "";
    return result;
  }, {});
}

// Display Message Function
const displayMessage = (type, message) => {
  $("#Message-Container").show().delay(5000).fadeOut("slow");
  if (message) {
    $(`#${type}-Message-Text`).text(message);
  }
  $(`#${type}-Message`).show().delay(5000).fadeOut("slow");
};

// DOM Manipulation and Initialization
function updateUserUI(attributes) {
  document.getElementById("firstNameUser").value = attributes["username"] || "";
  document.getElementById("lastNameUser").value =
    attributes["familyname"] || "";
  document.getElementById("useremail").textContent = attributes["email"] || "";
  document.getElementById("emailadressUser").value = attributes["email"] || "";
}

function initializeProductTable(priceListId) {
  if ($.fn.DataTable.isDataTable("#pricelistproducts")) {
    $("#pricelistproducts").DataTable().destroy();
  }

  $("#pricelistproducts").DataTable({
    serverSide: true,
    processing: true,
    pagingType: "full_numbers",
    order: [[0, "asc"]],
    dom: '<"top"fB>rt<"bottom"lip>',
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
      paginate: { first: "<<", last: ">>", next: ">", previous: "<" },
      aria: {
        sortAscending: ": Sortowanie rosnące",
        sortDescending: ": Sortowanie malejące",
      },
    },
    ajax: {
      url: `${InvokeURL}van/pricats/${priceListId}/products`,
      type: "GET",
      headers: {
        Authorization: orgToken,
        "Requested-By": "webflow-3-4",
      },
      data: function (d) {
        return {
          perPage: d.length,
          page: d.start / d.length + 1,
          field: d.columns[d.order[0].column].data,
          dir: d.order[0].dir,
        };
      },
      dataSrc: function (json) {
        console.log("Server response:", json);
        return json && json.items ? json.items : [];
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("Error fetching product data:", textStatus, errorThrown);
      },
    },
    columns: [
      { data: "gtin", title: "GTIN" },
      { data: "name", title: "Name", defaultContent: "-" },
      {
        data: "countryDistributorName",
        title: "Distributor",
        defaultContent: "-",
        orderable: false,
      },
      {
        title: "Price",
        defaultContent: "-",
        render: function (data, type, row) {
          return row.asks && row.asks[0] && row.asks[0].netPrice
            ? row.asks[0].netPrice
            : "-";
        },
      },
      {
        data: "promotion",
        title: "Promotion",
        defaultContent: "-",
        render: function (data) {
          return data ? `${data.type} (threshold: ${data.threshold})` : "-";
        },
      },
    ],
  });
}

// AJAX/Server Interaction Functions
function loadPriceListData() {
  const priceListId = new URL(location.href).searchParams.get("uuid");
  initializeProductTable(priceListId);
}

function postEditUserProfile(forms, successCallback, errorCallback) {
  forms.each(function () {
    var form = $(this);
    form.on("submit", function (event) {
      const firstNameUser = $("#firstNameUser").val();
      const lastNameUser = $("#lastNameUser").val();
      const emailadressUser = $("#emailadressUser").val();

      const datatosend = {
        AccessToken: accessToken,
        UserAttributes: [
          { Name: "name", Value: firstNameUser },
          { Name: "family_name", Value: lastNameUser },
        ],
      };

      $.ajax({
        type: "POST",
        url: "https://cognito-idp.us-east-1.amazonaws.com/",
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "x-amz-target":
            "AWSCognitoIdentityProviderService.UpdateUserAttributes",
          Authorization: smartToken,
          "Requested-By": "webflow-3-4",
        },
        data: JSON.stringify(datatosend),
        dataType: "json",
        success: function (resultData) {
          if (typeof successCallback === "function") {
            const result = successCallback(resultData);
            if (!result) {
              displayMessage(
                "Error",
                "Oops. Coś poszło nie tak, spróbuj ponownie."
              );
              console.log(e);
              return;
            }
          }
          displayMessage("Success", "Twoje dane zostały zmienione");
          setCookie(
            "SpytnyUserAttributes",
            `username:${firstNameUser}|familyname:${lastNameUser}|email:${emailadressUser}`,
            720000
          );
        },
        error: function (e) {
          if (typeof errorCallback === "function") errorCallback(e);
          displayMessage(
            "Error",
            "Oops. Coś poszło nie tak, spróbuj ponownie."
          );
          console.log(e);
        },
      });
      event.preventDefault();
    });
  });
}

function postChangePassword(forms, successCallback, errorCallback) {
  forms.each(function () {
    var form = $(this);
    form.on("submit", function (event) {
      const data = {
        "Current-Password": $("#currentPassword").val(),
        "New-Password": $("#newPassword").val(),
        AccessToken: accessToken,
        "User-Email": $("#useremail").text(),
      };

      $.ajax({
        type: "POST",
        url: "https://hook.eu1.make.com/2laahxeoqfuo7nmf2gh1yyuatq92jiai",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(data),
        success: function (resultData) {
          if (typeof successCallback === "function") {
            const result = successCallback(resultData);
            if (!result) {
              displayMessage(
                "Error",
                "Oops. Coś poszło nie tak, spróbuj ponownie."
              );
              console.log(e);
              return;
            }
          }
          displayMessage("Success", "Twoje hasło zostało zmienione.");
        },
        error: function (jqXHR, exception) {
          let msg = "";
          if (jqXHR.status === 0) msg = "Not connect.\n Verify Network.";
          else if (jqXHR.status == 403)
            msg = "Użytkownik nie ma uprawnień do tworzenia organizacji.";
          else if (jqXHR.status == 400)
            msg = "Twoje dotychczasowe hasło jest inne. Spróbuj ponownie.";
          else if (jqXHR.status == 500) msg = "Internal Server Error [500].";
          else if (exception === "parsererror")
            msg = "Requested JSON parse failed.";
          else if (exception === "timeout") msg = "Time out error.";
          else if (exception === "abort") msg = "Ajax request aborted.";
          else msg = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Błąd.";

          displayMessage("Error", msg);
        },
      });
      event.preventDefault();
    });
  });
}

// Event Binding Functions
function makeWebflowFormAjaxEditPriceList(
  forms,
  successCallback,
  errorCallback
) {
  forms.each(function () {
    var form = $(this);
    form.on("submit", function (event) {
      const data = [
        {
          op: "replace",
          path: "/startDate",
          value: $("#startDate").val() + "T00:00:01.00Z",
        },
        {
          op: "replace",
          path: "/endDate",
          value: $("#endDate").val() + "T23:59:59.00Z",
        },
      ];

      $.ajax({
        type: "PATCH",
        url: `${InvokeURL}van/pricats/${priceListId}`,
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(data),
        headers: {
          Authorization: orgToken,
          "Requested-By": "webflow-3-4",
        },
        success: function (resultData) {
          if (typeof successCallback === "function") {
            const result = successCallback(resultData);
            if (!result) {
              displayMessage(
                "Error",
                "Oops. Coś poszło nie tak, spróbuj ponownie."
              );
              return;
            }
          }
          displayMessage("Success", "Cennik został zmieniony.");
          setTimeout(() => window.location.reload(), 1000);
        },
        error: function (e) {
          displayMessage(
            "Error",
            "Oops. Coś poszło nie tak, spróbuj ponownie."
          );
          console.log(e);
        },
      });
      event.preventDefault();
    });
  });
}

// Main Function to be executed once DOM is ready
docReady(function () {
  const attributes = parseAttributes(getCookie("SpytnyUserAttributes"));
  updateUserUI(attributes);
  loadPriceListData();
  makeWebflowFormAjaxEditPriceList($("#wf-form-UpdatePriceList"));
  makeWebflowFormAjaxDeletePriceList($("#wf-form-DeletePriceList"));
  postEditUserProfile($("#wf-form-editProfile"));
  postChangePassword($("#wf-form-Form-Change-Password"));
  console.log("All setup complete and table initialized.");
});
