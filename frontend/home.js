
if (sessionStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
}

let products = [];
let cart = [];
let budget = 0;
let wishlist = [];



const savedUsername = sessionStorage.getItem("username");

if (savedUsername) {
    document.getElementById("welcomeUser").textContent = savedUsername;
}


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

    // Seller/DB image available na first priority
    if (product.image && product.image.trim() !== "") {
        return product.image;
    }

    const name = (product.name || "").toLowerCase();
    const category = (product.category || "").toLowerCase();

    // FRUITS
    if (name.includes("apple")) return "images/apple.jpg";
    if (name.includes("banana")) return "images/banana.jpg";
    if (name.includes("orange")) return "images/orange.jpg";
    if (name.includes("grapes")) return "images/grapes.jpg";
    if (name.includes("watermelon")) return "images/watermelon.jpg";

    // VEGETABLES
    if (name.includes("tomato")) return "images/tomato.jpg";
    if (name.includes("potato")) return "images/potato.jpg";
    if (name.includes("onion")) return "images/onion.jpg";
    if (name.includes("carrot")) return "images/carrot.jpg";

    // SNACKS
    if (name.includes("potato chips")) return "images/potato-chips.jpg";
    if (name.includes("banana chips")) return "images/banana-chips.jpg";
    if (name.includes("murukku")) return "images/murukku.jpg";
    if (name.includes("nachos")) return "images/nachos.jpg";
    if (name.includes("mixture")) return "images/mixture.jpg";

    // DRINKS
    if (name.includes("orange juice")) return "images/orange-juice.jpg";
    if (name.includes("coffee")) return "images/coffee.jpg";
    if (name.includes("tea")) return "images/tea.jpg";

    // PERSONAL / HAIR
    if (name.includes("shampoo")) return "images/shampoo.jpg";
    if (name.includes("soap")) return "images/soap.jpg";
    if (name.includes("toothpaste")) return "images/toothpaste.jpg";

    // CATEGORY FALLBACK
    if (category.includes("rice")) return "images/rice.jpg";
    if (category.includes("dairy")) return "images/milk.jpg";
    if (category.includes("snack")) return "images/snacks.jpg";
    if (category.includes("beverage")) return "images/beverages.jpg";
    if (category.includes("biscuit")) return "images/biscuits.jpg";
    if (category.includes("personal")) return "images/personal-care.jpg";
    if (category.includes("hair")) return "images/shampoo.jpg";
    if (category.includes("home") || category.includes("laundry"))
        return "images/household.jpg";

    return "images/grocery.jpg";
}

function displayProducts(productArray) {

    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    if (productArray.length === 0) {
        productList.innerHTML = "<p>No products found.</p>";
        return;
    }

    productArray.forEach(product => {

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
                    onerror="this.onerror=null; this.src='images/product-placeholder.jpg';"
                    alt="${product.name}"
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

                <div class="product-rating">
                    <span>★ 4.5</span>
                    <small>PriyaMart Choice</small>
                </div>

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

function changeProductQuantity(productId, change) {

    const item = cart.find(product => product.id === productId);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(product => product.id !== productId);
    }

    checkBudget(total);

    displayProducts(products);
}

function addToCart(id) {
    const product = products.find(product => product.id === id);

    if (!product) {
        return;
    }

    const existingItem = cart.find(
        item => item.id === id
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    displayCart();
}
function displayCart() {
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

    displayCart();
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
document
    .getElementById("searchProduct")
    .addEventListener("input", function () {

        const search =
            this.value.toLowerCase().trim();


        const filteredProducts =
            products.filter(product => {

                const name =
                    product.name
                        ? product.name.toLowerCase()
                        : "";

                const category =
                    product.category
                        ? product.category.toLowerCase()
                        : "";

                return (
                    name.includes(search) ||
                    category.includes(search)
                );
            });


        displayProducts(filteredProducts);


        const resultText =
            document.getElementById("productResultText");

        if (search === "") {

            resultText.textContent =
                "Our everyday picks";

        } else {

            resultText.textContent =
                `${filteredProducts.length} product(s) found`;
        }
    });


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

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let total = 0;

    cart.forEach(product => {
        total += Number(product.price) * product.quantity;
    });

    if (budget > 0 && total > budget) {
        alert("Your cart exceeds your shopping budget.");
        return;
    }

    const userId = sessionStorage.getItem("userId");

    if (!userId) {
        window.location.href = "index.html";
        return;
    }

    const orderData = {
        userId: Number(userId),

        items: cart.map(product => ({
            productId: product.id,
            productName: product.name,
            price: Number(product.price),
            quantity: product.quantity
        }))
    };

    fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {

        if (!response.ok) {
            throw new Error("Unable to place order");
        }

        return response.json();
    })
    .then(order => {

        alert(
            "Order placed successfully! Order ID: " +
            order.id
        );

        cart = [];

        displayCart();
    })
    .catch(error => {

        console.error("Checkout error:", error);

        alert("Unable to place order. Please try again.");
    });
}

function logout() {

    sessionStorage.removeItem("loggedIn");

    sessionStorage.removeItem("username");

    window.location.href = "index.html";
}

displayCart();