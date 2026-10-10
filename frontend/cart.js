const CART_KEY = "priyamart_cart_" +
    (sessionStorage.getItem("userId") || "guest");

let cart = JSON.parse(
    localStorage.getItem(
        "priyamart_cart_" + (sessionStorage.getItem("userId") || "guest")
    ) || "[]"
);

try {
    cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
} catch (error) {
    cart = [];
}

let budget = Number(localStorage.getItem("priyamart_budget") || 0);

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function displayCart() {
    const container = document.getElementById("cartItems");
    const totalElement = document.getElementById("cartTotal");

    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <h3>🛒 Your cart is empty</h3>
                <p>Add products to start shopping.</p>
                <button onclick="location.href='home.html'">
                    Shop Now
                </button>
            </div>
        `;
        totalElement.textContent = "0.00";
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        const price = Number(item.price);
        const quantity = Number(item.quantity);
        const subtotal = price * quantity;

        total += subtotal;

        return `
            <div class="cart-item">
                <div>
                    <h3>${item.name}</h3>
                    <p>₹${price.toFixed(2)} each</p>
                </div>

                <div class="quantity-control">
                    <button onclick="changeQuantity(${index}, -1)">−</button>
                    <span>${quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>

                <strong>₹${subtotal.toFixed(2)}</strong>

                <button class="remove-btn"
                    onclick="removeFromCart(${index})">
                    Remove
                </button>
            </div>
        `;
    }).join("");

    totalElement.textContent = total.toFixed(2);
}

function changeQuantity(index, change) {
    if (!cart[index]) return;

    const item = cart[index];
    const nextQuantity = Number(item.quantity) + change;

    if (change > 0 &&
        item.stock != null &&
        nextQuantity > Number(item.stock)) {
        alert("Only " + item.stock + " items available.");
        return;
    }

    if (nextQuantity <= 0) {
        cart.splice(index, 1);
    } else {
        item.quantity = nextQuantity;
    }

    saveCart();
    displayCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    displayCart();
}

function checkout() {
    if (sessionStorage.getItem("role") !== "BUYER" ||
        sessionStorage.getItem("loggedIn") !== "true") {
        alert("Please login as a customer to checkout.");
        location.href = "index.html";
        return;
    }

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
    );

    if (budget > 0 && total > budget) {
        alert("Your cart exceeds your shopping budget!");
        return;
    }

    document.getElementById("checkoutSection").style.display = "block";
    document.getElementById("checkoutSection")
        .scrollIntoView({ behavior: "smooth" });

    loadCheckoutAddress();
}

async function loadCheckoutAddress() {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/address/${userId}`,
            { credentials: "include" }
        );

        if (!response.ok) return;

        const address = await response.json();

        const fields = {
            deliveryName: address.fullName,
            deliveryPhone: address.phone,
            deliveryAddress: address.addressLine,
            deliveryCity: address.city,
            deliveryState: address.state,
            deliveryPincode: address.pincode
        };

        for (const [id, value] of Object.entries(fields)) {
            document.getElementById(id).value = value || "";
        }
    } catch (error) {
        console.error("Address loading failed:", error);
    }
}

async function confirmOrder(event) {
    event.preventDefault();

    const userId = Number(sessionStorage.getItem("userId"));
    if (!userId || cart.length === 0) {
        alert("Please login and add products.");
        return;
    }

    const addressData = {
        fullName: document.getElementById("deliveryName").value.trim(),
        phone: document.getElementById("deliveryPhone").value.trim(),
        addressLine: document.getElementById("deliveryAddress").value.trim(),
        city: document.getElementById("deliveryCity").value.trim(),
        state: document.getElementById("deliveryState").value.trim(),
        pincode: document.getElementById("deliveryPincode").value.trim()
    };

    if (Object.values(addressData).some(value => !value)) {
        alert("Fill all delivery details.");
        return;
    }

    if (!/^[0-9]{10}$/.test(addressData.phone) ||
        !/^[0-9]{6}$/.test(addressData.pincode)) {
        alert("Enter valid phone number and pincode.");
        return;
    }

    const button = document.querySelector(
        "#checkoutForm button[type='submit']"
    );

    button.disabled = true;
    button.textContent = "Placing Order...";

    try {
        const addressResponse = await fetch(
            `http://127.0.0.1:8080/api/address/${userId}`,
            {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addressData)
            }
        );

        if (!addressResponse.ok) {
            throw new Error("Unable to save delivery address.");
        }

        const savedAddress = await addressResponse.json();

        const orderData = {
            userId,
            addressId: savedAddress.id,
            paymentMethod: "COD",
            items: cart.map(item => ({
                productId: item.id,
                productName: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity)
            }))
        };

        const orderResponse = await fetch(
            "http://127.0.0.1:8080/api/orders",
            {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            }
        );

        if (!orderResponse.ok) {
            throw new Error("Unable to place order.");
        }

        const order = await orderResponse.json();

        cart = [];
        saveCart();
        displayCart();

        alert(
            "🎉 Order Confirmed!\n" +
            "Order ID: PM-" + order.id + "\n" +
            "Total: ₹" + Number(order.totalAmount).toFixed(2) +
            "\nPayment: Cash on Delivery"
        );

        location.href = "orders.html";

    } catch (error) {
        alert(error.message);
    } finally {
        button.disabled = false;
        button.textContent = "Confirm Order";
    }
}

displayCart();
