

const isGuest = sessionStorage.getItem("role") === "GUEST";
const isCustomer =
    sessionStorage.getItem("loggedIn") === "true" &&
    sessionStorage.getItem("role") === "BUYER";

if (!isGuest && !isCustomer) {
    window.location.replace("index.html");
}


let products = [];
let cart = JSON.parse(
    localStorage.getItem(
        "priyamart_cart_" + (sessionStorage.getItem("userId") || "guest")
    ) || "[]"
);
let budget = 0;
let wishlist = [];



const savedUsername = sessionStorage.getItem("username");


document.getElementById("welcomeUser").textContent =
    isGuest ? "Guest" : (savedUsername || "Customer");



fetch("http://localhost:8080/products")
    .then(response => {

        if (!response.ok) {
            throw new Error("Unable to load products");
        }

        return response.json();
    })
    .then(data => {

        products = data;

        displayProducts(products);

        loadWishlist();
    })
    .catch(error => {

        console.error("Product loading error:", error);

        document.getElementById("productList").innerHTML =
            "<p>Unable to load products.</p>";
    });
    function loadWishlist() {

    const userId = sessionStorage.getItem("userId");

    if (!userId) return;

    fetch(`http://localhost:8080/api/wishlist/${userId}`)
        .then(response => response.json())
        .then(data => {

            wishlist = data.map(item => item.productId);

            displayProducts(products);
        })
        .catch(error =>
            console.error("Wishlist loading error:", error)
        );
}


function toggleWishlist(productId) {

    if (isGuest) {
        alert("Please register or log in to use your wishlist.");
        return;
    }

    const userId = sessionStorage.getItem("userId");

    if (!userId) {
        window.location.href = "index.html";
        return;
    }


    const alreadyAdded = wishlist.includes(productId);

    fetch(
        `http://localhost:8080/api/wishlist/${userId}/${productId}`,
        {
            method: alreadyAdded ? "DELETE" : "POST"
        }
    )
    .then(response => {

        if (!response.ok) {
            throw new Error("Wishlist update failed");
        }

        if (alreadyAdded) {
            wishlist = wishlist.filter(id => id !== productId);
        } else {
            wishlist.push(productId);
        }

        displayProducts(products);
    })
    .catch(error =>
        console.error("Wishlist error:", error)
    );
}



function getProductImage(product) {
    const name = (product.name || "").toLowerCase();
    const category = (product.category || "").toLowerCase();

    // Use existing product image if it is one of our files
    const available = [
        "biscuits.jpg", "chips.jpg", "cookies.jpg",
        "dish-wash.jpg", "floor-cleaner.jpg",
        "grocery.jpg", "household.jpg", "milk.jpg",
        "orange-juice.jpg", "personal-care.jpg",
        "rice.jpg", "shampoo.jpg", "snacks.jpg",
        "soap.jpg", "soft-drink.jpg"
    ];
    

    if (typeof product.image === "string") {
        const image = product.image.trim();
        const filename = image.split("/").pop();

        if (available.includes(filename)) {
            return "images/" + filename;
        }
    }

    // Match products to existing images
    if (name.includes("rice") || category.includes("rice"))
        return "images/rice.jpg";

    if (name.includes("milk") || category.includes("dairy"))
        return "images/milk.jpg";

    if (name.includes("biscuit"))
        return "images/biscuits.jpg";

    if (name.includes("cookie"))
        return "images/cookies.jpg";

    if (name.includes("chips"))
        return "images/chips.jpg";

    if (name.includes("juice"))
        return "images/orange-juice.jpg";

    if (name.includes("shampoo"))
        return "images/shampoo.jpg";

    if (name.includes("soap"))
        return "images/soap.jpg";

    if (name.includes("dish wash"))
        return "images/dish-wash.jpg";

    if (name.includes("floor cleaner"))
        return "images/floor-cleaner.jpg";

    if (name.includes("soft drink") || name.includes("cola"))
        return "images/soft-drink.jpg";

    if (category.includes("snack"))
        return "images/snacks.jpg";

    if (category.includes("personal"))
        return "images/personal-care.jpg";

    if (category.includes("home") || category.includes("laundry"))
        return "images/household.jpg";

    return "images/grocery.jpg";
}


