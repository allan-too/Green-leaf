// Shopping cart functionality
let cart = [];

/**
 * Initialize the cart from localStorage
 */
function initCart() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCartUI();
    } catch (error) {
      console.error('Error parsing cart data:', error);
      cart = [];
    }
  }
}

/**
 * Save the cart to localStorage
 */
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Add a product to the cart
 * @param {number} productId - ID of the product to add
 * @param {number} quantity - Quantity to add (default: 1)
 */
function addToCart(productId, quantity = 1) {
  const product = getProductById(productId);
  
  if (!product) {
    console.error(`Product with ID ${productId} not found`);
    return;
  }
  
  // Check if product already exists in cart
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  }
  
  // Save and update UI
  saveCart();
  updateCartUI();
  
  // Show cart sidebar
  showCartSidebar();
  
  // Show success message
  showToast(`${product.name} added to cart`);
}

/**
 * Update the quantity of a cart item
 * @param {number} productId - ID of the product
 * @param {number} newQuantity - New quantity value
 */
function updateCartItemQuantity(productId, newQuantity) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  
  if (itemIndex === -1) return;
  
  if (newQuantity <= 0) {
    // Remove the item if quantity is 0 or less
    removeFromCart(productId);
  } else {
    cart[itemIndex].quantity = newQuantity;
    saveCart();
    updateCartUI();
  }
}

/**
 * Remove an item from the cart
 * @param {number} productId - ID of the product to remove
 */
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
}

/**
 * Calculate the total price of the cart
 * @returns {number} Total price
 */
function calculateCartTotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Update the cart UI (count, items, total)
 */
function updateCartUI() {
  // Update cart count
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
  
  // Update cart items
  const cartItemsContainer = document.getElementById('cart-items');
  if (cartItemsContainer) {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
      cartItemsContainer.innerHTML = '';
      
      cart.forEach(item => {
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <h3 class="cart-item-title">${item.name}</h3>
            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            <div class="cart-item-quantity">
              <button class="quantity-btn quantity-decrease" data-id="${item.id}">-</button>
              <span class="quantity-value">${item.quantity}</span>
              <button class="quantity-btn quantity-increase" data-id="${item.id}">+</button>
            </div>
            <button class="remove-item" data-id="${item.id}">Remove</button>
          </div>
        `;
        
        cartItemsContainer.appendChild(cartItemEl);
      });
      
      // Add event listeners to the new buttons
      document.querySelectorAll('.quantity-decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.getAttribute('data-id'));
          const item = cart.find(item => item.id === id);
          if (item) updateCartItemQuantity(id, item.quantity - 1);
        });
      });
      
      document.querySelectorAll('.quantity-increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.getAttribute('data-id'));
          const item = cart.find(item => item.id === id);
          if (item) updateCartItemQuantity(id, item.quantity + 1);
        });
      });
      
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.getAttribute('data-id'));
          removeFromCart(id);
        });
      });
    }
  }
  
  // Update cart total
  const cartTotal = document.getElementById('cart-total');
  if (cartTotal) {
    cartTotal.textContent = `$${calculateCartTotal().toFixed(2)}`;
  }
  
  // Enable/disable checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.disabled = cart.length === 0;
  }
}

/**
 * Show the cart sidebar
 */
function showCartSidebar() {
  const cartSidebar = document.getElementById('cart-sidebar');
  if (cartSidebar) {
    cartSidebar.classList.add('active');
  }
}

/**
 * Hide the cart sidebar
 */
function hideCartSidebar() {
  const cartSidebar = document.getElementById('cart-sidebar');
  if (cartSidebar) {
    cartSidebar.classList.remove('active');
  }
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 */
function showToast(message) {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  // Add styles
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '10px 20px';
  toast.style.background = 'var(--color-primary)';
  toast.style.color = 'white';
  toast.style.borderRadius = '4px';
  toast.style.zIndex = '1000';
  toast.style.boxShadow = 'var(--shadow-md)';
  toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  
  // Add to document
  document.body.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

/**
 * Initialize cart event listeners
 */
function initCartEvents() {
  // Cart icon click
  const cartIcon = document.getElementById('cart-icon');
  if (cartIcon) {
    cartIcon.addEventListener('click', showCartSidebar);
  }
  
  // Close cart button
  const closeCartBtn = document.getElementById('close-cart');
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', hideCartSidebar);
  }
  
  // Checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      hideCartSidebar();
      showCheckoutModal();
    });
  }
}