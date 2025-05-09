// Checkout functionality
let selectedPaymentMethod = null;

/**
 * Show the checkout modal
 */
function showCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  const checkoutForm = document.getElementById('checkout-form');
  const loginMessage = document.getElementById('checkout-login-message');
  
  if (!modal) return;
  
  // Reset payment selection
  selectedPaymentMethod = null;
  resetPaymentMethods();
  
  // Check if user is logged in
  if (!isLoggedIn()) {
    if (checkoutForm) checkoutForm.classList.add('hidden');
    if (loginMessage) loginMessage.classList.remove('hidden');
  } else {
    if (checkoutForm) checkoutForm.classList.remove('hidden');
    if (loginMessage) loginMessage.classList.add('hidden');
    
    // Populate checkout summary
    populateCheckoutSummary();
  }
  
  // Show the modal
  modal.classList.add('active');
}

/**
 * Hide the checkout modal
 */
function hideCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Populate the checkout summary with cart items
 */
function populateCheckoutSummary() {
  const checkoutItems = document.getElementById('checkout-items');
  const checkoutTotal = document.getElementById('checkout-total');
  
  if (!checkoutItems || !checkoutTotal) return;
  
  checkoutItems.innerHTML = '';
  
  // Add each cart item
  cart.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'checkout-item';
    itemEl.innerHTML = `
      <div>${item.name} x${item.quantity}</div>
      <div>$${(item.price * item.quantity).toFixed(2)}</div>
    `;
    
    checkoutItems.appendChild(itemEl);
  });
  
  // Update total
  checkoutTotal.textContent = `$${calculateCartTotal().toFixed(2)}`;
}

/**
 * Handle payment method selection
 * @param {string} method - Payment method (paypal, bitcoin, bank)
 */
function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  
  const paymentDetails = document.getElementById('payment-details');
  const placeOrderBtn = document.getElementById('place-order-btn');
  
  if (!paymentDetails || !placeOrderBtn) return;
  
  // Enable the place order button
  placeOrderBtn.disabled = false;
  
  // Clear previous details
  paymentDetails.innerHTML = '';
  
  // Set content based on payment method
  switch (method) {
    case 'paypal':
      paymentDetails.innerHTML = `
        <div class="payment-detail-section">
          <h4>Pay with PayPal</h4>
          <p>You will be redirected to PayPal to complete your payment.</p>
          <button id="paypal-btn" class="btn secondary-btn">Pay with PayPal</button>
        </div>
      `;
      
      // Add PayPal button event
      document.getElementById('paypal-btn').addEventListener('click', () => {
        // Simulate PayPal payment
        setTimeout(() => {
          placeOrder('paypal');
        }, 1000);
      });
      break;
      
    case 'bitcoin':
      paymentDetails.innerHTML = `
        <div class="payment-detail-section">
          <h4>Pay with Bitcoin</h4>
          <p>Please send the exact amount to the following address:</p>
          <div class="crypto-address">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</div>
          <p>Amount: ${calculateCartTotal().toFixed(8)} BTC</p>
          <button id="bitcoin-paid-btn" class="btn secondary-btn">I've Made the Payment</button>
        </div>
      `;
      
      // Add Bitcoin button event
      document.getElementById('bitcoin-paid-btn').addEventListener('click', () => {
        placeOrder('bitcoin');
      });
      break;
      
    case 'bank':
      paymentDetails.innerHTML = `
        <div class="payment-detail-section">
          <h4>Pay with Bank Transfer</h4>
          <div class="bank-details">
            <div><strong>Bank Name:</strong> Example Bank</div>
            <div><strong>Account Name:</strong> GreenLeaf Inc.</div>
            <div><strong>Account Number:</strong> 1234567890</div>
            <div><strong>Routing Number:</strong> 123456789</div>
            <div><strong>Reference:</strong> GreenLeaf Order</div>
          </div>
          <p>Please upload proof of payment:</p>
          <div class="upload-proof">
            <input type="file" id="proof-file" accept="image/*,.pdf">
            <button id="bank-paid-btn" class="btn secondary-btn">Submit Payment Proof</button>
          </div>
        </div>
      `;
      
      // Add Bank button event
      document.getElementById('bank-paid-btn').addEventListener('click', async () => {
        const fileInput = document.getElementById('proof-file');
        
        if (!fileInput.files || fileInput.files.length === 0) {
          alert('Please upload a payment proof');
          return;
        }
        
        const file = fileInput.files[0];
        
        // Upload file to Supabase Storage
        const proofPath = await uploadPaymentProof(file);
        
        if (proofPath) {
          placeOrder('bank', proofPath);
        } else {
          alert('Failed to upload payment proof. Please try again.');
        }
      });
      break;
  }
}

/**
 * Upload a payment proof file to Supabase Storage
 * @param {File} file - File object to upload
 * @returns {Promise<string|null>} Path to the uploaded file or null
 */
async function uploadPaymentProof(file) {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    
    const { data, error } = await supabaseClient
      .storage
      .from('proofs')
      .upload(`payment_proofs/${fileName}`, file);
    
    if (error) throw error;
    
    return data.path;
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    return null;
  }
}

/**
 * Place an order
 * @param {string} paymentMethod - Method of payment
 * @param {string} proofPath - Path to payment proof (for bank transfers)
 */
async function placeOrder(paymentMethod, proofPath = null) {
  try {
    // Generate a random tracking ID
    const trackingId = generateTrackingId();
    
    // Create order data
    const orderData = {
      user_id: getUserProfile().id,
      total_amount: calculateCartTotal(),
      payment_method: paymentMethod,
      bolt_tracking_id: trackingId,
      proof_path: proofPath,
      items: JSON.stringify(cart)
    };
    
    // Insert order into database
    const { data, error } = await supabaseClient
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Hide checkout modal and show receipt
    hideCheckoutModal();
    showReceiptModal(data);
    
    // Clear the cart
    cart = [];
    saveCart();
    updateCartUI();
    
  } catch (error) {
    console.error('Error placing order:', error);
    alert('Error placing order. Please try again.');
  }
}

/**
 * Generate a random tracking ID
 * @returns {string} Tracking ID
 */
function generateTrackingId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BLT-';
  
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Reset payment method selection
 */
function resetPaymentMethods() {
  const radioButtons = document.querySelectorAll('input[name="payment-method"]');
  radioButtons.forEach(radio => {
    radio.checked = false;
  });
  
  const paymentDetails = document.getElementById('payment-details');
  if (paymentDetails) {
    paymentDetails.innerHTML = '';
  }
  
  const placeOrderBtn = document.getElementById('place-order-btn');
  if (placeOrderBtn) {
    placeOrderBtn.disabled = true;
  }
}

/**
 * Initialize checkout event listeners
 */
function initCheckoutEvents() {
  // Close buttons for modals
  document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
      });
    });
  });
  
  // Payment method selection
  const paymentOptions = document.querySelectorAll('input[name="payment-method"]');
  paymentOptions.forEach(option => {
    option.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectPaymentMethod(e.target.value);
      }
    });
  });
  
  // Place order button (direct click)
  const placeOrderBtn = document.getElementById('place-order-btn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
      if (selectedPaymentMethod && selectedPaymentMethod !== 'paypal' && selectedPaymentMethod !== 'bitcoin' && selectedPaymentMethod !== 'bank') {
        placeOrder(selectedPaymentMethod);
      }
    });
  }
}