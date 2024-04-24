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

  function getCookieNameByValue(searchValue) {
    // Get all cookies as a single string and split it into individual cookies
    const cookies = document.cookie.split('; ');
    
    // Iterate through each cookie string
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const [name, value] = cookie.split('=');  // Split each cookie into name and value
  
      // Decode the cookie value and compare it to the searchValue
      if (decodeURIComponent(value) === searchValue) {
        return name;  // Return the cookie name if the values match
      }
    }
  
    return null; // Return null if no matching value is found
  }

  // Find all buttons with the class 'nextstep'
  const nextStepButtons = document.querySelectorAll('.nextstep');
    
  // Add a click event listener to each 'nextstep' button
  nextStepButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Find the button with the ID 'forwardButton' and simulate a click
      const forwardButton = document.getElementById('forwardButton');
      if (forwardButton) {
        forwardButton.click();
      }
    });
  });

});
