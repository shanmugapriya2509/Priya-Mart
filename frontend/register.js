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
        usernameError.textContent = "Please enter username";
        valid = false;
    }

    if (email === "") {
        emailError.textContent = "Please enter email";
        valid = false;
    } else if (!email.includes("@")) {
        emailError.textContent = "Please enter a valid email";
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

            alert("Registration successful!");

            window.location.href = "index.html";

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

        alert("Unable to connect to the server. Please start the backend.");

    });
}