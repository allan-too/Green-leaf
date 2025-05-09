// Product data and functions
let products = [
  {
    id: 1,
    name: 'Purple Haze',
    category: 'buds',
    price: 45.99,
    image: 'https://images.pexels.com/photos/7667726/pexels-photo-7667726.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 2,
    name: 'Blue Dream',
    category: 'buds',
    price: 52.99,
    image: 'https://images.pexels.com/photos/5505087/pexels-photo-5505087.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 3,
    name: 'Wedding Cake',
    category: 'buds',
    price: 58.99,
    image: 'https://images.pexels.com/photos/5699661/pexels-photo-5699661.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 4,
    name: 'Premium Blunt',
    category: 'blunts',
    price: 15.99,
    image: 'https://images.pexels.com/photos/7234139/pexels-photo-7234139.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 5,
    name: 'Classic Blunt',
    category: 'blunts',
    price: 12.99,
    image: 'https://images.pexels.com/photos/9851318/pexels-photo-9851318.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 6,
    name: 'Tropical Blunt',
    category: 'blunts',
    price: 18.99,
    image: 'https://images.pexels.com/photos/7667831/pexels-photo-7667831.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 7,
    name: 'Chocolate Cookie',
    category: 'cookies',
    price: 8.99,
    image: 'https://images.pexels.com/photos/4561999/pexels-photo-4561999.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 8,
    name: 'Peanut Butter Cookie',
    category: 'cookies',
    price: 9.99,
    image: 'https://images.pexels.com/photos/14705134/pexels-photo-14705134.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 9,
    name: 'Triple Chocolate Cookie',
    category: 'cookies',
    price: 10.99,
    image: 'https://images.pexels.com/photos/6163262/pexels-photo-6163262.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

/**
 * Render the product grid with filtering
 * @param {string} category - Category to filter by (or 'all')
 */
function renderProducts(category = 'all') {
  const productsGrid = document.getElementById('products-grid');
  
  if (!productsGrid) return;
  
  // Filter products if needed
  const filteredProducts = category === 'all' 
    ? products 
    : products.filter(product => product.category === category);
  
  // Clear existing products
  productsGrid.innerHTML = '';
  
  // Render each product
  filteredProducts.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card fade-in';
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <div class="product-details">
        <div class="product-category">${formatCategory(product.category)}</div>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <div class="product-action">
          <button class="btn primary-btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    `;
    
    productsGrid.appendChild(productCard);
  });
  
  // Add event listeners to the "Add to Cart" buttons
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = parseInt(e.target.getAttribute('data-id'));
      addToCart(productId);
    });
  });
}

/**
 * Format a category name for display
 * @param {string} category - The category name
 * @returns {string} Formatted category name
 */
function formatCategory(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Get a product by its ID
 * @param {number} id - Product ID
 * @returns {Object|undefined} Product object or undefined
 */
function getProductById(id) {
  return products.find(product => product.id === id);
}

/**
 * Initialize product category tabs
 */
function initCategoryTabs() {
  const tabs = document.querySelectorAll('.category-tab');
  
  if (tabs.length === 0) return;
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Render products for the selected category
      const category = tab.getAttribute('data-category');
      renderProducts(category);
    });
  });
}