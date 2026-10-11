if (sessionStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
}

const userId = sessionStorage.getItem("userId");
const ordersList = document.getElementById("ordersList");

function loadOrders() {

    if (!userId) {
        window.location.href = "index.html";
        return;
    }

fetch(`http://127.0.0.1:8080/api/orders/user/${userId}`, {
    credentials: "include"
})
.then(response=>{
            if (!response.ok) {
                throw new Error("Unable to load orders");
            }

            return response.json();
        })
        .then(orders => {

            ordersList.innerHTML = "";

            if (orders.length === 0) {

                ordersList.innerHTML = `
                    <div class="no-orders">
                        <div class="no-orders-icon">📦</div>

                        <h2>No orders yet</h2>

                        <p>
                            Your PriyaMart orders will appear here.
                        </p>

                        <button onclick="window.location.href='home.html'">
                            Start Shopping
                        </button>
                    </div>
                `;

                return;
            }

            orders
                .sort((a, b) => Number(b.id) - Number(a.id))
                .forEach(order => {

                    const card = document.createElement("div");
                    card.className = "order-card";

                    const status = order.status || "PLACED";

                    card.innerHTML = `
                        <div class="order-card-top">

                            <div>
                                <span class="order-label">ORDER ID</span>
                                <strong>#PM${order.id}</strong>
                            </div>

                            <span class="order-status ${status.toLowerCase()}">
                                ${formatStatus(status)}
                            </span>

                        </div>

                        <div class="order-info">

                            <div>
                                <span>Order Total</span>

                                <strong>
                                    ₹${Number(order.totalAmount || 0).toFixed(2)}
                                </strong>
                            </div>

                            <div>
                                <span>Order Status</span>
                                <strong>${formatStatus(status)}</strong>
                            </div>

                        </div>

                        <div class="order-progress">

                            ${createProgress(status)}

                        </div>
                        
${status === "CANCELLED" ? `
    <div class="order-cancel-reason">
        <strong>✕ Order Cancelled</strong>
        <p>
            ${order.cancellationReason
                ? `Reason: ${order.cancellationReason}`
                : "Cancellation reason not available"}
        </p>
    </div>
` : ""}


                        <div class="order-card-bottom">

                            <span>
                                Thank you for shopping with PriyaMart 💛
                            </span>
                             
${["PLACED", "CONFIRMED"].includes(status) ? `
    <button class="cancel-order-btn"
        onclick="cancelOrder(${order.id})">
        Cancel Order
    </button>
` : ""}

                            <button onclick="viewOrderItems(${order.id})">
                                View Order →
                            </button>

                        </div>

                        <div
                            class="order-items"
                            id="orderItems-${order.id}"
                        ></div>
                    `;

                    ordersList.appendChild(card);
                });
        })
        .catch(error => {

            console.error(error);

            ordersList.innerHTML = `
                <div class="orders-error">
                    <h3>Unable to load your orders</h3>
                    <p>Please make sure PriyaMart backend is running.</p>
                </div>
            `;
        });
}


function formatStatus(status) {

    return String(status)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, letter => letter.toUpperCase());
}


function createProgress(status) {

    const steps = [
        "PLACED",
        "CONFIRMED",
        "PACKED",
        "SHIPPED",
        "DELIVERED"
    ];

    if (status === "CANCELLED") {
        return `
            <div class="cancelled-order">
                ✕ Order Cancelled
            </div>
        `;
    }

    let currentIndex = steps.indexOf(status);

    if (currentIndex === -1) {
        currentIndex = 0;
    }

    return steps.map((step, index) => `

        <div class="progress-step
            ${index <= currentIndex ? "completed" : ""}">

            <div class="progress-circle">
                ${index < currentIndex ? "✓" : index + 1}
            </div>

            <span>${formatStatus(step)}</span>

        </div>

    `).join("");
}


