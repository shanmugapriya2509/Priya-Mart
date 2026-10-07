if (sessionStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
}

const userId = sessionStorage.getItem("userId");

let allProducts = [];
let wishlistIds = [];

Promise.all([
    fetch("http://localhost:8080/products")
        .then(response => response.json()),

    fetch(`http://localhost:8080/api/wishlist/${userId}`)
        .then(response => response.json())
])
.then(([products, wishlist]) => {

    allProducts = products;
    wishlistIds = wishlist.map(item => item.productId);

    displayWishlist();
})
.catch(error => {
    console.error(error);

    document.getElementById("wishlistProducts").innerHTML =
        "<p>Unable to load wishlist.</p>";
});


function getWishlistImage(product) {

    const category = (product.category || "").toLowerCase();

    if (product.image && product.image.trim() !== "")
        return product.image;

    if (category.includes("rice") || category.includes("grain"))
        return "images/rice.jpg";

    if (category.includes("dairy"))
        return "images/milk.jpg";

    if (category.includes("biscuit"))
        return "images/biscuits.jpg";

    if (category.includes("snack"))
        return "images/snacks.jpg";

    if (category.includes("beverage"))
        return "images/beverages.jpg";

    if (category.includes("personal"))
        return "images/personal-care.jpg";

    if (category.includes("hair"))
        return "images/shampoo.jpg";

    if (category.includes("home") || category.includes("laundry"))
        return "images/household.jpg";

    return "images/grocery.jpg";
}


function displayWishlist() {

    const container =
        document.getElementById("wishlistProducts");

    const wishlistProducts =
        allProducts.filter(product =>
            wishlistIds.includes(product.id)
        );

    document.getElementById("wishlistCountText").textContent =
        `${wishlistProducts.length} saved product(s)`;

    if (wishlistProducts.length === 0) {

        container.innerHTML = `
            <div class="wishlist-empty">
                <h3>Your wishlist is empty ❤️</h3>
                <p>Save products you like while shopping.</p>

                <button onclick="window.location.href='home.html'">
                    Continue Shopping
                </button>
            </div>
        `;

        return;
    }

    container.innerHTML = "";

    wishlistProducts.forEach(product => {

        const card = document.createElement("div");

        card.className = "wishlist-card";

        card.innerHTML = `
            <div class="wishlist-card-image">

                <img
                    src="${getWishlistImage(product)}"
                    alt="${product.name}"
                >

            </div>

            <div class="wishlist-card-content">

                <span>
                    ${product.category || "Grocery"}
                </span>

                <h3>${product.name}</h3>

                <p>
                    ${product.brand || "PriyaMart"}
                    ${product.unit ? " • " + product.unit : ""}
                </p>

                <strong>
                    ₹${Number(product.price).toFixed(2)}
                </strong>

                <div class="wishlist-actions">

                    <button
                        class="wishlist-shop-btn"
                        onclick="window.location.href='home.html'">
                        Shop Now
                    </button>

                    <button
                        class="wishlist-remove-btn"
                        onclick="removeWishlist(${product.id})">
                        Remove
                    </button>

                </div>

            </div>
        `;

        container.appendChild(card);
    });
}


function removeWishlist(productId) {

    fetch(
        `http://localhost:8080/api/wishlist/${userId}/${productId}`,
        {
            method: "DELETE"
        }
    )
    .then(response => {

        if (!response.ok)
            throw new Error("Unable to remove");

        wishlistIds =
            wishlistIds.filter(id => id !== productId);

        displayWishlist();
    })
    .catch(error =>
        console.error("Wishlist remove error:", error)
    );
}