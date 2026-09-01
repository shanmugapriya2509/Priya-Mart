
if (sessionStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
}

let products = [];
let cart = [];
let budget = 0;



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
    })
    .catch(error => {

        console.error("Product loading error:", error);

        document.getElementById("productList").innerHTML =
            "<p>Unable to load products.</p>";
    });



function displayProducts(productArray) {

    const productList = document.getElementById("productList");

    productList.innerHTML = "";

    if (productArray.length === 0) {

        productList.innerHTML =
            "<p>No products found.</p>";

        return;
    }

    productArray.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card";
card.innerHTML = `
    <div class="product-image">
       <img src="images/${product.name.toLowerCase().replaceAll(" ", "-")}.jpg"
     alt="${product.name}">
    </div>

    <div class="product-details">
        <span class="product-category">${product.category}</span>

        <h3>${product.name}</h3>

        <p class="product-price">
            ₹${Number(product.price).toFixed(2)}
        </p>

        <button onclick="addToCart(${product.id})">
            Add to Cart
        </button>
    </div>
`;
        productList.appendChild(card);
    });
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
        total += Number(product.price);
    });


    if (budget > 0 && total > budget) {

        alert(
            "Your cart exceeds your shopping budget."
        );

        return;
    }


    alert("Order placed successfully!");

    cart = [];

    displayCart();
}


function logout() {

    sessionStorage.removeItem("loggedIn");

    sessionStorage.removeItem("username");

    window.location.href = "index.html";
}

displayCart();