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

  var orgToken = getCookie("sprytnyToken");
  var DomainName = getCookie("sprytnyDomainName");
  var ClientID = sessionStorage.getItem("OrganizationclientId");
  var InvokeURL = getCookie("sprytnyInvokeURL");

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

  const ExclusiveWizardBread = document.getElementById("ExclusiveResults");
  ExclusiveWizardBread.setAttribute("href", "" + window.location.href);
  var formIdCreateSingleExclusive = "#wf-form-SingleExclusiveForm";
  var formIdEditSingleExclusive = "#wf-form-SingleExclusiveForm-Edit-2";

  $("#startDate").datepicker({
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
    dayNamesShort: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
    dayNamesMin: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
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
    defaultDate: 1,
  });

  $("#endDate").datepicker({
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
    dayNamesShort: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
    dayNamesMin: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
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
    defaultDate: 1,
    minDate: new Date(),
  });

  $("#startDate-Exclusive-Edit")
    .datepicker({
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
      dayNamesShort: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
      dayNamesMin: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
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
      defaultDate: 1,
      minDate: new Date(),
    })
    .datepicker("setDate", new Date(Date.now()));

  $("#endDate-Exclusive-Edit").datepicker({
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
    dayNamesShort: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
    dayNamesMin: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
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
    defaultDate: 1,
    minDate: new Date(),
  });

  $("#startDate-Exclusive-2")
    .datepicker({
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
      dayNamesShort: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
      dayNamesMin: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
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
      defaultDate: 1,
      minDate: new Date(),
    })
    .datepicker("setDate", new Date(Date.now()));

  $("#endDate-Exclusive-2")
    .datepicker({
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
      dayNamesShort: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
      dayNamesMin: ["Nd ", "Pn", "Wt ", "Śr ", "Cz", "Pt ", "Sb"],
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
      defaultDate: 1,
      minDate: new Date(),
    })
    .datepicker("setDate", new Date(Date.now()));

  var table = $("#table_id").DataTable({
    pagingType: "full_numbers",
    order: [],
    dom: '<"top"fB>rt<"bottom"lip>',
    buttons: [
      {
        extend: "copyHtml5",
        text: '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6234df44ecd49d3c56c47ea6_copy.svg" alt="copy">',
        titleAttr: "Copy",
      },
      {
        extend: "excelHtml5",
        text: '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6234df3f287c53243b955790_spreadsheet.svg" alt="spreadsheet">',
        titleAttr: "Excel",
      },
      {
        extend: "pdfHtml5",
        text: '<img src="https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61fd38da3517f633d69e2d58_pdf-FILE.svg" alt="pdf">',
        titleAttr: "PDF",
      },
    ],
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
          whichColumns = "modified.at:";
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
        },
        beforeSend: function () {
          $("#waitingdots").show();
        },
        complete: function () {
          $("#waitingdots").hide();
        },
      });
      $.get(InvokeURL + "exclusive-products" + QStr, function (res) {
        callback({
          recordsTotal: res.total,
          recordsFiltered: res.total,
          data: res.items,
        });
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
            var endDate = new Date(data.endDate);
            var nowDate = new Date();
            nowDate.setUTCHours(0, 0, 0, 0);

            if (endDate >= nowDate) {
              return (
                '<span class="positive">' +
                endDate.toLocaleDateString("pl-PL", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }) +
                "</span>"
              );
            } else {
              return (
                '<span class="noneexisting">' +
                endDate.toLocaleDateString("pl-PL", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }) +
                "</span>"
              );
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
          if (
            data.endDate !== null &&
            typeof data.endDate !== "undefined" &&
            data.endDate !== "infinity"
          )
            var endDate = new Date(data.endDate);
          var nowDate = new Date();
          nowDate.setUTCHours(0, 0, 0, 0);

          if (endDate >= nowDate || endDate == "infinity") {
            return "<img style='cursor: pointer' src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/640442ed27be9b5e30c7dc31_edit.svg' action='edit' alt='edit'></img><img style='cursor: pointer' src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg' action='delete' alt='delete'></img>";
          } else {
            return "<img style='opacity:0.4;cursor: not-allowed !important' src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/640442ed27be9b5e30c7dc31_edit.svg' action='disabled' alt='disabled'></img><img style='opacity:0.4;cursor: not-allowed !important' src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6404b6547ad4e00f24ccb7f6_trash.svg' action='disabled' alt='disabled'></img>";
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
            },
            success: function (resultData) {
              console.log(resultData);
              table.row($(this).parents("tr")).remove().draw();
              $("#deleteInline-Success").show();
              $("#deleteInline-Success").fadeOut(4000);
            },
            error: function (jqXHR, exception) {
              console.log(jqXHR);
              console.log(jqXHR);
              console.log(exception);
              $("#deleteInline-Fail").show();
              $("#deleteInline-Fail").fadeOut(4000);
              return;
            },
          });
        }
        if (action === "edit") {
          $("#EditExclusivePopup").css("display", "flex");
          $("#GTINInputEdit").prop("disabled", true);
          $("#GTINInputEdit").val(data.gtin);
          $("#Creator").prop("disabled", true);
          $("#Creator").val(data.created.by);
          $("#Created").prop("disabled", true);
          var offset = new Date().getTimezoneOffset();
          var localeTime = new Date(
            Date.parse(data.created.at) - offset * 60 * 1000
          ).toISOString();
          var creationDate = localeTime.split("T");
          var creationTime = creationDate[1].split("Z");
          CreatedTime = creationDate[0] + " " + creationTime[0].slice(0, -4);
          $("#Created").val(CreatedTime);
          $("#exclusiveProductId").val(data.uuid);

          $("#WholesalerSelector-Exclusive-Edit")
            .val(data.wholesalerKey)
            .change();
          $("#startDate-Exclusive-Edit").datepicker(
            "setDate",
            new Date(Date.now())
          );

          if (data.hasOwnProperty("endDate")) {
            $("#endDate-Exclusive-Edit").datepicker(
              "setDate",
              new Date(Date.parse(data.endDate))
            );
          } else {
            $("#NeverSingleEdit").prop("checked", true);
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

  function getWholesalersSh() {
    let url = new URL(InvokeURL + "wholesalers" + "?enabled=true&perPage=1000");
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function () {
      var data = JSON.parse(this.response);
      var toParse = data.items;
      if (request.status >= 200 && request.status < 400) {
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

        const wholesalerContainer3 = document.getElementById(
          "WholesalerSelector-Exclusive-2"
        );
        var opt = document.createElement("option");
        opt.value = null;
        opt.innerHTML = "BLOKADA";
        wholesalerContainer3.appendChild(opt);
        toParse.forEach((wholesaler) => {
          if (wholesaler.enabled) {
            var opt = document.createElement("option");
            opt.value = wholesaler.wholesalerKey;
            opt.innerHTML = wholesaler.name;
            wholesalerContainer3.appendChild(opt);
          }
        });
        if (request.status == 401) {
          console.log("Unauthorized");
        }
      }
    };
    request.send();
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

  makeWebflowFormAjaxSingle = function (forms, successCallback, errorCallback) {
    forms.each(function () {
      var form = $(this);
      form.on("submit", function (event) {
        var action = InvokeURL + "exclusive-products";
        var method = "POST";

        if ($("#NeverSingle").is(":checked")) {
          var postData = [
            {
              gtin: $("#GTINInput").val(),
              name: "name1",
              wholesalerKey: $("#WholesalerSelector-Exclusive-2").val(),
              startDate: $("#startDate-Exclusive-2").val() + "T00:00:01.00Z",
              endDate: "infinity",
            },
          ];
        } else {
          var postData = [
            {
              gtin: $("#GTINInput").val(),
              name: "name1",
              wholesalerKey: $("#WholesalerSelector-Exclusive-2").val(),
              startDate: $("#startDate-Exclusive-2").val() + "T00:00:01.00Z",
              endDate: $("#endDate-Exclusive-2").val() + "T00:00:01.00Z",
            },
          ];
        }

        if ($("#WholesalerSelector-Exclusive-2").val() === "null") {
          delete postData[0].wholesalerKey;
          console.log("delete wholesalerKey");
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
          },
          data: JSON.stringify(postData),
          success: function (resultData) {
            console.log(resultData);
            form.show();
            $("#Create-Pricelist-Success").show();
            refreshTable();
            $("#Create-Pricelist-Success").fadeOut(4000);
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
            $("#SingleExclusiveForm-Fail2").show();
            $("#SingleExclusiveForm-Fail2").fadeOut(7000);
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
        var action =
          InvokeURL + "exclusive-products/" + $("#exclusiveProductId").val();
        var method = "PATCH";

        if ($("#NeverSingleEdit").is(":checked")) {
          var postData = [
            {
              op: "replace",
              path: "/startDate",
              value: $("#startDate-Exclusive-Edit").val() + "T00:00:01.00Z",
            },
            {
              op: "replace",
              path: "/endDate",
              value: "infinity",
            },
            {
              op: "replace",
              path: "/wholesalerKey",
              value: $("#WholesalerSelector-Exclusive-Edit").val(),
            },
          ];
        } else {
          var postData = [
            {
              op: "replace",
              path: "/startDate",
              value: $("#startDate-Exclusive-Edit").val() + "T00:00:01.00Z",
            },
            {
              op: "replace",
              path: "/endDate",
              value: $("#endDate-Exclusive-Edit").val() + "T00:00:01.00Z",
            },
            {
              op: "replace",
              path: "/wholesalerKey",
              value: $("#WholesalerSelector-Exclusive-Edit").val(),
            },
          ];
        }

        console.log(postData);

        if ($("#WholesalerSelector-Exclusive-Edit").val() === "null") {
          delete postData[0].wholesalerKey;
          console.log("delete wholesalerKey");
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
          data: JSON.stringify(postData),
          success: function (resultData) {
            console.log(resultData);
            form.show();
            $("#Edit-Exclusive-Success").show();
            refreshTable();
            $("#Edit-Exclusive-Success").fadeOut(4000);
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
            $("#Edit-Exclusive-Fail").show();
            $("#Edit-Exclusive-Fail").fadeOut(7000);
            return;
          },
        });
        event.preventDefault();
        return false;
      });
    });
  };

  function refreshTable() {
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

    $.get(InvokeURL + "exclusive-products", function (res) {
      var tabela = $("#table_id").DataTable();
      tabela.clear().rows.add(res.items).draw();
    });
  }

  makeWebflowFormAjaxSingleEdit($(formIdEditSingleExclusive));
  makeWebflowFormAjaxSingle($(formIdCreateSingleExclusive));
  getWholesalersSh();
  LoadTippy();
  $(document).ready(function ($) {
    $("tableSelector").DataTable({
      dom: '<"pull-left"f><"pull-right"l>tip',
    });
    $(".dataTables_filter input").attr("maxLength", 60);
    setTimeout(function () {
      // Your code to adjust DataTable columns
      $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
      console.log("Adjusting");
    }, 2000);
    setTimeout(function () {
      // Your code to adjust DataTable columns
      $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
      console.log("Adjusting");
    }, 4000);
  });
});
