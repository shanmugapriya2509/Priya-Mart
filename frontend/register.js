function register() {

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const usernameError = document.getElementById("usernameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");

    usernameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";

    let valid = true;

   if (username === "") {
      usernameError.textContent = "Please enter a username";
      valid = false;
    } else if (username.length < 3) {
      usernameError.textContent = "Username must have at least 3 characters";
      valid = false;
     } else if (/\s/.test(username)) {
      usernameError.textContent = "Username cannot contain spaces";
      valid = false;
     }

    if (email === "") {
    emailError.textContent = "Please enter your email";
    valid = false;
     } else if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email)) {
    emailError.textContent = "Enter a valid Gmail address";
    valid = false;
      }
    if (password === "") {
        passwordError.textContent = "Please enter password";
        valid = false;
    }

    if (confirmPassword === "") {
        confirmPasswordError.textContent = "Please confirm password";
        valid = false;
    } else if (password !== confirmPassword) {
        confirmPasswordError.textContent = "Passwords do not match";
        valid = false;
    }

    if (!valid) {
        return;
    }

    fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password
        })
    })
      .then(response => {
        console.log("STATUS:", response.status);
         return response.text();
        })   
         .then(message => {

         console.log("MESSAGE:", message);
         if (message === "Registration successful!") {

        const successBox = document.getElementById("registerSuccess");

        successBox.textContent = "✓ Account created successfully! Redirecting to login...";
         successBox.classList.add("show");

         setTimeout(function () {
        window.location.href = "index.html";
        }, 1200);
        } else if (message === "Username already exists!") {

            usernameError.textContent = message;

        } else if (message === "Email already exists!") {

            emailError.textContent = message;

        } else {

            alert(message);
        }

    })
    .catch(error => {

        console.error("Error:", error);

passwordError.textContent = "Server unavailable. Please try again.";
    });
}
const passwordInput = document.getElementById("password");

passwordInput.addEventListener("input", function () {

    const value = passwordInput.value;

    updateRule("ruleLength", value.length >= 8);

    updateRule(
        "ruleCase",
        /[A-Z]/.test(value) && /[a-z]/.test(value)
    );

    updateRule("ruleNumber", /[0-9]/.test(value));

    updateRule("ruleSymbol", /[^A-Za-z0-9\s]/.test(value));
});

function updateRule(id, completed) {

    const rule = document.getElementById(id);

    if (completed) {
        rule.textContent = "✓ " + rule.textContent.substring(2);
        rule.classList.add("rule-done");
    } else {
        rule.textContent = "○ " + rule.textContent.substring(2);
        rule.classList.remove("rule-done");
    }
}