function displayProducts(productArray) {

    const productList = document.getElementById("productList");
    productList.innerHTML = "";
     

    document.querySelectorAll("[id^='rating-']").forEach(box => {
    const productId = Number(box.id.replace("rating-", ""));
    loadProductRating(productId);
});
    if (productArray.length === 0) {
        productList.innerHTML = "<p>No products found.</p>";
        return;
    }

    productArray.forEach(product => {
        productDetailsMap.set(String(product.id), product);

        const card = document.createElement("div");
        card.className = "product-card";

        const price = Number(product.price || 0);
        const originalPrice = Number(product.originalPrice || 0);
        const discount = Number(product.discount || 0);
        const stock = Number(product.stock || 0);

        const imagePath = getProductImage(product);

        const cartItem = cart.find(item => item.id === product.id);
        const quantity = cartItem ? cartItem.quantity : 0;

        card.innerHTML = `
            <div class="product-image">

                ${discount > 0
                    ? `<span class="discount-badge">${discount}% OFF</span>`
                    : ""
                }

                <button
                    class="wishlist-btn ${wishlist.includes(product.id) ? "active" : ""}"
                    onclick="toggleWishlist(${product.id})"
                    title="Wishlist"
                >
                    ${wishlist.includes(product.id) ? "♥" : "♡"}
                </button>

                <img
                    src="${imagePath}"
                    onerror="this.onerror=null; this.src='images/grocery.jpg';"
                    alt="${product.name}"
                    onclick="openProductDetails(${product.id})"
                >

            </div>

            <div class="product-details">

                <span class="product-category">
                    ${product.category || "Grocery"}
                </span>

                <h3>${product.name}</h3>

                <p class="product-meta">
                    ${product.brand || "PriyaMart"}
                    ${product.unit ? ` • ${product.unit}` : ""}
                </p>
<div class="product-rating" id="rating-${product.id}">
    <span>☆ New</span>
    <small>No reviews yet</small>
</div>
                
            <button class="review-btn"
               onclick='openReviewPopup(${product.id}, ${JSON.stringify(product.name)})'>
                 ⭐ Write Review
         </button>


                <div class="price-section">

                    <span class="product-price">
                        ₹${price.toFixed(2)}
                    </span>

                    ${originalPrice > price
                        ? `
                            <span class="original-price">
                                ₹${originalPrice.toFixed(2)}
                            </span>
                          `
                        : ""
                    }

                </div>

                <p class="${stock > 0 ? "in-stock" : "out-stock"}">
                    ${stock > 0 ? "● In Stock" : "● Out of Stock"}
                </p>

                ${
                    stock <= 0
                    ? `
                        <button class="add-cart-btn" disabled>
                            Out of Stock
                        </button>
                      `
                    : quantity === 0
                    ? `
                        <button
                            class="add-cart-btn"
                            onclick="addToCart(${product.id})"
                        >
                            🛒 Add to Cart
                        </button>
                      `
                    : `
                        <div class="card-quantity">

                            <button onclick="changeProductQuantity(${product.id}, -1)">
                                −
                            </button>

                            <strong>${quantity}</strong>

                            <button onclick="changeProductQuantity(${product.id}, 1)">
                                +
                            </button>

                        </div>
                      `
                }

            </div>
        `;

        productList.appendChild(card);
    });
}

function addToCart(productId) {

    const product = products.find(
        p => Number(p.id) === Number(productId)
    );

    if (!product) {
        console.error("Product not found:", productId);
        return;
    }

    const existingItem = cart.find(
        item => Number(item.id) === Number(productId)
    );

    if (existingItem) {

        if (product.stock != null &&
            Number(existingItem.quantity) >= Number(product.stock)) {
            alert("Only " + product.stock + " items available.");
            return;
        }

        existingItem.quantity += 1;

    } else {

        if (product.stock != null && Number(product.stock) <= 0) {
            alert("This product is out of stock.");
            return;
        }

        cart.push({
            ...product,
            quantity: 1
        });
    }

    localStorage.setItem(
        "priyamart_cart",
        JSON.stringify(cart)
    );

    displayCart();
}


