if (sessionStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
}

const userId = sessionStorage.getItem("userId");
const username =
    sessionStorage.getItem("username") || "PriyaMart User";

const email =
    sessionStorage.getItem("email") || "";


document.getElementById("profileUsername").textContent = username;
document.getElementById("profileEmail").textContent = email;

document.getElementById("accountUsername").textContent = username;
document.getElementById("accountEmail").textContent = email || "—";

document.getElementById("profileLetter").textContent =
    username.charAt(0).toUpperCase();


function loadAddress() {

    if (!userId) {
        window.location.href = "index.html";
        return;
    }

fetch(`http://127.0.0.1:8080/api/address/${userId}`, {
    credentials: "include"
})        .then(response => {

            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                throw new Error("Unable to load address");
            }

            return response.json();
        })
        .then(address => {

            if (!address) {
                return;
            }

            document.getElementById("fullName").value =
                address.fullName || "";

            document.getElementById("phone").value =
                address.phone || "";

            document.getElementById("addressLine").value =
                address.addressLine || "";

            document.getElementById("city").value =
                address.city || "";

            document.getElementById("state").value =
                address.state || "";

            document.getElementById("pincode").value =
                address.pincode || "";
        })
        .catch(error => {
            console.error("Address loading error:", error);
        });
}


document.getElementById("addressForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const message =
            document.getElementById("addressMessage");

        const fullName =
            document.getElementById("fullName").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const addressLine =
            document.getElementById("addressLine").value.trim();

        const city =
            document.getElementById("city").value.trim();

        const state =
            document.getElementById("state").value.trim();

        const pincode =
            document.getElementById("pincode").value.trim();


        // PHONE VALIDATION

        if (!/^[0-9]{10}$/.test(phone)) {

            message.textContent =
                "Please enter a valid 10-digit mobile number.";

            message.style.color = "#d32f2f";

            return;
        }


        // PINCODE VALIDATION

        if (!/^[0-9]{6}$/.test(pincode)) {

            message.textContent =
                "Please enter a valid 6-digit pincode.";

            message.style.color = "#d32f2f";

            return;
        }


        const addressData = {
            fullName: fullName,
            phone: phone,
            addressLine: addressLine,
            city: city,
            state: state,
            pincode: pincode
        };


        message.textContent = "Saving address...";
        message.style.color = "#777";


        fetch(
            `http://127.0.0.1:8080/api/address/${userId}`,
            {
                method: "POST",
                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(addressData)
            }
        )
        .then(response => {

            if (!response.ok) {
                throw new Error("Unable to save address");
            }

            return response.json();
        })
        .then(savedAddress => {

            message.textContent =
                "✓ Delivery address saved successfully.";

            message.style.color = "#16803a";

            console.log(
                "Saved address:",
                savedAddress
            );
        })
        .catch(error => {

            console.error(
                "Address saving error:",
                error
            );

            message.textContent =
                "Unable to save address. Please try again.";

            message.style.color = "#d32f2f";
        });
    });

loadAddress();