function viewOrderItems(orderId) {

    const container =
        document.getElementById(`orderItems-${orderId}`);

    if (container.innerHTML !== "") {

        container.innerHTML = "";
        return;
    }

    container.innerHTML =
        `<p class="loading-items">Loading items...</p>`;

fetch(`http://127.0.0.1:8080/api/orders/${userId}/items`, {
    credentials: "include"
})        .then(response => {

            if (!response.ok) {
                throw new Error("Unable to load order items");
            }

            return response.json();
        })
        .then(items => {

            container.innerHTML = `
                <h4>Items in this order</h4>

                ${items.map(item => `


<div class="order-product">

    <img
        src="${getOrderProductImage(item.productName)}"
        alt="Product"
        class="order-product-image"
        onerror="this.onerror=null;this.src='images/grocery.jpg'"
    >

    <div>
        <strong>${item.productName}</strong>

                            <span>
                                ₹${Number(item.price).toFixed(2)}
                                × ${item.quantity}
                            </span>
                        </div>

                        <strong>
                            ₹${(
                                Number(item.price) *
                                Number(item.quantity)
                            ).toFixed(2)}
                        </strong>

                    </div>

                `).join("")}
            `;
        })
        .catch(error => {

            console.error(error);

            container.innerHTML =
                `<p>Unable to load order items.</p>`;
        });
}



function getOrderProductImage(productName) {
    const name = String(productName || "").toLowerCase();

    if (name.includes("rice")) return "images/rice.jpg";
    if (name.includes("milk")) return "images/milk.jpg";
    if (name.includes("biscuit")) return "images/biscuits.jpg";
    if (name.includes("chips")) return "images/chips.jpg";
    if (name.includes("cookie")) return "images/cookies.jpg";
    if (name.includes("shampoo")) return "images/shampoo.jpg";
    if (name.includes("soap")) return "images/soap.jpg";
    if (name.includes("juice")) return "images/orange-juice.jpg";

    return "images/grocery.jpg";
}

function loadOrderDeliveryAddress() {

    const addressBox = document.getElementById("orderDeliveryAddress");

    if (!addressBox || !userId) return;

    fetch(`http://127.0.0.1:8080/api/address/${userId}`, {
        credentials: "include"
    })
    .then(response => {
        if (response.status === 404) return null;
        if (!response.ok) throw new Error("Unable to load address");
        return response.json();
    })
    .then(address => {

        if (!address) {
            addressBox.textContent = "No delivery address saved.";
            return;
        }

        addressBox.textContent = [
            address.fullName,
            address.addressLine,
            address.city,
            address.state,
            address.pincode
        ].filter(Boolean).join(", ");
    })
    .catch(error => {
        console.error("Delivery address error:", error);
        addressBox.textContent = "Unable to load delivery address.";
    });
}



let selectedCancelOrderId = null;

function cancelOrder(orderId) {
    selectedCancelOrderId = orderId;

    document.getElementById("cancelReason").value = "";
    document.getElementById("cancelError").textContent = "";

    document.getElementById("cancelModal")
        .classList.add("active");
}

function closeCancelModal() {
    document.getElementById("cancelModal")
        .classList.remove("active");

    selectedCancelOrderId = null;
}

async function confirmCancelOrder() {
    const reason = document.getElementById("cancelReason").value;
    const errorBox = document.getElementById("cancelError");
    const button = document.querySelector(".confirm-cancel-btn");

    if (!reason) {
        errorBox.textContent = "Please select a cancellation reason.";
        return;
    }

    if (selectedCancelOrderId === null) return;

    errorBox.textContent = "";
    button.disabled = true;
    button.textContent = "Cancelling...";

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/orders/${selectedCancelOrderId}/cancel`,
            {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ reason: reason })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            errorBox.textContent =
                result.message || "Unable to cancel order.";
            return;
        }

        closeCancelModal();
        loadOrders();

    } catch (error) {
        console.error("Cancellation error:", error);
        errorBox.textContent =
            "Unable to cancel order. Please try again.";

    } finally {
        button.disabled = false;
        button.textContent = "Confirm Cancellation";
    }
}


loadOrders();

loadOrderDeliveryAddress();
