// Main application entry point
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Supabase
  initializeSupabase();
  
  // Initialize auth
  updateUserUI();
  
  // Initialize products
  renderProducts('all');
  initCategoryTabs();
  
  // Initialize cart
  initCart();
  initCartEvents();
  
  // Initialize checkout
  initCheckoutEvents();
  
  // Initialize tracking
  initTrackingEvents();
});

/**
 * Initialize Supabase with configuration
 */
function initializeSupabase() {
  // Check if Supabase client is initialized correctly
  if (!window.supabaseClient) {
    console.error('Supabase client not found. Please check your configuration.');
    
    // Show a warning to the user
    const warning = document.createElement('div');
    warning.className = 'supabase-warning';
    warning.style.position = 'fixed';
    warning.style.top = '0';
    warning.style.left = '0';
    warning.style.right = '0';
    warning.style.padding = '10px';
    warning.style.backgroundColor = 'var(--color-error)';
    warning.style.color = 'white';
    warning.style.textAlign = 'center';
    warning.style.zIndex = '10000';
    
    warning.textContent = 'Supabase configuration is missing. Some features may not work properly.';
    
    document.body.appendChild(warning);
  }
}