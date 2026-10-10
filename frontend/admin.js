
const API = "http://127.0.0.1:8080";
if (
    sessionStorage.getItem("loggedIn") !== "true" ||
    sessionStorage.getItem("role") !== "ADMIN"
) {
    window.location.replace("index.html");
} else {
    loadSellers();
}

async function loadSellers() {
    const list = document.getElementById("sellerList");
    const message = document.getElementById("message");

    try {
        const response = await fetch(
            API + "/api/admin/sellers/pending",
            { credentials: "include" }
        );

        if (!response.ok) {
        throw new Error(
        "API Error: " + response.status + " " + response.statusText
      );
   }

        const sellers = await response.json();
        list.replaceChildren();

        if (sellers.length === 0) {
            list.textContent = "No pending seller approvals.";
            return;
        }

        sellers.forEach(seller => {
            const row = document.createElement("div");
            row.className = "seller-row";

            const details = document.createElement("div");
            const name = document.createElement("strong");
            const email = document.createElement("p");

            name.textContent = seller.username;
            email.textContent = seller.email;

            details.append(name, email);

            const button = document.createElement("button");
            button.textContent = "Approve";
            button.onclick = () => approveSeller(seller.id, button);

            row.append(details, button);
            list.appendChild(row);
        });

    } catch (error) {
        message.textContent = error.message;
        list.textContent = "";
    }
}

async function approveSeller(id, button) {
    button.disabled = true;

    try {
        const response = await fetch(
            API + "/api/admin/sellers/" + id + "/approve",
            {
                method: "POST",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Approval failed.");
        }

        document.getElementById("message").textContent =
            "Seller approved successfully!";

        await loadSellers();

    } catch (error) {
        document.getElementById("message").textContent = error.message;
        button.disabled = false;
    }
}

function logout() {
    sessionStorage.clear();
    window.location.replace("index.html");
}
