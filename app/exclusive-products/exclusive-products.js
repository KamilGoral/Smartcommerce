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
          let searchBox = data.search.value;
          if (/^\d+$/.test(searchBox)) {
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
    
          var whichColumns = "";
          var direction = "desc";
    
          if (data.order.length == 0) {
            whichColumns = 0;
          } else {
            whichColumns = data.order[0]["column"];
            direction = data.order[0]["dir"];
          }
          console.log(data);
    
          switch (whichColumns) {
            case 2:
              whichColumns = "name:";
              break;
            case 4:
              whichColumns = "inStock:";
              break;
            case 5:
              whichColumns = "marketPremium:";
              break;
            case 6:
              whichColumns = "standardPremium:";
              break;
            case 7:
              whichColumns = "standardPrice:";
              break;
            case 11:
              whichColumns = "rotationIndicator:";
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
          $.get(
            InvokeURL + "exclusive-products" + QStr,
            function (res) {
              callback({
                recordsTotal: res.total,
                recordsFiltered: res.total,
                data: res.items,
              });
            }
          );
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
            orderable: true,
            data: "gtin",
          },
          {
            orderable: true,
            data: "name",
          },
          {
            orderable: true,
            data: "wholesalerName",
          },
          {
            visible: false,
            orderable: false,
            data: "wholesalerKey",
          },
          {
            orderable: true,
            data: "startDate",
          },
          {
            orderable: true,
            data: "endDate",
          },
          {
            orderable: true,
            data: "lastModified",
            render: function (data) {
              if (
                data !== null &&
                data.hasOwnProperty("date") &&
                data.date !== null
              ) {               
                  return '<p class="neutral">' + data.date + "</p>";
              } else {
                return "-";
              }
            },
          },
          {
            orderable: true,
            data: "lastModified",
            render: function (data) {
              if (
                data !== null &&
                data.hasOwnProperty("username") &&
                data.username !== null
              ) {               
                  return '<p class="neutral">' + data.username + "</p>";
              } else {
                return "-";
              }
            },
          },
          {
            orderable: true,
            data: null,
            defaultContent:
          "<img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/6240120504eebc8de2698a1f_panel.svg' alt='details'></img>",
          },
          
        ],
        initComplete: function (settings, json) {
          var api = this.api();
          var textBox = $("#table_id_filter label input");
          $(".filterinput").on("change", function () {
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
                console.log(Object.keys(toParse).length);
                const wholesalerContainer =
                    document.getElementById("wholesalerPicker");
                toParse.forEach((wholesaler) => {
                    if (wholesaler.enabled) {
                        var opt = document.createElement("option");
                        opt.value = wholesaler.wholesalerKey;
                        opt.innerHTML = wholesaler.name;
                        wholesalerContainer.appendChild(opt);
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

                if ($('#NeverSingle').is(":checked")) {

                    var postData =
                        [{
                            "gtin": $("#GTINInput").val(),
                            "name": "name1",
                            "wholesalerKey": $("#WholesalerSelector-Exclusive-2").val(),
                            "startDate": $("#startDate-Exclusive-2").val() + "T00:00:01.00Z",
                            "neverExpires": true
                        }]
                }

                else {
                    var postData =
                        [{
                            "gtin": $("#GTINInput").val(),
                            "name": "name1",
                            "wholesalerKey": $("#WholesalerSelector-Exclusive-2").val(),
                            "startDate": $("#startDate-Exclusive-2").val() + "T00:00:01.00Z",
                            "endDate": $("#endDate-Exclusive-2").val() + "T00:00:01.00Z",
                            "neverExpires": false
                        }]
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
                        $("#Create-Exclusive-Success").show();
                        $("#Create-Exclusive-Success").fadeOut(4000);
                        $("#GTINInput").val('');
                    },
                    error: function (jqXHR, exception) {
                        console.log(jqXHR);
                        console.log(jqXHR);
                        console.log(exception);
                        var msg =
                            "Uncaught Error.\n" + JSON.parse(jqXHR.responseText).message;
                        var elements = document.getElementsByClassName("warningmessagetext");
                        for (var i = 0; i < elements.length; i++) {
                            elements[i].textContent = msg;
                        }
                        form.show();
                        $("#Create-Pricelist-Fail").show();
                        $("#Create-Pricelist-Fail").fadeOut(7000);
                        return;
                    },
                });
                event.preventDefault();
                return false;
            });
        });
    };

    makeWebflowFormAjaxSingle($(formIdCreateSingleExclusive));
    getWholesalersSh();
    LoadTippy();

});
