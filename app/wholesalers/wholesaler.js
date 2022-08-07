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
        wholesalerName.textContent = data.company;
        if (data.platformUrl !== null) {
          whPlatformUrl.setAttribute("href", "" + data.platformUrl);
        } else {
          $("#loginButton").hide();
        }
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

  getWholesaler();
  LogoutNonUser();
});