function changeProductQuantity(productId, change) {

    const item = cart.find(
        product => product.id === productId
    );

    if (!item) return;

    const newQuantity = Number(item.quantity) + change;

    if (change > 0 &&
        item.stock != null &&
        newQuantity > Number(item.stock)) {
        alert("Only " + item.stock + " items available.");
        return;
    }

    if (newQuantity <= 0) {
        cart = cart.filter(
            product => product.id !== productId
        );
    } else {
        item.quantity = newQuantity;
    }

    const total = cart.reduce(
        (sum, product) =>
            sum + Number(product.price) * Number(product.quantity),
        0
    );

    localStorage.setItem("priyamart_cart", JSON.stringify(cart));

    displayCart();
    checkBudget(total);
    displayProducts(products);
}

function displayCart() {
    localStorage.setItem(
    "priyamart_cart_" + (sessionStorage.getItem("userId") || "guest"),
    JSON.stringify(cart)
);
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    cartItems.innerHTML = "";

    let total = 0;
    let totalQuantity = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>
                    Add products you love and
                    they will appear here.
                </p>
            </div>
        `;
    }

    cart.forEach((product, index) => {

        const itemTotal =
            Number(product.price) * product.quantity;

        total += itemTotal;
        totalQuantity += product.quantity;

        const item = document.createElement("div");
        item.className = "cart-item";

        item.innerHTML = `
            <div>
                <strong>${product.name}</strong>

                <p>
                    ₹${Number(product.price).toFixed(2)}
                    × ${product.quantity}
                </p>
            </div>

            <div class="quantity-control">

                <button onclick="decreaseQuantity(${index})">
                    −
                </button>

                <span>${product.quantity}</span>

                <button onclick="increaseQuantity(${index})">
                    +
                </button>

            </div>

            <strong>
                ₹${itemTotal.toFixed(2)}
            </strong>

            <button
                class="remove-btn"
                onclick="removeFromCart(${index})"
            >
                Remove
            </button>
        `;

        cartItems.appendChild(item);
    });

    cartTotal.textContent = total.toFixed(2);

    document.getElementById("cartCount")
        .textContent = totalQuantity;

    document.getElementById("budgetCartTotal")
        .textContent = total.toFixed(2);

    checkBudget(total);
    displayProducts(products);
}
function increaseQuantity(index) {
    cart[index].quantity++;
    displayCart();
}

function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1);
    }

    displayCart();
}

function removeFromCart(index) {

    cart.splice(index, 1);

    displayCart();
}
function setBudget() {

    const input =
        document.getElementById("budget");

    const message =
        document.getElementById("budgetMessage");

    budget = Number(input.value);


    if (budget <= 0) {

        message.textContent =
            "Please enter a valid budget.";

        message.style.color = "#ff7676";

        return;
    }


    message.textContent =
        `Budget set successfully: ₹${budget.toFixed(2)}`;

    message.style.color = "#7ee787";


    displayCart();
}



function checkBudget(total) {

    const status =
        document.getElementById("budgetStatus");

    const remainingElement =
        document.getElementById("remainingBudget");


    if (budget <= 0) {

        status.textContent = "";

        remainingElement.textContent = "—";

        return;
    }


    const remaining =
        budget - total;


    if (remaining >= 0) {

        remainingElement.textContent =
            `₹${remaining.toFixed(2)}`;

        remainingElement.style.color =
            "#7ee787";

        status.textContent =
            "✓ You are shopping within your budget.";

        status.style.color =
            "#7ee787";

    } else {

        remainingElement.textContent =
            `-₹${Math.abs(remaining).toFixed(2)}`;

        remainingElement.style.color =
            "#ff7676";

        status.textContent =
            `Budget exceeded by ₹${Math.abs(remaining).toFixed(2)}`;

        status.style.color =
            "#ff7676";
    }
}

const searchInput = document.getElementById("searchProduct");

if (searchInput) {
    searchInput.addEventListener("input", function () {

        const search = this.value.toLowerCase().trim();

        const filteredProducts = products.filter(product => {
            const name = (product.name || "").toLowerCase();
            const category = (product.category || "").toLowerCase();

            return name.includes(search) || category.includes(search);
        });

        displayProducts(filteredProducts);
    });
}

function filterCategory(category) {

    const filteredProducts =
        products.filter(product =>
            product.category &&
            product.category.toLowerCase() ===
            category.toLowerCase()
        );


    displayProducts(filteredProducts);


    document.getElementById("productResultText")
        .textContent = category;


    document.getElementById("products")
        .scrollIntoView({
            behavior: "smooth"
        });
}




function scrollToProducts() {

    document.getElementById("products")
        .scrollIntoView({
            behavior: "smooth"
        });
}


function checkout() {
    const role = sessionStorage.getItem("role");

    if (role === "GUEST" || role !== "BUYER") {
        alert("Please login as a customer to checkout.");
        window.location.href = "login.html";
        return;
    }

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const total = cart.reduce(
        (sum, product) => sum + Number(product.price) * product.quantity,
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

        document.getElementById("deliveryName").value = address.fullName || "";
        document.getElementById("deliveryPhone").value = address.phone || "";
        document.getElementById("deliveryAddress").value = address.addressLine || "";
        document.getElementById("deliveryCity").value = address.city || "";
        document.getElementById("deliveryState").value = address.state || "";
        document.getElementById("deliveryPincode").value = address.pincode || "";

    } catch (error) {
        console.error("Unable to load address:", error);
    }
}

async function confirmOrder(event) {
    event.preventDefault();

    const userId = Number(sessionStorage.getItem("userId"));
    const button = document.querySelector("#checkoutForm button[type='submit']");

    if (!userId || cart.length === 0) {
        alert("Please login and add products to your cart.");
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
        alert("Please fill all delivery address fields.");
        return;
    }

    if (!/^[0-9]{10}$/.test(addressData.phone) ||
        !/^[0-9]{6}$/.test(addressData.pincode)) {
        alert("Enter a valid phone number and pincode.");
        return;
    }

    const total = cart.reduce(
        (sum, product) => sum + Number(product.price) * product.quantity,
        0
    );

    if (budget > 0 && total > budget) {
        alert("Your cart exceeds your shopping budget!");
        return;
    }

    button.disabled = true;
    button.textContent = "Placing Order...";

    try {
        // First save the delivery address
        const addressResponse = await fetch(
            `http://127.0.0.1:8080/api/address/${userId}`,
            {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addressData)
            }
        );

        const savedAddress = await addressResponse.json();

        if (!addressResponse.ok) {
            throw new Error(savedAddress.message || "Could not save address.");
        }

        // Then place the order using the saved address ID
        const orderData = {
            userId: userId,
            addressId: savedAddress.id,
            paymentMethod: "COD",
            items: cart.map(product => ({
                productId: product.id,
                productName: product.name,
                price: Number(product.price),
                quantity: product.quantity
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

        const order = await orderResponse.json();

        if (!orderResponse.ok) {
            throw new Error(order.message || "Order failed.");
        }

showOrderSuccess(order.id, order.totalAmount);
        cart = [];
        displayCart();

        document.getElementById("checkoutSection").style.display = "none";

    } catch (error) {
        alert(error.message);
    } finally {
        button.disabled = false;
        button.textContent = "Confirm Order";
    }
}

function logout() {

    sessionStorage.removeItem("loggedIn");

    sessionStorage.removeItem("username");

    window.location.href = "index.html";
}

displayCart();
function searchProducts() {
    const search = document.getElementById("searchProduct")
        .value.toLowerCase().trim();

    const results = products.filter(product =>
        (product.name || "").toLowerCase().includes(search) ||
        (product.category || "").toLowerCase().includes(search)
    );

    displayProducts(results);

    document.getElementById("products").scrollIntoView({
        behavior: "smooth"
    });
}


function showOrderSuccess(orderId, totalAmount) {
    document.getElementById("successOrderId").textContent =
        "#PM-" + String(orderId).padStart(4, "0");

    document.getElementById("successOrderTotal").textContent =
        "₹" + Number(totalAmount).toFixed(2);

    document.getElementById("orderSuccessModal")
        .classList.add("show");

    playOrderSuccessSound();
}

function closeOrderSuccess() {
    document.getElementById("orderSuccessModal")
        .classList.remove("show");
}

function playOrderSuccessSound() {
    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        const audio = new AudioContextClass();

        if (audio.state === "suspended") {
            audio.resume();
        }

        const notes = [
            { frequency: 523.25, start: 0, duration: 0.15 },
            { frequency: 659.25, start: 0.16, duration: 0.15 },
            { frequency: 783.99, start: 0.32, duration: 0.28 }
        ];

        notes.forEach(note => {
            const oscillator = audio.createOscillator();
            const gain = audio.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = note.frequency;

            gain.gain.setValueAtTime(
                0.0001,
                audio.currentTime + note.start
            );

            gain.gain.exponentialRampToValueAtTime(
                0.12,
                audio.currentTime + note.start + 0.02
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                audio.currentTime + note.start + note.duration
            );

            oscillator.connect(gain);
            gain.connect(audio.destination);

            oscillator.start(audio.currentTime + note.start);
            oscillator.stop(
                audio.currentTime + note.start + note.duration
            );
        });

        setTimeout(() => audio.close(), 1200);

    } catch (error) {
        console.log("Success sound unavailable:", error);
    }

    
/* Save cart so cart.html can access it */

const PRIYAMART_CART_KEY = "priyamart_cart_" +
    (sessionStorage.getItem("userId") || "guest");

const savedPriyaMartCart =
    localStorage.getItem(PRIYAMART_CART_KEY);

if (savedPriyaMartCart) {
    try {
        cart = JSON.parse(savedPriyaMartCart);
        displayCart();
    } catch (error) {
        console.error("Unable to restore cart:", error);
    }
}

function savePriyaMartCart() {
    localStorage.setItem(
        PRIYAMART_CART_KEY,
        JSON.stringify(cart)
    );
}

/* Save whenever cart changes */
const originalDisplayCart = displayCart;

displayCart = function () {
    savePriyaMartCart();
    originalDisplayCart();
};

/* Fix quantity updates */
changeProductQuantity = function (productId, change) {
    const item = cart.find(product => product.id === productId);
    if (!item) return;

    const nextQuantity = item.quantity + change;

    if (change > 0 &&
        item.stock != null &&
        nextQuantity > Number(item.stock)) {
        alert("Maximum available stock reached.");
        return;
    }

    if (nextQuantity <= 0) {
        cart = cart.filter(product => product.id !== productId);
    } else {
        item.quantity = nextQuantity;
    }

    displayCart();
};

}


let selectedReviewProductId = null;

async function openReviewPopup(productId, productName) {
    selectedReviewProductId = productId;

    document.getElementById("reviewProductName").textContent = productName;
    document.getElementById("reviewComment").value = "";

    document.getElementById("reviewPopup").style.display = "flex";

    await loadProductReviews(productId);
}

function closeReviewPopup() {


    document.getElementById("reviewPopup").style.display = "none";
}

async function loadProductReviews(productId) {
    const reviewList = document.getElementById("reviewList");
    reviewList.textContent = "Loading reviews...";

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/reviews/${productId}`,
            { credentials: "include" }
        );

        if (!response.ok) throw new Error("Failed to load reviews");

        const reviews = await response.json();
        reviewList.replaceChildren();

        if (reviews.length === 0) {
            reviewList.textContent = "No reviews yet.";
            return;
        }

        reviews.forEach(review => {
            const item = document.createElement("p");
            item.textContent =
                `${"⭐".repeat(review.rating)} — ${review.comment}`;
            reviewList.appendChild(item);
        });

    } catch (error) {
        reviewList.textContent = "Unable to load reviews.";
    }
}

async function submitReview() {
    if (selectedReviewProductId === null) return;

    const rating = Number(
        document.getElementById("reviewRating").value
    );

    const comment = document
        .getElementById("reviewComment")
        .value.trim();

    if (!comment) {
        alert("Please write your review!");
        return;
    }

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/reviews/${selectedReviewProductId}`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ rating, comment })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            alert(error.message || "Unable to submit review");
            return;
        }

        alert("Review submitted successfully! ⭐");
        document.getElementById("reviewComment").value = "";

        await loadProductReviews(selectedReviewProductId);

    } catch (error) {
        alert("Cannot connect to the backend.");
    }
}

