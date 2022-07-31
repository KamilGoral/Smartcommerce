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
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    var shopKey = new URL(location.href).searchParams.get("shopKey");
    var formIdDelete = "#wf-form-DeleteWholesalerCredential";
    var formIdEdit = "#wf-form-CredentialsFormEdit";
    var formIdNew = "#wf-form-CredentialsForm";
    var orgToken = getCookie("sprytnyToken");
    var InvokeURL = getCookie("sprytnyInvokeURL");
    var DomainName = getCookie("sprytnyDomainName");
    var ClientID = sessionStorage.getItem('OrganizationclientId')
    var OrganizationName = sessionStorage.getItem('OrganizationName')
    const OrganizationBread0 = document.getElementById("OrganizationBread0");
    const UploadButton = document.getElementById("UploadButton");
    OrganizationBread0.textContent = OrganizationName;
    OrganizationBread0.setAttribute("href", "https://" + DomainName + "/app/tenants/organization?name=" + OrganizationName + "&clientId=" + ClientID);


    function getShop() {
        var request = new XMLHttpRequest()
        let endpoint = new URL(InvokeURL + 'shops/' + shopKey);
        request.open('GET', endpoint.toString(), true)
        request.setRequestHeader("Authorization", orgToken);
        request.onload = function () {

            var data = JSON.parse(this.response)

            if (request.status >= 200 && request.status < 400) {

                const itemContainer = document.getElementById("shop-Container")
                const item = document.getElementById('sampleShop')
                const shName = document.getElementById('shName');
                const shName2 = document.getElementById('shName2');
                const shCountry = document.getElementById('shCountry');
                const shLine1 = document.getElementById('shLine1');
                const shTown = document.getElementById('shTown');
                const shState = document.getElementById('shState');
                const shPostcode = document.getElementById('shPostcode');
                const shShopKey = document.getElementById('shShopKey');


                const shNameInput = document.getElementById('NewShopName');
                const shKeyInput = document.getElementById('NewShopKey');
                const shCountryInput = document.getElementById('NewShopCountry');
                const shLine1Input = document.getElementById('NewShopLine');
                const shTownInput = document.getElementById('NewShopTown');
                const shStateInput = document.getElementById('NewShopState');
                const shPostcodeInput = document.getElementById('NewShopPostCode');
                const shPcmarketShopId = document.getElementById('NewPcmMarketShopId');
                const pcMarketId = document.getElementById('pcMarketId');

                sessionStorage.setItem('shopKey', data.shopKey);
                sessionStorage.setItem('shopName', data.name);
                var ShopKeyBreadName = sessionStorage.getItem('shopName')
                const ShopNameBread = document.getElementById("ShopNameBread");
                ShopNameBread.textContent = data.name;
                ShopNameBread.setAttribute("href", "https://" + DomainName + "/app/shops/shop?shopKey=" + data.shopKey);


                shName.textContent = data.name;
                shName2.textContent = data.name;
                shCountry.textContent = data.address.country;
                shLine1.textContent = data.address.line1;
                shTown.textContent = data.address.town;
                shState.textContent = data.address.state;
                shPostcode.textContent = data.address.postcode;
                shShopKey.textContent = data.shopKey;
                pcMarketId.textContent = data.pcmarketShopId;

                shNameInput.value = data.name;
                shKeyInput.value = data.shopKey;
                shCountryInput.value = data.address.country;
                shLine1Input.value = data.address.line1;
                shTownInput.value = data.address.town;
                shStateInput.value = data.address.state;
                shPostcodeInput.value = data.address.postcode;
                shPcmarketShopId.value = data.pcmarketShopId;

            } else {
                console.log('error')
            }
        }

        // Send request
        request.send()

    }
    function getWholesalersSh() {
        let url = new URL(InvokeURL + 'wholesalers' + '?enabled=true&perPage=1000');
        let request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.setRequestHeader("Authorization", orgToken);
        request.onload = function () {
            var data = JSON.parse(this.response);
            var toParse = data.items;
            if (request.status >= 200 && request.status < 400) {
                const wholesalerContainer = document.getElementById("WholesalerSelector");
                const wholesalerContainerEdit = document.getElementById("Wholesaler-Selector-Edit");
                toParse.forEach(wholesaler => {
                    if (wholesaler.onlineOfferSupport) {
                        var opt = document.createElement('option');
                        opt.value = wholesaler.wholesalerKey;
                        opt.innerHTML = wholesaler.name;
                        wholesalerContainer.appendChild(opt);

                        var optEdit = document.createElement('option');
                        optEdit.value = wholesaler.wholesalerKey;
                        optEdit.innerHTML = wholesaler.name;
                        wholesalerContainerEdit.appendChild(optEdit);
                    }
                });
                if (request.status == 401) {
                    console.log("Unauthorized");
                }
            }
        };
        request.send();
    }
    function getOrders() {
        var table = $('#table_orders').DataTable({
            "pagingType": "full_numbers",
            "order": [],
            "dom": '<"top">rt<"bottom"lip>',
            "scrollY": "60vh",
            "scrollCollapse": true,
            "pageLength": 10,
            "language": {
                "emptyTable": "Brak danych do wyświetlenia",
                "info": "Pokazuje _START_ - _END_ z _TOTAL_ rezultatów",
                "infoEmpty": "Brak danych",
                "infoFiltered": "(z _MAX_ rezultatów)",
                "lengthMenu": "Pokaż _MENU_ rekordów",
                "loadingRecords": "<div class='spinner'</div>",
                "processing": "<div class='spinner'</div>",
                "search": "Szukaj:",
                "zeroRecords": "Brak pasujących rezultatów",
                "paginate": {
                    "first": "<<",
                    "last": ">>",
                    "next": " >",
                    "previous": "< "
                },
                "aria": {
                    "sortAscending": ": Sortowanie rosnące",
                    "sortDescending": ": Sortowanie malejące"
                }
            },
            ajax: function (data, callback, settings) {

                $.ajaxSetup({
                    headers: {
                        'Authorization': orgToken
                    },
                    beforeSend: function () {
                        $('#waitingdots').show();
                    },
                    complete: function () {
                        $('#waitingdots').hide();
                    }
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

                var sort = "" + whichColumns + direction

                $.get(InvokeURL + 'shops/' + shopKey + '/orders', {
                    sort: sort,
                    perPage: data.length,
                    page: (data.start + data.length) / data.length

                }, function (res) {
                    // map your server's response to the DataTables format and pass it to
                    // DataTables' callback
                    callback({
                        recordsTotal: res.total,
                        recordsFiltered: res.total,
                        data: res.items
                    });
                });
            },
            "processing": true,
            "search": {
                return: true
            },
            "serverSide": true,
            "search": {
                return: true
            },
            "columns": [{
                "orderable": false,
                "data": null,
                "width": "36px",
                "defaultContent": "<div class='details-container'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg' alt='offer'></img></div>"
            },
            {
                "orderable": false,
                "data": "orderId",
                "width": "324px",
                "render": function (data) {
                    if (data !== null) {
                        return data
                    };
                    if (data === null) {
                        return ""
                    };
                }
            },
            {
                "orderable": false,
                "data": "createdBy",
                "width": "108px",
                "render": function (data) {
                    if (data !== null) {
                        return data
                    }
                    if (data === null) {
                        return ""
                    }
                }
            },
            {
                "orderable": false,
                "data": "name",
                "width": "108px",
                "render": function (data) {
                    if (data !== null) {
                        return data
                    }
                    if (data === null) {
                        return ""
                    }
                }
            },
            {
                "orderable": true,
                "data": "createDate",
                "render": function (data) {
                    if (data !== null) {

                        var createDate = "";
                        var offset = new Date().getTimezoneOffset();
                        var localeTime = new Date(Date.parse(data) - offset * 60 * 1000).toISOString();
                        var creationDate = localeTime.split('T');
                        var creationTime = creationDate[1].split('Z');
                        createDate = creationDate[0] + ' ' + creationTime[0].slice(0, -4);

                        return createDate
                    };
                    if (data === null) {
                        return ""
                    };
                }
            }

            ],
            "initComplete": function (settings, json) {
                var api = this.api();
                var textBox = $('#table_offers_filter label input');
                textBox.unbind();
                textBox.bind('keyup input', function (e) {
                    if (e.keyCode == 8 && !textBox.val() || e.keyCode == 46 && !textBox.val()) { } else if (e.keyCode == 13 || !textBox.val()) {
                        api.search(this.value).draw();
                    }
                });
            }

        });

        $('#table_orders').on('click', 'tr', function () {
            var rowData = table.row(this).data();
            window.location.replace("https://" + DomainName + "/app/orders/order?orderId=" + rowData.orderId + "&shopKey=" + shopKey);

        });

    }
    function getOffers() {
        var table = $('#table_offers').DataTable({
            "pagingType": "full_numbers",
            "order": [],
            "dom": '<"top">rt<"bottom"lip>',
            "scrollY": "60vh",
            "scrollCollapse": true,
            "pageLength": 10,
            "language": {
                "emptyTable": "Brak danych do wyświetlenia",
                "info": "Pokazuje _START_ - _END_ z _TOTAL_ rezultatów",
                "infoEmpty": "Brak danych",
                "infoFiltered": "(z _MAX_ rezultatów)",
                "lengthMenu": "Pokaż _MENU_ rekordów",
                "loadingRecords": "<div class='spinner'</div>",
                "processing": "<div class='spinner'</div>",
                "search": "Szukaj:",
                "zeroRecords": "Brak pasujących rezultatów",
                "paginate": {
                    "first": "<<",
                    "last": ">>",
                    "next": " >",
                    "previous": "< "
                },
                "aria": {
                    "sortAscending": ": Sortowanie rosnące",
                    "sortDescending": ": Sortowanie malejące"
                }
            },
            ajax: function (data, callback, settings) {

                $.ajaxSetup({
                    headers: {
                        'Authorization': orgToken
                    },
                    beforeSend: function () {
                        $('#waitingdots').show();
                    },
                    complete: function () {
                        $('#waitingdots').hide();
                    }
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
                        whichColumns = "status:";
                        break;
                    case 3:
                        whichColumns = "createDate:";
                        break;
                    default:
                        whichColumns = "createDate:";
                }

                var sort = "" + whichColumns + direction

                $.get(InvokeURL + 'shops/' + shopKey + '/offers', {
                    sort: sort,
                    perPage: data.length,
                    page: (data.start + data.length) / data.length

                }, function (res) {
                    // map your server's response to the DataTables format and pass it to
                    // DataTables' callback
                    callback({
                        recordsTotal: res.total,
                        recordsFiltered: res.total,
                        data: res.items
                    });
                });
            },
            "processing": true,
            "search": {
                return: true
            },
            "serverSide": true,
            "search": {
                return: true
            },
            "columns": [{
                "orderable": false,
                "data": null,
                "width": "36px",
                "defaultContent": "<div class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61b4c46d3af2140f11b2ea4b_document.svg' alt='offer'></img></div>"
            },
            {
                "orderable": false,
                "visible": false,
                "data": "offerId",
                "render": function (data) {
                    if (data !== null) {
                        return data
                    };
                    if (data === null) {
                        return ""
                    };
                }
            },
            {
                "orderable": true,
                "data": "createDate",
                "render": function (data) {
                    if (data !== null) {

                        var createDate = "";
                        var offset = new Date().getTimezoneOffset();
                        var localeTime = new Date(Date.parse(data) - offset * 60 * 1000).toISOString();
                        var creationDate = localeTime.split('T');
                        var creationTime = creationDate[1].split('Z');
                        createDate = creationDate[0] + ' ' + creationTime[0].slice(0, -4);

                        return createDate
                    };
                    if (data === null) {
                        return ""
                    };
                }
            },
            {
                "orderable": true,
                "data": "status",
                "render": function (data) {
                    if (data !== null) {
                        if (data == "ready") {
                            return "Gotowa"
                        }
                        if (data == "error") {
                            return "Problem"
                        }
                        if (data == "in progress") {
                            return "W trakcie"
                        }
                        if (data == "incomplete") {
                            return "Niekompletna"
                        }
                    };
                    if (data === null) {
                        return ""
                    };
                }
            },
            {
                "orderable": false,
                "data": null,
                "width": "72px",
                "render": function (data, type, row) {
                    if (type === "display") {
                        return '<div class="action-container"><a href="#" status="' + row["status"] + '" offerId="' + row["offerId"] + '" class="buttonoutline editme w-button">Przejdź</a></div>'
                    }
                }
            }
            ],
            "initComplete": function (settings, json) {
                var api = this.api();
                var textBox = $('#table_offers_filter label input');
                textBox.unbind();
                textBox.bind('keyup input', function (e) {
                    if (e.keyCode == 8 && !textBox.val() || e.keyCode == 46 && !textBox.val()) { } else if (e.keyCode == 13 || !textBox.val()) {
                        api.search(this.value).draw();
                    }
                });
            }

        });

        $('#table_offers').on('click', 'a', function () {

            var clikedEl = this;

            if (clikedEl.getAttribute("status") == "in progress") {
                alert("Oferta w trakcie tworzenia. Proszę poczekaj...")
            }
            if (clikedEl.getAttribute("status") == "error") {
                alert("Oops! Coś poszło nie tak. Spróbuj ponownie...");
            }
            if (clikedEl.getAttribute("status") == "ready") {
                window.location.replace("https://" + DomainName + "/app/offers/offer?shopKey=" + shopKey + "&offerId=" + clikedEl.getAttribute("offerId"));
            }
            if (clikedEl.getAttribute("status") == "incomplete") {
                $.ajax({
                    url: InvokeURL + 'shops/' + shopKey + "/offers/" + clikedEl.getAttribute("offerId") + "/status",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", orgToken)
                    },
                    success: function (data) {
                        console.log(data.messages);
                        console.log(clikedEl);
                        if (confirm("Uwaga! Oferta nie jest komplenta. " + data.messages)) document.location = "https://" + DomainName + "/app/offers/offer?shopKey=" + shopKey + "&offerId=" + clikedEl.getAttribute("offerId")
                    }
                });

            }
        });
    }
    function getPriceLists() {
        var table = $('#table_pricelists_list').DataTable({
            "pagingType": "full_numbers",
            "order": [],
            "dom": '<"top">rt<"bottom"lip>',
            "scrollY": "60vh",
            "scrollCollapse": true,
            "pageLength": 10,
            "language": {
                "emptyTable": "Brak danych do wyświetlenia",
                "info": "Pokazuje _START_ - _END_ z _TOTAL_ rezultatów",
                "infoEmpty": "Brak danych",
                "infoFiltered": "(z _MAX_ rezultatów)",
                "lengthMenu": "Pokaż _MENU_ rekordów",
                "loadingRecords": "<div class='spinner'</div>",
                "processing": "<div class='spinner'</div>",
                "search": "Szukaj:",
                "zeroRecords": "Brak pasujących rezultatów",
                "paginate": {
                    "first": "<<",
                    "last": ">>",
                    "next": " >",
                    "previous": "< "
                },
                "aria": {
                    "sortAscending": ": Sortowanie rosnące",
                    "sortDescending": ": Sortowanie malejące"
                }
            },
            ajax: function (data, callback, settings) {

                $.ajaxSetup({
                    headers: {
                        'Authorization': orgToken
                    },
                    beforeSend: function () {
                        $('#waitingdots').show();
                    },
                    complete: function () {
                        $('#waitingdots').hide();
                    }
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

                var sort = "" + whichColumns + direction

                $.get(InvokeURL + 'shops/' + shopKey + '/price-lists', {
                    sort: sort,
                    perPage: data.length,
                    page: (data.start + data.length) / data.length

                }, function (res) {
                    // map your server's response to the DataTables format and pass it to
                    // DataTables' callback
                    callback({
                        recordsTotal: res.total,
                        recordsFiltered: res.total,
                        data: res.items
                    });
                });
            },
            "processing": true,
            "serverSide": true,
            "search": {
                return: true
            },
            "columns": [{
                "orderable": false,
                "data": null,
                "width": "36px",
                "defaultContent": "<div class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61ae41350933c525ec8ea03a_office-building.svg' alt='offer'></img></div>"
            },
            {
                "orderable": false,
                "data": "wholesalerKey",
                "render": function (data) {
                    if (data !== null) {
                        return data
                    }
                    if (data === null) {
                        return ""
                    }
                }
            },
            {
                "orderable": true,
                "data": "createDate",
                "render": function (data) {
                    if (data !== null) {

                        var createDate = "";
                        var offset = new Date().getTimezoneOffset();
                        var localeTime = new Date(Date.parse(data) - offset * 60 * 1000).toISOString();
                        var creationDate = localeTime.split('T');
                        var creationTime = creationDate[1].split('Z');
                        createDate = creationDate[0] + ' ' + creationTime[0].slice(0, -4);

                        return createDate
                    }
                    if (data === null) {
                        return ""
                    }
                }
            },
            {
                "orderable": false,
                "data": "startDate",
                "render": function (data) {
                    if (data !== null) {

                        var startDate = "";
                        var offset = new Date().getTimezoneOffset();
                        var localeTime = new Date(Date.parse(data) - offset * 60 * 1000).toISOString();
                        var creationDate = localeTime.split('T');
                        var creationTime = creationDate[1].split('Z');
                        startDate = creationDate[0] //+ ' ' + creationTime[0].slice(0, -4);

                        return startDate
                    }
                    if (data === null) {
                        return ""
                    }
                }
            },
            {
                "orderable": false,
                "data": "endDate",
                "render": function (data) {
                    if (data !== null) {

                        var endDate = "";
                        var offset = new Date().getTimezoneOffset();
                        var localeTime = new Date(Date.parse(data) - offset * 60 * 1000).toISOString();
                        var creationDate = localeTime.split('T');
                        var creationTime = creationDate[1].split('Z');
                        endDate = creationDate[0] //+ ' ' + creationTime[0].slice(0, -4);

                        return endDate
                    }
                    if (data === null) {
                        return ""
                    }
                }
            },
            {
                "orderable": false,
                "data": "createdBy",
                "render": function (data) {
                    if (data !== null) {
                        return data
                    }
                    if (data === null) {
                        return ""
                    }
                }
            },
            {
                "orderable": false,
                "data": "lastModificationDate",
                "render": function (data) {
                    if (data !== null) {

                        var lastModificationDate = "";
                        var offset = new Date().getTimezoneOffset();
                        var localeTime = new Date(Date.parse(data) - offset * 60 * 1000).toISOString();
                        var creationDate = localeTime.split('T');
                        var creationTime = creationDate[1].split('Z');
                        lastModificationDate = creationDate[0] + ' ' + creationTime[0].slice(0, -4);

                        return lastModificationDate
                    }
                    if (data === null) {
                        return ""
                    }
                }
            },

            ]
        });

        $('#table_pricelists_list').on('click', 'tr', function () {
            var rowData = table.row(this).data();
            window.location.replace("https://" + DomainName + "/app/pricelists/pricelist?priceListId=" + rowData.priceListId + '&shopKey=' + shopKey);

        });

    }
    function getWholesalers() {
        var table = $('#table_wholesalers').DataTable({
            "pagingType": "full_numbers",
            "order": [],
            "dom": '<"top">rt<"bottom"lip>',
            "scrollY": "60vh",
            "scrollCollapse": true,
            "pageLength": 10,
            "language": {
                "emptyTable": "Brak danych do wyświetlenia",
                "info": "Pokazuje _START_ - _END_ z _TOTAL_ rezultatów",
                "infoEmpty": "Brak danych",
                "infoFiltered": "(z _MAX_ rezultatów)",
                "lengthMenu": "Pokaż _MENU_ rekordów",
                "loadingRecords": "<div class='spinner'</div>",
                "processing": "<div class='spinner'</div>",
                "search": "Szukaj:",
                "zeroRecords": "Brak pasujących rezultatów",
                "paginate": {
                    "first": "<<",
                    "last": ">>",
                    "next": " >",
                    "previous": "< "
                },
                "aria": {
                    "sortAscending": ": Sortowanie rosnące",
                    "sortDescending": ": Sortowanie malejące"
                }
            },
            ajax: function (data, callback, settings) {

                $.ajaxSetup({
                    headers: {
                        'Authorization': orgToken
                    },
                    beforeSend: function () {
                        $('#waitingdots').show();
                    },
                    complete: function () {
                        $('#waitingdots').hide();
                    }
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
                    case 2:
                        whichColumns = "wholesalerKey:";
                        break;
                    case 3:
                        whichColumns = "wholesalerKey";
                        break;
                    default:
                        whichColumns = "wholesalerKey:";
                }

                var sort = "" + whichColumns + direction
                $.get(InvokeURL + 'shops/' + shopKey + '/wholesalers', {
                    sort: sort,
                    perPage: data.length,
                    page: (data.start + data.length) / data.length

                }, function (res) {
                    // map your server's response to the DataTables format and pass it to
                    // DataTables' callback
                    callback({
                        recordsTotal: res.total,
                        recordsFiltered: res.total,
                        data: res.items
                    });
                });
            },
            "processing": true,
            "serverSide": true,
            "search": {
                return: true
            },
            "columns": [{
                "orderable": false,
                "data": null,
                "width": "36px",
                "defaultContent": "<div class='details-container2'><img src='https://uploads-ssl.webflow.com/6041108bece36760b4e14016/61ae41350933c525ec8ea03a_office-building.svg' alt='offer'></img></div>"
            },
            {
                "orderable": false,
                "data": "wholesalerKey",
                "width": "256px",
                "render": function (data) {
                    if (data !== null) {
                        return data
                    }
                    else {
                        return ""
                    }
                }
            },
            {
                "orderable": false,
                "data": "logisticMinimum",
                "width": "108px",
                "render": function (data) {
                    if (data !== null) {
                        return data
                    }
                    else {
                        return ""
                    }
                }
            },
            {
                "orderable": false,
                "data": "onlineOffer",
                "width": "108px",
                "render": function (data) {
                    if (data.lastDownload.createDate !== null) {
                        var createDate = "";
                        var offset = new Date().getTimezoneOffset();
                        var localeTime = new Date(Date.parse(data.lastDownload.createDate) - offset * 60 * 1000).toISOString();
                        var creationDate = localeTime.split('T');
                        var creationTime = creationDate[1].split('Z');
                        createDate = creationDate[0] + ' ' + creationTime[0].slice(0, -4);
                        return createDate
                    }
                    else {
                        return ""
                    }
                }
            },
            {
                "orderable": false,
                "data": "onlineOffer",
                "width": "108px",
                "render": function (data) {
                    if (data !== null) {
                        var statusWh = data.lastDownload.status;

                        if (statusWh === "Succeeded") {
                            return '<spann class="positive">Sukces</spann>';
                        } else {
                            return '<spann class="negative">Problem</spann>';
                        }
                    }
                    else {
                        return ""
                    }
                }
            },
            {
                "orderable": false,
                "data": "onlineOffer",
                "visible": false,
                "width": "108px",
                "render": function (data) {
                    if (data !== null) {
                        return data.username
                    }
                    else {
                        return ""
                    }
                }
            },
            {
                "orderable": false,
                "data": null,
                "width": "36px",
                "defaultContent": '<a href="#" class="buttonoutline editme w-button">Edytuj</a>'
            }


            ],
            "initComplete": function (settings, json) {
                var api = this.api();
                var textBox = $('#table_wholesalers_filter label input');
                textBox.unbind();
                textBox.bind('keyup input', function (e) {
                    if (e.keyCode == 8 && !textBox.val() || e.keyCode == 46 && !textBox.val()) { } else if (e.keyCode == 13 || !textBox.val()) {
                        api.search(this.value).draw();
                    }
                });
            }

        });

        $('#table_wholesalers').on('click', 'tr', function () {
            var rowData = table.row(this).data();

            function getProfile() {

                let url = new URL(InvokeURL + 'shops/' + shopKey + "/wholesalers/" + rowData.wholesalerKey + "/profiles");
                if (rowData.wholesalerKey == "mirex") {
                    $("#CompanyDivEdit").show();
                } else {
                    $("#CompanyDivEdit").hide();
                }
                let request = new XMLHttpRequest();
                request.open('GET', url, true);
                request.setRequestHeader("Authorization", orgToken);
                request.onload = function () {
                    var data = JSON.parse(this.response);
                    var toParse = data.items;
                    if (request.status >= 200 && request.status < 400 && data.total > 0) {

                        $("#Wholesaler-profile-Selector-box").show();
                        $("#Wholesaler-profile-Selector").attr('required', '');
                        const wholesalerProfileContainer = document.getElementById("Wholesaler-profile-Selector");
                        toParse.forEach(wholesaler => {
                            var optProfile = document.createElement('option');
                            optProfile.value = wholesaler.id;
                            optProfile.innerHTML = wholesaler.name;
                            wholesalerProfileContainer.appendChild(optProfile);
                        });
                    } else if (request.status == 401) {
                        console.log("Unauthorized");
                    } else {
                        $("#Wholesaler-profile-Selector-box").hide();
                        $("#Wholesaler-profile-Selector").removeAttr('required');
                    }
                }
                request.send();
            };

            function pickProfile() {
                let url2 = new URL(InvokeURL + 'shops/' + shopKey + "/wholesalers/" + rowData.wholesalerKey);
                let request2 = new XMLHttpRequest();
                request2.open('GET', url2, true);
                request2.setRequestHeader("Authorization", orgToken);
                request2.onload = function () {
                    var data2 = JSON.parse(this.response);
                    if (request2.status >= 200 && request2.status < 400 && data2.onlineOffer.profile !== null) {
                        $("#Wholesaler-profile-Selector").val(data2.onlineOffer.profile.id).change();
                        $('#waitingdots').hide();
                    } else {
                        $('#waitingdots').hide();
                    }
                }
                request2.send();
            }

            $('#waitingdots').show();
            getProfile();
            $("#EditCredentialsModal").css("display", "flex");
            $("#Wholesaler-profile-Selector-box").hide();
            $('#Wholesaler-Selector-Edit').attr('disabled', true);
            $("#UsernameEdit").val(rowData.onlineOffer.username).change();
            $("#logisticMinimumEdit").val(parseInt(rowData.logisticMinimum)).change();
            $("#Wholesaler-Selector-Edit").val(rowData.wholesalerKey).change();
            $('#Wholesaler-profile-Selector')
                .find('option')
                .remove()
                .end()
                .append('<option value=null>Wybierz profil</option>')
                .val('null');
            pickProfile();
        });

    }

    makeWebflowFormAjaxDelete = function (forms, successCallback, errorCallback) {
        forms.each(function () {
            var form = $(this);
            form.on("submit", function (event) {
                var container = form.parent();
                var doneBlock = $("#w-form-done3", container);
                var failBlock = $("#w-form-fail3", container);
                var action = InvokeURL + "shops/" + shopKey + "/wholesalers/" + $('#Wholesaler-Selector-Edit').val();
                var method = "PATCH";


                var data = [{
                    "op": "remove",
                    "path": "/onlineOffer"
                }];
                $.ajax({
                    type: method,
                    url: action,
                    cors: true,
                    beforeSend: function () {
                        $('#waitingdots').show();
                    },
                    complete: function () {
                        $('#waitingdots').hide();
                    },
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(data),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': orgToken
                    },
                    success: function (resultData) {

                        if (typeof successCallback === 'function') {
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
                            location.reload();
                        }, 2000);
                    },
                    error: function (e) {
                        if (typeof errorCallback === 'function') {
                            errorCallback(e)
                        }
                        form.show();
                        doneBlock.hide();
                        failBlock.show();
                        console.log(e);
                    }
                });
                event.preventDefault();
                return false;
            });
        });
    };
    makeWebflowFormAjaxNew = function (forms, successCallback, errorCallback) {
        forms.each(function () {
            var form = $(this);
            form.on("submit", function (event) {
                var container = form.parent();
                var doneBlock = $("#w-form-done2", container);
                var failBlock = $("#w-form-fail2", container);
                var action = InvokeURL + "shops/" + shopKey + "/wholesalers/" + $('#WholesalerSelector').val();
                var method = "PATCH";
                //mirex case
                if ($('#Company').val()) {
                    var data = [{
                        "op": "add",
                        "path": "/onlineOffer/username",
                        "value": $('#Username').val()
                    },
                    {
                        "op": "add",
                        "path": "/onlineOffer/password",
                        "value": $('#Password').val()
                    },
                    {
                        "op": "add",
                        "path": "/onlineOffer/extraFields",
                        "value": {
                            "company": $('#Company').val()
                        }
                    }
                    ]
                } else {
                    var data = [{
                        "op": "add",
                        "path": "/onlineOffer/username",
                        "value": $('#Username').val()
                    },
                    {
                        "op": "add",
                        "path": "/onlineOffer/password",
                        "value": $('#Password').val()
                    }
                    ]
                }

                $.ajax({
                    type: method,
                    url: action,
                    cors: true,
                    beforeSend: function () {
                        $('#waitingdots').show();
                    },
                    complete: function () {
                        $('#waitingdots').hide();
                    },
                    contentType: 'application/json',
                    dataType: 'json',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': orgToken
                    },
                    data: JSON.stringify(data),
                    success: function (resultData) {
                        if (typeof successCallback === 'function') {
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
                            location.reload();
                        }, 2000);
                    },
                    error: function (e) {
                        if (typeof errorCallback === 'function') {
                            errorCallback(e)
                        }
                        form.show();
                        doneBlock.hide();
                        failBlock.show();
                        console.log(e);
                    }
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
                var container = form.parent();
                var doneBlock = $("#w-form-done4", container);
                var failBlock = $("#w-form-fail4", container);
                var action = InvokeURL + "shops/" + shopKey + "/wholesalers/" + $('#Wholesaler-Selector-Edit').val();
                var method = "PATCH";
                var LogisticMinimumEdit = parseInt($('#logisticMinimumEdit').val());
                if (isNaN(LogisticMinimumEdit)) {
                    LogisticMinimumEdit = 0
                }
                //mirex case
                if ($('#CompanyEdit').val()) {
                    var data = [{
                        "op": "add",
                        "path": "/onlineOffer/username",
                        "value": $('#UsernameEdit').val()
                    },
                    {
                        "op": "add",
                        "path": "/onlineOffer/password",
                        "value": $('#PasswordEdit').val()
                    },
                    {
                        "op": "add",
                        "path": "/logisticMinimum",
                        "value": LogisticMinimumEdit
                    },
                    {
                        "op": "add",
                        "path": "/onlineOffer/extraFields",
                        "value": {
                            "company": $('#CompanyEdit').val()
                        }
                    }
                    ]
                } else {
                    if ($("#Wholesaler-profile-Selector").val() != "null") {
                        var data = [{
                            "op": "add",
                            "path": "/onlineOffer/username",
                            "value": $('#UsernameEdit').val()
                        },
                        {
                            "op": "add",
                            "path": "/onlineOffer/password",
                            "value": $('#PasswordEdit').val()
                        },
                        {
                            "op": "add",
                            "path": "/logisticMinimum",
                            "value": LogisticMinimumEdit
                        },
                        {
                            "op": "add",
                            "path": "/onlineOffer/profile/id",
                            "value": $("#Wholesaler-profile-Selector").val()
                        }
                        ]
                    } else {
                        var data = [{
                            "op": "add",
                            "path": "/onlineOffer/username",
                            "value": $('#UsernameEdit').val()
                        },
                        {
                            "op": "add",
                            "path": "/onlineOffer/password",
                            "value": $('#PasswordEdit').val()
                        },
                        {
                            "op": "add",
                            "path": "/logisticMinimum",
                            "value": LogisticMinimumEdit
                        }
                        ]
                    }
                }
                $.ajax({
                    type: method,
                    url: action,
                    cors: true,
                    beforeSend: function () {
                        $('#waitingdots').show();
                    },
                    complete: function () {
                        $('#waitingdots').hide();
                    },
                    contentType: 'application/json',
                    dataType: 'json',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': orgToken
                    },
                    data: JSON.stringify(data),
                    success: function (resultData) {
                        if (typeof successCallback === 'function') {
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
                        doneBlock.fadeOut(3000)
                        failBlock.hide();
                        $('#UsernameEdit').val("");
                        $('#PasswordEdit').val("");
                        window.setTimeout(function () {
                            location.reload();
                        }, 2000);
                    },
                    error: function (e) {
                        if (typeof errorCallback === 'function') {
                            errorCallback(e)
                        }
                        form.show();
                        doneBlock.hide();
                        failBlock.show();
                        console.log(e);
                    }
                });
                event.preventDefault();
                return false;
            });
        });
    }
    makeWebflowFormAjaxDelete = function (forms, successCallback, errorCallback) {
        forms.each(function () {
            var form = $(this);
            form.on("submit", function (event) {
                var container = form.parent();
                var doneBlock = $("#ShopDeleteSuccess", container);
                var failBlock = $("#ShopDeleteFail", container);
                var action = InvokeURL + "shops/" + shopKey
                var method = "DELETE";

                $.ajax({
                    type: method,
                    url: action,
                    cors: true,
                    beforeSend: function () {
                        $('#waitingdots').show();
                    },
                    complete: function () {
                        $('#waitingdots').hide();
                    },
                    contentType: 'application/json',
                    dataType: 'json',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': orgToken
                    },
                    success: function (resultData) {

                        if (typeof successCallback === 'function') {
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
                            location.reload();
                        }, 2000);
                    },
                    error: function (e) {
                        if (typeof errorCallback === 'function') {
                            errorCallback(e)
                        }
                        form.show();
                        doneBlock.hide();
                        failBlock.show();
                        console.log(e);
                    }
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
                var container = form.parent();
                var doneBlock = $("#w-form-done4", container);
                var failBlock = $("#w-form-fail4", container);
                var action = InvokeURL + "shops/" + shopKey;
                var PcMarketId = parseInt($('#NewPcmMarketShopId').val())
                var data = [{
                    "op": "add",
                    "path": "/name",
                    "value": $('#NewShopName').val()
                },
                {
                    "op": "add",
                    "path": "/key",
                    "value": $('#NewShopKey').val()
                },
                {
                    "op": "add",
                    "path": "/pcmarketShopId",
                    "value": PcMarketId
                },
                {
                    "op": "add",
                    "path": "/address/country",
                    "value": $('#NewShopCountry').val()
                },
                {
                    "op": "add",
                    "path": "/address/line1",
                    "value": $('#NewShopLine').val()
                },
                {
                    "op": "add",
                    "path": "/address/town",
                    "value": $('#NewShopTown').val()
                },
                {
                    "op": "add",
                    "path": "/address/state",
                    "value": $('#NewShopState').val()
                },
                {
                    "op": "add",
                    "path": "/address/postcode",
                    "value": $('#NewShopPostCode').val()
                }
                ];
                if (isNaN(PcMarketId)) {
                    data = [{
                        "op": "add",
                        "path": "/name",
                        "value": $('#NewShopName').val()
                    },
                    {
                        "op": "add",
                        "path": "/key",
                        "value": $('#NewShopKey').val()
                    },
                    {
                        "op": "add",
                        "path": "/address/country",
                        "value": $('#NewShopCountry').val()
                    },
                    {
                        "op": "add",
                        "path": "/address/line1",
                        "value": $('#NewShopLine').val()
                    },
                    {
                        "op": "add",
                        "path": "/address/town",
                        "value": $('#NewShopTown').val()
                    },
                    {
                        "op": "add",
                        "path": "/address/state",
                        "value": $('#NewShopState').val()
                    },
                    {
                        "op": "add",
                        "path": "/address/postcode",
                        "value": $('#NewShopPostCode').val()
                    }
                    ];
                }
                var method = "PATCH";

                $.ajax({
                    type: method,
                    url: action,
                    cors: true,
                    beforeSend: function () {
                        $('#waitingdots').show();
                    },
                    complete: function () {
                        $('#waitingdots').hide();
                    },
                    contentType: 'application/json',
                    dataType: 'json',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': orgToken
                    },
                    data: JSON.stringify(data),
                    success: function (resultData) {
                        if (typeof successCallback === 'function') {
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
                        doneBlock.fadeOut(3000)
                        failBlock.hide();
                        $('#UsernameEdit').val("");
                        $('#PasswordEdit').val("");
                        window.setTimeout(function () {
                            location.reload();
                        }, 2000);
                    },
                    error: function (e) {
                        if (typeof errorCallback === 'function') {
                            errorCallback(e)
                        }
                        form.show();
                        doneBlock.hide();
                        failBlock.show();
                        console.log(e);
                    }
                });
                event.preventDefault();
                return false;
            });
        });
    }

    makeWebflowFormAjaxRefreshOffer = function (forms, successCallback, errorCallback) {
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
                        $('#waitingdots').show();
                    },
                    complete: function () {
                        $('#waitingdots').hide();
                    },
                    contentType: 'application/json',
                    dataType: 'json',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': orgToken
                    },
                    data: JSON.stringify(data),
                    success: function (resultData) {
                        if (typeof successCallback === 'function') {
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
                        doneBlock.fadeOut(3000)
                        failBlock.hide();
                        window.setTimeout(function () {
                            location.reload();
                        }, 2000);
                    },
                    error: function (e) {
                        if (typeof errorCallback === 'function') {
                            errorCallback(e)
                        }
                        form.show();
                        doneBlock.hide();
                        failBlock.show();
                        console.log(e);
                    }
                });
                event.preventDefault();
                return false;
            });
        });
    }

    $("#WholesalerSelector").on("change", function () {
        console.log($(this).val());
        if ($(this).val() == "mirex") {
            $("#CompanyDiv").show();
        } else {
            $("#CompanyDiv").hide();
        }
    });


    function FileUpload() {
        $('#waitingdots').show();
        const xhr = new XMLHttpRequest();
        var myUploadedFile = document.getElementById("orderfile").files[0];
        var action = InvokeURL + "shops/" + shopKey + "/orders";
        xhr.open("POST", action);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.setRequestHeader('Authorization', orgToken);
        xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');

        xhr.onreadystatechange = function () {
            $('#waitingdots').hide();
            if (xhr.readyState === 4) {
                var response = JSON.parse(xhr.responseText);
                if (xhr.status === 201) {
                    document.getElementById("wf-form-doneCreate-Order").style.display = "block";

                    var action = InvokeURL + "shops/" + shopKey + "/orders/" + response.orderId;
                    var method = "PATCH";
                    var data = [{
                        "op": "add",
                        "path": "/name",
                        "value": $('#OrderName').val()
                    },];

                    $.ajax({
                        type: method,
                        url: action,
                        cors: true,
                        beforeSend: function () {
                            $('#waitingdots').show();
                        },
                        complete: function () {
                            $('#waitingdots').hide();
                        },
                        contentType: 'application/json',
                        dataType: 'json',
                        data: JSON.stringify(data),
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': orgToken
                        },
                        success: function (resultData) {
                            document.getElementById("wf-form-doneCreate-Order").style.display = "block";
                            window.setTimeout(function () {
                                window.location.replace("https://" + DomainName + "/app/orders/order?orderId=" + response.orderId + "&shopKey=" + shopKey);
                            }, 100);

                        },
                        error: function (e) {
                            if (typeof errorCallback === 'function') {
                                errorCallback(e)
                            }
                            console.log(e);
                        }
                    });

                } else {
                    document.getElementById("wf-form-failCreate-Order").style.display = "block";
                    console.log('failed');
                }
            }
        }
        xhr.send(myUploadedFile);
    }

    UploadButton.addEventListener('click', (event) => {
        FileUpload();
    });

    makeWebflowFormAjaxDelete($(formIdDelete));
    makeWebflowFormAjaxNew($(formIdNew));
    makeWebflowFormAjax($(formIdEdit));
    makeWebflowFormAjaxDelete($("#wf-form-DeleteShop"));
    makeWebflowFormAjax($("#wf-form-EditShopInformation"));
    makeWebflowFormAjaxRefreshOffer($("#wf-form-RefreshOfferForm"));

    getShop();
    getWholesalersSh();
    getOrders();
    getOffers();
    getPriceLists();
    getWholesalers();

    $('div[role="tablist"]').click(function () {
        setTimeout(function () {
            $.fn.dataTable.tables({
                visible: true,
                api: true
            }).columns.adjust();
        }, 200);
    });

})