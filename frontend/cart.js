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
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 1);
        const subtotal = price * quantity;

        total += subtotal;

        // Reuse product images already available in PriyaMart
        const name = String(item.name || "").toLowerCase();
        const category = String(item.category || "").toLowerCase();

        let image = "images/grocery.jpg";

        if (name.includes("rice") || category.includes("rice")) {
            image = "images/rice.jpg";
        } else if (name.includes("milk")) {
            image = "images/milk.jpg";
        } else if (name.includes("biscuit")) {
            image = "images/biscuits.jpg";
        } else if (name.includes("chip")) {
            image = "images/chips.jpg";
        } else if (name.includes("cookie")) {
            image = "images/cookies.jpg";
        } else if (name.includes("shampoo")) {
            image = "images/shampoo.jpg";
        } else if (name.includes("soap")) {
            image = "images/soap.jpg";
        } else if (name.includes("juice")) {
            image = "images/orange-juice.jpg";
        }

        return `
            <div class="cart-item">

                <div class="cart-product-info">
                    <img
                        src="${image}"
                        alt="Product"
                        class="cart-product-image"
                        onerror="this.onerror=null;this.src='images/grocery.jpg'"
                    >

                    <div class="cart-product-text">
                        <h3>${item.name}</h3>
                        <p>${item.brand || "PriyaMart"} ${item.unit ? "• " + item.unit : ""}</p>
                        <span>₹${price.toFixed(2)} each</span>
                    </div>
                </div>

                <div class="quantity-control">
                    <button onclick="changeQuantity(${index}, -1)">−</button>
                    <span>${quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>

                <strong class="cart-item-price">
                    ₹${subtotal.toFixed(2)}
                </strong>

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

const orderId = "PM-" + order.id;

const total = orderData.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
);

showOrderSuccess(orderId, total, "Cash on Delivery");

    } catch (error) {
        alert(error.message);
    } finally {
        button.disabled = false;
        button.textContent = "Confirm Order";
    }
}

displayCart();

function playOrderSuccessSound() {
    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        const audio = new AudioContextClass();

        if (audio.state === "suspended") {
            audio.resume();
        }

        const notes = [523.25, 659.25, 783.99, 1046.5];

        notes.forEach((frequency, index) => {
            const oscillator = audio.createOscillator();
            const gain = audio.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = frequency;

            oscillator.connect(gain);
            gain.connect(audio.destination);

            const start = audio.currentTime + index * 0.13;

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);

            oscillator.start(start);
            oscillator.stop(start + 0.31);
        });

        setTimeout(() => audio.close(), 1200);
    } catch (error) {
        console.log("Sound unavailable:", error);
    }
}

function showOrderSuccess(orderId, total, payment) {
    document.getElementById("successOrderId").textContent = orderId;
    document.getElementById("successTotal").textContent =
        "₹" + Number(total).toFixed(2);
    document.getElementById("successPayment").textContent = payment;

    document.getElementById("orderSuccessScreen")
        .classList.add("show");

    playOrderSuccessSound();
}