async function loadProductRating(productId) {
    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/reviews/${productId}/summary`
        );

        if (!response.ok) return;

        const data = await response.json();
        const box = document.getElementById(`rating-${productId}`);

        if (!box) return;

        if (data.count === 0) {
            box.textContent = "☆ No reviews yet";
        } else {
            box.textContent =
                `⭐ ${data.average.toFixed(1)} (${data.count} reviews)`;
        }
    } catch (error) {
        console.error("Rating loading failed:", error);
    }
}
const productDetailsMap = new Map();
let selectedProduct = null;
let currentImageIndex = 0;
let productImages = [];

function openProductDetails(productId) {
      selectedProduct = productDetailsMap.get(String(productId));

    if (!selectedProduct) {
        alert("Product not found");
        return;
    }
   const p = selectedProduct;

const mainImage = getProductImage(p);

// Convert backend image path to full URL
function getFullImageUrl(url) {
    if (!url) return "";

    if (url.startsWith("http")) {
        return url;
    }

    if (url.startsWith("/uploads/")) {
        return "http://127.0.0.1:8080" + url;
    }

    return url;
}

// Get all uploaded images
if (Array.isArray(p.images) && p.images.length > 0) {

    productImages = p.images
        .map(getFullImageUrl)
        .filter(Boolean);

} else {

    productImages = [mainImage];

}
    currentImageIndex = 0;

    document.getElementById("detailProductImage").src =
        productImages[0];

    document.getElementById("detailProductName").textContent =
        p.name || "Product";

    document.getElementById("detailProductCategory").textContent =
        p.category || "";

    document.getElementById("detailProductPrice").textContent =
        "₹" + p.price;

    document.getElementById("detailProductStock").textContent =
        p.stock > 0 ? "In Stock" : "Out of Stock";

    document.getElementById("detailProductDescription").textContent =
        p.description || "";

    document.getElementById("detailProductRating").textContent =
        "⭐ Customer Reviews";

        document.getElementById("detailAddToCart").onclick = function () {
    addToCart(p.id);
    closeProductDetails();
};

    document.getElementById("productDetailsPopup").style.display =
        "flex";
}

function closeProductDetails() {
    document.getElementById("productDetailsPopup").style.display =
        "none";
}

function changeProductImage(direction) {
    if (productImages.length === 0) return;

    currentImageIndex =
        (currentImageIndex + direction + productImages.length)
        % productImages.length;

    document.getElementById("detailProductImage").src =
        productImages[currentImageIndex];
}

async function loadDeliveryLocation() {
    const userId = sessionStorage.getItem("userId");
    const locationElement = document.getElementById("deliveryLocation");

    if (!locationElement || !userId) return;

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/address/${userId}`,
            { credentials: "include" }
        );

        if (!response.ok) return;

        const address = await response.json();

        if (address && address.city && address.pincode) {
            locationElement.textContent =
                `${address.city}, ${address.pincode}`;
        }
    } catch (error) {
        console.error("Delivery location error:", error);
    }
}

loadDeliveryLocation();


