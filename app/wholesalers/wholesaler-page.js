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
    var ClientID = sessionStorage.getItem("OrganizationclientId");
    var OrganizationName = sessionStorage.getItem("OrganizationName");
    var formIdNewServer = "#wf-form-Create-server";
    var formIdDeleteServer = "#wf-form-Delete-server";

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


    const WholesalerIdBread = document.getElementById("WholesalerBread0");
    var wholesalerKey = new URL(document.location.href).searchParams.get(
        "wholesalerKey"
    );
    WholesalerIdBread.textContent = wholesalerKey;
    WholesalerIdBread.setAttribute("href", window.location.href);

    function getWholesaler() {
        var request = new XMLHttpRequest();
        let apiUrl = new URL(InvokeURL + "wholesalers/" + wholesalerKey);
        request.open("GET", apiUrl.toString(), true);
        request.setRequestHeader("Authorization", orgToken);
        request.onload = function () {
            var data = JSON.parse(this.response);
            console.log(data);
            if (request.status >= 200 && request.status < 400) {


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

    function getFTP() {
        var request = new XMLHttpRequest();
        let apiUrl = new URL(InvokeURL + "wholesalers/" + wholesalerKey + "/ftp");
        request.open("GET", apiUrl.toString(), true);
        request.setRequestHeader("Authorization", orgToken);
        request.onload = function () {
            var data = JSON.parse(this.response);
            console.log(data);
            if (request.status >= 200 && request.status < 400) {


                const ftpUsername = document.getElementById("ftpUsername");
                const ftpPassword = document.getElementById("ftpPassword");
                
                ftpUsername.textContent = data.credentials.username;
                ftpPassword.textContent = "*****"

            } else {
                console.log("error");
            }
        };
        request.send();
    }

    makeWebflowFormAjaxServerWh = function (forms, successCallback, errorCallback) {
        forms.each(function () {
            var form = $(this);
            form.on("submit", function (event) {
                var container = form.parent();
                var doneBlock = $("#wf-form-Create-wholesaler-done", container);
                var failBlock = $("#wf-form-Create-wholesaler-fail", container);
                var action =
                    InvokeURL +
                    "/wholesalers/" +
                    wholesalerKey +
                    "/ftp";
                var method = "POST";


                var data =
                {
                    username: $("#Wholesaler-Login").val(),
                }
                    ;

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
                        form.hide();
                        console.log(resultData.credentials.username);
                        console.log(resultData.credentials.password);
                        const credentialsbox = document.getElementById("credentialsbox");
                        credentialsbox.textContent = "Login: " + resultData.credentials.username + "\nHasło: " + resultData.credentials.password;
                        doneBlock.show();
                        failBlock.hide();
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
                        $('.warningmessagetext').text(msg);
                        form.show();
                        doneBlock.hide();
                        failBlock.show();
                        failBlock.fadeOut(5000);
                      },
                });
                event.preventDefault();
                return false;
            });
        });
    };

    makeWebflowFormAjaxDeleteServerWh = function (
        forms,
        successCallback,
        errorCallback
    ) {
        forms.each(function () {
            var form = $(this);
            form.on("submit", function (event) {
                var container = form.parent();
                var doneBlock = $("#wf-form-Delete-wholesaler-done", container);
                var failBlock = $("#wf-form-Delete-wholesaler-fail", container);
                var action =
                    InvokeURL +
                    "/wholesalers/" +
                    wholesalerKey +
                    "/ftp";
                var method = "DELETE";

                var data = [
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
                        console.log(resultData)
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
                        failBlock.hide();
                        window.setTimeout(function () {
                            location.reload();
                        }, 2000);
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
    makeWebflowFormAjaxServerWh($(formIdNewServer));
    makeWebflowFormAjaxDeleteServerWh($(formIdDeleteServer));
    LogoutNonUser();
    getWholesaler();
    getFTP();

});
