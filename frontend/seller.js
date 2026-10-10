const loggedIn = sessionStorage.getItem("loggedIn");
const currentRole =
    (sessionStorage.getItem("role") || "").toUpperCase();

if (loggedIn !== "true" || currentRole !== "SELLER") {
    window.location.href = "index.html";
}

const API_URL = "http://127.0.0.1:8080/products";
const SELLER_API_URL = "http://127.0.0.1:8080/api/seller/products";
let editingProductId = null;

document.addEventListener("DOMContentLoaded", function () {
    loadSellerProducts();
});

function loadSellerProducts() {

    const productList =
        document.getElementById("sellerProductList");

    const status =
        document.getElementById("sellerStatus");

    status.textContent = "Loading products...";

     fetch(SELLER_API_URL, {
     credentials: "include"
     })

        .then(response => {

            if (!response.ok) {
                throw new Error("Unable to load products");
            }

            return response.json();
        })

        .then(products => {

            status.textContent = "";

            document.getElementById(
                "sellerProductCount"
            ).textContent = products.length;

            const inStock = products.filter(
                product => Number(product.stock) > 0
            ).length;

            document.getElementById(
                "inStockCount"
            ).textContent = inStock;

            const outOfStock = products.filter(
                product => Number(product.stock || 0) <= 0
            ).length;

            document.getElementById(
                "outOfStockCount"
            ).textContent = outOfStock;


            displaySellerProducts(products);
        })

        .catch(error => {

            console.error(error);

            status.textContent = "";

            productList.innerHTML =
                '<p class="seller-error">Unable to load products.</p>';
        });
}

function displaySellerProducts(products) {

    const productList =
        document.getElementById("sellerProductList");

    if (products.length === 0) {

        productList.innerHTML =
            "<p>No products available.</p>";

        return;
    }

    productList.innerHTML = "";

    products.forEach(product => {

        const item = document.createElement("div");

        item.className = "seller-product-item";

        item.innerHTML = `

            <div>
                <strong>${product.name}</strong>
                <p>${product.category || ""}</p>
            </div>

            <span>
                ₹${Number(product.price).toFixed(2)}
            </span>

            <span>
                Stock: ${product.stock ?? 0}
            </span>

            <button
                class="seller-edit-btn"
                onclick="editProduct(${product.id})">
                Edit
            </button>

            <button
                class="seller-delete-btn"
                onclick="deleteProduct(${product.id})">
                Delete
            </button>
        `;

        productList.appendChild(item);
    });
}


function showProductForm() {

    const form =
        document.getElementById("productFormSection");

    form.classList.toggle("show");
}


function saveProduct() {

    const name =
        document.getElementById(
            "sellerProductName"
        ).value.trim();

    const price =
        document.getElementById(
            "sellerProductPrice"
        ).value;

    const category =
        document.getElementById(
            "sellerProductCategory"
        ).value.trim();

    const stock =
        document.getElementById(
            "sellerProductStock"
        ).value;

    const description =
        document.getElementById(
            "sellerProductDescription"
        ).value.trim();

    const error =
        document.getElementById(
            "sellerProductError"
        );

    error.textContent = "";


    if (
        name === "" ||
        price === "" ||
        category === "" ||
        stock === ""
    ) {

        error.textContent =
            "Please fill all required fields.";

        return;
    }


    if (Number(price) <= 0) {

        error.textContent =
            "Price must be greater than 0.";

        return;
    }


    if (Number(stock) < 0) {

        error.textContent =
            "Stock cannot be negative.";

        return;
    }

    const product = {

        name: name,

        price: Number(price),

        category: category,

        stock: Number(stock),

        description: description
    };


    // Edit or Add?

    const url = editingProductId
        ? `${API_URL}/${editingProductId}`
        : API_URL;

    const method = editingProductId
        ? "PUT"
        : "POST";


fetch(url, {
     method: method,
    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(product)
})
    .then(response => {

        if (!response.ok) {

            throw new Error(
                editingProductId
                    ? "Unable to update product"
                    : "Unable to add product"
            );
        }

        return response.json();
    })

    .then(() => {

        editingProductId = null;

        clearProductForm();

        document
            .getElementById("productFormSection")
            .classList.remove("show");

        loadSellerProducts();
    })

    .catch(err => {
    console.error(err);
    document.getElementById("sellerProductError").textContent =
        "Unable to save product.";
});
}

function clearProductForm() {

    document.getElementById(
        "sellerProductName"
    ).value = "";

    document.getElementById(
        "sellerProductPrice"
    ).value = "";

    document.getElementById(
        "sellerProductCategory"
    ).value = "";

    document.getElementById(
        "sellerProductStock"
    ).value = "";

    document.getElementById(
        "sellerProductDescription"
    ).value = "";

    document.getElementById(
        "sellerProductError"
    ).textContent = "";

    editingProductId = null;
}



function editProduct(id) {

    fetch(API_URL)

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Unable to load product"
                );
            }

            return response.json();
        })

        .then(products => {

            const product =
                products.find(
                    p => Number(p.id) === Number(id)
                );

            if (!product) {
                return;
            }


            editingProductId = id;


            document.getElementById(
                "sellerProductName"
            ).value = product.name || "";


            document.getElementById(
                "sellerProductPrice"
            ).value = product.price ?? "";


            document.getElementById(
                "sellerProductCategory"
            ).value = product.category || "";


            document.getElementById(
                "sellerProductStock"
            ).value = product.stock ?? 0;


            document.getElementById(
                "sellerProductDescription"
            ).value = product.description || "";


            const form =
                document.getElementById(
                    "productFormSection"
                );

            form.classList.add("show");


            form.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        })

        .catch(error => {

            console.error(error);

            document.getElementById(
                "sellerStatus"
            ).textContent =
                "Unable to load product.";
        });
}

function deleteProduct(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
        return;
    }

     fetch(`${API_URL}/${id}`, {
       method: "DELETE",
       credentials: "include"
      })
    .then(response => {

        if (!response.ok) {

            throw new Error(
                "Unable to delete product"
            );
        }

        loadSellerProducts();
    })

    .catch(error => {

        console.error(error);

        document.getElementById(
            "sellerStatus"
        ).textContent =
            "Unable to delete product.";
    });
}


function sellerLogout() {

    sessionStorage.removeItem("loggedIn");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("role");

    window.location.href = "index.html";
}
async function loadSellerOrders() {
    const container = document.getElementById("sellerOrdersList");

    if (!container) return;

    container.textContent = "Loading orders...";

    try {
        const response = await fetch(
            "http://127.0.0.1:8080/api/orders/seller",
            { credentials: "include" }
        );

        if (!response.ok) {
            throw new Error("Unable to load seller orders");
        }

        const orders = await response.json();

        container.innerHTML = "";

        if (orders.length === 0) {
            container.textContent = "No customer orders yet.";
            return;
        }

        orders.forEach(order => {
            const card = document.createElement("div");
            card.className = "seller-stat-card";

            const title = document.createElement("h3");
            title.textContent = `Order #${order.orderId}`;

            const product = document.createElement("p");
            product.textContent = `Product: ${order.productName}`;

            const quantity = document.createElement("p");
            quantity.textContent = `Quantity: ${order.quantity}`;

            const total = document.createElement("p");
            total.textContent = `Total: ₹${Number(order.total).toFixed(2)}`;

            const status = document.createElement("p");
            status.textContent = `Status: ${order.status}`;

            card.append(title, product, quantity, total, status);
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Seller orders error:", error);
        container.textContent = "Unable to load orders.";
    }
}

loadSellerOrders();