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

    fetch(`http://localhost:8080/api/orders/user/${userId}`)
        .then(response => {

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

                        <div class="order-card-bottom">

                            <span>
                                Thank you for shopping with PriyaMart 💛
                            </span>

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

    fetch(`http://localhost:8080/api/orders/${orderId}/items`)
        .then(response => {

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


loadOrders();