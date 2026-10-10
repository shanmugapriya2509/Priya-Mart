const text1 = document.querySelector("h2");
const text2 = document.querySelector(".splash-screen h1");
const text3 = document.querySelector(".splash-screen p");

const splashScreen = document.querySelector(".splash-screen");
const loginPage = document.querySelector(".login-page");

const value1 = "WELCOME TO OUR";
const value2 = "PRIYAMART";
const value3 = "YOUR SMART MINI SUPER MARKET";

if (sessionStorage.getItem("splashShown") === "true") {

    splashScreen.style.display = "none";
    loginPage.style.display = "flex";

} else {


text1.textContent = "";
text2.textContent = "";
text3.textContent = "";

function typeText(element, text, speed, next) {
    let i = 0;
    function type() {
       if (i < text.length) {
            element.textContent += text[i];
            i++;
            setTimeout(type, speed);
        } else {
            setTimeout(function () {
                if (next) {
                    next();
                }

            }, 500);
        }
    }

    type();
}
typeText(text1, value1, 100, function () {
    typeText(text2, value2, 120, function () {
        typeText(text3, value3, 80, function () {
            setTimeout(function () {
                sessionStorage.setItem("splashShown","true");
                splashScreen.style.display = "none";
                loginPage.style.display = "flex";

            }, 1000);

        });

    });

});
}
setTimeout(function()
{
    document.querySelector(".splash-screen").style.display="none";
    document.querySelector(".login-page").style.display="flex";
},7500);


function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const selectedRole = document.getElementById("loginRole").value;

    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");

    usernameError.textContent = "";
    passwordError.textContent = "";

    if (!username) {
        usernameError.textContent = "Please enter your username or email.";
        return;
    }

    if (!password) {
        passwordError.textContent = "Please enter your password.";
        return;
    }
    fetch("http://127.0.0.1:8080/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(async response => {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed.");
        }

        return data;
    })
    .then(data => {
        const actualRole = (data.role || "BUYER").toUpperCase();

        if (actualRole === "SELLER_PENDING") {
              passwordError.textContent =
            selectedRole === "SELLER"
            ? "Your seller account is awaiting approval."
            : "This is a seller account. Please select Seller Login.";
        return;
    }

     if (actualRole === "ADMIN") {
     sessionStorage.setItem("loggedIn", "true");
     sessionStorage.setItem("userId", data.userId);
     sessionStorage.setItem("username", data.username);
     sessionStorage.setItem("email", data.email);
     sessionStorage.setItem("role", "ADMIN");

    window.location.href = "admin.html";
    return;
     }

        if (selectedRole !== actualRole) {
            passwordError.textContent =
                selectedRole === "SELLER"
                    ? "This is not an approved seller account."
                    : "Please select Seller Login for your seller account.";
            return;
        }
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("userId", data.userId);
        sessionStorage.setItem("username", data.username);
        sessionStorage.setItem("email", data.email);
        sessionStorage.setItem("role", actualRole);

      if (actualRole === "ADMIN") {
      window.location.href = "admin.html";
       } else if (actualRole === "SELLER") {
       window.location.href = "seller.html";
      } else {
      window.location.href = "home.html";
      }
    })
    .catch(error => {
        console.error("Login error:", error);

        passwordError.textContent =
            error.message === "Failed to fetch"
                ? "Unable to connect to the server."
                : error.message;
    });
    
    function guestLogin() 
    {
        sessionStorage.clear();
        setItem("role", "GUEST");
        sessionStorage.setItem("loggedIn", "false");
        window.location.href = "home.html";
    }


}
