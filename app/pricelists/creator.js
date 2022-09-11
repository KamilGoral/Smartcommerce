function getShops() {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }
    var InvokeURL = getCookie('sprytnyInvokeURL');
    var orgToken = getCookie("sprytnyToken");
    var DomainName = getCookie("sprytnyDomainName");
  
  
    let url = new URL(InvokeURL + 'shops');
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader("Authorization", orgToken);
    request.onload = function() {
      var data = JSON.parse(this.response);
      var toParse = data.items;
  
      if (request.status >= 200 && request.status < 400) {
        const shopKeysContainer = document.getElementById("shopKeys");
        toParse.forEach(shop => {
  
          var opt = document.createElement('option');
          opt.value = shop.shopKey;
          opt.innerHTML = shop.name;
          shopKeysContainer.appendChild(opt);
        });
        if (request.status == 401) {
          console.log("Unauthorized");
        }
        };
      }
    request.send();
  }