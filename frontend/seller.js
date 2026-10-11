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

            
/* ===== SELLER INVENTORY ALERTS ===== */

const alertBox = document.getElementById("sellerLowStockAlerts");

if (alertBox) {

    const lowStockProducts = products.filter(product =>
        Number(product.stock) <= 5
    );

    alertBox.innerHTML = "";

    if (lowStockProducts.length === 0) {
        alertBox.textContent = "✓ All products have sufficient stock.";
    } else {

        lowStockProducts.forEach(product => {

            const item = document.createElement("div");
            item.className = "seller-inventory-alert";

            const stock = Number(product.stock);

            const badge = document.createElement("span");
            badge.className = stock <= 0
                ? "inventory-out"
                : "inventory-low";

            badge.textContent = stock <= 0
                ? "Out of Stock"
                : "Low Stock";

            const name = document.createElement("strong");
            name.textContent = product.name;

            const quantity = document.createElement("small");
            quantity.textContent = `Remaining: ${stock}`;

            item.append(name, quantity, badge);
            alertBox.appendChild(item);

        });
    }
}

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

    
.then(async (savedProduct) => {

    const imageInput =
        document.getElementById("sellerProductImages");

    const files = imageInput.files;

    if (files.length > 0) {

        const formData = new FormData();

        for (const file of files) {
            formData.append("files", file);
        }

        const uploadResponse = await fetch(
            `http://127.0.0.1:8080/api/seller/products/${savedProduct.id}/images`,
            {
                method: "POST",
                credentials: "include",
                body: formData
            }
        );

        if (!uploadResponse.ok) {
            throw new Error("Image upload failed");
        }
    }

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

            
/* Show already uploaded product images */

const imageInput =
    document.getElementById("sellerProductImages");

const imagePreview =
    document.getElementById("sellerImagePreview");

imageInput.value = "";
imagePreview.innerHTML = "";

const savedImages =
    product.images && product.images.length > 0
        ? product.images
        : product.image
            ? [product.image]
            : [];

savedImages.forEach(imageUrl => {

    const image = document.createElement("img");

    image.src = imageUrl.startsWith("http")
        ? imageUrl
        : `http://127.0.0.1:8080${imageUrl}`;

    image.alt = product.name;

    imagePreview.appendChild(image);
});

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

        if (!response.ok) throw new Error("Unable to load orders");

        const orders = await response.json();
        
        // Seller Overview: Active Orders & Delivered Revenue
        const activeElement =
            document.getElementById("activeSellerOrders");

        const revenueElement =
            document.getElementById("sellerRevenue");

        if (activeElement || revenueElement) {

            const uniqueOrders = [
                ...new Map(
                    orders.map(order => [order.orderId, order])
                ).values()
            ];

            const activeCount = uniqueOrders.filter(order =>
                ["PLACED", "CONFIRMED", "PACKED", "SHIPPED"]
                    .includes(String(order.status).toUpperCase())
            ).length;

            const revenue = orders
                .filter(order =>
                    String(order.status).toUpperCase() === "DELIVERED"
                )
                .reduce((sum, order) =>
                    sum + Number(order.total || 0), 0
                );

            if (activeElement) {
                activeElement.textContent = activeCount;
            }

            if (revenueElement) {
                revenueElement.textContent =
                    "₹" + revenue.toFixed(2);
            }
        }

        // Update seller order statistics
        const uniqueOrders = [
            ...new Map(
                orders.map(order => [order.orderId, order])
            ).values()
        ];

        const totalOrders = uniqueOrders.length;

        const activeOrders = uniqueOrders.filter(order =>
            ["PLACED", "CONFIRMED", "PACKED", "SHIPPED"]
                .includes(String(order.status).toUpperCase())
        ).length;

        const deliveredOrders = uniqueOrders.filter(order =>
            String(order.status).toUpperCase() === "DELIVERED"
        ).length;

        const cancelledOrders = uniqueOrders.filter(order =>
            String(order.status).toUpperCase() === "CANCELLED"
        ).length;

        const stats = {
            totalSellerOrders: totalOrders,
            activeSellerOrders: activeOrders,
            deliveredSellerOrders: deliveredOrders,
            cancelledSellerOrders: cancelledOrders
        };

        Object.entries(stats).forEach(([id, count]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = count;
        });

        if (orders.length === 0) {
            container.textContent = "No customer orders yet.";
            return;
        }

        const nextSteps = {
            PLACED: ["CONFIRMED", "Confirm Order"],
            CONFIRMED: ["PACKED", "Mark as Packed"],
            PACKED: ["SHIPPED", "Mark as Shipped"],
            SHIPPED: ["DELIVERED", "Mark as Delivered"]
        };

        const table = document.createElement("table");
        table.className = "seller-orders-table";

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
        `;

        const tbody = document.createElement("tbody");

        const displayedOrders = window.location.pathname.endsWith("seller.html")
    ? orders.slice(-5).reverse()
    : orders;

displayedOrders.forEach(order => {
            const row = document.createElement("tr");

            const values = [
                `#${order.orderId}`,
                order.productName,
                order.quantity,
                `₹${Number(order.total).toFixed(2)}`
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const statusCell = document.createElement("td");
            const badge = document.createElement("span");
            const orderStatus = String(order.status || "UNKNOWN").toUpperCase();

            badge.className = "seller-order-badge " + orderStatus.toLowerCase();
            badge.textContent = orderStatus;

            statusCell.appendChild(badge);
            row.appendChild(statusCell);

            const actionCell = document.createElement("td");
            const next = nextSteps[orderStatus];

            if (next) {
                const button = document.createElement("button");
                button.className = "seller-update-btn";
                button.textContent = next[1];
                button.onclick = () =>
                    updateSellerOrderStatus(order.orderId, next[0]);

                actionCell.appendChild(button);
            } else {
                actionCell.textContent = "—";
            }

            row.appendChild(actionCell);
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        container.replaceChildren(table);

    } catch (error) {
        console.error(error);
        container.textContent = "Unable to load orders.";
    }
}

    
async function updateSellerOrderStatus(orderId, newStatus) {

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/orders/${orderId}/status`,
            {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error(result.message);
            return;
        }

        loadSellerOrders();

    } catch (error) {
        console.error("Status update error:", error);
    }
}
loadSellerOrders();


function filterSellerOrders() {
    const search = document.getElementById("sellerOrderSearch");
    const filter = document.getElementById("sellerOrderStatusFilter");

    if (!search || !filter) return;

    const query = search.value.trim().toLowerCase();
    const selectedStatus = filter.value;

    document.querySelectorAll(".seller-orders-table tbody tr")
        .forEach(row => {
            const cells = row.querySelectorAll("td");

            const orderId = cells[0].textContent.toLowerCase();
            const product = cells[1].textContent.toLowerCase();
            const status = cells[4].textContent.trim().toUpperCase();

            const matchesSearch =
                orderId.includes(query) || product.includes(query);

            const matchesStatus =
                selectedStatus === "ALL" || status === selectedStatus;

            row.style.display =
                matchesSearch && matchesStatus ? "" : "none";
        });
}

/* ===== SELLER PRODUCT IMAGE PREVIEW ===== */

const sellerImageInput = document.getElementById("sellerProductImages");
const sellerImagePreview = document.getElementById("sellerImagePreview");

if (sellerImageInput && sellerImagePreview) {

    sellerImageInput.addEventListener("change", function () {

        sellerImagePreview.innerHTML = "";

        const files = Array.from(this.files);

        if (files.length > 5) {
            alert("Maximum 5 images allowed.");
            this.value = "";
            return;
        }

        files.forEach(file => {

            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                alert("Only JPG, PNG and WebP images are allowed.");
                sellerImageInput.value = "";
                sellerImagePreview.innerHTML = "";
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                alert("Each image must be below 2 MB.");
                sellerImageInput.value = "";
                sellerImagePreview.innerHTML = "";
                return;
            }

            const image = document.createElement("img");

            image.src = URL.createObjectURL(file);

            image.onload = function () {
                URL.revokeObjectURL(image.src);
            };

            sellerImagePreview.appendChild(image);
        });

    });
}
