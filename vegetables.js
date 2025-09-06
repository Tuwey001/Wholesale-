// Vegetable catalog and shopping cart functionality

// Sample vegetable data
const vegetables = [
  {
    id: 1,
    name: "Organic Spinach",
    category: "leafy",
    price: 3.99,
    unit: "bunch",
    image: "fresh-organic-vegetables-market.png",
    description: "Fresh organic spinach, perfect for salads and cooking",
    inStock: true,
    popular: true,
  },
  {
    id: 2,
    name: "Roma Tomatoes",
    category: "fruit",
    price: 4.5,
    unit: "lb",
    image: "fresh-organic-vegetables-market.png",
    description: "Juicy Roma tomatoes, ideal for sauces and cooking",
    inStock: true,
    popular: true,
  },
  {
    id: 3,
    name: "Organic Carrots",
    category: "root",
    price: 2.99,
    unit: "lb",
    image: "fresh-organic-vegetables-market.png",
    description: "Sweet organic carrots, freshly harvested",
    inStock: true,
    popular: false,
  },
  {
    id: 4,
    name: "Fresh Basil",
    category: "herbs",
    price: 2.5,
    unit: "bunch",
    image: "fresh-organic-vegetables-market.png",
    description: "Aromatic fresh basil leaves",
    inStock: true,
    popular: false,
  },
  {
    id: 5,
    name: "Organic Lettuce",
    category: "leafy",
    price: 3.25,
    unit: "head",
    image: "fresh-organic-vegetables-market.png",
    description: "Crisp organic lettuce, perfect for salads",
    inStock: true,
    popular: true,
  },
  {
    id: 6,
    name: "Bell Peppers",
    category: "fruit",
    price: 5.99,
    unit: "lb",
    image: "fresh-organic-vegetables-market.png",
    description: "Colorful bell peppers, sweet and crunchy",
    inStock: true,
    popular: false,
  },
  {
    id: 7,
    name: "Organic Potatoes",
    category: "root",
    price: 3.75,
    unit: "lb",
    image: "fresh-organic-vegetables-market.png",
    description: "Versatile organic potatoes, perfect for any meal",
    inStock: true,
    popular: true,
  },
  {
    id: 8,
    name: "Fresh Cilantro",
    category: "herbs",
    price: 1.99,
    unit: "bunch",
    image: "fresh-organic-vegetables-market.png",
    description: "Fresh cilantro with vibrant flavor",
    inStock: true,
    popular: false,
  },
  {
    id: 9,
    name: "Organic Kale",
    category: "leafy",
    price: 4.25,
    unit: "bunch",
    image: "fresh-organic-vegetables-market.png",
    description: "Nutrient-rich organic kale",
    inStock: true,
    popular: false,
  },
  {
    id: 10,
    name: "Cucumber",
    category: "fruit",
    price: 2.75,
    unit: "each",
    image: "/public/cucumber.jpg",
    description: "Fresh cucumbers, crisp and refreshing",
    inStock: true,
    popular: true,
  },
  {
    id: 11,
    name: "Sweet Onions",
    category: "root",
    price: 2.5,
    unit: "lb",
    image: "fresh-organic-vegetables-market.png",
    description: "Sweet yellow onions, perfect for cooking",
    inStock: true,
    popular: true,
  },
  {
    id: 12,
    name: "Fresh Parsley",
    category: "herbs",
    price: 2.25,
    unit: "bunch",
    image: "fresh-organic-vegetables-market.png",
    description: "Fresh flat-leaf parsley",
    inStock: true,
    popular: false,
  },
]

// Shopping cart
let cart = []
let currentFilter = "all"
let currentSort = "name"

// Bootstrap Modal
const bootstrap = window.bootstrap

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  displayProducts(vegetables)
  setupEventListeners()
  updateCartDisplay()
})

// Setup event listeners
function setupEventListeners() {
  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      // Update active button
      document.querySelectorAll(".filter-btn").forEach((b) => {
        b.classList.remove("active")
        b.classList.add("btn-outline-success")
        b.classList.remove("btn-success")
      })
      this.classList.add("active")
      this.classList.add("btn-success")
      this.classList.remove("btn-outline-success")

      currentFilter = this.dataset.category
      filterAndDisplayProducts()
    })
  })

  // Sort dropdown
  document.getElementById("sortSelect").addEventListener("change", function () {
    currentSort = this.value
    filterAndDisplayProducts()
  })

  // Search input
  document.getElementById("searchInput").addEventListener("input", () => {
    filterAndDisplayProducts()
  })

  // Delivery option change
  document.querySelectorAll('input[name="delivery"]').forEach((radio) => {
    radio.addEventListener("change", updateCheckoutTotal)
  })
}

