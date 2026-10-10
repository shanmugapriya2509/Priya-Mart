function register() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const accountType = document.getElementById("accountType").value;

    const usernameError = document.getElementById("usernameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");
    const successBox = document.getElementById("registerSuccess");

    usernameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";
    successBox.textContent = "";

    let valid = true;

    if (username.length < 3 || /\s/.test(username)) {
        usernameError.textContent =
            "Username must have at least 3 characters and no spaces.";
        valid = false;
    }

    if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email)) {
        emailError.textContent = "Enter a valid Gmail address.";
        valid = false;
    }

    if (
        password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[^A-Za-z0-9\s]/.test(password) ||
        /\s/.test(password)
    ) {
        passwordError.textContent =
            "Use 8+ characters, uppercase, lowercase, number and symbol, without spaces.";
        valid = false;
    }

    if (password !== confirmPassword || confirmPassword === "") {
        confirmPasswordError.textContent =
            "Passwords do not match or confirmation is empty.";
        valid = false;
    }

    if (!valid) return;

    fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password,
            accountType: accountType
        })
    })
    .then(response => response.text())
    .then(message => {
        if (message === "Registration successful!") {
            successBox.textContent =
                accountType === "SELLER"
                ? "✓ Account created! Seller approval is required before accessing the seller dashboard."
                : "✓ Account created successfully! Redirecting to login.";

            successBox.classList.add("show");

            if (accountType === "BUYER") {
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1200);
            }
        } else if (message === "Username already exists!") {
            usernameError.textContent = message;
        } else if (message === "Email already exists!") {
            emailError.textContent = message;
        } else {
            alert(message);
        }
    })
    .catch(error => {
        console.error(error);
        passwordError.textContent =
            "Server unavailable. Please try again.";
    });
}

const passwordInput = document.getElementById("password");

passwordInput.addEventListener("input", function () {
    const value = passwordInput.value;

    updateRule("ruleLength", value.length >= 8);
    updateRule("ruleCase", /[A-Z]/.test(value) && /[a-z]/.test(value));
    updateRule("ruleNumber", /[0-9]/.test(value));
    updateRule("ruleSymbol", /[^A-Za-z0-9\s]/.test(value));
});

function updateRule(id, completed) {
    const rule = document.getElementById(id);

    const label = rule.textContent.substring(2);

    rule.textContent = (completed ? "✓ " : "○ ") + label;
    rule.classList.toggle("rule-done", completed);
}
