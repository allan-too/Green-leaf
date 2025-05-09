// Order management functionality

/**
 * Show the receipt modal with order details
 * @param {Object} order - Order data
 */
function showReceiptModal(order) {
  const modal = document.getElementById('receipt-modal');
  const receiptDetails = document.getElementById('receipt-details');
  
  if (!modal || !receiptDetails) return;
  
  // Get formatted date
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Parse order items
  let orderItems;
  try {
    orderItems = JSON.parse(order.items);
  } catch (error) {
    console.error('Error parsing order items:', error);
    orderItems = [];
  }
  
  // Build receipt HTML
  let receiptHTML = `
    <div class="receipt-header">
      <h3>Order Confirmation</h3>
      <p>Thank you for your purchase!</p>
    </div>
    
    <div class="receipt-info">
      <div>
        <strong>Order ID:</strong><br>
        <span>${order.id}</span>
      </div>
      <div>
        <strong>Date:</strong><br>
        <span>${orderDate}</span>
      </div>
    </div>
    
    <div class="receipt-info">
      <div>
        <strong>Tracking ID:</strong><br>
        <span>${order.bolt_tracking_id}</span>
      </div>
      <div>
        <strong>Payment Method:</strong><br>
        <span>${formatPaymentMethod(order.payment_method)}</span>
      </div>
    </div>
    
    <h4>Order Items:</h4>
    <div class="receipt-items">
  `;
  
  // Add each item
  orderItems.forEach(item => {
    receiptHTML += `
      <div class="receipt-item">
        <div>${item.name} x${item.quantity}</div>
        <div>$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `;
  });
  
  // Add total and actions
  receiptHTML += `
    </div>
    
    <div class="receipt-total">
      <div>Total</div>
      <div>$${order.total_amount.toFixed(2)}</div>
    </div>
    
    <div class="receipt-actions">
      <button id="print-receipt" class="btn secondary-btn">Print Receipt</button>
      <button id="close-receipt" class="btn primary-btn">Continue Shopping</button>
    </div>
  `;
  
  receiptDetails.innerHTML = receiptHTML;
  
  // Show the modal
  modal.classList.add('active');
  
  // Add event listeners
  document.getElementById('print-receipt').addEventListener('click', () => {
    window.print();
  });
  
  document.getElementById('close-receipt').addEventListener('click', () => {
    modal.classList.remove('active');
  });
}

/**
 * Format payment method name for display
 * @param {string} method - Payment method
 * @returns {string} Formatted payment method
 */
function formatPaymentMethod(method) {
  switch (method) {
    case 'paypal': return 'PayPal';
    case 'bitcoin': return 'Bitcoin';
    case 'bank': return 'Bank Transfer';
    default: return method.charAt(0).toUpperCase() + method.slice(1);
  }
}

/**
 * Get user's order history
 * @returns {Promise<Array|null>} Array of orders or null
 */
async function getOrderHistory() {
  try {
    if (!isLoggedIn()) return null;
    
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('user_id', getUserProfile().id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching order history:', error);
    return null;
  }
}