// Display products
function displayProducts(productsToShow) {
  const container = document.getElementById("productsContainer")

  if (productsToShow.length === 0) {
    container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4 class="text-white">No products found</h4>
                <p class="text-light">Try adjusting your search or filter criteria</p>
            </div>
        `
    return
  }

  container.innerHTML = productsToShow
    .map(
      (product) => `
        <div class="col-lg-3 col-md-4 col-sm-6">
            <div class="card bg-dark border-success h-100 product-card">
                <div class="position-relative">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                    ${product.popular ? '<span class="badge bg-warning position-absolute top-0 end-0 m-2">Popular</span>' : ""}
                    ${!product.inStock ? '<span class="badge bg-danger position-absolute top-0 start-0 m-2">Out of Stock</span>' : ""}
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title text-white">${product.name}</h5>
                    <p class="card-text text-light flex-grow-1">${product.description}</p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="text-success fw-bold fs-5">$${product.price.toFixed(2)}</span>
                        <span class="text-light">per ${product.unit}</span>
                    </div>
                    <div class="d-flex gap-2">
                        <div class="input-group input-group-sm">
                            <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(${product.id}, -1)">-</button>
                            <input type="number" class="form-control bg-dark text-white border-secondary text-center" 
                                   id="qty-${product.id}" value="1" min="1" max="99">
                            <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(${product.id}, 1)">+</button>
                        </div>
                        <button class="btn btn-success flex-grow-1" onclick="addToCart(${product.id})" 
                                ${!product.inStock ? "disabled" : ""}>
                            <i class="fas fa-cart-plus me-1"></i>
                            ${product.inStock ? "Add" : "Out of Stock"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

// Filter and display products
function filterAndDisplayProducts() {
  let filteredProducts = vegetables

  // Apply category filter
  if (currentFilter !== "all") {
    filteredProducts = filteredProducts.filter((product) => product.category === currentFilter)
  }

  // Apply search filter
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm),
    )
  }

  // Apply sorting
  filteredProducts.sort((a, b) => {
    switch (currentSort) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "popular":
        return b.popular - a.popular
      default: // name
        return a.name.localeCompare(b.name)
    }
  })

  displayProducts(filteredProducts)
}

// Change quantity
function changeQuantity(productId, change) {
  const qtyInput = document.getElementById(`qty-${productId}`)
  let newQty = Number.parseInt(qtyInput.value) + change
  newQty = Math.max(1, Math.min(99, newQty))
  qtyInput.value = newQty
}

// Add to cart
function addToCart(productId) {
  const product = vegetables.find((p) => p.id === productId)
  const quantity = Number.parseInt(document.getElementById(`qty-${productId}`).value)

  const existingItem = cart.find((item) => item.id === productId)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({
      ...product,
      quantity: quantity,
    })
  }

  updateCartDisplay()
  showAddToCartNotification(product.name)
}

// Show add to cart notification
function showAddToCartNotification(productName) {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = "alert alert-success position-fixed"
  notification.style.cssText = "top: 100px; right: 20px; z-index: 9999; min-width: 300px;"
  notification.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        <strong>${productName}</strong> added to cart!
    `

  document.body.appendChild(notification)

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// Update cart display
function updateCartDisplay() {
  const cartCount = document.getElementById("cartCount")
  const cartItems = document.getElementById("cartItems")
  const cartTotal = document.getElementById("cartTotal")
  const checkoutBtn = document.getElementById("checkoutBtn")

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  cartCount.textContent = totalItems
  cartTotal.textContent = `$${totalPrice.toFixed(2)}`

  if (cart.length === 0) {
    cartItems.innerHTML = `
            <div class="text-center text-light py-5">
                <i class="fas fa-shopping-cart fa-3x mb-3 opacity-50"></i>
                <p>Your cart is empty</p>
            </div>
        `
    checkoutBtn.disabled = true
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
            <div class="cart-item">
                <div class="d-flex align-items-center">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="flex-grow-1 ms-3">
                        <h6 class="text-white mb-1">${item.name}</h6>
                        <p class="text-light mb-1">$${item.price.toFixed(2)} per ${item.unit}</p>
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span class="text-white">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFromCart(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="text-end">
                        <span class="text-success fw-bold">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
    checkoutBtn.disabled = false
  }
}

// Update cart item quantity
function updateCartItemQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId)
    return
  }

  const item = cart.find((item) => item.id === productId)
  if (item) {
    item.quantity = newQuantity
    updateCartDisplay()
  }
}

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId)
  updateCartDisplay()
}

// Clear cart
function clearCart() {
  if (cart.length === 0) return

  if (confirm("Are you sure you want to clear your cart?")) {
    cart = []
    updateCartDisplay()
  }
}

// Toggle cart sidebar
function toggleCart() {
  const sidebar = document.getElementById("cartSidebar")
  const overlay = document.getElementById("cartOverlay")

  sidebar.classList.toggle("active")
  overlay.classList.toggle("active")
}

// Proceed to checkout
function proceedToCheckout() {
  if (cart.length === 0) return

  updateCheckoutTotal()
  const modal = new bootstrap.Modal(document.getElementById("checkoutModal"))
  modal.show()
  toggleCart() // Close cart sidebar
}

// Update checkout total
function updateCheckoutTotal() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryOption = document.querySelector('input[name="delivery"]:checked').value
  const deliveryFee = deliveryOption === "express" ? 9.99 : 0
  const total = subtotal + deliveryFee

  document.getElementById("checkoutSubtotal").textContent = `$${subtotal.toFixed(2)}`
  document.getElementById("checkoutDelivery").textContent = deliveryOption === "express" ? "$9.99" : "Free"
  document.getElementById("checkoutTotal").textContent = `$${total.toFixed(2)}`
}

// Place order
function placeOrder() {
  const form = document.getElementById("checkoutForm")

  // Basic form validation
  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  // Simulate order processing
  const modal = bootstrap.Modal.getInstance(document.getElementById("checkoutModal"))
  modal.hide()

  // Show success message
  setTimeout(() => {
    alert(
      "Order placed successfully! You will receive a confirmation email shortly. Your fresh vegetables will be delivered according to your selected delivery option.",
    )
    cart = []
    updateCartDisplay()
  }, 500)
}
